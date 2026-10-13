'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),css=fs.readFileSync(path.join(root,'responsive-v285.css'),'utf8');
const latest=css.slice(css.indexOf('/* v286'));
const nav=fs.readFileSync(path.join(root,'bottom-nav-lock.js'),'utf8');
test('iOS pull at page top cannot expose rubber-band blank area',()=>{
 assert(latest.includes('overscroll-behavior-y:none!important'));
 assert(latest.includes('html:has(body.eot-design-v1:not(.eot-setting-up))'));
 assert(latest.includes('scroll-margin-top:0!important'));
 assert(nav.includes('#home,#profile,#finance{scroll-margin-top:0!important}'));
 assert(!nav.includes('scroll-margin-top:220px!important'));
 assert(!latest.includes('touchmove'));
});
test('navigation is compact and floats above the iOS home indicator',()=>{
 assert(latest.includes('bottom:calc(env(safe-area-inset-bottom,0px) + 8px)!important'));
 assert(latest.includes('height:58px!important;min-height:58px!important;max-height:58px!important'));
 assert(latest.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
 assert(latest.includes('height:56px!important;min-height:56px!important;max-height:56px!important'));
 assert(nav.includes('height:58px!important;min-height:58px!important'));
 assert(!nav.includes('height:76px!important;min-height:76px!important'));
 const shell=fs.readFileSync(path.join(root,'src/ortak/shell.html'),'utf8');
 for(const href of ['#home','#market','#business','#finance','#profile'])assert(shell.includes('href="'+href+'"'));
});
test('navigation source mirrors and onboarding remain unchanged',()=>{
 assert.equal(nav,fs.readFileSync(path.join(root,'src/ortak/eklentiler/bottom-nav-lock.js'),'utf8'));
 const company=fs.readFileSync(path.join(root,'company-onboarding.js'),'utf8');
 assert(company.includes('id="eotCompanySubmit"'));
 const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert(worker.includes('responsive-v285.css?v=287'));
});
