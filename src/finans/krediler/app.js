/* EOT_PART app.js-active */
function active(){return loans.filter(l=>!l.closed&&Number(l.remaining||0)>.01)}
/* EOT_END */
/* EOT_PART app.js-debt */
function debt(){return active().reduce((s,l)=>s+Number(l.remaining||0),0)}
/* EOT_END */
/* EOT_PART app.js-acceptLoan */
function acceptLoan(id,name,limit,rate,maxTerm){
 let amount=Number(document.getElementById('loanamt_'+id)?.value),months=Number(document.getElementById('loanterm_'+id)?.value);
 if(!amount||amount<100000||amount>limit){toast('Kredi tutarı geçersiz');if(event&&event.preventDefault)event.preventDefault();return false}
 if(!months||months<1||months>maxTerm||months>6){toast('Vade 1-6 ay olmalı');if(event&&event.preventDefault)event.preventDefault();return false}
 let trust=Number(trusts[id]||50),assess=creditAssessment(limit,trust),nw=assess.nw;
 let allowed=Math.min(limit,Math.max(250000,assess.limit));
 if(creditScore<20||trust<20||amount>allowed){toast('Onaylanan limit: '+money(allowed));if(event&&event.preventDefault)event.preventDefault();return false}
 let r=Math.max(.5,rate+(creditScore<40?.6:creditScore>=80?-.3:0)+(trust>=80?-.2:trust<40?.4:0)+((sim.macro?.rate||42.5)-42.5)/25+currentNews().credit*2);
 let total=amount*(1+(r/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 cash+=amount;
 loans.push({id,name,amount,rate:r,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false});
 trusts[id]=clamp(trust+2,0,100);
 tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:name,total:amount});
 save();render();renderFinanceExtras();renderGameExtras();
 let st=document.getElementById('loanstatus_'+id);
 if(st)st.innerHTML='✅ Kredi kullanıldı • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';
 let title=document.getElementById('loan_success_'+id+'_title');
 let text=document.getElementById('loan_success_'+id+'_text');
 let detail=document.getElementById('loan_success_'+id+'_detail');
 if(title)title.textContent='✅ Kredi hesabına geçti';
 if(text)text.textContent=money(amount)+' nakit bakiyene eklendi.';
 if(detail)detail.innerHTML='Yeni nakit bakiyesi: <b>'+money(cash)+'</b> • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';
 toast(name+' kredisi hesabına geçti');
 return true
}
/* EOT_END */
/* EOT_PART app.js-payInstallment */
function payInstallment(i){let l=loans[i];if(!l||l.closed)return;let amt=Math.min(l.installment,l.remaining),late=Date.now()>l.nextDue;if(cash<amt){toast('Yetersiz nakit');return}cash-=amt;l.remaining=Math.max(0,l.remaining-amt);l.paidCount++;if(late){lateCount++;l.hadLate=true;creditScore=clamp(creditScore-10,0,100);trusts[l.id]=clamp((trusts[l.id]||50)-10,0,100)}else trusts[l.id]=clamp((trusts[l.id]||50)+5,0,100);let d=new Date(l.nextDue);d.setMonth(d.getMonth()+1);l.nextDue=d.getTime();tx.unshift({t:Date.now(),kind:'loan',type:'installment',sym:l.name,total:amt});if(l.remaining<=.01){l.closed=true;if(!l.hadLate)creditScore=clamp(creditScore+10,0,100);trusts[l.id]=clamp((trusts[l.id]||50)+5,0,100)}save();render();if(!late)reputation=clamp(reputation+1,0,100);else reputation=clamp(reputation-2,0,100);saveOwned();toast(l.closed?'Kredi kapandı':'Taksit ödendi')}
/* EOT_END */
/* EOT_PART app.js-closeLoan */
function closeLoan(i){let l=loans[i];if(!l||l.closed)return;let amt=l.remaining;if(cash<amt){toast('Erken kapama için yetersiz nakit');return}cash-=amt;l.remaining=0;l.closed=true;tx.unshift({t:Date.now(),kind:'loan',type:'early_close',sym:l.name,total:amt});trusts[l.id]=clamp((trusts[l.id]||50)+3,0,100);if(!l.hadLate)creditScore=clamp(creditScore+10,0,100);save();render();toast('Kredi erken kapatıldı')}
/* EOT_END */
/* EOT_PART app.js-renderLoans */
function renderLoans(){let e=document.getElementById('activeLoansList');if(!e)return;let list=loans.map((l,i)=>({l,i})).filter(o=>!o.l.closed&&o.l.remaining>.01);if(!list.length){e.innerHTML='<div class="info-card" style="text-align:center;color:var(--muted)">Aktif kredi bulunmuyor.</div>';return}e.innerHTML=list.map(o=>{let l=o.l,late=Date.now()>l.nextDue;return '<div class="loan-live"><h4>'+l.name+'</h4><p>Kalan: <b>'+money(l.remaining)+'</b> • Taksit: <b>'+money(Math.min(l.installment,l.remaining))+'</b></p><p>Sonraki ödeme: '+new Date(l.nextDue).toLocaleDateString('tr-TR')+' '+(late?'<span class="late-badge">GECİKMİŞ</span>':'')+'</p><p>Banka güveni: <b>'+Math.round(trusts[l.id]||50)+'</b></p><div class="paygrid"><button class="pay-now" onclick="payInstallment('+o.i+')">Taksiti Öde</button><button class="pay-close" onclick="closeLoan('+o.i+')">Erken Kapat</button></div></div>'}).join('')}
/* EOT_END */
/* EOT_PART app.js-collateralAssets */
function collateralAssets(){return ownedAssets.map((a,i)=>({a,i})).filter(o=>!o.a.collateral&&o.a.price>=1000000)}
/* EOT_END */
/* EOT_PART app.js-renderCollateral */
function renderCollateral(){
 let e=document.getElementById('collateralAssetList');if(!e)return;let list=collateralAssets();
 e.innerHTML=list.length?list.map(o=>{let max=Math.round(o.a.price*.5/1000)*1000;return '<div class="collateral-card"><b>'+o.a.name+'</b><span>'+o.a.type+' • Değer '+money(o.a.price)+' • Maksimum kredi '+money(max)+'</span><button onclick="takeSecuredLoan('+o.i+')">Teminat Göster ve Krediyi Kullan</button></div>'}).join(''):'<div class="info-card"><p>Teminata uygun serbest varlık bulunmuyor.</p></div>'
}
/* EOT_END */
/* EOT_PART app.js-takeSecuredLoan */
function takeSecuredLoan(index){
 let a=ownedAssets[index];if(!a||a.collateral){toast('Varlık teminata uygun değil');return}
 let amount=Math.round(a.price*.5/1000)*1000,months=6,rate=2.4,total=amount*(1+(rate/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 a.collateral=true;cash+=amount;loans.push({id:'secured',name:'Teminatlı Ticari Kredi',amount,rate,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false,collateralId:a.id});
 tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:'Teminatlı Ticari Kredi',total:amount});reputation=clamp(reputation+1,0,100);saveOwned();save();render();renderGameExtras();pushNotification('Teminatlı kredi',a.name+' teminatıyla '+money(amount)+' kredi bakiyene eklendi.');toast('Teminatlı kredi kullanıldı')
}
/* EOT_END */
/* EOT_PART app.js-processMonthlyLoanPayments */
function processMonthlyLoanPayments(){
 let due=0,paid=0,missed=0;
 active().forEach(l=>{
  let q=Math.min(Number(l.installment||0),Number(l.remaining||0));due+=q;
  if(q<=0)return;
  if(cash>=q){cash-=q;l.remaining=Math.max(0,l.remaining-q);l.paidCount=(l.paidCount||0)+1;paid+=q;let d=new Date();d.setMonth(d.getMonth()+1);l.nextDue=d.getTime();if(l.remaining<=.01){l.remaining=0;l.closed=true;creditScore=clamp(creditScore+5,0,100);if(l.collateralId){let a=ownedAssets.find(x=>x.id===l.collateralId);if(a)a.collateral=false}}}
  else{l.hadLate=true;missed+=q;lateCount++;creditScore=clamp(creditScore-6,0,100);reputation=clamp(reputation-3,0,100)}
 });
 return {due,paid,missed}
}
/* EOT_END */
/* EOT_PART app.js-useCreditCard */
function useCreditCard(){let q=Number(document.getElementById('ccSpendInput')?.value);if(!q||q<=0)return;let c=sim.creditCard;if(c.used+q>c.limit){toast('Kart limiti yetersiz');return}c.used+=q;c.statement+=q;cash+=q;simSave();save();render();renderGameExtras();toast('Karttan '+money(q)+' kullanılabilir nakde aktarıldı')}
/* EOT_END */
/* EOT_PART app.js-payCreditCard */
function payCreditCard(){let c=sim.creditCard;if(c.statement<=0){toast('Ödenecek ekstre yok');return}if(cash<c.statement){toast('Ekstre için nakit yetersiz');return}cash-=c.statement;c.used=Math.max(0,c.used-c.statement);c.statement=0;creditScore=clamp(creditScore+3,0,100);reputation=clamp(reputation+1,0,100);simSave();save();render();renderGameExtras();toast('Kredi kartı ekstresi ödendi')}
/* EOT_END */
/* EOT_PART app.js-restructureLoan */
function restructureLoan(i){let list=active(),l=list[i];if(!l)return;let fee=Math.round(l.remaining*.04);if(cash<fee){toast('Yapılandırma masrafı için nakit yetersiz');return}cash-=fee;l.months=Math.min(6,(l.months||1)+2);l.rate=Number(l.rate||3)+.45;l.total=l.remaining*(1+(l.rate/100)*l.months);l.remaining=l.total;l.installment=l.total/l.months;creditScore=clamp(creditScore-2,0,100);sim.currentMonth.expense+=fee;simSave();save();render();renderGameExtras();toast('Kredi yeniden yapılandırıldı')}
/* EOT_END */
/* EOT_PART app.js-renderRestructure */
function renderRestructure(){let e=document.getElementById('restructureList');if(!e)return;let list=active();e.innerHTML=list.length?list.map((l,i)=>'<div class="restructure-card"><b>'+l.name+'</b><span>Kalan '+money(l.remaining)+' • Taksit '+money(l.installment)+' • Masraf '+money(l.remaining*.04)+'</span><div class="mini-actions"><button onclick="restructureLoan('+i+')">+2 Ay Yapılandır</button></div></div>').join(''):'<div class="info-card"><p>Aktif kredi yok.</p></div>'}
/* EOT_END */
/* EOT_PART app.js-monthlyIncomeEstimate */
function monthlyIncomeEstimate(){let r=sim.monthlyHistory[0];return r?Math.max(0,Number(r.revenue||0)):ownedAssets.filter(a=>a.rented).reduce((s,a)=>s+Number(a.rent||0),0)+projectRentalIncome()}
/* EOT_END */
/* EOT_PART app.js-creditAssessment */
function creditAssessment(bankLimit,trust=50){
 let m=companyMetrics(),income=monthlyIncomeEstimate(),nw=totalWealth(),debtRatio=Math.max(0,debt())/Math.max(1,nw+debt()),history=Math.max(0,100-lateCount*12),score=.30*creditScore+.15*trust+.18*Math.min(100,income/100000)+.12*Math.min(100,m.profit/200000)+.15*Math.min(100,nw/1000000)+.10*history-35*debtRatio;
 score=clamp(score,0,100);let macro=currentNews().credit+((sim.macro?.rate||42.5)-42.5)/100,limit=Math.max(250000,bankLimit*(.18+.82*score/100)*(1-Math.min(.35,Math.max(-.15,macro))));
 return {score,limit,debtRatio,income,nw}
}
/* EOT_END */
/* EOT_PART app.js-renderBusinessCredit */
function renderBusinessCredit(){
 let c=selectedCompany(),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 if(!c){set('businessCreditLimit',money(0));set('businessScore','—');set('businessIncome',money(0));set('businessDebtRatio','%0');set('businessCreditCompanyTitle','Ticari Kredi');set('businessCreditCompanySubtitle','Önce bir şirket seç');return}
 let m=companyMetrics(),a=creditAssessment(Math.max(5000000,m.value*.75+10000000),70);
 set('businessCreditLimit',money(a.limit));set('businessScore',Math.round(a.score)+'/100');set('businessIncome',money(a.income));set('businessDebtRatio','%'+Math.round((m.debt/Math.max(1,m.value+m.debt))*100));
 set('businessCreditCompanyTitle',c.name+' • Ticari Kredi');set('businessCreditCompanySubtitle',c.name+' şirketinin bilançosuna göre finansman');
 let r=document.getElementById('businessCreditReason');if(r)r.textContent=a.score>=70?'Şirket finansalları güçlü. Ticari kredi erişimi yüksek.':a.score>=45?'Kredi verilebilir; borç ve kârlılık sınırlandırıcı olabilir.':'Şirket skoru düşük. Sermaye, kârlılık veya kredi geçmişini güçlendir.'
}
/* EOT_END */
/* EOT_PART app.js-takeBusinessCredit */
function takeBusinessCredit(){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');location.hash='business';return}
 let m=companyMetrics(),a=creditAssessment(Math.max(5000000,m.value*.75+10000000),70),amount=Number(document.getElementById('businessCreditAmount')?.value),months=Number(document.getElementById('businessCreditTerm')?.value||6);
 if(!amount||amount>a.limit){toast('Onaylanan ticari limit: '+money(a.limit));return}if(a.score<35){toast('Şirket skoru kredi için yetersiz');return}
 let base=2.4+(sim.macro.rate-42.5)/20+currentNews().credit*3,rate=Math.max(1.5,base),total=amount*(1+rate/100*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 c.companyCash=normalizeNumber(c.companyCash,0)+amount;syncSelectedCompanyToProfile();
 loans.push({id:'business_'+c.id+'_'+Date.now(),companyId:c.id,name:c.name+' Ticari Kredisi',amount,rate,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false,business:true});
 tx.unshift({t:Date.now(),kind:'loan',type:'business_loan_in',companyId:c.id,sym:c.name,total:amount});
 simSave();save();render();renderGameExtras();toast('Ticari kredi '+c.name+' şirket hesabına eklendi')
}
/* EOT_END */
