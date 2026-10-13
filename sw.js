/* محفظتي Pro — offline support + share target */
const V='mhf-v18';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='mhf-share').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const CDN=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/|cdnjs\.cloudflare\.com\/|cdn\.jsdelivr\.net\/npm\/tesseract)/;
async function shareIn(req){let q='share=1';
  try{const fd=await req.formData();const t=['title','text','url'].map(k=>fd.get(k)).filter(x=>typeof x==='string'&&x.trim()).join('\n');if(t)q+='&text='+encodeURIComponent(t.slice(0,4000));
    const f=fd.getAll('files').find(x=>x&&x.size);if(f){const c=await caches.open('mhf-share');await c.put('./__shared_img',new Response(f,{headers:{'content-type':f.type||'image/jpeg'}}));q+='&img=1'}}catch(err){}
  return Response.redirect(new URL('./?'+q,self.registration.scope).href,303)}
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
  if(r.method==='POST'&&u.origin===location.origin&&u.pathname.endsWith('/share-target')){e.respondWith(shareIn(r));return}
  if(r.method!=='GET')return;
  if(u.origin===location.origin){
    e.respondWith(fetch(new Request(r.url,{cache:'no-cache',credentials:'same-origin'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(m=>m||caches.match('./index.html'))));return}
  if(CDN.test(r.url)){
    e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>m);return m||net}))}
});

/* web push */
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'محفظتي Pro',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',tag:d.tag||d.id||'mhf',renotify:false,data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if(w.url.startsWith(self.registration.scope)&&'focus' in w){if(w.navigate)w.navigate(url).catch(()=>{});return w.focus()}}return clients.openWindow(url)}))});
