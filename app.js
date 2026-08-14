
(function(){function tick(){var e=document.getElementById('clock');if(e)e.textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}tick();setInterval(tick,1000);})();


let accountMode='login';
let accountLookupTimer=null;

function accountUsers(){
 try{return JSON.parse(localStorage.getItem('gs_accounts')||'[]')}catch(e){return[]}
}
function saveAccountUsers(users){localStorage.setItem('gs_accounts',JSON.stringify(users))}

function accountSessionAuthenticated(){
 let u=currentAccount();
 return !!(u&&u.id)
}
function markAccountSessionAuthenticated(){localStorage.setItem('gs_account_remembered','1')}
function clearAccountSessionAuthenticated(){localStorage.removeItem('gs_account_remembered')}

function currentAccount(){
 try{return JSON.parse(localStorage.getItem('gs_current_account')||'null')}catch(e){return null}
}
function accountCareerKey(id){return 'gs_account_career_'+id}

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
function resetCurrentCareerToFresh(accountId){
 let d=freshCareerState();applyCareerState(d);
 if(accountId&&accountId!=='guest')localStorage.setItem(accountCareerKey(accountId),JSON.stringify(d));
 localStorage.setItem('gs140_state',JSON.stringify(d));return true
}


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

function captureCareerState(){
 return {
  version:161,cash,pf,tx,realized,loans,creditScore,trusts,lateCount,deposits,ownedAssets,
  factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,sim,savedAt:Date.now()
 }
}
function saveAccountCareer(id){
 if(!id||id==='guest')return;
 try{localStorage.setItem(accountCareerKey(id),JSON.stringify(captureCareerState()))}catch(e){}
}
function applyCareerState(d){
 if(!d||typeof d.cash!=='number'||!d.sim)return false;
 cash=Number(d.cash);pf=d.pf||{};tx=d.tx||[];realized=Number(d.realized||0);loans=d.loans||[];
 creditScore=Number(d.creditScore??50);trusts=d.trusts||trusts;lateCount=Number(d.lateCount||0);
 deposits=d.deposits||[];ownedAssets=d.ownedAssets||[];factoryOp=d.factoryOp||{status:'idle',finish:0};
 constructionOp=d.constructionOp||{status:'idle',finish:0};selectedLandId=d.selectedLandId||'';
 factoryLevel=Number(d.factoryLevel||1);reputation=Number(d.reputation??50);sim=d.sim;sanitizeGameState();syncSelectedCompanyToProfile();
 saveOwned();save();saveDeposits();simSave();return true
}
function loadAccountCareer(id){
 if(!id||id==='guest')return false;
 try{
  let raw=localStorage.getItem(accountCareerKey(id));if(!raw)return false;
  let data=JSON.parse(raw);
  if(careerStateLooksBroken(data))return resetCurrentCareerToFresh(id);
  let ok=applyCareerState(data);if(ok){render();renderFinanceExtras();renderGameExtras()}return ok
 }catch(e){return resetCurrentCareerToFresh(id)}
}
function setAccountMode(mode){
 accountMode=mode==='register'?'register':'login';
 document.querySelectorAll('[data-account-tab]').forEach(x=>x.classList.toggle('active',x.dataset.accountTab===accountMode));
 let wrap=document.getElementById('accountNameWrap'),btn=document.getElementById('accountSubmitBtn'),title=document.getElementById('accountFormTitle'),sub=document.getElementById('accountFormSubtitle'),pwd=document.getElementById('accountPassword');
 if(wrap)wrap.classList.toggle('hidden',accountMode!=='register');
 if(btn)btn.textContent=accountMode==='register'?'E‑posta ile Kayıt Ol':'E‑posta ile Giriş Yap';
 if(title)title.textContent=accountMode==='register'?'Yeni Hesap Oluştur':'Hesabına Giriş Yap';
 if(sub)sub.textContent=accountMode==='register'?'Bu e‑posta için hesap bulunamadı. Yeni oyuncu hesabını oluştur.':'Kayıtlı hesabın bulundu. Şifrenle giriş yap ve kariyerine devam et.';
 if(pwd)pwd.autocomplete=accountMode==='register'?'new-password':'current-password';
 hideAccountError()
}
function showAccountError(msg){let e=document.getElementById('accountError');if(e){e.textContent=msg;e.classList.remove('hidden')}}
function hideAccountError(){let e=document.getElementById('accountError');if(e)e.classList.add('hidden')}
function simpleHash(str){
 let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)
}
function normalizeAccountEmail(){return (document.getElementById('accountEmail')?.value||'').trim().toLowerCase()}
function scheduleAccountLookup(){
 clearTimeout(accountLookupTimer);
 accountLookupTimer=setTimeout(routeAccountByEmail,350)
}
function routeAccountByEmail(){
 let email=normalizeAccountEmail(),hint=document.getElementById('accountLookupHint');
 if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  if(hint){hint.className='account-lookup-hint';hint.textContent='Geçerli e‑posta adresini yaz; hesabın varsa otomatik tanıyacağız.'}
  return false
 }
 let u=accountUsers().find(x=>x.email===email);
 if(u){
  setAccountMode('login');
  if(hint){hint.className='account-lookup-hint found';hint.textContent='✓ Kayıtlı hesap bulundu: '+(u.name||email)+'. Şifreni girerek kariyerine devam et.'}
 }else{
  setAccountMode('register');
  if(hint){hint.className='account-lookup-hint new';hint.textContent='Yeni oyuncu hesabı • Bu e‑posta daha önce kayıt edilmemiş.'}
 }
 return !!u
}
function submitEmailAccount(){
 hideAccountError();
 let email=normalizeAccountEmail(),pwd=document.getElementById('accountPassword')?.value||'',name=(document.getElementById('accountName')?.value||'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){showAccountError('Geçerli bir e‑posta / Gmail adresi gir.');return}
 let users=accountUsers(),u=users.find(x=>x.email===email);

 // Kullanıcı yanlış sekmede olsa bile e-posta kaydına göre doğru akışa yönlendir.
 if(u&&accountMode==='register'){
  setAccountMode('login');routeAccountByEmail();showAccountError('Bu e‑posta zaten kayıtlı. Giriş Yap bölümüne yönlendirildin.');return
 }
 if(!u&&accountMode==='login'){
  setAccountMode('register');routeAccountByEmail();showAccountError('Bu e‑posta için hesap bulunamadı. Kayıt Ol bölümüne yönlendirildin.');return
 }

 if(pwd.length<6){showAccountError('Şifre en az 6 karakter olmalı.');return}

 if(accountMode==='register'){
  if(name.length<2){showAccountError('Oyuncu adı en az 2 karakter olmalı.');return}
  u={id:'mail_'+Date.now(),provider:'email',email,name,passwordHash:simpleHash(email+'|'+pwd),createdAt:Date.now()};
  users.push(u);saveAccountUsers(users);
  localStorage.setItem('gs_current_account',JSON.stringify({id:u.id,provider:u.provider,email:u.email,name:u.name}));
  markAccountSessionAuthenticated();
  markAccountSessionAuthenticated();resetCurrentCareerToFresh(u.id);
  enterGameAfterAccount(true);
  toast('Hesap oluşturuldu • Hoş geldin '+u.name)
 }else{
  if(u.passwordHash!==simpleHash(email+'|'+pwd)){showAccountError('Şifre hatalı.');return}
  localStorage.setItem('gs_current_account',JSON.stringify({id:u.id,provider:u.provider,email:u.email,name:u.name}));
  markAccountSessionAuthenticated();
  let restored=loadAccountCareer(u.id);
  if(!restored){
    // Eski sürümden gelen kayıtlı oyuncuysa mevcut kariyeri ilk hesap kaydı olarak ilişkilendir.
    saveAccountCareer(u.id)
  }
  enterGameAfterAccount(false);
  toast(restored?'Kariyer geri yüklendi • Hoş geldin '+u.name:'Hoş geldin '+u.name)
 }
}
function startAppleSignIn(){
 let n=document.getElementById('appleNote');if(n){n.innerHTML='<span> Apple</span><p>Apple ile gerçek giriş için iOS uygulamasında Sign in with Apple yetkilendirmesi, Service ID / Bundle ID ve sunucu tarafı token doğrulaması bağlanmalıdır. Bu HTML demosunda sahte Apple hesabı oluşturulmadı.</p>'}
 toast('Apple ile giriş mobil uygulama entegrasyonunda aktif olacak')
}
function continueAsGuest(){
 localStorage.setItem('gs_current_account',JSON.stringify({id:'guest',provider:'guest',name:'Misafir'}));
 markAccountSessionAuthenticated();
 hideAccountOverlay();
 hideCareerOverlay();
 render();renderFinanceExtras();renderGameExtras()
}

function enterGameAfterAccount(isNewAccount=false){
 hideAccountOverlay();
 hideCareerOverlay();

 // Yeni hesapta mevcut boş başlangıç kariyerini hesaba bağla ve rehberi göster.
 let u=currentAccount();
 if(isNewAccount && u && u.id && u.id!=='guest'){
  saveAccountCareer(u.id);
  localStorage.removeItem('gs_onboarding_done');
  setTimeout(maybeShowOnboarding,80);
 }

 // Kayıtlı hesapta doğrudan oyuna devam et.
 if(!isNewAccount){
  let ob=document.getElementById('onboardingOverlay');
  if(ob)ob.classList.add('hidden');
 }

 render();renderFinanceExtras();renderGameExtras();
}


function logoutAccount(){
 let u=currentAccount();
 if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id);
 localStorage.removeItem('gs_current_account');
 clearAccountSessionAuthenticated();
 showAccountOverlay();
 setAccountMode('login');
 toast('Hesaptan çıkış yapıldı')
}

function hideAccountOverlay(){let e=document.getElementById('accountOverlay');if(e){e.classList.add('hidden');e.style.display='none';e.setAttribute('aria-hidden','true')}}
function showAccountOverlay(){let e=document.getElementById('accountOverlay');if(e){e.style.display='grid';e.classList.remove('hidden');e.setAttribute('aria-hidden','false')}}
function renderAccountState(){
 let u=currentAccount();
 if(u&&u.id){
  hideAccountOverlay();
  hideCareerOverlay();
  if(u.id!=='guest')loadAccountCareer(u.id);
  if(typeof repairLegacyCareerBeforeRender==='function')repairLegacyCareerBeforeRender();
  if(typeof sanitizeGameState==='function')sanitizeGameState();
  if(typeof syncSelectedCompanyToProfile==='function')syncSelectedCompanyToProfile();
  render();renderFinanceExtras();renderGameExtras();
  return
 }
 showAccountOverlay();
 setAccountMode('login')
}


let onboardingStep=1;
function showOnboarding(){
 let e=document.getElementById('onboardingOverlay');if(e)e.classList.remove('hidden');onboardingStep=1;renderOnboarding()
}
function renderOnboarding(){
 document.querySelectorAll('[data-onboard-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.onboardStep)===onboardingStep));
 document.querySelectorAll('[data-onboard-dot]').forEach(x=>{let n=Number(x.dataset.onboardDot);x.classList.toggle('active',n===onboardingStep);x.classList.toggle('done',n<onboardingStep)});
 let p=document.getElementById('onboardPrev'),n=document.getElementById('onboardNext'),f=document.getElementById('onboardFinish');
 if(p)p.style.visibility=onboardingStep===1?'hidden':'visible';if(n)n.classList.toggle('hidden',onboardingStep===5);if(f)f.classList.toggle('hidden',onboardingStep!==5)
}
function changeOnboardingStep(d){onboardingStep=Math.max(1,Math.min(5,onboardingStep+d));renderOnboarding()}
function finishOnboarding(goMarket=false){
 localStorage.setItem('gs_onboarding_done','1');
 let e=document.getElementById('onboardingOverlay');if(e)e.classList.add('hidden');
 if(goMarket)location.hash='dynamic_market'
}
function maybeShowOnboarding(){
 if(localStorage.getItem('gs_onboarding_done')==='1')return;
 setTimeout(showOnboarding,80)
}


if(sessionStorage.getItem('gs_new_career_started')==='1'){
  sessionStorage.removeItem('gs_new_career_started');
  localStorage.removeItem('gs_onboarding_done');
  setTimeout(()=>{hideCareerOverlay();maybeShowOnboarding()},20);
}


function hideCareerOverlay(){
  let e=document.getElementById('newCareerOverlay');
  if(e)e.classList.add('hidden')
}
function continueExistingCareer(){
  hideCareerOverlay();
  render();renderFinanceExtras();renderGameExtras()
}
function startFreshCareer(){
  const preserve={
    accounts:localStorage.getItem('gs_accounts'),
    current:localStorage.getItem('gs_current_account'),
    remembered:localStorage.getItem('gs_account_remembered')
  };
  const prefixes=['gs','girisim','girisims','career'];
  for(let i=localStorage.length-1;i>=0;i--){
    const k=localStorage.key(i)||'';
    if(prefixes.some(p=>k.toLowerCase().startsWith(p)))localStorage.removeItem(k);
  }
  if(preserve.accounts)localStorage.setItem('gs_accounts',preserve.accounts);
  if(preserve.current)localStorage.setItem('gs_current_account',preserve.current);
  if(preserve.remembered)localStorage.setItem('gs_account_remembered',preserve.remembered);
  sessionStorage.clear();
  sessionStorage.setItem('gs_new_career_started','1');
  location.reload();
}

document.documentElement.classList.add('js-ready');

const ASSETS={GSTEK:{name:'GŞ Teknoloji',group:'stock',buy:125,sell:124.2,step:1},ANSAN:{name:'Anadolu Sanayi',group:'stock',buy:82,sell:81.4,step:1},MTRYP:{name:'Metro Yapı',group:'stock',buy:210,sell:208.5,step:1},ATOTO:{name:'Atlas Otomotiv',group:'stock',buy:168,sell:166.8,step:1},BTC:{name:'Bitcoin',group:'crypto',buy:3240000,sell:3215000,step:.001},ETH:{name:'Ethereum',group:'crypto',buy:112000,sell:111200,step:.01},SOL:{name:'Solana',group:'crypto',buy:5820,sell:5780,step:.1},XRP:{name:'XRP',group:'crypto',buy:102,sell:101.2,step:1},GRAM:{name:'Gram Altın',group:'gold',buy:4420,sell:4375,step:1},CEYREK:{name:'Çeyrek Altın',group:'gold',buy:7290,sell:7180,step:1},TAM:{name:'Tam Altın',group:'gold',buy:28960,sell:28520,step:1},YARIM:{name:'Yarım Altın',group:'gold',buy:14520,sell:14270,step:1},CUMHUR:{name:'Cumhuriyet Altını',group:'gold',buy:30150,sell:29650,step:1},KULCE:{name:'100g Külçe Altın',group:'gold',buy:445000,sell:439500,step:1}};
const BASE={};Object.keys(ASSETS).forEach(k=>BASE[k]={buy:ASSETS[k].buy,sell:ASSETS[k].sell});
let cash=Number(localStorage.getItem('gs124_cash')||100000),pf=JSON.parse(localStorage.getItem('gs18_pf')||'{}'),tx=JSON.parse(localStorage.getItem('gs18_tx')||'[]'),realized=Number(localStorage.getItem('gs18_realized')||0),loans=JSON.parse(localStorage.getItem('gs110_loans')||'[]'),creditScore=Number(localStorage.getItem('gs111_credit')||50),trusts=JSON.parse(localStorage.getItem('gs111_trusts')||'{"sehir":50,"anadolu":50,"nova":50,"ticaret":50,"varlik":50,"girisim":50}'),lateCount=Number(localStorage.getItem('gs111_late')||0);
loans=loans.map(l=>({...l,paidCount:l.paidCount||0,nextDue:l.nextDue||(()=>{let d=new Date(l.t||Date.now());d.setMonth(d.getMonth()+1);return d.getTime()})(),hadLate:!!l.hadLate,closed:!!l.closed}));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const money=n=>(n<0?'-':'')+'₺'+Math.abs(Number(n||0)).toLocaleString('tr-TR',{maximumFractionDigits:2});
const assetUnit=sym=>({GSTEK:'adet',ANSAN:'adet',MTRYP:'adet',ATOTO:'adet',BTC:'BTC',ETH:'ETH',SOL:'SOL',XRP:'XRP',GRAM:'gram',CEYREK:'adet',TAM:'adet',YARIM:'adet',CUMHUR:'adet',KULCE:'adet'})[sym]||'adet';
const qtyDigits=sym=>sym==='BTC'?6:sym==='ETH'?5:sym==='SOL'?3:sym==='XRP'?2:0;
const qtyText=(q,sym)=>Number(q||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:qtyDigits(sym)});
const qtyWithUnit=(q,sym)=>qtyText(q,sym)+' '+assetUnit(sym);

function toast(t){let e=document.getElementById('toast');if(!e)return;e.textContent=t;e.style.display='block';clearTimeout(window.__t);window.__t=setTimeout(()=>e.style.display='none',1800)}
function save(){localStorage.setItem('gs124_cash',cash);localStorage.setItem('gs18_pf',JSON.stringify(pf));localStorage.setItem('gs18_tx',JSON.stringify(tx));localStorage.setItem('gs18_realized',realized);localStorage.setItem('gs110_loans',JSON.stringify(loans));localStorage.setItem('gs111_credit',creditScore);localStorage.setItem('gs111_trusts',JSON.stringify(trusts));localStorage.setItem('gs111_late',lateCount)}
function stats(g){let value=0,cost=0;Object.keys(ASSETS).forEach(s=>{let a=ASSETS[s],p=pf[s];if(a.group===g&&p&&p.qty>0){value+=p.qty*a.sell;cost+=p.qty*p.avg}});return{value,pnl:value-cost}}
function active(){return loans.filter(l=>!l.closed&&Number(l.remaining||0)>.01)}function debt(){return active().reduce((s,l)=>s+Number(l.remaining||0),0)}
function trade(sym,type){
 let a=ASSETS[sym],inp=document.getElementById('qty_'+sym),q=Number(inp&&inp.value);
 if(!q||q<=0){toast('Geçerli miktar gir');return false}
 let wholeOnly=a.group==='stock'||sym==='GRAM'||sym==='CEYREK'||sym==='TAM'||sym==='YARIM'||sym==='CUMHUR'||sym==='KULCE';
 if(wholeOnly&&!Number.isInteger(q)){toast(assetUnit(sym)+' miktarı tam sayı olmalı');return false}
 let p=type==='buy'?a.buy:a.sell,total=p*q,pos=pf[sym]||{qty:0,avg:0};
 if(type==='buy'){
   if(cash<total){toast('Yetersiz nakit');return false}
   let nq=pos.qty+q;pos.avg=((pos.avg*pos.qty)+(p*q))/nq;pos.qty=nq;cash-=total
 }else{
   if(pos.qty<q){toast('Portföyde yeterli varlık yok');return false}
   realized+=(p-pos.avg)*q;pos.qty-=q;cash+=total;if(pos.qty<1e-8){pos.qty=0;pos.avg=0}
 }
 pf[sym]=pos;tx.unshift({t:Date.now(),sym,type,qty:q,price:p,total,kind:'trade'});tx=tx.slice(0,100);
 save();render();
 setTradeResult(sym,type,q,total,pos.qty);
 toast(a.name+' '+(type==='buy'?'alındı':'satıldı'));
 return true
}
function setTradeResult(sym,type,q,total,remaining){
 let a=ASSETS[sym],title=document.getElementById('resultTitle_'+sym+'_'+type),
 text=document.getElementById('resultText_'+sym+'_'+type),detail=document.getElementById('resultDetail_'+sym+'_'+type);
 if(title)title.textContent='✅ '+(type==='buy'?'Alım tamamlandı':'Satış tamamlandı');
 if(text)text.textContent=qtyWithUnit(q,sym)+' '+a.name+' '+(type==='buy'?'alındı.':'satıldı.');
 if(detail)detail.innerHTML=(type==='buy'?'Nakitten düşen: <b>'+money(total)+'</b>':'Nakde eklenen: <b>'+money(total)+'</b>')+' • Portföyde kalan: <b>'+qtyWithUnit(remaining,sym)+'</b>';
}


