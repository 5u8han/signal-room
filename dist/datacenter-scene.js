/* Original code-native art. All faults, consoles and service actions are illustrations. */
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const TAU=Math.PI*2;
const VARIANTS={cinematic:{title:'01 / AFTER HOURS',subtitle:'ISOMETRIC / CONTINUOUS FIELD STUDY'},pixel:{title:'02 / THE LAST ALERT',subtitle:'PIXEL WORLD / ONE TECHNICIAN'},blueprint:{title:'03 / SIGNAL & STRUCTURE',subtitle:'TECHNICAL ATLAS / A LIVING PLAN'}};
const FAULTS=[
  {code:'RX_LOSS',short:'UPLINK LOST',detail:'SFP / RECEIVE SIGNAL LOST',action:'RESEAT TRANSCEIVER',done:'LINK RESTORED',color:'#ff795f'},
  {code:'PSU_WARN',short:'POWER PATH B',detail:'SECONDARY POWER PATH OFFLINE',action:'CHECK / RESTORE POWER',done:'REDUNDANCY RESTORED',color:'#f9b56f'},
  {code:'FAN_WARN',short:'AIRFLOW ALERT',detail:'FAN MODULE REQUIRES ATTENTION',action:'SERVICE FAN / VERIFY AIRFLOW',done:'THERMAL CHECKS CLEAR',color:'#f7a479'}
];
const STAGES=[{end:1.5,name:'ALERT',verb:'A fault enters the queue.'},{end:4.5,name:'RESPOND',verb:'Moving to the KVM console.'},{end:6.5,name:'DIAGNOSE',verb:'Tracing the fault to its source.'},{end:9.5,name:'SERVICE',verb:'Moving from the console to the rack.'},{end:12,name:'REPAIR',verb:'Inspect. Isolate. Restore.'},{end:14,name:'VERIFY',verb:'Checking the system before moving on.'},{end:15,name:'CLEAR',verb:'One signal restored. On to the next.'}];
function atPath(points,progress){const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));let remaining=clamp(progress)*lengths.reduce((a,b)=>a+b,0);for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i]||i===lengths.length-1){const t=lengths[i]?remaining/lengths[i]:1;return{x:mix(points[i].x,points[i+1].x,t),y:mix(points[i].y,points[i+1].y,t)}}remaining-=lengths[i]}return points.at(-1)}
function polygon(ctx,points,fill,stroke,lineWidth=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke()}}
function line(ctx,points,color,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function roundRect(ctx,x,y,w,h,r=4,fill,stroke,width=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function text(ctx,content,x,y,size=10,color='#cae7db',weight=400,font='Geist',align='left'){ctx.font=`${weight} ${size}px ${font}, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(content,x,y)}
function circle(ctx,x,y,r,fill,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}

export function mountDatacenterScene({container,variant='cinematic',motion=()=>true}={}){
  if(!container)throw new Error('A datacenter scene needs a container.');
  if(!VARIANTS[variant])variant='cinematic';
  container.classList.add('datacenter-world');container.dataset.dcVariant=variant;
  const canvas=document.createElement('canvas');canvas.className='dc-scene-canvas';canvas.setAttribute('role','img');canvas.tabIndex=0;
  const label=document.createElement('div');label.className='dc-world-label';label.innerHTML='<i aria-hidden="true"></i><span data-dc-title></span><span data-dc-subtitle></span>';
  const caption=document.createElement('div');caption.className='dc-scene-caption';caption.innerHTML='<strong data-dc-caption>Illustrated service sequence</strong><span>Choose a rack to send the technician.</span>';
  const controls=document.createElement('div');controls.className='dc-scene-controls';controls.innerHTML='<button type="button" data-dc-next>Next fault ↗</button><button type="button" data-dc-pause>Pause scene</button><button type="button" data-dc-reset aria-label="Restart the datacenter sequence">↺</button>';
  const live=document.createElement('p');live.className='dc-scene-live';live.setAttribute('role','status');live.setAttribute('aria-live','polite');
  container.append(canvas,label,caption,controls,live);
  const ctx=canvas.getContext('2d'),pixel=document.createElement('canvas'),pctx=pixel.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=1,height=1,dpr=1,clock=0,last=0,raf=0,visible=true,paused=false,dead=false,incident=0,manualRack=null,lastStatus='',hitboxes=[],currentStatus=null;
  const cleanup=[];
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);cleanup.push(()=>target.removeEventListener(type,fn,options))}
  function running(){return!dead&&!paused&&visible&&!document.hidden&&!reduced.matches&&motion()!==false}
  function story(){const ordinal=Math.floor(clock/15),local=clock%15;const rack=manualRack===null?[1,4,2][ordinal%3]:(manualRack+ordinal)%6;const fault=FAULTS[(manualRack===null?ordinal:rack)%3];let index=STAGES.findIndex(stage=>local<stage.end);if(index<0)index=6;const start=index?STAGES[index-1].end:0;const previous=manualRack===null?[1,4,2][(ordinal+2)%3]:(rack+5)%6;return{ordinal,local,rack,previous,fault,index,progress:(local-start)/(STAGES[index].end-start),stage:STAGES[index],resolved:index>=5,moving:index===1||index===3}}
  function report(state){const detail={variant,phase:state.stage.name,rack:`R${String(state.rack+1).padStart(2,'0')}`,error:state.fault.short,action:state.resolved?state.fault.done:state.fault.action,description:state.stage.verb,progress:state.local/15,illustration:true};currentStatus=detail;const key=[variant,state.ordinal,state.rack,state.index].join('/');if(key===lastStatus)return;lastStatus=key;const message=`${detail.rack}: ${detail.error}. ${detail.phase}. ${detail.description}`;live.textContent=message;canvas.setAttribute('aria-label',`${VARIANTS[variant].title}. An illustrated technician diagnoses and repairs datacenter faults. ${message} Select a rack with the pointer, or use the next-fault button.`);container.dispatchEvent(new CustomEvent('datacenter:status',{detail,bubbles:true}));caption.querySelector('[data-dc-caption]').textContent=state.resolved?state.fault.done:`${detail.rack} / ${state.stage.name}`}
  function fit(){const rect=container.getBoundingClientRect();width=Math.max(1,Math.round(rect.width));height=Math.max(1,Math.round(rect.height));dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}
  function draw(){if(dead)return;const state=story();report(state);hitboxes=[];ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);if(variant==='pixel')drawPixel(state);else if(variant==='blueprint')drawBlueprint(state);else drawCinematic(state)}
  function frame(now){raf=0;if(!running()){last=0;return}const dt=last?Math.min((now-last)/1000,.04):0;last=now;clock+=dt;draw();if(running())raf=requestAnimationFrame(frame)}
  function schedule(){if(raf){cancelAnimationFrame(raf);raf=0}last=0;controls.querySelector('[data-dc-pause]').textContent=reduced.matches?'Still scene':paused?'Play scene':'Pause scene';controls.querySelector('[data-dc-pause]').setAttribute('aria-pressed',String(paused||reduced.matches));draw();if(running())raf=requestAnimationFrame(frame)}
  function dispatch(rackIndex){manualRack=((Math.round(rackIndex)%6)+6)%6;clock=0;lastStatus='';schedule();return currentStatus}
  function reset(){manualRack=null;clock=0;lastStatus='';schedule()}
  function setVariant(next){if(!VARIANTS[next])return;variant=next;container.dataset.dcVariant=variant;label.querySelector('[data-dc-title]').textContent=VARIANTS[variant].title;label.querySelector('[data-dc-subtitle]').textContent=VARIANTS[variant].subtitle;lastStatus='';schedule()}
  function pause(value=true){paused=!!value;schedule()}
  listen(controls.querySelector('[data-dc-next]'),'click',()=>dispatch((story().rack+1)%6));
  listen(controls.querySelector('[data-dc-reset]'),'click',reset);
  listen(controls.querySelector('[data-dc-pause]'),'click',()=>{if(!reduced.matches)pause(!paused)});
  listen(canvas,'pointerup',event=>{const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;const hit=hitboxes.slice().reverse().find(box=>x>=box.x&&x<=box.x+box.w&&y>=box.y&&y<=box.y+box.h);if(hit)dispatch(hit.id)});
  listen(canvas,'pointermove',event=>{const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;canvas.style.cursor=hitboxes.some(box=>x>=box.x&&x<=box.x+box.w&&y>=box.y&&y<=box.y+box.h)?'pointer':'default'});
  listen(canvas,'keydown',event=>{if(['ArrowRight','ArrowLeft','Enter',' '].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft')dispatch(story().rack-1);else dispatch(story().rack+1)}});
  listen(document,'visibilitychange',schedule);listen(reduced,'change',schedule);
  for(const event of ['portfolio:motionchange','atlas:motionchange','portfolio:themechange','studio:motionchange'])listen(window,event,schedule);
  const resize=new ResizeObserver(fit);resize.observe(container);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;schedule()},{threshold:.01});intersection.observe(container);
  document.fonts?.ready.then(()=>{if(!dead)draw()});
  const dispose=()=>{if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);resize.disconnect();intersection.disconnect();cleanup.forEach(fn=>fn());[canvas,label,caption,controls,live].forEach(el=>el.remove());container.classList.remove('datacenter-world');delete container.dataset.dcVariant};
  listen(window,'pagehide',dispose,{once:true});setVariant(variant);fit();

  function drawCinematic(state){
    const w=width,h=height,portrait=w<700,rx=w/(portrait?9.8:13.2),ry=rx*.43,hu=rx*1.2,cx=w*.54,cy=h*(portrait?.53:.49);
    const project=(x,z,y=0)=>({x:cx+(x-z)*rx,y:cy+(x+z)*ry-y*hu});
    const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#071117');bg.addColorStop(.55,'#0a1d23');bg.addColorStop(1,'#031013');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const haze=ctx.createRadialGradient(w*.52,h*.53,0,w*.52,h*.53,w*.7);haze.addColorStop(0,'#3e7b711c');haze.addColorStop(1,'#05121600');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
    for(let i=0;i<54;i++){const x=(i*193.7%w),y=(i*71.39%h);circle(ctx,x,y,.5+(i%3)*.3,`rgba(164,218,200,${.04+(i%4)*.015})`)}
    const floor=[project(-1,-.85),project(4.8,-.85),project(4.8,4.85),project(-1,4.85)];polygon(ctx,floor,'#0c242a','#41686077',1);
    for(let x=-1;x<=4.8;x+=.5)line(ctx,[project(x,-.85),project(x,4.85)],'#7aa69713',.6);
    for(let z=-.85;z<=4.85;z+=.5)line(ctx,[project(-1,z),project(4.8,z)],'#7aa69713',.6);
    for(const z of[1.5,2.25]){line(ctx,[project(-.7,z),project(4.3,z)],'#73b5a138',1);const pulse=((clock*.34+(z===1.5?0:.5))%1)*4.9-.7;const p=project(pulse,z);circle(ctx,p.x,p.y,Math.max(1,rx*.021),'#7ce1c9');}
    const rackPositions=[{x:-.35,z:0},{x:1,z:0},{x:2.35,z:0},{x:-.35,z:3.25},{x:1,z:3.25},{x:2.35,z:3.25}];
    const spot=id=>({x:rackPositions[id].x+.5,y:rackPositions[id].z+.9});
    const consoleSpot={x:4.0,y:1.6};
    let person=spot(state.previous);
    if(state.index===1)person=atPath([person,{x:person.x,y:2.2},{x:consoleSpot.x,y:2.2},consoleSpot],smooth(state.progress));
    else if(state.index===2)person=consoleSpot;
    else if(state.index===3){const goal=spot(state.rack);person=atPath([consoleSpot,{x:consoleSpot.x,y:2.2},{x:goal.x,y:2.2},goal],smooth(state.progress));}
    else if(state.index>=4)person=spot(state.rack);
    const goal=spot(state.rack),start=consoleSpot;
    line(ctx,[project(start.x,start.y,.01),project(start.x,2.2,.01),project(goal.x,2.2,.01),project(goal.x,goal.y,.01)],state.resolved?'#72dfaf44':'#f28b6644',Math.max(.8,rx*.012));
    const entities=rackPositions.map((p,id)=>({...p,id,type:'rack',depth:p.x+p.z}));entities.push({type:'person',x:person.x,z:person.y,depth:person.x+person.y+.7});entities.push({type:'console',x:4.0,z:1.15,depth:5.1});entities.sort((a,b)=>a.depth-b.depth);
    for(const entity of entities){if(entity.type==='rack')drawIsoRack(entity);else if(entity.type==='person')drawIsoPerson(person);else drawIsoConsole(entity)}
    // Physical strip lights connect the distant edge to the immediate foreground.
    for(const x of[-.95,4.75]){line(ctx,[project(x,-.7,.03),project(x,4.7,.03)],'#6faca766',Math.max(1,rx*.028));}
    const left=project(-1,4.9);text(ctx,'SERVICE AISLE / SELECT A RACK',left.x+3,left.y+Math.max(16,rx*.2),Math.max(5,rx*.075),'#749b91',500);
    drawConsolePanel(ctx,portrait?{x:18,y:59,w:w-36,h:117}:{x:w*.66,y:65,w:w*.30,h:137},state,'cinematic');
    if(!portrait){text(ctx,'SIGNALS AFTER DARK.',30,h-115,Math.min(48,w*.038),'#88b4a125',700,'Display');text(ctx,'FIELD STUDY / NOT A LIVE SYSTEM',31,h-88,7,'#68877d',500);}
    function drawIsoRack(p){
      const rw=.88,rd=.62,rh=2.73;const fbl=project(p.x,p.z+rd),fbr=project(p.x+rw,p.z+rd),ftl=project(p.x,p.z+rd,rh),ftr=project(p.x+rw,p.z+rd,rh),btl=project(p.x,p.z,rh),btr=project(p.x+rw,p.z,rh),bbr=project(p.x+rw,p.z);
      polygon(ctx,[project(p.x-.1,p.z+.2),project(p.x+1.1,p.z+.2),project(p.x+1.1,p.z+1.05),project(p.x-.1,p.z+1.05)],'#00000045');
      polygon(ctx,[ftl,ftr,btr,btl],'#1c383d','#527c7370',.8);polygon(ctx,[fbr,bbr,btr,ftr],'#0b191e','#405e5e88',.8);polygon(ctx,[fbl,fbr,ftr,ftl],'#102a31','#678f8688',1);
      const face=(u,v)=>({x:mix(fbl.x,fbr.x,u)+(ftl.x-fbl.x)*v,y:mix(fbl.y,fbr.y,u)+(ftl.y-fbl.y)*v});
      const q=(x,y,ww,hh,fill,stroke,width=.7)=>polygon(ctx,[face(x,y),face(x+ww,y),face(x+ww,y+hh),face(x,y+hh)],fill,stroke,width);
      q(.065,.055,.87,.9,'#061419','#23484c',.5);
      const active=p.id===state.rack,color=active?(state.resolved?'#88e2b8':state.fault.color):'#66bcae';
      q(.08,.925,.83,.022,color);q(.06,.03,.02,.90,'#52746e');q(.92,.03,.02,.90,'#52746e');
      for(let row=0;row<9;row++){
        const vy=.09+row*.087;q(.10,vy,.79,.065,'#153137','#31505788',.5);
        for(let unit=0;unit<5;unit++){q(.14+unit*.105,vy+.013,.079,.039,unit===3?'#13252c':'#213e41','#43615c44',.4);}
        const led=face(.80,vy+.034);circle(ctx,led.x,led.y,Math.max(.7,rx*.01),active&&row===5?color:row%3===0?'#8fe5bd':'#4e968b');
        for(let k=0;k<3;k++){const vent=face(.69+k*.018,vy+.022);line(ctx,[vent,face(.69+k*.018,vy+.047)],'#5a7970',.5)}
      }
      for(let row=0;row<4;row++){const a=project(p.x+rw,p.z+.10+row*.12,.38),b=project(p.x+rw,p.z+.10+row*.12,2.34);line(ctx,[a,b],'#53756b44',.6)}
      const lab=face(.12,.87);text(ctx,`R${String(p.id+1).padStart(2,'0')}`,lab.x,lab.y,Math.max(5,rx*.09),'#b7d1c3',500);
      if(active){const ring=project(p.x+.43,p.z+.31,rh+.25);const rr=rx*(.14+.025*Math.sin(clock*2));if(!state.resolved){const ping=(clock*.58)%1;circle(ctx,ring.x,ring.y,rx*(.18+ping*.38),null,`rgba(247,136,105,${(1-ping)*.38})`,.7)}circle(ctx,ring.x,ring.y,rr,'#081d22',color,1);text(ctx,state.resolved?'✓':'!',ring.x,ring.y+Math.max(2,rx*.04),Math.max(7,rx*.14),color,500,'Geist','center');line(ctx,[ring,project(p.x+.43,p.z+.31,rh+.02)],color,.8);if(state.index===4){for(let i=0;i<5;i++){const a=clock*4+i*TAU/5,origin=face(.48,.47);circle(ctx,origin.x+Math.cos(a)*rx*.12,origin.y+Math.sin(a)*rx*.10,Math.max(.6,rx*.012),'#ffd0a3')}}}
      hitboxes.push({id:p.id,x:Math.min(ftl.x,fbl.x),y:Math.min(ftl.y,btl.y),w:fbr.x-Math.min(ftl.x,fbl.x),h:fbr.y-Math.min(ftl.y,btl.y)});
    }
    function drawIsoConsole(p){const foot=project(p.x,p.z),s=rx*.78;polygon(ctx,[{x:foot.x-s*.48,y:foot.y},{x:foot.x+s*.52,y:foot.y+s*.30},{x:foot.x+s*.75,y:foot.y+s*.19},{x:foot.x-s*.24,y:foot.y-s*.10}],'#456964','#78978b',.6);line(ctx,[{x:foot.x+s*.10,y:foot.y-s*.05},{x:foot.x+s*.10,y:foot.y-s*.72}],'#5d7d72',s*.08);roundRect(ctx,foot.x-s*.42,foot.y-s*1.30,s*1.05,s*.68,1,'#18343b','#759c91',1);roundRect(ctx,foot.x-s*.35,foot.y-s*1.23,s*.91,s*.52,0,'#07181f');for(let i=0;i<5;i++)line(ctx,[{x:foot.x-s*.25,y:foot.y-s*1.13+i*s*.075},{x:foot.x+s*(i%2?.35:.48),y:foot.y-s*1.13+i*s*.075}],i===1&&!state.resolved?state.fault.color:'#74c6ad',Math.max(.6,rx*.012));const glow=ctx.createRadialGradient(foot.x,foot.y-s,0,foot.x,foot.y-s,s);glow.addColorStop(0,'#5dd6c21f');glow.addColorStop(1,'#5dd6c200');ctx.fillStyle=glow;ctx.fillRect(foot.x-s,foot.y-s*2,s*2,s*2)}
    function drawIsoPerson(pos){const p=project(pos.x,pos.y),s=rx*.88,walking=state.moving,step=walking?Math.sin(clock*10):Math.sin(clock*2)*.06,repair=state.index===4;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-.025);ctx.scale(s,s);ctx.save();ctx.scale(1,.34);circle(ctx,0,0,.30,'#0006');ctx.restore();line(ctx,[{x:-.09,y:-.04},{x:-.11+step*.10,y:-.35}],'#0a1b23',.15);line(ctx,[{x:.12,y:0},{x:.10-step*.10,y:-.35}],'#0b1a20',.15);line(ctx,[{x:-.12+step*.10,y:-.35},{x:-.10,y:-.63}],'#24353a',.13);line(ctx,[{x:.10-step*.10,y:-.35},{x:.10,y:-.63}],'#29393c',.13);roundRect(ctx,-.23,-1.00,.45,.48,.10,'#d08057','#ecad79',.013);roundRect(ctx,-.27,-.96,.10,.32,.03,'#7d553c');line(ctx,[{x:-.19,y:-.91},{x:-.29-step*.09,y:-.63}], '#c1805b',.12);const handX=repair?.34+Math.sin(clock*8)*.03:.24+step*.10,handY=repair?-.95:-.65;line(ctx,[{x:.18,y:-.92},{x:handX,y:handY}],'#db9167',.13);circle(ctx,handX,handY,.065,'#e9ba91');circle(ctx,.005,-1.16,.185,'#e4b48b');polygon(ctx,[{x:-.17,y:-1.18},{x:-.14,y:-1.36},{x:.12,y:-1.35},{x:.19,y:-1.18},{x:.08,y:-1.22}],'#1d292a');roundRect(ctx,-.02,-.77,.12,.11,.01,'#1d3339');line(ctx,[{x:-.13,y:-.97},{x:.13,y:-.97}],'#f2c895',.013);ctx.restore()}
  }

  function drawPixel(state){
    const pw=width<700?360:720,ph=Math.round(pw*height/width),mobile=width<700;
    if(pixel.width!==pw||pixel.height!==ph){pixel.width=pw;pixel.height=ph}const c=pctx;c.imageSmoothingEnabled=false;c.fillStyle='#101329';c.fillRect(0,0,pw,ph);
    const R=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
    const T=(message,x,y,size=8,color='#c4c2db',align='left')=>{c.font=`${size}px monospace`;c.textAlign=align;c.textBaseline='top';c.fillStyle=color;c.fillText(message,Math.round(x),Math.round(y))};
    const floorY=mobile?ph*.89:ph*.81;
    for(let y=45;y<ph-38;y+=22)for(let x=12;x<pw;x+=22)R(x,y,1,1,'#2a2c42');
    R(0,floorY,pw,ph-floorY,'#20203c');for(let x=0;x<pw;x+=24)R(x,floorY,1,ph-floorY,'#35334a');for(let y=floorY;y<ph;y+=13)R(0,y,pw,1,'#35334a');
    R(14,49,pw-28,5,'#383652');R(14,55,5,30,'#383652');R(pw-19,55,5,30,'#383652');for(let i=0;i<7;i++){const xx=26+i*(pw-52)/6;R(xx,50,5,18+(i%3)*8,'#4c4055');R(xx+5,62+(i%3)*8,40,3,'#51415b');}
    const rackW=mobile?74:82,rackH=mobile?104:144,gap=mobile?(pw-42-rackW*3)/2:(pw-48-rackW*6)/5;
    const positions=Array.from({length:6},(_,i)=>({x:mobile?21+(i%3)*(rackW+gap):24+i*(rackW+gap),y:mobile?(i<3?ph*.36:ph*.65):floorY-rackH-17}));
    const spot=id=>({x:positions[id].x+rackW*.56,y:positions[id].y+rackH+13});
    const console={x:mobile?pw*.5:pw-63,y:mobile?ph*.29:floorY+7};
    let hero=spot(state.previous);const lane=pw-9;
    if(state.index===1)hero=atPath([hero,{x:lane,y:hero.y},{x:lane,y:console.y},console],smooth(state.progress));
    else if(state.index===2)hero=console;
    else if(state.index===3){const goal=spot(state.rack);hero=atPath([console,{x:lane,y:console.y},{x:lane,y:goal.y},goal],smooth(state.progress));}
    else if(state.index>=4)hero=spot(state.rack);
    const monitor={x:mobile?24:pw*.57,y:mobile?69:62,w:mobile?pw-48:pw*.38,h:mobile?91:79};
    R(monitor.x-5,monitor.y-5,monitor.w+10,monitor.h+10,'#4b4a69');R(monitor.x-3,monitor.y-3,monitor.w+6,monitor.h+6,'#272c47');R(monitor.x,monitor.y,monitor.w,monitor.h,'#071e29');R(monitor.x,monitor.y,monitor.w,3,state.resolved?'#8be6af':'#fa9a6b');
    T('KVM / '+`R${String(state.rack+1).padStart(2,'0')}`,monitor.x+10,monitor.y+10,8,'#94d0bd');T(state.resolved?'[OK] '+state.fault.done:'[!] '+state.fault.short,monitor.x+10,monitor.y+26,mobile?8:9,state.resolved?'#d7ff67':'#ff9b7b');T('> '+(state.index<2?'WAITING FOR TECH':state.index<4?'TRACE / '+state.fault.code:state.index<5?'SERVICE IN PROGRESS':'VERIFY / COMPLETE'),monitor.x+10,monitor.y+43,7,'#7bc4bd');
    for(let j=0;j<8;j++)R(monitor.x+10+j*(monitor.w-24)/8,monitor.y+monitor.h-18,Math.max(5,(monitor.w-30)/8),4,j<Math.floor(state.local/15*8)?'#a5d171':'#254451');
    if(!mobile){T('NO SUCH THING',24,82,13,'#e9e2cf');T('AS A QUIET RACK.',24,101,13,'#d7ff67');T('ILLUSTRATED SERVICE LOOP',25,127,6,'#92889f')}
    const lit=state.resolved?'#d7ff67':state.fault.color;
    positions.forEach((rack,id)=>{
      const active=id===state.rack;R(rack.x-3,rack.y-5,rackW+6,rackH+8,'#050b18');R(rack.x,rack.y,rackW,rackH,'#3c3c59');R(rack.x+4,rack.y+4,rackW-8,rackH-8,'#171f34');R(rack.x+2,rack.y+2,rackW-4,3,active?lit:'#8f89ab');
      const rows=mobile?6:8;for(let j=0;j<rows;j++){const yy=rack.y+14+j*(rackH-23)/rows;R(rack.x+7,yy,rackW-14,mobile?10:12,'#303e51');for(let k=0;k<4;k++){R(rack.x+10+k*10,yy+3,7,4,j%3===0?'#50616c':'#243348');R(rack.x+11+k*10,yy+3,1,4,'#7d8590')}
      R(rack.x+rackW-16,yy+3,3,3,active&&j===3?lit:(j+id)%4===0?'#d3ef9d':'#6fafa5');R(rack.x+rackW-11,yy+3,2,3,'#55938e');}
      T(`R${String(id+1).padStart(2,'0')}`,rack.x+8,rack.y+rackH-9,5,'#b5c2bb');R(rack.x+7,rack.y+rackH+3,8,5,'#050c18');R(rack.x+rackW-15,rack.y+rackH+3,8,5,'#050c18');
      if(active){const yy=rack.y-20-Math.round(Math.sin(clock*3)*2);R(rack.x+rackW*.5-6,yy,12,12,lit);T(state.resolved?'✓':'!',rack.x+rackW*.5,yy+2,8,'#1e2035','center');R(rack.x+rackW*.5-1,yy+13,2,5,lit)}
      hitboxes.push({id,x:rack.x/pw*width,y:(rack.y-18)/ph*height,w:rackW/pw*width,h:(rackH+26)/ph*height});
    });
    if(!mobile){const sx=pw-36,sy=floorY+2;R(sx-3,sy-25,6,23,'#717489');R(sx-16,sy-37,35,23,'#687389');R(sx-13,sy-34,29,17,'#092633');for(let j=0;j<4;j++)R(sx-10,sy-31+j*3,17+(j%2)*4,1,j===1?lit:'#8ad5b3');R(sx-11,sy-4,24,5,'#65677c');R(sx-15,sy+1,32,3,'#43465e');}
    // A small human sprite, deliberately drawn on a coarse grid.
    const hx=Math.round(hero.x),hy=Math.round(hero.y),step=state.moving?Math.round(Math.sin(clock*11)*3):0,repair=state.index===4;
    R(hx-8,hy-2,18,3,'#070d1d');R(hx-6+step,hy-9,5,8,'#aaadc1');R(hx+3-step,hy-9,5,8,'#d0d0d4');R(hx-7,hy-4,7,4,'#161b2c');R(hx+3,hy-3,7,4,'#161b2c');R(hx-7,hy-23,16,15,'#ff8b61');R(hx-5,hy-22,12,4,'#ffb98a');R(hx-10,hy-22,4,13,'#cb6358');R(hx+9,hy-22,4,repair?7:13,'#f2a983');R(hx+12,hy-(repair?23:13),repair?8:4,4,'#f2c19c');R(hx-5,hy-34,13,12,'#f3c89e');R(hx-7,hy-36,16,6,'#353342');R(hx-7,hy-31,4,7,'#353342');R(hx+5,hy-28,2,2,'#5a3944');R(hx-2,hy-21,2,9,'#b55f58');R(hx+3,hy-19,4,4,'#6e4654');
    if(repair)for(let i=0;i<4;i++){const xx=hx+16+(i%2)*5,yy=hy-30+((Math.floor(clock*9)+i*3)%12);R(xx,yy,2,2,i%2?'#fcf0a5':'#e99a6b')}
    const progressX=mobile?20:24,progressY=ph-66;T(`${state.stage.name} / R${String(state.rack+1).padStart(2,'0')}`,progressX,progressY,6,'#d7ff67');
    for(let i=0;i<7;i++)R(progressX+i*12,progressY+13,8,3,i<=state.index?'#d7ff67':'#49435b');
    // One-pixel scan texture stays subtle rather than flashing the full image.
    for(let y=0;y<ph;y+=3)R(0,y,pw,1,'#08102713');
    ctx.imageSmoothingEnabled=false;ctx.drawImage(pixel,0,0,width,height);ctx.imageSmoothingEnabled=true;
  }

  function drawBlueprint(state){
    const w=width,h=height,portrait=w<700;ctx.fillStyle='#edeade';ctx.fillRect(0,0,w,h);
    const spacing=portrait?18:28;for(let x=16;x<w;x+=spacing)for(let y=18;y<h;y+=spacing)circle(ctx,x,y,.65,'#738c7a2a');
    const room=portrait?{x:w*.075,y:211,w:w*.85,h:h-298}:{x:w*.075,y:120,w:w*.76,h:h-235};
    const console=portrait?{x:20,y:62,w:w-40,h:121}:{x:w*.70,y:49,w:w*.26,h:138};
    roundRect(ctx,room.x,room.y,room.w,room.h,0,'#e6e9de','#809585',1);
    roundRect(ctx,room.x+7,room.y+7,room.w-14,room.h-14,0,null,'#a4b0a4',.6);
    const doorX=room.x+room.w*.58;ctx.fillStyle='#edeade';ctx.fillRect(doorX,room.y+room.h-3,room.w*.18,9);line(ctx,[{x:doorX,y:room.y+room.h},{x:doorX,y:room.y+room.h-room.w*.13}],'#829985',.8);ctx.beginPath();ctx.arc(doorX,room.y+room.h,room.w*.13,-Math.PI/2,0);ctx.strokeStyle='#9bac9b';ctx.lineWidth=.7;ctx.stroke();
    const rackW=portrait?room.w*.21:room.w*.19,rackH=portrait?room.h*.29:room.h*.34;
    const positions=Array.from({length:6},(_,i)=>({x:room.x+room.w*(.085+(i%3)*.29),y:room.y+room.h*(i<3?.075:.59)}));
    const spot=id=>({x:positions[id].x+rackW*.5,y:positions[id].y+rackH+(portrait?12:22)});
    const consoleSpot={x:room.x+room.w*.91,y:room.y+room.h*.48};let hero=spot(state.previous);
    const middle=room.y+room.h*.51;
    if(state.index===1)hero=atPath([hero,{x:hero.x,y:middle},consoleSpot],smooth(state.progress));
    else if(state.index===2)hero=consoleSpot;
    else if(state.index===3){const goal=spot(state.rack);hero=atPath([consoleSpot,{x:goal.x,y:middle},goal],smooth(state.progress));}
    else if(state.index>=4)hero=spot(state.rack);
    const goal=spot(state.rack),route=[consoleSpot,{x:goal.x,y:middle},goal];
    ctx.save();ctx.setLineDash([3,6]);line(ctx,route,state.resolved?'#4b846455':'#c1684966',1);ctx.restore();
    for(let i=0;i<3;i++){const y=room.y+room.h*(.02+i*.48);line(ctx,[{x:room.x-14,y},{x:room.x+room.w+14,y}],'#82978155',.6)}
    positions.forEach((rack,id)=>{
      const active=id===state.rack,ink=active?(state.resolved?'#437d61':'#b65443'):'#3b5c50';
      roundRect(ctx,rack.x+3,rack.y+4,rackW,rackH,1,'#82938222');roundRect(ctx,rack.x,rack.y,rackW,rackH,1,'#e9ece2',ink,.9);
      roundRect(ctx,rack.x+4,rack.y+5,rackW-8,rackH-10,0,'#d5e0d5','#839c89',.6);
      const bands=portrait?5:8;for(let j=0;j<bands;j++){const yy=rack.y+10+j*(rackH-19)/bands;line(ctx,[{x:rack.x+7,y:yy},{x:rack.x+rackW-7,y:yy}],ink,.6);for(let k=0;k<3;k++)circle(ctx,rack.x+11+k*(rackW-22)/3,yy+(portrait?3.5:6),portrait?2:4,null,'#607e6b77',.55);circle(ctx,rack.x+rackW-10,yy+3,portrait?1.2:2,active?ink:'#6e9c80')}
      text(ctx,`R${String(id+1).padStart(2,'0')}`,rack.x+rackW*.5,rack.y-7,portrait?6:9,ink,500,'Geist','center');
      if(active){const rx=rack.x+rackW*.5,yy=rack.y+rackH*.45;circle(ctx,rx,yy,rackW*.63,null,`${ink}55`,.8);const a=clock*.5;line(ctx,[{x:rx+Math.cos(a)*rackW*.7,y:yy+Math.sin(a)*rackW*.7},{x:rx+Math.cos(a)*rackW*.95,y:yy+Math.sin(a)*rackW*.95}],ink,1.5);}
      hitboxes.push({id,x:rack.x-4,y:rack.y-12,w:rackW+8,h:rackH+20});
    });
    const unit=portrait?.7:1.12,walk=state.moving?Math.sin(clock*10)*3:0;ctx.save();ctx.translate(hero.x,hero.y);ctx.scale(unit,unit);circle(ctx,2,4,15,'#263c2f20');roundRect(ctx,-9,-8,18,20,6,'#b55742','#733e38',.8);circle(ctx,0,-12,7,'#e0b98b','#806c57',.7);line(ctx,[{x:-7,y:10},{x:-8+walk,y:18}],'#425c52',4);line(ctx,[{x:7,y:10},{x:8-walk,y:18}],'#425c52',4);line(ctx,[{x:-10,y:-4},{x:-15-walk*.5,y:3}],'#b55742',4);line(ctx,[{x:10,y:-4},{x:state.index===4?19:15+walk*.5,y:state.index===4?-13:3}],'#b55742',4);circle(ctx,0,-12,3.8,'#293d37');ctx.restore();
    if(state.index===4){const work=goal;circle(ctx,work.x+11,work.y-12,portrait?13:21,null,'#bd70558c',.8);text(ctx,'SERVICE',work.x+19,work.y-23,portrait?5:7,'#9b4a3d',500);}
    const dimensionY=room.y+room.h+30;line(ctx,[{x:room.x,y:dimensionY},{x:room.x+room.w,y:dimensionY}],'#9aa697',.7);for(const x of[room.x,room.x+room.w])line(ctx,[{x:x-4,y:dimensionY-4},{x:x+4,y:dimensionY+4}],'#637c68',.8);
    text(ctx,'FIG. 03 / A PATH THROUGH THE PROBLEM',room.x,dimensionY+20,portrait?5.5:8,'#607766',500);
    if(!portrait){const tx=room.x+room.w+38;ctx.save();ctx.translate(tx,room.y+room.h*.75);ctx.rotate(-Math.PI/2);text(ctx,'OBSERVE / ISOLATE / RESTORE',0,0,9,'#829780',500);ctx.restore();}
    // The console floats above the plan, rather than having its diagnostics hidden by it.
    drawConsolePanel(ctx,console,state,'blueprint');hitboxes.push({id:state.rack,x:console.x,y:console.y,w:console.w,h:console.h});
  }

  function drawConsolePanel(c,box,state,style){
    const blueprint=style==='blueprint',bg=blueprint?'#edeade':'#071b23',border=blueprint?'#78917d':'#4a7b70',ink=blueprint?'#3c5447':'#b1dfcd',muted=blueprint?'#71806c':'#658d81',alert=state.resolved?(blueprint?'#3b7359':'#8ee6b6'):(blueprint?'#a4483c':state.fault.color);
    roundRect(c,box.x+4,box.y+5,box.w,box.h,1,blueprint?'#5d6e5820':'#0004');roundRect(c,box.x,box.y,box.w,box.h,1,bg,border,.8);
    line(c,[{x:box.x,y:box.y+25},{x:box.x+box.w,y:box.y+25}],border,.6);
    text(c,'KVM / SERVICE CONSOLE',box.x+12,box.y+16,Math.min(8,box.w/32),ink,500);circle(c,box.x+box.w-15,box.y+13,2.3,alert);
    text(c,`R${String(state.rack+1).padStart(2,'0')}  ${state.resolved?'SYSTEM CHECK / CLEAR':state.fault.short}`,box.x+12,box.y+48,Math.min(13,box.w/24),alert,500);
    const row=state.index<2?'FAULT QUEUED / TECHNICIAN RESPONDING':state.index===2?state.fault.detail:state.index===3?'ISOLATED / MOVING TO SERVICE POINT':state.index===4?state.fault.action:state.fault.done;
    text(c,'> '+row,box.x+12,box.y+67,Math.min(7.5,box.w/43),ink,400);
    const barY=box.y+box.h-23;const gap=4,barW=(box.w-28-gap*6)/7;
    for(let i=0;i<7;i++)roundRect(c,box.x+12+i*(barW+gap),barY,barW,3,0,i<=state.index?alert:(blueprint?'#b9c5b5':'#294e47'));
    text(c,state.stage.name,box.x+12,box.y+box.h-7,5.5,muted,500);text(c,'ILLUSTRATED / NOT LIVE',box.x+box.w-12,box.y+box.h-7,5.5,muted,400,'Geist','right');
  }
  return{dispose,reset,setVariant,dispatch,pause,getStatus:()=>currentStatus};
}
