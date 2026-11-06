import {mountThemePicker} from './theme.js';
const $=selector=>document.querySelector(selector);
const deck=$('.radio-deck'),stage=$('#radio-stage'),note=$('#radio-stage-note'),status=$('#radio-status'),transport=$('#radio-transport'),fallback=$('#radio-fallback'),autoplay=$('#radio-autoplay');
const removeThemePicker=mountThemePicker($('#radio-theme'));
const preferenceKey='sub-radio-autoplay';
let player=null,ready=false,disposed=false,poll=0,attempt=0,fallbackMode=false;
let probe=null,blockedMessage='',lastPresentation='';
const unsubscribers=[];
try{autoplay.checked=localStorage.getItem(preferenceKey)==='on';}catch{}
function reflect(state,message){
  const caption=message||({playing:'Playing / Late Shift',starting:'Starting playback…',paused:'Paused',stopped:'Ready when you are',closed:'Player closed',loading:'Loading player',blocked:'Press Play to start'}[state]||'Ready');
  const presentation=state+'|'+caption;if(presentation===lastPresentation)return;lastPresentation=presentation;
  deck.dataset.state=state;status.textContent=caption;
  transport.textContent=state==='playing'?'Pause':state==='starting'?'Cancel start':state==='closed'?'Reopen player':'Play Late Shift';
  if(state==='playing')document.title='Late Shift · After Hours Radio';else document.title='After Hours Radio · 5u8han';
}
function mediaState(){if(fallbackMode)return fallback.paused?'PAUSED':'PLAYING';return player?.getPlayerMediaStatus?.()||player?.getMediaStatus?.()||'STOPPED';}
function position(){
  if(fallbackMode)return Number.isFinite(fallback.currentTime)?{value:fallback.currentTime,range:Number.isFinite(fallback.duration)?fallback.duration:48}:null;
  // Webamp's public PLAYING status is optimistic, including after rejected
  // autoplay. Its rendered seek control advances only with decoded media time.
  const slider=stage.querySelector('input[title="Seeking Bar"]');
  if(!slider)return null;
  const value=Number(slider.value),range=Number(slider.max)-Number(slider.min);
  return Number.isFinite(value)&&range>0?{value,range}:null;
}
function beginProbe({quietFor=0}={}){
  const now=performance.now();
  probe={started:now,lastProgress:now,position:position(),confirmed:false,ignoreUntil:now+quietFor};
  blockedMessage='';
}
function pausePlayback(){if(fallbackMode)fallback.pause();else if(mediaState()==='PLAYING')player?.pause();}
function blocked(message){
  attempt++;probe=null;blockedMessage=message;pausePlayback();reflect('blocked',message);
}
function sync(){
  if(disposed||!ready)return;
  const current=mediaState();
  if(current!=='PLAYING'){
    probe=null;
    if(blockedMessage&&current==='PAUSED'){reflect('blocked',blockedMessage);return;}
    blockedMessage='';reflect(current.toLowerCase());return;
  }
  // Background tabs may suspend timers while audio keeps playing. A large
  // clock jump on return cannot be treated as a failed playback attempt.
  if(document.hidden)return;
  if(!probe)beginProbe();
  const now=performance.now(),next=position(),previous=probe.position;
  if(next&&previous){
    const difference=next.value-previous.value;
    const forward=difference<0?difference+next.range:difference;
    // Reject a large seek jump as proof of playback; a normal second tick or
    // end-to-start repeat is small. Pointer/keyboard seeking also resets below.
    if(now>=probe.ignoreUntil&&forward>0&&forward<next.range*.12){probe.confirmed=true;probe.lastProgress=now;}
  }
  probe.position=next;
  if(probe.confirmed){
    if(now-probe.lastProgress>6500){blocked('Playback stalled. Press Play to retry.');return;}
    reflect('playing');
  }else if(now-probe.started>8000){
    blocked('Playback has not started. Press Play to retry.');
  }else reflect('starting');
}
function ensurePoll(){if(!poll)poll=window.setInterval(sync,250);}
function revealFallback(message='The classic player is unavailable. Your browser player is ready.'){
  if(disposed)return;
  attempt++;probe=null;blockedMessage='';
  const previous=player;player=null;fallbackMode=true;ready=true;
  for(const off of unsubscribers.splice(0))off();
  try{previous?.stop();previous?.dispose();}catch{}
  transport.disabled=false;stage.hidden=true;fallback.hidden=false;fallback.loop=true;note.hidden=false;note.textContent=message;reflect('stopped','Browser player / Late Shift');ensurePoll();
}
async function play(){
  if(disposed||!ready)return;
  const token=++attempt;beginProbe();reflect('starting');
  try{
    if(fallbackMode){if(fallback.error)fallback.load();await fallback.play();}
    else{if(mediaState()==='CLOSED')player.reopen();player.play();}
    if(disposed||token!==attempt)return;
    sync();
  }catch(error){if(!disposed&&token===attempt)blocked(error?.name==='NotAllowedError'?'Your browser needs a Play click to start audio.':'Audio could not start. Press Play to retry.');}
}
transport.addEventListener('click',()=>{
  if(!ready)return;
  if(deck.dataset.state==='playing'||deck.dataset.state==='starting'){
    attempt++;probe=null;blockedMessage='';pausePlayback();sync();
  }else play();
});
autoplay.addEventListener('change',()=>{try{if(autoplay.checked)localStorage.setItem(preferenceKey,'on');else localStorage.removeItem(preferenceKey);}catch{}if(autoplay.checked&&ready)play();});
// Seeking changes the displayed position without proving playback. Wait for a
// subsequent media tick rather than confirming from the visitor's manual jump.
function seeking(event){if(event.target?.matches?.('input[title="Seeking Bar"]')&&mediaState()==='PLAYING')beginProbe({quietFor:1000});}
stage.addEventListener('input',seeking);stage.addEventListener('pointerup',seeking);stage.addEventListener('keyup',seeking);
fallback.addEventListener('seeking',()=>{if(!fallback.paused)beginProbe({quietFor:500});});
fallback.addEventListener('playing',sync);fallback.addEventListener('pause',sync);
fallback.addEventListener('error',()=>blocked('The audio could not load. Press Play to retry.'));
document.addEventListener('visibilitychange',()=>{
  if(disposed||document.hidden||!ready)return;
  if(probe&&mediaState()==='PLAYING'){
    const now=performance.now();
    probe.position=position();probe.started=now;probe.lastProgress=now;probe.ignoreUntil=now;
  }
  sync();
});
async function start(){
  try{
    if(typeof window.Webamp!=='function'||!window.Webamp.browserIsSupported())return revealFallback();
    player=new window.Webamp({
      initialTracks:[{url:new URL('assets/music/late-shift.mp3',location.href).href,metaData:{artist:'5u8han Radio',title:'Late Shift'},duration:48}],
      enableHotkeys:true,enableMediaSession:true,zIndex:1,
      windowLayout:{main:{position:{left:0,top:0}},equalizer:{position:{left:0,top:116}},playlist:{position:{left:0,top:232},size:{extraWidth:0,extraHeight:0}}}
    });
    if(player.onClose)unsubscribers.push(player.onClose(()=>{probe=null;blockedMessage='';sync();}));
    // Future Webamp versions expose this public callback. Version 2.3.1 does
    // not, so the progress watchdog above handles failed/stalled playback.
    if(player.onMediaError)unsubscribers.push(player.onMediaError(()=>revealFallback('The classic player could not play this audio. Browser controls are ready.')));
    await player.renderInto(stage);
    if(disposed){player?.dispose();return;}
    if(!player)return;
    player.setVolume(36);if(!player.isRepeatEnabled())player.toggleRepeat();
    ready=true;transport.disabled=false;note.hidden=true;sync();ensurePoll();
    if(autoplay.checked)play();
  }catch(error){console.warn('Classic player unavailable; using browser audio controls.',error);revealFallback();}
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
window.addEventListener('pagehide',()=>{
  disposed=true;attempt++;probe=null;window.clearInterval(poll);poll=0;fallback.pause();for(const off of unsubscribers)off();removeThemePicker();try{player?.stop();player?.dispose();}catch{}
},{once:true});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
