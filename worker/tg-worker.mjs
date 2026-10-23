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
const tgApi=env=>({call:async(m,params)=>{const r=await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(params||{})});return r.json()},
  file:async path=>{const r=await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${path}`);return r.ok?r.arrayBuffer():null},
  upload:async(m,fields,f)=>{const fd=new FormData();for(const k in fields)fd.append(k,fields[k]);fd.append(f.field,new Blob([f.data],{type:f.type}),f.name);const r=await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`,{method:'POST',body:fd});return r.json()}});

// ---- AI assistant (/ai): verifies the Firebase ID token, rate-limits per user, then asks Claude. Secret: ANTHROPIC_API_KEY (optional). Vars: FB_PROJECT, ALLOW_ORIGIN, AI_MODEL.
let JWK={keys:null,exp:0};
const b64dec=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0))};
async function fbUid(tok,proj){const parts=String(tok||'').split('.');if(parts.length!==3)throw new Error('auth');const h=JSON.parse(new TextDecoder().decode(b64dec(parts[0]))),p=JSON.parse(new TextDecoder().decode(b64dec(parts[1])));const now=Date.now()/1000;
  if(h.alg!=='RS256'||p.aud!==proj||p.iss!==`https://securetoken.google.com/${proj}`||!(p.exp>now)||!(p.iat<now+300)||!p.sub)throw new Error('auth');
  if(!JWK.keys||Date.now()>JWK.exp){const r=await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');const j=await r.json();JWK={keys:j.keys||[],exp:Date.now()+3600e3}}
  const k=JWK.keys.find(x=>x.kid===h.kid);if(!k)throw new Error('auth');const key=await crypto.subtle.importKey('jwk',k,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64dec(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));if(!ok)throw new Error('auth');return p.sub}
const AI_SYS=`إنت المساعد المالي جوه تطبيق «محفظتي Pro» — تطبيق لإدارة فلوس المغتربين (خصوصاً المصريين في السعودية والخليج).
- رد باللهجة المصرية، ودود ومختصر (من 3 لـ 8 سطور غالباً)، وممكن نقط قصيرة.
- اعتمد على البيانات اللي تحت بس. متخترعش أرقام. لو المعلومة مش موجودة قول كده واقترح يسجّلها.
- لما تحسب حاجة وضّح الحسبة باختصار.
- إنت مش مستشار مالي مرخّص: في الاستثمار والقروض قدّم معلومات تساعده يقرر، من غير ما تقوله «اشتري» أو «بيع».
- متطلبش منه أرقام حسابات أو باسوردات.
بيانات المستخدم (ملخص من التطبيق):
`;
function cors(env,req){const o=req.headers.get('origin')||'',allow=String(env.ALLOW_ORIGIN||'https://esmaeilyahya.github.io').split(',').map(x=>x.trim());return{'access-control-allow-origin':allow.includes(o)?o:allow[0],'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'authorization, content-type','vary':'origin'}}
async function aiHandle(req,env){const H={...cors(env,req),'content-type':'application/json'},J=(o,st=200)=>new Response(JSON.stringify(o),{status:st,headers:H});
  if(!env.ANTHROPIC_API_KEY)return J({error:'not_configured'},503);let uid;try{uid=await fbUid((req.headers.get('authorization')||'').replace(/^Bearer\s+/i,''),env.FB_PROJECT)}catch(e){return J({error:'auth'},401)}
  const b=await req.json().catch(()=>null);if(!b||typeof b.q!=='string'||!b.q.trim())return J({error:'bad'},400);
  const db=restDb(env),day=new Date().toISOString().slice(0,10),lim=+env.AI_DAILY||30;let n=0;try{n=+(await db.get(`ai/${uid}/${day}`))||0}catch(e){}if(n>=lim)return J({error:'limit',left:0},429);
  const hist=(Array.isArray(b.h)?b.h:[]).slice(-6).filter(m=>m&&(m.role==='user'||m.role==='assistant')&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,2000)}));while(hist.length&&hist[0].role!=='user')hist.shift();
  const messages=[...hist,{role:'user',content:b.q.slice(0,600)}];
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01','content-type':'application/json'},body:JSON.stringify({model:env.AI_MODEL||'claude-haiku-5-5',max_tokens:800,system:AI_SYS+String(b.ctx||'').slice(0,9000),messages})});
  const j=await r.json().catch(()=>({}));if(!r.ok){console.log('ai err',r.status,JSON.stringify(j).slice(0,300));return J({error:'upstream'},502)}
  const a=(j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n').trim();try{await db.set(`ai/${uid}/${day}`,n+1)}catch(e){}return J({a,left:lim-n-1})}
export default{async fetch(req,env,ctx){const url=new URL(req.url);
  if(url.pathname==='/ai'){if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(env,req)});if(req.method==='POST')return aiHandle(req,env).catch(e=>new Response(JSON.stringify({error:'server'}),{status:500,headers:{...cors(env,req),'content-type':'application/json'}}))}
  if(req.method==='GET'&&url.pathname==='/setup'){if(url.searchParams.get('key')!==env.TG_SECRET)return new Response('forbidden',{status:403});
    const out={};try{await tgApi(env).call('setMyCommands',{commands:[{command:'help',description:'الأمثلة'},{command:'today',description:'صرفت كام النهارده'},{command:'month',description:'صرفت كام الشهر ده'},{command:'report',description:'ملف تقرير الشهر'},{command:'last',description:'آخر الحركات'},{command:'undo',description:'إلغاء آخر رسالة'}]});out.webhook=await tgApi(env).call('setWebhook',{url:url.origin+'/tg',secret_token:env.TG_SECRET,allowed_updates:['message','callback_query'],drop_pending_updates:false});
      const me=await tgApi(env).call('getMe');out.bot=me.ok&&me.result?me.result.username:null;if(!me.ok)out.me=me.description;
      try{if(out.bot)await restDb(env).set('tgcfg',{bot:out.bot,url:url.origin,ai:!!env.ANTHROPIC_API_KEY,at:Date.now()});out.db=true}catch(e){out.db=String(e&&e.message||e).slice(0,200)}}
    catch(e){out.error=String(e&&e.message||e).slice(0,200)}
    out.ok=!!(out.webhook&&out.webhook.ok);return new Response(JSON.stringify(out),{headers:{'content-type':'application/json'}})}
  if(req.method==='POST'&&url.pathname==='/tg'){if(req.headers.get('x-telegram-bot-api-secret-token')!==env.TG_SECRET)return new Response('forbidden',{status:403});
    const u=await req.json().catch(()=>null);if(u)ctx.waitUntil(handleUpdate(u,{db:restDb(env),tg:tgApi(env),log:console.log}).catch(e=>console.log('tg error',e&&e.message)));return new Response('ok')}
  return new Response('محفظتي Pro bot',{status:200})}};
