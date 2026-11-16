const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const pg=await (await b.newContext({viewport:{width:390,height:844}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());
await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(5500);
console.log('à jour → bandeau :',await pg.evaluate(()=>!!document.getElementById('cvBanner')));
// le serveur annonce une version plus récente
await pg.route(/index\.html\?v=/,async r=>{const res=await r.fetch();let t=await res.text();t=t.replace(/<meta name="castellum-build" content="\d+">/,'<meta name="castellum-build" content="299912312359">');r.fulfill({response:res,body:t})});
let reloaded=false;pg.on('framenavigated',()=>{reloaded=true});
await pg.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await pg.waitForTimeout(65000);await pg.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await pg.waitForTimeout(1500);
console.log('nouvelle version → bandeau :',await pg.evaluate(()=>{const b=document.getElementById('cvBanner');return b?b.innerText.replace(/\n/g,' | '):'absent'}));

await pg.click('#cvReload');await pg.waitForTimeout(1500);console.log('Recharger → page rechargée :',reloaded,'| adresse :',pg.url());
console.log('erreurs',errs);await b.close()})();
