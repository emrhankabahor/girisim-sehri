/* EOT_PART app.js-startConstructionProject */
function startConstructionProject(){toast('Arsa Geliştirme ekranından arsa ve proje seç');}
/* EOT_END */
/* EOT_PART app.js-collectConstructionProject */
function collectConstructionProject(){
 if(constructionOp.status!=='ready'){toast('Proje henüz hazır değil');return}
 if(completeConstructionToPortfolio()){toast('Proje tamamlandı ve bağımsız bölümler oluştu');location.hash='project_portfolio'}
}
/* EOT_END */
/* EOT_PART app.js-selectDevelopmentLand */
function selectDevelopmentLand(id){
 let a=ownedAssets.find(x=>x.id===id);if(!a){toast('Arsa bulunamadı');return false}
 if(constructionOp.status==='running'||constructionOp.status==='ready'){toast('Önce mevcut projeyi tamamla');return false}
 selectedLandId=id;localStorage.setItem('gs121_selectedLand',id);renderDevelopableLands();
 let e=document.getElementById('selectedLandLabel');if(e)e.textContent=a.name;
 return true
}
/* EOT_END */
/* EOT_PART app.js-chooseProjectPlan */
function chooseProjectPlan(kind){
 let land=ownedAssets.find(a=>a.id===selectedLandId&&a.type==='Arsa');if(!land){toast('Önce arsa seç');return false}
 if(!owns('construction_basic')){toast('Önce inşaat şirketini kur');return false}
 if(constructionOp.status!=='idle'){toast('Aktif proje varken yeni plan oluşturulamaz');return false}
 sim.constructionPlan={kind,permit:false,architect:'standard',contractor:'economy'};simSave();setTimeout(renderConstructionPlan,0);return true
}
/* EOT_END */
/* EOT_PART app.js-constructionPlanNumbers */
function constructionPlanNumbers(){
 let p=PROJECTS[sim.constructionPlan.kind],arch=document.getElementById('architectQuality')?.value||sim.constructionPlan.architect||'standard',cont=document.getElementById('contractorQuality')?.value||sim.constructionPlan.contractor||'economy';
 if(!p)return null;sim.constructionPlan.architect=arch;sim.constructionPlan.contractor=cont;
 let archCost=arch==='expert'?450000:arch==='elite'?1200000:0,contCost=cont==='professional'?600000:cont==='fast'?1500000:0,permit=Math.round(p.cost*.035/10000)*10000;
 let engineers=sim.employees.filter(e=>e.role==='Mühendis').length,days=p.duration*(arch==='elite'?.86:arch==='expert'?.93:1)*(cont==='fast'?.72:cont==='professional'?.86:1)*(1-Math.min(.18,engineers*.035));
 let risk=Math.max(.02,.11-(arch==='elite'?.055:arch==='expert'?.03:0)-(cont==='professional'?.015:cont==='fast'?.025:0)-Math.min(.025,engineers*.008));
 let riskCost=Math.round(p.cost*risk*Math.random()/10000)*10000,total=p.cost+archCost+contCost+permit+riskCost;
 return {p,arch,cont,archCost,contCost,permit,days:Math.max(8,Math.round(days)),risk,riskCost,total}
}
/* EOT_END */
/* EOT_PART app.js-renderConstructionPlan */
function renderConstructionPlan(){
 let n=constructionPlanNumbers(),land=ownedAssets.find(a=>a.id===selectedLandId),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};if(!n)return;
 set('planProjectName',n.p.name);set('planLand',land?.name||'—');set('planDays',n.days+' oyun günü');set('planBaseCost',money(n.p.cost));set('planPermitCost',money(n.permit));set('planRisk','%'+Math.round(n.risk*100));set('planTotalCost',money(n.total));set('permitStatus',sim.constructionPlan.permit?'Ruhsat onaylandı':'Başvuru yapılmadı');simSave()
}
/* EOT_END */
/* EOT_PART app.js-obtainPermit */
function obtainPermit(){
 let n=constructionPlanNumbers();if(!n)return;if(sim.constructionPlan.permit){toast('Ruhsat zaten alındı');return}
 if(cash<n.permit){toast('Ruhsat bedeli için nakit yetersiz');return}cash-=n.permit;sim.constructionPlan.permit=true;sim.constructionPlan.permitPaid=n.permit;sim.currentMonth.expense+=n.permit;simSave();save();render();renderConstructionPlan();toast('Yapı ruhsatı alındı')
}
/* EOT_END */
/* EOT_PART app.js-startPlannedProject */
function startPlannedProject(){
 let n=constructionPlanNumbers(),land=ownedAssets.find(a=>a.id===selectedLandId&&a.type==='Arsa');if(!n||!land){toast('Proje veya arsa eksik');return}
 if(!sim.constructionPlan.permit){toast('Önce yapı ruhsatını almalısın');return}
 let remaining=n.total-Number(sim.constructionPlan.permitPaid||0);if(cash<remaining){toast('Proje bütçesi için '+money(remaining)+' gerekli');return}
 cash-=remaining;constructionOp={status:'running',finish:Date.now()+n.days*1000,cost:n.total,revenue:n.p.revenue,projectName:n.p.name,landId:land.id,kind:sim.constructionPlan.kind,days:n.days,riskCost:n.riskCost};sim.currentMonth.expense+=remaining;tx.unshift({t:Date.now(),kind:'business',type:'construction_start',sym:n.p.name,total:n.total});sim.constructionPlan={kind:'',permit:false,architect:'standard',contractor:'economy'};saveOwned();simSave();save();render();renderGameExtras();location.hash='construction_ops';toast(n.p.name+' inşaatı başladı')
}
/* EOT_END */
/* EOT_PART app.js-startLandProject */
function startLandProject(kind){return chooseProjectPlan(kind)}
/* EOT_END */
/* EOT_PART app.js-renderDevelopableLands */
function renderDevelopableLands(){
 let e=document.getElementById('developableLands');if(!e)return;
 let lands=ownedAssets.filter(a=>a.type==='Arsa');
 if(!lands.length){e.innerHTML='<div class="info-card" style="text-align:center;color:var(--muted)">Projeye uygun satın alınmış arsa bulunmuyor.</div>';return}
 e.innerHTML=lands.map(a=>'<div class="dev-card"><b>'+a.name+'</b><span>Arsa değeri '+money(a.price)+' • İnşaat şirketi '+(owns('construction_basic')?'aktif':'gerekli')+'</span><a href="#project_catalog" onclick="return selectDevelopmentLand(\''+a.id+'\')">'+(owns('construction_basic')?'Proje Seç':'Önce Şirket Kur')+'</a></div>').join('');
 let sl=ownedAssets.find(a=>a.id===selectedLandId),lab=document.getElementById('selectedLandLabel');if(lab)lab.textContent=sl?sl.name:'Arsa seçilmedi'
}
/* EOT_END */
/* EOT_PART app.js-projectDefs */
function projectDefs(kind){
 return {
  villa:{units:2,unitValue:2900000,unitRent:22000,label:'Villa Sitesi'},
  apartment:{units:8,unitValue:1550000,unitRent:14500,label:'Apartman'},
  residence:{units:20,unitValue:2100000,unitRent:19000,label:'20 Dairelik Rezidans'},
  commercial:{units:4,unitValue:4200000,unitRent:42000,label:'Ticari Proje'}
 }[kind]
}
/* EOT_END */
/* EOT_PART app.js-completeConstructionToPortfolio */
function completeConstructionToPortfolio(){
 if(constructionOp.status!=='ready'){toast('Proje henüz tamamlanmadı');return false}
 let kind=constructionOp.kind||(/Villa/i.test(constructionOp.projectName)?'villa':/20 Daire/i.test(constructionOp.projectName)?'residence':/Apartman/i.test(constructionOp.projectName)?'apartment':'commercial'),d=projectDefs(kind),land=ownedAssets.find(a=>a.id===constructionOp.landId);
 let project={id:'proj_'+Date.now(),name:d.label+(land?' • '+land.name:''),kind,units:d.units,available:d.units,rented:0,sold:0,unitValue:Math.round(d.unitValue*(1+deptLevel('construction')*.03)),unitRent:d.unitRent,created:Date.now(),landName:land?.name||'Arsa',value:d.units*d.unitValue};
 sim.projects.push(project);let idx=ownedAssets.findIndex(a=>a.id===constructionOp.landId);if(idx>=0)ownedAssets.splice(idx,1);tx.unshift({t:Date.now(),kind:'business',type:'construction_complete',sym:project.name,total:constructionOp.cost});constructionOp={status:'idle',finish:0};selectedLandId='';reputation=clamp(reputation+2,0,100);saveOwned();simSave();save();render();renderGameExtras();pushNotification('Proje tamamlandı',project.name+' içinde '+project.units+' bağımsız bölüm oluştu.');return true
}
/* EOT_END */
/* EOT_PART app.js-sellProjectUnit */
function sellProjectUnit(pi){
 let p=sim.projects[pi];if(!p||p.available<=0)return;let price=Math.round(p.unitValue*(1+deptLevel('sales')*.015)/1000)*1000;cash+=price;p.available--;p.sold++;sim.currentMonth.revenue+=price;tx.unshift({t:Date.now(),kind:'income',type:'unit_sell',sym:p.name,total:price});simSave();save();render();renderGameExtras();toast('Bağımsız bölüm satıldı • +'+money(price))
}
/* EOT_END */
/* EOT_PART app.js-rentProjectUnit */
function rentProjectUnit(pi){
 let p=sim.projects[pi];if(!p||p.available<=0)return;p.available--;p.rented++;reputation=clamp(reputation+.5,0,100);simSave();renderGameExtras();toast('Bağımsız bölüm kiraya verildi • '+money(p.unitRent)+'/ay')
}
/* EOT_END */
/* EOT_PART app.js-projectRentalIncome */
function projectRentalIncome(){return sim.projects.reduce((s,p)=>s+p.rented*p.unitRent,0)}
/* EOT_END */
/* EOT_PART app.js-renderProjectPortfolio */
function renderProjectPortfolio(){
 let e=document.getElementById('builtProjectList'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};set('builtProjectCount',sim.projects.length);set('projectUnitsForSale',sim.projects.reduce((s,p)=>s+p.available,0));set('projectUnitsRented',sim.projects.reduce((s,p)=>s+p.rented,0));if(!e)return;
 e.innerHTML=sim.projects.length?sim.projects.map((p,i)=>'<div class="project-card-owned"><h4>'+p.name+'</h4><p>'+p.landName+' üzerinde tamamlandı.</p><div class="unit-stats"><div><span>BOŞ</span><b>'+p.available+'</b></div><div><span>KİRALIK</span><b>'+p.rented+'</b></div><div><span>SATILAN</span><b>'+p.sold+'</b></div></div><div class="unit-actions"><button onclick="rentProjectUnit('+i+')">1 Bölüm Kirala • '+money(p.unitRent)+'/ay</button><button class="primary" onclick="sellProjectUnit('+i+')">1 Bölüm Sat • '+money(p.unitValue)+'</button></div></div>').join(''):'<div class="info-card"><p>Henüz tamamlanan proje yok.</p></div>'
}
/* EOT_END */
