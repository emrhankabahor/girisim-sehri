const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function setup(offline=false){
 const old={version:'old'},fresh={status:200,version:'new',clone(){return this}},entries=new Map([['https://game.test/startup-splash.js?v=11',old]]);let fetches=0;
 const cache={async match(req,options){const key=typeof req==='string'?req:req.url;return options?.ignoreSearch?old:entries.get(key)},async put(key,value){entries.set(key,value)}};
 const context={self:{addEventListener(){}},URL,Response,AbortController,setTimeout,clearTimeout,caches:{open:async()=>cache},fetch:async()=>{fetches++;if(offline)throw new Error('offline');return fresh}};
 vm.createContext(context);vm.runInContext(source,context);
 return {load:url=>context.cacheFirst({url}),get fetches(){return fetches},old,fresh};
}
test('new script version is fetched even when an older version is cached',async()=>{const h=setup();assert.equal(await h.load('https://game.test/startup-splash.js?v=12'),h.fresh);assert.equal(h.fetches,1)});
test('timestamps reuse the same version without another download',async()=>{const h=setup();await h.load('https://game.test/startup-splash.js?v=12&_=1');assert.equal(await h.load('https://game.test/startup-splash.js?v=12&_=2'),h.fresh);assert.equal(h.fetches,1)});
test('offline launch retains the older cached fallback',async()=>{const h=setup(true);assert.equal(await h.load('https://game.test/startup-splash.js?v=12'),h.old);assert.equal(h.fetches,1)});

function navigationSetup({cached=true,offline=false}={}){
 const old=new Response('cached shell'),fresh=new Response('fresh shell');
 let release;
 const pending=new Promise(resolve=>{release=resolve});
 const writes=[],background=[];
 const cache={match:async()=>cached?old:undefined,put:async(key,value)=>writes.push([key,await value.text()])};
 const context={self:{addEventListener(){},registration:{scope:'https://game.test/game/'}},URL,Response,AbortController,setTimeout,clearTimeout,caches:{open:async()=>cache},fetch:async()=>{await pending;if(offline)throw Error('offline');return fresh}};
 vm.createContext(context);vm.runInContext(source,context);
 return {load:(query='')=>context.navigationResponse({url:'https://game.test/game/'+query},{waitUntil:p=>background.push(p)}),release,background,writes};
}
test('online installed launch does not flash cached splash before fresh HTML',async()=>{
 const h=navigationSetup();let completed=false;
 const request=h.load().then(r=>{completed=true;return r});
 await new Promise(r=>setImmediate(r));assert.equal(completed,false);
 h.release();assert.equal(await (await request).text(),'fresh shell');
 assert.deepEqual(h.writes,[['./index.html','fresh shell']]);
});
test('forced version recovery waits for fresh HTML',async()=>{
 const h=navigationSetup();let completed=false;
 const request=h.load('?_fresh=227').then(r=>{completed=true;return r});
 await new Promise(r=>setImmediate(r));assert.equal(completed,false);
 h.release();assert.equal(await (await request).text(),'fresh shell');
});
test('offline installed launch keeps cached HTML and handles background failure',async()=>{
 const h=navigationSetup({offline:true});
 const request=h.load();h.release();
 assert.equal(await (await request).text(),'cached shell');
 assert.equal(h.writes.length,0);
});
test('first visit without cached shell uses network',async()=>{
 const h=navigationSetup({cached:false});const response=h.load();h.release();
 assert.equal(await (await response).text(),'fresh shell');
});
