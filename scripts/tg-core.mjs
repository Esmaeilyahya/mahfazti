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
• <code>آخر</code> — آخر الحركات · <code>تراجع</code> — يلغي آخر رسالة
• <code>تقرير</code> — ملف تقرير الشهر (أو <code>تقرير الشهر اللي فات</code>)
• 📩 اعمل Forward لرسالة البنك وأنا أسجلها
• 📸 ابعت صورة الفاتورة والمحفظة تقراها`;

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
  if(cur&&!cur.claim){await db.remove(`users/${uid}/inbox/${id}`);return cur.img?'↩️ اتلغت الصورة':`↩️ اتلغت «${esc(String(cur.text||'').slice(0,60))}»`}
  await db.set(`users/${uid}/inbox/u${rid()}`,{undo:id,at:now,chat:String(chat)});return '↩️ اتلغت — هتتشال من المحفظة لما تفتحها'}

export async function handleUpdate(u,{db,tg,now=Date.now(),log=()=>{}}){
  const reply=(chat,text,extra={})=>tg.call('sendMessage',{chat_id:chat,text,parse_mode:'HTML',disable_web_page_preview:true,...extra});
  if(u.callback_query){const q=u.callback_query,chat=q.message&&q.message.chat&&q.message.chat.id,d=String(q.data||'');
    await tg.call('answerCallbackQuery',{callback_query_id:q.id});if(chat&&d==='z'){await tg.call('editMessageText',{chat_id:chat,message_id:q.message.message_id,text:'👏 يوم من غير مصاريف — برافو عليك!'});return}if(!chat||!d.startsWith('u:'))return;const uid=await linkedUid(db,chat);if(!uid)return;
    const r=await undo(db,uid,chat,d.slice(2),now);await tg.call('editMessageText',{chat_id:chat,message_id:q.message.message_id,text:r,parse_mode:'HTML'});return}
  const msg=u.message;if(!msg||!msg.chat||msg.chat.type!=='private')return;const chat=msg.chat.id,raw=String(msg.text||'').trim(),isImg=(Array.isArray(msg.photo)&&msg.photo.length)||(msg.document&&/^image\//.test(msg.document.mime_type||''));
  if(!raw&&!isImg)return reply(chat,'ابعتلي نص أو صورة فاتورة — مثلاً: <code>غدا 45</code>');
  const fwd=!!(msg.forward_origin||msg.forward_date||msg.forward_from||msg.forward_sender_name),sms=!!raw&&(fwd||looksSMS(raw)),text=raw.slice(0,sms?700:200),n=norm(text),at=(+msg.date||0)*1000||now;
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
  if(isImg){const ib=await db.get(`users/${uid}/inbox`)||{};if(Object.keys(ib).length>=300)return reply(chat,'📥 الصندوق مليان — افتح المحفظة مرة الأول.');const img=await photoData(tg,msg);
    if(img==='big')return reply(chat,'📸 الصورة كبيرة — ابعتها كصورة عادية (مش ملف) وهي هتتصغّر لوحدها.');if(!img)return reply(chat,'مقدرتش أنزّل الصورة — جرّب تاني.');
    const id='p'+rid();await db.set(`users/${uid}/inbox/${id}`,{img,caption:String(msg.caption||'').slice(0,200),at,chat:String(chat)});await db.set(`tg/last/${chat}`,id);
    return reply(chat,'📸 الفاتورة وصلت — افتح المحفظة وهتلاقيها مستنياك تأكد المبلغ.',{reply_markup:{inline_keyboard:[[{text:'↩️ تراجع',callback_data:'u:'+id}]]}})}
  if(!sms&&/^\/report$|^تقرير/.test(n)){const tz=(await db.get(`push/${uid}/cfg/tz`))||'Asia/Riyadh',cm=localDay(now,tz).slice(0,7);await sendReport(db,tg,uid,chat,/(اللي فات|الماضي|السابق)/.test(n)?prevM(cm):cm);return}
  if(!sms&&QRX.test(n))return reply(chat,await spendReport(db,uid,period(n),now));
  if(sms){const ib=await db.get(`users/${uid}/inbox`)||{};if(Object.keys(ib).length>=300)return reply(chat,'📥 الصندوق مليان — افتح المحفظة مرة الأول.');const id='s'+rid();await db.set(`users/${uid}/inbox/${id}`,{text,sms:true,at,chat:String(chat)});await db.set(`tg/last/${chat}`,id);
    return reply(chat,'📩 رسالة البنك وصلت — المحفظة هتقراها وتسجلها أول ما تفتحها.',{reply_markup:{inline_keyboard:[[{text:'↩️ تراجع',callback_data:'u:'+id}]]}})}
  const inbox=await db.get(`users/${uid}/inbox`)||{};if(Object.keys(inbox).length>=300)return reply(chat,'📥 الصندوق مليان — افتح المحفظة مرة علشان تتسجل الرسايل اللي فاتت.');
  const core=parseJ(await db.get(`users/${uid}/data/core`)),p=preview(text,core);
  if(!p)return reply(chat,'🤔 مفهمتش المبلغ — اكتبه بالأرقام، مثلاً: <code>غدا 45</code>\nاكتب <code>مساعدة</code> علشان تشوف الأمثلة.');
  const id='t'+rid();await db.set(`users/${uid}/inbox/${id}`,{text,at,chat:String(chat),mid:msg.message_id||0});await db.set(`tg/last/${chat}`,id);
  return reply(chat,`${esc(previewLine(p))}\n<i>هتظهر في المحفظة أول ما تفتحها</i>`,{reply_markup:{inline_keyboard:[[{text:'↩️ تراجع',callback_data:'u:'+id}]]}})}


/* ---------- monthly report (HTML file) ---------- */
const MO=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const CN={SA:['🇸🇦','السعودية'],EG:['🇪🇬','مصر'],AE:['🇦🇪','الإمارات'],KW:['🇰🇼','الكويت'],QA:['🇶🇦','قطر'],BH:['🇧🇭','البحرين'],OM:['🇴🇲','عمان'],JO:['🇯🇴','الأردن'],US:['🇺🇸','أمريكا'],GB:['🇬🇧','بريطانيا'],TR:['🇹🇷','تركيا']};
const cName=c=>CN[c]?CN[c].join(' '):(c||'—');
export const mLabel=m=>`${MO[+m.slice(5,7)-1]} ${m.slice(0,4)}`;
const prevM=m=>{const[y,mo]=m.split('-').map(Number);return mo===1?`${y-1}-12`:`${y}-${String(mo-1).padStart(2,'0')}`};
const DTA={lend:-1,borrow:1,collect:1,repay:-1};
function deltaOf(t,aid){if(t.kind==='income'&&t.acc===aid)return +t.amount||0;if(t.kind==='expense'&&t.acc===aid)return -(+t.amount||0);
  if(t.kind==='transfer'){let d=0;if(t.acc===aid)d-=(+t.amount||0)+(+t.fee||0)+(+t.tax||0);if(t.to===aid)d+=+t.toAmount||0;return d}
  if(t.kind==='debt'&&t.acc===aid)return (DTA[t.dt]||0)*(+t.amount||0);return 0}
export function reportData(map,m){const core=parseJ(map&&map.core)||{},accs=(core.accounts||[]).filter(a=>a),st=core.settings||{},rates=st.rates||{},base=st.base||'SAR';
  const conv=(v,f,t)=>f===t||!v?v:v*(+rates[f]||1)/(+rates[t]||1),cats={};(core.cats||[]).forEach(c=>{if(c&&c.id)cats[c.id]=`${c.icon||''} ${c.name||''}`.trim()});
  let tx=[];for(const k in map||{})if(k.startsWith('tx_')&&k.slice(3)<=m){const v=parseJ(map[k]);if(v&&Array.isArray(v.items))tx=tx.concat(v.items)}
  const end=m+'-31',A=id=>accs.find(a=>a.id===id),G={},g=(c,cur)=>{const k=c+'|'+cur;return G[k]||(G[k]={c,cur,inc:0,exp:0,fee:0,cats:{},accs:[],n:0,tin:0,tout:0})};
  accs.filter(a=>!a.archived).forEach(a=>{let b=+a.initial||0;for(const t of tx)if(t&&t.date<=end)b+=deltaOf(t,a.id);g(a.country,a.currency).accs.push({name:a.name,bal:b})});
  const trs=[];for(const t of tx){if(!t||!String(t.date||'').startsWith(m))continue;const a=A(t.acc);if(!a)continue;const o=g(a.country,a.currency);
    if(t.kind==='income'){o.inc+=+t.amount||0;o.n++}
    else if(t.kind==='expense'&&!(t.scope==='company'&&(t.rec||t.cust))){o.exp+=+t.amount||0;o.n++;const k=cats[t.cat]||'📦 أخرى';o.cats[k]=(o.cats[k]||0)+(+t.amount||0)}
    else if(t.kind==='transfer'){const b=A(t.to),f=(+t.fee||0)+(+t.tax||0);if(f){o.exp+=f;o.fee+=f}o.tout+=+t.amount||0;if(b){g(b.country,b.currency).tin+=+t.toAmount||0;if(b.country!==a.country)trs.push({from:a,to:b,amt:+t.amount||0,to_amt:+t.toAmount||0,date:t.date})}}}
  const groups=Object.values(G).filter(x=>x.accs.length||x.inc||x.exp).sort((a,b)=>conv(b.exp,b.cur,base)-conv(a.exp,a.cur,base));
  const tot={inc:0,exp:0,bal:0};groups.forEach(x=>{tot.inc+=conv(x.inc,x.cur,base);tot.exp+=conv(x.exp,x.cur,base);tot.bal+=conv(x.accs.reduce((s,a)=>s+a.bal,0),x.cur,base)});
  return{m,name:st.name||'',base,groups,tot,trs}}
export function reportHTML(d){const F=(v,c)=>`${fmt(Math.round((+v||0)*100)/100)} <small>${esc(sym(c))}</small>`;
  const card=x=>{const net=x.inc-x.exp,top=Object.entries(x.cats).sort((a,b)=>b[1]-a[1]).slice(0,7),bal=x.accs.reduce((s,a)=>s+a.bal,0);
    return `<section><h2>${esc(cName(x.c))} <span class="cur">${esc(x.cur)}</span></h2><div class="k"><div><span>الوارد</span><b class="p">${F(x.inc,x.cur)}</b></div><div><span>المصاريف</span><b class="n">${F(x.exp,x.cur)}</b></div><div><span>الصافي</span><b class="${net>=0?'p':'n'}">${F(net,x.cur)}</b></div><div><span>الرصيد آخر الشهر</span><b>${F(bal,x.cur)}</b></div></div>
    ${top.length?`<h3>المصاريف حسب التصنيف</h3><table>${top.map(([k,v])=>`<tr><td>${esc(k)}</td><td class="r">${F(v,x.cur)}</td><td class="r s">${x.exp?Math.round(v/x.exp*100):0}%</td></tr>`).join('')}</table>`:''}
    ${x.accs.length?`<h3>الحسابات</h3><table>${x.accs.map(a=>`<tr><td>${esc(a.name)}</td><td class="r">${F(a.bal,x.cur)}</td></tr>`).join('')}</table>`:''}${x.fee?`<p class="s">منها رسوم تحويل ${F(x.fee,x.cur)}</p>`:''}</section>`};
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تقرير ${esc(mLabel(d.m))} — محفظتي Pro</title>
<style>body{margin:0;background:#f4f6fb;color:#14213d;font-family:"Segoe UI",Tahoma,"Noto Naskh Arabic",sans-serif;line-height:1.6}main{max-width:860px;margin:auto;padding:20px}header{background:linear-gradient(135deg,#1e3a8a,#0f172a);color:#fff;border-radius:18px;padding:22px 24px;margin-bottom:16px}header h1{margin:0;font-size:24px}header p{margin:4px 0 0;opacity:.8}
.tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}.tot div{background:rgba(255,255,255,.12);border-radius:12px;padding:10px 12px}.tot span{display:block;font-size:12px;opacity:.8}.tot b{font-size:18px}
section{background:#fff;border-radius:16px;padding:18px 20px;margin-bottom:14px;box-shadow:0 2px 10px rgba(15,23,42,.06)}h2{margin:0 0 12px;font-size:19px}.cur{font-size:12px;background:#eef2ff;color:#3730a3;border-radius:8px;padding:2px 8px;vertical-align:middle}h3{font-size:14px;margin:16px 0 6px;color:#475569}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}.k div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px}.k span{display:block;font-size:12px;color:#64748b}.k b{font-size:17px}.p{color:#047857}.n{color:#b91c1c}
table{width:100%;border-collapse:collapse;font-size:14px}td{padding:7px 4px;border-bottom:1px solid #eef2f7}.r{text-align:left;white-space:nowrap}.s{color:#64748b;font-size:12.5px}small{color:#64748b;font-weight:500}
.pr{display:block;margin:16px auto 0;background:#1e3a8a;color:#fff;border:0;border-radius:12px;padding:10px 22px;font:inherit;cursor:pointer}footer{text-align:center;color:#94a3b8;font-size:12px;margin:18px 0}@media print{.pr{display:none}body{background:#fff}section{box-shadow:none;border:1px solid #e2e8f0}}</style></head><body><main>
<header><h1>📄 تقرير ${esc(mLabel(d.m))}</h1><p>${d.name?esc(d.name)+' · ':''}كل دولة بعملتها، والإجمالي بالـ${esc(sym(d.base))}</p>
<div class="tot"><div><span>الوارد (مدموج)</span><b>${F(d.tot.inc,d.base)}</b></div><div><span>المصاريف (مدموج)</span><b>${F(d.tot.exp,d.base)}</b></div><div><span>الصافي</span><b>${F(d.tot.inc-d.tot.exp,d.base)}</b></div><div><span>الأرصدة آخر الشهر</span><b>${F(d.tot.bal,d.base)}</b></div></div></header>
${d.groups.map(card).join('')}
${d.trs.length?`<section><h2>↔️ التحويلات بين الدول</h2><table>${d.trs.map(t=>`<tr><td>${esc(t.date.slice(8))}/${esc(t.date.slice(5,7))}</td><td>${esc(t.from.name)} ← ${esc(t.to.name)}</td><td class="r">${F(t.amt,t.from.currency)}</td><td class="r">${F(t.to_amt,t.to.currency)}</td></tr>`).join('')}</table></section>`:''}
<button class="pr" onclick="print()">🖨️ اطبعه أو احفظه PDF</button><footer>محفظتي Pro · اتعمل ${new Date().toISOString().slice(0,10)}</footer></main></body></html>`}
export function reportText(d){const lines=d.groups.filter(x=>x.inc||x.exp).map(x=>`${CN[x.c]?CN[x.c][0]:'•'} ${esc(CN[x.c]?CN[x.c][1]:x.c)}: صرفت <b>${fmt(Math.round(x.exp))} ${esc(sym(x.cur))}</b> · دخل ${fmt(Math.round(x.inc))}`);
  return `📄 <b>تقرير ${esc(mLabel(d.m))}</b>\n${lines.join('\n')||'مفيش حركات الشهر ده'}\n\n💰 الإجمالي: صرفت ${fmt(Math.round(d.tot.exp))} ${esc(sym(d.base))} من ${fmt(Math.round(d.tot.inc))}`}
