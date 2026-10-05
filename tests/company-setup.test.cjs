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
 vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'window.testSetup={createCompany,openExistingAccount};})();'),context);
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
