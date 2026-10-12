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

test('company setup removes back button, sectors, capital and credit preview',()=>{
 const markupSource=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 assert(!markupSource.includes('eotSetupBack'));
 assert(!markupSource.includes('eot-sector-panel'));
 assert(!markupSource.includes('eot-setup-finance'));
 assert(!markupSource.includes('eotSetupCapital'));
 assert(!markupSource.includes('eotSetupCredit'));
 assert(markupSource.includes('id="eotCompanyName"'));
 assert(markupSource.includes('id="eotCompanyCeo"'));
 assert(markupSource.includes('id="eotCompanyTitle"'));
 assert(markupSource.includes('id="eotCompanyCity"'));
 assert(markupSource.includes('id="eotExistingLogin"'));
});
test('company creation uses general trade when no sector choice is shown',()=>{
 const h=setup();
 assert.equal(h.api.createCompany(),true);
 assert.equal(h.saved[0].companyProfile.sector,'Genel Ticaret');
 assert.equal(h.saved[0].companies[0].capital,0);
 assert.equal(h.saved[0].companies[0].companyCash,0);
});
test('company canvas stays full-screen with native input and existing city asset',()=>{
 const style=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 const section=style.slice(style.indexOf('/* Empire of Trade v278'));
 assert(section.includes('position:fixed!important;inset:0!important'));
 assert(section.includes('height:100vh!important'));
 assert(section.includes('overflow:hidden!important'));
 assert(section.includes('opening-city-v217.webp'));
 assert(section.includes('repeating-radial-gradient('));
 assert(!section.includes('eot-sector-choice'));
 assert(!section.includes('eot-finance-block'));
 assert(!section.includes('100svh'));
});

test('reference skyline is sourced from user screenshot and has no duplicate form artwork',()=>{
 const t=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 assert(t.includes('company-ref-skyline-v279.webp'));
 assert(t.includes('company-ref-stage-v279.webp'));
 for(const a of ['company-ref-skyline-v279.webp','company-ref-stage-v279.webp']){
  assert(fs.statSync(require('node:path').join(__dirname,'../assets',a)).size>1000);
 }
});
test('native company fields use consistent inline vector icons instead of font symbols',()=>{
 const excerpt=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 for(const s of ['eotCompanyName','eotCompanyCeo','eotCompanyTitle','eotCompanyCity'])
   assert(excerpt.includes('id="'+s+'"'));
 assert((excerpt.match(/<svg viewBox=/g)||[]).length>=4);
 assert(!excerpt.includes('aria-hidden="true">♟'));
 assert(!excerpt.includes('aria-hidden="true">⌖'));
});

test('full user-provided picture is the only company background, and logo is not duplicated',()=>{
 const sheet=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 const rule=sheet.slice(sheet.indexOf('/* v280'));
 assert(rule.includes("background-image:url('./assets/company-background-v280.avif')!important"));
 assert(rule.includes('background-size:cover!important'));
 assert(rule.includes('content:none!important;display:none!important'));
 assert(!rule.includes('company-ref-stage-v279.webp'));
 assert(!rule.includes('company-ref-skyline-v279.webp'));
 const markup=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 assert(markup.includes('<div class="eot-setup-brand" aria-hidden="true"></div>'));
 assert(!markup.includes('logo-v221-512.png'));
 for(const field of ['eotCompanyName','eotCompanyCeo','eotCompanyTitle','eotCompanyCity','eotCompanySubmit'])assert(markup.includes('id="'+field+'"'));
 const file=fs.statSync(require('node:path').join(__dirname,'../assets/company-background-v280.avif'));
 assert(file.size>20000);
 const worker=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
 assert(worker.includes("'./assets/company-background-v280.avif'"));
});

test('v281 removes the decorative company title without removing company creation',()=>{
 const markup=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 assert(!markup.includes('eot-setup-banner'));
 assert(!markup.includes('id="eotSetupTitle"'));
 assert(markup.includes('aria-label="Şirket oluşturma formu"'));
 assert(markup.includes('id="eotCompanySubmit"'));
 assert(markup.includes('type="submit"'));
 assert(markup.includes('id="eotExistingLogin"'));
});
test('v281 keeps setup fixed except for focused native keyboard inputs',()=>{
 const style=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 const css=style.slice(style.indexOf('/* v281'));
 assert(css.includes('overflow:hidden!important'));
 assert(css.includes('#eotCompanySetup .eot-setup-shell:focus-within'));
 assert(css.includes('overflow-x:hidden!important;overflow-y:auto!important'));
 assert(css.includes('touch-action:pan-y'));
 assert(style.includes('company-background-v280.avif'));
});

test('v282 company creation button contains only centered text',()=>{
 const markup=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 const start=markup.indexOf('<button type="submit" class="eot-company-submit" id="eotCompanySubmit">');
 assert(start>=0,'submit button remains');
 const inner=markup.slice(start).split('</button>')[0].split('id="eotCompanySubmit">')[1];
 assert.equal(inner,'Şirketi Kur');
 assert(!inner.includes('<svg'));
 assert(!inner.includes('eot-submit-arrow'));
 const sheet=fs.readFileSync(require('node:path').join(__dirname,'../interface-theme.css'),'utf8');
 const css=sheet.slice(sheet.indexOf('/* v282'));
 assert(css.includes('width:min(100%,440px)!important'));
 assert(css.includes('justify-content:center!important'));
 assert(css.includes('text-align:center!important'));
 assert(sheet.includes('company-background-v280.avif'));
});

test('v283 uses the exact supplied JPEG without compressing or duplicating the logo',()=>{
 const fs=require('node:fs');
 const path=require('node:path');
 const image=fs.readFileSync(path.join(__dirname,'../assets/company-background-v283.jpg'));
 assert.equal(image.length,478093,'original JPEG byte count');
 assert.equal(image[0],0xff);
 assert.equal(image[1],0xd8);
 assert.equal(image[image.length-2],0xff);
 assert.equal(image[image.length-1],0xd9);
 const css=fs.readFileSync(path.join(__dirname,'../interface-theme.css'),'utf8');
 const last=css.slice(css.indexOf('/* v283:'));
 assert(last.includes("background-image:url('./assets/company-background-v283.jpg')!important"));
 assert(last.includes('background-size:cover!important'));
 const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
 assert(worker.includes("'./assets/company-background-v283.jpg'"));
 const markup=source.slice(source.indexOf('ov.innerHTML='),source.indexOf('document.body.appendChild(ov)'));
 assert(!markup.includes('logo-v221-512.png'));
 assert(markup.includes('id="eotCompanySubmit"'));
});
