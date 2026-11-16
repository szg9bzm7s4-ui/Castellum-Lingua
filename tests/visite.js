const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:844},{width:1280,height:860}]){
const pg=await (await b.newContext({viewport:vp})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{S.src='fr';switchLang('it');S.onboarded=true;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';go('learn')});await pg.waitForTimeout(1500);
const W=vp.width;
for(let i=0;i<4;i++){const c=await pg.evaluate(()=>{const r=document.getElementById('ctRoot');return r?r.innerText.replace(/\n+/g,' | ')+' ## hl='+(document.querySelector('.ct-hl')?.outerHTML.slice(0,60)):'(pas de visite)'});console.log(W,i,c);
  await pg.screenshot({path:`ux/tour_${W}_${i}.png`});if(i<3)await pg.click('[data-ct="next"]').catch(()=>{});await pg.waitForTimeout(500)}
await pg.click('[data-ct="go"]').catch(e=>console.log('go?',e.message.slice(0,60)));await pg.waitForTimeout(1000);
console.log(W,'après « Jouer ma première leçon » : leçon ouverte =',await pg.evaluate(()=>!!(document.getElementById('lxRoot').innerHTML.trim())),'tour=',await pg.evaluate(()=>S.ui.tour));
// simuler la fin d'une première leçon
await pg.evaluate(()=>{closeLx();S.done[nodeKey(0,0)]=1;go('learn')});await pg.waitForTimeout(1500);
console.log(W,'bravo :',await pg.evaluate(()=>document.querySelector('.ct-win')?.innerText.replace(/\n+/g,' | ')||'(rien)'));
await pg.screenshot({path:`ux/win_${W}.png`});
await pg.evaluate(()=>closeSheet());await pg.evaluate(()=>{render()});await pg.waitForTimeout(1200);
console.log(W,'pas de répétition :',await pg.evaluate(()=>!document.querySelector('.ct-win')&&!document.getElementById('ctRoot')));
// outils
if(W<900){await pg.click('nav [data-act="more"], .bnav [data-act="more"], [data-act="more"]:visible').catch(e=>console.log('more?',e.message.slice(0,80)));await pg.waitForTimeout(700);
 console.log('outils :',await pg.evaluate(()=>document.querySelector('.u2-tools')?.innerText.replace(/\n+/g,' | ').slice(0,700)));
 await pg.click('[data-ct="tour"]');await pg.waitForTimeout(800);console.log('relance visite :',await pg.evaluate(()=>!!document.getElementById('ctRoot')));}
console.log(W,'erreurs',errs);}
await b.close()})();
