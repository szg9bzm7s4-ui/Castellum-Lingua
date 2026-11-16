const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const srv=spawn('python3',['-m','http.server','8775','--bind','127.0.0.1'],{cwd:require('path').join(__dirname,'..'),stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());
const ok=(n,v)=>console.log((v?'✅':'❌')+' '+n+(typeof v==='string'?' · '+v:''));
await pg.goto('http://127.0.0.1:8775/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(async()=>{S.onboarded=true;S.rqSeen=99;S.kwSeen=99;S.src='fr';switchLang('la');await CastellumPacks.ensure('la')});
for(const src of ['fr','en','it','es','pt','de','nl','ary']){
 const r=await pg.evaluate(src=>{S.src=src;let n=0,bad=0,steps=0,units=0;const ex=[];
  for(const lv of ['A1','A2','B1','B2','C1','C2']){S.level=lv;const L=lvUnits(lv);
   L.forEach((U,u)=>{units++;const items=setData(U.id);if(!items||!items.length){bad++;ex.push('vide '+U.id);return}
    for(const l of [0,1,2,3,4,5,6]){const st=buildLesson(u,l,items);steps+=st.length;
     st.forEach(x=>{if(!x.opts||x.k==='tf')return;n++;const a=answerOf(x);const c=x.opts.filter(o=>o===a).length;if(c!==1){bad++;if(ex.length<4)ex.push(lv+u+' '+x.k+':'+a)}})}})}
  S.level='A1';return `${units} unités, ${steps} étapes, ${n} QCM, ${bad} problèmes ${ex.join(' / ')}`},src);
 ok('source '+src,r.includes(' 0 problèmes')?r:false);if(!r.includes(' 0 problèmes'))console.log('  ',r)}
await pg.evaluate(()=>{S.src='fr';S.level='A1';save();go('learn')});await pg.waitForTimeout(400);
ok('parcours latin affiché',await pg.evaluate(()=>{const t=document.getElementById('view').innerText;return t.includes('Salv')||t.includes('romaine')?'ok':false}));
for(const [lv,u] of [['A1',0],['A2',4],['B1',6],['C2',1]]){
 await pg.evaluate(([lv,u])=>{S.level=lv;startLesson(u,0)},[lv,u]);await pg.waitForTimeout(600);
 for(let i=0;i<80;i++){const done=await pg.evaluate(()=>!LX||!!document.querySelector('.done-screen'));if(done)break;
  await pg.evaluate(()=>{const st=LX.steps[LX.i];if(st.k==='intro'){nextStep();return}if(st.k==='speak'){document.querySelector('[data-lx="skip"]')?.click();return}
   if(st.k==='match'){LX.state='good';nextStep();return}
   if(st.opts){LX.sel=st.opts.indexOf(answerOf(st));check()}else if(st.k==='build'){st.built=st.it.t.split(/\s+/).map(w=>st.bank.indexOf(w));check()}else if(document.getElementById('typeIn')){document.getElementById('typeIn').value=answerOf(st);check()}else{LX.state='good'}
   if(LX.state!=='idle')nextStep()});await pg.waitForTimeout(60)}
 ok(`leçon ${lv} unité ${u+1} jouée`,await pg.evaluate(()=>!!document.querySelector('.done-screen')));await pg.evaluate(()=>closeLx())}
await pg.evaluate(()=>{S.level='A1';go('grammar')});await pg.waitForTimeout(400);
ok('grammaire latine',await pg.evaluate(()=>{const t=document.getElementById('view').innerText;return t.includes('Prononcer le latin')?'fiches visibles':false}));

ok('conjugaison esse',await pg.evaluate(()=>{const d=conjData('être','Présent');return d&&d.forms.join(',')==='sum,es,est,sumus,estis,sunt'?d.inf:false}));
await pg.evaluate(()=>{S.level='A1';go('learn')});await pg.waitForTimeout(400);

await pg.evaluate(()=>{S.src='fr';switchLang('it');S.level='A1'});ok('italien inchangé',await pg.evaluate(()=>lvUnits('A1').length===26&&lvUnits('A1')[0].n==='Salutations'));
console.log(errs.length?'❌ erreurs : '+errs.slice(0,5).join(' | '):'✅ aucune erreur de page');
await b.close();srv.kill()})();
