/* EOT_PART app.js-renderBusinessSummary */
function renderBusinessSummary(){
 let biz=ownedAssets.filter(a=>a.type==='İşletme'),bc=document.getElementById('businessCount'),bv=document.getElementById('businessValue'),ao=document.getElementById('activeOps');
 if(bc)bc.textContent=biz.length;if(bv)bv.textContent=money(biz.reduce((s,a)=>s+a.price,0));if(ao)ao.textContent=(factoryOp.status!=='idle'?1:0)+(constructionOp.status!=='idle'?1:0)
}
/* EOT_END */
/* EOT_PART app.js-renderActivity */
function renderActivity(){
 let e=document.getElementById('homeActivity');if(!e)return;if(!tx.length){e.innerHTML='<span>Henüz işlem yok.</span>';return}
 let x=tx[0],labels={asset_buy:'Varlık satın alındı',asset_sell:'Varlık satıldı',buy:'Yatırım alımı',sell:'Yatırım satışı',loan_in:'Kredi kullanıldı',installment:'Taksit ödendi',factory_start:'Üretim başladı',factory_collect:'Üretim geliri',construction_start:'Proje başladı',construction_collect:'Proje satıldı',deposit_open:'Vadeli hesap açıldı'};
 e.innerHTML='<b style="color:var(--text)">'+(labels[x.type]||'Finansal işlem')+'</b><br><span>'+x.sym+' • '+new Date(x.t).toLocaleString('tr-TR')+'</span>'
}
/* EOT_END */
