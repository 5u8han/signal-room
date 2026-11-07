import {createHomelabModel,DEVICES,SCENARIOS} from './homelab-model.js';
import {createHomelabEffects} from './homelab-effects.js';
import {createHomelabActor} from './homelab-actor.js';
import {WORLD,EFFECT_LAYOUT,ACTOR_LAYOUT,DEVICE_NOTES} from './homelab-layout.js';
import {beginThemeOverride,getThemeState} from './theme.js';

const $=selector=>document.querySelector(selector),root=document.documentElement;
const hero=$('.homelab'),art=$('.homelab-art'),viewport=$('#room-viewport'),world=$('#room-world'),turntable=$('#room-turntable');
const frontCanvas=$('#room-front-canvas'),rearCanvas=$('#room-rear-canvas');
const contexts=[frontCanvas.getContext('2d'),rearCanvas.getContext('2d')];
const popCanvas=$('#room-popout'),popContext=popCanvas.getContext('2d'),popHeight=1.19;
const inspector=$('#lab-inspector'),scenariosDialog=$('#lab-scenarios'),consoleDialog=$('#lab-console');
const glassStudy=Boolean(document.body.dataset.glassVariant||document.body.dataset.designStudy);
const dialogs=[inspector,scenariosDialog,consoleDialog],reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:760px)');
const lifetime=new AbortController(),signal=lifetime.signal;
const model=createHomelabModel({layout:ACTOR_LAYOUT,initialDelay:12,idleDelay:18});
const effects=[createHomelabEffects({...WORLD,layout:EFFECT_LAYOUT}),createHomelabEffects({...WORLD,layout:EFFECT_LAYOUT})];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const labels={idle:'AT THE DESK',notice:'SOMETHING CHANGED','to-console':'TO THE CONSOLE',diagnose:'READ THE SIGNAL','to-device':'THE RIGHT COMPONENT',repair:'HANDS ON',verify:'CHECK THE RESULT',return:'BACK TO THE DESK'};
const metricNames={load:'Activity',memoryUsed:'Memory in use',capacityUsed:'Storage in use',temperature:'Temperature'};
const modelById=new Map(DEVICES.map(d=>[d.id,d]));
let state=model.getState(),actor=null,assets=null,raf=0,lastFrame=0,elapsed=0,lastDOM=0,ready=false,disposed=false;
let manualPaused=false,visible=true,motion=true,traffic=true,detail=false,inspected=null,themeRelease=null,rear=false,theme=getThemeState();
let popStarted=-Infinity,worldWidth=0,worldHeight=0,viewportWidth=0,lastDarkness=-1,sampleStart=0,sampleFrames=0;
const phonePanorama=()=>glassStudy&&small.matches&&!detail;
const actorButtons=[];
for(const effect of effects)effect.setOptions({palette:theme.palette});
let pointer={x:0,y:0,active:false},previousPhase='',previousSerial=0,inspectionSignature='',toastTimer,manualPanUntil=0;
let audio=null,audioPending=false,audioStarting=null,terminalHistory=[],lastConsole='',printCount=0,typingIndex=0,typingCharacters=0,typingWait=0,typingErasing=false;
const words=['Support engineering.','Datacenter operations.','Networks, firewalls & fiber.','Endpoints, identity & access.','Board-level diagnosis & repair.','Build it. Understand it. Keep it running.'];

function showToast(message){
  clearTimeout(toastTimer);const el=$('#lab-toast');el.textContent=message;el.hidden=false;toastTimer=setTimeout(()=>el.hidden=true,3800);
}
function make(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function image(src){return new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Could not load '+src));el.src=src;});}

function runScenario(id){
  const wasIdle=state.phase==='idle',accepted=model.trigger(id);state=model.getState();
  if(!accepted){showToast('That story is already running or the queue is full.');return;}
  for(const dialog of dialogs)if(dialog.open)dialog.close();
  if(!motion||manualPaused)showToast('Story queued. Use Next step or resume the room.');
  else if(!wasIdle)showToast('Queued next: '+SCENARIOS.find(s=>s.id===id).title+'.');
  else showToast('Follow Sub from the alert to the repair.');
  updateDOM(true);requestFrame();
}

function openDialog(dialog){
  for(const other of dialogs)if(other!==dialog&&other.open)other.close();
  if(!dialog.open)dialog.showModal();
}
for(const dialog of dialogs){
  dialog.querySelector('[data-close-dialog]').addEventListener('click',()=>dialog.close(),{signal});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();},{signal});
}
inspector.addEventListener('close',()=>{inspected=null;model.inspect(null);state=model.getState();for(const button of document.querySelectorAll('.room-hotspot.is-identified'))button.classList.remove('is-identified');requestFrame();},{signal});

