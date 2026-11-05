import {createStudy,canvasSurface,clamp,lerp,downloadCanvas} from './core.js';
const study=createStudy({id:4,title:'Infinite Architecture',category:'Depth / Scale',accent:'#ffe3bc',background:'#ec4027',foreground:'#fff7e7'});
const host=document.querySelector('#architecture-scene'),fallback=document.querySelector('#architecture-fallback'),surface=canvasSurface(fallback,{maxDpr:1.5}),track=document.querySelector('#architecture-track');
let renderer=null,scene=null,camera=null,THREE=null,groups=[],resources=[],dead=false,phase=0,progress=0,travel=0,drift=.35,pointer={x:0,y:0},look={x:0,y:0},visible=true;
function fallbackDraw(){const {ctx,width:w,height:h}=surface;if(!w||!h)return;ctx.fillStyle='#ec4027';ctx.fillRect(0,0,w,h);const cx=w*.61+look.x*50,cy=h*.5+look.y*30;for(let i=36;i>=0;i--){const n=((i+travel*30)%37)/37;const scale=.03+n*n*2.6;const rw=w*.6*scale,rh=h*1.2*scale;const turn=Math.sin(i*.23+phase*.08)*drift*.5;ctx.save();ctx.translate(cx,cy);ctx.rotate(turn);ctx.strokeStyle=`rgba(255,247,229,${.2+n*.8})`;ctx.lineWidth=Math.max(1,13*scale);ctx.strokeRect(-rw*.5,-rh*.5,rw,rh);ctx.restore()}}
function render(force=false){
 if(renderer&&camera&&(visible||force)){camera.position.set(look.x*1.4,-look.y*.8,6-travel*83);camera.lookAt(look.x*.3,0,camera.position.z-32);groups.forEach((g,i)=>{g.rotation.z=Math.sin(i*.19+phase*.08)*drift*.62;g.position.x=Math.sin(i*.27)*drift*.5});renderer.render(scene,camera)}else if(!renderer)fallbackDraw();
 document.querySelector('#architecture-distance').textContent=`PASSAGE / ${String(Math.round(travel*83)).padStart(3,'0')} METRES`;
}
function resize(){surface.resize();measure();if(renderer){renderer.setSize(host.clientWidth,host.clientHeight,false);camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix()}render()}
async function prepare(){
 try{
  THREE=await import('../vendor/three.module.js');if(dead)return;
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0xec4027,1);renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','A real three-dimensional white corridor twisting through a vermilion world. Scroll to travel through the architecture.');
  scene=new THREE.Scene();scene.background=new THREE.Color(0xec4027);scene.fog=new THREE.Fog(0xec4027,18,132);
  camera=new THREE.PerspectiveCamera(49,1,.1,180);camera.position.set(0,0,6);
  const white=new THREE.MeshStandardMaterial({color:0xfff3d9,roughness:.75,metalness:.05}),red=new THREE.MeshStandardMaterial({color:0xc73120,roughness:.9});
  const vertical=new THREE.BoxGeometry(.26,8.4,.34),horizontal=new THREE.BoxGeometry(6.6,.26,.34),floorGeo=new THREE.PlaneGeometry(160,180);resources=[white,red,vertical,horizontal,floorGeo];
  for(let i=0;i<36;i++){const group=new THREE.Group();group.position.z=-i*4.2;for(const x of[-3.2,3.2]){const bar=new THREE.Mesh(vertical,white);bar.position.x=x;group.add(bar)}for(const y of[-4.1,4.1]){const bar=new THREE.Mesh(horizontal,white);bar.position.y=y;group.add(bar)}groups.push(group);scene.add(group)}
  const floor=new THREE.Mesh(floorGeo,red);floor.rotation.x=-Math.PI/2;floor.position.set(0,-4.27,-70);scene.add(floor);
  scene.add(new THREE.HemisphereLight(0xfff8e0,0x831711,3.7));const key=new THREE.DirectionalLight(0xffffff,5);key.position.set(6,9,8);scene.add(key);const fill=new THREE.PointLight(0xffc49a,80,80,1.3);fill.position.set(-2,2,-30);scene.add(fill);
  if(dead){renderer.dispose();return}host.append(renderer.domElement);fallback.hidden=true;document.querySelector('#architecture-engine').textContent='THREE.JS / LIVE PROJECTION';resize();
 }catch(error){renderer?.dispose();renderer=null;document.querySelector('#architecture-engine').textContent='CANVAS / PROJECTION FALLBACK';fallback.hidden=false;fallbackDraw()}
}
study.onFrame(({dt=0})=>{if(study.running()&&visible){phase+=dt;travel=lerp(travel,progress,.065);look.x=lerp(look.x,pointer.x,.055);look.y=lerp(look.y,pointer.y,.055)}render()});
function measure(){const r=track.getBoundingClientRect();progress=clamp((72-r.top)/Math.max(1,track.offsetHeight-innerHeight),0,1)}
const scroll=()=>{if(study.running()){measure();study.invalidate()}};
const move=e=>{if(!study.running())return;const r=host.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5}};
window.addEventListener('scroll',scroll,{passive:true});host.addEventListener('pointermove',move);
study.onMotion(enabled=>{if(enabled)scroll()});
document.querySelector('#architecture-drift').addEventListener('input',e=>{drift=+e.target.value/100;document.querySelector('#architecture-value').textContent=e.target.value+'%';study.invalidate()});
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)study.invalidate()},{threshold:.01});observer.observe(host);
study.onResize(resize);study.setReset(()=>{window.scrollTo({top:0,behavior:'instant'});phase=0;measure();travel=progress;drift=.35;pointer=look={x:0,y:0};document.querySelector('#architecture-drift').value=35;document.querySelector('#architecture-value').textContent='35%';render(true)});
study.setExport(()=>{render(true);downloadCanvas(renderer?.domElement||fallback,'infinite-architecture.png')});study.cleanup(()=>{dead=true;observer.disconnect();surface.dispose();window.removeEventListener('scroll',scroll);host.removeEventListener('pointermove',move);for(const resource of resources)resource.dispose();renderer?.dispose();renderer?.domElement.remove()});fallbackDraw();prepare();
