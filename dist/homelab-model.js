/* Pure, time-stepped homelab simulation. Rendering, theme changes and real
   infrastructure access deliberately live elsewhere. All telemetry is fictional. */

export const DEVICES = Object.freeze([
  {id:'edge',label:'WAN gateways',kind:'gateway',rack:1,x:.205,y:.39,standX:.205,standY:.865},
  {id:'firewall',label:'pfSense firewall',kind:'firewall',rack:1,x:.205,y:.46,standX:.205,standY:.865},
  {id:'switch',label:'Cisco switching',kind:'switch',rack:1,x:.205,y:.53,standX:.205,standY:.865},
  {id:'hpe',label:'HPE compute',kind:'server',rack:2,x:.355,y:.48,standX:.355,standY:.855},
  {id:'dell',label:'Dell PowerEdge',kind:'server',rack:3,x:.635,y:.45,standX:.635,standY:.855},
  {id:'storage',label:'Storage array',kind:'storage',rack:3,x:.635,y:.62,standX:.635,standY:.855},
  {id:'gpu',label:'Supermicro GPU host',kind:'gpu',rack:4,x:.765,y:.51,standX:.765,standY:.865},
  {id:'nuc',label:'NUC service nodes',kind:'mini',rack:1,x:.205,y:.67,standX:.205,standY:.865},
  {id:'ups',label:'UPS and power',kind:'ups',rack:4,x:.765,y:.75,standX:.765,standY:.865},
  {id:'workstation',label:'Gaming / workstation',kind:'workstation',rack:0,x:.9,y:.61,standX:.9,standY:.89}
].map(device=>Object.freeze(device)));

