const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/ortak/acilis/bootstrap.js'),'utf8');
const functions=source.slice(0,source.indexOf('/* EOT_PART bootstrap.js-restoreOriginalBottomNav */'));
function setup(remote='228'){
 const redirects=[],timers=[];
 const context={URL,AbortController,APP_VERSION:'228',versionCheckRunning:false,console:{warn(){}},Date,
 location:{href:'https://game.test/?app=201#home',replace:url=>redirects.push(url)},
 window:{caches:{keys(){throw Error('must not erase caches')}}},navigator:{serviceWorker:{getRegistrations(){throw Error('must not unregister worker')}}},
 setTimeout:fn=>{timers.push(fn);return 1},clearTimeout(){},fetch:async()=>({ok:true,json:async()=>({version:remote})})};
 vm.createContext(context);vm.runInContext(functions,context);
 return {context,redirects,timers};
}
test('upgrading retains installed caches and worker and requests fresh HTML once',async()=>{
 const h=setup('229');await h.context.checkRemoteVersion();
 assert.equal(h.redirects.length,1);const url=new URL(h.redirects[0]);
 assert.equal(url.searchParams.get('v'),'229');assert(url.searchParams.has('_fresh'));assert.equal(url.hash,'#home');
});
test('stale server version cannot downgrade or cause reload loop',async()=>{
 const h=setup('227');await h.context.checkRemoteVersion();assert.equal(h.redirects.length,0);
});
test('unresponsive version check aborts and lets startup continue',async()=>{
 const h=setup();h.context.fetch=(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))));
 const checking=h.context.checkRemoteVersion();h.timers[0]();await checking;
 assert.equal(h.context.versionCheckRunning,false);assert.equal(h.redirects.length,0);
});
test('loaded version consumes refresh flag while preserving route and other query values',()=>{
 const core=fs.readFileSync(path.join(__dirname,'../src/ortak/bootstrap.js'),'utf8');
 const init=core.slice(core.indexOf('  const APP_VERSION='),core.indexOf('/* EOT_END */'));
 let result;
 vm.runInNewContext(init,{URL,location:{href:'https://game.test/?v=229&_fresh=1&app=201#home'},history:{state:{test:1},replaceState:(_state,_title,url)=>{result=new URL(url)}}});
 assert(!result.searchParams.has('_fresh'));assert.equal(result.searchParams.get('app'),'201');assert.equal(result.hash,'#home');
});
