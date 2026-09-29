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
function ensureStyle(){
  if(document.getElementById('eot-company-onboarding-style'))return;
  const s=document.createElement('style');
  s.id='eot-company-onboarding-style';
  s.textContent=`
  .eot-company-setup{position:fixed;inset:0;z-index:2147483600;display:none;overflow:auto;background:
    radial-gradient(circle at 50% 10%,rgba(68,137,190,.18),transparent 28%),
    linear-gradient(180deg,#071521 0%,#08131f 52%,#07111b 100%);
    padding:max(24px,env(safe-area-inset-top)) 18px max(28px,env(safe-area-inset-bottom));font-family:inherit;color:#f7fbff}
  .eot-company-setup.show{display:flex;flex-direction:column;align-items:center;justify-content:flex-start}
  .eot-setup-shell{width:min(100%,560px);margin:auto 0;display:flex;flex-direction:column;align-items:center}
  .eot-setup-brand{text-align:center;margin:8px 0 22px}
  .eot-setup-logo{width:94px;height:94px;margin:auto;border-radius:25px;background:url('./assets/logo-v221-192.png') center/cover no-repeat;box-shadow:0 12px 34px rgba(0,0,0,.38),0 0 30px rgba(46,144,255,.2)}
  .eot-setup-brand b{display:block;font-size:25px;letter-spacing:.08em;margin-top:14px}
  .eot-setup-brand small{display:block;color:#63d8ee;letter-spacing:.30em;font-size:9px;font-weight:900;margin-top:5px}
  .eot-setup-card{width:100%;background:linear-gradient(180deg,rgba(14,35,59,.98),rgba(8,25,43,.98));border:1px solid rgba(139,188,232,.30);border-radius:31px;padding:26px 22px 24px;box-shadow:0 20px 50px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.03)}
  .eot-setup-card h1{text-align:center;font-size:29px;margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid rgba(150,192,228,.15)}
  .eot-field{margin:15px 0}
  .eot-field label{display:block;font-weight:850;font-size:13px;margin:0 0 8px 3px}
  .eot-input-wrap{position:relative}
  .eot-field input,.eot-field select{width:100%;height:58px;border-radius:16px;border:1px solid rgba(145,190,230,.38);background:linear-gradient(180deg,#0b2035,#08192a);color:#fff;padding:0 16px;font-size:16px!important;font-weight:750;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
  .eot-field select{appearance:auto}
  #eotCompanySetup input{pointer-events:auto;touch-action:manipulation;-webkit-user-select:text;user-select:text;caret-color:#ffd34f}
  #eotCompanySetup input:focus{border-color:#7edcff;box-shadow:0 0 0 3px #43b9ed26}
  #eotCompanySetup input,#eotCompanySetup select{scroll-margin-block:24px}
  .eot-name-input{padding-right:68px!important}
  .eot-random-name{position:absolute;right:7px;top:7px;width:44px;height:44px;border:1px solid rgba(130,187,234,.25);border-radius:13px;background:linear-gradient(145deg,#2f7ed0,#1e5f9e);font-size:23px;display:grid;place-items:center;color:white;box-shadow:0 7px 18px rgba(0,0,0,.25)}
  .eot-terms{margin:15px 6px 2px;text-align:center;color:#b6c5d4;font-size:10px;line-height:1.4}
  .eot-terms span{text-decoration:underline;color:#e6eef6}
  .eot-company-submit,.eot-existing-login{width:100%;height:58px;border:0;border-radius:17px;color:#fff;font-size:17px;font-weight:900}
  .eot-company-submit{margin-top:18px;background:linear-gradient(135deg,#2bc768,#65d74f);box-shadow:0 10px 24px rgba(41,199,105,.22)}
  .eot-existing-login{margin-top:24px;background:linear-gradient(135deg,#176dc5,#3a94ea);box-shadow:0 12px 28px rgba(29,111,206,.22)}
  .eot-setup-error{min-height:18px;text-align:center;color:#ff9baa;font-size:12px;margin-top:5px}
  .eot-version{margin-top:18px;color:#7f93a6;font-size:10px;font-weight:800;align-self:flex-start;padding-left:2px}
  @media(max-width:430px){
    .eot-company-setup.show{justify-content:flex-start}
    .eot-setup-shell{margin:0}
    .eot-setup-logo{width:82px;height:82px}
    .eot-setup-brand b{font-size:22px}
    .eot-setup-card{padding:22px 18px}
    .eot-setup-card h1{font-size:27px}
    .eot-field input,.eot-field select{height:54px}
    .eot-random-name{width:40px;height:40px}
  }`;
  document.head.appendChild(s)
}
function randomCompanyName(){
  const base=RANDOM_NAMES[Math.floor(Math.random()*RANDOM_NAMES.length)];
  const suffix=Math.floor(10000+Math.random()*90000);
  return base+' #'+suffix
}
function buildOverlay(){
  if(document.getElementById('eotCompanySetup'))return;
  ensureStyle();
  const ov=document.createElement('div');
  ov.id='eotCompanySetup';
  ov.className='eot-company-setup';
  ov.innerHTML=`<div class="eot-setup-shell">
    <div class="eot-setup-brand"><img class="eot-setup-logo" src="./assets/logo-v221-192.png" width="96" height="96" alt="Empire of Trade"><b>EMPIRE OF TRADE</b><small>İMPARATORLUĞUN BURADA BAŞLIYOR</small></div>
    <section class="eot-setup-card">
      <h1>Şirketini Kur</h1>
      <div class="eot-field"><label for="eotCompanyName">Şirket Adı</label><div class="eot-input-wrap"><input class="eot-name-input" id="eotCompanyName" type="text" inputmode="text" enterkeyhint="next" autocomplete="organization" maxlength="32"><button type="button" class="eot-random-name" id="eotRandomCompanyName" aria-label="Rastgele şirket adı">🎲</button></div></div>
      <div class="eot-field"><label for="eotCompanyTitle">Şirket Ünvanı</label><select id="eotCompanyTitle">${TITLES.map(x=>`<option>${x}</option>`).join('')}</select></div>
      <div class="eot-field"><label for="eotCompanyCeo">Şirket CEO Adı</label><input id="eotCompanyCeo" type="text" inputmode="text" enterkeyhint="done" maxlength="40" autocomplete="name" placeholder="Adınız ve soyadınız"></div>
      <div class="eot-setup-location"><div class="eot-field"><label for="eotCompanyCountry">Ülke</label><select id="eotCompanyCountry"><option>Türkiye</option></select></div>
      <div class="eot-field"><label for="eotCompanyCity">Şehir</label><select id="eotCompanyCity">${CITIES.map(x=>`<option>${x}</option>`).join('')}</select></div></div>
      <div class="eot-terms">Kayıt olarak <span>Kullanıcı Sözleşmesi</span> ve <span>Gizlilik Sözleşmesi</span> kabul ediyorum.</div>
      <div id="eotCompanySetupError" class="eot-setup-error" role="status" aria-live="polite"></div>
      <button class="eot-company-submit" id="eotCompanySubmit">Şirketini Kur</button>
    </section>
    <button class="eot-existing-login" id="eotExistingLogin">Mevcut Hesaba Giriş Yap</button>
    <div class="eot-version">Empire of Trade • Yeni Kariyer</div>
  </div>`;
  document.body.appendChild(ov);
  enableSetupTextEntry(ov);
  ov.querySelector('#eotCompanyCity').value='İstanbul';
  ov.querySelector('#eotCompanyName').value=randomCompanyName();
  try{const u=typeof currentAccount==='function'?currentAccount():null;ov.querySelector('#eotCompanyCeo').value=String(u?.ceoName||'')}catch(e){}
  ov.querySelector('#eotRandomCompanyName').onclick=()=>{ov.querySelector('#eotCompanyName').value=randomCompanyName()};
  ov.querySelector('#eotCompanySubmit').onclick=createCompany;
  ov.querySelector('#eotExistingLogin').onclick=openExistingAccount;
}
// Focus inside the original tap gesture: iOS may not open its keyboard
// when focus is deferred until a timer or animation frame.
function enableSetupTextEntry(overlay){
  let touch=null;
  overlay.addEventListener('touchstart',event=>{
    const point=event.touches&&event.touches[0];
    touch=point?{x:point.clientX,y:point.clientY}:null;
  },{passive:true});
  overlay.addEventListener('touchend',event=>{
    const point=event.changedTouches&&event.changedTouches[0];
    const moved=!touch||!point||Math.hypot(point.clientX-touch.x,point.clientY-touch.y)>10;
    touch=null;
    const field=event.target;
    if(moved||!field||field.tagName!=='INPUT'||field.disabled||field.readOnly)return;
    field.focus();
  },{passive:true});
  overlay.addEventListener('touchcancel',()=>{touch=null},{passive:true});
}
function showSetup(force){buildOverlay();if(!force&&hasCompany())return false;document.getElementById('eotCompanySetup').classList.add('show');document.body.style.overflow='hidden';return true}
function hideSetup(){document.getElementById('eotCompanySetup')?.classList.remove('show');document.body.style.overflow=''}
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