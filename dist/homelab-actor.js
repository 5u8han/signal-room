// Only generated, stylized derivatives are loaded here. Photo references never
// enter the public asset tree. All sprite cropping happens at render time.
const TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=n=>n*n*(3-2*n);
const C={green:'#80d793',gold:'#d4b66b',metal:'#727e87',ink:'#15212a',cyan:'#7bdcda',amber:'#ffc77a'};
const NEAR_ARMREST=[
  [.185,.398],[.214,.379],[.357,.368],[.487,.373],[.537,.39],[.555,.416],
  [.532,.434],[.42,.443],[.322,.652],[.246,.652],[.26,.56],[.284,.45],[.215,.43],[.185,.42]
];
function chip(ctx,x,y,w,angle=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);const h=w*.24;
  ctx.fillStyle='#172f2c';ctx.strokeStyle='#6c9d7d';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,2);ctx.fill();ctx.stroke();
  for(let i=0;i<8;i++){ctx.fillStyle='#172020';ctx.fillRect(-w*.43+i*w*.105,-h*.32,w*.076,h*.48);ctx.fillStyle=C.gold;ctx.fillRect(-w*.44+i*w*.11,h*.35,w*.073,h*.16);}
  ctx.restore();
}
function caddy(ctx,x,y,w,angle=0,accent=C.green){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);const h=w*.47;
  ctx.fillStyle='#26313a';ctx.strokeStyle='#88999f';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#0e151a';ctx.fillRect(-w*.34,-h*.31,w*.65,h*.55);ctx.strokeStyle='#859298';ctx.strokeRect(-w*.43,-h*.39,w*.1,h*.77);ctx.fillStyle=accent;ctx.fillRect(w*.30,-h*.13,w*.045,h*.19);ctx.restore();
}

function prepareChair(image){
  // Cache the themed upholstery texture. Only cyan accent pixels change color.
  const width=Math.min(image.width,768),height=Math.round(width*image.height/image.width);
  const fallback={image,source:[0,0,image.width,image.height],setAccent(){}};
  const canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(width,height):globalThis.document?.createElement('canvas');
  if(!canvas)return fallback;
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)return fallback;
  ctx.drawImage(image,0,0,width,height);
  const original=ctx.getImageData(0,0,width,height);
  const recolored=ctx.createImageData(width,height);
  const trim=[];
  let left=width,top=height,right=0,bottom=0;
  for(let i=0;i<original.data.length;i+=4){
    if(original.data[i+3]<32)continue;
    const r=original.data[i],g=original.data[i+1],b=original.data[i+2];
    const x=(i/4)%width,y=Math.floor(i/4/width);
    left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
    const strength=clamp((Math.min(g,b)-r-13)/30);
    if(strength&&g>b*.7)trim.push({index:i,strength,light:clamp((g+b)/290,.58,1.14)});
  }
  if(left>=right||top>=bottom)return fallback;
  let activeAccent;
  return{
    image:canvas,source:[left,top,right-left+1,bottom-top+1],
    setAccent(accent){
      if(accent===activeAccent||!/^#[0-9a-f]{6}$/i.test(accent))return;
      activeAccent=accent;
      const red=parseInt(accent.slice(1,3),16),green=parseInt(accent.slice(3,5),16),blue=parseInt(accent.slice(5,7),16);
      recolored.data.set(original.data);
      for(const {index,strength,light} of trim){
        recolored.data[index]=mix(original.data[index],red*light,strength);
        recolored.data[index+1]=mix(original.data[index+1],green*light,strength);
        recolored.data[index+2]=mix(original.data[index+2],blue*light,strength);
      }
      ctx.putImageData(recolored,0,0);
    }
  };
}