function syncTradeQty(sym){
 let source=document.getElementById('qty_'+sym),target=document.getElementById('tradeqty_'+sym);
 if(!source||!target)return true;
 let q=source.value;
 if(q!==''&&Number(q)>0)target.value=q;
 return true
}

function tradeFromScreenAndGo(sym,type,target){
 let s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);
 if(t&&s)t.value=s.value;
 let ok=trade(sym,type);
 if(!ok){if(event&&event.preventDefault)event.preventDefault();return false}
 location.hash=target;
 return false
}

function tradeFromScreen(sym,type){
 let s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);
 if(t&&s)t.value=s.value;
 let ok=trade(sym,type);
 if(!ok){event&&event.preventDefault&&event.preventDefault();return false}
 return true
}
function acceptLoan(id,name,limit,rate,maxTerm){
 let amount=Number(document.getElementById('loanamt_'+id)?.value),months=Number(document.getElementById('loanterm_'+id)?.value);
 if(!amount||amount<100000||amount>limit){toast('Kredi tutarı geçersiz');if(event&&event.preventDefault)event.preventDefault();return false}
 if(!months||months<1||months>maxTerm||months>6){toast('Vade 1-6 ay olmalı');if(event&&event.preventDefault)event.preventDefault();return false}
 let trust=Number(trusts[id]||50),assess=creditAssessment(limit,trust),nw=assess.nw;
 let allowed=Math.min(limit,Math.max(250000,assess.limit));
 if(creditScore<20||trust<20||amount>allowed){toast('Onaylanan limit: '+money(allowed));if(event&&event.preventDefault)event.preventDefault();return false}
 let r=Math.max(.5,rate+(creditScore<40?.6:creditScore>=80?-.3:0)+(trust>=80?-.2:trust<40?.4:0)+((sim.macro?.rate||42.5)-42.5)/25+currentNews().credit*2);
 let total=amount*(1+(r/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 cash+=amount;
 loans.push({id,name,amount,rate:r,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false});
 trusts[id]=clamp(trust+2,0,100);
 tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:name,total:amount});
 save();render();renderFinanceExtras();renderGameExtras();
 let st=document.getElementById('loanstatus_'+id);
 if(st)st.innerHTML='✅ Kredi kullanıldı • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';
 let title=document.getElementById('loan_success_'+id+'_title');
 let text=document.getElementById('loan_success_'+id+'_text');
 let detail=document.getElementById('loan_success_'+id+'_detail');
 if(title)title.textContent='✅ Kredi hesabına geçti';
 if(text)text.textContent=money(amount)+' nakit bakiyene eklendi.';
 if(detail)detail.innerHTML='Yeni nakit bakiyesi: <b>'+money(cash)+'</b> • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';
 toast(name+' kredisi hesabına geçti');
 return true
}
function payInstallment(i){let l=loans[i];if(!l||l.closed)return;let amt=Math.min(l.installment,l.remaining),late=Date.now()>l.nextDue;if(cash<amt){toast('Yetersiz nakit');return}cash-=amt;l.remaining=Math.max(0,l.remaining-amt);l.paidCount++;if(late){lateCount++;l.hadLate=true;creditScore=clamp(creditScore-10,0,100);trusts[l.id]=clamp((trusts[l.id]||50)-10,0,100)}else trusts[l.id]=clamp((trusts[l.id]||50)+5,0,100);let d=new Date(l.nextDue);d.setMonth(d.getMonth()+1);l.nextDue=d.getTime();tx.unshift({t:Date.now(),kind:'loan',type:'installment',sym:l.name,total:amt});if(l.remaining<=.01){l.closed=true;if(!l.hadLate)creditScore=clamp(creditScore+10,0,100);trusts[l.id]=clamp((trusts[l.id]||50)+5,0,100)}save();render();if(!late)reputation=clamp(reputation+1,0,100);else reputation=clamp(reputation-2,0,100);saveOwned();toast(l.closed?'Kredi kapandı':'Taksit ödendi')}
function closeLoan(i){let l=loans[i];if(!l||l.closed)return;let amt=l.remaining;if(cash<amt){toast('Erken kapama için yetersiz nakit');return}cash-=amt;l.remaining=0;l.closed=true;tx.unshift({t:Date.now(),kind:'loan',type:'early_close',sym:l.name,total:amt});trusts[l.id]=clamp((trusts[l.id]||50)+3,0,100);if(!l.hadLate)creditScore=clamp(creditScore+10,0,100);save();render();toast('Kredi erken kapatıldı')}
function renderAssets(){document.querySelectorAll('.asset-card').forEach(card=>{let inp=card.querySelector('input[id^="qty_"]');if(!inp)return;let sym=inp.id.replace('qty_',''),a=ASSETS[sym],p=pf[sym]||{qty:0},boxes=card.querySelectorAll('.asset-mini div'),price=card.querySelector('.asset-price b');if(price)price.textContent=money(a.buy);if(boxes[0])boxes[0].innerHTML='<span>ALIŞ</span><b>'+money(a.buy)+'</b>';if(boxes[1])boxes[1].innerHTML='<span>SATIŞ</span><b>'+money(a.sell)+'</b>';if(boxes[2])boxes[2].innerHTML='<span>ELİNDE</span><b>'+qtyText(p.qty)+'</b>'});Object.keys(ASSETS).forEach(sym=>{let b=document.getElementById('buy_'+sym),s=document.getElementById('sell_'+sym),h=document.getElementById('held_'+sym);if(b)b.textContent=money(ASSETS[sym].buy);if(s)s.textContent=money(ASSETS[sym].sell);if(h)h.textContent=qtyWithUnit((pf[sym]||{qty:0}).qty,sym)})}
function portfolio(g,id){let e=document.getElementById(id);if(!e)return;let rows=[];Object.keys(ASSETS).filter(s=>ASSETS[s].group===g).forEach(sym=>{let p=pf[sym],a=ASSETS[sym];if(p&&p.qty>0){let v=p.qty*a.sell,pnl=v-p.qty*p.avg;rows.push('<div class="portfolio-row"><div><b>'+a.name+'</b><br><span>'+qtyWithUnit(p.qty,sym)+' • Ort. '+money(p.avg)+'</span></div><div style="text-align:right"><b>'+money(v)+'</b><br><span class="'+(pnl>=0?'profit':'loss2')+'">'+money(pnl)+'</span></div></div>')}});e.innerHTML=rows.length?rows.join(''):'<div class="portfolio-row"><span>Henüz varlık yok.</span><b>—</b></div>'}
function renderTx(){
 let e=document.getElementById('transactionList');if(!e)return;
 let filter=document.getElementById('txFilter')?.value||'',list=filter?tx.filter(x=>x.kind===filter):tx;
 let tc=document.getElementById('txCount');if(tc)tc.textContent=tx.length;
 let rp=document.getElementById('realizedPnl');if(rp){rp.textContent=money(realized);rp.className=realized>=0?'profit':'loss2'}
 if(!list.length){e.innerHTML='<div style="color:var(--muted);font-size:11px;text-align:center;padding:12px">Bu filtrede işlem bulunmuyor.</div>';return}
 e.innerHTML=list.slice(0,40).map(x=>{let label=x.type==='buy'?'ALIM':x.type==='sell'?'SATIŞ':x.type==='loan_in'?'KREDİ KULLANIMI':x.type==='installment'?'TAKSİT':x.type==='deposit_open'?'VADELİ HESAP':x.type==='asset_buy'?'VARLIK ALIMI':x.type==='asset_sell'?'VARLIK SATIŞI':x.type==='factory_start'?'ÜRETİM BAŞLANGICI':x.type==='factory_collect'?'ÜRETİM GELİRİ':x.type==='construction_start'?'PROJE BAŞLANGICI':x.type==='construction_collect'?'PROJE SATIŞI':x.type==='factory_upgrade'?'FABRİKA GELİŞTİRME':x.type==='rent_collect'?'KİRA GELİRİ':x.type==='employee_hire'?'PERSONEL':x.type==='raw_buy'?'HAMMADDE':x.type==='operating_expense'?'İŞLETME GİDERİ':x.type==='tax_pay'?'VERGİ':'ERKEN KAPAMA',inc=x.type==='sell'||x.type==='loan_in'||x.type==='asset_sell'||x.type==='factory_collect'||x.type==='construction_collect'||x.type==='rent_collect';return '<div class="transaction-item"><div><strong>'+label+' • '+x.sym+'</strong><small>'+(x.kind==='trade'&&x.qty?qtyWithUnit(x.qty,x.sym)+' • ':'')+new Date(x.t).toLocaleString('tr-TR')+'</small></div><div class="tx-amount '+(inc?'profit':'loss2')+'">'+(inc?'+':'-')+money(x.total)+'</div></div>'}).join('')
}
function renderLoans(){let e=document.getElementById('activeLoansList');if(!e)return;let list=loans.map((l,i)=>({l,i})).filter(o=>!o.l.closed&&o.l.remaining>.01);if(!list.length){e.innerHTML='<div class="info-card" style="text-align:center;color:var(--muted)">Aktif kredi bulunmuyor.</div>';return}e.innerHTML=list.map(o=>{let l=o.l,late=Date.now()>l.nextDue;return '<div class="loan-live"><h4>'+l.name+'</h4><p>Kalan: <b>'+money(l.remaining)+'</b> • Taksit: <b>'+money(Math.min(l.installment,l.remaining))+'</b></p><p>Sonraki ödeme: '+new Date(l.nextDue).toLocaleDateString('tr-TR')+' '+(late?'<span class="late-badge">GECİKMİŞ</span>':'')+'</p><p>Banka güveni: <b>'+Math.round(trusts[l.id]||50)+'</b></p><div class="paygrid"><button class="pay-now" onclick="payInstallment('+o.i+')">Taksiti Öde</button><button class="pay-close" onclick="closeLoan('+o.i+')">Erken Kapat</button></div></div>'}).join('')}
function render(){document.querySelectorAll('[data-cash]').forEach(e=>e.textContent=money(cash));renderAssets();let s=stats('stock'),c=stats('crypto'),g=stats('gold'),inv=s.value+c.value+g.value,d=debt(),net=cash+inv+ownedValue()+depositStats().total-d;[['stock',s],['crypto',c],['gold',g]].forEach(([k,o])=>{let v=document.getElementById(k+'Value'),p=document.getElementById(k+'Pnl');if(v)v.textContent=money(o.value);if(p){p.textContent=money(o.pnl);p.className=o.pnl>=0?'profit':'loss2'}});document.getElementById('totalInvestment')&&(document.getElementById('totalInvestment').textContent=money(inv));document.getElementById('netWorth')&&(document.getElementById('netWorth').textContent=money(net));['totalDebtFinance','activeDebtBank','activeDebtLoans'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=money(d)});['activeLoanCount','activeLoanCountLoans'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=active().length});['creditScoreFinance','creditScoreLoans','creditScoreBank'].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=creditScore});let avg=Math.round(Object.values(trusts).reduce((a,b)=>a+Number(b||0),0)/6);document.getElementById('avgTrust')&&(document.getElementById('avgTrust').textContent=avg);Object.keys(trusts).forEach(id=>{let e=document.getElementById('trust_'+id);if(e)e.textContent=Math.round(trusts[id])});document.getElementById('lateCount')&&(document.getElementById('lateCount').textContent=lateCount);let fh=document.getElementById('financeHealth');if(fh)fh.textContent=d===0?'Borç bulunmuyor. Finansal profilin dengeli.':d>cash+inv?'Borç yükün yüksek. Yeni kredi tekliflerin zorlaşabilir.':'Borç seviyen yönetilebilir durumda.';portfolio('stock','stockPortfolioRows');portfolio('crypto','cryptoPortfolioRows');portfolio('gold','goldPortfolioRows');renderTx();renderLoans()}
function movePrices(){
 let news=currentNews(),macro=sim.macro||{cycle:'Dengeli'},cycle=macro.cycle;
 Object.keys(ASSETS).forEach(sym=>{
  let a=ASSETS[sym],b=BASE[sym],vol=a.group==='crypto'?.025:a.group==='stock'?.009:.004;
  let newsBias=a.group==='crypto'?news.crypto:a.group==='stock'?news.stock:news.gold;
  let macroBias=a.group==='stock'?(cycle==='Büyüme'?.003:cycle==='Durgunluk'?-0.004:0):a.group==='crypto'?(cycle==='Büyüme'?.004:cycle==='Durgunluk'?-0.006:0):cycle==='Sıkılaşma'?.002:0;
  let m=(Math.random()*2-1)*vol+newsBias*.08+macroBias,n=clamp(a.buy*(1+m),b.buy*.55,b.buy*1.65),spread=(b.sell/b.buy)*(1+(Math.random()-.5)*.002);
  a.buy=n;a.sell=n*spread
 });render()
}

let deposits=JSON.parse(localStorage.getItem('gs113_deposits')||'[]');

let ownedAssets=JSON.parse(localStorage.getItem('gs117_assets')||'[]');

let factoryOp=JSON.parse(localStorage.getItem('gs119_factoryOp')||'{"status":"idle","finish":0}');
let constructionOp=JSON.parse(localStorage.getItem('gs119_constructionOp')||'{"status":"idle","finish":0}');
let selectedLandId=localStorage.getItem('gs121_selectedLand')||'';
let factoryLevel=Number(localStorage.getItem('gs121_factoryLevel')||1);
let reputation=Number(localStorage.getItem('gs126_reputation')||50);

let sim=JSON.parse(localStorage.getItem('gs132_sim')||'{"companyName":"Girişim Şehri Holding","employees":[],"raw":0,"taxDue":0,"notifications":[],"lastCycle":0,"cycleDue":0,"lastExpense":0,"npcOffers":[],"npcRefresh":0}');
if(!sim.cycleDue)sim.cycleDue=Date.now()+300000;
if(!Array.isArray(sim.dynamicListings))sim.dynamicListings=[];
if(!sim.dynamicRefresh)sim.dynamicRefresh=0;
if(!sim.dynamicFilter)sim.dynamicFilter='all';
if(!sim.negotiation)sim.negotiation=null;
if(!Array.isArray(sim.monthlyHistory))sim.monthlyHistory=[];
if(!sim.gameMonth)sim.gameMonth=1;
if(!sim.departments)sim.departments={sales:0,finance:0,construction:0,industry:0};
if(!Array.isArray(sim.projects))sim.projects=[];
if(!sim.currentMonth)sim.currentMonth={revenue:0,expense:0,tax:0};
if(!sim.macro)sim.macro={rate:42.5,inflation:31.2,growth:3.1,cycle:'Dengeli'};
if(!Array.isArray(sim.competitors))sim.competitors=[];
if(!Array.isArray(sim.tenders))sim.tenders=[];
if(!sim.tenderWins)sim.tenderWins=0;
if(!sim.creditCard)sim.creditCard={limit:500000,used:0,statement:0};
if(!Array.isArray(sim.ipos))sim.ipos=[];
if(!Array.isArray(sim.ipoHoldings))sim.ipoHoldings=[];
if(!Array.isArray(sim.wealthHistory))sim.wealthHistory=[];
if(sim.lifestyle==null)sim.lifestyle=0;
if(!sim.companyProfile)sim.companyProfile={name:sim.companyName||'Girişim Şehri Holding',sector:'İnşaat',city:'İstanbul',capital:5000000,brand:1000000};
if(sim.companyProfile.established==null)sim.companyProfile.established=!!ownedAssets.some(a=>a.type==='İşletme');
if(sim.companyProfile.companyCash==null)sim.companyProfile.companyCash=sim.companyProfile.established?Number(sim.companyProfile.capital||0):0;
if(!sim.companyProfile.legalType)sim.companyProfile.legalType='Limited Şirket';
if(!sim.companyProfile.office)sim.companyProfile.office='home';
if(!sim.companyProfile.accountant)sim.companyProfile.accountant='basic';
if(!Array.isArray(sim.companies))sim.companies=[];
if(!sim.selectedCompanyId)sim.selectedCompanyId='';
if(sim.companyProfile.established && !sim.companies.length){
 sim.companyProfile.id=sim.companyProfile.id||('company_'+Date.now());
 sim.companies.push({...sim.companyProfile});
 sim.selectedCompanyId=sim.companyProfile.id;
}

if(!sim.setupStep)sim.setupStep=1;
if(!sim.news)sim.news={id:'neutral',until:0};
if(!Array.isArray(sim.detailedUsed))sim.detailedUsed=[];
if(!sim.usedRefresh)sim.usedRefresh=0;
if(!sim.stockDividendDue)sim.stockDividendDue=0;
if(!Array.isArray(sim.tenantApplications))sim.tenantApplications=[];
if(!sim.unifiedVersion)sim.unifiedVersion=140;
if(!sim.constructionPlan)sim.constructionPlan={kind:'',permit:false,architect:'standard',contractor:'economy'};



