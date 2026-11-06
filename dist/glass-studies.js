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

  // Cover the actual field, including the min-height on short viewports.
  // A fitted/narrower plane leaves a strip above the room on taller displays.
  const world=art.querySelector('#room-world'),popout=hero.querySelector('#room-popout');
  let lastCoverWidth=0;
  const alignPopout=()=>{
    if(!world||!popout)return;
    if(art.dataset.detail!=='true'){
      const field=art.getBoundingClientRect();
      const coverWidth=Math.ceil(Math.max(field.width,field.height*1672/941));
      if(Math.abs(coverWidth-lastCoverWidth)>.5){lastCoverWidth=coverWidth;art.style.setProperty('--glass-room-width',coverWidth+'px');}
    }
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

  const phone=matchMedia('(max-width:760px)'),hint=art.querySelector('.room-hint');
  const updateHint=()=>{if(hint){hint.firstElementChild.textContent=phone.matches?'↔':'↖';hint.lastChild.textContent=phone.matches?' Swipe to explore. Touch a machine.':' Touch a machine. There’s a story behind every light.';}};
  phone.addEventListener('change',updateHint);updateHint();
  window.addEventListener('pagehide',()=>{geometry.disconnect();phone.removeEventListener('change',updateHint)},{once:true});
}
