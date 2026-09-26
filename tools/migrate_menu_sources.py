#!/usr/bin/env python3
"""One-time, lossless migration of v222 into menu-oriented editable sources."""
from pathlib import Path
from html.parser import HTMLParser
import collections, hashlib, json, re, subprocess
from build_menu_sources import assemble, digest
ROOT = Path(__file__).resolve().parents[1]

ROUTES = {
 'home':'ana-sayfa', 'market':'pazar', 'business':'isletmeler', 'finance':'finans', 'profile':'profil',
 'city':'pazar/arsa', 'city_specialties':'pazar/arsa', 'neighborhoods':'pazar/arsa/mahalleler',
 'estate':'pazar/gayrimenkul', 'cars':'pazar/galeri', 'cars_new':'pazar/galeri/sifir',
 'cars_used':'pazar/galeri/ikinci-el','used_market_plus':'pazar/galeri/ikinci-el',
 'brand_dealers':'pazar/galeri/markalar','npc_market':'pazar/teklifler',
 'dynamic_market':'pazar/canli-ilanlar','negotiation':'pazar/pazarlik',
 'bank':'finans/banka','loans':'finans/krediler','secured_loans':'finans/krediler/teminat',
 'business_credit':'finans/krediler/ticari','loan_restructure':'finans/krediler/yapilandirma',
 'credit_card':'finans/kredi-karti','stocks':'finans/borsa','stock_research':'finans/borsa/arastirma',
 'crypto':'finans/kripto','gold':'finans/altin','ipo_center':'finans/halka-arz',
 'deposits':'finans/mevduat','deposit_success':'finans/mevduat','budget':'finans/butce',
 'transactions':'finans/islem-gecmisi','monthly_report':'finans/raporlar','taxes':'finans/vergiler',
 'macro':'finans/ekonomi','economic_news':'finans/ekonomi/haberler','crisis_center':'finans/kriz',
 'management':'isletmeler/yonetim','company_center':'isletmeler/sirket',
 'company_setup':'isletmeler/sirket/kurulus','employees':'isletmeler/personel',
 'inventory':'isletmeler/stok','competitors':'isletmeler/rakipler','tenders':'isletmeler/ihaleler',
 'advanced_hub':'isletmeler/gelismis','factory':'isletmeler/fabrika',
 'construction':'isletmeler/insaat','development_center':'isletmeler/insaat/arsa-gelistirme',
 'project_catalog':'isletmeler/insaat/projeler','project_portfolio':'isletmeler/insaat/projeler',
 'construction_planning':'isletmeler/insaat/planlama','dealership':'isletmeler/galeri',
 'property_management':'isletmeler/gayrimenkul','renovation':'isletmeler/gayrimenkul/tadilat',
 'character':'profil/karakter','myassets':'profil/varliklar','garage':'profil/garaj',
 'vehicle_service':'profil/garaj/servis','missions':'profil/gorevler','achievements':'profil/basarimlar',
 'notifications':'profil/bildirimler','wealth_history':'profil/servet-gecmisi',
 'multiplayer':'profil/cok-oyunculu','js_required':'ortak/uyarilar'
}

def route_group(key):
    if key in ROUTES: return ROUTES[key]
    k = key.removeprefix('purchase_')
    if k in ROUTES: return ROUTES[k]
    if k.startswith('province_'): return 'pazar/arsa/iller/'+k.removeprefix('province_')
    if k.startswith('district_'): return 'pazar/arsa/ilceler/'+k.removeprefix('district_')
    if k.startswith('land_') or re.search(r'_r\d+$',k): return 'pazar/arsa/ilceler/'+re.sub(r'_r\d+$','',k.removeprefix('land_'))
    if k.startswith('re_city_'): return 'pazar/gayrimenkul/iller/'+k.removeprefix('re_city_')
    if k.startswith('re_'): return 'pazar/gayrimenkul/ilceler/'+re.sub(r'_(flat|shop|villa|warehouse)$','',k.removeprefix('re_').removeprefix('district_'))
    if k.startswith('auto_'): return 'pazar/galeri/ilanlar'
    if k.startswith('factory_'): return 'isletmeler/fabrika'
    if k.startswith('construction_'): return 'isletmeler/insaat'
    if k.startswith('loan_'): return 'finans/krediler/bankalar'
    if k.startswith('trade_'):
        sym=k.removeprefix('trade_').removeprefix('success_').upper()
        return 'finans/'+('kripto' if sym in ('BTC','ETH','SOL','XRP') else 'altin' if sym in ('GRAM','CEYREK','TAM') else 'borsa')
    raise ValueError('Unclassified screen: '+key)

