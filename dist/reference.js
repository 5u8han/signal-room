let inventory=null;
const statusLabels={runtime:'REAL RUNTIME',adapted:'DESIGN ADAPTATION',sample:'TOKEN SAMPLE',reference:'REFERENCE',input:'NEEDS INPUT'};
const list=document.querySelector('#inventory-list');
const query=document.querySelector('#inventory-search');
const kind=document.querySelector('#inventory-kind');
const filterStatus=document.querySelector('#inventory-status');
let visibleLimit=20;
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function selectedEntries(){
  if(!inventory)return[];
  const term=query.value.trim().toLowerCase();
  return inventory.entries.filter(entry=>(kind.value==='all'||entry.kind===kind.value)&&(filterStatus.value==='all'||entry.status===filterStatus.value)&&(!term||[entry.name,entry.group,entry.use,entry.description||'',...(entry.pages||[])].join(' ').toLowerCase().includes(term)));
}
function renderInventory(){
  const entries=selectedEntries();
  list.replaceChildren();
  for(const entry of entries.slice(0,visibleLimit)){
    const item=element('details','inventory-entry');
    const summary=element('summary');
    const names=element('div');names.append(element('span','entry-name',entry.name),element('span','entry-group',entry.group));
    const tag=element('span','entry-tag '+entry.status,statusLabels[entry.status]||entry.status);
    const plus=element('span','entry-expand','+');plus.setAttribute('aria-hidden','true');
    summary.append(names,tag,plus);item.append(summary);
    const body=element('div','entry-body');body.append(element('p','entry-pages','WHERE: '+(entry.pages||['About']).join(' / ').toUpperCase()),element('p','',entry.use));
    if(entry.gap)body.append(element('p','entry-gap',entry.gap));
    if(entry.url){const link=element('a','','Official source ↗');link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';body.append(link)}
    if(entry.paths?.length)body.append(element('p','entry-paths','Retained paths: '+entry.paths.join(' · ')));
    item.append(body);list.append(item);
  }
  document.querySelector('#inventory-count').textContent=`${entries.length} matching ${entries.length===1?'entry':'entries'} · showing ${Math.min(visibleLimit,entries.length)}`;
  document.querySelector('#inventory-empty').hidden=entries.length!==0;
  document.querySelector('#inventory-more').hidden=visibleLimit>=entries.length;
}
for(const input of[query,kind,filterStatus])input.addEventListener(input===query?'input':'change',()=>{visibleLimit=20;renderInventory()});
document.querySelector('#inventory-more').addEventListener('click',()=>{visibleLimit+=30;renderInventory()});
document.querySelector('#inventory-reset').addEventListener('click',()=>{query.value='';kind.value='all';filterStatus.value='all';visibleLimit=20;renderInventory();query.focus()});

const styleSelect=document.querySelector('#atlas-style');
let styleIndex=0;
function safeColor(color,fallback){return typeof color==='string'&&/^#[0-9a-f]{3,8}$/i.test(color)?color:fallback}
function showStyle(index){
  if(!inventory?.style_samples.length)return;
  const styles=inventory.style_samples;
  styleIndex=(index+styles.length)%styles.length;
  const style=styles[styleIndex];styleSelect.value=style.id;
  const preview=document.querySelector('#atlas-preview');
  for(const[key,source,fallback]of[['primary','primary','#dfff00'],['secondary','secondary','#c1c7ff'],['bg','surface','#f2f1e8'],['fg','text','#080908']])preview.style.setProperty('--sample-'+key,safeColor(style.colors[source],fallback));
  const radius=style.rounded.md||style.rounded.sm||'0px';
  preview.style.setProperty('--sample-radius',/^[\d.]+(?:px|rem|em)$/.test(String(radius))?radius:'0px');
  document.querySelector('#sample-style').textContent=String(style.name).toUpperCase();
  document.querySelector('#atlas-description').textContent=style.description;
  document.querySelector('#atlas-position').textContent=`${styleIndex+1} / ${styles.length}`;
  const swatches=document.querySelector('#atlas-swatches');swatches.replaceChildren();
  for(const key of['primary','secondary','surface','text']){
    const color=safeColor(style.colors[key],'#080908');
    const dot=element('span');dot.style.background=color;dot.setAttribute('role','img');dot.setAttribute('aria-label',`${key}: ${color}`);swatches.append(dot);
  }
  const font=style.typography['body-md']?.fontFamily||'Unspecified';
  document.querySelector('#atlas-font-note').textContent=`Source body-font recommendation: ${font}. The preview uses the local site font so no external font service is contacted. This is a palette/radius excerpt; contrast and complete component behavior need their own composition review.`;
}
styleSelect.addEventListener('change',()=>showStyle(inventory.style_samples.findIndex(style=>style.id===styleSelect.value)));
document.querySelector('#atlas-prev').addEventListener('click',()=>showStyle(styleIndex-1));
document.querySelector('#atlas-next').addEventListener('click',()=>showStyle(styleIndex+1));

fetch('inventory.json').then(response=>{if(!response.ok)throw new Error('Inventory unavailable');return response.json()}).then(data=>{
  inventory=data;
  const stats=document.querySelector('#inventory-stats');stats.replaceChildren(element('span','',`${data.raw_skill_file_count} retained skill files`),element('span','',`${data.unique_guide_entries} deduplicated guides`),element('span','',`${data.source_entries} source families`),element('span','',`${data.style_samples.length} token samples`));
  styleSelect.replaceChildren();
  for(const style of data.style_samples){const option=element('option','',style.name);option.value=style.id;styleSelect.append(option)}
  const bento=data.style_samples.findIndex(style=>style.id==='bento');
  showStyle(bento<0?0:bento);renderInventory();
}).catch(()=>{
  document.querySelector('#inventory-count').textContent='The inventory could not load. Refresh this local page to try again.';
  document.querySelector('#atlas-description').textContent='The style specifications could not load. Refresh to try again.';
  styleSelect.disabled=true;
  document.querySelector('#atlas-prev').disabled=true;document.querySelector('#atlas-next').disabled=true;
});

