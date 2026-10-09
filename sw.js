// Halcyon service worker: app shell offline, always prefer fresh code when online.
const CACHE="halcyon-v4";
const SHELL=["/", "/engine.js", "/full/cast.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/chapters/ch1.js", "/chapters/ch2.js", "/chapters/ch3.js", "/chapters/ch4.js", "/chapters/ch5.js", "/chapters/ch6.js", "/full/ch01.js", "/full/ch02.js", "/full/ch03.js", "/full/ch04.js", "/full/ch05.js", "/full/ch06.js", "/full/ch07.js", "/full/ch08.js", "/full/ch09.js", "/full/ch10.js", "/full/ch11.js", "/full/ch12.js", "/full/ch13.js", "/full/ch14.js", "/full/ch15.js", "/mock/business.js", "/mock/people.js", "/mock/process.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/")||u.pathname.startsWith("/audio/"))return; // audio streams straight from the network
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("/"))));
});
