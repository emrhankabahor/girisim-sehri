/* Empire of Trade - güvenli yatırım toplam tutar göstergesi. */
(function(){
  'use strict';

  /* Açılış render kapısı: eski/varsayılan DOM'un güncel katmanlardan önce görünmesini engeller. */
  if(!window.__eotStartupRenderGate){
    window.__eotStartupRenderGate=true;
    document.documentElement.classList.add('eot-startup-pending');
    var gateStyle=document.createElement('style');
    gateStyle.id='eot-startup-render-gate-style';
    gateStyle.textContent='html.eot-startup-pending #app-root{visibility:hidden!important;opacity:0!important}html.eot-startup-ready #app-root{visibility:visible!important;opacity:1!important}#eotStartupCover{position:fixed;inset:0;z-index:2147483647;background:linear-gradient(180deg,#081728,#06111d 58%,#071522);display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif}#eotStartupCover .eot-startup-inner{display:flex;flex-direction:column;align-items:center;gap:14px;color:#f6fbff}#eotStartupCover .eot-startup-logo{width:76px;height:76px;border-radius:21px;background:url("./apple-touch-icon.png?v=190") center/cover no-repeat;box-shadow:0 12px 34px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.08) inset}#eotStartupCover b{font-size:17px;letter-spacing:.08em}#eotStartupCover small{font-size:8px;letter-spacing:.24em;color:#6cdaf0;font-weight:800}#eotStartupCover.eot-leave{opacity:0;transition:opacity .12s linear;pointer-events:none}';
    document.head.appendChild(gateStyle);
    var cover=document.createElement('div');cover.id='eotStartupCover';cover.innerHTML='<div class="eot-startup-inner"><div class="eot-startup-logo"></div><b>EMPIRE OF TRADE</b><small>BUSINESS EMPIRE</small></div>';document.body.appendChild(cover);
    var gateReleased=false,gateStarted=Date.now();
    function startupCompanyName(){
      try{
        var account=JSON.parse(localStorage.getItem('gs_current_account')||'null');
        if(account&&account.id&&account.id!=='guest'){
          var career=JSON.parse(localStorage.getItem('gs_account_career_'+account.id)||'null');
          if(career&&career.sim){
            var p=career.sim.companyProfile;if(p&&p.established&&String(p.name||'').trim())return String(p.name).trim();
            var list=Array.isArray(career.sim.companies)?career.sim.companies:[];
            var main=list.find(function(c){return c&&c.isMainCompany&&String(c.name||'').trim()})||list.find(function(c){return c&&String(c.name||'').trim()});
            if(main)return String(main.name).trim();
          }
        }
        var simRaw=JSON.parse(localStorage.getItem('gs132_sim')||'null');
        if(simRaw){var p2=simRaw.companyProfile;if(p2&&p2.established&&String(p2.name||'').trim())return String(p2.name).trim()}
      }catch(e){}
      return'';
    }
    function releaseStartupGate(){
      if(gateReleased)return;gateReleased=true;
      document.documentElement.classList.remove('eot-startup-pending');document.documentElement.classList.add('eot-startup-ready');
      requestAnimationFrame(function(){requestAnimationFrame(function(){var c=document.getElementById('eotStartupCover');if(c){c.classList.add('eot-leave');setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},140)}})});
    }
    function startupReady(){
      try{
        var home=document.getElementById('home'),dash=document.querySelector('#home .eot-ui-dashboard'),brand=document.querySelector('.topbar .eot-brand');
        if(!home||!dash||!brand||home.dataset.eotExact!=='1')return false;
        if(typeof window.EOTSyncHomeCompanyProfile==='function')try{window.EOTSyncHomeCompanyProfile()}catch(e){}
        var expected=startupCompanyName();
        if(expected){var title=document.querySelector('#home .eot-identity h2');if(!title||String(title.textContent||'').trim()!==expected)return false}
        return true;
      }catch(e){return false}
    }
    var gateTimer=setInterval(function(){
      if(startupReady()||Date.now()-gateStarted>2600){clearInterval(gateTimer);releaseStartupGate()}
    },40);
    window.addEventListener('pageshow',function(){if(!gateReleased&&startupReady()){clearInterval(gateTimer);releaseStartupGate()}},{once:true});
  }

  if(!window.__eotSafeIntervalTuning){window.__eotSafeIntervalTuning=true;var nativeSetInterval=window.setInterval.bind(window);window.setInterval=function(fn,delay){var name=fn&&fn.name?fn.name:'';var nextDelay=delay;if(name==='syncDemo'&&delay===600)nextDelay=1800;else if(name==='checkRemoteVersion'&&delay===30000)nextDelay=120000;var args=Array.prototype.slice.call(arguments,2);return nativeSetInterval.apply(window,[fn,nextDelay].concat(args));};}
  if(!document.getElementById('eot-stability-loader')){var safeScript=document.createElement('script');safeScript.id='eot-stability-loader';safeScript.src='stability-fixes.js?v=170&_='+Date.now();safeScript.async=true;document.head.appendChild(safeScript);}
  if(!document.getElementById('eot-perf-loader')){var perfScript=document.createElement('script');perfScript.id='eot-perf-loader';perfScript.src='perf-monitor.js?v=1&_='+Date.now();perfScript.async=true;document.head.appendChild(perfScript);}
  function money(n){return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});}
  function readPrice(sym,type){var el=document.getElementById(type+'_'+sym);if(!el)return 0;var s=String(el.textContent||'').trim().replace(/₺/g,'').replace(/\s/g,'');if(!s)return 0;if(s.indexOf(',')>-1){s=s.replace(/\./g,'').replace(',','.');}else{var parts=s.split('.');if(parts.length>2||(parts.length===2&&parts[1].length===3))s=parts.join('');}var n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0;}
  function readCardBuyPrice(card){if(!card)return 0;var boxes=card.querySelectorAll('.asset-mini>div');if(!boxes.length)return 0;var buyBox=boxes[0];var value=buyBox.querySelector('b,strong');var s=String(value?value.textContent:buyBox.textContent||'').trim().replace(/₺/g,'').replace(/\s/g,'');if(!s)return 0;if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');else{var parts=s.split('.');if(parts.length>2||(parts.length===2&&parts[1].length===3))s=parts.join('');}var n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:0;}
  function updateTotal(input){if(!input||!input.id)return;var sym=input.id.replace('tradeqty_','');var q=Number(input.value||0);if(!Number.isFinite(q)||q<0)q=0;var box=document.getElementById('eot_trade_total_'+sym);if(!box)return;var buy=readPrice(sym,'buy'),sell=readPrice(sym,'sell');var buyOut=box.querySelector('[data-eot-buy-total]'),sellOut=box.querySelector('[data-eot-sell-total]');if(buyOut)buyOut.textContent=money(q*buy);if(sellOut)sellOut.textContent=money(q*sell);}
  function attachToInput(input){if(!input||input.dataset.eotTotalReady==='1')return;var sym=input.id.replace('tradeqty_','');var box=document.createElement('div');box.id='eot_trade_total_'+sym;box.className='eot-trade-total-safe';box.innerHTML='<div><span>ALIM TOPLAMI</span><b data-eot-buy-total>₺0</b></div><div><span>SATIŞ TOPLAMI</span><b data-eot-sell-total>₺0</b></div>';input.insertAdjacentElement('afterend',box);input.dataset.eotTotalReady='1';input.addEventListener('input',function(){updateTotal(input)});input.addEventListener('change',function(){updateTotal(input)});updateTotal(input);}
  function updateCardTotal(input){if(!input||!input.id)return;var card=input.closest('.asset-card');if(!card)return;var q=Number(input.value||0);if(!Number.isFinite(q)||q<0)q=0;var out=card.querySelector('[data-eot-card-total]');if(out)out.textContent=money(q*readCardBuyPrice(card));}
  function normalizeCryptoInputs(){['BTC','ETH','SOL','XRP'].forEach(function(sym){var input=document.getElementById('qty_'+sym);if(!input||input.dataset.eotCryptoOne==='1')return;input.min='1';input.step='1';if(!input.value||Number(input.value)<1)input.value='1';input.dataset.eotCryptoOne='1';});}
  function attachCardTotal(input){if(!input||input.dataset.eotCardTotalReady==='1')return;var card=input.closest('.asset-card');if(!card)return;var mini=card.querySelector('.asset-mini');if(!mini)return;var box=document.createElement('div');box.className='eot-card-total-box';box.innerHTML='<span>TOPLAM TUTAR</span><b data-eot-card-total>₺0</b>';mini.appendChild(box);mini.classList.add('eot-card-total-ready');input.dataset.eotCardTotalReady='1';input.addEventListener('input',function(){updateCardTotal(input)});input.addEventListener('change',function(){updateCardTotal(input)});updateCardTotal(input);}
  function install(){try{normalizeCryptoInputs();document.querySelectorAll('input[id^="tradeqty_"]').forEach(attachToInput);document.querySelectorAll('input[id^="tradeqty_"][data-eot-total-ready="1"]').forEach(updateTotal);document.querySelectorAll('.asset-card input[id^="qty_"]').forEach(attachCardTotal);document.querySelectorAll('.asset-card input[id^="qty_"][data-eot-card-total-ready="1"]').forEach(updateCardTotal);}catch(e){console.warn('Yatırım toplam göstergesi yüklenemedi:',e)}}
  function investmentScreenVisible(){
    if(document.hidden)return false;
    var hash=String(location.hash||'').toLocaleLowerCase('tr-TR');
    if(hash.indexOf('invest')>-1||hash.indexOf('yatirim')>-1||hash.indexOf('borsa')>-1||hash.indexOf('kripto')>-1||hash.indexOf('altin')>-1)return true;
    var inputs=document.querySelectorAll('input[id^="tradeqty_"],.asset-card input[id^="qty_"]');
    for(var i=0;i<inputs.length;i++){
      var screen=inputs[i].closest('.screen');
      if(screen&&getComputedStyle(screen).display!=='none'&&screen.getClientRects().length)return true;
    }
    return false;
  }
  function refreshVisibleTotals(){
    if(!investmentScreenVisible())return;
    document.querySelectorAll('input[id^="tradeqty_"][data-eot-total-ready="1"]').forEach(updateTotal);
    document.querySelectorAll('.asset-card input[id^="qty_"][data-eot-card-total-ready="1"]').forEach(updateCardTotal);
  }
  function addStyle(){if(document.getElementById('eot-trade-total-safe-style'))return;var st=document.createElement('style');st.id='eot-trade-total-safe-style';st.textContent='html{scroll-behavior:auto!important}.screen{animation:eotFadeStable .12s ease!important}@keyframes eotFadeStable{from{opacity:.72}to{opacity:1}}\n.eot-trade-total-safe{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0 3px}\n.eot-trade-total-safe>div{min-width:0;padding:10px 11px;border:1px solid rgba(148,190,224,.14);border-radius:12px;background:rgba(12,34,54,.72)}\n.eot-trade-total-safe span{display:block;margin-bottom:4px;color:#8fa6bb;font-size:7px;font-weight:800;letter-spacing:.08em}\n.eot-trade-total-safe b{display:block;color:#f7fbff;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.eot-trade-total-safe>div:first-child b{color:#74e6b6}\n.eot-trade-total-safe>div:last-child b{color:#8fdcff}\n.asset-mini.eot-card-total-ready{grid-template-columns:repeat(3,minmax(0,1fr))!important}\n.asset-mini .eot-card-total-box{grid-column:1/-1!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:11px 13px!important;margin-top:2px!important;border:1px solid rgba(88,196,225,.22)!important;border-radius:13px!important;background:linear-gradient(90deg,rgba(18,55,82,.88),rgba(12,36,57,.88))!important}\n.asset-mini .eot-card-total-box span{font-size:8px!important;font-weight:900!important;letter-spacing:.08em!important;color:#8fa6bb!important}\n.asset-mini .eot-card-total-box b{font-size:13px!important;color:#7de6c1!important;white-space:nowrap!important}\n.summary-strip>div{min-width:0!important;overflow:hidden!important}\n.summary-strip b{white-space:nowrap!important;word-break:keep-all!important;overflow-wrap:normal!important;line-height:1.12!important;font-size:clamp(8px,2.8vw,11px)!important;letter-spacing:-.025em!important}\n.summary-strip .profit,.summary-strip .loss2{white-space:nowrap!important}';document.head.appendChild(st);}
  addStyle();window.addEventListener('hashchange',function(){setTimeout(install,80)});window.addEventListener('load',function(){setTimeout(install,250)});var tries=0;var bootTimer=setInterval(function(){tries++;install();if(tries>=12)clearInterval(bootTimer)},650);setInterval(refreshVisibleTotals,6000);
})();