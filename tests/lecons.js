const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const withVoice of [true,false]){
const pg=await (await b.newContext()).newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
if(withVoice)await pg.addInitScript(()=>{const V=['it-IT','es-ES','ar-SA','en-GB'].map(l=>({name:'V'+l,lang:l,localService:true,default:false,voiceURI:l}));
  window.SpeechSynthesisUtterance=function(t){this.text=t};const ss={speaking:false,pending:false,getVoices:()=>V,speak(){},cancel(){},pause(){},resume(){},addEventListener(){},removeEventListener(){}};
  Object.defineProperty(window,'speechSynthesis',{get:()=>ss,configurable:true});window.webkitSpeechRecognition=function(){}});
await pg.route(/supabase\.co|googleapis|fonts\./,r=>r.abort());await pg.goto('http://127.0.0.1:8765/index.html');await pg.waitForTimeout(1500);
for(const [lang,lv,u] of [['it','A1',3],['ary','A2',2],['la','A1',4],['ja','A1',1]]){
const r=await pg.evaluate(async([lang,lv,u])=>{S.src='fr';switchLang(lang);S.level=lv;S.seen={};await new Promise(r=>setTimeout(r,400));const out=[];
  const U=lvUnits()[u];let it=setData(U.id);if(!it){try{it=await ensureSet(U.id)}catch(e){return [lang+' : non chargé']}}
  out.push(`${lang} ${lv} « ${U.n} » · ${it.length} phrases · jeux par lieu : ${LORDER.length}`);
  for(const l of LORDER){try{closeLx()}catch(e){}await startLesson(u,l);await new Promise(r=>setTimeout(r,250));const st=LX.steps||[];
    const cnt={};st.forEach(x=>{if(x.k==='intro'||x.scene)return;const ts=x.its?x.its.map(y=>y.t):x.it?[x.it.t]:[];ts.forEach(t=>cnt[t]=(cnt[t]||0)+1)});
    const mx=Math.max(0,...Object.values(cnt)),kinds={};st.forEach(x=>kinds[x.scene?'scène':x.k]=(kinds[x.scene?'scène':x.k]||0)+1);
    out.push(`  jeu ${l}: ${st.length} étapes (${st.filter(x=>x.k!=='intro'&&!x.scene).length} exercices) · une même phrase au plus ${mx} fois · rappels d'anciens lieux ${st.filter(x=>x.back).length} · ${Object.entries(kinds).map(([k,n])=>k+'×'+n).join(' ')}`)}
  try{closeLx()}catch(e){}return out},[lang,lv,u]);
console.log((withVoice?'[avec voix] ':'[sans voix] ')+r.join('\n'))}
console.log('erreurs',errs)}
await b.close()})();
