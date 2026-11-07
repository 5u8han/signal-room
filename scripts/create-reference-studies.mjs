// Keep every live room/control/dialog synchronized with the retained homepage.
import{readFile,writeFile}from'node:fs/promises';
import{mark}from'./reference-studies/helpers.mjs';
const dist=new URL('../dist/',import.meta.url),source=await readFile(new URL('index.html',dist),'utf8');
const room=source.match(/<section class="homelab"[\s\S]*?<\/section>/)?.[0];
const dialogs=source.match(/  <dialog class="homelab-dialog[\s\S]*?(?=\n<\/body>)/)?.[0];
if(!room||!dialogs)throw Error('Missing current homelab source');
const catalog=[];
const decode=value=>value.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&amp;','&');
for(const slug of['delta','roveia','atmos']){
 const{default:study}=await import('./reference-studies/'+slug+'.mjs');
 if((study.html.match(/<!-- HOMELAB -->/g)||[]).length!==1)throw Error('Expected one live room slot: '+slug);
 let live=room
  .replace('<div class="homelab-copy">','<div class="homelab-copy" '+mark(slug+'-identity','Live room identity and typewriter','The existing logo, mission and typing roles are styled for this study, above the working room.')+'>')
  .replace('<div class="homelab-deskbar">','<div class="homelab-deskbar" '+mark(slug+'-live-status','Live repair status','Actual incident phase, repair progress and WAN status from the retained simulation.')+'>')
  .replace('<div class="homelab-controls"','<div '+mark(slug+'-room-controls','Live room controls','Pause, incident selection, device inspection, console, traffic and original Webamp remain functional.')+' class="homelab-controls"');
 let body=study.html;
 if(slug!=='delta'){
  live=live.replace('<h1 id="home-title">','<h2 class="study-room-brand" id="home-title">').replace('</h1>','</h2>');
  const opening=new RegExp('<h2 id="'+slug+'-opening-(?:type|title)"[\\s\\S]*?</h2>');
  body=body.replace(opening,block=>block.replace('<h2','<h1').replace('</h2>','</h1>'));
 }
 const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><script src="theme-boot.js"></script><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="Sub / a labeled, interactive ${slug} design interpretation with the living homelab."><title>5u8han / ${study.title}</title><link rel="icon" href="assets/favicon.svg"><link rel="preload" as="image" href="assets/homelab/room-front.png"><link rel="stylesheet" href="common.css"><link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="homelab.css"><link rel="stylesheet" href="study-common.css"><link rel="stylesheet" href="study-${slug}.css"><script type="module" src="study-common.js"></script><script type="module" src="homelab.js"></script>${slug==='atmos'?'<script type="module" src="study-atmos.js"></script>':''}</head><body class="study-page" data-home="homelab" data-design-study="${slug}">${body.replace('<!-- HOMELAB -->',live)}${dialogs}</body></html>`;
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate IDs in '+slug);
 await writeFile(new URL('study-'+slug+'.html',dist),html);
 const details=[...html.matchAll(/id="([^"]+)" data-study="([^"]+)" data-design="([^"]+)"( data-kind="section")?/g)].map(([,id,title,design,section])=>({id,title:decode(title),design:decode(design),section:Boolean(section)}));catalog.push({slug,title:study.title,url:'study-'+slug+'.html',details});
}
await writeFile(new URL('design-studies.json',dist),JSON.stringify({schema:1,generated:'2026-11-06',studies:catalog},null,2)+'\n');
console.log('Generated three live design interpretations with '+catalog.reduce((n,s)=>n+s.details.length,0)+' labeled details.');
