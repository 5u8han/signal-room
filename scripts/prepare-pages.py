from pathlib import Path
import re
D=Path(__file__).resolve().parent.parent/'dist'
# Retain the design-reference portions without the old prototype profile editor.
old=(D/'about.html').read_text()
sections=re.findall(r'<section\b.*?</section>',old,re.S)
selected=[s for s in sections if 'atlas-section' in s[:200] or 'id="inventory"' in s[:200]]
head='''<!doctype html><html lang="en"><head><meta charset="utf-8"><script src="theme-boot.js"></script><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Source workbench / Sub</title><link rel="icon" href="assets/favicon.svg"><link rel="stylesheet" href="common.css"><link rel="stylesheet" href="about.css"><link rel="stylesheet" href="studio.css"><link rel="stylesheet" href="tech-reels.css"><link rel="stylesheet" href="theme.css"><script type="module" src="common.js"></script><script type="module" src="reference.js"></script></head><body data-page="reference"><header id="site-header"></header><main id="main"><section class="container studio-page-heading"><span class="micro">THE MATERIAL / DESIGN REFERENCE</span><h1 class="display">MANY WAYS<br>TO SEE IT.</h1><p>Palettes, tools and the thinking behind the experiments.</p></section>'''
(D/'reference.html').write_text(head+''.join(selected)+'</main><footer id="site-footer"></footer></body></html>')
a=(D/'about.js').read_text();(D/'reference.js').write_text(a[a.index('let inventory=null;'):a.index("document.querySelector('#export-profile')")])
common=(D/'common.js').read_text()
common=re.sub(r'<a class="header-contact".*?</a>','',common)
start=common.index("document.querySelector('#site-footer').innerHTML=")
end=common.index('function syncProfile()',start)
common=common[:start]+'''document.querySelector('#site-footer').innerHTML=`<div class="footer-base studio-footer"><div class="container"><div class="studio-footer-word display">THERE’S ALWAYS<br><span>ANOTHER LAYER.</span></div><div class="footer-main"><div><a class="wordmark" href="index.html">${brand}</a><p>Support engineering · Datacenter technology<br>Chicago, Illinois</p></div><nav class="footer-links" aria-label="Footer">${pages.map(([,label,url])=>`<a href="${url}">${label}</a>`).join('')}<a href="reference.html">Source workbench</a></nav></div><div class="studio-socials"><a href="mailto:info@5u8han.dev">info@5u8han.dev</a><a href="https://github.com/5u8han" rel="me">GitHub ↗</a><a href="https://www.linkedin.com/in/5u8han" rel="me">LinkedIn ↗</a><a href="https://twitter.com/5u8han" rel="me">Twitter / X ↗</a><button type="button" data-privacy-open>Privacy / analytics</button></div><div class="footer-meta"><span>© 2026 SUB / 5U8HAN.DEV</span><span>THE WIDE VIEW. THE FINE DETAIL.</span><span>Illustrated systems. Real experience.</span></div></div></div>`;
'''+common[end:]
common=common.replace("['Skills inventory','about.html#inventory'", "['Skills inventory','reference.html#inventory'")
common=common.replace("['Profile & handoff','about.html#profile','Personalize and export']", "['Datacenter concepts','concepts.html','Three animated landing worlds'],['Correspondence','about.html#correspondence','A quiet place for a note']")
common=common.replace("'about.html#profile'", "'about.html#correspondence'")
(D/'common.js').write_text(common)
# Use all verified work entries, preserving the already working grid/viewer.
w=(D/'work.js').read_text();s=w.index('const projects=[');e=w.index('const grid=',s)
w=w[:s]+'''const profileResponse=await fetch('profile-data.json');
if(!profileResponse.ok)throw new Error('Work data is unavailable');
const profileData=await profileResponse.json();
const projects=profileData.cases.map(p=>({id:p.id,title:p.title.toUpperCase(),category:p.category,subtitle:p.organization+' · '+(p.period||p.kind)+(p.engagement?' · '+p.engagement:''),art:p.art,brief:p.summary,approach:p.details.slice(0,2).join(' '),result:p.details.slice(2).join(' ')}));
'''+w[e:];(D/'work.js').write_text(w)
h=(D/'work.html').read_text().replace('01—07','01—09').replace('<span>07</span>','<span>09</span>').replace('<span>05</span>','<span>04</span>').replace('7 cases /','9 cases /').replace('CASE 01 / 07','CASE 01 / 09').replace('about.html#inventory','reference.html#inventory')
h=h.replace('<button type="button" data-filter="Networking"','<button type="button" data-filter="Support" aria-pressed="false"><span>Support</span><span>03</span></button><button type="button" data-filter="Networking"')
(D/'work.html').write_text(h)
# Old about anchors elsewhere now point to the dedicated source/reference page.
for p in D.rglob('*.html'):
 s=p.read_text().replace('about.html#inventory','reference.html#inventory')
 p.write_text(s)
