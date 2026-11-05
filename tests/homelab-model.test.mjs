import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomelabModel,DEVICES,SCENARIOS} from '../dist/homelab-model.js';

function reach(model,phase,limit=1000){for(let index=0;index<limit;index++){const state=model.getState();if(state.phase===phase)return state;model.advance(.1);}assert.fail('Did not reach phase '+phase);}
function finish(model){return reach(model,'idle');}

test('healthy opening is seated; automatic incident waits for the opening delay',()=>{
  const model=createHomelabModel({random:()=>.5});
  assert.equal(model.getState().actor.state,'seated');
  assert.equal(model.getState().wan.active,'fiber');
  model.advance(7.9);assert.equal(model.getState().phase,'idle');
  model.advance(.2);assert.equal(model.getState().phase,'notice');
  assert.equal(model.getState().stats.started,1);
});

test('every incident visits diagnosis, its own repair target, verification and a healthy return',()=>{
  for(const scenario of SCENARIOS){
    const model=createHomelabModel({auto:false});
    assert.equal(model.trigger(scenario.id),true);
    const diagnosis=reach(model,'diagnose');assert.equal(diagnosis.actor.targetId,'console');
    const repair=reach(model,'repair');assert.equal(repair.actor.targetId,scenario.target);assert.ok(repair.actor.y>.8,'feet stay on the floor');
    assert.equal(repair.rearView,scenario.rear);
    const verification=reach(model,'verify');assert.equal(verification.incident.id,scenario.id);
    const state=finish(model);assert.equal(state.stats.resolved,1);assert.equal(state.incident,null);assert.equal(state.actor.state,'seated');
    assert.equal(state.rearView,false);assert.equal(state.roomDarkness,0);
    for(const device of Object.values(state.devices)){assert.equal(device.power,'on');assert.equal(device.health,'healthy');}
    assert.ok(Object.values(state.services).every(status=>status==='healthy'));
  }
});

test('redundant PSU failure keeps the host on; rear view is limited to service and verification',()=>{
  const model=createHomelabModel({auto:false});model.trigger('psu-failure');
  assert.equal(model.getState().devices.dell.power,'on');assert.equal(model.getState().devices.dell.health,'degraded');
  assert.equal(model.getState().rearView,false);
  reach(model,'repair');assert.equal(model.getState().rearView,true);
  model.advance(4);assert.equal(model.getState().devices.dell.power,'on');
  reach(model,'return');assert.equal(model.getState().rearView,false);assert.equal(model.getState().devices.dell.health,'healthy');
});

test('mains outage darkens the room while UPS-backed loads stay running',()=>{
  const model=createHomelabModel({auto:false});model.trigger('mains-outage');
  const outage=model.getState();assert.ok(outage.roomDarkness>.8);assert.ok(Object.values(outage.devices).every(device=>device.power==='battery'));
  reach(model,'verify');assert.ok(Object.values(model.getState().devices).every(device=>device.power==='on'));
  finish(model);assert.equal(model.getState().roomDarkness,0);
});

test('memory upgrade shuts down only its drained host and then restores capacity',()=>{
  const model=createHomelabModel({auto:false});model.trigger('memory-upgrade');reach(model,'repair');model.advance(.2);
  assert.equal(model.getState().devices.hpe.power,'off');
  assert.equal(model.getState().devices.dell.power,'on');assert.equal(model.getState().devices.storage.power,'on');
  finish(model);assert.ok(model.getState().devices.hpe.memoryUsed<.5);assert.equal(model.getState().stats.upgrades,1);
});

