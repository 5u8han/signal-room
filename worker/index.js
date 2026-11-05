import {handleAPI,json,maintenance} from './api.js';
import {isAdmin} from './auth.js';
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  try{
   if(path.startsWith('/api/'))return await handleAPI(request,env);
   if(path.startsWith('/dashboard')&&!await isAdmin(request,env))return json({error:'This operator workspace requires Cloudflare Access sign-in.'},401);
   return await env.ASSETS.fetch(request);
  }catch{return json({error:'The request could not be completed.'},500)}
 },
 async scheduled(_event,env,context){context.waitUntil(maintenance(env))}
};
