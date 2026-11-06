/**
 * Assemble timestamped, local browser captures for private reference review.
 * Usage: node scripts/assemble-reference-recordings.mjs [delta roveia atmos]
 * Inputs: .local/reference-capture/<slug>/manifest.json and frame JPEGs.
 * Outputs: research/recordings/ (local-only; never copied into dist/).
 */
import{readFile,writeFile,copyFile,mkdir,readdir,realpath,stat,rename,rm}from'node:fs/promises';
import{spawn}from'node:child_process';
import path from'node:path';
import{fileURLToPath}from'node:url';

const projectRoot=fileURLToPath(new URL('..',import.meta.url));
const captureRoot=path.join(projectRoot,'.local/reference-capture');
const outputRoot=path.join(projectRoot,'research/recordings');
const defaultSlugs=['delta','roveia','atmos'];
const slugPattern=/^[a-z0-9][a-z0-9_-]{0,63}$/;
const framePattern=/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.jpe?g$/i;
const ffmpeg=process.env.PORTFOLIO_FFMPEG_BIN||'ffmpeg';
const outputFps=30;

export function normalizeTimeline(manifest,slug){
  if(!slugPattern.test(slug))throw new Error('Invalid recording slug: '+slug);
  const width=Number(manifest.viewport?.width),height=Number(manifest.viewport?.height);
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<2||height<2||width>16384||height>16384)throw new Error(slug+': invalid source viewport');
  if(!Array.isArray(manifest.frames)||!manifest.frames.length)throw new Error(slug+': no capture frames');
  const warnings=[];
  let invalidTimes=0;
  const candidates=[];
  manifest.frames.forEach((frame,index)=>{
    if(typeof frame?.file!=='string'||!framePattern.test(frame.file))throw new Error(slug+': unsafe or non-JPEG frame filename');
    const time=Number(frame.time);
    if(!Number.isFinite(time)){invalidTimes++;return;}
    candidates.push({file:frame.file,time:Math.max(0,Math.round(time*1e6)/1e6),index});
  });
  if(!candidates.length)throw new Error(slug+': no valid frame timestamps');
  if(invalidTimes)warnings.push(invalidTimes+' frame(s) with invalid timestamps omitted.');
  candidates.sort((a,b)=>a.time-b.time||a.index-b.index);
  const unique=[];
  for(const frame of candidates){
    if(unique.length&&Math.abs(unique.at(-1).time-frame.time)<1e-6)unique[unique.length-1]=frame;
    else unique.push(frame);
  }
  const duplicates=candidates.length-unique.length;
  if(duplicates)warnings.push(duplicates+' duplicate-timestamp frame(s) replaced by the latest capture at that instant.');
  const suppliedDuration=Number(manifest.duration);
  const duration=Number.isFinite(suppliedDuration)&&suppliedDuration>0?suppliedDuration:unique.at(-1).time+1/outputFps;
  if(!(Number.isFinite(suppliedDuration)&&suppliedDuration>0))warnings.push('Duration inferred from the final frame plus one output frame.');
  let frames=unique.filter(frame=>frame.time<duration);
  const beyond=unique.length-frames.length;
  if(beyond)warnings.push(beyond+' frame(s) at or after the declared recording end omitted.');
  if(!frames.length)frames=[{...unique[0],time:0}];
  const firstCaptureTime=frames[0].time;
  // The first captured image also represents the opening hold. Later capture
  // times remain relative to the manifest start, so pauses are not compressed.
  frames[0]={...frames[0],time:0};
  const segments=frames.map((frame,index)=>({file:frame.file,time:frame.time,duration:(frames[index+1]?.time??duration)-frame.time})).filter(frame=>frame.duration>0);
  if(unique.length===1&&candidates.length>1)warnings.push('All usable timestamps coincide; this recording is a held frame, not reconstructed motion.');
  const chapters=(Array.isArray(manifest.chapters)?manifest.chapters:[]).flatMap((chapter,index)=>{
    const time=Number(chapter?.time);
    if(!Number.isFinite(time))return[];
    const entry={time:Math.max(0,Math.min(duration,time)),label:String(chapter.label||'Section '+(index+1)).replace(/[\u0000-\u001f]/g,' ').trim()};
    if(Number.isFinite(Number(chapter.scrollY)))entry.scrollY=Number(chapter.scrollY);
    return[entry];
  }).sort((a,b)=>a.time-b.time);
  return{slug,title:String(manifest.title||slug),url:String(manifest.url||''),viewport:{width,height},captureMode:String(manifest.captureMode||'Browser screencast'),duration,frames:segments,chapters,warnings,sourceFrameCount:manifest.frames.length,uniqueTimestampCount:unique.length,firstCaptureTime};
}

