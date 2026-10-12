/* Empire of Trade • Yeni oyun şirket kuruluş akışı */
(function(){'use strict';if(window.__eotCompanyOnboardingLoaded)return;window.__eotCompanyOnboardingLoaded=true;
const TITLES=['Anonim Şirketi (A.Ş.)','Limited Şirketi (Ltd. Şti.)','Holding A.Ş.','Yatırım Holding A.Ş.','Sanayi ve Ticaret A.Ş.','Dış Ticaret A.Ş.','Gayrimenkul Yatırım A.Ş.','Teknoloji A.Ş.','Enerji A.Ş.','İnşaat A.Ş.','Lojistik A.Ş.','Otomotiv A.Ş.'];
const RANDOM_NAMES=['Atlas Ticaret','Nova Trade','Kuzey Holding','Mavi Çizgi','Vektor Grup','Artemis Ticaret','Mira Global','Zenith İş','Lidera','Nexora'];
const CITIES=['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'];
function currentId(){try{const u=typeof currentAccount==='function'?currentAccount():null;return u&&u.id?String(u.id):'guest'}catch(e){return'guest'}}
function setupKey(){return'eot_company_setup_'+currentId()}
function pendingKey(){return'eot_company_setup_pending_'+currentId()}
function hasCompany(){try{return!!(sim&&((sim.companyProfile&&sim.companyProfile.established===true&&String(sim.companyProfile.name||'').trim())||(Array.isArray(sim.companies)&&sim.companies.some(c=>c&&c.isMainCompany&&c.established!==false&&String(c.name||'').trim()))))}catch(e){return false}}
function persist(){try{if(typeof simSave==='function')simSave();if(typeof save==='function')save();if(typeof saveOwned==='function')saveOwned();const id=currentId();if(id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(id)}catch(e){}}
function randomCompanyName(){
  const base=RANDOM_NAMES[Math.floor(Math.random()*RANDOM_NAMES.length)];
  const suffix=Math.floor(10000+Math.random()*90000);
  return base+' #'+suffix
}
function buildOverlay(){
  if(document.getElementById('eotCompanySetup'))return;
  const ov=document.createElement('div');
  ov.id='eotCompanySetup';
  ov.className='eot-company-setup';
  ov.innerHTML=`<main class="eot-setup-shell">
    <header class="eot-setup-brand"><img class="eot-setup-logo" src="./assets/logo-v221-512.png" width="64" height="64" alt="Empire of Trade"><div><b>EMPIRE OF TRADE</b><small>YENİ KARİYER</small></div></header>
    <form id="eotCompanyForm" class="eot-setup-card" aria-labelledby="eotSetupTitle" novalidate>
      <div class="eot-setup-heading"><span class="eot-setup-eyebrow">İLK ADIM</span><h1 id="eotSetupTitle">Şirketini kur<span>.</span></h1><p>Ticaret yolculuğuna kendi şirketinle başla.</p></div>
      <div class="eot-field"><label for="eotCompanyName">Şirket adı</label><div class="eot-input-wrap"><input id="eotCompanyName" name="companyName" type="text" inputmode="text" enterkeyhint="next" autocomplete="off" autocorrect="off" spellcheck="false" minlength="3" maxlength="32" required><button type="button" class="eot-random-name" id="eotRandomCompanyName" aria-label="Rastgele şirket adı">↻</button></div></div>
      <div class="eot-field"><label for="eotCompanyCeo">CEO adı soyadı</label><input id="eotCompanyCeo" name="ceoName" type="text" inputmode="text" enterkeyhint="done" autocomplete="name" minlength="2" maxlength="40" placeholder="Adınız ve soyadınız" required></div>
      <div class="eot-field"><label for="eotCompanyTitle">Şirket ünvanı</label><select id="eotCompanyTitle" name="companyTitle">${TITLES.map(x=>`<option>${x}</option>`).join('')}</select></div>
      <div class="eot-setup-location"><div class="eot-field"><label for="eotCompanyCountry">Ülke</label><select id="eotCompanyCountry" name="country"><option>Türkiye</option></select></div><div class="eot-field"><label for="eotCompanyCity">Şehir</label><select id="eotCompanyCity" name="city">${CITIES.map(x=>`<option>${x}</option>`).join('')}</select></div></div>
      <p class="eot-terms">Kayıt olarak <span>Kullanıcı Sözleşmesi</span> ve <span>Gizlilik Sözleşmesi</span> kabul ediyorum.</p>
      <div id="eotCompanySetupError" class="eot-setup-error" role="status" aria-live="polite"></div>
      <button type="submit" class="eot-company-submit" id="eotCompanySubmit">Şirketini Kur <span aria-hidden="true">→</span></button>
    </form>
    <button type="button" class="eot-existing-login" id="eotExistingLogin">Mevcut Hesaba Giriş Yap</button>
    <footer class="eot-version">Empire of Trade · v276</footer>
  </main>`;
  document.body.appendChild(ov);
  ov.querySelector('#eotCompanyCity').value='İstanbul';
  ov.querySelector('#eotCompanyName').value=randomCompanyName();
  try{const u=typeof currentAccount==='function'?currentAccount():null;ov.querySelector('#eotCompanyCeo').value=String(u?.ceoName||'')}catch(e){}
  ov.querySelector('#eotRandomCompanyName').onclick=()=>{ov.querySelector('#eotCompanyName').value=randomCompanyName()};
  // Only form submission is intercepted. Native taps, focus and selection pass through.
  ov.querySelector('#eotCompanyForm').addEventListener('submit',event=>{event.preventDefault();createCompany()});
  ov.querySelector('#eotExistingLogin').onclick=openExistingAccount;
}
function showSetup(force){
  buildOverlay();
  if(!force&&hasCompany())return false;
  document.getElementById('eotCompanySetup').classList.add('show');
  document.body.classList.add('eot-setting-up');
  document.documentElement?.classList.add('eot-company-surface');
  document.body.style.overflow='';
  return true;
}
function hideSetup(){
  document.getElementById('eotCompanySetup')?.classList.remove('show');
  document.body.classList.remove('eot-setting-up');
  document.documentElement?.classList.remove('eot-company-surface');
  document.body.style.overflow='';
}
function openExistingAccount(){
  const err=document.getElementById('eotCompanySetupError');
  if(typeof showAccountOverlay!=='function'||!document.getElementById('accountOverlay')){
    if(err)err.textContent='Giriş ekranı hazırlanıyor, lütfen tekrar dene.';
    return false;
  }
  if(typeof setAccountMode==='function')setAccountMode('login');
  // The login overlay lives under app-root; reveal it before hiding setup.
  if(typeof window.EOTReleaseCompanyBootGate==='function')window.EOTReleaseCompanyBootGate();
  showAccountOverlay();hideSetup();return true;
}
function createCompany(){
  const err=document.getElementById('eotCompanySetupError');
  if(typeof sim==='undefined'){if(err)err.textContent='Oyun hazırlanıyor, lütfen birkaç saniye bekle.';return false}
  // A stale/double tap must not replace the company that was just created.
  if(hasCompany()){hideSetup();return false}
  const name=String(document.getElementById('eotCompanyName')?.value||'').trim();
  const ceo=String(document.getElementById('eotCompanyCeo')?.value||'').trim();
  const title=document.getElementById('eotCompanyTitle')?.value||TITLES[0];
  const city=document.getElementById('eotCompanyCity')?.value||'İstanbul';
  if(name.length<3||name.length>32){if(err)err.textContent='Şirket adı 3–32 karakter olmalı.';return false}
  if(ceo.length<2||ceo.length>40){if(err)err.textContent='CEO adı 2–40 karakter olmalı.';return false}
  if(!TITLES.includes(title)||!CITIES.includes(city)){if(err)err.textContent='Geçerli bir şirket ünvanı ve şehir seç.';return false}
  try{
    const id='company_main_'+Date.now(),company={id,established:true,name,ceoName:ceo,legalType:title,sector:'Genel Ticaret',city,headquarters:{country:'Türkiye',city},capital:0,companyCash:0,brand:0,employees:[],monthlyHistory:[],currentMonth:{revenue:0,expense:0,tax:0},establishedAt:Date.now(),isMainCompany:true};
    if(!Array.isArray(sim.companies))sim.companies=[];
    sim.companies=sim.companies.filter(c=>!c?.isMainCompany);sim.companies.unshift(company);
    sim.selectedCompanyId=id;sim.companyName=name;sim.companyProfile={...(sim.companyProfile||{}),...company};
    localStorage.setItem(setupKey(),'1');localStorage.removeItem(pendingKey());
    // CEO is included in the first career save, including guest careers.
    persist();
    try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id){u.ceoName=ceo;localStorage.setItem('gs_current_account',JSON.stringify(u));const users=JSON.parse(localStorage.getItem('gs_accounts')||'[]');const hit=users.find(x=>x&&x.id===u.id);if(hit){hit.ceoName=ceo;localStorage.setItem('gs_accounts',JSON.stringify(users))}}}catch(e){}
    if(err)err.textContent='';
    try{if(typeof render==='function')render();if(typeof renderGameExtras==='function')renderGameExtras()}catch(e){}
    if(typeof window.EOTReleaseCompanyBootGate==='function')window.EOTReleaseCompanyBootGate();
    hideSetup();location.hash='home';window.scrollTo(0,0);
    if(typeof toast==='function')toast(name+' kuruldu • '+city);
    return true;
  }catch(e){if(err)err.textContent='Şirket kurulamadı.';return false}
}

function startNewGame(){if(!confirm('Yeni oyun başlatmak mevcut kariyerini sıfırlar. Devam etmek istiyor musun?'))return;if(!confirm('Bu işlem tüm kariyeri sıfırlayacak. Emin misin?'))return;try{const id=currentId(),fresh=freshCareerState();applyCareerState(fresh);localStorage.removeItem(setupKey());localStorage.setItem(pendingKey(),'1');if(id!=='guest')localStorage.setItem('gs_account_career_'+id,JSON.stringify(fresh));localStorage.setItem('gs140_state',JSON.stringify(fresh));persist();showSetup(true)}catch(e){if(typeof toast==='function')toast('Yeni oyun başlatılamadı')}}
function mountNewGameButton(){const p=document.getElementById('profile');if(!p||document.getElementById('eotNewGameCard'))return;const card=document.createElement('section');card.id='eotNewGameCard';card.className='eot-new-game-card';card.innerHTML='<h3>Yeni Oyun</h3><p>Kariyerini sıfırdan başlatır.</p><button class="eot-new-game-btn">Yeni Oyun Başlat</button>';card.querySelector('button').onclick=startNewGame;p.appendChild(card)}
function installNewAccountHook(){
  if(typeof window.enterGameAfterAccount!=='function'||window.enterGameAfterAccount.__eotCompanyPendingHook)return false;
  const original=window.enterGameAfterAccount;
  const wrapped=function(isNewAccount){
    const result=original.apply(this,arguments);
    if(isNewAccount===true||!hasCompany()){
      try{localStorage.setItem(pendingKey(),'1')}catch(e){}
      setTimeout(()=>showSetup(false),60);
    }
    return result;
  };
  wrapped.__eotCompanyPendingHook=true;
  wrapped.__eotOriginal=original;
  window.enterGameAfterAccount=wrapped;
  return true;
}
function startup(){
  buildOverlay();
  hideSetup();
  mountNewGameButton();
  installNewAccountHook();

  /* ANA ŞİRKET KAPISI:
     Ana şirket yoksa oyun ekranı açılamaz.
     State yüklenmesine kısa süre tanı, sonra kesin kontrol yap. */
  const enforceCompanyGate=()=>{
    try{
      if(typeof sim==='undefined')return;
      if(hasCompany()){
        localStorage.removeItem(pendingKey());
        hideSetup();
        return;
      }
      showSetup(true);
    }catch(e){
      showSetup(true);
    }
  };

  if(window.__EOT_NEEDS_COMPANY__===true){
    showSetup(true);
  }
  requestAnimationFrame(()=>setTimeout(enforceCompanyGate,120));
  setTimeout(enforceCompanyGate,450);
}
window.EOTCompanyOnboarding={show:()=>{localStorage.setItem(pendingKey(),'1');return showSetup(true)},refresh:()=>{installNewAccountHook();if(window.__EOT_NEEDS_COMPANY__===true||!hasCompany())return showSetup(true);hideSetup();return false},startNewGame};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startup,{once:true});else setTimeout(startup,0);
window.addEventListener('hashchange',()=>setTimeout(mountNewGameButton,100));
})();