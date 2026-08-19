/* Empire of Trade • Kredi puanı görünüm senkronu */
(function(){
  'use strict';
  if(window.__eotCreditScoreSync)return;
  window.__eotCreditScoreSync=true;

  function score(){
    try{
      if(typeof creditScore!=='undefined'){
        var n=Number(creditScore);
        if(Number.isFinite(n))return Math.round(n);
      }
    }catch(e){}
    var ls=Number(localStorage.getItem('gs111_credit'));
    return Number.isFinite(ls)?Math.round(ls):50;
  }

  function syncRoot(root){
    if(!root)return;
    var value=String(score());
    try{
      ['creditScoreFinance','creditScoreLoans','creditScoreBank'].forEach(function(id){
        var el=document.getElementById(id);if(el)el.textContent=value;
      });
      root.querySelectorAll('span,small,label').forEach(function(label){
        var t=String(label.textContent||'').trim().toLocaleUpperCase('tr-TR');
        if(t!=='KREDİ PUANI')return;
        var box=label.parentElement;if(!box)return;
        var out=box.querySelector('b,strong');
        if(out)out.textContent=value;
      });
      root.querySelectorAll('h1,h2,h3,h4,b,strong').forEach(function(el){
        var t=String(el.textContent||'').trim();
        if(/^Kredi Puanı\s+\d+$/i.test(t))el.textContent='Kredi Puanı '+value;
      });
    }catch(e){}
  }

  function activeRoot(){
    try{
      var h=location.hash||'';
      if(h&&/^#[A-Za-z0-9_\-]+$/.test(h)){
        var el=document.querySelector(h);if(el)return el;
      }
    }catch(e){}
    return document;
  }
  function sync(){syncRoot(activeRoot())}

  window.addEventListener('hashchange',sync,{passive:true});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)sync()},{passive:true});
  window.addEventListener('pageshow',sync,{passive:true});
  setTimeout(sync,0);
})();
