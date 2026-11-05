import {createStudy,clamp,lerp,downloadSVG} from './core.js';
const study=createStudy({id:3,title:'Depth Charge',category:'Depth / Scale',accent:'#effd31',background:'#2524ed',foreground:'#effd31'});
const NS='http://www.w3.org/2000/svg',svg=document.querySelector('#depth-art'),planes=document.querySelector('#depth-planes'),track=document.querySelector('#depth-track'),rail=document.querySelector('.depth-side i'),marker=document.querySelector('#depth-progress');
const rectangles=[];
for(let i=0;i<22;i++){const group=document.createElementNS(NS,'g'),rect=document.createElementNS(NS,'rect');rect.setAttribute('fill','none');rect.setAttribute('stroke',i%5===0?'#f7926c':'#effd31');rect.setAttribute('stroke-width',i%5===0?'11':'3');group.append(rect);planes.append(group);rectangles.push({group,rect})}
let progress=0,position=0,phase=0,twist=18,pointer={x:0,y:0},look={x:0,y:0},lastChapter=-1,visible=true,markerStart=0,markerTravel=0;
function measure(){const r=track.getBoundingClientRect();progress=clamp((72-r.top)/Math.max(1,track.offsetHeight-innerHeight),0,1);markerStart=rail.offsetTop-marker.offsetHeight/2;markerTravel=rail.offsetHeight}
function draw(){
 const w=1400,h=900,cx=w*.62+look.x*70,cy=h*.47+look.y*60;
 rectangles.forEach(({group,rect},i)=>{const offset=((i/22-position*.52)%1+1)%1,z=.12+offset*1.13,s=z*z*2.6,size=200+s*560;const angle=twist*offset+Math.sin(offset*6+phase*.12)*4;const x=cx+Math.sin(offset*6+position*2)*38,y=cy+Math.cos(offset*5)*28;rect.setAttribute('x',(x-size*.5).toFixed(2));rect.setAttribute('y',(y-size*.5).toFixed(2));rect.setAttribute('width',size.toFixed(2));rect.setAttribute('height',(size*.8).toFixed(2));group.setAttribute('transform',`rotate(${angle.toFixed(2)} ${x} ${y})`);group.setAttribute('opacity',String(.18+.82*offset))});
 marker.style.top=`${markerStart+position*markerTravel}px`;
 const chapter=position<.32?0:position<.68?1:2;if(chapter!==lastChapter){lastChapter=chapter;document.querySelector('#depth-chapter').textContent=['01 — DISTANCE','02 — APPROACH','03 — PRESENCE'][chapter];document.querySelector('#depth-copy').innerHTML=['Distance is a relationship.<br>Scroll to change yours.','What was far away<br>is moving into your space.','You are no longer outside.<br>You are part of the composition.'][chapter]}
}
study.onFrame(({dt=0})=>{if(!visible&&dt>0)return;if(study.running()){phase+=dt;position=lerp(position,progress,.07);look.x=lerp(look.x,pointer.x,.05);look.y=lerp(look.y,pointer.y,.05)}draw()});
const scroll=()=>{if(study.running()){measure();study.invalidate()}};
const move=e=>{if(!study.running())return;const r=svg.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}};
window.addEventListener('scroll',scroll,{passive:true});svg.addEventListener('pointermove',move);
study.onMotion(enabled=>{if(enabled)scroll()});
document.querySelector('#depth-twist').addEventListener('input',e=>{twist=+e.target.value;document.querySelector('#depth-value').textContent=twist+'°';study.invalidate()});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)study.invalidate()},{threshold:.01});observer.observe(svg);
study.onResize(()=>{measure();draw()});study.setReset(()=>{window.scrollTo({top:0,behavior:'instant'});measure();position=progress;phase=0;twist=18;pointer=look={x:0,y:0};document.querySelector('#depth-twist').value=18;document.querySelector('#depth-value').textContent='18°';draw()});study.setExport(()=>downloadSVG(svg,'depth-charge.svg'));study.cleanup(()=>{observer.disconnect();svg.removeEventListener('pointermove',move);window.removeEventListener('scroll',scroll)});draw();
