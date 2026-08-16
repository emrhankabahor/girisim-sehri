/* Empire of Trade • Sade Vadeli Hesap Arayüzü */
(function(){
  'use strict';
  if(window.__eotDepositUiLoaded)return;
  window.__eotDepositUiLoaded=true;

  const FIXED_RATE=0.99;

  function installStyle(){
    if(document.getElementById('eot-deposit-simple-style'))return;
    const s=document.createElement('style');
    s.id='eot-deposit-simple-style';
    s.textContent=`
      #deposits .eot-deposit-simple{margin:14px 0;padding:16px;border:1px solid rgba(96,165,250,.2);border-radius:20px;background:linear-gradient(145deg,#0e2236,#0a1a2a)}
      #deposits .eot-deposit-simple label{display:block;margin:12px 0 6px;color:#9ab0c5;font-size:10px;font-weight:800;letter-spacing:.06em}
      #deposits .eot-deposit-simple input,#deposits .eot-deposit-simple select{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid rgba(148,190,224,.18);border-radius:13px;background:#0b1f32;color:#f7fbff;font-size:14px;outline:none}
      #deposits .eot-deposit-rate{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:12px 14px;border-radius:13px;background:rgba(59,130,246,.08);border:1px solid rgba(96,165,250,.16)}
      #deposits .eot-deposit-rate span{color:#91a6ba;font-size:10px;font-weight:800}#deposits .eot-deposit-rate b{font-size:15px;color:#77e3bf}
      #deposits .eot-deposit-open{display:block;width:100%;margin-top:14px;padding:13px 14px;border:0;border-radius:13px;background:#2f6fed;color:#fff;font-size:12px;font-weight:900;text-align:center;text-decoration:none}
    `;
    document.head.appendChild(s);
  }

  function mount(){
    const screen=document.getElementById('deposits');
    if(!screen||screen.dataset.eotDepositSimple==='1')return;
    screen.dataset.eotDepositSimple='1';
    installStyle();

    screen.querySelectorAll('.deposit-card').forEach(el=>el.remove());

    const portfolio=screen.querySelector('.portfolio-box');
    const box=document.createElement('div');
    box.className='eot-deposit-simple';
    box.innerHTML=`
      <label for="eotDepositAmount">YATIRILACAK TUTAR</label>
      <input id="eotDepositAmount" type="number" min="1" step="1000" inputmode="decimal" placeholder="Tutar gir">
      <label for="eotDepositMonths">VADE</label>
      <select id="eotDepositMonths">
        <option value="1">1 Ay</option><option value="2">2 Ay</option><option value="3">3 Ay</option>
        <option value="4">4 Ay</option><option value="5">5 Ay</option><option value="6">6 Ay</option>
      </select>
      <div class="eot-deposit-rate"><span>SABİT FAİZ ORANI</span><b>%0,99</b></div>
      <a class="eot-deposit-open" href="#deposit_success" id="eotOpenDepositBtn">Vadeli Hesap Aç</a>`;

    if(portfolio)screen.insertBefore(box,portfolio);else screen.appendChild(box);

    const btn=box.querySelector('#eotOpenDepositBtn');
    btn.addEventListener('click',function(e){
      const amountEl=document.getElementById('eotDepositAmount');
      const monthsEl=document.getElementById('eotDepositMonths');
      const amount=Number(amountEl&&amountEl.value||0);
      const months=Math.max(1,Math.min(6,Number(monthsEl&&monthsEl.value||1)));
      if(!Number.isFinite(amount)||amount<=0){
        e.preventDefault();
        if(typeof toast==='function')toast('Geçerli bir tutar gir');
        else alert('Geçerli bir tutar gir');
        return false;
      }
      if(typeof window.openDeposit!=='function'){
        e.preventDefault();
        if(typeof toast==='function')toast('Vadeli hesap sistemi henüz hazır değil');
        return false;
      }
      return window.openDeposit(months,FIXED_RATE,'eotDepositAmount');
    });
  }

  window.addEventListener('hashchange',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)mount()});
  mount();
  setTimeout(mount,120);
})();
