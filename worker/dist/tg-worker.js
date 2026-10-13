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
\u2022 <code>\u0622\u062E\u0631</code> \u2014 \u0622\u062E\u0631 \u0627\u0644\u062D\u0631\u0643\u0627\u062A \xB7 <code>\u062A\u0631\u0627\u062C\u0639</code> \u2014 \u064A\u0644\u063A\u064A \u0622\u062E\u0631 \u0631\u0633\u0627\u0644\u0629`;
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
    return `\u21A9\uFE0F \u0627\u062A\u0644\u063A\u062A \xAB${esc(String(cur.text || "").slice(0, 60))}\xBB`;
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
    if (!chat2 || !d.startsWith("u:")) return;
    const uid2 = await linkedUid(db, chat2);
    if (!uid2) return;
    const r = await undo(db, uid2, chat2, d.slice(2), now);
    await tg.call("editMessageText", { chat_id: chat2, message_id: q.message.message_id, text: r, parse_mode: "HTML" });
    return;
  }
  const msg = u.message;
  if (!msg || !msg.chat || msg.chat.type !== "private") return;
  const chat = msg.chat.id, raw = String(msg.text || "").trim();
  if (!raw) return reply(chat, "\u0627\u0628\u0639\u062A\u0644\u064A \u0646\u0635 \u0628\u0633 \u2014 \u0645\u062B\u0644\u0627\u064B: <code>\u063A\u062F\u0627 45</code>");
  const text = raw.slice(0, 200), n = norm(text), at = (+msg.date || 0) * 1e3 || now;
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
  if (QRX.test(n)) return reply(chat, await spendReport(db, uid, period(n), now));
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
var tgApi = (env) => ({ call: async (m, params) => {
  const r = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/${m}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(params || {}) });
  return r.json();
} });
var tg_worker_default = { async fetch(req, env, ctx) {
  const url = new URL(req.url);
  if (req.method === "GET" && url.pathname === "/setup") {
    if (url.searchParams.get("key") !== env.TG_SECRET) return new Response("forbidden", { status: 403 });
    const r = await tgApi(env).call("setWebhook", { url: url.origin + "/tg", secret_token: env.TG_SECRET, allowed_updates: ["message", "callback_query"], drop_pending_updates: false });
    return new Response(JSON.stringify(r), { headers: { "content-type": "application/json" } });
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
