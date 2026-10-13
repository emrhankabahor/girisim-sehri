'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(dir,'responsive-v285.css'),'utf8');
test('mobile header clears native iPhone status bar and fixed navigation reserves safe-area',()=>{
 assert(css.includes('max(44px,env(safe-area-inset-top,0px))'));
 assert(css.includes('padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))'));
 assert(css.includes('height:calc(62px + env(safe-area-inset-bottom,0px))'));
 assert(css.includes('position:relative!important;top:auto!important'));
 assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'));
});
test('all five main pages are covered by responsive premium styles without changing game data',()=>{
 for(const token of ['#home .eot-wallet-card','#home .eot-profile-main','#home .eot-tier','#home .eot-business-grid','#market .market-feature-card','#business .companies-header-card','#finance .finance-meta','#profile .profile-card'])
  assert(css.includes(token),'Missing style '+token);
 assert(css.includes('body.eot-design-v1:not(.eot-setting-up)'));
 assert(!css.includes('localStorage'));
 assert(!css.includes('#eotCompanySetup'));
 assert(css.includes('@media(max-width:380px)'));
});
test('style is loaded and pre-cached while native setup stays intact',()=>{
 const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
 const company=fs.readFileSync(path.join(dir,'company-onboarding.js'),'utf8');
 assert(index.includes('responsive-v285.css?v=286'));
 assert(sw.includes("'./responsive-v285.css?v=286'"));
 assert(company.includes('id="eotCompanySubmit"'));
 assert(fs.readFileSync(path.join(dir,'interface-theme.css'),'utf8').includes('company-background-v283.jpg'));
});