export function buildConcatText(frames){
  if(!frames.length)throw new Error('No timeline segments to encode');
  const lines=['ffconcat version 1.0'];
  const add=file=>{
    if(!framePattern.test(file))throw new Error('Unsafe concat frame filename');
    lines.push("file '"+file+"'",'option framerate 1000');
  };
  for(const frame of frames){
    if(!Number.isFinite(frame.duration)||frame.duration<=0)throw new Error('Invalid frame hold duration');
    add(frame.file);lines.push('duration '+frame.duration.toFixed(6));
  }
  // Concat needs a terminal packet to retain the final image's entire hold.
  add(frames.at(-1).file);
  return lines.join('\n')+'\n';
}

export function encodingArgs(concatFile,viewport,duration,outputFile){
  const width=Math.ceil(viewport.width/2)*2,height=Math.ceil(viewport.height/2)*2;
  return['-hide_banner','-loglevel','error','-nostdin','-y','-protocol_whitelist','file','-f','concat','-safe','0','-i',concatFile,
    '-an','-vf',`fps=${outputFps}:round=near,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`,
    '-r',String(outputFps),'-fps_mode','cfr','-c:v','libx264','-preset','veryfast','-crf','24','-movflags','+faststart','-t',duration.toFixed(6),'-f','mp4',outputFile];
}

async function runEncoder(args){
  await new Promise((resolve,reject)=>{
    const child=spawn(ffmpeg,args,{shell:false,stdio:['ignore','ignore','pipe']});
    let stderr='';
    child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-12000)});
    const interrupt=()=>child.kill('SIGINT');
    process.once('SIGINT',interrupt);
    child.once('error',error=>{process.removeListener('SIGINT',interrupt);reject(new Error(error.code==='ENOENT'?'FFmpeg was not found. Set PORTFOLIO_FFMPEG_BIN to the installed binary.':error.message))});
    child.once('close',code=>{process.removeListener('SIGINT',interrupt);if(code===0)resolve();else reject(new Error('FFmpeg exited '+code+(stderr?'\n'+stderr.trim():'')))});
  });
}

async function atomicJson(file,value){
  const temporary=file+'.tmp';
  await writeFile(temporary,JSON.stringify(value,null,2)+'\n');await rename(temporary,file);
}

