const CACHE_NAME='girisim-sehri-v166';
const CORE=[
  './',
  './index.html',
  './styles.css?v=166',
  './bootstrap.js?v=166',
  './app.js?v=166',
  './manifest.webmanifest',
  './content-1.html',
  './content-2.html',
  './content-3.html',
  './content-4.html',
  './content-5.html',
  './content-6.html',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));
        return res;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req).then(res=>{
      if(res && res.status===200){
        const copy=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req,copy));
      }
      return res;
    }).catch(()=>caches.match(req))
  );
});