export function createHomelabActor({atlas,chair,width=1920,height=1080,layout,effectsLayout}){
  const cw=atlas.width/4,ch=atlas.height/3,desk=layout.desk;
  const chairArt=prepareChair(chair);
  let lastPose=8,previousPose=8,blend=1,chairX=0,chairV=0,helloUntil=0,printUntil=-Infinity,clicks=0;
  let lastFace=1,previousFace=1,scale=.47,lean=0,seatDepth=1,accent=C.green;
  let state=null,time=0,moving=false,pose=8,face=1,renderX=desk.x,renderY=desk.y,lift=0,repairPlacement=null;
  const toys=[];
  function componentPoint(current,rear){
    const incident=current.incident,point=current.actor.reach;if(!incident||!point)return null;
    let x=rear?1-point.x:point.x,y=point.y;
    const bounds=(rear?effectsLayout?.rear?.devices:effectsLayout?.devices)?.[incident.target],kind=incident.kind;
    if(['drive','capacity'].includes(kind)&&bounds?.driveArea){const area=bounds.driveArea,rows=bounds.rows||1,cols=bounds.cols||8,slot=kind==='capacity'?rows*cols-1:Math.max(0,(current.devices[incident.target].fault?.slot||1)-1);x=area.x+((slot%cols)+.17)*area.w/cols;y=area.y+(Math.floor(slot/cols)+.78)*area.h/rows;}
    if(kind==='psu'&&rear&&bounds){x=bounds.x+bounds.w*.92;y=bounds.y+bounds.h*.71;}
    return{x,y};
  }
  function hello(now){helloUntil=now+3.2;}
  function print(now){printUntil=now+4.8;clicks++;}
  function toss(nx=.1,ny=.65){
    if(toys.length>7)toys.shift();
    toys.push({x:nx,y:ny,vx:.10+Math.random()*.06,vy:-.22-Math.random()*.07,a:-.35,va:2.5+Math.random(),life:9,bounces:0});
  }
  function update(next,now,dt,{motion=true,palette}={}){
    state=next;time=now;moving=motion;const actor=state.actor;
    const seated=actor.state==='seated',sitting=seated&&now>=helloUntil,traveling=actor.state==='walk';
    renderX=actor.x;renderY=actor.y;lift=0;
    if(traveling){pose=0;face=actor.facing==='left'?-1:1;}
    else if(seated){pose=sitting?8:11;face=1;}
    else if(actor.state==='alert'){pose=10;face=1;}
    else if(actor.state==='typing'){pose=7;face=1;}
    else if(actor.state==='verify'){pose=state.phaseProgress>.65?11:0;face=1;}
    else if(actor.state==='repair'){
      const kind=state.incident?.kind;
      pose=['drive','capacity','spill','power'].includes(kind)?6:5;
      if(kind==='drive'&&state.phaseProgress>.39&&state.phaseProgress<.6)pose=9;
      const rear=state.rearView,point=componentPoint(state,rear),viewX=rear?1-actor.x:actor.x;
      const direction=point&&point.x<viewX?-1:1,reach=pose===6?.045:pose===9?.045:.065;
      const targetX=point?point.x-direction*reach:viewX,t=smooth(clamp(state.phaseProgress/.09));
      const foot=mix(viewX,targetX,t);renderX=rear?1-foot:foot;face=rear?-direction:direction;
      if(['network','fan'].includes(kind)&&point){lift=clamp(actor.y-.326-point.y,0,.14)*t;renderY-=lift;}
      repairPlacement={serial:state.incident.serial,x:renderX,y:renderY};
    }else{pose=0;face=1;}
    if(actor.state==='verify'&&repairPlacement?.serial===state.incident?.serial){renderX=repairPlacement.x;renderY=repairPlacement.y;}
    if(now<helloUntil&&actor.state!=='walk'&&actor.state!=='seated'){pose=11;face=1;}
    if(pose!==lastPose||face!==lastFace){
      previousPose=lastPose;previousFace=lastFace;lastPose=pose;lastFace=face;blend=0;
    }
    const settle=motion?1-Math.exp(-dt*13):1;
    seatDepth=mix(seatDepth,sitting?1:0,settle);
    scale=mix(scale,sitting?.47:actor.state==='typing'?.405:.445,settle);
    lean=mix(lean,traveling&&motion?face*.027*Math.sin(Math.PI*state.phaseProgress):0,settle);
    renderY-=seatDepth*.014;
    blend=motion?Math.min(1,blend+dt*5.5):1;
    if(palette?.accent){accent=palette.accent;chairArt.setAccent(accent);}
    const chairTarget=sitting?0:-.018;
    if(dt>0){chairV+=(chairTarget-chairX)*32*dt;chairV*=Math.exp(-7*dt);chairX+=chairV*dt;}
    if(!motion){chairX=chairTarget;chairV=0;}
    for(let i=toys.length-1;i>=0;i--){
      const p=toys[i];p.life-=dt;p.vy+=.65*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.va*dt;
      if(p.y>.9){p.y=.9;p.vy=-p.vy*.46;p.vx*=.77;p.va*=.64;p.bounces++;if(Math.abs(p.vy)<.013)p.vy=0;}
      if(p.x>.96||p.x<.035)p.vx*=-.65;
      if(p.life<=0)toys.splice(i,1);
    }
  }
  function drawSprite(ctx,index,x,y,size,direction,tilt,alpha=1){
    const sx=(index%4)*cw,sy=Math.floor(index/4)*ch;
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(tilt);ctx.scale(direction,1);
    if(state.roomDarkness>.002)ctx.filter=`brightness(${1-state.roomDarkness*.62})`;
    ctx.drawImage(atlas,sx+1,sy+1,cw-2,ch-2,-size*.5,-size*.968,size,size);
    ctx.restore();
  }
  function drawChair(ctx,rear,foreground=false){
    const center=desk.x-.023+chairX,x=rear?1-center:center;
    const h=height*.36,w=h*chairArt.source[2]/chairArt.source[3];
    ctx.save();ctx.translate(x*width,(desk.y+.017)*height);if(rear)ctx.scale(-1,1);
    if(state.roomDarkness>.002)ctx.filter=`brightness(${1-state.roomDarkness*.67})`;
    ctx.translate(-w/2,-h);
    if(foreground){
      // The near pad and its support sit in front of the thigh. The opposite
      // pad and the backrest are already rendered underneath the character.
      ctx.globalAlpha*=seatDepth;
      ctx.beginPath();
      NEAR_ARMREST.forEach(([u,v],i)=>i?ctx.lineTo(u*w,v*h):ctx.moveTo(u*w,v*h));
      ctx.closePath();ctx.clip();
    }
    ctx.drawImage(chairArt.image,...chairArt.source,0,0,w,h);ctx.restore();
  }
  function drawRepair(ctx,rear){
    const incident=state.incident;if(!incident||state.phase!=='repair')return;
    const kind=incident.kind,p=state.phaseProgress,point=componentPoint(state,rear);
    if(!point)return;const x=point.x*width,y=point.y*height,sgn=rear?-1:1;
    ctx.save();ctx.lineJoin='round';
    if(kind==='memory'&&!rear){
      const open=smooth(clamp(p/.2))*smooth(clamp((1-p)/.12)),w=width*.091,h=height*.055;
      ctx.translate(x,y+height*.076);
      ctx.fillStyle='#2e3a42';ctx.strokeStyle='#8e9aa0';ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,-h/2);ctx.lineTo(w/2+9,h*.72*open);ctx.lineTo(-w/2-9,h*.72*open);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#255047';ctx.fillRect(-w*.39,-h*.27,w*.78,h*.48);
      for(let i=0;i<4;i++){ctx.fillStyle=i<2?'#69a98d':'#222d2b';ctx.fillRect(-w*.32+i*w*.18,-h*.18,w*.11,h*.35);}
      const add=clamp((p-.25)/.45);chip(ctx,w*.18,-h*.08-(1-add)*height*.055,width*.041,-(1-add)*.18);
      ctx.strokeStyle='#a5b4b8';ctx.beginPath();ctx.moveTo(-w*.48,h*.7*open);ctx.lineTo(w*.48,h*.7*open);ctx.stroke();
    }else if(kind==='drive'||kind==='capacity'){
      const out=Math.sin(p*Math.PI),xx=x-sgn*out*width*.045,yy=y+out*height*.05;
      caddy(ctx,xx,yy,width*.025,sgn*out*.1,accent);
    }else if(kind==='psu'&&rear){
      const rectX=x,rectY=y,direction=Math.sign((rear?1-renderX:renderX)-point.x)||1,offset=Math.sin(p*Math.PI)*width*.016*direction;
      ctx.translate(rectX+offset,rectY);const metal=ctx.createLinearGradient(0,-height*.015,0,height*.015);metal.addColorStop(0,'#a2abb0');metal.addColorStop(.35,'#56636c');metal.addColorStop(1,'#303d46');ctx.fillStyle=metal;ctx.strokeStyle='#b7c1c2';ctx.lineWidth=1;
      ctx.fillRect(-width*.017,-height*.015,width*.034,height*.03);ctx.strokeRect(-width*.017,-height*.015,width*.034,height*.03);
      ctx.fillStyle='#15212a';for(let row=0;row<3;row++)for(let col=0;col<7;col++)ctx.fillRect(-width*.014+col*width*.0028,-height*.009+row*height*.006,width*.0015,height*.0027);
      ctx.strokeStyle=accent;ctx.beginPath();ctx.arc(width*.008,0,height*.011,-1.2,1.2);ctx.stroke();
    }else if(kind==='fan'){
      const out=Math.sin(p*Math.PI),r=height*.016;ctx.translate(x-width*.035*out,y+height*.04*out);ctx.rotate(out*.7);
      ctx.fillStyle='#29373e';ctx.fillRect(-r,-r,r*2,r*2);ctx.strokeStyle='#98a7ad';ctx.strokeRect(-r,-r,r*2,r*2);ctx.beginPath();ctx.arc(0,0,r*.75,0,TAU);ctx.stroke();
    }
    ctx.restore();
  }
  function drawSpill(ctx,rear){
    if(state.incident?.kind!=='spill'||['verify','return','idle'].includes(state.phase))return;
    const p=state.phase==='notice'?Math.min(1,state.phaseProgress*2):1,x=(rear?.12:.90)*width,y=height*.662;
    ctx.save();ctx.fillStyle='#7db5b954';ctx.beginPath();ctx.ellipse(x,y,width*.029*p,height*.006*p,.08,0,TAU);ctx.fill();
    if(state.phase==='notice')for(let i=0;i<4;i++){const t=clamp(p-i*.1);ctx.beginPath();ctx.ellipse(x+Math.sin(i*4)*width*.012,y+height*(t*t*.18),2,3,0,0,TAU);ctx.fill();}
    ctx.restore();
  }
  function drawPrint(ctx,rear){
    if(time>printUntil)return;const age=4.8-(printUntil-time),progress=clamp(age/.9),x=(rear?.517:.476)*width,y=height*.708;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(age*2)*.022*(1-progress));
    ctx.fillStyle='#e5e5d8';ctx.fillRect(-width*.018,-height*.028*progress,width*.036,height*.033*progress);
    if(progress>.7){ctx.fillStyle='#2a3336';ctx.font=`${width*.0034}px monospace`;ctx.textAlign='center';ctx.fillText(clicks%3===0?'PC LOAD LETTER':'IT WORKS HERE.',0,-height*.005);}
    ctx.restore();
  }
  function drawCharacter(ctx,{rear=false,offsetY=0,scaleMultiplier=1,alpha=1}={}){
    if(!state||alpha<=0)return;
    const x=(rear?1-renderX:renderX)*width;
    const idleMotion=moving&&state.actor.state!=='walk'?Math.sin(time*1.65)*.00065:0;
    const y=(renderY+idleMotion)*height+offsetY;
    const size=height*scale*scaleMultiplier;
    ctx.save();
    ctx.globalAlpha*=alpha;
    if(blend<1)drawSprite(ctx,previousPose,x,y,size,rear?-previousFace:previousFace,rear?-lean:lean,1-blend);
    drawSprite(ctx,pose,x,y,size,rear?-face:face,rear?-lean:lean,blend);
    if(seatDepth>.01&&offsetY===0&&scaleMultiplier===1)drawChair(ctx,rear,true);
    if(state.actor.state==='alert'){
      const r=size*.043,cy=y-size*.92,fade=moving?.58+.19*Math.sin(time*5):.7;
      ctx.strokeStyle=`rgba(255,194,112,${fade})`;ctx.lineWidth=1.8;
      for(let i=0;i<5;i++){const a=-Math.PI*.95+i*Math.PI*.225;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*1.1,cy+Math.sin(a)*r*1.1);ctx.lineTo(x+Math.cos(a)*r*1.7,cy+Math.sin(a)*r*1.7);ctx.stroke();}
    }
    ctx.restore();
  }
  function draw(ctx,{rear=false,separateCharacter=false}={}){
    if(!state)return;
    drawSpill(ctx,rear);drawChair(ctx,rear);drawRepair(ctx,rear);
    const x=rear?1-renderX:renderX;
    const actor=state.actor;
    const stepHeight=lift||((actor.state==='verify'&&repairPlacement?.serial===state.incident?.serial)?actor.y-renderY:0);
    if(stepHeight>.008){const xx=x*width,top=renderY*height,base=actor.y*height,w=width*.045;ctx.save();ctx.strokeStyle='#85929a';ctx.fillStyle='#29353d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xx-w*.4,top);ctx.lineTo(xx-w*.5,base);ctx.moveTo(xx+w*.4,top);ctx.lineTo(xx+w*.5,base);ctx.stroke();ctx.fillRect(xx-w*.45,top,w*.9,height*.008);ctx.fillRect(xx-w*.48,mix(top,base,.58),w*.96,height*.005);ctx.restore();}
    ctx.save();ctx.globalAlpha=.30;ctx.fillStyle='#080f16';ctx.beginPath();ctx.ellipse(x*width,(renderY+.004)*height,width*mix(.024,.042,seatDepth),height*.008,0,0,TAU);ctx.fill();ctx.restore();
    if(!separateCharacter)drawCharacter(ctx,{rear});
    for(const p of toys){ctx.save();ctx.globalAlpha=clamp(p.life/1.4);chip(ctx,(rear?1-p.x:p.x)*width,p.y*height,width*.038,rear?-p.a:p.a);ctx.restore();}
    drawPrint(ctx,rear);
  }
  return{update,draw,drawCharacter,hello,print,toss,hasToys:()=>toys.length>0,position:()=>({x:renderX,y:renderY})};
}
