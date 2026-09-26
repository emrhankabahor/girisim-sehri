/* EOT_PART app.js-core-0 */

(function(){function tick(){var e=document.getElementById('clock');if(e)e.textContent=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});}tick();setInterval(tick,1000);})();


let accountMode='login';
let accountLookupTimer=null;


/* EOT_END */
/* EOT_PART app.js-core-1 */


/* EOT_END */
/* EOT_PART app.js-core-2 */



/* EOT_END */
/* EOT_PART app.js-core-3 */


/* EOT_END */
/* EOT_PART app.js-core-4 */


/* EOT_END */
/* EOT_PART app.js-core-5 */



/* EOT_END */
/* EOT_PART app.js-core-6 */


/* EOT_END */
/* EOT_PART app.js-core-7 */



/* EOT_END */
/* EOT_PART app.js-core-8 */


/* EOT_END */
/* EOT_PART app.js-core-9 */


/* EOT_END */
/* EOT_PART app.js-core-10 */




/* EOT_END */
/* EOT_PART app.js-core-11 */


/* EOT_END */
/* EOT_PART app.js-core-12 */



/* EOT_END */
/* EOT_PART app.js-core-13 */


/* EOT_END */
/* EOT_PART app.js-core-14 */


/* EOT_END */
/* EOT_PART app.js-core-15 */


/* EOT_END */
/* EOT_PART app.js-core-16 */


/* EOT_END */
/* EOT_PART app.js-core-17 */


/* EOT_END */
/* EOT_PART app.js-core-18 */


/* EOT_END */
/* EOT_PART app.js-core-19 */


/* EOT_END */
/* EOT_PART app.js-core-20 */


/* EOT_END */
/* EOT_PART app.js-core-21 */


/* EOT_END */
/* EOT_PART app.js-core-22 */


/* EOT_END */
/* EOT_PART app.js-core-23 */


/* EOT_END */
/* EOT_PART app.js-core-24 */


/* EOT_END */
/* EOT_PART app.js-core-25 */


/* EOT_END */
/* EOT_PART app.js-core-26 */



/* EOT_END */
/* EOT_PART app.js-core-27 */




/* EOT_END */
/* EOT_PART app.js-core-28 */



/* EOT_END */
/* EOT_PART app.js-core-29 */


/* EOT_END */
/* EOT_PART app.js-core-30 */


/* EOT_END */
/* EOT_PART app.js-core-31 */



let onboardingStep=1;

/* EOT_END */
/* EOT_PART app.js-core-32 */


/* EOT_END */
/* EOT_PART app.js-core-33 */


/* EOT_END */
/* EOT_PART app.js-core-34 */


/* EOT_END */
/* EOT_PART app.js-core-35 */


/* EOT_END */
/* EOT_PART app.js-core-36 */



if(sessionStorage.getItem('gs_new_career_started')==='1'){
  sessionStorage.removeItem('gs_new_career_started');
  localStorage.removeItem('gs_onboarding_done');
  setTimeout(()=>{hideCareerOverlay();maybeShowOnboarding()},20);
}



/* EOT_END */
/* EOT_PART app.js-core-37 */


/* EOT_END */
/* EOT_PART app.js-core-38 */


/* EOT_END */
/* EOT_PART app.js-core-39 */


document.documentElement.classList.add('js-ready');

