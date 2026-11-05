import {isAdmin} from './auth.js';
const allowed=new Set(['page_view','engagement','case_open','theme_change','film_play','resume_download','outbound_click','concept_select']);
export function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
const small=(value,max=80)=>typeof value==='string'?value.trim().slice(0,max):'';
const campaign=value=>/^[a-zA-Z0-9_. -]{0,80}$/.test(value||'')?small(value):'';
const pathname=value=>{try{const parsed=new URL(value,'https://local.invalid');return parsed.origin==='https://local.invalid'&&parsed.pathname.startsWith('/')?parsed.pathname.slice(0,200):'/'}catch{return'/'}};
const source=value=>{try{return new URL(value).hostname.slice(0,120)||'Direct'}catch{return'Direct'}};
function sameOrigin(request,env){const origin=request.headers.get('origin');return origin===(env.SITE_ORIGIN||new URL(request.url).origin)}
async function body(request){const length=Number(request.headers.get('content-length')||0);if(length>8192)throw new Error('Too large');const text=await request.text();if(new TextEncoder().encode(text).length>8192)throw new Error('Too large');return JSON.parse(text)}
async function permit(request,env,kind,limit){
 if(!env.LOCAL_DEV&&!env.ANALYTICS_SALT)return false;
 const raw=(request.headers.get('CF-Connecting-IP')||'local')+'|'+kind+'|'+Math.floor(Date.now()/60000);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.ANALYTICS_SALT||'local-preview-only'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(raw));const id=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const expires=Math.floor(Date.now()/1000)+120;
 const row=await env.DB.prepare('INSERT INTO request_limits(key,expires_at,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(id,expires).first();
 return row.count<=limit;
}
async function totals(db,start,end){const row=await db.prepare(`SELECT COUNT(CASE WHEN name='page_view' THEN 1 END) AS views,COUNT(DISTINCT CASE WHEN name='page_view' THEN session END) AS visitors,COUNT(DISTINCT CASE WHEN name='engagement' THEN session END) AS engagedSessions,COUNT(CASE WHEN name='resume_download' THEN 1 END) AS resumeDownloads,COUNT(CASE WHEN name='film_play' THEN 1 END) AS filmPlays FROM events WHERE created_at>=? AND created_at<?`).bind(start,end).first();const inquiry=await db.prepare('SELECT COUNT(*) AS count FROM inquiries WHERE created_at>=? AND created_at<?').bind(start,end).first();return{...row,inquiries:inquiry.count}}
const results=async(db,sql,...bindings)=>(await db.prepare(sql).bind(...bindings).all()).results;
function dates(days){const end=new Date();end.setUTCDate(end.getUTCDate()+1);end.setUTCHours(0,0,0,0);const start=new Date(end);start.setUTCDate(start.getUTCDate()-days);const previous=new Date(start);previous.setUTCDate(previous.getUTCDate()-days);return{end:end.toISOString(),start:start.toISOString(),previous:previous.toISOString()}}
export async function overview(env,range){
 const days={'7d':7,'30d':30,'90d':90}[range]||30,{start,end,previous}=dates(days),db=env.DB;
 const [current,prior,series,pages,referrers,campaigns,events,inquiries]=await Promise.all([
  totals(db,start,end),totals(db,previous,start),
  results(db,`SELECT substr(created_at,1,10) AS date,COUNT(*) AS views,COUNT(DISTINCT session) AS visitors FROM events WHERE name='page_view' AND created_at>=? AND created_at<? GROUP BY date ORDER BY date`,start,end),
  results(db,`SELECT path,COUNT(CASE WHEN name='page_view' THEN 1 END) AS views,COUNT(CASE WHEN name='engagement' THEN 1 END) AS engaged FROM events WHERE created_at>=? AND created_at<? GROUP BY path HAVING views>0 ORDER BY views DESC LIMIT 30`,start,end),
  results(db,`SELECT referrer AS source,COUNT(*) AS views FROM events WHERE name='page_view' AND created_at>=? AND created_at<? GROUP BY referrer ORDER BY views DESC LIMIT 12`,start,end),
  results(db,`SELECT source,medium,campaign,COUNT(CASE WHEN name='page_view' THEN 1 END) AS views,COUNT(CASE WHEN name IN ('case_open','resume_download') THEN 1 END) AS conversions FROM events WHERE campaign<>'' AND created_at>=? AND created_at<? GROUP BY source,medium,campaign ORDER BY views DESC LIMIT 30`,start,end),
  results(db,`SELECT name,COUNT(*) AS count FROM events WHERE created_at>=? AND created_at<? GROUP BY name ORDER BY count DESC`,start,end),
  results(db,`SELECT id,name,email,message,created_at AS createdAt,status FROM inquiries WHERE created_at>=? AND created_at<? ORDER BY created_at DESC LIMIT 100`,start,end)
 ]);
 const map=new Map(series.map(row=>[row.date,row]));const filled=Array.from({length:days},(_,i)=>{const date=new Date(start);date.setUTCDate(date.getUTCDate()+i);const key=date.toISOString().slice(0,10);return map.get(key)||{date:key,views:0,visitors:0}});
 return{mode:env.LOCAL_DEV?'local':'production',totals:current,previous:prior,series:filled,pages,referrers,campaigns,events,inquiries,updatedAt:new Date().toISOString()};
}
export function demoOverview(range){const days={'7d':7,'30d':30,'90d':90}[range]||30,{start}=dates(days);const series=Array.from({length:days},(_,i)=>{const date=new Date(start);date.setUTCDate(date.getUTCDate()+i);const views=48+Math.round(i*2.3+Math.sin(i*.75)*18);return{date:date.toISOString().slice(0,10),views,visitors:Math.round(views*.7)}});const views=series.reduce((sum,r)=>sum+r.views,0);return{mode:'demo',totals:{views,visitors:Math.round(views*.65),engagedSessions:Math.round(views*.3),resumeDownloads:37,filmPlays:198,inquiries:0},previous:{views:Math.round(views*.74),visitors:Math.round(views*.51),engagedSessions:Math.round(views*.22),resumeDownloads:25,filmPlays:130,inquiries:0},series,pages:[{path:'/',views:Math.round(views*.45),engaged:Math.round(views*.45*.4)},{path:'/work.html',views:Math.round(views*.24),engaged:Math.round(views*.24*.4)},{path:'/about.html',views:Math.round(views*.18),engaged:Math.round(views*.18*.4)},{path:'/atlas.html',views:Math.round(views*.13),engaged:Math.round(views*.13*.4)}],referrers:[{source:'Direct',views:Math.round(views*.4)},{source:'linkedin.com',views:Math.round(views*.36)},{source:'github.com',views:Math.round(views*.24)}],campaigns:[{source:'linkedin',medium:'social',campaign:'field-notes-demo',views:148,conversions:23},{source:'github',medium:'profile',campaign:'portfolio-demo',views:96,conversions:18}],events:[{name:'page_view',count:views},{name:'film_play',count:198},{name:'case_open',count:95},{name:'resume_download',count:37}],inquiries:[],updatedAt:new Date().toISOString()}}
export async function handleAPI(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path==='/api/config'&&request.method==='GET')return json({tracking:!!env.DB&&(!!env.LOCAL_DEV||!!env.ANALYTICS_SALT),mode:env.LOCAL_DEV?'local':'production',turnstileSiteKey:env.TURNSTILE_SITE_KEY||null,correspondence:!!env.LOCAL_DEV||!!env.TURNSTILE_SECRET});
 if(path.startsWith('/api/admin/')){
  if(!await isAdmin(request,env))return json({error:'Cloudflare Access sign-in is required.'},401);
  if(!env.DB)return json({error:'Database binding is not configured.'},503);
  if(path==='/api/admin/overview'&&request.method==='GET'){const range=url.searchParams.get('range')||'30d';if(!['7d','30d','90d'].includes(range))return json({error:'Invalid range.'},400);if(url.searchParams.get('demo')==='1')return json(demoOverview(range));return json(await overview(env,range))}
  const match=/^\/api\/admin\/inquiries\/([a-f0-9-]{36})$/.exec(path);
  if(match&&request.method==='PATCH'){if(!sameOrigin(request,env))return json({error:'Origin not allowed.'},403);let data;try{data=await body(request)}catch{return json({error:'Invalid body.'},400)}if(!['new','reviewed','archived'].includes(data.status))return json({error:'Invalid status.'},400);const row=await env.DB.prepare('UPDATE inquiries SET status=? WHERE id=? RETURNING id,status').bind(data.status,match[1]).first();return row?json(row):json({error:'Note not found.'},404)}
  return json({error:'Not found.'},404);
 }
 if(!['/api/events','/api/inquiries'].includes(path))return json({error:'Not found.'},404);
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!sameOrigin(request,env))return json({error:'Origin not allowed.'},403);
 if(!env.DB)return json({error:'Database binding is not configured.'},503);
 let data;try{data=await body(request)}catch{return json({error:'Invalid or oversized body.'},400)}
 if(path==='/api/events'){
  if(data.consent!==true||!allowed.has(data.name)||!/^[a-f0-9-]{36}$/.test(data.id||'')||!/^[a-f0-9-]{36}$/.test(data.session||''))return json({error:'Invalid event.'},400);
  if(!await permit(request,env,'events',90))return json({error:'Rate limit exceeded.'},429);
  const props={};for(const key of ['theme','variant','case','film','section','destination'])if(typeof data.properties?.[key]==='string')props[key]=small(data.properties[key],80).replace(/[^a-zA-Z0-9_./ -]/g,'');
  await env.DB.prepare('INSERT OR IGNORE INTO events(id,created_at,name,session,path,referrer,source,medium,campaign,device,properties) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(data.id,new Date().toISOString(),data.name,data.session,pathname(data.path),source(data.referrer),campaign(data.source),campaign(data.medium),campaign(data.campaign),data.device==='mobile'?'mobile':'desktop',JSON.stringify(props)).run();
  return json({ok:true},202);
 }
 if(!env.LOCAL_DEV&&!env.TURNSTILE_SECRET)return json({error:'Correspondence is not enabled until spam protection is configured.'},503);
 if(data.website)return json({ok:true},202);
 const name=small(data.name,100),email=small(data.email,200),message=small(data.message,4000);
 if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<10||data.agree!==true)return json({error:'Add a name, valid email, message and storage permission.'},400);
 if(!await permit(request,env,'inquiry',5))return json({error:'Too many notes. Please try later.'},429);
 if(!env.LOCAL_DEV){const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:small(data.turnstileToken,2048)})});const result=await verification.json();if(!result.success||result.hostname!==new URL(env.SITE_ORIGIN).hostname)return json({error:'Verification did not pass.'},400)}
 const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO inquiries(id,created_at,name,email,message) VALUES(?,?,?,?,?)').bind(id,new Date().toISOString(),name,email,message).run();return json({ok:true,id},201);
}
export async function maintenance(env){if(!env.DB)return;const cutoff=new Date(Date.now()-90*86400000).toISOString();await env.DB.batch([env.DB.prepare('DELETE FROM events WHERE created_at<?').bind(cutoff),env.DB.prepare('DELETE FROM request_limits WHERE expires_at<?').bind(Math.floor(Date.now()/1000))])}
