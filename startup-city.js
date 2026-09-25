/* Procedural opening diorama. Visual only; no game state or storage access. */
(function(){
'use strict';
window.EOTCityScene={mount(canvas){
 if(!canvas||!canvas.getContext)return null;
 const c=canvas.getContext('2d');if(!c)return null;
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 let progress=0,dead=false,frame=0,last=0,w=0,h=0,scale=1,cx=0,cy=0;
 const start=performance.now();
 const buildings=[
  {x:-130,y:-125,w:48,d:42,h:55,type:'factory',at:0},
  {x:-40,y:-120,w:40,d:40,h:160,type:'tower',at:12},
  {x:25,y:-115,w:38,d:42,h:112,type:'tower',at:22},
  {x:91,y:-117,w:43,d:50,h:66,type:'site',at:35},
  {x:-122,y:12,w:63,d:48,h:37,type:'dealer',at:4},
  {x:-37,y:22,w:37,d:37,h:78,type:'tower',at:18},
  {x:35,y:28,w:35,d:38,h:35,type:'shop',at:32},
  {x:89,y:27,w:35,d:38,h:31,type:'shop',at:42},
  {x:-120,y:100,w:35,d:33,h:28,type:'shop',at:25}
 ].sort((a,b)=>(a.x+a.y)-(b.x+b.y));
 const point=(x,y,z=0)=>[cx+(x-y)*.88*scale,cy+((x+y)*.44-z)*scale];
 function polygon(points,fill,stroke){c.beginPath();points.forEach((p,i)=>{const a=point(...p);i?c.lineTo(...a):c.moveTo(...a)});c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=.7*scale;c.stroke()}}
 function line(points,color,width=1){c.beginPath();points.forEach((p,i)=>{const a=point(...p);i?c.lineTo(...a):c.moveTo(...a)});c.strokeStyle=color;c.lineWidth=width*scale;c.stroke()}
 function box(x,y,bw,bd,bh,roof='#397889',front='#1b4258',side='#102d43',z=0){
  polygon([[x,y+bd,z],[x+bw,y+bd,z],[x+bw,y+bd,z+bh],[x,y+bd,z+bh]],front,'#6091a133');
  polygon([[x+bw,y,z],[x+bw,y+bd,z],[x+bw,y+bd,z+bh],[x+bw,y,z+bh]],side,'#6091a133');
  polygon([[x,y,z+bh],[x+bw,y,z+bh],[x+bw,y+bd,z+bh],[x,y+bd,z+bh]],roof,'#9bcedb44');
 }
 function dot(x,y,z,r,color){const p=point(x,y,z);c.beginPath();c.arc(...p,r*scale,0,Math.PI*2);c.fillStyle=color;c.fill()}
 function label(text,x,y,z){const p=point(x,y,z);c.save();c.translate(...p);c.transform(.88,.44,0,1,0,0);c.font='600 '+Math.max(5,7*scale)+'px sans-serif';c.textAlign='center';c.fillStyle='#ffe0a3';c.fillText(text,0,0);c.restore()}
 function building(b,t){
  const rise=media.matches?1:Math.max(0,Math.min(1,(progress-b.at)/45));
  const height=b.h*(1-Math.pow(1-rise,2));
  if(height<1){polygon([[b.x,b.y,1],[b.x+b.w,b.y,1],[b.x+b.w,b.y+b.d,1],[b.x,b.y+b.d,1]],'#173b48','#48848b');return}
  const warm=b.type==='shop';
  if(b.type==='site'){
   for(let z=0;z<height;z+=16){box(b.x,b.y,b.w,b.d,3,'#91a3a4','#566f76','#364e5b',z);for(const dx of [2,b.w-5])for(const dy of [2,b.d-5])box(b.x+dx,b.y+dy,3,3,Math.min(13,height-z),'#81999d','#526f7a','#2e4d5c',z+3)}
  }else{
   box(b.x,b.y,b.w,b.d,height,warm?'#b28b61':'#3c7f90',warm?'#5d4c41':'#1d485e',warm?'#3f3935':'#113144');
   for(let z=8;z<height-5;z+=12){
    for(let dx=5;dx<b.w-5;dx+=9){const lit=((dx+z+b.x)%4!==0);polygon([[b.x+dx,b.y+b.d+.2,z],[b.x+dx+4,b.y+b.d+.2,z],[b.x+dx+4,b.y+b.d+.2,z+6],[b.x+dx,b.y+b.d+.2,z+6]],lit?'#d9b981':'#367688')}
    for(let dy=5;dy<b.d-5;dy+=10)polygon([[b.x+b.w+.2,b.y+dy,z],[b.x+b.w+.2,b.y+dy+4,z],[b.x+b.w+.2,b.y+dy+4,z+6],[b.x+b.w+.2,b.y+dy,z+6]],'#51818a');
   }
   if(b.type==='tower'){
    box(b.x+6,b.y+6,b.w-12,b.d-12,5,'#72a5ad','#406b7c','#294959',height);
    line([[b.x+3,b.y+b.d,height],[b.x+3,b.y+b.d,0]],'#e9c489',1.2);
    if(b.h>150){line([[b.x+b.w/2,b.y+b.d/2,height+5],[b.x+b.w/2,b.y+b.d/2,height+27]],'#c3d5d4');dot(b.x+b.w/2,b.y+b.d/2,height+27,1.5,'#edbf7d')}
   }
   if(b.type==='dealer'){label('GALERİ',b.x+b.w/2,b.y+b.d+1,height-6);for(let k=0;k<3;k++)box(b.x+9+k*17,b.y+b.d-8,10,6,5,['#c8544e','#d9cda6','#72a9b1'][k],'#b99468','#324d5b',1)}
   if(b.type==='shop'){polygon([[b.x,b.y+b.d,height-7],[b.x+b.w,b.y+b.d,height-7],[b.x+b.w,b.y+b.d+8,height-12],[b.x,b.y+b.d+8,height-12]],'#c29a6e');label('MAĞAZA',b.x+b.w/2,b.y+b.d+1,height-3)}
   if(b.type==='factory'){for(let k=0;k<3;k++)box(b.x+5+k*13,b.y+5,9,b.d-10,6,'#789da6','#415f72','#304355',height);box(b.x+3,b.y+3,6,6,23,'#87a3a5','#516978','#314759',height);label('ÜRETİM',b.x+b.w/2,b.y+b.d+1,height-5)}
  }
 }
 function crane(t){
  const x=145,y=-65,z=108;line([[x,y,0],[x,y,z],[x+5,y,z],[x+5,y,0]],'#d1a15b',1.8);
  for(let k=4;k<z;k+=10)line([[x,y,k],[x+5,y,k+8]],'#967b50',.8);
  const angle=media.matches?.15:Math.sin(t*.6)*.16;
  const dx=Math.cos(angle)*68,dy=Math.sin(angle)*68;
  line([[x-dx*.35,y-dy*.35,z],[x+dx,y+dy,z],[x,y,z+13],[x-dx*.35,y-dy*.35,z]],'#d8ae6a',1.7);
  const lift=media.matches?20:22+Math.sin(t*1.5)*12;
  line([[x+dx*.6,y+dy*.6,z],[x+dx*.6,y+dy*.6,z-lift]],'#a5b6ba',.65);
  box(x+dx*.6-4,y+dy*.6-4,8,8,5,'#d6ad70','#8b744e','#66573f',z-lift-5);
 }
 function render(now){
  if(dead)return;frame=requestAnimationFrame(render);if(now-last<33||document.hidden)return;last=now;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  if(w!==rect.width||h!==rect.height){w=rect.width;h=rect.height;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);c.setTransform(dpr,0,0,dpr,0,0)}
  const wide=w>h*1.2;scale=Math.min(w*(wide?.52:.95)/600,h*(wide?.85:.5)/390);cx=w*(wide?.73:.5);cy=h*(wide?.61:.61);
  const t=media.matches?0:(now-start)/1000;
  c.clearRect(0,0,w,h);
  const glow=c.createRadialGradient(cx,cy,0,cx,cy,300*scale);glow.addColorStop(0,'#1f687b55');glow.addColorStop(1,'#06132200');c.fillStyle=glow;c.fillRect(0,0,w,h);
  box(-170,-165,340,330,10,'#122d3b','#0b1e2e','#081827',-10);
  polygon([[-170,-18,1],[170,-18,1],[170,0,1],[-170,0,1]],'#213d4a');
  polygon([[-5,-165,1],[13,-165,1],[13,165,1],[-5,165,1]],'#213d4a');
  for(let i=-160;i<160;i+=24){line([[i,-9,1],[i+10,-9,1]],'#7d8f8855',1);line([[4,i,1],[4,i+10,1]],'#7d8f8855',1)}
  // Empty parcel and boundary stakes are a distinct land investment.
  polygon([[35,100,1],[126,100,1],[126,147,1],[35,147,1]],'#34544b','#7aa19a');
  for(let i=36;i<126;i+=14)line([[i,147,1],[i,147,7]],'#b9b6a1',1);label('SATILIK ARSA',80,150,9);
  for(let i=0;i<8;i++){
   const travel=((t*28+i*43)%320)-160;
   if(i%2===0){box(travel,-15,8,4,3,i%3?'#a0cbd2':'#e8ba73','#487682','#2c4659',2);dot(travel+8,-13,3,1,'#ffde9e')}
   else{box(7,travel,4,8,3,'#8dafbc','#536776','#304453',2);dot(9,travel+8,3,1,'#ffde9e')}
  }
  buildings.forEach(b=>building(b,t));crane(t);
  for(const [x,y] of [[-147,76],[-141,135],[148,30],[148,102],[22,82],[-75,133]]){line([[x,y,0],[x,y,13]],'#5b6958',1.7);dot(x,y,16,6,'#367069');dot(x-2,y,20,4,'#508b7b')}
  for(const [x,y] of [[-150,7],[-72,7],[28,7],[135,7]]){line([[x,y,0],[x,y,18],[x+5,y,18]],'#839aa2',1);dot(x+5,y,18,2,'#f3d598')}
 }
 frame=requestAnimationFrame(render);
 return {progress(v){progress=Math.max(progress,Math.min(100,Number(v)||0))},destroy(){dead=true;cancelAnimationFrame(frame);c.clearRect(0,0,w,h)}};
}};
})();
