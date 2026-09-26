/* Empire of Trade • Hafif doğrudan ekran görünürlüğü yöneticisi
   DOM'u sökmez, route virtualization yapmaz. Yalnızca mevcut hash hedefinin
   görünürlüğünü doğrudan değiştirerek Safari :target/:has style yükünü azaltır. */
(function(){
  'use strict';
  if(window.__eotDirectRouteDisplay)return;
  window.__eotDirectRouteDisplay=true;

  let activeScreen=null;
  let frame=0;

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

  function show(hash){
    const next=validTarget(hash)||validTarget('#home');
    if(!next)return;
    if(activeScreen&&activeScreen!==next){
      activeScreen.style.setProperty('display','none','important');
      activeScreen.removeAttribute('data-eot-route-visible');
    }
    next.style.setProperty('display','block','important');
    next.setAttribute('data-eot-route-visible','1');
    activeScreen=next;
  }

  function schedule(hash){
    if(frame)cancelAnimationFrame(frame);
    const target=hash||location.hash||'#home';
    frame=requestAnimationFrame(function(){frame=0;show(target)});
  }

  function install(){
    disableHeavyCssRouting();
    show(location.hash||'#home');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  window.addEventListener('hashchange',function(){schedule(location.hash||'#home')},true);
  window.addEventListener('popstate',function(){schedule(location.hash||'#home')},true);
  window.addEventListener('pageshow',function(){disableHeavyCssRouting();schedule(location.hash||'#home')});

  window.EOTShowRoute=function(hash){show(hash);return true};
})();