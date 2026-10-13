// محفظتي Pro — Telegram bot core (no secrets here). Runtime-agnostic: used by the GitHub poller and the optional Cloudflare Worker.
// db: {get(path), set(path,v), update(path,obj), remove(path)}  ·  tg: {call(method, params)} → Telegram JSON
// Messages are written to users/<uid>/inbox/<id>; the app reads them, parses them with its own engine, and records them.
const SYM={SAR:'ر.س',EGP:'ج.م',AED:'د.إ',KWD:'د.ك',QAR:'ر.ق',BHD:'د.ب',OMR:'ر.ع',JOD:'د.أ',USD:'$',EUR:'€',GBP:'£',TRY:'₺'};
const CTRY_W=[['مصر','EG'],['السعوديه','SA'],['السعودية','SA'],['الرياض','SA'],['جده','SA'],['الامارات','AE'],['دبي','AE'],['ابوظبي','AE'],['الكويت','KW'],['قطر','QA'],['البحرين','BH'],['عمان','OM'],['الاردن','JO']];
export const normDigits=s=>String(s||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g,'.').replace(/٬/g,',');
export const norm=s=>normDigits(s).toLowerCase().replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const fmt=v=>Number(v||0).toLocaleString('en-US',{maximumFractionDigits:2});
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const sym=c=>SYM[c]||c||'';
const parseJ=v=>{if(v==null)return null;if(typeof v!=='string')return v;try{return JSON.parse(v)}catch(e){return null}};
export const HELP=`ابعتلي أي حركة بالعربي وأنا أسجلها في محفظتك:
• <code>غدا 45</code> — مصروف
• <code>بنزين 80 كاش</code> — من حساب الكاش
• <code>+12000 مرتب</code> — دخل
• <code>حولت 3000 مصر</code> — تحويل
• <code>سلفت محمود 500</code> — سلفة
• <code>صرفت كام النهارده؟</code> أو <code>الأسبوع</code> أو <code>الشهر</code>
• <code>آخر</code> — آخر الحركات · <code>تراجع</code> — يلغي آخر رسالة`;

export function preview(text,core){const t=normDigits(text).replace(/\s+/g,' ').trim(),n=norm(t),m=t.match(/(\d+(?:[.,]\d+)?)/);if(!m)return null;
  const amount=parseFloat(m[1].replace(',','.'));if(!(amount>0)||amount>1e9)return null;
  const accs=((core&&core.accounts)||[]).filter(a=>a&&!a.archived),st=(core&&core.settings)||{};
  const words=a=>[a.name,a.bank].filter(Boolean).map(norm).filter(k=>k.length>1);
  const hits=accs.filter(a=>words(a).some(k=>n.includes(k)||(k.startsWith('ال')&&n.includes(k.slice(2)))));
  let kind='expense';if(/^(حولت|تحويل|نقلت)/.test(n))kind='transfer';else if(/^\+/.test(t)||/(راتب|مرتب|استلمت|قبضت|وارد|جالي|مكافاه|بونص)/.test(n))kind='income';
  else if(/(سلفت|اسلفت|استلفت|اتسلفت|سلفني|رجعلي|رجع لي|سددت|سددلي|رجعت ل|قرضت|اقترضت)/.test(n))kind='debt';
  const def=accs.find(a=>a.id===st.lastAcc)||accs[0]||null;let acc=hits[0]||def,to=null;
  if(kind==='expense'&&/(كاش|نقدي|نقدا|cash)/.test(n)&&!hits.length)acc=accs.find(a=>a.type==='cash'&&(!def||a.country===def.country))||acc;
  if(kind==='transfer'){to=hits[1]||null;if(!to){const cw=CTRY_W.find(([w])=>n.includes(norm(w)));if(cw)to=accs.find(a=>a.country===cw[1]&&a!==acc)||null}if(hits.length===1&&to&&hits[0]===to)acc=def}
  let desc=t.replace(m[0],' ').replace(/^\s*\+/,' ');hits.forEach(a=>[a.name,a.bank].filter(Boolean).forEach(x=>{desc=desc.split(x).join(' ')}));
  desc=desc.replace(/(^|\s)(من|في|على|علي|كاش|نقدي|ريال|جنيه|درهم|دينار|دولار|ر\.س|ج\.م)(?=\s|$)/g,' ').replace(/\s+/g,' ').trim();
  return{kind,amount,acc,to,desc,cur:acc?acc.currency:null}}
function previewLine(p){if(!p)return '✅ وصلت';const a=p.acc,amt=`${fmt(p.amount)} ${sym(p.cur)}`.trim();
  if(p.kind==='income')return `✅ 💰 دخل ${amt}${a?' · '+a.name:''}${p.desc?' — '+p.desc:''}`;
  if(p.kind==='transfer')return `✅ ↔️ تحويل ${amt}${a?' من '+a.name:''}${p.to?' لـ '+p.to.name:''}`;
  if(p.kind==='debt')return `✅ 🤝 ${p.desc||'سلفة'} — ${amt}`;
  return `✅ 🧾 ${p.desc||'مصروف'} — ${amt}${a?' · '+a.name:''}`}

