"""Real Chromium layout and functionality checks for Empire of Trade v295 menus."""
import functools
import http.server
import pathlib
import threading
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
SHOTS=ROOT/"premium-menu-screenshots"
SHOTS.mkdir(exist_ok=True)
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
server=http.server.ThreadingHTTPServer(("127.0.0.1",8766),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
BASE="http://127.0.0.1:8766/?v=295"
SEED="""(() => {
 if(!localStorage.getItem('eot_premium_smoke_seeded')){
 localStorage.setItem('gs_current_account',JSON.stringify({id:'guest',name:'Arayüz Test Oyuncusu',provider:'guest'}));
 localStorage.setItem('gs124_cash','180000000');
 localStorage.setItem('gs132_sim',JSON.stringify({companyName:'Premium Test Şirketi',companyProfile:{established:true,name:'Premium Test Şirketi',city:'İstanbul',legalType:'Anonim Şirketi (A.Ş.)',capital:180000000,companyCash:0},companies:[],notifications:[],npcOffers:[],npcRefresh:0,employees:[],monthlyHistory:[],gameMonth:1,currentMonth:{revenue:0,expense:0,tax:0},cycleDue:Date.now()+300000}));
 localStorage.setItem('eot_premium_smoke_seeded','1');
 }
})()"""
def wait(page):
 page.goto(BASE+"#home",wait_until="domcontentloaded",timeout=90000)
 page.wait_for_function("window.__EOT_NATIVE_READY__ === true && !!window.EOTShowcaseV289 && !!document.querySelector('#home .eot-v289-view')",timeout=45000)
 page.wait_for_function("!document.documentElement.classList.contains('eot-booting') && !document.querySelector('#eotStartupSplash')",timeout=25000)
 page.wait_for_timeout(400)

def measure(page,width,route):
 result=page.evaluate("""() => {
 const b=document.querySelector('#eot-v289-hero').getBoundingClientRect();
 const nav=document.querySelector('.bottom-nav').getBoundingClientRect();
 const screen=document.querySelector('#'+location.hash.slice(1));
 const panel=screen.querySelector('.eot-v289-view').getBoundingClientRect();
 return {innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth,
   hero:[b.left,b.right,b.height],panel:[panel.left,panel.right,panel.width],nav:[nav.left,nav.right,nav.height],
   legacyVisible:[...screen.children].filter(e=>!e.classList.contains('eot-v289-view') && getComputedStyle(e).display!=='none').length,
   viewDisplay:getComputedStyle(screen.querySelector('.eot-v289-view')).display,
   appPaddingTop:parseFloat(getComputedStyle(document.querySelector('#app-root .app')).paddingTop),
   heroShown:getComputedStyle(document.querySelector('#eot-v289-hero')).display!=='none',
   topbarHidden:getComputedStyle(document.querySelector('.topbar')).display==='none',
   screenVisible:getComputedStyle(screen).display!=='none',
   appBackground:getComputedStyle(document.querySelector('#app-root .app')).backgroundImage};
 }""")
 assert result["scrollWidth"]<=width+3 and result["bodyScrollWidth"]<=width+3,(width,route,result)
 assert result["hero"][0]>=-1 and result["hero"][1]<=width+2,(width,route,result)
 assert result["panel"][0]>=-1 and result["panel"][1]<=width+2,(width,route,result)
 assert result["nav"][0]>=-1 and result["nav"][1]<=width+2,(width,route,result)
 assert result["nav"][2]<=90,(width,route,result)
 assert result["heroShown"] and result["topbarHidden"] and result["screenVisible"],(width,route,result)
 assert result["legacyVisible"]==0,(width,route,result)
 assert 'menu-background-v295.jpg' in result["appBackground"],(width,route,result)
 assert result["appPaddingTop"]==0,(width,route,result)
 if width>=1024: assert result["viewDisplay"]=="grid",(width,route,result)
 return result

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
 for width,height in [(320,750),(375,812),(390,844),(430,932),(768,1024),(1280,900),(844,390)]:
  mobile=width<850 and width!=768
  ctx=browser.new_context(viewport={"width":width,"height":height},is_mobile=mobile,has_touch=mobile,device_scale_factor=1)
  ctx.add_init_script(SEED)
  page=ctx.new_page()
  errors=[]
  page.on("pageerror",lambda e:errors.append(str(e)+" | STACK: "+str(getattr(e,"stack",""))))
  wait(page)
  page.wait_for_function("getComputedStyle(document.querySelector('#app-root .app')).backgroundImage.includes('menu-background-v295.jpg')",timeout=15000)
  assert not page.locator(".eot-v289-hero-logo").is_visible(),"Background already contains the Empire of Trade logo"
  assert page.evaluate("""async () => { const img=new Image(); return await new Promise(done=>{img.onload=()=>done(img.naturalWidth===710 && img.naturalHeight===1536);img.onerror=()=>done(false);img.src='./assets/menu-background-v295.jpg'}); }"""),"v295 background failed to load"
  assert page.locator(".eot-v289-hero-logo").evaluate("(e)=>e.complete&&e.naturalWidth>0"),"Game logo missing"
  for route in ["home","market","business","finance","profile"]:
   page.evaluate("(name)=>{location.hash='#'+name}",route)
   page.wait_for_function("(name)=>document.body.dataset.v289Route===name",arg=route,timeout=15000)
   page.wait_for_timeout(160)
   result=measure(page,width,route)
   assert page.locator("#"+route+" .eot-v289-view").is_visible()
   assert page.locator("#"+route+" .eot-v289-page-title").count()==1
   page.screenshot(path=str(SHOTS/(f"{route}-{width}.png")),full_page=False)
   if route=="home":
    true_cash=page.evaluate("cash")
    shown=page.locator("#eot-v289-cash").inner_text()
    expected=page.evaluate("() => '₺'+Number(cash||0).toLocaleString('tr-TR',{maximumFractionDigits:0})")
    assert shown==expected,(width,route,shown,expected,true_cash,errors)
   if route=="business":
    labels=page.locator(".eot-v289-business-card>b").all_text_contents()
    assert labels==["Mağazalar","Galeri","Fabrikalar","İnşaat","Gayrimenkul"],labels
   if route=="market":
    inp=page.locator("#eot-v289-market-search")
    inp.fill("Kripto")
    assert page.locator('#eot-v289-market-grid a:not([hidden])').count()==1
    inp.fill("zzyyxx-olmayan")
    assert page.locator("#eot-v289-market-empty").is_visible()
    inp.fill("")
    page.locator("#eot-v289-filter").click()
    page.locator('[data-filter="financial"]').click()
    assert page.locator('#eot-v289-market-grid a:not([hidden])').count()>=3
  page.evaluate("location.hash='#city'")
  page.wait_for_function("document.body.dataset.v289Route==='other'")
  assert not page.locator("#eot-v289-hero").is_visible(),"Hero leaked into map route"
  assert "menu-background-v295.jpg" not in page.evaluate("getComputedStyle(document.querySelector('#app-root .app')).backgroundImage"),"Shared background leaked into atlas"
  assert page.locator("#eot-atlas-map").count()==1,"Atlas not preserved"
  assert page.locator("#eot-atlas-map").is_visible()
  assert not errors, (width,errors[:8])
  print(f"{width}x{height}: five routes, profile, live values, search, filter, compact nav and atlas guard OK",flush=True)
  ctx.close()
 browser.close()
server.shutdown()
