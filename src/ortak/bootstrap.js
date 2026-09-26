/* EOT_PART bootstrap.js-core-0 */
(async function(){
  window.__EOT_NATIVE_READY__=false;
  const root=document.getElementById('app-root');
  const APP_VERSION='222';
  let versionCheckRunning=false;

  
/* EOT_END */
/* EOT_PART bootstrap.js-core-1 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-2 */


  window.addEventListener('pageshow',()=>checkRemoteVersion());
  window.addEventListener('focus',()=>checkRemoteVersion());
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkRemoteVersion()});
  setInterval(checkRemoteVersion,30000);

  if('serviceWorker' in navigator){
    /* Yeni Service Worker devreye girdiğinde sayfayı zorla tekrar yükleme.
       Böylece eski splash -> yeni splash şeklinde çift açılış oluşmaz. */
    navigator.serviceWorker.addEventListener('controllerchange',()=>{});
    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v='+APP_VERSION,{scope:'./',updateViaCache:'none'});
        await reg.update();
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
        reg.addEventListener('updatefound',()=>{
          const worker=reg.installing;
          if(!worker) return;
          worker.addEventListener('statechange',()=>{
            if(worker.state==='installed' && navigator.serviceWorker.controller){
              worker.postMessage({type:'SKIP_WAITING'});
            }
          });
        });
      }catch(err){console.warn('Service worker kaydı başarısız:',err)}
    });
  }

  
/* EOT_END */
/* EOT_PART bootstrap.js-core-3 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-4 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-5 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-6 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-7 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-core-8 */


  
/* EOT_END */
/* EOT_PART bootstrap.js-tail */


  try{
    await checkRemoteVersion();
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v='+APP_VERSION+'&_='+Date.now(),{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    applyBranding();
    buildDemoUI();
    let loadedCritical=0;
    const totalCritical=13;
    const load=(src,next)=>{
      const s=document.createElement('script');
      s.src=src+'?v='+APP_VERSION+'&_='+Date.now();
      s.onload=()=>{
        loadedCritical++;
        applyBranding();buildDemoUI();syncDemo();restoreOriginalBottomNav();
        next&&next();
      };
      s.onerror=()=>{console.warn(src+' yüklenemedi');loadedCritical++;next&&next()};
      document.body.appendChild(s)
    };
    load('loan-management.js');
    load('app.js',()=>{
      try{if(window.EOTCompanyOnboarding&&typeof window.EOTCompanyOnboarding.refresh==='function')window.EOTCompanyOnboarding.refresh()}catch(e){}
      load('credit-score-sync.js',()=>load('transaction-history-fix.js',()=>load('deposit-ui.js',()=>load('v167.js',()=>load('realtime-finance.js',()=>load('state-integrity.js',()=>load('company-list-fix.js',()=>load('demo-balance-grant.js',()=>load('v169.js',()=>load('construction-fixes.js',()=>load('investment-fixes.js',()=>{
        try{
          applyBranding();buildDemoUI();syncDemo();restoreOriginalBottomNav();
          if(typeof render==='function')render();
          if(typeof renderFinanceExtras==='function')renderFinanceExtras();
          if(typeof renderGameExtras==='function')renderGameExtras();
        }catch(e){}
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          window.__EOT_NATIVE_READY__=true;
          try{ if(window.EOTStartupSplash) window.EOTStartupSplash.ready(); }catch(e){}
        }));
      })))))))))));
    });
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Empire of Trade yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
/* EOT_END */
