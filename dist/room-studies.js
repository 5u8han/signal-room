const directory='assets/room-studies/';
const studies={
  'home-office':{room:'home-office',treatment:'illustrated',index:1,title:'Home office',description:'A working lab woven into a home office, with daylight, warm materials, and a place for electronics repair.',alt:'Illustrated home-office homelab, seen from the front, with detailed equipment racks and a central ultrawide console.'},
  basement:{room:'basement',treatment:'illustrated',index:2,title:'Basement workshop',description:'A practical electronics workshop, with utility details, a repair bench, and the equipment wall as the focus.',alt:'Illustrated basement homelab workshop with front-facing server racks, a central console, and electronics repair tools.'},
  garage:{room:'garage',treatment:'illustrated',index:3,title:'Garage lab',description:'A more utilitarian setting, with room for hardware projects, spare parts, and the work that happens around the racks.',alt:'Illustrated garage homelab with detailed front-facing networking and server racks, a central console, and workshop surroundings.'},
  'server-room':{room:'server-room',treatment:'illustrated',index:4,title:'Dedicated server room',description:'The equipment takes center stage in a dedicated room, with controlled lighting and a quieter architectural backdrop.',alt:'Illustrated dedicated home server room with detailed front-facing equipment racks, controlled lighting, and a central management console.'},
  'pixel-office':{room:'home-office',treatment:'pixel',index:5,title:'Home office / pixel art',description:'A separate pixel-art treatment of the home-office idea, for comparing the character of the whole scene.',alt:'Detailed pixel-art home-office homelab, viewed from the front, with equipment racks, status lights, and a central ultrawide console.'}
};
const image=document.querySelector('#study-image'),stage=document.querySelector('#art-stage'),title=document.querySelector('#study-title'),description=document.querySelector('#study-description'),treatmentLabel=document.querySelector('#study-treatment'),indexLabel=document.querySelector('#art-index'),status=document.querySelector('#selection-status');
const roomButtons=[...document.querySelectorAll('[data-room]')],treatmentButtons=[...document.querySelectorAll('[data-treatment]')],thumbnailButtons=[...document.querySelectorAll('[data-study]')];
const dialog=document.querySelector('#detail-dialog'),detailImage=document.querySelector('#detail-image'),detailTitle=document.querySelector('#detail-title'),pan=document.querySelector('.detail-pan');
let current='home-office';
function selectStudy(key,{announce=true}={}){
  const study=studies[key];if(!study)return;
  current=key;stage.classList.add('is-loading');image.src=directory+key+'.png';image.alt=study.alt;title.textContent=study.title;description.textContent=study.description;treatmentLabel.textContent=study.treatment==='pixel'?'PIXEL ART / HOME-OFFICE COMPARISON':'ILLUSTRATED / SHALLOW DEPTH';indexLabel.textContent=String(study.index).padStart(2,'0')+' / 05';
  roomButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.room===study.room)));
  treatmentButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.treatment===study.treatment)));
  thumbnailButtons.forEach(button=>{const active=button.dataset.study===key;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});
  if(announce)status.textContent=study.title+' selected. '+(study.treatment==='pixel'?'Pixel-art treatment.':'Illustrated treatment.');
  const url=new URL(location.href);url.searchParams.set('study',key);history.replaceState(null,'',url);
}
image.addEventListener('load',()=>stage.classList.remove('is-loading'));
image.addEventListener('error',()=>{stage.classList.remove('is-loading');status.textContent='This study image could not be loaded.';});
roomButtons.forEach(button=>button.addEventListener('click',()=>selectStudy(button.dataset.room)));
treatmentButtons.forEach(button=>button.addEventListener('click',()=>selectStudy(button.dataset.treatment==='pixel'?'pixel-office':studies[current].room)));
thumbnailButtons.forEach(button=>button.addEventListener('click',()=>selectStudy(button.dataset.study)));
document.querySelector('#enlarge-button').addEventListener('click',()=>{const study=studies[current];detailImage.src=directory+current+'.png';detailImage.alt=study.alt;detailTitle.textContent=study.title;pan.classList.toggle('is-pixel',study.treatment==='pixel');pan.scrollLeft=0;pan.scrollTop=0;dialog.showModal();document.body.classList.add('dialog-open');});
document.querySelector('#detail-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
const requested=new URL(location.href).searchParams.get('study');if(requested&&studies[requested])selectStudy(requested,{announce:false});