function inspectDevice(id){
  if(id==='console'){openConsole();return;}
  if(id==='bench'){actor?.toss(.11,.641);showToast('A spare DIMM. There’s always room for one more upgrade.');requestFrame();return;}
  if(id==='printer'){actor?.print(elapsed);printCount++;showToast(printCount%3===0?'PC LOAD LETTER. Some things never change.':'A small field note, fresh from the printer.');requestFrame();return;}
  if(id==='character'){
    if(state.phase!=='idle'){showToast('Sub is working on the current incident.');return;}
    actor?.hello(elapsed);popStarted=elapsed;requestFrame();return;
  }
  if(!modelById.has(id))return;
  inspected=id;model.inspect(id);state=model.getState();effects[rear?1:0].tap(id);
  const meta=DEVICE_NOTES[id];$('#inspector-kind').textContent=meta.type;$('#inspector-title').textContent=meta.model;$('#inspector-description').textContent=meta.description;
  const stories=$('#inspector-stories');stories.replaceChildren();const matches=SCENARIOS.filter(s=>s.target===id);
  if(matches.length){stories.append(make('p','', 'FOLLOW A STORY ON THIS MACHINE'));for(const story of matches){const button=make('button','',story.title);button.type='button';button.append(make('span','', '↗'));button.addEventListener('click',()=>runScenario(story.id),{signal});stories.append(button);}}
  else{const button=make('button','',id==='workstation'?'Say hello to Sub':'Read the management console');button.type='button';button.addEventListener('click',()=>id==='workstation'?inspectDevice('character'):openConsole(),{signal});stories.append(button);}
  inspectionSignature='';updateInspection();openDialog(inspector);requestFrame();
}

function updateInspection(){
  if(!inspected)return;const data=state.devices[inspected],meta=DEVICE_NOTES[inspected];
  if(!data||!meta)return;
  const signature=[data.health,data.power,...meta.metrics.map(key=>Math.round(data[key]*100))].join('|');if(signature===inspectionSignature)return;inspectionSignature=signature;
  const status=$('#inspector-status');status.dataset.health=data.health;status.replaceChildren(make('i'),make('span','',data.power==='off'?'Host stopped for service':data.power==='battery'?'Protected / on battery':data.health==='healthy'?'Online / checks passing':data.health==='rebuilding'?'Online / verifying the pool':'Online / '+data.health));
  const metrics=$('#inspector-metrics');metrics.replaceChildren();
  for(const key of meta.metrics){const value=data[key],number=key==='temperature'?Math.round(value)+' °C':Math.round(value*100)+'%',row=make('div','inspector-metric'),top=make('div');top.append(make('span','',metricNames[key]),make('span','',number));const track=make('div','metric-track'),bar=make('i');bar.style.setProperty('--value',clamp(key==='temperature'?value/100:value)*100+'%');track.append(bar);row.append(top,track);metrics.append(row);}
}

