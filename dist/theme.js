const root=document.documentElement;
const STORAGE_KEY='sub-theme';
const THEMES=['dark','light','evening'];
const desktop=matchMedia('(prefers-color-scheme: dark)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pickers=new Set();
const overrides=new Map();
let preference='system',started=false,artwork=null,transition=null,reveal=null,sequence=0;

const palettes={
  dark:{paper:'#0d1012',ink:'#f4f1e8',accent:'#dfff55',muted:'#a9b4ac',surface:'#1b2224',rule:'#44504a',pink:'#f78fc9',blue:'#8a91ff'},
  light:{paper:'#f4f1e9',ink:'#182122',accent:'#3e4eca',muted:'#5e6867',surface:'#e8e8df',rule:'#a8b0aa',pink:'#b8327d',blue:'#3e4eca'},
  evening:{paper:'#edcfc5',ink:'#302334',accent:'#8f2e40',muted:'#684653',surface:'#e2b8b0',rule:'#a87e85',pink:'#b53d65',blue:'#6f547e'}
};
const normalizeTheme=value=>value==='dusk'?'evening':value;
const themeName=value=>value==='evening'?'Dusk':value[0].toUpperCase()+value.slice(1);
function readPreference(){try{const value=normalizeTheme(localStorage.getItem(STORAGE_KEY));return THEMES.includes(value)?value:'system'}catch{return'system'}}
function preferredTheme(){return preference==='system'?(desktop.matches?'dark':'light'):preference}
function activeOverride(){return[...overrides.values()].at(-1)||null}
function resolved(){return activeOverride()?.theme||preferredTheme()}
export function getThemeState(){
  const theme=resolved(),override=activeOverride();
  return{theme,preference,preferredTheme:preferredTheme(),overridden:Boolean(override),overrideReason:override?.reason||null,palette:{...palettes[theme]}};
}
function luminance(hex){const rgb=hex.replace('#','').match(/.{2}/g)?.map(value=>parseInt(value,16)/255);if(!rgb||rgb.length!==3)return 0;return rgb.map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0)}
function applyArtwork(theme){
  if(!artwork)return;
  const light=luminance(artwork.background)>.3;
  root.dataset.artTone=light?'light':'dark';
  const inverse=theme==='light'&&!light||theme==='dark'&&light||theme==='evening'&&!light;
  const filters=[];
  if(inverse)filters.push('invert(1) hue-rotate(180deg)');
  if(theme==='evening')filters.push('sepia(.26) hue-rotate(320deg) saturate(.78)');
  root.style.setProperty('--theme-art-filter',filters.join(' ')||'none');
}
function paint(){
  const state=getThemeState(),{theme,palette}=state;
  root.dataset.theme=theme;
  root.dataset.themePreference=preference;
  root.dataset.preferredTheme=state.preferredTheme;
  if(state.overridden)root.dataset.themeOverride='active';else root.removeAttribute('data-theme-override');
  root.style.colorScheme=theme==='dark'?'dark':'light';
  for(const[key,value]of Object.entries(palette))root.style.setProperty('--theme-'+key,value);
  let browserColor=document.querySelector('meta[name="theme-color"]');
  if(!browserColor){browserColor=document.createElement('meta');browserColor.name='theme-color';document.head.append(browserColor)}
  browserColor.content=palette.paper;
  applyArtwork(theme);
  for(const update of pickers)update();
  window.dispatchEvent(new CustomEvent('portfolio:themechange',{detail:state}));
}
function motionAllowed(){return!reduced.matches&&root.dataset.motion!=='off'&&root.dataset.atlasMotion!=='off'}
function cancelReveal(){
  sequence++;
  reveal?.cancel();reveal=null;
  try{transition?.skipTransition()}catch{}
  transition=null;
  root.removeAttribute('data-theme-reveal');
}
export function initializeTheme(){
  if(started)return getThemeState();
  started=true;preference=readPreference();paint();
  desktop.addEventListener('change',()=>{if(preference==='system'){cancelReveal();paint()}});
  reduced.addEventListener('change',()=>{if(reduced.matches)cancelReveal()});
  window.addEventListener('storage',event=>{if(event.key===STORAGE_KEY||event.key===null){cancelReveal();preference=readPreference();paint()}});
  window.addEventListener('pagehide',()=>{cancelReveal();if(overrides.size){overrides.clear();paint()}});
  return getThemeState();
}
/** Apply scene lighting without changing the visitor's saved choice. The most
 * recently created active override wins; release functions are idempotent. */
