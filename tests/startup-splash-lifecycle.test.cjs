const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../startup-splash.js'),'utf8');
function setup(viewport,options={}){
 const elements=new Map();
 function target(){const events={};return {addEventListener(n,f){(events[n]??=[]).push(f)},removeEventListener(n,f){events[n]=(events[n]||[]).filter(x=>x!==f)},emit(n){for(const f of events[n]||[])f()}}}
 const window=Object.assign(target(),{navigator:{standalone:!!options.iosStandalone},matchMedia:()=>({matches:!!options.displayStandalone}),innerWidth:390,innerHeight:664,visualViewport:viewport?Object.assign(target(),viewport):undefined}),document=Object.assign(target(),{visibilityState:'visible',head:{appendChild(e){elements.set(e.id,e)}},body:{appendChild(e){elements.set(e.id,e)}},documentElement:{classList:{add(){},remove(){}}},getElementById:id=>elements.get(id),createElement(){return {getBoundingClientRect(){const canvas=options.canvas||{width:414,height:896};return {width:this.style.width?.endsWith('px')?parseFloat(this.style.width):canvas.width,height:this.style.height?.endsWith('px')?parseFloat(this.style.height):canvas.height}},querySelectorAll(){return []},style:{setProperty(n,v){this[n]=v}},classList:{add(){}},remove(){elements.delete(this.id)}}}});
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

test('splash follows iPhone visible viewport without an extra bottom safe-area strip',()=>{
 const h=setup({width:390,height:664,offsetLeft:0,offsetTop:0});
 const splash=h.elements.get('eotStartupSplash');
 assert.equal(splash.style.height,'664px');
 assert.equal(splash.style.width,'390px');
 assert.equal(splash.style.top,'0px');
 assert.equal(splash.style['--eot-art-width'],'390px');
 h.window.visualViewport.height=844;
 h.window.visualViewport.emit('resize');
 assert.equal(splash.style.height,'844px');
 assert(Number.parseInt(splash.style['--eot-art-width'])>=844*852/1846);
 h.window.visualViewport.offsetTop=12;
 h.window.visualViewport.emit('scroll');
 assert.equal(splash.style.top,'12px');
 h.window.EOTStartupSplash.failOpen();
 h.window.visualViewport.height=600;
 h.window.visualViewport.emit('resize');
 assert.equal(splash.style.height,'844px');
});
test('splash uses window dimensions when VisualViewport is unavailable',()=>{
 const h=setup();const splash=h.elements.get('eotStartupSplash');
 assert.equal(splash.style.height,'664px');
 h.window.innerHeight=740;h.window.emit('resize');
 assert.equal(splash.style.height,'740px');
});

test('desktop and landscape fit the entire artwork inside the visible height',()=>{
 const h=setup({width:1440,height:900,offsetLeft:0,offsetTop:0});
 const splash=h.elements.get('eotStartupSplash');
 const artWidth=Number.parseInt(splash.style['--eot-art-width']);
 assert(artWidth*1846/852<=900);
 assert(artWidth<1440/2);
 h.window.visualViewport.width=844;h.window.visualViewport.height=390;
 h.window.visualViewport.emit('resize');
 assert(Number.parseInt(splash.style['--eot-art-width'])*1846/852<=390);
 h.window.visualViewport.width=390;h.window.visualViewport.height=844;
 h.window.visualViewport.emit('resize');
 assert(Number.parseInt(splash.style['--eot-art-width'])>=390);
});

for(const mode of ['iosStandalone','displayStandalone'])test(mode+' covers home-indicator area when VisualViewport excludes it',()=>{
 const canvas={width:414,height:896};
 const h=setup({width:414,height:862,offsetLeft:0,offsetTop:0},{[mode]:true,canvas});
 const splash=h.elements.get('eotStartupSplash');
 assert.equal(splash.getBoundingClientRect().height,896);
 assert.equal(splash.style.top,'0px');
 assert(Number.parseInt(splash.style['--eot-art-width'])*1846/852>=896);
 // Safari can report a nonzero offset or change its safe viewport on resume.
 h.window.visualViewport.offsetTop=34;h.window.visualViewport.height=828;
 h.window.visualViewport.emit('resize');
 assert.equal(splash.style.height,'100vh');assert.equal(splash.style.top,'0px');
 // Rotation uses the newly measured CSS canvas, not cached screen dimensions.
 canvas.width=896;canvas.height=414;h.window.emit('orientationchange');
 assert(Number.parseInt(splash.style['--eot-art-width'])*1846/852<=414);
});
