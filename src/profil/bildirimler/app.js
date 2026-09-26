/* EOT_PART app.js-pushNotification */
function pushNotification(title,text){
 sim.notifications.unshift({title,text,t:Date.now()});sim.notifications=sim.notifications.slice(0,40);simSave();renderNotifications()
}
/* EOT_END */
/* EOT_PART app.js-clearNotifications */
function clearNotifications(){sim.notifications=[];simSave();renderNotifications();toast('Bildirimler temizlendi')}
/* EOT_END */
/* EOT_PART app.js-renderNotifications */
function renderNotifications(){let e=document.getElementById('notificationList');if(!e)return;e.innerHTML=sim.notifications.length?sim.notifications.map(n=>'<div class="notify-row"><b>'+n.title+'</b><span>'+n.text+' • '+new Date(n.t).toLocaleString('tr-TR')+'</span></div>').join(''):'<div class="info-card"><p>Henüz bildirim yok.</p></div>'}
/* EOT_END */