function addHotspots(){
  for(const isRear of [false,true]){
    const container=$(isRear?'#rear-hotspots':'#front-hotspots'),layout=isRear?EFFECT_LAYOUT.rear:EFFECT_LAYOUT;
    const boxes=Object.entries(layout.devices).map(([id,b])=>({id,b,label:modelById.get(id)?.label||id}));
    if(!isRear)boxes.push({id:'console',b:EFFECT_LAYOUT.console,label:'Open the management console'});
    boxes.push({id:'bench',b:{x:isRear?.849:.012,y:.557,w:.138,h:.195},label:'Explore the parts bench'}, {id:'printer',b:{x:isRear?.488:.442,y:.675,w:.061,h:.073},label:'Print a field note'},{id:'character',b:{x:isRear?.067:.825,y:.47,w:.105,h:.402},label:'Say hello to Sub'});
    for(const {id,b,label}of boxes){const button=make('button','room-hotspot room-hotspot--'+id);button.type='button';button.dataset.device=id;button.setAttribute('aria-label',label);button.title=label;Object.assign(button.style,{left:b.x*100+'%',top:b.y*100+'%',width:b.w*100+'%',height:b.h*100+'%'});if(id==='character'){Object.assign(button.style,{left:'0',top:'0',width:'9%',height:'40%'});actorButtons.push({button,isRear,lastTransform:''});}button.append(make('span','hotspot-marker','+'),make('span','hotspot-name',label));button.querySelector('.hotspot-marker').setAttribute('aria-hidden','true');button.querySelector('.hotspot-name').setAttribute('aria-hidden','true');button.addEventListener('click',()=>inspectDevice(id),{signal});container.append(button);}
  }
}

for(const [i,story]of SCENARIOS.entries()){
  const button=make('button','scenario-card');button.type='button';button.dataset.scenario=story.id;button.append(make('span','',String(i+1).padStart(2,'0')+' / '+(story.rear?'RARE · REAR SERVICE':story.kind.toUpperCase())),make('strong','',story.title),make('p','',story.summary),make('b','','↗'));button.querySelector('b').setAttribute('aria-hidden','true');button.addEventListener('click',()=>runScenario(story.id),{signal});$('#scenario-grid').append(button);
}

function openConsole(){updateConsole(true);openDialog(consoleDialog);}
$('#lab-console-open').addEventListener('click',openConsole,{signal});
$('#lab-greet').addEventListener('click',()=>inspectDevice('character'),{signal});
$('#lab-scenarios-open').addEventListener('click',()=>{const next=state.queue.map(id=>SCENARIOS.find(s=>s.id===id)?.title).filter(Boolean);$('#scenario-queue-note').textContent=next.length?'Next: '+next.join(' → '):'The lab is a simulation. Your own machines are not connected.';openDialog(scenariosDialog);},{signal});

