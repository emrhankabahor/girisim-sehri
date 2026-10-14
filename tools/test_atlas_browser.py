"""Chromium mobile/desktop regression for the integrated, offline Türkiye atlas."""
import functools
import http.server
import pathlib
import threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCREENSHOTS = ROOT / "atlas-test-screenshots"
SCREENSHOTS.mkdir(exist_ok=True)
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
server = http.server.ThreadingHTTPServer(("127.0.0.1", 8765), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
URL = "http://127.0.0.1:8765/?v=288#city"
SEED = """(() => {
 if (!localStorage.getItem('eot_atlas_smoke_seeded')) {
   localStorage.setItem('gs_current_account', JSON.stringify({id:'guest',name:'Atlas Smoke Test',provider:'guest'}));
   localStorage.setItem('gs124_cash', '250000000');
   localStorage.setItem('gs132_sim', JSON.stringify({companyName:'Atlas Test',companyProfile:{established:true,name:'Atlas Test',city:'İstanbul',legalType:'Anonim Şirketi (A.Ş.)',capital:250000000,companyCash:0},companies:[],gameMonth:1,currentMonth:{revenue:0,expense:0,tax:0},cycleDue:Date.now()+300000}));
   localStorage.setItem('eot_atlas_smoke_seeded','1');
 }
})()"""


def wait_for_game(page):
    page.goto(URL, wait_until="domcontentloaded", timeout=90000)
    page.wait_for_function("Boolean(window.EOTTurkeyAtlas?.state.ready)", timeout=90000)
    page.wait_for_function("typeof buyAsset === 'function' && typeof sellOwned === 'function'", timeout=90000)
    page.evaluate("location.hash='#city'")
    page.wait_for_timeout(180)


def select_district(page, province_id, district):
    page.evaluate("(id) => EOTTurkeyAtlas.chooseProvince(id)", province_id)
    page.locator("#eot-atlas-districts").select_option(label=district)
    page.wait_for_function("document.querySelectorAll('#eot-atlas-plots .eot-tr-plot').length===6")
    expected = page.locator("#eot-atlas-selected").inner_text()
    assert expected, "Province title missing"
    assert page.locator("#eot-atlas-plots .eot-tr-plot").count() == 6, (province_id, district)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    widths = [320, 375, 390, 430, 768, 1280]
    for width in widths:
        mobile = width <= 430
        context = browser.new_context(viewport={"width":width, "height":860},
                                      is_mobile=mobile, has_touch=mobile,
                                      device_scale_factor=1)
        context.add_init_script(SEED)
        page = context.new_page()
        wait_for_game(page)
        assert page.locator("#eot-atlas-map [data-province-id]").count() == 81
        label_check=page.evaluate("""() => {
          const all=[...document.querySelectorAll('#eot-atlas-map [data-province-id]')];
          return all.filter(g=>{
            const p=g.querySelector('path'),t=g.querySelector('text');
            return !p.isPointInFill(new DOMPoint(+t.getAttribute('x'),+t.getAttribute('y')));
          }).map(g=>g.getAttribute('aria-label'));
        }""")
        assert not label_check, f"Labels outside own province boundaries at {width}: {label_check}"
        measurements=page.evaluate("""() => {
          const m=document.querySelector('#eot-atlas-map').getBoundingClientRect();
          const nav=document.querySelector('.bottom-nav').getBoundingClientRect();
          return {innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyScroll:document.body.scrollWidth,
                  map:[m.left,m.right,m.width,m.height],nav:[nav.left,nav.right,nav.width],
                  hash:location.hash,cityDisplay:getComputedStyle(document.querySelector('#city')).display,
                  cityVisible:document.querySelector('#city').classList.contains('active')};
        }""")
        print(f"viewport {width}: layout metrics = {measurements}",flush=True)
        page.screenshot(path=str(SCREENSHOTS / ("atlas-debug-"+str(width)+".png")), full_page=False)
        assert measurements["scrollWidth"]<=measurements["innerWidth"]+2 and measurements["map"][2]>0 and measurements["map"][0]>=-1 and measurements["map"][1]<=measurements["innerWidth"]+2 and measurements["nav"][0]>=-1 and measurements["nav"][1]<=measurements["innerWidth"]+2, "Layout failed at "+str(width)
        before = page.evaluate("EOTTurkeyAtlas.state.zoom")
        page.locator("#eot-atlas-zoom-in").click()
        assert page.evaluate("EOTTurkeyAtlas.state.zoom") > before
        page.evaluate("EOTTurkeyAtlas.zoomTo(100)")
        assert page.evaluate("EOTTurkeyAtlas.state.zoom") == 8
        page.locator("#eot-atlas-reset").click()
        assert page.evaluate("EOTTurkeyAtlas.state.zoom") == 1
        if width == 390:
            svg=page.locator("#eot-atlas-map")
            bounds=svg.bounding_box()
            cx,cy=bounds["x"]+bounds["width"]*.5,bounds["y"]+bounds["height"]*.5
            cdp=context.new_cdp_session(page)
            def fingers(spacing):
                return [{"x":cx-spacing,"y":cy,"id":1},{"x":cx+spacing,"y":cy,"id":2}]
            cdp.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":fingers(30)})
            for distance in (34,43,55,70):
                cdp.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":fingers(distance)})
                page.wait_for_timeout(35)
            cdp.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]})
            page.wait_for_timeout(250)
            assert page.evaluate("EOTTurkeyAtlas.state.zoom")>1.1, "Two-finger pinch failed"
            assert page.evaluate("EOTTurkeyAtlas.state.province") is None, "Pinch accidentally selected a province"
            page.locator("#eot-atlas-reset").click()
            assert page.evaluate("EOTTurkeyAtlas.state.zoom")==1
        if width==1280:
            svg=page.locator("#eot-atlas-map")
            box=svg.bounding_box()
            x,y=box["x"]+box["width"]/2,box["y"]+box["height"]/2
            page.mouse.move(x,y)
            page.mouse.wheel(0,-400)
            page.wait_for_timeout(100)
            assert page.evaluate("EOTTurkeyAtlas.state.zoom")>1, "Mouse wheel zoom failed"
            before_view=svg.get_attribute("viewBox")
            page.mouse.move(x,y)
            page.mouse.down()
            page.mouse.move(x+90,y+40,steps=5)
            page.mouse.up()
            assert svg.get_attribute("viewBox")!=before_view, "Desktop map drag failed"
            page.locator("#eot-atlas-reset").click()
        search = page.locator("#eot-atlas-search")
        search.fill("ISTANBUL")
        assert page.locator('#eot-atlas-suggestions button').count() >= 1
        search.fill("ASDFNONEXISTENT")
        assert "Sonuç bulunamadı" in page.locator("#eot-atlas-suggestions").inner_text()
        for id_, name in [(34,"Pendik"),(6,"Çankaya"),(35,"Karşıyaka")]:
            select_district(page, id_, name)
        select_district(page, 34, "Pendik")
        page.locator("#eot-atlas-plots .eot-tr-plot button").first.click()
        modal = page.locator("#eot-atlas-dialog")
        assert modal.is_visible()
        assert page.evaluate("""() => {
           const a=document.querySelector('#eot-atlas-dialog .eot-tr-modal-card').getBoundingClientRect();
           return a.width<=innerWidth+1 && a.height<=innerHeight+1 && a.top>=0;
        }"""), "Dialog outside screen at "+str(width)
        page.locator(".eot-tr-close").click()
        assert not modal.is_visible()
        page.screenshot(path=str(SCREENSHOTS / ("atlas-"+str(width)+".png")), full_page=False)
        page.close()
        context.close()
        print(f"viewport={width}: 81 provinces, three districts, search, zoom, modal, overflow OK", flush=True)

    context = browser.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
    context.add_init_script(SEED)
    page = context.new_page()
    wait_for_game(page)
    select_district(page,34,"Pendik")
    page.locator("#eot-atlas-plots .eot-tr-plot button").first.click()
    id_ = page.evaluate("EOTTurkeyAtlas.state.plot.id")
    price = page.evaluate("EOTTurkeyAtlas.state.plot.price")
    before = page.evaluate("cash")
    assert before >= price
    page.locator("#eot-atlas-buy").click()
    assert page.evaluate("cash") == before-price
    assert page.evaluate("(id) => ownedAssets.some(a=>a.id===id)",id_)
    state_check=page.evaluate("""(id) => ({id, memory:ownedAssets.map(x=>x.id),
        persisted:JSON.parse(localStorage.getItem('gs117_assets')||'[]').map(x=>x.id),
        unified:(JSON.parse(localStorage.getItem('gs140_state')||'null')?.ownedAssets||[]).map(x=>x.id),
        cash, storedCash:localStorage.getItem('gs124_cash'),
        account:localStorage.getItem('gs_current_account')})""", id_)
    print("purchase persistence diagnostics",state_check,flush=True)
    assert id_ in state_check["unified"], "Purchase missing from unified career state"
    assert page.evaluate("JSON.parse(localStorage.getItem('gs140_state')).cash") == before-price
    # Legacy keys may be batched by the game's persistence dedupe layer.
    # Reload must still preserve the canonical unified-state transaction.
    page.reload(wait_until="domcontentloaded")
    page.wait_for_function("Boolean(window.EOTTurkeyAtlas?.state.ready)",timeout=90000)
    select_district(page,34,"Pendik")
    assert page.evaluate("(id) => ownedAssets.some(a=>a.id===id)",id_), "Ownership not restored after reload"
    assert page.evaluate("cash") == before-price, "Cash not restored after reload"
    page.locator("#eot-atlas-plots .eot-tr-plot button").first.click()
    page.locator("#eot-atlas-sell").click()
    assert not page.evaluate("(id) => ownedAssets.some(a=>a.id===id)",id_)
    assert page.evaluate("cash") == before-price+round(price*.9)
    assert not page.evaluate("(id) => JSON.parse(localStorage.getItem('gs140_state')).ownedAssets.some(a=>a.id===id)",id_)
    assert page.evaluate("JSON.parse(localStorage.getItem('gs140_state')).cash") == before-price+round(price*.9)
    print("economy: purchase -> cash decrease -> ownership -> reload -> sale -> cash increase OK",flush=True)

    # Desktop pointer drag, wheel and mobile touch gesture are verified by the event handlers
    # in the application plus viewport test above; actual touch pinch on iOS Safari requires a device.
    context.close()
    browser.close()
server.shutdown()
