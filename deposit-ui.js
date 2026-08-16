/* Empire of Trade • 24 Saatlik Vadeli Hesap */
(function(){
  'use strict';
  if(window.__eotDepositUiLoaded)return;
  window.__eotDepositUiLoaded=true;

  const FIXED_RATE=0.99;
  const money=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  function getDeposits(){
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
      #deposits .eot-deposit-panel{margin:14px 0 22px;padding:22px;border:1px solid rgba(126,166,204,.2);border-radius:24px;background:linear-gradient(145deg,#122b46,#0c2035);box-shadow:0 18px 45px rgba(0,0,0,.18)}
      #deposits .eot-deposit-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
      #deposits .eot-deposit-title h2{margin:0;color:#fff;font-size:24px;line-height:1.1}
      #deposits .eot-deposit-info{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#edf4fa;color:#102238;font-weight:900;font-size:18px}
      #deposits .eot-deposit-summary{border-top:1px solid rgba(255,255,255,.12);padding-top:14px;margin-bottom:18px}
      #deposits .eot-deposit-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 0;color:#fff}
      #deposits .eot-deposit-row span{font-size:13px;font-weight:800;color:#d8e5f0}#deposits .eot-deposit-row b{font-size:14px;text-align:right}
      #deposits .eot-deposit-field{margin-top:14px}
      #deposits .eot-deposit-field label{display:block;margin:0 0 7px;color:#a8bbce;font-size:10px;font-weight:900;letter-spacing:.08em}
      #deposits .eot-deposit-field input{width:100%;box-sizing:border-box;min-height:58px;padding:0 17px;border:2px solid rgba(186,204,229,.65);border-radius:17px;background:#f7f9fc;color:#08111d;font-size:18px;font-weight:800;outline:none}
      #deposits .eot-deposit-note{margin-top:13px;color:#8fa8be;font-size:10px;line-height:1.45;text-align:center}
      #deposits .eot-deposit-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
      #deposits .eot-deposit-actions button{min-height:56px;border:0;border-radius:16px;color:#fff;font-size:15px;font-weight:900;box-shadow:0 5px 0 rgba(0,0,0,.16)}
      #deposits .eot-deposit-put{background:linear-gradient(135deg,#35b94b,#73d873)}#deposits .eot-deposit-take{background:linear-gradient(135deg,#2475c9,#4d92e5)}
      @media(max-width:430px){#deposits .eot-deposit-panel{padding:17px}#deposits .eot-deposit-title h2{font-size:21px}#deposits .eot-deposit-row span{font-size:12px}#deposits .eot-deposit-row b{font-size:12px}#deposits .eot-deposit-actions{gap:9px}}
    `;
    document.head.appendChild(s);
  }

  function formatDateTime(ts){
    if(!ts)return '—';
    return new Date(ts).toLocaleString('tr-TR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
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
        <div class="eot-deposit-title"><h2>Vadeli Hesap</h2><button class="eot-deposit-info" type="button" aria-label="Bilgi">i</button></div>
        <div class="eot-deposit-summary">
          <div class="eot-deposit-row"><span>Hesap Bakiyesi</span><b data-dep-balance>₺0,00</b></div>
          <div class="eot-deposit-row"><span>Toplam Kazanç</span><b data-dep-earn>₺0,00</b></div>
          <div class="eot-deposit-row"><span>Gelir Zamanı</span><b data-dep-maturity>—</b></div>
        </div>
        <div class="eot-deposit-field"><label for="eotDepositAmount">YATIRILACAK TUTAR</label><input id="eotDepositAmount" type="number" min="1" step="1000" inputmode="decimal" placeholder="Tutar girmek için dokun"></div>
        <div class="eot-deposit-note">Para yatırdığın tarih ve saatten tam 24 saat sonra ana para + %0,99 faiz otomatik olarak nakit bakiyene aktarılır.</div>
        <div class="eot-deposit-actions"><button class="eot-deposit-put" type="button">Para Yatır</button><button class="eot-deposit-take" type="button">Para Çek</button></div>`;
      const portfolio=screen.querySelector('.portfolio-box');
      if(portfolio)screen.insertBefore(panel,portfolio);else screen.appendChild(panel);

      panel.querySelector('.eot-deposit-info').addEventListener('click',()=>{
        const msg='Vadeli hesap otomatik olarak 24 saat çalışır. Süre sonunda yatırdığın tutar ve %0,99 faiz nakit bakiyene aktarılır.';
        if(typeof toast==='function')toast(msg);else alert(msg);
      });
      panel.querySelector('.eot-deposit-put').addEventListener('click',()=>{
        const amount=Number(panel.querySelector('#eotDepositAmount').value||0);
        if(!Number.isFinite(amount)||amount<=0){if(typeof toast==='function')toast('Geçerli bir tutar gir');else alert('Geçerli bir tutar gir');return;}
        if(typeof window.open24HourDeposit==='function')window.open24HourDeposit('eotDepositAmount');
        else if(typeof window.openDeposit==='function')window.openDeposit(1,FIXED_RATE,'eotDepositAmount');
        else {if(typeof toast==='function')toast('Vadeli hesap sistemi henüz hazır değil');return;}
        setTimeout(()=>refresh(panel),80);
      });
      panel.querySelector('.eot-deposit-take').addEventListener('click',()=>{
        if(typeof window.withdrawAllDepositsEarly==='function')window.withdrawAllDepositsEarly();
        else if(typeof toast==='function')toast('Para çekme sistemi henüz hazır değil');
        setTimeout(()=>refresh(panel),80);
      });
    }
    refresh(panel);
  }

  window.addEventListener('eot:deposit-updated',()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p)refresh(p)});
  window.addEventListener('hashchange',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)mount()});
  mount();
  setTimeout(mount,120);
  setInterval(()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p)refresh(p)},30000);
})();
