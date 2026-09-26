/* EOT_PART app.js-saveCompanyName */
function saveCompanyName(){let e=document.getElementById('companyNameInput'),v=(e?.value||'').trim();if(v.length<3){toast('Şirket adı en az 3 karakter olmalı');return}sim.companyName=v;simSave();renderSimulation();toast('Şirket adı güncellendi')}
/* EOT_END */
/* EOT_PART app.js-riskScore */
function riskScore(){
 let total=cash+ownedValue()+stats('stock').value+stats('crypto').value+stats('gold').value+depositStats().total,ratio=total>0?debt()/total:debt()>0?1:0;
 return ratio>.65?'Yüksek':ratio>.35?'Orta':'Düşük'
}
/* EOT_END */
/* EOT_PART app.js-deptLevel */
function deptLevel(k){return Number(sim.departments?.[k]||0)}
/* EOT_END */
/* EOT_PART app.js-upgradeDepartment */
function upgradeDepartment(k){
 let d=DEPT_INFO[k];if(!d)return;let lvl=deptLevel(k);if(lvl>=5){toast('Departman maksimum seviyede');return}
 let cost=d.base*(lvl+1);if(cash<cost){toast('Geliştirme için '+money(cost)+' gerekli');return}
 cash-=cost;sim.departments[k]=lvl+1;sim.currentMonth.expense+=cost;tx.unshift({t:Date.now(),kind:'business',type:'department_upgrade',sym:d.name+' Departmanı',total:cost});simSave();save();render();renderGameExtras();toast(d.name+' departmanı Seviye '+(lvl+1)+' oldu')
}
/* EOT_END */
/* EOT_PART app.js-companyMetrics */
function companyMetrics(){
 let c=selectedCompany()||sim.companyProfile||{},h=Array.isArray(c.monthlyHistory)?c.monthlyHistory:[],
     turn=h.slice(0,12).reduce((s,x)=>s+normalizeNumber(x.revenue,0),0),
     profit=h.slice(0,12).reduce((s,x)=>s+normalizeNumber(x.net,0),0),
     brand=Math.max(normalizeNumber(c.brand,0),Math.round((reputation/100)*(turn*.08+normalizeNumber(c.capital,0)*.04+500000))),
     staff=Array.isArray(c.employees)?c.employees:[],
     capacity=(c.sector==='Sanayi'?100*factoryLevel:0)+staff.filter(e=>e.role==='Mühendis').length*25,
     city=CITY_ECON[c.city]||{finance:1,industry:1,property:1,tourism:1},
     sectorMul=c.sector==='Sanayi'?city.industry:c.sector==='Gayrimenkul'||c.sector==='İnşaat'?city.property:c.sector==='Finans'?city.finance:1,
     debtVal=companyBusinessDebt(c),
     value=Math.max(0,(normalizeNumber(c.capital,0)+normalizeNumber(c.companyCash,0)+brand+profit*.3-debtVal*.15)*sectorMul);
 return {turn,profit,biz:normalizeNumber(c.capital,0),brand,capacity:Math.round(capacity*sectorMul),employees:staff.length,debt:debtVal,value}
}
/* EOT_END */
/* EOT_PART app.js-renderSetupStep */
function renderSetupStep(){
 let step=Number(sim.setupStep||1);document.querySelectorAll('.setup-step').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===step));
 document.querySelectorAll('[data-step-indicator]').forEach(x=>{let n=Number(x.dataset.stepIndicator);x.classList.toggle('active',n===step);x.classList.toggle('done',n<step)});
 let prev=document.getElementById('setupPrevBtn'),next=document.getElementById('setupNextBtn'),create=document.getElementById('setupCreateButton');
 if(prev)prev.style.visibility=step===1?'hidden':'visible';if(next)next.classList.toggle('hidden',step===5);if(create)create.classList.toggle('hidden',step!==5)
}
/* EOT_END */
/* EOT_PART app.js-changeSetupStep */
function changeSetupStep(delta){
 let step=Number(sim.setupStep||1),next=clamp(step+delta,1,5);sim.setupStep=next;simSave();renderSetupStep();renderCompanySetup()
}
/* EOT_END */
/* EOT_PART app.js-selectCompanyLegalType */
function selectCompanyLegalType(v){
 sim.companyProfile.legalType=v;let select=document.getElementById('setupLegalType');if(select)select.value=v;simSave();renderCompanySetup()
}
/* EOT_END */
/* EOT_PART app.js-selectAccountant */
function selectAccountant(v){sim.companyProfile.accountant=v;simSave();renderCompanySetup()}
/* EOT_END */
/* EOT_PART app.js-transferToCompany */
function transferToCompany(){
 if(!sim.companyProfile.established){toast('Önce şirket kur');return}
 let raw=prompt('Şirket hesabına aktarılacak tutar','100000');if(raw==null)return;let q=Number(raw);if(!q||q<=0){toast('Geçerli tutar gir');return}if(cash<q){toast('Kişisel bakiyen yetersiz');return}
 cash-=q;sim.companyProfile.companyCash=Number(sim.companyProfile.companyCash||0)+q;persistSelectedCompany();tx.unshift({t:Date.now(),kind:'business',type:'company_transfer_in',sym:sim.companyProfile.name,total:q});simSave();save();render();renderGameExtras();toast('Şirket hesabına '+money(q)+' aktarıldı')
}
/* EOT_END */
/* EOT_PART app.js-transferFromCompany */
function transferFromCompany(){
 if(!sim.companyProfile.established){toast('Önce şirket kur');return}
 let raw=prompt('Şirket hesabından çekilecek tutar','100000');if(raw==null)return;let q=Number(raw),bal=Number(sim.companyProfile.companyCash||0);if(!q||q<=0){toast('Geçerli tutar gir');return}if(bal<q){toast('Şirket hesabı yetersiz');return}
 sim.companyProfile.companyCash=bal-q;persistSelectedCompany();cash+=q;tx.unshift({t:Date.now(),kind:'business',type:'company_transfer_out',sym:sim.companyProfile.name,total:q});simSave();save();render();renderGameExtras();toast(money(q)+' kişisel bakiyene aktarıldı')
}
/* EOT_END */
/* EOT_PART app.js-ensureCompanyDataShape */
function ensureCompanyDataShape(){
 if(!Array.isArray(sim.companies))sim.companies=[];
 sim.companies=sim.companies.filter(c=>c&&c.id&&c.name).map(c=>({
   ...c,
   capital:Math.max(0,normalizeNumber(c.capital,0)),
   companyCash:Math.max(0,normalizeNumber(c.companyCash,0)),
   brand:Math.max(0,normalizeNumber(c.brand,0)),
   employees:Array.isArray(c.employees)?c.employees:[],
   monthlyHistory:Array.isArray(c.monthlyHistory)?c.monthlyHistory:[],
   currentMonth:c.currentMonth&&typeof c.currentMonth==='object'?c.currentMonth:{revenue:0,expense:0},
   raw:Math.max(0,normalizeNumber(c.raw,0))
 }));
 if(sim.selectedCompanyId&&!sim.companies.some(c=>c.id===sim.selectedCompanyId))sim.selectedCompanyId='';
 if(!sim.selectedCompanyId&&sim.companies.length===1)sim.selectedCompanyId=sim.companies[0].id;

 // Eski tek-şirket personelini sadece bir kez seçili şirkete taşı.
 let c=sim.companies.find(x=>x.id===sim.selectedCompanyId);
 if(c&&Array.isArray(sim.employees)&&sim.employees.length&&!c.employees.length&&!sim.legacyEmployeesMigrated){
   c.employees=sim.employees.map(e=>({...e,companyId:c.id}));
   sim.legacyEmployeesMigrated=true
 }
 if(!Array.isArray(sim.employees))sim.employees=[];
}
/* EOT_END */
/* EOT_PART app.js-selectedCompanyHistory */
function selectedCompanyHistory(){
 let c=selectedCompany();return c&&Array.isArray(c.monthlyHistory)?c.monthlyHistory:[]
}
/* EOT_END */
/* EOT_PART app.js-companyBusinessDebt */
function companyBusinessDebt(c=selectedCompany()){
 if(!c)return 0;
 return active().filter(l=>l.business&&l.companyId===c.id).reduce((s,l)=>s+normalizeNumber(l.remaining,0),0)
}
/* EOT_END */
/* EOT_PART app.js-guardCompanyRoute */
function guardCompanyRoute(){
 let route=(location.hash||'#home').slice(1);
 if(COMPANY_ONLY_ROUTES.has(route)&&!selectedCompany()){
   toast('Bu ekranı açmak için önce bir şirket seçmelisin');
   location.hash='business';return false
 }
 return true
}
/* EOT_END */
/* EOT_PART app.js-beginNewCompany */
function beginNewCompany(){
 sim.setupStep=1;
 sim.companyDraftMode='new';
 sim.companyProfile={...sim.companyProfile,established:false,name:'',companyCash:0,capital:100000,sector:'İnşaat',city:'İstanbul',legalType:'Şahıs İşletmesi',office:'home',accountant:'basic'};
 simSave();setTimeout(()=>{renderCompanySetup();renderSetupStep()},0);return true
}
/* EOT_END */
/* EOT_PART app.js-selectedCompany */
function selectedCompany(){
 return sim.companies.find(c=>c.id===sim.selectedCompanyId)||null
}
/* EOT_END */
/* EOT_PART app.js-syncSelectedCompanyToProfile */
function syncSelectedCompanyToProfile(){
 let c=selectedCompany();if(!c)return false;
 sim.companyProfile={...c,employees:undefined,monthlyHistory:undefined,currentMonth:undefined,established:true};
 sim.companyName=c.name;return true
}
/* EOT_END */
/* EOT_PART app.js-persistSelectedCompany */
function persistSelectedCompany(){
 let c=selectedCompany();if(!c)return;
 let i=sim.companies.findIndex(x=>x.id===c.id);
 if(i>=0)sim.companies[i]={...sim.companyProfile,id:c.id,established:true};
}
/* EOT_END */
/* EOT_PART app.js-selectCompany */
function selectCompany(id){
 if(!sim.companies.some(c=>c.id===id))return;
 sim.selectedCompanyId=id;syncSelectedCompanyToProfile();simSave();render();renderGameExtras();renderSelectedCompanyActivity();renderSelectedCompanyActivity();toast(sim.companyProfile.name+' seçildi')
}
/* EOT_END */
/* EOT_PART app.js-renderCompanyPortfolio */
function renderCompanyPortfolio(){
 let list=document.getElementById('companyPortfolioList'),companies=sim.companies||[],set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 let totalValue=0,totalEmployees=0;
 companies.forEach(c=>{let base=Number(c.capital||0)+Number(c.companyCash||0)+Number(c.brand||0);totalValue+=base});
 totalEmployees=sim.employees.length;
 set('companyCount',companies.length);set('companiesTotalValue',money(totalValue));set('companiesTotalEmployees',totalEmployees);
 set('companiesHeadline',companies.length?companies.length+' şirket yönetiyorsun':'Henüz şirketin yok');
 set('companiesSubtitle',companies.length?'Bir şirket seçerek yönetim ve faaliyet ekranlarına geç.':'İlk şirketini kurarak ticari faaliyetlere başlayabilirsin.');
 if(!list)return;
 if(!companies.length){list.innerHTML='<div class="empty-company-state"><div>🏢</div><b>İlk şirketini kur</b><p>Faaliyet alanını seç, sermayeni belirle ve şirketini oluştur.</p><a href="#company_setup" onclick="beginNewCompany()">Şirket Oluştur</a></div>';return}
 list.innerHTML=companies.map(c=>{
   let active=c.id===sim.selectedCompanyId,info=COMPANY_SECTOR_INFO[c.sector]||COMPANY_SECTOR_INFO['İnşaat'];
   return '<div class="company-portfolio-card '+(active?'active':'')+'"><div class="company-portfolio-top"><div class="company-sector-icon">'+info.icon+'</div><div><h4>'+c.name+'</h4><p>'+c.legalType+' • '+c.sector+' • '+c.city+'</p></div><button class="company-select-btn" onclick="selectCompany(\''+c.id+'\')">'+(active?'Seçili':'Yönet')+'</button></div><div class="company-portfolio-metrics"><div><span>ŞİRKET HESABI</span><b>'+money(c.companyCash||0)+'</b></div><div><span>SERMAYE</span><b>'+money(c.capital||0)+'</b></div><div><span>FAALİYET</span><b>'+c.sector+'</b></div></div></div>'
 }).join('')
}
/* EOT_END */
/* EOT_PART app.js-renderSelectedCompanyActivity */
function renderSelectedCompanyActivity(){
 let managementArea=document.getElementById('selectedCompanyManagementArea');
 let c=selectedCompany(),
     box=document.getElementById('selectedCompanyActivities'),
     hint=document.getElementById('selectedCompanyHint'),
     title=document.getElementById('selectedCompanyTitle'),
     badge=document.getElementById('selectedCompanySectorBadge'),
     ctx=document.getElementById('selectedCompanyContext'),
     ctxIcon=document.getElementById('selectedCompanyContextIcon'),
     ctxName=document.getElementById('selectedCompanyContextName'),
     ctxMeta=document.getElementById('selectedCompanyContextMeta'),
     menu=document.getElementById('selectedCompanyMenu'),
     activityDesc=document.getElementById('selectedCompanyActivityDesc');

 if(!c){
   if(managementArea){managementArea.classList.add('hidden');managementArea.classList.remove('visible')}
   if(title)title.textContent='Önce bir şirket seç';
   if(hint)hint.textContent='Yönetim araçlarını kullanmak için yukarıdan bir şirket seç.';
   if(badge)badge.textContent='Şirket seçilmedi';
   if(ctx)ctx.classList.add('empty');
   if(ctxIcon)ctxIcon.textContent='🏢';
   if(ctxName)ctxName.textContent='Şirket seçilmedi';
   if(ctxMeta)ctxMeta.textContent='Şirket portföyünden bir şirket seç.';
   if(menu)menu.classList.add('disabled');
   document.querySelectorAll('[data-selected-company-link]').forEach(x=>{
     x.onclick=e=>{e.preventDefault();toast('Önce bir şirket seçmelisin')}
   });
   if(activityDesc)activityDesc.textContent='Önce bir şirket seç';
   if(box)box.innerHTML='<div class="empty-company-state" style="grid-column:1/-1"><div>🏢</div><b>Şirket seçilmedi</b><p>Faaliyetlerini görmek için yukarıdan bir şirket seç.</p></div>';
   return
 }

 if(managementArea){managementArea.classList.remove('hidden');managementArea.classList.add('visible')}
 let info=COMPANY_SECTOR_INFO[c.sector]||COMPANY_SECTOR_INFO['İnşaat'];

 if(title)title.textContent=c.name;
 if(hint)hint.textContent=c.legalType+' • '+c.city+' • '+c.sector;
 if(badge)badge.textContent=c.sector;
 if(ctx)ctx.classList.remove('empty');
 if(ctxIcon)ctxIcon.textContent=info.icon;
 if(ctxName)ctxName.textContent=c.name;
 if(ctxMeta)ctxMeta.textContent=c.legalType+' • '+c.city+' • '+c.sector;
 if(menu)menu.classList.remove('disabled');
 if(activityDesc)activityDesc.textContent=c.name+' şirketinin ana faaliyet alanı';

 let centerLabel=document.getElementById('selectedCompanyCenterLabel'),
     centerSub=document.getElementById('selectedCompanyCenterSub'),
     employeeSub=document.getElementById('selectedCompanyEmployeeSub'),
     creditSub=document.getElementById('selectedCompanyCreditSub'),
     reportSub=document.getElementById('selectedCompanyReportSub');

 if(centerLabel)centerLabel.textContent=c.name+' Merkezi';
 if(centerSub)centerSub.textContent=c.name+' şirket hesabı ve finansalları';
 if(employeeSub)employeeSub.textContent=c.name+' çalışan ve maaş yönetimi';
 if(creditSub)creditSub.textContent=c.name+' bilançosuna göre ticari kredi';
 if(reportSub)reportSub.textContent=c.name+' gelir, gider ve net kârı';

 document.querySelectorAll('[data-selected-company-link]').forEach(x=>{
   x.onclick=()=>{syncSelectedCompanyToProfile();simSave()}
 });

 if(box){
   box.innerHTML=
   '<a href="#'+info.target+'" onclick="syncSelectedCompanyToProfile();simSave()">'+
     '<div class="operation-icon">'+info.icon+'</div>'+
     '<b>'+info.label+'</b>'+
     '<small>'+c.name+' • '+info.desc+'</small><strong>›</strong>'+
   '</a>'+
   '<a href="#tenders" onclick="syncSelectedCompanyToProfile();simSave()">'+
     '<div class="operation-icon">📋</div><b>İhaleler</b>'+
     '<small>'+c.name+' adına sözleşme ve ihale fırsatları</small><strong>›</strong>'+
   '</a>'
 }
}
/* EOT_END */
/* EOT_PART app.js-companyFoundingQuote */
function companyFoundingQuote(){
 let type=document.getElementById('setupLegalType')?.value||sim.companyProfile.legalType||'Limited Şirket',office=document.getElementById('setupOffice')?.value||sim.companyProfile.office||'home',acc=document.getElementById('setupAccountant')?.value||sim.companyProfile.accountant||'basic',capital=Number(document.getElementById('setupCapital')?.value||0);
 let legal=type==='Anonim Şirket'?180000:type==='Limited Şirket'?90000:30000,officeCost=office==='corporate'?240000:office==='small'?90000:15000,accountant=acc==='corporate'?75000:acc==='pro'?35000:15000;
 return {legal,officeCost,accountant,cost:legal+officeCost+accountant,capital,total:capital+legal+officeCost+accountant}
}
/* EOT_END */
/* EOT_PART app.js-createOrUpdateCompany */
function createOrUpdateCompany(){
 let name=(document.getElementById('setupCompanyName')?.value||'').trim(),sector=document.getElementById('setupSector')?.value||'İnşaat',city=document.getElementById('setupCity')?.value||'İstanbul',capital=Number(document.getElementById('setupCapital')?.value),legalType=sim.companyProfile.legalType||'Limited Şirket',office=document.getElementById('setupOffice')?.value||'home',accountant=sim.companyProfile.accountant||'basic',q=companyFoundingQuote();
 let min=legalType==='Anonim Şirket'?5000000:legalType==='Limited Şirket'?1000000:100000;
 if(name.length<3){toast('Geçerli bir şirket adı gir');return}if(capital<min){toast(legalType+' için oyun içi minimum sermaye '+money(min));return}
 let editing=sim.companyDraftMode!=='new' && !!selectedCompany();
 if(!editing){
  if(cash<q.total){toast('Kuruluş için toplam '+money(q.total)+' gerekli');return}
  cash-=q.total;
  let id='company_'+Date.now();
  let company={id,established:true,name,sector,city,capital,companyCash:capital,legalType,office,accountant,foundingCost:q.cost,establishedAt:Date.now(),brand:500000,employees:[],monthlyHistory:[],currentMonth:{revenue:0,expense:0},raw:0};
  sim.companies.push(company);sim.selectedCompanyId=id;sim.companyProfile={...company};sim.companyName=name;sim.companyDraftMode='';
  reputation=clamp(reputation+3,0,100);tx.unshift({t:Date.now(),kind:'business',type:'company_foundation',sym:name,total:q.total});sim.currentMonth.expense+=q.cost;
  simSave();save();render();renderGameExtras();location.hash='business';toast(name+' kuruldu');return
 }
 let c=selectedCompany();Object.assign(c,{name,sector,city,legalType,office,accountant});sim.companyProfile={...c};sim.companyName=name;sim.companyDraftMode='';
 simSave();save();render();renderGameExtras();location.hash='business';toast('Şirket bilgileri güncellendi')
}
/* EOT_END */
/* EOT_PART app.js-renderCompanySetup */
function renderCompanySetup(){
 let c=sim.companyProfile,set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 let n=document.getElementById('setupCompanyName'),s=document.getElementById('setupSector'),ct=document.getElementById('setupCity'),cap=document.getElementById('setupCapital'),of=document.getElementById('setupOffice');
 if(n&&document.activeElement!==n)n.value=c.established?c.name:(n.value||'');if(s)s.value=c.sector;if(ct)ct.value=c.city;if(cap&&document.activeElement!==cap&&c.established)cap.value=c.capital;if(of)of.value=c.office||'home';
 document.querySelectorAll('[data-legal]').forEach(x=>x.classList.toggle('selected',x.dataset.legal===c.legalType));
 document.querySelectorAll('[data-accountant]').forEach(x=>x.classList.toggle('selected',x.dataset.accountant===c.accountant));
 let q=companyFoundingQuote();set('setupFoundingCost',money(q.cost));set('setupTotalRequired',money(q.total));set('setupCompanyCash',money(q.capital));set('summaryLegalType',c.legalType||'—');set('summarySector',s?.value||c.sector||'—');set('summaryCity',ct?.value||c.city||'—');set('summaryCapital',money(Number(cap?.value||c.capital||0)));
 let btn=document.getElementById('setupCreateButton');if(btn)btn.textContent=(sim.companyDraftMode==='new'||!selectedCompany())?'Şirketi Kur ve Faaliyete Başla':'Şirket Bilgilerini Güncelle';
 renderSetupStep()
}
/* EOT_END */
/* EOT_PART app.js-renderCompanyFoundation */
function renderCompanyFoundation(){
 let c=sim.companyProfile,m=companyMetrics(),r=sim.monthlyHistory[0]||{},set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('businessCompanyName',c.established?c.name:'Henüz şirket kurulmadı');set('businessCompanyStatus',c.established?(c.legalType+' • '+c.sector+' • '+c.city):'Faaliyete başlamak için önce şirketini kur.');
 let act=document.getElementById('businessCompanyAction');if(act){act.textContent=c.established?'Şirketi Yönet':'Şirket Kur';act.href=c.established?'#company_center':'#company_setup'}
 set('businessCompanyCash',money(c.companyCash||0));set('businessValue',money(c.established?m.value:0));set('businessEmployeeCount',m.employees);set('businessMonthlyNet',money(r.net||0));let activityHint=document.getElementById('companyActivityHint');if(activityHint)activityHint.textContent=c.established?'Aktif':'Şirket gerekli';
 set('companyAccountBalance',money(c.companyCash||0));set('companyLegalType',c.established?c.legalType:'—');set('companySectorLabel',c.established?c.sector:'—');set('companyCityLabel',c.established?c.city:'—');set('companyNameLabel',c.established?c.name:'Henüz şirket kurulmadı');set('companyValue',money(c.established?m.value:0));set('employeeCount',m.employees);set('companyRevenue',money(r.revenue||0));set('companyRevenue2',money(r.revenue||0));set('companyExpense',money(r.expense||0));set('companyNet',money(r.net||0));set('companyNet2',money(r.net||0));
 let health=clamp(Math.round((reputation*.35)+(Math.min(100,Math.max(0,(r.net||0)/100000))*0.25)+(Math.min(100,(c.companyCash||0)/100000)*0.2)+(Math.min(100,creditScore)*0.2)),0,100);set('companyHealthScore',c.established?health+'/100':'—');
 document.querySelectorAll('.company-required').forEach(x=>{x.classList.toggle('locked',!c.established);x.onclick=!c.established?(e=>{e.preventDefault();toast('Önce şirket kurmalısın');location.hash='company_setup'}):null})
}
/* EOT_END */