if(!Array.isArray(sim.dealerListings))sim.dealerListings=[];

let economyState=JSON.parse(localStorage.getItem('gs126_economy')||'{"id":"neutral","until":0}');


function saveDeposits(){localStorage.setItem('gs113_deposits',JSON.stringify(deposits))}
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
function depositStats(){
  return {total:deposits.reduce((s,d)=>s+Number(d.amount||0),0),ret:deposits.reduce((s,d)=>s+Number(d.ret||0),0)}
}
function renderDeposits(){
  let ds=depositStats(),c=document.getElementById('depositCount'),t=document.getElementById('depositTotal'),r=document.getElementById('depositReturn'),list=document.getElementById('depositList');
  if(c)c.textContent=deposits.length;if(t)t.textContent=money(ds.total);if(r)r.textContent=money(ds.ret);
  if(list)list.innerHTML=deposits.length?deposits.map(d=>'<div class="portfolio-row"><div><b>'+d.months+' Ay Vadeli</b><br><span>Vade: '+new Date(d.maturity).toLocaleDateString('tr-TR')+' • %'+String(d.rate).replace('.',',')+'</span></div><div style="text-align:right"><b>'+money(d.amount)+'</b><br><span class="profit">+'+money(d.ret)+'</span></div></div>').join(''):'<div class="portfolio-row"><span>Aktif vadeli hesap yok.</span><b>—</b></div>'
}
function renderFinanceExtras(){
  let s=stats('stock'),c=stats('crypto'),g=stats('gold'),inv=s.value+c.value+g.value,den=inv||1;
  let as=document.getElementById('allocStock'),ac=document.getElementById('allocCrypto'),ag=document.getElementById('allocGold');
  if(as)as.textContent='%'+Math.round(s.value/den*100);if(ac)ac.textContent='%'+Math.round(c.value/den*100);if(ag)ag.textContent='%'+Math.round(g.value/den*100);
  let d=debt(),liq=(cash+inv)>0?cash/(cash+inv):0,lr=document.getElementById('liquidityRatio'),hf=document.getElementById('healthFill'),risk=document.getElementById('riskLabel');
  if(lr)lr.textContent='%'+Math.round(liq*100);if(hf)hf.style.width=Math.max(8,Math.min(100,liq*100))+'%';
  if(risk)risk.textContent=d===0?'Dengeli':d>cash+inv?'Yüksek Risk':'Kontrollü';
  let monthly=active().reduce((sum,l)=>sum+Math.min(Number(l.installment||0),Number(l.remaining||0)),0)+operatingStats().expense;
  let mo=document.getElementById('monthlyObligation'),ml=document.getElementById('monthlyLoanPayment'),bc=document.getElementById('budgetLoanCount');
  if(mo)mo.textContent=money(monthly);if(ml)ml.textContent=money(monthly);if(bc)bc.textContent=active().length;
  let base=cash+inv,ratio=base>0?Math.min(999,d/base*100):0,dr=document.getElementById('debtRatio'),df=document.getElementById('debtRatioFill'),ba=document.getElementById('budgetAdvice');
  if(dr)dr.textContent='%'+Math.round(ratio);if(df)df.style.width=Math.min(100,ratio)+'%';
  if(ba)ba.textContent=d===0?'Aktif borcun bulunmuyor. Yeni yatırım fırsatları için nakit tamponu koruyabilirsin.':ratio>80?'Borç yükün yüksek. Yeni kredi yerine mevcut borcu azaltmak daha güvenli.':ratio>40?'Borç seviyen orta. Yeni yatırım öncesi taksit yükünü kontrol et.':'Borç seviyen kontrollü durumda.';
  renderDeposits()
}


function saveOwned(){localStorage.setItem('gs117_assets',JSON.stringify(ownedAssets));localStorage.setItem('gs119_factoryOp',JSON.stringify(factoryOp));localStorage.setItem('gs119_constructionOp',JSON.stringify(constructionOp));localStorage.setItem('gs121_selectedLand',selectedLandId);localStorage.setItem('gs121_factoryLevel',factoryLevel);localStorage.setItem('gs126_reputation',reputation);localStorage.setItem('gs126_economy',JSON.stringify(economyState));localStorage.setItem('gs132_sim',JSON.stringify(sim))}
function buyAsset(id,name,type,price,rent=0){
 if(ownedAssets.some(a=>a.id===id)){renderGameExtras();toast('Bu varlık zaten sende');setPurchaseResult(id,name,price,true);return true}
 if(cash<price){toast('Yetersiz nakit');if(event&&event.preventDefault)event.preventDefault();return false}
 cash-=price;ownedAssets.push({id,name,type,price,rent:Number(rent||0),rented:false,t:Date.now(),rentReady:0});ensureAssetMetadata();
 tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:name,total:price});
 reputation=clamp(reputation+1,0,100);saveOwned();save();render();renderGameExtras();setPurchaseResult(id,name,price,false);toast(name+' satın alındı');return true
}
function purchaseScreenId(id){
 const special={factory_basic:'purchase_factory',construction_basic:'purchase_construction'};
 return special[id]||('purchase_'+id)
}
function setPurchaseResult(id,name,price,already){
 let p=purchaseScreenId(id);
 let t=document.getElementById(p+'_title'),x=document.getElementById(p+'_text'),d=document.getElementById(p+'_detail');
 if(!t&&!x&&!d)return;
 if(already){
   if(t)t.textContent='ℹ️ Varlık zaten portföyünde';
   if(x)x.textContent=name+' daha önce satın alınmış.';
   if(d)d.innerHTML='Mevcut nakit: <b>'+money(cash)+'</b>';
   return
 }
 if(t)t.textContent='✅ Satın alma tamamlandı';
 if(x)x.textContent=name+' portföyüne eklendi.';
 if(d)d.innerHTML='Ödenen: <b>'+money(price)+'</b> • Kalan nakit: <b>'+money(cash)+'</b>'
}
function renderOwned(){
 let e=document.getElementById('ownedAssets'),g=document.getElementById('garageAssets');
 if(e)e.innerHTML=ownedAssets.length?ownedAssets.map((a,i)=>{let rent=a.type==='Gayrimenkul';let ready=rent&&Date.now()>=Number(a.rentReady||0);return '<div class="asset-owned"><div><b>'+a.name+'</b><span>'+a.type+' • '+new Date(a.t).toLocaleDateString('tr-TR')+'</span><div class="asset-owned-actions">'+(rent?'<button class="income-btn" '+(ready?'':'disabled')+' onclick="collectRent('+i+')">'+(ready?'Kirayı Al':'Kira Bekleniyor')+'</button>':'')+'<button onclick="sellOwned('+i+')">Sat ('+money(a.price*.9)+')</button></div></div><strong>'+money(a.price)+'</strong></div>'}).join(''):'<div class="info-card" style="text-align:center;color:var(--muted)">Henüz satın alınmış varlık yok.</div>';
 let cars=ownedAssets.map((a,i)=>({a,i})).filter(o=>o.a.type==='Araç');if(g)g.innerHTML=cars.length?cars.map(o=>'<div class="asset-owned"><div><b>'+o.a.name+'</b><span>Araç portföyü</span><div class="asset-owned-actions"><button onclick="sellOwned('+o.i+')">Aracı Sat ('+money(o.a.price*.9)+')</button></div></div><strong>'+money(o.a.price)+'</strong></div>').join(''):'<div class="info-card" style="text-align:center;color:var(--muted)">Garajında henüz araç yok.</div>'
}
function ownedValue(){return ownedAssets.reduce((s,a)=>s+Number(a.price||0),0)}


