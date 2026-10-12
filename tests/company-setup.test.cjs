const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../company-onboarding.js'),'utf8');
function setup(){
 const fields=Object.fromEntries(Object.entries({eotCompanyName:'Atlas',eotCompanyCeo:'Emirhan',eotCompanyTitle:'Anonim Şirketi (A.Ş.)',eotCompanyCity:'İstanbul',eotCompanySetupError:''}).map(([id,value])=>[id,{value,textContent:''}]));
 let hidden=false,released=0,opened=0,saved=[];
 fields.eotCompanySetup={classList:{remove(){hidden=true},add(){hidden=false}}};
 const data=new Map();
 const context={window:{addEventListener(){},scrollTo(){},EOTReleaseCompanyBootGate(){released++}},document:{readyState:'loading',addEventListener(){},getElementById:id=>fields[id],body:{style:{},classList:{add(){},remove(){}}}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},sim:{companies:[],companyProfile:{established:false},cash:12345},currentAccount:()=>null,simSave(){saved.push(JSON.parse(JSON.stringify(context.sim)))},location:{hash:''},setTimeout(){},requestAnimationFrame(){}};
 vm.createContext(context);
 vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'window.testSetup={createCompany,openExistingAccount,buildOverlay};})();'),context);
 return {context,fields,data,saved,api:context.window.testSetup,state:()=>({hidden,released,opened}),enableLogin(){fields.accountOverlay={};context.showAccountOverlay=()=>opened++;context.setAccountMode=()=>{}}};
}
test('invalid company or CEO never changes career or saves partial CEO',()=>{
 const h=setup();const before=JSON.stringify(h.context.sim);
 h.fields.eotCompanyName.value='a';assert.equal(h.api.createCompany(),false);
 h.fields.eotCompanyName.value='Atlas';h.fields.eotCompanyCeo.value='';assert.equal(h.api.createCompany(),false);
 assert.equal(JSON.stringify(h.context.sim),before);assert.equal(h.saved.length,0);assert.equal(h.data.size,0);
});
test('CEO is in first guest save; repeated submission preserves original company',()=>{
 const h=setup();assert.equal(h.api.createCompany(),true);
 assert.equal(h.saved[0].companyProfile.ceoName,'Emirhan');
 assert.equal(h.saved[0].companies[0].ceoName,'Emirhan');
 const id=h.context.sim.companies[0].id;
 h.fields.eotCompanyName.value='Replacement';assert.equal(h.api.createCompany(),false);
 assert.equal(h.context.sim.companies.length,1);assert.equal(h.context.sim.companies[0].id,id);assert.equal(h.context.sim.companies[0].name,'Atlas');
});
test('login stays on setup until account overlay exists, then opens real login',()=>{
 const h=setup();assert.equal(h.api.openExistingAccount(),false);assert.equal(h.state().hidden,false);
 h.enableLogin();assert.equal(h.api.openExistingAccount(),true);assert.deepEqual(h.state(),{hidden:true,released:1,opened:1});
});
test('first visible loading shell does not wait on external styles or scripts',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
 assert(html.indexOf('id="eot-startup-inline"')<html.indexOf('<script defer src='));
 assert(!html.includes('eotFirstPaint'));
 assert(!html.includes('apple-touch-startup-image'));
 assert(!/<script[^>]+src="startup-splash/.test(html));
 const splash=fs.readFileSync(require('node:path').join(__dirname,'../startup-splash.js'),'utf8');
 assert(html.includes(splash), 'inline splash must match the single source');
 for(const tag of html.match(/<script[^>]+src=[^>]+>/g)||[])assert(/\bdefer\b/.test(tag),tag);
 for(const tag of html.match(/<link[^>]+rel="stylesheet"[^>]+>/g)||[])assert(/media="print"/.test(tag),tag);
});

test('native company form leaves focus and touch events to the browser',()=>{
 const h=setup(),listeners={},nodes=h.fields;
 delete nodes.eotCompanySetup;
 nodes.eotCompanyForm={addEventListener(type,fn){listeners[type]=fn}};
 nodes.eotRandomCompanyName={};nodes.eotCompanySubmit={};nodes.eotExistingLogin={};
 let markup='';
 h.context.document.createElement=()=>({set innerHTML(v){markup=v},querySelector:s=>nodes[s.slice(1)]});
 h.context.document.body.appendChild=el=>{nodes.eotCompanySetup=el};
 h.api.buildOverlay();
 assert.deepEqual(Object.keys(listeners),['submit']);
 assert.match(markup,/<form id="eotCompanyForm"/);
 assert.match(markup,/<button type="submit"[^>]+id="eotCompanySubmit"/);
 assert(markup.indexOf('id="eotCompanyCeo"')<markup.indexOf('id="eotCompanyTitle"'),'both editable fields precede selectors');
 assert(!/touchstart|touchend|preventScroll|visualViewport|\.focus\(/.test(source),'no scripted interception of native input focus');
 h.fields.eotCompanyName.value='a';let prevented=false;
 listeners.submit({preventDefault(){prevented=true}});
 assert(prevented);assert.equal(h.saved.length,0);assert(h.fields.eotCompanySetupError.textContent);
});

test('company setup suppresses periodic repaint without stopping economic ticks',()=>{
 const app=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
 const timers=new Map(),calls=[];let visible=true;
 const c={document:{body:{classList:{contains:()=>visible}}},setInterval(fn,ms){timers.set(ms,fn)}};
 for(const name of ['movePrices','updateOps','renderFinanceExtras','renderGameExtras','renderEconomy','renderSimulation','render'])c[name]=()=>calls.push(name);
 vm.runInNewContext(app.slice(app.indexOf('function companySetupVisible()'),app.indexOf('renderAccountState();',app.indexOf('function companySetupVisible()'))),c);
 timers.forEach(fn=>fn());assert.deepEqual(calls,['movePrices','updateOps']);
 calls.length=0;visible=false;timers.forEach(fn=>fn());
 assert.deepEqual(calls,['movePrices','renderFinanceExtras','renderGameExtras','updateOps','renderEconomy','renderSimulation','render','renderFinanceExtras','renderGameExtras']);
});

test('iOS company canvas fills the home-indicator area without scrolling the page',()=>{
 const css=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 const mobile=css.slice(css.indexOf('/* Company creation:'));
 assert.match(mobile,/html\\.eot-company-surface\\{[^}]*min-height:100vh!important/);
 assert.match(mobile,/body\\.eot-setting-up\\{position:fixed!important;inset:0!important/);
 assert.match(mobile,/body\\.eot-setting-up #eotCompanySetup\\.show\\{display:block;position:fixed!important;inset:0!important/);
 assert.match(mobile,/#eotCompanySetup\\.show\\{[^}]*height:100vh!important/);
 assert.doesNotMatch(mobile,/height:100svh/);
 assert.match(mobile,/#eotCompanySetup \\.eot-setup-shell\\{[^}]*max-height:100%/);
 assert.match(mobile,/#eotCompanySetup \\.eot-setup-shell\\{[^}]*overflow-y:auto/);
 assert.match(mobile,/@media\\(max-width:899px\\)\\{[\\s\\S]*?#eotCompanySetup\\.show\\{padding-left:18px;padding-right:18px;background:transparent!important/);
});