const ASSETS={GSTEK:{name:'GŞ Teknoloji',group:'stock',buy:125,sell:124.2,step:1},ANSAN:{name:'Anadolu Sanayi',group:'stock',buy:82,sell:81.4,step:1},MTRYP:{name:'Metro Yapı',group:'stock',buy:210,sell:208.5,step:1},ATOTO:{name:'Atlas Otomotiv',group:'stock',buy:168,sell:166.8,step:1},BTC:{name:'Bitcoin',group:'crypto',buy:3240000,sell:3215000,step:.001},ETH:{name:'Ethereum',group:'crypto',buy:112000,sell:111200,step:.01},SOL:{name:'Solana',group:'crypto',buy:5820,sell:5780,step:.1},XRP:{name:'XRP',group:'crypto',buy:102,sell:101.2,step:1},GRAM:{name:'Gram Altın',group:'gold',buy:4420,sell:4375,step:1},CEYREK:{name:'Çeyrek Altın',group:'gold',buy:7290,sell:7180,step:1},TAM:{name:'Tam Altın',group:'gold',buy:28960,sell:28520,step:1},YARIM:{name:'Yarım Altın',group:'gold',buy:14520,sell:14270,step:1},CUMHUR:{name:'Cumhuriyet Altını',group:'gold',buy:30150,sell:29650,step:1},KULCE:{name:'100g Külçe Altın',group:'gold',buy:445000,sell:439500,step:1}};
const BASE={};Object.keys(ASSETS).forEach(k=>BASE[k]={buy:ASSETS[k].buy,sell:ASSETS[k].sell});
let cash=Number(localStorage.getItem('gs124_cash')||100000),pf=JSON.parse(localStorage.getItem('gs18_pf')||'{}'),tx=JSON.parse(localStorage.getItem('gs18_tx')||'[]'),realized=Number(localStorage.getItem('gs18_realized')||0),loans=JSON.parse(localStorage.getItem('gs110_loans')||'[]'),creditScore=Number(localStorage.getItem('gs111_credit')||50),trusts=JSON.parse(localStorage.getItem('gs111_trusts')||'{"sehir":50,"anadolu":50,"nova":50,"ticaret":50,"varlik":50,"girisim":50}'),lateCount=Number(localStorage.getItem('gs111_late')||0);
loans=loans.map(l=>({...l,paidCount:l.paidCount||0,nextDue:l.nextDue||(()=>{let d=new Date(l.t||Date.now());d.setMonth(d.getMonth()+1);return d.getTime()})(),hadLate:!!l.hadLate,closed:!!l.closed}));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const money=n=>(n<0?'-':'')+'₺'+Math.abs(Number(n||0)).toLocaleString('tr-TR',{maximumFractionDigits:2});
const assetUnit=sym=>({GSTEK:'adet',ANSAN:'adet',MTRYP:'adet',ATOTO:'adet',BTC:'BTC',ETH:'ETH',SOL:'SOL',XRP:'XRP',GRAM:'gram',CEYREK:'adet',TAM:'adet',YARIM:'adet',CUMHUR:'adet',KULCE:'adet'})[sym]||'adet';
const qtyDigits=sym=>sym==='BTC'?6:sym==='ETH'?5:sym==='SOL'?3:sym==='XRP'?2:0;
const qtyText=(q,sym)=>Number(q||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:qtyDigits(sym)});
const qtyWithUnit=(q,sym)=>qtyText(q,sym)+' '+assetUnit(sym);


/* EOT_END */
/* EOT_PART app.js-core-40 */


/* EOT_END */
/* EOT_PART app.js-core-41 */


/* EOT_END */
/* EOT_PART app.js-core-42 */


/* EOT_END */
/* EOT_PART app.js-core-43 */


/* EOT_END */
/* EOT_PART app.js-core-44 */


/* EOT_END */
/* EOT_PART app.js-core-45 */




/* EOT_END */
/* EOT_PART app.js-core-46 */



/* EOT_END */
/* EOT_PART app.js-core-47 */



/* EOT_END */
/* EOT_PART app.js-core-48 */


/* EOT_END */
/* EOT_PART app.js-core-49 */


/* EOT_END */
/* EOT_PART app.js-core-50 */


/* EOT_END */
/* EOT_PART app.js-core-51 */


/* EOT_END */
/* EOT_PART app.js-core-52 */


/* EOT_END */
/* EOT_PART app.js-core-53 */


/* EOT_END */
/* EOT_PART app.js-core-54 */


/* EOT_END */
/* EOT_PART app.js-core-55 */


/* EOT_END */
/* EOT_PART app.js-core-56 */


