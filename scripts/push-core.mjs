// محفظتي Pro — push sender core (no secrets here).
// Reads push/<uid>/{subs,queue,sent,alerts,afired}: sends due reminders and fires price alerts (FX + gold).
const OZ=31.1035;
export async function prices(fetchF=globalThis.fetch){const out={};
  try{const r=await fetchF('https://open.er-api.com/v6/latest/USD');const j=await r.json();if(j&&j.rates&&j.rates.USD)out.fx=j.rates}catch(e){}
  try{const r=await fetchF('https://api.gold-api.com/price/XAU');const j=await r.json();if(+j.price>0)out.oz=+j.price}catch(e){}
  return out}
export function alertVal(a,P){const R=P&&P.fx;if(!R||!a)return null;
  if(a.type==='fx'){const b=R[a.base],q=R[a.quote];return b>0&&q>0?q/b:null}
  if(a.type==='gold'){const c=R[a.cur];if(!(P.oz>0)||!(c>0))return null;return P.oz/OZ*c*(1+(+a.prem||0)/100)*(+a.karat||24)/24}
  return null}
const hit=(a,v)=>v!=null&&isFinite(v)&&+a.v>0&&(a.op==='lte'?v<=+a.v:v>=+a.v);
const fv=v=>Number(v).toLocaleString('en-US',{maximumFractionDigits:v<20?3:2});
async function sendAll(db,webpush,uid,subs,payload,log,st){let ok=0;
  for(const [sid,s] of Object.entries(subs)){if(!s||!s.sub)continue;
    try{await webpush.sendNotification(s.sub,payload,{TTL:86400,urgency:'normal'});st.sent++;ok++}
    catch(e){st.fail++;if(e&&(e.statusCode===404||e.statusCode===410)){await db.ref(`push/${uid}/subs/${sid}`).remove();delete subs[sid];st.removed++}else log('send error',uid,sid,e&&e.statusCode,e&&e.body)}}
  return ok}
export async function run({db,webpush,now=Date.now(),log=console.log,fetchF=globalThis.fetch}){
  const all=(await db.ref('push').once('value')).val()||{},st={users:0,sent:0,fail:0,removed:0,alerts:0};
  const needP=Object.values(all).some(u=>u&&u.alerts&&Object.keys(u.alerts).length&&u.subs&&Object.keys(u.subs).length);
  const P=needP?await prices(fetchF):{};
  for(const [uid,u] of Object.entries(all)){
    if(!u||typeof u!=='object')continue;st.users++;
    const subs=u.subs||{},queue=u.queue||{},done=u.sent||{},fired=u.afired||{};
    const due=Object.values(queue).filter(x=>x&&typeof x.at==='number'&&x.at<=now&&x.at>now-36*3600e3&&x.id&&!done[x.id]);
    for(const it of due){
      const payload=JSON.stringify({title:String(it.title||'محفظتي Pro').slice(0,120),body:String(it.body||'').slice(0,240),url:String(it.url||'./').slice(0,200),tag:it.id,id:it.id});
      await sendAll(db,webpush,uid,subs,payload,log,st);
      await db.ref(`push/${uid}/sent/${it.id}`).set(now);
    }
    if(Object.keys(subs).length)for(const [id,a] of Object.entries(u.alerts||{})){
      if(!a||fired[id])continue;const v=alertVal(a,P);if(!hit(a,v))continue;
      const payload=JSON.stringify({title:`🔔 ${String(a.nm||'تنبيه سعر').slice(0,80)}: ${fv(v)} ${String(a.sym||'').slice(0,8)}`,body:`${a.op==='lte'?'نزل تحت':'عدّى'} ${fv(+a.v)} اللي حددته${a.type==='fx'?' — ممكن يبقى وقت مناسب تحوّل':''}`,url:'./?a=alerts',tag:'al-'+id,id:'al-'+id});
      if(await sendAll(db,webpush,uid,subs,payload,log,st)){await db.ref(`push/${uid}/afired/${id}`).set({at:now,val:+v.toFixed(4)});st.alerts++}
    }
    for(const [k,t] of Object.entries(done))if(typeof t!=='number'||t<now-60*864e5)await db.ref(`push/${uid}/sent/${k}`).remove();
  }
  log(JSON.stringify(st));return st}
