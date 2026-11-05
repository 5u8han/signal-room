import {createStudy,canvasSurface,seededRandom,clamp,lerp,downloadCanvas} from './core.js';
const study=createStudy({id:1,title:'Event Horizon',category:'Depth / Scale',accent:'#ffc66a',background:'#080605',foreground:'#fff3d5'});
const canvas=document.querySelector('#horizon-canvas'),surface=canvasSurface(canvas,{maxDpr:1.5}),track=document.querySelector('#horizon-track');
const random=seededRandom(1001);
const stars=Array.from({length:540},()=>({x:random(),y:random(),r:.3+random()*1.2,a:.15+random()*.6}));
const dust=Array.from({length:1600},()=>({angle:random()*Math.PI*2,r:.76+Math.pow(random(),.6)*.75,spread:(random()-.5)*.12,size:.35+random()*1.4,warm:random()}));
let phase=0,progress=0,travel=0,strength=1,pointer={x:0,y:0},look={x:0,y:0},visible=true;
function measure(){const r=track.getBoundingClientRect();progress=clamp((72-r.top)/Math.max(1,track.offsetHeight-innerHeight),0,1)}
function scroll(){if(study.running()){measure();study.invalidate()}}
function draw(){
 const {ctx,width:w,height:h}=surface;if(!w||!h)return;
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#080605';ctx.fillRect(0,0,w,h);
 const zoom=1+travel*2.9,cx=w*(w<650?.58:.61)+look.x*25,cy=h*.53+look.y*18,R=Math.min(w,h)*.30*zoom;
 for(const s of stars){const x=(s.x*w-cx)*Math.sqrt(zoom)+cx,y=(s.y*h-cy)*Math.sqrt(zoom)+cy;ctx.fillStyle=`rgba(243,223,182,${s.a})`;ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fill()}
 const ambient=ctx.createRadialGradient(cx,cy,R*.1,cx,cy,R*2);ambient.addColorStop(0,'#bd5d1320');ambient.addColorStop(.45,'#8a421a13');ambient.addColorStop(1,'#0000');ctx.fillStyle=ambient;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.22+look.x*.025);ctx.scale(1,.37+look.y*.02);
 const halo=ctx.createRadialGradient(0,0,R*.40,0,0,R*1.58);halo.addColorStop(0,'#0000');halo.addColorStop(.38,'#9d57131a');halo.addColorStop(.50,'#ffc2597a');halo.addColorStop(.53,'#fff1becc');halo.addColorStop(.57,'#ffb63c60');halo.addColorStop(.75,'#91471016');halo.addColorStop(1,'#0000');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,R*1.58,0,Math.PI*2);ctx.fill();
 ctx.globalCompositeOperation='lighter';
 for(const p of dust){const a=p.angle+phase*(.16+strength*.12)/(p.r*p.r),r=R*p.r;const x=Math.cos(a)*r,y=Math.sin(a)*r+Math.sin(a*3+phase*.25)*R*p.spread;const opacity=.23+.5*(1-Math.abs(p.r-1));ctx.fillStyle=p.warm>.7?`rgba(255,240,185,${opacity})`:`rgba(246,154,60,${opacity*.8})`;ctx.beginPath();ctx.ellipse(x,y,p.size*(1+travel),p.size*.7,0,0,Math.PI*2);ctx.fill()}
 ctx.globalCompositeOperation='source-over';ctx.fillStyle='#030303';ctx.beginPath();ctx.ellipse(0,0,R*.52,R*.74,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#ffdb9fa6';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,R*.54,R*.78,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 const lens=ctx.createRadialGradient(cx,cy,R*.13,cx,cy,R*.37);lens.addColorStop(0,'#010101');lens.addColorStop(.85,'#010101');lens.addColorStop(.96,'#59320f');lens.addColorStop(1,'#e9b75d00');ctx.fillStyle=lens;ctx.beginPath();ctx.arc(cx,cy,R*.37,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.22);ctx.scale(1,.37);ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffe5a8af';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,R*.87,R*.87,0,0,Math.PI);ctx.stroke();ctx.restore();
 document.querySelector('#horizon-depth').textContent=`DISTANCE / ${(100-travel*97).toFixed(1)} AU`;
}
study.onFrame(({dt=0})=>{if(!visible&&dt>0)return;if(study.running()){phase+=dt;travel=lerp(travel,progress,.085);look.x=lerp(look.x,pointer.x,.06);look.y=lerp(look.y,pointer.y,.06)}draw()});
const move=e=>{const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};if(study.running())study.invalidate()};canvas.addEventListener('pointermove',move);window.addEventListener('scroll',scroll,{passive:true});
study.onMotion(enabled=>{if(enabled)scroll()});
document.querySelector('#horizon-gravity').addEventListener('input',e=>{strength=+e.target.value;document.querySelector('#horizon-value').textContent=strength.toFixed(1);study.invalidate()});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)study.invalidate()},{threshold:.01});observer.observe(canvas);
study.onResize(()=>{surface.resize();measure();draw()});study.setReset(()=>{window.scrollTo({top:0,behavior:'instant'});phase=0;strength=1;measure();travel=progress;pointer=look={x:0,y:0};document.querySelector('#horizon-gravity').value='1';document.querySelector('#horizon-value').textContent='1.0';draw()});study.setExport(()=>downloadCanvas(canvas,'event-horizon.png'));study.cleanup(()=>{observer.disconnect();surface.dispose();canvas.removeEventListener('pointermove',move);window.removeEventListener('scroll',scroll)});draw();