/* EOT_END */
/* EOT_PART app.js-core-57 */


let deposits=JSON.parse(localStorage.getItem('gs113_deposits')||'[]');

let ownedAssets=JSON.parse(localStorage.getItem('gs117_assets')||'[]');

let factoryOp=JSON.parse(localStorage.getItem('gs119_factoryOp')||'{"status":"idle","finish":0}');
let constructionOp=JSON.parse(localStorage.getItem('gs119_constructionOp')||'{"status":"idle","finish":0}');
let selectedLandId=localStorage.getItem('gs121_selectedLand')||'';
let factoryLevel=Number(localStorage.getItem('gs121_factoryLevel')||1);
let reputation=Number(localStorage.getItem('gs126_reputation')||50);

let sim=JSON.parse(localStorage.getItem('gs132_sim')||'{"companyName":"","employees":[],"raw":0,"taxDue":0,"notifications":[],"lastCycle":0,"cycleDue":0,"lastExpense":0,"npcOffers":[],"npcRefresh":0}');
if(!sim.cycleDue)sim.cycleDue=Date.now()+300000;
if(!Array.isArray(sim.dynamicListings))sim.dynamicListings=[];
if(!sim.dynamicRefresh)sim.dynamicRefresh=0;
if(!sim.dynamicFilter)sim.dynamicFilter='all';
if(!sim.negotiation)sim.negotiation=null;
if(!Array.isArray(sim.monthlyHistory))sim.monthlyHistory=[];
if(!sim.gameMonth)sim.gameMonth=1;
if(!sim.departments)sim.departments={sales:0,finance:0,construction:0,industry:0};
if(!Array.isArray(sim.projects))sim.projects=[];
if(!sim.currentMonth)sim.currentMonth={revenue:0,expense:0,tax:0};
if(!sim.macro)sim.macro={rate:42.5,inflation:31.2,growth:3.1,cycle:'Dengeli'};
if(!Array.isArray(sim.competitors))sim.competitors=[];
if(!Array.isArray(sim.tenders))sim.tenders=[];
if(!sim.tenderWins)sim.tenderWins=0;
if(!sim.creditCard)sim.creditCard={limit:500000,used:0,statement:0};
if(!Array.isArray(sim.ipos))sim.ipos=[];
if(!Array.isArray(sim.ipoHoldings))sim.ipoHoldings=[];
if(!Array.isArray(sim.wealthHistory))sim.wealthHistory=[];
if(sim.lifestyle==null)sim.lifestyle=0;
if(!sim.companyProfile)sim.companyProfile={established:false,name:'',sector:'Genel Ticaret',city:'İstanbul',capital:0,companyCash:0,brand:0};
if(sim.companyProfile.established==null)sim.companyProfile.established=!!ownedAssets.some(a=>a.type==='İşletme');
if(sim.companyProfile.companyCash==null)sim.companyProfile.companyCash=sim.companyProfile.established?Number(sim.companyProfile.capital||0):0;
if(!sim.companyProfile.legalType)sim.companyProfile.legalType='Limited Şirket';
if(!sim.companyProfile.office)sim.companyProfile.office='home';
if(!sim.companyProfile.accountant)sim.companyProfile.accountant='basic';
if(!Array.isArray(sim.companies))sim.companies=[];
if(!sim.selectedCompanyId)sim.selectedCompanyId='';
if(sim.companyProfile.established && !sim.companies.length){
 sim.companyProfile.id=sim.companyProfile.id||('company_'+Date.now());
 sim.companies.push({...sim.companyProfile});
 sim.selectedCompanyId=sim.companyProfile.id;
}

if(!sim.setupStep)sim.setupStep=1;
if(!sim.news)sim.news={id:'neutral',until:0};
if(!Array.isArray(sim.detailedUsed))sim.detailedUsed=[];
if(!sim.usedRefresh)sim.usedRefresh=0;
if(!sim.stockDividendDue)sim.stockDividendDue=0;
if(!Array.isArray(sim.tenantApplications))sim.tenantApplications=[];
if(!sim.unifiedVersion)sim.unifiedVersion=140;
if(!sim.constructionPlan)sim.constructionPlan={kind:'',permit:false,architect:'standard',contractor:'economy'};