function updateConsole(force=false){
  if(!force&&!consoleDialog.open)return;
  const history=state.logs.slice(-10).map(line=>`[${String(Math.floor(line.time/60)).padStart(2,'0')}:${String(Math.floor(line.time%60)).padStart(2,'0')}] ${line.level==='success'?'✓':'·'} ${line.text}`);
  const text=['5u8han / home lab','Fiber → coax → cellular / management plane','',...history,'',...state.console.lines.map(line=>'> '+line),'',...terminalHistory].join('\n');
  if(text===lastConsole)return;lastConsole=text;const feed=$('#console-feed'),nearBottom=feed.scrollHeight-feed.clientHeight-feed.scrollTop<60;feed.textContent=text;if(force||nearBottom)feed.scrollTop=feed.scrollHeight;$('#console-state').textContent=state.console.title;
}
$('#console-command-form').addEventListener('submit',event=>{
  event.preventDefault();const field=$('#console-command'),raw=field.value.trim();field.value='';if(!raw)return;
  const [command,...args]=raw.toLowerCase().split(/\s+/);let output='';
  if(command==='help')output='btop  lsblk  df -h  journalctl  whoami  uptime  ping  ls  clear\nAlso try: printer, ram, hello, or sudo make coffee';
  else if(command==='btop'){
    const meter=n=>'█'.repeat(Math.round(clamp(n)*16))+'░'.repeat(16-Math.round(clamp(n)*16));
    output=['btop · homelab · simulated telemetry','',...['hpe','dell','gpu','nuc'].map(id=>{const d=state.devices[id];return id.padEnd(6)+' CPU '+meter(d.load)+' '+String(Math.round(d.load*100)).padStart(2)+'%   RAM '+Math.round(d.memoryUsed*100)+'%';}),'','WAN '+state.wan.active.toUpperCase()+'    POOL '+Math.round(state.devices.storage.capacityUsed*100)+'% used'].join('\n');
  }
  else if(command==='lsblk')output='NAME       SIZE  TYPE  MOUNTPOINT\nnvme0n1    1.8T  disk\n└─vg-root  1.6T  lvm   /\nsda        7.3T  disk  pool member\nsdb        7.3T  disk  pool member\nStorage: '+state.devices.storage.health;
  else if(command==='df')output='Filesystem   Size  Used  Avail  Use%  Mounted on\ntank/data     14T   '+(14*state.devices.storage.capacityUsed).toFixed(1)+'T   '+(14*(1-state.devices.storage.capacityUsed)).toFixed(1)+'T   '+Math.round(state.devices.storage.capacityUsed*100)+'%   /srv/data';
  else if(command==='journalctl')output=state.logs.slice(-7).map(entry=>'homelab['+Math.floor(entry.time)+']: '+entry.text).join('\n');
  else if(command==='whoami')output='Sub / support, systems, networks, hardware. All of it.';
  else if(command==='uptime')output=`Lab story time ${Math.floor(state.time)}s / ${state.stats.resolved} repairs verified / WAN ${state.wan.active}.`;
  else if(command==='ping')output=`64 bytes from ${args[0]||'homelab'}: ttl=64 time=0.42 ms\nA simulated reply from this little world.`;
  else if(command==='ls')output='racks/  bench/  gaming/  spare-dimms/  one-more-project/';
  else if(command==='clear'){terminalHistory=[];updateConsole(true);return;}
  else if(command==='printer'){actor?.print(elapsed);output='One field note added to the print queue.';}
  else if(command==='ram'){actor?.toss(.11,.64);output='You found a spare DIMM. It has a little momentum.';}
  else if(command==='hello'){if(state.phase==='idle'){actor?.hello(elapsed);popStarted=elapsed;output='Hey. Good to see you in the lab.';}else output='Sub is following the current incident.';}
  else if(command==='sudo'&&args.join(' ')==='make coffee')output='Permission granted. Coffee is a dependency.';
  else output='Command not found in this simulated shell. Try help.';
  terminalHistory.push('$ '+raw,output);if(terminalHistory.length>24)terminalHistory.splice(0,terminalHistory.length-24);updateConsole(true);requestFrame();
},{signal});