export async function sendReport(db,tg,uid,chat,m){const map=await db.get(`users/${uid}/data`)||{},d=reportData(map,m);
  await tg.call('sendMessage',{chat_id:chat,text:reportText(d),parse_mode:'HTML'});
  if(tg.upload)await tg.upload('sendDocument',{chat_id:String(chat),caption:'افتح الملف — ولو عايزه PDF دوس «اطبعه أو احفظه PDF»'},{field:'document',name:`تقرير-${m}.html`,type:'text/html',data:reportHTML(d)});return d}

/* ---------- photos ---------- */
const toB64=u8=>{if(typeof Buffer!=='undefined')return Buffer.from(u8).toString('base64');let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s)};
async function photoData(tg,msg){let fid=null,mime='image/jpeg';if(Array.isArray(msg.photo)&&msg.photo.length){const ok=msg.photo.filter(p=>(p.width||0)<=1600);fid=(ok.length?ok[ok.length-1]:msg.photo[0]).file_id}
  else if(msg.document&&/^image\//.test(msg.document.mime_type||'')){fid=msg.document.file_id;mime=msg.document.mime_type}if(!fid||!tg.file)return null;
  const f=await tg.call('getFile',{file_id:fid});if(!f||!f.ok||!f.result||!f.result.file_path)return null;if((+f.result.file_size||0)>1.8e6)return 'big';
  const buf=await tg.file(f.result.file_path);if(!buf||buf.byteLength>1.8e6)return 'big';return `data:${mime};base64,${toB64(new Uint8Array(buf))}`}
export const looksSMS=t=>{t=String(t||'');return t.length>35&&/\d/.test(t)&&/(شراء|purchase|مدى|mada|debited|credited|خصم|إيداع|ايداع|حوال|pos\b|بطاق|card|رصيد|balance|سحب|withdraw|instapay|انستاباي|إنستاباي|تحويل وارد|تم تحويل)/i.test(t)};

/* ---------- hourly tick: nightly reminder + monthly report ---------- */
function localParts(now,tz){try{const p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(new Date(now)),g=k=>(p.find(x=>x.type===k)||{}).value;return{date:`${g('year')}-${g('month')}-${g('day')}`,h:+g('hour'),d:+g('day')}}catch(e){const x=new Date(now);return{date:x.toISOString().slice(0,10),h:x.getUTCHours(),d:x.getUTCDate()}}}
export async function tick({db,tg,now=Date.now(),log=()=>{}}){const chats=await db.get('tg/chats')||{};let sent=0;
  for(const [chat,mp] of Object.entries(chats)){const uid=mp&&mp.uid;if(!uid)continue;
    try{const u=await db.get(`users/${uid}/tg`);if(!u||String(u.chat)!==String(chat))continue;
      const p=Object.assign({night:true,nh:22,report:true,morning:true,mh:8},await db.get(`users/${uid}/tgprefs`)||{}),tz=p.tz||(await db.get(`push/${uid}/cfg/tz`))||'Asia/Riyadh',L=localParts(now,tz),st=await db.get(`tgsent/${uid}`)||{};
      if(p.night!==false&&L.h>=+p.nh&&st.n!==L.date){const items=await monthTx(db,uid,L.date.slice(0,7)),any=items.some(t=>t&&t.date===L.date&&(t.kind==='expense'||t.kind==='income')),ib=await db.get(`users/${uid}/inbox`)||{},pend=Object.values(ib).some(x=>x&&x.at&&localDay(x.at,tz)===L.date);
        if(!any&&!pend){await tg.call('sendMessage',{chat_id:chat,text:'🌙 مسجلتش ولا مصروف النهارده.\nصرفت حاجة؟ ابعتهالي، مثلاً: <code>غدا 45</code>',parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'✅ مصرفتش حاجة النهارده',callback_data:'z'}]]}});sent++}
        await db.update(`tgsent/${uid}`,{n:L.date})}
      if(p.morning!==false&&L.h>=+p.mh&&L.h<+p.mh+4&&st.m!==L.date){await db.update(`tgsent/${uid}`,{m:L.date});const dg=await db.get(`users/${uid}/tgdigest`)||{},y=addD(L.date,-1),its=(await monthTx(db,uid,y.slice(0,7))).filter(t=>t&&t.date===y&&t.kind==='expense'&&!(t.scope==='company'&&t.rec)),by={};its.forEach(t=>{by[t.cur]=(by[t.cur]||0)+(+t.amount||0)});
        const today=(dg.days&&dg.days[L.date])||[],sp=Object.entries(by).map(([c,v])=>`${fmt(Math.round(v))} ${sym(c)}`).join(' + ');
        const txt=`☀️ <b>صباح الخير!</b>\n${today.length?'📅 النهارده:\n'+today.map(x=>'• '+esc(x)).join('\n'):'📅 مفيش مستحقات النهارده 👌'}\n\n💸 امبارح: ${sp?esc(sp)+` (${its.length} حركة)`:'مسجلتش مصاريف'}${dg.mtd!=null&&dg.sym?`\n📊 الشهر لحد دلوقتي: ${fmt(dg.mtd)} ${esc(dg.sym)}`:''}`;
        await tg.call('sendMessage',{chat_id:chat,text:txt,parse_mode:'HTML'});sent++}
      if(p.report!==false&&L.d===1&&L.h>=9&&st.r!==L.date.slice(0,7)){await db.update(`tgsent/${uid}`,{r:L.date.slice(0,7)});await sendReport(db,tg,uid,chat,prevM(L.date.slice(0,7)));sent++}}
    catch(e){log('tick',uid,e&&e.message)}}
  log(JSON.stringify({tgTick:sent}));return{sent}}

export async function poll({db,tg,log=console.log,budgetMs=40000,now=()=>Date.now()}){let off=+(await db.get('tgstate/offset'))||0,total=0;const t0=now();
  while(now()-t0<budgetMs){const r=await tg.call('getUpdates',{offset:off,timeout:0,limit:50,allowed_updates:['message','callback_query']});
    if(!r||!r.ok){log('getUpdates failed',r&&r.error_code,r&&r.description);return{total,error:r&&r.error_code}}
    if(!r.result.length)break;for(const u of r.result){off=u.update_id+1;try{await handleUpdate(u,{db,tg,now:now(),log})}catch(e){log('update error',e&&e.message)}total++}
    await db.set('tgstate/offset',off)}
  log(JSON.stringify({tg:total}));return{total}}
