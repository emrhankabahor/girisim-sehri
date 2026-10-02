const CACHE_NAME='empire-of-trade-v299';
// Only critical startup files gate installation. Optional game assets are cached
// on demand, so a slow or failed secondary download cannot block the launch shell.
const CORE=[
 './index.html','./startup-splash.js?v=33','./bootstrap.js?v=240',
 './styles.css?v=188','./interface-theme.css?v=234',
 './assets/logo-v221-192.png','./assets/logo-v221-512.png',
 './assets/launch-v232-1242x2688.png','./assets/launch-v232-1125x2436.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
async function cacheFirst(req){
  const cache=await caches.open(CACHE_NAME);
  // Ignore only request timestamps. The v parameter identifies different code.
  const key=new URL(req.url);
  key.searchParams.delete('_');
  const exact=await cache.match(key.href);
  if(exact)return exact;
  try{
    const res=await fetch(req);
    if(res&&res.status===200)await cache.put(key.href,res.clone());
    return res;
  }catch(e){
    // Offline fallback may use the previous version, but never hide an online update.
    return await cache.match(req,{ignoreSearch:true})||Response.error();
  }
}
// Paint the installed app shell immediately; refresh it without blocking launch.
async function navigationResponse(req,event){
  const cache=await caches.open(CACHE_NAME);
  const url=new URL(req.url);
  const scopePath=new URL(self.registration.scope).pathname;
  const isShell=url.pathname===scopePath||url.pathname===scopePath+'index.html';
  if(!isShell)return fetch(req);
  const cached=await cache.match('./index.html');
  const refresh=fetch(req,{cache:'no-store'}).then(async res=>{
    if(res&&res.status===200)await cache.put('./index.html',res.clone());
    return res;
  });
  // Version recovery must receive fresh HTML, never the stale cached shell.
  if(cached&&!url.searchParams.has('_fresh')){
    event.waitUntil(refresh.catch(()=>{}));
    return cached;
  }
  try{
    const res=await refresh;
    if(res.ok||!cached)return res;
  }catch(e){}
  return cached||new Response('<h1>Empire of Trade</h1><p>Uygulama çevrimdışı başlatılamadı.</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
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
    event.respondWith(navigationResponse(req,event));
    return;
  }
  event.respondWith(cacheFirst(req));
});
