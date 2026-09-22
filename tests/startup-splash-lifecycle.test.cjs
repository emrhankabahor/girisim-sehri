const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../startup-splash.js'),'utf8');
function setup(){
 const elements=new Map();
 function target(){const events={};return {addEventListener(n,f){(events[n]??=[]).push(f)},emit(n){for(const f of events[n]||[])f()}}}
 const window=target(),document=Object.assign(target(),{visibilityState:'visible',head:{appendChild(e){elements.set(e.id,e)}},body:{appendChild(e){elements.set(e.id,e)}},documentElement:{classList:{add(){},remove(){}}},getElementById:id=>elements.get(id),createElement(){return {style:{},classList:{add(){}},remove(){elements.delete(this.id)}}}});
 vm.runInNewContext(source,{window,document,location:{search:''},URLSearchParams,performance:{now:()=>1},requestAnimationFrame(){},setTimeout(){}});
 return {window,document,elements};
}
test('backgrounding does not add a second loading screen',()=>{
 const h=setup();assert(h.elements.has('eotStartupSplash'));
 h.document.visibilityState='hidden';h.document.emit('visibilitychange');h.window.emit('pagehide');
 assert.equal(h.elements.has('eotStartupSnapshotCover'),false);
});
for(const event of ['pageshow','visibilitychange'])test(event+' removes a restored legacy cover',()=>{
 const h=setup();const old=h.document.createElement('div');old.id='eotStartupSnapshotCover';h.document.body.appendChild(old);
 if(event==='pageshow')h.window.emit(event);else h.document.emit(event);
 assert.equal(h.elements.has(old.id),false);
 assert(h.elements.has('eotStartupSplash'));
});
