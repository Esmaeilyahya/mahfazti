// Runs from GitHub Actions (see .github/workflows/push.yml). Secrets come from repository secrets only.
import {run} from './push-core.mjs';
const {FIREBASE_SA,VAPID_PUBLIC,VAPID_PRIVATE,VAPID_SUBJECT,DB_URL}=process.env;
if(!FIREBASE_SA||!VAPID_PUBLIC||!VAPID_PRIVATE){const miss=['FIREBASE_SA','VAPID_PUBLIC','VAPID_PRIVATE'].filter(k=>!process.env[k]);console.log('push: missing secrets: '+miss.join(', '));process.exit(process.env.STRICT==='1'?1:0)}
let SA;try{SA=JSON.parse(FIREBASE_SA)}catch(e){console.log('push: FIREBASE_SA is not valid JSON');process.exit(1)}
const admin=(await import('firebase-admin')).default,webpush=(await import('web-push')).default;
admin.initializeApp({credential:admin.credential.cert(SA),databaseURL:DB_URL});
webpush.setVapidDetails(VAPID_SUBJECT||'mailto:owner@mahfazti.app',VAPID_PUBLIC,VAPID_PRIVATE);
try{await run({db:admin.database(),webpush})}catch(e){console.error(e);process.exitCode=1}
await admin.app().delete();
