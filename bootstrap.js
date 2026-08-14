(async function(){
  const root=document.getElementById('app-root');
  try{
    const files=['content-1.html', 'content-2.html', 'content-3.html', 'content-4.html', 'content-5.html', 'content-6.html'];
    const parts=await Promise.all(files.map(f=>fetch(f,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r.text()})));
    root.innerHTML=parts.join('');
    const script=document.createElement('script');
    script.src='app.js?v=165';
    document.body.appendChild(script);
  }catch(err){
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Girişim Şehri yüklenemedi</h2><p>Sayfayı yenileyin.</p></main>';
  }
})();
