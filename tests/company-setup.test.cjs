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
 vm.runInContext(source.replace(/\}\)\(\);\s*$/, 'window.testSetup={createCompany,openExistingAccount,fitSetupViewport,scheduleSetupViewport,installSetupTouchFocus};})();'),context);
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

function viewportHarness(standalone=false){
 const h=setup(),styles={},classes=new Set(['show']),input={tagName:'INPUT'};
 h.context.document.activeElement=null;
 Object.assign(h.context.window,{innerHeight:896,innerWidth:414,navigator:{standalone},visualViewport:{height:standalone?852:896,offsetTop:0}});
 h.fields.eotCompanySetup={style:{setProperty(k,v){styles[k]=v}},contains:e=>e===input,classList:{contains:k=>classes.has(k)}};
 h.api.fitSetupViewport();return {h,styles,classes,input};
}
for(const standalone of [false,true])test(`keyboard preserves initial canvas through focus, pan, blur and dismissal (standalone=${standalone})`,()=>{
 const {h,styles,classes,input}=viewportHarness(standalone);
 assert.equal(styles['--eot-setup-height'],'896px');
 h.context.document.activeElement=input;
 for(const height of [810,690,460]){
  h.context.window.visualViewport={height,offsetTop:44};h.api.fitSetupViewport();
  assert.equal(styles['--eot-setup-height'],'896px');assert.equal(styles['--eot-setup-top'],'44px');
 }
 h.context.document.activeElement=null;h.api.fitSetupViewport();
 assert.equal(styles['--eot-setup-height'],'896px','blur must not shrink canvas before dismissal');
 for(const height of [550,700,810]){h.context.window.visualViewport.height=height;h.api.fitSetupViewport();assert.equal(styles['--eot-setup-height'],'896px');}
 h.context.window.visualViewport={height:standalone?852:896,offsetTop:0};h.api.fitSetupViewport();
 assert.equal(styles['--eot-setup-height'],'896px');assert.equal(styles['--eot-setup-top'],'0px');
 classes.delete('show');h.context.window.visualViewport.height=300;h.api.fitSetupViewport();assert.equal(styles['--eot-setup-height'],'896px');
});
test('rotation establishes a new canvas and viewport bursts coalesce',()=>{
 const {h,styles,input}=viewportHarness();const frames=[];
 h.context.requestAnimationFrame=fn=>frames.push(fn);h.context.document.activeElement=input;
 Object.assign(h.context.window,{innerWidth:896,innerHeight:414,visualViewport:{height:414,offsetTop:0}});
 for(let i=0;i<50;i++)h.api.scheduleSetupViewport();assert.equal(frames.length,1);
 frames.shift()();assert.equal(styles['--eot-setup-height'],'414px');
});
test('a text tap focuses synchronously; caret taps, dragging, multitouch and other controls remain native',()=>{
 const h=setup(),events={},options={};let focuses=0,cancelled=0;
 h.api.installSetupTouchFocus({addEventListener(name,fn,opts){events[name]=fn;options[name]=opts}});
 const input={tagName:'INPUT',type:'text',focus(opts){assert.equal(opts.preventScroll,true);focuses++;h.context.document.activeElement=this}};
 const event=(target=input,touches=[])=>({target,touches,cancelable:true,preventDefault(){cancelled++}});
 const begin=target=>events.touchstart(event(target,[{clientX:10,clientY:10}]));
 begin(input);events.touchend(event());assert.equal(focuses,1);assert.equal(cancelled,1);
 begin(input);events.touchend(event());assert.equal(focuses,1);assert.equal(cancelled,1);
 h.context.document.activeElement=null;begin(input);
 events.touchmove(event(input,[{clientX:10,clientY:40}]));events.touchend(event());assert.equal(focuses,1);
 begin(input);events.touchcancel();events.touchend(event());assert.equal(focuses,1);
 events.touchstart(event(input,[{},{}]));events.touchend(event());assert.equal(focuses,1);
 const select={tagName:'SELECT'};begin(select);events.touchend(event(select));assert.equal(cancelled,1);
 assert.equal(options.touchend.passive,false);
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
