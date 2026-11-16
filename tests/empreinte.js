/* Empreinte de l'appli : ouvre une série d'écrans et d'états, et enregistre pour chacun une empreinte du contenu
   (HTML) et de l'image (capture). Deux versions de l'appli qui donnent les mêmes empreintes se comportent pareil
   sur ces écrans. Sert à vérifier qu'un nettoyage du code ne change rien.
   Usage : node tests/empreinte.js <page> <fichier-de-sortie.json>     (serveur local sur le port 8765) */
const {chromium}=require('playwright');const fs=require('fs');const crypto=require('crypto');
const page=process.argv[2]||'index.html',out=process.argv[3]||'/tmp/castellum-empreinte.json';
const h=x=>crypto.createHash('md5').update(x).digest('hex').slice(0,10);
(async()=>{const b=await chromium.launch();const res={},errs=[];
for(const vp of [{n:'tel',width:390,height:844},{n:'ordi',width:1280,height:900}]){
  const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},colorScheme:'light'});const pg=await ctx.newPage();
  pg.on('pageerror',e=>errs.push(vp.n+': '+e.message));
  /* hasard et heure figés : les mêmes exercices et les mêmes « mots du jour » à chaque passage */
  await pg.addInitScript(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
    const RD=Date,T0=new RD(2026,5,15,10,0,0).getTime();let k=0;
    window.Date=class extends RD{constructor(...x){if(x.length)super(...x);else super(T0+(k++)*1000)}static now(){return T0+(k++)*1000}}});
  await pg.route(/supabase\.co|googleapis|gstatic|fonts\./,r=>r.abort());
  await pg.goto('http://127.0.0.1:8765/'+page);await pg.waitForTimeout(2200);
  await pg.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  const snap=async name=>{await pg.waitForTimeout(350);
    const html=await pg.evaluate(()=>{const pick=s=>{const e=document.querySelector(s);return e?e.innerHTML:''};
      return [pick('.app'),pick('#lxRoot'),pick('#sheetRoot'),pick('#welcomeRoot')].join('§').replace(/\d{9,}/g,'N').replace(/\?v=[0-9a-f]+/g,'')});
    const img=await pg.screenshot();res[vp.n+':'+name]=h(html)+'/'+h(img)};
  const ev=async(f,arg)=>{try{return await pg.evaluate(f,arg)}catch(e){errs.push(vp.n+' eval: '+String(e.message).split('\n')[0]);return null}};
  await snap('bienvenue');
  await ev(()=>{const x=document.querySelector('#welcomeRoot [data-lang="it"]');if(x)x.click()});await snap('bienvenue-niveau');
  await ev(()=>{S.src='fr';switchLang('it');S.onboarded=true;S.ui=S.ui||{};S.ui.tour=1;S.ui.firstWin=1;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';go('learn')});
  await snap('apprendre-neuf');
  await ev(()=>{for(const u of [0,1])S.done[nodeKey(u,3)]=1;S.done[nodeKey(2,0)]=1;S.xp=(S.xp||0)+900;S.coins=500;S.lessons=9;try{save()}catch(e){}go('learn')});
  await snap('apprendre-avance');
  await ev(()=>{const x=document.querySelector('[data-vplace]');if(x)x.click()});await pg.waitForTimeout(700);await snap('fiche-lieu');
  await ev(()=>{closeSheet();const x=document.querySelector('.vl-stop.done .vl-stopbtn');if(x)x.click()});await pg.waitForTimeout(700);await snap('fiche-lieu-fini');
  await ev(()=>closeSheet());
  for(const v of ['castle','play','profile','lists','dict','grammar','alpha','teacher','words','langs','account','friends']){await ev(v=>go(v),v);await pg.waitForTimeout(250);await snap('vue-'+v)}
  await ev(()=>{go('castle')});await ev(()=>{const x=document.querySelector('.cs-art,[data-cs],.cs-world button');if(x)x.click()});await snap('chateau-clic');
  await ev(()=>{try{closeSheet()}catch(e){}go('learn');const x=document.querySelector('[data-act="more"]');if(x)x.click()});await snap('outils');
  await ev(()=>{try{closeSheet()}catch(e){}go('lists')});await ev(()=>{const x=document.querySelector('[data-openlist],[data-list]');if(x)x.click()});await snap('une-liste');
  /* leçon : chaque type d'étape, réponse juste et fausse, écran de fin */
  await ev(()=>{go('learn');return startLesson(2,1)});await pg.waitForTimeout(900);await snap('lecon-ouverture');
  for(const k of ['intro','mc','rev','build','match','type','gap','dialogue','speak','tf','story']){
    const ok=await ev(k=>{const i=LX.steps.findIndex((s,n)=>s.k===k&&!s.scene);if(i<0)return false;LX.i=i;LX.state='idle';LX.sel=null;renderStep();renderFoot();return true},k);
    if(ok)await snap('etape-'+k)}
  await ev(()=>{const i=LX.steps.findIndex(s=>s.k==='mc'||s.k==='rev');LX.i=i;LX.state='idle';LX.sel=null;renderStep();renderFoot();const st=LX.steps[i],good=st.k==='rev'?st.it.s:st.it.t;
    const o=[...document.querySelectorAll('#lxStep .opt')];(o.find(x=>!x.innerText.includes(good))||o[0]).click()});await pg.waitForTimeout(500);await snap('reponse-fausse');
  await ev(()=>{const i=LX.steps.findIndex((s,n)=>n>LX.i&&(s.k==='mc'||s.k==='rev'));LX.i=i;LX.state='idle';LX.sel=null;renderStep();renderFoot();const st=LX.steps[i],good=st.k==='rev'?st.it.s:st.it.t;
    const o=[...document.querySelectorAll('#lxStep .opt')];(o.find(x=>x.innerText.includes(good))||o[0]).click()});await pg.waitForTimeout(500);await snap('reponse-juste');
  await ev(()=>{LX.i=LX.steps.length-1;LX.right=8;LX.graded=10;return finish()});await pg.waitForTimeout(1200);await snap('fin-de-lecon');
  await ev(()=>{const x=[...document.querySelectorAll('#lxRoot button')].find(b=>b.offsetParent);if(x)x.click()});await pg.waitForTimeout(700);await snap('apres-fin');
  await ev(()=>{try{closeLx()}catch(e){}try{closeSheet()}catch(e){}go('play')});
  /* modes de jeu */
  const modes=await ev(()=>[...document.querySelectorAll('.modes .mode')].map((m,i)=>i));
  for(const i of (modes||[]).slice(0,9)){await ev(i=>{try{closeLx()}catch(e){}go('play');const m=document.querySelectorAll('.modes .mode')[i];if(m)m.click()},i);await pg.waitForTimeout(800);await snap('mode-'+i)}
  await ev(()=>{try{closeLx()}catch(e){}});
  /* autres langues et niveaux */
  for(const [lang,lv] of [['ary','A1'],['la','A1'],['la','B2'],['ja','A1'],['it','C1']]){
    await ev(([lang,lv])=>{switchLang(lang);S.level=lv;go('learn')},[lang,lv]);await pg.waitForTimeout(600);await snap('apprendre-'+lang+'-'+lv);
    await ev(()=>go('grammar'));await snap('grammaire-'+lang+'-'+lv)}
  await ev(()=>{switchLang('la');S.level='A1';go('learn');return startLesson(0,0)});await pg.waitForTimeout(900);await snap('lecon-latin');
  await ev(()=>{try{closeLx()}catch(e){}switchLang('it');S.level='A1';S.ui.classicPath=true;go('learn')});await snap('parcours-classique');
  await ctx.close()}
res.__erreurs=errs;fs.writeFileSync(out,JSON.stringify(res,null,1));console.log(Object.keys(res).length-1,'écrans · erreurs',errs.length,errs.slice(0,3));await b.close()})();
