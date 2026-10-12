// Halcyon service worker: app shell offline, always prefer fresh code when online.
const CACHE="halcyon-v17"; // v17 (2026-10-11): The Halcyon Launch v2 is the live PMP book, loaded from full/v2/
// The PMP chapters load from full/v2/ as full/v2/preview.js lists them; chapters added later are cached on first fetch (network first).
const SHELL=["/", "/engine.js", "/lab.js", "/lab.css", "/order.js", "/courses.js", "/upcoming.js", "/courses/pmp/labs.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/full/v2/preview.js", "/full/v2/cast.js", "/full/v2/ch01.js", "/full/v2/ch02.js", "/full/v2/ch03.js", "/full/v2/ch04.js", "/full/v2/ch05.js", "/full/v2/ch06.js", "/full/v2/ch07.js", "/full/v2/ch08.js", "/full/v2/ch09.js", "/full/v2/ch10.js", "/full/v2/ch11.js", "/mock/business.js", "/mock/people.js", "/mock/process.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/")||u.pathname.startsWith("/audio/"))return; // audio streams straight from the network
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("/"))));
});