function sellOwned(index){
 let a=ownedAssets[index];if(!a)return;if(a.collateral){toast('Bu varlık aktif kredi için teminatta');return}
 let ageDays=Math.max(0,(Date.now()-Number(a.t||Date.now()))/86400000),dep=a.type==='Araç'?Math.max(.65,.9-ageDays*.002):.9;let amount=Math.round(Number(a.price||0)*dep);
 if((a.id==='factory_basic'&&factoryOp.status==='running')||(a.id==='construction_basic'&&constructionOp.status==='running')){toast('Aktif operasyon varken işletme satılamaz');return}
 ownedAssets.splice(index,1);cash+=amount;
 if(a.id==='factory_basic')factoryOp={status:'idle',finish:0};
 if(a.id==='construction_basic')constructionOp={status:'idle',finish:0};
 tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:amount});
 saveOwned();save();render();renderGameExtras();toast(a.name+' satıldı • '+money(amount))
}
function owns(id){return ownedAssets.some(a=>a.id===id)}
function startFactoryBatch(){
 if(!owns('factory_basic')){toast('Önce fabrikayı kur');return}
 if(factoryOp.status==='running'){toast('Üretim zaten devam ediyor');return}
 if(factoryOp.status==='ready'){toast('Önce hazır ürünü sat');return}
 let cost=550000*factoryLevel,duration=Math.max(10000,20000-(factoryLevel-1)*4000);
 if((sim.raw||0)<10){toast('Üretim için 10 birim hammadde gerekli');return}
 if(cash<cost){toast('Üretim için '+money(cost)+' gerekli');return}
 sim.raw-=10;cash-=cost;simSave();factoryOp={status:'running',finish:Date.now()+duration,cost,revenue:800000*factoryLevel*(1+employeeStats().bonus/100)};
 tx.unshift({t:Date.now(),kind:'business',type:'factory_start',sym:'Üretim Partisi',total:cost});saveOwned();save();render();renderGameExtras();toast('Üretim başladı')
}
function collectFactoryBatch(){
 if(factoryOp.status!=='ready'){toast('Satılabilir ürün henüz hazır değil');return}
 let revenue=Number(factoryOp.revenue||800000*factoryLevel);cash+=revenue;factoryOp={status:'idle',finish:0};sim.currentMonth.revenue+=revenue;simSave();
 tx.unshift({t:Date.now(),kind:'business',type:'factory_collect',sym:'Üretim Satışı',total:revenue});saveOwned();save();render();renderGameExtras();reputation=clamp(reputation+1,0,100);saveOwned();toast('Ürün satıldı • +'+money(revenue))
}
function startConstructionProject(){toast('Arsa Geliştirme ekranından arsa ve proje seç');}
function collectConstructionProject(){
 if(constructionOp.status!=='ready'){toast('Proje henüz hazır değil');return}
 if(completeConstructionToPortfolio()){toast('Proje tamamlandı ve bağımsız bölümler oluştu');location.hash='project_portfolio'}
}
function updateOps(){
 if(factoryOp.status==='running'&&Date.now()>=factoryOp.finish)factoryOp.status='ready';
 if(constructionOp.status==='running'&&Date.now()>=constructionOp.finish)constructionOp.status='ready';
 let fs=document.getElementById('factoryStatus'),ft=document.getElementById('factoryOpsTitle'),fx=document.getElementById('factoryOpsText'),fb=document.getElementById('factoryStartBtn'),fc=document.getElementById('factoryCollectBtn');
 if(!owns('factory_basic')){if(fs)fs.innerHTML='<strong>Durum</strong><p>Tesis henüz kurulmadı.</p>';if(ft)ft.textContent='Kurulu değil';if(fx)fx.textContent='Üretim başlatmak için önce fabrikayı kurmalısın.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}
 else{if(fs)fs.innerHTML='<strong>Durum</strong><p>Fabrika aktif ve üretime hazır.</p>';if(factoryOp.status==='idle'){if(ft)ft.textContent='Üretime hazır';if(fx)fx.textContent=money(550000*factoryLevel)+' maliyetle yeni üretim partisi başlatabilirsin.';if(fb){fb.removeAttribute('disabled');fb.removeAttribute('aria-disabled')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}else if(factoryOp.status==='running'){let sec=Math.max(0,Math.ceil((factoryOp.finish-Date.now())/1000));if(ft)ft.textContent='Üretimde';if(fx)fx.textContent='Parti tamamlanmasına yaklaşık '+sec+' saniye kaldı.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.setAttribute('disabled','');fc.setAttribute('aria-disabled','true')}}else{if(ft)ft.textContent='Ürün hazır';if(fx)fx.textContent='Üretim tamamlandı. Ürünü satarak '+money(factoryOp.revenue||800000*factoryLevel)+' gelir elde edebilirsin.';if(fb){fb.setAttribute('disabled','');fb.setAttribute('aria-disabled','true')};if(fc){fc.removeAttribute('disabled');fc.removeAttribute('aria-disabled')}}}
 let cs=document.getElementById('constructionStatus'),ct=document.getElementById('constructionOpsTitle'),cx=document.getElementById('constructionOpsText'),cc=document.getElementById('constructionCollectBtn'),pc=document.getElementById('projectCost'),pr=document.getElementById('projectRevenue'),pd=document.getElementById('projectDuration');
 if(!owns('construction_basic')){if(cs)cs.innerHTML='<strong>Durum</strong><p>Şirket henüz kurulmadı.</p>';if(ct)ct.textContent='Şirket yok';if(cx)cx.textContent='Proje başlatmak için önce inşaat şirketi kurmalısın.';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}
 else{if(cs)cs.innerHTML='<strong>Durum</strong><p>Şirket aktif ve arsa geliştirebilir.</p>';if(constructionOp.status==='idle'){if(ct)ct.textContent='Proje yok';if(cx)cx.textContent='Arsalarımı Gör bölümünden arsa ve proje türü seç.';if(pc)pc.textContent='—';if(pr)pr.textContent='—';if(pd)pd.textContent='—';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}else if(constructionOp.status==='running'){let sec=Math.max(0,Math.ceil((constructionOp.finish-Date.now())/1000));if(ct)ct.textContent=constructionOp.projectName||'Proje';if(cx)cx.textContent='Projenin tamamlanmasına yaklaşık '+sec+' oyun günü kaldı.';if(pc)pc.textContent=money(constructionOp.cost);if(pr)pr.textContent=money(constructionOp.revenue);if(pd)pd.textContent=sec+' gün';if(cc){cc.setAttribute('disabled','');cc.setAttribute('aria-disabled','true')}}else{if(ct)ct.textContent=(constructionOp.projectName||'Proje')+' hazır';if(cx)cx.textContent='İnşaat tamamlandı. Projeyi bağımsız bölümlere ayırabilirsin.';if(pc)pc.textContent=money(constructionOp.cost);if(pr)pr.textContent=money(constructionOp.revenue);if(pd)pd.textContent='Tamamlandı';if(cc){cc.removeAttribute('disabled');cc.removeAttribute('aria-disabled')}}}
 saveOwned()
}
function gameLevel(){return Math.floor(gameXp()/100)}
function missionState(){
 return {asset:ownedAssets.some(a=>a.type==='Arsa'||a.type==='Gayrimenkul'),car:ownedAssets.some(a=>a.type==='Araç'),business:ownedAssets.some(a=>a.type==='İşletme'),finance:tx.some(x=>x.kind==='trade')}
}
function renderMissions(){
 let m=missionState(),done=Object.values(m).filter(Boolean).length;
 document.querySelectorAll('.mission-line').forEach(el=>{let k=el.getAttribute('data-mission'),ok=!!m[k];el.classList.toggle('done',ok);let s=el.querySelector('strong');if(s)s.textContent=ok?'Tamamlandı':'Bekliyor'});
 let p=document.getElementById('missionProgressText');if(p)p.textContent=done+' / 4 hedef';
}
function renderBusinessSummary(){
 let biz=ownedAssets.filter(a=>a.type==='İşletme'),bc=document.getElementById('businessCount'),bv=document.getElementById('businessValue'),ao=document.getElementById('activeOps');
 if(bc)bc.textContent=biz.length;if(bv)bv.textContent=money(biz.reduce((s,a)=>s+a.price,0));if(ao)ao.textContent=(factoryOp.status!=='idle'?1:0)+(constructionOp.status!=='idle'?1:0)
}
function renderActivity(){
 let e=document.getElementById('homeActivity');if(!e)return;if(!tx.length){e.innerHTML='<span>Henüz işlem yok.</span>';return}
 let x=tx[0],labels={asset_buy:'Varlık satın alındı',asset_sell:'Varlık satıldı',buy:'Yatırım alımı',sell:'Yatırım satışı',loan_in:'Kredi kullanıldı',installment:'Taksit ödendi',factory_start:'Üretim başladı',factory_collect:'Üretim geliri',construction_start:'Proje başladı',construction_collect:'Proje satıldı',deposit_open:'Vadeli hesap açıldı'};
 e.innerHTML='<b style="color:var(--text)">'+(labels[x.type]||'Finansal işlem')+'</b><br><span>'+x.sym+' • '+new Date(x.t).toLocaleString('tr-TR')+'</span>'
}



const PROJECTS={
 villa:{name:'Villa Projesi',cost:3000000,revenue:5200000,duration:20,units:2},
 apartment:{name:'Apartman Projesi',cost:5500000,revenue:11200000,duration:30,units:8},
 residence:{name:'20 Dairelik Rezidans',cost:18000000,revenue:36000000,duration:45,units:20},
 commercial:{name:'Ticari Proje',cost:8500000,revenue:16200000,duration:38,units:4}
};
function selectDevelopmentLand(id){
 let a=ownedAssets.find(x=>x.id===id);if(!a){toast('Arsa bulunamadı');return false}
 if(constructionOp.status==='running'||constructionOp.status==='ready'){toast('Önce mevcut projeyi tamamla');return false}
 selectedLandId=id;localStorage.setItem('gs121_selectedLand',id);renderDevelopableLands();
 let e=document.getElementById('selectedLandLabel');if(e)e.textContent=a.name;
 return true
}

function chooseProjectPlan(kind){
 let land=ownedAssets.find(a=>a.id===selectedLandId&&a.type==='Arsa');if(!land){toast('Önce arsa seç');return false}
 if(!owns('construction_basic')){toast('Önce inşaat şirketini kur');return false}
 if(constructionOp.status!=='idle'){toast('Aktif proje varken yeni plan oluşturulamaz');return false}
 sim.constructionPlan={kind,permit:false,architect:'standard',contractor:'economy'};simSave();setTimeout(renderConstructionPlan,0);return true
}
function constructionPlanNumbers(){
 let p=PROJECTS[sim.constructionPlan.kind],arch=document.getElementById('architectQuality')?.value||sim.constructionPlan.architect||'standard',cont=document.getElementById('contractorQuality')?.value||sim.constructionPlan.contractor||'economy';
 if(!p)return null;sim.constructionPlan.architect=arch;sim.constructionPlan.contractor=cont;
 let archCost=arch==='expert'?450000:arch==='elite'?1200000:0,contCost=cont==='professional'?600000:cont==='fast'?1500000:0,permit=Math.round(p.cost*.035/10000)*10000;
 let engineers=sim.employees.filter(e=>e.role==='Mühendis').length,days=p.duration*(arch==='elite'?.86:arch==='expert'?.93:1)*(cont==='fast'?.72:cont==='professional'?.86:1)*(1-Math.min(.18,engineers*.035));
 let risk=Math.max(.02,.11-(arch==='elite'?.055:arch==='expert'?.03:0)-(cont==='professional'?.015:cont==='fast'?.025:0)-Math.min(.025,engineers*.008));
 let riskCost=Math.round(p.cost*risk*Math.random()/10000)*10000,total=p.cost+archCost+contCost+permit+riskCost;
 return {p,arch,cont,archCost,contCost,permit,days:Math.max(8,Math.round(days)),risk,riskCost,total}
}
function renderConstructionPlan(){
 let n=constructionPlanNumbers(),land=ownedAssets.find(a=>a.id===selectedLandId),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};if(!n)return;
 set('planProjectName',n.p.name);set('planLand',land?.name||'—');set('planDays',n.days+' oyun günü');set('planBaseCost',money(n.p.cost));set('planPermitCost',money(n.permit));set('planRisk','%'+Math.round(n.risk*100));set('planTotalCost',money(n.total));set('permitStatus',sim.constructionPlan.permit?'Ruhsat onaylandı':'Başvuru yapılmadı');simSave()
}
function obtainPermit(){
 let n=constructionPlanNumbers();if(!n)return;if(sim.constructionPlan.permit){toast('Ruhsat zaten alındı');return}
 if(cash<n.permit){toast('Ruhsat bedeli için nakit yetersiz');return}cash-=n.permit;sim.constructionPlan.permit=true;sim.constructionPlan.permitPaid=n.permit;sim.currentMonth.expense+=n.permit;simSave();save();render();renderConstructionPlan();toast('Yapı ruhsatı alındı')
}
function startPlannedProject(){
 let n=constructionPlanNumbers(),land=ownedAssets.find(a=>a.id===selectedLandId&&a.type==='Arsa');if(!n||!land){toast('Proje veya arsa eksik');return}
 if(!sim.constructionPlan.permit){toast('Önce yapı ruhsatını almalısın');return}
 let remaining=n.total-Number(sim.constructionPlan.permitPaid||0);if(cash<remaining){toast('Proje bütçesi için '+money(remaining)+' gerekli');return}
 cash-=remaining;constructionOp={status:'running',finish:Date.now()+n.days*1000,cost:n.total,revenue:n.p.revenue,projectName:n.p.name,landId:land.id,kind:sim.constructionPlan.kind,days:n.days,riskCost:n.riskCost};sim.currentMonth.expense+=remaining;tx.unshift({t:Date.now(),kind:'business',type:'construction_start',sym:n.p.name,total:n.total});sim.constructionPlan={kind:'',permit:false,architect:'standard',contractor:'economy'};saveOwned();simSave();save();render();renderGameExtras();location.hash='construction_ops';toast(n.p.name+' inşaatı başladı')
}

function startLandProject(kind){return chooseProjectPlan(kind)}
function upgradeFactory(){
 if(!owns('factory_basic')){toast('Önce fabrikayı kur');return}
 if(factoryOp.status!=='idle'){toast('Üretim devam ederken tesis geliştirilemez');return}
 if(factoryLevel>=3){toast('Tesis maksimum seviyede');return}
 let cost=factoryLevel===1?3000000:6000000;if(cash<cost){toast('Geliştirme için '+money(cost)+' gerekli');return}
 cash-=cost;factoryLevel++;let f=ownedAssets.find(a=>a.id==='factory_basic');if(f)f.price+=cost;
 tx.unshift({t:Date.now(),kind:'business',type:'factory_upgrade',sym:'Fabrika Seviye '+factoryLevel,total:cost});saveOwned();save();render();renderGameExtras();toast('Fabrika Seviye '+factoryLevel+' oldu')
}
function collectRent(index){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;
 if(Date.now()<Number(a.rentReady||0)){toast('Kira henüz hazır değil');return}
 let rent=Number(a.rent||42000);cash+=rent;a.rentReady=Date.now()+30000;sim.currentMonth.revenue+=rent;simSave();
 tx.unshift({t:Date.now(),kind:'income',type:'rent_collect',sym:a.name,total:rent});saveOwned();save();render();renderGameExtras();toast('Kira geliri • +'+money(rent))
}
function renderFactoryUpgrade(){
 let lvl=document.getElementById('factoryUpgradeLevel'),cost=document.getElementById('factoryUpgradeCost'),lt=document.getElementById('factoryLevelText'),val=document.getElementById('factoryVal'),cap=document.getElementById('factoryCap'),prof=document.getElementById('factoryProfit');
 if(lvl)lvl.textContent=factoryLevel;if(cost)cost.textContent=factoryLevel>=3?'MAX':money(factoryLevel===1?3000000:6000000);
 if(lt)lt.textContent='Seviye '+factoryLevel+' • '+factoryLevel+' üretim hattı';if(cap)cap.textContent=(100*factoryLevel)+' birim';if(prof)prof.textContent=money(250000*factoryLevel);
 let f=ownedAssets.find(a=>a.id==='factory_basic');if(val)val.textContent=money(f?f.price:7500000);
 let bc=document.getElementById('factoryBatchCost'),br=document.getElementById('factoryBatchRevenue'),bd=document.getElementById('factoryBatchDuration');
 if(bc)bc.textContent=money(550000*factoryLevel);if(br)br.textContent=money(800000*factoryLevel);if(bd)bd.textContent=Math.max(10,20-(factoryLevel-1)*4)+' sn'
}

function renderDevelopableLands(){
 let e=document.getElementById('developableLands');if(!e)return;
 let lands=ownedAssets.filter(a=>a.type==='Arsa');
 if(!lands.length){e.innerHTML='<div class="info-card" style="text-align:center;color:var(--muted)">Projeye uygun satın alınmış arsa bulunmuyor.</div>';return}
 e.innerHTML=lands.map(a=>'<div class="dev-card"><b>'+a.name+'</b><span>Arsa değeri '+money(a.price)+' • İnşaat şirketi '+(owns('construction_basic')?'aktif':'gerekli')+'</span><a href="#project_catalog" onclick="return selectDevelopmentLand(\''+a.id+'\')">'+(owns('construction_basic')?'Proje Seç':'Önce Şirket Kur')+'</a></div>').join('');
 let sl=ownedAssets.find(a=>a.id===selectedLandId),lab=document.getElementById('selectedLandLabel');if(lab)lab.textContent=sl?sl.name:'Arsa seçilmedi'
}


function filterCities(){
 let q=(document.getElementById('citySearch')?.value||'').toLocaleLowerCase('tr-TR'),r=document.getElementById('regionFilter')?.value||'',count=0;
 document.querySelectorAll('.city-filter-item').forEach(el=>{let ok=(!q||(el.dataset.city||'').includes(q))&&(!r||(el.dataset.region||'')===r);el.hidden=!ok;if(ok)count++});
 let label=document.getElementById('cityCountLabel');if(label)label.textContent=count+' şehir'
}


const ECONOMY_EVENTS=[
 {id:'neutral',title:'Piyasalar dengeli seyrediyor',body:'Belirgin bir risk iştahı veya güvenli liman talebi bulunmuyor.',mood:'Dengeli',icon:'📊',stock:0,crypto:0,gold:0},
 {id:'growth',title:'Büyüme beklentileri güçlendi',body:'Şirket kârlılık beklentileri artarken riskli varlıklara talep yükseliyor.',mood:'Risk İştahı Yüksek',icon:'📈',stock:.003,crypto:.004,gold:-.001},
 {id:'riskoff',title:'Küresel risk algısı yükseldi',body:'Yatırımcılar daha güvenli varlıklara yöneliyor; riskli piyasalarda satış baskısı var.',mood:'Temkinli',icon:'⚠️',stock:-.003,crypto:-.006,gold:.003},
 {id:'crypto',title:'Dijital varlıklara talep arttı',body:'Kripto piyasasında işlem hacmi ve risk iştahı yükseldi.',mood:'Kripto Pozitif',icon:'₿',stock:.001,crypto:.009,gold:0},
 {id:'gold',title:'Güvenli liman talebi arttı',body:'Belirsizlik nedeniyle altına yönelik talep güçleniyor.',mood:'Altın Pozitif',icon:'🪙',stock:-.001,crypto:-.002,gold:.006}
];
function currentEconomy(){
 let e=ECONOMY_EVENTS.find(x=>x.id===economyState.id)||ECONOMY_EVENTS[0];
 if(!economyState.until||Date.now()>economyState.until){
   e=ECONOMY_EVENTS[Math.floor(Math.random()*ECONOMY_EVENTS.length)];
   economyState={id:e.id,until:Date.now()+60000};saveOwned()
 }
 return e
}
function operatingStats(){
 let rental=ownedAssets.filter(a=>a.type==='Gayrimenkul'&&a.tenantStatus==='occupied').reduce((s,a)=>s+Number(a.rent||42000),0)+projectRentalIncome();
 let expense=ownedAssets.reduce((s,a)=>s+(a.type==='Gayrimenkul'?Math.round(a.price*.0012):a.type==='Araç'?Math.round(a.price*.0015):a.id==='factory_basic'?180000*factoryLevel:a.id==='construction_basic'?120000:0),0);
 let loanPay=active().reduce((s,l)=>s+Math.min(Number(l.installment||0),Number(l.remaining||0)),0);
 return {rental,expense,loanPay,net:rental-expense-loanPay}
}
function gameXp(){
 let completed=Object.values(missionState()).filter(Boolean).length;
 return Math.max(0,Math.round(tx.length*7+ownedAssets.length*12+completed*25+(factoryLevel-1)*20))
}
function renderEconomy(){
 let e=currentEconomy();
 let q=id=>document.getElementById(id);
 if(q('economyHeadline'))q('economyHeadline').textContent=e.title;
 if(q('economyImpact'))q('economyImpact').textContent=e.body;
 if(q('marketMood'))q('marketMood').textContent=e.mood;
 if(q('economyMoodIcon'))q('economyMoodIcon').textContent=e.icon;
 if(q('economyMoodTitle'))q('economyMoodTitle').textContent=e.mood;
 if(q('economyMoodText'))q('economyMoodText').textContent=e.body;
 if(q('economyNewsTitle'))q('economyNewsTitle').textContent=e.title;
 if(q('economyNewsBody'))q('economyNewsBody').textContent=e.body;
 if(q('economyNewsImpact'))q('economyNewsImpact').textContent='Borsa: '+(e.stock>0?'pozitif':e.stock<0?'negatif':'nötr')+' • Kripto: '+(e.crypto>0?'pozitif':e.crypto<0?'negatif':'nötr')+' • Altın: '+(e.gold>0?'pozitif':e.gold<0?'negatif':'nötr');
 if(q('economyTimer'))q('economyTimer').textContent=Math.max(0,Math.ceil((economyState.until-Date.now())/1000))+' sn'
}
function renderRealism(){
 let o=operatingStats(),xp=gameXp(),lvl=Math.floor(xp/100),within=xp%100;
 let set=(id,val)=>{let e=document.getElementById(id);if(e)e.textContent=val};
 set('homeReputation',Math.round(reputation));set('profileReputation',Math.round(reputation));set('characterRep',Math.round(reputation));
 set('homeAssetCount',ownedAssets.length);set('homeDebt',money(debt()));set('homeCashflow',money(o.net));
 set('operatingExpense',money(o.expense));set('estimatedIncome',money(o.rental));set('netCashflow',money(o.net));
 set('characterLevel',lvl);set('characterXp',xp);set('characterTitle','Girişimci • Seviye '+lvl);set('xpText',within+' / 100 XP');
 let fill=document.getElementById('xpFill');if(fill)fill.style.width=within+'%';
 renderEconomy()
}


const STAFF={
 'Satış Danışmanı':{salary:65000,bonus:2},
 'Muhasebeci':{salary:80000,bonus:3},
 'Mühendis':{salary:110000,bonus:5},
 'Yönetici':{salary:150000,bonus:6}
};
function simSave(){localStorage.setItem('gs132_sim',JSON.stringify(sim));if(typeof saveUnifiedState==='function')saveUnifiedState()}
function pushNotification(title,text){
 sim.notifications.unshift({title,text,t:Date.now()});sim.notifications=sim.notifications.slice(0,40);simSave();renderNotifications()
}
function clearNotifications(){sim.notifications=[];simSave();renderNotifications();toast('Bildirimler temizlendi')}
function saveCompanyName(){let e=document.getElementById('companyNameInput'),v=(e?.value||'').trim();if(v.length<3){toast('Şirket adı en az 3 karakter olmalı');return}sim.companyName=v;simSave();renderSimulation();toast('Şirket adı güncellendi')}
function hireEmployee(role,salary,bonus){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');location.hash='business';return}
 if(role==='Yönetici'&&reputation<60){toast('Yönetici işe almak için en az 60 itibar gerekli');return}
 if(role==='Mühendis'&&reputation<45){toast('Mühendis işe almak için en az 45 itibar gerekli');return}
 salary=normalizeNumber(salary,0);
 if(c.companyCash<salary){toast('Şirket hesabında ilk maaş için yeterli bakiye yok');return}
 c.companyCash-=salary;
 c.employees.push({id:'emp_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),companyId:c.id,role,salary,bonus:normalizeNumber(bonus,0),t:Date.now()});
 reputation=clamp(reputation+1,0,100);
 tx.unshift({t:Date.now(),kind:'business',type:'employee_hire',companyId:c.id,sym:c.name+' • '+role,total:salary});
 syncSelectedCompanyToProfile();simSave();save();render();renderGameExtras();
 pushNotification('Yeni çalışan',c.name+' • '+role+' ekibe katıldı.');toast(role+' işe alındı')
}
function fireEmployee(i){
 let c=selectedCompany(),arr=selectedCompanyEmployees(),e=arr[i];if(!c||!e)return;
 arr.splice(i,1);syncSelectedCompanyToProfile();simSave();renderSimulation();renderCompanyFoundation();
 pushNotification('Personel ayrıldı',c.name+' • '+e.role+' işten ayrıldı.')
}
function employeeStats(){return selectedCompanyEmployeeStats()}
function buyRawMaterial(){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');return}
 if(c.sector!=='Sanayi'){toast('Hammadde alımı Sanayi şirketleri içindir');return}
 let q=Number(document.getElementById('rawQty')?.value);if(!q||q<10){toast('En az 10 birim gir');return}
 let total=q*25000;if(c.companyCash<total){toast('Şirket hesabında yeterli bakiye yok');return}
 c.companyCash-=total;c.raw=normalizeNumber(c.raw,0)+q;sim.raw=c.raw;syncSelectedCompanyToProfile();
 tx.unshift({t:Date.now(),kind:'business',type:'raw_buy',companyId:c.id,sym:c.name+' • Hammadde',total});
 simSave();save();render();renderGameExtras();pushNotification('Hammadde alındı',c.name+' stoğuna '+q+' birim eklendi.');toast('Stok güncellendi')
}
function maintenanceCost(){return ownedAssets.reduce((s,a)=>s+(a.type==='Gayrimenkul'?Math.round(a.price*.0007):a.type==='Araç'?Math.round(a.price*.001):a.id==='factory_basic'?120000*factoryLevel:a.id==='construction_basic'?90000:0),0)}
function processAccountingCycle(){closeGameMonth()}
function payTaxes(){let due=Number(sim.taxDue||0);if(due<=0){toast('Ödenecek vergi karşılığı yok');return}if(cash<due){toast('Vergi için yeterli nakit yok');return}cash-=due;sim.taxDue=0;tx.unshift({t:Date.now(),kind:'business',type:'tax_pay',sym:'Vergi Ödemesi',total:due});reputation=clamp(reputation+1,0,100);save();simSave();render();renderGameExtras();pushNotification('Vergi ödendi',money(due)+' vergi karşılığı kapatıldı.')}
function renderNotifications(){let e=document.getElementById('notificationList');if(!e)return;e.innerHTML=sim.notifications.length?sim.notifications.map(n=>'<div class="notify-row"><b>'+n.title+'</b><span>'+n.text+' • '+new Date(n.t).toLocaleString('tr-TR')+'</span></div>').join(''):'<div class="info-card"><p>Henüz bildirim yok.</p></div>'}
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
function renderAchievements(){let e=document.getElementById('achievementList');if(!e)return;e.innerHTML=achievementData().map(a=>'<div class="achievement-row '+(a[3]?'done':'')+'"><div>'+a[0]+'</div><div><b>'+a[1]+'</b><span>'+a[2]+'</span></div><strong>'+(a[3]?'Tamamlandı':'Devam')+'</strong></div>').join('')}
function generateNpcOffers(){
 let rep=Math.round(reputation),disc=Math.min(12,3+Math.floor(rep/20)),base=[
  {name:'Fırsat Dairesi',type:'Gayrimenkul',price:7200000},
  {name:'İkinci El SUV',type:'Araç',price:2050000},
  {name:'Gelişim Bölgesi Arsası',type:'Arsa',price:12500000}
 ];
 sim.npcOffers=base.map((o,i)=>({...o,id:'npc_'+Date.now()+'_'+i,discount:Math.max(2,disc-Math.floor(Math.random()*3)),expires:Date.now()+180000}));
 sim.npcRefresh=Date.now()+180000;simSave()
}
function refreshNpcOffers(force=false){if(force&&Date.now()<sim.npcRefresh){toast('Teklifler henüz yenilenmedi');return}generateNpcOffers();renderNpcOffers()}
function renderNpcOffers(){
 if(!sim.npcOffers.length||Date.now()>sim.npcRefresh)generateNpcOffers();
 let e=document.getElementById('npcOfferList');if(!e)return;
 e.innerHTML=sim.npcOffers.map((o,i)=>{let final=Math.round(o.price*(1-o.discount/100)/1000)*1000;return '<div class="offer-card"><b>'+o.name+'</b><span>'+o.type+' • İtibar indirimi %'+o.discount+'</span><div class="offer-price"><del>'+money(o.price)+'</del><strong>'+money(final)+'</strong></div><button onclick="acceptNpcOffer('+i+')">Teklifi Kabul Et</button></div>'}).join('')
}
function acceptNpcOffer(i){
 let o=sim.npcOffers[i];if(!o)return;let price=Math.round(o.price*(1-o.discount/100)/1000)*1000;
 if(cash<price){toast('Yetersiz nakit');return}
 cash-=price;ownedAssets.push({id:o.id,name:o.name,type:o.type,price,t:Date.now(),rent:o.type==='Gayrimenkul'?45000:0,rentReady:o.type==='Gayrimenkul'?Date.now()+30000:0});sim.npcOffers.splice(i,1);reputation=clamp(reputation+1,0,100);tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:o.name,total:price});saveOwned();save();render();renderGameExtras();pushNotification('Özel teklif alındı',o.name+' '+money(price)+' karşılığında portföye eklendi.');toast('Teklif kabul edildi')
}
function riskScore(){
 let total=cash+ownedValue()+stats('stock').value+stats('crypto').value+stats('gold').value+depositStats().total,ratio=total>0?debt()/total:debt()>0?1:0;
 return ratio>.65?'Yüksek':ratio>.35?'Orta':'Düşük'
}
function renderSimulation(){
 let st=employeeStats(),arr=selectedCompanyEmployees(),c=selectedCompany(),set=(id,val)=>{let e=document.getElementById(id);if(e)e.textContent=val},now=new Date();
 set('managementClock',now.toLocaleTimeString('tr-TR'));set('managementDate',now.toLocaleDateString('tr-TR'));
 let sec=Math.max(0,Math.ceil((normalizeNumber(sim.cycleDue,Date.now()+300000)-Date.now())/1000));set('cycleCountdown',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));set('riskLabel',riskScore());
 set('companyNameLabel',c?c.name:'Şirket seçilmedi');
 let ci=document.getElementById('companyNameInput');if(ci&&document.activeElement!==ci)ci.value=c?c.name:'';
 set('employeeCount',arr.length);set('employeesTotal',arr.length);set('staffCountLabel',arr.length+' kişi');set('salaryTotal',money(st.salary));set('employeeBonus','%'+st.bonus);set('companyRep',Math.round(reputation));
 let cm=companyMetrics();set('companyValue',money(c?cm.value:0));set('companyTier',!c?'Şirket seçilmedi':cm.value>=100000000?'Kurumsal Ölçek':cm.value>=25000000?'Orta Ölçekli Şirket':cm.value>=5000000?'KOBİ':'Mikro İşletme');
 set('rawStock',(c?normalizeNumber(c.raw,0):0)+' birim');set('rawStockValue',money((c?normalizeNumber(c.raw,0):0)*25000));set('taxDue',money(sim.taxDue||0));set('taxSalary',money(st.salary));set('maintenanceExpense',money(maintenanceCost()));set('lastCycleExpense',money(sim.lastExpense||0));
 let list=document.getElementById('employeeList');if(list)list.innerHTML=arr.length?arr.map((e,i)=>'<div class="staff-row"><div><b>'+e.role+'</b><span>'+money(e.salary)+'/ay • +%'+e.bonus+' verim</span></div><button onclick="fireEmployee('+i+')">Çıkar</button></div>').join(''):'<p>Bu şirkette henüz çalışan yok.</p>';
 set('employeesCompanyTitle',c?c.name+' • Personel':'Personel');
 set('employeesCompanySubtitle',c?c.name+' şirketinin işe alım, maaş ve verim yönetimi':'Önce bir şirket seç');
 set('companyPerformance',c?(c.monthlyHistory?.length?'Son dönem net sonucu '+money(c.monthlyHistory[0].net||0)+'. İtibar: '+Math.round(reputation)+'/100.':'Bu şirket için henüz tamamlanmış muhasebe dönemi yok.'):'Önce bir şirket seç.');
 renderNotifications();renderAchievements();renderNpcOffers();
 if(Date.now()>=normalizeNumber(sim.cycleDue,Date.now()+300000))processAccountingCycle()
}

function collateralAssets(){return ownedAssets.map((a,i)=>({a,i})).filter(o=>!o.a.collateral&&o.a.price>=1000000)}
function renderCollateral(){
 let e=document.getElementById('collateralAssetList');if(!e)return;let list=collateralAssets();
 e.innerHTML=list.length?list.map(o=>{let max=Math.round(o.a.price*.5/1000)*1000;return '<div class="collateral-card"><b>'+o.a.name+'</b><span>'+o.a.type+' • Değer '+money(o.a.price)+' • Maksimum kredi '+money(max)+'</span><button onclick="takeSecuredLoan('+o.i+')">Teminat Göster ve Krediyi Kullan</button></div>'}).join(''):'<div class="info-card"><p>Teminata uygun serbest varlık bulunmuyor.</p></div>'
}
function takeSecuredLoan(index){
 let a=ownedAssets[index];if(!a||a.collateral){toast('Varlık teminata uygun değil');return}
 let amount=Math.round(a.price*.5/1000)*1000,months=6,rate=2.4,total=amount*(1+(rate/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 a.collateral=true;cash+=amount;loans.push({id:'secured',name:'Teminatlı Ticari Kredi',amount,rate,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false,collateralId:a.id});
 tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:'Teminatlı Ticari Kredi',total:amount});reputation=clamp(reputation+1,0,100);saveOwned();save();render();renderGameExtras();pushNotification('Teminatlı kredi',a.name+' teminatıyla '+money(amount)+' kredi bakiyene eklendi.');toast('Teminatlı kredi kullanıldı')
}
function dealerListingFor(id){return sim.dealerListings.find(x=>x.assetId===id)}
function listDealerCar(index,markup){
 let a=ownedAssets[index];if(!a||a.type!=='Araç'){toast('Araç bulunamadı');return}
 let existing=dealerListingFor(a.id),price=Math.round(a.price*(1+markup/100)/1000)*1000;
 if(existing){existing.price=price;existing.markup=markup}else sim.dealerListings.push({assetId:a.id,price,markup,t:Date.now()});
 simSave();renderDealer();toast('Araç '+money(price)+' fiyatla ilana kondu')
}
function removeDealerListing(id){sim.dealerListings=sim.dealerListings.filter(x=>x.assetId!==id);simSave();renderDealer()}
function checkDealerOffers(){
 if(!sim.dealerListings.length){toast('İlanda araç yok');return}
 let sold=0;
 [...sim.dealerListings].forEach(l=>{let a=ownedAssets.find(x=>x.id===l.assetId);if(!a){removeDealerListing(l.assetId);return}let chance=l.markup<=5?.8:l.markup<=10?.55:.3;if(Math.random()<chance){cash+=l.price;ownedAssets=ownedAssets.filter(x=>x.id!==a.id);sim.dealerListings=sim.dealerListings.filter(x=>x.assetId!==a.id);tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:l.price});sold++;pushNotification('Galeride satış',a.name+' '+money(l.price)+' fiyatla satıldı.')}});saveOwned();save();render();renderGameExtras();toast(sold?sold+' araç satıldı':'Bu tur müşteri çıkmadı')
}
function renderDealer(){
 let cars=ownedAssets.map((a,i)=>({a,i})).filter(o=>o.a.type==='Araç'),e=document.getElementById('dealerCars'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};
 set('dealerStock',cars.length);set('dealerListed',sim.dealerListings.length);set('dealerValue',money(cars.reduce((s,o)=>s+o.a.price,0)));
 if(!e)return;e.innerHTML=cars.length?cars.map(o=>{let l=dealerListingFor(o.a.id);return '<div class="dealer-card"><b>'+o.a.name+'</b><span>Alış değeri '+money(o.a.price)+(l?' • İlan '+money(l.price):' • İlanda değil')+'</span><div class="dealer-actions"><button onclick="listDealerCar('+o.i+',5)">%5 Kârla İlan</button><button onclick="listDealerCar('+o.i+',10)">%10 Kârla İlan</button>'+(l?'<button onclick="removeDealerListing(\''+o.a.id+'\')">İlanı Kaldır</button>':'')+'</div></div>'}).join(''):'<div class="info-card"><p>Galeride araç stoğu yok.</p></div>'
}
function renderCityOwnership(){
 let lands=ownedAssets.filter(a=>a.type==='Arsa'),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('ownedLandCount',lands.length);set('ownedLandValue',money(lands.reduce((s,a)=>s+a.price,0)))
}


