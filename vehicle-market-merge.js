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

  function installDailyListingRules(){
    if(window.__eotDailyUsedRulesInstalled)return;
    if(typeof sim==='undefined'||typeof money!=='function')return;
    window.__eotDailyUsedRulesInstalled=true;

    window.generateDetailedUsed=function(){
      var catalog=[
        ['Şehir Hatchback',780000,'Benzin','1.0'],['Kompakt Hatchback',960000,'Benzin','1.3'],
        ['Aile Sedanı',1280000,'Dizel','1.5'],['Kompakt Sedan',1450000,'Benzin','1.6'],
        ['Kompakt SUV',1880000,'Benzin','1.5'],['Hibrit Crossover',2350000,'Hibrit','1.5'],
        ['Premium Sedan',3450000,'Benzin','2.0'],['Premium SUV',4250000,'Dizel','2.0'],
        ['Elektrikli Crossover',2850000,'Elektrik','EV'],['Elektrikli Sedan',3250000,'Elektrik','EV'],
        ['Ticari Van',1350000,'Dizel','1.6'],['4x4 Pickup',2550000,'Dizel','2.0']
      ];
      var sellers=['Bireysel','Galeri','Kurumsal 2. El','Yetkili 2. El'];
      var packages=['Comfort','Style','Premium','Executive','Sport'];
      var newsFactor=1;
      try{newsFactor=1+Number(currentNews().auto||0)}catch(e){}
      var nowYear=new Date().getFullYear();
      sim.detailedUsed=catalog.map(function(c,i){
        var year=Math.max(2015,nowYear-Math.floor(1+Math.random()*10));
        var age=Math.max(1,nowYear-year);
        var km=Math.round((age*(7000+Math.random()*15000)+Math.random()*18000)/1000)*1000;
        var condition=Math.max(55,Math.min(99,Math.round(98-age*2.1-Math.random()*14)));
        var ageFactor=Math.max(.46,1-age*.045);
        var condFactor=.72+condition/330;
        var price=Math.round(c[1]*ageFactor*condFactor*newsFactor/10000)*10000;
        var damage=condition<67?'Hasar kaydı var':condition<78?'Düşük hasar kaydı':'Temiz';
        var paint=condition<68?'3+ parça boyalı':condition<82?'1-2 parça boyalı':'Orijinal';
        return {id:'used_'+todayKey().replace(/-/g,'')+'_'+i+'_'+Math.floor(Math.random()*100000),name:c[0],year:year,km:km,engine:c[3],fuel:c[2],package:packages[(i+Math.floor(Math.random()*packages.length))%packages.length],damage:damage,paint:paint,condition:condition,price:Math.max(250000,price),seller:sellers[(i+Math.floor(Math.random()*sellers.length))%sellers.length]};
      });
      sim.usedRefresh=nextMidnight();
      persistSim();
      return sim.detailedUsed;
    };

    window.renderDetailedUsed=function(){
      var e=document.getElementById('detailedUsedList');
      if(!e)return;
      if(!Array.isArray(sim.detailedUsed))sim.detailedUsed=[];
      if(!sim.detailedUsed.length){
        e.innerHTML='<div class="eot-used-empty"><b>Bugünün ilanları tükendi</b><span>Yeni 2. el araç ilanları saat 00:00’da yayınlanacak.</span></div>';
        return;
      }
      e.innerHTML=sim.detailedUsed.map(function(x,i){return '<div class="used-detail-card"><h4>'+x.name+'</h4><p>'+x.seller+' • '+x.year+' • '+Number(x.km||0).toLocaleString('tr-TR')+' km</p><div class="vehicle-facts"><div><span>MOTOR</span><b>'+x.engine+'</b></div><div><span>YAKIT</span><b>'+x.fuel+'</b></div><div><span>PAKET</span><b>'+x.package+'</b></div><div><span>HASAR</span><b>'+x.damage+'</b></div><div><span>BOYA</span><b>'+x.paint+'</b></div><div><span>KONDİSYON</span><b>'+x.condition+'/100</b></div></div><div class="dynamic-price">'+money(x.price)+'</div><div class="card-action-row"><button onclick="bargainUsed('+i+')">Pazarlık</button><button class="primary" onclick="buyDetailedUsed('+i+')">Satın Al</button></div></div>'}).join('');
    };

    window.refreshDetailedUsed=function(){
      try{if(typeof toast==='function')toast('İlanlar her gün saat 00:00’da yenilenir')}catch(e){}
      window.renderDetailedUsed();
      return false;
    };
  }

  function refreshDailyListings(force){
    try{
      if(typeof sim==='undefined'||!sim)return false;
      installDailyListingRules();
      var today=todayKey();
      var stored=localStorage.getItem(DAY_KEY)||'';
      /* Liste gün içinde tamamen satın alınsa bile yeni ilan üretme. */
      var needs=!!force||stored!==today||!Array.isArray(sim.detailedUsed);
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

    installDailyListingRules();

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
      st.textContent='.used-market-merged-head{position:relative;display:flex;align-items:center;justify-content:space-between;gap:14px;margin:14px 0;padding:15px 16px;min-height:80px;border:1px solid rgba(103,177,224,.18);border-radius:18px;background:linear-gradient(145deg,rgba(16,43,68,.96),rgba(9,28,47,.96))}.used-market-copy{min-width:0;flex:1;padding-right:142px}.used-market-copy>span{display:block;color:#72d8ee;font-size:7px;font-weight:900;letter-spacing:.13em}.used-market-copy h3{margin:4px 0 4px;font-size:15px;line-height:1.15}.used-market-copy p{margin:0;color:#8fa5ba;font-size:8px;line-height:1.4}.eot-used-refresh-card{position:absolute;top:50%;right:12px;transform:translateY(-50%);width:128px;min-height:50px;padding:8px 10px;border:1px solid rgba(53,198,216,.24);border-radius:13px;background:linear-gradient(135deg,rgba(13,48,70,.98),rgba(8,31,50,.98));box-shadow:0 6px 16px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.025);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.eot-used-refresh-card span{display:block;color:#839db4;font-size:5.7px;font-weight:900;letter-spacing:.055em;line-height:1.15;white-space:nowrap}.eot-used-refresh-card b{display:block;margin-top:5px;color:#f4fbff;font-size:15px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.035em}.eot-used-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;margin:12px 0;padding:24px 16px;border:1px dashed rgba(103,177,224,.22);border-radius:17px;background:rgba(10,31,50,.55);text-align:center}.eot-used-empty b{font-size:14px;color:#edf8ff}.eot-used-empty span{font-size:8px;color:#849cb2}@media(max-width:390px){.used-market-merged-head{padding:13px 14px;min-height:76px}.used-market-copy{padding-right:124px}.eot-used-refresh-card{right:10px;width:112px;min-height:46px;padding:7px 8px}.eot-used-refresh-card span{font-size:4.9px}.eot-used-refresh-card b{font-size:13px}}';
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
