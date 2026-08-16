(async function(){
  const root=document.getElementById('app-root');
  const APP_VERSION='187';

  if('serviceWorker' in navigator){
    let refreshing=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(refreshing) return;
      refreshing=true;
      const key='eot-sw-reload-'+APP_VERSION;
      if(sessionStorage.getItem(key)!=='1'){
        sessionStorage.setItem(key,'1');
        location.reload();
      }
    });
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

  function applyLogo(el){
    if(!el) return;
    el.textContent='';
    el.style.backgroundImage="url('./apple-touch-icon.png?v=187')";
    el.style.backgroundSize='cover';
    el.style.backgroundPosition='center';
    el.style.backgroundRepeat='no-repeat';
  }

  function hrefFor(words,fallback='#home'){
    const keys=words.map(x=>x.toLocaleLowerCase('tr'));
    const links=[...document.querySelectorAll('a[href^="#"]')];
    const hit=links.find(a=>{
      const t=(a.textContent||'').toLocaleLowerCase('tr');
      return keys.some(k=>t.includes(k));
    });
    return hit?.getAttribute('href')||fallback;
  }

  function syncDashboard(){
    const old=[...document.querySelectorAll('#home .home-money-grid b')];
    const cash=document.getElementById('eotDashCash');
    const worth=document.getElementById('eotDashWorth');
    const flow=document.getElementById('eotDashFlow');
    if(cash && old[0]) cash.textContent=old[0].textContent;
    if(worth && old[1]) worth.textContent=old[1].textContent;
    if(flow && old[2]) flow.textContent=old[2].textContent;
    const level=document.getElementById('homeLevel');
    const dashLevel=document.getElementById('eotDashLevel');
    if(level&&dashLevel) dashLevel.textContent=level.textContent||'1';
  }

  function buildEmpireDashboard(){
    const home=document.getElementById('home');
    if(!home || home.dataset.eotV2==='1') return;
    home.dataset.eotV2='1';

    const targets={
      companies:hrefFor(['şirket','firma']),
      investments:hrefFor(['yatırım','borsa','kripto']),
      bank:hrefFor(['banka','kredi']),
      market:hrefFor(['fırsat','pazar']),
      land:hrefFor(['arsa','şehir']),
      property:hrefFor(['gayrimenkul','emlak','konut']),
      vehicle:hrefFor(['araç','galeri','otomobil']),
      construction:hrefFor(['inşaat']),
      profile:hrefFor(['profil','hesap'])
    };

    [...home.children].forEach(el=>{el.classList.add('eot-home-legacy');});

    const dash=document.createElement('div');
    dash.className='eot-v2-dashboard';
    dash.innerHTML=`
      <section class="eot-v2-resources">
        <div><span>NAKİT</span><b id="eotDashCash">₺0</b><small>Kullanılabilir bakiye</small></div>
        <div><span>NET SERVET</span><b id="eotDashWorth">₺0</b><small>Toplam varlık değeri</small></div>
        <div><span>AYLIK AKIŞ</span><b id="eotDashFlow">₺0</b><small>Gelir - gider</small></div>
      </section>

      <section class="eot-v2-profile">
        <div class="eot-v2-profile-main">
          <div class="eot-v2-avatar">♙</div>
          <div class="eot-v2-profile-copy">
            <span>YÖNETİM PROFİLİ</span>
            <h2>Ekonomi İmparatorluğu</h2>
            <p>CEO • Empire of Trade</p>
          </div>
          <a class="eot-v2-profile-btn" href="${targets.profile}">›</a>
        </div>
        <div class="eot-v2-level-row"><b>SEVİYE <strong id="eotDashLevel">1</strong></b><div class="eot-v2-xp"><i></i></div><small>Kariyer gelişimi</small></div>
      </section>

      <div class="eot-v2-section-title"><div><span>İŞ DÜNYAM</span><h3>İmparatorluğunu yönet</h3></div><small>İŞLETMELER & VARLIKLAR</small></div>
      <section class="eot-v2-business-grid">
        <a href="${targets.companies}"><em>🏪</em><b>Mağazalar</b><small>Perakende işletmeleri</small><i>YÖNET</i></a>
        <a href="${targets.companies}"><em>🏭</em><b>Fabrikalar</b><small>Üretim tesisleri</small><i>YÖNET</i></a>
        <a href="${targets.construction}"><em>🏗️</em><b>İnşaat</b><small>Projeler & şirketler</small><i>AÇ</i></a>
        <a href="${targets.vehicle}"><em>🚘</em><b>Galeri</b><small>Araç ticareti</small><i>AÇ</i></a>
        <a href="${targets.property}"><em>🏢</em><b>Gayrimenkul</b><small>Konut & ticari mülk</small><i>AÇ</i></a>
        <a href="${targets.land}"><em>🗺️</em><b>Arsalar</b><small>Şehir & arsa pazarı</small><i>AÇ</i></a>
      </section>

      <div class="eot-v2-section-title eot-v2-quick-head"><div><span>HIZLI İŞLEMLER</span><h3>Finans & fırsatlar</h3></div></div>
      <section class="eot-v2-actions">
        <a href="${targets.investments}"><span>📈</span><div><b>Yatırım Merkezi</b><small>Borsa, kripto ve altın</small></div><strong>›</strong></a>
        <a href="${targets.bank}"><span>💳</span><div><b>Banka & Kredi</b><small>Finansman yönetimi</small></div><strong>›</strong></a>
        <a href="${targets.market}"><span>🛒</span><div><b>Fırsat Pazarı</b><small>Yeni ticaret fırsatları</small></div><strong>›</strong></a>
        <a href="${targets.companies}"><span>🏛️</span><div><b>Şirket Merkezi</b><small>Operasyon ve büyüme</small></div><strong>›</strong></a>
      </section>

      <section class="eot-v2-market-strip">
        <div><span>PİYASA DURUMU</span><b>Canlı ekonomi aktif</b></div>
        <div><span>STRATEJİ</span><b>Nakit akışını koru</b></div>
      </section>`;
    home.prepend(dash);
    syncDashboard();
    setInterval(syncDashboard,600);
  }

  function applyEmpireBranding(){
    document.title='Empire of Trade Demo V1.69 • Oynanabilirlik';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(node.parentElement && !['SCRIPT','STYLE'].includes(node.parentElement.tagName)){
        node.nodeValue=node.nodeValue
          .replace(/GİRİŞİM ŞEHRİ/g,'EMPIRE OF TRADE')
          .replace(/Girişim Şehri/g,'Empire of Trade');
      }
    });
    document.querySelectorAll('.account-brand-logo,.topbar .logo,.career-brand-mark').forEach(applyLogo);
    const versionLabel=document.querySelector('.topbar small');
    if(versionLabel) versionLabel.textContent='MOBİL DEMO • V1.69 • OYNANABİLİRLİK';
    buildEmpireDashboard();
  }

  try{
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v=187',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    applyEmpireBranding();
    const load=(src,next)=>{const s=document.createElement('script');s.src=src+'?v=187';s.onload=()=>{applyEmpireBranding();syncDashboard();next&&next()};document.body.appendChild(s)};
    load('app.js',()=>load('v167.js',()=>load('realtime-finance.js',()=>load('state-integrity.js',()=>load('company-list-fix.js',()=>load('demo-balance-grant.js',()=>load('v169.js',()=>load('loan-management.js'))))))));
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Empire of Trade yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
