/* Séquence modèle : « Au bar, à Naples » (italien A1, pour francophones).
   Dialogue avec audio et transcription → compréhension → usage de ciao / buongiorno / salve (registres)
   → exercices guidés → phrase à construire → réponse à écrire (variantes acceptées) → oral facultatif → bilan.
   Le format (window.CastellumSituations) est réutilisable pour d'autres langues et d'autres situations. */
(function(){
  if(typeof begin!=='function'||typeof stepHTML!=='function'||typeof finish!=='function')return;
  const E=s=>typeof esc==='function'?esc(s):String(s);
  const REG={std:['Standard','reg-std'],fam:['Familier','reg-fam'],form:['Poli · vouvoiement','reg-form'],nap:['Napolitain','reg-nap'],reg:['Régional','reg-reg']};
  const tag=k=>`<span class="sx-reg ${REG[k][1]}">${REG[k][0]}</span>`;

  const CAFE={
    id:'it-napoli-bar',tgt:'it',src:'fr',lv:'A1',ic:'☕',
    title:'Au bar, à Naples',sub:'Saluer et commander un café',
    goal:'Commander un café et saluer selon la personne',
    // En Italie, on prend le café « al bar », debout au comptoir.
    lines:[
      {who:'barista',av:'🧔🏻',t:'Buongiorno! Cosa prende?',s:'Bonjour ! Qu\'est-ce que vous prenez ?'},
      {who:'tu',av:'🙂',t:'Buongiorno! Un caffè, per favore.',s:'Bonjour ! Un café, s\'il vous plaît.'},
      {who:'barista',av:'🧔🏻',t:'Ecco a lei.',s:'Voilà pour vous.'},
      {who:'tu',av:'🙂',t:'Grazie. Quant\'è?',s:'Merci. C\'est combien ?'},
      {who:'barista',av:'🧔🏻',t:'Un euro e venti.',s:'Un euro vingt.'},
      {who:'tu',av:'🙂',t:'Grazie, arrivederci!',s:'Merci, au revoir !'},
      {who:'barista',av:'🧔🏻',t:'Arrivederci, buona giornata!',s:'Au revoir, bonne journée !'}],
    // Éléments appris : ils entrent dans les révisions espacées.
    items:[{t:'Buongiorno',s:'Bonjour (poli)'},{t:'Salve',s:'Bonjour (neutre)'},{t:'Ciao',s:'Salut (familier)'},
      {t:'Un caffè, per favore.',s:'Un café, s\'il vous plaît.'},{t:'Quant\'è?',s:'C\'est combien ?'},{t:'Grazie, arrivederci!',s:'Merci, au revoir !'},
      {t:'Ecco a lei.',s:'Voilà pour vous.'},{t:'Un euro e venti.',s:'Un euro vingt.'}],
    can:[['Saluer au café selon la personne','Buongiorno · Salve · Ciao'],['Commander une boisson poliment','Un caffè, per favore.'],['Demander le prix','Quant\'è?'],['Comprendre un court échange au comptoir','Ecco a lei. · Un euro e venti.']]
  };

  function steps(sx){
    const it=t=>sx.items.find(x=>x.t===t);
    const out=[];
    out.push({k:'intro',sx:'dialogue',it:{t:sx.lines[0].t,s:sx.lines[0].s}});
    out.push({k:'gap',sxq:1,title:'Compréhension',q:'Qu\'est-ce que tu commandes au barista ?',lang:S.src,opts:shuffle(['Un café','Un cappuccino','Un jus d\'orange','Un croissant']),ans:'Un café',
      expl:'Tu dis <span lang="it" data-noi18n>« Un caffè, per favore »</span> : un café, s\'il vous plaît. En Italie, <span lang="it" data-noi18n>un caffè</span> est un expresso, qu\'on boit souvent debout au comptoir.'});
    out.push({k:'gap',sxq:1,title:'Compréhension',q:'Combien coûte le café ?',lang:S.src,opts:shuffle(['1,20 €','2,10 €','1,00 €','12 €']),ans:'1,20 €',
      expl:'Le barista dit <span lang="it" data-noi18n>« Un euro e venti »</span> : un euro vingt. <span lang="it" data-noi18n>Venti</span> veut dire vingt.'});
    out.push({k:'intro',sx:'note',it:{t:'Buongiorno',s:'Bonjour'}});
    out.push({k:'gap',title:'Choisis la bonne salutation',q:'9 h du matin. Tu entres dans un bar et tu ne connais pas le barista.',lang:'it',opts:shuffle(['Buongiorno!','Ciao!','Buonanotte!','Arrivederci!']),ans:'Buongiorno!',it:it('Buongiorno'),
      expl:'<span lang="it" data-noi18n>Buongiorno</span> est poli et convient à un inconnu. <span lang="it" data-noi18n>Ciao</span> est familier : possible avec un barista que tu connais bien. <span lang="it" data-noi18n>Buonanotte</span> se dit en allant se coucher, <span lang="it" data-noi18n>Arrivederci</span> en partant.'});
    out.push({k:'gap',title:'Choisis la bonne salutation',q:'Ton ami Luca te rejoint au comptoir.',lang:'it',opts:shuffle(['Ciao, Luca!','Buonanotte, Luca!','Arrivederci, Luca!','Grazie, Luca!']),ans:'Ciao, Luca!',it:it('Ciao'),
      expl:'Entre amis, on dit <span lang="it" data-noi18n>Ciao</span> (familier), en arrivant comme en partant. <span lang="it" data-noi18n>Grazie</span> veut dire merci, <span lang="it" data-noi18n>Arrivederci</span> s\'emploie pour partir.'});
    out.push({k:'gap',title:'Choisis la bonne salutation',q:'Tu ne sais pas si tu dois tutoyer ou vouvoyer. Quelle salutation convient à tout le monde ?',lang:'it',opts:shuffle(['Salve!','Ciao!','Uè!','Buonanotte!']),ans:'Salve!',it:it('Salve'),
      expl:'<span lang="it" data-noi18n>Salve</span> est neutre et poli : il passe partout pour saluer en arrivant. <span lang="it" data-noi18n>Ciao</span> est familier, et <span lang="it" data-noi18n>Uè</span> est du napolitain très familier, pour interpeller un proche.'});
    const b=makeStep('build',it('Un caffè, per favore.'),sx.items.concat(sx.lines.map(l=>({t:l.t,s:l.s}))));b.title='Construis ta commande';out.push(b);
    if(typeof canSpeak==='function'&&canSpeak('it'))out.push(Object.assign(makeStep('listen',it('Quant\'è?'),sx.items),{}));
    else out.push(makeStep('rev',it('Quant\'è?'),sx.items));
    out.push({k:'type',sxprod:1,it:{t:'Un cappuccino, per favore.',s:'Un cappuccino, s\'il vous plaît.'},title:'À toi : réponds au barista',
      prompt:'Le barista te demande <span lang="it" data-noi18n>« Cosa prende? »</span>. Commande un cappuccino, poliment.'});
    if(typeof canListen==='function'&&canListen('it')&&!(typeof speakMuted==='function'&&speakMuted()))out.push({k:'speak',it:it('Un caffè, per favore.'),optional:1});
    return out}

  /* ---------- Affichage des étapes propres à la situation ---------- */
  const prevHTML=stepHTML;
  stepHTML=function(st){
    const sx=LX&&LX.sx;
    if(sx&&st.sx==='dialogue'){const tr=!!LX.showTr;
      return `<div class="sx">
        <div class="sx-head"><span class="sx-ic">${sx.ic}</span><div><small>📍 Napoli · ${E(sx.lv)}</small><b>${E(sx.title)}</b></div></div>
        <p class="sx-intro">Écoute la conversation. Touche une réplique pour la réécouter.</p>
        <div class="sx-dlg" role="list">${sx.lines.map((l,i)=>`<div class="sx-line ${l.who==='tu'?'me':''}" role="listitem"><span class="sx-av" aria-hidden="true">${l.av}</span><div class="sx-bub"><small>${l.who==='tu'?'Toi':'Le barista'}</small><button type="button" class="sx-say" data-sx-say="${i}" lang="it" data-noi18n aria-label="Écouter : ${E(l.t)}">${E(l.t)} <span aria-hidden="true">🔊</span></button>${tr?`<span class="sx-tr" data-noi18n>${E(l.s)}</span>`:''}</div></div>`).join('')}</div>
        <p class="a2-status" data-a2-status="${E(sx.lines[0].t)}" role="status" aria-live="polite">${window.CastellumAudio?window.CastellumAudio.statusHTML(sx.lines[0].t):''}</p>
        <div class="sx-tools"><button type="button" class="btn ghost" data-sx="all">▶ <span>Tout écouter</span></button><button type="button" class="btn ghost" data-sx="tr" aria-pressed="${tr}">${tr?'Masquer la traduction':'Afficher la traduction'}</button></div>
        <p class="sx-note">${tag('std')} <span>Italien standard, tel qu'on le parle dans un bar de Naples.</span> ${tag('form')} <span>Le barista vouvoie (</span><span lang="it" data-noi18n>lei</span><span>).</span></p></div>`}
    if(sx&&st.sx==='note')return `<div class="sx">
        <div class="sx-head"><span class="sx-ic">👋</span><div><small>Usage</small><b>Ciao, buongiorno ou salve ?</b></div></div>
        <div class="sx-cards">
          <div class="sx-card"><b lang="it" data-noi18n>Buongiorno</b> ${tag('std')}${tag('form')}<p>Poli. Pour saluer un inconnu, un commerçant, un client. Le matin et en début d'après-midi ; ensuite on dit <span lang="it" data-noi18n>Buonasera</span>.</p></div>
          <div class="sx-card"><b lang="it" data-noi18n>Salve</b> ${tag('std')}<p>Neutre et poli, à toute heure. Pratique quand tu ne sais pas si tu dois tutoyer. Seulement pour saluer en arrivant.</p></div>
          <div class="sx-card"><b lang="it" data-noi18n>Ciao</b> ${tag('fam')}<p>Familier. Avec des amis, la famille, les personnes que tu tutoies. Pour arriver comme pour partir.</p></div>
        </div>
        <div class="sx-nap"><b>🌋 <span>Italien de Naples ou napolitain ?</span></b><p>Dans les commerces, on te parle italien standard. Mais à Naples, tu entendras aussi le napolitain, une langue à part entière. Par exemple :</p>
          <ul><li><b lang="nap" data-noi18n>Uè!</b> ${tag('nap')}${tag('fam')} <span>« Eh ! » : pour interpeller ou saluer un proche.</span></li><li><b lang="nap" data-noi18n>’o cafè</b> ${tag('nap')} <span>« le café ».</span></li></ul>
          <p>Apprends d'abord l'italien standard ; tu reconnaîtras le napolitain au fil des situations.</p></div></div>`;
    if(sx&&st.sxprod)return `<div class="q-title">${E(st.title)}</div><div class="speaker">${typeof mascot==='function'?mascot():''}<div class="bubble" lang="${S.src}">${st.prompt}</div></div>
      <p class="sx-hint">Écris en italien. Plusieurs réponses sont possibles.</p>${typeof typeBox==='function'?typeBox(st,'Ta réponse en italien'):'<input class="type-line" id="typeIn" lang="it" autocomplete="off">'}`;
    if(sx&&st.sxq)return `<div class="q-title">${E(st.title)}</div><div class="speaker">${typeof mascot==='function'?mascot():''}<div class="bubble" lang="${S.src}">${E(st.q)}</div></div><div class="opts">${st.opts.map((o,i)=>`<button class="opt" data-opt="${i}" lang="${S.src}"><kbd>${i+1}</kbd><span>${E(o)}</span></button>`).join('')}</div>`;
    if(sx&&st.k==='gap'&&!st.sxq&&!/___/.test(st.q))return `<div class="q-title">${E(st.title)}</div><div class="speaker">${typeof mascot==='function'?mascot():''}<div class="bubble" lang="${S.src}">${E(st.q)}</div></div><div class="opts">${st.opts.map((o,i)=>`<button class="opt" data-opt="${i}" lang="it" data-noi18n><kbd>${i+1}</kbd><span>${E(o)}</span></button>`).join('')}</div>`;
    return prevHTML.apply(this,arguments)};

  /* ---------- Correction de la réponse libre : variantes acceptées, petites fautes tolérées ---------- */
  const strip=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,"'").replace(/[^a-z' ]+/g,' ').replace(/\s+/g,' ').trim();
  function judgeOrder(raw){
    const v=strip(raw),words=v.split(' ');
    const capp=words.find(w=>w==='cappuccino')?'ok':words.find(w=>w.length>5&&typeof lev==='function'&&lev(w,'cappuccino')<=2)?'typo':null;
    const polite=/\bper favore\b|\bper piacere\b|\bgrazie\b|\bvorrei\b|\bprendo\b|\bper me\b/.test(v);
    if(!capp){if(/\bcaffe\b/.test(v))return {ok:false,why:'Tu as commandé <span lang="it" data-noi18n>un caffè</span> (un expresso). Ici, on voulait <span lang="it" data-noi18n>un cappuccino</span>.'};
      if(/s il vous plait|s'il vous plait|cafe creme/.test(v))return {ok:false,why:'Réponds en italien : <span lang="it" data-noi18n>« Un cappuccino, per favore. »</span>'};
      return {ok:false,why:'Il faut nommer la boisson : <span lang="it" data-noi18n>un cappuccino</span>, puis <span lang="it" data-noi18n>per favore</span> pour être poli.'}}
    if(capp==='typo')return {ok:true,msg:'Compris ! Attention à l\'orthographe : cappuccino (deux p, deux c).'};
    if(!polite&&/s[' ]?il vous plait|s[' ]?il te plait|merci/.test(v))return {ok:true,msg:'Compris ! En italien, « s\'il vous plaît » se dit « per favore ».'};
    if(!polite)return {ok:true,msg:'Compris ! Ajoute « per favore » pour être poli.'};
    return {ok:true,msg:/\bvorrei\b/.test(v)?'Parfait ! « Vorrei » (je voudrais) est très poli.':'Parfait, c\'est exactement ce qu\'on dit au bar !'}}
  const prevCheck=check;
  check=function(){
    const st=LX&&LX.steps&&LX.steps[LX.i];
    if(st&&st.sxprod){const raw=(document.getElementById('typeIn')||{}).value||'';if(!raw.trim())return;const r=judgeOrder(raw);st.why=r.why||'';grade(r.ok,r.ok?r.msg:undefined);return}
    return prevCheck.apply(this,arguments)};
  // Une erreur sur une étape de la situation : on repose la même question (avec ses explications), pas une question générique.
  const prevGrade=grade;
  grade=function(ok){const st=LX&&LX.steps&&LX.steps[LX.i];const n=LX&&LX.steps?LX.steps.length:0;const r=prevGrade.apply(this,arguments);
    try{if(LX&&LX.sx&&!ok&&st&&(st.sxq||st.sxprod||st.expl||st.k==='gap')&&LX.steps.length>n){LX.steps[LX.steps.length-1]=Object.assign({},st,{retry:true,opts:st.opts?shuffle(st.opts):st.opts})}
      if(LX&&LX.sx&&st&&st.sxq){LX.sxComp=LX.sxComp||{};if(LX.sxComp[st.q]==null)LX.sxComp[st.q]=!!ok}}catch(e){}
    return r};

  // Pas d'astuce générique ni de barre audio générique pendant la situation : elle a les siennes.
  if(typeof tipHTML==='function'){const prevTip=tipHTML;tipHTML=function(st){if(LX&&LX.sx)return '';return prevTip.apply(this,arguments)}}
  const prevFoot=renderFoot;
  renderFoot=function(){const r=prevFoot.apply(this,arguments);try{const st=LX&&LX.sx&&LX.steps[LX.i];if(st&&st.sx){const b=document.querySelector('#lxStep .audio-premium-bar');if(b)b.remove()}}catch(e){}return r};

  /* ---------- Lancement et bilan ---------- */
  function start(sx){sx=sx||CAFE;try{if(typeof openLx==='function')openLx()}catch(e){}
    begin({mode:'game',game:'situation',label:sx.title,sx,items:sx.items.slice(),steps:steps(sx)});try{if(typeof save==='function')save()}catch(e){}}
  const prevFinish=finish;
  finish=function(){const sx=LX&&LX.sx;const comp=LX&&LX.sxComp;const trUsed=!!(LX&&LX.trUsed);const r=prevFinish.apply(this,arguments);
    if(!sx)return r;
    try{const allComp=comp&&Object.values(comp).length&&Object.values(comp).every(Boolean);
      S.cando=S.cando||{};const k=sx.tgt+':'+sx.id;const prev=S.cando[k]||{};
      S.cando[k]={first:prev.first||dk(new Date()),last:dk(new Date()),times:(prev.times||0)+1,comp:!!(allComp||prev.comp),noTr:!!((allComp&&!trUsed)||prev.noTr)};
      sx.items.forEach(x=>{try{if(typeof srsUpdate==='function'&&!(srsList()||[]).some(y=>y.t===x.t))srsUpdate(x,true)}catch(e){}});
      try{save()}catch(e){}
      const body=document.querySelector('#lxBody .done-screen');if(body){
        const h=body.querySelector('h1');if(h)h.textContent='Situation réussie !';
        body.querySelectorAll('.ls-can,.ls-bye,.ls-mbtn').forEach(x=>x.remove());
        body.insertAdjacentHTML('beforeend',`<div class="sx-done"><b>✅ <span>Maintenant, tu sais :</span></b><ul>${sx.can.map(([a,b],i)=>{const okC=i<3||allComp;return `<li class="${okC?'':'todo'}"><span>${okC?'✓':'↻'}</span><div><b>${a}</b><small lang="it" data-noi18n>${E(b)}</small>${okC?'':'<small>À revoir : relis le dialogue sans traduction.</small>'}</div></li>`}).join('')}</ul>
          <p class="sx-rev">🔁 <span>Ces expressions reviendront dans tes révisions demain, puis dans quelques jours, pour qu'elles restent.</span></p></div>`);
        try{if(typeof translateDom==='function')translateDom(body)}catch(e){}}
      if(typeof window.castellumOnboardResult==='function')window.castellumOnboardResult(sx);
    }catch(e){console.warn('situation',e)}
    return r};

  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sx],[data-sx-say]');if(!b||!LX||!LX.sx)return;e.preventDefault();
    if(b.dataset.sxSay!=null){const l=LX.sx.lines[+b.dataset.sxSay];if(l){const st=document.querySelector('#lxStep [data-a2-status]');if(st)st.dataset.a2Status=l.t;speak(l.t,'it')}return}
    if(b.dataset.sx==='tr'){LX.showTr=!LX.showTr;if(LX.showTr)LX.trUsed=true;const s=document.getElementById('lxStep');if(s)s.innerHTML=stepHTML(LX.steps[LX.i]);try{if(typeof translateDom==='function')translateDom(s)}catch(err){}return}
    if(b.dataset.sx==='all'){const ls=LX.sx.lines;let i=0;const next=()=>{if(!LX||!LX.sx||i>=ls.length)return;speak(ls[i].t,'it');const len=ls[i].t.length;i++;setTimeout(next,900+len*75)};next()}},true);

  // L'oral est facultatif : « Passer » ou « Je ne peux pas parler » avancent sans compter d'erreur.
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lx="skip"]');if(!b||!LX||!LX.sx)return;const st=LX.steps[LX.i];if(!st||st.k!=='speak')return;
    e.preventDefault();e.stopImmediatePropagation();LX.state='skip';nextStep()},true);
  window.CastellumSituations={list:[CAFE],start,steps,judgeOrder};

  const css=document.createElement('style');css.id='castellum-napoli-css';css.textContent=`
.sx{display:grid;gap:14px}
.sx-head{display:flex;gap:12px;align-items:center}.sx-ic{font-size:2.4rem}.sx-head small{display:block;color:var(--ink-2);font-weight:800}.sx-head b{font-size:1.25rem}
.sx-intro{margin:0;color:var(--ink-2);font-weight:700}
.sx-dlg{display:grid;gap:8px}
.sx-line{display:flex;gap:8px;align-items:flex-end}.sx-line.me{flex-direction:row-reverse}
.sx-av{font-size:1.8rem;line-height:1}
.sx-bub{background:var(--surface);border:2px solid var(--line);border-radius:16px 16px 16px 4px;padding:8px 12px;display:grid;gap:2px;max-width:82%}
.sx-line.me .sx-bub{border-radius:16px 16px 4px 16px;background:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}
.sx-bub small{color:var(--ink-2);font-weight:800;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em}
.sx-say{border:0;background:none;padding:0;font:inherit;font-size:1.1rem;font-weight:900;color:var(--ink);text-align:left;cursor:pointer;min-height:32px}
.sx-tr{color:var(--ink-2);font-weight:700;font-size:.9rem}
.sx-tools{display:flex;gap:8px;flex-wrap:wrap}.sx-tools .btn{flex:1;min-height:44px}
.sx-note{margin:0;font-size:.85rem;color:var(--ink-2);font-weight:700;line-height:1.7}
.sx-reg{display:inline-block;border-radius:99px;padding:1px 8px;font-size:.72rem;font-weight:900;margin:0 2px;vertical-align:middle}
.reg-std{background:#E3F2E7;color:#1E6B34}.reg-fam{background:#FFF0D6;color:#8A5300}.reg-form{background:#E4ECFF;color:#24408E}.reg-nap{background:#FDE3E3;color:#8E2424}.reg-reg{background:#EEE6FB;color:#55308E}
.sx-cards{display:grid;gap:10px}
.sx-card{background:var(--surface);border:2px solid var(--line);border-radius:16px;padding:12px}.sx-card b{font-size:1.2rem}.sx-card p{margin:6px 0 0;line-height:1.45}
.sx-nap{background:color-mix(in srgb,#E05A47 8%,var(--surface));border:2px dashed color-mix(in srgb,#E05A47 45%,var(--line));border-radius:16px;padding:12px;line-height:1.45}.sx-nap p{margin:6px 0}.sx-nap ul{margin:6px 0;padding-left:18px}
.sx-hint{margin:-6px 0 0;color:var(--ink-2);font-weight:700;font-size:.9rem}
.sx-done{text-align:left;margin-top:14px;background:var(--surface);border:2px solid var(--good);border-radius:18px;padding:12px 14px}
.sx-done ul{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:8px}.sx-done li{display:flex;gap:10px}.sx-done li>span{color:var(--good);font-weight:900}.sx-done li.todo>span{color:#C07A00}
.sx-done li small{display:block;color:var(--ink-2)}.sx-rev{margin:10px 0 0;color:var(--ink-2);font-weight:700;font-size:.88rem}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .reg-std{background:#173D22;color:#9BE0AE}:root:not([data-theme="light"]) .reg-fam{background:#3D2C0C;color:#F5C877}:root:not([data-theme="light"]) .reg-form{background:#1A2850;color:#AFC3FF}:root:not([data-theme="light"]) .reg-nap{background:#4A1A1A;color:#F5B0B0}}
:root[data-theme="dark"] .reg-std{background:#173D22;color:#9BE0AE}:root[data-theme="dark"] .reg-fam{background:#3D2C0C;color:#F5C877}:root[data-theme="dark"] .reg-form{background:#1A2850;color:#AFC3FF}:root[data-theme="dark"] .reg-nap{background:#4A1A1A;color:#F5B0B0}
`;document.head.appendChild(css);
})();
