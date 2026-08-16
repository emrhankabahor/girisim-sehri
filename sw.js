const CACHE_NAME='empire-of-trade-v191';
const CORE=[
  './',
  './index.html',
  './styles.css?v=191',
  './bootstrap.js?v=191',
  './app.js?v=191',
  './v167.js?v=191',
  './v169.js?v=191',
  './loan-management.js?v=191',
  './realtime-finance.js?v=191',
  './state-integrity.js?v=191',
  './company-list-fix.js?v=191',
  './demo-balance-grant.js?v=191',
  './investment-visibility.js?v=191',
  './manifest.webmanifest?v=191',
  './content-1.html?v=191',
  './content-2.html?v=191',
  './content-3.html?v=191',
  './content-4.html?v=191',
  './content-5.html?v=191',
  './content-6.html?v=191',
  './icon-192.png?v=191',
  './icon-512.png?v=191',
  './apple-touch-icon.png?v=191'
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
        u.searchParams.set('_sw','191');
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
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(()=>caches.match(req)));
});
