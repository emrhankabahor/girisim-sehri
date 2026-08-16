/* Empire of Trade • İnşaat ve arsa geliştirme güvenlik katmanı */
(function(){
  let patched=false;
  const now=()=>Date.now();
  function arr(v){return Array.isArray(v)?v:[]}
  function num(v,d=0){v=Number(v);return Number.isFinite(v)?v:d}
  function allAssets(){try{return typeof ownedAssets!=='undefined'?arr(ownedAssets):[]}catch(e){return []}}
  function persist(){try{if(typeof saveOwned==='function')saveOwned();if(typeof save==='function')save();if(typeof simSave==='function')simSave();if(typeof saveUnifiedState==='function')saveUnifiedState();if(typeof currentAccount==='function'&&typeof saveAccountCareer==='function'){const u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}}catch(e){console.warn('İnşaat kaydı:',e)}}
  function normalize(){
    try{
      if(typeof constructionOp==='undefined')return;
      if(!constructionOp||typeof constructionOp!=='object')constructionOp={status:'idle',finish:0};
      if(!['idle','running','ready'].includes(constructionOp.status))constructionOp={status:'idle',finish:0};
      if(constructionOp.status==='running'){
        const finish=num(constructionOp.finish,0);
        if(finish<=0){constructionOp={status:'idle',finish:0};persist();return}
        if(now()>=finish){constructionOp.status='ready';persist()}
      }
      if(constructionOp.status==='ready'){
        constructionOp.cost=Math.max(0,num(constructionOp.cost));
        constructionOp.revenue=Math.max(0,num(constructionOp.revenue));
      }
    }catch(e){}
  }
  function hasConstructionCompany(){return allAssets().some(a=>a&&a.id==='construction_basic')}
  function landExists(id){return allAssets().some(a=>a&&String(a.id||'')===String(id||'')&&a.type==='Arsa')}
  function patch(){
    if(patched)return;
    normalize();
    if(typeof window.chooseProjectPlan==='function'&&!window.chooseProjectPlan.__eotConstructionSafe){
      const original=window.chooseProjectPlan;
      window.chooseProjectPlan=function(kind){
        normalize();
        if(!hasConstructionCompany()){if(typeof toast==='function')toast('Önce inşaat şirketini kur');return false}
        if(constructionOp.status==='running'){if(typeof toast==='function')toast('Devam eden proje tamamlanmadan yeni proje başlatılamaz');return false}
        if(constructionOp.status==='ready'){if(typeof toast==='function')toast('Önce tamamlanan projeyi portföye aktar');return false}
        const beforeAssets=allAssets().map(a=>String(a&&a.id||''));
        const beforeCash=typeof cash!=='undefined'?num(cash):0;
        const r=original.apply(this,arguments);
        normalize();
        if(constructionOp.status==='running'){
          constructionOp.startedAt=num(constructionOp.startedAt,now());
          constructionOp.projectType=String(constructionOp.projectType||kind||'Proje');
          const landId=String(constructionOp.landId||constructionOp.selectedLandId||'');
          if(landId && !beforeAssets.includes(landId) && !landExists(landId)){
            constructionOp={status:'idle',finish:0};
            if(typeof toast==='function')toast('Proje arsası bulunamadı; işlem iptal edildi');
            persist();return false
          }
          if(typeof cash!=='undefined'&&num(cash)>beforeCash){cash=beforeCash}
          persist();return true
        }
        return r
      };
      window.chooseProjectPlan.__eotConstructionSafe=true;
    }
    if(typeof window.completeConstructionToPortfolio==='function'&&!window.completeConstructionToPortfolio.__eotConstructionSafe){
      const original=window.completeConstructionToPortfolio;
      window.completeConstructionToPortfolio=function(){
        normalize();
        if(constructionOp.status!=='ready'){if(typeof toast==='function')toast('Proje henüz tamamlanmadı');return false}
        const before=allAssets().length;
        const r=original.apply(this,arguments);
        const added=allAssets().length>before;
        if(added||r){constructionOp.completedAt=now();persist();try{if(typeof render==='function')render();if(typeof renderGameExtras==='function')renderGameExtras()}catch(e){}}
        return r
      };
      window.completeConstructionToPortfolio.__eotConstructionSafe=true;
    }
    if(typeof window.collectConstructionProject==='function'&&!window.collectConstructionProject.__eotConstructionSafe){
      const original=window.collectConstructionProject;
      window.collectConstructionProject=function(){normalize();const r=original.apply(this,arguments);persist();return r};
      window.collectConstructionProject.__eotConstructionSafe=true;
    }
    if(typeof window.startLandProject==='function'&&!window.startLandProject.__eotConstructionSafe){
      const original=window.startLandProject;
      window.startLandProject=function(){normalize();const r=original.apply(this,arguments);persist();return r};
      window.startLandProject.__eotConstructionSafe=true;
    }
    patched=true;
  }
  const timer=setInterval(()=>{patch();normalize()},500);
  setTimeout(()=>clearInterval(timer),20000);
  setInterval(normalize,5000);
  window.addEventListener('pagehide',persist);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();else normalize()});
})();
