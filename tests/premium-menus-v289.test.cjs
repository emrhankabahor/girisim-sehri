'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),get=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=get('premium-menus-v289.js'),css=get('premium-menus-v289.css'),html=get('index.html'),sw=get('sw.js');
test('five reference-inspired visual menus have the original real-game routes',()=>{
 for(const t of ['makeHome','makeMarket','makeBusiness','makeFinance','makeProfile'])assert(js.includes('function '+t+'('),t);
 for(const route of ['#city','#estate','#cars','#company_center','#stocks','#crypto','#gold','#bank','#myassets'])assert(js.includes(route),route);
 assert(js.includes('eot-v289-hero-logo'));
 assert(js.includes('Array.isArray(arr)?arr:[]'));
 assert(js.includes('transactions:Array.isArray'));
 assert(js.includes('eot-v289-page-title'));
 assert(css.includes('background:radial-gradient'));
 assert(css.includes('url(\'./assets/opening-city-v218.webp\')'));
});
test('financial and profile text reads game state, does not embed fictional balances or achievements',()=>{
 for(const k of ['totalWealth()','cash','creditScore','sim.companies','ownedAssets','stats(\'stock\')','tx','currentAccount()','gameLevel()'])assert(js.includes(k),k);
 assert(!js.includes('localStorage.setItem('));
 assert(!js.includes('850000'));
 assert(!js.includes('12.450.000'));
 assert(!js.includes('2025'));
 assert(js.includes('Sonuç bulunamadı')===false);
});
test('five new menus do not hide or replace company onboarding, land map, or other routes',()=>{
 assert(css.includes('body:not(.eot-v289-main) #eot-v289-hero'));
 assert(css.includes('body.eot-setting-up #eot-v289-hero'));
 assert(css.includes('.screen.eot-v289-mounted>*:not(.eot-v289-view)'));
 assert(js.includes("routes=['home','market','business','finance','profile']"));
 assert(html.includes('premium-menus-v289.css?v=293'));
 assert(html.includes('premium-menus-v289.js?v=293'));
 assert(sw.includes('premium-menus-v289.css?v=293'));
 assert(sw.includes('premium-menus-v289.js?v=293'));
 assert.equal(sw,get('src/ortak/eklentiler/sw.js'));
});
test('compact responsive layouts and native five-tab bar preserved',()=>{
 assert(css.includes('@media(max-width:375px)'));
 assert(css.includes('@media(min-width:768px)'));
 assert(css.includes('body.eot-v289-main:not(.eot-setting-up)>.bottom-nav'));
 assert(js.includes("window.addEventListener('hashchange',updateRoute)"));
});

test('v293: dense three-column market layout and live monthly cashflow',()=>{
 assert(js.includes('operatingStats().net'));
 assert(!js.includes('operatingSummary().net'));
 assert(css.includes('@media(min-width:345px) and (max-width:767px)'));
 assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))!important'));
 assert(css.includes('border-radius:50% / 44%'));
});
