/* Empire of Trade • 2. El Araçlar birleşik ilan pazarı + günlük yenileme */
(function(){
  'use strict';
  if(window.__eotVehicleMarketMerged)return;
  window.__eotVehicleMarketMerged=true;

  var DAY_KEY='eot_used_vehicle_market_day_v1';
  var countdownTimer=0;
  var midnightTimer=0;

  function todayKey(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function nextMidnight(){
    var d=new Date();
    d.setHours(24,0,0,0);
    return d.getTime();
  }
  function routeIsUsedMarket(){return String(location.hash||'').replace(/^#/,'')==='cars_used'}
  function persistSim(){try{if(typeof simSave==='function')simSave()}catch(e){}}

  function removeLegacyRoutes(){
    document.querySelectorAll('a[href="#brand_dealers"],a[href="#used_market_plus"]').forEach(function(a){a.remove()});
    var dealer=document.getElementById('brand_dealers');
    if(dealer)dealer.remove();
    var plus=document.getElementById('used_market_plus');
    if(plus)plus.remove();
  }

  function refreshDailyListings(force){
    try{
      if(typeof sim==='undefined'||!sim)return false;
      var today=todayKey();
      var stored=localStorage.getItem(DAY_KEY)||'';
      var needs=!!force||stored!==today||!Array.isArray(sim.detailedUsed)||sim.detailedUsed.length===0;
      if(needs&&typeof generateDetailedUsed==='function')generateDetailedUsed();
      sim.usedRefresh=nextMidnight();
      localStorage.setItem(DAY_KEY,today);
      persistSim();
      if(routeIsUsedMarket()&&typeof renderDetailedUsed==='function')renderDetailedUsed();
      return needs;
    }catch(e){console.warn('Günlük 2. el ilan yenilemesi tamamlanamadı:',e);return false}
  }

  function formatRemaining(ms){
    ms=Math.max(0,ms);
    var total=Math.floor(ms/1000),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }
  function syncCountdown(){
    if(!routeIsUsedMarket()||document.visibilityState==='hidden')return;
    var el=document.getElementById('eotUsedMarketCountdown');
    if(!el)return;
    var due=nextMidnight(),left=due-Date.now();
    if(left<=0){refreshDailyListings(true);due=nextMidnight();left=due-Date.now()}
    el.textContent=formatRemaining(left);
  }
  function startCountdown(){
    clearInterval(countdownTimer);countdownTimer=0;
    syncCountdown();
    if(routeIsUsedMarket()&&document.visibilityState!=='hidden')countdownTimer=setInterval(syncCountdown,1000);
  }
  function scheduleMidnightRefresh(){
    clearTimeout(midnightTimer);
    var delay=Math.max(1000,nextMidnight()-Date.now()+150);
    midnightTimer=setTimeout(function(){refreshDailyListings(true);scheduleMidnightRefresh();startCountdown()},delay);
  }

  function buildUsedMarket(){
    var used=document.getElementById('cars_used');
    if(!used)return false;

    var head=used.querySelector('.panel-head');
    if(head){
      var back=head.querySelector('.backbtn');if(back)back.setAttribute('href','#cars');
      var title=head.querySelector('.panel-title h2');if(title)title.textContent='2. El Araçlar';
      var sub=head.querySelector('.panel-title p');if(sub)sub.textContent='Detaylı ikinci el araç ilanları';
    }

    var list=document.getElementById('detailedUsedList');
    if(!list){list=document.createElement('div');list.id='detailedUsedList'}

    Array.from(used.children).forEach(function(el){if(el!==head)el.remove()});

    var intro=document.createElement('div');
    intro.className='used-market-merged-head';
    intro.innerHTML='<div class="used-market-copy"><span>2. EL PAZARI</span><h3>Güncel Araç İlanları</h3><p>İlanlar her gün saat 00:00’da otomatik olarak yenilenir.</p></div><div class="eot-used-refresh-card"><span>İLANLARIN YENİLENMESİNE</span><b id="eotUsedMarketCountdown">--:--:--</b></div>';
    used.appendChild(intro);
    used.appendChild(list);

    removeLegacyRoutes();

    if(!document.getElementById('eot-used-market-merge-style')){
      var st=document.createElement('style');st.id='eot-used-market-merge-style';
      st.textContent='.used-market-merged-head{position:relative;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:14px 0;padding:15px 16px;min-height:80px;border:1px solid rgba(103,177,224,.18);border-radius:18px;background:linear-gradient(145deg,rgba(16,43,68,.96),rgba(9,28,47,.96))}.used-market-copy{min-width:0;flex:1;padding-right:142px}.used-market-copy>span{display:block;color:#72d8ee;font-size:7px;font-weight:900;letter-spacing:.13em}.used-market-copy h3{margin:4px 0 4px;font-size:15px;line-height:1.15}.used-market-copy p{margin:0;color:#8fa5ba;font-size:8px;line-height:1.4}.eot-used-refresh-card{position:absolute;top:50%;right:12px;transform:translateY(-50%);width:128px;min-height:50px;padding:8px 10px;border:1px solid rgba(53,198,216,.24);border-radius:13px;background:linear-gradient(135deg,rgba(13,48,70,.98),rgba(8,31,50,.98));box-shadow:0 6px 16px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.eot-used-refresh-card span{display:block;color:#839db4;font-size:5.7px;font-weight:900;letter-spacing:.055em;line-height:1.15;white-space:nowrap}.eot-used-refresh-card b{display:block;margin-top:5px;color:#f4fbff;font-size:15px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.035em}@media(max-width:390px){.used-market-merged-head{padding:13px 14px;min-height:76px}.used-market-copy{padding-right:124px}.eot-used-refresh-card{right:10px;width:112px;min-height:46px;padding:7px 8px}.eot-used-refresh-card span{font-size:4.9px}.eot-used-refresh-card b{font-size:13px}}';
      document.head.appendChild(st);
    }

    refreshDailyListings(false);
    try{if(typeof renderDetailedUsed==='function')renderDetailedUsed()}catch(e){console.warn('2. el ilanları hazırlanamadı:',e)}
    startCountdown();
    scheduleMidnightRefresh();
    return true;
  }

  function install(){
    removeLegacyRoutes();
    if(buildUsedMarket())return;
    var tries=0;
    var timer=setInterval(function(){tries++;if(buildUsedMarket()||tries>=30)clearInterval(timer)},100);
  }

  window.addEventListener('hashchange',startCountdown,{passive:true});
  document.addEventListener('visibilitychange',startCountdown,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
