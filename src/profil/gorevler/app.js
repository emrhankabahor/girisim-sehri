/* EOT_PART app.js-gameLevel */
function gameLevel(){return Math.floor(gameXp()/100)}
/* EOT_END */
/* EOT_PART app.js-missionState */
function missionState(){
 return {asset:ownedAssets.some(a=>a.type==='Arsa'||a.type==='Gayrimenkul'),car:ownedAssets.some(a=>a.type==='Araç'),business:ownedAssets.some(a=>a.type==='İşletme'),finance:tx.some(x=>x.kind==='trade')}
}
/* EOT_END */
/* EOT_PART app.js-renderMissions */
function renderMissions(){
 let m=missionState(),done=Object.values(m).filter(Boolean).length;
 document.querySelectorAll('.mission-line').forEach(el=>{let k=el.getAttribute('data-mission'),ok=!!m[k];el.classList.toggle('done',ok);let s=el.querySelector('strong');if(s)s.textContent=ok?'Tamamlandı':'Bekliyor'});
 let p=document.getElementById('missionProgressText');if(p)p.textContent=done+' / 4 hedef';
}
/* EOT_END */
/* EOT_PART app.js-gameXp */
function gameXp(){
 let completed=Object.values(missionState()).filter(Boolean).length;
 return Math.max(0,Math.round(tx.length*7+ownedAssets.length*12+completed*25+(factoryLevel-1)*20))
}
/* EOT_END */
/* EOT_PART app.js-achievementData */
function achievementData(){
 let net=cash+ownedValue()+depositStats().total+stats('stock').value+stats('crypto').value+stats('gold').value-debt();
 return [
  ['🏠','İlk Yatırım','İlk fiziksel varlığını satın al',ownedAssets.length>=1],
  ['🚗','Garaj Sahibi','En az bir araca sahip ol',ownedAssets.some(a=>a.type==='Araç')],
  ['🏢','İşveren','En az 3 çalışan işe al',sim.employees.length>=3],
  ['🏭','Sanayici','Fabrika kur',owns('factory_basic')],
  ['🏗️','Müteahhit','İnşaat şirketi kur',owns('construction_basic')],
  ['💳','Güvenilir Müşteri','Kredi puanını 75 üzerine çıkar',creditScore>=75],
  ['💰','10 Milyon Kulübü','Net serveti ₺10 milyon yap',net>=10000000],
  ['💎','100 Milyon Kulübü','Net serveti ₺100 milyon yap',net>=100000000]
 ]
}
/* EOT_END */
/* EOT_PART app.js-renderAchievements */
function renderAchievements(){let e=document.getElementById('achievementList');if(!e)return;e.innerHTML=achievementData().map(a=>'<div class="achievement-row '+(a[3]?'done':'')+'"><div>'+a[0]+'</div><div><b>'+a[1]+'</b><span>'+a[2]+'</span></div><strong>'+(a[3]?'Tamamlandı':'Devam')+'</strong></div>').join('')}
/* EOT_END */
