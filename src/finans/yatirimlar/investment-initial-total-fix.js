/* Empire of Trade • Finans girişinde yatırım ekranlarını önceden hazırla */
(function(){
  'use strict';
  if(window.__eotInvestmentInitialTotalFix)return;
  window.__eotInvestmentInitialTotalFix=true;

  function money(n){
    return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }
  function qty(input){
    var n=Number(String(input&&input.value||'0').trim().replace(',','.'));
    return Number.isFinite(n)&&n>=0?n:0;
  }
  function domBuyPrice(card){
    try{
      var first=card&&card.querySelector('.asset-mini>div:first-child b,.asset-mini>div:first-child strong');
      var s=String(first&&first.textContent||'').trim().replace(/₺/g,'').replace(/\s/g,'');
      if(!s)return 0;
      if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');
      else{
        var parts=s.split('.');
        if(parts.length>2||(parts.length===2&&parts[1].length===3))s=parts.join('');
      }
      var n=Number(s.replace(/[^0-9.-]/g,''));
      return Number.isFinite(n)?n:0;
    }catch(e){return 0}
  }
  function buyPrice(sym,card){
    try{
      if(typeof ASSETS!=='undefined'&&ASSETS[sym]){
        var n=Number(ASSETS[sym].buy);
        if(Number.isFinite(n)&&n>0)return n;
      }
    }catch(e){}
    return domBuyPrice(card);
  }
  function prepareRoot(root){
    if(!root)return 0;
    var count=0;
    try{
      root.querySelectorAll('.asset-card input[id^="qty_"]').forEach(function(input){
        var sym=String(input.id||'').replace('qty_','');
        if(!sym)return;
        var card=input.closest('.asset-card');
        var mini=card&&card.querySelector('.asset-mini');
        if(!mini)return;
        var box=card.querySelector('.eot-card-total-box');
        if(!box){
          box=document.createElement('div');
          box.className='eot-card-total-box';
          box.innerHTML='<span>TOPLAM TUTAR</span><b data-eot-card-total>—</b>';
          mini.appendChild(box);
        }
        mini.classList.add('eot-card-total-ready');
        var out=box.querySelector('[data-eot-card-total]');
        var price=buyPrice(sym,card);
        if(out&&price>0)out.textContent=money(qty(input)*price);
        count++;
      });
    }catch(e){}
    return count;
  }
  function prepareTarget(hash){
    if(!/^#(?:stocks|crypto|gold)$/.test(hash||''))return 0;
    return prepareRoot(document.querySelector(hash));
  }
  function prepareInvestments(){
    prepareTarget('#stocks');
    prepareTarget('#crypto');
    prepareTarget('#gold');
  }
  function hrefFromEvent(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    return a?String(a.getAttribute('href')||''):'';
  }
  function beforeNavigate(e){
    var href=hrefFromEvent(e);
    if(href==='#finance'){
      /* Finans'a dokunulduğu anda üç yatırım ekranını görünmeden önce hazırla. */
      prepareInvestments();
      return;
    }
    if(/^#(?:stocks|crypto|gold)$/.test(href))prepareTarget(href);
  }

  document.addEventListener('pointerdown',beforeNavigate,true);
  document.addEventListener('click',beforeNavigate,true);

  /* Finans sayfasına geri/ileri ile gelinirse aynı hazırlığı yap. */
  window.addEventListener('hashchange',function(){
    var h=location.hash||'';
    if(h==='#finance')prepareInvestments();
    else prepareTarget(h);
  },{passive:true});
})();