function syncMotion(){
  motion=!reduced.matches&&root.dataset.motion!=='off';model.pause(manualPaused||!motion);state=model.getState();
  hero.dataset.paused=String(manualPaused||!motion);
  $('#lab-pause').setAttribute('aria-pressed',String(manualPaused||!motion));$('#lab-pause .control-label').textContent=!motion?'Motion quiet':manualPaused?'Resume':'Pause';$('#lab-step').hidden=motion&&!manualPaused;$('#lab-quiet-note').hidden=motion;
  if(!motion||manualPaused){$('#homelab-typed').textContent=words[typingIndex];typingCharacters=words[typingIndex].length;typingErasing=true;typingWait=2.6;}
  lastFrame=0;manageTheme();syncAudio();requestFrame();
  sampleStart=0;sampleFrames=0;delete hero.dataset.renderFps;
}
$('#lab-pause').addEventListener('click',()=>{if(!motion){showToast('Motion follows your quiet setting. Next step will move the story forward.');return;}manualPaused=!manualPaused;syncMotion();},{signal});
$('#lab-auto').addEventListener('click',()=>{state=model.setAuto(!state.auto);$('#lab-auto').setAttribute('aria-pressed',String(state.auto));showToast(state.auto?'The lab will choose its next story.':'The room stays healthy until you choose a story.');requestFrame();},{signal});
$('#lab-flow').addEventListener('click',()=>{traffic=!traffic;for(const effect of effects)effect.setOptions({dataFlow:traffic,cables:traffic});$('#lab-flow').setAttribute('aria-pressed',String(traffic));requestFrame();},{signal});
$('#lab-step').addEventListener('click',()=>{
  const durations={notice:2.3,'to-console':3.4,diagnose:4.8,'to-device':3.2,repair:state.incident?.repairSeconds||10,verify:4.3,return:3.6};
  if(state.phase==='idle'&&!state.queue.length)model.trigger('service-crash');
  model.pause(false);state=model.advance(state.phase==='idle'?.02:Math.max(.02,(durations[state.phase]||1)-state.phaseTime+.02));
  if(state.phase==='repair'&&state.phaseProgress<.01)state=model.advance((state.incident?.repairSeconds||10)*.38);
  model.pause(true);state=model.getState();actor?.update(state,elapsed,0,{motion:false,palette:theme.palette});syncRear();updateDOM(true);
  if((detail||phonePanorama())&&actor){const point=actor.position();viewport.scrollLeft=(rear?1-point.x:point.x)*world.clientWidth-viewport.clientWidth*.53;}
  requestFrame();
},{signal});
$('#lab-reset').addEventListener('click',()=>{state=model.reset();popStarted=-Infinity;releaseTheme();if(assets)actor=createHomelabActor({...assets,...WORLD,layout:ACTOR_LAYOUT,effectsLayout:EFFECT_LAYOUT});previousPhase='';updateDOM(true);syncRear();requestFrame();showToast('Checks passing. Back to the desk.');},{signal});
$('#lab-zoom').addEventListener('click',()=>{
  detail=!detail;art.dataset.detail=String(detail);$('#lab-zoom').setAttribute('aria-pressed',String(detail));
  if(!small.matches){if(detail){viewport.style.height=Math.min(innerHeight*.82,1000)+'px';world.style.width=Math.max(viewport.clientWidth*1.35,1500)+'px';viewport.style.overflowX='auto';viewport.style.overflowY='auto';}else{viewport.style.height='';world.style.width='';viewport.style.overflowX='';viewport.style.overflowY='';}}
  resize();if(detail||phonePanorama()){const x=state.rearView?1-state.actor.x:state.actor.x;viewport.scrollLeft=x*world.clientWidth-viewport.clientWidth*.5;viewport.scrollTop=Math.max(0,world.clientHeight-viewport.clientHeight);}else{viewport.scrollLeft=0;viewport.scrollTop=0;}requestFrame();
},{signal});

function releaseTheme(){if(themeRelease){const release=themeRelease;themeRelease=null;release();}}
function manageTheme(){const should=state.rearView&&visible&&!document.hidden;if(should&&!themeRelease)themeRelease=beginThemeOverride('dark',{reason:'rear PSU service'});else if(!should)releaseTheme();}
function syncRear(){
  if(rear!==state.rearView){rear=state.rearView;turntable.classList.toggle('is-rear',rear);$('#room-side').textContent=rear?'REAR / SERVICE':'FRONT / 01';const front=$('#room-face-front'),back=$('#room-face-rear');front.inert=rear;back.inert=!rear;front.setAttribute('aria-hidden',String(rear));back.setAttribute('aria-hidden',String(!rear));}
  manageTheme();
}

function updateTyping(dt){
  if(!motion||manualPaused)return;typingWait-=dt;if(typingWait>0)return;
  const word=words[typingIndex];
  if(!typingErasing){typingCharacters++;typingWait=.042;if(typingCharacters>=word.length){typingCharacters=word.length;typingErasing=true;typingWait=2.6;}}
  else{typingCharacters--;typingWait=.018;if(typingCharacters<=0){typingCharacters=0;typingErasing=false;typingIndex=(typingIndex+1)%words.length;typingWait=.4;}}
  $('#homelab-typed').textContent=words[typingIndex].slice(0,typingCharacters);
}

