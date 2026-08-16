/* Arayüz görünürlük, profil rehberi ve yatırım toplam tutar yamaları. */
(function(){
  function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,' ').trim()}

  function hideStockResearch(){
    document.querySelectorAll('a,button,[role="button"],.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,.quick-btn,li').forEach(el=>{
      const t=norm(el.textContent);
      if(t.includes('hisse arastirma')||t.includes('hisse arastir')||t.includes('hisse analizi')){
        const card=el.closest('.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,li')||el;
        card.style.setProperty('display','none','important');
        card.setAttribute('data-stock-research-hidden','1');
      }
    });
  }

  function upgradeProfileGuide(){
    const profile=document.getElementById('profile');
    if(profile){
      const characterCard=[...profile.querySelectorAll('.menu-card')].find(card=>norm(card.textContent).includes('karakter'));
      if(characterCard && characterCard.dataset.reputationGuide!=='1'){
        characterCard.dataset.reputationGuide='1';
        characterCard.setAttribute('href','#character');
        const icon=characterCard.querySelector('.iconbox');
        const title=characterCard.querySelector('h4');
        const text=characterCard.querySelector('p');
        if(icon) icon.textContent='🏆';
        if(title) title.textContent='Temel Bilgiler';
        if(text) text.textContent='İtibar kazanma, seviye ve kariyer rehberi.';
      }
      const subtitle=profile.querySelector('.panel-title p');
      if(subtitle && norm(subtitle.textContent).includes('karakter')) subtitle.textContent='İtibar, kariyer gelişimi ve sahip olduğun varlıklar';
    }

    const guide=document.getElementById('character');
    if(guide && guide.dataset.reputationGuide!=='1'){
      guide.dataset.reputationGuide='1';
      const title=guide.querySelector('.panel-title h2');
      const subtitle=guide.querySelector('.panel-title p');
      if(title) title.textContent='Temel Bilgiler';
      if(subtitle) subtitle.textContent='İtibar, seviye ve kariyer gelişim rehberi';

      const hero=guide.querySelector('.character-hero');
      if(hero){
        hero.innerHTML='<div class="avatar big">🏆</div><div><b>İtibar & Kariyer Rehberi</b><span>Empire of Trade temel oyun bilgileri</span></div>';
      }

      const metric=guide.querySelector('.metric-grid');
      if(metric) metric.remove();

      guide.querySelectorAll('.info-card').forEach(el=>el.remove());

      const cards=document.createElement('div');
      cards.className='profile-guide-list';
      cards.innerHTML=`
        <div class="info-card"><strong>🏆 İtibar nasıl kazanılır?</strong><p>Kredilerini zamanında öde, işletmelerini düzenli yönet, üretim ve ticaret yap, başarılı projeler tamamla ve finansal yükümlülüklerini aksatma. Güvenilir bir iş geçmişi itibarını yükseltir.</p></div>
        <div class="info-card"><strong>⚠️ İtibar neden düşer?</strong><p>Geciken kredi ödemeleri, kontrolsüz borçlanma, başarısız işletme yönetimi ve ödeme yükümlülüklerini yerine getirmemek itibarını olumsuz etkileyebilir.</p></div>
        <div class="info-card"><strong>📈 Seviye ve XP</strong><p>Ticaret, yatırım, şirket yönetimi ve görevlerde ilerledikçe XP kazanırsın. Seviye yükseldikçe daha büyük iş fırsatlarına ve gelişmiş sistemlere erişim için kariyerin güçlenir.</p></div>
        <div class="info-card"><strong>💳 Kredi puanı</strong><p>Düzenli ödeme geçmişi kredi puanının temelidir. Daha yüksek kredi puanı; daha iyi banka teklifleri, daha yüksek limitler ve daha avantajlı finansman koşulları için önemlidir.</p></div>
        <div class="info-card"><strong>💰 Nakit akışı</strong><p>Sadece toplam servete odaklanma. Aylık gelirinin giderlerini karşılayabildiğinden emin ol. Güçlü nakit akışı yeni yatırımlar yaparken seni borç krizinden korur.</p></div>
        <div class="info-card"><strong>🏢 Sağlam büyüme stratejisi</strong><p>Küçük ve sürdürülebilir adımlarla ilerle. Önce gelir üreten varlıklar oluştur, ardından şirketlerini büyüt ve büyük yatırımlara geçmeden önce yeterli nakit rezervi bırak.</p></div>`;
      guide.appendChild(cards);
    }
  }

  function parseTry(text){
    let s=String(text||'').replace(/\s/g,'').replace(/₺/g,'').replace(/[^0-9,.-]/g,'');
    if(!s)return 0;
    if(s.includes(',')) s=s.replace(/\./g,'').replace(',','.');
    else{
      const parts=s.split('.');
      if(parts.length>2 || (parts.length===2 && parts[1].length===3)) s=parts.join('');
    }
    const n=Number(s);
    return Number.isFinite(n)?n:0;
  }

  function formatTry(n){
    return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }

  function ensureInvestmentTotalStyle(){
    if(document.getElementById('eot-investment-total-style'))return;
    const st=document.createElement('style');
    st.id='eot-investment-total-style';
    st.textContent=`
      .eot-investment-total{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 2px}
      .eot-investment-total>div{min-width:0;padding:10px 11px;border-radius:12px;border:1px solid rgba(148,190,224,.14);background:rgba(12,34,54,.72)}
      .eot-investment-total span{display:block;font-size:7px;letter-spacing:.08em;color:#8fa6bb;font-weight:800;margin-bottom:4px}
      .eot-investment-total b{display:block;font-size:11px;color:#f7fbff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .eot-investment-total>div:first-child b{color:#74e6b6}
      .eot-investment-total>div:last-child b{color:#8fdcff}
      @media(max-width:390px){.eot-investment-total{gap:6px}.eot-investment-total>div{padding:9px}.eot-investment-total b{font-size:10px}}
    `;
    document.head.appendChild(st);
  }

  function updateInvestmentTotal(input){
    if(!input||!input.id||!input.id.startsWith('tradeqty_'))return;
    const sym=input.id.slice('tradeqty_'.length);
    const qty=Math.max(0,Number(input.value)||0);
    const buyEl=document.getElementById('buy_'+sym);
    const sellEl=document.getElementById('sell_'+sym);
    const buy=parseTry(buyEl&&buyEl.textContent);
    const sell=parseTry(sellEl&&sellEl.textContent);
    const box=document.getElementById('trade_total_'+sym);
    if(!box)return;
    const buyOut=box.querySelector('[data-buy-total]');
    const sellOut=box.querySelector('[data-sell-total]');
    if(buyOut)buyOut.textContent=formatTry(qty*buy);
    if(sellOut)sellOut.textContent=formatTry(qty*sell);
  }

  function installInvestmentTotals(){
    ensureInvestmentTotalStyle();
    document.querySelectorAll('input[id^="tradeqty_"]').forEach(input=>{
      const sym=input.id.slice('tradeqty_'.length);
      let box=document.getElementById('trade_total_'+sym);
      if(!box){
        box=document.createElement('div');
        box.id='trade_total_'+sym;
        box.className='eot-investment-total';
        box.innerHTML='<div><span>ALIM TOPLAMI</span><b data-buy-total>₺0</b></div><div><span>SATIŞ TOPLAMI</span><b data-sell-total>₺0</b></div>';
        input.insertAdjacentElement('afterend',box);
      }
      if(input.dataset.totalBound!=='1'){
        input.dataset.totalBound='1';
        input.addEventListener('input',()=>updateInvestmentTotal(input));
        input.addEventListener('change',()=>updateInvestmentTotal(input));
      }
      updateInvestmentTotal(input);
    });
  }

  function applyAll(){
    hideStockResearch();
    upgradeProfileGuide();
    installInvestmentTotals();
  }

  const obs=new MutationObserver(applyAll);
  obs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(applyAll,0));
  setInterval(()=>{
    hideStockResearch();
    upgradeProfileGuide();
    document.querySelectorAll('input[id^="tradeqty_"]').forEach(updateInvestmentTotal);
  },700);
  setTimeout(applyAll,0);
})();
