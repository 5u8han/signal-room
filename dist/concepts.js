import{mountDatacenterScene}from'./datacenter-scene.js';
const scenes=[...document.querySelectorAll('[data-concept]')].map(container=>mountDatacenterScene({container,variant:container.dataset.concept,motion:()=>false}));
window.addEventListener('pagehide',()=>scenes.forEach(scene=>scene.dispose()),{once:true});