const DEPT_INFO={
 sales:{name:'Satış',base:750000},
 finance:{name:'Finans',base:900000},
 construction:{name:'İnşaat',base:1200000},
 industry:{name:'Sanayi',base:1100000}
};
function deptLevel(k){return Number(sim.departments?.[k]||0)}
function upgradeDepartment(k){
 let d=DEPT_INFO[k];if(!d)return;let lvl=deptLevel(k);if(lvl>=5){toast('Departman maksimum seviyede');return}
 let cost=d.base*(lvl+1);if(cash<cost){toast('Geliştirme için '+money(cost)+' gerekli');return}
 cash-=cost;sim.departments[k]=lvl+1;sim.currentMonth.expense+=cost;tx.unshift({t:Date.now(),kind:'business',type:'department_upgrade',sym:d.name+' Departmanı',total:cost});simSave();save();render();renderGameExtras();toast(d.name+' departmanı Seviye '+(lvl+1)+' oldu')
}
function listingTemplate(){
 return [
  {type:'Arsa',names:['Gelişim Bölgesi Arsası','Ticari Köşe Parsel','Villa İmarlı Arsa'],base:[8500000,18000000,12500000],icon:'🗺️'},
  {type:'Gayrimenkul',names:['Hazır Kiracılı Daire','Cadde Dükkânı','Bahçeli Villa'],base:[7200000,14500000,21000000],icon:'🏠'},
  {type:'Araç',names:['Düşük Km Sedan','Hibrit SUV','Ticari Van'],base:[1550000,2850000,1750000],icon:'🚗'}
 ]
}
function generateDynamicListings(){
 let arr=[],rep=Math.round(reputation),templates=listingTemplate(),places=[
  {city:'İstanbul',district:'Kadıköy',neighborhood:'Fenerbahçe'},
  {city:'İstanbul',district:'Sarıyer',neighborhood:'Zekeriyaköy'},
  {city:'Ankara',district:'Çankaya',neighborhood:'Çayyolu'},
  {city:'İzmir',district:'Urla',neighborhood:'İskele'},
  {city:'Bursa',district:'Nilüfer',neighborhood:'Özlüce'},
  {city:'Antalya',district:'Konyaaltı',neighborhood:'Hurma'},
  {city:'Muğla',district:'Bodrum',neighborhood:'Yalıkavak'},
  {city:'Kocaeli',district:'Başiskele',neighborhood:'Sahil'}
 ],news=currentNews();
 templates.forEach(t=>t.names.forEach((name,i)=>{
   let loc=places[(arr.length+Math.floor(Math.random()*places.length))%places.length],city= CITY_ECON[loc.city]||{property:1,industry:1},typeEffect=t.type==='Gayrimenkul'?news.housing:t.type==='Araç'?news.auto:news.housing*.55,cityMul=t.type==='Arsa'||t.type==='Gayrimenkul'?city.property:1;
   let market=(.88+Math.random()*.25),ask=Math.round(t.base[i]*market*cityMul*(1+typeEffect)/10000)*10000,quality=Math.round(60+Math.random()*38),flex=Math.max(.90,.97-rep*.00035-Math.random()*.025);
   arr.push({id:'dyn_'+Date.now()+'_'+arr.length,type:t.type,name,ask,quality,flex,icon:t.icon,city:loc.city,district:loc.district,neighborhood:loc.neighborhood,seller:['Bireysel Satıcı','Yatırımcı','Kurumsal Portföy'][Math.floor(Math.random()*3)],expires:Date.now()+240000,rent:t.type==='Gayrimenkul'?Math.round(ask*.0055/1000)*1000:0})
 }));
 sim.dynamicListings=arr.sort(()=>Math.random()-.5).slice(0,8);sim.dynamicRefresh=Date.now()+240000;sim.lastMarketEvolve=Date.now();simSave()
}
function evolveDynamicListings(){
 if(!sim.lastMarketEvolve)sim.lastMarketEvolve=Date.now();
 if(Date.now()-sim.lastMarketEvolve<30000)return;
 sim.lastMarketEvolve=Date.now();
 if(sim.dynamicListings.length&&Math.random()<.35){let i=Math.floor(Math.random()*sim.dynamicListings.length),x=sim.dynamicListings[i];if(Math.random()<.35){sim.dynamicListings.splice(i,1);pushNotification('İlan kapandı',x.name+' başka bir alıcı tarafından satın alındı.')}else{x.ask=Math.round(x.ask*(.96+Math.random()*.08)/10000)*10000}}
 if(sim.dynamicListings.length<5)generateDynamicListings();simSave()
}

function ensureDynamicListings(){if(!sim.dynamicListings.length||Date.now()>sim.dynamicRefresh)generateDynamicListings();else evolveDynamicListings()}
function setDynamicFilter(f){sim.dynamicFilter=f;simSave();renderDynamicMarket()}
function renderDynamicMarket(){
 ensureDynamicListings();let e=document.getElementById('dynamicListingList');if(!e)return;
 let f=sim.dynamicFilter||'all',list=f==='all'?sim.dynamicListings:sim.dynamicListings.filter(x=>x.type===f);
 document.querySelectorAll('[data-dfilter]').forEach(b=>b.classList.toggle('active',b.dataset.dfilter===f));
 let set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};set('dynamicCount',list.length);set('dynamicRep',Math.round(reputation));
 let sec=Math.max(0,Math.ceil((sim.dynamicRefresh-Date.now())/1000));set('dynamicTimer',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));
 e.innerHTML=list.map(x=>'<div class="dynamic-listing"><div class="dynamic-listing-head"><div><b>'+x.icon+' '+x.name+'</b><small>'+x.type+' • '+x.seller+'</small></div><div class="dynamic-price">'+money(x.ask)+'</div></div><div class="dynamic-tags"><span>Kalite '+x.quality+'/100</span><span>Süreli ilan</span>'+(x.rent?'<span>Kira '+money(x.rent)+'/ay</span>':'')+'</div><div class="dynamic-actions"><a href="#negotiation" onclick="openNegotiation(\''+x.id+'\')">Pazarlık Yap</a><button onclick="buyDynamicNow(\''+x.id+'\')">İlan Fiyatından Al</button></div></div>').join('')
}
function findDynamic(id){return sim.dynamicListings.find(x=>x.id===id)}
function openNegotiation(id){
 let x=findDynamic(id);if(!x)return false;sim.negotiation={id,acceptedPrice:0,lastOffer:0};simSave();
 let set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};set('negotiationAssetName',x.name);set('negotiationAsk',money(x.ask));set('negotiationSeller',x.seller);set('negotiationMood','Teklif bekliyor');
 let inp=document.getElementById('negotiationInput');if(inp)inp.value=Math.round(x.ask*.93/10000)*10000;
 let r=document.getElementById('negotiationResponse');if(r)r.textContent='Satıcı teklifini bekliyor.';let ba=document.getElementById('negotiationBuyArea');if(ba)ba.innerHTML='';return true
}
function submitNegotiation(){
 let n=sim.negotiation,x=n&&findDynamic(n.id),offer=Number(document.getElementById('negotiationInput')?.value);if(!x||!offer)return;
 let min=x.ask*x.flex,resp=document.getElementById('negotiationResponse'),buy=document.getElementById('negotiationBuyArea');
 n.lastOffer=offer;
 if(offer>=min){let accepted=Math.min(offer,x.ask);n.acceptedPrice=accepted;if(resp)resp.textContent='Satıcı teklifini kabul etti: '+money(accepted);if(buy)buy.innerHTML='<button class="btn wide" onclick="buyNegotiated()">Anlaşmayı Tamamla • '+money(accepted)+'</button>';reputation=clamp(reputation+1,0,100)}
 else if(offer>=min*.96){let counter=Math.round(((offer+min)/2)/10000)*10000;n.acceptedPrice=counter;if(resp)resp.textContent='Karşı teklif: '+money(counter);if(buy)buy.innerHTML='<button class="btn wide" onclick="buyNegotiated()">Karşı Teklifi Kabul Et • '+money(counter)+'</button>'}
 else{if(resp)resp.textContent='Satıcı teklifi düşük buldu. Biraz daha yükseltmelisin.';if(buy)buy.innerHTML='';reputation=clamp(reputation-.3,0,100)}
 simSave();renderRealism()
}
function finishDynamicBuy(x,price){
 if(cash<price){toast('Yetersiz nakit');return false}cash-=price;ownedAssets.push({id:x.id,name:x.name,type:x.type,price,rent:Number(x.rent||0),rented:false,t:Date.now(),rentReady:0});sim.dynamicListings=sim.dynamicListings.filter(y=>y.id!==x.id);sim.currentMonth.expense+=price;tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:x.name,total:price});saveOwned();simSave();save();render();renderGameExtras();pushNotification('Yeni yatırım',x.name+' '+money(price)+' karşılığında satın alındı.');return true
}
function buyDynamicNow(id){let x=findDynamic(id);if(!x)return;if(finishDynamicBuy(x,x.ask)){toast('Satın alma tamamlandı');renderDynamicMarket()}}
function buyNegotiated(){let n=sim.negotiation,x=n&&findDynamic(n.id);if(!x||!n.acceptedPrice)return;if(finishDynamicBuy(x,n.acceptedPrice)){sim.negotiation=null;simSave();location.hash='myassets';toast('Pazarlıkla satın alma tamamlandı')}}
function projectDefs(kind){
 return {
  villa:{units:2,unitValue:2900000,unitRent:22000,label:'Villa Sitesi'},
  apartment:{units:8,unitValue:1550000,unitRent:14500,label:'Apartman'},
  residence:{units:20,unitValue:2100000,unitRent:19000,label:'20 Dairelik Rezidans'},
  commercial:{units:4,unitValue:4200000,unitRent:42000,label:'Ticari Proje'}
 }[kind]
}
function completeConstructionToPortfolio(){
 if(constructionOp.status!=='ready'){toast('Proje henüz tamamlanmadı');return false}
 let kind=constructionOp.kind||(/Villa/i.test(constructionOp.projectName)?'villa':/20 Daire/i.test(constructionOp.projectName)?'residence':/Apartman/i.test(constructionOp.projectName)?'apartment':'commercial'),d=projectDefs(kind),land=ownedAssets.find(a=>a.id===constructionOp.landId);
 let project={id:'proj_'+Date.now(),name:d.label+(land?' • '+land.name:''),kind,units:d.units,available:d.units,rented:0,sold:0,unitValue:Math.round(d.unitValue*(1+deptLevel('construction')*.03)),unitRent:d.unitRent,created:Date.now(),landName:land?.name||'Arsa',value:d.units*d.unitValue};
 sim.projects.push(project);let idx=ownedAssets.findIndex(a=>a.id===constructionOp.landId);if(idx>=0)ownedAssets.splice(idx,1);tx.unshift({t:Date.now(),kind:'business',type:'construction_complete',sym:project.name,total:constructionOp.cost});constructionOp={status:'idle',finish:0};selectedLandId='';reputation=clamp(reputation+2,0,100);saveOwned();simSave();save();render();renderGameExtras();pushNotification('Proje tamamlandı',project.name+' içinde '+project.units+' bağımsız bölüm oluştu.');return true
}
function sellProjectUnit(pi){
 let p=sim.projects[pi];if(!p||p.available<=0)return;let price=Math.round(p.unitValue*(1+deptLevel('sales')*.015)/1000)*1000;cash+=price;p.available--;p.sold++;sim.currentMonth.revenue+=price;tx.unshift({t:Date.now(),kind:'income',type:'unit_sell',sym:p.name,total:price});simSave();save();render();renderGameExtras();toast('Bağımsız bölüm satıldı • +'+money(price))
}
function rentProjectUnit(pi){
 let p=sim.projects[pi];if(!p||p.available<=0)return;p.available--;p.rented++;reputation=clamp(reputation+.5,0,100);simSave();renderGameExtras();toast('Bağımsız bölüm kiraya verildi • '+money(p.unitRent)+'/ay')
}
function projectRentalIncome(){return sim.projects.reduce((s,p)=>s+p.rented*p.unitRent,0)}
function renderProjectPortfolio(){
 let e=document.getElementById('builtProjectList'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};set('builtProjectCount',sim.projects.length);set('projectUnitsForSale',sim.projects.reduce((s,p)=>s+p.available,0));set('projectUnitsRented',sim.projects.reduce((s,p)=>s+p.rented,0));if(!e)return;
 e.innerHTML=sim.projects.length?sim.projects.map((p,i)=>'<div class="project-card-owned"><h4>'+p.name+'</h4><p>'+p.landName+' üzerinde tamamlandı.</p><div class="unit-stats"><div><span>BOŞ</span><b>'+p.available+'</b></div><div><span>KİRALIK</span><b>'+p.rented+'</b></div><div><span>SATILAN</span><b>'+p.sold+'</b></div></div><div class="unit-actions"><button onclick="rentProjectUnit('+i+')">1 Bölüm Kirala • '+money(p.unitRent)+'/ay</button><button class="primary" onclick="sellProjectUnit('+i+')">1 Bölüm Sat • '+money(p.unitValue)+'</button></div></div>').join(''):'<div class="info-card"><p>Henüz tamamlanan proje yok.</p></div>'
}
function togglePropertyRent(index){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;a.rented=!a.rented;if(a.rented)a.rentReady=Date.now()+30000;else a.rentReady=0;simSave();saveOwned();renderGameExtras();toast(a.rented?'Gayrimenkul kiraya verildi':'Gayrimenkul kiradan çıkarıldı')
}
function sellManagedProperty(index,markup=0){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;let price=Math.round(a.price*(.94+markup/100)/1000)*1000;cash+=price;ownedAssets.splice(index,1);sim.currentMonth.revenue+=price;tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:price});saveOwned();simSave();save();render();renderGameExtras();toast('Gayrimenkul satıldı • +'+money(price))
}
function renderPropertyManagement(){
 ensureAssetMetadata();let e=document.getElementById('managedPropertyList'),items=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Gayrimenkul'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};
 set('managedPropertyCount',items.length);set('managedRentedCount',items.filter(x=>x.a.tenantStatus==='occupied').length);set('managedRentIncome',money(items.filter(x=>x.a.tenantStatus==='occupied').reduce((s,x)=>s+Number(x.a.rent||42000),0)));
 if(!e)return;e.innerHTML=items.length?items.map(o=>detailedPropertyCard(o.a,o.i)).join(''):'<div class="info-card"><p>Yönetilecek gayrimenkul bulunmuyor.</p></div>'
}

