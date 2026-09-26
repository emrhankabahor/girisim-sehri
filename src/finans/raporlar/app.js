/* EOT_PART app.js-maintenanceCost */
function maintenanceCost(){return ownedAssets.reduce((s,a)=>s+(a.type==='Gayrimenkul'?Math.round(a.price*.0007):a.type==='Araç'?Math.round(a.price*.001):a.id==='factory_basic'?120000*factoryLevel:a.id==='construction_basic'?90000:0),0)}
/* EOT_END */
/* EOT_PART app.js-processAccountingCycle */
function processAccountingCycle(){closeGameMonth()}
/* EOT_END */
/* EOT_PART app.js-payTaxes */
function payTaxes(){let due=Number(sim.taxDue||0);if(due<=0){toast('Ödenecek vergi karşılığı yok');return}if(cash<due){toast('Vergi için yeterli nakit yok');return}cash-=due;sim.taxDue=0;tx.unshift({t:Date.now(),kind:'business',type:'tax_pay',sym:'Vergi Ödemesi',total:due});reputation=clamp(reputation+1,0,100);save();simSave();render();renderGameExtras();pushNotification('Vergi ödendi',money(due)+' vergi karşılığı kapatıldı.')}
/* EOT_END */
/* EOT_PART app.js-closeGameMonth */
function closeGameMonth(){
 let staff=employeeStats(),maint=maintenanceCost(),rent=ownedAssets.filter(a=>a.type==='Gayrimenkul'&&a.tenantStatus==='occupied').reduce((s,a)=>s+Number(a.rent||42000),0)+projectRentalIncome(),life=LIFESTYLES[sim.lifestyle||0];
 let officeRent=sim.companyProfile&&sim.companyProfile.capital>=1000000?75000:0,electricity=owns('factory_basic')?120000*factoryLevel:0,operations=Number(sim.currentMonth.expense||0);
 cash+=rent;
 let loan=processMonthlyLoanPayments(),deptTax=Math.max(.04,.08-deptLevel('finance')*.006),taxBase=Math.max(0,sim.currentMonth.revenue+rent-operations-staff.salary-maint-life.expense-officeRent-electricity-loan.paid),tax=Math.round(taxBase*deptTax);
 let fixed=staff.salary+maint+life.expense+officeRent+electricity+tax,payable=fixed;
 if(cash>=payable)cash-=payable;else{cash=0;creditScore=clamp(creditScore-5,0,100);reputation=clamp(reputation-4,0,100)}
 let cardPenalty=0;if(sim.creditCard.statement>0){cardPenalty=Math.round(sim.creditCard.statement*.035);sim.creditCard.used+=cardPenalty;sim.creditCard.statement+=cardPenalty;creditScore=clamp(creditScore-4,0,100);reputation=clamp(reputation-1,0,100)}let revenue=Number(sim.currentMonth.revenue||0)+rent,expense=operations+staff.salary+maint+life.expense+officeRent+electricity+loan.paid+tax+cardPenalty,net=revenue-expense;
 let rec={month:sim.gameMonth,revenue,expense,net,tax,salary:staff.salary,maintenance:maint,rent,officeRent,electricity,operations,loanPay:loan.paid,missedLoan:loan.missed,t:Date.now()};
 sim.monthlyHistory.unshift(rec);sim.monthlyHistory=sim.monthlyHistory.slice(0,12);let activeCompany=selectedCompany();if(activeCompany){activeCompany.monthlyHistory.unshift({...rec,companyId:activeCompany.id});activeCompany.monthlyHistory=activeCompany.monthlyHistory.slice(0,12);}sim.gameMonth++;sim.currentMonth={revenue:0,expense:0,tax:0};sim.lastCycle=Date.now();sim.lastExpense=expense;sim.cycleDue=Date.now()+300000;
 tx.unshift({t:Date.now(),kind:'business',type:'monthly_close',sym:'Oyun Ayı '+rec.month,total:Math.abs(net)});recordWealth();simSave();save();saveOwned();render();renderGameExtras();pushNotification('Aylık muhasebe kapandı','Ay '+rec.month+' net sonucu '+money(net)+(loan.missed?' • Ödenemeyen kredi taksiti var.':'')+'.')
}
/* EOT_END */
/* EOT_PART app.js-renderMonthlyReport */
function renderMonthlyReport(){
 let c=selectedCompany(),history=c&&Array.isArray(c.monthlyHistory)?c.monthlyHistory:sim.monthlyHistory,
     r=history[0]||{revenue:0,expense:0,net:0,tax:0,salary:0,maintenance:0,month:sim.gameMonth},
     set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('monthlyReportTitle',c?c.name+' • Aylık Rapor':'Aylık Finans Raporu');
 set('monthlyReportSubtitle',c?c.name+' şirketinin dönemsel gelir ve gider özeti':'Genel ekonomik dönem özeti');
 set('reportMonth',r.month||sim.gameMonth);set('reportRevenue',money(r.revenue||0));set('reportExpense',money(r.expense||0));set('reportNet',money(r.net||0));set('reportTax',money(r.tax||0));set('reportSalary',money(r.salary||0));set('reportMaintenance',money(r.maintenance||0));set('reportRent',money(r.rent||0));set('reportPersonnel',money(r.salary||0));set('reportOfficeRent',money(r.officeRent||0));set('reportElectricity',money(r.electricity||0));set('reportOperations',money(r.operations||0));set('reportLoanPay',money(r.loanPay||0));set('reportTaxDetail',money(r.tax||0));set('homeCycle',sim.gameMonth);
 let h=document.getElementById('monthlyHistory');if(h)h.innerHTML=history.slice(0,8).map(x=>'<div class="history-row"><span>Ay '+x.month+'</span><b class="'+(x.net>=0?'gain':'loss')+'">'+money(x.net)+'</b></div>').join('')||'<div class="info-card"><p>Henüz tamamlanmış dönem yok.</p></div>'
}
/* EOT_END */
