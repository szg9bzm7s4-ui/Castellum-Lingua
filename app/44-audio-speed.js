/* Vitesse de la voix adaptée au niveau, et lecture enchaînée sans couper les répliques.
   - Débutant (A1, A2) : voix lente par défaut ; B1 et plus : normale. Trois vitesses au choix dans « Réglages ».
   - « Ralentir » est nettement plus lent que la vitesse choisie.
   - « Tout écouter » attend la fin de chaque réplique, puis marque une pause, au lieu d'un minuteur fixe. */
(function(){
  const A=window.CastellumAudio;if(!A||typeof speak!=='function')return;
  const SPEEDS=[['lente','Lente',0.72],['normale','Normale',0.88],['rapide','Rapide',1.0]];
  const SPECIAL=new Set(['la','ary','arq','aeb']); // latin et darija : lecture spécialisée (prononciation adaptée, voix en ligne)
  function cur(){const k=S.audioSpeed||(['A1','A2'].includes(S.level||'A1')?'lente':'normale');return SPEEDS.find(s=>s[0]===k)||SPEEDS[0]}
  A.speed=cur;
  const prevSpeak=speak;
  let done=null;const finish=()=>{const d=done;done=null;if(d)d()};
  speak=function(text,code,slow){
    code=code||S.tgt;
    // fichiers intégrés et voix en ligne : gérés par le module audio, à la bonne vitesse
    if(A.sourceFor(code,text)==='file'||SPECIAL.has(code)||(A.sourceFor(code,text)==='cloud'))return prevSpeak.apply(this,arguments);
    // voix de l'appareil : on règle nous-mêmes la vitesse
    let v=null;try{v=voiceFor(code)}catch(e){}
    if(!v)return prevSpeak.apply(this,arguments); // le module audio affiche l'état « aucune voix »
    try{A.seq++;if(A.audio&&!A.audio.paused)A.audio.pause()}catch(e){}
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text||'').replace(/\s*\(.*?\)/g,'').trim());
      u.__mine=1;u.voice=v;u.lang=v.lang;u.rate=slow?0.55:cur()[2];u.pitch=1;u.onend=finish;u.onerror=finish;
      A.text=text;A.code=code;A.slow=!!slow;A.state='idle';A.src='device';A.err='';try{A.refresh()}catch(e){}
      speechSynthesis.speak(u);return true}catch(e){return prevSpeak.apply(this,arguments)}};
  // Vitesse des fichiers audio : même réglage (la hauteur de voix est conservée)
  const fixRate=()=>{try{const a=A.audio;if(a&&!a.__spd){a.__spd=1;a.addEventListener('play',()=>{a.playbackRate=A.slow?0.7:Math.max(.8,Math.min(1.1,cur()[2]/0.88));a.addEventListener('ended',finish,{once:true})})}}catch(e){}};
  setInterval(fixRate,800);
  // Toutes les autres lectures (latin, darija, anciens modules) : même vitesse.
  try{const ss=window.speechSynthesis;if(ss&&!ss.__spd){const orig=ss.speak.bind(ss);ss.speak=function(u){try{if(u&&!u.__mine)u.rate=(u.rate&&u.rate<=0.7)?0.55:cur()[2]}catch(e){}return orig(u)};ss.__spd=1}}catch(e){}
  setInterval(()=>{try{const ct=window.castellumCloudVoice&&window.castellumCloudVoice.state;const a=ct&&ct.audio;if(a&&!a.__spd){a.__spd=1;a.addEventListener('play',()=>{a.playbackRate=Math.max(.75,Math.min(1.05,cur()[2]/0.88));try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}})}}catch(e){}},800);

  /* Lecture d'une suite de phrases : chaque phrase attend la fin de la précédente. */
  A.sequence=function(texts,code,gap){gap=gap==null?700:gap;let i=0,stop=false;const myStop=()=>{stop=true};A.stopSeq=myStop;
    const next=()=>{if(stop||i>=texts.length)return;const t=texts[i++];let ended=false;
      const go=()=>{if(ended)return;ended=true;setTimeout(next,gap)};
      done=go;speak(t,code||S.tgt,false);
      // filet de sécurité si la fin n'est pas signalée (selon les navigateurs) : durée estimée à la vitesse choisie
      setTimeout(()=>{if(!ended&&!(window.speechSynthesis&&speechSynthesis.speaking)&&!(A.audio&&!A.audio.paused))go()},Math.max(2500,t.length*190/cur()[2]))};
    next();return myStop};

  /* Réglage de vitesse dans « Réglages » */
  const label=()=>`⚙️ Vitesse : ${cur()[1]}`;
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-audio-rate]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    const i=SPEEDS.indexOf(cur());S.audioSpeed=SPEEDS[(i+1)%SPEEDS.length][0];try{save()}catch(err){}b.textContent=label();try{if(typeof translateDom==='function')translateDom(b)}catch(err){}
    try{toast('Vitesse : '+cur()[1])}catch(err){}const bar=b.closest('.audio-premium-bar');const t=(bar&&bar.dataset.text)||A.text;if(t)speak(t,S.tgt,false)},true);
  if(typeof renderFoot==='function'){const pf=renderFoot;renderFoot=function(){const r=pf.apply(this,arguments);try{const b=document.querySelector('#lxStep [data-audio-rate]');if(b&&!b.dataset.spd){b.dataset.spd=1;b.textContent=label()}}catch(e){}return r}}
  // « Tout écouter » du dialogue : lecture enchaînée réelle
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sx="all"]');if(!b||typeof LX==='undefined'||!LX||!LX.sx)return;e.preventDefault();e.stopImmediatePropagation();
    if(A.stopSeq)A.stopSeq();const lines=LX.sx.lines;let k=0;
    const els=[...document.querySelectorAll('#lxStep .sx-line')];const mark=i=>els.forEach((el,j)=>el.classList.toggle('playing',j===i));
    const texts=lines.map(l=>l.t);
    // surligne la réplique en cours
    const orig=speak;A.sequence(texts,'it',800);
    const hl=setInterval(()=>{const idx=texts.findIndex(t=>t===A.text);if(idx>=0)mark(idx);if(!document.querySelector('#lxStep .sx-dlg')){clearInterval(hl)}},200);
    setTimeout(()=>clearInterval(hl),texts.join(' ').length*260+texts.length*1500)},true);
  const css=document.createElement('style');css.id='castellum-audio-speed-css';css.textContent=`.sx-line.playing .sx-bub{box-shadow:0 0 0 3px var(--accent)}`;document.head.appendChild(css);
})();
