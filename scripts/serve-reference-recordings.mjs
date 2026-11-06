// Private, read-only review of the owner's requested website recordings.
// Nothing in research/recordings is part of the portfolio deployment.
import http from'node:http';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{realpath,stat}from'node:fs/promises';
import{createReadStream}from'node:fs';

const directory=await realpath(fileURLToPath(new URL('../research/recordings/',import.meta.url)));
const port=Number(process.env.REFERENCE_REVIEW_PORT||4321);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid review port');
const types={'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.jpg':'image/jpeg','.json':'application/json; charset=utf-8'};
const inside=file=>file.startsWith(directory+path.sep);
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const candidate=path.resolve(directory,'.'+(route==='/'?'/index.html':route));
    if(!inside(candidate))throw Error('Not found');
    const file=await realpath(candidate),type=types[path.extname(file)];
    if(!inside(file)||!type)throw Error('Not found');
    const info=await stat(file);if(!info.isFile())throw Error('Not found');
    const headers={'Content-Type':type,'Cache-Control':'no-store','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff'};
    let start=0,end=info.size-1,status=200;
    if(req.headers.range){
      const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!range||!range[1]&&!range[2]){res.writeHead(416,{'Content-Range':'bytes */'+info.size});res.end();return;}
      if(!range[1]){start=Math.max(0,info.size-Number(range[2]));}
      else{start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);}
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size){res.writeHead(416,{'Content-Range':'bytes */'+info.size});res.end();return;}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length']=String(end-start+1);res.writeHead(status,headers);
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Reference recordings: http://127.0.0.1:${port}/`));
