/* Empire of Trade • Profil ekranı sadeleştirme: Karakter kartını kaldır */
(function(){
  'use strict';
  if(window.__eotProfileUiCleanup)return;
  window.__eotProfileUiCleanup=true;

  function removeCharacterCard(){
    const profile=document.getElementById('profile');
    if(!profile)return;
    const nodes=[...profile.querySelectorAll('a,button,section,div')];
    const title=nodes.find(el=>{
      const t=String(el.textContent||'').replace(/\s+/g,' ').trim();
      return t==='Karakter' || t.startsWith('Karakter Seviye, XP ve girişimci itibarı.');
    });
    if(!title)return;
    let card=title;
    while(card&&card.parentElement!==profile){
      const cls=String(card.className||'');
      if(card.tagName==='A'||card.tagName==='BUTTON'||/card|tile|menu/i.test(cls))break;
      card=card.parentElement;
    }
    if(card&&card!==profile)card.remove();
  }

  function cleanup(){
    removeCharacterCard();
    const newGame=document.getElementById('eotNewGameCard');
    if(newGame)newGame.remove();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});else cleanup();
  window.addEventListener('hashchange',()=>{if(String(location.hash||'').includes('profile'))setTimeout(cleanup,0)},true);
  window.addEventListener('pageshow',cleanup);
  document.addEventListener('eot:route-rendered',cleanup);
  window.EOTProfileUiCleanup=cleanup;
})();
