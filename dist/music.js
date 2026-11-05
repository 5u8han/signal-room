import {mountThemePicker} from './theme.js';
const $=selector=>document.querySelector(selector);
const deck=$('.radio-deck'),stage=$('#radio-stage'),note=$('#radio-stage-note'),status=$('#radio-status'),transport=$('#radio-transport'),fallback=$('#radio-fallback'),autoplay=$('#radio-autoplay');
const removeThemePicker=mountThemePicker($('#radio-theme'));
const preferenceKey='sub-radio-autoplay';
let player=null,ready=false,disposed=false,poll=0,attempt=0,lastState='',fallbackMode=false;
const unsubscribers=[];
try{autoplay.checked=localStorage.getItem(preferenceKey)==='on';}catch{}
function reflect(state,message){
  deck.dataset.state=state;status.textContent=message||({playing:'Playing / Late Shift',paused:'Paused',stopped:'Ready when you are',closed:'Player closed',loading:'Loading player',blocked:'Press Play to start'}[state]||'Ready');
  transport.textContent=state==='playing'?'Pause':state==='closed'?'Reopen player':'Play Late Shift';
  if(state==='playing')document.title='Late Shift · After Hours Radio';else document.title='After Hours Radio · 5u8han';
}
function mediaState(){if(fallbackMode)return fallback.paused?'PAUSED':'PLAYING';return player?.getPlayerMediaStatus?.()||player?.getMediaStatus?.()||'STOPPED';}
function sync(){
  if(disposed||!ready)return;
  const current=mediaState();
  if(current!==lastState){lastState=current;reflect(current.toLowerCase());}
}
function revealFallback(){
  if(disposed)return;
  attempt++;window.clearInterval(poll);
  try{player?.stop();player?.dispose();}catch{}player=null;fallbackMode=true;ready=true;transport.disabled=false;stage.hidden=true;fallback.hidden=false;fallback.loop=true;note.hidden=false;note.textContent='The classic player is unavailable. Your browser player is ready.';reflect('stopped','Browser player / Late Shift');
}
async function play(){
  if(disposed||!ready)return;
  const token=++attempt;
  try{
    if(fallbackMode)await fallback.play();
    else{player.reopen();player.play();}
    if(disposed||token!==attempt)return;
    window.setTimeout(()=>{if(disposed||token!==attempt)return;sync();if(mediaState()!=='PLAYING')reflect('blocked');},700);
  }catch{if(!disposed)reflect('blocked');}
}
transport.addEventListener('click',()=>{
  if(!ready)return;
  if(mediaState()==='PLAYING'){attempt++;if(fallbackMode)fallback.pause();else player.pause();sync();}
  else play();
});
autoplay.addEventListener('change',()=>{try{if(autoplay.checked)localStorage.setItem(preferenceKey,'on');else localStorage.removeItem(preferenceKey);}catch{}if(autoplay.checked&&ready)play();});
fallback.addEventListener('playing',sync);fallback.addEventListener('pause',sync);
async function start(){
  try{
    if(typeof window.Webamp!=='function'||!window.Webamp.browserIsSupported())return revealFallback();
    player=new window.Webamp({
      initialTracks:[{url:new URL('assets/music/late-shift.mp3',location.href).href,metaData:{artist:'5u8han Radio',title:'Late Shift'},duration:48}],
      enableHotkeys:true,enableMediaSession:true,zIndex:1,
      windowLayout:{main:{position:{left:0,top:0}},equalizer:{position:{left:0,top:116}},playlist:{position:{left:0,top:232},size:{extraWidth:0,extraHeight:0}}}
    });
    if(player.onClose)unsubscribers.push(player.onClose(()=>{lastState='';sync();}));
    if(player.onMediaError)unsubscribers.push(player.onMediaError(revealFallback));
    await player.renderInto(stage);
    if(disposed){player.dispose();return;}
    player.setVolume(36);if(!player.isRepeatEnabled())player.toggleRepeat();
    ready=true;transport.disabled=false;note.hidden=true;sync();
    // Expose the actual media element's state for the companion UI without
    // depending on internal Redux or Webamp's private audio implementation.
    const media=stage.querySelector('audio');
    if(media)media.addEventListener('error',revealFallback,{once:true});
    poll=window.setInterval(sync,250);
    if(autoplay.checked)play();
  }catch(error){console.warn('Classic player unavailable; using browser audio controls.',error);revealFallback();}
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
window.addEventListener('pagehide',()=>{
  disposed=true;attempt++;window.clearInterval(poll);fallback.pause();for(const off of unsubscribers)off();removeThemePicker();try{player?.stop();player?.dispose();}catch{}
},{once:true});
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
