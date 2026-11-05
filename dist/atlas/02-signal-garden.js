import {createStudy,canvasSurface,seededRandom,clamp,lerp,downloadCanvas} from './core.js';
const study=createStudy({id:2,title:'Signal Garden',category:'Depth / Scale',accent:'#6d873a',background:'#eeeee0',foreground:'#223b22'});
const canvas=document.querySelector('#garden-canvas'),surface=canvasSurface(canvas,{maxDpr:1.5}),track=document.querySelector('#garden-track');
const random=seededRandom(2048),seeds=Array.from({length:240},()=>({j:random(),k:random()}));
let count=120,growth=1,growing=false,phase=0,progress=0,scale=0,pointer={x:0,y:0},look={x:0,y:0},visible=true;
const golden=Math.PI*(3-Math.sqrt(5));
function petal(ctx,x,y,length,width,angle,fill){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-width*.75,-length*.35,-width,-length*.75,0,-length);ctx.bezierCurveTo(width,-length*.75,width*.75,-length*.35,0,0);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#24402036';ctx.lineWidth=.55;ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(width*.12,-length*.5,0,-length*.94);ctx.stroke();ctx.restore()}
function draw(){
 const {ctx,width:w,height:h}=surface;if(!w||!h)return;ctx.globalAlpha=1;ctx.fillStyle='#eeeee0';ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#a3ad812b';ctx.lineWidth=1;for(let x=30;x<w;x+=52){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=30;y<h;y+=52){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 const mag=1+scale*1.2,cx=w*(w<650?.62:.62)+look.x*15,cy=h*(w<650?.50:.53)+look.y*15;
 const radius=Math.min(w*.37,h*.49)*mag,open=.2+.8*Math.sin(clamp(growth,0,1)*Math.PI/2),turn=phase*.018;
 ctx.save();ctx.translate(cx,cy);ctx.rotate(-.18);ctx.fillStyle='#cdd2b3';ctx.beginPath();ctx.ellipse(0,25,radius*1.01,radius*.94,0,0,Math.PI*2);ctx.fill();
 const colors=['#879b4a','#a9b95c','#b8c86c','#6f8b43','#ced78e','#a1b64f'];
 for(let i=count-1;i>=0;i--){const f=(i+1)/count,s=seeds[i],a=i*golden+turn,r=Math.sqrt(f)*radius*.62*open;const x=Math.cos(a)*r,y=Math.sin(a)*r;const len=(radius*.29+f*radius*.25)*(open+.04*Math.sin(phase*.45+i*.1));const width=(radius*.09+f*radius*.05)*(1+s.j*.25);petal(ctx,x,y,len,width,a+Math.PI/2+s.k*.12,colors[i%colors.length])}
 for(let i=0;i<100;i++){const a=i*golden,r=Math.sqrt(i/100)*radius*.12;ctx.fillStyle=i%3?'#314d2c':'#e6e7b5';ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,Math.max(1,radius*.009),0,Math.PI*2);ctx.fill()}
 ctx.restore();document.querySelector('#garden-scale').textContent=`MAGNIFICATION / ×${mag.toFixed(2)}`;
}
study.onFrame(({dt=0})=>{if(!visible&&dt>0)return;if(study.running()){phase+=dt;scale=lerp(scale,progress,.06);look.x=lerp(look.x,pointer.x,.04);look.y=lerp(look.y,pointer.y,.04);if(growing){growth=Math.min(1,growth+dt*.46);if(growth===1)growing=false}}draw()});
function measure(){const r=track.getBoundingClientRect();progress=clamp((72-r.top)/Math.max(1,track.offsetHeight-innerHeight),0,1)}
const scroll=()=>{if(study.running()){measure();study.invalidate()}};
const move=e=>{const r=canvas.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}};
window.addEventListener('scroll',scroll,{passive:true});canvas.addEventListener('pointermove',move);
study.onMotion(enabled=>{if(enabled)scroll()});
document.querySelector('#garden-grow').addEventListener('click',()=>{growth=study.running()?.02:1;growing=study.running();study.invalidate()});
document.querySelector('#garden-petals').addEventListener('input',e=>{count=+e.target.value;document.querySelector('#garden-count').textContent=count;study.invalidate()});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)study.invalidate()},{threshold:.01});observer.observe(canvas);
study.onResize(()=>{surface.resize();measure();draw()});study.setReset(()=>{window.scrollTo({top:0,behavior:'instant'});count=120;growth=1;growing=false;phase=0;measure();scale=progress;pointer=look={x:0,y:0};document.querySelector('#garden-petals').value=120;document.querySelector('#garden-count').textContent=120;draw()});study.setExport(()=>downloadCanvas(canvas,'signal-garden.png'));study.cleanup(()=>{observer.disconnect();surface.dispose();canvas.removeEventListener('pointermove',move);window.removeEventListener('scroll',scroll)});draw();
