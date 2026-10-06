/* Empire of Trade • Sade açılış temeli + render perdesi */
(function(){
  'use strict';
  if(window.__eotStartupSplashLoaded)return;
  window.__eotStartupSplashLoaded=true;
  const nativeMode=new URLSearchParams(location.search).get('native')==='1';
  window.__EOT_NATIVE_WRAPPER__=nativeMode;
  if(nativeMode){
    window.EOTStartupSplash={progress(){},ready(){},failOpen(){}};
    return;
  }

  let target=8, shown=0, ready=false, removed=false, finishing=false;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting,html.eot-booting body,html.eot-booting body.eot-design-v1{background:#040c1b!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;min-height:100vh;min-height:100lvh;z-index:2147483646;overflow:hidden;isolation:isolate;background:#050e1c;color:#ecdfc1;font-family:system-ui,sans-serif;opacity:1;transition:opacity .35s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-atlas-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 34%,#154c77a8,transparent 52%),radial-gradient(ellipse at 90% 90%,#bd863518,transparent 45%);pointer-events:none}
    .eot-atlas-grid{position:absolute;inset:0;background:linear-gradient(90deg,#91c9e007 1px,transparent 1px),linear-gradient(#91c9e007 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(transparent,#000 40%,#000 85%,transparent)}
    .eot-atlas-border{position:absolute;inset:0;border-left:1px solid #a48a5040;border-right:1px solid #a48a5040;pointer-events:none}
    .eot-atlas-border::before,.eot-atlas-border::after{content:'';position:absolute;width:32vw;max-width:360px;height:140px;border-top:1px solid #d4b67177;transform:skewY(-28deg);background:linear-gradient(170deg,#b78d3015,transparent)}
    .eot-atlas-border::before{left:-9%;top:18%}.eot-atlas-border::after{right:-9%;bottom:18%;transform:skewY(-28deg) rotate(180deg)}
    .eot-atlas-label{position:absolute;top:calc(env(safe-area-inset-top,0px) + 28px);left:0;right:0;display:flex;align-items:center;justify-content:center;gap:14px;color:#b4a381;font-size:9px;letter-spacing:.32em;font-weight:650}
    .eot-atlas-label::before,.eot-atlas-label::after{content:'';width:32px;height:1px;background:#b4a38166}
    .eot-atlas-logo{position:absolute;top:33%;left:50%;transform:translate(-50%,-50%);width:min(76vw,380px,39vh);margin:0;z-index:2}
    .eot-atlas-logo::before{content:'';position:absolute;inset:-25%;background:radial-gradient(ellipse,#429bd52b,transparent 65%);animation:eotAtlasBreathe 5s ease-in-out infinite alternate;pointer-events:none}
    .eot-atlas-logo img{position:relative;display:block;width:100%;height:auto;border-radius:21%;box-shadow:0 24px 50px #02081288}
    .eot-atlas-city{position:absolute;top:49%;left:50%;transform:translateX(-50%);width:min(115vw,690px);height:min(31vh,280px);pointer-events:none;mask-image:linear-gradient(transparent,#000 15%,#000 80%,transparent)}
    .eot-atlas-city svg{display:block;width:100%;height:100%;overflow:visible}
    .eot-atlas-city .plan{fill:none;stroke:#5b91a73d;stroke-width:1}
    .eot-atlas-city .tower{fill:#0e2439;stroke:#75aec166;stroke-width:1}
    .eot-atlas-city .side{fill:#102f46;stroke:#5d8d9f66;stroke-width:1}
    .eot-atlas-city .roof{fill:#244655;stroke:#d3b77188;stroke-width:1}
    .eot-atlas-city .windows{stroke:#91d5e6;stroke-width:2;opacity:.08;transition:opacity .6s ease}
    .eot-atlas-city .lit .windows{opacity:.85}
    .eot-atlas-city .route{fill:none;stroke:#dfb96e;stroke-width:1.8;stroke-dasharray:12 500;animation:eotAtlasRoute 8s linear infinite}
    .eot-atlas-loading{position:absolute;left:50%;top:78%;transform:translateX(-50%);width:min(78vw,370px);z-index:3}
    .eot-startup-caption{display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-size:13px;letter-spacing:.03em;margin-bottom:18px;color:#c7d1d9}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-size:24px;color:#ecd49b;font-weight:400;letter-spacing:-.04em}
    .eot-startup-track{height:6px;background:#35536944;border:1px solid #8d9b9133;transform:skewX(-22deg);overflow:hidden}
    #eotLoadingFill{display:block;height:100%;width:100%;transform:scaleX(var(--progress,0));transform-origin:left;background:linear-gradient(90deg,#966b34,#d7b06a,#ffedb2);box-shadow:0 0 15px #dfb96e66}
    .eot-atlas-sectors{display:flex;justify-content:space-between;margin-top:18px;font-size:8px;color:#6c8599;letter-spacing:.13em;font-weight:600}
    .eot-atlas-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);left:0;right:0;text-align:center;font-size:8px;letter-spacing:.2em;color:#60758b}
    @keyframes eotAtlasBreathe{from{opacity:.5}to{opacity:1}}
    @keyframes eotAtlasRoute{to{stroke-dashoffset:-1024}}
    @media(max-height:650px){.eot-atlas-label{top:16px}.eot-atlas-loading{top:76%}.eot-atlas-sectors{margin-top:10px}.eot-startup-caption{margin-bottom:10px}.eot-atlas-footer{bottom:10px}}
    @media(orientation:landscape) and (max-height:600px){.eot-atlas-logo{top:48%;left:28%;width:min(50vh,240px)}.eot-atlas-city{left:72%;top:18%;width:48vw;height:44vh}.eot-atlas-loading{left:72%;top:65%;width:38vw}.eot-atlas-footer{display:none}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,#eotStartupSplash *,#eotStartupSplash *::before{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    // Let CSS cover the complete viewport, including the iOS home-indicator area.
    // screen.height can differ from the CSS viewport under display zoom or rotation.
    const buildings=[[95,133,42,61],[163,111,46,108],[242,98,50,155],[333,130,44,92],[407,154,56,66],[490,132,40,104]];
    const skyline=buildings.map(([x,y,w,h],i)=>{
      const base=y+h;
      return '<g data-atlas-tower="'+i+'"><path class="tower" d="M'+x+' '+y+'l'+w+' -22v'+h+'l-'+w+' 22Z"/><path class="side" d="M'+(x+w)+' '+(y-22)+'l22 13v'+h+'l-22 -13Z"/><path class="roof" d="M'+x+' '+y+'l'+w+' -22 22 13-'+w+' 22Z"/><path class="windows" d="M'+(x+10)+' '+(y+13)+'v'+(h-22)+'m12 -'+(h+4)+'v'+(h-22)+'m12 -'+(h+4)+'v'+(h-22)+'"/></g>';
    }).join('');
    el.innerHTML=`<div class="eot-atlas-glow" aria-hidden="true"></div><div class="eot-atlas-grid" aria-hidden="true"></div><div class="eot-atlas-border" aria-hidden="true"></div>
      <div class="eot-atlas-label">EKONOMİ &amp; TİCARET</div>
      <h1 class="eot-atlas-logo"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
      <div class="eot-atlas-city" aria-hidden="true"><svg viewBox="0 0 640 360"><path class="plan" d="M0 205 260 55 640 275M0 255 270 99 640 314M60 328 370 149 620 294M90 145 415 333M180 94 510 285M15 280 330 98M160 354 575 115"/><path class="plan" d="M50 230 160 166 255 221 145 285ZM283 261 384 203 465 250 364 308ZM434 299 543 236 607 273 499 337Z"/>${skyline}<path class="route" d="M-20 262 82 203 314 337 610 166 670 201"/><path class="route" style="animation-delay:-4s;stroke:#75c4de" d="M-20 184 300 368 660 160"/></svg></div>
      <div class="eot-atlas-loading" role="status" aria-label="Oyun yükleniyor"><div class="eot-startup-caption"><span id="eotSplashPhase">Yükleniyor…</span><span id="eotSplashPercent">%0</span></div><div class="eot-startup-track" aria-hidden="true"><i id="eotLoadingFill"></i></div><div class="eot-atlas-sectors" aria-hidden="true"><span>ARSA</span><span>GALERİ</span><span>İŞLETMELER</span><span>FİNANS</span></div></div><div class="eot-atlas-footer">EMPIRE OF TRADE</div>`;
    document.body.appendChild(el);
  }

  function removeSnapshotCover(){
    const el=document.getElementById('eotStartupSnapshotCover');
    if(el)el.remove();
  }

  function paint(v){
    const display=Math.max(0,Math.min(100,Number(v)||0));
    shown=Math.max(shown,display);
    const visible=Math.max(0,Math.min(100,Math.round(shown)));
    const phase=document.getElementById('eotSplashPhase');
    if(phase)phase.textContent=visible>=100?'Yüklendi':'Yükleniyor…';
    const fill=document.getElementById('eotLoadingFill');
    if(fill)fill.style.setProperty('--progress',String(shown/100));
    const pct=document.getElementById('eotSplashPercent');

    if(pct)pct.textContent='%'+visible;
    const splash=document.getElementById('eotStartupSplash');
    if(splash)splash.querySelectorAll('[data-atlas-tower]').forEach((tower,i)=>tower.classList.toggle('lit',visible>=(i+1)*14));
  }

  function finish(){
    if(removed||finishing)return;
    finishing=true;
    paint(100);
    setTimeout(()=>{
      const el=document.getElementById('eotStartupSplash');
      // Restore page layout while the cover is still opaque; fade only after paint.
      document.documentElement.classList.remove('eot-booting');
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(el){el.style.pointerEvents='none';el.setAttribute('aria-hidden','true');el.classList.add('eot-splash-out');}
        setTimeout(()=>{el&&el.remove();style.remove();removed=true},460);
      }));
    },230);
  }

  function tick(){
    if(removed||finishing)return;
    if(!ready){
      target=Math.min(94,target+(.35+Math.random()*.75));
    }else{
      target=100;
    }
    shown+=(target-shown)*.16;
    paint(shown);
    if(ready&&shown>=97){finish();return}
    requestAnimationFrame(tick);
  }

  window.EOTStartupSplash={
    progress(v){target=Math.max(target,Math.min(96,Math.round(Number(v)||0)))},
    ready(){if(ready)return;ready=true;target=100},
    failOpen(){ready=true;target=100;finish()}
  };

  if(document.body) mount();
  else document.addEventListener('DOMContentLoaded',mount,{once:true});
  requestAnimationFrame(tick);

  // Returning to the game must not create or retain a second branded loader.
  // Clean up any legacy cover restored with a page snapshot, including bfcache.
  window.addEventListener('pageshow',removeSnapshotCover);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')removeSnapshotCover();
  });

  // Herhangi bir beklenmeyen hata oyunu sonsuza kadar kapatmasın.
  setTimeout(()=>{if(!ready)window.EOTStartupSplash.ready()},9000);
})();