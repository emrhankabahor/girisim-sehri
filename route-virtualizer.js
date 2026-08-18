/* Empire of Trade • Route virtualization
   Büyük tek-sayfa DOM'unda yalnızca aktif .screen'i belgede tutar.
   Diğer ekranlar bellekte saklanır ve ihtiyaç olduğunda anında geri takılır. */
(function(){
  'use strict';
  if(window.__eotRouteVirtualizer)return;
  window.__eotRouteVirtualizer=true;

  const routes=new Map();
  let currentId='';
  let initialized=false;
  let refreshToken=0;

  function routeIdFromHash(hash){
    const raw=String(hash||'#home').replace(/^#/,'');
    try{return decodeURIComponent(raw)||'home'}catch(e){return raw||'home'}
  }

  function collect(){
    if(initialized)return routes.size>0;
    const screens=[...document.querySelectorAll('.screen[id]')];
    if(!screens.length)return false;

    screens.forEach(function(node){
      const id=node.id;
      if(!id||routes.has(id))return;
      const anchor=document.createComment('eot-route:'+id);
      node.parentNode.insertBefore(anchor,node);
      routes.set(id,{node:node,anchor:anchor});
    });
    initialized=true;
    return true;
  }

  function park(id){
    const r=routes.get(id);
    if(!r||!r.node.isConnected)return;
    r.node.remove();
  }

  function lightRefresh(){
    const token=++refreshToken;
    requestAnimationFrame(function(){
      if(token!==refreshToken)return;
      try{if(typeof window.render==='function')window.render()}catch(e){}
      try{if(typeof window.renderFinanceExtras==='function')window.renderFinanceExtras()}catch(e){}
      try{if(typeof window.renderGameExtras==='function')window.renderGameExtras()}catch(e){}
    });
  }

  function mount(id,refresh){
    if(!collect())return false;
    id=id||'home';
    const r=routes.get(id);
    if(!r)return false;

    if(currentId&&currentId!==id)park(currentId);

    if(!r.node.isConnected){
      r.anchor.parentNode.insertBefore(r.node,r.anchor.nextSibling);
    }
    currentId=id;
    if(refresh!==false)lightRefresh();
    return true;
  }

  function parkAllExcept(id){
    routes.forEach(function(r,key){if(key!==id&&r.node.isConnected)r.node.remove()});
  }

  function init(){
    if(!collect())return false;
    const id=routeIdFromHash(location.hash);
    const target=routes.has(id)?id:(routes.has('home')?'home':routes.keys().next().value);
    mount(target,false);
    parkAllExcept(target);
    currentId=target;
    return true;
  }

  /* Anchor tıklamasında hash değişmeden ÖNCE hedef ekranı tak.
     Böylece :target seçicisinin yüzlerce ekran üzerinde yeniden hesaplanması engellenir. */
  document.addEventListener('click',function(e){
    const a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;
    if(!a)return;
    const id=routeIdFromHash(a.getAttribute('href'));
    if(routes.has(id))mount(id,true);
  },true);

  window.addEventListener('hashchange',function(){
    const id=routeIdFromHash(location.hash);
    if(routes.has(id))mount(id,true);
  },true);

  window.addEventListener('popstate',function(){
    const id=routeIdFromHash(location.hash);
    if(routes.has(id))mount(id,true);
  },true);

  window.eotMountRoute=function(id){return mount(String(id||'').replace(/^#/,''),true)};
  window.eotRouteVirtualizerStats=function(){return {routes:routes.size,current:currentId,connected:[...routes].filter(x=>x[1].node.isConnected).map(x=>x[0])}};

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0)},{once:true});
  }else{
    if(!init())setTimeout(init,120);
  }
})();
