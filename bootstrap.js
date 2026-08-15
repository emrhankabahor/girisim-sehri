(async function(){
  const root=document.getElementById('app-root');

  if('serviceWorker' in navigator){
    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v=180',{scope:'./'});
        await reg.update();
      }catch(err){console.warn('Service worker kaydı başarısız:',err)}
    });
  }

  try{
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v=180',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    const versionLabel=document.querySelector('.topbar small');
    if(versionLabel) versionLabel.textContent='MOBİL DEMO • V1.69 • OYNANABİLİRLİK';
    const load=(src,next)=>{const s=document.createElement('script');s.src=src+'?v=180';s.onload=()=>next&&next();document.body.appendChild(s)};
    load('app.js',()=>load('v167.js',()=>load('realtime-finance.js',()=>load('state-integrity.js',()=>load('company-list-fix.js',()=>load('demo-balance-grant.js',()=>load('v169.js',()=>load('loan-management.js'))))))));
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Girişim Şehri yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
