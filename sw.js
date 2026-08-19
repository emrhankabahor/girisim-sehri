const CACHE_NAME='empire-of-trade-v197';
const CORE=[
  './',
  './index.html',
  './styles.css?v=190',
  './bootstrap.js?v=190',
  './app.js?v=190',
  './v167.js?v=190',
  './v169.js?v=190',
  './loan-management.js?v=190',
  './realtime-finance.js?v=190',
  './state-integrity.js?v=190',
  './company-list-fix.js?v=190',
  './demo-balance-grant.js?v=190',
  './investment-visibility.js?v=190',
  './construction-fixes.js?v=190',
  './investment-fixes.js?v=190',
  './finance-fixes.js?v=190',
  './career-persistence-fixes.js?v=190',
  './stability-fixes.js?v=170',
  './manifest.webmanifest?v=190',
  './content-1.html?v=190',
  './content-2.html?v=190',
  './content-3.html?v=190',
  './content-4.html?v=190',
  './content-5.html?v=190',
  './content-6.html?v=190',
  './icon-192.png?v=190',
  './icon-512.png?v=190',
  './apple-touch-icon.png?v=190'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});

async function cacheFirst(req){
  const cache=await caches.open(CACHE_NAME);
  const exact=await cache.match(req);
  if(exact)return exact;
  const normalized=await cache.match(req,{ignoreSearch:true});
  if(normalized)return normalized;
  try{
    const res=await fetch(req);
    if(res&&res.status===200)await cache.put(req,res.clone());
    return res;
  }catch(e){
    return normalized||Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req,{ignoreSearch:true})));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE_NAME);
      const cached=await cache.match('./index.html');
      if(cached)return cached;
      try{
        const res=await fetch(req);
        if(res&&res.status===200)await cache.put('./index.html',res.clone());
        return res;
      }catch(e){
        return new Response('<h1>Empire of Trade</h1><p>Uygulama çevrimdışı başlatılamadı.</p>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  event.respondWith(cacheFirst(req));
});
