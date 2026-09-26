/* EOT_PART app.js-renderTx */
function renderTx(){
 let e=document.getElementById('transactionList');if(!e)return;
 let filter=document.getElementById('txFilter')?.value||'',list=filter?tx.filter(x=>x.kind===filter):tx;
 let tc=document.getElementById('txCount');if(tc)tc.textContent=tx.length;
 let rp=document.getElementById('realizedPnl');if(rp){rp.textContent=money(realized);rp.className=realized>=0?'profit':'loss2'}
 if(!list.length){e.innerHTML='<div style="color:var(--muted);font-size:11px;text-align:center;padding:12px">Bu filtrede işlem bulunmuyor.</div>';return}
 e.innerHTML=list.slice(0,40).map(x=>{let label=x.type==='buy'?'ALIM':x.type==='sell'?'SATIŞ':x.type==='loan_in'?'KREDİ KULLANIMI':x.type==='installment'?'TAKSİT':x.type==='deposit_open'?'VADELİ HESAP':x.type==='asset_buy'?'VARLIK ALIMI':x.type==='asset_sell'?'VARLIK SATIŞI':x.type==='factory_start'?'ÜRETİM BAŞLANGICI':x.type==='factory_collect'?'ÜRETİM GELİRİ':x.type==='construction_start'?'PROJE BAŞLANGICI':x.type==='construction_collect'?'PROJE SATIŞI':x.type==='factory_upgrade'?'FABRİKA GELİŞTİRME':x.type==='rent_collect'?'KİRA GELİRİ':x.type==='employee_hire'?'PERSONEL':x.type==='raw_buy'?'HAMMADDE':x.type==='operating_expense'?'İŞLETME GİDERİ':x.type==='tax_pay'?'VERGİ':'ERKEN KAPAMA',inc=x.type==='sell'||x.type==='loan_in'||x.type==='asset_sell'||x.type==='factory_collect'||x.type==='construction_collect'||x.type==='rent_collect';return '<div class="transaction-item"><div><strong>'+label+' • '+x.sym+'</strong><small>'+(x.kind==='trade'&&x.qty?qtyWithUnit(x.qty,x.sym)+' • ':'')+new Date(x.t).toLocaleString('tr-TR')+'</small></div><div class="tx-amount '+(inc?'profit':'loss2')+'">'+(inc?'+':'-')+money(x.total)+'</div></div>'}).join('')
}
/* EOT_END */
