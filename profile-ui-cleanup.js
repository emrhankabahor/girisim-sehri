/* Empire of Trade • Profil ekranı sadeleştirme: Karakter + Yeni Oyun kaldır */
(function(){
  'use strict';
  if(window.__eotProfileUiCleanup)return;
  window.__eotProfileUiCleanup=true;

  function ensureStyle(){
    if(document.getElementById('eot-profile-ui-cleanup-style'))return;
    const s=document.createElement('style');
    s.id='eot-profile-ui-cleanup-style';
    s.textContent='#eotNewGameCard{display:none!important}';
    document.head.appendChild(s);
  }

  function removeCharacterCard(){
    const profile=document.getElementById('profile');
    if(!profile)return;
    const titles=[...profile.querySelectorAll('h1,h2,h3,h4,b,strong,span,div')];
    const title=titles.find(el=>String(el.textContent||'').replace(/\s+/g,' ').trim()==='Karakter');
    if(!title)return;

    let card=title.closest('a,button,[onclick]');
    if(!card){
      let n=title;
      for(let i=0;i<4&&n&&n.parentElement&&n.parentElement!==profile;i++){
        n=n.parentElement;
        const txt=String(n.textContent||'').replace(/\s+/g,' ').trim();
        if(txt.includes('Karakter')&&txt.includes('Seviye')&&txt.length<180){card=n;break;}
      }
    }
    if(card&&card!==profile)card.remove();
  }

  function cleanup(){
    ensureStyle();
    removeCharacterCard();
    const newGame=document.getElementById('eotNewGameCard');
    if(newGame)newGame.remove();
  }

  let observer=null;
  function watchProfile(){
    const profile=document.getElementById('profile');
    if(!profile||observer)return;
    observer=new MutationObserver(()=>cleanup());
    observer.observe(profile,{childList:true,subtree:true});
  }

  function run(){cleanup();watchProfile();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('hashchange',()=>{if(String(location.hash||'').includes('profile'))setTimeout(run,0)},true);
  window.addEventListener('pageshow',run);
  document.addEventListener('eot:route-rendered',run);
  window.EOTProfileUiCleanup=run;
})();
