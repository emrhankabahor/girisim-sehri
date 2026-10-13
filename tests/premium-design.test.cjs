'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const repo=path.resolve(__dirname,'..');
const theme=fs.readFileSync(path.join(repo,'interface-theme.css'),'utf8');
const rule=theme.slice(theme.indexOf('/* Empire Premium UI v284'));
test('premium UI applies across five primary screens without modifying company setup',()=>{
 assert(rule.length>6000);
 assert(rule.includes('body.eot-design-v1:not(.eot-setting-up)'));
 for(const k of ['.eot-wallet-card','.eot-profile-stats','.eot-business','.menu-card','.finance-hero','.companies-header-card','.bottom-nav','.nav-ico svg'])
   assert(rule.includes(k),'Missing premium coverage '+k);
 assert(!rule.includes('eotCompanySetup'));
});
test('premium nav preserves five route targets and correct mobile limits',()=>{
 const shell=fs.readFileSync(path.join(repo,'src/ortak/shell.html'),'utf8');
 for(const p of ['#home','#market','#business','#finance','#profile'])
   assert(shell.includes('class="nav-btn" href="'+p+'"'));
 assert(rule.includes('@media(max-width:390px)'));
 assert(rule.includes('@media(prefers-reduced-motion:reduce)'));
 assert(rule.includes(':active'));
});
test('premium UI changes only presentation and keeps original company background',()=>{
 const setup=fs.readFileSync(path.join(repo,'company-onboarding.js'),'utf8');
 assert(setup.includes('id="eotCompanySubmit"'));
 assert(theme.includes('company-background-v283.jpg'));
 assert.equal(theme,fs.readFileSync(path.join(repo,'src/ortak/stiller/interface-theme.css'),'utf8'));
});
