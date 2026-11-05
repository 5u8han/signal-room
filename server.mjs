import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {localBinding} from './worker/local-db.js';
import {handleAPI} from './worker/api.js';
const root=fileURLToPath(new URL('.',import.meta.url)),dist=path.join(root,'dist');
await mkdir(path.join(root,'.local'),{recursive:true});
const DB=localBinding(path.join(root,'.local','portfolio.sqlite'),await readFile(path.join(root,'migrations','0001_initial.sql'),'utf8'));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4','.mp3':'audio/mpeg','.vtt':'text/vtt; charset=utf-8','.pdf':'application/pdf'};
const csp="default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self' https://challenges.cloudflare.com; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";
const port=Number(process.env.PORTFOLIO_STUDIO_PORT||4320);
const server=createServer(async(req,res)=>{try{
 const address='http://127.0.0.1:'+port;const url=new URL(req.url,address);
 if(url.pathname.startsWith('/api/')){
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>8192){res.writeHead(413);res.end();return}chunks.push(chunk)}
  const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
  const result=await handleAPI(request,{DB,LOCAL_DEV:true,SITE_ORIGIN:address});res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
 let relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';if(!path.extname(relative))relative+='.html';
 const file=path.resolve(dist,relative);if(!file.startsWith(dist+path.sep))throw new Error('Not found');
 const info=await stat(file);if(!info.isFile())throw new Error('Not found');
 const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':csp,'Accept-Ranges':'bytes','Content-Length':info.size};
 let start=0,end=info.size-1,status=200;if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.writeHead(416);res.end();return}if(!match[1])start=Math.max(0,info.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]))}if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return}status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;headers['Content-Length']=end-start+1}
 res.writeHead(status,headers);if(req.method==='HEAD'){res.end();return}createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('This route is not available.')}});
server.listen(port,'127.0.0.1',()=>console.log(`Sub portfolio studio: http://127.0.0.1:${port}\nLocal SQLite workspace; no Cloudflare resources are modified.`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{DB.close();process.exit(0)}));
