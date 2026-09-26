/* EOT_PART bootstrap.js-syncDemo */
function syncDemo(){
    if(!homeDashboardVisible())return;
    const legacy=[...document.querySelectorAll('#home .home-money-grid b')];
    const cash=document.getElementById('eotCash');
    const worth=document.getElementById('eotWorth');
    const flow=document.getElementById('eotFlow');
    if(cash&&legacy[0]) cash.textContent=legacy[0].textContent;
    if(worth&&legacy[1]) worth.textContent=legacy[1].textContent;
    if(flow&&legacy[2]) flow.textContent=legacy[2].textContent;
    const accountState=document.getElementById('eotAccountStateText');
    if(accountState){
      try{
        const u=(typeof currentAccount==='function')?currentAccount():null;
        accountState.textContent=u&&u.id&&u.id!=='guest'?'Hesabın aktif • Kariyerin bu cihazda güvende.':'Hesap bağlı değil • Kariyer yalnızca bu cihazda kayıtlı.';
      }catch(e){accountState.textContent='Kariyer bu cihazda kayıtlı.'}
    }
    const srcLevel=document.getElementById('homeLevel');
    const level=document.getElementById('eotLevel');
    if(level&&srcLevel) level.textContent=srcLevel.textContent||'1';
    const credit=findTextValue('KREDİ PUANI');
    const reputation=findTextValue('İTİBAR');
    if(credit&&document.getElementById('eotCredit')) document.getElementById('eotCredit').textContent=credit;
    if(reputation&&document.getElementById('eotRep')) document.getElementById('eotRep').textContent=reputation;
  }
/* EOT_END */
/* EOT_PART bootstrap.js-buildDemoUI */
function buildDemoUI(){
    const home=document.getElementById('home');
    const topbar=document.querySelector('.topbar');
    if(!home || home.dataset.eotExact==='1') { restoreOriginalBottomNav(); return; }
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
      <div class="eot-account-alert"><span id="eotAccountStateText">Kariyer bu cihazda kayıtlı.</span><a href="${targets.profile}">HESAP</a></div>
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
    restoreOriginalBottomNav();
    syncDemo();
    setInterval(syncDemo,1800);
  }
/* EOT_END */
