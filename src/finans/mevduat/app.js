/* EOT_PART app.js-openDeposit */
function openDeposit(months,rate,inputId){
  let el=document.getElementById(inputId),amount=Number(el&&el.value);
  let min=months===1?250000:months===3?500000:1000000;
  if(!Number.isFinite(amount)||amount<min){toast('Minimum tutarın altında');event&&event.preventDefault&&event.preventDefault();return false}
  if(cash<amount){toast('Yetersiz nakit');event&&event.preventDefault&&event.preventDefault();return false}
  cash-=amount;
  let macroAdj=((sim.macro?.rate||42.5)-42.5)*.18,actualRate=Math.max(.5,rate+macroAdj),maturity=Date.now()+months*30*24*60*60*1000,ret=amount*(actualRate/100);rate=actualRate;
  deposits.push({months,rate,amount,ret,maturity,t:Date.now()});
  tx.unshift({t:Date.now(),kind:'deposit',type:'deposit_open',sym:months+' Ay Vadeli',total:amount});
  let t=document.getElementById('depositResultTitle'),x=document.getElementById('depositResultText'),d=document.getElementById('depositResultDetail');
  if(t)t.textContent='✅ '+months+' aylık vadeli hesap açıldı';
  if(x)x.textContent=money(amount)+' vadeli hesaba aktarıldı.';
  if(d)d.innerHTML='Vade sonu tahmini getiri: <b>'+money(ret)+'</b> • Vade tarihi: <b>'+new Date(maturity).toLocaleDateString('tr-TR')+'</b>';
  saveDeposits();save();render();toast('Vadeli hesap açıldı');return true
}
/* EOT_END */
/* EOT_PART app.js-depositStats */
function depositStats(){
  return {total:deposits.reduce((s,d)=>s+Number(d.amount||0),0),ret:deposits.reduce((s,d)=>s+Number(d.ret||0),0)}
}
/* EOT_END */
/* EOT_PART app.js-renderDeposits */
function renderDeposits(){
  let ds=depositStats(),c=document.getElementById('depositCount'),t=document.getElementById('depositTotal'),r=document.getElementById('depositReturn'),list=document.getElementById('depositList');
  if(c)c.textContent=deposits.length;if(t)t.textContent=money(ds.total);if(r)r.textContent=money(ds.ret);
  if(list)list.innerHTML=deposits.length?deposits.map(d=>'<div class="portfolio-row"><div><b>'+d.months+' Ay Vadeli</b><br><span>Vade: '+new Date(d.maturity).toLocaleDateString('tr-TR')+' • %'+String(d.rate).replace('.',',')+'</span></div><div style="text-align:right"><b>'+money(d.amount)+'</b><br><span class="profit">+'+money(d.ret)+'</span></div></div>').join(''):'<div class="portfolio-row"><span>Aktif vadeli hesap yok.</span><b>—</b></div>'
}
/* EOT_END */
