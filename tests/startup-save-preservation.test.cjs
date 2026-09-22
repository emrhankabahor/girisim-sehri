const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../full-reset-once.js'),'utf8');

for(const marked of [false,true])test('startup preserves career and session data; legacy marker='+marked,()=>{
  function storage(entries){
    const data=new Map(entries);
    return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),clear:()=>data.clear()};
  }
  const localStorage=storage([['gs124_cash','123456'],['gs132_sim','{"companies":[{"name":"Test"}]}'],['career_test','{"cash":123456}']]);
  if(marked)localStorage.setItem('eot_full_reset_20260901_v1','1');
  const sessionStorage=storage([['test_session','active']]);
  const beforeLocal=[...localStorage.data],beforeSession=[...sessionStorage.data];
  vm.runInNewContext(source,{localStorage,sessionStorage});
  vm.runInNewContext(source,{localStorage,sessionStorage});
  assert.deepEqual([...localStorage.data],beforeLocal);
  assert.deepEqual([...sessionStorage.data],beforeSession);
});
