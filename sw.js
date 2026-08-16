const CACHE_NAME='empire-of-trade-v195';
const CORE=[
  './',
  './index.html',
  './styles.css?v=195',
  './bootstrap.js?v=195',
  './app.js?v=195',
  './v167.js?v=195',
  './v169.js?v=195',
  './loan-management.js?v=195',
  './realtime-finance.js?v=195',
  './state-integrity.js?v=195',
  './company-list-fix.js?v=195',
  './demo-balance-grant.js?v=195',
  './investment-visibility.js?v=195',
  './stability-fixes.js?v=170',
  './manifest.webmanifest?v=195',
  './content-1.html?v=195',
  './content-2.html?v=195',
  './content-3.html?v=195',
  './content-4.html?v=195',
  './content-5.html?v=195',
  './content-6.html?v=195',
  './icon-192.png?v=195',
  './icon-512.png?v=195',
  './apple-touch-icon.png?v=195'
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
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{
        const u=new URL(client.url);
        u.searchParams.set('_sw','195');
        u.searchParams.set('_fresh',Date.now().toString());
        await client.navigate(u.toString());
      }catch(e){}
    }
  })());
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;

  if(url.pathname.endsWith('/version.json')){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }

  if(url.pathname.endsWith('/investment-visibility.js')||url.pathname.endsWith('/stability-fixes.js')){
    const file=url.pathname.endsWith('/stability-fixes.js')?'stability-fixes.js':'investment-visibility.js';
    const fresh=new URL('./'+file,self.location.href);
    fresh.searchParams.set('v',file==='stability-fixes.js'?'170':'195');
    fresh.searchParams.set('_fresh',Date.now().toString());
    event.respondWith(fetch(fresh.toString(),{cache:'no-store'}).then(res=>{
      if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./'+file+'?v='+(file==='stability-fixes.js'?'170':'195'),copy));}
      return res;
    }).catch(()=>caches.match('./'+file+'?v='+(file==='stability-fixes.js'?'170':'195'))));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(()=>caches.match(req)));
});
