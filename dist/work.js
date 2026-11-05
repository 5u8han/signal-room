const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4h11v16L12 16.5 6.5 20Z"/></svg>';
const profileResponse=await fetch('profile-data.json');
if(!profileResponse.ok)throw new Error('Work data is unavailable');
const profileData=await profileResponse.json();
const projects=profileData.cases.map(p=>({id:p.id,title:p.title.toUpperCase(),category:p.category,subtitle:p.organization+' · '+(p.period||p.kind)+(p.engagement?' · '+p.engagement:''),art:p.art,brief:p.summary,approach:p.details.slice(0,2).join(' '),result:p.details.slice(2).join(' ')}));
const grid=document.querySelector('#project-grid');
const viewer=document.querySelector('#case-viewer');
const announcement=document.querySelector('#work-announcement');
let filter='All';let sort='featured';let view='bento';let saved=new Set();let currentItems=[];let currentIndex=0;let opener=null;
try{const value=JSON.parse(localStorage.getItem('portfolio-saved')||'[]');if(Array.isArray(value))saved=new Set(value.filter(id=>projects.some(p=>p.id===id)))}catch{/* Favorites remain available for this visit. */}

function artMarkup(type){
 const label='<span class="art-label">ORIGINAL TECHNICAL ILLUSTRATION / 2026</span>';
 const portRow = '<div class="rack-ports">'+Array.from({length:12},()=>'<i></i>').join('')+'</div>';
 if(type==='chroma')return `<div class="project-art art-chroma art-network" aria-hidden="true">${label}<svg class="network-diagram" viewBox="0 0 600 400"><g fill="none" stroke="currentColor" stroke-width="2"><path d="M300 74v64M110 204v-66h380v66M300 138v66M110 254v70M300 254v70M490 254v70"/><rect x="245" y="27" width="110" height="48" rx="4"/><rect x="55" y="204" width="110" height="50" rx="4"/><rect x="245" y="204" width="110" height="50" rx="4"/><rect x="435" y="204" width="110" height="50" rx="4"/><circle cx="110" cy="340" r="16"/><circle cx="300" cy="340" r="16"/><circle cx="490" cy="340" r="16"/></g><g fill="currentColor" font-family="monospace" font-size="12" text-anchor="middle"><text x="300" y="57">pfSense</text><text x="110" y="234">VLAN / LAB</text><text x="300" y="234">AD / SERVER</text><text x="490" y="234">SIP / VOICE</text></g></svg><div class="network-wordmark">FOLLOW<br>THE SIGNAL.</div><span class="art-stamp">↗</span></div>`;
 if(type==='signal')return `<div class="project-art art-signal" aria-hidden="true">${label}<div class="endpoint-stack"><div class="device-laptop"><span>ZERO<br>TOUCH.</span></div><div class="device-base"></div><div class="identity-chip">IDENTITY → DEVICE → PEOPLE</div></div><span class="signal-caption">PROVISIONING / IDENTITY / SUPPORT</span></div>`;
 if(type==='monolith')return `<div class="project-art art-monolith art-rack" aria-hidden="true">${label}<div class="server-rack">${Array.from({length:5},(_,i)=>`<div class="rack-unit"><span>0${i+1}</span>${portRow}<b></b></div>`).join('')}</div><div class="rack-wordmark">RACK +<br>REMOTE.</div></div>`;
 if(type==='amplitude')return `<div class="project-art art-amplitude art-deploy" aria-hidden="true">${label}<div class="deployment-lines"><span>PXE</span><i>↓</i><span>OS + DRIVERS</span><i>↓</i><span>VERIFY</span><i>↓</i><span>CMDB</span></div><strong>DEPLOY.<br>VERIFY.</strong></div>`;
 if(type==='offline')return `<div class="project-art art-offline art-support" aria-hidden="true">${label}<svg class="support-diagram" viewBox="0 0 400 300" fill="none"><g stroke="currentColor" stroke-width="2"><rect x="140" y="95" width="120" height="80" rx="6"/><path d="M200 175v25m-40 0h80M70 70l70 50m120 0 70-50M80 235l65-60m110 0 65 60"/><circle cx="58" cy="58" r="25"/><circle cx="342" cy="58" r="25"/><circle cx="65" cy="248" r="25"/><circle cx="335" cy="248" r="25"/></g></svg><strong>PEOPLE.<br>THEN TECH.</strong></div>`;
 if(type==='artifact')return `<div class="project-art art-artifact" aria-hidden="true">${label}<div class="artifact-poster"><svg viewBox="0 0 180 170"><path d="M20 85h35l15-40 22 80 16-40h50" stroke-width="2"/><rect x="18" y="25" width="145" height="125" rx="3"/><path d="M35 40h35M35 48h20M35 135h110"/></svg><span>THE SYSTEMS<br>BEHIND SUPPORT.</span><i class="artifact-square"></i></div></div>`;
 return `<div class="project-art art-tidal art-board" aria-hidden="true">${label}<svg class="board-diagram" viewBox="0 0 460 340" fill="none"><g stroke="currentColor" stroke-width="2"><rect x="160" y="105" width="140" height="130" rx="3"/>${Array.from({length:8},(_,i)=>`<path d="M${173+i*16} 80v25m0 130v25M135 ${118+i*15}h25m140 0h25"/>`).join('')}<path d="M70 60h50v60h15M340 150h65v-70M215 260v35h-95M325 190h40v90M80 220h55"/><circle cx="70" cy="60" r="8"/><circle cx="405" cy="80" r="8"/><circle cx="120" cy="295" r="8"/><circle cx="365" cy="280" r="8"/></g></svg><strong>DOWN TO<br>THE BOARD.</strong></div>`;
}
function filtered(){
 const list=projects.filter(p=>filter==='All'||filter==='Saved'&&saved.has(p.id)||p.category===filter);
 if(sort!=='featured')list.sort((a,b)=>(sort==='az'?1:-1)*a.title.localeCompare(b.title));
 return list;
}
function updateSaves(){
 document.querySelector('#work-saved-count').textContent=String(saved.size).padStart(2,'0');
 document.querySelectorAll('[data-save]').forEach(button=>{const p=projects.find(p=>p.id===button.dataset.save);const selected=saved.has(p.id);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',`${selected?'Unsave':'Save'} ${p.title}`)});
 if(viewer.open){const p=currentItems[currentIndex];const selected=saved.has(p.id);const button=document.querySelector('#case-save');button.setAttribute('aria-pressed',String(selected));button.innerHTML=`${selected?'Case saved':'Save case'} <span aria-hidden="true">↗</span>`}
}
function render(){
 const focus=document.activeElement?.dataset.save;
 const oldIndex=focus?[...grid.querySelectorAll('[data-save]')].findIndex(b=>b.dataset.save===focus):-1;
 const items=filtered();grid.replaceChildren();
 items.forEach(project=>{const article=document.createElement('article');article.className='project-card';article.innerHTML=`<div class="project-visual"><button type="button" class="project-open" data-open="${project.id}" aria-label="Open ${project.title} case study">${artMarkup(project.art)}</button><button type="button" class="project-bookmark" data-save="${project.id}" aria-pressed="false" aria-label="Save ${project.title}">${bookmark}</button></div><div class="project-caption"><div><h2>${project.title}</h2><p>${project.category.toUpperCase()} / ${project.id==='board-repair'?'PERSONAL PRACTICE':'EXPERIENCE'} · ${project.subtitle}</p></div><span aria-hidden="true">↗</span></div>`;grid.append(article)});
 document.querySelector('#work-result-count').textContent=`${items.length} ${items.length===1?'case':'cases'} / ${filter==='All'?'systems, signals & support':filter.toLowerCase()+' selection'}`;
 document.querySelector('#work-empty').hidden=items.length!==0;
 document.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)));
 updateSaves();
 if(focus&&!viewer.open){const buttons=[...grid.querySelectorAll('[data-save]')];(buttons.find(b=>b.dataset.save===focus)||buttons[Math.min(oldIndex,buttons.length-1)]||document.querySelector('[data-filter="Saved"]')).focus({preventScroll:true})}
}
function save(id){
 const had=saved.has(id);had?saved.delete(id):saved.add(id);
 let persisted=true;try{localStorage.setItem('portfolio-saved',JSON.stringify([...saved]))}catch{persisted=false}
 const message=`${projects.find(p=>p.id===id).title} ${had?'removed from saved':'saved'}${persisted?'':' for this visit'}.`;
 (viewer.open?document.querySelector('#case-announcement'):announcement).textContent=message;
 if(filter==='Saved')render();else updateSaves();
}
function showCase(){
 const p=currentItems[currentIndex];
 document.querySelector('#case-title').textContent=p.title;
 document.querySelector('#case-category').textContent=`${p.category.toUpperCase()} / ${p.id==='board-repair'?'PERSONAL PRACTICE':'RÉSUMÉ EXPERIENCE'}`;
 document.querySelector('#case-position').textContent=`CASE ${String(currentIndex+1).padStart(2,'0')} / ${String(currentItems.length).padStart(2,'0')}`;
 document.querySelector('#case-art').innerHTML=artMarkup(p.art);
 for(const key of ['brief','approach','result'])document.querySelector('#case-'+key).textContent=p[key];
 document.querySelector('#case-prev').disabled=currentItems.length<2;document.querySelector('#case-next').disabled=currentItems.length<2;
 updateSaves();
}
function openCase(id,button){currentItems=filtered();currentIndex=currentItems.findIndex(p=>p.id===id);if(currentIndex<0)return;opener=button;showCase();viewer.showModal();updateSaves();document.querySelector('#case-close').focus()}
function stepCase(direction){currentIndex=(currentIndex+direction+currentItems.length)%currentItems.length;showCase();document.querySelector('#case-announcement').textContent=`${currentItems[currentIndex].title}, ${currentIndex+1} of ${currentItems.length}.`}
grid.addEventListener('click',event=>{const saveButton=event.target.closest('[data-save]');if(saveButton){save(saveButton.dataset.save);return}const openButton=event.target.closest('[data-open]');if(openButton)openCase(openButton.dataset.open,openButton)});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;render()}));
document.querySelector('#show-all-studies').addEventListener('click',()=>{filter='All';render();document.querySelector('[data-filter="All"]').focus()});
document.querySelector('#work-sort').addEventListener('change',event=>{sort=event.target.value;render()});
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;grid.classList.toggle('is-list',view==='list');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
document.querySelector('#case-close').addEventListener('click',()=>viewer.close());
document.querySelector('#case-prev').addEventListener('click',()=>stepCase(-1));document.querySelector('#case-next').addEventListener('click',()=>stepCase(1));
document.querySelector('#case-save').addEventListener('click',()=>save(currentItems[currentIndex].id));
viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close()}});
viewer.addEventListener('close',()=>{const fallback=document.querySelector(`[data-open="${currentItems[currentIndex]?.id}"]`);(opener?.isConnected?opener:fallback||document.querySelector('[data-filter="All"]')).focus({preventScroll:true})});
viewer.addEventListener('keydown',event=>{if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement)return;if(event.key==='ArrowRight'){event.preventDefault();stepCase(1)}if(event.key==='ArrowLeft'){event.preventDefault();stepCase(-1)}});
document.querySelector('#design-comparison').addEventListener('input',event=>{const value=event.target.value;document.querySelector('#compare-stage').style.setProperty('--comparison',value+'%');event.target.setAttribute('aria-valuetext',value+' percent of layout B')});
window.addEventListener('storage',event=>{if(event.key!=='portfolio-saved')return;try{const next=JSON.parse(event.newValue||'[]');if(Array.isArray(next)){saved=new Set(next.filter(id=>projects.some(p=>p.id===id)));render()}}catch{/* Retain valid local state. */}});
render();
const parameters=new URLSearchParams(location.search);
const initial=parameters.get('case') || parameters.get('project');
if(projects.some(p=>p.id===initial))openCase(initial,document.querySelector(`[data-open="${initial}"]`));
