const CACHE="rayaheen-v1";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{}))); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch",e=>{ const u=new URL(e.request.url);
  if(u.origin===location.origin){ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return res; }).catch(()=>caches.match("./index.html")))); return; }
  // صوت التلاوة ونص القرآن: الشبكة أولًا مع حفظ نسخة
  if(/everyayah|islamic\.network|alquran\.cloud/.test(u.host)){ e.respondWith(fetch(e.request).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open("rayaheen-media").then(c=>c.put(e.request,cp)); } return res; }).catch(()=>caches.match(e.request))); }
});
