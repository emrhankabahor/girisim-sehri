/* Empire of Trade • Şirket kuruluş ekranından mevcut hesaba giriş */
(function(){
  'use strict';
  if(window.__eotCompanyLoginEntryLoaded)return;
  window.__eotCompanyLoginEntryLoaded=true;

  function ensureStyle(){
    if(document.getElementById('eot-company-login-entry-style'))return;
    const s=document.createElement('style');
    s.id='eot-company-login-entry-style';
    s.textContent=`
      .eot-existing-account-wrap{width:min(100%,560px);margin-top:16px;text-align:center}
      .eot-existing-account-btn{width:100%;min-height:54px;border:1px solid rgba(97,180,255,.34);border-radius:17px;background:linear-gradient(135deg,#1f6fc4,#2b8fe4);color:#fff;font-size:16px;font-weight:900;box-shadow:0 10px 24px rgba(24,105,184,.22)}
      .eot-existing-account-note{margin-top:8px;color:#8ea5bc;font-size:11px;line-height:1.45}
    `;
    document.head.appendChild(s);
  }

  function openExistingAccount(){
    const setup=document.getElementById('eotCompanySetup');
    if(setup)setup.classList.remove('show');
    document.body.style.overflow='';
    try{
      if(typeof setAccountMode==='function')setAccountMode('login');
      if(typeof showAccountOverlay==='function')showAccountOverlay();
      else{
        const ov=document.getElementById('accountOverlay');
        if(ov){ov.classList.remove('hidden');ov.style.display='';ov.setAttribute('aria-hidden','false')}
      }
      const email=document.getElementById('accountEmail');
      if(email)setTimeout(()=>email.focus(),80);
    }catch(e){console.warn('Mevcut hesap giriş ekranı açılamadı:',e)}
  }

  function mount(){
    ensureStyle();
    const setup=document.getElementById('eotCompanySetup');
    if(!setup)return false;
    if(document.getElementById('eotExistingAccountWrap'))return true;
    const card=setup.querySelector('.eot-setup-card');
    if(!card)return false;
    const wrap=document.createElement('div');
    wrap.id='eotExistingAccountWrap';
    wrap.className='eot-existing-account-wrap';
    wrap.innerHTML='<button type="button" class="eot-existing-account-btn" id="eotExistingAccountBtn">Mevcut Hesap ile Giriş Yap</button><div class="eot-existing-account-note">E-posta hesabınla veya Apple ile giriş ekranına dön.</div>';
    card.insertAdjacentElement('afterend',wrap);
    wrap.querySelector('#eotExistingAccountBtn').addEventListener('click',openExistingAccount);
    return true;
  }

  let tries=0;
  const timer=setInterval(()=>{tries++;if(mount()||tries>80)clearInterval(timer)},125);
  window.addEventListener('pageshow',()=>setTimeout(mount,100));
})();
