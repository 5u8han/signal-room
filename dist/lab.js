const $=selector=>document.querySelector(selector);
const media=matchMedia('(prefers-reduced-motion: reduce)');
const NS='http://www.w3.org/2000/svg';
const defaultState={preset:'orbit',phase:.38,duration:4,spread:62,seed:24,color:'#dfff00'};
const state={...defaultState};
let animation=null,animationModule=null,animationLoad=null,animationGeneration=0,playing=false;
let localMotion=true;
const motionEnabled=()=>!media.matches&&localMotion&&(window.PortfolioLab?.motionEnabled?.()??true);
const node=(tag,attrs={})=>{const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el};
const names={orbit:'Orbit study',stack:'Stack study',bloom:'Bloom study'};
const descriptions={orbit:'Overlapping elliptical ribbons create a luminous generative orbit.',stack:'A spiral of rounded cards forms a sculptural stack.',bloom:'Overlapping elliptical petals create a generative flower.'};
const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7Zm7 0h3v14h-3Z"/></svg>';

function seeded(index){let v=(state.seed*747796405+index*2891336453)>>>0;v=((v>>>((v>>>28)+4))^v)*277803737>>>0;return ((v>>>22)^v)>>>0}
function construct(){
  const group=$('#sculpture-shapes');group.replaceChildren();
  const count=state.preset==='stack'?20:38;
  for(let i=0;i<count;i++)group.append(node(state.preset==='stack'?'rect':'ellipse',{fill:state.color,'fill-opacity':state.preset==='stack'?.45:.075,stroke:state.color,'stroke-opacity':.8,'stroke-width':.8}));
  $('#sculpture-title').textContent=names[state.preset];$('#shape-label').textContent=names[state.preset].toUpperCase();$('#sculpture-desc').textContent=descriptions[state.preset];
}
function draw(){
  const p=state.phase,spread=state.spread/100,all=[...$('#sculpture-shapes').children];
  all.forEach((el,i)=>{
    const f=i/all.length,jitter=(seeded(i)%1000)/1000,offset=(jitter-.5)*12;
    el.setAttribute('fill',state.color);el.setAttribute('stroke',state.color);
    if(state.preset==='orbit'){
      const angle=f*180+p*180+offset,rx=181+Math.sin(f*Math.PI)*13,ry=30+spread*58+Math.sin(p*Math.PI*2+f*Math.PI*2)*17+jitter*7;
      for(const [k,v] of Object.entries({cx:300,cy:300,rx:rx.toFixed(2),ry:ry.toFixed(2),transform:`rotate(${angle.toFixed(2)} 300 300)`}))el.setAttribute(k,v);
    }else if(state.preset==='stack'){
      const scale=.69+f*.38,angle=(f-.5)*(25+spread*75)+Math.sin(p*Math.PI*2)*25+offset,rise=(f-.5)*(95+spread*180);
      for(const [k,v] of Object.entries({x:-139,y:-83,width:278,height:166,rx:27,transform:`translate(300 ${(300+rise).toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${scale.toFixed(3)})`,'fill-opacity':(.16+f*.58).toFixed(3)}))el.setAttribute(k,v);
    }else{
      const angle=f*360+p*90+offset,radius=43+spread*65+Math.sin(p*Math.PI)*24;
      for(const [k,v] of Object.entries({cx:300,cy:300-radius,rx:23+spread*24,ry:84+spread*29,transform:`rotate(${angle.toFixed(2)} 300 300)`,'fill-opacity':.13}))el.setAttribute(k,v);
    }
  });
  $('#motion-timeline').value=Math.round(p*1000);$('#motion-timeline').style.setProperty('--progress',`${p*100}%`);
  $('#motion-timeline').setAttribute('aria-valuetext',`${(p*state.duration).toFixed(2)} seconds of ${state.duration} seconds`);
  $('#motion-time').textContent=`${(p*state.duration).toFixed(2)} / ${state.duration.toFixed(2)}`;$('#stage-seed').textContent=String(state.seed).padStart(3,'0');
}
function setPlaying(value){playing=value;$('#motion-play').innerHTML=value?pauseIcon:playIcon;$('#motion-play').setAttribute('aria-label',value?'Pause sculpture':'Play sculpture')}
function stop(message){animationGeneration++;if(animation){animation.pause();animation.cancel();animation=null}setPlaying(false);if(message)$('#sculpture-status').textContent=message}
async function engine(){if(animationModule)return animationModule;if(!animationLoad)animationLoad=import('./vendor/anime.esm.min.js').then(mod=>animationModule=mod).catch(error=>{animationLoad=null;throw error});return animationLoad}
async function play(){
  if(!motionEnabled()){stop();state.phase=1;draw();$('#sculpture-status').textContent='Still looks good. Motion is off in your preferences.';return}
  stop();const generation=animationGeneration;if(state.phase>=.999)state.phase=0;setPlaying(true);$('#sculpture-status').textContent='One complete study. Pause anywhere.';
  try{const {animate}=await engine();if(generation!==animationGeneration||!playing||!motionEnabled())return;
    animation=animate(state,{phase:[state.phase,1],duration:state.duration*(1-state.phase)*1000,ease:t=>-(Math.cos(Math.PI*t)-1)/2,onUpdate:draw,onComplete:()=>{animation=null;state.phase=1;draw();setPlaying(false);$('#sculpture-status').textContent='A moment worth keeping. Replay or save this frame.'}});
  }catch{setPlaying(false);$('#sculpture-status').textContent='The motion engine could not load. Presets, scrubbing and export still work.'}
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
$('#motion-play').addEventListener('click',()=>playing?stop('Paused. Take a closer look.'):play());
$('#motion-replay').addEventListener('click',()=>{stop();state.phase=0;draw();play()});
$('#motion-timeline').addEventListener('input',event=>{stop();state.phase=Number(event.target.value)/1000;draw();$('#sculpture-status').textContent='Your moment, frame by frame.'});
document.querySelectorAll('[data-shape]').forEach(button=>button.addEventListener('click',()=>{stop();state.preset=button.dataset.shape;state.phase=motionEnabled()?.38:1;document.querySelectorAll('[data-shape]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));construct();draw();$('#sculpture-status').textContent=`${names[state.preset]}. Static, until you say go.`}));
$('#motion-duration').addEventListener('input',event=>{stop();state.duration=Number(event.target.value);$('#duration-output').textContent=state.duration.toFixed(1)+' s';draw()});
$('#motion-spread').addEventListener('input',event=>{stop();state.spread=Number(event.target.value);$('#spread-output').textContent=state.spread+'%';draw()});
$('#sculpture-color').addEventListener('input',event=>{state.color=event.target.value;draw();if(threeMesh){threeMesh.material.color.set(state.color);renderThree()}});
function setSeed(value){stop();state.seed=Math.min(9999,Math.max(1,Math.round(value)||1));$('#seed-input').value=state.seed;draw();$('#sculpture-status').textContent=`Seed ${state.seed}. The same seed recreates the same variation.`}
$('#seed-prev').addEventListener('click',()=>setSeed(state.seed-1));$('#seed-next').addEventListener('click',()=>setSeed(state.seed+1));$('#seed-random').addEventListener('click',()=>setSeed(Math.floor(Math.random()*9999)+1));$('#seed-input').addEventListener('change',event=>setSeed(Number(event.target.value)));
$('#reset-sculpture').addEventListener('click',()=>{stop();Object.assign(state,defaultState);if(!motionEnabled())state.phase=1;$('#motion-duration').value=state.duration;$('#duration-output').textContent=state.duration.toFixed(1)+' s';$('#motion-spread').value=state.spread;$('#spread-output').textContent=state.spread+'%';$('#sculpture-color').value=state.color;$('#seed-input').value=state.seed;document.querySelectorAll('[data-shape]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.shape===state.preset)));construct();draw();$('#sculpture-status').textContent='Back to the beginning. Make it different again.'});
$('#save-sculpture').addEventListener('click',()=>{stop();const copy=$('#sculpture').cloneNode(true);copy.setAttribute('xmlns',NS);copy.setAttribute('width','1200');copy.setAttribute('height','1200');copy.removeAttribute('class');copy.insertBefore(node('rect',{width:600,height:600,fill:'#11160d'}),copy.firstChild);download(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'}),`portfolio-${state.preset}-seed-${state.seed}.svg`);$('#sculpture-status').textContent='Your SVG is ready. One small piece of possibility.'});
function preferenceChanged(event){if(event?.detail)localMotion=Boolean(event.detail.enabled);stop();if(!motionEnabled()){state.phase=1;draw();$('#sculpture-status').textContent='Still looks good. Motion is off in your preferences.'}else $('#sculpture-status').textContent='Motion is on. Static, until you say go.'}
media.addEventListener('change',preferenceChanged);window.addEventListener('portfolio:motionchange',preferenceChanged);
const intersection=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)stop('Paused outside the view. Your moment will wait.')},{threshold:.05});intersection.observe($('#sculpture-stage'));

// A separate, on-demand scene owns the 3D canvas. It never starts a render loop.
let threeRenderer=null,threeScene=null,threeCamera=null,threeMesh=null,threeLoading=false,threeResize=null,dragPoint=null,sceneGeneration=0;
function renderThree(){if(threeRenderer&&threeMesh){threeRenderer.render(threeScene,threeCamera)}}
function resizeThree(){if(!threeRenderer)return;const width=$('#three-stage').clientWidth,height=310;threeRenderer.setSize(width,height);threeCamera.aspect=width/height;threeCamera.updateProjectionMatrix();renderThree()}
async function enableThree(){
  if(threeRenderer||threeLoading)return;const generation=sceneGeneration;threeLoading=true;$('#enable-three').disabled=true;$('#three-status').textContent='Preparing a local 3D scene…';
  try{
    const THREE=await import('./vendor/three.module.js');if(generation!==sceneGeneration)return;
    threeRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});threeRenderer.setPixelRatio(Math.min(devicePixelRatio,2));threeRenderer.setClearColor(0xdfff00,0);
    threeScene=new THREE.Scene();threeCamera=new THREE.PerspectiveCamera(38,1,.1,100);threeCamera.position.set(0,0,7.8);
    threeMesh=new THREE.Mesh(new THREE.TorusKnotGeometry(1.45,.44,180,26,2,3),new THREE.MeshStandardMaterial({color:0x080908,metalness:.33,roughness:.32}));threeMesh.rotation.set(.34,.5,.1);threeScene.add(threeMesh);
    threeScene.add(new THREE.HemisphereLight(0xffffff,0x4a5500,3.2));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(4,5,5);threeScene.add(light);
    threeRenderer.domElement.setAttribute('role','img');threeRenderer.domElement.setAttribute('aria-label','A shaded 3D torus knot. Use the Rotate button or drag to change the view.');
    $('#three-stage').querySelector('.three-fallback').hidden=true;$('#three-stage').prepend(threeRenderer.domElement);resizeThree();
    threeResize=new ResizeObserver(resizeThree);threeResize.observe($('#three-stage'));
    threeRenderer.domElement.addEventListener('pointerdown',event=>{dragPoint={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId)});
    threeRenderer.domElement.addEventListener('pointermove',event=>{if(!dragPoint)return;threeMesh.rotation.y+=(event.clientX-dragPoint.x)*.012;threeMesh.rotation.x+=(event.clientY-dragPoint.y)*.012;dragPoint={x:event.clientX,y:event.clientY};renderThree()});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])threeRenderer.domElement.addEventListener(type,()=>dragPoint=null);
    $('#enable-three').textContent='3D is ready';$('#turn-three').disabled=false;$('#save-three').disabled=false;$('#three-status').textContent='Drag the knot, or use Rotate. No frames run between changes.';
  }catch{threeRenderer?.dispose();threeRenderer=null;$('#enable-three').disabled=false;$('#three-status').textContent='3D is unavailable in this browser. The still preview and other experiments remain available.'}
  finally{threeLoading=false}
}
$('#enable-three').addEventListener('click',enableThree);
$('#turn-three').addEventListener('click',()=>{if(threeMesh){threeMesh.rotation.y+=.55;threeMesh.rotation.x+=.18;renderThree();$('#three-status').textContent='A new point of view. One render, then stillness.'}});
$('#save-three').addEventListener('click',()=>{if(!threeRenderer)return;renderThree();threeRenderer.domElement.toBlob(blob=>{if(blob){download(blob,'portfolio-dimensional-study.png');$('#three-status').textContent='Your 3D frame is ready as a PNG.'}else $('#three-status').textContent='This browser could not export the canvas.'},'image/png')});

// Tone is loaded only from a gesture. The sequence is finite and independently cancellable.
let toneLoad=null,synth=null,soundTimer=null,soundGeneration=0;
function stopSound(message){soundGeneration++;clearTimeout(soundTimer);synth?.dispose();synth=null;const context=window.Tone?.getContext?.()?.rawContext;if(context?.state==='running')context.suspend().catch(()=>{});$('#stop-sound').disabled=true;$('#play-sound').disabled=false;if(message)$('#sound-status').textContent=message}
function loadTone(){if(window.Tone)return Promise.resolve(window.Tone);if(!toneLoad)toneLoad=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./vendor/tone.js';script.onload=()=>window.Tone?resolve(window.Tone):reject(new Error('Tone unavailable'));script.onerror=()=>reject(new Error('Tone unavailable'));document.head.append(script)}).catch(error=>{toneLoad=null;throw error});return toneLoad}
$('#play-sound').addEventListener('click',async()=>{stopSound();const generation=soundGeneration;$('#play-sound').disabled=true;$('#stop-sound').disabled=false;$('#sound-status').textContent='Preparing three quiet notes…';try{const Tone=await loadTone();if(generation!==soundGeneration)return;await Tone.start();if(generation!==soundGeneration)return;synth=new Tone.Synth({oscillator:{type:'sine'},envelope:{attack:.02,decay:.14,sustain:.08,release:.25},volume:-20}).toDestination();const pitch=Number($('#sound-pitch').value),now=Tone.now();[1,1.25,1.5].forEach((ratio,i)=>synth.triggerAttackRelease(pitch*ratio,.15,now+i*.24));$('#sound-status').textContent='Three notes. One small change in atmosphere.';soundTimer=setTimeout(()=>stopSound('Sound is off. Play again whenever you choose.'),1250)}catch{stopSound('The sound engine could not load. The visual experiments are still ready.')}});
$('#stop-sound').addEventListener('click',()=>stopSound('Sound stopped. Quiet is a good choice, too.'));
$('#sound-pitch').addEventListener('input',event=>{$('#pitch-output').textContent=event.target.value+' Hz';stopSound('Pitch changed. Press Play three notes when ready.')});

const cueLines=()=>$('#caption-cues').value.split('\n').map(line=>line.trim()).filter(Boolean).slice(0,3);
$('#caption-cues').addEventListener('input',()=>{$('#cue-status').textContent=`${cueLines().length} cues · 4 seconds · VTT`});
$('#save-captions').addEventListener('click',()=>{const cues=cueLines();if(!cues.length){$('#cue-status').textContent='Write at least one cue to export.';$('#caption-cues').focus();return}const stamp=seconds=>{const ms=Math.round(seconds*1000);return `00:00:${String(Math.floor(ms/1000)).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`};const text='WEBVTT\n\n'+cues.map((cue,i)=>`${stamp(i*4/cues.length)} --> ${stamp((i+1)*4/cues.length)}\n${cue.replaceAll('-->','→').replaceAll('<','‹').replaceAll('>','›')}\n`).join('\n');download(new Blob([text],{type:'text/vtt;charset=utf-8'}),'portfolio-study-captions.vtt');$('#cue-status').textContent='Timed captions exported. No service contacted.'});

document.addEventListener('visibilitychange',()=>{if(document.hidden){stop('Paused while you are away.');stopSound('Sound stopped while the page is hidden.');$('video')?.pause()}});
window.addEventListener('pagehide',()=>{stop();stopSound();sceneGeneration++;threeLoading=false;intersection.disconnect();threeResize?.disconnect();if(threeMesh){threeMesh.geometry.dispose();threeMesh.material.dispose()}threeRenderer?.domElement.remove();threeRenderer?.dispose();threeRenderer=null;threeMesh=null;threeCamera=null;threeScene=null;$('#three-stage').querySelector('.three-fallback').hidden=false;$('#enable-three').disabled=false;$('#enable-three').textContent='Enable 3D';$('#turn-three').disabled=true;$('#save-three').disabled=true;$('#three-status').textContent='A still preview. The 3D engine loads when you ask.'});
window.addEventListener('pageshow',event=>{if(event.persisted)intersection.observe($('#sculpture-stage'))});
if(!motionEnabled())state.phase=1;construct();draw();
