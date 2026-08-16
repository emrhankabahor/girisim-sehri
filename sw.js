const CACHE_NAME='empire-of-trade-v196';
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
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{
        const u=new URL(client.url);
        u.searchParams.set('_sw','196');
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
    fresh.searchParams.set('v',file==='stability-fixes.js'?'170':'190');
    fresh.searchParams.set('_fresh',Date.now().toString());
    event.respondWith(fetch(fresh.toString(),{cache:'no-store'}).then(res=>{
      if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./'+file+'?v='+(file==='stability-fixes.js'?'170':'190'),copy));}
      return res;
    }).catch(()=>caches.match('./'+file+'?v='+(file==='stability-fixes.js'?'170':'190'))));
    return;
  }

  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res}).catch(()=>caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res&&res.status===200){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res}).catch(async()=>{
    const direct=await caches.match(req);if(direct)return direct;
    const normalized=new URL(req.url);normalized.search='';
    return caches.match(normalized.pathname.replace(/^\//,'./'));
  }));
});
