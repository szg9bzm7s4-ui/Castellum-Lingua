const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{const said=[];window.__said=said;
  const V=[{name:'Maged',lang:'ar-SA',localService:true,default:false,voiceURI:'Maged'}];
  window.SpeechSynthesisUtterance=function(t){this.text=t;this.volume=1};
  const ss={speaking:false,getVoices:()=>V,speak:u=>{said.push((u.volume===0?'[silence] ':'')+u.text+' | '+(u.lang||''))},cancel(){},pause(){},resume(){},addEventListener(){},removeEventListener(){}};
  Object.defineProperty(window,'speechSynthesis',{get:()=>ss,configurable:true})});
await pg.route(/fonts\.|googleapis/,r=>r.abort());
let calls=0;await pg.route(/supabase\.co/,r=>{if(/castellum-tts/.test(r.request().url())){calls++;return r.fulfill({status:502,body:'TTS error 401'})}return r.abort()});
await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
await pg.evaluate(()=>{S.src='fr';switchLang('ary');S.onboarded=true;const w=document.getElementById('welcomeRoot');if(w)w.innerHTML='';
  Cloud.user={id:'x'};Cloud.client={auth:{getSession:async()=>({data:{session:{access_token:'t'}}})}};});
console.log('voix en ligne dispo :',await pg.evaluate(()=>castellumCloudVoice.available()));
await pg.mouse.click(200,300);await pg.waitForTimeout(300);
for(const t of ['Salam','Mchina l s-sinima','Chokran']){console.log('speak →',await pg.evaluate(t=>speak(t,'ary'),t));await pg.waitForTimeout(900)}
console.log('appels serveur',calls,'| coupée après échecs :',await pg.evaluate(()=>castellumCloudVoice.state.off),'| source affichée :',await pg.evaluate(()=>CastellumAudio.sourceFor('ary','Salam')));
console.log('dit par l\'appareil :\n '+(await pg.evaluate(()=>__said)).join('\n '));
console.log('erreurs',errs);await b.close()})();
