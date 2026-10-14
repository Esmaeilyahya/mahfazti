// محفظتي Pro — optional Cloudflare Worker for instant Telegram replies (webhook mode).
// Secrets (Cloudflare → Worker → Settings → Variables, type "Secret"): TG_TOKEN, TG_SECRET, FIREBASE_SA.  Plain var: DB_URL.
// After deploying, open  https://<your-worker>.workers.dev/setup?key=<TG_SECRET>  once to point Telegram at the worker.
import {handleUpdate} from '../scripts/tg-core.mjs';
const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64uS=s=>b64u(new TextEncoder().encode(s));
let TOK={v:null,exp:0};
async function gToken(sa){if(TOK.v&&Date.now()<TOK.exp-60e3)return TOK.v;const iat=Math.floor(Date.now()/1000);
  const head=b64uS(JSON.stringify({alg:'RS256',typ:'JWT'})),claim=b64uS(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',aud:'https://oauth2.googleapis.com/token',iat,exp:iat+3600}));
  const pem=sa.private_key.replace(/-----[^-]+-----/g,'').replace(/\s+/g,''),der=Uint8Array.from(atob(pem),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey('pkcs8',der,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const sig=b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(head+'.'+claim)));
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+head+'.'+claim+'.'+sig});
  const j=await r.json();if(!j.access_token)throw new Error('google token: '+JSON.stringify(j).slice(0,200));TOK={v:j.access_token,exp:Date.now()+(+j.expires_in||3600)*1000};return TOK.v}
function restDb(env){const sa=JSON.parse(env.FIREBASE_SA),base=String(env.DB_URL).replace(/\/$/,'');
  const req=async(p,method,body)=>{const t=await gToken(sa),r=await fetch(`${base}/${p}.json`,{method,headers:{authorization:'Bearer '+t,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw new Error(`rtdb ${method} ${p} ${r.status}`);return r.json()};
  return{get:p=>req(p,'GET'),set:(p,v)=>req(p,'PUT',v),update:(p,v)=>req(p,'PATCH',v),remove:p=>req(p,'DELETE')}}
const tgApi=env=>({call:async(m,params)=>{const r=await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(params||{})});return r.json()}});
export default{async fetch(req,env,ctx){const url=new URL(req.url);
  if(req.method==='GET'&&url.pathname==='/setup'){if(url.searchParams.get('key')!==env.TG_SECRET)return new Response('forbidden',{status:403});
    const me=await tgApi(env).call('getMe');if(me.ok&&me.result&&me.result.username)await restDb(env).set('tgcfg',{bot:me.result.username,at:Date.now()});
    const r=await tgApi(env).call('setWebhook',{url:url.origin+'/tg',secret_token:env.TG_SECRET,allowed_updates:['message','callback_query'],drop_pending_updates:false});return new Response(JSON.stringify(r),{headers:{'content-type':'application/json'}})}
  if(req.method==='POST'&&url.pathname==='/tg'){if(req.headers.get('x-telegram-bot-api-secret-token')!==env.TG_SECRET)return new Response('forbidden',{status:403});
    const u=await req.json().catch(()=>null);if(u)ctx.waitUntil(handleUpdate(u,{db:restDb(env),tg:tgApi(env),log:console.log}).catch(e=>console.log('tg error',e&&e.message)));return new Response('ok')}
  return new Response('محفظتي Pro bot',{status:200})}};
