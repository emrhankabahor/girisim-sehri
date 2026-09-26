/* EOT_PART app.js-toast */
function toast(t){let e=document.getElementById('toast');if(!e)return;e.textContent=t;e.style.display='block';clearTimeout(window.__t);window.__t=setTimeout(()=>e.style.display='none',1800)}
/* EOT_END */
/* EOT_PART app.js-render */
function render(){document.querySelectorAll('[data-cash]').forEach(e=>e.textContent=money(cash));renderAssets();let s=stats('stock'),c=stats('crypto'),g=stats('gold'),inv=s.value+c.value+g.value,d=debt(),net=cash+inv+ownedValue()+depositStats().total-d;[['stock',s],['crypto',c],['gold',g]].forEach(([k,o])=>{let v=document.getElementById(k+'Value'),p=document.getElementById(k+'Pnl');if(v)v.textContent=money(o.value);if(p){p.textContent=money(o.pnl);p.className=o.pnl>=0?'profit':'loss2'}});document.getElementById('totalInvestment')&&(document.getElementById('totalInvestment').textContent=money(inv));document.getElementById('netWorth')&&(document.getElementById('netWorth').textContent=money(net));['totalDebtFinance','activeDebtBank','activeDebtLoans'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=money(d)});['activeLoanCount','activeLoanCountLoans'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=active().length});['creditScoreFinance','creditScoreLoans','creditScoreBank'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=creditScore});let avg=Math.round(Object.values(trusts).reduce((a,b)=>a+Number(b||0),0)/6);document.getElementById('avgTrust')&&(document.getElementById('avgTrust').textContent=avg);Object.keys(trusts).forEach(id=>{let e=document.getElementById('trust_'+id);if(e)e.textContent=Math.round(trusts[id])});document.getElementById('lateCount')&&(document.getElementById('lateCount').textContent=lateCount);let fh=document.getElementById('financeHealth');if(fh)fh.textContent=d===0?'Borç bulunmuyor. Finansal profilin dengeli.':d>cash+inv?'Borç yükün yüksek. Yeni kredi tekliflerin zorlaşabilir.':'Borç seviyen yönetilebilir durumda.';portfolio('stock','stockPortfolioRows');portfolio('crypto','cryptoPortfolioRows');portfolio('gold','goldPortfolioRows');renderTx();renderLoans()}
/* EOT_END */
/* EOT_PART app.js-renderFinanceExtras */
function renderFinanceExtras(){
  let s=stats('stock'),c=stats('crypto'),g=stats('gold'),inv=s.value+c.value+g.value,den=inv||1;
  let as=document.getElementById('allocStock'),ac=document.getElementById('allocCrypto'),ag=document.getElementById('allocGold');
  if(as)as.textContent='%'+Math.round(s.value/den*100);if(ac)ac.textContent='%'+Math.round(c.value/den*100);if(ag)ag.textContent='%'+Math.round(g.value/den*100);
  let d=debt(),liq=(cash+inv)>0?cash/(cash+inv):0,lr=document.getElementById('liquidityRatio'),hf=document.getElementById('healthFill'),risk=document.getElementById('riskLabel');
  if(lr)lr.textContent='%'+Math.round(liq*100);if(hf)hf.style.width=Math.max(8,Math.min(100,liq*100))+'%';
  if(risk)risk.textContent=d===0?'Dengeli':d>cash+inv?'Yüksek Risk':'Kontrollü';
  let monthly=active().reduce((sum,l)=>sum+Math.min(Number(l.installment||0),Number(l.remaining||0)),0)+operatingStats().expense;
  let mo=document.getElementById('monthlyObligation'),ml=document.getElementById('monthlyLoanPayment'),bc=document.getElementById('budgetLoanCount');
  if(mo)mo.textContent=money(monthly);if(ml)ml.textContent=money(monthly);if(bc)bc.textContent=active().length;
  let base=cash+inv,ratio=base>0?Math.min(999,d/base*100):0,dr=document.getElementById('debtRatio'),df=document.getElementById('debtRatioFill'),ba=document.getElementById('budgetAdvice');
  if(dr)dr.textContent='%'+Math.round(ratio);if(df)df.style.width=Math.min(100,ratio)+'%';
  if(ba)ba.textContent=d===0?'Aktif borcun bulunmuyor. Yeni yatırım fırsatları için nakit tamponu koruyabilirsin.':ratio>80?'Borç yükün yüksek. Yeni kredi yerine mevcut borcu azaltmak daha güvenli.':ratio>40?'Borç seviyen orta. Yeni yatırım öncesi taksit yükünü kontrol et.':'Borç seviyen kontrollü durumda.';
  renderDeposits()
}
/* EOT_END */
/* EOT_PART app.js-updateOps */
function updateOps(){
 if(factoryOp.status==='running'&&Date.now()>=factoryOp.finish)factoryOp.status='ready';
 if(constructionOp.status==='running'&&Date.now()>=constructionOp.finish)constructionOp.status='ready';
 let fs=document.getElementById('factoryStatus'),ft=document.getElementById('factoryOpsTitle'),fx=document.getElementById('factoryOpsText'),fb=document.getElementById('factoryStartBtn'),fc=document.getElementById('factoryCollectBtn');
 if(!owns('factory_basic')){if(fs)fs.innerHTML='<strong>Durum</strong><p>Tesis henüz kurulmadı.</p>';if(ft)ft.textContent='Kurulu değil';if(fx)fx.textContent='Üretim başlatmak için önce fabrikayı kurmalısın.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}
 else{if(fs)fs.innerHTML='<strong>Durum</strong><p>Fabrika aktif ve üretime hazır.</p>';if(factoryOp.status==='idle'){if(ft)ft.textContent='Üretime hazır';if(fx)fx.textContent=money(550000*factoryLevel)+' maliyetle yeni üretim partisi başlatabilirsin.';if(fb){fb.removeAttribute('disabled');fb.removeAttribute('aria-disabled')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}else if(factoryOp.status==='running'){let sec=Math.max(0,Math.ceil((factoryOp.finish-Date.now())/1000));if(ft)ft.textContent='Üretimde';if(fx)fx.textContent='Parti tamamlanmasına yaklaşık '+sec+' saniye kaldı.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}else{if(ft)ft.textContent='Ürün hazır';if(fx)fx.textContent='Üretim tamamlandı. Ürünü satarak '+money(factoryOp.revenue||800000*factoryLevel)+' gelir elde edebilirsin.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.removeAttribute('disabled');fc.removeAttribute('aria-disabled')}}}
 let cs=document.getElementById('constructionStatus'),ct=document.getElementById('constructionOpsTitle'),cx=document.getElementById('constructionOpsText'),cc=document.getElementById('constructionCollectBtn'),pc=document.getElementById('projectCost'),pr=document.getElementById('projectRevenue'),pd=document.getElementById('projectDuration');
 if(!owns('construction_basic')){if(cs)cs.innerHTML='<strong>Durum</strong><p>Şirket henüz kurulmadı.</p>';if(ct)ct.textContent='Şirket yok';if(cx)cx.textContent='Proje başlatmak için önce inşaat şirketi kurmalısın.';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}
 else{if(cs)cs.innerHTML='<strong>Durum</strong><p>Şirket aktif ve arsa geliştirebilir.</p>';if(constructionOp.status==='idle'){if(ct)ct.textContent='Proje yok';if(cx)cx.textContent='Arsalarımı Gör bölümünden arsa ve proje türü seç.';if(pc)pc.textContent='—';if(pr)pr.textContent='—';if(pd)pd.textContent='—';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}else if(constructionOp.status==='running'){let sec=Math.max(0,Math.ceil((constructionOp.finish-Date.now())/1000));if(ct)ct.textContent=constructionOp.projectName||'Proje';if(cx)cx.textContent='Projenin tamamlanmasına yaklaşık '+sec+' oyun günü kaldı.';if(pc)pc.textContent=money(constructionOp.cost);if(pr)pr.textContent=money(constructionOp.revenue);if(pd)pd.textContent=sec+' gün';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}else{if(ct)ct.textContent=(constructionOp.projectName||'Proje')+' hazır';if(cx)cx.textContent='İnşaat tamamlandı. Projeyi bağımsız bölümlere ayırabilirsin.';if(pc)pc.textContent=money(constructionOp.cost);if(pr)pr.textContent=money(constructionOp.revenue);if(pd)pd.textContent='Tamamlandı';if(cc){cc.removeAttribute('disabled');cc.removeAttribute('aria-disabled')}}}
 saveOwned()
}
/* EOT_END */
/* EOT_PART app.js-renderEconomy */
function renderEconomy(){
 let e=currentEconomy();
 let q=id=>document.getElementById(id);
 if(q('economyHeadline'))q('economyHeadline').textContent=e.title;
 if(q('economyImpact'))q('economyImpact').textContent=e.body;
 if(q('marketMood'))q('marketMood').textContent=e.mood;
 if(q('economyMoodIcon'))q('economyMoodIcon').textContent=e.icon;
 if(q('economyMoodTitle'))q('economyMoodTitle').textContent=e.mood;
 if(q('economyMoodText'))q('economyMoodText').textContent=e.body;
 if(q('economyNewsTitle'))q('economyNewsTitle').textContent=e.title;
 if(q('economyNewsBody'))q('economyNewsBody').textContent=e.body;
 if(q('economyNewsImpact'))q('economyNewsImpact').textContent='Borsa: '+(e.stock>0?'pozitif':e.stock<0?'negatif':'nötr')+' • Kripto: '+(e.crypto>0?'pozitif':e.crypto<0?'negatif':'nötr')+' • Altın: '+(e.gold>0?'pozitif':e.gold<0?'negatif':'nötr');
 if(q('economyTimer'))q('economyTimer').textContent=Math.max(0,Math.ceil((economyState.until-Date.now())/1000))+' sn'
}
/* EOT_END */
/* EOT_PART app.js-renderRealism */
function renderRealism(){
 let o=operatingStats(),xp=gameXp(),lvl=Math.floor(xp/100),within=xp%100;
 let set=(id,val)=>{let e=document.getElementById(id);if(e)e.textContent=val};
 set('homeReputation',Math.round(reputation));set('profileReputation',Math.round(reputation));set('characterRep',Math.round(reputation));
 set('homeAssetCount',ownedAssets.length);set('homeDebt',money(debt()));set('homeCashflow',money(o.net));
 set('operatingExpense',money(o.expense));set('estimatedIncome',money(o.rental));set('netCashflow',money(o.net));
 set('characterLevel',lvl);set('characterXp',xp);set('characterTitle','Girişimci • Seviye '+lvl);set('xpText',within+' / 100 XP');
 let fill=document.getElementById('xpFill');if(fill)fill.style.width=within+'%';
 renderEconomy()
}
/* EOT_END */
/* EOT_PART app.js-renderSimulation */
function renderSimulation(){
 let st=employeeStats(),arr=selectedCompanyEmployees(),c=selectedCompany(),set=(id,val)=>{let e=document.getElementById(id);if(e)e.textContent=val},now=new Date();
 set('managementClock',now.toLocaleTimeString('tr-TR'));set('managementDate',now.toLocaleDateString('tr-TR'));
 let sec=Math.max(0,Math.ceil((normalizeNumber(sim.cycleDue,Date.now()+300000)-Date.now())/1000));set('cycleCountdown',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));set('riskLabel',riskScore());
 set('companyNameLabel',c?c.name:'Şirket seçilmedi');
 let ci=document.getElementById('companyNameInput');if(ci&&document.activeElement!==ci)ci.value=c?c.name:'';
 set('employeeCount',arr.length);set('employeesTotal',arr.length);set('staffCountLabel',arr.length+' kişi');set('salaryTotal',money(st.salary));set('employeeBonus','%'+st.bonus);set('companyRep',Math.round(reputation));
 let cm=companyMetrics();set('companyValue',money(c?cm.value:0));set('companyTier',!c?'Şirket seçilmedi':cm.value>=100000000?'Kurumsal Ölçek':cm.value>=25000000?'Orta Ölçekli Şirket':cm.value>=5000000?'KOBİ':'Mikro İşletme');
 set('rawStock',(c?normalizeNumber(c.raw,0):0)+' birim');set('rawStockValue',money((c?normalizeNumber(c.raw,0):0)*25000));set('taxDue',money(sim.taxDue||0));set('taxSalary',money(st.salary));set('maintenanceExpense',money(maintenanceCost()));set('lastCycleExpense',money(sim.lastExpense||0));
 let list=document.getElementById('employeeList');if(list)list.innerHTML=arr.length?arr.map((e,i)=>'<div class="staff-row"><div><b>'+e.role+'</b><span>'+money(e.salary)+'/ay • +%'+e.bonus+' verim</span></div><button onclick="fireEmployee('+i+')">Çıkar</button></div>').join(''):'<p>Bu şirkette henüz çalışan yok.</p>';
 set('employeesCompanyTitle',c?c.name+' • Personel':'Personel');
 set('employeesCompanySubtitle',c?c.name+' şirketinin işe alım, maaş ve verim yönetimi':'Önce bir şirket seç');
 set('companyPerformance',c?(c.monthlyHistory?.length?'Son dönem net sonucu '+money(c.monthlyHistory[0].net||0)+'. İtibar: '+Math.round(reputation)+'/100.':'Bu şirket için henüz tamamlanmış muhasebe dönemi yok.'):'Önce bir şirket seç.');
 renderNotifications();renderAchievements();renderNpcOffers();
 if(Date.now()>=normalizeNumber(sim.cycleDue,Date.now()+300000))processAccountingCycle()
}
/* EOT_END */
/* EOT_PART app.js-renderAdvanced */
function renderAdvanced(){let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v},m=sim.macro;set('macroRate','%'+String(m.rate).replace('.',','));set('macroInflation','%'+String(m.inflation).replace('.',','));set('macroGrowth','%'+String(m.growth).replace('.',','));set('macroCycle',m.cycle);set('macroImpact',m.cycle==='Sıkılaşma'?'Kredi maliyetleri yükselir.':m.cycle==='Büyüme'?'Yatırım ve satış talebi güçlenir.':m.cycle==='Durgunluk'?'Satış hızı ve yatırım talebi düşebilir.':'Piyasalar dengeli seyrediyor.');let c=sim.creditCard;set('ccLimit',money(c.limit));set('ccUsed',money(c.used));set('ccAvailable',money(Math.max(0,c.limit-c.used)));set('ccStatement',money(c.statement));renderCompetitors();renderTenders();renderRestructure();renderIpos();renderLifestyle();renderVehicleService();renderRenovation();renderWealth()}
/* EOT_END */
/* EOT_PART app.js-renderV140 */
function renderV140(){renderConstructionPlan();renderCompanyFoundation();renderCompanyPortfolio();renderSelectedCompanyActivity();renderSetupStep();
 ensureAssetMetadata();processTenantSearch();renderCompanySetup();renderBusinessCredit();renderStockResearch();renderEconomicNews();renderDetailedUsed();renderBrandDealers();renderNeighborhoods();renderCrisis();saveUnifiedState()
}
/* EOT_END */
/* EOT_PART app.js-renderV141 */
function renderV141(){
 let set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 let invest=stats('stock').value+stats('crypto').value+stats('gold').value+sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0);
 set('financeCreditScore',Math.round(creditScore));
 set('financeDebt',money(debt()+Number(sim.creditCard?.used||0)));
 set('financeInvestments',money(invest));
}
/* EOT_END */
/* EOT_PART app.js-renderGameExtras */
function renderGameExtras(){
 renderOwned();renderDevelopableLands();renderFactoryUpgrade();updateOps();renderMissions();renderBusinessSummary();renderActivity();renderRealism();renderSimulation();renderCollateral();renderDealer();renderCityOwnership();renderDynamicMarket();renderProjectPortfolio();renderPropertyManagement();renderMonthlyReport();renderAdvanced();
 let total=totalWealth();
 let hn=document.getElementById('homeNetWorth');if(hn)hn.textContent=money(total);let bn=document.getElementById('bankNetWorth');if(bn)bn.textContent=money(total);
 let hl=document.getElementById('homeLevel');if(hl)hl.textContent=gameLevel();
 let pn=document.getElementById('profileNet');if(pn)pn.textContent=money(total);
 let pl=document.getElementById('profileLevelText');if(pl)pl.textContent='Girişimci • Seviye '+gameLevel();
 let pc=document.getElementById('profileCredit');if(pc)pc.textContent=creditScore;
 let pac=document.getElementById('profileAssetCount');if(pac)pac.textContent=ownedAssets.length;
 let pt=document.getElementById('profileTxCount');if(pt)pt.textContent=tx.length;
}
/* EOT_END */
