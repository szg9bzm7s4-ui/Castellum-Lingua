/* Audio fiable. Trois sources, dans cet ordre :
   1. 📦 Fichiers audio intégrés à l'appli (audio/manifest.json) : enregistrements natifs ou voix neuronales
      préparées à l'avance pour les premières leçons. Aucune clé dans le navigateur ; fonctionnent hors ligne
      une fois chargés (gardés dans le cache de l'appareil).
   2. ☁️ Voix en ligne : fonction Supabase « castellum-tts » (la clé Azure reste sur le serveur),
      pour les comptes connectés, quand le serveur est configuré. Connexion requise.
   3. 📱 Voix installée sur l'appareil (synthèse du navigateur).
   Si aucune ne marche : état clair, bouton « Réessayer », et la transcription reste affichée. */
(function(){
  if(typeof speak!=='function'||typeof S==='undefined')return;
  const prevSpeak=speak,prevCan=canSpeak;
  const CLOUD_LANGS=new Set(['it','es','fr','pt','en','de','nl']),ARABIZI_CODES=new Set(['ary','arq','aeb']);
  const A={manifest:null,state:'idle',src:null,err:'',text:'',code:'',slow:false,audio:null,seq:0,cloudOff:false,urls:new Map()};
  window.CastellumAudio=A;

  // Même clé que scripts/make-audio.mjs : FNV-1a 32 bits de « langue|texte normalisé ».
  const clean=t=>String(t||'').replace(/\s*\(.*?\)/g,'').normalize('NFC').trim().replace(/\s+/g,' ');
  function key(code,text){const s=code+'|'+clean(text);let h=0x811c9dc5;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0}return ('0000000'+h.toString(16)).slice(-8)}
  A.key=key;
  /* audio/manifest.json : « langs » liste les langues dont l'index (audio/<langue>/index.json) est chargé
     seulement quand on en a besoin ; « files » garde les entrées détaillées (format 1). */
  const idxLoading=new Set();
  function loadIndex(code){const m=A.manifest;if(!m||!m.langs||!m.langs[code]||idxLoading.has(code))return;idxLoading.add(code);
    fetch(`audio/${code}/index.json`,{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(ix=>{if(!ix)return;const f=(m.files=m.files||{})[code]=m.files[code]||{};
      for(const k in ix)if(!f[k])f[k]={f:`${code}/${k}.mp3`,src:ix[k]==='n'?'native':'tts'};refresh()}).catch(()=>{idxLoading.delete(code)})}
  A.loadIndex=loadIndex;
  if(location.protocol!=='file:')fetch('audio/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(m=>{if(m&&(m.files||m.langs)){A.manifest=m;m.files=m.files||{};try{if(typeof S!=='undefined'&&S.tgt)loadIndex(S.tgt)}catch(e){}}refresh()}).catch(()=>{});
  /* Latin : deux jeux de fichiers, prononciation classique (« la ») et d'église (« la-e »). */
  const audioCode=code=>{try{if(code==='la'&&S.latin&&S.latin.pron==='eglise')return 'la-e'}catch(e){}return code};
  const fileFor=(code0,text)=>{const code=audioCode(code0);const m=A.manifest;if(!m)return null;if(m.langs&&m.langs[code])loadIndex(code);const f=m.files&&m.files[code];return f?f[key(code,text)]||null:null};
  const rate=()=>{try{return Number(JSON.parse(localStorage.getItem('castellumAudioPrefsV2')||'{}').rate)||.92}catch(e){return .92}};
  const cloudReady=code=>!A.cloudOff&&CLOUD_LANGS.has(code)&&typeof Cloud!=='undefined'&&!!Cloud.user&&!!Cloud.client&&!!(window.CASTELLUM_CONFIG||{}).supabaseUrl&&navigator.onLine!==false;
  const deviceVoice=code=>{try{return !!voiceFor(code)}catch(e){return false}};
  const darijaCloud=code=>{try{return !!(window.castellumCloudVoice&&ARABIZI_CODES.has(code)&&window.castellumCloudVoice.available())}catch(e){return false}};
  /* Ce qui sera utilisé pour ce texte, sans rien lire */
  function sourceFor(code,text){if(fileFor(code,text))return 'file';if(cloudReady(code)||darijaCloud(code))return 'cloud';if(deviceVoice(code))return 'device';return null}
  A.sourceFor=sourceFor;

  function set(state,src,err){A.state=state;if(src!==undefined)A.src=src;A.err=err||'';refresh()}
  function player(){if(!A.audio){A.audio=new Audio();A.audio.preload='auto'}return A.audio}
  function stopAll(){A.seq++;try{if(A.audio&&!A.audio.paused)A.audio.pause()}catch(e){}}
  async function cached(url,fetcher,cacheName){
    try{const c=await caches.open(cacheName);const hit=await c.match(url);if(hit)return await hit.blob();const b=await fetcher();if(b&&b.size)try{await c.put(url,new Response(b,{headers:{'Content-Type':b.type||'audio/mpeg'}}))}catch(e){}return b}
    catch(e){return await fetcher()}}
  async function playBlob(blob,slow,id){if(id!==A.seq)return;const a=player();let u=A.urls.get(blob);if(!u){u=URL.createObjectURL(blob);A.urls.set(blob,u)}
    a.src=u;a.playbackRate=slow?.75:Math.min(1.1,Math.max(.8,rate()/.92));try{a.preservesPitch=true;a.mozPreservesPitch=true;a.webkitPreservesPitch=true}catch(e){}
    a.onended=()=>{if(id===A.seq)set('idle')};await a.play();if(id===A.seq)set('playing')}
  async function fromFile(code,text,slow,id){const f=fileFor(code,text);const url=new URL('audio/'+f.f,location.href).href;
    const blob=await cached(url,async()=>{const r=await fetch(url);if(!r.ok)throw new Error('file '+r.status);return await r.blob()},'castellum-audio-v1');await playBlob(blob,slow,id)}
  async function fromCloud(code,text,slow,id){
    const {data}=await Cloud.client.auth.getSession();const tok=data&&data.session&&data.session.access_token;if(!tok)throw new Error('nosession');
    const cfg=window.CASTELLUM_CONFIG,url=cfg.supabaseUrl.replace(/\/$/,'')+'/functions/v1/'+(cfg.ttsFunction||'castellum-tts');
    const ck='https://castellum-tts.local/v2/'+encodeURIComponent(code+'|'+(slow?1:0)+'|'+clean(text));
    const blob=await cached(ck,async()=>{const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),8000);let res;
      try{res=await fetch(url,{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok,apikey:cfg.supabaseAnonKey||''},body:JSON.stringify({text:clean(text),lang:code,slow:!!slow})})}finally{clearTimeout(to)}
      if(res.status===404||res.status===503||res.status===400){A.cloudOff=true;throw new Error('noserver')}
      if(!res.ok)throw new Error('http '+res.status);const b=await res.blob();if(!b.size)throw new Error('empty');return b},'castellum-tts-v2');
    await playBlob(blob,slow,id)}
  function device(text,code,slow){let ok=false;try{ok=prevSpeak(text,code,slow)}catch(e){}return ok}

  speak=function(text,code,slow){
    code=code||S.tgt;slow=!!slow;const id=++A.seq;A.text=text;A.code=code;A.slow=slow;
    try{if(A.audio&&!A.audio.paused)A.audio.pause()}catch(e){}
    const f=fileFor(code,text);
    if(f||(cloudReady(code)&&!ARABIZI_CODES.has(code))){
      try{speechSynthesis.cancel()}catch(e){}
      set('loading',f?'file':'cloud');
      (async()=>{try{if(f)await fromFile(code,text,slow,id);else await fromCloud(code,text,slow,id)}
        catch(err){if(id!==A.seq)return;
          // repli : voix en ligne si le fichier manque, puis voix de l'appareil
          if(f&&cloudReady(code)){try{await fromCloud(code,text,slow,id);return}catch(e){}}
          if(id!==A.seq)return;if(device(text,code,slow)){set('idle','device');return}
          set('error',f?'file':'cloud',navigator.onLine===false?'offline':'failed')}})();
      return true}
    const ok=device(text,code,slow);
    if(ok)set('idle',darijaCloud(code)?'cloud':'device');else set('error',null,'novoice');
    return ok};
  canSpeak=function(code){return prevCan(code)||cloudReady(code)};
  A.retry=()=>{if(A.text)speak(A.text,A.code,A.slow)};
  A.stop=stopAll;
  try{const ss=window.speechSynthesis;if(ss&&!ss.__a2){const orig=ss.cancel.bind(ss);ss.cancel=function(){try{if(A.audio&&!A.audio.paused)A.audio.pause()}catch(e){}return orig()};ss.__a2=true}}catch(e){}

  /* ---------- Libellés ---------- */
  const SRC={file:['📦','Audio intégré · fonctionne hors ligne'],cloud:['☁️','Voix en ligne · connexion requise'],device:['📱','Voix de cet appareil · hors ligne']};
  function statusHTML(text){
    if(A.state==='loading')return `<span class="a2-spin" aria-hidden="true"></span><span>Chargement de l'audio…</span>`;
    if(A.state==='error'&&(!text||clean(text)===clean(A.text))){
      const why=A.err==='offline'?'Pas de connexion : cet audio n\'est pas disponible hors ligne.':A.err==='novoice'?'Aucune voix pour cette langue sur cet appareil.':'L\'audio n\'a pas pu être chargé.';
      const hint=A.err==='novoice'&&CLOUD_LANGS.has(S.tgt)&&!(typeof Cloud!=='undefined'&&Cloud.user)?' <span>Connecte-toi pour utiliser la voix en ligne.</span>':'';
      return `<i class="a2-warn" aria-hidden="true">⚠️</i> <span>${why}</span>${hint} <button type="button" class="a2-retry" data-a2="retry">Réessayer</button>`}
    const s=(window.castellumDeviceFirst&&window.castellumDeviceFirst(S.tgt))?'device':sourceFor(S.tgt,text||A.text);
    if(!s)return `<i class="a2-warn" aria-hidden="true">⚠️</i> <span>Aucune voix pour cette langue sur cet appareil.</span>${CLOUD_LANGS.has(S.tgt)&&!(typeof Cloud!=='undefined'&&Cloud.user)?' <span>Connecte-toi pour utiliser la voix en ligne.</span>':''} <span>Lis la transcription.</span>`;
    const native=s==='file'&&(fileFor(S.tgt,text||A.text)||{}).src==='native';
    return `${SRC[s][0]} <span>${native?'Enregistrement natif · fonctionne hors ligne':s==='file'?'Voix de synthèse intégrée · fonctionne hors ligne':SRC[s][1]}</span>`}
  A.statusHTML=statusHTML;
  function refresh(){
    document.querySelectorAll('[data-a2-status]').forEach(el=>{el.innerHTML=statusHTML(el.dataset.a2Status||'')});
    document.querySelectorAll('.audio-premium-bar [data-audio-play]').forEach(b=>{b.disabled=A.state==='loading';b.setAttribute('aria-busy',A.state==='loading'?'true':'false')});
    const al=document.getElementById('a2Alert');
    if(A.state==='error'&&!document.querySelector('[data-a2-status]')&&Date.now()-(A.asked||0)<2500){
      if(!al){const d=document.createElement('div');d.id='a2Alert';d.setAttribute('role','alert');document.body.appendChild(d)}
      document.getElementById('a2Alert').innerHTML=statusHTML(A.text)+`<button type="button" class="a2-x" data-a2="close" aria-label="Fermer">✕</button>`}
    else if(al)al.remove()}
  A.refresh=refresh;

  /* ---------- Barre audio des exercices : « Écouter » et « Ralentir » en avant, le reste dans « Réglages » ---------- */
  const prevFoot=renderFoot;
  renderFoot=function(){const r=prevFoot.apply(this,arguments);try{tidyBar()}catch(e){}return r};
  function tidyBar(){const bar=document.querySelector('#lxStep .audio-premium-bar');if(!bar||bar.dataset.a2)return;bar.dataset.a2='1';
    const text=bar.dataset.text||'';
    const play=bar.querySelector('[data-audio-play]'),slow=bar.querySelector('[data-audio-slow]');
    if(play)play.innerHTML='🔊 <span>Écouter</span>';if(slow)slow.innerHTML='🐢 <span>Ralentir</span>';
    const more=document.createElement('div');more.className='a2-more';more.hidden=true;more.id='a2More'+Date.now();
    ['[data-audio-rate]','[data-audio-voice]','[data-audio-wordtoggle]'].forEach(s=>{const b=bar.querySelector(s);if(b)more.appendChild(b)});
    more.insertAdjacentHTML('beforeend',`<p class="a2-explain"><span>📦 Audio intégré : fichiers de l'appli, écoutables hors ligne une fois chargés.</span><br><span>☁️ Voix en ligne : pour les comptes connectés, connexion requise.</span><br><span>📱 Voix de l'appareil : dépend des voix installées sur ton téléphone ou ordinateur.</span></p>`);
    const note=bar.querySelector('.audio-voice-note');if(note)note.remove();
    const tog=document.createElement('button');tog.type='button';tog.className='a2-more-btn';tog.setAttribute('aria-expanded','false');tog.setAttribute('aria-controls',more.id);tog.innerHTML='⋯ <span>Réglages</span>';
    const row=document.createElement('div');row.className='a2-row';if(play)row.appendChild(play);if(slow)row.appendChild(slow);row.appendChild(tog);
    const st=document.createElement('p');st.className='a2-status';st.dataset.a2Status=text;st.setAttribute('role','status');st.setAttribute('aria-live','polite');st.innerHTML=statusHTML(text);
    bar.prepend(row);row.after(st);st.after(more);
    try{if(typeof translateDom==='function')translateDom(bar)}catch(e){}}
  // L'alerte ne s'affiche que si l'on a demandé l'audio soi-même (pas pour la lecture automatique).
  document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('[data-audio-play],[data-audio-slow],[data-say],[data-sayslow],[data-sx-say],[data-sx="all"],[data-word-say],.listen-big,.mini-say,.say'))A.asked=Date.now()},true);
  window.addEventListener('click',e=>{const tog=e.target.closest&&e.target.closest('.a2-more-btn');if(!tog)return;e.preventDefault();e.stopPropagation();
    const more=document.getElementById(tog.getAttribute('aria-controls'));if(!more)return;more.hidden=!more.hidden;tog.setAttribute('aria-expanded',String(!more.hidden))},true);
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-a2]');if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.a2==='retry')A.retry();if(b.dataset.a2==='close'){A.state='idle';refresh()}},true);

  const css=document.createElement('style');css.id='castellum-audio2-css';css.textContent=`
.audio-premium-bar[data-a2]{display:grid!important;gap:6px;margin-bottom:10px}
.a2-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.a2-row [data-audio-play],.a2-row [data-audio-slow]{min-height:44px;padding:8px 16px!important;font-size:1rem!important;font-weight:900!important}
.a2-row [data-audio-play]{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
.a2-row [data-audio-play][aria-busy="true"]{opacity:.7}
.a2-more-btn{border:0;background:none;color:var(--ink-2);font:inherit;font-weight:800;padding:8px;min-height:44px;cursor:pointer;margin-left:auto}
.a2-more{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border:1px dashed var(--line);border-radius:12px}
.a2-more[hidden]{display:none!important}
.a2-explain{flex-basis:100%;margin:4px 0 0;font-size:.8rem;color:var(--ink-2);line-height:1.45}
.a2-status{margin:0;font-size:.84rem;color:var(--ink-2);font-weight:700;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.a2-retry{border:2px solid var(--accent);background:var(--surface);color:var(--accent);border-radius:10px;padding:4px 10px;font:inherit;font-weight:900;cursor:pointer;min-height:36px}
.a2-spin{width:14px;height:14px;border-radius:50%;border:2px solid var(--line);border-top-color:var(--accent);animation:a2spin .8s linear infinite;display:inline-block}
@keyframes a2spin{to{transform:rotate(360deg)}}
#a2Alert{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));z-index:95;max-width:min(520px,calc(100vw - 32px));background:var(--surface);color:var(--ink);border:2px solid #F08A24;border-radius:14px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.18);display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-weight:700;font-size:.88rem}
#a2Alert .a2-x{border:0;background:none;font-size:1rem;cursor:pointer;color:var(--ink-2);margin-left:auto;min-width:32px;min-height:32px}
@media (prefers-reduced-motion:reduce){.a2-spin{animation:none}}
`;document.head.appendChild(css);
})();