async function assemble(slug){
  const directory=path.join(captureRoot,slug),manifestFile=path.join(directory,'manifest.json');
  let input;
  try{input=await readFile(manifestFile,'utf8')}catch(error){if(error.code==='ENOENT'){console.log('Skipping '+slug+': capture manifest not present.');return null;}throw error;}
  const timeline=normalizeTimeline(JSON.parse(input),slug);
  const actualDirectory=await realpath(directory);
  if(path.dirname(actualDirectory)!==await realpath(captureRoot))throw new Error(slug+': capture directory resolves outside the capture root');
  for(const file of new Set(timeline.frames.map(frame=>frame.file))){
    const resolved=await realpath(path.join(directory,file));
    if(path.dirname(resolved)!==actualDirectory)throw new Error(slug+': frame resolves outside its capture directory');
    if(!(await stat(resolved)).isFile())throw new Error(slug+': frame is not a regular file');
  }
  await mkdir(outputRoot,{recursive:true});
  const videoFile=slug+'-full-layout.mp4',posterFile=slug+'-poster.jpg',metadataFile=slug+'-chapters.json';
  const concatFile=path.join(directory,'.assembly-'+process.pid+'.ffconcat');
  const temporaryVideo=path.join(outputRoot,'.'+slug+'-full-layout.part.mp4');
  try{
    await writeFile(concatFile,buildConcatText(timeline.frames));
    console.log('Encoding '+timeline.title+': '+timeline.duration.toFixed(2)+'s, '+timeline.frames.length+' timestamped frame holds.');
    await runEncoder(encodingArgs(concatFile,timeline.viewport,timeline.duration,temporaryVideo));
    await rename(temporaryVideo,path.join(outputRoot,videoFile));
    await copyFile(path.join(directory,timeline.frames[0].file),path.join(outputRoot,posterFile));
    const{frames,...metadata}=timeline;
    metadata.videoFile=videoFile;metadata.posterFile=posterFile;metadata.outputFps=outputFps;
    metadata.encodedViewport={width:Math.ceil(timeline.viewport.width/2)*2,height:Math.ceil(timeline.viewport.height/2)*2};
    metadata.bytes=(await stat(path.join(outputRoot,videoFile))).size;
    await atomicJson(path.join(outputRoot,metadataFile),metadata);
    console.log('Saved '+path.relative(projectRoot,path.join(outputRoot,videoFile))+' ('+(metadata.bytes/1048576).toFixed(1)+' MiB)');
    for(const warning of timeline.warnings)console.warn(slug+': '+warning);
    return metadata;
  }finally{
    await rm(concatFile,{force:true});await rm(temporaryVideo,{force:true});
  }
}

export function formatTime(seconds){
  const total=Math.max(0,Math.floor(Number(seconds)||0)),hours=Math.floor(total/3600),minutes=Math.floor(total%3600/60),remainder=String(total%60).padStart(2,'0');
  return hours?hours+':'+String(minutes).padStart(2,'0')+':'+remainder:minutes+':'+remainder;
}
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function sourceLink(value){try{const url=new URL(value);return['http:','https:'].includes(url.protocol)?url.href:null}catch{return null}}

