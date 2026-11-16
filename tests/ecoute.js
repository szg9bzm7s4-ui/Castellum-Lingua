const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{S.src='fr';switchLang('it');S.onboarded=true;S.ui=S.ui||{};S.ui.tour=1;S.ui.firstWin=1;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';for(const l of [0,1,2])S.done[nodeKey(0,l)]=1;go('learn')});await pg.waitForTimeout(600);
let L=-1;for(const l of [0,1,2,4,5,6,3]){await pg.evaluate(l=>{try{closeLx()}catch(e){}return startLesson(0,l)},l);await pg.waitForTimeout(1200);const ks=await pg.evaluate(()=>[...new Set((LX&&LX.steps||[]).map(s=>s.k))].join(','));console.log('leçon',l,':',ks);if(/listen/.test(ks)){L=l;break}}
for(const k of ['listen','dictee']){
  const r=await pg.evaluate(k=>{const it=LX.items[0];let x;try{x=makeStep(k,it,LX.items)}catch(e){return k+' err '+e.message}if(!x||x.k!==k)return k+' : impossible à créer ('+(x&&x.k)+')';LX.steps[1]=x;LX.i=1;LX.state='idle';LX.sel=null;renderStep();renderFoot();
    const btn=document.querySelector('#lxFoot [data-lx="nohear"]');return k+' : bouton '+(btn?'présent « '+btn.innerText+' »':'ABSENT')+' | pied = '+document.getElementById('lxFoot').innerText.replace(/\n+/g,' · ')},k);
  console.log(r);
  if(k==='listen'&&/présent/.test(r)){
    const before=await pg.evaluate(()=>LX.steps[LX.i].k);await pg.click('#lxFoot [data-lx="nohear"]');await pg.waitForTimeout(500);
    console.log(' après clic : type',before,'→',await pg.evaluate(()=>LX.steps[LX.i].k),'| texte visible :',await pg.evaluate(()=>document.getElementById('lxStep').innerText.replace(/\n+/g,' · ').slice(0,160)))}}
console.log('erreurs',errs);await b.close()})();