test('software crash leaves physical hardware healthy and uses terminal diagnosis',()=>{
  const model=createHomelabModel({auto:false});model.trigger('service-crash');
  assert.equal(model.getState().devices.nuc.health,'healthy');assert.equal(model.getState().devices.nuc.power,'on');assert.equal(model.getState().services.application,'failed');
  const diagnosis=reach(model,'diagnose');assert.equal(diagnosis.console.mode,'terminal');
  const repair=reach(model,'repair');assert.equal(repair.actor.state,'typing');assert.equal(repair.actor.x,.48);assert.equal(repair.actor.targetId,'nuc');
  assert.equal(repair.actor.reach.x,.48);assert.ok(repair.actor.reach.y<repair.actor.y);
  finish(model);assert.equal(model.getState().services.application,'healthy');
});

test('WAN failover uses coax before the primary route is repaired and restored',()=>{
  const model=createHomelabModel({auto:false});model.trigger('uplink-loss');reach(model,'diagnose');model.advance(2);
  assert.equal(model.getState().wan.active,'coax');assert.equal(model.getState().wan.links.fiber,'down');
  finish(model);assert.equal(model.getState().wan.active,'fiber');assert.equal(model.getState().wan.links.cellular,'standby');
});

test('cellular reserve is used when both wired WAN links are unavailable',()=>{
  const model=createHomelabModel({auto:false});model.trigger('backup-failover');reach(model,'diagnose');model.advance(2);
  const state=model.getState();assert.equal(state.wan.active,'cellular');assert.equal(state.wan.links.cellular,'up');assert.equal(state.wan.links.fiber,'down');assert.equal(state.wan.links.coax,'down');
  assert.equal(state.services.network,'healthy');finish(model);assert.equal(model.getState().wan.active,'fiber');
});

test('pausing freezes simulation and queued incidents run after current recovery',()=>{
  const model=createHomelabModel({auto:false});model.trigger('disk-failure');model.trigger('memory-upgrade');
  assert.equal(model.trigger('disk-failure'),false);assert.equal(model.trigger('unknown'),false);
  model.pause();const paused=model.getState();assert.deepEqual(model.advance(100),paused);
  model.pause(false);finish(model);assert.deepEqual(model.getState().queue,['memory-upgrade']);
  model.advance(.1);assert.equal(model.getState().incident.id,'memory-upgrade');finish(model);assert.equal(model.getState().stats.resolved,2);
});

test('layout can move panels and foot positions independently; snapshots cannot mutate the model',()=>{
  const model=createHomelabModel({auto:false,layout:{desk:{x:.92,y:.9},devices:{hpe:{x:.4,y:.45,standX:.42,standY:.87}}}});
  model.trigger('memory-upgrade');const repair=reach(model,'repair');assert.equal(repair.actor.x,.42);assert.equal(repair.actor.y,.87);assert.deepEqual(repair.actor.reach,{x:.4,y:.45});
  repair.devices.hpe.power='fake';assert.notEqual(model.getState().devices.hpe.power,'fake');
  model.reset();assert.equal(model.getState().stats.started,0);assert.equal(model.getState().actor.x,.92);assert.equal(model.getState().phase,'idle');
  assert.equal(model.inspect('hpe').id,'hpe');assert.equal(model.getState().devices.hpe.identifying,true);assert.equal(model.inspect('unknown'),null);model.inspect(null);assert.equal(model.getState().inspection,null);
});

test('time stepping does not skip recovery and rejects invalid deltas',()=>{
  const model=createHomelabModel({auto:false});model.trigger('water-spill');model.advance(100);
  assert.equal(model.getState().phase,'idle');assert.equal(model.getState().stats.resolved,1);
  assert.throws(()=>model.advance(-1),TypeError);assert.throws(()=>model.advance(NaN),TypeError);
  assert.equal(DEVICES.length,10);assert.equal(SCENARIOS.length,10);
});

test('scene reset preserves the visitor pause and automatic-scene preferences',()=>{
  const model=createHomelabModel();model.setAuto(false);model.pause(true);model.trigger('disk-failure');model.reset();
  const state=model.getState();assert.equal(state.auto,false);assert.equal(state.paused,true);assert.equal(state.phase,'idle');assert.deepEqual(state.queue,[]);
});