if(!Array.isArray(sim.dealerListings))sim.dealerListings=[];

let economyState=JSON.parse(localStorage.getItem('gs126_economy')||'{"id":"neutral","until":0}');



/* EOT_END */
/* EOT_PART app.js-core-58 */


/* EOT_END */
/* EOT_PART app.js-core-59 */


/* EOT_END */
/* EOT_PART app.js-core-60 */


/* EOT_END */
/* EOT_PART app.js-core-61 */


/* EOT_END */
/* EOT_PART app.js-core-62 */




/* EOT_END */
/* EOT_PART app.js-core-63 */


/* EOT_END */
/* EOT_PART app.js-core-64 */


/* EOT_END */
/* EOT_PART app.js-core-65 */


/* EOT_END */
/* EOT_PART app.js-core-66 */


/* EOT_END */
/* EOT_PART app.js-core-67 */


/* EOT_END */
/* EOT_PART app.js-core-68 */




/* EOT_END */
/* EOT_PART app.js-core-69 */


/* EOT_END */
/* EOT_PART app.js-core-70 */


/* EOT_END */
/* EOT_PART app.js-core-71 */


/* EOT_END */
/* EOT_PART app.js-core-72 */


/* EOT_END */
/* EOT_PART app.js-core-73 */


/* EOT_END */
/* EOT_PART app.js-core-74 */


/* EOT_END */
/* EOT_PART app.js-core-75 */


/* EOT_END */
/* EOT_PART app.js-core-76 */


/* EOT_END */
/* EOT_PART app.js-core-77 */


/* EOT_END */
/* EOT_PART app.js-core-78 */


/* EOT_END */
/* EOT_PART app.js-core-79 */


/* EOT_END */
/* EOT_PART app.js-core-80 */




const PROJECTS={
 villa:{name:'Villa Projesi',cost:3000000,revenue:5200000,duration:20,units:2},
 apartment:{name:'Apartman Projesi',cost:5500000,revenue:11200000,duration:30,units:8},
 residence:{name:'20 Dairelik Rezidans',cost:18000000,revenue:36000000,duration:45,units:20},
 commercial:{name:'Ticari Proje',cost:8500000,revenue:16200000,duration:38,units:4}
};

/* EOT_END */
/* EOT_PART app.js-core-81 */



/* EOT_END */
/* EOT_PART app.js-core-82 */


/* EOT_END */
/* EOT_PART app.js-core-83 */


/* EOT_END */
/* EOT_PART app.js-core-84 */


/* EOT_END */
/* EOT_PART app.js-core-85 */


/* EOT_END */
/* EOT_PART app.js-core-86 */



/* EOT_END */
/* EOT_PART app.js-core-87 */


/* EOT_END */
/* EOT_PART app.js-core-88 */


/* EOT_END */
/* EOT_PART app.js-core-89 */


/* EOT_END */
/* EOT_PART app.js-core-90 */



/* EOT_END */
/* EOT_PART app.js-core-91 */




/* EOT_END */
/* EOT_PART app.js-core-92 */



