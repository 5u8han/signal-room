import {initializeAnalytics} from '../analytics.js';
import { STUDIES } from './catalog.js';
import {mountThemePicker,registerArtworkPalette} from '../theme.js';
import {mountTechReels} from '../tech-reels.js';
export const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
export const lerp=(a,b,t)=>a+(b-a)*t;
export function seededRandom(seed=1){let state=seed>>>0;return()=>{state+=0x6D2B79F5;let x=state;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return((x^(x>>>14))>>>0)/4294967296}}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
export function downloadCanvas(canvas,name='sub-atlas-study.png'){canvas.toBlob(blob=>{if(blob)downloadBlob(blob,name)},'image/png')}
export function downloadSVG(svg,name='sub-atlas-study.svg',{background}={}){const copy=svg.cloneNode(true);copy.setAttribute('xmlns','http://www.w3.org/2000/svg');if(background){const box=(copy.getAttribute('viewBox')||'0 0 800 800').split(/[ ,]+/).map(Number),rect=document.createElementNS('http://www.w3.org/2000/svg','rect');for(const[key,value]of Object.entries({x:box[0],y:box[1],width:box[2],height:box[3],fill:background}))rect.setAttribute(key,value);copy.prepend(rect)}downloadBlob(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'}),name)}
export function canvasSurface(canvas,{maxDpr=1.5}={}){
  const ctx=canvas.getContext('2d',{alpha:true});
  const surface={ctx,width:1,height:1,dpr:1,resize,dispose:()=>observer.disconnect()};
  function resize(){const rect=canvas.getBoundingClientRect();const width=Math.max(1,Math.round(rect.width)),height=Math.max(1,Math.round(rect.height)),dpr=Math.min(devicePixelRatio||1,maxDpr);if(width!==surface.width||height!==surface.height||dpr!==surface.dpr||canvas.width!==Math.round(width*dpr)){surface.width=width;surface.height=height;surface.dpr=dpr;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);return surface}
  const observer=new ResizeObserver(()=>{resize();window.dispatchEvent(new CustomEvent('atlas:surface-resize'))});observer.observe(canvas);resize();return surface;
}
function rgb(hex){return hex.replace('#','').match(/.{2}/g).map(value=>parseInt(value,16)/255)}
function luminance(color){return color.map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0)}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function chromeColors(background,foreground,accent){const bg=rgb(background),fg=rgb(foreground);const ink=contrast(bg,fg)>=4.5?foreground:contrast(bg,[0,0,0])>contrast(bg,[1,1,1])?'#000000':'#ffffff';const selected=rgb(ink),muted=selected.map((value,i)=>value*.64+bg[i]*.36);return{ink,accent:contrast(bg,rgb(accent))>=4.5?accent:ink,muted:contrast(bg,muted)>=4.5?`rgb(${muted.map(value=>Math.round(value*255)).join(' ')})`:ink}}
export function createStudy(options={}){
  const meta=STUDIES.find(study=>study.id===Number(options.id))||STUDIES[0];
  const title=options.title||meta.title,accent=options.accent||meta.accent,background=options.background||meta.background,foreground=options.foreground||meta.foreground;
  const root=document.documentElement;root.style.setProperty('--accent',accent);root.style.setProperty('--paper',background);root.style.setProperty('--ink',foreground);root.style.setProperty('--bg',background);root.style.setProperty('--fg',foreground);
  const chrome=chromeColors(background,foreground,accent);for(const [key,value]of Object.entries(chrome))root.style.setProperty('--chrome-'+key,value);
  document.body.classList.add('atlas-page');
  registerArtworkPalette({background,foreground,accent});
  const main=document.querySelector('#main'),artworks=document.createElement('div');artworks.className='atlas-artworks';while(main.firstChild)artworks.append(main.firstChild);main.append(artworks);
  document.title=title+' / Sub’s Motion Atlas';
  const pos=meta.id-1,prev=STUDIES[(pos+19)%20],next=STUDIES[(pos+1)%20];
  document.querySelector('#atlas-header').innerHTML=`<a class="atlas-skip" href="#main">Skip to the artwork</a><div class="atlas-top"><a class="atlas-brand" href="../atlas.html"><b aria-hidden="true">✳</b><span>SUB / MOTION ATLAS<small>AN EXPERIMENT IN EVERY SCALE.</small></span></a><div class="atlas-title"><span class="study-number">${String(meta.id).padStart(2,'0')}</span><span class="study-name">${title}</span></div><div class="atlas-top-controls"><button id="atlas-pause" type="button" aria-pressed="false">Pause</button><a class="atlas-index-link" href="../atlas.html">Index ↗</a></div></div>`;
  document.querySelector('#atlas-footer').innerHTML=`<div class="atlas-bottom"><div class="atlas-utility"><button id="atlas-reset" type="button">Reset ↺</button><button id="atlas-export" type="button" hidden>Export ↓</button><button type="button" data-privacy-open aria-label="Privacy / analytics" title="Privacy / analytics">◌</button></div><span class="atlas-study-meta">${options.category||meta.family} / ${meta.tags.join(' · ')}</span><nav class="atlas-steps" aria-label="Study navigation"><a href="${prev.slug}.html" aria-label="Previous study: ${prev.title}">← <span>Prev</span></a><span class="atlas-position">${String(meta.id).padStart(2,'0')} / 20</span><a href="${next.slug}.html" aria-label="Next study: ${next.title}"><span>Next</span> →</a></nav></div>`;
  const pauseButton=document.querySelector('#atlas-pause');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let userMotion=true;try{userMotion=(localStorage.getItem('atlas-motion')??localStorage.getItem('portfolio-motion'))!=='off'}catch{}
  let paused=!userMotion,dead=false,artworkVisible=true,raf=0,last=0,time=0,resetter=null,exporter=null;
  const frames=new Set(),motionHandlers=new Set(),resizeHandlers=new Set(),cleanups=[];
  const running=()=>!dead&&!paused&&!reduce.matches&&!document.hidden&&artworkVisible;
  function paint(dt=0,now=performance.now()){for(const callback of [...frames])callback({dt,time,now,running:running()})}
  function tick(now){raf=0;if(!running())return;const dt=last?clamp((now-last)/1000,0,.033):0;last=now;time+=dt;paint(dt,now);if(running()&&frames.size)raf=requestAnimationFrame(tick)}
  function schedule(){if(!raf&&running()&&frames.size)raf=requestAnimationFrame(tick)}
  function invalidate(){if(!dead)paint(0)}
  function sync(){if(raf){cancelAnimationFrame(raf);raf=0}last=0;const enabled=!paused&&!reduce.matches;root.dataset.atlasMotion=enabled?'on':'off';window.dispatchEvent(new CustomEvent('atlas:motionchange',{detail:{enabled}}));pauseButton.textContent=reduce.matches?'Still':paused?'Play':'Pause';pauseButton.setAttribute('aria-pressed',String(paused||reduce.matches));pauseButton.setAttribute('aria-label',reduce.matches?'Reduced motion is active':paused?'Play the artwork':'Pause the artwork');for(const callback of [...motionHandlers])callback(running());invalidate();schedule()}
  function notify(message){let toast=document.querySelector('.atlas-flash');if(!toast){toast=document.createElement('p');toast.className='atlas-flash';toast.setAttribute('role','status');document.body.append(toast)}toast.textContent=message;toast.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.hidden=true,2500)}
  pauseButton.addEventListener('click',()=>{if(reduce.matches){notify('Following your system’s reduced-motion preference.');return}paused=!paused;try{localStorage.setItem('atlas-motion',paused?'off':'on')}catch{}sync()});
  document.querySelector('#atlas-reset').addEventListener('click',()=>{time=0;last=0;resetter?.();invalidate()});
  document.querySelector('#atlas-export').addEventListener('click',()=>exporter?.());
  const visibility=()=>sync();document.addEventListener('visibilitychange',visibility);
  const preference=()=>sync();reduce.addEventListener('change',preference);
  function resize(){for(const callback of [...resizeHandlers])callback();invalidate()}
  window.addEventListener('resize',resize);window.addEventListener('atlas:surface-resize',resize);
  document.fonts?.ready.then(()=>{if(!dead)resize()});
  const dispose=()=>{if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);frames.clear();document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener('change',preference);window.removeEventListener('resize',resize);window.removeEventListener('atlas:surface-resize',resize);clearTimeout(notify.timer);for(const callback of cleanups)callback()};
  window.addEventListener('pagehide',dispose,{once:true});window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});
  const removeThemePicker=mountThemePicker(document.querySelector('.atlas-top-controls'));
  const reels=mountTechReels({context:'atlas',study:meta});cleanups.push(()=>reels.dispose(),removeThemePicker);
  const artObserver=new IntersectionObserver(entries=>{const visible=entries[0]?.isIntersecting??true;root.dataset.atlasArtVisible=String(visible);if(visible!==artworkVisible){artworkVisible=visible;sync()}},{rootMargin:'-72px 0px -54px 0px'});artObserver.observe(artworks);cleanups.push(()=>artObserver.disconnect());
  initializeAnalytics();
  sync();
  return {running,paused:()=>paused,time:()=>time,invalidate,notify,
    onFrame(callback){frames.add(callback);callback({dt:0,time,now:performance.now(),running:running()});schedule();return()=>frames.delete(callback)},
    onMotion(callback){motionHandlers.add(callback);callback(running());return()=>motionHandlers.delete(callback)},
    onResize(callback){resizeHandlers.add(callback);callback();return()=>resizeHandlers.delete(callback)},
    setReset(callback){resetter=callback},setExport(callback){exporter=callback;document.querySelector('#atlas-export').hidden=!callback},
    cleanup(callback){cleanups.push(callback)},dispose
  };
}