function updateDOM(force=false){
  if(!force&&elapsed-lastDOM<.15)return;lastDOM=elapsed;
  const phase=state.phase,incident=state.incident;
  hero.dataset.phase=phase;hero.dataset.incident=incident?.id||'';hero.dataset.storyTime=state.time.toFixed(2);
  if(force||phase!==previousPhase||incident?.serial!==previousSerial){
    $('#lab-phase').textContent=labels[phase];$('#lab-headline').textContent=phase==='idle'?'All checks passing.':state.headline;$('#lab-action').textContent=state.action;
    $('#lab-announcement').textContent=phase==='idle'?'Sub is at the desk. All checks passing.':`${incident?.title||state.headline}. ${labels[phase]}. ${state.action}`;
    if(phase==='notice'&&incident?.serial!==previousSerial)audio?.beep();previousPhase=phase;previousSerial=incident?.serial||0;
  }else if($('#lab-action').textContent!==state.action)$('#lab-action').textContent=state.action;
  $('#lab-progress').hidden=phase==='idle';$('#lab-repair-step').textContent=state.repairStep||state.action;const bar=$('#lab-progress [role=progressbar]');bar.style.setProperty('--progress',Math.round(state.progress*100)+'%');bar.setAttribute('aria-valuenow',String(Math.round(state.progress*100)));$('#lab-queue').textContent=state.queue.length?state.queue.length+' queued':'';
  for(const el of document.querySelectorAll('[data-wan]')){const id=el.dataset.wan;el.classList.toggle('is-active',state.wan.active===id);el.classList.toggle('is-down',state.wan.links[id]==='down');el.setAttribute('aria-label',id+': '+(state.wan.active===id?'active':state.wan.links[id]));}
  $('#wan-caption').textContent=state.wan.active==='fiber'?'Fiber primary. Two ways back.':state.wan.active==='coax'?'Fiber unavailable. Coax is carrying traffic.':'Both wired links unavailable. Cellular is carrying traffic.';
  for(const button of document.querySelectorAll('.room-hotspot[data-device]'))button.classList.toggle('is-identified',button.dataset.device===inspected||button.dataset.device===incident?.target&&['to-device','repair','verify'].includes(phase));
  updateInspection();updateConsole();
}

function syncAudio(){if(audio){const audible=motion&&!manualPaused&&visible&&!document.hidden;audio.gain.gain.setTargetAtTime(audible ? .016 : 0,audio.ctx.currentTime,.35);}}
async function toggleAudio(){
  if(audioPending||disposed)return;
  audioPending=true;$('#lab-sound').disabled=true;
  if(audio){const old=audio;audio=null;old.noise.stop();await old.ctx.close().catch(()=>{});if(!disposed){$('#lab-sound').setAttribute('aria-pressed','false');$('#lab-sound .control-label').textContent='Sound off';$('#lab-sound').disabled=false;}audioPending=false;return;}
  const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor){audioPending=false;$('#lab-sound').disabled=false;showToast('Room audio is unavailable in this browser.');return;}
  try{
    const ctx=new Constructor();audioStarting=ctx;await ctx.resume();if(disposed){await ctx.close().catch(()=>{});return;}const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=430;const gain=ctx.createGain();gain.gain.value=0;noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();
    audio={ctx,noise,gain,beep(){if(!motion||manualPaused||!visible)return;const tone=ctx.createOscillator(),volume=ctx.createGain();tone.type='sine';tone.frequency.setValueAtTime(510,ctx.currentTime);tone.frequency.exponentialRampToValueAtTime(340,ctx.currentTime+.14);volume.gain.setValueAtTime(.015,ctx.currentTime);volume.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.19);tone.connect(volume);volume.connect(ctx.destination);tone.start();tone.stop(ctx.currentTime+.2);}};
    $('#lab-sound').setAttribute('aria-pressed','true');$('#lab-sound .control-label').textContent='Sound on';syncAudio();
  }catch{audio=null;if(audioStarting)await audioStarting.close().catch(()=>{});if(!disposed)showToast('The browser could not start room audio.');}
  finally{audioStarting=null;audioPending=false;if(!disposed)$('#lab-sound').disabled=false;}
}
$('#lab-sound').addEventListener('click',toggleAudio,{signal});

