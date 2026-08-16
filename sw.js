const CACHE_NAME='empire-of-trade-v192';
const CORE=[
  './',
  './index.html',
  './styles.css?v=192',
  './bootstrap.js?v=192',
  './app.js?v=192',
  './v167.js?v=192',
  './v169.js?v=192',
  './loan-management.js?v=192',
  './realtime-finance.js?v=192',
  './state-integrity.js?v=192',
  './company-list-fix.js?v=192',
  './demo-balance-grant.js?v=192',
  './investment-visibility.js?v=192',
  './manifest.webmanifest?v=192',
  './content-1.html?v=192',
  './content-2.html?v=192',
  './content-3.html?v=192',
  './content-4.html?v=192',
  './content-5.html?v=192',
  './content-6.html?v=192',
  './icon-192.png?v=192',
  './icon-512.png?v=192',
  './apple-touch-icon.png?v=192'
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
        u.searchParams.set('_sw','192');
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

  if(url.pathname.endsWith('/investment-visibility.js')){
    const fresh=new URL('./investment-visibility.js',self.location.href);
    fresh.searchParams.set('v','192');
    fresh.searchParams.set('_fresh',Date.now().toString());
    event.respondWith(fetch(fresh.toString(),{cache:'no-store'}).then(res=>{
      if(res&&res.status===200){
        const copy=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put('./investment-visibility.js?v=192',copy));
      }
      return res;
    }).catch(()=>caches.match('./investment-visibility.js?v=192')));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(()=>caches.match(req)));
});
