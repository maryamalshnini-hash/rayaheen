const CACHE="rayaheen-v10";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=="rayaheen-model-v2"&&k!=="rayaheen-media").map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch",e=>{ const u=new URL(e.request.url);
  if(u.pathname.includes("/models/")||/jsdelivr\.net/.test(u.host)){ e.respondWith(caches.open("rayaheen-model-v2").then(async c=>{ const h=await c.match(e.request); if(h) return h; const res=await fetch(e.request); if(res.ok) c.put(e.request,res.clone()); return res; })); return; }
  if(u.origin===location.origin){ e.respondWith(fetch(e.request).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); } return res; }).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html")))); return; }
  // صوت التلاوة ونص القرآن: الشبكة أولًا مع حفظ نسخة
  if(/everyayah|islamic\.network|alquran\.cloud/.test(u.host)){ e.respondWith(fetch(e.request).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open("rayaheen-media").then(c=>c.put(e.request,cp)); } return res; }).catch(()=>caches.match(e.request))); }
});