function processMonthlyLoanPayments(){
 let due=0,paid=0,missed=0;
 active().forEach(l=>{
  let q=Math.min(Number(l.installment||0),Number(l.remaining||0));due+=q;
  if(q<=0)return;
  if(cash>=q){cash-=q;l.remaining=Math.max(0,l.remaining-q);l.paidCount=(l.paidCount||0)+1;paid+=q;let d=new Date();d.setMonth(d.getMonth()+1);l.nextDue=d.getTime();if(l.remaining<=.01){l.remaining=0;l.closed=true;creditScore=clamp(creditScore+5,0,100);if(l.collateralId){let a=ownedAssets.find(x=>x.id===l.collateralId);if(a)a.collateral=false}}}
  else{l.hadLate=true;missed+=q;lateCount++;creditScore=clamp(creditScore-6,0,100);reputation=clamp(reputation-3,0,100)}
 });
 return {due,paid,missed}
}

function closeGameMonth(){
 let staff=employeeStats(),maint=maintenanceCost(),rent=ownedAssets.filter(a=>a.type==='Gayrimenkul'&&a.tenantStatus==='occupied').reduce((s,a)=>s+Number(a.rent||42000),0)+projectRentalIncome(),life=LIFESTYLES[sim.lifestyle||0];
 let officeRent=sim.companyProfile&&sim.companyProfile.capital>=1000000?75000:0,electricity=owns('factory_basic')?120000*factoryLevel:0,operations=Number(sim.currentMonth.expense||0);
 cash+=rent;
 let loan=processMonthlyLoanPayments(),deptTax=Math.max(.04,.08-deptLevel('finance')*.006),taxBase=Math.max(0,sim.currentMonth.revenue+rent-operations-staff.salary-maint-life.expense-officeRent-electricity-loan.paid),tax=Math.round(taxBase*deptTax);
 let fixed=staff.salary+maint+life.expense+officeRent+electricity+tax,payable=fixed;
 if(cash>=payable)cash-=payable;else{cash=0;creditScore=clamp(creditScore-5,0,100);reputation=clamp(reputation-4,0,100)}
 let cardPenalty=0;if(sim.creditCard.statement>0){cardPenalty=Math.round(sim.creditCard.statement*.035);sim.creditCard.used+=cardPenalty;sim.creditCard.statement+=cardPenalty;creditScore=clamp(creditScore-4,0,100);reputation=clamp(reputation-1,0,100)}let revenue=Number(sim.currentMonth.revenue||0)+rent,expense=operations+staff.salary+maint+life.expense+officeRent+electricity+loan.paid+tax+cardPenalty,net=revenue-expense;
 let rec={month:sim.gameMonth,revenue,expense,net,tax,salary:staff.salary,maintenance:maint,rent,officeRent,electricity,operations,loanPay:loan.paid,missedLoan:loan.missed,t:Date.now()};
 sim.monthlyHistory.unshift(rec);sim.monthlyHistory=sim.monthlyHistory.slice(0,12);let activeCompany=selectedCompany();if(activeCompany){activeCompany.monthlyHistory.unshift({...rec,companyId:activeCompany.id});activeCompany.monthlyHistory=activeCompany.monthlyHistory.slice(0,12);}sim.gameMonth++;sim.currentMonth={revenue:0,expense:0,tax:0};sim.lastCycle=Date.now();sim.lastExpense=expense;sim.cycleDue=Date.now()+300000;
 tx.unshift({t:Date.now(),kind:'business',type:'monthly_close',sym:'Oyun Ayı '+rec.month,total:Math.abs(net)});recordWealth();simSave();save();saveOwned();render();renderGameExtras();pushNotification('Aylık muhasebe kapandı','Ay '+rec.month+' net sonucu '+money(net)+(loan.missed?' • Ödenemeyen kredi taksiti var.':'')+'.')
}
function renderMonthlyReport(){
 let c=selectedCompany(),history=c&&Array.isArray(c.monthlyHistory)?c.monthlyHistory:sim.monthlyHistory,
     r=history[0]||{revenue:0,expense:0,net:0,tax:0,salary:0,maintenance:0,month:sim.gameMonth},
     set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('monthlyReportTitle',c?c.name+' • Aylık Rapor':'Aylık Finans Raporu');
 set('monthlyReportSubtitle',c?c.name+' şirketinin dönemsel gelir ve gider özeti':'Genel ekonomik dönem özeti');
 set('reportMonth',r.month||sim.gameMonth);set('reportRevenue',money(r.revenue||0));set('reportExpense',money(r.expense||0));set('reportNet',money(r.net||0));set('reportTax',money(r.tax||0));set('reportSalary',money(r.salary||0));set('reportMaintenance',money(r.maintenance||0));set('reportRent',money(r.rent||0));set('reportPersonnel',money(r.salary||0));set('reportOfficeRent',money(r.officeRent||0));set('reportElectricity',money(r.electricity||0));set('reportOperations',money(r.operations||0));set('reportLoanPay',money(r.loanPay||0));set('reportTaxDetail',money(r.tax||0));set('homeCycle',sim.gameMonth);
 let h=document.getElementById('monthlyHistory');if(h)h.innerHTML=history.slice(0,8).map(x=>'<div class="history-row"><span>Ay '+x.month+'</span><b class="'+(x.net>=0?'gain':'loss')+'">'+money(x.net)+'</b></div>').join('')||'<div class="info-card"><p>Henüz tamamlanmış dönem yok.</p></div>'
}


const LIFESTYLES=[
{name:'Mütevazı',expense:35000,prestige:0,rep:0},
{name:'Konforlu',expense:120000,prestige:8,rep:1},
{name:'Premium',expense:350000,prestige:20,rep:2},
{name:'Elit',expense:850000,prestige:40,rep:4}
];
function totalWealth(){
 return cash+ownedValue()+depositStats().total+stats('stock').value+stats('crypto').value+stats('gold').value+
 sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0)-debt()-Number(sim.creditCard.used||0)
}
function advanceMacroCycle(){
 const cycles=[
 {cycle:'Dengeli',rate:42.5,inflation:31.2,growth:3.1},
 {cycle:'Sıkılaşma',rate:48,inflation:27,growth:1.8},
 {cycle:'Büyüme',rate:36,inflation:33,growth:5.0},
 {cycle:'Durgunluk',rate:40,inflation:24,growth:-.8}
 ];
 let n=cycles.findIndex(x=>x.cycle===sim.macro.cycle);sim.macro=cycles[(n+1)%cycles.length];simSave();renderAdvanced();renderV140();renderV141();pushNotification('Ekonomik dönem',sim.macro.cycle+' dönemine geçildi.')
}
function ensureCompetitors(){
 if(sim.competitors.length)return;
 sim.competitors=[
 {name:'Anadolu Yapı',sector:'İnşaat',value:68000000,power:72},
 {name:'Marmara Motors',sector:'Otomotiv',value:42000000,power:64},
 {name:'Kuzey Sanayi',sector:'Üretim',value:91000000,power:78},
 {name:'Ege Yatırım',sector:'Gayrimenkul',value:57000000,power:69}
 ];simSave()
}
function simulateCompetitors(){ensureCompetitors();sim.competitors.forEach(c=>{c.value=Math.round(c.value*(.97+Math.random()*.08)/10000)*10000;c.power=clamp(Math.round(c.power+(Math.random()*6-3)),30,95)});simSave();renderCompetitors();pushNotification('Rakip hamlesi','Rakip şirketlerin piyasa değerleri güncellendi.')}
function renderCompetitors(){ensureCompetitors();let e=document.getElementById('competitorList');if(!e)return;e.innerHTML=sim.competitors.map(c=>'<div class="competitor-card"><b>'+c.name+'</b><span>'+c.sector+' • Değer '+money(c.value)+' • Rekabet '+c.power+'/100</span></div>').join('')}
function ensureTenders(){
 if(sim.tenders.length)return;
 sim.tenders=[
 {name:'120 Konutluk Proje',need:'construction',minRep:55,cost:42000000,reward:59000000},
 {name:'Sanayi Tesisi Tedarik Sözleşmesi',need:'industry',minRep:60,cost:18000000,reward:25500000},
 {name:'Belediye Ticari Kompleksi',need:'construction',minRep:70,cost:76000000,reward:108000000}
 ];simSave()
}
function bidTender(i){
 let t=sim.tenders[i];if(!t)return;if(reputation<t.minRep){toast('Bu ihale için itibar yetersiz');return}if(cash<t.cost){toast('İhale için nakit yetersiz');return}
 let chance=.45+reputation/250+deptLevel(t.need)*.05;if(Math.random()>chance){reputation=clamp(reputation-1,0,100);toast('İhale kazanılamadı');return}
 cash-=t.cost;cash+=t.reward;sim.currentMonth.expense+=t.cost;sim.currentMonth.revenue+=t.reward;sim.tenderWins++;reputation=clamp(reputation+3,0,100);tx.unshift({t:Date.now(),kind:'business',type:'tender_win',sym:t.name,total:t.reward});sim.tenders.splice(i,1);simSave();save();render();renderGameExtras();pushNotification('İhale kazanıldı',t.name+' tamamlandı.')}
