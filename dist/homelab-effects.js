/**
 * Transparent, code-native activity laid over the illustrated room.
 * The caller owns the animation loop and the live page. The renderer keeps
 * small reusable canvas buffers for light sprites and display contents.
 *
 * createHomelabEffects({width, height, layout})
 *   .draw(ctx, modelState, timeSeconds, dtSeconds, {x, y, active?})
 *   .setLayout(layout) / .setOptions({dataFlow, cables, motes, palette})
 *   .hitTest(normalizedX, normalizedY) / .tap(normalizedX, normalizedY)
 *
 * Layout coordinates are normalized to the whole artwork. A device is a rect
 * {x,y,w,h,kind,rows?,cols?,label?,driveArea?,portsArea?,statusPoint?}.
 * driveArea/portsArea are also GLOBAL normalized rects, statusPoint a global
 * normalized point. console/workstationScreen are INNER SCREEN rects, with
 * optional quad:[TL,TR,BR,BL] and occlusions:[polygon] in artwork coordinates.
 * Optional nodes:{id:{x,y}} and links:[{from,to,points?,color?}] replace routes.
 * Optional rear:{devices,console,nodes,links} aligns the reverse illustration.
 * Front/rear rects are deliberately authored separately, never inferred from a
 * photograph. Caller can switch every overlay off without affecting the room.
 */

const TAU=Math.PI*2;
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,Number(value)||0));
const mix=(a,b,t)=>a+(b-a)*t;
const frac=n=>n-Math.floor(n);
const C={green:'#7cffb3',greenDim:'#214b3e',cyan:'#6de5e6',blue:'#67bfff',amber:'#ffc16c',red:'#ff746d',white:'#d3f9ed',ink:'#061016',muted:'#75998e'};
const DEVICE_LABELS={edge:'WAN / fiber, coax and cellular',firewall:'Firewall / gateway',switch:'Cisco switching',hpe:'HPE compute',dell:'Dell PowerEdge compute',storage:'Storage / drive array',gpu:'Supermicro / GPU compute',nuc:'Mini-compute shelf',ups:'UPS / protected power',workstation:'Gaming / engineering workstation'};
const TERMINAL_COMMANDS={
  psu:{host:'pve-dell',check:'ipmitool sel elist | tail -4',verify:'ipmitool sdr type "Power Supply"'},
  drive:{host:'vault',check:'zpool status -x',verify:'zpool status -x'},
  network:{host:'kvm',check:'ip -br link && ip route show default',verify:'ip route show default'},
  fan:{host:'gpu-01',check:'nvidia-smi --query-gpu=temperature.gpu --format=csv',verify:'nvidia-smi --query-gpu=temperature.gpu --format=csv'},
  power:{host:'kvm',check:'upsc rack-ups@localhost ups.status',verify:'upsc rack-ups@localhost ups.status'},
  memory:{host:'pve-hpe',check:'free -h',verify:'grep MemTotal /proc/meminfo'},
  capacity:{host:'vault',check:'df -h /tank',verify:'zpool list tank'},
  service:{host:'node-01',check:'journalctl -u media-api -n 3 --no-pager',verify:'systemctl is-active media-api'},
  spill:{host:'kvm',check:'ping -c 1 legion.lan',verify:'ping -c 1 legion.lan'},
};
const seeds=new Map(),colors=new Map(),lightSprites=new Map();
let driveRingSprite;

function seedOf(value){
  if(seeds.has(value))return seeds.get(value);
  let hash=2166136261;
  for(const char of String(value)){
    hash^=char.charCodeAt(0);
    hash=Math.imul(hash,16777619);
  }
  const seed=(hash>>>0)/4294967295;
  seeds.set(value,seed);
  return seed;
}

export const DEFAULT_HOMELAB_EFFECT_LAYOUT={
  devices:{
    edge:{x:.155,y:.32,w:.105,h:.065,kind:'edge'},
    firewall:{x:.155,y:.405,w:.105,h:.025,kind:'firewall'},
    switch:{x:.155,y:.445,w:.105,h:.035,kind:'switch',rows:2,cols:24},
    hpe:{x:.285,y:.355,w:.13,h:.16,kind:'hpe',rows:3,cols:8},
    dell:{x:.555,y:.355,w:.11,h:.105,kind:'dell',rows:3,cols:8},
    storage:{x:.555,y:.485,w:.11,h:.125,kind:'storage',rows:2,cols:12},
    gpu:{x:.685,y:.39,w:.11,h:.22,kind:'gpu',rows:1,cols:3},
    nuc:{x:.155,y:.545,w:.105,h:.055,kind:'nuc',cols:3},
    ups:{x:.685,y:.705,w:.11,h:.065,kind:'ups'},
    workstation:{x:.82,y:.51,w:.165,h:.205,kind:'workstation'}
  },
  console:{x:.425,y:.43,w:.13,h:.112},
  workstationScreen:{x:.835,y:.53,w:.13,h:.085},
  cableY:.258,
  nodes:{fiber:{x:.14,y:.285},coax:{x:.14,y:.306},cellular:{x:.14,y:.327}}
};

