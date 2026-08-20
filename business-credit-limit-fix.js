/* Empire of Trade • Ticari kredi aktif kredi sınırı düzeltmesi */
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

  function install(){
    if(typeof window.takeBusinessCredit!=='function'||window.takeBusinessCredit.__eotActiveLimitFixed)return false;
    var original=window.takeBusinessCredit;
    var wrapped=function(){
      if(activeLoanCount()>=2){
        if(typeof toast==='function')toast('Aynı anda en fazla 2 aktif kredi kullanabilirsin.');
        return false;
      }
      return original.apply(this,arguments);
    };
    wrapped.__eotActiveLimitFixed=true;
    wrapped.__eotOriginal=original;
    window.takeBusinessCredit=wrapped;
    return true;
  }

  if(!install()){
    var tries=0,timer=setInterval(function(){
      tries++;
      if(install()||tries>=40)clearInterval(timer);
    },50);
  }
})();
