/* EOT_PART app.js-currentEconomy */
function currentEconomy(){
 let e=ECONOMY_EVENTS.find(x=>x.id===economyState.id)||ECONOMY_EVENTS[0];
 if(!economyState.until||Date.now()>economyState.until){
   e=ECONOMY_EVENTS[Math.floor(Math.random()*ECONOMY_EVENTS.length)];
   economyState={id:e.id,until:Date.now()+60000};saveOwned()
 }
 return e
}
/* EOT_END */
/* EOT_PART app.js-operatingStats */
function operatingStats(){
 let rental=ownedAssets.filter(a=>a.type==='Gayrimenkul'&&a.tenantStatus==='occupied').reduce((s,a)=>s+Number(a.rent||42000),0)+projectRentalIncome();
 let expense=ownedAssets.reduce((s,a)=>s+(a.type==='Gayrimenkul'?Math.round(a.price*.0012):a.type==='Araç'?Math.round(a.price*.0015):a.id==='factory_basic'?180000*factoryLevel:a.id==='construction_basic'?120000:0),0);
 let loanPay=active().reduce((s,l)=>s+Math.min(Number(l.installment||0),Number(l.remaining||0)),0);
 return {rental,expense,loanPay,net:rental-expense-loanPay}
}
/* EOT_END */
/* EOT_PART app.js-advanceMacroCycle */
function advanceMacroCycle(){
 const cycles=[
 {cycle:'Dengeli',rate:42.5,inflation:31.2,growth:3.1},
 {cycle:'Sıkılaşma',rate:48,inflation:27,growth:1.8},
 {cycle:'Büyüme',rate:36,inflation:33,growth:5.0},
 {cycle:'Durgunluk',rate:40,inflation:24,growth:-.8}
 ];
 let n=cycles.findIndex(x=>x.cycle===sim.macro.cycle);sim.macro=cycles[(n+1)%cycles.length];simSave();renderAdvanced();renderV140();renderV141();pushNotification('Ekonomik dönem',sim.macro.cycle+' dönemine geçildi.')
}
/* EOT_END */
/* EOT_PART app.js-currentNews */
function currentNews(){
 let e=NEWS_EVENTS.find(x=>x.id===sim.news.id)||NEWS_EVENTS[0];
 if(!sim.news.until||Date.now()>sim.news.until){sim.news={id:'neutral',until:Date.now()+180000};simSave();return NEWS_EVENTS[0]}
 return e
}
/* EOT_END */
/* EOT_PART app.js-nextEconomicNews */
function nextEconomicNews(){let choices=NEWS_EVENTS.filter(x=>x.id!=='neutral'),e=choices[Math.floor(Math.random()*choices.length)];sim.news={id:e.id,until:Date.now()+180000};simSave();renderEconomicNews();pushNotification('Ekonomik haber',e.title)}
/* EOT_END */
/* EOT_PART app.js-renderEconomicNews */
function renderEconomicNews(){let e=currentNews(),set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('activeNewsIcon',e.icon);set('activeNewsTitle',e.title);set('activeNewsText',e.text);set('impactHousing',(e.housing>=0?'+':'')+Math.round(e.housing*100)+'%');set('impactAuto',(e.auto>=0?'+':'')+Math.round(e.auto*100)+'%');set('impactStock',(e.stock>=0?'+':'')+Math.round(e.stock*100)+'%');set('impactCrypto',(e.crypto>=0?'+':'')+Math.round(e.crypto*100)+'%');set('impactGold',(e.gold>=0?'+':'')+Math.round(e.gold*100)+'%');set('impactCredit',(e.credit>=0?'+':'')+Math.round(e.credit*100)+'%')}
/* EOT_END */