export const SCENARIOS = Object.freeze([
  {id:'psu-failure',title:'Redundant PSU failure',target:'dell',kind:'psu',severity:'warning',rear:true,weight:.12,repairSeconds:12,
    summary:'One power supply has failed. The redundant supply keeps the host online.',
    diagnostic:['iDRAC: PSU 2 input lost','Redundant PSU 1 carrying the host','Locate rear service bay; identify PSU 2'],
    repair:['Inspect rear PSU status','Replace failed redundant module','Verify both supplies and power redundancy'],
    resolution:'PSU redundancy restored. Workloads stayed online.'},
  {id:'disk-failure',title:'Storage drive failure',target:'storage',kind:'drive',severity:'warning',rear:false,weight:2.2,repairSeconds:12,
    summary:'A drive has failed. The array is degraded while data stays available.',
    diagnostic:['Storage pool: one member failed','Match enclosure and slot with locate light','Confirm redundant pool before replacement'],
    repair:['Identify the failed drive carrier','Replace the failed member','Watch the rebuild and verify the pool'],
    resolution:'Replacement drive rebuilt. Storage pool healthy.'},
  {id:'uplink-loss',title:'Primary fiber link lost',target:'edge',kind:'network',severity:'warning',rear:false,weight:2,repairSeconds:8,failedLinks:['fiber'],
    summary:'The primary WAN has stopped responding. The firewall moves traffic to the next healthy link.',
    diagnostic:['WAN monitor: fiber probe failed','Fail over fiber → coax → cellular if needed','Trace ONT link and affected patch lead'],
    repair:['Check the affected fiber gateway','Replace the damaged patch lead','Verify fiber; move traffic back to primary'],
    resolution:'Fiber healthy. Primary route restored.'},
  {id:'backup-failover',title:'Cellular backup takes over',target:'edge',kind:'network',severity:'warning',rear:false,weight:.55,repairSeconds:10,failedLinks:['fiber','coax'],
    summary:'Both wired WAN links are unavailable. The cellular reserve keeps essential traffic moving.',
    diagnostic:['WAN monitor: fiber and coax probes failed','Select cellular reserve for essential traffic','Confirm gateway health and inspect wired links'],
    repair:['Keep essential traffic on the cellular gateway','Restore the simulated wired connection','Verify fiber and return coax to standby'],
    resolution:'Wired links healthy. Fiber primary; cellular returned to reserve.'},
  {id:'thermal-alert',title:'GPU host airflow alert',target:'gpu',kind:'fan',severity:'warning',rear:false,weight:1.4,repairSeconds:10,
    summary:'A cooling fan is underperforming. The GPU host reduces work while airflow is restored.',
    diagnostic:['GPU host: inlet temperature rising','Fan tachometer below expected range','Drain workload before cooling service'],
    repair:['Pause GPU jobs and service the host','Replace the failed fan assembly','Verify fan speed and temperature recovery'],
    resolution:'Airflow restored. GPU jobs resumed.'},
  {id:'mains-outage',title:'Mains power interrupted',target:'ups',kind:'power',severity:'critical',rear:false,weight:.7,repairSeconds:12,
    summary:'Room lighting drops out. UPS-backed networking and servers remain powered.',
    diagnostic:['UPS: utility input lost; battery online','Protected loads remain available','Check upstream feed and load health'],
    repair:['Inspect protected power and UPS input','Restore the simulated upstream feed','Verify utility transfer and battery charging'],
    resolution:'Utility power restored. UPS charging; protected loads stayed up.'},
  {id:'memory-upgrade',title:'Compute memory exhausted',target:'hpe',kind:'memory',severity:'warning',rear:false,weight:1.2,repairSeconds:13,
    summary:'The host has outgrown its available memory. Workloads are drained before a physical upgrade.',
    diagnostic:['Compute: sustained memory pressure','Confirm capacity rather than DIMM failure','Migrate jobs; schedule host shutdown'],
    repair:['Drain the host and shut it down','Slide out chassis; add matched memory','Close chassis, boot, and check capacity'],
    resolution:'Memory capacity increased. Host checks passed; workloads returned.'},
  {id:'storage-expansion',title:'Storage capacity reached',target:'storage',kind:'capacity',severity:'warning',rear:false,weight:1.3,repairSeconds:11,
    summary:'The pool is near capacity, with no failed drives. Add storage and verify usable space.',
    diagnostic:['Storage pool: capacity threshold reached','All existing drive health checks passing','Confirm expansion plan and spare bay'],
    repair:['Identify an available drive bay','Add capacity to the planned expansion','Verify pool growth and available space'],
    resolution:'Storage expanded. Available capacity verified.'},
  {id:'service-crash',title:'Application stopped responding',target:'nuc',kind:'service',severity:'warning',rear:false,weight:2.1,repairSeconds:10,
    summary:'One application is unhealthy while its host and network remain online.',
    diagnostic:['Service probe: application unavailable','Host reachable; physical checks passing','Open SSH / PuTTY session and inspect logs'],
    repair:['Inspect service logs in the console','Correct configuration and restart service','Check the application from a client'],
    resolution:'Application healthy. Host remained online throughout.'},
  {id:'water-spill',title:'Workstation spill',target:'workstation',kind:'spill',severity:'critical',rear:false,weight:.3,repairSeconds:13,
    summary:'A fictional desk spill affects the workstation. The lab remains isolated and available.',
    diagnostic:['Desk alert: liquid near workstation input','Isolate affected equipment; use KVM station','Check damage before any recovery attempt'],
    repair:['Isolate affected workstation equipment','Replace the damaged keyboard / input device','Verify the replacement before returning'],
    resolution:'Affected input replaced and checked. Lab services remained available.'}
].map(scenario=>Object.freeze({...scenario,diagnostic:Object.freeze(scenario.diagnostic),repair:Object.freeze(scenario.repair),...(scenario.failedLinks?{failedLinks:Object.freeze(scenario.failedLinks)}:{})})));

const PHASES=['notice','to-console','diagnose','to-device','repair','verify','return'];
const DURATIONS={notice:2.3,'to-console':3.4,diagnose:4.8,'to-device':3.2,repair:10,verify:4.3,return:3.6};
const DEFAULT_LAYOUT={desk:{x:.9,y:.89},console:{x:.48,y:.84}};
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const copy=value=>structuredClone(value);
const ease=value=>value*value*(3-2*value);
const lookup=new Map(SCENARIOS.map(scenario=>[scenario.id,scenario]));
const aliases={psu:'psu-failure',disk:'disk-failure',uplink:'uplink-loss',thermal:'thermal-alert',power:'mains-outage',memory:'memory-upgrade',capacity:'storage-expansion',service:'service-crash',spill:'water-spill'};

