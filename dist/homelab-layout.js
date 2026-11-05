// Coordinates refer to the generated front/rear room planes, never the viewport.
// Panels and actor floor positions are independent so a high rack cannot make
// the technician walk up the wall. The portrait source files are not web assets.
export const WORLD={width:1920,height:1080};
export const EFFECT_LAYOUT={
  cableY:.267,
  console:{x:.405,y:.407,w:.143,h:.104},
  workstationScreen:{x:.814,y:.479,w:.158,h:.082},
  nodes:{fiber:{x:.195,y:.392},coax:{x:.235,y:.363},cellular:{x:.267,y:.394}},
  devices:{
    edge:{x:.183,y:.348,w:.102,h:.068,kind:'edge'},
    firewall:{x:.185,y:.555,w:.098,h:.034,kind:'firewall'},
    switch:{x:.181,y:.444,w:.102,h:.038,kind:'switch',rows:2,cols:24,portsArea:{x:.197,y:.447,w:.065,h:.025},statusPoint:{x:.186,y:.457}},
    hpe:{x:.309,y:.385,w:.091,h:.151,kind:'hpe',rows:3,cols:8,driveArea:{x:.358,y:.39,w:.039,h:.142},statusPoint:{x:.312,y:.392}},
    dell:{x:.547,y:.382,w:.097,h:.11,kind:'dell',rows:3,cols:1,driveArea:{x:.635,y:.388,w:.003,h:.097},statusPoint:{x:.636,y:.392}},
    storage:{x:.548,y:.512,w:.096,h:.102,kind:'storage',rows:2,cols:12,driveArea:{x:.55,y:.516,w:.09,h:.091}},
    gpu:{x:.668,y:.373,w:.112,h:.105,kind:'gpu',cols:4,driveArea:{x:.676,y:.411,w:.094,h:.055},statusPoint:{x:.764,y:.39}},
    nuc:{x:.186,y:.515,w:.096,h:.026,kind:'nuc',cols:2},
    ups:{x:.31,y:.68,w:.092,h:.056,kind:'ups',portsArea:{x:.368,y:.685,w:.017,h:.021}},
    workstation:{x:.801,y:.473,w:.195,h:.407,kind:'workstation',statusPoint:{x:.906,y:.75}}
  },
  rear:{
    cableY:.268,console:null,workstationScreen:null,
    nodes:{fiber:{x:.793,y:.387},coax:{x:.761,y:.363},cellular:{x:.73,y:.396}},
    devices:{
      gpu:{x:.209,y:.355,w:.103,h:.21,kind:'gpu'},
      dell:{x:.347,y:.377,w:.103,h:.19,kind:'dell'},
      storage:{x:.348,y:.575,w:.104,h:.08,kind:'storage'},
      hpe:{x:.597,y:.377,w:.101,h:.19,kind:'hpe'},
      edge:{x:.724,y:.359,w:.106,h:.058,kind:'edge'},
      firewall:{x:.724,y:.557,w:.104,h:.044,kind:'firewall'},
      switch:{x:.724,y:.445,w:.105,h:.041,kind:'switch',rows:2,cols:24},
      nuc:{x:.724,y:.515,w:.104,h:.026,kind:'nuc',cols:2},
      ups:{x:.348,y:.68,w:.104,h:.063,kind:'ups'},
      workstation:{x:.005,y:.477,w:.185,h:.403,kind:'workstation'}
    }
  }
};
export const ACTOR_LAYOUT={
  desk:{x:.875,y:.875},console:{x:.478,y:.824},consolePanel:{x:.479,y:.622},
  devices:Object.fromEntries(Object.entries(EFFECT_LAYOUT.devices).map(([id,b])=>[id,{x:b.x+b.w/2,y:b.y+b.h/2,standX:id==='workstation'?.875:b.x+b.w/2-(id==='storage'?.07:.06),standY:id==='workstation'?.875:.832}]))
};
export const DEVICE_NOTES={
  edge:{model:'Fiber / coax / cellular',type:'Three paths into the house',description:'Primary fiber, wired backup, then cellular reserve. Traffic follows the active gateway.',metrics:['load']},
  firewall:{model:'pfSense / routing',type:'The boundary',description:'Routing, NAT, segmentation and failover connect the home to the lab.',metrics:['load']},
  switch:{model:'Cisco / copper + SFP',type:'The connections',description:'Individual link and activity lights, copper patch leads and fiber uplinks.',metrics:['load']},
  hpe:{model:'HPE ProLiant / 2U compute',type:'Virtual machines and services',description:'Separate health, identify and drive-activity states. Capacity upgrades drain and stop this host before service.',metrics:['load','memoryUsed']},
  dell:{model:'Dell PowerEdge / compute',type:'Hosts and redundancy',description:'A failed redundant PSU degrades protection while the remaining supply keeps the host running.',metrics:['load','temperature']},
  storage:{model:'PowerEdge / storage',type:'Disks, pools and capacity',description:'A failed drive and a full pool need different work. Watch the affected slot, replacement and verification.',metrics:['capacityUsed','load']},
  gpu:{model:'Supermicro / GPU compute',type:'AI jobs and airflow',description:'Fans and workload respond to the host. A cooling problem reduces work before service.',metrics:['load','temperature']},
  nuc:{model:'NUC / service nodes',type:'Small machines, useful services',description:'An application can fail while the host stays healthy. Diagnosis happens through the management console.',metrics:['load','memoryUsed']},
  ups:{model:'UPS / protected power',type:'A little resilience',description:'When room power drops, protected servers and networking stay alive on battery.',metrics:['load']},
  workstation:{model:'Samsung 49″ + Lenovo Legion',type:'Gaming, work and everything between',description:'A super-ultrawide, the Legion, a mechanical keyboard and the chair Sub returns to when checks pass.',metrics:['load','memoryUsed']}
};
