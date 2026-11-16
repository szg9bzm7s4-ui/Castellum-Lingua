const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const mode of ['voix-muette','voix-ok']){
const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(mode=>{const said=[];window.__said=said;window.__files=[];
  const V=[{name:'Joana',lang:'pt-PT',localService:true,default:false,voiceURI:'Joana'}];
  window.SpeechSynthesisUtterance=function(t){this.text=t;this.volume=1};
  const ss={speaking:false,pending:false,getVoices:()=>V,speak:u=>{said.push(u.text);if(mode==='voix-ok')setTimeout(()=>{u.onstart&&u.onstart()},50)},cancel(){},pause(){},resume(){},addEventListener(){},removeEventListener(){}};
  Object.defineProperty(window,'speechSynthesis',{get:()=>ss,configurable:true});
  const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__files.push('lecture audio');return Promise.resolve()}},mode);
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());
await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{S.src='fr';switchLang('pt');S.onboarded=true;S.ui=S.ui||{};S.ui.tour=1;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';go('learn')});await pg.waitForTimeout(900);
await pg.evaluate(()=>startLesson(0,0));await pg.waitForTimeout(1500);
const txt=await pg.evaluate(()=>LX.steps[LX.i].it.t);
for(let i=0;i<3;i++){await pg.evaluate(t=>speak(t,'pt'),txt);await pg.waitForTimeout(2300)}
console.log(mode,'| mot :',txt,'| voix appareil appelée',await pg.evaluate(()=>__said.length),'fois | lectures de fichier :',await pg.evaluate(()=>__files.length),'| étiquette :',await pg.evaluate(()=>document.querySelector('#lxStep [data-a2-status]')?.innerText),'| lien :',await pg.evaluate(()=>document.querySelector('.jx-nosound')?.innerText));
if(mode==='voix-ok'){await pg.click('.jx-nosound');await pg.waitForTimeout(500);
  await pg.click('[data-jxfiles]');await pg.waitForTimeout(600);console.log(' après « Utiliser l\'audio intégré » :',await pg.evaluate(()=>localStorage.getItem('castellumVoiceSrc')+' | '+document.querySelector('#lxStep [data-a2-status]')?.innerText))}
console.log(' erreurs',errs);}
await b.close()})();