FUNCTION_GROUPS = {
 'profil/hesap':'accountUsers saveAccountUsers accountSessionAuthenticated markAccountSessionAuthenticated clearAccountSessionAuthenticated currentAccount accountCareerKey setAccountMode showAccountError hideAccountError simpleHash normalizeAccountEmail scheduleAccountLookup routeAccountByEmail submitEmailAccount startAppleSignIn continueAsGuest enterGameAfterAccount logoutAccount hideAccountOverlay showAccountOverlay renderAccountState showOnboarding renderOnboarding changeOnboardingStep finishOnboarding maybeShowOnboarding hideCareerOverlay continueExistingCareer startFreshCareer',
 'ortak/kayit':'freshCareerState careerStateLooksBroken resetCurrentCareerToFresh currentRuntimeLooksLegacyBroken repairLegacyCareerBeforeRender captureCareerState saveAccountCareer applyCareerState loadAccountCareer save saveDeposits saveOwned simSave createBackup restoreBackup saveUnifiedState unifiedIntegrity sanitizeGameState ensureAssetMetadata',
 'finans/yatirimlar':'stats trade setTradeResult syncTradeQty tradeFromScreenAndGo tradeFromScreen renderAssets portfolio movePrices',
 'finans/krediler':'debt active acceptLoan payInstallment closeLoan renderLoans collateralAssets renderCollateral takeSecuredLoan processMonthlyLoanPayments useCreditCard payCreditCard restructureLoan renderRestructure monthlyIncomeEstimate creditAssessment renderBusinessCredit takeBusinessCredit',
 'finans/islem-gecmisi':'renderTx', 'finans/mevduat':'openDeposit depositStats renderDeposits',
 'ortak/ekranlar':'toast render renderFinanceExtras updateOps renderEconomy renderRealism renderSimulation renderAdvanced renderV140 renderV141 renderGameExtras',
 'profil/varliklar':'buyAsset purchaseScreenId setPurchaseResult renderOwned ownedValue sellOwned owns',
 'isletmeler/fabrika':'startFactoryBatch collectFactoryBatch upgradeFactory renderFactoryUpgrade buyRawMaterial',
 'isletmeler/insaat':'startConstructionProject collectConstructionProject selectDevelopmentLand chooseProjectPlan constructionPlanNumbers renderConstructionPlan obtainPermit startPlannedProject startLandProject renderDevelopableLands projectDefs completeConstructionToPortfolio sellProjectUnit rentProjectUnit projectRentalIncome renderProjectPortfolio',
 'isletmeler/gayrimenkul':'collectRent togglePropertyRent sellManagedProperty renderPropertyManagement renovateProperty renderRenovation requestTenant processTenantSearch propertyValuation detailedPropertyCard setPropertyRentAsk',
 'profil/gorevler':'gameLevel missionState renderMissions gameXp achievementData renderAchievements',
 'ana-sayfa':'renderBusinessSummary renderActivity buildDemoUI syncDemo',
 'pazar/arsa':'filterCities renderCityOwnership renderNeighborhoods',
 'finans/ekonomi':'currentEconomy operatingStats advanceMacroCycle currentNews nextEconomicNews renderEconomicNews',
 'profil/bildirimler':'pushNotification clearNotifications renderNotifications',
 'isletmeler/personel':'hireEmployee fireEmployee employeeStats selectedCompanyEmployees selectedCompanyEmployeeStats',
 'finans/raporlar':'maintenanceCost processAccountingCycle payTaxes closeGameMonth renderMonthlyReport',
 'pazar/teklifler':'generateNpcOffers refreshNpcOffers renderNpcOffers acceptNpcOffer',
 'isletmeler/galeri':'dealerListingFor listDealerCar removeDealerListing checkDealerOffers renderDealer',
 'pazar/canli-ilanlar':'listingTemplate generateDynamicListings evolveDynamicListings ensureDynamicListings setDynamicFilter renderDynamicMarket findDynamic openNegotiation submitNegotiation finishDynamicBuy buyDynamicNow buyNegotiated',
 'isletmeler/sirket':'saveCompanyName riskScore deptLevel upgradeDepartment companyMetrics renderSetupStep changeSetupStep selectCompanyLegalType selectAccountant transferToCompany transferFromCompany ensureCompanyDataShape selectedCompanyHistory companyBusinessDebt guardCompanyRoute beginNewCompany selectedCompany syncSelectedCompanyToProfile persistSelectedCompany selectCompany renderCompanyPortfolio renderSelectedCompanyActivity companyFoundingQuote createOrUpdateCompany renderCompanySetup renderCompanyFoundation',
 'profil/servet-gecmisi':'totalWealth recordWealth renderWealth',
 'isletmeler/rakipler':'ensureCompetitors simulateCompetitors renderCompetitors',
 'isletmeler/ihaleler':'ensureTenders bidTender renderTenders',
 'finans/halka-arz':'ensureIpos buyIpo collectDividends renderIpos',
 'profil/yasam':'setLifestyle renderLifestyle',
 'profil/garaj':'serviceVehicle inspectVehicle renderVehicleService',
 'finans/borsa':'renderStockResearch collectStockDividends',
 'pazar/galeri':'generateDetailedUsed refreshDetailedUsed renderDetailedUsed bargainUsed buyDetailedUsed renderBrandDealers',
 'finans/kriz':'renderCrisis emergencyAssetSale emergencyRestructure',
 'ortak/araclar':'normalizeNumber',
}
FUNCTION_OWNER = {name:group for group,names in FUNCTION_GROUPS.items() for name in names.split()}

