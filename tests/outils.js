const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());
await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{S.src='fr';switchLang('pt');S.onboarded=true;S.ui=S.ui||{};S.ui.tour=1;S.ui.firstWin=1;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';go('learn')});await pg.waitForTimeout(900);
for(const k of ['lists','dict','grammar','alpha','words','teacher','langs']){
  await pg.evaluate(()=>go('learn'));await pg.waitForTimeout(300);
  await pg.tap('[data-act="more"]');await pg.waitForTimeout(500);
  const sel=`#sheetRoot .u2-tool[data-go="${k}"]`;
  const info=await pg.evaluate(sel=>{const el=document.querySelector(sel);if(!el)return 'absent';const r=el.getBoundingClientRect();const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return 'dessus='+(top?top.tagName+'.'+top.className:'?')},sel);
  let res='';try{await pg.tap(sel,{timeout:3000});await pg.waitForTimeout(500);res=await pg.evaluate(()=>view+' | feuille ouverte='+!!document.getElementById('sheetRoot').innerHTML.trim())}catch(e){res='TAP IMPOSSIBLE '+e.message.split('\n')[0]}
  console.log(k,'→',res,'|',info);
  await pg.evaluate(()=>{try{closeSheet()}catch(e){}});
}
await pg.evaluate(()=>go('learn'));await pg.tap('[data-act="more"]');await pg.waitForTimeout(500);
console.log('erreurs',errs);await b.close()})();
