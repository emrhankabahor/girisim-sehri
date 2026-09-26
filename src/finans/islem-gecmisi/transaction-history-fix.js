/* Empire of Trade • İşlem geçmişi sınıflandırma düzeltmesi */
(function(){
'use strict';
if(window.__eotTransactionHistoryFix)return;
window.__eotTransactionHistoryFix=true;

function fmtMoney(n){
  try{return typeof money==='function'?money(Number(n||0)):'₺'+Math.abs(Number(n||0)).toLocaleString('tr-TR',{maximumFractionDigits:2})}
  catch(e){return '₺0'}
}
function qtyLabel(x){
  try{return x&&x.kind==='trade'&&x.qty&&typeof qtyWithUnit==='function'?qtyWithUnit(x.qty,x.sym)+' • ':''}
  catch(e){return ''}
}
function meta(x){
  const type=String(x&&x.type||'');
  const kind=String(x&&x.kind||'');
  const map={
    buy:['ALIM',false],sell:['SATIŞ',true],loan_in:['KREDİ KULLANIMI',true],business_loan_in:['TİCARİ KREDİ',true],
    installment:['TAKSİT',false],early_close:['ERKEN KAPAMA',false],deposit_open:['VADELİ HESAP',false],
    deposit_auto_payout:['VADE SONU ÖDEMESİ',true],deposit_early_withdraw:['VADELİ HESAP ÇEKİMİ',true],
    asset_buy:['VARLIK ALIMI',false],asset_sell:['VARLIK SATIŞI',true],factory_start:['ÜRETİM BAŞLANGICI',false],
    factory_collect:['ÜRETİM GELİRİ',true],construction_start:['PROJE BAŞLANGICI',false],construction_collect:['PROJE SATIŞI',true],
    factory_upgrade:['FABRİKA GELİŞTİRME',false],rent_collect:['KİRA GELİRİ',true],employee_hire:['PERSONEL',false],
    raw_buy:['HAMMADDE',false],operating_expense:['İŞLETME GİDERİ',false],tax_pay:['VERGİ',false],
    mission_reward:['GÖREV ÖDÜLÜ',true],demo_balance:['DEMO BAKİYE',true],tender_win:['İHALE GELİRİ',true]
  };
  if(map[type])return map[type];
  if(kind==='mission_reward')return ['GÖREV ÖDÜLÜ',true];
  if(kind==='demo_grant')return ['DEMO BAKİYE',true];
  if(kind==='income')return ['GELİR',true];
  if(kind==='loan')return ['KREDİ İŞLEMİ',type==='loan_in'];
  if(kind==='deposit')return ['VADELİ HESAP',Number(x&&x.total||0)>0];
  if(kind==='business')return ['İŞLETME İŞLEMİ',false];
  if(kind==='asset')return ['VARLIK İŞLEMİ',type==='asset_sell'];
  return ['FİNANSAL İŞLEM',Number(x&&x.total||0)>0];
}
function row(label,title,date,amount,income,extra){
  return '<div class="transaction-item"><div><strong>'+label+' • '+title+'</strong><small>'+(extra||'')+date+'</small></div><div class="tx-amount '+(income?'profit':'loss2')+'">'+(income?'+':'-')+fmtMoney(Math.abs(Number(amount||0)))+'</div></div>';
}
function fixedRenderTx(){
  const e=document.getElementById('transactionList');if(!e)return;
  const all=typeof tx!=='undefined'&&Array.isArray(tx)?tx:[];
  const filter=document.getElementById('txFilter')?.value||'';
  const list=filter?all.filter(x=>x&&x.kind===filter):all;
  const tc=document.getElementById('txCount');if(tc)tc.textContent=all.length;
  const rp=document.getElementById('realizedPnl');
  if(rp){const val=typeof realized!=='undefined'?realized:0;rp.textContent=fmtMoney(val);rp.className=val>=0?'profit':'loss2'}
  if(!list.length){e.innerHTML='<div style="color:var(--muted);font-size:11px;text-align:center;padding:12px">Bu filtrede işlem bulunmuyor.</div>';return}
  e.innerHTML=list.slice(0,40).map(x=>{
    const type=String(x&&x.type||'');
    const title=String(x&&x.sym||'İşlem');
    const date=new Date(Number(x&&x.t||Date.now())).toLocaleString('tr-TR');
    if(type==='deposit_auto_payout'){
      const total=Math.abs(Number(x&&x.total||0));
      const interest=Math.max(0,Math.abs(Number(x&&x.interest||0)));
      const principal=Math.max(0,total-interest);
      return row('ANA PARA İADESİ',title,date,principal,true,'Vade tamamlandı • ')+row('FAİZ GELİRİ',title,date,interest,true,'%0,99 getiri • ');
    }
    const [label,income]=meta(x);
    const amount=Math.abs(Number(x&&x.total||0));
    return row(label,title,date,amount,income,qtyLabel(x));
  }).join('');
}
window.renderTx=fixedRenderTx;
try{fixedRenderTx()}catch(e){}
window.addEventListener('hashchange',function(){if(String(location.hash||'').includes('transaction'))requestAnimationFrame(fixedRenderTx)},true);
})();