function rect(value,width,height){return{x:value.x*width,y:value.y*height,w:value.w*width,h:value.h*height};}
function point(value,width,height){return{x:value.x*width,y:value.y*height};}
function display(value,width,height){
  if(!value)return null;
  return{...rect(value,width,height),quad:value.quad?.map(p=>point(p,width,height)),occlusions:value.occlusions?.map(polygon=>polygon.map(p=>point(p,width,height)))};
}
function inner(box,x,y,w,h){return{x:box.x+box.w*x,y:box.y+box.h*y,w:box.w*w,h:box.h*h};}
function colorRGB(hex){
  if(!colors.has(hex))colors.set(hex,[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)));
  return colors.get(hex);
}
function rgba(hex,alpha){const c=colorRGB(hex);return`rgba(${c[0]},${c[1]},${c[2]},${clamp(alpha)})`;}
function blendColor(a,b,weight){
  const rgb=colorRGB(b);
  return '#'+colorRGB(a).map((channel,i)=>Math.round(mix(channel,rgb[i],weight)).toString(16).padStart(2,'0')).join('');
}
function roomPalette(palette){
  const accent=/^#[0-9a-f]{6}$/i.test(palette?.accent||'')?palette.accent.toLowerCase():C.cyan;
  return {
    accent,
    emission:blendColor(accent,'#fff3e8',.34),
    background:blendColor(C.ink,accent,.09),
    border:blendColor(C.ink,accent,.49),
    panel:blendColor(C.ink,accent,.16),
  };
}
function monitorPalette(accent){
  // Physical displays retain a near-black neutral surface. Theme color belongs
  // in restrained UI details, not an opaque green/pink rectangle over the art.
  return{accent:blendColor(accent,'#8aa9b8',.68),emission:blendColor(accent,'#adc0ca',.76),background:'#08131c',panel:'#101d27',border:'#2c424d'};
}
function makeSurface(width,height){
  const surface=typeof OffscreenCanvas==='function'?new OffscreenCanvas(width,height):globalThis.document?.createElement('canvas');
  if(!surface)return null;
  surface.width=width;
  surface.height=height;
  const ctx=surface.getContext('2d');
  return ctx?{surface,ctx}:null;
}
function pathPolygon(ctx,points){
  ctx.moveTo(points[0].x,points[0].y);
  for(const point of points.slice(1))ctx.lineTo(point.x,point.y);
  ctx.closePath();
}
function clipDisplay(ctx,box){
  ctx.beginPath();
  if(box.quad)pathPolygon(ctx,box.quad);else ctx.rect(box.x,box.y,box.w,box.h);
  ctx.clip();
  if(box.occlusions?.length){
    ctx.beginPath();ctx.rect(box.x-1,box.y-1,box.w+2,box.h+2);
    for(const polygon of box.occlusions)pathPolygon(ctx,polygon);
    ctx.clip('evenodd');
  }
}
function screenMesh(quad,textureWidth,textureHeight){
  const[p0,p1,p2,p3]=quad;
  const dx1=p1.x-p2.x,dx2=p3.x-p2.x,dx3=p0.x-p1.x+p2.x-p3.x;
  const dy1=p1.y-p2.y,dy2=p3.y-p2.y,dy3=p0.y-p1.y+p2.y-p3.y;
  const determinant=dx1*dy2-dx2*dy1;
  const g=Math.abs(determinant)>1e-8?(dx3*dy2-dx2*dy3)/determinant:0;
  const h=Math.abs(determinant)>1e-8?(dx1*dy3-dx3*dy1)/determinant:0;
  const a=p1.x-p0.x+g*p1.x,b=p3.x-p0.x+h*p3.x;
  const d=p1.y-p0.y+g*p1.y,e=p3.y-p0.y+h*p3.y;
  const project=(u,v)=>{const denominator=g*u+h*v+1;return{x:(a*u+b*v+p0.x)/denominator,y:(d*u+e*v+p0.y)/denominator}};
  const triangles=[],columns=8,rows=2;
  const vertex=(u,v)=>({source:{x:u*textureWidth,y:v*textureHeight},destination:project(u,v)});
  function triangle(vertices){
    const[s0,s1,s2]=vertices.map(v=>v.source),[t0,t1,t2]=vertices.map(v=>v.destination);
    const denominator=(s1.x-s0.x)*(s2.y-s0.y)-(s2.x-s0.x)*(s1.y-s0.y);
    const xx=((t1.x-t0.x)*(s2.y-s0.y)-(t2.x-t0.x)*(s1.y-s0.y))/denominator;
    const xy=((t2.x-t0.x)*(s1.x-s0.x)-(t1.x-t0.x)*(s2.x-s0.x))/denominator;
    const yx=((t1.y-t0.y)*(s2.y-s0.y)-(t2.y-t0.y)*(s1.y-s0.y))/denominator;
    const yy=((t2.y-t0.y)*(s1.x-s0.x)-(t1.y-t0.y)*(s2.x-s0.x))/denominator;
    const center={x:(t0.x+t1.x+t2.x)/3,y:(t0.y+t1.y+t2.y)/3};
    // A subpixel overlap avoids antialiased cracks between opaque triangles.
    const clip=[t0,t1,t2].map(point=>{const dx=point.x-center.x,dy=point.y-center.y,length=Math.hypot(dx,dy)||1;return{x:point.x+dx/length*.35,y:point.y+dy/length*.35}});
    triangles.push({clip,matrix:[xx,yx,xy,yy,t0.x-xx*s0.x-xy*s0.y,t0.y-yx*s0.x-yy*s0.y]});
  }
  for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
    const tl=vertex(column/columns,row/rows),tr=vertex((column+1)/columns,row/rows);
    const br=vertex((column+1)/columns,(row+1)/rows),bl=vertex(column/columns,(row+1)/rows);
    triangle([tl,tr,br]);triangle([tl,br,bl]);
  }
  return triangles;
}
function projectDisplay(cache,box){
  const mapped=cache.mapped;
  if(!mapped)return;
  const ctx=mapped.ctx,sx=mapped.surface.width/box.w,sy=mapped.surface.height/box.h;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,mapped.surface.width,mapped.surface.height);
  ctx.setTransform(sx,0,0,sy,-box.x*sx,-box.y*sy);
  ctx.save();clipDisplay(ctx,box);
  for(const triangle of cache.mesh){
    ctx.save();ctx.beginPath();pathPolygon(ctx,triangle.clip);ctx.clip();
    ctx.transform(...triangle.matrix);ctx.drawImage(cache.surface,0,0);ctx.restore();
  }
  ctx.restore();
}
function roundRect(ctx,box,radius,fill,stroke){ctx.beginPath();ctx.roundRect(box.x,box.y,box.w,box.h,radius);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function line(ctx,points,color,width=1){if(points.length<2)return;ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function lightSprite(color,halo,core){
  const key=`${color}:${halo}:${core}`;
  if(lightSprites.has(key))return lightSprites.get(key);
  const buffer=makeSurface(48,48);
  if(!buffer)return null;
  const {ctx,surface}=buffer;
  const glow=ctx.createRadialGradient(24,24,0,24,24,24);
  glow.addColorStop(0,rgba(color,core?.47:.86));
  glow.addColorStop(.32,rgba(color,core?.24:.46));
  glow.addColorStop(1,rgba(color,0));
  ctx.fillStyle=glow;
  ctx.fillRect(0,0,48,48);
  if(core){
    ctx.beginPath();
    ctx.arc(24,24,24/halo,0,TAU);
    ctx.fillStyle=color;
    ctx.fill();
  }
  lightSprites.set(key,surface);
  return surface;
}
function drawLight(ctx,sprite,x,y,w,h,brightness){
  const previous=ctx.globalAlpha;
  ctx.globalAlpha=(Number.isFinite(previous)?previous:1)*clamp(brightness);
  ctx.drawImage(sprite,x-w/2,y-h/2,w,h);
  ctx.globalAlpha=Number.isFinite(previous)?previous:1;
}
function spill(ctx,x,y,w,h,color,brightness){
  const sprite=lightSprite(color,1,false);
  if(sprite)drawLight(ctx,sprite,x,y,w,h,brightness);
}
function dot(ctx,x,y,r,color,brightness=1,halo=3.5){
  if(brightness<=.015)return;
  const radius=Math.max(.45,r),sprite=lightSprite(color,halo,true);
  if(sprite){
    const size=radius*halo*2;
    drawLight(ctx,sprite,x,y,size,size,brightness);
    return;
  }
  ctx.beginPath();
  ctx.arc(x,y,radius,0,TAU);
  ctx.fillStyle=rgba(color,brightness);
  ctx.fill();
}
function driveRing(ctx,x,y,radius,angle,active){
  if(driveRingSprite===undefined){
    const buffer=makeSurface(32,32);
    driveRingSprite=buffer?.surface||null;
    if(buffer){
      const ring=buffer.ctx;
      ring.lineWidth=2;
      for(let segment=0;segment<12;segment++){
        const start=segment*TAU/12;
        ring.beginPath();
        ring.arc(16,16,13,start,start+TAU/12*.63);
        ring.strokeStyle=rgba(C.green,segment<3?.9:.26);
        ring.stroke();
      }
    }
  }
  if(!driveRingSprite){
    ctx.beginPath();
    ctx.arc(x,y,radius,angle,angle+TAU*.8);
    ctx.strokeStyle=rgba(C.green,active?.58:.065);
    ctx.lineWidth=.7;
    ctx.stroke();
    return;
  }
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(active?angle:0);
  const size=radius*32/13;
  drawLight(ctx,driveRingSprite,0,0,size,size,active?1:.09);
  ctx.restore();
}
function label(ctx,value,x,y,size,color=C.white,align='left'){
  ctx.font=`${Math.max(5,size)}px ui-monospace, SFMono-Regular, Consolas, monospace`;ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(String(value),x,y);
}
function healthOf(state,id){
  const data=Array.isArray(state.devices)?state.devices.find(item=>item.id===id):state.devices?.[id];
  return{health:'healthy',power:'on',load:.24,identifying:false,progress:0,...(data||{})};
}
function isOff(device){return device.power==='off'||device.health==='offline';}
function isFault(device){return['warning','degraded','failed','critical'].includes(device.health);}
function statusColor(device,healthy=C.green){return isOff(device)?C.greenDim:device.health==='failed'||device.health==='critical'?C.red:isFault(device)?C.amber:device.health==='rebuilding'?C.cyan:healthy;}
function physicalColor(device,healthy=C.green){
  // Resource pressure and service crashes do not create a failed drive lamp.
  return !isOff(device)&&['memory','capacity','service'].includes(device.fault?.kind)?healthy:statusColor(device,healthy);
}
function activePattern(time,seed,load=.3){
  // Separate bounded pulse trains, not one synchronized random flicker.
  const beat=frac(time*(1.6+seed*3.9)+seed*19.3),gate=Math.sin(time*(.17+seed*.19)+seed*TAU);
  return beat<.035+clamp(load)*.17&&gate>-.65?.95:.12;
}
function measureRoute(points){
  const lengths=[];let total=0;for(let i=1;i<points.length;i++){const n=Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);lengths.push(n);total+=n}
  return{points,lengths,total};
}
function routeAt({points,lengths,total},progress){
  let remaining=clamp(progress)*total;
  for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?remaining/lengths[i]:0;return{x:mix(points[i].x,points[i+1].x,t),y:mix(points[i].y,points[i+1].y,t)}}remaining-=lengths[i]}
  return points[0]||{x:0,y:0};
}
function inBox(x,y,b){return x>=b.x&&y>=b.y&&x<=b.x+b.w&&y<=b.y+b.h;}

