(async function(){
  const root=document.getElementById('app-root');
  const APP_VERSION='188';

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

  function hrefFor(words,fallback='#home'){
    const keys=words.map(x=>x.toLocaleLowerCase('tr'));
    const links=[...document.querySelectorAll('a[href^="#"]')];
    const hit=links.find(a=>{
      const t=(a.textContent||'').toLocaleLowerCase('tr');
      return keys.some(k=>t.includes(k));
    });
    return hit?.getAttribute('href')||fallback;
  }

  function applyBranding(){
    document.title='Empire of Trade Demo V1.69 • Oynanabilirlik';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(node.parentElement && !['SCRIPT','STYLE'].includes(node.parentElement.tagName)){
        node.nodeValue=node.nodeValue.replace(/GİRİŞİM ŞEHRİ/g,'EMPIRE OF TRADE').replace(/Girişim Şehri/g,'Empire of Trade');
      }
    });
    document.querySelectorAll('.account-brand-logo,.career-brand-mark').forEach(el=>{
      el.textContent='';
      el.style.backgroundImage="url('./apple-touch-icon.png?v=188')";
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
    });
  }

  function findTextValue(label){
    const candidates=[...document.querySelectorAll('#home *')];
    const key=label.toLocaleLowerCase('tr');
    const hit=candidates.find(el=>{
      const t=(el.textContent||'').trim().toLocaleLowerCase('tr');
      return t===key || t.startsWith(key+' ');
    });
    if(!hit) return null;
    const box=hit.parentElement;
    if(!box) return null;
    const b=box.querySelector('b,strong');
    return b?.textContent?.trim()||null;
  }

  function syncDemo(){
    const legacy=[...document.querySelectorAll('#home .home-money-grid b')];
    const cash=document.getElementById('eotCash');
    const worth=document.getElementById('eotWorth');
    const flow=document.getElementById('eotFlow');
    if(cash&&legacy[0]) cash.textContent=legacy[0].textContent;
    if(worth&&legacy[1]) worth.textContent=legacy[1].textContent;
    if(flow&&legacy[2]) flow.textContent=legacy[2].textContent;
    const srcLevel=document.getElementById('homeLevel');
    const level=document.getElementById('eotLevel');
    if(level&&srcLevel) level.textContent=srcLevel.textContent||'1';
    const credit=findTextValue('KREDİ PUANI');
    const reputation=findTextValue('İTİBAR');
    if(credit&&document.getElementById('eotCredit')) document.getElementById('eotCredit').textContent=credit;
    if(reputation&&document.getElementById('eotRep')) document.getElementById('eotRep').textContent=reputation;
  }

  function buildDemoUI(){
    const home=document.getElementById('home');
    const topbar=document.querySelector('.topbar');
    if(!home || home.dataset.eotExact==='1') return;
    home.dataset.eotExact='1';

    const targets={
      home:'#home',
      companies:hrefFor(['şirket','firma']),
      investments:hrefFor(['yatırım','borsa','kripto']),
      bank:hrefFor(['banka','kredi']),
      market:hrefFor(['fırsat','pazar']),
      land:hrefFor(['arsa','şehir']),
      property:hrefFor(['gayrimenkul','emlak','konut']),
      vehicle:hrefFor(['araç','galeri','otomobil']),
      construction:hrefFor(['inşaat']),
      profile:hrefFor(['profil','hesap']),
      assets:hrefFor(['varlık','portföy'],hrefFor(['şirket']))
    };

    if(topbar){
      topbar.innerHTML=`<div class="eot-app-logo"></div><div class="eot-brand"><b>EMPIRE OF TRADE</b><small>BUSINESS EMPIRE</small></div><a class="eot-top-action" href="${targets.profile}">✉️<span class="eot-badge">2</span></a>`;
    }

    [...home.children].forEach(el=>el.classList.add('eot-home-legacy'));

    const dash=document.createElement('div');
    dash.className='eot-ui-dashboard';
    dash.innerHTML=`
      <section class="eot-wallet">
        <div class="eot-wallet-card"><span><i class="eot-dot"></i>NAKİT</span><b id="eotCash">₺0</b></div>
        <div class="eot-wallet-card"><span><i class="eot-dot"></i>NET SERVET</span><b id="eotWorth">₺0</b></div>
        <div class="eot-wallet-card"><span><i class="eot-dot"></i>AYLIK AKIŞ</span><b id="eotFlow">₺0</b></div>
      </section>
      <div class="eot-account-alert"><span>Hesabın aktif • Kariyerin bu cihazda güvende.</span><a href="${targets.profile}">HESAP</a></div>
      <section class="eot-profile">
        <div class="eot-profile-main"><div class="eot-avatar">👤</div><div class="eot-identity"><small>OYUNCU PROFİLİ</small><h2>Ekonomi İmparatorluğu</h2><p>CEO • Empire of Trade</p></div><div class="eot-tier"><span>SEVİYE</span><b id="eotLevel">0</b></div></div>
        <div class="eot-progress-label"><span>Kariyer ilerlemesi</span><span>18 / 100 XP</span></div><div class="eot-progress"><i></i></div>
        <div class="eot-profile-stats"><div><span>ŞİRKET DEĞERİ</span><b>₺0</b></div><div><span>KREDİ PUANI</span><b id="eotCredit">50</b></div><div><span>İTİBAR</span><b id="eotRep">50</b></div></div>
      </section>
      <div class="eot-section-head"><div><h3>İş Dünyam</h3><p>Sahip olduğun işletmeler ve varlıklar</p></div><a href="${targets.assets}">TÜMÜNÜ GÖR</a></div>
      <section class="eot-business-grid">
        <a class="eot-business" href="${targets.companies}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🏪</span><b>Mağazalar</b><small>Perakende</small></a>
        <a class="eot-business" href="${targets.companies}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🏭</span><b>Fabrikalar</b><small>Üretim</small></a>
        <a class="eot-business" href="${targets.construction}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🏗️</span><b>İnşaat</b><small>Projeler</small></a>
        <a class="eot-business" href="${targets.vehicle}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🚘</span><b>Galeri</b><small>Araç ticareti</small></a>
        <a class="eot-business" href="${targets.property}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🏢</span><b>Gayrimenkul</b><small>Mülkler</small></a>
        <a class="eot-business" href="${targets.land}"><span class="eot-count">0 ADET</span><span class="eot-biz-icon">🗺️</span><b>Arsalar</b><small>Türkiye</small></a>
      </section>
      <div class="eot-section-head"><div><h3>Hızlı İşlemler</h3><p>En çok kullanılan yönetim alanları</p></div></div>
      <section class="eot-quick-grid">
        <a class="eot-quick" href="${targets.investments}"><span class="eot-qicon">📈</span><span><b>Yatırım Merkezi</b><small>Borsa • Kripto • Altın</small></span><strong>→</strong></a>
        <a class="eot-quick" href="${targets.bank}"><span class="eot-qicon">💳</span><span><b>Banka & Kredi</b><small>Kredi • Borç • Skor</small></span><strong>→</strong></a>
        <a class="eot-quick" href="${targets.market}"><span class="eot-qicon">🛒</span><span><b>Fırsat Pazarı</b><small>Günlük fırsatlar</small></span><strong>→</strong></a>
        <a class="eot-quick" href="${targets.companies}"><span class="eot-qicon">🏛️</span><span><b>Devlet İhaleleri</b><small>Yeni iş fırsatları</small></span><strong>→</strong></a>
      </section>
      <div class="eot-section-head"><div><h3>Piyasa Özeti</h3><p>Örnek canlı piyasa görünümü</p></div><a href="${targets.investments}">DETAY</a></div>
      <section class="eot-market-card"><div class="eot-market-top"><b>Bugünün Piyasası</b><span>● PİYASA AÇIK</span></div><div class="eot-market-row"><div><b>BIST 100</b><small>Türkiye</small></div><span class="eot-price">10.842</span><span class="eot-gain">+1,24%</span></div><div class="eot-market-row"><div><b>Gram Altın</b><small>₺ / gram</small></div><span class="eot-price">₺4.281</span><span class="eot-gain">+0,48%</span></div><div class="eot-market-row"><div><b>Bitcoin</b><small>BTC / USD</small></div><span class="eot-price">$116.420</span><span class="eot-loss">-0,31%</span></div></section>`;
    home.prepend(dash);

    if(!document.querySelector('.eot-bottom-nav')){
      const nav=document.createElement('nav');
      nav.className='eot-bottom-nav';
      nav.innerHTML=`<a class="eot-nav-item active" href="#home"><span>⌂</span>Ana Sayfa</a><a class="eot-nav-item" href="${targets.companies}"><span>▥</span>Şirketler</a><a class="eot-nav-item center" href="${targets.market}"><span>▦</span></a><a class="eot-nav-item" href="${targets.bank}"><span>₺</span>Finans</a><a class="eot-nav-item" href="${targets.profile}"><span>♙</span>Profil</a>`;
      document.body.appendChild(nav);
    }
    syncDemo();
    setInterval(syncDemo,600);
  }

  try{
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v='+APP_VERSION,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    applyBranding();
    buildDemoUI();
    const load=(src,next)=>{const s=document.createElement('script');s.src=src+'?v='+APP_VERSION;s.onload=()=>{applyBranding();buildDemoUI();syncDemo();next&&next()};document.body.appendChild(s)};
    load('app.js',()=>load('v167.js',()=>load('realtime-finance.js',()=>load('state-integrity.js',()=>load('company-list-fix.js',()=>load('demo-balance-grant.js',()=>load('v169.js',()=>load('loan-management.js'))))))));
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Empire of Trade yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
