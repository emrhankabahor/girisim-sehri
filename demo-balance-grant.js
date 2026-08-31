/* Empire of Trade • Tek seferlik ₺500.000.000 demo test bakiyesi */
(function(){
  try{
    /* Yeni kariyer: demo bakiye hibesi kapali. */
    return;
    const u=(typeof currentAccount==='function')?currentAccount():null;
    const id=u&&u.id?String(u.id):'guest';
    const key='gs_demo_balance_500m_v1_'+id;
    if(localStorage.getItem(key)==='1')return;
    if(typeof cash==='undefined')return;

    cash=500000000;
    localStorage.setItem(key,'1');
    localStorage.setItem('gs124_cash',String(cash));

    if(typeof tx!=='undefined'&&Array.isArray(tx)){
      tx.unshift({t:Date.now(),kind:'demo_grant',type:'demo_balance',sym:'Demo test bakiyesi',total:500000000});
      tx=tx.slice(0,100);
    }
    if(typeof save==='function')save();
    if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id);
    if(typeof render==='function')render();
    if(typeof renderFinanceExtras==='function')renderFinanceExtras();
    if(typeof renderGameExtras==='function')renderGameExtras();
    if(typeof toast==='function')toast('Demo test bakiyesi • ₺500.000.000');
  }catch(e){
    console.warn('Demo bakiye yüklenemedi:',e);
  }
})();

/* Kayıtlı oturumun kendi kendine Şirketini Kur ekranına düşmesini engelleyen güncel akış. */
(function(){
  if(window.__eotCompanyOnboardingLoaded||document.querySelector('script[data-eot-company-onboarding]'))return;
  const s=document.createElement('script');
  s.src='company-onboarding.js?v=4';
  s.dataset.eotCompanyOnboarding='1';
  s.async=false;
  document.body.appendChild(s);
})();

/* Profil: Karakter ve Yeni Oyun alanlarını kaldır. */
(function(){
  if(window.__eotProfileUiCleanup||document.querySelector('script[data-eot-profile-ui-cleanup]'))return;
  const s=document.createElement('script');
  s.src='profile-ui-cleanup.js?v=2';
  s.dataset.eotProfileUiCleanup='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Giriş ekranından Ana Sayfa'ya geçerken eski ekran flaşını engelle. */
(function(){
  if(document.querySelector('script[data-eot-home-entry-guard]'))return;
  const s=document.createElement('script');
  s.src='home-entry-guard.js?v=1';
  s.dataset.eotHomeEntryGuard='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Ana Sayfa üst Nakit / Net Servet / Aylık Akış kartlarını doğrudan state'ten anlık senkronla. */
(function(){
  if(document.querySelector('script[data-eot-home-wallet-live-sync]'))return;
  const s=document.createElement('script');
  s.src='home-wallet-live-sync.js?v=2';
  s.dataset.eotHomeWalletLiveSync='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Gayrimenkul kira bekleme kutularında bir sonraki kiraya canlı geri sayım. */
(function(){
  if(document.querySelector('script[data-eot-property-rent-countdown]'))return;
  const s=document.createElement('script');
  s.src='property-rent-countdown.js?v=3';
  s.dataset.eotPropertyRentCountdown='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* business-hierarchy.js tek sahipli olarak bottom-nav-lock.js tarafından yüklenir. */

/* Vadeli hesap: ilk yatırma saatine bağlı günlük döngü + maksimum 4 gün offline faiz. */
(function(){
  if(document.querySelector('script[data-eot-deposit-cycle-engine]'))return;
  const s=document.createElement('script');
  s.src='deposit-cycle-engine.js?v=2';
  s.dataset.eotDepositCycleEngine='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Vadeli hesap bakiye ve arayüz özet senkronu. */
(function(){
  if(document.querySelector('script[data-eot-deposit-balance-sync]'))return;
  const s=document.createElement('script');
  s.src='deposit-balance-sync.js?v=3';
  s.dataset.eotDepositBalanceSync='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Araç pazarı birleşim modülü demo bakiye daha önce verilmiş olsa da her oturumda yüklenir. */
(function(){
  if(document.querySelector('script[data-eot-vehicle-market-merge]'))return;
  const s=document.createElement('script');
  s.src='vehicle-market-merge.js?v=4';
  s.dataset.eotVehicleMarketMerge='1';
  s.async=true;
  document.body.appendChild(s);
})();

/* Finans'a girildiğinde Borsa, Kripto ve Altın toplamları önceden hazırlanır. */
(function(){
  if(document.querySelector('script[data-eot-investment-initial-total]'))return;
  const s=document.createElement('script');
  s.src='investment-initial-total-fix.js?v=4';
  s.dataset.eotInvestmentInitialTotal='1';
  s.async=true;
  document.body.appendChild(s);
})();
