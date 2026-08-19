/* Empire of Trade • Ana Sayfa gerçek oyun durumu katmanı */
(function(){
  'use strict';
  if(window.__eotHomeGameplay)return;
  window.__eotHomeGameplay=true;

  let refreshTimer=0;

  function money(n){
    try{return '₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}
    catch(e){return '₺0'}
  }
  function homeVisible(){
    return document.visibilityState!=='hidden' && (location.hash||'#home')==='#home';
  }
  function safeCompanies(){
    try{return typeof sim!=='undefined'&&Array.isArray(sim.companies)?sim.companies:[]}
    catch(e){return []}
  }
  function safeAssets(){
    try{return typeof ownedAssets!=='undefined'&&Array.isArray(ownedAssets)?ownedAssets:[]}
    catch(e){return []}
  }
  function safeCash(){
    try{return typeof cash!=='undefined'?Number(cash||0):Number(localStorage.getItem('gs124_cash')||0)}
    catch(e){return 0}
  }
  function activeLoanCount(){
    try{return typeof loans!=='undefined'&&Array.isArray(loans)?loans.filter(x=>x&&x.closed!==true&&Number(x.remaining||0)>0).length:0}
    catch(e){return 0}
  }

  function ensureStyle(){
    if(document.getElementById('eot-home-gameplay-style'))return;
    const s=document.createElement('style');
    s.id='eot-home-gameplay-style';
    s.textContent=`
      .eot-next-move{margin:13px 0 4px;padding:13px 14px;border:1px solid rgba(86,190,218,.17);border-radius:17px;background:linear-gradient(135deg,rgba(25,77,112,.38),rgba(12,39,64,.76));display:grid;grid-template-columns:42px minmax(0,1fr) auto;align-items:center;gap:11px;box-shadow:0 8px 22px rgba(0,0,0,.12)}
      .eot-next-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:rgba(79,195,222,.10);border:1px solid rgba(101,202,228,.12);font-size:20px}
      .eot-next-copy{min-width:0}.eot-next-copy small{display:block;color:#6dd5ea;font-size:7px;letter-spacing:.13em;font-weight:900}.eot-next-copy b{display:block;margin-top:3px;font-size:11px}.eot-next-copy span{display:block;margin-top:3px;color:#829bb0;font-size:7.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .eot-next-go{min-width:54px;padding:9px 10px;border-radius:11px;background:#163a58;color:#ddf7ff;font-size:8px;font-weight:900;text-align:center}
    `;
    document.head.appendChild(s);
  }

  function nextMove(){
    const companies=safeCompanies(),assets=safeAssets(),cashNow=safeCash(),loanCount=activeLoanCount();
    if(!companies.length){
      return {icon:'🏢',title:'İlk şirketini kur',desc:'Sektörünü seç ve ticari faaliyetini başlat.',target:'#business',action:'BAŞLA'};
    }
    if(!assets.length){
      return {icon:'🛒',title:'İlk varlığını edin',desc:'Pazardan arsa, gayrimenkul veya araç fırsatı incele.',target:'#market',action:'PAZAR'};
    }
    if(cashNow<250000&&loanCount>0){
      return {icon:'💳',title:'Nakit rezervini güçlendir',desc:'Borçlarını ve nakit akışını kontrol altında tut.',target:'#finance',action:'FİNANS'};
    }
    if(companies.length===1){
      return {icon:'📈',title:'Şirketini büyüt',desc:'Çalışan, faaliyet ve yeni gelir kanallarını geliştir.',target:'#business',action:'YÖNET'};
    }
    return {icon:'🎯',title:'Portföyünü çeşitlendir',desc:'Yeni yatırım ve ticaret fırsatlarını değerlendir.',target:'#market',action:'KEŞFET'};
  }

  function mountNextMove(){
    const home=document.getElementById('home');
    if(!home)return;
    let box=document.getElementById('eotNextMove');
    if(!box){
      box=document.createElement('a');
      box.id='eotNextMove';
      box.className='eot-next-move';
      const profile=home.querySelector('.eot-profile');
      if(profile&&profile.parentNode)profile.insertAdjacentElement('afterend',box);
      else{
        const dash=home.querySelector('.eot-ui-dashboard');
        if(dash)dash.prepend(box);else home.prepend(box);
      }
    }
    const move=nextMove();
    box.href=move.target;
    box.innerHTML='<span class="eot-next-icon">'+move.icon+'</span><span class="eot-next-copy"><small>SIRADAKİ HAMLE</small><b>'+move.title+'</b><span>'+move.desc+'</span></span><strong class="eot-next-go">'+move.action+'</strong>';
  }

  function patchQuickLinks(){
    const home=document.getElementById('home');if(!home)return;
    const tender=[...home.querySelectorAll('.eot-quick')].find(a=>String(a.textContent||'').toLocaleLowerCase('tr-TR').includes('devlet ihal'));
    if(tender&&document.getElementById('tenders'))tender.href='#tenders';
  }

  function gameQuote(sym){
    try{
      if(typeof ASSETS==='undefined'||!ASSETS[sym])return null;
      const a=ASSETS[sym],base=(typeof BASE!=='undefined'&&BASE[sym])?Number(BASE[sym].buy||a.buy):Number(a.buy||0);
      const price=Number(a.buy||0),pct=base?((price-base)/base)*100:0;
      return {price,pct,name:a.name||sym};
    }catch(e){return null}
  }
  function priceText(sym,n){
    if(sym==='BTC')return money(n);
    if(sym==='GRAM')return money(n);
    return money(n);
  }
  function syncMarketSummary(){
    const card=document.querySelector('#home .eot-market-card');if(!card)return;
    const rows=[...card.querySelectorAll('.eot-market-row')];
    const data=[['GSTEK','GŞ Teknoloji','Hisse'],['GRAM','Gram Altın','Altın'],['BTC','Bitcoin','Kripto']];
    rows.slice(0,3).forEach((row,i)=>{
      const d=data[i],q=d&&gameQuote(d[0]);if(!d||!q)return;
      const title=row.querySelector('b'),sub=row.querySelector('small'),price=row.querySelector('.eot-price'),change=row.querySelector('.eot-gain,.eot-loss');
      if(title)title.textContent=d[1];
      if(sub)sub.textContent=d[2]+' • oyun piyasası';
      if(price)price.textContent=priceText(d[0],q.price);
      if(change){
        const positive=q.pct>=0;
        change.classList.toggle('eot-gain',positive);change.classList.toggle('eot-loss',!positive);
        change.textContent=(q.pct>0?'+':'')+q.pct.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
      }
    });
    const head=card.querySelector('.eot-market-top b');if(head)head.textContent='Oyun Piyasası';
  }

  function refresh(){
    if(!homeVisible())return;
    ensureStyle();
    mountNextMove();
    patchQuickLinks();
    syncMarketSummary();
  }
  function schedule(){
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(refresh,30);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.addEventListener('hashchange',schedule,true);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('eot:navigation-intent',schedule,true);
  setInterval(function(){if(homeVisible())refresh()},2200);
})();
