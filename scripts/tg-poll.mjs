// Runs from GitHub Actions (see .github/workflows/telegram.yml). Secrets come from repository secrets only.
import {poll} from './tg-core.mjs';
const {TG_TOKEN,FIREBASE_SA,DB_URL}=process.env;
if(!TG_TOKEN||!FIREBASE_SA){console.log('tg: missing secrets: '+['TG_TOKEN','FIREBASE_SA'].filter(k=>!process.env[k]).join(', '));process.exit(process.env.STRICT==='1'?1:0)}
let SA;try{SA=JSON.parse(FIREBASE_SA)}catch(e){console.log('tg: FIREBASE_SA is not valid JSON');process.exit(1)}
const admin=(await import('firebase-admin')).default;
admin.initializeApp({credential:admin.credential.cert(SA),databaseURL:DB_URL});
const rdb=admin.database();
const db={get:async p=>(await rdb.ref(p).once('value')).val(),set:(p,v)=>rdb.ref(p).set(v),update:(p,v)=>rdb.ref(p).update(v),remove:p=>rdb.ref(p).remove()};
const tg={call:async(m,params)=>{const r=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${m}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(params||{})});return r.json()}};
try{const me=await tg.call('getMe');if(!me.ok){console.log('tg: token rejected by Telegram');process.exitCode=1}else{
  const wh=await tg.call('getWebhookInfo');if(wh.ok&&wh.result&&wh.result.url){console.log('tg: webhook mode is active (Cloudflare) — poller idle');}
  else{const r=await poll({db,tg});if(r.error)process.exitCode=1}}}
catch(e){console.error(e);process.exitCode=1}
await admin.app().delete();
