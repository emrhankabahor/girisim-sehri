const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../transition-performance.js'),'utf8');
const names=['save','simSave','saveOwned','saveDeposits','saveAccountCareer'];

function setup(idle=true){
  let time=0,id=0;
  const timers=new Map(),idleTasks=[],writes=[];
  function target(){const handlers={};return {
    addEventListener(type,fn){(handlers[type]??=[]).push(fn)},
    dispatchEvent(e){for(const fn of handlers[e.type]||[])fn(e)}
  }}
  const document=Object.assign(target(),{hidden:false});
  const window=target();
  const context={window,document,performance:{now:()=>time},console,
    CustomEvent:class {constructor(type){this.type=type}},
    setTimeout(fn,ms){const key=++id;timers.set(key,{fn,at:time+ms});return key},
    clearTimeout(key){timers.delete(key)}};
  if(idle)window.requestIdleCallback=context.requestIdleCallback=fn=>{idleTasks.push(fn)};
  names.forEach(name=>window[name]=function(...args){writes.push({name,args,ctx:this});return 'saved'});
  vm.runInNewContext(source,context);
  window.dispatchEvent({type:'pageshow'});
  function advance(ms){time+=ms;for(const [key,t] of [...timers])if(t.at<=time){timers.delete(key);t.fn()}}
  return {window,document,writes,advance,idleTasks,nav:()=>window.dispatchEvent({type:'eot:navigation-intent'})};
}

for(const event of ['pagehide','visibilitychange'])test(event+' flushes every deferred save before timers resume',()=>{
  const h=setup();h.nav();
  names.forEach(n=>h.window[n]('career-1'));
  assert.equal(h.writes.length,0);
  if(event==='visibilitychange'){h.document.hidden=true;h.document.dispatchEvent({type:event})}
  else h.window.dispatchEvent({type:event});
  assert.deepEqual(h.writes.map(x=>x.name),names);
  assert.equal(h.window.EOTNavigationBusy(),false);
  h.window.save();assert.equal(h.writes.length,6);
  h.advance(1000);h.idleTasks.splice(0).forEach(fn=>fn());
  assert.equal(h.writes.length,6);
});

test('foreground navigation coalesces saves with latest arguments and receiver',()=>{
  const h=setup(),receiver={};h.nav();
  h.window.saveAccountCareer('old');h.window.saveAccountCareer.call(receiver,'latest');
  h.advance(170);assert.equal(h.writes.length,0);h.idleTasks.shift()();
  assert.equal(h.writes.length,1);assert.equal(h.writes[0].args[0],'latest');assert.equal(h.writes[0].ctx,receiver);
});

for(const idle of [true,false])test('old scheduled flush respects a newer navigation burst (idle='+idle+')',()=>{
  const h=setup(idle);h.nav();h.window.save();h.advance(170);
  h.nav();h.window.save();
  if(idle)h.idleTasks.shift()();else h.advance(30);
  assert.equal(h.writes.length,0);
  h.advance(170);
  if(idle)h.idleTasks.splice(0).forEach(fn=>fn());else h.advance(30);
  assert.equal(h.writes.length,1);
});

test('an immediate save supersedes its older deferred call',()=>{
  const h=setup();h.nav();h.window.saveAccountCareer('old');h.advance(170);
  assert.equal(h.window.saveAccountCareer('latest'),'saved');
  h.idleTasks.shift()();assert.equal(h.writes.length,1);assert.equal(h.writes[0].args[0],'latest');
});

test('hidden pages do not defer saves even if another navigation event arrives',()=>{
  const h=setup();h.document.hidden=true;h.nav();
  h.window.save();assert.equal(h.writes.length,1);
});
