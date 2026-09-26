/* Empire of Trade • Ekonomi Dengeleme V1 */
(function(){
  'use strict';
  if(window.__eotEconomyBalanceV1)return;
  window.__eotEconomyBalanceV1=true;

  const HOUR=60*60*1000;
  const RENT_COOLDOWN=6*HOUR;
  const FACTORY_TIMES={1:10*60*1000,2:8*60*1000,3:6*60*1000};
  const FACTORY_COST_PER_LEVEL=650000;
  const FACTORY_REVENUE_PER_LEVEL=760000;

  function notify(msg){try{if(typeof toast==='function')toast(msg)}catch(e){}}
  function fmtTime(ms){
    const m=Math.max(1,Math.ceil(ms/60000));
    if(m<60)return m+' dk';
    const h=Math.floor(m/60),r=m%60;
    return h+' sa'+(r?' '+r+' dk':'');
  }

  function install(){
    try{
      if(typeof startFactoryBatch!=='function'||typeof collectRent!=='function'||typeof startPlannedProject!=='function')return false;
      if(startFactoryBatch.__eotBalanced)return true;

      const balancedFactory=function(){
        if(!owns('factory_basic')){notify('Önce fabrikayı kur');return}
        if(factoryOp.status==='running'){notify('Üretim zaten devam ediyor');return}
        if(factoryOp.status==='ready'){notify('Önce hazır ürünü sat');return}
        const level=Math.max(1,Math.min(3,Number(factoryLevel||1)));
        const cost=FACTORY_COST_PER_LEVEL*level;
        const duration=FACTORY_TIMES[level]||FACTORY_TIMES[1];
        if((sim.raw||0)<10){notify('Üretim için 10 birim hammadde gerekli');return}
        if(cash<cost){notify('Üretim için '+money(cost)+' gerekli');return}
        sim.raw-=10;
        cash-=cost;
        simSave();
        const bonus=(typeof employeeStats==='function'?Number(employeeStats().bonus||0):0);
        factoryOp={status:'running',finish:Date.now()+duration,cost,revenue:FACTORY_REVENUE_PER_LEVEL*level*(1+bonus/100)};
        tx.unshift({t:Date.now(),kind:'business',type:'factory_start',sym:'Üretim Partisi',total:cost});
        saveOwned();save();render();renderGameExtras();
        notify('Üretim başladı • Tahmini süre '+fmtTime(duration));
      };
      balancedFactory.__eotBalanced=true;
      startFactoryBatch=balancedFactory;
      window.startFactoryBatch=balancedFactory;

      const balancedRent=function(index){
        const a=ownedAssets[index];
        if(!a||a.type!=='Gayrimenkul')return;
        const ready=Number(a.rentReady||0);
        if(Date.now()<ready){notify('Kira henüz hazır değil • '+fmtTime(ready-Date.now())+' kaldı');return}
        const rent=Number(a.rent||42000);
        cash+=rent;
        a.rentReady=Date.now()+RENT_COOLDOWN;
        sim.currentMonth.revenue+=rent;
        simSave();
        tx.unshift({t:Date.now(),kind:'income',type:'rent_collect',sym:a.name,total:rent});
        saveOwned();save();render();renderGameExtras();
        notify('Kira geliri • +'+money(rent)+' • Yeni kira 6 saat sonra');
      };
      balancedRent.__eotBalanced=true;
      collectRent=balancedRent;
      window.collectRent=balancedRent;

      const balancedConstruction=function(){
        const n=constructionPlanNumbers(),land=ownedAssets.find(a=>a.id===selectedLandId&&a.type==='Arsa');
        if(!n||!land){notify('Proje veya arsa eksik');return}
        if(!sim.constructionPlan.permit){notify('Önce yapı ruhsatını almalısın');return}
        const remaining=n.total-Number(sim.constructionPlan.permitPaid||0);
        if(cash<remaining){notify('Proje bütçesi için '+money(remaining)+' gerekli');return}
        cash-=remaining;
        const duration=Math.max(5*60*1000,Math.round(Number(n.days||1)*60*1000));
        constructionOp={status:'running',finish:Date.now()+duration,cost:n.total,revenue:n.p.revenue,projectName:n.p.name,landId:land.id,kind:sim.constructionPlan.kind,days:n.days,riskCost:n.riskCost};
        sim.currentMonth.expense+=remaining;
        tx.unshift({t:Date.now(),kind:'business',type:'construction_start',sym:n.p.name,total:n.total});
        sim.constructionPlan={kind:'',permit:false,architect:'standard',contractor:'economy'};
        saveOwned();simSave();save();render();renderGameExtras();location.hash='construction_ops';
        notify(n.p.name+' başladı • Tahmini süre '+fmtTime(duration));
      };
      balancedConstruction.__eotBalanced=true;
      startPlannedProject=balancedConstruction;
      window.startPlannedProject=balancedConstruction;

      localStorage.setItem('eot_economy_balance_v1','1');
      return true;
    }catch(e){console.warn('Ekonomi dengeleme kurulamadı:',e);return false}
  }

  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(install()||tries>80)clearInterval(timer);
  },100);
  setTimeout(install,0);
  window.addEventListener('pageshow',install);
})();