// محفظتي Pro — push sender core (no secrets here). Reads push/<uid>/{subs,queue,sent} and sends due notifications.
export async function run({db,webpush,now=Date.now(),log=console.log}){
  const all=(await db.ref('push').once('value')).val()||{};let sent=0,fail=0,removed=0,users=0;
  for(const [uid,u] of Object.entries(all)){
    if(!u||typeof u!=='object')continue;users++;
    const subs=u.subs||{},queue=u.queue||{},done=u.sent||{};
    const due=Object.values(queue).filter(x=>x&&typeof x.at==='number'&&x.at<=now&&x.at>now-36*3600e3&&x.id&&!done[x.id]);
    for(const it of due){
      const payload=JSON.stringify({title:String(it.title||'محفظتي Pro').slice(0,120),body:String(it.body||'').slice(0,240),url:String(it.url||'./').slice(0,200),tag:it.id,id:it.id});
      for(const [sid,s] of Object.entries(subs)){
        if(!s||!s.sub)continue;
        try{await webpush.sendNotification(s.sub,payload,{TTL:86400,urgency:'normal'});sent++}
        catch(e){fail++;if(e&&(e.statusCode===404||e.statusCode===410)){await db.ref(`push/${uid}/subs/${sid}`).remove();delete subs[sid];removed++}else log('send error',uid,sid,e&&e.statusCode,e&&e.body)}
      }
      await db.ref(`push/${uid}/sent/${it.id}`).set(now);
    }
    for(const [k,t] of Object.entries(done))if(typeof t!=='number'||t<now-60*864e5)await db.ref(`push/${uid}/sent/${k}`).remove();
  }
  const r={users,sent,fail,removed};log(JSON.stringify(r));return r}