export function reviewHtml(recordings){
  const cards=recordings.map((recording,index)=>{
    const slug=recording.slug,source=sourceLink(recording.url),title=escapeHtml(recording.title);
    const chapters=recording.chapters.length?recording.chapters:[{time:0,label:'Start'}];
    return`<article class="recording" id="${slug}"><header class="recording-heading"><div><p class="eyebrow">REFERENCE ${String(index+1).padStart(2,'0')} / BROWSER WALKTHROUGH</p><h2>${title}</h2></div><div class="recording-links">${source?`<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">View original ↗</a>`:''}<a href="${slug}-full-layout.mp4" download>Download MP4 ↓</a></div></header>
<div class="theater"><video id="player-${slug}" controls muted playsinline preload="metadata" poster="${slug}-poster.jpg" src="${slug}-full-layout.mp4" aria-label="${title} full layout browser recording"></video></div>
<div class="facts"><span>${formatTime(recording.duration)} recorded</span><span>${recording.viewport.width} × ${recording.viewport.height} source viewport</span><span>Silent · ${outputFps} fps encoding</span><span>${(recording.bytes/1048576).toFixed(1)} MiB</span></div>
<details class="chapters" open><summary>Jump to a section <span>${chapters.length} chapter${chapters.length===1?'':'s'}</span></summary><div class="chapter-grid">${chapters.map(chapter=>`<button type="button" class="chapter" data-player="player-${slug}" data-time="${chapter.time.toFixed(6)}" aria-pressed="false"><time>${formatTime(chapter.time)}</time><span>${escapeHtml(chapter.label)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div></details></article>`;
  }).join('\n');
  return`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="dark light"><title>Reference recordings / 5u8han</title>
<style>
:root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color-scheme:dark;--paper:#111519;--surface:#191f25;--ink:#eef1ed;--muted:#a7b0b7;--line:#394149;--accent:#c8ed95;background:var(--paper);color:var(--ink)}*{box-sizing:border-box}body{margin:0}button,a{-webkit-tap-highlight-color:transparent}a{color:inherit;text-decoration:none}button{font:inherit}button,a,summary,video{outline-offset:5px}a:focus-visible,button:focus-visible,summary:focus-visible,video:focus-visible{outline:2px solid var(--accent)}.wrap{width:min(1220px,calc(100% - 64px));margin:auto}.topbar{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:25px 0;border-bottom:1px solid var(--line);font-size:12px}.brand{font-weight:650;letter-spacing:-.03em}.topbar>span{font-size:10px;letter-spacing:.08em;color:var(--muted)}.intro{padding:62px 0 42px}.eyebrow{font:10px/1.5 ui-monospace,monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase;margin:0 0 12px}h1{font-size:clamp(43px,6.5vw,82px);font-weight:500;line-height:1.02;letter-spacing:-.06em;margin:0;max-width:14ch}h1 span{color:var(--accent)}.intro-copy{max-width:65ch;color:var(--muted);font-size:15px;line-height:1.8;margin:24px 0 0}.reference-nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-top:32px}.reference-nav a{display:flex;justify-content:space-between;gap:16px;border:1px solid var(--line);border-radius:16px;padding:19px 20px;background:var(--surface);font-size:14px}.reference-nav a:hover{border-color:var(--accent)}.reference-nav a span:last-child{color:var(--accent)}.recording{scroll-margin-top:24px;padding:32px 0 42px;border-top:1px solid var(--line)}.recording-heading{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:20px}h2{font-size:clamp(27px,4vw,43px);font-weight:500;letter-spacing:-.045em;margin:0;line-height:1.12}.recording-heading .eyebrow{font-size:9px}.recording-links{display:flex;flex-wrap:wrap;gap:20px;font-size:11px;white-space:nowrap}.recording-links a{padding:9px 0;border-bottom:1px solid var(--line)}.recording-links a:hover{color:var(--accent);border-color:var(--accent)}.theater{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#05080b;box-shadow:0 18px 70px #0002}.theater video{display:block;width:100%;max-height:76vh;object-fit:contain;min-height:180px;background:#05080b}.facts{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px 22px;margin-top:15px;font:10px/1.5 ui-monospace,monospace;color:var(--muted)}.chapters{margin-top:25px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}.chapters summary{padding:17px 19px;cursor:pointer;font-size:12px}.chapters summary span{float:right;color:var(--muted);font-size:10px}.chapter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:7px;padding:0 12px 12px;max-height:300px;overflow:auto}.chapter{display:flex;align-items:center;gap:12px;text-align:left;min-height:44px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--ink);padding:10px;font-size:11px;cursor:pointer}.chapter time{font:10px ui-monospace,monospace;color:var(--accent);flex-shrink:0}.chapter>span:nth-child(2){flex:1;line-height:1.45}.chapter>span:last-child{color:var(--muted)}.chapter:hover,.chapter[aria-pressed=true]{background:var(--paper);border-color:var(--line)}footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:18px;padding:25px 0 36px;border-top:1px solid var(--line);font-size:10px;color:var(--muted)}.empty{border:1px solid var(--line);padding:30px;border-radius:18px;color:var(--muted);margin-bottom:40px}@media(prefers-color-scheme:light){:root{color-scheme:light;--paper:#f4f2ed;--surface:#e9e8e2;--ink:#182229;--muted:#5b6870;--line:#bcc5c8;--accent:#305d44}.theater{box-shadow:0 18px 70px #1f30301a}}@media(max-width:650px){.wrap{width:calc(100% - 34px)}.topbar{padding:20px 0;font-size:11px}.topbar>span{font-size:8px}.intro{padding:40px 0 32px}.intro-copy{font-size:13px}.reference-nav{grid-template-columns:1fr;gap:8px}.reference-nav a{padding:15px 16px}.recording-heading{align-items:start;flex-direction:column;gap:15px}.recording-links{gap:20px}.theater{border-radius:13px}.theater video{max-height:72vh;min-height:140px}.facts{font-size:9px;justify-content:start}.chapter-grid{grid-template-columns:1fr;max-height:270px}.chapters summary{font-size:11px}.recording{padding-bottom:32px}}@media(prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
</style></head><body><div class="wrap"><header class="topbar"><a class="brand" href="#top">5u8han / reference room</a><span>LOCAL REVIEW · PRIVATE CAPTURES</span></header><main id="top"><section class="intro"><p class="eyebrow">LAYOUT / MOTION / INTERACTION</p><h1>Captured in motion.<br><span>Ready to revisit.</span></h1><p class="intro-copy">Browser walkthroughs for comparing navigation, page structure, transitions and detail. Play a recording or use its chapter markers to return to a specific moment.</p><nav class="reference-nav" aria-label="Recordings">${recordings.map((recording,index)=>`<a href="#${recording.slug}"><span>${String(index+1).padStart(2,'0')} / ${escapeHtml(recording.title)}</span><span aria-hidden="true">↗</span></a>`).join('')}</nav></section>${cards||'<p class="empty">No assembled recordings are available yet.</p>'}</main><footer><span>5U8HAN / DESIGN REFERENCE ARCHIVE</span><span>Silent browser captures · 30 fps output encoding · source timing retained</span></footer></div>
<script>
const videos=[...document.querySelectorAll('video')];
for(const video of videos){
 video.addEventListener('play',()=>{for(const other of videos)if(other!==video)other.pause()});
 const buttons=[...document.querySelectorAll('[data-player="'+video.id+'"]')];
 video.addEventListener('timeupdate',()=>{let current=null;for(const button of buttons)if(Number(button.dataset.time)<=video.currentTime+.08)current=button;for(const button of buttons)button.setAttribute('aria-pressed',String(button===current))});
}
document.addEventListener('click',event=>{
 const button=event.target.closest('.chapter');if(!button)return;
 const video=document.getElementById(button.dataset.player);if(!video)return;
 const seek=()=>{const requested=Number(button.dataset.time);video.currentTime=Math.max(0,Number.isFinite(video.duration)?Math.min(requested,Math.max(0,video.duration-.04)):requested);video.play().catch(()=>{})};
 if(video.readyState)seek();else{video.addEventListener('loadedmetadata',seek,{once:true});video.load()}
});
</script></body></html>`;
}

async function writeIndex(){
  await mkdir(outputRoot,{recursive:true});
  const recordings=[];
  for(const file of(await readdir(outputRoot)).filter(file=>file.endsWith('-chapters.json'))){
    try{
      const recording=JSON.parse(await readFile(path.join(outputRoot,file),'utf8'));
      if(!slugPattern.test(recording.slug)||!Array.isArray(recording.chapters))continue;
      if(!(await stat(path.join(outputRoot,recording.slug+'-full-layout.mp4'))).isFile())continue;
      recordings.push(recording);
    }catch(error){console.warn('Skipping review metadata '+file+': '+error.message);}
  }
  recordings.sort((a,b)=>{const aa=defaultSlugs.indexOf(a.slug),bb=defaultSlugs.indexOf(b.slug);return(aa<0?999:aa)-(bb<0?999:bb)||a.slug.localeCompare(b.slug)});
  await writeFile(path.join(outputRoot,'index.html'),reviewHtml(recordings));
  console.log('Saved research/recordings/index.html with '+recordings.length+' recording(s).');
}

async function main(){
  const slugs=process.argv.slice(2).length?[...new Set(process.argv.slice(2))]:defaultSlugs;
  for(const slug of slugs)if(!slugPattern.test(slug))throw new Error('Invalid recording slug: '+slug);
  let failures=0;
  for(const slug of slugs){try{await assemble(slug)}catch(error){failures++;console.error(slug+': '+error.message)}}
  await writeIndex();
  if(failures)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1});