function resize(){
  $('#lab-zoom .control-label').textContent=glassStudy&&small.matches?(detail?'Immersive view':'Whole room'):(detail?'Whole room':'Detail view');
  if(!ready)return;const oldWidth=worldWidth,oldViewport=viewportWidth;worldWidth=world.clientWidth;worldHeight=world.clientHeight;viewportWidth=viewport.clientWidth;
  if(phonePanorama()&&(Math.abs(oldWidth-worldWidth)>.5||oldViewport!==viewportWidth)){const x=state.rearView?1-state.actor.x:state.actor.x;viewport.scrollLeft=clamp(x*worldWidth-viewportWidth*.53,0,Math.max(0,worldWidth-viewportWidth));}
  const w=Math.max(320,Math.min(2560,Math.round(worldWidth*Math.min(devicePixelRatio||1,1.5)))),h=Math.round(w*WORLD.height/WORLD.width);
  for(const canvas of [frontCanvas,rearCanvas]){if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;delete canvas.dataset.painted;}}
  if(!small.matches&&!detail){popCanvas.width=w;popCanvas.height=Math.round(h*popHeight);popCanvas.style.height=worldHeight*popHeight+'px';}
  requestFrame();
}
function render(dt=0){
  if(!ready)return;
  const darkness=Math.min(.94,state.roomDarkness);
  if(darkness!==lastDarkness){lastDarkness=darkness;art.style.setProperty('--room-darkness',darkness.toFixed(3));hero.dataset.blackout=String(darkness>.25);}
  const index=rear?1:0,ctx=contexts[index],canvas=index?rearCanvas:frontCanvas;
  ctx.setTransform(canvas.width/WORLD.width,0,0,canvas.height/WORLD.height,0,0);ctx.clearRect(0,0,WORLD.width,WORLD.height);
  const greetAge=elapsed-popStarted;
  const popup=motion&&!manualPaused&&!small.matches&&!detail&&!rear&&state.phase==='idle'&&greetAge>=0&&greetAge<3.18;
  const rise=popup?Math.sin(greetAge/3.18*Math.PI)**2:0;
  effects[index].draw(ctx,state,elapsed,dt,pointer);actor.draw(ctx,{rear,separateCharacter:popup});
  if(popCanvas.hidden===popup)popCanvas.hidden=!popup;
  if(popup){
    popContext.setTransform(popCanvas.width/WORLD.width,0,0,popCanvas.height/(WORLD.height*popHeight),0,0);
    popContext.clearRect(0,0,WORLD.width,WORLD.height*popHeight);
    actor.drawCharacter(popContext,{offsetY:rise*WORLD.height*.204,scaleMultiplier:1+rise*.078});
  }
  const other=contexts[1-index],otherCanvas=index?frontCanvas:rearCanvas;
  // The outgoing face retains its last complete frame during the room turn.
  if(!otherCanvas.dataset.painted){other.setTransform(otherCanvas.width/WORLD.width,0,0,otherCanvas.height/WORLD.height,0,0);other.clearRect(0,0,WORLD.width,WORLD.height);effects[1-index].draw(other,{...state,rearView:!rear},elapsed,0,null);actor.draw(other,{rear:!rear});otherCanvas.dataset.painted='true';}
  canvas.dataset.painted='true';
  const position=actor.position();
  for(const entry of actorButtons){const x=entry.isRear?1-position.x:position.x,transform='translate3d('+Math.round((x-.045)*worldWidth)+'px,'+Math.round((position.y-.40)*worldHeight)+'px,0)';if(entry.lastTransform!==transform){entry.lastTransform=transform;entry.button.style.transform=transform;}}
  if((detail||phonePanorama())&&performance.now()>manualPanUntil&&dt>0){const x=rear?1-position.x:position.x,target=clamp(x*worldWidth-viewportWidth*.53,0,Math.max(0,worldWidth-viewportWidth));viewport.scrollLeft+=(target-viewport.scrollLeft)*(1-Math.exp(-2.2*dt));}
}

