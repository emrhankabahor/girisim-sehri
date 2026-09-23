const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function setup(offline=false){
 const old={version:'old'},fresh={status:200,version:'new',clone(){return this}},entries=new Map([['https://game.test/startup-splash.js?v=11',old]]);let fetches=0;
 const cache={async match(req,options){const key=typeof req==='string'?req:req.url;return options?.ignoreSearch?old:entries.get(key)},async put(key,value){entries.set(key,value)}};
 const context={self:{addEventListener(){}},URL,Response,caches:{open:async()=>cache},fetch:async()=>{fetches++;if(offline)throw new Error('offline');return fresh}};
 vm.createContext(context);vm.runInContext(source,context);
 return {load:url=>context.cacheFirst({url}),get fetches(){return fetches},old,fresh};
}
test('new script version is fetched even when an older version is cached',async()=>{const h=setup();assert.equal(await h.load('https://game.test/startup-splash.js?v=12'),h.fresh);assert.equal(h.fetches,1)});
test('timestamps reuse the same version without another download',async()=>{const h=setup();await h.load('https://game.test/startup-splash.js?v=12&_=1');assert.equal(await h.load('https://game.test/startup-splash.js?v=12&_=2'),h.fresh);assert.equal(h.fetches,1)});
test('offline launch retains the older cached fallback',async()=>{const h=setup(true);assert.equal(await h.load('https://game.test/startup-splash.js?v=12'),h.old);assert.equal(h.fetches,1)});