const ECONOMY_EVENTS=[
 {id:'neutral',title:'Piyasalar dengeli seyrediyor',body:'Belirgin bir risk iştahı veya güvenli liman talebi bulunmuyor.',mood:'Dengeli',icon:'📊',stock:0,crypto:0,gold:0},
 {id:'growth',title:'Büyüme beklentileri güçlendi',body:'Şirket kârlılık beklentileri artarken riskli varlıklara talep yükseliyor.',mood:'Risk İştahı Yüksek',icon:'📈',stock:.003,crypto:.004,gold:-.001},
 {id:'riskoff',title:'Küresel risk algısı yükseldi',body:'Yatırımcılar daha güvenli varlıklara yöneliyor; riskli piyasalarda satış baskısı var.',mood:'Temkinli',icon:'⚠️',stock:-.003,crypto:-.006,gold:.003},
 {id:'crypto',title:'Dijital varlıklara talep arttı',body:'Kripto piyasasında işlem hacmi ve risk iştahı yükseldi.',mood:'Kripto Pozitif',icon:'₿',stock:.001,crypto:.009,gold:0},
 {id:'gold',title:'Güvenli liman talebi arttı',body:'Belirsizlik nedeniyle altına yönelik talep güçleniyor.',mood:'Altın Pozitif',icon:'🪙',stock:-.001,crypto:-.002,gold:.006}
];

/* EOT_END */
/* EOT_PART app.js-core-93 */


/* EOT_END */
/* EOT_PART app.js-core-94 */


/* EOT_END */
/* EOT_PART app.js-core-95 */


/* EOT_END */
/* EOT_PART app.js-core-96 */


/* EOT_END */
/* EOT_PART app.js-core-97 */



const STAFF={
 'Satış Danışmanı':{salary:65000,bonus:2},
 'Muhasebeci':{salary:80000,bonus:3},
 'Mühendis':{salary:110000,bonus:5},
 'Yönetici':{salary:150000,bonus:6}
};

/* EOT_END */
/* EOT_PART app.js-core-98 */


/* EOT_END */
/* EOT_PART app.js-core-99 */


/* EOT_END */
/* EOT_PART app.js-core-100 */


/* EOT_END */
/* EOT_PART app.js-core-101 */


/* EOT_END */
/* EOT_PART app.js-core-102 */


/* EOT_END */
/* EOT_PART app.js-core-103 */


/* EOT_END */
/* EOT_PART app.js-core-104 */


/* EOT_END */
/* EOT_PART app.js-core-105 */


/* EOT_END */
/* EOT_PART app.js-core-106 */


/* EOT_END */
/* EOT_PART app.js-core-107 */


/* EOT_END */
/* EOT_PART app.js-core-108 */


/* EOT_END */
/* EOT_PART app.js-core-109 */


/* EOT_END */
/* EOT_PART app.js-core-110 */


/* EOT_END */
/* EOT_PART app.js-core-111 */


/* EOT_END */
/* EOT_PART app.js-core-112 */


/* EOT_END */
/* EOT_PART app.js-core-113 */


/* EOT_END */
/* EOT_PART app.js-core-114 */


/* EOT_END */
/* EOT_PART app.js-core-115 */


/* EOT_END */
/* EOT_PART app.js-core-116 */


/* EOT_END */
/* EOT_PART app.js-core-117 */



/* EOT_END */
/* EOT_PART app.js-core-118 */


/* EOT_END */
/* EOT_PART app.js-core-119 */


/* EOT_END */
/* EOT_PART app.js-core-120 */


/* EOT_END */
/* EOT_PART app.js-core-121 */


/* EOT_END */
/* EOT_PART app.js-core-122 */


/* EOT_END */
/* EOT_PART app.js-core-123 */


/* EOT_END */
/* EOT_PART app.js-core-124 */


/* EOT_END */
/* EOT_PART app.js-core-125 */


/* EOT_END */
/* EOT_PART app.js-core-126 */



const DEPT_INFO={
 sales:{name:'Satış',base:750000},
 finance:{name:'Finans',base:900000},
 construction:{name:'İnşaat',base:1200000},
 industry:{name:'Sanayi',base:1100000}
};

/* EOT_END */
/* EOT_PART app.js-core-127 */


/* EOT_END */
/* EOT_PART app.js-core-128 */


/* EOT_END */
/* EOT_PART app.js-core-129 */


/* EOT_END */
/* EOT_PART app.js-core-130 */


/* EOT_END */
/* EOT_PART app.js-core-131 */



/* EOT_END */
/* EOT_PART app.js-core-132 */


/* EOT_END */
/* EOT_PART app.js-core-133 */


