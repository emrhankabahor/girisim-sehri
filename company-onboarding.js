/* Empire of Trade • Yeni oyun şirket kuruluş akışı */
(function(){
  'use strict';
  if(window.__eotCompanyOnboardingLoaded)return;
  window.__eotCompanyOnboardingLoaded=true;

  const TITLES=['Anonim Şirketi (A.Ş.)','Limited Şirketi (Ltd. Şti.)','Şahıs Şirketi','Holding A.Ş.'];
  const CITIES=['Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'];
  const DISTRICTS={
    'İstanbul':['Kadıköy','Beşiktaş','Şişli','Üsküdar','Ataşehir','Bakırköy','Beyoğlu','Fatih','Sarıyer','Başakşehir','Pendik','Kartal','Maltepe','Beylikdüzü','Avcılar','Esenyurt','Ümraniye'],
    'Ankara':['Çankaya','Keçiören','Yenimahalle','Mamak','Etimesgut','Sincan','Gölbaşı','Pursaklar'],
    'İzmir':['Konak','Bornova','Karşıyaka','Bayraklı','Buca','Gaziemir','Çiğli','Balçova','Narlıdere','Urla'],
    'Kocaeli':['İzmit','Gebze','Darıca','Çayırova','Kartepe','Başiskele','Gölcük','Körfez','Derince'],
    'Bursa':['Osmangazi','Nilüfer','Yıldırım','Mudanya','Gemlik','İnegöl'],
    'Antalya':['Muratpaşa','Konyaaltı','Kepez','Alanya','Manavgat','Serik','Kemer'],
    'Adana':['Seyhan','Çukurova','Yüreğir','Sarıçam','Ceyhan'],
    'Mersin':['Akdeniz','Mezitli','Yenişehir','Toroslar','Tarsus','Erdemli'],
    'Gaziantep':['Şahinbey','Şehitkamil','Nizip'],
    'Konya':['Selçuklu','Meram','Karatay'],
    'Samsun':['Atakum','İlkadım','Canik','Tekkeköy'],
    'Trabzon':['Ortahisar','Akçaabat','Yomra'],
    'Kayseri':['Melikgazi','Kocasinan','Talas'],
    'Eskişehir':['Odunpazarı','Tepebaşı'],
    'Muğla':['Bodrum','Fethiye','Marmaris','Menteşe','Milas'],
    'Tekirdağ':['Süleymanpaşa','Çorlu','Çerkezköy'],
    'Sakarya':['Adapazarı','Serdivan','Erenler'],
    'Hatay':['Antakya','İskenderun','Defne'],
    'Diyarbakır':['Bağlar','Kayapınar','Sur','Yenişehir'],
    'Şanlıurfa':['Haliliye','Karaköprü','Eyyübiye']
  };

  function currentId(){try{const u=typeof currentAccount==='function'?currentAccount():null;return u&&u.id?String(u.id):'guest'}catch(e){return 'guest'}}
  function setupKey(){return 'eot_company_setup_'+currentId()}
  function hasCompany(){try{return !!(sim&&sim.companyProfile&&sim.companyProfile.established&&String(sim.companyProfile.name||'').trim())}catch(e){return false}}
  function persist(){try{if(typeof simSave==='function')simSave();if(typeof save==='function')save();if(typeof saveOwned==='function')saveOwned();const id=currentId();if(id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(id)}catch(e){console.warn('Şirket kuruluş kaydı:',e)}}

  function ensureStyle(){
    if(document.getElementById('eot-company-onboarding-style'))return;
    const s=document.createElement('style');s.id='eot-company-onboarding-style';s.textContent=`
      .eot-company-setup{position:fixed;inset:0;z-index:2147483600;display:none;overflow:auto;-webkit-overflow-scrolling:touch;background:radial-gradient(circle at 50% 15%,rgba(39,111,173,.34),transparent 38%),linear-gradient(180deg,#081522,#06111c);padding:max(28px,env(safe-area-inset-top)) 18px max(30px,env(safe-area-inset-bottom));font-family:inherit;color:#f6fbff}
      .eot-company-setup.show{display:flex;flex-direction:column;align-items:center;justify-content:center}
      .eot-setup-brand{display:flex;flex-direction:column;align-items:center;margin:8px 0 24px}.eot-setup-logo{width:86px;height:86px;border-radius:22px;background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;box-shadow:0 12px 35px rgba(0,0,0,.35)}.eot-setup-brand b{font-size:24px;letter-spacing:.08em;margin-top:12px}.eot-setup-brand small{color:#5bd9ee;letter-spacing:.28em;font-size:9px;margin-top:4px}
      .eot-setup-card{width:min(100%,560px);background:linear-gradient(180deg,#102842,#0b1d31);border:1px solid rgba(132,182,226,.25);border-radius:30px;padding:26px 22px 24px;box-shadow:0 24px 70px rgba(0,0,0,.42)}
      .eot-setup-card h1{font-size:28px;text-align:center;margin:0 0 8px}.eot-setup-card>p{text-align:center;color:#96abc1;font-size:13px;line-height:1.5;margin:0 0 24px}.eot-field{margin:15px 0}.eot-field label{display:block;font-weight:800;font-size:13px;margin:0 0 8px;color:#eaf5ff}.eot-field input,.eot-field select{width:100%;height:58px;border-radius:16px;border:1px solid rgba(130,175,216,.35);background:#0a1b2e;color:#fff;padding:0 16px;font-size:16px!important;font-weight:700;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}.eot-field input:focus,.eot-field select:focus{border-color:#49cbe8;box-shadow:0 0 0 3px rgba(73,203,232,.10)}
      .eot-setup-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.eot-company-submit{width:100%;height:58px;margin-top:20px;border:0;border-radius:17px;background:linear-gradient(135deg,#29c66f,#5fd45d);color:#fff;font-size:18px;font-weight:900;box-shadow:0 10px 28px rgba(38,198,105,.25)}.eot-setup-error{min-height:20px;margin-top:10px;text-align:center;color:#ff9baa;font-size:12px;font-weight:700}.eot-setup-note{text-align:center;color:#7890aa;font-size:10px;margin-top:14px;line-height:1.5}
      .eot-new-game-card{margin:18px 0;padding:18px;border:1px solid rgba(244,114,182,.18);border-radius:20px;background:rgba(41,19,36,.35)}.eot-new-game-card h3{margin:0 0 5px}.eot-new-game-card p{margin:0 0 13px;color:#9dafc2;font-size:12px;line-height:1.45}.eot-new-game-btn{width:100%;min-height:48px;border:1px solid rgba(255,127,159,.28);border-radius:14px;background:rgba(145,43,73,.24);color:#ffb2c3;font-weight:850}
      @media(max-width:430px){.eot-company-setup.show{justify-content:flex-start}.eot-setup-brand{margin-top:12px;margin-bottom:18px}.eot-setup-logo{width:72px;height:72px;border-radius:19px}.eot-setup-brand b{font-size:20px}.eot-setup-card{padding:22px 18px;border-radius:25px}.eot-setup-card h1{font-size:24px}.eot-setup-grid{grid-template-columns:1fr}.eot-field input,.eot-field select{height:54px}}
    `;document.head.appendChild(s);
  }

  function districtsFor(city){return DISTRICTS[city]||['Merkez']}
  function buildOverlay(){
    if(document.getElementById('eotCompanySetup'))return;
    ensureStyle();
    const ov=document.createElement('div');ov.id='eotCompanySetup';ov.className='eot-company-setup';ov.innerHTML=`
      <div class="eot-setup-brand"><div class="eot-setup-logo"></div><b>EMPIRE OF TRADE</b><small>BUSINESS EMPIRE</small></div>
      <section class="eot-setup-card">
        <h1>Şirketini Kur</h1><p>Ticaret yolculuğuna başlamadan önce ana şirketinin kimliğini oluştur.</p>
        <div class="eot-field"><label>Şirket Adı</label><input id="eotCompanyName" maxlength="32" placeholder="Örn. Atlas Ticaret" autocomplete="organization"></div>
        <div class="eot-field"><label>Şirket Ünvanı</label><select id="eotCompanyTitle">${TITLES.map(x=>`<option>${x}</option>`).join('')}</select></div>
        <div class="eot-setup-grid"><div class="eot-field"><label>Şirket Merkezi • İl</label><select id="eotCompanyCity">${CITIES.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="eot-field"><label>İlçe</label><select id="eotCompanyDistrict"></select></div></div>
        <div id="eotCompanySetupError" class="eot-setup-error"></div>
        <button class="eot-company-submit" id="eotCompanySubmit">Şirketini Kur</button>
        <div class="eot-setup-note">Bu bilgiler kariyerine kaydedilir ve şirket profilinde kullanılır.</div>
      </section>`;
    document.body.appendChild(ov);
    const city=ov.querySelector('#eotCompanyCity'),district=ov.querySelector('#eotCompanyDistrict');
    function fill(){district.innerHTML=districtsFor(city.value).map(x=>`<option>${x}</option>`).join('')}
    city.value='İstanbul';fill();city.addEventListener('change',fill);
    ov.querySelector('#eotCompanySubmit').addEventListener('click',createCompany);
  }

  function showSetup(force){buildOverlay();if(!force&&(hasCompany()||localStorage.getItem(setupKey())==='1'))return false;document.getElementById('eotCompanySetup').classList.add('show');document.body.style.overflow='hidden';return true}
  function hideSetup(){const ov=document.getElementById('eotCompanySetup');if(ov)ov.classList.remove('show');document.body.style.overflow=''}

  function createCompany(){
    const name=String(document.getElementById('eotCompanyName')?.value||'').trim(),title=document.getElementById('eotCompanyTitle')?.value||TITLES[0],city=document.getElementById('eotCompanyCity')?.value||'İstanbul',district=document.getElementById('eotCompanyDistrict')?.value||'Merkez',err=document.getElementById('eotCompanySetupError');
    if(name.length<3){if(err)err.textContent='Şirket adı en az 3 karakter olmalı.';return}
    if(name.length>32){if(err)err.textContent='Şirket adı çok uzun.';return}
    try{
      if(typeof sim==='undefined'||!sim)throw new Error('Oyun verisi hazır değil');
      const id='company_main_'+Date.now();
      const company={id,established:true,name,legalType:title,sector:'Genel Ticaret',city,district,headquarters:{country:'Türkiye',city,district},capital:0,companyCash:0,brand:0,employees:[],monthlyHistory:[],currentMonth:{revenue:0,expense:0,tax:0},raw:0,establishedAt:Date.now(),isMainCompany:true};
      if(!Array.isArray(sim.companies))sim.companies=[];
      sim.companies=sim.companies.filter(c=>!c?.isMainCompany);
      sim.companies.unshift(company);sim.selectedCompanyId=id;sim.companyName=name;sim.companyProfile={...(sim.companyProfile||{}),...company};
      localStorage.setItem(setupKey(),'1');persist();
      try{if(typeof render==='function')render();if(typeof renderGameExtras==='function')renderGameExtras();if(typeof renderCompanyPortfolio==='function')renderCompanyPortfolio()}catch(e){}
      const hero=document.querySelector('.eot-identity p');if(hero)hero.textContent='CEO • '+name;
      hideSetup();location.hash='home';window.scrollTo(0,0);
      if(typeof toast==='function')toast(name+' kuruldu • '+district+', '+city);
    }catch(e){if(err)err.textContent='Şirket kurulamadı. Oyunu kapatıp yeniden açmayı dene.';console.warn(e)}
  }

  function startNewGame(){
    if(!confirm('Yeni oyun başlatmak mevcut kariyerini sıfırlar. Devam etmek istiyor musun?'))return;
    if(!confirm('Bu işlem nakit, varlıklar, krediler, şirketler ve yatırımları sıfırlayacak. Emin misin?'))return;
    try{
      const id=currentId();
      if(typeof freshCareerState!=='function'||typeof applyCareerState!=='function')throw new Error('Yeni oyun sistemi hazır değil');
      const fresh=freshCareerState();applyCareerState(fresh);
      localStorage.removeItem(setupKey());
      if(id!=='guest')localStorage.setItem('gs_account_career_'+id,JSON.stringify(fresh));
      localStorage.setItem('gs140_state',JSON.stringify(fresh));
      persist();
      try{if(typeof render==='function')render();if(typeof renderFinanceExtras==='function')renderFinanceExtras();if(typeof renderGameExtras==='function')renderGameExtras()}catch(e){}
      showSetup(true);
    }catch(e){console.warn('Yeni oyun başlatılamadı:',e);if(typeof toast==='function')toast('Yeni oyun başlatılamadı')}
  }

  function mountNewGameButton(){
    const p=document.getElementById('profile');if(!p||document.getElementById('eotNewGameCard'))return;
    const card=document.createElement('section');card.id='eotNewGameCard';card.className='eot-new-game-card';card.innerHTML='<h3>Yeni Oyun</h3><p>Kariyerini sıfırdan başlatır ve şirket kuruluş ekranını yeniden açar.</p><button class="eot-new-game-btn">Yeni Oyun Başlat</button>';
    card.querySelector('button').addEventListener('click',startNewGame);p.appendChild(card);
  }

  function hookAccountEntry(){
    try{
      if(typeof window.enterGameAfterAccount==='function'&&!window.enterGameAfterAccount.__eotCompanySetup){const original=window.enterGameAfterAccount;const wrapped=function(isNew){const r=original.apply(this,arguments);setTimeout(()=>{if(isNew)showSetup(true);else if(!hasCompany())showSetup(false)},120);return r};wrapped.__eotCompanySetup=true;window.enterGameAfterAccount=wrapped}
    }catch(e){}
  }

  function init(){buildOverlay();hookAccountEntry();mountNewGameButton();setTimeout(()=>{try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id&&!hasCompany()&&localStorage.getItem(setupKey())!=='1')showSetup(false)}catch(e){}},500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.addEventListener('hashchange',()=>{mountNewGameButton();hookAccountEntry()});
  window.eotStartNewGame=startNewGame;
})();