/**
 * Device front-panel positions are independent from actor foot positions.
 * Layout: {desk:{x,y}, console:{x,y}, consolePanel?:{x,y},
 *          devices:{[id]:{x,y,standX,standY}}}.
 * advance() takes seconds and returns a serializable snapshot. No timers or DOM.
 */
export function createHomelabModel({random=Math.random,auto=true,layout={},initialDelay=8,idleDelay=12,timeScale=1}={}) {
  const positions={desk:{...DEFAULT_LAYOUT.desk,...layout.desk},console:{...DEFAULT_LAYOUT.console,...layout.console},devices:Object.fromEntries(DEVICES.map(device=>[device.id,{...device,...layout.devices?.[device.id]}]))};
  const consolePanel={x:positions.console.x,y:positions.console.y-.24,...layout.consolePanel};
  const speed=Number.isFinite(timeScale)&&timeScale>0?timeScale:1;
  const initialWait=Number.isFinite(initialDelay)?Math.max(0,initialDelay):8;
  const idleWait=Number.isFinite(idleDelay)?Math.max(.1,idleDelay):12;
  let state,active=null,phaseDuration=0,phaseStart={x:0,y:0},phaseEnd={x:0,y:0},idleRemaining=initialWait;
  let generalBag=[],ordinarySinceRear=8,serial=0,verificationLogged=false,phaseMessageIndex=-1;

  function initialize() {
    active=null;serial=0;idleRemaining=initialWait;generalBag=[];ordinarySinceRear=8;verificationLogged=false;phaseMessageIndex=-1;
    state={time:0,phase:'idle',phaseTime:0,phaseProgress:0,progress:0,paused:false,auto:Boolean(auto),incident:null,
      actor:{...positions.desk,state:'seated',facing:'left',targetId:'workstation',reach:{x:positions.devices.workstation.x,y:positions.devices.workstation.y}},
      devices:Object.fromEntries(DEVICES.map(device=>[device.id,{id:device.id,health:'healthy',power:'on',load:.18,detail:'All checks passing',identifying:false,progress:0,fault:null,temperature:37,memoryUsed:.43,capacityUsed:.57}])),
      services:{virtualization:'healthy',storage:'healthy',network:'healthy',application:'healthy',gpu:'healthy'},
      wan:{active:'fiber',links:{fiber:'up',coax:'standby',cellular:'standby'}},roomDarkness:0,rearView:false,
      console:{mode:'dashboard',title:'All checks passing',lines:['Fiber primary · coax standby · cellular reserve','Compute, storage, network and services healthy']},
      headline:'All checks passing',action:'A little gaming. The lab keeps running.',repairStep:'',queue:[],inspection:null,
      stats:{started:0,resolved:0,upgrades:0,lastResolved:null},logs:[{time:0,level:'success',text:'All checks passing. Home lab online.'}]};
    phaseStart={...positions.desk};phaseEnd={...positions.desk};phaseDuration=0;
    updateContinuous();
  }

  function log(text,level='info') {
    state.logs.push({time:Number(state.time.toFixed(2)),level,text});
    if(state.logs.length>18)state.logs.splice(0,state.logs.length-18);
  }

  function duration(phase) {
    return phase==='repair'?(active?.repairSeconds||DURATIONS.repair):DURATIONS[phase]||0;
  }

  function targetStand() {
    if(active.kind==='service')return positions.console;
    const device=positions.devices[active.target];
    return{x:device.standX,y:device.standY};
  }

  function setPhase(phase) {
    state.phase=phase;state.phaseTime=0;state.phaseProgress=0;phaseMessageIndex=-1;
    phaseDuration=duration(phase);phaseStart={x:state.actor.x,y:state.actor.y};phaseEnd={...phaseStart};
    state.rearView=Boolean(active?.rear&&['repair','verify'].includes(phase));
    if(phase==='idle') {
      state.actor={...state.actor,...positions.desk,state:'seated',facing:'left',targetId:'workstation',reach:{x:positions.devices.workstation.x,y:positions.devices.workstation.y}};
      state.incident=null;active=null;state.progress=0;state.roomDarkness=0;state.rearView=false;
      state.headline='All checks passing';state.action='A little gaming. The lab keeps running.';state.repairStep='';
      state.console={mode:'dashboard',title:'All checks passing',lines:['Fiber primary · coax standby · cellular reserve','Compute, storage, network and services healthy']};
      idleRemaining=idleWait;return;
    }
    if(phase==='notice') {
      state.actor.state='alert';state.actor.targetId=active.target;state.headline=active.title;
      state.action='Something changed. Find the signal.';state.console={mode:'alert',title:active.title,lines:[active.summary]};
    } else if(phase==='to-console') {
      phaseEnd={...positions.console};state.actor.state='walk';state.actor.targetId='console';state.actor.reach={...consolePanel};state.action='Head to the management console.';
    } else if(phase==='diagnose') {
      state.actor.state='typing';state.actor.targetId='console';state.actor.reach={...consolePanel};state.action='Read the alert. Isolate the cause.';
      state.console={mode:active.kind==='service'?'terminal':'diagnostic',title:active.kind==='service'?'SSH / PuTTY · service console':'Management · '+active.title,lines:[]};
      log('Console triage: '+active.title);
    } else if(phase==='to-device') {
      phaseEnd={...targetStand()};state.actor.state=active.kind==='service'?'typing':'walk';state.actor.targetId=active.target;
      state.action=active.kind==='service'?'Stay at the console; inspect the application.':'Go to the identified component.';
      const device=positions.devices[active.target];state.actor.reach=active.kind==='service'?{...consolePanel}:{x:device.x,y:device.y};state.devices[active.target].identifying=true;
    } else if(phase==='repair') {
      state.actor.state=active.kind==='service'?'typing':'repair';state.actor.targetId=active.target;
      state.console.mode=active.kind==='service'?'terminal':'service';state.action=active.repair[0];state.repairStep=active.repair[0];
      log('Service action: '+active.repair[0]);
    } else if(phase==='verify') {
      state.actor.state='verify';state.actor.targetId=active.target;state.action='Verify the repair from end to end.';
      state.console.mode='verify';state.console.title='Verifying · '+active.title;state.console.lines=['Physical checks → host checks → service checks'];
      const device=state.devices[active.target];device.power='on';
      if(['drive','capacity'].includes(active.kind)){device.health='rebuilding';device.progress=0;device.detail='Checking pool and replacement capacity';}
      if(active.kind==='network'){state.wan={active:'fiber',links:{fiber:'up',coax:'standby',cellular:'standby'}};}
      if(active.kind==='power')for(const item of Object.values(state.devices))item.power='on';
      verificationLogged=false;
    } else if(phase==='return') {
      restoreHealthy();state.stats.resolved++;state.stats.lastResolved=active.id;
      if(['memory','capacity'].includes(active.kind))state.stats.upgrades++;
      log(active.resolution,'success');
      state.headline='Checks passed';state.action='Back to the workstation.';state.console={mode:'healthy',title:'Checks passed',lines:[active.resolution]};
      phaseEnd={...positions.desk};state.actor.state='walk';state.actor.targetId='workstation';state.actor.reach={x:positions.devices.workstation.x,y:positions.devices.workstation.y};state.repairStep='';
      if(active.rear)ordinarySinceRear=0;else ordinarySinceRear++;
    }
    if(['to-console','to-device','return'].includes(phase))state.actor.facing=phaseEnd.x<phaseStart.x?'left':'right';
    else if(['diagnose','repair','verify'].includes(phase))state.actor.facing='back';
  }

  function restoreHealthy() {
    for(const device of Object.values(state.devices)) {
      device.health='healthy';device.power='on';device.detail='All checks passing';device.fault=null;device.progress=0;
      device.identifying=state.inspection?.id===device.id;
    }
    if(active?.kind==='memory')state.devices.hpe.memoryUsed=.31;
    if(active?.kind==='capacity')state.devices.storage.capacityUsed=.34;
    for(const key of Object.keys(state.services))state.services[key]='healthy';
    state.wan={active:'fiber',links:{fiber:'up',coax:'standby',cellular:'standby'}};
  }

  function begin(id) {
    active=lookup.get(id);if(!active)return;
    state.incident={...copy(active),serial:++serial,startedAt:state.time};state.stats.started++;
    const device=state.devices[active.target];device.detail=active.summary;
    device.fault={kind:active.kind,slot:active.kind==='drive'?3:active.kind==='psu'?2:null};
    device.health=active.kind==='service'?'healthy':active.kind==='spill'?'failed':'degraded';
    if(active.kind==='network'){for(const link of active.failedLinks||['fiber'])state.wan.links[link]='down';state.services.network='degraded';}
    if(active.kind==='drive')state.services.storage='degraded';
    if(active.kind==='capacity')device.capacityUsed=.97;
    if(active.kind==='memory'){device.memoryUsed=.99;state.services.virtualization='degraded';}
    if(active.kind==='fan'){device.temperature=89;state.services.gpu='degraded';}
    if(active.kind==='service')state.services.application='failed';
    if(active.kind==='power'){for(const item of Object.values(state.devices))item.power='battery';device.health='warning';}
    if(active.kind==='spill')device.power='off';
    log(active.title,active.severity);setPhase('notice');updateContinuous();
  }

  function nextAutomatic() {
    // Rare rear-service events are independent of the ordinary shuffle bag.
    // Ordinary incidents do not repeat until that bag has been exhausted.
    if(ordinarySinceRear>=8&&clamp(Number(random())||0)<.035)return'psu-failure';
    if(!generalBag.length)generalBag=SCENARIOS.filter(scenario=>!scenario.rear).map(scenario=>scenario.id);
    const total=generalBag.reduce((sum,id)=>sum+lookup.get(id).weight,0);
    let point=clamp(Number(random())||0,0,.999999999)*total;
    for(let index=0;index<generalBag.length;index++) {
      point-=lookup.get(generalBag[index]).weight;
      if(point<0)return generalBag.splice(index,1)[0];
    }
    return generalBag.pop();
  }

  function updateContinuous() {
    const moving=['to-console','to-device','return'].includes(state.phase);
    const fraction=state.phase==='idle'?0:clamp(state.phaseTime/phaseDuration);
    state.phaseProgress=fraction;
    if(moving) {
      const amount=ease(fraction);state.actor.x=phaseStart.x+(phaseEnd.x-phaseStart.x)*amount;state.actor.y=phaseStart.y+(phaseEnd.y-phaseStart.y)*amount;
    }
    for(let index=0;index<DEVICES.length;index++) {
      const device=state.devices[DEVICES[index].id];
      device.load=device.power==='off'?0:clamp(.19+.09*Math.sin(state.time*.41+index*1.7)+.045*Math.sin(state.time*1.33+index),.04,.74);
      if(device.health==='healthy')device.temperature=35+Math.round(device.load*20);
    }
    if(!active){state.progress=0;state.roomDarkness=0;return;}
    const phaseIndex=PHASES.indexOf(state.phase),total=PHASES.reduce((sum,phase)=>sum+duration(phase),0);
    state.progress=clamp((PHASES.slice(0,phaseIndex).reduce((sum,phase)=>sum+duration(phase),0)+state.phaseTime)/total);
    const device=state.devices[active.target];
    if(state.phase==='diagnose') {
      const count=Math.min(active.diagnostic.length,1+Math.floor(fraction*active.diagnostic.length));
      state.console.lines=active.diagnostic.slice(0,count);
      if(active.kind==='network'&&fraction>.25){
        const available=['fiber','coax','cellular'].find(link=>state.wan.links[link]!=='down');
        state.wan.active=available||null;
        if(available){state.wan.links[available]='up';state.services.network='healthy';}
      }
    }
    if(state.phase==='repair') {
      const step=Math.min(active.repair.length-1,Math.floor(fraction*active.repair.length));
      state.action=active.repair[step];state.repairStep=active.repair[step];
      if(step!==phaseMessageIndex){phaseMessageIndex=step;state.console.lines=[...active.diagnostic.slice(-1),active.repair[step]];}
      device.progress=fraction;
      if(active.kind==='memory'){device.power=fraction<.72?'off':'on';device.detail=fraction<.72?'Host drained and shut down for memory upgrade':'Booting with additional memory';}
      if(active.kind==='fan'){device.power=fraction<.6?'off':'on';device.temperature=Math.round(89-47*fraction);}
      if(active.kind==='drive'&&fraction>.55){device.health='rebuilding';device.detail='Replacement installed; pool rebuilding';}
      if(active.kind==='capacity'&&fraction>.55){device.health='rebuilding';device.detail='Additional capacity installed; pool expanding';}
      if(active.kind==='service'&&fraction>.72)state.services.application='healthy';
      if(active.kind==='spill'){device.power=fraction<.9?'off':'on';device.detail=fraction<.9?'Affected desk equipment isolated':'Replacement input device under test';}
    }
    if(state.phase==='verify') {
      device.progress=fraction;
      if(fraction>.65&&!verificationLogged){verificationLogged=true;log('Verification passed: '+active.resolution,'success');state.console.lines=[active.resolution,'Physical, host and service checks passing'];}
    }
    const powerIncident=active.kind==='power'&&!['verify','return'].includes(state.phase);
    const spillIncident=active.kind==='spill'&&!['verify','return'].includes(state.phase);
    const desired=powerIncident ? .88 : spillIncident ? .34 : state.rearView ? .47 : state.phase==='return' ? 0 : .075;
    // Rendering can ease this value; the state describes the actual lighting target.
    state.roomDarkness=desired;
    if(state.phase==='return')state.roomDarkness=.075*(1-fraction);
  }

  function advance(dtSeconds) {
    if(!Number.isFinite(dtSeconds)||dtSeconds<0)throw new TypeError('advance requires finite, non-negative seconds');
    if(state.paused||dtSeconds===0)return getState();
    let remaining=Math.min(dtSeconds*speed,3600),guard=0;
    while(remaining>1e-9&&guard++<2000) {
      if(state.phase==='idle') {
        if(state.queue.length){begin(state.queue.shift());continue;}
        if(!state.auto){state.time+=remaining;state.phaseTime+=remaining;remaining=0;updateContinuous();break;}
        const consumed=Math.min(remaining,Math.max(0,idleRemaining));state.time+=consumed;state.phaseTime+=consumed;idleRemaining-=consumed;remaining-=consumed;
        updateContinuous();if(idleRemaining<=1e-9)begin(nextAutomatic());
        continue;
      }
      const consumed=Math.min(remaining,Math.max(0,phaseDuration-state.phaseTime));state.time+=consumed;state.phaseTime+=consumed;remaining-=consumed;updateContinuous();
      if(state.phaseTime>=phaseDuration-1e-9) {
        state.actor.x=phaseEnd.x;state.actor.y=phaseEnd.y;
        const next=PHASES[PHASES.indexOf(state.phase)+1]||'idle';setPhase(next);updateContinuous();
      }
    }
    return getState();
  }

  function trigger(id) {
    id=aliases[id]||id;
    if(!lookup.has(id)||state.queue.includes(id)||active?.id===id)return false;
    if(state.phase==='idle'&&!state.paused)begin(id);
    else if(state.queue.length<3){state.queue.push(id);log('Queued: '+lookup.get(id).title);}
    else return false;
    return true;
  }

  function inspect(id) {
    if(id!==null&&!positions.devices[id])return null;
    state.inspection=id===null?null:{id,label:positions.devices[id].label,kind:positions.devices[id].kind};
    for(const device of Object.values(state.devices))device.identifying=device.id===id||Boolean(active&&device.id===active.target&&['to-device','repair','verify'].includes(state.phase));
    return id===null?null:copy({...positions.devices[id],...state.devices[id]});
  }

  function getState(){return copy(state);}
  function pause(value=true){state.paused=Boolean(value);return getState();}
  function setAuto(value=true){state.auto=Boolean(value);if(state.phase==='idle')idleRemaining=idleWait;return getState();}
  function reset(){const settings={auto:state.auto,paused:state.paused};initialize();Object.assign(state,settings);return getState();}
  initialize();
  return{advance,trigger,inspect,pause,setAuto,reset,getState};
}