/* EOT_END */
/* EOT_PART app.js-core-134 */


/* EOT_END */
/* EOT_PART app.js-core-135 */


/* EOT_END */
/* EOT_PART app.js-core-136 */


/* EOT_END */
/* EOT_PART app.js-core-137 */


/* EOT_END */
/* EOT_PART app.js-core-138 */


/* EOT_END */
/* EOT_PART app.js-core-139 */


/* EOT_END */
/* EOT_PART app.js-core-140 */


/* EOT_END */
/* EOT_PART app.js-core-141 */


/* EOT_END */
/* EOT_PART app.js-core-142 */


/* EOT_END */
/* EOT_PART app.js-core-143 */


/* EOT_END */
/* EOT_PART app.js-core-144 */


/* EOT_END */
/* EOT_PART app.js-core-145 */


/* EOT_END */
/* EOT_PART app.js-core-146 */


/* EOT_END */
/* EOT_PART app.js-core-147 */


/* EOT_END */
/* EOT_PART app.js-core-148 */


/* EOT_END */
/* EOT_PART app.js-core-149 */



/* EOT_END */
/* EOT_PART app.js-core-150 */



/* EOT_END */
/* EOT_PART app.js-core-151 */


/* EOT_END */
/* EOT_PART app.js-core-152 */



const LIFESTYLES=[
{name:'Mütevazı',expense:35000,prestige:0,rep:0},
{name:'Konforlu',expense:120000,prestige:8,rep:1},
{name:'Premium',expense:350000,prestige:20,rep:2},
{name:'Elit',expense:850000,prestige:40,rep:4}
];

/* EOT_END */
/* EOT_PART app.js-core-153 */


/* EOT_END */
/* EOT_PART app.js-core-154 */


/* EOT_END */
/* EOT_PART app.js-core-155 */


/* EOT_END */
/* EOT_PART app.js-core-156 */


/* EOT_END */
/* EOT_PART app.js-core-157 */


/* EOT_END */
/* EOT_PART app.js-core-158 */


/* EOT_END */
/* EOT_PART app.js-core-159 */


/* EOT_END */
/* EOT_PART app.js-core-160 */


/* EOT_END */
/* EOT_PART app.js-core-161 */


/* EOT_END */
/* EOT_PART app.js-core-162 */


/* EOT_END */
/* EOT_PART app.js-core-163 */


/* EOT_END */
/* EOT_PART app.js-core-164 */


/* EOT_END */
/* EOT_PART app.js-core-165 */


/* EOT_END */
/* EOT_PART app.js-core-166 */


/* EOT_END */
/* EOT_PART app.js-core-167 */


/* EOT_END */
/* EOT_PART app.js-core-168 */


/* EOT_END */
/* EOT_PART app.js-core-169 */


/* EOT_END */
/* EOT_PART app.js-core-170 */


/* EOT_END */
/* EOT_PART app.js-core-171 */


/* EOT_END */
/* EOT_PART app.js-core-172 */


/* EOT_END */
/* EOT_PART app.js-core-173 */


/* EOT_END */
/* EOT_PART app.js-core-174 */


/* EOT_END */
/* EOT_PART app.js-core-175 */


/* EOT_END */
/* EOT_PART app.js-core-176 */


/* EOT_END */
/* EOT_PART app.js-core-177 */


/* EOT_END */
/* EOT_PART app.js-core-178 */


/* EOT_END */
/* EOT_PART app.js-core-179 */


/* EOT_END */
/* EOT_PART app.js-core-180 */



