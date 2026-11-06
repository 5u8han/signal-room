// Regenerate review routes from the retained live homepage, keeping its scene,
// accessible controls and incident dialogs synchronized with the main build.
import{readFile,writeFile}from'node:fs/promises';
const dist=new URL('../dist/',import.meta.url);
const source=await readFile(new URL('index.html',dist),'utf8');
for(const[id,name]of[['1','Canopy'],['2','Split Signal'],['3','Glass Spine'],['4','Command Dock']]){
  const html=source
    .replace('<title>5u8han / The home lab</title>',`<title>0${id} / ${name} — Liquid glass landing study</title>`)
    .replace('<link rel="stylesheet" href="homelab.css">','<link rel="stylesheet" href="homelab.css">\n  <link rel="stylesheet" href="glass-studies.css">')
    .replace('<script type="module" src="homelab.js"></script>','<script type="module" src="homelab.js"></script>\n  <script type="module" src="glass-studies.js"></script>')
    .replace('data-home="homelab"','data-home="homelab" data-glass-variant="'+id+'"');
  await writeFile(new URL('glass-0'+id+'.html',dist),html);
}
console.log('Generated four live liquid-glass landing review pages.');
