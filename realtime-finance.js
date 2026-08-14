/* Girişim Şehri • Gerçek Zamanlı Finans Koruması */
(function(){
  const MIGRATION_KEY='gs_realtime_finance_v1';

  function persistCareer(){
    try{save();}catch(e){}
    try{simSave();}catch(e){}
    try{saveOwned();}catch(e){}
    try{
      const u=typeof currentAccount==='function'?currentAccount():null;
      if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id);
    }catch(e){}
  }

  function removeLegacyGameMonthData(){
    try{
      if(Array.isArray(tx)){
        tx=tx.filter(x=>!(x&&x.type==='monthly_close')&&!String(x&&x.sym||'').toLocaleLowerCase('tr-TR').includes('oyun ayı'));
      }
      if(sim&&typeof sim==='object'){
        // Eski 5 dakikalık oyun-ayı muhasebesini kalıcı olarak devre dışı bırak.
        sim.cycleDue=Number.MAX_SAFE_INTEGER;
        sim.lastCycle=Date.now();
      }
      localStorage.setItem(MIGRATION_KEY,'1');
      persistCareer();
    }catch(e){console.warn('Gerçek zamanlı finans geçişi:',e)}
  }

  function disableLegacyGameMonthAccounting(){
    try{processAccountingCycle=function(){return false}}catch(e){}
    try{closeGameMonth=function(){return false}}catch(e){}
    // Bu fonksiyon artık otomatik dönem kapanışında kredi çekmeyecek.
    try{processMonthlyLoanPayments=function(){return {due:0,paid:0,missed:0}}}catch(e){}
  }

  function advanceOneMonth(timestamp){
    const d=new Date(Number(timestamp)||Date.now());
    const day=d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth()+1);
    const lastDay=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
    d.setDate(Math.min(day,lastDay));
    return d.getTime();
  }

  function processRealDueLoans(){
    try{
      if(!Array.isArray(loans))return;
      const now=Date.now();
      let changed=false;
      loans.forEach(l=>{
        if(!l||l.closed||Number(l.remaining||0)<=0)return;
        const dueAt=Number(l.nextDue||0);
        if(!dueAt||now<dueAt)return; // Vade gelmeden kesinlikle otomatik tahsilat yok.

        const amount=Math.min(Number(l.installment||0),Number(l.remaining||0));
        if(amount<=0)return;

        if(Number(cash||0)>=amount){
          cash-=amount;
          l.remaining=Math.max(0,Number(l.remaining||0)-amount);
          l.paidCount=Number(l.paidCount||0)+1;
          l.nextDue=advanceOneMonth(dueAt);
          l.lastAutoPaidDue=dueAt;
          try{trusts[l.id]=clamp((trusts[l.id]||50)+3,0,100)}catch(e){}
          try{reputation=clamp(Number(reputation||0)+1,0,100)}catch(e){}
          tx.unshift({t:Date.now(),kind:'loan',type:'installment',sym:l.name,total:amount,scheduledDue:dueAt,automatic:true});

          if(l.remaining<=.01){
            l.remaining=0;l.closed=true;
            try{if(!l.hadLate)creditScore=clamp(Number(creditScore||0)+8,0,100)}catch(e){}
            try{if(l.collateralId){const a=ownedAssets.find(x=>x.id===l.collateralId);if(a)a.collateral=false}}catch(e){}
          }
          changed=true;
        }else if(l.lastMissedDue!==dueAt){
          // Para yoksa otomatik olarak bakiye eksiye düşmez ve para çekilmez.
          l.lastMissedDue=dueAt;
          l.hadLate=true;
          try{lateCount=Number(lateCount||0)+1}catch(e){}
          try{creditScore=clamp(Number(creditScore||0)-6,0,100)}catch(e){}
          try{reputation=clamp(Number(reputation||0)-2,0,100)}catch(e){}
          changed=true;
        }
      });

      if(changed){
        persistCareer();
        try{render();renderFinanceExtras();renderGameExtras()}catch(e){}
      }
    }catch(e){console.warn('Gerçek vade kontrolü:',e)}
  }

  function hideLegacyGameMonthUI(){
    try{
      const home=document.getElementById('homeCycle');
      if(home){const card=home.closest('.home-status-row > div');if(card)card.remove()}
      document.querySelectorAll('[data-v-game-month]').forEach(x=>x.remove());
    }catch(e){}
  }

  disableLegacyGameMonthAccounting();
  if(localStorage.getItem(MIGRATION_KEY)!=='1')removeLegacyGameMonthData();
  else{
    try{if(sim&&typeof sim==='object')sim.cycleDue=Number.MAX_SAFE_INTEGER}catch(e){}
  }
  hideLegacyGameMonthUI();
  processRealDueLoans();

  // Gerçek saat üzerinden vade kontrolü. Vade gelmediyse hiçbir finansal hareket yapmaz.
  setInterval(processRealDueLoans,60000);
  setInterval(hideLegacyGameMonthUI,1500);
})();
