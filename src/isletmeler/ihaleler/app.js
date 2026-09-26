/* EOT_PART app.js-ensureTenders */
function ensureTenders(){
 if(sim.tenders.length)return;
 sim.tenders=[
 {name:'120 Konutluk Proje',need:'construction',minRep:55,cost:42000000,reward:59000000},
 {name:'Sanayi Tesisi Tedarik Sözleşmesi',need:'industry',minRep:60,cost:18000000,reward:25500000},
 {name:'Belediye Ticari Kompleksi',need:'construction',minRep:70,cost:76000000,reward:108000000}
 ];simSave()
}
/* EOT_END */
/* EOT_PART app.js-bidTender */
function bidTender(i){
 let t=sim.tenders[i];if(!t)return;if(reputation<t.minRep){toast('Bu ihale için itibar yetersiz');return}if(cash<t.cost){toast('İhale için nakit yetersiz');return}
 let chance=.45+reputation/250+deptLevel(t.need)*.05;if(Math.random()>chance){reputation=clamp(reputation-1,0,100);toast('İhale kazanılamadı');return}
 cash-=t.cost;cash+=t.reward;sim.currentMonth.expense+=t.cost;sim.currentMonth.revenue+=t.reward;sim.tenderWins++;reputation=clamp(reputation+3,0,100);tx.unshift({t:Date.now(),kind:'business',type:'tender_win',sym:t.name,total:t.reward});sim.tenders.splice(i,1);simSave();save();render();renderGameExtras();pushNotification('İhale kazanıldı',t.name+' tamamlandı.')}
/* EOT_END */
/* EOT_PART app.js-renderTenders */
function renderTenders(){ensureTenders();let e=document.getElementById('tenderList');if(e)e.innerHTML=sim.tenders.map((t,i)=>'<div class="tender-card"><b>'+t.name+'</b><span>İtibar '+t.minRep+' • Maliyet '+money(t.cost)+' • Sözleşme '+money(t.reward)+'</span><div class="mini-actions"><button class="primary" onclick="bidTender('+i+')">Teklif Ver</button></div></div>').join('');let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('tenderCount',sim.tenders.length);set('tenderWins',sim.tenderWins);set('tenderRep',Math.round(reputation))}
/* EOT_END */
