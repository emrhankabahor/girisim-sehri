/* Empire of Trade • Açılış animasyonu + render perdesi */
(function(){
  'use strict';
  if(window.__eotStartupSplashLoaded)return;
  window.__eotStartupSplashLoaded=true;

  const started=performance.now();
  let visibleStarted=0;
  let target=8, shown=0, ready=false, removed=false, timer=null;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;z-index:2147483646;background:
      radial-gradient(circle at 50% 45%,rgba(19,72,125,.20),transparent 28%),
      linear-gradient(180deg,#02070d,#030912 58%,#02060b);
      color:#fff;display:flex;align-items:center;justify-content:center;
      font-family:inherit;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-splash-inner{width:min(82vw,420px);display:flex;flex-direction:column;align-items:center}
    .eot-splash-stage{position:relative;width:250px;height:250px;display:grid;place-items:center;margin-top:-5vh}
    .eot-splash-orbit{position:absolute;border-radius:50%;border:1px solid rgba(55,139,222,.14);
      box-shadow:0 0 35px rgba(21,100,190,.08) inset}
    .eot-splash-orbit.o1{width:210px;height:210px;animation:eotPulse 2.6s ease-in-out infinite}
    .eot-splash-orbit.o2{width:165px;height:165px;animation:eotPulse 2.6s .35s ease-in-out infinite}
    .eot-splash-orbit.o3{width:120px;height:120px;animation:eotPulse 2.6s .7s ease-in-out infinite}
    .eot-splash-logo{position:relative;z-index:2;width:94px;height:94px;border-radius:24px;
      background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;
      box-shadow:0 14px 42px rgba(0,0,0,.55),0 0 42px rgba(40,137,255,.28);
      animation:eotLogoFloat 2.3s ease-in-out infinite}
    .eot-splash-brand{margin-top:-28px;text-align:center}
    .eot-splash-brand b{display:block;font-size:24px;letter-spacing:.075em}
    .eot-splash-brand small{display:block;margin-top:6px;color:#5bd8ee;font-size:8px;
      font-weight:900;letter-spacing:.30em}
    .eot-splash-progress-wrap{width:100%;margin-top:86px}
    .eot-splash-percent{text-align:center;color:#a9bdd0;font-size:11px;font-weight:800;margin-bottom:10px}
    .eot-splash-track{height:10px;border-radius:999px;background:#071321;border:1px solid rgba(105,167,222,.16);
      overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.45)}
    .eot-splash-fill{height:100%;width:0%;border-radius:inherit;
      background:linear-gradient(90deg,#2279e6,#37bedf,#5bdd9c);
      box-shadow:0 0 16px rgba(55,190,223,.35);transition:width .16s linear}
    .eot-splash-caption{text-align:center;margin-top:12px;color:#6f879d;font-size:9px;letter-spacing:.08em}
    @keyframes eotPulse{0%,100%{transform:scale(.96);opacity:.36}50%{transform:scale(1.04);opacity:.82}}
    @keyframes eotLogoFloat{0%,100%{transform:translateY(3px) scale(.985)}50%{transform:translateY(-4px) scale(1.015)}}
    @media(max-width:430px){
      .eot-splash-stage{width:220px;height:220px}
      .eot-splash-orbit.o1{width:190px;height:190px}.eot-splash-orbit.o2{width:148px;height:148px}.eot-splash-orbit.o3{width:108px;height:108px}
      .eot-splash-logo{width:86px;height:86px;border-radius:22px}
      .eot-splash-brand{margin-top:-20px}.eot-splash-brand b{font-size:21px}
      .eot-splash-progress-wrap{margin-top:74px}
    }`;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    visibleStarted=performance.now();
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    el.innerHTML=`<div class="eot-splash-inner">
      <div class="eot-splash-stage">
        <span class="eot-splash-orbit o1"></span><span class="eot-splash-orbit o2"></span><span class="eot-splash-orbit o3"></span>
        <div class="eot-splash-logo"></div>
      </div>
      <div class="eot-splash-brand"><b>EMPIRE OF TRADE</b><small>BUSINESS EMPIRE</small></div>
      <div class="eot-splash-progress-wrap">
        <div class="eot-splash-percent" id="eotSplashPercent">Yükleniyor • %0</div>
        <div class="eot-splash-track"><div class="eot-splash-fill" id="eotSplashFill"></div></div>
        <div class="eot-splash-caption">Kariyer ve piyasa verileri hazırlanıyor</div>
      </div>
    </div>`;
    document.body.appendChild(el);
  }

  function paint(v){
    shown=Math.max(shown,Math.min(100,Math.round(v)));
    const fill=document.getElementById('eotSplashFill');
    const pct=document.getElementById('eotSplashPercent');
    if(fill)fill.style.width=shown+'%';
    if(pct)pct.textContent=shown>=100?'Hazır • %100':'Yükleniyor • %'+shown;
  }

  function finish(){
    if(removed)return;
    const elapsed=performance.now()-(visibleStarted||started);
    const wait=Math.max(0,2400-elapsed);
    setTimeout(()=>{
      paint(100);
      setTimeout(()=>{
        const el=document.getElementById('eotStartupSplash');
        if(el)el.classList.add('eot-splash-out');
        document.documentElement.classList.remove('eot-booting');
        setTimeout(()=>{el&&el.remove();style.remove();removed=true},460);
      },230);
    },wait);
  }

  function tick(){
    if(removed)return;
    if(!ready){
      target=Math.min(94,target+(.35+Math.random()*.75));
    }else{
      target=100;
    }
    shown+=(target-shown)*.16;
    paint(shown);
    if(ready&&shown>=97){finish();return}
    timer=requestAnimationFrame(tick);
  }

  window.EOTStartupSplash={
    progress(v){target=Math.max(target,Math.min(96,Number(v)||0))},
    ready(){if(ready)return;ready=true;target=100},
    failOpen(){ready=true;target=100;finish()}
  };

  if(document.body) mount();
  else document.addEventListener('DOMContentLoaded',mount,{once:true});
  requestAnimationFrame(tick);

  // Herhangi bir beklenmeyen hata oyunu sonsuza kadar kapatmasın.
  setTimeout(()=>{if(!ready)window.EOTStartupSplash.ready()},9000);
})();