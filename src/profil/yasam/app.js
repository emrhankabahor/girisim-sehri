/* EOT_PART app.js-setLifestyle */
function setLifestyle(i){if(!LIFESTYLES[i])return;sim.lifestyle=i;simSave();renderAdvanced();toast('Yaşam standardı güncellendi')}
/* EOT_END */
/* EOT_PART app.js-renderLifestyle */
function renderLifestyle(){let l=LIFESTYLES[sim.lifestyle]||LIFESTYLES[0],set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('lifeLevel',l.name);set('lifeExpense',money(l.expense));set('lifePrestige',l.prestige);set('lifeRepBonus','+'+l.rep)}
/* EOT_END */
