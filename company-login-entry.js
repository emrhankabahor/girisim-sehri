/* Empire of Trade • Şirket kuruluş ekranındaki tekrar eden mevcut hesap giriş alanını temizle */
(function(){
  'use strict';
  if(window.__eotCompanyLoginEntryLoaded)return;
  window.__eotCompanyLoginEntryLoaded=true;

  function removeDuplicateEntry(){
    const duplicate=document.getElementById('eotExistingAccountWrap');
    if(duplicate)duplicate.remove();
  }

  removeDuplicateEntry();

  const observer=new MutationObserver(removeDuplicateEntry);
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('pageshow',removeDuplicateEntry);
})();
