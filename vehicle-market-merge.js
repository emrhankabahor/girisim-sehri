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
    var date=document.getElementById('eotUsedMarketNextDate');
    if(date)date.textContent=new Date(due).toLocaleDateString('tr-TR')+' • 00:00';
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
    intro.innerHTML='<div><span>2. EL PAZARI</span><h3>Güncel Araç İlanları</h3><p>İlanlar her gün saat 00:00’da otomatik olarak yenilenir.</p></div>';
    used.appendChild(intro);

    var notice=document.createElement('div');
    notice.className='eot-used-refresh-card';
    notice.innerHTML='<div class="eot-used-refresh-icon">↻</div><div class="eot-used-refresh-copy"><span>İLANLARIN YENİLENMESİNE</span><b id="eotUsedMarketCountdown">--:--:--</b><small>Sonraki yenileme: <strong id="eotUsedMarketNextDate">—</strong></small></div>';
    used.appendChild(notice);
    used.appendChild(list);

    removeLegacyRoutes();

    if(!document.getElementById('eot-used-market-merge-style')){
      var st=document.createElement('style');st.id='eot-used-market-merge-style';
      st.textContent='.used-market-merged-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:14px 0 10px;padding:15px;border:1px solid rgba(103,177,224,.18);border-radius:18px;background:linear-gradient(145deg,rgba(16,43,68,.96),rgba(9,28,47,.96))}.used-market-merged-head span{display:block;color:#72d8ee;font-size:7px;font-weight:900;letter-spacing:.13em}.used-market-merged-head h3{margin:4px 0 4px;font-size:15px}.used-market-merged-head p{margin:0;max-width:320px;color:#8fa5ba;font-size:8px;line-height:1.45}.eot-used-refresh-card{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:13px 14px;border:1px solid rgba(53,198,216,.2);border-radius:17px;background:linear-gradient(135deg,rgba(13,48,70,.96),rgba(8,31,50,.96));box-shadow:0 8px 22px rgba(0,0,0,.12)}.eot-used-refresh-icon{width:38px;height:38px;flex:0 0 38px;border-radius:12px;display:grid;place-items:center;background:rgba(53,198,216,.1);color:#6ed9eb;font-size:20px;font-weight:900}.eot-used-refresh-copy{min-width:0}.eot-used-refresh-copy span{display:block;color:#839db4;font-size:7px;font-weight:900;letter-spacing:.1em}.eot-used-refresh-copy b{display:block;margin-top:3px;color:#f4fbff;font-size:17px;letter-spacing:.03em}.eot-used-refresh-copy small{display:block;margin-top:3px;color:#7892aa;font-size:7.5px}.eot-used-refresh-copy strong{color:#91dcea;font-weight:800}';
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
