// ../../../home/claude/mahfazti/scripts/tg-core.mjs
var SYM = { SAR: "\u0631.\u0633", EGP: "\u062C.\u0645", AED: "\u062F.\u0625", KWD: "\u062F.\u0643", QAR: "\u0631.\u0642", BHD: "\u062F.\u0628", OMR: "\u0631.\u0639", JOD: "\u062F.\u0623", USD: "$", EUR: "\u20AC", GBP: "\xA3", TRY: "\u20BA" };
var CTRY_W = [["\u0645\u0635\u0631", "EG"], ["\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0647", "SA"], ["\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629", "SA"], ["\u0627\u0644\u0631\u064A\u0627\u0636", "SA"], ["\u062C\u062F\u0647", "SA"], ["\u0627\u0644\u0627\u0645\u0627\u0631\u0627\u062A", "AE"], ["\u062F\u0628\u064A", "AE"], ["\u0627\u0628\u0648\u0638\u0628\u064A", "AE"], ["\u0627\u0644\u0643\u0648\u064A\u062A", "KW"], ["\u0642\u0637\u0631", "QA"], ["\u0627\u0644\u0628\u062D\u0631\u064A\u0646", "BH"], ["\u0639\u0645\u0627\u0646", "OM"], ["\u0627\u0644\u0627\u0631\u062F\u0646", "JO"]];
var normDigits = (s) => String(s || "").replace(/[٠-٩]/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d)).replace(/[۰-۹]/g, (d) => "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d)).replace(/٫/g, ".").replace(/٬/g, ",");
var norm = (s) => normDigits(s).toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "\u0627").replace(/ة/g, "\u0647").replace(/ى/g, "\u064A").replace(/\s+/g, " ").trim();
var esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
var fmt = (v) => Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
var rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
var sym = (c) => SYM[c] || c || "";
var parseJ = (v) => {
  if (v == null) return null;
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
};
var HELP = `\u0627\u0628\u0639\u062A\u0644\u064A \u0623\u064A \u062D\u0631\u0643\u0629 \u0628\u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0623\u0646\u0627 \u0623\u0633\u062C\u0644\u0647\u0627 \u0641\u064A \u0645\u062D\u0641\u0638\u062A\u0643:
\u2022 <code>\u063A\u062F\u0627 45</code> \u2014 \u0645\u0635\u0631\u0648\u0641
\u2022 <code>\u0628\u0646\u0632\u064A\u0646 80 \u0643\u0627\u0634</code> \u2014 \u0645\u0646 \u062D\u0633\u0627\u0628 \u0627\u0644\u0643\u0627\u0634
\u2022 <code>+12000 \u0645\u0631\u062A\u0628</code> \u2014 \u062F\u062E\u0644
\u2022 <code>\u062D\u0648\u0644\u062A 3000 \u0645\u0635\u0631</code> \u2014 \u062A\u062D\u0648\u064A\u0644
\u2022 <code>\u0633\u0644\u0641\u062A \u0645\u062D\u0645\u0648\u062F 500</code> \u2014 \u0633\u0644\u0641\u0629
\u2022 <code>\u0635\u0631\u0641\u062A \u0643\u0627\u0645 \u0627\u0644\u0646\u0647\u0627\u0631\u062F\u0647\u061F</code> \u0623\u0648 <code>\u0627\u0644\u0623\u0633\u0628\u0648\u0639</code> \u0623\u0648 <code>\u0627\u0644\u0634\u0647\u0631</code>
\u2022 <code>\u0622\u062E\u0631</code> \u2014 \u0622\u062E\u0631 \u0627\u0644\u062D\u0631\u0643\u0627\u062A \xB7 <code>\u062A\u0631\u0627\u062C\u0639</code> \u2014 \u064A\u0644\u063A\u064A \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629
\u2022 <code>\u062A\u0642\u0631\u064A\u0631</code> \u2014 \u0645\u0644\u0641 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0634\u0647\u0631 (\u0623\u0648 <code>\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0644\u064A \u0641\u0627\u062A</code>)
\u2022 \u{1F4E9} \u0627\u0639\u0645\u0644 Forward \u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0628\u0646\u0643 \u0648\u0623\u0646\u0627 \u0623\u0633\u062C\u0644\u0647\u0627
\u2022 \u{1F4F8} \u0627\u0628\u0639\u062A \u0635\u0648\u0631\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u062A\u0642\u0631\u0627\u0647\u0627`;
function preview(text, core) {
  const t = normDigits(text).replace(/\s+/g, " ").trim(), n = norm(t), m = t.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const amount = parseFloat(m[1].replace(",", "."));
  if (!(amount > 0) || amount > 1e9) return null;
  const accs = (core && core.accounts || []).filter((a) => a && !a.archived), st = core && core.settings || {};
  const words = (a) => [a.name, a.bank].filter(Boolean).map(norm).filter((k) => k.length > 1);
  const hits = accs.filter((a) => words(a).some((k) => n.includes(k) || k.startsWith("\u0627\u0644") && n.includes(k.slice(2))));
  let kind = "expense";
  if (/^(حولت|تحويل|نقلت)/.test(n)) kind = "transfer";
  else if (/^\+/.test(t) || /(راتب|مرتب|استلمت|قبضت|وارد|جالي|مكافاه|بونص)/.test(n)) kind = "income";
  else if (/(سلفت|اسلفت|استلفت|اتسلفت|سلفني|رجعلي|رجع لي|سددت|سددلي|رجعت ل|قرضت|اقترضت)/.test(n)) kind = "debt";
  const def = accs.find((a) => a.id === st.lastAcc) || accs[0] || null;
  let acc = hits[0] || def, to = null;
  if (kind === "expense" && /(كاش|نقدي|نقدا|cash)/.test(n) && !hits.length) acc = accs.find((a) => a.type === "cash" && (!def || a.country === def.country)) || acc;
  if (kind === "transfer") {
    to = hits[1] || null;
    if (!to) {
      const cw = CTRY_W.find(([w]) => n.includes(norm(w)));
      if (cw) to = accs.find((a) => a.country === cw[1] && a !== acc) || null;
    }
    if (hits.length === 1 && to && hits[0] === to) acc = def;
  }
  let desc = t.replace(m[0], " ").replace(/^\s*\+/, " ");
  hits.forEach((a) => [a.name, a.bank].filter(Boolean).forEach((x) => {
    desc = desc.split(x).join(" ");
  }));
  desc = desc.replace(/(^|\s)(من|في|على|علي|كاش|نقدي|ريال|جنيه|درهم|دينار|دولار|ر\.س|ج\.م)(?=\s|$)/g, " ").replace(/\s+/g, " ").trim();
  return { kind, amount, acc, to, desc, cur: acc ? acc.currency : null };
}
function previewLine(p) {
  if (!p) return "\u2705 \u0648\u0635\u0644\u062A";
  const a = p.acc, amt = `${fmt(p.amount)} ${sym(p.cur)}`.trim();
  if (p.kind === "income") return `\u2705 \u{1F4B0} \u062F\u062E\u0644 ${amt}${a ? " \xB7 " + a.name : ""}${p.desc ? " \u2014 " + p.desc : ""}`;
  if (p.kind === "transfer") return `\u2705 \u2194\uFE0F \u062A\u062D\u0648\u064A\u0644 ${amt}${a ? " \u0645\u0646 " + a.name : ""}${p.to ? " \u0644\u0640 " + p.to.name : ""}`;
  if (p.kind === "debt") return `\u2705 \u{1F91D} ${p.desc || "\u0633\u0644\u0641\u0629"} \u2014 ${amt}`;
  return `\u2705 \u{1F9FE} ${p.desc || "\u0645\u0635\u0631\u0648\u0641"} \u2014 ${amt}${a ? " \xB7 " + a.name : ""}`;
}
var QRX = /(صرفت كام|كام صرفت|صرفت قد ايه|مصاريفي|مصروفاتي|مصروفي|^\/(today|week|month)$)/;
function period(n) {
  if (/(الشهر|شهر|\/month)/.test(n)) return "month";
  if (/(الاسبوع|اسبوع|\/week)/.test(n)) return "week";
  return "day";
}
function localDay(now, tz) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz || "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
  } catch (e) {
    return new Date(now).toISOString().slice(0, 10);
  }
}
var addD = (d, n) => {
  const x = /* @__PURE__ */ new Date(d + "T12:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
async function monthTx(db, uid, m) {
  const v = parseJ(await db.get(`users/${uid}/data/tx_${m}`));
  return v && Array.isArray(v.items) ? v.items : [];
}
async function spendReport(db, uid, per, now) {
  const tz = await db.get(`push/${uid}/cfg/tz`) || "Asia/Riyadh", td = localDay(now, tz);
  const from = per === "month" ? td.slice(0, 8) + "01" : per === "week" ? addD(td, -6) : td, ms = [.../* @__PURE__ */ new Set([from.slice(0, 7), td.slice(0, 7)])];
  const core = parseJ(await db.get(`users/${uid}/data/core`)) || {}, cats = {};
  (core.cats || []).forEach((c) => {
    if (c && c.id) cats[c.id] = `${c.icon || ""} ${c.name || ""}`.trim();
  });
  let items = [];
  for (const m of ms) items = items.concat(await monthTx(db, uid, m));
  const ex = items.filter((t) => t && t.kind === "expense" && t.date >= from && t.date <= td && !(t.scope === "company" && t.rec)), by = {}, bc = {};
  ex.forEach((t) => {
    by[t.cur] = (by[t.cur] || 0) + (+t.amount || 0);
    const k = t.cat || "other";
    bc[k] = (bc[k] || 0) + 1;
  });
  const inbox = await db.get(`users/${uid}/inbox`) || {}, pend = Object.values(inbox).filter((x) => x && x.text).length;
  const lbl = { day: "\u0627\u0644\u0646\u0647\u0627\u0631\u062F\u0647", week: "\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645", month: "\u0627\u0644\u0634\u0647\u0631 \u062F\u0647" }[per], top = Object.entries(bc).sort((a, b) => b[1] - a[1])[0];
  const tot = Object.entries(by).map(([c, v]) => `${fmt(v)} ${sym(c)}`).join(" + ");
  return `${tot ? `\u{1F4B8} \u0635\u0631\u0641\u062A ${lbl}: <b>${esc(tot)}</b>` : `\u{1F4B8} \u0645\u0641\u064A\u0634 \u0645\u0635\u0627\u0631\u064A\u0641 \u0645\u062A\u0633\u062C\u0644\u0629 ${lbl}`}${ex.length ? `
(${ex.length} \u062D\u0631\u0643\u0629${top && cats[top[0]] ? ` \xB7 \u0623\u0643\u062A\u0631 \u0628\u0646\u062F: ${esc(cats[top[0]])}` : ""})` : ""}${pend ? `
\u{1F4E9} + ${pend} ${pend === 1 ? "\u0631\u0633\u0627\u0644\u0629" : "\u0631\u0633\u0627\u064A\u0644"} \u0644\u0633\u0647 \u0647\u062A\u062A\u0633\u062C\u0644 \u0644\u0645\u0627 \u062A\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0641\u0638\u0629` : ""}`;
}
async function lastReport(db, uid, now) {
  const tz = await db.get(`push/${uid}/cfg/tz`) || "Asia/Riyadh", td = localDay(now, tz), pm = addD(td.slice(0, 8) + "01", -1).slice(0, 7);
  const items = (await monthTx(db, uid, td.slice(0, 7))).concat(await monthTx(db, uid, pm)).filter((t) => t && (t.kind === "expense" || t.kind === "income")).sort((a, b) => (b.date + (b.created || "")).localeCompare(a.date + (a.created || ""))).slice(0, 6);
  if (!items.length) return "\u{1F4D2} \u0645\u0641\u064A\u0634 \u062D\u0631\u0643\u0627\u062A \u0645\u062A\u0633\u062C\u0644\u0629 \u0627\u0644\u0634\u0647\u0631 \u062F\u0647 \u0644\u0633\u0647";
  return "\u{1F4D2} \u0622\u062E\u0631 \u0627\u0644\u062D\u0631\u0643\u0627\u062A:\n" + items.map((t) => `${t.kind === "income" ? "\u{1F4B0}" : "\u2022"} ${esc(t.desc || "")} \u2014 ${fmt(t.amount)} ${esc(sym(t.cur))} <i>(${t.date.slice(8)}/${t.date.slice(5, 7)})</i>`).join("\n");
}
async function linkedUid(db, chat) {
  const m = await db.get(`tg/chats/${chat}`);
  if (!m || !m.uid) return null;
  const u = await db.get(`users/${m.uid}/tg`);
  if (!u || String(u.chat) !== String(chat)) {
    await db.remove(`tg/chats/${chat}`);
    return null;
  }
  return m.uid;
}
async function undo(db, uid, chat, id, now) {
  if (!id) return "\u{1F937} \u0645\u0641\u064A\u0634 \u0631\u0633\u0627\u0644\u0629 \u0623\u0644\u063A\u064A\u0647\u0627";
  const cur = await db.get(`users/${uid}/inbox/${id}`);
  if (await db.get(`tg/last/${chat}`) === id) await db.remove(`tg/last/${chat}`);
  if (cur && !cur.claim) {
    await db.remove(`users/${uid}/inbox/${id}`);
    return cur.img ? "\u21A9\uFE0F \u0627\u062A\u0644\u063A\u062A \u0627\u0644\u0635\u0648\u0631\u0629" : `\u21A9\uFE0F \u0627\u062A\u0644\u063A\u062A \xAB${esc(String(cur.text || "").slice(0, 60))}\xBB`;
  }
  await db.set(`users/${uid}/inbox/u${rid()}`, { undo: id, at: now, chat: String(chat) });
  return "\u21A9\uFE0F \u0627\u062A\u0644\u063A\u062A \u2014 \u0647\u062A\u062A\u0634\u0627\u0644 \u0645\u0646 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0644\u0645\u0627 \u062A\u0641\u062A\u062D\u0647\u0627";
}
async function handleUpdate(u, { db, tg, now = Date.now(), log = () => {
} }) {
  const reply = (chat2, text2, extra = {}) => tg.call("sendMessage", { chat_id: chat2, text: text2, parse_mode: "HTML", disable_web_page_preview: true, ...extra });
  if (u.callback_query) {
    const q = u.callback_query, chat2 = q.message && q.message.chat && q.message.chat.id, d = String(q.data || "");
    await tg.call("answerCallbackQuery", { callback_query_id: q.id });
    if (chat2 && d === "z") {
      await tg.call("editMessageText", { chat_id: chat2, message_id: q.message.message_id, text: "\u{1F44F} \u064A\u0648\u0645 \u0645\u0646 \u063A\u064A\u0631 \u0645\u0635\u0627\u0631\u064A\u0641 \u2014 \u0628\u0631\u0627\u0641\u0648 \u0639\u0644\u064A\u0643!" });
      return;
    }
    if (!chat2 || !d.startsWith("u:")) return;
    const uid2 = await linkedUid(db, chat2);
    if (!uid2) return;
    const r = await undo(db, uid2, chat2, d.slice(2), now);
    await tg.call("editMessageText", { chat_id: chat2, message_id: q.message.message_id, text: r, parse_mode: "HTML" });
    return;
  }
  const msg = u.message;
  if (!msg || !msg.chat || msg.chat.type !== "private") return;
  const chat = msg.chat.id, raw = String(msg.text || "").trim(), isImg = Array.isArray(msg.photo) && msg.photo.length || msg.document && /^image\//.test(msg.document.mime_type || "");
  if (!raw && !isImg) return reply(chat, "\u0627\u0628\u0639\u062A\u0644\u064A \u0646\u0635 \u0623\u0648 \u0635\u0648\u0631\u0629 \u0641\u0627\u062A\u0648\u0631\u0629 \u2014 \u0645\u062B\u0644\u0627\u064B: <code>\u063A\u062F\u0627 45</code>");
  const fwd = !!(msg.forward_origin || msg.forward_date || msg.forward_from || msg.forward_sender_name), sms = !!raw && (fwd || looksSMS(raw)), text = raw.slice(0, sms ? 700 : 200), n = norm(text), at = (+msg.date || 0) * 1e3 || now;
  const st = text.match(/^\/start(?:\s+([A-Z0-9]{10}))?$/);
  if (st && st[1]) {
    const L = await db.get(`tglink/${st[1]}`);
    if (!L || !L.uid || now - (+L.at || 0) > 30 * 6e4) return reply(chat, "\u26A0\uFE0F \u0627\u0644\u0631\u0627\u0628\u0637 \u062F\u0647 \u0627\u0646\u062A\u0647\u0649 \u2014 \u0627\u0631\u062C\u0639 \u0644\u0644\u0645\u062D\u0641\u0638\u0629 \u2190 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u2190 \u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u0648\u062F\u0648\u0633 \xAB\u0627\u0631\u0628\u0637\xBB \u062A\u0627\u0646\u064A.");
    const name = [msg.from && msg.from.first_name, msg.from && msg.from.last_name].filter(Boolean).join(" ").slice(0, 60);
    const old = await db.get(`users/${L.uid}/tg`);
    if (old && old.chat && String(old.chat) !== String(chat)) await db.remove(`tg/chats/${old.chat}`);
    await db.set(`tg/chats/${chat}`, { uid: L.uid, at: now });
    await db.set(`users/${L.uid}/tg`, { chat: String(chat), name, user: msg.from && msg.from.username || "", at: now });
    await db.remove(`tglink/${st[1]}`);
    return reply(chat, `\u2705 \u0627\u062A\u0631\u0628\u0637\u062A \u0645\u062D\u0641\u0638\u062A\u0643${name ? " \u064A\u0627 " + esc(name) : ""}!

${HELP}`);
  }
  const uid = await linkedUid(db, chat);
  if (!uid) return reply(chat, "\u{1F44B} \u0623\u0647\u0644\u0627\u064B! \u0639\u0644\u0634\u0627\u0646 \u0623\u0633\u062C\u0644 \u0641\u064A \u0645\u062D\u0641\u0638\u062A\u0643 \u0644\u0627\u0632\u0645 \u062A\u0631\u0628\u0637\u0646\u064A \u0627\u0644\u0623\u0648\u0644:\n\u0627\u0641\u062A\u062D \u0645\u062D\u0641\u0638\u062A\u064A Pro \u2190 \u2699\uFE0F \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u2190 \u2708\uFE0F \u0628\u0648\u062A \u062A\u0644\u064A\u062C\u0631\u0627\u0645 \u2190 \xAB\u{1F517} \u0627\u0631\u0628\u0637 \u062A\u0644\u064A\u062C\u0631\u0627\u0645\xBB.");
  if (/^\/(start|help)$|^(مساعده|ساعدني|help)$/.test(n)) return reply(chat, HELP);
  if (/^\/unlink$|^فك الربط$/.test(n)) {
    await db.remove(`tg/chats/${chat}`);
    await db.remove(`users/${uid}/tg`);
    return reply(chat, "\u{1F50C} \u0627\u062A\u0641\u0643 \u0627\u0644\u0631\u0628\u0637. \u062A\u0642\u062F\u0631 \u062A\u0631\u0628\u0637 \u062A\u0627\u0646\u064A \u0645\u0646 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u062D\u0641\u0638\u0629.");
  }
  if (/^\/undo$|^(تراجع|الغي|الغاء|امسح اخر)/.test(n)) return reply(chat, await undo(db, uid, chat, await db.get(`tg/last/${chat}`), now));
  if (/^\/last$|^(اخر|آخر|اخر الحركات)$/.test(n)) return reply(chat, await lastReport(db, uid, now));
  if (isImg) {
    const ib = await db.get(`users/${uid}/inbox`) || {};
    if (Object.keys(ib).length >= 300) return reply(chat, "\u{1F4E5} \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0645\u0644\u064A\u0627\u0646 \u2014 \u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0645\u0631\u0629 \u0627\u0644\u0623\u0648\u0644.");
    const img = await photoData(tg, msg);
    if (img === "big") return reply(chat, "\u{1F4F8} \u0627\u0644\u0635\u0648\u0631\u0629 \u0643\u0628\u064A\u0631\u0629 \u2014 \u0627\u0628\u0639\u062A\u0647\u0627 \u0643\u0635\u0648\u0631\u0629 \u0639\u0627\u062F\u064A\u0629 (\u0645\u0634 \u0645\u0644\u0641) \u0648\u0647\u064A \u0647\u062A\u062A\u0635\u063A\u0651\u0631 \u0644\u0648\u062D\u062F\u0647\u0627.");
    if (!img) return reply(chat, "\u0645\u0642\u062F\u0631\u062A\u0634 \u0623\u0646\u0632\u0651\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u2014 \u062C\u0631\u0651\u0628 \u062A\u0627\u0646\u064A.");
    const id2 = "p" + rid();
    await db.set(`users/${uid}/inbox/${id2}`, { img, caption: String(msg.caption || "").slice(0, 200), at, chat: String(chat) });
    await db.set(`tg/last/${chat}`, id2);
    return reply(chat, "\u{1F4F8} \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0635\u0644\u062A \u2014 \u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0648\u0647\u062A\u0644\u0627\u0642\u064A\u0647\u0627 \u0645\u0633\u062A\u0646\u064A\u0627\u0643 \u062A\u0623\u0643\u062F \u0627\u0644\u0645\u0628\u0644\u063A.", { reply_markup: { inline_keyboard: [[{ text: "\u21A9\uFE0F \u062A\u0631\u0627\u062C\u0639", callback_data: "u:" + id2 }]] } });
  }
  if (!sms && /^\/report$|^تقرير/.test(n)) {
    const tz = await db.get(`push/${uid}/cfg/tz`) || "Asia/Riyadh", cm = localDay(now, tz).slice(0, 7);
    await sendReport(db, tg, uid, chat, /(اللي فات|الماضي|السابق)/.test(n) ? prevM(cm) : cm);
    return;
  }
  if (!sms && QRX.test(n)) return reply(chat, await spendReport(db, uid, period(n), now));
  if (sms) {
    const ib = await db.get(`users/${uid}/inbox`) || {};
    if (Object.keys(ib).length >= 300) return reply(chat, "\u{1F4E5} \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0645\u0644\u064A\u0627\u0646 \u2014 \u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0645\u0631\u0629 \u0627\u0644\u0623\u0648\u0644.");
    const id2 = "s" + rid();
    await db.set(`users/${uid}/inbox/${id2}`, { text, sms: true, at, chat: String(chat) });
    await db.set(`tg/last/${chat}`, id2);
    return reply(chat, "\u{1F4E9} \u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0628\u0646\u0643 \u0648\u0635\u0644\u062A \u2014 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0647\u062A\u0642\u0631\u0627\u0647\u0627 \u0648\u062A\u0633\u062C\u0644\u0647\u0627 \u0623\u0648\u0644 \u0645\u0627 \u062A\u0641\u062A\u062D\u0647\u0627.", { reply_markup: { inline_keyboard: [[{ text: "\u21A9\uFE0F \u062A\u0631\u0627\u062C\u0639", callback_data: "u:" + id2 }]] } });
  }
  const inbox = await db.get(`users/${uid}/inbox`) || {};
  if (Object.keys(inbox).length >= 300) return reply(chat, "\u{1F4E5} \u0627\u0644\u0635\u0646\u062F\u0648\u0642 \u0645\u0644\u064A\u0627\u0646 \u2014 \u0627\u0641\u062A\u062D \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0645\u0631\u0629 \u0639\u0644\u0634\u0627\u0646 \u062A\u062A\u0633\u062C\u0644 \u0627\u0644\u0631\u0633\u0627\u064A\u0644 \u0627\u0644\u0644\u064A \u0641\u0627\u062A\u062A.");
  const core = parseJ(await db.get(`users/${uid}/data/core`)), p = preview(text, core);
  if (!p) return reply(chat, "\u{1F914} \u0645\u0641\u0647\u0645\u062A\u0634 \u0627\u0644\u0645\u0628\u0644\u063A \u2014 \u0627\u0643\u062A\u0628\u0647 \u0628\u0627\u0644\u0623\u0631\u0642\u0627\u0645\u060C \u0645\u062B\u0644\u0627\u064B: <code>\u063A\u062F\u0627 45</code>\n\u0627\u0643\u062A\u0628 <code>\u0645\u0633\u0627\u0639\u062F\u0629</code> \u0639\u0644\u0634\u0627\u0646 \u062A\u0634\u0648\u0641 \u0627\u0644\u0623\u0645\u062B\u0644\u0629.");
  const id = "t" + rid();
  await db.set(`users/${uid}/inbox/${id}`, { text, at, chat: String(chat), mid: msg.message_id || 0 });
  await db.set(`tg/last/${chat}`, id);
  return reply(chat, `${esc(previewLine(p))}
<i>\u0647\u062A\u0638\u0647\u0631 \u0641\u064A \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0623\u0648\u0644 \u0645\u0627 \u062A\u0641\u062A\u062D\u0647\u0627</i>`, { reply_markup: { inline_keyboard: [[{ text: "\u21A9\uFE0F \u062A\u0631\u0627\u062C\u0639", callback_data: "u:" + id }]] } });
}
var MO = ["\u064A\u0646\u0627\u064A\u0631", "\u0641\u0628\u0631\u0627\u064A\u0631", "\u0645\u0627\u0631\u0633", "\u0623\u0628\u0631\u064A\u0644", "\u0645\u0627\u064A\u0648", "\u064A\u0648\u0646\u064A\u0648", "\u064A\u0648\u0644\u064A\u0648", "\u0623\u063A\u0633\u0637\u0633", "\u0633\u0628\u062A\u0645\u0628\u0631", "\u0623\u0643\u062A\u0648\u0628\u0631", "\u0646\u0648\u0641\u0645\u0628\u0631", "\u062F\u064A\u0633\u0645\u0628\u0631"];
var CN = { SA: ["\u{1F1F8}\u{1F1E6}", "\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629"], EG: ["\u{1F1EA}\u{1F1EC}", "\u0645\u0635\u0631"], AE: ["\u{1F1E6}\u{1F1EA}", "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A"], KW: ["\u{1F1F0}\u{1F1FC}", "\u0627\u0644\u0643\u0648\u064A\u062A"], QA: ["\u{1F1F6}\u{1F1E6}", "\u0642\u0637\u0631"], BH: ["\u{1F1E7}\u{1F1ED}", "\u0627\u0644\u0628\u062D\u0631\u064A\u0646"], OM: ["\u{1F1F4}\u{1F1F2}", "\u0639\u0645\u0627\u0646"], JO: ["\u{1F1EF}\u{1F1F4}", "\u0627\u0644\u0623\u0631\u062F\u0646"], US: ["\u{1F1FA}\u{1F1F8}", "\u0623\u0645\u0631\u064A\u0643\u0627"], GB: ["\u{1F1EC}\u{1F1E7}", "\u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627"], TR: ["\u{1F1F9}\u{1F1F7}", "\u062A\u0631\u0643\u064A\u0627"] };
var cName = (c) => CN[c] ? CN[c].join(" ") : c || "\u2014";
var mLabel = (m) => `${MO[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}`;
var prevM = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
};
var DTA = { lend: -1, borrow: 1, collect: 1, repay: -1 };
function deltaOf(t, aid) {
  if (t.kind === "income" && t.acc === aid) return +t.amount || 0;
  if (t.kind === "expense" && t.acc === aid) return -(+t.amount || 0);
  if (t.kind === "transfer") {
    let d = 0;
    if (t.acc === aid) d -= (+t.amount || 0) + (+t.fee || 0) + (+t.tax || 0);
    if (t.to === aid) d += +t.toAmount || 0;
    return d;
  }
  if (t.kind === "debt" && t.acc === aid) return (DTA[t.dt] || 0) * (+t.amount || 0);
  return 0;
}
function reportData(map, m) {
  const core = parseJ(map && map.core) || {}, accs = (core.accounts || []).filter((a) => a), st = core.settings || {}, rates = st.rates || {}, base = st.base || "SAR";
  const conv = (v, f, t) => f === t || !v ? v : v * (+rates[f] || 1) / (+rates[t] || 1), cats = {};
  (core.cats || []).forEach((c) => {
    if (c && c.id) cats[c.id] = `${c.icon || ""} ${c.name || ""}`.trim();
  });
  let tx = [];
  for (const k in map || {}) if (k.startsWith("tx_") && k.slice(3) <= m) {
    const v = parseJ(map[k]);
    if (v && Array.isArray(v.items)) tx = tx.concat(v.items);
  }
  const end = m + "-31", A = (id) => accs.find((a) => a.id === id), G = {}, g = (c, cur) => {
    const k = c + "|" + cur;
    return G[k] || (G[k] = { c, cur, inc: 0, exp: 0, fee: 0, cats: {}, accs: [], n: 0, tin: 0, tout: 0 });
  };
  accs.filter((a) => !a.archived).forEach((a) => {
    let b = +a.initial || 0;
    for (const t of tx) if (t && t.date <= end) b += deltaOf(t, a.id);
    g(a.country, a.currency).accs.push({ name: a.name, bal: b });
  });
  const trs = [];
  for (const t of tx) {
    if (!t || !String(t.date || "").startsWith(m)) continue;
    const a = A(t.acc);
    if (!a) continue;
    const o = g(a.country, a.currency);
    if (t.kind === "income") {
      o.inc += +t.amount || 0;
      o.n++;
    } else if (t.kind === "expense" && !(t.scope === "company" && (t.rec || t.cust))) {
      o.exp += +t.amount || 0;
      o.n++;
      const k = cats[t.cat] || "\u{1F4E6} \u0623\u062E\u0631\u0649";
      o.cats[k] = (o.cats[k] || 0) + (+t.amount || 0);
    } else if (t.kind === "transfer") {
      const b = A(t.to), f = (+t.fee || 0) + (+t.tax || 0);
      if (f) {
        o.exp += f;
        o.fee += f;
      }
      o.tout += +t.amount || 0;
      if (b) {
        g(b.country, b.currency).tin += +t.toAmount || 0;
        if (b.country !== a.country) trs.push({ from: a, to: b, amt: +t.amount || 0, to_amt: +t.toAmount || 0, date: t.date });
      }
    }
  }
  const groups = Object.values(G).filter((x) => x.accs.length || x.inc || x.exp).sort((a, b) => conv(b.exp, b.cur, base) - conv(a.exp, a.cur, base));
  const tot = { inc: 0, exp: 0, bal: 0 };
  groups.forEach((x) => {
    tot.inc += conv(x.inc, x.cur, base);
    tot.exp += conv(x.exp, x.cur, base);
    tot.bal += conv(x.accs.reduce((s, a) => s + a.bal, 0), x.cur, base);
  });
  return { m, name: st.name || "", base, groups, tot, trs };
}
function reportHTML(d) {
  const F = (v, c) => `${fmt(Math.round((+v || 0) * 100) / 100)} <small>${esc(sym(c))}</small>`;
  const card = (x) => {
    const net = x.inc - x.exp, top = Object.entries(x.cats).sort((a, b) => b[1] - a[1]).slice(0, 7), bal = x.accs.reduce((s, a) => s + a.bal, 0);
    return `<section><h2>${esc(cName(x.c))} <span class="cur">${esc(x.cur)}</span></h2><div class="k"><div><span>\u0627\u0644\u0648\u0627\u0631\u062F</span><b class="p">${F(x.inc, x.cur)}</b></div><div><span>\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641</span><b class="n">${F(x.exp, x.cur)}</b></div><div><span>\u0627\u0644\u0635\u0627\u0641\u064A</span><b class="${net >= 0 ? "p" : "n"}">${F(net, x.cur)}</b></div><div><span>\u0627\u0644\u0631\u0635\u064A\u062F \u0622\u062E\u0631 \u0627\u0644\u0634\u0647\u0631</span><b>${F(bal, x.cur)}</b></div></div>
    ${top.length ? `<h3>\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u062D\u0633\u0628 \u0627\u0644\u062A\u0635\u0646\u064A\u0641</h3><table>${top.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r">${F(v, x.cur)}</td><td class="r s">${x.exp ? Math.round(v / x.exp * 100) : 0}%</td></tr>`).join("")}</table>` : ""}
    ${x.accs.length ? `<h3>\u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A</h3><table>${x.accs.map((a) => `<tr><td>${esc(a.name)}</td><td class="r">${F(a.bal, x.cur)}</td></tr>`).join("")}</table>` : ""}${x.fee ? `<p class="s">\u0645\u0646\u0647\u0627 \u0631\u0633\u0648\u0645 \u062A\u062D\u0648\u064A\u0644 ${F(x.fee, x.cur)}</p>` : ""}</section>`;
  };
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\u062A\u0642\u0631\u064A\u0631 ${esc(mLabel(d.m))} \u2014 \u0645\u062D\u0641\u0638\u062A\u064A Pro</title>
<style>body{margin:0;background:#f4f6fb;color:#14213d;font-family:"Segoe UI",Tahoma,"Noto Naskh Arabic",sans-serif;line-height:1.6}main{max-width:860px;margin:auto;padding:20px}header{background:linear-gradient(135deg,#1e3a8a,#0f172a);color:#fff;border-radius:18px;padding:22px 24px;margin-bottom:16px}header h1{margin:0;font-size:24px}header p{margin:4px 0 0;opacity:.8}
.tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px}.tot div{background:rgba(255,255,255,.12);border-radius:12px;padding:10px 12px}.tot span{display:block;font-size:12px;opacity:.8}.tot b{font-size:18px}
section{background:#fff;border-radius:16px;padding:18px 20px;margin-bottom:14px;box-shadow:0 2px 10px rgba(15,23,42,.06)}h2{margin:0 0 12px;font-size:19px}.cur{font-size:12px;background:#eef2ff;color:#3730a3;border-radius:8px;padding:2px 8px;vertical-align:middle}h3{font-size:14px;margin:16px 0 6px;color:#475569}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}.k div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px}.k span{display:block;font-size:12px;color:#64748b}.k b{font-size:17px}.p{color:#047857}.n{color:#b91c1c}
table{width:100%;border-collapse:collapse;font-size:14px}td{padding:7px 4px;border-bottom:1px solid #eef2f7}.r{text-align:left;white-space:nowrap}.s{color:#64748b;font-size:12.5px}small{color:#64748b;font-weight:500}
.pr{display:block;margin:16px auto 0;background:#1e3a8a;color:#fff;border:0;border-radius:12px;padding:10px 22px;font:inherit;cursor:pointer}footer{text-align:center;color:#94a3b8;font-size:12px;margin:18px 0}@media print{.pr{display:none}body{background:#fff}section{box-shadow:none;border:1px solid #e2e8f0}}</style></head><body><main>
<header><h1>\u{1F4C4} \u062A\u0642\u0631\u064A\u0631 ${esc(mLabel(d.m))}</h1><p>${d.name ? esc(d.name) + " \xB7 " : ""}\u0643\u0644 \u062F\u0648\u0644\u0629 \u0628\u0639\u0645\u0644\u062A\u0647\u0627\u060C \u0648\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0628\u0627\u0644\u0640${esc(sym(d.base))}</p>
<div class="tot"><div><span>\u0627\u0644\u0648\u0627\u0631\u062F (\u0645\u062F\u0645\u0648\u062C)</span><b>${F(d.tot.inc, d.base)}</b></div><div><span>\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 (\u0645\u062F\u0645\u0648\u062C)</span><b>${F(d.tot.exp, d.base)}</b></div><div><span>\u0627\u0644\u0635\u0627\u0641\u064A</span><b>${F(d.tot.inc - d.tot.exp, d.base)}</b></div><div><span>\u0627\u0644\u0623\u0631\u0635\u062F\u0629 \u0622\u062E\u0631 \u0627\u0644\u0634\u0647\u0631</span><b>${F(d.tot.bal, d.base)}</b></div></div></header>
${d.groups.map(card).join("")}
${d.trs.length ? `<section><h2>\u2194\uFE0F \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0628\u064A\u0646 \u0627\u0644\u062F\u0648\u0644</h2><table>${d.trs.map((t) => `<tr><td>${esc(t.date.slice(8))}/${esc(t.date.slice(5, 7))}</td><td>${esc(t.from.name)} \u2190 ${esc(t.to.name)}</td><td class="r">${F(t.amt, t.from.currency)}</td><td class="r">${F(t.to_amt, t.to.currency)}</td></tr>`).join("")}</table></section>` : ""}
<button class="pr" onclick="print()">\u{1F5A8}\uFE0F \u0627\u0637\u0628\u0639\u0647 \u0623\u0648 \u0627\u062D\u0641\u0638\u0647 PDF</button><footer>\u0645\u062D\u0641\u0638\u062A\u064A Pro \xB7 \u0627\u062A\u0639\u0645\u0644 ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}</footer></main></body></html>`;
}
function reportText(d) {
  const lines = d.groups.filter((x) => x.inc || x.exp).map((x) => `${CN[x.c] ? CN[x.c][0] : "\u2022"} ${esc(CN[x.c] ? CN[x.c][1] : x.c)}: \u0635\u0631\u0641\u062A <b>${fmt(Math.round(x.exp))} ${esc(sym(x.cur))}</b> \xB7 \u062F\u062E\u0644 ${fmt(Math.round(x.inc))}`);
  return `\u{1F4C4} <b>\u062A\u0642\u0631\u064A\u0631 ${esc(mLabel(d.m))}</b>
${lines.join("\n") || "\u0645\u0641\u064A\u0634 \u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0634\u0647\u0631 \u062F\u0647"}

\u{1F4B0} \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A: \u0635\u0631\u0641\u062A ${fmt(Math.round(d.tot.exp))} ${esc(sym(d.base))} \u0645\u0646 ${fmt(Math.round(d.tot.inc))}`;
}
async function sendReport(db, tg, uid, chat, m) {
  const map = await db.get(`users/${uid}/data`) || {}, d = reportData(map, m);
  await tg.call("sendMessage", { chat_id: chat, text: reportText(d), parse_mode: "HTML" });
  if (tg.upload) await tg.upload("sendDocument", { chat_id: String(chat), caption: "\u0627\u0641\u062A\u062D \u0627\u0644\u0645\u0644\u0641 \u2014 \u0648\u0644\u0648 \u0639\u0627\u064A\u0632\u0647 PDF \u062F\u0648\u0633 \xAB\u0627\u0637\u0628\u0639\u0647 \u0623\u0648 \u0627\u062D\u0641\u0638\u0647 PDF\xBB" }, { field: "document", name: `\u062A\u0642\u0631\u064A\u0631-${m}.html`, type: "text/html", data: reportHTML(d) });
  return d;
}
var toB64 = (u8) => {
  if (typeof Buffer !== "undefined") return Buffer.from(u8).toString("base64");
  let s = "";
  for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(s);
};
async function photoData(tg, msg) {
  let fid = null, mime = "image/jpeg";
  if (Array.isArray(msg.photo) && msg.photo.length) {
    const ok = msg.photo.filter((p) => (p.width || 0) <= 1600);
    fid = (ok.length ? ok[ok.length - 1] : msg.photo[0]).file_id;
  } else if (msg.document && /^image\//.test(msg.document.mime_type || "")) {
    fid = msg.document.file_id;
    mime = msg.document.mime_type;
  }
  if (!fid || !tg.file) return null;
  const f = await tg.call("getFile", { file_id: fid });
  if (!f || !f.ok || !f.result || !f.result.file_path) return null;
  if ((+f.result.file_size || 0) > 18e5) return "big";
  const buf = await tg.file(f.result.file_path);
  if (!buf || buf.byteLength > 18e5) return "big";
  return `data:${mime};base64,${toB64(new Uint8Array(buf))}`;
}
var looksSMS = (t) => {
  t = String(t || "");
  return t.length > 35 && /\d/.test(t) && /(شراء|purchase|مدى|mada|debited|credited|خصم|إيداع|ايداع|حوال|pos\b|بطاق|card|رصيد|balance|سحب|withdraw|instapay|انستاباي|إنستاباي|تحويل وارد|تم تحويل)/i.test(t);
};

// ../../../home/claude/mahfazti/worker/tg-worker.mjs
var b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
var b64uS = (s) => b64u(new TextEncoder().encode(s));
var TOK = { v: null, exp: 0 };
async function gToken(sa) {
  if (TOK.v && Date.now() < TOK.exp - 6e4) return TOK.v;
  const iat = Math.floor(Date.now() / 1e3);
  const head = b64uS(JSON.stringify({ alg: "RS256", typ: "JWT" })), claim = b64uS(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email", aud: "https://oauth2.googleapis.com/token", iat, exp: iat + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, ""), der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = b64u(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(head + "." + claim)));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + sig });
  const j = await r.json();
  if (!j.access_token) throw new Error("google token: " + JSON.stringify(j).slice(0, 200));
  TOK = { v: j.access_token, exp: Date.now() + (+j.expires_in || 3600) * 1e3 };
  return TOK.v;
}
function restDb(env) {
  const sa = JSON.parse(env.FIREBASE_SA), base = String(env.DB_URL).replace(/\/$/, "");
  const req = async (p, method, body) => {
    const t = await gToken(sa), r = await fetch(`${base}/${p}.json`, { method, headers: { authorization: "Bearer " + t, "content-type": "application/json" }, body: body === void 0 ? void 0 : JSON.stringify(body) });
    if (!r.ok) throw new Error(`rtdb ${method} ${p} ${r.status}`);
    return r.json();
  };
  return { get: (p) => req(p, "GET"), set: (p, v) => req(p, "PUT", v), update: (p, v) => req(p, "PATCH", v), remove: (p) => req(p, "DELETE") };
}
var tgApi = (env) => ({
  call: async (m, params) => {
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(params || {}) });
    return r.json();
  },
  file: async (path) => {
    const r = await fetch(`https://api.telegram.org/file/bot${env.TG_TOKEN}/${path}`);
    return r.ok ? r.arrayBuffer() : null;
  },
  upload: async (m, fields, f) => {
    const fd = new FormData();
    for (const k in fields) fd.append(k, fields[k]);
    fd.append(f.field, new Blob([f.data], { type: f.type }), f.name);
    const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`, { method: "POST", body: fd });
    return r.json();
  }
});
var tg_worker_default = { async fetch(req, env, ctx) {
  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname === "/setup") {
    if (url.searchParams.get("key") !== env.TG_SECRET) return new Response("forbidden", { status: 403 });
    const out = {};
    try {
      await tgApi(env).call("setMyCommands", { commands: [{ command: "help", description: "\u0627\u0644\u0623\u0645\u062B\u0644\u0629" }, { command: "today", description: "\u0635\u0631\u0641\u062A \u0643\u0627\u0645 \u0627\u0644\u0646\u0647\u0627\u0631\u062F\u0647" }, { command: "month", description: "\u0635\u0631\u0641\u062A \u0643\u0627\u0645 \u0627\u0644\u0634\u0647\u0631 \u062F\u0647" }, { command: "report", description: "\u0645\u0644\u0641 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0634\u0647\u0631" }, { command: "last", description: "\u0622\u062E\u0631 \u0627\u0644\u062D\u0631\u0643\u0627\u062A" }, { command: "undo", description: "\u0625\u0644\u063A\u0627\u0621 \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629" }] });
      out.webhook = await tgApi(env).call("setWebhook", { url: url.origin + "/tg", secret_token: env.TG_SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: false });
      const me = await tgApi(env).call("getMe");
      out.bot = me.ok && me.result ? me.result.username : null;
      if (!me.ok) out.me = me.description;
      try {
        if (out.bot) await restDb(env).set("tgcfg", { bot: out.bot, at: Date.now() });
        out.db = true;
      } catch (e) {
        out.db = String(e && e.message || e).slice(0, 200);
      }
    } catch (e) {
      out.error = String(e && e.message || e).slice(0, 200);
    }
    out.ok = !!(out.webhook && out.webhook.ok);
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  }
  if (req.method === "POST" && url.pathname === "/tg") {
    if (req.headers.get("x-telegram-bot-api-secret-token") !== env.TG_SECRET) return new Response("forbidden", { status: 403 });
    const u = await req.json().catch(() => null);
    if (u) ctx.waitUntil(handleUpdate(u, { db: restDb(env), tg: tgApi(env), log: console.log }).catch((e) => console.log("tg error", e && e.message)));
    return new Response("ok");
  }
  return new Response("\u0645\u062D\u0641\u0638\u062A\u064A Pro bot", { status: 200 });
} };
export {
  tg_worker_default as default
};
