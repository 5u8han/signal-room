import './common.js';

const variants=[
  {id:'1',name:'Canopy',description:'A floating ribbon above the room.'},
  {id:'2',name:'Split Signal',description:'Navigation and tools in separate glass islands.'},
  {id:'3',name:'Glass Spine',description:'A slim vertical rail at the edge of the room.'},
  {id:'4',name:'Command Dock',description:'A compact upper-right navigator leaves the wall open.'}
];
const variant=variants.find(item=>item.id===document.body.dataset.glassVariant);
const art=document.querySelector('.homelab-art');
const hero=document.querySelector('.homelab');
const header=document.querySelector('#site-header');

if(variant&&art&&hero&&header){
  // Move the existing nodes, preserving common.js search, navigation, motion
  // and theme listeners. No second header or duplicated IDs are created.
  art.prepend(header);
  header.classList.add('glass-site-header');
  header.dataset.glassVariant=variant.id;
  header.dataset.glassTitle=variant.name;
  header.querySelector('.container')?.classList.add('glass-nav-container');
  const shell=header.querySelector('.main-header');
  const brand=header.querySelector('.wordmark');
  const links=header.querySelector('.desktop-nav');
  const tools=header.querySelector('.header-actions');
  shell?.classList.add('glass-surface','glass-nav-shell');
  brand?.classList.add('glass-nav-brand');
  links?.classList.add('glass-surface','glass-nav-links');
  tools?.classList.add('glass-surface','glass-nav-tools');
  const typebar=art.querySelector('.homelab-typebar');
  typebar?.classList.add('glass-surface','glass-typebar');

  // The fitted room is narrower than the browser. Keep the existing pop-out
  // canvas aligned to that exact plane without stretching the character.
  const world=art.querySelector('#room-world'),popout=hero.querySelector('#room-popout');
  const alignPopout=()=>{
    if(!world||!popout)return;
    const room=world.getBoundingClientRect(),section=hero.getBoundingClientRect();
    popout.style.left=(room.left-section.left)+'px';
    popout.style.top=(room.top-section.top)+'px';
    popout.style.width=room.width+'px';
  };
  const geometry=new ResizeObserver(alignPopout);
  geometry.observe(art);if(world)geometry.observe(world);alignPopout();

  const strip=document.createElement('section');
  strip.className='glass-study-strip';
  strip.setAttribute('aria-label','Compare the liquid glass landing studies');
  strip.innerHTML=`<div class="glass-study-heading"><p class="glass-study-kicker">LIQUID GLASS / LANDING STUDIES</p><h2><span>0${variant.id}</span> ${variant.name}</h2><p>${variant.description}</p></div><nav class="glass-study-choices" aria-label="Landing design examples">${variants.map(item=>`<a href="glass-0${item.id}.html"${item.id===variant.id?' aria-current="page"':''}><span>0${item.id}</span>${item.name}<span aria-hidden="true">↗</span></a>`).join('')}<a class="glass-study-compare" href="glass-studies.html">Compare all four<span aria-hidden="true">↗</span></a></nav>`;
  hero.after(strip);

  // A static, low-frequency displacement provides optional optical bending.
  // CSS should keep a blur/saturation fallback where SVG backdrop filters are
  // unsupported; no noise texture or filter primitive animates every frame.
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','0');
  svg.setAttribute('height','0');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  svg.classList.add('glass-optics');
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML='<defs><filter id="glass-lens" x="-5%" y="-10%" width="110%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.025" numOctaves="1" seed="17" result="refraction"/><feGaussianBlur in="refraction" stdDeviation="2" result="smooth-refraction"/><feDisplacementMap in="SourceGraphic" in2="smooth-refraction" scale="9" xChannelSelector="R" yChannelSelector="G" result="refracted"/><feGaussianBlur in="refracted" stdDeviation="0.6" result="soft-glass"/><feColorMatrix in="soft-glass" type="saturate" values="1.22"/></filter></defs>';
  document.body.append(svg);

  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const events=new AbortController();
  const {signal}=events;
  const surfaces=[header,shell,links,tools,typebar].filter(Boolean);
  let frame=0,pointer=null,disposed=false;
  const motionAllowed=()=>!reduce.matches&&document.documentElement.dataset.motion!=='off';
  const reset=()=>{
    if(frame)cancelAnimationFrame(frame);
    frame=0;pointer=null;
    for(const surface of surfaces){surface.style.setProperty('--glass-x','50%');surface.style.setProperty('--glass-y','18%');}
  };
  const update=()=>{
    frame=0;
    if(disposed||!pointer||!motionAllowed()||document.hidden)return;
    // Read geometry before changing paint-only custom properties.
    const positions=surfaces.map(surface=>{
      const bounds=surface.getBoundingClientRect();
      const x=bounds.width?Math.max(0,Math.min(1,(pointer.x-bounds.left)/bounds.width)):.5;
      const y=bounds.height?Math.max(0,Math.min(1,(pointer.y-bounds.top)/bounds.height)):.18;
      return{surface,x,y};
    });
    for(const{surface,x,y}of positions){surface.style.setProperty('--glass-x',(x*100).toFixed(2)+'%');surface.style.setProperty('--glass-y',(y*100).toFixed(2)+'%');}
  };
  art.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||!motionAllowed())return;
    pointer={x:event.clientX,y:event.clientY};
    if(!frame)frame=requestAnimationFrame(update);
  },{signal,passive:true});
  art.addEventListener('pointerleave',reset,{signal,passive:true});
  window.addEventListener('portfolio:motionchange',reset,{signal});
  reduce.addEventListener('change',reset,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()},{signal});
  window.addEventListener('pagehide',()=>{disposed=true;events.abort();geometry.disconnect();reset()},{once:true});
  reset();
}
