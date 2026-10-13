'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(base,'responsive-v285.css'),'utf8');
const header=css.slice(css.indexOf('/* EOT v287'));
test('v287 header uses one transparent surface and no stacked text treatments',()=>{
 assert(header.includes('.topbar{'));
 assert(header.includes('background:transparent!important'));
 assert(header.includes('backdrop-filter:none!important'));
 assert(header.includes('box-shadow:none!important'));
 assert(header.includes('-webkit-text-stroke:0 transparent!important'));
 assert(header.includes('transform:none!important'));
 assert(header.includes('text-shadow:none!important'));
 assert(header.includes('grid-template-columns:44px minmax(0,1fr) 44px'));
});
test('header preserves native iPhone safe area and original title/logo/actions',()=>{
 const shell=fs.readFileSync(path.join(base,'index.html'),'utf8');
 assert(header.includes('max(44px,env(safe-area-inset-top,0px))'));
 assert(header.includes('.eot-app-logo'));
 assert(header.includes('.eot-top-action'));
 assert(header.includes('.eot-badge'));
 assert(shell.includes('responsive-v285.css?v=287'));
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 assert(sw.includes('responsive-v285.css?v=287'));
});
test('v287 retains v286 overscroll and floating nav styles',()=>{
 assert(css.includes('overscroll-behavior-y:none!important'));
 assert(css.includes('height:58px!important;min-height:58px!important;max-height:58px!important'));
 assert(header.length>2500);
 assert(!header.includes('.bottom-nav'));
 const original=fs.readFileSync(path.join(base,'company-onboarding.js'),'utf8');
 assert(original.includes('id="eotCompanySubmit"'));
});
