/* Empire of Trade • Ana Sayfa gerçek oyun durumu katmanı - hafif sürüm */
(function(){
  'use strict';
  if(window.__eotHomeGameplay)return;
  window.__eotHomeGameplay=true;

  let refreshTimer=0;
  function money(n){try{return'₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}catch(e){return'₺0'}}
  function homeVisible(){return document.visibilityState!=='hidden'&&(location.hash||'#home')==='#home'}

  function removeLegacyNextMove(){const el=document.getElementById('eotNextMove');if(el)el.remove()}

  function patchQuickLinks(){
    const home=document.getElementById('home');if(!home)return;
    const quick=[...home.querySelectorAll('.eot-quick')];
    const tender=quick.find(a=>String(a.textContent||'').toLocaleLowerCase('tr-TR').includes('devlet ihal'));
    if(tender&&document.getElementById('tenders'))tender.href='#tenders';
    const bank=quick.find(a=>{const t=String(a.textContent||'').toLocaleLowerCase('tr-TR');return t.includes('banka')&&t.includes('kredi')});
    if(bank&&document.getElementById('finance'))bank.href='#finance';
  }

  function gameQuote(sym){try{if(typeof ASSETS==='undefined'||!ASSETS[sym])return null;const a=ASSETS[sym],base=(typeof BASE!=='undefined'&&BASE[sym])?Number(BASE[sym].buy||a.buy):Number(a.buy||0),price=Number(a.buy||0),pct=base?((price-base)/base)*100:0;return{price,pct,name:a.name||sym}}catch(e){return null}}
  function syncMarketSummary(){
    const card=document.querySelector('#home .eot-market-card');if(!card)return;
    const rows=[...card.querySelectorAll('.eot-market-row')],data=[['GSTEK','GŞ Teknoloji','Hisse'],['GRAM','Gram Altın','Altın'],['BTC','Bitcoin','Kripto']];
    rows.slice(0,3).forEach((row,i)=>{const d=data[i],q=d&&gameQuote(d[0]);if(!d||!q)return;const title=row.querySelector('b'),sub=row.querySelector('small'),price=row.querySelector('.eot-price'),change=row.querySelector('.eot-gain,.eot-loss');if(title)title.textContent=d[1];if(sub)sub.textContent=d[2]+' • oyun piyasası';if(price)price.textContent=money(q.price);if(change){const positive=q.pct>=0;change.classList.toggle('eot-gain',positive);change.classList.toggle('eot-loss',!positive);change.textContent=(q.pct>0?'+':'')+q.pct.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%'}});
    const head=card.querySelector('.eot-market-top b');if(head)head.textContent='Oyun Piyasası';
  }

  function refresh(){if(!homeVisible())return;removeLegacyNextMove();patchQuickLinks();syncMarketSummary()}
  function schedule(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,25)}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.addEventListener('hashchange',schedule,true);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('eot:navigation-intent',schedule,true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&homeVisible())schedule()});
  /* Piyasa verisi değişebilir; yalnızca Ana Sayfa görünürken seyrek doğrulama. */
  setInterval(()=>{if(homeVisible())refresh()},15000);
})();