const STOCK_INFO={
 GSTEK:{sector:'Teknoloji',marketCap:28500000000,profitability:82,risk:'Orta-Yüksek',dividend:.35},
 ANSAN:{sector:'Sanayi',marketCap:17400000000,profitability:74,risk:'Orta',dividend:1.10},
 MTRYP:{sector:'İnşaat',marketCap:22600000000,profitability:68,risk:'Yüksek',dividend:.60},
 ATOTO:{sector:'Otomotiv',marketCap:31400000000,profitability:79,risk:'Orta',dividend:1.35}
};
const CITY_ECON={
 İstanbul:{finance:1.08,property:1.08,industry:1.01,tourism:1.02},
 Ankara:{finance:1.04,property:1.04,industry:1.02,tourism:1},
 İzmir:{finance:1.03,property:1.05,industry:1.02,tourism:1.06},
 Bursa:{finance:1,property:1.02,industry:1.08,tourism:1.01},
 Kocaeli:{finance:1,property:1.01,industry:1.10,tourism:1},
 Antalya:{finance:1,property:1.05,industry:.98,tourism:1.10},
 Muğla:{finance:.99,property:1.07,industry:.97,tourism:1.12},
 Gaziantep:{finance:1,property:1.01,industry:1.07,tourism:.98}
};
const NEWS_EVENTS=[
 {id:'neutral',icon:'📰',title:'Piyasalar Dengeli',text:'Belirgin bir şok bulunmuyor.',housing:0,auto:0,stock:0,crypto:0,gold:0,credit:0},
 {id:'rate_hike',icon:'🏦',title:'Politika Faizi Artırıldı',text:'Kredi maliyetleri yükseldi. Konut talebi baskı altında.',housing:-.05,auto:-.02,stock:-.025,crypto:-.035,gold:.02,credit:.18},
 {id:'mortgage_cut',icon:'🏠',title:'Konut Kredilerinde Faiz İndirimi',text:'Konut finansmanına erişim kolaylaştı.',housing:.07,auto:0,stock:.01,crypto:0,gold:-.005,credit:-.12},
 {id:'auto_tax',icon:'🚗',title:'Otomotiv Vergi Düzenlemesi',text:'Sıfır ve ikinci el araç fiyatlarında yukarı yönlü baskı.',housing:0,auto:.08,stock:.02,crypto:0,gold:0,credit:0},
 {id:'btc_flow',icon:'₿',title:'Dijital Varlık Talebi Güçlendi',text:'Kripto piyasasında işlem hacmi hızla yükseldi.',housing:0,auto:0,stock:.005,crypto:.09,gold:-.01,credit:0},
 {id:'risk',icon:'⚠️',title:'Küresel Risk İştahı Düştü',text:'Riskli varlıklardan güvenli limanlara geçiş var.',housing:-.015,auto:-.01,stock:-.04,crypto:-.08,gold:.055,credit:.05}
];

/* EOT_END */
/* EOT_PART app.js-core-181 */


/* EOT_END */
/* EOT_PART app.js-core-182 */


/* EOT_END */
/* EOT_PART app.js-core-183 */


/* EOT_END */
/* EOT_PART app.js-core-184 */



/* EOT_END */
/* EOT_PART app.js-core-185 */


/* EOT_END */
/* EOT_PART app.js-core-186 */


/* EOT_END */
/* EOT_PART app.js-core-187 */


/* EOT_END */
/* EOT_PART app.js-core-188 */


/* EOT_END */
/* EOT_PART app.js-core-189 */


/* EOT_END */
/* EOT_PART app.js-core-190 */




const COMPANY_ONLY_ROUTES=new Set(['company_center','employees','business_credit']);


/* EOT_END */
/* EOT_PART app.js-core-191 */


/* EOT_END */
/* EOT_PART app.js-core-192 */


/* EOT_END */
/* EOT_PART app.js-core-193 */


/* EOT_END */
/* EOT_PART app.js-core-194 */


/* EOT_END */
/* EOT_PART app.js-core-195 */


/* EOT_END */
/* EOT_PART app.js-core-196 */


/* EOT_END */
/* EOT_PART app.js-core-197 */


/* EOT_END */
/* EOT_PART app.js-core-198 */

window.addEventListener('hashchange',guardCompanyRoute);

