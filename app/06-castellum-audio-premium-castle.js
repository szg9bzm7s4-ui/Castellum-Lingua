/* ===== CASTELLUM · AUDIO PREMIUM + CASTLE CONSISTENCY ===== */
(function(){
  const PREF_KEY='castellumAudioPrefsV2';
  let AP={rate:0.92,voiceByLang:{}};
  try{AP=Object.assign(AP,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'))}catch(e){}
  function saveAP(){try{localStorage.setItem(PREF_KEY,JSON.stringify(AP))}catch(e){}}

  const LOCALE_FALLBACK={
    fr:'fr-FR',it:'it-IT',es:'es-ES',pt:'pt-PT',en:'en-GB',de:'de-DE',nl:'nl-NL',
    ru:'ru-RU',uk:'uk-UA',pl:'pl-PL',cs:'cs-CZ',sk:'sk-SK',sl:'sl-SI',hr:'hr-HR',
    sr:'sr-RS',bg:'bg-BG',ro:'ro-RO',hu:'hu-HU',el:'el-GR',tr:'tr-TR',
    ar:'ar-SA',he:'he-IL',fa:'fa-IR',hi:'hi-IN',bn:'bn-BD',zh:'zh-CN',
    ja:'ja-JP',ko:'ko-KR',vi:'vi-VN',sv:'sv-SE',no:'nb-NO',da:'da-DK',
    fi:'fi-FI',ca:'ca-ES',
    la:'it-IT', /* latin lu par une voix italienne : prononciation ecclésiastique */
    ary:'ar-MA',arq:'ar-DZ',aeb:'ar-TN' /* darijas : voix arabe, marocaine si l'appareil en a une */
  };
  /* Darija : le contenu est écrit en arabizi (lettres latines + chiffres). Pour qu'une voix arabe
     le lise, on le réécrit en lettres arabes juste avant de parler (l'écran ne change pas). */
  const ARABIZI_CODES=new Set(['ary','arq','aeb']);
  const AZ_WORDS={salam:'سلام',slam:'سلام',chokran:'شكرا',bezzaf:'بزاف',bzzaf:'بزاف','3afak':'عافاك',iyeh:'إيه',ah:'آه',la:'لا',wakha:'واخا',
    labas:'لاباس',l7amdoulillah:'الحمد لله',hamdoulillah:'الحمد لله',bslama:'بسلامة',mzyan:'مزيان',mezyan:'مزيان',mzyana:'مزيانة',zwin:'زوين',zwina:'زوينة',
    kifach:'كيفاش',chno:'شنو',chnou:'شنو',ach:'آش',fin:'فين',mnin:'منين',imta:'إمتى',fou9ach:'فوقاش','3lach':'علاش',chkoun:'شكون',wach:'واش',
    ch7al:'شحال',bch7al:'بشحال',hna:'هنا',lhih:'لهيه',daba:'دابا',ghedda:'غدا',lbare7:'البارح',ana:'أنا',nta:'نتا',nti:'نتي',houwa:'هو',hiya:'هي',
    '7na':'حنا',ntouma:'نتوما',homa:'هوما',dyal:'ديال',dyali:'ديالي',dyalek:'ديالك',dyalou:'ديالو',dyalha:'ديالها',dyalna:'ديالنا',dyalkom:'ديالكم',
    m3a:'مع','3la':'على',mn:'من',men:'من',ma:'ما',machi:'ماشي',walou:'والو',chwiya:'شوية',yallah:'يالله',bravo:'برافو',atay:'أتاي',
    '3ndi':'عندي','3ndek':'عندك',smiti:'سميتي',smitek:'سميتك',kayn:'كاين',kayna:'كاينة',hadchi:'هادشي',hada:'هادا',hadi:'هادي',
    walakin:'ولكن','7it':'حيت',ila:'إلا',ghir:'غير',dima:'ديما',bach:'باش',kolchi:'كلشي',kol:'كل',sme7li:'سمح لي',inchallah:'إن شاء الله',
    sba7:'صباح',msa:'مسا',nchoufek:'نشوفك',nichan:'نيشان',safi:'صافي',yak:'ياك',baraka:'بركة',flous:'فلوس',khoya:'خويا',khouya:'خويا',fiya:'فيا',mmi:'مي',bba:'بّا',sghir:'صغير',sghira:'صغيرة'};
  const AZ_DIG=[['ch','ش'],['sh','ش'],['kh','خ'],['gh','غ'],['dj','ج'],['ou','و'],
    ['3','ع'],['7','ح'],['9','ق'],['2','ء'],['5','خ'],['8','ه'],
    ['b','ب'],['t','ت'],['j','ج'],['d','د'],['r','ر'],['z','ز'],['s','س'],['f','ف'],['q','ق'],['k','ك'],['g','ك'],['l','ل'],
    ['m','م'],['n','ن'],['h','ه'],['w','و'],['y','ي'],['v','ف'],['p','ب'],['x','كس'],['c','ك'],
    ['a','ا'],['â','ا'],['à','ا'],['i','ي'],['î','ي'],['é','ي'],['è','ي'],['ê','ي'],['o','و'],['ô','و'],['u','و'],['û','و'],['e','']];
  const AZ_VOW=/^[aâàeiîéèêoôuû]$/;
  function azUnits(w,code){
    const u=[];let i=0;
    while(i<w.length){let hit=null;
      for(const [lat,ar] of AZ_DIG){if(lat==='dj'&&code==='ary')continue;if(w.startsWith(lat,i)){hit=[lat,ar];break}}
      if(!hit)hit=[w[i],w[i]];
      u.push({l:hit[0],a:hit[1],v:hit[0]==='ou'||AZ_VOW.test(hit[0])});i+=hit[0].length}
    return u;
  }
  function azPlain(w,code,afterArticle){
    if(AZ_WORDS[w])return AZ_WORDS[w];
    const u=azUnits(w,code);if(!u.length)return '';
    let out='';
    u.forEach((x,k)=>{
      if(!x.v){out+=x.a;return}
      if(k===0){out+=afterArticle?(x.a||'ا'):/^(ou|o|ô|u|û)$/.test(x.l)?'أو':/^(i|î|é|è|ê)$/.test(x.l)?'إي':'ا';return}
      if(k===u.length-1){out+=/^[aâà]$/.test(x.l)?(u.length>=4&&!/^[nh]$/.test(u[k-1].l)?'ة':'ا'):x.a;return}
      // voyelle courte devant deux consonnes (syllabe fermée) : elle ne s'écrit pas
      if(/^[aâàoô]$/.test(x.l)&&u[k+1]&&!u[k+1].v&&u[k+2]&&!u[k+2].v)return;
      out+=x.a;
    });
    return out.replace(/([^ا])\1+/g,'$1').replace(/ا{2,}/g,'ا');
  }
  function azWord(w,code){
    const lw=w.toLowerCase();
    if(AZ_WORDS[lw])return AZ_WORDS[lw];
    const m=/^([a-z]{1,2})-(.+)$/.exec(lw);
    if(m){
      if(m[1]==='l'||m[2].startsWith(m[1]))return 'ال'+azPlain(m[2],code,true);
      return azPlain(m[1],code)+azPlain(m[2],code);
    }
    if(lw.includes('-'))return lw.split('-').map(x=>azPlain(x,code)).join('');
    return azPlain(lw,code);
  }
  function arabiziToArabic(text,code){
    const toks=String(text||'').split(/([^\p{L}\p{N}'’-]+)/u);
    const out=[];let glue='';
    for(const t of toks){
      if(!t)continue;
      if(glue&&/^\s+$/.test(t))continue;
      if(!/[\p{L}\p{N}]/u.test(t)){out.push(glue+t.replace(/\?/g,'؟').replace(/,/g,'،').replace(/;/g,'؛'));glue='';continue}
      const lw=t.toLowerCase();
      if(/^[flbwd]$/.test(lw)){glue+=({f:'ف',l:'ل',b:'ب',w:'و',d:'د'})[lw];continue}
      out.push(glue+azWord(t,code));glue='';
    }
    if(glue)out.push(glue);
    return out.join('').replace(/\s+/g,' ').trim();
  }
  window.arabiziToArabic=arabiziToArabic;
  /* Micro en darija : le navigateur écoute en arabe marocain (ar-MA) et rend du texte en lettres
     arabes ; on le compare à la phrase attendue réécrite en lettres arabes. */
  [['ary','ar-MA'],['arq','ar-DZ'],['aeb','ar-TN']].forEach(([c,t])=>{try{if(L[c]&&!L[c].t)L[c].t=t}catch(e){}});
  function arNorm(t){return String(t||'').replace(/[ً-ْٰـ]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')
    .replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[ڭگ]/g,'ك').replace(/ڤ/g,'ف').replace(/[^ء-ي\s]/g,' ').replace(/\s+/g,' ').trim()}
  function arScore(heard,expected){
    const a=arNorm(heard),b=arNorm(expected);if(!a||!b)return 0;
    const sk=t=>t.replace(/[اويه\s]/g,'').replace(/^ال/,'');
    return Math.max(dice(a,b),dice(sk(a),sk(b))*.95);
  }
  window.castellumArScore=arScore;
  /* Micro en latin : le navigateur écoute en italien (prononciation la plus proche) ; on compare après avoir
     ramené latin et transcription italienne à la même forme sonore (h muet, ae = e, ti + voyelle = zi, cq = q,
     m final avalé, lettres doublées…). */
  try{if(L.la&&!L.la.t)L.la.t='it-IT'}catch(e){}
  function laKey(t){return norm(t).replace(/[^a-z\s]/g,' ').replace(/ph/g,'f').replace(/th/g,'t').replace(/ch/g,'c').replace(/h/g,'').replace(/ae|oe/g,'e')
    .replace(/y/g,'i').replace(/j/g,'i').replace(/u(?=[aeio])/g,'v').replace(/k/g,'c').replace(/x/g,'s').replace(/cq|qu/g,'q').replace(/ti(?=[aeiou])/g,'zi').replace(/z+/g,'z')
    .replace(/m\b/g,'').replace(/([a-z])\1+/g,'$1').replace(/\s+/g,' ').trim()}
  window.castellumLaKey=laKey;

  /* Vraie voix marocaine : la fonction Supabase « castellum-tts » (voix neuronales Azure Mouna / Jamal)
     lit le texte réécrit en lettres arabes. Utilisée quand on est connecté et que le serveur est configuré ;
     sinon, ou en cas d'erreur, l'appli reprend la voix arabe de l'appareil. Les fichiers déjà entendus
     sont gardés sur l'appareil pour ne pas les redemander. */
  const CT={off:false,audio:null,cache:new Map(),seq:0};
  const CT_NAMES={ary:['Mouna','Jamal'],arq:['Amina','Ismael'],aeb:['Reem','Hedi']};
  function ctAvailable(){try{return !CT.off&&AP.cloudVoice!==false&&typeof Cloud!=='undefined'&&!!Cloud.user&&!!Cloud.client&&!!window.CASTELLUM_CONFIG?.supabaseUrl&&navigator.onLine!==false}catch(e){return false}}
  function ctAudio(){if(!CT.audio){CT.audio=new Audio();CT.audio.preload='auto'}return CT.audio}
  function silentURL(){const n=400,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
    w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
    for(let i=0;i<n;i++)v.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}))}
  // iPhone : le lecteur audio doit être « débloqué » par un premier toucher avant de pouvoir parler tout seul.
  let ctUnlocked=false;
  ['pointerdown','touchend','keydown'].forEach(ev=>document.addEventListener(ev,()=>{
    if(ctUnlocked||typeof S==='undefined'||!ARABIZI_CODES.has(S.tgt))return;ctUnlocked=true;
    try{const a=ctAudio();a.src=silentURL();const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(e){}
    try{if(window.speechSynthesis&&ctAvailable()){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}}catch(e){}},{capture:true,passive:true}));
  async function ctFetch(text,code,slow){
    const key=code+'|'+(slow?1:0)+'|'+(AP.cloudMale?1:0)+'|'+text;
    if(CT.cache.has(key))return CT.cache.get(key);
    const cacheReq='https://castellum-tts.local/'+encodeURIComponent(key);
    let blob=null;
    try{const c=await caches.open('castellum-tts-v1');const hit=await c.match(cacheReq);if(hit)blob=await hit.blob()}catch(e){}
    if(!blob){
      const {data}=await Cloud.client.auth.getSession();const tok=data?.session?.access_token;if(!tok)throw new Error('nosession');
      const cfg=window.CASTELLUM_CONFIG,url=cfg.supabaseUrl.replace(/\/$/,'')+'/functions/v1/'+(cfg.ttsFunction||'castellum-tts');
      const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),8000);let res;
      try{res=await fetch(url,{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok,apikey:cfg.supabaseAnonKey||''},body:JSON.stringify({text,lang:code,slow:!!slow,male:!!AP.cloudMale})})}finally{clearTimeout(to)}
      if(res.status===404||res.status===503){CT.off=true;throw new Error('noserver')}
      if(!res.ok)throw new Error('http '+res.status);
      blob=await res.blob();if(!blob.size)throw new Error('empty');
      try{const c=await caches.open('castellum-tts-v1');await c.put(cacheReq,new Response(blob,{headers:{'Content-Type':'audio/mpeg'}}))}catch(e){}
    }
    const u=URL.createObjectURL(blob);
    if(CT.cache.size>150){const [k0,u0]=CT.cache.entries().next().value;URL.revokeObjectURL(u0);CT.cache.delete(k0)}
    CT.cache.set(key,u);return u;
  }
  function ctStop(){CT.seq++;try{if(CT.audio&&!CT.audio.paused)CT.audio.pause()}catch(e){}}
  function ctSpeak(text,code,slow,fallback){
    const id=++CT.seq;
    ctFetch(text,code,slow).then(u=>{CT.fail=0;if(id!==CT.seq)return;const a=ctAudio();a.src=u;const p=a.play();return p&&p.catch?p.catch(()=>{if(id===CT.seq)fallback()}):p},
      err=>{CT.fail=(CT.fail||0)+1;CT.lastErr=String(err&&err.message||err);if(CT.fail>=2){CT.off=true;try{console.warn('Voix en ligne indisponible ('+CT.lastErr+') : voix de l\'appareil')}catch(e){}}if(id===CT.seq)fallback()});
  }
  try{const ss=window.speechSynthesis;if(ss&&!ss.__ctPatched){const orig=ss.cancel.bind(ss);ss.cancel=function(){ctStop();return orig()};ss.__ctPatched=true}}catch(e){}
  window.castellumCloudVoice={available:ctAvailable,names:CT_NAMES,state:CT};

  /* Accent tonique latin : pénultième si elle est longue (voyelle longue, diphtongue, ou suivie de deux consonnes), sinon antépénultième. */
  function latinStressPos(w,known){
    const lw=w.toLowerCase(),V=/[aeiouyāēīōūȳ]/,nuc=[];
    for(let i=0;i<lw.length;i++){const c=lw[i];if(!V.test(c))continue;
      if(c==="u"&&i>0&&(lw[i-1]==="q"||(lw[i-1]==="g"&&lw[i-2]==="n"))&&V.test(lw[i+1]||""))continue;
      if((c==="i"||c==="j")&&((i===0&&V.test(lw[1]||""))||(i>0&&V.test(lw[i-1])&&V.test(lw[i+1]||""))))continue;
      if(/^(ae|au|oe)$/.test(lw.slice(i,i+2))){nuc.push({s:i,e:i+2,L:true});i++;continue}
      nuc.push({s:i,e:i+1,L:/[āēīōūȳ]/.test(c)});}
    if(nuc.length<2)return -1;
    if(nuc.length===2)return nuc[0].s;
    const pen=nuc[nuc.length-2],nx=nuc[nuc.length-1];
    let cons=lw.slice(pen.e,nx.s).replace(/qu/g,"q").replace(/[cpt]h/g,"t").replace(/h/g,"");
    if(/^[bcdgpt][lr]$/.test(cons))cons="x";else cons=cons.replace(/[xz]/g,"cc");
    if(pen.L||cons.length>=2)return pen.s;
    if(known||/[āēīōūȳ]/.test(lw))return nuc[nuc.length-3].s;
    return -1;
  }
  /* Prononciation restituée (classique) lue par une voix italienne : c et g durs, v = w, ae = aï, accent tonique latin. */
  function latinClassicalForItalianVoice(t){
    try{if(window.castellumMacronize)t=window.castellumMacronize(t)}catch(e){}
    let out=String(t||"").normalize("NFC").replace(/[A-Za-zĀĒĪŌŪȲāēīōūȳ]+/g,w=>{const i=latinStressPos(w,!!(window.castellumLaKnown&&window.castellumLaKnown(w)));return i<0?w:w.slice(0,i+1)+"\u0300"+w.slice(i+1)});
    out=out.normalize("NFD").replace(/[\u0304\u0306]/g,"").toLowerCase()
      .replace(/a(\u0300?)e/g,"a$1i").replace(/o(\u0300?)e/g,"o$1i")
      .replace(/ph/g,"p").replace(/th/g,"t").replace(/rh/g,"r").replace(/ch/g,"c")
      .replace(/c(?=[eiy])/g,"ch").replace(/g(?=[eiy])/g,"gh").replace(/gn/g,"ghn")
      .replace(/v/g,"u").replace(/j/g,"i").replace(/y/g,"i");
    return out.normalize("NFC");
  }
  /* Réécrit le latin pour qu'une voix italienne le prononce à l'ecclésiastique. */
  function latinForItalianVoice(t){
    try{if(((typeof S!=="undefined"&&S.latin&&S.latin.pron)||"classique")!=="eglise")return latinClassicalForItalianVoice(t)}catch(e){}
    return String(t||'').normalize('NFD').replace(/[\u0304\u0306]/g,'').normalize('NFC')
      .replace(/æ/g,'e').replace(/Æ/g,'E').replace(/œ/g,'e').replace(/Œ/g,'E')
      .replace(/ae/g,'e').replace(/Ae|AE/g,'E').replace(/oe/g,'e').replace(/Oe|OE/g,'E')
      .replace(/([^stx])ti([aeiouAEIOU])/g,'$1zi$2')
      .replace(/ph/g,'f').replace(/Ph/g,'F').replace(/th/g,'t').replace(/Th/g,'T').replace(/rh/g,'r')
      .replace(/y/g,'i').replace(/Y/g,'I').replace(/j/g,'i').replace(/J/g,'I')
      .replace(/\b([Mm])ihi\b/g,'$1ichi').replace(/\b([Nn])ihil/g,'$1ichil')
      .replace(/\bh/g,'').replace(/\bH/g,'');
  }
  window.castellumLatinSay=latinForItalianVoice;
  function localeFor(code){
    return L[code]?.t||LOCALE_FALLBACK[code]||code;
  }
  function voiceScore(v,want){
    const lang=(v.lang||'').toLowerCase().replace('_','-'),w=String(want||'').toLowerCase().replace('_','-');
    const root=w.split('-')[0];
    let s=0;
    if(lang===w)s+=80; else if(lang.startsWith(root))s+=45; else return -999;
    const n=(v.name||'').toLowerCase();
    if(/premium|enhanced|neural|natural/.test(n))s+=18;
    if(/siri/.test(n))s+=14;
    if(/google|microsoft/.test(n))s+=10;
    if(v.localService)s+=5;
    if(/novelty|whisper|zarvox|bells|boing|bubbles|organ|cellos/.test(n))s-=60;
    return s;
  }
  window.castellumVoiceFor=function(code){
    const want=localeFor(code),all=(voices&&voices.length?voices:(speechSynthesis?.getVoices?.()||[]));
    if(!all.length)return null;
    const saved=AP.voiceByLang?.[code];
    if(saved){
      const v=all.find(x=>x.name===saved&&voiceScore(x,want)>-900);
      if(v)return v;
    }
    return all.map(v=>[v,voiceScore(v,want)]).sort((a,b)=>b[1]-a[1])[0]?.[1]>-900
      ? all.map(v=>[v,voiceScore(v,want)]).sort((a,b)=>b[1]-a[1])[0][0] : null;
  };

  // Override only TTS selection/playback; existing callers continue to work.
  voiceFor=function(code){return window.castellumVoiceFor(code)};
  canSpeak=code=>!!voiceFor(code)||(ARABIZI_CODES.has(code)&&ctAvailable());
  speak=function(text,code=S.tgt,slow=false){
    try{
      if(!('speechSynthesis' in window))return false;
      const v=voiceFor(code),want=localeFor(code);
      const cloud=ARABIZI_CODES.has(code)&&ctAvailable();
      if(!v&&!cloud)return false;
      speechSynthesis.cancel();
      let say=String(text||'').replace(/\s*\(.*?\)/g,'').trim();
      if(code==='la')say=latinForItalianVoice(say);
      else if(ARABIZI_CODES.has(code))say=arabiziToArabic(say,code);
      if(cloud){const sv=say,rt=Number(AP.rate)||.92;ctSpeak(sv,code,slow,()=>{if(!v){try{toast("Voix en ligne indisponible pour l'instant, et aucune voix arabe n'est installée sur cet appareil")}catch(e){}return}try{const u2=new SpeechSynthesisUtterance(sv);u2.voice=v;u2.lang=v.lang||want;u2.rate=slow?Math.min(.68,rt*.72):rt;speechSynthesis.speak(u2)}catch(e){}});return true}
      const u=new SpeechSynthesisUtterance(say);
      u.voice=v;
      u.lang=v.lang||want;
      const preferred=Number(AP.rate)||.92;
      u.rate=slow?Math.min(.68,preferred*.72):preferred;
      u.pitch=1;
      u.volume=1;
      speechSynthesis.speak(u);
      return true;
    }catch(e){return false}
  };

  function cycleVoice(code){
    const want=localeFor(code),all=(voices||[]).filter(v=>voiceScore(v,want)>-900)
      .sort((a,b)=>voiceScore(b,want)-voiceScore(a,want));
    if(!all.length)return null;
    const current=voiceFor(code),ix=Math.max(-1,all.findIndex(v=>v.name===current?.name));
    const next=all[(ix+1)%all.length];
    AP.voiceByLang=AP.voiceByLang||{};AP.voiceByLang[code]=next.name;saveAP();
    return next;
  }
  function rateName(){return AP.rate<=.75?'Lent':AP.rate>=1.04?'Rapide':'Normal'}

  AP.wordByWord=!!AP.wordByWord;
  function cleanPhrase(t){
    return String(t||'').replace(/\s*\(.*?\)/g,'').replace(/[«»“”"?!;,.:/\\()\[\]{}]/g,' ').replace(/\s+/g,' ').trim();
  }
  function wordTokens(t){
    return cleanPhrase(t).split(' ').map(x=>x.trim()).filter(Boolean).slice(0,24);
  }
  function buildWordBar(text){
    const words=wordTokens(text);
    if(!words.length)return '';
    return `<div class="audio-wordbar" ${AP.wordByWord?'':'hidden'} data-wordbar><span class="wlabel">Mot à mot · touche un mot pour l'entendre</span>${words.map(w=>`<button type="button" data-word-say="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;
  }


  // Adds audio controls to listening/dictation/speaking exercises without altering scoring.
  const __castellumRenderFootAudio=renderFoot;
  renderFoot=function(extra){
    __castellumRenderFootAudio(extra);
    if(!LX||!LX.steps||LX.state!=='idle')return;
    const st=LX.steps[LX.i];
    if(!['listen','dictee','speak','intro'].includes(st?.k))return;
    const host=document.querySelector('#lxStep');
    if(!host||host.querySelector('.audio-premium-bar'))return;
    const text=st?.it?.t||'';
    const v=voiceFor(S.tgt);
    const bar=document.createElement('div');
    bar.className='audio-premium-bar';
    bar.innerHTML=`
      <button type="button" data-audio-play>🔊 Écouter</button>
      <button type="button" data-audio-slow>🐢 Lent</button>
      <button type="button" data-audio-rate>⚙️ ${rateName()}</button>
      <button type="button" data-audio-voice>🎙️ Voix</button>
      <button type="button" data-audio-wordtoggle class="${AP.wordByWord?'on':''}">🔠 Mot à mot</button>
      <span class="audio-voice-note">${(ARABIZI_CODES.has(S.tgt)&&ctAvailable())?`Voix : ${CT_NAMES[S.tgt][AP.cloudMale?1:0]} · ${esc(localeFor(S.tgt))}`:v?`Voix : ${esc(v.name)} · ${esc(v.lang)}`:'Aucune voix système disponible pour cette langue'}</span>
      ${buildWordBar(text)}`;
    host.prepend(bar);
    bar.dataset.text=text;
  };

  document.addEventListener('click',function(e){
    const play=e.target.closest?.('[data-audio-play]');
    const slow=e.target.closest?.('[data-audio-slow]');
    const rate=e.target.closest?.('[data-audio-rate]');
    const vbtn=e.target.closest?.('[data-audio-voice]');
    const wtgl=e.target.closest?.('[data-audio-wordtoggle]');
    const wbtn=e.target.closest?.('[data-word-say]');
    if(play||slow||rate||vbtn||wtgl||wbtn){
      e.preventDefault();e.stopImmediatePropagation();
      const bar=e.target.closest('.audio-premium-bar'),text=bar?.dataset.text||LX?.steps?.[LX.i]?.it?.t||'';
      if(play){speak(text,S.tgt,false);return}
      if(slow){speak(text,S.tgt,true);return}
      if(rate){
        AP.rate=AP.rate<=.75?.92:AP.rate<1.04?1.08:.70;saveAP();
        rate.textContent='⚙️ '+rateName();
        toast('Vitesse audio : '+rateName());
        speak(text,S.tgt,false);return
      }
      if(vbtn&&ARABIZI_CODES.has(S.tgt)&&ctAvailable()){
        AP.cloudMale=!AP.cloudMale;saveAP();const nm=CT_NAMES[S.tgt][AP.cloudMale?1:0];toast('Voix : '+nm);const nt=bar?.querySelector('.audio-voice-note');if(nt)nt.textContent='Voix : '+nm+' · '+localeFor(S.tgt);renderFoot();speak(text,S.tgt,false);return
      }
      if(vbtn){
        const nv=cycleVoice(S.tgt);
        if(nv){toast('Voix : '+nv.name);renderFoot();speak(text,S.tgt,false)}
        else toast('Aucune autre voix disponible pour cette langue');
        return
      }
      if(wtgl){
        AP.wordByWord=!AP.wordByWord; saveAP();
        wtgl.classList.toggle('on',AP.wordByWord);
        const wb=bar?.querySelector('[data-wordbar]');
        if(wb)wb.hidden=!AP.wordByWord;
        toast(AP.wordByWord?'Mode mot à mot activé':'Mode mot à mot désactivé');
        return
      }
      if(wbtn){
        speak(wbtn.getAttribute('data-word-say')||wbtn.textContent||'',S.tgt,false);
        return
      }
    }
  },true);

  // Better recognition scoring while keeping the same exercise flow.
  function phraseScore(a,b){
    const d=dice(a,b);
    const A=new Set(norm(a).split(/\s+/).filter(Boolean)),B=new Set(norm(b).split(/\s+/).filter(Boolean));
    let hit=0;A.forEach(w=>{if(B.has(w))hit++});
    const words=(A.size&&B.size)?hit/Math.max(A.size,B.size):0;
    return Math.min(1,d*.72+words*.28);
  }
  startRec=function(st){
    const h=$("#heard"),btn=$('[data-lx="mic"]');
    if(LX.recog){try{LX.recog.stop()}catch(e){}return}
    try{speechSynthesis.cancel()}catch(e){}
    const target=st.it.t.replace(/\s*\(.*?\)/g,"").trim(),translit=(st.it.p||'').trim();
    let best="",bestSc=0,any="";
    let r;try{r=new SRec()}catch(e){micBlocked=true;renderStep();return}
    r.lang=localeFor(S.tgt);
    r.interimResults=true;r.maxAlternatives=8;r.continuous=false;LX.recog=r;
    btn?.classList.add("on");if(h)h.textContent="Je t'écoute…";
    r.onresult=e=>{
      for(const res of e.results)for(const alt of res){
        any=any||alt.transcript;
        let sc=phraseScore(alt.transcript,target);
        if(ARABIZI_CODES.has(S.tgt))sc=Math.max(sc,arScore(alt.transcript,arabiziToArabic(target,S.tgt)));
        if(S.tgt==='la')sc=Math.max(sc,phraseScore(laKey(alt.transcript),laKey(target)));
        if(translit)sc=Math.max(sc,phraseScore(alt.transcript,translit));
        if(Number.isFinite(alt.confidence)&&alt.confidence>0)sc=Math.min(1,sc*.9+alt.confidence*.1);
        if(sc>bestSc){bestSc=sc;best=alt.transcript}
      }
      if(h)h.textContent=`« ${best||any} »`;
    };
    r.onerror=e=>{
      if(["not-allowed","service-not-allowed","audio-capture"].includes(e.error)){
        micBlocked=true;toast("Micro indisponible : tu peux utiliser « Je ne peux pas parler »");LX.recog=null;renderStep()
      }
    };
    r.onend=()=>{
      if(!LX||LX.recog!==r)return;LX.recog=null;btn?.classList.remove("on");
      if(!best&&!any){if(h)h.textContent="Je n'ai rien entendu. Touche le micro et réessaie.";return}
      st.tries=(st.tries||0)+1;st.heard=best||any;const pc=Math.round(bestSc*100);
      if(bestSc>=.60){grade(true,bestSc>=.87?"Prononciation excellente !":`Bien prononcé ! (${pc} %)`);return}
      if(st.tries<3){if(h)h.innerHTML=`Entendu : « ${esc(st.heard)} » · ${pc} %<br><b>Réécoute puis réessaie (${3-st.tries} essai${3-st.tries>1?"s":""})</b>`;return}
      grade(false)
    };
    try{r.start()}catch(e){LX.recog=null;btn?.classList.remove("on")}
  };

  // Make audio opt-out persistent for the current exercise session but never cost a heart.
  const oldNoHear=window.noHearTransform||null;
  if(typeof noHearTransform==='function'){
    const _nh=noHearTransform;
    noHearTransform=function(){_nh();toast('🔇 Audio remplacé par des exercices visuels · aucun cœur perdu')}
  }
})();
