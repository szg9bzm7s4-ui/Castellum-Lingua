const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const srv=spawn('python3',['-m','http.server','8774','--bind','127.0.0.1'],{cwd:require('path').join(__dirname,'..'),stdio:'ignore'});await new Promise(r=>setTimeout(r,800));
const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());
const ok=(n,v)=>console.log((v?'✅':'❌')+' '+n+(typeof v==='string'?' · '+v:''));
await pg.goto('http://127.0.0.1:8774/index.html');await pg.waitForTimeout(1500);
ok('accueil affiché',await pg.evaluate(()=>!!document.querySelector('#welcomeRoot .st-steps')));
await pg.click('#welcomeRoot [data-lang="it"]');await pg.waitForTimeout(300);await pg.click('[data-st="begin"]');await pg.waitForTimeout(900);
ok('situation Naples lancée',await pg.evaluate(()=>!!document.querySelector('.sx-dlg')));
await pg.evaluate(()=>{closeLx();S.rqSeen=99;S.kwSeen=99;save()});
// leçons et QCM dans plusieurs langues et paires
const pairs=[['fr','it'],['fr','es'],['en','de'],['es','pt'],['fr','ary'],['fr','ja'],['de','ru'],['fr','la'],['fr','grc'],['it','nl'],['fr','ro-MD']];
for(const [s,t] of pairs){const r=await pg.evaluate(async([s,t])=>{S.src=s;switchLang(t);S.level='A1';if(window.CastellumPacks)await CastellumPacks.ensure(t);
  let n=0,bad=0,steps=0;const ex=[];
  for(let u=0;u<3;u++){const U=lvUnits()[u];const items=setData(U.id);if(!items)return 'pas de contenu u'+u;
   for(const l of [0,1,2,3,4,5,6]){const st=buildLesson(u,l,items);steps+=st.length;
    st.forEach(x=>{if(!x.opts||x.k==='tf')return;n++;const a=answerOf(x);const c=x.opts.filter(o=>o===a).length;if(c!==1){bad++;if(ex.length<2)ex.push(x.k+':'+a)}})}}
  return `${steps} étapes, ${n} QCM, ${bad} sans réponse unique ${ex.join(' ')}`},[s,t]);
  ok(`${s}→${t}`,r.includes(' 0 sans')?r:false);if(!r.includes(' 0 sans'))console.log('   ',r)}
// vues principales
await pg.evaluate(()=>{S.src='fr';switchLang('it');S.onboarded=true;save()});
for(const v of ['learn','castle','play','profile','lists','dict','grammar','alpha','teacher','words','langs']){await pg.evaluate(v=>go(v),v);await pg.waitForTimeout(250);
  const len=await pg.evaluate(()=>document.getElementById('view').innerText.length);ok('vue '+v,len>40?len+' caractères':false)}
// leçon jouée jusqu'au bout
await pg.evaluate(()=>startLesson(0,0));await pg.waitForTimeout(800);
for(let i=0;i<60;i++){const done=await pg.evaluate(()=>!LX||!!document.querySelector('.done-screen'));if(done)break;
 await pg.evaluate(()=>{const st=LX.steps[LX.i];if(st.k==='intro'){nextStep();return}if(st.k==='speak'){document.querySelector('[data-lx="skip"]')?.click();return}
  if(st.k==='match'){LX.state='good';nextStep();return}
  if(st.opts){LX.sel=st.opts.indexOf(answerOf(st));check()}else if(st.k==='build'){st.built=st.it.t.split(/\s+/).map(w=>st.bank.indexOf(w));check()}else if(document.getElementById('typeIn')){document.getElementById('typeIn').value=answerOf(st);check()}else{LX.state='good'}
  if(LX.state!=='idle')nextStep()});await pg.waitForTimeout(80)}
ok('leçon terminée',await pg.evaluate(()=>!!document.querySelector('.done-screen')));
await pg.evaluate(()=>{closeLx();startMode('review')});await pg.waitForTimeout(600);ok('révision lancée',await pg.evaluate(()=>!!(LX&&LX.steps&&LX.steps.length)));
await pg.evaluate(()=>closeLx());
console.log(errs.length?'❌ erreurs : '+errs.slice(0,5).join(' | '):'✅ aucune erreur de page');
await b.close();srv.kill()})();
