/* Empire of Trade • Şirket kuruluş ekranındaki tekrar eden giriş alanını temizle + CEO entegrasyonu */
(function(){
  'use strict';
  if(window.__eotCompanyLoginEntryLoaded)return;
  window.__eotCompanyLoginEntryLoaded=true;

  function removeDuplicateEntry(){
    const duplicate=document.getElementById('eotExistingAccountWrap');
    if(duplicate)duplicate.remove();
  }

  function ensureCeoIntegration(){
    if(window.__eotCeoIdentityLoaded||document.querySelector('script[data-eot-ceo-identity]'))return;
    const s=document.createElement('script');
    s.src='ceo-identity.js?v=190';
    s.dataset.eotCeoIdentity='1';
    document.body.appendChild(s);
  }

  removeDuplicateEntry();
  ensureCeoIntegration();

  const observer=new MutationObserver(()=>{removeDuplicateEntry();ensureCeoIntegration()});
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('pageshow',()=>{removeDuplicateEntry();ensureCeoIntegration()});
})();
