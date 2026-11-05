import {createRemoteJWKSet,jwtVerify} from 'jose';
const sets=new Map();
export async function isAdmin(request,env){
 if(env.LOCAL_DEV===true)return true;
 if(!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)return false;
 const team=env.ACCESS_TEAM_DOMAIN;
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team))return false;
 const token=request.headers.get('Cf-Access-Jwt-Assertion');if(!token)return false;
 try{
  let keySet=sets.get(team);if(!keySet){keySet=createRemoteJWKSet(new URL('https://'+team+'/cdn-cgi/access/certs'));sets.set(team,keySet)}
  await jwtVerify(token,keySet,{issuer:'https://'+team,audience:env.ACCESS_AUD,algorithms:['RS256']});return true;
 }catch{return false}
}