function frame(timestamp){
  raf=0;if(disposed||!ready||!visible||document.hidden)return;
  const running=motion&&!manualPaused;
  if(lastFrame&&timestamp-lastFrame<12){if(running)raf=requestAnimationFrame(frame);return;}
  const dt=lastFrame?Math.min(.07,(timestamp-lastFrame)/1000):0;lastFrame=timestamp;
  if(running){state=model.advance(dt);elapsed+=dt;updateTyping(dt);}else state=model.getState();
  actor.update(state,elapsed,running?dt:0,{motion:running,palette:theme.palette});syncRear();render(running?dt:0);updateDOM();
  if(running){
    if(!sampleStart){sampleStart=timestamp;sampleFrames=0;}else sampleFrames++;
    if(timestamp-sampleStart>=1000){hero.dataset.renderFps=String(Math.round(sampleFrames*1000/(timestamp-sampleStart)));sampleStart=timestamp;sampleFrames=0;}
  }
  if(running)raf=requestAnimationFrame(frame);else lastFrame=0;
}
function requestFrame(){if(!raf&&!disposed&&ready&&visible&&!document.hidden)raf=requestAnimationFrame(frame);}
function pointerState(event){const r=world.getBoundingClientRect();pointer={x:clamp((event.clientX-r.left)/r.width),y:clamp((event.clientY-r.top)/r.height),active:true};if(!motion||manualPaused)requestFrame();}
world.addEventListener('pointermove',pointerState,{signal,passive:true});world.addEventListener('pointerleave',()=>{pointer.active=false;if(!motion||manualPaused)requestFrame();},{signal});viewport.addEventListener('pointerdown',()=>manualPanUntil=performance.now()+4500,{signal,passive:true});viewport.addEventListener('wheel',()=>manualPanUntil=performance.now()+4500,{signal,passive:true});
viewport.addEventListener('focusin',()=>manualPanUntil=performance.now()+4500,{signal});
window.addEventListener('portfolio:motionchange',syncMotion,{signal});reduced.addEventListener('change',syncMotion,{signal});
window.addEventListener('portfolio:themechange',event=>{theme=event.detail;for(const effect of effects)effect.setOptions({palette:theme.palette});requestFrame();},{signal});
document.addEventListener('visibilitychange',()=>{lastFrame=0;manageTheme();syncAudio();if(!document.hidden)requestFrame();else if(raf){cancelAnimationFrame(raf);raf=0;}},{signal});
const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(world);
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastFrame=0;manageTheme();syncAudio();if(visible)requestFrame();else if(raf){cancelAnimationFrame(raf);raf=0;}},{threshold:0});observer.observe(viewport);
window.addEventListener('resize',resize,{signal,passive:true});
small.addEventListener('change',()=>{
  if(small.matches||!detail){viewport.style.height='';world.style.width='';viewport.style.overflowX='';viewport.style.overflowY='';}
  else{viewport.style.height=Math.min(innerHeight*.82,1000)+'px';world.style.width=Math.max(viewport.clientWidth*1.35,1500)+'px';viewport.style.overflowX='auto';viewport.style.overflowY='auto';}
  resize();
},{signal});

async function start(){
  try{
    const [atlas,chair]=await Promise.all([image('assets/homelab/sub-atlas.png'),image('assets/homelab/chair-white.png')]);
    if(disposed)return;assets={atlas,chair};actor=createHomelabActor({...assets,...WORLD,layout:ACTOR_LAYOUT,effectsLayout:EFFECT_LAYOUT});addHotspots();ready=true;resize();syncMotion();state=model.getState();actor.update(state,elapsed,0,{motion,palette:theme.palette});updateDOM(true);$('#room-loading').hidden=true;requestFrame();
  }catch(error){$('#room-loading').textContent='The room artwork is here, but the moving layer could not load. Reload to try again.';$('#room-loading').setAttribute('role','alert');console.error(error);}
}
function dispose(){
  if(disposed)return;disposed=true;lifetime.abort();if(raf)cancelAnimationFrame(raf);raf=0;clearTimeout(toastTimer);observer.disconnect();resizeObserver.disconnect();releaseTheme();for(const effect of effects)effect.dispose();if(audio){audio.noise.stop();audio.ctx.close().catch(()=>{});audio=null;}if(audioStarting)audioStarting.close().catch(()=>{});
}
window.addEventListener('pagehide',dispose,{once:true});
start();
