/* Empire of Trade • Yatırım piyasaları güvenlik katmanı */
(function(){
  if(window.__eotInvestmentFixesLoaded)return;
  window.__eotInvestmentFixesLoaded=true;
  let refreshTimer=0,totalFrame=0;
  function runtimeCash(){try{return typeof cash!=='undefined'&&Number.isFinite(Number(cash))?Number(cash):Number(localStorage.getItem('gs124_cash')||0)}catch(e){return 0}}
  function persistCareer(){try{if(typeof save==='function')save();if(typeof saveUnifiedState==='function')saveUnifiedState();if(typeof currentAccount==='function'&&typeof saveAccountCareer==='function'){const u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}}catch(e){console.warn('Yatırım kaydı tamamlanamadı:',e)}}
  function normalizePortfolio(){try{if(typeof pf==='undefined'||!pf||typeof pf!=='object')return;Object.keys(pf).forEach(sym=>{const p=pf[sym];if(!p||typeof p!=='object'){delete pf[sym];return}p.qty=Number(p.qty||0);p.avg=Number(p.avg||0);if(!Number.isFinite(p.qty)||p.qty<0)p.qty=0;if(!Number.isFinite(p.avg)||p.avg<0)p.avg=0;if(p.qty<=1e-10){p.qty=0;p.avg=0}})}catch(e){}}
  function inputQty(sym){const el=document.getElementById('qty_'+sym)||document.getElementById('tradeqty_'+sym);const raw=String(el&&el.value||'').trim().replace(/\s/g,'').replace(',','.');return Number(raw)}
  function patchTrade(){try{normalizePortfolio();if(typeof window.trade!=='function'||window.trade.__eotInvestmentSafe)return;const original=window.trade;const wrapped=function(sym,type){normalizePortfolio();if(typeof ASSETS==='undefined'||!ASSETS[sym]){if(typeof toast==='function')toast('Yatırım ürünü bulunamadı');return false}if(type!=='buy'&&type!=='sell'){if(typeof toast==='function')toast('Geçersiz işlem türü');return false}const a=ASSETS[sym],q=inputQty(sym),wholeOnly=a.group==='stock'||['GRAM','CEYREK','TAM','YARIM','CUMHUR','KULCE'].includes(sym);if(!Number.isFinite(q)||q<=0){if(typeof toast==='function')toast('Geçerli miktar gir');return false}if(wholeOnly&&!Number.isInteger(q)){if(typeof toast==='function')toast((typeof assetUnit==='function'?assetUnit(sym):'adet')+' miktarı tam sayı olmalı');return false}const pos=pf[sym]||{qty:0,avg:0},price=Number(type==='buy'?a.buy:a.sell),total=price*q;if(!Number.isFinite(price)||price<=0||!Number.isFinite(total)||total<=0){if(typeof toast==='function')toast('Piyasa fiyatı geçersiz');return false}if(type==='buy'&&runtimeCash()+1e-8<total){if(typeof toast==='function')toast('Yetersiz nakit');return false}if(type==='sell'&&Number(pos.qty||0)+1e-8<q){if(typeof toast==='function')toast('Portföyde yeterli varlık yok');return false}const beforeCash=runtimeCash(),beforeQty=Number(pos.qty||0),beforeTx=Array.isArray(tx)?tx.length:0;const r=original.call(this,sym,type);normalizePortfolio();const after=pf[sym]||{qty:0,avg:0},changed=type==='buy'?Number(after.qty)>beforeQty:Number(after.qty)<beforeQty;if(changed||runtimeCash()!==beforeCash||(Array.isArray(tx)&&tx.length!==beforeTx)){if(Array.isArray(tx)&&tx.length>250)tx=tx.slice(0,250);persistCareer();try{if(typeof render==='function')render();if(typeof renderFinanceExtras==='function')renderFinanceExtras();if(typeof renderGameExtras==='function')renderGameExtras()}catch(e){}}return changed?true:r};wrapped.__eotInvestmentSafe=true;window.trade=wrapped}catch(e){console.warn('Yatırım işlem güvenliği kurulamadı:',e)}}
  function patchScreenTrade(){try{if(typeof window.tradeFromScreen==='function'&&!window.tradeFromScreen.__eotInvestmentSafe){const original=window.tradeFromScreen;const wrapped=function(sym,type){const s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);if(t&&s)t.value=String(s.value||'').replace(',','.');return original.apply(this,arguments)};wrapped.__eotInvestmentSafe=true;window.tradeFromScreen=wrapped}if(typeof window.tradeFromScreenAndGo==='function'&&!window.tradeFromScreenAndGo.__eotInvestmentSafe){const original=window.tradeFromScreenAndGo;const wrapped=function(sym,type,target){const s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);if(t&&s)t.value=String(s.value||'').replace(',','.');return original.apply(this,arguments)};wrapped.__eotInvestmentSafe=true;window.tradeFromScreenAndGo=wrapped}}catch(e){}}
  function money(n){return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2})}
  function activeInvestmentRoot(){try{const h=location.hash||'';if(h&&/^#[A-Za-z0-9_\-]+$/.test(h)){const el=document.querySelector(h);if(el)return el}}catch(e){}return document}
  function syncVisibleTotals(){
    if(!onRelevantScreen()||document.hidden||typeof ASSETS==='undefined')return;
    try{
      const root=activeInvestmentRoot();
      root.querySelectorAll('input[id^="tradeqty_"]').forEach(input=>{
        const sym=String(input.id||'').replace('tradeqty_',''),a=ASSETS[sym];if(!a)return;
        let q=Number(String(input.value||'0').replace(',','.'));if(!Number.isFinite(q)||q<0)q=0;
        const box=document.getElementById('eot_trade_total_'+sym);if(!box)return;
        const buy=box.querySelector('[data-eot-buy-total]'),sell=box.querySelector('[data-eot-sell-total]');
        if(buy)buy.textContent=money(q*Number(a.buy||0));if(sell)sell.textContent=money(q*Number(a.sell||0));
      });
      root.querySelectorAll('.asset-card input[id^="qty_"]').forEach(input=>{
        const sym=String(input.id||'').replace('qty_',''),a=ASSETS[sym];if(!a)return;
        let q=Number(String(input.value||'0').replace(',','.'));if(!Number.isFinite(q)||q<0)q=0;
        const card=input.closest('.asset-card'),out=card&&card.querySelector('[data-eot-card-total]');
        if(out)out.textContent=money(q*Number(a.buy||0));
      });
    }catch(e){}
  }
  function scheduleTotalSync(){if(totalFrame)return;totalFrame=requestAnimationFrame(()=>{totalFrame=0;syncVisibleTotals()})}
  function patchPriceSync(){
    try{
      if(typeof window.movePrices!=='function'||window.movePrices.__eotTotalSync)return;
      const original=window.movePrices;
      const wrapped=function(){const r=original.apply(this,arguments);if(onRelevantScreen()&&!document.hidden)scheduleTotalSync();return r};
      wrapped.__eotTotalSync=true;wrapped.__eotOriginal=original;window.movePrices=wrapped;
    }catch(e){}
  }
  function refreshInvestmentInputs(){try{document.querySelectorAll('input[id^="tradeqty_"],input[id^="qty_"]').forEach(el=>{const id=String(el.id||''),sym=id.replace(/^tradeqty_/,'').replace(/^qty_/,'');if(!sym)return;if(['BTC','ETH','SOL','XRP'].includes(sym)){el.setAttribute('inputmode','decimal');el.setAttribute('step',sym==='BTC'?'0.000001':sym==='ETH'?'0.00001':sym==='SOL'?'0.001':'0.01')}else{el.setAttribute('inputmode','numeric');el.setAttribute('step','1')}el.setAttribute('min','0')});if(typeof pf!=='undefined'&&typeof qtyWithUnit==='function'){Object.keys(pf||{}).forEach(sym=>{const h=document.getElementById('held_'+sym);if(h)h.textContent=qtyWithUnit((pf[sym]||{qty:0}).qty,sym)})}}catch(e){}}
  function ensureFinanceLayer(){if(document.querySelector('script[data-eot-finance-fixes]'))return;const s=document.createElement('script');s.src='finance-fixes.js?v=190';s.dataset.eotFinanceFixes='1';document.body.appendChild(s)}
  function ensureHomeCounts(){if(document.querySelector('script[data-eot-home-counts]'))return;const s=document.createElement('script');s.src='home-world-counts.js?v=1';s.dataset.eotHomeCounts='1';document.body.appendChild(s)}
  function ensureHomeCompanyProfile(){if(document.querySelector('script[data-eot-home-company-profile]')||window.__eotHomeCompanyProfileLoaded)return;const s=document.createElement('script');s.src='home-company-profile.js?v=1';s.dataset.eotHomeCompanyProfile='1';document.body.appendChild(s)}
  function ensureCeoIdentity(){if(document.querySelector('script[data-eot-ceo-identity]')||window.__eotCeoIdentityLoaded)return;const s=document.createElement('script');s.src='ceo-identity.js?v=2';s.dataset.eotCeoIdentity='1';document.body.appendChild(s)}
  function ensureCompanyOnboarding(){if(document.querySelector('script[data-eot-company-onboarding]')||window.__eotCompanyOnboardingLoaded){ensureCeoIdentity();return}const s=document.createElement('script');s.src='company-onboarding.js?v=2';s.dataset.eotCompanyOnboarding='1';s.onload=()=>{ensureCeoIdentity();ensureCompanyLoginEntry()};document.body.appendChild(s)}
  function ensureCompanyLoginEntry(){if(document.querySelector('script[data-eot-company-login-entry]')||window.__eotCompanyLoginEntryLoaded)return;const s=document.createElement('script');s.src='company-login-entry.js?v=1';s.dataset.eotCompanyLoginEntry='1';document.body.appendChild(s)}
  function refresh(){patchTrade();patchScreenTrade();patchPriceSync();normalizePortfolio();refreshInvestmentInputs();syncVisibleTotals();ensureFinanceLayer();ensureHomeCounts();ensureHomeCompanyProfile();ensureCompanyOnboarding();ensureCeoIdentity();ensureCompanyLoginEntry()}
  function onRelevantScreen(){const h=(location.hash||'').toLowerCase();return /finance|invest|stock|crypto|gold|borsa|kripto|altin/.test(h)}
  function scheduleRefresh(delay=180){if(refreshTimer)clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{refreshTimer=0;if(!onRelevantScreen()||document.hidden)return;if('requestIdleCallback' in window)requestIdleCallback(()=>refresh(),{timeout:450});else setTimeout(refresh,0)},delay)}
  window.addEventListener('pagehide',persistCareer);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persistCareer();else if(onRelevantScreen())scheduleRefresh(180)});
  window.addEventListener('hashchange',()=>{if(onRelevantScreen())scheduleRefresh(180)});
  document.addEventListener('input',e=>{if(onRelevantScreen()&&e.target&&/^(tradeqty_|qty_)/.test(String(e.target.id||'')))scheduleTotalSync()},true);
  setTimeout(()=>{patchTrade();patchScreenTrade();patchPriceSync();ensureFinanceLayer();ensureHomeCounts();ensureHomeCompanyProfile();ensureCompanyOnboarding();ensureCeoIdentity();ensureCompanyLoginEntry();if(onRelevantScreen())scheduleRefresh(100)},500);
})();