export function createHomelabEffects({width=1920,height=1080,layout={}}={}){
  let configuration,front,rear,lastState={},lastTime=0,disposed=false;
  let theme=roomPalette(),monitor=monitorPalette(theme.accent);
  const options={dataFlow:true,cables:true,motes:true};
  const pulses=[],springs=new Map(),screens=new Map();
  function build(source){
    const normalizedDevices=source.devices||{};
    const devices=Object.fromEntries(Object.entries(normalizedDevices).map(([id,data])=>[id,{...data,id,label:data.label||DEVICE_LABELS[id]||id,bounds:rect(data,width,height)}]));
    const console=display(source.console,width,height),workstationScreen=display(source.workstationScreen,width,height);
    const nodes={};for(const[id,data]of Object.entries(devices))nodes[id]={x:data.bounds.x+data.bounds.w*.5,y:data.bounds.y+data.bounds.h*.5};
    if(console)nodes.console={x:console.x+console.w*.5,y:console.y+console.h*.5};
    for(const[id,data]of Object.entries(source.nodes||{}))nodes[id]=point(data,width,height);
    const defaultLinks=[{from:'fiber',to:'edge',wan:'fiber'},{from:'coax',to:'edge',wan:'coax'},{from:'cellular',to:'edge',wan:'cellular'},{from:'edge',to:'firewall'},{from:'firewall',to:'switch'},...['hpe','dell','storage','gpu','nuc','workstation','console'].map(to=>({from:'switch',to}))];
    const links=(source.links||defaultLinks).filter(link=>nodes[link.from]&&nodes[link.to]).map((link,i)=>{
      const a=nodes[link.from],b=nodes[link.to],y=(source.cableY??.258)*height+(i%5)*height*.0027;
      const points=link.points?link.points.map(p=>point(p,width,height)):link.wan?[a,{x:a.x+width*.012,y:a.y},{x:b.x-width*.012,y:b.y},b]:[a,{x:a.x,y},{x:b.x,y},b];
      const route=measureRoute(points);
      return{...link,route,midpoint:routeAt(route,.5),seed:seedOf(`${link.from}:${link.to}`)};
    });
    return{devices,console,workstationScreen,nodes,links};
  }
  function setLayout(next={}){
    configuration={...DEFAULT_HOMELAB_EFFECT_LAYOUT,...next,devices:{...DEFAULT_HOMELAB_EFFECT_LAYOUT.devices,...next.devices},nodes:{...DEFAULT_HOMELAB_EFFECT_LAYOUT.nodes,...next.nodes}};
    front=build(configuration);
    rear=build({...configuration,...configuration.rear,devices:configuration.rear?.devices||configuration.devices,nodes:{...configuration.nodes,...configuration.rear?.nodes},links:configuration.rear?.links||configuration.links});
    springs.clear();screens.clear();
  }
  function currentLayout(){return lastState.rearView?rear:front;}
  function hitTest(nx,ny){
    const view=currentLayout(),x=nx*width,y=ny*height;
    if(view.console&&inBox(x,y,view.console))return{id:'console',label:'Management console / KVM',bounds:{x:view.console.x/width,y:view.console.y/height,w:view.console.w/width,h:view.console.h/height}};
    for(const device of Object.values(view.devices).reverse())if(inBox(x,y,device.bounds))return{id:device.id,label:device.label,bounds:{x:device.x,y:device.y,w:device.w,h:device.h}};
    return null;
  }
  function tap(nx,ny){
    const hit=typeof nx==='string'?{id:nx}:hitTest(nx,ny);if(!hit)return null;
    const view=currentLayout(),node=view.nodes[hit.id];if(node)pulses.push({id:hit.id,x:node.x,y:node.y,start:lastTime});
    if(pulses.length>12)pulses.shift();return hit;
  }
  function identified(id,time,device){return device.identifying||pulses.some(p=>p.id===id&&time-p.start<2.3);}
  function statusLED(ctx,entry,device,time,healthy=C.green){
    const b=entry.bounds,p=entry.statusPoint?point(entry.statusPoint,width,height):{x:b.x+b.w*.96,y:b.y+b.h*.22};
    const color=identified(entry.id,time,device)?C.blue:physicalColor(device,healthy);
    const brightness=isOff(device)?.08:isFault(device)?(.55+.35*Math.sin(time*TAU*.85)**2):.86;
    dot(ctx,p.x,p.y,Math.max(.8,Math.min(b.w*.009,2.15)),color,brightness);
  }
  function drawHPE(ctx,entry,device,time){
    const b=entry.driveArea?rect(entry.driveArea,width,height):inner(entry.bounds,.49,.12,.43,.82),rows=entry.rows||1,cols=entry.cols||8;
    const cellW=b.w/cols,cellH=b.h/rows,r=Math.max(1.4,Math.min(cellW*.26,cellH*.12,6.5)),off=isOff(device),failure=device.fault?.kind==='drive'&&isFault(device),failedSlot=clamp((device.fault?.slot||1)-1,0,rows*cols-1);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const i=row*cols+col,s=seedOf(entry.id+i),x=b.x+cellW*(col+.5),y=b.y+cellH*(row+.71),faulty=failure&&i===failedSlot,rebuild=device.health==='rebuilding'&&i===failedSlot;
      const angle=(time*(1.05+s*.8)+s)*TAU,bright=!off&&!faulty;
      driveRing(ctx,x,y,r,angle,bright);
      if(bright)dot(ctx,x+Math.cos(angle)*r,y+Math.sin(angle)*r,r*.16,theme.emission,.8,4);
      const lamp=faulty?C.amber:rebuild?C.cyan:C.green;
      dot(ctx,x+r*.85,y-r*2.5,Math.max(.65,r*.2),lamp,off?.04:faulty?.8:rebuild?.3+.65*Math.sin(time*3)**2:activePattern(time,s,device.load));
      // A separate pale do-not-remove lamp is used only during active rebuild.
      if(rebuild)dot(ctx,x-r*.85,y-r*2.5,Math.max(.6,r*.17),C.white,.65);
    }
    statusLED(ctx,entry,device,time);
  }
  function drawDell(ctx,entry,device,time){
    const b=entry.driveArea?rect(entry.driveArea,width,height):inner(entry.bounds,.08,.14,.79,.74),rows=entry.rows||1,cols=entry.cols||8,off=isOff(device),faulty=device.fault?.kind==='drive'&&isFault(device),failedSlot=clamp((device.fault?.slot||1)-1,0,rows*cols-1);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const i=row*cols+col,s=seedOf(entry.id+i),cellW=b.w/cols,cellH=b.h/rows,x=b.x+cellW*(col+.17),y=b.y+cellH*(row+.78),failed=faulty&&i===failedSlot,rebuild=device.health==='rebuilding'&&i===failedSlot,r=Math.max(.65,Math.min(cellW*.06,1.7));
      dot(ctx,x,y,r,failed?C.amber:C.green,off?.035:failed?.8:rebuild?.25+.65*Math.sin(time*2.5)**2:.65);
      dot(ctx,x+r*3.8,y,r*.82,C.green,off||failed?.025:activePattern(time,s,device.load));
    }
    statusLED(ctx,entry,device,time,C.blue);
  }
  function drawSwitch(ctx,entry,device,time,state){
    const b=entry.portsArea?rect(entry.portsArea,width,height):inner(entry.bounds,.07,.15,.78,.70),rows=entry.rows||2,cols=entry.cols||24,off=isOff(device),faulty=isFault(device);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const i=row*cols+col,s=seedOf('port'+i),x=b.x+(col+.20)*b.w/cols,y=b.y+(row+.25)*b.h/rows,unplugged=(i+3)%13===0||faulty&&i>=rows*cols-2,r=Math.max(.65,Math.min(b.w/cols*.09,1.35));
      if(!unplugged&&!off){dot(ctx,x,y,r,C.green,.67,3);dot(ctx,x+r*3,y,r*.84,i%7===0?C.amber:C.green,activePattern(time,s,device.load));}
    }
    const uplinkX=b.x+b.w+b.w*.06;
    for(let i=0;i<2;i++)dot(ctx,uplinkX+i*Math.max(3,b.w*.06),b.y+b.h*.5,Math.max(1,b.w*.01),faulty?C.amber:C.cyan,off?.025:.8);
    statusLED(ctx,entry,device,time);
  }
  function drawEdge(ctx,entry,device,time,state){
    const b=entry.bounds,links=['fiber','coax','cellular'],active=state.wan?.active||'fiber';
    links.forEach((id,i)=>{
      const x=b.x+b.w*(.17+i*.32),y=b.y+b.h*.66,down=state.wan?.links?.[id]==='down',isActive=id===active;
      dot(ctx,x,y,Math.max(1,b.w*.008),down?C.amber:C.green,isOff(device)?.02:down?.67:isActive?.9:.25);
      dot(ctx,x,y-b.h*.15,Math.max(.7,b.w*.006),C.green,isActive&&!down?activePattern(time,seedOf(id),.55):.04);
    });
  }
  function drawFirewall(ctx,entry,device,time){
    const b=entry.bounds;
    for(let i=0;i<5;i++)dot(ctx,b.x+b.w*(.14+i*.065),b.y+b.h*.45,Math.max(.8,b.w*.007),i===0?statusColor(device):C.green,isOff(device)?.03:i<2?.7:activePattern(time,seedOf('fw'+i),device.load));
    if(identified(entry.id,time,device))dot(ctx,b.x+b.w*.85,b.y+b.h*.5,1.5,C.blue,.9);
  }
  function drawFans(ctx,entry,device,time){
    const b=entry.driveArea?rect(entry.driveArea,width,height):inner(entry.bounds,.06,.12,.87,.47),count=entry.cols||3,r=Math.min(b.w/(count*2.7),b.h*.43),running=!isOff(device),failure=device.fault?.kind==='fan'&&isFault(device);
    for(let i=0;i<count;i++){
      const x=b.x+b.w*(i+.5)/count,y=b.y+b.h*.5,stalled=failure&&i===count-1,s=seedOf('fan'+i),a=running&&!stalled?time*(2+device.load*5+s)*TAU:0;
      ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.strokeStyle=rgba(stalled?C.amber:theme.emission,stalled?.5:.32);ctx.lineWidth=Math.max(.5,r*.035);
      ctx.beginPath();
      for(let blade=0;blade<7;blade++){ctx.rotate(TAU/7);ctx.moveTo(r*.19,0);ctx.quadraticCurveTo(r*.4,-r*.48,r*.85,-r*.21);}
      ctx.stroke();
      ctx.restore();
      if(stalled)dot(ctx,x,y,Math.max(1,r*.08),C.amber,.75);
    }
    statusLED(ctx,entry,device,time);
  }
  function drawNUC(ctx,entry,device,time){
    const b=entry.bounds,count=entry.cols||3;
    for(let i=0;i<count;i++){const x=b.x+b.w*(i+.78)/count,y=b.y+b.h*.64;dot(ctx,x,y,Math.max(.85,b.w*.008),i===count-1&&isFault(device)?C.amber:C.blue,isOff(device)?.03:.82);dot(ctx,x-b.w*.11,y,Math.max(.6,b.w*.0045),C.white,isOff(device)?.025:activePattern(time,seedOf('nuc'+i),device.load));}
  }
  function drawUPS(ctx,entry,device,time){
    const b=entry.portsArea?rect(entry.portsArea,width,height):inner(entry.bounds,.40,.25,.22,.38),battery=device.power==='battery',off=isOff(device),level=battery?Math.max(.28,1-clamp(device.progress)*.62):1;
    ctx.fillStyle=theme.background;ctx.fillRect(b.x,b.y,b.w,b.h);
    for(let i=0;i<5;i++){const lit=i/5<level;ctx.fillStyle=rgba(battery?C.amber:C.green,off?.03:lit?.8:.12);ctx.fillRect(b.x+b.w*(.08+i*.17),b.y+b.h*.2,b.w*.11,b.h*.57);}
    dot(ctx,b.x+b.w*1.36,b.y+b.h*.5,Math.max(.9,entry.bounds.w*.008),statusColor(device),off?.03:battery?.65+.2*Math.sin(time*2)**2:.7);
  }
  function drawRearDevice(ctx,entry,device,time,state){
    const b=entry.bounds,off=isOff(device),target=state.incident?.target===entry.id&&state.incident?.kind==='psu';
    if(['hpe','dell','gpu','storage'].includes(entry.kind)){
      for(let i=0;i<2;i++){const x=b.x+b.w*(.79+i*.13),y=b.y+b.h*.71,fault=target&&i===1&&isFault(device);dot(ctx,x,y,Math.max(1.2,b.w*.009),fault?C.amber:C.green,off?.02:.78);}
      for(let i=0;i<2;i++)dot(ctx,b.x+b.w*(.27+i*.10),b.y+b.h*.68,Math.max(.7,b.w*.006),C.green,off?.02:activePattern(time,seedOf('rear'+entry.id+i),device.load));
      if(identified(entry.id,time,device))dot(ctx,b.x+b.w*.5,b.y+b.h*.33,Math.max(1,b.w*.008),C.blue,.85);
    }else if(entry.kind==='switch')drawSwitch(ctx,entry,device,time,state);
    else if(entry.kind==='ups')drawUPS(ctx,entry,device,time);
    else statusLED(ctx,entry,device,time);
  }
  function displayFrame(ctx,box){
    ctx.beginPath();
    ctx.roundRect(box.x,box.y,box.w,box.h,Math.min(3,box.w*.012));
    ctx.clip();
    ctx.fillStyle=monitor.background;
    ctx.fillRect(box.x,box.y,box.w,box.h);
  }
  function telemetryPanel(ctx,box,title){
    ctx.fillStyle=monitor.panel;
    ctx.fillRect(box.x,box.y,box.w,box.h);
    ctx.lineWidth=.65;
    ctx.strokeStyle=monitor.border;
    ctx.strokeRect(box.x,box.y,box.w,box.h);
    label(ctx,title,box.x+5,box.y+5,6.2,monitor.emission);
  }
  function plot(ctx,box,values,color){
    const baseline=box.y+box.h;
    const points=values.map((value,index)=>({x:box.x+index*box.w/(values.length-1),y:baseline-clamp(value)*box.h}));
    ctx.beginPath();
    ctx.moveTo(box.x,baseline);
    for(const p of points)ctx.lineTo(p.x,p.y);
    ctx.lineTo(box.x+box.w,baseline);
    ctx.closePath();
    ctx.fillStyle=rgba(color,.13);
    ctx.fill();
    line(ctx,points,color,.8);
  }
  function graphValues(time,load,amplitude,count=35){
    return Array.from({length:count},(_,i)=>{
      const t=time-(count-1-i)*.25;
      return load+amplitude*(Math.sin(t*1.17)*.48+Math.sin(t*2.83)*.31+Math.sin(t*5.71)*.21);
    });
  }
  function drawBtop(ctx,box,state,time){
    const {x,y,w,h}=box,pad=5,head=h*.128,bottom=h*.09,gap=3;
    const panelsY=y+head+gap,panelsHeight=h-head-bottom-gap*2;
    const leftW=w*.53-pad,rightW=w-leftW-pad*2-gap,rightX=x+pad+leftW+gap;
    const cpuH=panelsHeight*.44,memH=panelsHeight*.255;
    const cpu={x:x+pad,y:panelsY,w:leftW,h:cpuH};
    const mem={x:x+pad,y:panelsY+cpuH+gap,w:leftW,h:memH};
    const net={x:x+pad,y:panelsY+cpuH+memH+gap*2,w:leftW,h:panelsHeight-cpuH-memH-gap*2};
    const processes={x:rightX,y:panelsY,w:rightW,h:panelsHeight};
    const host=healthOf(state,'hpe'),gpu=healthOf(state,'gpu'),storage=healthOf(state,'storage');
    const load=clamp((host.load+gpu.load+storage.load)/3),memory=clamp(host.memoryUsed??.43);
    const timeText=String(Math.floor(time/60)).padStart(2,'0')+':'+String(Math.floor(time%60)).padStart(2,'0');
    ctx.fillStyle=rgba(monitor.accent,.055);
    ctx.fillRect(x,y,w,head);
    label(ctx,'sub@kvm:~$ btop',x+pad,y+head*.52,8,monitor.emission);
    label(ctx,'uptime 01:'+timeText,x+w-pad,y+head*.52,6.1,C.white,'right');
    telemetryPanel(ctx,cpu,'CPU');
    label(ctx,Math.round(load*100)+'%  '+Math.round(host.temperature??37)+'°C',cpu.x+cpu.w-pad,cpu.y+5,5.9,C.white,'right');
    plot(ctx,inner(cpu,.035,.35,.93,.53),graphValues(time,load,.19),monitor.emission);
    telemetryPanel(ctx,mem,'MEM');
    label(ctx,(64*memory).toFixed(1)+' / 64 GiB',mem.x+mem.w-pad,mem.y+5,5.8,C.white,'right');
    ctx.fillStyle=monitor.background;
    ctx.fillRect(mem.x+5,mem.y+10,mem.w-10,3.8);
    ctx.fillStyle=memory>.93?C.amber:monitor.emission;
    ctx.fillRect(mem.x+5,mem.y+10,(mem.w-10)*memory,3.8);
    telemetryPanel(ctx,net,'NET');
    const route=state.wan?.active;
    label(ctx,route?route+'  ↓ '+(2+load*15).toFixed(1)+'M':'no uplink',net.x+net.w-pad,net.y+5,5.8,route?C.white:C.amber,'right');
    plot(ctx,inner(net,.035,.46,.93,.45),graphValues(time*.75,route?load*.75:0,route?.19:0,25),monitor.emission);
    telemetryPanel(ctx,processes,'PROCESSES');
    label(ctx,'PID   COMMAND       CPU',rightX+5,panelsY+14,6.1,monitor.emission);
    const list=[['308','qemu-system',host.load*.6],['824','media-api',.06+load*.26],['495','node_export',.012+load*.14],['718','tailscaled',.019+load*.09],['251','sshd',.008+load*.1],['417','caddy',.008+load*.07]];
    const rowHeight=(processes.h-21)/list.length;
    list.forEach(([pid,name,usage],i)=>{
      const yy=panelsY+21+i*rowHeight;
      if(i===0){
        ctx.fillStyle=rgba(monitor.emission,.1);
        ctx.fillRect(rightX+2,yy-rowHeight*.42,rightW-4,rowHeight);
      }
      label(ctx,pid+'   '+name,rightX+5,yy,6.1,C.white);
      label(ctx,(usage*100).toFixed(1),rightX+rightW-pad,yy,6.1,monitor.emission,'right');
    });
    label(ctx,'kvm-01  •  fabric '+(route?'up':'unavailable')+'  •  '+(state.console?.title||'Checks passing'),x+pad,y+h-bottom*.55,6,route?C.muted:C.amber);
  }
  function terminalOutput(kind,state,verified){
    const device=state.devices?.[state.incident?.target]||{};
    switch(kind){
      case 'psu':return verified?['PSU 1 Status | ok','PSU 2 Status | ok','Redundancy restored']:['0058 | Power Supply PS2 | AC lost | Asserted','PSU 1 carrying load. Chassis power: on.'];
      case 'drive':return verified?['all pools are healthy']:['pool: tank','state: DEGRADED','  slot-03  FAULTED     0     0     1'];
      case 'network':{
        const route=state.wan?.active;
        const interfaces=['fiber','coax','cellular'].map(link=>link.padEnd(9)+(state.wan?.links?.[link]||'standby').toUpperCase());
        const defaultRoute=route?'default via 192.0.2.1 dev '+route+' metric 100':'No default route installed';
        return verified?[defaultRoute]:[...interfaces,defaultRoute];
      }
      case 'fan':return ['temperature.gpu',''+Math.round(device.temperature??(verified?45:89))+' C'];
      case 'power':return [device.power==='battery'?'OB DISCHRG':'OL CHRG'];
      case 'memory':return verified?['MemTotal:       134217728 kB']:['               total        used        free','Mem:            64Gi        63Gi       256Mi'];
      case 'capacity':return verified?['NAME  SIZE  ALLOC   FREE  HEALTH','tank   24T  17.5T   6.5T  ONLINE']:['Filesystem  Size  Used  Avail  Use%  Mounted on','tank         18T  17.5T   0.5T   97%  /tank'];
      case 'service':return verified?['active']:['media-api[824]: health probe timed out','systemd[1]: media-api.service: Failed.'];
      case 'spill':return verified?['64 bytes from 192.0.2.32: time=0.69 ms','1 packets transmitted, 1 received']:['PING legion.lan (192.0.2.32) 56 data bytes','1 packets transmitted, 0 received'];
      default:return state.console?.lines||[];
    }
  }
  function drawTerminal(ctx,box,state,time){
    const {x,y,w,h}=box,issue=state.incident,phase=state.phase;
    const commands=TERMINAL_COMMANDS[issue?.kind]||{host:'kvm',check:'btop',verify:'btop'};
    const tint=issue?.severity==='critical'?C.red:C.amber;
    const head=h*.15,pad=7,font=clamp(w/37,6.1,8),rowHeight=Math.max(9,font*1.43);
    const maxChars=Math.floor((w-2*pad)/(font*.61));
    const maxRows=Math.floor((h-head-8)/rowHeight);
    const elapsed=state.phaseTime??0,progress=state.phaseProgress??0;
    const prompt='sub@'+commands.host+':~$ ';
    const rows=[];
    function write(value,color){
      const content=String(value);
      for(let i=0;i<content.length;i+=maxChars)rows.push({value:content.slice(i,i+maxChars),color});
      if(!content)rows.push({value:'',color});
    }
    function typed(command,start){
      const count=clamp(Math.floor((elapsed-start)*31),0,command.length);
      write(prompt+command.slice(0,count)+(count<command.length&&frac(time*1.4)<.55?'▌':''),monitor.emission);
      return count===command.length;
    }
    let session='KVM / EVENT STREAM';
    if(phase==='notice'||phase==='to-console'){
      write('sub@kvm:~$ journalctl -f -t lab-watch',monitor.emission);
      write('lab-watch: '+(issue?.title||'Inspecting event'),tint);
      for(const entry of state.console?.lines||[])write(entry,C.white);
    }else if(phase==='diagnose'){
      session=commands.host.toUpperCase()+(commands.host==='kvm'?' / LOCAL TTY':' / SSH SESSION');
      if(commands.host!=='kvm'){
        const ssh='ssh sub@'+commands.host;
        const count=clamp(Math.floor(elapsed*32),0,ssh.length);
        write('sub@kvm:~$ '+ssh.slice(0,count)+(count<ssh.length&&frac(time*1.4)<.55?'▌':''),monitor.emission);
      }
      const delay=commands.host==='kvm'?.1:1.0;
      if(elapsed>=delay&&typed(commands.check,delay)){
        const lines=terminalOutput(issue?.kind,state,false);
        const completeAt=delay+commands.check.length/31;
        const count=clamp(1+Math.floor((elapsed-completeAt)*3.8),0,lines.length);
        for(const entry of lines.slice(0,count))write(entry,C.white);
      }
    }else if(phase==='verify'){
      session=commands.host.toUpperCase()+' / VERIFY';
      if(typed(commands.verify,.08)){
        const verified=progress>=.65;
        const lines=verified?terminalOutput(issue?.kind,state,true):['Waiting on post-service health checks…'];
        for(const entry of lines)write(entry,verified?C.green:C.muted);
      }
    }else{
      session=commands.host.toUpperCase()+' / '+(phase==='repair'?'MAINTENANCE':'DIAGNOSTIC');
      write(prompt+commands.check,monitor.emission);
      if(phase==='repair'){
        for(const entry of state.console?.lines||[])write('# '+entry,C.white);
      }else{
        for(const entry of terminalOutput(issue?.kind,state,false))write(entry,C.white);
      }
    }
    ctx.fillStyle=rgba(monitor.accent,.10);
    ctx.fillRect(x,y,w,head);
    label(ctx,session,x+pad,y+head*.54,7.2,monitor.emission);
    label(ctx,phase==='verify'?'CHECKING':issue?.severity==='critical'?'CRITICAL':'ALERT',x+w-pad,y+head*.54,6.2,phase==='verify'?C.green:tint,'right');
    const start=rows.length>maxRows?rows.length-maxRows:0;
    rows.slice(start).forEach(({value,color},index)=>label(ctx,value,x+pad,y+head+7+index*rowHeight,font,color));
    if(rows.length<maxRows&&frac(time*1.4)<.55&&phase!=='diagnose'){
      ctx.fillStyle=monitor.emission;
      ctx.fillRect(x+pad,y+head+4+rows.length*rowHeight,font*.55,font*.9);
    }
  }
  function drawConsole(ctx,box,state,time){
    ctx.save();
    displayFrame(ctx,box);
    if(state.incident&&!['idle','return'].includes(state.phase))drawTerminal(ctx,box,state,time);
    else drawBtop(ctx,box,state,time);
    ctx.restore();
  }
  function drawRace(ctx,box,state,time){
    const {x,y,w,h}=box,horizon=y+h*.49;
    const paused=Boolean(state.incident)&&state.actor?.state!=='seated';
    const raceTime=paused?(state.incident.startedAt??time):time;
    const sky=ctx.createLinearGradient(0,y,0,y+h);
    sky.addColorStop(0,'#101b37');
    sky.addColorStop(.48,blendColor('#2d1b4c',monitor.accent,.3));
    sky.addColorStop(.52,monitor.panel);
    sky.addColorStop(1,'#101827');
    ctx.fillStyle=sky;
    ctx.fillRect(x,y,w,h);
    spill(ctx,x+w*.68,horizon,w*.48,h*.81,monitor.emission,.6);
    for(let i=0;i<18;i++){
      const seed=seedOf('ridge'+i),xx=x+i*w/18,bh=h*(.015+seed*.16);
      ctx.fillStyle=i%2?'#162034':'#141a30';
      ctx.fillRect(xx,horizon-bh,w/18+.3,bh+2);
      if(seed>.37){
        ctx.fillStyle=rgba(monitor.emission,.55);
        ctx.fillRect(xx+2,horizon-bh+2,1.4,1.15);
      }
    }
    const curve=Math.sin(raceTime*.65)*.19;
    const center=p=>x+w*(.5+curve*(1-p)**2);
    const yy=p=>horizon+(h*.52)*p**2;
    const half=p=>w*(.025+p*.44);
    ctx.beginPath();
    ctx.moveTo(center(0)-half(0),horizon);
    for(let i=1;i<=12;i++){const p=i/12;ctx.lineTo(center(p)-half(p),yy(p));}
    for(let i=12;i>=0;i--){const p=i/12;ctx.lineTo(center(p)+half(p),yy(p));}
    ctx.closePath();
    ctx.fillStyle='#141722';
    ctx.fill();
    ctx.strokeStyle=rgba(monitor.emission,.59);
    ctx.lineWidth=1;
    ctx.stroke();
    for(let i=0;i<13;i++){
      const p=frac(raceTime*1.27+i/13),q=clamp(p+.038);
      const color=rgba(monitor.emission,.31+p*.61);
      line(ctx,[{x:center(p),y:yy(p)},{x:center(q),y:yy(q)}],color,.65+p*.95);
      for(const side of [-1,1]){
        const edge=center(p)+half(p)*side;
        ctx.fillStyle=rgba(monitor.emission,.58);
        ctx.fillRect(edge-1,yy(p)-p*1.7,2,p*1.7+1);
      }
    }
    const carX=x+w*(.5+Math.sin(raceTime*.92)*.07),carY=y+h*.81;
    ctx.beginPath();
    ctx.moveTo(carX-w*.085,carY+h*.095);
    ctx.lineTo(carX-w*.052,carY);
    ctx.lineTo(carX+w*.052,carY);
    ctx.lineTo(carX+w*.085,carY+h*.095);
    ctx.closePath();
    ctx.fillStyle='#1f273a';
    ctx.fill();
    ctx.strokeStyle=rgba(monitor.emission,.61);
    ctx.lineWidth=.7;
    ctx.stroke();
    dot(ctx,carX-w*.058,carY+h*.073,1.4,C.red,.9,3);
    dot(ctx,carX+w*.058,carY+h*.073,1.4,C.red,.9,3);
    ctx.fillStyle='rgba(7,12,20,.69)';
    ctx.fillRect(x,y,w,12);
    label(ctx,'NIGHT LOOP',x+5,y+6.2,7,monitor.emission);
    label(ctx,paused?'PAUSED':Math.round(164+Math.sin(raceTime*.8)*14)+' KM/H',x+w-5,y+6.2,6.4,C.white,'right');
  }
  function drawWorkstation(ctx,box,state,time){
    ctx.save();
    displayFrame(ctx,box);
    if(isOff(healthOf(state,'workstation'))){
      ctx.fillStyle='#030609';
      ctx.fillRect(box.x,box.y,box.w,box.h);
      ctx.restore();
      return;
    }
    const game=inner(box,0,0,.62,1),ops=inner(box,.62,0,.38,1);
    ctx.save();
    ctx.beginPath();
    ctx.rect(game.x,game.y,game.w,game.h);
    ctx.clip();
    drawRace(ctx,game,state,time);
    ctx.restore();
    const {x,y,w,h}=ops,pad=6;
    const load=healthOf(state,'workstation').load;
    const job=Math.floor(time/18)%3;
    const commands=['$ ./ops/deploy.sh','$ rsync -a snapshots/ vault:','$ npm run check'];
    const progress=frac(time/18);
    const service=state.services?.application||'healthy';
    ctx.fillStyle=monitor.panel;
    ctx.fillRect(x,y,w,h);
    ctx.fillStyle=monitor.border;
    ctx.fillRect(x,y,1.15,h);
    label(ctx,'WORKSPACE  /  02',x+pad,y+h*.10,6.5,monitor.emission);
    label(ctx,commands[job],x+pad,y+h*.27,6.3,C.white);
    label(ctx,['build · verify · deploy','incremental snapshot','lint · test · package'][job],x+pad,y+h*.41,5.8,C.muted);
    ctx.fillStyle=monitor.background;
    ctx.fillRect(x+pad,y+h*.49,w-pad*2,3);
    ctx.fillStyle=monitor.emission;
    ctx.fillRect(x+pad,y+h*.49,(w-pad*2)*progress,3);
    label(ctx,'PRODUCTION',x+pad,y+h*.67,6.1,monitor.emission);
    label(ctx,'api '+(service==='healthy'?'200':'503')+'  /  '+(state.wan?.active||'no uplink'),x+pad,y+h*.82,6.3,service==='healthy'?C.green:C.red);
    label(ctx,'CPU '+Math.round(load*100)+'%',x+w-pad,y+h*.93,5.7,C.muted,'right');
    ctx.restore();
  }
  function displayCoating(ctx,box){
    const{x,y,w,h}=box;
    // Low-contrast edge falloff and a faint window reflection belong inside
    // the glass. They do not create an outer glow or repaint the bezel.
    const edges=ctx.createLinearGradient(x,y,x+w,y);
    edges.addColorStop(0,'rgba(0,0,0,.19)');edges.addColorStop(.13,'rgba(0,0,0,0)');
    edges.addColorStop(.82,'rgba(0,0,0,0)');edges.addColorStop(1,'rgba(0,0,0,.24)');
    ctx.fillStyle=edges;ctx.fillRect(x,y,w,h);
    const glass=ctx.createLinearGradient(x,y,x+w*.75,y+h);
    glass.addColorStop(0,'rgba(183,204,220,.055)');glass.addColorStop(.27,'rgba(183,204,220,.012)');
    glass.addColorStop(.47,'rgba(183,204,220,.03)');glass.addColorStop(.6,'rgba(183,204,220,0)');glass.addColorStop(1,'rgba(0,0,0,.10)');
    ctx.fillStyle=glass;ctx.fillRect(x,y,w,h);
    ctx.lineWidth=1.1;ctx.strokeStyle='rgba(0,0,0,.55)';ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  }
  function cachedScreen(ctx,name,box,state,time,fps,paint){
    if(!box)return;
    let cache=screens.get(name);
    if(!cache){
      const buffer=makeSurface(Math.ceil(box.w*1.5),Math.ceil(box.h*1.5));
      cache=buffer?{...buffer,frame:-1,signature:''}:null;
      if(cache&&box.quad){
        cache.mapped=makeSurface(cache.surface.width,cache.surface.height);
        cache.mesh=screenMesh(box.quad,cache.surface.width,cache.surface.height);
      }
      screens.set(name,cache);
    }
    if(!cache){
      ctx.save();clipDisplay(ctx,box);paint(ctx,box,state,time);displayCoating(ctx,box);ctx.restore();
      return;
    }
    const frame=Math.floor(time*fps);
    const signature=[state.phase,state.incident?.serial,state.console?.mode,state.console?.lines?.join('|'),state.wan?.active,state.devices?.workstation?.power,monitor.accent].join(':');
    if(cache.frame!==frame||cache.signature!==signature){
      const screen=cache.ctx;
      screen.setTransform(cache.surface.width/box.w,0,0,cache.surface.height/box.h,0,0);
      screen.clearRect(0,0,box.w,box.h);
      paint(screen,{x:0,y:0,w:box.w,h:box.h},state,time);
      displayCoating(screen,{x:0,y:0,w:box.w,h:box.h});
      if(cache.mapped)projectDisplay(cache,box);
      cache.frame=frame;
      cache.signature=signature;
    }
    ctx.save();
    if(box.quad&&!cache.mapped)clipDisplay(ctx,box);
    ctx.globalAlpha*=name==='workstation'&&isOff(healthOf(state,'workstation'))?1:.96;
    ctx.drawImage(cache.mapped?.surface||cache.surface,box.x,box.y,box.w,box.h);
    ctx.restore();
  }
  function drawRoutes(ctx,view,state,time,dt,pointer){
    const px=pointer&&pointer.active!==false?pointer.x*width:-width,py=pointer&&pointer.active!==false?pointer.y*height:-height;
    for(const link of view.links){
      const a=healthOf(state,link.from),b=healthOf(state,link.to),wanStatus=link.wan?state.wan?.links?.[link.wan]:null;
      const active=!isOff(a)&&!isOff(b)&&(!link.wan||((state.wan?.active||'fiber')===link.wan&&wanStatus!=='down'));
      const broken=wanStatus==='down'||b.health==='failed';
      const color=/^#[0-9a-f]{6}$/i.test(link.color||'')?link.color:theme.emission;
      let spring=springs.get(link);
      if(!spring){
        spring={offset:0,velocity:0,measuredOffset:0,route:link.route};
        springs.set(link,spring);
      }
      const mid=link.midpoint,distance=Math.hypot(px-mid.x,py-mid.y),desired=distance<100?clamp((py-mid.y)*.11,-7,7):0;
      if(dt>0){
        const step=Math.min(dt,.05);
        spring.velocity+=(desired-spring.offset)*36*step;
        spring.velocity*=Math.exp(-9*step);
        spring.offset+=spring.velocity*step;
        if(Math.abs(spring.offset-spring.measuredOffset)>.09){
          const points=link.route.points.map((p,i,all)=>({x:p.x,y:p.y+(i>0&&i<all.length-1?spring.offset:0)}));
          spring.route=measureRoute(points);
          spring.measuredOffset=spring.offset;
        }
      }
      const route=spring.route;
      if(options.cables)line(ctx,route.points,rgba(broken?C.amber:color,active?.21:broken?.19:.052),Math.max(.55,width*.00048));
      if(!options.dataFlow||!active)continue;
      const speed=.07+link.seed*.08,count=link.wan?3:2;
      for(let i=0;i<count;i++){
        const forward=i%2===0,t=frac(time*speed+link.seed+i/count),progress=forward?t:1-t,p=routeAt(route,progress),r=Math.max(.9,width*.0009);
        dot(ctx,p.x,p.y,r,color,.76,4);
        const tail=routeAt(route,clamp(progress+(forward?-.017:.017)));
        line(ctx,[tail,p],rgba(color,.21),r*.85);
      }
    }
  }
  function drawAmbient(ctx,state,time){
    if(!options.motes)return;
    for(let i=0;i<25;i++){
      const s=seedOf('mote'+i),x=frac(s*17.9+Math.sin(time*.028+i)*.012)*width,y=(.24+frac(s*23.7+time*(.002+s*.002))*.66)*height,a=(.05+.055*Math.sin(time*.4+i)**2)*(1+(state.roomDarkness||0)*.5);
      ctx.fillStyle=rgba(i%3?C.white:theme.emission,a);ctx.beginPath();ctx.arc(x,y,.45+s*.8,0,TAU);ctx.fill();
    }
  }
  function draw(ctx,state={},time=0,dt=0,pointer=null){
    if(disposed||!ctx)return;lastState=state;lastTime=Math.max(0,Number(time)||0);const view=currentLayout();
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    drawAmbient(ctx,state,lastTime);drawRoutes(ctx,view,state,lastTime,Math.max(0,dt),pointer);
    for(const entry of Object.values(view.devices)){
      const device=healthOf(state,entry.id);
      if(!isOff(device)&&entry.kind!=='workstation'){const b=entry.bounds;spill(ctx,b.x+b.w*.5,b.y+b.h*.5,b.w*1.35,b.h*1.65,theme.emission,.055);}
      // The room illustration includes healthy lamps. Attenuate that baked
      // activity on the affected chassis before drawing its off-state LEDs.
      // The broad workstation rect also contains furniture; its actual screen
      // is masked separately in drawWorkstation instead of darkening the desk.
      if(isOff(device)&&entry.kind!=='workstation')roundRect(ctx,entry.bounds,2,'rgba(1,6,9,.82)');
      if(state.rearView){drawRearDevice(ctx,entry,device,lastTime,state);continue;}
      if(entry.kind==='hpe')drawHPE(ctx,entry,device,lastTime);
      else if(entry.kind==='dell'||entry.kind==='storage')drawDell(ctx,entry,device,lastTime);
      else if(entry.kind==='switch')drawSwitch(ctx,entry,device,lastTime,state);
      else if(entry.kind==='edge')drawEdge(ctx,entry,device,lastTime,state);
      else if(entry.kind==='firewall')drawFirewall(ctx,entry,device,lastTime);
      else if(entry.kind==='gpu')drawFans(ctx,entry,device,lastTime);
      else if(entry.kind==='nuc')drawNUC(ctx,entry,device,lastTime);
      else if(entry.kind==='ups')drawUPS(ctx,entry,device,lastTime);
      else statusLED(ctx,entry,device,lastTime);
    }
    if(!state.rearView){cachedScreen(ctx,'console',view.console,state,lastTime,20,drawConsole);cachedScreen(ctx,'workstation',view.workstationScreen,state,lastTime,30,drawWorkstation);}
    const hover=pointer&&pointer.active!==false?hitTest(pointer.x,pointer.y):null;
    if(hover&&hover.id!=='console'){
      const entry=view.devices[hover.id];if(entry){ctx.lineWidth=.85;roundRect(ctx,entry.bounds,2,null,rgba(theme.emission,.34));}
    }
    for(let i=pulses.length-1;i>=0;i--){
      const pulse=pulses[i],age=lastTime-pulse.start;if(age>2.3){pulses.splice(i,1);continue;}const entry=view.devices[pulse.id];if(!entry)continue;
      const b=entry.bounds;ctx.lineWidth=Math.max(.6,1-age/3);roundRect(ctx,{x:b.x-2-age*3,y:b.y-2-age*3,w:b.w+4+age*6,h:b.h+4+age*6},3,null,rgba(C.blue,.46*(1-age/2.3)));
    }
    ctx.restore();
  }
  setLayout(layout);
  return{draw,setLayout,setOptions(next={}){
    for(const key of Object.keys(options))if(key in next)options[key]=!!next[key];
    if(next.palette){const nextTheme=roomPalette(next.palette);if(nextTheme.accent!==theme.accent){theme=nextTheme;monitor=monitorPalette(theme.accent);screens.clear();}}
  },hitTest,tap,dispose(){disposed=true;pulses.length=0;springs.clear();screens.clear();}};
}