const COMPANY_SECTOR_INFO={
 'İnşaat':{icon:'🏗️',target:'construction',label:'İnşaat Operasyonları',desc:'Arsa geliştir, ruhsat al ve proje üret.'},
 'Sanayi':{icon:'🏭',target:'factory',label:'Sanayi & Üretim',desc:'Fabrika kur, hammadde kullan ve üretim yap.'},
 'Otomotiv':{icon:'🚘',target:'dealership',label:'Otomotiv & Galeri',desc:'Araç al, stokla, ilana koy ve sat.'},
 'Gayrimenkul':{icon:'🏠',target:'property_management',label:'Gayrimenkul',desc:'Gayrimenkulleri kirala, geliştir ve sat.'},
 'Finans':{icon:'📈',target:'finance',label:'Finans & Yatırım',desc:'Finansal piyasaları ve şirket sermayesini yönet.'},
 'Lojistik':{icon:'🚚',target:'inventory',label:'Lojistik',desc:'Stok ve tedarik operasyonlarını yönet.'}
};

/* EOT_END */
/* EOT_PART app.js-core-199 */


/* EOT_END */
/* EOT_PART app.js-core-200 */


/* EOT_END */
/* EOT_PART app.js-core-201 */


/* EOT_END */
/* EOT_PART app.js-core-202 */


/* EOT_END */
/* EOT_PART app.js-core-203 */


/* EOT_END */
/* EOT_PART app.js-core-204 */


/* EOT_END */
/* EOT_PART app.js-core-205 */



/* EOT_END */
/* EOT_PART app.js-core-206 */


/* EOT_END */
/* EOT_PART app.js-core-207 */


/* EOT_END */
/* EOT_PART app.js-core-208 */


/* EOT_END */
/* EOT_PART app.js-core-209 */


/* EOT_END */
/* EOT_PART app.js-core-210 */


/* EOT_END */
/* EOT_PART app.js-core-211 */


/* EOT_END */
/* EOT_PART app.js-core-212 */


/* EOT_END */
/* EOT_PART app.js-core-213 */


/* EOT_END */
/* EOT_PART app.js-core-214 */


/* EOT_END */
/* EOT_PART app.js-core-215 */


/* EOT_END */
/* EOT_PART app.js-core-216 */


/* EOT_END */
/* EOT_PART app.js-core-217 */


/* EOT_END */
/* EOT_PART app.js-core-218 */


/* EOT_END */
/* EOT_PART app.js-core-219 */


/* EOT_END */
/* EOT_PART app.js-core-220 */


/* EOT_END */
/* EOT_PART app.js-core-221 */


/* EOT_END */
/* EOT_PART app.js-core-222 */


/* EOT_END */
/* EOT_PART app.js-core-223 */


/* EOT_END */
/* EOT_PART app.js-core-224 */


/* EOT_END */
/* EOT_PART app.js-core-225 */


/* EOT_END */
/* EOT_PART app.js-core-226 */


/* EOT_END */
/* EOT_PART app.js-core-227 */


/* EOT_END */
/* EOT_PART app.js-core-228 */


/* EOT_END */
/* EOT_PART app.js-core-229 */


/* EOT_END */
/* EOT_PART app.js-core-230 */


/* EOT_END */
/* EOT_PART app.js-core-231 */


/* EOT_END */
/* EOT_PART app.js-core-232 */


/* EOT_END */
/* EOT_PART app.js-core-233 */


/* EOT_END */
/* EOT_PART app.js-core-234 */




/* EOT_END */
/* EOT_PART app.js-core-235 */



/* EOT_END */
/* EOT_PART app.js-tail */

repairLegacyCareerBeforeRender();sanitizeGameState();syncSelectedCompanyToProfile();render();renderFinanceExtras();renderGameExtras();save();saveDeposits();saveOwned();
setInterval(()=>{movePrices();renderFinanceExtras();renderGameExtras()},5000);setInterval(()=>{updateOps();renderEconomy();renderSimulation()},1000);
setInterval(()=>{render();renderFinanceExtras();renderGameExtras()},30000);


renderAccountState();

/* EOT_END */
