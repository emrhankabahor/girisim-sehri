/* EOT_PART app.js-hireEmployee */
function hireEmployee(role,salary,bonus){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');location.hash='business';return}
 if(role==='Yönetici'&&reputation<60){toast('Yönetici işe almak için en az 60 itibar gerekli');return}
 if(role==='Mühendis'&&reputation<45){toast('Mühendis işe almak için en az 45 itibar gerekli');return}
 salary=normalizeNumber(salary,0);
 if(c.companyCash<salary){toast('Şirket hesabında ilk maaş için yeterli bakiye yok');return}
 c.companyCash-=salary;
 c.employees.push({id:'emp_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),companyId:c.id,role,salary,bonus:normalizeNumber(bonus,0),t:Date.now()});
 reputation=clamp(reputation+1,0,100);
 tx.unshift({t:Date.now(),kind:'business',type:'employee_hire',companyId:c.id,sym:c.name+' • '+role,total:salary});
 syncSelectedCompanyToProfile();simSave();save();render();renderGameExtras();
 pushNotification('Yeni çalışan',c.name+' • '+role+' ekibe katıldı.');toast(role+' işe alındı')
}
/* EOT_END */
/* EOT_PART app.js-fireEmployee */
function fireEmployee(i){
 let c=selectedCompany(),arr=selectedCompanyEmployees(),e=arr[i];if(!c||!e)return;
 arr.splice(i,1);syncSelectedCompanyToProfile();simSave();renderSimulation();renderCompanyFoundation();
 pushNotification('Personel ayrıldı',c.name+' • '+e.role+' işten ayrıldı.')
}
/* EOT_END */
/* EOT_PART app.js-employeeStats */
function employeeStats(){return selectedCompanyEmployeeStats()}
/* EOT_END */
/* EOT_PART app.js-selectedCompanyEmployees */
function selectedCompanyEmployees(){
 let c=selectedCompany();return c&&Array.isArray(c.employees)?c.employees:[]
}
/* EOT_END */
/* EOT_PART app.js-selectedCompanyEmployeeStats */
function selectedCompanyEmployeeStats(){
 let arr=selectedCompanyEmployees();
 return {salary:arr.reduce((s,e)=>s+normalizeNumber(e.salary,0),0),bonus:arr.reduce((s,e)=>s+normalizeNumber(e.bonus,0),0)}
}
/* EOT_END */