const QRX=/(صرفت كام|كام صرفت|صرفت قد ايه|مصاريفي|مصروفاتي|مصروفي|^\/(today|week|month)$)/;
export function period(n){if(/(الشهر|شهر|\/month)/.test(n))return 'month';if(/(الاسبوع|اسبوع|\/week)/.test(n))return 'week';return 'day'}
export function localDay(now,tz){try{return new Intl.DateTimeFormat('en-CA',{timeZone:tz||'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now))}catch(e){return new Date(now).toISOString().slice(0,10)}}
const addD=(d,n)=>{const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
async function monthTx(db,uid,m){const v=parseJ(await db.get(`users/${uid}/data/tx_${m}`));return (v&&Array.isArray(v.items))?v.items:[]}
async function spendReport(db,uid,per,now){const tz=(await db.get(`push/${uid}/cfg/tz`))||'Asia/Riyadh',td=localDay(now,tz);
  const from=per==='month'?td.slice(0,8)+'01':per==='week'?addD(td,-6):td,ms=[...new Set([from.slice(0,7),td.slice(0,7)])];
  const core=parseJ(await db.get(`users/${uid}/data/core`))||{},cats={};(core.cats||[]).forEach(c=>{if(c&&c.id)cats[c.id]=`${c.icon||''} ${c.name||''}`.trim()});
  let items=[];for(const m of ms)items=items.concat(await monthTx(db,uid,m));
  const ex=items.filter(t=>t&&t.kind==='expense'&&t.date>=from&&t.date<=td&&!(t.scope==='company'&&t.rec)),by={},bc={};
  ex.forEach(t=>{by[t.cur]=(by[t.cur]||0)+(+t.amount||0);const k=t.cat||'other';bc[k]=(bc[k]||0)+1});
  const inbox=await db.get(`users/${uid}/inbox`)||{},pend=Object.values(inbox).filter(x=>x&&x.text).length;
  const lbl={day:'النهارده',week:'آخر 7 أيام',month:'الشهر ده'}[per],top=Object.entries(bc).sort((a,b)=>b[1]-a[1])[0];
  const tot=Object.entries(by).map(([c,v])=>`${fmt(v)} ${sym(c)}`).join(' + ');
  return `${tot?`💸 صرفت ${lbl}: <b>${esc(tot)}</b>`:`💸 مفيش مصاريف متسجلة ${lbl}`}${ex.length?`\n(${ex.length} حركة${top&&cats[top[0]]?` · أكتر بند: ${esc(cats[top[0]])}`:''})`:''}${pend?`\n📩 + ${pend} ${pend===1?'رسالة':'رسايل'} لسه هتتسجل لما تفتح المحفظة`:''}`}
async function lastReport(db,uid,now){const tz=(await db.get(`push/${uid}/cfg/tz`))||'Asia/Riyadh',td=localDay(now,tz),pm=addD(td.slice(0,8)+'01',-1).slice(0,7);
  const items=(await monthTx(db,uid,td.slice(0,7))).concat(await monthTx(db,uid,pm)).filter(t=>t&&(t.kind==='expense'||t.kind==='income')).sort((a,b)=>(b.date+(b.created||'')).localeCompare(a.date+(a.created||''))).slice(0,6);
  if(!items.length)return '📒 مفيش حركات متسجلة الشهر ده لسه';
  return '📒 آخر الحركات:\n'+items.map(t=>`${t.kind==='income'?'💰':'•'} ${esc(t.desc||'')} — ${fmt(t.amount)} ${esc(sym(t.cur))} <i>(${t.date.slice(8)}/${t.date.slice(5,7)})</i>`).join('\n')}

async function linkedUid(db,chat){const m=await db.get(`tg/chats/${chat}`);if(!m||!m.uid)return null;const u=await db.get(`users/${m.uid}/tg`);if(!u||String(u.chat)!==String(chat)){await db.remove(`tg/chats/${chat}`);return null}return m.uid}
async function undo(db,uid,chat,id,now){if(!id)return '🤷 مفيش رسالة ألغيها';const cur=await db.get(`users/${uid}/inbox/${id}`);
  if((await db.get(`tg/last/${chat}`))===id)await db.remove(`tg/last/${chat}`);
  if(cur&&!cur.claim){await db.remove(`users/${uid}/inbox/${id}`);return `↩️ اتلغت «${esc(String(cur.text||'').slice(0,60))}»`}
  await db.set(`users/${uid}/inbox/u${rid()}`,{undo:id,at:now,chat:String(chat)});return '↩️ اتلغت — هتتشال من المحفظة لما تفتحها'}

export async function handleUpdate(u,{db,tg,now=Date.now(),log=()=>{}}){
  const reply=(chat,text,extra={})=>tg.call('sendMessage',{chat_id:chat,text,parse_mode:'HTML',disable_web_page_preview:true,...extra});
  if(u.callback_query){const q=u.callback_query,chat=q.message&&q.message.chat&&q.message.chat.id,d=String(q.data||'');
    await tg.call('answerCallbackQuery',{callback_query_id:q.id});if(!chat||!d.startsWith('u:'))return;const uid=await linkedUid(db,chat);if(!uid)return;
    const r=await undo(db,uid,chat,d.slice(2),now);await tg.call('editMessageText',{chat_id:chat,message_id:q.message.message_id,text:r,parse_mode:'HTML'});return}
  const msg=u.message;if(!msg||!msg.chat||msg.chat.type!=='private')return;const chat=msg.chat.id,raw=String(msg.text||'').trim();
  if(!raw)return reply(chat,'ابعتلي نص بس — مثلاً: <code>غدا 45</code>');
  const text=raw.slice(0,200),n=norm(text),at=(+msg.date||0)*1000||now;
  const st=text.match(/^\/start(?:\s+([A-Z0-9]{10}))?$/);
  if(st&&st[1]){const L=await db.get(`tglink/${st[1]}`);if(!L||!L.uid||now-(+L.at||0)>30*60e3)return reply(chat,'⚠️ الرابط ده انتهى — ارجع للمحفظة ← الإعدادات ← تليجرام ودوس «اربط» تاني.');
    const name=[msg.from&&msg.from.first_name,msg.from&&msg.from.last_name].filter(Boolean).join(' ').slice(0,60);
    const old=await db.get(`users/${L.uid}/tg`);if(old&&old.chat&&String(old.chat)!==String(chat))await db.remove(`tg/chats/${old.chat}`);
    await db.set(`tg/chats/${chat}`,{uid:L.uid,at:now});await db.set(`users/${L.uid}/tg`,{chat:String(chat),name,user:(msg.from&&msg.from.username)||'',at:now});await db.remove(`tglink/${st[1]}`);
    return reply(chat,`✅ اتربطت محفظتك${name?' يا '+esc(name):''}!\n\n${HELP}`)}
  const uid=await linkedUid(db,chat);
  if(!uid)return reply(chat,'👋 أهلاً! علشان أسجل في محفظتك لازم تربطني الأول:\nافتح محفظتي Pro ← ⚙️ الإعدادات ← ✈️ بوت تليجرام ← «🔗 اربط تليجرام».');
  if(/^\/(start|help)$|^(مساعده|ساعدني|help)$/.test(n))return reply(chat,HELP);
  if(/^\/unlink$|^فك الربط$/.test(n)){await db.remove(`tg/chats/${chat}`);await db.remove(`users/${uid}/tg`);return reply(chat,'🔌 اتفك الربط. تقدر تربط تاني من إعدادات المحفظة.')}
  if(/^\/undo$|^(تراجع|الغي|الغاء|امسح اخر)/.test(n))return reply(chat,await undo(db,uid,chat,await db.get(`tg/last/${chat}`),now));
  if(/^\/last$|^(اخر|آخر|اخر الحركات)$/.test(n))return reply(chat,await lastReport(db,uid,now));
  if(QRX.test(n))return reply(chat,await spendReport(db,uid,period(n),now));
  const inbox=await db.get(`users/${uid}/inbox`)||{};if(Object.keys(inbox).length>=300)return reply(chat,'📥 الصندوق مليان — افتح المحفظة مرة علشان تتسجل الرسايل اللي فاتت.');
  const core=parseJ(await db.get(`users/${uid}/data/core`)),p=preview(text,core);
  if(!p)return reply(chat,'🤔 مفهمتش المبلغ — اكتبه بالأرقام، مثلاً: <code>غدا 45</code>\nاكتب <code>مساعدة</code> علشان تشوف الأمثلة.');
  const id='t'+rid();await db.set(`users/${uid}/inbox/${id}`,{text,at,chat:String(chat),mid:msg.message_id||0});await db.set(`tg/last/${chat}`,id);
  return reply(chat,`${esc(previewLine(p))}\n<i>هتظهر في المحفظة أول ما تفتحها</i>`,{reply_markup:{inline_keyboard:[[{text:'↩️ تراجع',callback_data:'u:'+id}]]}})}

export async function poll({db,tg,log=console.log,budgetMs=40000,now=()=>Date.now()}){let off=+(await db.get('tgstate/offset'))||0,total=0;const t0=now();
  while(now()-t0<budgetMs){const r=await tg.call('getUpdates',{offset:off,timeout:0,limit:50,allowed_updates:['message','callback_query']});
    if(!r||!r.ok){log('getUpdates failed',r&&r.error_code,r&&r.description);return{total,error:r&&r.error_code}}
    if(!r.result.length)break;for(const u of r.result){off=u.update_id+1;try{await handleUpdate(u,{db,tg,now:now(),log})}catch(e){log('update error',e&&e.message)}total++}
    await db.set('tgstate/offset',off)}
  log(JSON.stringify({tg:total}));return{total}}
