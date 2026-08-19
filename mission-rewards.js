/* Empire of Trade • Görevler + tek seferlik ödül sistemi */
(function(){
  'use strict';
  if(window.__eotMissionRewards)return;
  window.__eotMissionRewards=true;

  const MISSIONS=[
    {id:'first_trade',title:'İlk işlemini yap',desc:'Borsa, kripto veya altın tarafında ilk alım/satım işlemini gerçekleştir.',difficulty:'Kolay',reward:5000,progress:()=>countTrades(),goal:1,target:'#finance'},
    {id:'first_asset',title:'İlk varlığını satın al',desc:'Arsa, gayrimenkul veya araç satın alarak portföyünü başlat.',difficulty:'Kolay',reward:10000,progress:()=>assets().length,goal:1,target:'#market'},
    {id:'first_company',title:'İlk şirketini kur',desc:'Bir sektör seç ve ilk şirketini faaliyete geçir.',difficulty:'Kolay',reward:15000,progress:()=>companies().length,goal:1,target:'#business'},
    {id:'cash_250k',title:'₺250.000 nakde ulaş',desc:'Nakit rezervini büyüt ve işletme fırsatları için hazırlık yap.',difficulty:'Kolay',reward:10000,progress:()=>cashNow(),goal:250000,target:'#home'},
    {id:'two_assets',title:'2 varlığa sahip ol',desc:'Portföyünü çeşitlendirmek için iki farklı varlık edin.',difficulty:'Orta',reward:20000,progress:()=>assets().length,goal:2,target:'#market'},
    {id:'first_employee',title:'İlk çalışanını işe al',desc:'Şirketine ilk personeli alarak operasyon gücünü artır.',difficulty:'Orta',reward:25000,progress:()=>employeeCount(),goal:1,target:'#business'},
    {id:'credit_60',title:'Kredi puanını 60 yap',desc:'Finansal disiplinini geliştir ve kredi puanını yükselt.',difficulty:'Orta',reward:20000,progress:()=>creditNow(),goal:60,target:'#finance'},
    {id:'millionaire',title:'₺1.000.000 net servete ulaş',desc:'Nakit, yatırım ve varlıklarını büyüterek ilk büyük servet eşiğini geç.',difficulty:'Zor',reward:50000,progress:()=>netWorth(),goal:1000000,target:'#home'}
  ];

  function accountId(){
    try{const u=typeof currentAccount==='function'?currentAccount():null;return u&&u.id?String(u.id):'guest'}catch(e){return 'guest'}
  }
  function key(){return 'eot_mission_rewards_v1_'+accountId()}
  function claimed(){try{return JSON.parse(localStorage.getItem(key())||'{}')}catch(e){return {}}}
  function saveClaimed(v){try{localStorage.setItem(key(),JSON.stringify(v))}catch(e){}}
  function assets(){try{return typeof ownedAssets!=='undefined'&&Array.isArray(ownedAssets)?ownedAssets:[]}catch(e){return []}}
  function companies(){try{return typeof sim!=='undefined'&&Array.isArray(sim.companies)?sim.companies:[]}catch(e){return []}}
  function employeeCount(){
    try{
      const cs=companies();
      const perCompany=cs.reduce((n,c)=>n+(Array.isArray(c.employees)?c.employees.length:0),0);
      if(perCompany)return perCompany;
      return typeof sim!=='undefined'&&Array.isArray(sim.employees)?sim.employees.length:0;
    }catch(e){return 0}
  }
  function countTrades(){try{return typeof tx!=='undefined'&&Array.isArray(tx)?tx.filter(x=>x&&x.kind==='trade').length:0}catch(e){return 0}}
  function cashNow(){try{return typeof cash!=='undefined'?Number(cash||0):Number(localStorage.getItem('gs124_cash')||0)}catch(e){return 0}}
  function creditNow(){try{return typeof creditScore!=='undefined'?Number(creditScore||0):Number(localStorage.getItem('gs111_credit')||50)}catch(e){return 50}}
  function portfolioValue(){
    try{
      let value=0;
      if(typeof ASSETS!=='undefined'&&typeof pf!=='undefined')Object.keys(ASSETS).forEach(sym=>{const p=pf[sym];if(p&&Number(p.qty)>0)value+=Number(p.qty)*Number(ASSETS[sym].sell||ASSETS[sym].buy||0)});
      return value;
    }catch(e){return 0}
  }
  function debtNow(){try{return typeof debt==='function'?Number(debt()||0):0}catch(e){return 0}}
  function netWorth(){
    const assetValue=assets().reduce((s,a)=>s+Math.max(0,Number(a&&a.price||0)),0);
    return Math.max(0,cashNow()+assetValue+portfolioValue()-debtNow());
  }
  function money(n){return '₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}
  function complete(m){return Number(m.progress()||0)>=Number(m.goal||1)}
  function pct(m){return Math.max(0,Math.min(100,Math.round((Number(m.progress()||0)/Math.max(1,Number(m.goal||1)))*100)))}

  function ensureStyle(){
    if(document.getElementById('eot-mission-reward-style'))return;
    const s=document.createElement('style');s.id='eot-mission-reward-style';s.textContent=`
      #eotNextMove{display:none!important}
      .eot-mission-hub{margin:14px 0;padding:15px;border:1px solid rgba(97,177,223,.18);border-radius:20px;background:linear-gradient(145deg,rgba(15,43,68,.96),rgba(8,27,46,.96))}
      .eot-mission-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px}.eot-mission-head h3{margin:0;font-size:15px}.eot-mission-head p{margin:4px 0 0;color:#8fa5ba;font-size:8px}.eot-mission-total{font-size:8px;color:#75d7ee;font-weight:900;white-space:nowrap}
      .eot-mission-card{padding:12px 0;border-top:1px solid rgba(255,255,255,.07)}.eot-mission-card:first-of-type{border-top:0}.eot-mission-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.eot-mission-top b{font-size:10.5px}.eot-mission-top small{display:block;color:#859bb0;font-size:7.5px;margin-top:3px;line-height:1.4}.eot-mission-reward{font-size:9px;font-weight:900;color:#77e5b6;white-space:nowrap}
      .eot-mission-meta{display:flex;justify-content:space-between;gap:8px;margin-top:8px;font-size:7.5px;color:#8ca2b8}.eot-diff{padding:3px 6px;border-radius:999px;background:rgba(255,255,255,.05)}
      .eot-mission-bar{height:6px;margin-top:6px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}.eot-mission-bar i{display:block;height:100%;background:linear-gradient(90deg,#36b7e8,#42d39a);border-radius:999px}
      .eot-mission-actions{display:flex;justify-content:flex-end;margin-top:8px}.eot-mission-actions a,.eot-mission-actions button{border:0;border-radius:10px;padding:8px 10px;font-size:7.5px;font-weight:900}.eot-mission-actions a{background:#153754;color:#ccefff}.eot-mission-actions button{background:rgba(52,211,153,.16);color:#8ff0c9}.eot-mission-actions button[disabled]{opacity:.45}
      .eot-mission-done{opacity:.72}.eot-mission-done .eot-mission-reward{color:#9bb0c2}
    `;document.head.appendChild(s)
  }

  function claim(id){
    const m=MISSIONS.find(x=>x.id===id);if(!m||!complete(m))return false;
    const c=claimed();if(c[id])return false;
    try{
      if(typeof cash==='undefined')return false;
      cash=Number(cash||0)+m.reward;
      if(typeof tx!=='undefined'&&Array.isArray(tx))tx.unshift({t:Date.now(),kind:'mission_reward',type:id,sym:m.title,total:m.reward});
      c[id]={t:Date.now(),reward:m.reward};saveClaimed(c);
      if(typeof save==='function')save();
      if(typeof saveAccountCareer==='function'&&typeof currentAccount==='function'){const u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}
      if(typeof render==='function')render();
      if(typeof renderGameExtras==='function')renderGameExtras();
      if(typeof toast==='function')toast('Görev ödülü • +'+money(m.reward));
      renderAll();return true;
    }catch(e){console.warn('Görev ödülü alınamadı:',e);return false}
  }
  window.eotClaimMission=claim;

  function cardHtml(m,c){
    const done=complete(m),taken=!!c[m.id],p=pct(m),current=Math.min(Number(m.progress()||0),Number(m.goal||1));
    let action='';
    if(taken)action='<button disabled>✓ ALINDI</button>';
    else if(done)action='<button onclick="eotClaimMission(\''+m.id+'\')">ÖDÜLÜ AL</button>';
    else action='<a href="'+m.target+'">GİT</a>';
    return '<div class="eot-mission-card '+(taken?'eot-mission-done':'')+'"><div class="eot-mission-top"><div><b>'+(taken?'✓ ':'')+m.title+'</b><small>'+m.desc+'</small></div><span class="eot-mission-reward">+'+money(m.reward)+'</span></div><div class="eot-mission-meta"><span class="eot-diff">'+m.difficulty+'</span><span>'+Math.round(current).toLocaleString('tr-TR')+' / '+Number(m.goal).toLocaleString('tr-TR')+'</span></div><div class="eot-mission-bar"><i style="width:'+p+'%"></i></div><div class="eot-mission-actions">'+action+'</div></div>';
  }

  function renderInto(container,compact){
    if(!container)return;
    const c=claimed(),list=compact?MISSIONS.filter(m=>!c[m.id]).slice(0,3):MISSIONS;
    const taken=MISSIONS.filter(m=>c[m.id]).length;
    container.innerHTML='<div class="eot-mission-head"><div><h3>🎯 Görevler</h3><p>Görevleri tamamla, ödülleri topla ve imparatorluğunu büyüt.</p></div><span class="eot-mission-total">'+taken+'/'+MISSIONS.length+' tamamlandı</span></div>'+list.map(m=>cardHtml(m,c)).join('');
  }

  function mountHome(){
    const home=document.getElementById('home');if(!home)return;
    let box=document.getElementById('eotHomeMissions');
    if(!box){box=document.createElement('section');box.id='eotHomeMissions';box.className='eot-mission-hub';const profile=home.querySelector('.eot-profile');if(profile)profile.insertAdjacentElement('afterend',box);else home.prepend(box)}
    renderInto(box,true);
  }
  function mountMissionScreen(){
    const screen=document.getElementById('missions');if(!screen)return;
    let box=document.getElementById('eotMissionScreenHub');
    if(!box){box=document.createElement('section');box.id='eotMissionScreenHub';box.className='eot-mission-hub';const head=screen.querySelector('.panel-head');if(head)head.insertAdjacentElement('afterend',box);else screen.prepend(box)}
    renderInto(box,false);
  }
  function renderAll(){ensureStyle();mountHome();mountMissionScreen()}
  function schedule(){setTimeout(renderAll,40)}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.addEventListener('hashchange',schedule,true);window.addEventListener('pageshow',schedule);
  setInterval(function(){if(document.visibilityState!=='hidden')renderAll()},3500);
})();
