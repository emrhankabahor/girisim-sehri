/* Empire of Trade • Hafif doğrudan ekran görünürlüğü yöneticisi
   DOM'u sökmez, route virtualization yapmaz. İlk kurulumda ekranları tek kez
   normalize eder; sonraki geçişlerde yalnızca eski/yeni ekranı değiştirir. */
(function(){
  'use strict';
  if(window.__eotDirectRouteDisplay)return;
  window.__eotDirectRouteDisplay=true;

  let activeScreen=null;
  let frame=0;
  let normalized=false;

  function validTarget(hash){
    const id=String(hash||'#home').replace(/^#/,'');
    if(!/^[A-Za-z0-9_-]+$/.test(id))return null;
    const el=document.getElementById(id);
    return el&&el.classList&&el.classList.contains('screen')?el:null;
  }

  function disableHeavyCssRouting(){
    for(const sheet of Array.from(document.styleSheets||[])){
      let rules;try{rules=sheet.cssRules}catch(e){continue}
      if(!rules)continue;
      for(let i=rules.length-1;i>=0;i--){
        const rule=rules[i];
        const selector=String(rule&&rule.selectorText||'').replace(/\s+/g,' ').trim();
        if(selector==='.screen:target'||selector==='#home'||selector.includes('body:has(.screen:target:not(#home))')){
          try{sheet.deleteRule(i)}catch(e){}
        }
      }
    }
  }

  function normalizeScreens(next){
    if(normalized)return;
    normalized=true;
    document.querySelectorAll('.screen').forEach(function(screen){
      if(screen===next){
        screen.style.setProperty('display','block','important');
        screen.setAttribute('data-eot-route-visible','1');
      }else{
        screen.style.setProperty('display','none','important');
        screen.removeAttribute('data-eot-route-visible');
      }
    });
  }

  function show(hash){
    const next=validTarget(hash)||validTarget('#home');
    if(!next)return false;
    normalizeScreens(next);
    if(activeScreen===next){
      if(next.style.display!=='block')next.style.setProperty('display','block','important');
      return true;
    }
    if(activeScreen){
      activeScreen.style.setProperty('display','none','important');
      activeScreen.removeAttribute('data-eot-route-visible');
    }
    next.style.setProperty('display','block','important');
    next.setAttribute('data-eot-route-visible','1');
    activeScreen=next;
    return true;
  }

  function schedule(hash){
    const target=hash||location.hash||'#home';
    const next=validTarget(target)||validTarget('#home');
    if(next&&next===activeScreen)return;
    if(frame)cancelAnimationFrame(frame);
    frame=requestAnimationFrame(function(){frame=0;show(target)});
  }

  function install(){
    const first=validTarget(location.hash||'#home')||validTarget('#home');
    if(first)normalizeScreens(first);
    disableHeavyCssRouting();
    show(location.hash||'#home');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.addEventListener('hashchange',function(){schedule(location.hash||'#home')},true);
  window.addEventListener('popstate',function(){schedule(location.hash||'#home')},true);
  window.addEventListener('pageshow',function(){disableHeavyCssRouting();schedule(location.hash||'#home')});

  window.EOTShowRoute=function(hash){return show(hash)};
})();