/* Empire of Trade • Ticari kredi aktif kredi sınırı + buton durumu */
(function(){
  'use strict';
  if(window.__eotBusinessCreditLimitFix)return;
  window.__eotBusinessCreditLimitFix=true;

  function activeLoanCount(){
    try{
      if(typeof loans!=='undefined'&&Array.isArray(loans)){
        return loans.filter(function(l){return l&&!l.closed&&Number(l.remaining||0)>0}).length;
      }
    }catch(e){}
    try{
      var arr=JSON.parse(localStorage.getItem('gs110_loans')||'[]');
      return Array.isArray(arr)?arr.filter(function(l){return l&&!l.closed&&Number(l.remaining||0)>0}).length:0;
    }catch(e){return 0}
  }

  function ensureStyle(){
    if(document.getElementById('eot-business-credit-limit-style'))return;
    var s=document.createElement('style');
    s.id='eot-business-credit-limit-style';
    s.textContent='#business_credit [onclick*="takeBusinessCredit"].eot-credit-limit-disabled,#business_credit button.eot-credit-limit-disabled{opacity:.48!important;filter:saturate(.45)!important;cursor:not-allowed!important;box-shadow:none!important;transform:none!important}';
    document.head.appendChild(s);
  }

  function creditButton(){
    return document.querySelector('#business_credit [onclick*="takeBusinessCredit"],#business_credit button[onclick*="takeBusinessCredit"],[onclick*="takeBusinessCredit"]');
  }

  function showLimitWarning(){
    var message='Aynı anda en fazla 2 ticari kredi kullanılabilir.';
    if(typeof toast==='function'){toast(message);return;}
    var old=document.getElementById('eot-business-credit-limit-toast');
    if(old)old.remove();
    var box=document.createElement('div');
    box.id='eot-business-credit-limit-toast';
    box.textContent=message;
    box.style.cssText='position:fixed;left:50%;bottom:105px;transform:translateX(-50%);z-index:2147483646;max-width:calc(100% - 40px);padding:13px 18px;border:1px solid rgba(126,167,204,.24);border-radius:15px;background:#132a43;color:#f4f8fc;font-weight:700;font-size:14px;line-height:1.35;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.28)';
    document.body.appendChild(box);
    setTimeout(function(){if(box&&box.parentNode)box.remove()},2400);
  }

  function refreshButton(){
    ensureStyle();
    var btn=creditButton();
    if(!btn)return;
    var limited=activeLoanCount()>=2;
    btn.classList.toggle('eot-credit-limit-disabled',limited);
    /* Native disabled kullanmıyoruz: pasif görünürken dokunma olayını yakalayıp uyarı göstereceğiz. */
    if('disabled' in btn)btn.disabled=false;
    btn.setAttribute('aria-disabled',limited?'true':'false');
    if(limited)btn.setAttribute('tabindex','-1');else btn.removeAttribute('tabindex');
  }

  function install(){
    if(typeof window.takeBusinessCredit!=='function'||window.takeBusinessCredit.__eotActiveLimitFixed)return false;
    var original=window.takeBusinessCredit;
    var wrapped=function(){
      if(activeLoanCount()>=2){
        refreshButton();
        showLimitWarning();
        return false;
      }
      var result=original.apply(this,arguments);
      setTimeout(refreshButton,0);
      return result;
    };
    wrapped.__eotActiveLimitFixed=true;
    wrapped.__eotOriginal=original;
    window.takeBusinessCredit=wrapped;
    refreshButton();
    return true;
  }

  document.addEventListener('click',function(e){
    var btn=e.target&&e.target.closest?e.target.closest('#business_credit .eot-credit-limit-disabled'):null;
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    showLimitWarning();
  },true);

  if(!install()){
    var tries=0,timer=setInterval(function(){
      tries++;
      if(install()||tries>=40)clearInterval(timer);
    },50);
  }
  window.addEventListener('hashchange',function(){if(String(location.hash||'').includes('business_credit'))setTimeout(refreshButton,0)},true);
  window.addEventListener('pageshow',function(){setTimeout(refreshButton,0)});
  document.addEventListener('eot:route-rendered',function(){if(String(location.hash||'').includes('business_credit'))refreshButton()});
  window.eotRefreshBusinessCreditButton=refreshButton;
})();
