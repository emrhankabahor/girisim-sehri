/* EOT_PART app.js-ensureCompetitors */
function ensureCompetitors(){
 if(sim.competitors.length)return;
 sim.competitors=[
 {name:'Anadolu Yapı',sector:'İnşaat',value:68000000,power:72},
 {name:'Marmara Motors',sector:'Otomotiv',value:42000000,power:64},
 {name:'Kuzey Sanayi',sector:'Üretim',value:91000000,power:78},
 {name:'Ege Yatırım',sector:'Gayrimenkul',value:57000000,power:69}
 ];simSave()
}
/* EOT_END */
/* EOT_PART app.js-simulateCompetitors */
function simulateCompetitors(){ensureCompetitors();sim.competitors.forEach(c=>{c.value=Math.round(c.value*(.97+Math.random()*.08)/10000)*10000;c.power=clamp(Math.round(c.power+(Math.random()*6-3)),30,95)});simSave();renderCompetitors();pushNotification('Rakip hamlesi','Rakip şirketlerin piyasa değerleri güncellendi.')}
/* EOT_END */
/* EOT_PART app.js-renderCompetitors */
function renderCompetitors(){ensureCompetitors();let e=document.getElementById('competitorList');if(!e)return;e.innerHTML=sim.competitors.map(c=>'<div class="competitor-card"><b>'+c.name+'</b><span>'+c.sector+' • Değer '+money(c.value)+' • Rekabet '+c.power+'/100</span></div>').join('')}
/* EOT_END */
