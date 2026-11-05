import {createStudy,canvasSurface,seededRandom,clamp,downloadCanvas} from './core.js';
const study=createStudy({id:5,title:'Chromatic Current',category:'Depth / Scale',accent:'#ff987b',background:'#041c22',foreground:'#e3f8ee'});
const canvas=document.querySelector('#current-canvas'),surface=canvasSurface(canvas,{maxDpr:1.5});
let seed=5,count=900,direction=1,phase=0,particles=[],pointer={x:-1000,y:-1000,active:false},initialized=false,visible=true;
const colors=['#54d9d8','#91f4df','#f9896e','#ffd0ac','#2e8c99'];
function initialise(){const random=seededRandom(seed);const {width:w,height:h}=surface;const amount=Math.min(count,1500);particles=Array.from({length:amount},(_,i)=>{const a=random()*Math.PI*2,r=Math.pow(random(),.45)*Math.min(w,h)*.52;return{x:w*.59+Math.cos(a)*r,y:h*.48+Math.sin(a)*r,age:random()*220,maxAge:120+random()*180,color:colors[i%colors.length],width:.45+random()*.9}});surface.ctx.fillStyle='#041c22';surface.ctx.fillRect(0,0,w,h);initialized=true;prime()}
function advance(steps=1,fade=true){
 const {ctx,width:w,height:h}=surface;if(!w||!h)return;
 if(fade){ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(4,28,34,.085)';ctx.fillRect(0,0,w,h)}
 ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.48;
 for(let step=0;step<steps;step++)for(const p of particles){const nx=p.x/w,ny=p.y/h;const dx=(nx-.59)*1.45,dy=ny-.48;let angle=Math.atan2(dy,dx)+Math.PI*.5+Math.sin(nx*7+phase*.12)*.48+Math.cos(ny*9-phase*.08)*.32;
   if(pointer.active){const px=p.x-pointer.x,py=p.y-pointer.y,d=Math.sqrt(px*px+py*py);if(d<180)angle+=Math.atan2(py,px)*(.8-d/225)}
   const oldX=p.x,oldY=p.y,speed=(.8+Math.sin(p.age*.03)*.45)*direction;p.x+=Math.cos(angle)*speed;p.y+=Math.sin(angle)*speed;p.age++;
   if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20||p.age>p.maxAge){const a=(p.maxAge+p.x)*.033,r=Math.min(w,h)*(.18+(p.maxAge%100)/180);p.x=w*.59+Math.cos(a)*r;p.y=h*.48+Math.sin(a)*r;p.age=0;continue}
   ctx.strokeStyle=p.color;ctx.lineWidth=p.width;ctx.beginPath();ctx.moveTo(oldX,oldY);ctx.lineTo(p.x,p.y);ctx.stroke();
 }
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function prime(){advance(44,false);const {ctx,width:w,height:h}=surface;const vignette=ctx.createRadialGradient(w*.59,h*.48,Math.min(w,h)*.2,w*.59,h*.48,Math.max(w,h)*.73);vignette.addColorStop(0,'#041c2200');vignette.addColorStop(1,'#041c2299');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h)}
study.onFrame(({dt=0})=>{if(!initialized){initialise();return}if(study.running()&&visible&&dt>0){phase+=dt;advance(Math.max(1,Math.round(dt*60)),true)}});
const move=e=>{if(!study.running())return;const r=canvas.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top,active:true}};
const leave=()=>{pointer.active=false};canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);
document.querySelector('#current-density').addEventListener('input',e=>{count=+e.target.value;document.querySelector('#current-count').textContent=count;initialise();study.invalidate()});
document.querySelector('#current-reverse').addEventListener('click',e=>{direction*=-1;e.currentTarget.setAttribute('aria-pressed',String(direction<0));if(!study.running())advance(25,false);study.invalidate()});
document.querySelector('#current-reseed').addEventListener('click',()=>{seed++;document.querySelector('#current-state').textContent=`ORIGINAL SEED / ${String(seed).padStart(3,'0')}`;initialise();study.invalidate()});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{threshold:.01});observer.observe(canvas);
study.onResize(()=>{surface.resize();initialise()});study.setReset(()=>{seed=5;count=900;direction=1;phase=0;pointer.active=false;document.querySelector('#current-density').value=900;document.querySelector('#current-count').textContent=900;document.querySelector('#current-reverse').setAttribute('aria-pressed','false');document.querySelector('#current-state').textContent='ORIGINAL SEED / 005';initialise()});study.setExport(()=>downloadCanvas(canvas,'chromatic-current.png'));study.cleanup(()=>{observer.disconnect();surface.dispose();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave)});
