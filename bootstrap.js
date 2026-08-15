(async function(){
  const root=document.getElementById('app-root');

  if('serviceWorker' in navigator){
    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v=175',{scope:'./'});
        await reg.update();
      }catch(err){
        console.warn('Service worker kaydı başarısız:',err);
      }
    });
  }

  try{
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v=175',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    const versionLabel=document.querySelector('.topbar small');
    if(versionLabel) versionLabel.textContent='MOBİL DEMO • V1.68 • KAYIT SİSTEMİ';
    const script=document.createElement('script');
    script.src='app.js?v=175';
    script.onload=()=>{
      const patch=document.createElement('script');
      patch.src='v167.js?v=175';
      patch.onload=()=>{
        const realtime=document.createElement('script');
        realtime.src='realtime-finance.js?v=175';
        realtime.onload=()=>{
          const integrity=document.createElement('script');
          integrity.src='state-integrity.js?v=175';
          integrity.onload=()=>{
            const companies=document.createElement('script');
            companies.src='company-list-fix.js?v=175';
            companies.onload=()=>{
              const grant=document.createElement('script');
              grant.src='demo-balance-grant.js?v=175';
              document.body.appendChild(grant);
            };
            document.body.appendChild(companies);
          };
          document.body.appendChild(integrity);
        };
        document.body.appendChild(realtime);
      };
      document.body.appendChild(patch);
    };
    document.body.appendChild(script);
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Girişim Şehri yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
