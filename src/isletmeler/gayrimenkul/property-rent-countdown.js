/* Empire of Trade • Gayrimenkul kira bekleme kutusunda canlı geri sayım */
(function(){
  'use strict';
  if(window.__eotPropertyRentCountdown)return;
  window.__eotPropertyRentCountdown=true;

  function ensureStyle(){
    if(document.getElementById('eot-property-rent-countdown-style'))return;
    const s=document.createElement('style');
    s.id='eot-property-rent-countdown-style';
    s.textContent=`
      .eot-rent-action-row{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;align-items:stretch!important;width:min(100%,270px)!important;max-width:270px!important}
      .eot-rent-action-row>button{width:100%!important;min-width:0!important;min-height:54px!important;height:54px!important;margin:0!important;border-radius:14px!important;padding:7px 9px!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important}
      .eot-rent-action-row>button.eot-rent-waiting{flex-direction:column!important;gap:3px!important;line-height:1!important}
      .eot-rent-action-row>button.eot-rent-sale{font-weight:800!important;line-height:1.1!important}
      button.eot-rent-waiting .eot-rent-label{font:inherit!important;font-weight:800!important;font-size:10.5px!important;white-space:nowrap!important}
      button.eot-rent-waiting .eot-rent-countdown{font-size:10.5px!important;font-weight:900!important;letter-spacing:.1em!important;color:#9fc6e8!important;opacity:1!important;font-variant-numeric:tabular-nums!important;white-space:nowrap!important}
      button.eot-rent-ready .eot-rent-countdown{color:#53ddb0!important}
      @media(max-width:390px){.eot-rent-action-row{width:min(100%,250px)!important;max-width:250px!important;gap:7px!important}.eot-rent-action-row>button{min-height:52px!important;height:52px!important;padding:6px 7px!important}button.eot-rent-waiting .eot-rent-label{font-size:10px!important}button.eot-rent-waiting .eot-rent-countdown{font-size:10px!important}}
    `;
    document.head.appendChild(s);
  }

  function format(ms){
    const total=Math.max(0,Math.ceil(ms/1000));
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  function assetForButton(btn){
    const raw=String(btn.getAttribute('onclick')||'');
    const match=raw.match(/collectRent\((\d+)\)/);
    if(!match)return null;
    const index=Number(match[1]);
    try{
      if(typeof ownedAssets==='undefined'||!Array.isArray(ownedAssets))return null;
      const asset=ownedAssets[index];
      return asset&&asset.type==='Gayrimenkul'?asset:null;
    }catch(e){return null}
  }

  function normalizeActionRow(btn){
    const parent=btn.parentElement;
    if(!parent)return;
    parent.classList.add('eot-rent-action-row');
    [...parent.children].forEach(function(el){
      if(el===btn)return;
      if(el.tagName==='BUTTON')el.classList.add('eot-rent-sale');
    });
  }

  function paint(btn,asset,now){
    const readyAt=Number(asset.rentReady||0);
    if(!readyAt)return;
    normalizeActionRow(btn);
    const remaining=readyAt-now;
    const ready=remaining<=0;
    btn.classList.add('eot-rent-waiting');
    btn.classList.toggle('eot-rent-ready',ready);
    let label=btn.querySelector('.eot-rent-label');
    let timer=btn.querySelector('.eot-rent-countdown');
    if(!label||!timer){
      btn.textContent='';
      label=document.createElement('span');
      label.className='eot-rent-label';
      timer=document.createElement('span');
      timer.className='eot-rent-countdown';
      btn.append(label,timer);
    }
    label.textContent=ready?'Kira Hazır':'Kira Bekleniyor';
    timer.textContent=ready?'HAZIR':format(remaining);
  }

  function tick(){
    if(document.hidden)return;
    ensureStyle();
    const buttons=document.querySelectorAll('button[onclick*="collectRent("]');
    if(!buttons.length)return;
    const now=Date.now();
    buttons.forEach(btn=>{
      const asset=assetForButton(btn);
      if(asset)paint(btn,asset,now);
    });
  }

  let timer=0;
  function start(){
    if(timer)return;
    tick();
    timer=setInterval(tick,1000);
  }
  function stop(){if(timer){clearInterval(timer);timer=0}}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('hashchange',tick,true);
  window.addEventListener('pageshow',tick);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()});
  document.addEventListener('eot:route-rendered',tick);
  window.eotRefreshRentCountdown=tick;
})();