function renderTenders(){ensureTenders();let e=document.getElementById('tenderList');if(e)e.innerHTML=sim.tenders.map((t,i)=>'<div class="tender-card"><b>'+t.name+'</b><span>İtibar '+t.minRep+' • Maliyet '+money(t.cost)+' • Sözleşme '+money(t.reward)+'</span><div class="mini-actions"><button class="primary" onclick="bidTender('+i+')">Teklif Ver</button></div></div>').join('');let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('tenderCount',sim.tenders.length);set('tenderWins',sim.tenderWins);set('tenderRep',Math.round(reputation))}
function useCreditCard(){let q=Number(document.getElementById('ccSpendInput')?.value);if(!q||q<=0)return;let c=sim.creditCard;if(c.used+q>c.limit){toast('Kart limiti yetersiz');return}c.used+=q;c.statement+=q;cash+=q;simSave();save();render();renderGameExtras();toast('Karttan '+money(q)+' kullanılabilir nakde aktarıldı')}
function payCreditCard(){let c=sim.creditCard;if(c.statement<=0){toast('Ödenecek ekstre yok');return}if(cash<c.statement){toast('Ekstre için nakit yetersiz');return}cash-=c.statement;c.used=Math.max(0,c.used-c.statement);c.statement=0;creditScore=clamp(creditScore+3,0,100);reputation=clamp(reputation+1,0,100);simSave();save();render();renderGameExtras();toast('Kredi kartı ekstresi ödendi')}
function restructureLoan(i){let list=active(),l=list[i];if(!l)return;let fee=Math.round(l.remaining*.04);if(cash<fee){toast('Yapılandırma masrafı için nakit yetersiz');return}cash-=fee;l.months=Math.min(6,(l.months||1)+2);l.rate=Number(l.rate||3)+.45;l.total=l.remaining*(1+(l.rate/100)*l.months);l.remaining=l.total;l.installment=l.total/l.months;creditScore=clamp(creditScore-2,0,100);sim.currentMonth.expense+=fee;simSave();save();render();renderGameExtras();toast('Kredi yeniden yapılandırıldı')}
function renderRestructure(){let e=document.getElementById('restructureList');if(!e)return;let list=active();e.innerHTML=list.length?list.map((l,i)=>'<div class="restructure-card"><b>'+l.name+'</b><span>Kalan '+money(l.remaining)+' • Taksit '+money(l.installment)+' • Masraf '+money(l.remaining*.04)+'</span><div class="mini-actions"><button onclick="restructureLoan('+i+')">+2 Ay Yapılandır</button></div></div>').join(''):'<div class="info-card"><p>Aktif kredi yok.</p></div>'}
function ensureIpos(){if(sim.ipos.length)return;sim.ipos=[{id:'ipo1',name:'Anadolu Enerji',price:42,available:5000,dividend:.8},{id:'ipo2',name:'Yeni Nesil Lojistik',price:68,available:3500,dividend:1.25},{id:'ipo3',name:'Dijital Perakende',price:31,available:7000,dividend:.45}];simSave()}
function buyIpo(i){
 let x=sim.ipos[i];if(!x||x.available<=0)return;let requested=100,demand=.45+Math.random()*.75,allocated=Math.max(10,Math.min(requested,x.available,Math.round(requested/demand/10)*10)),total=allocated*x.price;
 if(cash<total){toast('Yetersiz nakit');return}cash-=total;x.available-=allocated;let h=sim.ipoHoldings.find(h=>h.id===x.id);if(h)h.qty+=allocated;else sim.ipoHoldings.push({id:x.id,name:x.name,qty:allocated,price:x.price,dividend:x.dividend});sim.currentMonth.expense+=total;simSave();save();render();renderGameExtras();toast('Talep sonucu '+allocated+' lot dağıtıldı')
}
function collectDividends(){let due=sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.dividend,0);if(due<=0){toast('Temettü oluşmadı');return}cash+=due;sim.currentMonth.revenue+=due;simSave();save();render();renderGameExtras();toast('Temettü geliri • +'+money(due))}
function renderIpos(){ensureIpos();let e=document.getElementById('ipoList');if(e)e.innerHTML=sim.ipos.map((x,i)=>'<div class="ipo-card"><b>'+x.name+'</b><span>Fiyat '+money(x.price)+' • Kalan '+x.available+' lot • Temettü/lot '+money(x.dividend)+'</span><div class="mini-actions"><button onclick="buyIpo('+i+')">100 Lot Al</button></div></div>').join('');let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('ipoCount',sim.ipos.length);set('ipoValue',money(sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0)));set('dividendDue',money(sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.dividend,0)))}
function setLifestyle(i){if(!LIFESTYLES[i])return;sim.lifestyle=i;simSave();renderAdvanced();toast('Yaşam standardı güncellendi')}
function renderLifestyle(){let l=LIFESTYLES[sim.lifestyle]||LIFESTYLES[0],set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('lifeLevel',l.name);set('lifeExpense',money(l.expense));set('lifePrestige',l.prestige);set('lifeRepBonus','+'+l.rep)}
function serviceVehicle(i){let a=ownedAssets[i];if(!a||a.type!=='Araç')return;let cost=Math.round(a.price*.012);if(cash<cost){toast('Bakım için nakit yetersiz');return}cash-=cost;a.condition=Math.min(100,Number(a.condition||82)+12);a.price=Math.round(a.price*1.015);sim.currentMonth.expense+=cost;saveOwned();simSave();save();render();renderGameExtras();toast('Araç bakımı tamamlandı')}
function inspectVehicle(i){let a=ownedAssets[i];if(!a)return;toast(a.name+' ekspertiz: kondisyon '+Math.round(a.condition||82)+'/100')}
function renderVehicleService(){
 ensureAssetMetadata();let e=document.getElementById('vehicleServiceList');if(!e)return;let cars=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Araç');
 e.innerHTML=cars.length?cars.map(o=>{let v=o.a.vehicle||{},cond=Math.round(o.a.condition||v.condition||82);return '<div class="service-card"><b>'+o.a.name+'</b><span>'+v.year+' • '+Number(v.km||0).toLocaleString('tr-TR')+' km • '+v.engine+' • '+v.fuel+' • '+v.package+'</span><div class="vehicle-facts"><div><span>HASAR</span><b>'+v.damage+'</b></div><div><span>BOYA</span><b>'+v.paint+'</b></div><div><span>KONDİSYON</span><b>'+cond+'/100</b></div><div><span>PİYASA</span><b>'+money(o.a.price)+'</b></div><div><span>BAKIM</span><b>'+(cond>90?'İyi':'Gerekli')+'</b></div><div><span>DEĞER KAYBI</span><b>%'+Math.max(0,Math.round((100-cond)*.35))+'</b></div></div><div class="mini-actions"><button onclick="serviceVehicle('+o.i+')">Bakım Yap</button><button onclick="inspectVehicle('+o.i+')">Ekspertiz</button></div></div>'}).join(''):'<div class="info-card"><p>Araç bulunmuyor.</p></div>'
}
function renovateProperty(i){let a=ownedAssets[i];if(!a||a.type!=='Gayrimenkul')return;let cost=Math.round(a.price*.06);if(cash<cost){toast('Tadilat için nakit yetersiz');return}cash-=cost;a.price=Math.round(a.price*1.10);a.rent=Math.round(Number(a.rent||42000)*1.08);sim.currentMonth.expense+=cost;saveOwned();simSave();save();render();renderGameExtras();toast('Tadilat tamamlandı')}
function renderRenovation(){let e=document.getElementById('renovationList');if(!e)return;let items=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Gayrimenkul');e.innerHTML=items.length?items.map(o=>'<div class="renovation-card"><b>'+o.a.name+'</b><span>Değer '+money(o.a.price)+' • Tadilat '+money(o.a.price*.06)+'</span><div class="mini-actions"><button class="primary" onclick="renovateProperty('+o.i+')">Tadilat Yap</button></div></div>').join(''):'<div class="info-card"><p>Gayrimenkul bulunmuyor.</p></div>'}
function createBackup(){let data={cash,creditScore,reputation,loans,tx,pf,deposits,ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,sim,trusts};let e=document.getElementById('backupText');if(e)e.value=btoa(unescape(encodeURIComponent(JSON.stringify(data))));toast('Yedek kodu oluşturuldu')}
function restoreBackup(){let e=document.getElementById('backupText'),text=(e?.value||'').trim();if(!text){toast('Yedek kodu boş');return}try{let d=JSON.parse(decodeURIComponent(escape(atob(text))));if(typeof d.cash!=='number'||!d.sim)throw 0;cash=d.cash;creditScore=d.creditScore;reputation=d.reputation;loans=d.loans||[];tx=d.tx||[];pf=d.pf||{};deposits=d.deposits||[];ownedAssets=d.ownedAssets||[];factoryOp=d.factoryOp||{status:'idle',finish:0};constructionOp=d.constructionOp||{status:'idle',finish:0};selectedLandId=d.selectedLandId||'';factoryLevel=d.factoryLevel||1;sim=d.sim;trusts=d.trusts||trusts;saveOwned();save();saveDeposits();simSave();render();renderGameExtras();toast('Yedek geri yüklendi')}catch(err){toast('Yedek kodu geçersiz')}}
function recordWealth(){let n=totalWealth(),last=sim.wealthHistory[0];if(!last||last.month!==sim.gameMonth){sim.wealthHistory.unshift({month:sim.gameMonth,value:n,t:Date.now()});sim.wealthHistory=sim.wealthHistory.slice(0,20);simSave()}}
function renderWealth(){recordWealth();let e=document.getElementById('wealthChart'),l=document.getElementById('wealthHistoryList');if(e){let vals=sim.wealthHistory.slice(0,12).reverse(),mx=Math.max(1,...vals.map(x=>x.value));e.innerHTML=vals.map(x=>'<div class="wealth-bar" style="height:'+Math.max(8,Math.round(x.value/mx*100))+'%"><span>Ay '+x.month+'</span></div>').join('')}if(l)l.innerHTML=sim.wealthHistory.slice(0,12).map(x=>'<div class="wealth-row"><span>Ay '+x.month+'</span><b>'+money(x.value)+'</b></div>').join('')}
function renderAdvanced(){let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v},m=sim.macro;set('macroRate','%'+String(m.rate).replace('.',','));set('macroInflation','%'+String(m.inflation).replace('.',','));set('macroGrowth','%'+String(m.growth).replace('.',','));set('macroCycle',m.cycle);set('macroImpact',m.cycle==='Sıkılaşma'?'Kredi maliyetleri yükselir.':m.cycle==='Büyüme'?'Yatırım ve satış talebi güçlenir.':m.cycle==='Durgunluk'?'Satış hızı ve yatırım talebi düşebilir.':'Piyasalar dengeli seyrediyor.');let c=sim.creditCard;set('ccLimit',money(c.limit));set('ccUsed',money(c.used));set('ccAvailable',money(Math.max(0,c.limit-c.used)));set('ccStatement',money(c.statement));renderCompetitors();renderTenders();renderRestructure();renderIpos();renderLifestyle();renderVehicleService();renderRenovation();renderWealth()}


const STOCK_INFO={
 GSTEK:{sector:'Teknoloji',marketCap:28500000000,profitability:82,risk:'Orta-Yüksek',dividend:.35},
 ANSAN:{sector:'Sanayi',marketCap:17400000000,profitability:74,risk:'Orta',dividend:1.10},
 MTRYP:{sector:'İnşaat',marketCap:22600000000,profitability:68,risk:'Yüksek',dividend:.60},
 ATOTO:{sector:'Otomotiv',marketCap:31400000000,profitability:79,risk:'Orta',dividend:1.35}
};
const CITY_ECON={
 İstanbul:{finance:1.08,property:1.08,industry:1.01,tourism:1.02},
 Ankara:{finance:1.04,property:1.04,industry:1.02,tourism:1},
 İzmir:{finance:1.03,property:1.05,industry:1.02,tourism:1.06},
 Bursa:{finance:1,property:1.02,industry:1.08,tourism:1.01},
 Kocaeli:{finance:1,property:1.01,industry:1.10,tourism:1},
 Antalya:{finance:1,property:1.05,industry:.98,tourism:1.10},
 Muğla:{finance:.99,property:1.07,industry:.97,tourism:1.12},
 Gaziantep:{finance:1,property:1.01,industry:1.07,tourism:.98}
};
const NEWS_EVENTS=[
 {id:'neutral',icon:'📰',title:'Piyasalar Dengeli',text:'Belirgin bir şok bulunmuyor.',housing:0,auto:0,stock:0,crypto:0,gold:0,credit:0},
 {id:'rate_hike',icon:'🏦',title:'Politika Faizi Artırıldı',text:'Kredi maliyetleri yükseldi. Konut talebi baskı altında.',housing:-.05,auto:-.02,stock:-.025,crypto:-.035,gold:.02,credit:.18},
 {id:'mortgage_cut',icon:'🏠',title:'Konut Kredilerinde Faiz İndirimi',text:'Konut finansmanına erişim kolaylaştı.',housing:.07,auto:0,stock:.01,crypto:0,gold:-.005,credit:-.12},
 {id:'auto_tax',icon:'🚗',title:'Otomotiv Vergi Düzenlemesi',text:'Sıfır ve ikinci el araç fiyatlarında yukarı yönlü baskı.',housing:0,auto:.08,stock:.02,crypto:0,gold:0,credit:0},
 {id:'btc_flow',icon:'₿',title:'Dijital Varlık Talebi Güçlendi',text:'Kripto piyasasında işlem hacmi hızla yükseldi.',housing:0,auto:0,stock:.005,crypto:.09,gold:-.01,credit:0},
 {id:'risk',icon:'⚠️',title:'Küresel Risk İştahı Düştü',text:'Riskli varlıklardan güvenli limanlara geçiş var.',housing:-.015,auto:-.01,stock:-.04,crypto:-.08,gold:.055,credit:.05}
];
function currentNews(){
 let e=NEWS_EVENTS.find(x=>x.id===sim.news.id)||NEWS_EVENTS[0];
 if(!sim.news.until||Date.now()>sim.news.until){sim.news={id:'neutral',until:Date.now()+180000};simSave();return NEWS_EVENTS[0]}
 return e
}
function nextEconomicNews(){let choices=NEWS_EVENTS.filter(x=>x.id!=='neutral'),e=choices[Math.floor(Math.random()*choices.length)];sim.news={id:e.id,until:Date.now()+180000};simSave();renderEconomicNews();pushNotification('Ekonomik haber',e.title)}
function renderEconomicNews(){let e=currentNews(),set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('activeNewsIcon',e.icon);set('activeNewsTitle',e.title);set('activeNewsText',e.text);set('impactHousing',(e.housing>=0?'+':'')+Math.round(e.housing*100)+'%');set('impactAuto',(e.auto>=0?'+':'')+Math.round(e.auto*100)+'%');set('impactStock',(e.stock>=0?'+':'')+Math.round(e.stock*100)+'%');set('impactCrypto',(e.crypto>=0?'+':'')+Math.round(e.crypto*100)+'%');set('impactGold',(e.gold>=0?'+':'')+Math.round(e.gold*100)+'%');set('impactCredit',(e.credit>=0?'+':'')+Math.round(e.credit*100)+'%')}
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

function renderSetupStep(){
 let step=Number(sim.setupStep||1);document.querySelectorAll('.setup-step').forEach(x=>x.classList.toggle('active',Number(x.dataset.step)===step));
 document.querySelectorAll('[data-step-indicator]').forEach(x=>{let n=Number(x.dataset.stepIndicator);x.classList.toggle('active',n===step);x.classList.toggle('done',n<step)});
 let prev=document.getElementById('setupPrevBtn'),next=document.getElementById('setupNextBtn'),create=document.getElementById('setupCreateButton');
 if(prev)prev.style.visibility=step===1?'hidden':'visible';if(next)next.classList.toggle('hidden',step===5);if(create)create.classList.toggle('hidden',step!==5)
}
function changeSetupStep(delta){
 let step=Number(sim.setupStep||1),next=clamp(step+delta,1,5);sim.setupStep=next;simSave();renderSetupStep();renderCompanySetup()
}
function selectCompanyLegalType(v){
 sim.companyProfile.legalType=v;let select=document.getElementById('setupLegalType');if(select)select.value=v;simSave();renderCompanySetup()
}
function selectAccountant(v){sim.companyProfile.accountant=v;simSave();renderCompanySetup()}
function transferToCompany(){
 if(!sim.companyProfile.established){toast('Önce şirket kur');return}
 let raw=prompt('Şirket hesabına aktarılacak tutar','100000');if(raw==null)return;let q=Number(raw);if(!q||q<=0){toast('Geçerli tutar gir');return}if(cash<q){toast('Kişisel bakiyen yetersiz');return}
 cash-=q;sim.companyProfile.companyCash=Number(sim.companyProfile.companyCash||0)+q;persistSelectedCompany();tx.unshift({t:Date.now(),kind:'business',type:'company_transfer_in',sym:sim.companyProfile.name,total:q});simSave();save();render();renderGameExtras();toast('Şirket hesabına '+money(q)+' aktarıldı')
}
function transferFromCompany(){
 if(!sim.companyProfile.established){toast('Önce şirket kur');return}
 let raw=prompt('Şirket hesabından çekilecek tutar','100000');if(raw==null)return;let q=Number(raw),bal=Number(sim.companyProfile.companyCash||0);if(!q||q<=0){toast('Geçerli tutar gir');return}if(bal<q){toast('Şirket hesabı yetersiz');return}
 sim.companyProfile.companyCash=bal-q;persistSelectedCompany();cash+=q;tx.unshift({t:Date.now(),kind:'business',type:'company_transfer_out',sym:sim.companyProfile.name,total:q});simSave();save();render();renderGameExtras();toast(money(q)+' kişisel bakiyene aktarıldı')
}



const COMPANY_ONLY_ROUTES=new Set(['company_center','employees','business_credit']);

function normalizeNumber(v,fallback=0){
 v=Number(v);return Number.isFinite(v)?v:fallback
}
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
function selectedCompanyEmployees(){
 let c=selectedCompany();return c&&Array.isArray(c.employees)?c.employees:[]
}
function selectedCompanyEmployeeStats(){
 let arr=selectedCompanyEmployees();
 return {salary:arr.reduce((s,e)=>s+normalizeNumber(e.salary,0),0),bonus:arr.reduce((s,e)=>s+normalizeNumber(e.bonus,0),0)}
}
function selectedCompanyHistory(){
 let c=selectedCompany();return c&&Array.isArray(c.monthlyHistory)?c.monthlyHistory:[]
}
function companyBusinessDebt(c=selectedCompany()){
 if(!c)return 0;
 return active().filter(l=>l.business&&l.companyId===c.id).reduce((s,l)=>s+normalizeNumber(l.remaining,0),0)
}
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
function guardCompanyRoute(){
 let route=(location.hash||'#home').slice(1);
 if(COMPANY_ONLY_ROUTES.has(route)&&!selectedCompany()){
   toast('Bu ekranı açmak için önce bir şirket seçmelisin');
   location.hash='business';return false
 }
 return true
}
window.addEventListener('hashchange',guardCompanyRoute);

const COMPANY_SECTOR_INFO={
 'İnşaat':{icon:'🏗️',target:'construction',label:'İnşaat Operasyonları',desc:'Arsa geliştir, ruhsat al ve proje üret.'},
 'Sanayi':{icon:'🏭',target:'factory',label:'Sanayi & Üretim',desc:'Fabrika kur, hammadde kullan ve üretim yap.'},
 'Otomotiv':{icon:'🚘',target:'dealership',label:'Otomotiv & Galeri',desc:'Araç al, stokla, ilana koy ve sat.'},
 'Gayrimenkul':{icon:'🏠',target:'property_management',label:'Gayrimenkul',desc:'Gayrimenkulleri kirala, geliştir ve sat.'},
 'Finans':{icon:'📈',target:'finance',label:'Finans & Yatırım',desc:'Finansal piyasaları ve şirket sermayesini yönet.'},
 'Lojistik':{icon:'🚚',target:'inventory',label:'Lojistik',desc:'Stok ve tedarik operasyonlarını yönet.'}
};
function beginNewCompany(){
 sim.setupStep=1;
 sim.companyDraftMode='new';
 sim.companyProfile={...sim.companyProfile,established:false,name:'',companyCash:0,capital:100000,sector:'İnşaat',city:'İstanbul',legalType:'Şahıs İşletmesi',office:'home',accountant:'basic'};
 simSave();setTimeout(()=>{renderCompanySetup();renderSetupStep()},0);return true
}
function selectedCompany(){
 return sim.companies.find(c=>c.id===sim.selectedCompanyId)||null
}
function syncSelectedCompanyToProfile(){
 let c=selectedCompany();if(!c)return false;
 sim.companyProfile={...c,employees:undefined,monthlyHistory:undefined,currentMonth:undefined,established:true};
 sim.companyName=c.name;return true
}
function persistSelectedCompany(){
 let c=selectedCompany();if(!c)return;
 let i=sim.companies.findIndex(x=>x.id===c.id);
 if(i>=0)sim.companies[i]={...sim.companyProfile,id:c.id,established:true};
}
function selectCompany(id){
 if(!sim.companies.some(c=>c.id===id))return;
 sim.selectedCompanyId=id;syncSelectedCompanyToProfile();simSave();render();renderGameExtras();renderSelectedCompanyActivity();renderSelectedCompanyActivity();toast(sim.companyProfile.name+' seçildi')
}
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