class Screens(HTMLParser):
    def __init__(self,text):
        super().__init__(convert_charrefs=False);self.text=text;self.lines=[0];self.stack=[];self.screens=[]
        self.lines.extend(m.end() for m in re.finditer('\n',text));self.feed(text)
    def position(self):
        line,col=self.getpos();return self.lines[line-1]+col
    def handle_starttag(self,tag,attrs):
        if tag=='section':
            a=dict(attrs);self.stack.append((self.position(),a.get('id')) if 'screen' in a.get('class','').split() else None)
    def handle_endtag(self,tag):
        if tag=='section':
            item=self.stack.pop()
            if item: self.screens.append((item[0],self.position()+len('</section>'),item[1]))

def main():
    if (ROOT/'src/menu-build.json').exists():
        print('Migration already completed; sources are authoritative.');return
    blocks=collections.defaultdict(list);outputs={};baseline={};html_order=[];catalog=[]
    def block(path,key,text): blocks[path].append((key,text));return key
    html_parts=[(ROOT/f'content-{i}.html').read_text() for i in range(1,7)]
    html=''.join(html_parts);screens=sorted(Screens(html).screens)
    if len(screens)!=2867: raise ValueError('Unexpected screen count; inspect migration')
    pos=0
    for start,end,key in screens:
        if start>pos: html_order.append(block('src/ortak/shell.html',f'shell-{pos}',html[pos:start]))
        group=route_group(key);path=f'src/{group}/views.html'
        raw=html[start:end]
        html_order.append(block(path,'screen-'+key,raw))
        title=re.search(r'<h2[^>]*>(.*?)</h2>',raw,re.S)
        catalog.append({'id':key,'source':path,'title':re.sub('<[^>]+>','',title.group(1)) if title else key,
                        'links':list(dict.fromkeys(re.findall(r'href="#([^"]+)"',raw)))})
        pos=end
    if pos<len(html): html_order.append(block('src/ortak/shell.html','shell-tail',html[pos:]))
    # Extract intact, top-level function declarations; leave every other byte in ordered core fragments.
    # Existing source format is deliberately verified instead of using a fragile general JS rewriter.
    for filename,indent in [('app.js',''),('bootstrap.js','  ')]:
        text=(ROOT/filename).read_text();parts=[];pos=0;counter=0
        spans=json.loads(subprocess.check_output(['node',str(ROOT/'tools/menu_function_spans.cjs'),str(ROOT/filename),'bootstrap' if filename=='bootstrap.js' else 'app'],text=True))
        for span in spans:
            start,end,name=span['start'],span['end'],span['name']
            if start>pos:
                parts.append(block(f'src/ortak/{filename}',f'{filename}-core-{counter}',text[pos:start]));counter+=1
            group=FUNCTION_OWNER.get(name)
            if not group:
                if filename=='app.js': raise ValueError('Unclassified function '+name)
                group='ortak/acilis'
            parts.append(block(f'src/{group}/{filename}',f'{filename}-{name}',text[start:end]));pos=end
        if pos<len(text):parts.append(block(f'src/ortak/{filename}',f'{filename}-tail',text[pos:]))
        outputs[filename]={'parts':parts};baseline[filename]=digest(text)
    # Add-ons retain exactly the same runtime URLs, script load order and globals.
    def addon_group(name):
        if name.startswith(('home-','daily-wealth')):return 'ana-sayfa'
        if name.startswith(('company-','business-')):return 'isletmeler/sirket'
        if name.startswith('deposit-'):return 'finans/mevduat'
        if name.startswith('investment-'):return 'finans/yatirimlar'
        if name.startswith(('loan-','credit-')):return 'finans/krediler'
        if name.startswith('transaction-'):return 'finans/islem-gecmisi'
        if name.startswith(('finance-','realtime-finance')):return 'finans/ortak'
        if name.startswith(('vehicle-','dealer-')):return 'pazar/galeri'
        if name.startswith(('property-','construction-')):return 'isletmeler/gayrimenkul' if name.startswith('property-') else 'isletmeler/insaat'
        if name.startswith(('mission-','profile-')):return 'profil'
        return 'ortak/eklentiler'
    for path in sorted(ROOT.glob('*.js')):
        if path.name in outputs: continue
        group=addon_group(path.name);source=f'src/{group}/{path.name}'
        dest=ROOT/source;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(path.read_bytes())
        outputs[path.name]={'copy':source};baseline[path.name]=digest(path.read_text())
    hierarchy=(ROOT/'business-hierarchy.js').read_text()
    copy=outputs['business-hierarchy.js']['copy'];(ROOT/copy).unlink()
    hierarchy_parts=[];pos=0
    kinds={'retail':'magazalar/perakende','market':'magazalar/market','restaurant':'magazalar/restoran','factory':'fabrika','dealer':'galeri','construction':'insaat'}
    for match in re.finditer(r"^    \{id:'(retail|market|restaurant|factory|dealer|construction)'.*$",hierarchy,re.M):
        key=match.group(1)
        hierarchy_parts.append(block('src/isletmeler/kurulus/business-hierarchy.js','hierarchy-before-'+key,hierarchy[pos:match.start()]))
        hierarchy_parts.append(block('src/isletmeler/'+kinds[key]+'/definition.js','hierarchy-type-'+key,match.group()))
        pos=match.end()
    hierarchy_parts.append(block('src/isletmeler/kurulus/business-hierarchy.js','hierarchy-tail',hierarchy[pos:]))
    outputs['business-hierarchy.js']={'parts':hierarchy_parts}
    for path in ROOT.glob('*.css'):
        source=f'src/ortak/stiller/{path.name}';dest=ROOT/source;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(path.read_bytes())
        outputs[path.name]={'copy':source};baseline[path.name]=digest(path.read_text())
    for path,items in blocks.items():
        def wrap(key,content):
            if path.endswith('.html'):return f'<!-- EOT_PART {key} -->\n{content}\n<!-- EOT_END -->\n'
            return f'/* EOT_PART {key} */\n{content}\n/* EOT_END */\n'
        dest=ROOT/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(''.join(wrap(*item) for item in items))
    for i,text in enumerate(html_parts,1):baseline[f'content-{i}.html']=digest(text)
    manifest={'format':1,'block_files':sorted(blocks),'outputs':outputs,'html_order':html_order,'html_chunk_sizes':list(map(len,html_parts))}
    (ROOT/'src/menu-build.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (ROOT/'src/migration-baseline.json').write_text(json.dumps(baseline,indent=2)+'\n')
    (ROOT/'src/routes.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
    for file,text in assemble().items():
        if digest(text)!=baseline[file]:raise ValueError('Migration changed '+file)
    print(f'Migrated {len(screens)} screens, {len(blocks)} block files, {len(outputs)} runtime scripts/styles; exact round trip verified.')

if __name__=='__main__': main()
