(async function(){
  const root=document.getElementById('app-root');

  if('serviceWorker' in navigator){
    window.addEventListener('load',async()=>{
      try{
        const reg=await navigator.serviceWorker.register('./sw.js?v=185',{scope:'./'});
        await reg.update();
      }catch(err){console.warn('Service worker kaydı başarısız:',err)}
    });
  }

  function applyLogo(el){
    if(!el) return;
    el.textContent='';
    el.style.backgroundImage="url('./apple-touch-icon.png?v=185')";
    el.style.backgroundSize='cover';
    el.style.backgroundPosition='center';
    el.style.backgroundRepeat='no-repeat';
  }

  function upgradeHomeCommand(){
    const command=document.querySelector('.home-command');
    if(!command || command.dataset.eotUpgraded==='1') return;
    command.dataset.eotUpgraded='1';
    const copy=command.querySelector('.home-command-top > div:first-child');
    if(copy){
      const eyebrow=copy.querySelector('.eyebrow');
      const title=copy.querySelector('h2');
      const text=copy.querySelector('p');
      if(eyebrow) eyebrow.textContent='YÖNETİM MERKEZİ';
      if(title) title.textContent='İmparatorluğunu yönet';
      if(text) text.textContent='Piyasayı takip et, sermayeni büyüt ve şirketlerini tek merkezden yönet.';
      if(!copy.querySelector('.home-command-actions')){
        const actions=document.createElement('div');
        actions.className='home-command-actions';
        actions.innerHTML='<a href="#companies">Şirketlerim <span>→</span></a><a href="#investments">Yatırım Merkezi <span>→</span></a>';
        copy.appendChild(actions);
      }
    }
  }

  function applyEmpireBranding(){
    document.title='Empire of Trade Demo V1.69 • Oynanabilirlik';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      if(node.parentElement && !['SCRIPT','STYLE'].includes(node.parentElement.tagName)){
        node.nodeValue=node.nodeValue
          .replace(/GİRİŞİM ŞEHRİ/g,'EMPIRE OF TRADE')
          .replace(/Girişim Şehri/g,'Empire of Trade');
      }
    });
    document.querySelectorAll('.account-brand-logo,.topbar .logo,.career-brand-mark').forEach(applyLogo);
    const versionLabel=document.querySelector('.topbar small');
    if(versionLabel) versionLabel.textContent='MOBİL DEMO • V1.69 • OYNANABİLİRLİK';
    upgradeHomeCommand();
  }

  try{
    const files=['content-1.html','content-2.html','content-3.html','content-4.html','content-5.html','content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f+'?v=185',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    applyEmpireBranding();
    const load=(src,next)=>{const s=document.createElement('script');s.src=src+'?v=185';s.onload=()=>{applyEmpireBranding();next&&next()};document.body.appendChild(s)};
    load('app.js',()=>load('v167.js',()=>load('realtime-finance.js',()=>load('state-integrity.js',()=>load('company-list-fix.js',()=>load('demo-balance-grant.js',()=>load('v169.js',()=>load('loan-management.js'))))))));
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Empire of Trade yüklenemedi</h2><p>Bağlantını kontrol edip sayfayı yenile.</p></main>';
  }
})();