function companyFoundingQuote(){
 let type=document.getElementById('setupLegalType')?.value||sim.companyProfile.legalType||'Limited Şirket',office=document.getElementById('setupOffice')?.value||sim.companyProfile.office||'home',acc=document.getElementById('setupAccountant')?.value||sim.companyProfile.accountant||'basic',capital=Number(document.getElementById('setupCapital')?.value||0);
 let legal=type==='Anonim Şirket'?180000:type==='Limited Şirket'?90000:30000,officeCost=office==='corporate'?240000:office==='small'?90000:15000,accountant=acc==='corporate'?75000:acc==='pro'?35000:15000;
 return {legal,officeCost,accountant,cost:legal+officeCost+accountant,capital,total:capital+legal+officeCost+accountant}
}
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
function renderCompanyFoundation(){
 let c=sim.companyProfile,m=companyMetrics(),r=sim.monthlyHistory[0]||{},set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('businessCompanyName',c.established?c.name:'Henüz şirket kurulmadı');set('businessCompanyStatus',c.established?(c.legalType+' • '+c.sector+' • '+c.city):'Faaliyete başlamak için önce şirketini kur.');
 let act=document.getElementById('businessCompanyAction');if(act){act.textContent=c.established?'Şirketi Yönet':'Şirket Kur';act.href=c.established?'#company_center':'#company_setup'}
 set('businessCompanyCash',money(c.companyCash||0));set('businessValue',money(c.established?m.value:0));set('businessEmployeeCount',m.employees);set('businessMonthlyNet',money(r.net||0));let activityHint=document.getElementById('companyActivityHint');if(activityHint)activityHint.textContent=c.established?'Aktif':'Şirket gerekli';
 set('companyAccountBalance',money(c.companyCash||0));set('companyLegalType',c.established?c.legalType:'—');set('companySectorLabel',c.established?c.sector:'—');set('companyCityLabel',c.established?c.city:'—');set('companyNameLabel',c.established?c.name:'Henüz şirket kurulmadı');set('companyValue',money(c.established?m.value:0));set('employeeCount',m.employees);set('companyRevenue',money(r.revenue||0));set('companyRevenue2',money(r.revenue||0));set('companyExpense',money(r.expense||0));set('companyNet',money(r.net||0));set('companyNet2',money(r.net||0));
 let health=clamp(Math.round((reputation*.35)+(Math.min(100,Math.max(0,(r.net||0)/100000))*0.25)+(Math.min(100,(c.companyCash||0)/100000)*0.2)+(Math.min(100,creditScore)*0.2)),0,100);set('companyHealthScore',c.established?health+'/100':'—');
 document.querySelectorAll('.company-required').forEach(x=>{x.classList.toggle('locked',!c.established);x.onclick=!c.established?(e=>{e.preventDefault();toast('Önce şirket kurmalısın');location.hash='company_setup'}):null})
}
function monthlyIncomeEstimate(){let r=sim.monthlyHistory[0];return r?Math.max(0,Number(r.revenue||0)):ownedAssets.filter(a=>a.rented).reduce((s,a)=>s+Number(a.rent||0),0)+projectRentalIncome()}
function creditAssessment(bankLimit,trust=50){
 let m=companyMetrics(),income=monthlyIncomeEstimate(),nw=totalWealth(),debtRatio=Math.max(0,debt())/Math.max(1,nw+debt()),history=Math.max(0,100-lateCount*12),score=.30*creditScore+.15*trust+.18*Math.min(100,income/100000)+.12*Math.min(100,m.profit/200000)+.15*Math.min(100,nw/1000000)+.10*history-35*debtRatio;
 score=clamp(score,0,100);let macro=currentNews().credit+((sim.macro?.rate||42.5)-42.5)/100,limit=Math.max(250000,bankLimit*(.18+.82*score/100)*(1-Math.min(.35,Math.max(-.15,macro))));
 return {score,limit,debtRatio,income,nw}
}
function renderBusinessCredit(){
 let c=selectedCompany(),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 if(!c){set('businessCreditLimit',money(0));set('businessScore','—');set('businessIncome',money(0));set('businessDebtRatio','%0');set('businessCreditCompanyTitle','Ticari Kredi');set('businessCreditCompanySubtitle','Önce bir şirket seç');return}
 let m=companyMetrics(),a=creditAssessment(Math.max(5000000,m.value*.75+10000000),70);
 set('businessCreditLimit',money(a.limit));set('businessScore',Math.round(a.score)+'/100');set('businessIncome',money(a.income));set('businessDebtRatio','%'+Math.round((m.debt/Math.max(1,m.value+m.debt))*100));
 set('businessCreditCompanyTitle',c.name+' • Ticari Kredi');set('businessCreditCompanySubtitle',c.name+' şirketinin bilançosuna göre finansman');
 let r=document.getElementById('businessCreditReason');if(r)r.textContent=a.score>=70?'Şirket finansalları güçlü. Ticari kredi erişimi yüksek.':a.score>=45?'Kredi verilebilir; borç ve kârlılık sınırlandırıcı olabilir.':'Şirket skoru düşük. Sermaye, kârlılık veya kredi geçmişini güçlendir.'
}
function takeBusinessCredit(){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');location.hash='business';return}
 let m=companyMetrics(),a=creditAssessment(Math.max(5000000,m.value*.75+10000000),70),amount=Number(document.getElementById('businessCreditAmount')?.value),months=Number(document.getElementById('businessCreditTerm')?.value||6);
 if(!amount||amount>a.limit){toast('Onaylanan ticari limit: '+money(a.limit));return}if(a.score<35){toast('Şirket skoru kredi için yetersiz');return}
 let base=2.4+(sim.macro.rate-42.5)/20+currentNews().credit*3,rate=Math.max(1.5,base),total=amount*(1+rate/100*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
 c.companyCash=normalizeNumber(c.companyCash,0)+amount;syncSelectedCompanyToProfile();
 loans.push({id:'business_'+c.id+'_'+Date.now(),companyId:c.id,name:c.name+' Ticari Kredisi',amount,rate,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false,business:true});
 tx.unshift({t:Date.now(),kind:'loan',type:'business_loan_in',companyId:c.id,sym:c.name,total:amount});
 simSave();save();render();renderGameExtras();toast('Ticari kredi '+c.name+' şirket hesabına eklendi')
}
function renderStockResearch(){let e=document.getElementById('stockResearchList');if(!e)return;e.innerHTML=Object.keys(STOCK_INFO).map(sym=>{let x=STOCK_INFO[sym],p=pf[sym]||{qty:0};return '<div class="stock-research-card"><b>'+ASSETS[sym].name+' • '+sym+'</b><div class="research-grid"><div><span>SEKTÖR</span><b>'+x.sector+'</b></div><div><span>PİYASA DEĞERİ</span><b>'+money(x.marketCap)+'</b></div><div><span>KÂRLILIK</span><b>'+x.profitability+'/100</b></div><div><span>RİSK</span><b>'+x.risk+'</b></div><div><span>TEMETTÜ/LOT</span><b>'+money(x.dividend)+'</b></div><div><span>PORTFÖY</span><b>'+Math.round(p.qty||0)+' lot</b></div></div></div>'}).join('')}
function collectStockDividends(){let due=Object.keys(STOCK_INFO).reduce((s,sym)=>s+Number((pf[sym]||{}).qty||0)*STOCK_INFO[sym].dividend,0);if(due<=0){toast('Temettü alacak hissen yok');return}cash+=due;sim.currentMonth.revenue+=due;save();simSave();render();renderGameExtras();toast('Hisse temettüsü • +'+money(due))}
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
function requestTenant(index,ask){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;if(ask)a.askRent=Number(ask);let base=Number(a.rent||42000),ratio=a.askRent/base,chance=clamp(1.15-ratio*.45,0.15,.92);a.tenantStatus='searching';a.tenantCheck=Date.now()+15000;a.tenantChance=chance;a.rented=false;saveOwned();toast('Kiracı aranmaya başlandı')
}
function processTenantSearch(){
 let changed=false;ownedAssets.forEach(a=>{if(a.type==='Gayrimenkul'&&a.tenantStatus==='searching'&&Date.now()>=Number(a.tenantCheck||0)){if(Math.random()<Number(a.tenantChance||.5)){a.tenantStatus='occupied';a.rented=true;a.rent=Number(a.askRent||a.rent||42000);a.rentReady=Date.now()+30000;pushNotification('Kiracı bulundu',a.name+' '+money(a.rent)+'/ay bedelle kiralandı.')}else{a.tenantCheck=Date.now()+15000;pushNotification('Kiracı bulunamadı',a.name+' için arama devam ediyor.')}changed=true}});if(changed)saveOwned()
}
function propertyValuation(a){
 if(!a||a.type!=='Gayrimenkul')return Number(a?.price||0);let d=a.details||{},city=sim.companyProfile.city||'İstanbul',cm=(CITY_ECON[city]?.property||1),score=1+(Number(d.m2||100)-100)*.0015-(Number(d.age||0))*.004+(d.view==='Manzaralı'?.06:0)+(d.parking?.035:0)+(d.site?.04:0)+(Number(d.transport||70)-70)*.0015;return Math.round(a.price*clamp(score*.7+.3,0.75,1.35)*cm*(1+currentNews().housing)/1000)*1000
}
function detailedPropertyCard(a,i){
 let d=a.details||{},val=propertyValuation(a);return '<div class="managed-property"><h4>'+a.name+'</h4><p>'+d.neighborhood+' • '+d.m2+' m² • '+d.rooms+' • '+d.age+' yaş • '+d.floor+'. kat • '+d.view+'</p><div class="vehicle-facts"><div><span>OTOPARK</span><b>'+(d.parking?'Var':'Yok')+'</b></div><div><span>SİTE</span><b>'+(d.site?'Evet':'Hayır')+'</b></div><div><span>ULAŞIM</span><b>'+d.transport+'/100</b></div><div><span>DEĞERLEME</span><b>'+money(val)+'</b></div><div><span>KİRA TALEBİ</span><b>'+money(a.askRent||a.rent||42000)+'</b></div><div><span>KİRACI</span><b>'+(a.tenantStatus==='occupied'?'Var':a.tenantStatus==='searching'?'Aranıyor':'Yok')+'</b></div></div><div class="card-action-row"><button onclick="setPropertyRentAsk('+i+')">Kira Belirle</button><button class="primary" onclick="sellManagedProperty('+i+',0)">Sat</button></div></div>'
}
function setPropertyRentAsk(i){let a=ownedAssets[i];if(!a)return;let suggested=Number(a.rent||42000),raw=prompt('Aylık kira bedeli',String(Math.round(a.askRent||suggested)));if(raw==null)return;let q=Number(raw);if(!q||q<1000){toast('Kira geçersiz');return}requestTenant(i,q);renderGameExtras()}
function generateDetailedUsed(){
 const names=['Şehir Hatchback','Aile Sedanı','Kompakt SUV','Premium Sedan','Hibrit Crossover','Ticari Van','4x4 Pickup','Elektrikli Crossover'];let arr=[];names.forEach((name,i)=>{let year=2017+Math.floor(Math.random()*9),km=Math.round((10000+Math.random()*150000)/1000)*1000,condition=Math.round(62+Math.random()*37),base=[850000,1250000,1950000,3600000,2250000,1100000,2450000,2650000][i],price=Math.round(base*(.82+condition/500)*(1+currentNews().auto)/10000)*10000;arr.push({id:'usedplus_'+Date.now()+'_'+i,name,year,km,engine:['1.0','1.3','1.5','1.6','2.0'][i%5],fuel:['Benzin','Dizel','Hibrit','Benzin','Hibrit','Dizel','Dizel','Elektrik'][i],package:['Comfort','Style','Premium','Executive'][i%4],damage:condition<72?'Hasar kaydı var':'Temiz',paint:condition<80?'1-2 parça boyalı':'Orijinal',condition,price,seller:['Bireysel','Galeri','Yetkili 2. El'][i%3]})});sim.detailedUsed=arr;sim.usedRefresh=Date.now()+180000;simSave()
}
function refreshDetailedUsed(){generateDetailedUsed();renderDetailedUsed()}
function renderDetailedUsed(){if(!sim.detailedUsed.length||Date.now()>sim.usedRefresh)generateDetailedUsed();let e=document.getElementById('detailedUsedList');if(!e)return;e.innerHTML=sim.detailedUsed.map((x,i)=>'<div class="used-detail-card"><h4>'+x.name+'</h4><p>'+x.seller+' • '+x.year+' • '+x.km.toLocaleString('tr-TR')+' km</p><div class="vehicle-facts"><div><span>MOTOR</span><b>'+x.engine+'</b></div><div><span>YAKIT</span><b>'+x.fuel+'</b></div><div><span>PAKET</span><b>'+x.package+'</b></div><div><span>HASAR</span><b>'+x.damage+'</b></div><div><span>BOYA</span><b>'+x.paint+'</b></div><div><span>KONDİSYON</span><b>'+x.condition+'/100</b></div></div><div class="dynamic-price">'+money(x.price)+'</div><div class="card-action-row"><button onclick="bargainUsed('+i+')">Pazarlık</button><button class="primary" onclick="buyDetailedUsed('+i+')">Satın Al</button></div></div>').join('')}
function bargainUsed(i){let x=sim.detailedUsed[i];if(!x)return;let raw=prompt('Teklifin',String(Math.round(x.price*.94/10000)*10000));if(raw==null)return;let offer=Number(raw),min=x.price*(.91+Math.random()*.04);if(offer>=min){x.price=Math.round(Math.min(offer,x.price)/10000)*10000;toast('Satıcı teklifini kabul etti')}else toast('Satıcı teklifi reddetti');simSave();renderDetailedUsed()}
function buyDetailedUsed(i){let x=sim.detailedUsed[i];if(!x)return;if(cash<x.price){toast('Yetersiz nakit');return}cash-=x.price;ownedAssets.push({id:x.id,name:x.name,type:'Araç',price:x.price,t:Date.now(),vehicle:{year:x.year,km:x.km,engine:x.engine,fuel:x.fuel,package:x.package,damage:x.damage,paint:x.paint,condition:x.condition},condition:x.condition});sim.detailedUsed.splice(i,1);saveOwned();save();simSave();render();renderGameExtras();toast('Araç garaja eklendi')}
function renderBrandDealers(){let e=document.getElementById('brandDealerList');if(!e)return;let brands=[['Marmara Motors','Şehir & SUV','₺1,55–3,90 Mn'],['Anadolu Otomotiv','Sedan & Hibrit','₺1,85–4,20 Mn'],['Atlas Premium','Premium & Elektrikli','₺3,20–8,50 Mn'],['Ege Ticari','Van & Pickup','₺2,10–4,10 Mn']];e.innerHTML=brands.map((b,i)=>'<div class="brand-card"><h4>'+b[0]+'</h4><p>'+b[1]+' • Sıfır araç fiyat bandı '+b[2]+'</p><div class="card-action-row"><button class="primary" onclick="location.hash=\'cars_new\'">Araçları Gör</button></div></div>').join('')}
function renderNeighborhoods(){let e=document.getElementById('neighborhoodList');if(!e)return;let data=[['İstanbul / Kadıköy / Fenerbahçe',1.22,'Konut & premium'],['İstanbul / Sarıyer / Zekeriyaköy',1.35,'Villa & arsa'],['Ankara / Çankaya / Çayyolu',1.12,'Konut & ofis'],['İzmir / Urla / İskele',1.28,'Villa & turizm'],['Bursa / Nilüfer / Özlüce',1.08,'Konut & ticaret'],['Antalya / Konyaaltı / Hurma',1.16,'Konut & turizm'],['Muğla / Bodrum / Yalıkavak',1.42,'Premium & turizm'],['Kocaeli / Başiskele / Sahil',1.10,'Konut & sanayi erişimi']];e.innerHTML=data.map(x=>'<div class="neighborhood-card"><h4>'+x[0]+'</h4><p>Değer katsayısı x'+x[1].toFixed(2)+' • '+x[2]+'</p></div>').join('')}
function renderCrisis(){
 let nw=totalWealth(),d=debt()+Number(sim.creditCard.used||0),ratio=d/Math.max(1,nw+d),risk=ratio>.75||nw<0?'Kritik':ratio>.5?'Yüksek':ratio>.3?'Orta':'Düşük',set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};set('crisisRisk',risk);set('crisisCash',money(cash));set('crisisDebt',money(d));set('crisisNet',money(nw));let a=document.getElementById('crisisAdvice');if(a)a.textContent=risk==='Kritik'?'Borcu azalt, yüksek maliyetli varlıkları sat ve yapılandırma kullan.':risk==='Yüksek'?'Yeni kredi kullanmadan önce nakit akışını düzelt.':'Finansal yapı yönetilebilir seviyede.'
}
function emergencyAssetSale(){let candidates=ownedAssets.map((a,i)=>({a,i})).filter(x=>!x.a.collateral).sort((x,y)=>y.a.price-x.a.price);if(!candidates.length){toast('Satılabilir varlık yok');return}let o=candidates[0],amount=Math.round(o.a.price*.82);cash+=amount;ownedAssets.splice(o.i,1);tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:'Acil '+o.a.name,total:amount});saveOwned();save();render();renderGameExtras();toast('Acil satış • +'+money(amount))}
function emergencyRestructure(){let list=active();if(!list.length){toast('Aktif kredi yok');return}let l=list.sort((a,b)=>b.remaining-a.remaining)[0];l.months=6;l.rate=Number(l.rate||3)+.8;l.total=l.remaining*(1+l.rate/100*6);l.remaining=l.total;l.installment=l.total/6;creditScore=clamp(creditScore-4,0,100);save();render();renderGameExtras();toast('En büyük kredi 6 aya yapılandırıldı')}
function saveUnifiedState(){
 try{
  localStorage.setItem('gs140_state',JSON.stringify({version:161,cash,pf,tx,realized,loans,creditScore,trusts,lateCount,deposits,ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,sim,savedAt:Date.now()}));
  let u=currentAccount();if(u&&u.id&&u.id!=='guest')localStorage.setItem(accountCareerKey(u.id),JSON.stringify(captureCareerState()))
 }catch(e){}
}
function unifiedIntegrity(){let s=localStorage.getItem('gs140_state');if(!s)return false;try{let d=JSON.parse(s);return d&&Number(d.version)>=151&&typeof d.cash==='number'&&d.sim}catch(e){return false}}
function renderV140(){renderConstructionPlan();renderCompanyFoundation();renderCompanyPortfolio();renderSelectedCompanyActivity();renderSetupStep();
 ensureAssetMetadata();processTenantSearch();renderCompanySetup();renderBusinessCredit();renderStockResearch();renderEconomicNews();renderDetailedUsed();renderBrandDealers();renderNeighborhoods();renderCrisis();saveUnifiedState()
}


function renderV141(){
 let set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 let invest=stats('stock').value+stats('crypto').value+stats('gold').value+sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0);
 set('financeCreditScore',Math.round(creditScore));
 set('financeDebt',money(debt()+Number(sim.creditCard?.used||0)));
 set('financeInvestments',money(invest));
}

function renderGameExtras(){
 renderOwned();renderDevelopableLands();renderFactoryUpgrade();updateOps();renderMissions();renderBusinessSummary();renderActivity();renderRealism();renderSimulation();renderCollateral();renderDealer();renderCityOwnership();renderDynamicMarket();renderProjectPortfolio();renderPropertyManagement();renderMonthlyReport();renderAdvanced();
 let total=totalWealth();
 let hn=document.getElementById('homeNetWorth');if(hn)hn.textContent=money(total);let bn=document.getElementById('bankNetWorth');if(bn)bn.textContent=money(total);
 let hl=document.getElementById('homeLevel');if(hl)hl.textContent=gameLevel();
 let pn=document.getElementById('profileNet');if(pn)pn.textContent=money(total);
 let pl=document.getElementById('profileLevelText');if(pl)pl.textContent='Girişimci • Seviye '+gameLevel();
 let pc=document.getElementById('profileCredit');if(pc)pc.textContent=creditScore;
 let pac=document.getElementById('profileAssetCount');if(pac)pac.textContent=ownedAssets.length;
 let pt=document.getElementById('profileTxCount');if(pt)pt.textContent=tx.length;
}
repairLegacyCareerBeforeRender();sanitizeGameState();syncSelectedCompanyToProfile();render();renderFinanceExtras();renderGameExtras();save();saveDeposits();saveOwned();
setInterval(()=>{movePrices();renderFinanceExtras();renderGameExtras()},5000);setInterval(()=>{updateOps();renderEconomy();renderSimulation()},1000);
setInterval(()=>{render();renderFinanceExtras();renderGameExtras()},30000);


renderAccountState();
