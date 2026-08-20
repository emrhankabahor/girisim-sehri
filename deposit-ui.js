/* Empire of Trade • 24 Saatlik Vadeli Hesap */
(function(){
  'use strict';
  if(window.__eotDepositUiLoaded)return;
  window.__eotDepositUiLoaded=true;

  const FIXED_RATE=0.99;
  const money=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  function getDeposits(){
    try{if(typeof deposits!=='undefined'&&Array.isArray(deposits))return deposits;}catch(_){}
    try{return JSON.parse(localStorage.getItem('gs113_deposits')||'[]')||[];}catch(_){return [];}
  }
  function stats(){
    const list=getDeposits();
    const principal=list.reduce((s,d)=>s+Number(d.amount||0),0);
    const earnings=list.reduce((s,d)=>s+Number(d.ret||0),0);
    const next=list.length?Math.min(...list.map(d=>Number(d.maturity||0)).filter(Boolean)):0;
    return {principal,earnings,next,count:list.length};
  }
  function installStyle(){
    if(document.getElementById('eot-deposit-ref-style'))return;
    const s=document.createElement('style');
    s.id='eot-deposit-ref-style';
    s.textContent=`
      #deposits .deposit-card,#deposits .portfolio-box{display:none!important}
      #deposits .eot-deposit-panel{position:relative;overflow:hidden;margin:14px 0 22px;padding:18px;border:1px solid rgba(104,180,232,.19);border-radius:24px;background:linear-gradient(145deg,#102b46 0%,#0b2239 62%,#091b2e 100%);box-shadow:0 18px 44px rgba(0,0,0,.2)}
      #deposits .eot-deposit-panel:before{content:"";position:absolute;right:-70px;top:-95px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(53,198,216,.16),rgba(59,130,246,.06) 48%,transparent 70%);pointer-events:none}
      #deposits .eot-deposit-title{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:15px}
      #deposits .eot-deposit-heading{min-width:0}
      #deposits .eot-deposit-heading small{display:block;color:#75d7e8;font-size:7px;font-weight:900;letter-spacing:.18em;margin-bottom:5px}
      #deposits .eot-deposit-heading h2{margin:0;color:#fff;font-size:22px;line-height:1.08}
      #deposits .eot-deposit-badges{display:flex;align-items:center;gap:7px}
      #deposits .eot-deposit-term{padding:7px 9px;border-radius:11px;border:1px solid rgba(91,200,220,.18);background:rgba(34,150,170,.10);color:#90e4ef;font-size:7px;font-weight:900;letter-spacing:.05em;white-space:nowrap}
      #deposits .eot-deposit-info{width:34px;height:34px;flex:0 0 34px;border-radius:11px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#eaf7ff;font-weight:900;font-size:16px}
      #deposits .eot-deposit-summary{position:relative;z-index:1;display:grid;grid-template-columns:1.15fr .85fr;gap:9px;margin:0 0 16px}
      #deposits .eot-deposit-stat{min-width:0;padding:12px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(5,18,31,.32)}
      #deposits .eot-deposit-stat-main{grid-row:span 2;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(145deg,rgba(26,68,104,.58),rgba(10,35,57,.52))}
      #deposits .eot-deposit-stat span{display:block;color:#8ea6bb;font-size:7px;font-weight:900;letter-spacing:.09em}
      #deposits .eot-deposit-stat b{display:block;margin-top:6px;color:#fff;font-size:12px;line-height:1.2;overflow-wrap:anywhere}
      #deposits .eot-deposit-stat-main b{font-size:18px;letter-spacing:-.025em}
      #deposits .eot-deposit-stat-earn b{color:#6fe0b7}
      #deposits .eot-deposit-form{position:relative;z-index:1;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:17px;background:rgba(4,16,28,.26)}
      #deposits .eot-deposit-field{margin:0}
      #deposits .eot-deposit-field label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;color:#a8bbce;font-size:8px;font-weight:900;letter-spacing:.1em}
      #deposits .eot-deposit-field label small{color:#6fd7e8;font-size:7px;letter-spacing:.04em}
      #deposits .eot-deposit-field input{width:100%;box-sizing:border-box;min-height:58px;padding:0 16px;border:1.5px solid rgba(185,205,228,.68);border-radius:15px;background:#f7f9fc;color:#07111d;font-size:18px;font-weight:850;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
      #deposits .eot-deposit-field input:focus{border-color:#4fc7db;box-shadow:0 0 0 3px rgba(79,199,219,.12)}
      #deposits .eot-deposit-note{margin:11px 2px 0;color:#8fa8be;font-size:9px;line-height:1.5;text-align:center}
      #deposits .eot-deposit-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
      #deposits .eot-deposit-actions button{min-height:54px;border:0;border-radius:15px;color:#fff;font-size:14px;font-weight:900;box-shadow:0 7px 18px rgba(0,0,0,.16)}
      #deposits .eot-deposit-put{background:linear-gradient(135deg,#29b950,#65d66d)}
      #deposits .eot-deposit-take{background:linear-gradient(135deg,#2374ca,#438fe9)}
      @media(max-width:430px){#deposits .eot-deposit-panel{padding:15px}#deposits .eot-deposit-heading h2{font-size:20px}#deposits .eot-deposit-summary{grid-template-columns:1.08fr .92fr;gap:7px}#deposits .eot-deposit-stat{padding:10px}#deposits .eot-deposit-stat-main b{font-size:16px}#deposits .eot-deposit-stat b{font-size:10px}#deposits .eot-deposit-form{padding:11px}#deposits .eot-deposit-actions{gap:8px}}
    `;
    document.head.appendChild(s);
  }

  function formatDateTime(ts){
    if(!ts)return '—';
    return new Date(ts).toLocaleString('tr-TR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }
  function refresh(panel){
    if(!panel)return;
    if(typeof window.processMaturedDeposits==='function')window.processMaturedDeposits(false);
    const st=stats();
    const balance=panel.querySelector('[data-dep-balance]');
    const earn=panel.querySelector('[data-dep-earn]');
    const maturity=panel.querySelector('[data-dep-maturity]');
    if(balance)balance.textContent=money(st.principal);
    if(earn)earn.textContent=money(st.earnings);
    if(maturity)maturity.textContent=formatDateTime(st.next);
  }

  function mount(){
    const screen=document.getElementById('deposits');
    if(!screen)return;
    installStyle();
    const old=screen.querySelector('.eot-deposit-simple'); if(old)old.remove();
    let panel=screen.querySelector('.eot-deposit-panel');
    if(!panel){
      panel=document.createElement('div');
      panel.className='eot-deposit-panel';
      panel.innerHTML=`
        <div class="eot-deposit-title">
          <div class="eot-deposit-heading"><small>GÜVENLİ BİRİKİM</small><h2>Vadeli Hesap</h2></div>
          <div class="eot-deposit-badges"><span class="eot-deposit-term">24 SAAT • %0,99</span><button class="eot-deposit-info" type="button" aria-label="Bilgi">i</button></div>
        </div>
        <div class="eot-deposit-summary">
          <div class="eot-deposit-stat eot-deposit-stat-main"><span>HESAP BAKİYESİ</span><b data-dep-balance>₺0,00</b></div>
          <div class="eot-deposit-stat eot-deposit-stat-earn"><span>TOPLAM KAZANÇ</span><b data-dep-earn>₺0,00</b></div>
          <div class="eot-deposit-stat"><span>GELİR ZAMANI</span><b data-dep-maturity>—</b></div>
        </div>
        <div class="eot-deposit-form">
          <div class="eot-deposit-field"><label for="eotDepositAmount"><span>YATIRILACAK TUTAR</span><small>%0,99 GETİRİ</small></label><input id="eotDepositAmount" type="number" min="1" step="1000" inputmode="decimal" placeholder="Tutar girmek için dokun"></div>
          <div class="eot-deposit-note">Para yatırdığın tarih ve saatten tam 24 saat sonra ana para + %0,99 faiz vadeli hesap bakiyene eklenir. Nakit bakiyene aktarmak için Para Çek butonunu kullan.</div>
          <div class="eot-deposit-actions"><button class="eot-deposit-put" type="button">Para Yatır</button><button class="eot-deposit-take" type="button">Para Çek</button></div>
        </div>`;
      const portfolio=screen.querySelector('.portfolio-box');
      if(portfolio)screen.insertBefore(panel,portfolio);else screen.appendChild(panel);

      panel.querySelector('.eot-deposit-info').addEventListener('click',()=>{
        const msg='Vadeli hesap 24 saat çalışır. Süre sonunda ana para ve %0,99 faiz vadeli hesap bakiyende kalır. Nakit hesaba geçirmek için Para Çek butonunu kullan.';
        if(typeof toast==='function')toast(msg);else alert(msg);
      });
      panel.querySelector('.eot-deposit-put').addEventListener('click',()=>{
        const amount=Number(panel.querySelector('#eotDepositAmount').value||0);
        if(!Number.isFinite(amount)||amount<=0){if(typeof toast==='function')toast('Geçerli bir tutar gir');else alert('Geçerli bir tutar gir');return;}
        if(typeof window.open24HourDeposit==='function')window.open24HourDeposit('eotDepositAmount');
        else if(typeof window.openDeposit==='function')window.openDeposit(1,FIXED_RATE,'eotDepositAmount');
        else {if(typeof toast==='function')toast('Vadeli hesap sistemi henüz hazır değil');return;}
        refresh(panel);
      });
      panel.querySelector('.eot-deposit-take').addEventListener('click',()=>{
        if(typeof window.withdrawAllDepositsEarly==='function')window.withdrawAllDepositsEarly();
        else if(typeof toast==='function')toast('Para çekme sistemi henüz hazır değil');
        refresh(panel);
      });
    }
    refresh(panel);
  }

  window.addEventListener('eot:deposit-updated',()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p)refresh(p)});
  window.addEventListener('hashchange',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)mount()});
  mount();
  setTimeout(mount,120);
  setInterval(()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p&&location.hash==='#deposits'&&!document.hidden)refresh(p)},30000);
})();
