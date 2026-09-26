/* EOT_PART bootstrap.js-forceFreshVersion */
async function forceFreshVersion(remoteVersion){
    try{
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
      }
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r=>r.unregister()));
      }
    }catch(e){console.warn('Eski önbellek temizlenemedi:',e)}
    const url=new URL(location.href);
    url.searchParams.set('v',remoteVersion);
    url.searchParams.set('_fresh',Date.now().toString());
    location.replace(url.toString());
  }
/* EOT_END */
/* EOT_PART bootstrap.js-checkRemoteVersion */
async function checkRemoteVersion(){
    if(versionCheckRunning) return;
    versionCheckRunning=true;
    try{
      const res=await fetch('./version.json?_='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      if(res.ok){
        const data=await res.json();
        const remote=String(data.version||'');
        if(remote && remote!==APP_VERSION){
          await forceFreshVersion(remote);
          return;
        }
      }
    }catch(e){console.warn('Sürüm kontrolü yapılamadı:',e)}
    finally{versionCheckRunning=false}
  }
/* EOT_END */
/* EOT_PART bootstrap.js-restoreOriginalBottomNav */
function restoreOriginalBottomNav(){
    let style=document.getElementById('eot-nav-restore-style');
    if(!style){
      style=document.createElement('style');
      style.id='eot-nav-restore-style';
      style.textContent=`
        .eot-bottom-nav{display:none!important}
        .bottom-nav{position:fixed!important;z-index:30!important;left:50%!important;bottom:max(10px,env(safe-area-inset-bottom))!important;transform:translateX(-50%)!important;width:min(calc(100% - 24px),556px)!important;height:70px!important;padding:7px!important;display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:4px!important;border:1px solid var(--line)!important;border-radius:23px!important;background:rgba(9,20,34,.94)!important;backdrop-filter:blur(20px)!important;box-shadow:0 16px 45px rgba(0,0,0,.35)!important}
        .bottom-nav .nav-btn{position:static!important;margin:0!important;width:auto!important;height:auto!important;aspect-ratio:auto!important;border:0!important;border-radius:16px!important;background:transparent!important;box-shadow:none!important;color:#8aa0b8!important;font-size:8.5px!important;font-weight:700!important;padding:6px 2px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important}
        .bottom-nav .nav-btn:hover,.bottom-nav .nav-btn:active{background:rgba(96,165,250,.1)!important;color:#fff!important;transform:scale(.985)!important}
        .bottom-nav .nav-ico{font-size:18px!important;color:inherit!important}
      `;
      document.head.appendChild(style);
    }
    document.querySelectorAll('.eot-bottom-nav').forEach(el=>el.remove());
  }
/* EOT_END */
/* EOT_PART bootstrap.js-hrefFor */
function hrefFor(words,fallback='#home'){
    const keys=words.map(x=>x.toLocaleLowerCase('tr'));
    const links=[...document.querySelectorAll('a[href^="#"]')];
    const hit=links.find(a=>{
      const t=(a.textContent||'').toLocaleLowerCase('tr');
      return keys.some(k=>t.includes(k));
    });
    return hit?.getAttribute('href')||fallback;
  }
/* EOT_END */
/* EOT_PART bootstrap.js-applyBranding */
function applyBranding(){
    document.title='Empire of Trade Demo V1.69 • Oynanabilirlik';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(node.parentElement && !['SCRIPT','STYLE'].includes(node.parentElement.tagName)){
        node.nodeValue=node.nodeValue.replace(/GİRİŞİM ŞEHRİ/g,'EMPIRE OF TRADE').replace(/Girişim Şehri/g,'Empire of Trade');
      }
    });
    document.querySelectorAll('.account-brand-logo,.career-brand-mark').forEach(el=>{
      el.textContent='';
      el.style.backgroundImage="url('./assets/logo-v221-180.png')";
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
    });
    restoreOriginalBottomNav();
  }
/* EOT_END */
/* EOT_PART bootstrap.js-findTextValue */
function findTextValue(label){
    const candidates=[...document.querySelectorAll('#home *')];
    const key=label.toLocaleLowerCase('tr');
    const hit=candidates.find(el=>{
      const t=(el.textContent||'').trim().toLocaleLowerCase('tr');
      return t===key || t.startsWith(key+' ');
    });
    if(!hit) return null;
    const box=hit.parentElement;
    if(!box) return null;
    const b=box.querySelector('b,strong');
    return b?.textContent?.trim()||null;
  }
/* EOT_END */
/* EOT_PART bootstrap.js-homeDashboardVisible */
function homeDashboardVisible(){
    if(document.visibilityState==='hidden')return false;
    const hash=location.hash||'#home';
    return hash==='#home';
  }
/* EOT_END */
