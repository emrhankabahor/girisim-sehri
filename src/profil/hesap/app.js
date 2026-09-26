/* EOT_PART app.js-accountUsers */
function accountUsers(){
 try{return JSON.parse(localStorage.getItem('gs_accounts')||'[]')}catch(e){return[]}
}
/* EOT_END */
/* EOT_PART app.js-saveAccountUsers */
function saveAccountUsers(users){localStorage.setItem('gs_accounts',JSON.stringify(users))}
/* EOT_END */
/* EOT_PART app.js-accountSessionAuthenticated */
function accountSessionAuthenticated(){
 let u=currentAccount();
 return !!(u&&u.id)
}
/* EOT_END */
/* EOT_PART app.js-markAccountSessionAuthenticated */
function markAccountSessionAuthenticated(){localStorage.setItem('gs_account_remembered','1')}
/* EOT_END */
/* EOT_PART app.js-clearAccountSessionAuthenticated */
function clearAccountSessionAuthenticated(){localStorage.removeItem('gs_account_remembered')}
/* EOT_END */
/* EOT_PART app.js-currentAccount */
function currentAccount(){
 try{return JSON.parse(localStorage.getItem('gs_current_account')||'null')}catch(e){return null}
}
/* EOT_END */
/* EOT_PART app.js-accountCareerKey */
function accountCareerKey(id){return 'gs_account_career_'+id}
/* EOT_END */
/* EOT_PART app.js-setAccountMode */
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
/* EOT_END */
/* EOT_PART app.js-showAccountError */
function showAccountError(msg){let e=document.getElementById('accountError');if(e){e.textContent=msg;e.classList.remove('hidden')}}
/* EOT_END */
/* EOT_PART app.js-hideAccountError */
function hideAccountError(){let e=document.getElementById('accountError');if(e)e.classList.add('hidden')}
/* EOT_END */
/* EOT_PART app.js-simpleHash */
function simpleHash(str){
 let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)
}
/* EOT_END */
/* EOT_PART app.js-normalizeAccountEmail */
function normalizeAccountEmail(){return (document.getElementById('accountEmail')?.value||'').trim().toLowerCase()}
/* EOT_END */
/* EOT_PART app.js-scheduleAccountLookup */
function scheduleAccountLookup(){
 clearTimeout(accountLookupTimer);
 accountLookupTimer=setTimeout(routeAccountByEmail,350)
}
/* EOT_END */
/* EOT_PART app.js-routeAccountByEmail */
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
/* EOT_END */
/* EOT_PART app.js-submitEmailAccount */
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
/* EOT_END */
/* EOT_PART app.js-startAppleSignIn */
function startAppleSignIn(){
 let n=document.getElementById('appleNote');if(n){n.innerHTML='<span> Apple</span><p>Apple ile gerçek giriş için iOS uygulamasında Sign in with Apple yetkilendirmesi, Service ID / Bundle ID ve sunucu tarafı token doğrulaması bağlanmalıdır. Bu HTML demosunda sahte Apple hesabı oluşturulmadı.</p>'}
 toast('Apple ile giriş mobil uygulama entegrasyonunda aktif olacak')
}
/* EOT_END */
/* EOT_PART app.js-continueAsGuest */
function continueAsGuest(){
 localStorage.setItem('gs_current_account',JSON.stringify({id:'guest',provider:'guest',name:'Misafir'}));
 markAccountSessionAuthenticated();
 hideAccountOverlay();
 hideCareerOverlay();
 render();renderFinanceExtras();renderGameExtras()
}
/* EOT_END */
/* EOT_PART app.js-enterGameAfterAccount */
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
/* EOT_END */
/* EOT_PART app.js-logoutAccount */
function logoutAccount(){
 let u=currentAccount();
 if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id);
 localStorage.removeItem('gs_current_account');
 clearAccountSessionAuthenticated();
 showAccountOverlay();
 setAccountMode('login');
 toast('Hesaptan çıkış yapıldı')
}
/* EOT_END */
/* EOT_PART app.js-hideAccountOverlay */
function hideAccountOverlay(){let e=document.getElementById('accountOverlay');if(e){e.classList.add('hidden');e.style.display='none';e.setAttribute('aria-hidden','true')}}
/* EOT_END */
/* EOT_PART app.js-showAccountOverlay */
function showAccountOverlay(){let e=document.getElementById('accountOverlay');if(e){e.style.display='grid';e.classList.remove('hidden');e.setAttribute('aria-hidden','false')}}
/* EOT_END */
/* EOT_PART app.js-renderAccountState */
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
 /* Yeni kariyerde ilk ekran şirket kuruluşudur.
    Hesap ekranı yalnızca "Mevcut Hesaba Giriş Yap" ile açılır. */
 hideAccountOverlay();
 hideCareerOverlay();
 try{sessionStorage.setItem('eot_company_setup_first','1')}catch(e){}
 if(window.EOTCompanyOnboarding&&typeof window.EOTCompanyOnboarding.show==='function'){
   window.EOTCompanyOnboarding.show();
 }
}
/* EOT_END */
/* EOT_PART app.js-showOnboarding */
function showOnboarding(){
 let e=document.getElementById('onboardingOverlay');if(e)e.classList.remove('hidden');onboardingStep=1;renderOnboarding()
}
/* EOT_END */
/* EOT_PART app.js-renderOnboarding */
function renderOnboarding(){
 document.querySelectorAll('[data-onboard-step]').forEach(x=>x.classList.toggle('active',Number(x.dataset.onboardStep)===onboardingStep));
 document.querySelectorAll('[data-onboard-dot]').forEach(x=>{let n=Number(x.dataset.onboardDot);x.classList.toggle('active',n===onboardingStep);x.classList.toggle('done',n<onboardingStep)});
 let p=document.getElementById('onboardPrev'),n=document.getElementById('onboardNext'),f=document.getElementById('onboardFinish');
 if(p)p.style.visibility=onboardingStep===1?'hidden':'visible';if(n)n.classList.toggle('hidden',onboardingStep===5);if(f)f.classList.toggle('hidden',onboardingStep!==5)
}
/* EOT_END */
/* EOT_PART app.js-changeOnboardingStep */
function changeOnboardingStep(d){onboardingStep=Math.max(1,Math.min(5,onboardingStep+d));renderOnboarding()}
/* EOT_END */
/* EOT_PART app.js-finishOnboarding */
function finishOnboarding(goMarket=false){
 localStorage.setItem('gs_onboarding_done','1');
 let e=document.getElementById('onboardingOverlay');if(e)e.classList.add('hidden');
 if(goMarket)location.hash='dynamic_market'
}
/* EOT_END */
/* EOT_PART app.js-maybeShowOnboarding */
function maybeShowOnboarding(){
 if(localStorage.getItem('gs_onboarding_done')==='1')return;
 setTimeout(showOnboarding,80)
}
/* EOT_END */
/* EOT_PART app.js-hideCareerOverlay */
function hideCareerOverlay(){
  let e=document.getElementById('newCareerOverlay');
  if(e)e.classList.add('hidden')
}
/* EOT_END */
/* EOT_PART app.js-continueExistingCareer */
function continueExistingCareer(){
  hideCareerOverlay();
  render();renderFinanceExtras();renderGameExtras()
}
/* EOT_END */
/* EOT_PART app.js-startFreshCareer */
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
/* EOT_END */