export function beginThemeOverride(theme='dark',{reason='equipment service'}={}){
  theme=normalizeTheme(theme);
  if(!THEMES.includes(theme))throw new RangeError('Unknown temporary theme');
  initializeTheme();cancelReveal();
  const token=Symbol('theme-override');
  overrides.set(token,{theme,reason:String(reason).trim().slice(0,100)||'equipment service'});
  paint();
  return()=>{if(!overrides.delete(token))return;cancelReveal();paint()};
}
export function registerArtworkPalette(palette){
  artwork={...palette};root.dataset.hasArtwork='true';
  for(const[key,value]of Object.entries(artwork))root.style.setProperty('--study-original-'+key,value);
  applyArtwork(resolved());
}
export async function setTheme(next,event){
  next=normalizeTheme(next);
  if(!THEMES.includes(next)&&next!=='system')return;
  if(next===preference)return;
  const previousTheme=resolved();
  preference=next;
  try{if(next==='system')localStorage.removeItem(STORAGE_KEY);else localStorage.setItem(STORAGE_KEY,next)}catch{}
  cancelReveal();
  const token=sequence;
  const target=event?.currentTarget;
  const rect=target?.getBoundingClientRect?.();
  const x=event?.detail&&Number.isFinite(event.clientX)?event.clientX:(rect?rect.left+rect.width/2:innerWidth-36);
  const y=event?.detail&&Number.isFinite(event.clientY)?event.clientY:(rect?rect.top+rect.height/2:36);
  const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  if(previousTheme===resolved()||!document.startViewTransition||!motionAllowed()){paint();return}
  root.dataset.themeReveal='active';
  try{
    transition=document.startViewTransition(paint);
    const currentTransition=transition;
    await currentTransition.ready;
    if(token!==sequence)return;
    if(!motionAllowed()){cancelReveal();return}
    reveal=root.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${radius}px at ${x}px ${y}px)`]}, {duration:680,easing:'cubic-bezier(.22,.7,.22,1)',fill:'both',pseudoElement:'::view-transition-new(root)'});
    await reveal.finished.catch(()=>{});
    await currentTransition.finished.catch(()=>{});
    if(token===sequence){reveal?.cancel();reveal=null;transition=null;root.removeAttribute('data-theme-reveal')}
  }catch{if(token===sequence){paint();cancelReveal()}}
}
let pickerId=0;
export function mountThemePicker(container){
  if(!container)return()=>{};
  initializeTheme();
  const host=document.createElement('div');host.className='theme-picker';
  const id='theme-menu-'+(++pickerId);
  host.innerHTML=`<button type="button" class="theme-trigger" aria-label="Choose a color theme" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18V3Z" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg><span class="theme-trigger-word">Theme</span><span class="theme-trigger-chevron" aria-hidden="true">⌄</span></button><div class="theme-menu" id="${id}" role="menu" aria-label="Color theme" hidden><p class="theme-menu-kicker">SET THE ATMOSPHERE</p>${[['dark','Dark','Black / bright signal'],['light','Light','Chalk / crisp contrast'],['evening','Dusk','Dust / ember / desert rose']].map(([value,name,description])=>`<button type="button" role="menuitemradio" aria-checked="false" data-theme-choice="${value}"><span class="theme-swatch theme-swatch-${value}" aria-hidden="true"></span><span><strong>${name}</strong><small>${description}</small></span><span class="theme-choice-check" aria-hidden="true">✓</span></button>`).join('')}<div class="theme-menu-divider" role="separator"></div><button type="button" class="theme-system" role="menuitemradio" aria-checked="false" data-theme-choice="system"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8m-4-4v4"/></svg><span><strong>Follow desktop</strong><small>Changes with your device</small></span><span class="theme-choice-check" aria-hidden="true">✓</span></button><p class="theme-menu-note" aria-live="polite"></p></div>`;
  container.append(host);
  const trigger=host.querySelector('.theme-trigger'),menu=host.querySelector('.theme-menu'),buttons=[...menu.querySelectorAll('[data-theme-choice]')];
  let open=false;
  const events=new AbortController(),{signal}=events;
  function show(){open=true;menu.hidden=false;trigger.setAttribute('aria-expanded','true')}
  function close(restore=false){open=false;menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus({preventScroll:true})}
  function sync(){
    const state=getThemeState();
    for(const button of buttons)button.setAttribute('aria-checked',String(button.dataset.themeChoice===preference));
    host.dataset.override=String(state.overridden);trigger.dataset.activeTheme=state.theme;
    trigger.title=state.overridden?`${themeName(state.theme)} · temporary ${state.overrideReason}`:`${themeName(state.theme)} theme${preference==='system'?' · following desktop':''}`;
    menu.querySelector('.theme-menu-note').textContent=state.overridden?`Temporarily using ${themeName(state.theme)} for ${state.overrideReason}. Your ${preference==='system'?'desktop setting':themeName(state.preferredTheme)+' choice'} returns after service.`:preference==='system'?`Following your desktop: ${themeName(state.theme)}.`:`${themeName(state.theme)} is saved for this browser.`;
  }
  const blur=()=>queueMicrotask(()=>{if(open&&!host.contains(document.activeElement))close()});
  const outside=event=>{if(!host.contains(event.target))close()};
  host.addEventListener('focusout',blur,{signal});document.addEventListener('pointerdown',outside,{signal});
  trigger.addEventListener('click',()=>{if(open)close();else show()},{signal});
  for(const button of buttons)button.addEventListener('click',event=>{setTheme(button.dataset.themeChoice,event);close(true)},{signal});
  host.addEventListener('keydown',event=>{
    const current=buttons.indexOf(document.activeElement);
    if(open&&event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return}
    if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();show();let index=event.key==='Home'?0:event.key==='End'?buttons.length-1:current<0?(event.key==='ArrowUp'?buttons.length-1:0):(current+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();return}
    if(open&&/^[a-z]$/i.test(event.key)&&!event.ctrlKey&&!event.metaKey){const found=buttons.find(button=>button.querySelector('strong').textContent.toLowerCase().startsWith(event.key.toLowerCase()));if(found){event.preventDefault();found.focus()}}
  },{signal});
  pickers.add(sync);sync();
  return()=>{pickers.delete(sync);events.abort();host.remove()};
}
initializeTheme();
