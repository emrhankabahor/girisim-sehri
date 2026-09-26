/* EOT_PART app.js-freshCareerState */
function freshCareerState(){
 return {
  version:161,cash:100000,pf:{},tx:[],realized:0,loans:[],creditScore:50,
  trusts:{"sehir":50,"anadolu":50,"nova":50,"ticaret":50,"varlik":50,"girisim":50},
  lateCount:0,deposits:[],ownedAssets:[],factoryOp:{status:'idle',finish:0},
  constructionOp:{status:'idle',finish:0},selectedLandId:'',factoryLevel:1,reputation:50,
  sim:{companyName:'',employees:[],raw:0,taxDue:0,notifications:[],lastCycle:0,
   cycleDue:Date.now()+300000,lastExpense:0,npcOffers:[],npcRefresh:0,companies:[],
   selectedCompanyId:'',companyProfile:{established:false,name:'',sector:'İnşaat',
   city:'İstanbul',capital:0,companyCash:0,legalType:'Şahıs İşletmesi',office:'home',
   accountant:'basic',brand:0},monthlyHistory:[],currentMonth:{revenue:0,expense:0,tax:0},
   gameMonth:1,gameStart:Date.now(),unifiedVersion:161},savedAt:Date.now()
 }
}
/* EOT_END */
/* EOT_PART app.js-careerStateLooksBroken */
function careerStateLooksBroken(d){
 if(!d||typeof d!=='object'||typeof d.cash!=='number'||!d.sim)return true;
 let loansArr=Array.isArray(d.loans)?d.loans:[],
 debtVal=loansArr.filter(x=>!x.closed).reduce((s,l)=>s+Math.max(0,Number(l.remaining||0)),0),
 assets=Array.isArray(d.ownedAssets)?d.ownedAssets:[],
 assetVal=assets.reduce((s,a)=>s+Math.max(0,Number(a.price||0)),0),
 depositsVal=Array.isArray(d.deposits)?d.deposits.reduce((s,x)=>s+Math.max(0,Number(x.amount||0)),0):0,
 net=Number(d.cash||0)+assetVal+depositsVal-debtVal,month=Number(d.sim.gameMonth||1);
 return debtVal>1000000000 || net<-100000000 || (Number(d.cash)<=0&&month>12&&debtVal>100000000) || month<1 || month>5000
}
/* EOT_END */
/* EOT_PART app.js-resetCurrentCareerToFresh */
function resetCurrentCareerToFresh(accountId){
 let d=freshCareerState();applyCareerState(d);
 if(accountId&&accountId!=='guest')localStorage.setItem(accountCareerKey(accountId),JSON.stringify(d));
 localStorage.setItem('gs140_state',JSON.stringify(d));return true
}
/* EOT_END */
/* EOT_PART app.js-currentRuntimeLooksLegacyBroken */
function currentRuntimeLooksLegacyBroken(){
 try{
   let debtVal=Array.isArray(loans)?loans.filter(x=>!x.closed).reduce((s,l)=>s+Math.max(0,Number(l.remaining||0)),0):0,
       assetVal=Array.isArray(ownedAssets)?ownedAssets.reduce((s,a)=>s+Math.max(0,Number(a.price||0)),0):0,
       depVal=Array.isArray(deposits)?deposits.reduce((s,d)=>s+Math.max(0,Number(d.amount||0)),0):0,
       invVal=0;
   try{invVal=stats('stock').value+stats('crypto').value+stats('gold').value}catch(e){}
   let net=Number(cash||0)+assetVal+depVal+invVal-debtVal,
       month=Number(sim&&sim.gameMonth||1),
       rep=Number(reputation||0);

   // Eski test kaydının tipik bozuk imzası:
   // sıfır nakit + milyarlarca borç + ileri oyun ayı + çok düşük itibar.
   return (
     debtVal>1000000000 ||
     net<-100000000 ||
     (Number(cash)<=0 && debtVal>100000000 && month>12) ||
     (month>=30 && rep<=5 && debtVal>100000000)
   )
 }catch(e){return false}
}
/* EOT_END */
/* EOT_PART app.js-repairLegacyCareerBeforeRender */
function repairLegacyCareerBeforeRender(){
 let migration='gs_v162_state_repair_done';
 if(localStorage.getItem(migration)==='1')return false;

 let u=currentAccount(),accountId=u&&u.id&&u.id!=='guest'?u.id:null;
 let accountBroken=false;

 if(accountId){
   try{
     let raw=localStorage.getItem(accountCareerKey(accountId));
     if(raw)accountBroken=careerStateLooksBroken(JSON.parse(raw))
   }catch(e){accountBroken=true}
 }

 if(currentRuntimeLooksLegacyBroken() || accountBroken){
   let fresh=freshCareerState();

   // Runtime'ı doğrudan temizle; ilk render'dan önce bozuk veri ekrana ulaşmasın.
   cash=fresh.cash;
   pf=fresh.pf;
   tx=fresh.tx;
   realized=fresh.realized;
   loans=fresh.loans;
   creditScore=fresh.creditScore;
   trusts=fresh.trusts;
   lateCount=fresh.lateCount;
   deposits=fresh.deposits;
   ownedAssets=fresh.ownedAssets;
   factoryOp=fresh.factoryOp;
   constructionOp=fresh.constructionOp;
   selectedLandId=fresh.selectedLandId;
   factoryLevel=fresh.factoryLevel;
   reputation=fresh.reputation;
   sim=fresh.sim;

   // Eski global anahtarları temiz state ile değiştir.
   localStorage.setItem('gs124_cash','100000');
   localStorage.setItem('gs18_pf','{}');
   localStorage.setItem('gs18_tx','[]');
   localStorage.setItem('gs18_realized','0');
   localStorage.setItem('gs110_loans','[]');
   localStorage.setItem('gs111_credit','50');
   localStorage.setItem('gs111_late','0');
   localStorage.setItem('gs113_deposits','[]');
   localStorage.setItem('gs126_reputation','50');
   localStorage.setItem('gs132_sim',JSON.stringify(sim));
   localStorage.setItem('gs_owned_assets','[]');

   if(accountId)localStorage.setItem(accountCareerKey(accountId),JSON.stringify(fresh));
   localStorage.setItem('gs140_state',JSON.stringify(fresh));
   localStorage.setItem(migration,'1');
   return true
 }

 localStorage.setItem(migration,'1');
 return false
}
/* EOT_END */
/* EOT_PART app.js-captureCareerState */
function captureCareerState(){
 return {
  version:161,cash,pf,tx,realized,loans,creditScore,trusts,lateCount,deposits,ownedAssets,
  factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,sim,savedAt:Date.now()
 }
}
/* EOT_END */
/* EOT_PART app.js-saveAccountCareer */
function saveAccountCareer(id){
 if(!id||id==='guest')return;
 try{localStorage.setItem(accountCareerKey(id),JSON.stringify(captureCareerState()))}catch(e){}
}
/* EOT_END */
/* EOT_PART app.js-applyCareerState */
function applyCareerState(d){
 if(!d||typeof d.cash!=='number'||!d.sim)return false;
 cash=Number(d.cash);pf=d.pf||{};tx=d.tx||[];realized=Number(d.realized||0);loans=d.loans||[];
 creditScore=Number(d.creditScore??50);trusts=d.trusts||trusts;lateCount=Number(d.lateCount||0);
 deposits=d.deposits||[];ownedAssets=d.ownedAssets||[];factoryOp=d.factoryOp||{status:'idle',finish:0};
 constructionOp=d.constructionOp||{status:'idle',finish:0};selectedLandId=d.selectedLandId||'';
 factoryLevel=Number(d.factoryLevel||1);reputation=Number(d.reputation??50);sim=d.sim;sanitizeGameState();syncSelectedCompanyToProfile();
 saveOwned();save();saveDeposits();simSave();return true
}
/* EOT_END */
/* EOT_PART app.js-loadAccountCareer */
function loadAccountCareer(id){
 if(!id||id==='guest')return false;
 try{
  let raw=localStorage.getItem(accountCareerKey(id));if(!raw)return false;
  let data=JSON.parse(raw);
  if(careerStateLooksBroken(data))return resetCurrentCareerToFresh(id);
  let ok=applyCareerState(data);if(ok){render();renderFinanceExtras();renderGameExtras()}return ok
 }catch(e){return resetCurrentCareerToFresh(id)}
}
/* EOT_END */
/* EOT_PART app.js-save */
function save(){localStorage.setItem('gs124_cash',cash);localStorage.setItem('gs18_pf',JSON.stringify(pf));localStorage.setItem('gs18_tx',JSON.stringify(tx));localStorage.setItem('gs18_realized',realized);localStorage.setItem('gs110_loans',JSON.stringify(loans));localStorage.setItem('gs111_credit',creditScore);localStorage.setItem('gs111_trusts',JSON.stringify(trusts));localStorage.setItem('gs111_late',lateCount)}
/* EOT_END */
/* EOT_PART app.js-saveDeposits */
function saveDeposits(){localStorage.setItem('gs113_deposits',JSON.stringify(deposits))}
/* EOT_END */
/* EOT_PART app.js-saveOwned */
function saveOwned(){localStorage.setItem('gs117_assets',JSON.stringify(ownedAssets));localStorage.setItem('gs119_factoryOp',JSON.stringify(factoryOp));localStorage.setItem('gs119_constructionOp',JSON.stringify(constructionOp));localStorage.setItem('gs121_selectedLand',selectedLandId);localStorage.setItem('gs121_factoryLevel',factoryLevel);localStorage.setItem('gs126_reputation',reputation);localStorage.setItem('gs126_economy',JSON.stringify(economyState));localStorage.setItem('gs132_sim',JSON.stringify(sim))}
/* EOT_END */
/* EOT_PART app.js-simSave */
function simSave(){localStorage.setItem('gs132_sim',JSON.stringify(sim));if(typeof saveUnifiedState==='function')saveUnifiedState()}
/* EOT_END */
/* EOT_PART app.js-createBackup */
function createBackup(){let data={cash,creditScore,reputation,loans,tx,pf,deposits,ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,sim,trusts};let e=document.getElementById('backupText');if(e)e.value=btoa(unescape(encodeURIComponent(JSON.stringify(data))));toast('Yedek kodu oluşturuldu')}
/* EOT_END */
/* EOT_PART app.js-restoreBackup */
function restoreBackup(){let e=document.getElementById('backupText'),text=(e?.value||'').trim();if(!text){toast('Yedek kodu boş');return}try{let d=JSON.parse(decodeURIComponent(escape(atob(text))));if(typeof d.cash!=='number'||!d.sim)throw 0;cash=d.cash;creditScore=d.creditScore;reputation=d.reputation;loans=d.loans||[];tx=d.tx||[];pf=d.pf||{};deposits=d.deposits||[];ownedAssets=d.ownedAssets||[];factoryOp=d.factoryOp||{status:'idle',finish:0};constructionOp=d.constructionOp||{status:'idle',finish:0};selectedLandId=d.selectedLandId||'';factoryLevel=d.factoryLevel||1;sim=d.sim;trusts=d.trusts||trusts;saveOwned();save();saveDeposits();simSave();render();renderGameExtras();toast('Yedek geri yüklendi')}catch(err){toast('Yedek kodu geçersiz')}}
/* EOT_END */
/* EOT_PART app.js-sanitizeGameState */
function sanitizeGameState(){
 cash=Math.max(0,normalizeNumber(cash,100000));
 creditScore=clamp(normalizeNumber(creditScore,50),0,100);
 reputation=clamp(normalizeNumber(reputation,50),0,100);
 lateCount=Math.max(0,Math.round(normalizeNumber(lateCount,0)));
 factoryLevel=Math.max(1,Math.round(normalizeNumber(factoryLevel,1)));
 if(!Array.isArray(loans))loans=[];
 loans=loans.filter(l=>l&&normalizeNumber(l.remaining,0)>=0);
 if(!Array.isArray(ownedAssets))ownedAssets=[];
 if(!pf||typeof pf!=='object')pf={};
 if(!sim||typeof sim!=='object')sim={};
 if(!Array.isArray(sim.monthlyHistory))sim.monthlyHistory=[];
 if(!sim.currentMonth||typeof sim.currentMonth!=='object')sim.currentMonth={revenue:0,expense:0,tax:0};
 sim.gameMonth=Math.max(1,Math.round(normalizeNumber(sim.gameMonth,1)));
 ensureCompanyDataShape();
}
/* EOT_END */
/* EOT_PART app.js-ensureAssetMetadata */
function ensureAssetMetadata(){
 const neighborhoods=['Fenerbahçe','Ataşehir','Çayyolu','Urla Merkez','Nilüfer','Konyaaltı','Bodrum Merkez','Başiskele'];
 ownedAssets.forEach(a=>{
  if(a.type==='Gayrimenkul'){
   if(!a.details)a.details={m2:Math.round(70+Math.random()*180),age:Math.round(Math.random()*25),rooms:['1+1','2+1','3+1','4+1'][Math.floor(Math.random()*4)],floor:Math.round(1+Math.random()*8),view:Math.random()>.65?'Manzaralı':'Standart',parking:Math.random()>.45,site:Math.random()>.5,transport:Math.round(55+Math.random()*45),neighborhood:neighborhoods[Math.floor(Math.random()*neighborhoods.length)]};
   if(a.askRent==null)a.askRent=Number(a.rent||42000);if(a.tenantStatus==null)a.tenantStatus=a.rented?'occupied':'vacant'
  }
  if(a.type==='Araç'){
   if(!a.vehicle)a.vehicle={year:Math.round(2017+Math.random()*9),km:Math.round(Math.random()*140000),engine:['1.0','1.3','1.5','1.6','2.0'][Math.floor(Math.random()*5)],fuel:['Benzin','Dizel','Hibrit','Elektrik'][Math.floor(Math.random()*4)],package:['Comfort','Style','Premium','Business'][Math.floor(Math.random()*4)],damage:Math.random()>.8?'Hasar kaydı var':'Temiz',paint:Math.random()>.7?'1 parça boyalı':'Orijinal',condition:Number(a.condition||Math.round(72+Math.random()*27))}
  }
 })
}
/* EOT_END */
/* EOT_PART app.js-saveUnifiedState */
function saveUnifiedState(){
 try{
  localStorage.setItem('gs140_state',JSON.stringify({version:161,cash,pf,tx,realized,loans,creditScore,trusts,lateCount,deposits,ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,sim,savedAt:Date.now()}));
  let u=currentAccount();if(u&&u.id&&u.id!=='guest')localStorage.setItem(accountCareerKey(u.id),JSON.stringify(captureCareerState()))
 }catch(e){}
}
/* EOT_END */
/* EOT_PART app.js-unifiedIntegrity */
function unifiedIntegrity(){let s=localStorage.getItem('gs140_state');if(!s)return false;try{let d=JSON.parse(s);return d&&Number(d.version)>=151&&typeof d.cash==='number'&&d.sim}catch(e){return false}}
/* EOT_END */
