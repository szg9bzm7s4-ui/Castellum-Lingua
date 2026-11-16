/* Premières minutes et promesses honnêtes.
   - Accueil en 4 étapes fixes : Langue → Niveau (test de positionnement facultatif) → Première activité → Résultat.
   - Sans compte. Le royaume (architecture, titre) se personnalise après, quand on veut.
   - Couverture du catalogue, disponibilité hors ligne et progression de l'utilisateur sont séparées.
   - C2 = « Maîtrise » (CECRL), jamais « natif ». Page « Comment ça marche » : méthode, provenance, vérification. */
(function(){
  if(typeof welcomeStep!=='function'||typeof LEVEL_INFO==='undefined')return;
  const E=s=>typeof esc==='function'?esc(s):String(s);
  const lname=c=>(L[c]&&L[c].n)||c;

  /* ---------- 1. Niveaux CECRL : libellés corrects ---------- */
  const LV={A1:['Débutant','Comprendre et utiliser des expressions familières et quotidiennes.'],A2:['Élémentaire','Échanger sur des sujets simples et habituels.'],
    B1:['Intermédiaire','Se débrouiller dans la plupart des situations de voyage, raconter, donner son avis.'],B2:['Intermédiaire avancé','Comprendre des textes complexes, discuter avec aisance.'],
    C1:['Avancé','S\'exprimer de façon fluide, nuancée et structurée.'],C2:['Maîtrise','Comprendre presque tout sans effort et s\'exprimer avec précision et finesse.']};
  LEVEL_INFO.forEach(x=>{if(LV[x.id]){x.n=LV[x.id][0];x.d=LV[x.id][1]}});

  /* ---------- 2. Couverture du catalogue (≠ progression) ---------- */
  const audioLangs=()=>{const m=window.CastellumAudio&&window.CastellumAudio.manifest;return new Set(Object.keys((m&&m.files)||{}).filter(k=>Object.keys(m.files[k]).length).concat(Object.keys((m&&m.langs)||{})))};
  function coverageText(lang){const lv=typeof offlineLevels==='function'?offlineLevels(lang):[];
    if(lv.length===6)return 'A1 → C2 intégrés';if(lv.length>1)return `${lv[0]} → ${lv[lv.length-1]} intégrés`;if(lv.length===1)return `${lv[0]} intégré · suite générée en ligne`;return 'Leçons générées en ligne'}
  covBadge=function(lang,big){const rev=typeof REVIEW!=='undefined'&&REVIEW.has(lang);const au=audioLangs().has(lang);
    return `<span class="cov2${big?' big':''}"><span>📚 ${coverageText(lang)}</span>${au?' <span>· 🔊 Audio intégré</span>':''}${rev?' <span>· ⚠️ À vérifier</span>':''}</span>`};
  if(typeof levelSource==='function')levelSource=function(lv){lv=lv||S.level;
    if(offlineLv(S.tgt,lv))return `<span class="tag ok">📦 <span>Contenu intégré · hors ligne</span></span>${typeof REVIEW!=='undefined'&&REVIEW.has(S.tgt)?' <span class="tag ai">⚠️ <span>À faire vérifier par un locuteur</span></span>':''}`;
    return `<span class="tag ai">✨ <span>Leçons générées automatiquement (non relues)</span></span>`};
  if(typeof railHTML==='function'){const prevRail=railHTML;railHTML=function(){return prevRail.apply(this,arguments).replace(/<p class="muted"([^>]*)>\d+ langues\. Niveau A1 écrit à la main[^<]*<\/p>/,(m,a)=>{const full=LANGS.filter(l=>offlineLevels(l[0]).length===6).length;
    return `<p class="muted"${a}><span>Parcours A1 → C2 intégré pour</span> ${full} <span>langues</span>. <span>Pour les autres : A1 intégré, niveaux suivants générés en ligne.</span> <button class="st-link" type="button" data-st="method">Comment ça marche ?</button></p>`})}}

  /* ---------- 3. Méthode, provenance, vérification ---------- */
  function method(){openSheet(`<div class="st-sheet"><div class="section-head"><h2>Comment fonctionne Castellum Lingua ?</h2><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
    <h3>🎯 <span>La méthode</span></h3><ul>
      <li>Des situations de la vie réelle (au bar, se présenter, demander son chemin), avec le vocabulaire utile dans son contexte.</li>
      <li>On comprend d'abord, puis on produit soi-même : phrases à construire, réponses à écrire, oral facultatif.</li>
      <li>Les registres sont indiqués : standard, familier, régional, dialectal.</li>
      <li>Les mots appris reviennent en révision les jours suivants (répétition espacée), pour être retenus.</li></ul>
    <h3>📚 <span>D'où viennent les contenus ?</span></h3><ul>
      <li><b>Contenus intégrés</b> : fournis avec l'appli et disponibles hors ligne. Leur couverture est indiquée pour chaque langue.</li>
      <li><b>Leçons générées</b> : pour les niveaux ou les langues sans contenu intégré, des leçons sont créées automatiquement par une IA, à la demande. Elles ne sont pas relues.</li>
      <li><b>Langues rares, dialectes et langues anciennes</b> : signalés « À vérifier » ; certaines formes sont adaptées.</li></ul>
    <h3>🔎 <span>Comment sont-ils vérifiés ?</span></h3><ul>
      <li>Les contenus intégrés passent des tests automatiques : une seule bonne réponse par exercice, consignes traduites, aucune erreur d'affichage.</li>
      <li>Ils n'ont pas été validés par des enseignants et ne donnent pas de certification.</li>
      <li>Le test de positionnement conseille un niveau de départ ; ce n'est pas une évaluation officielle du CECRL.</li>
      <li>Les XP mesurent ton activité, pas ton niveau de langue.</li></ul>
    <h3>🔊 <span>L'audio</span></h3><ul>
      <li>📦 Audio intégré : fichiers de l'appli, écoutables hors ligne une fois chargés.</li>
      <li>☁️ Voix en ligne : pour les comptes connectés, connexion requise.</li>
      <li>📱 Voix de l'appareil : dépend des voix installées sur ton téléphone ou ordinateur.</li></ul>
    <button class="btn" type="button" data-act="closesheet">Compris</button></div>`)}

  /* ---------- 4. Accueil en 4 étapes fixes ---------- */
  const STEPS=['Langue','Niveau','Première activité','Résultat'];
  stepper=function(n){return `<ol class="stepper st-steps" aria-label="Étapes">${STEPS.map((t,i)=>`<li class="${i<n?'done':i===n?'on':''}"${i===n?' aria-current="step"':''}><b aria-hidden="true">${i<n?'✓':i+1}</b><span>${t}</span></li>`).join('')}</ol>`};
  const hasSituation=()=>window.CastellumSituations&&S.tgt==='it'&&S.src==='fr'&&(S.level||'A1')==='A1';
  const prevWelcome=welcomeStep;
  welcomeStep=function(step){
    if(step==='level'){const w=$("#welcomeRoot"),n=lname(S.tgt).toLowerCase();
      w.innerHTML=`<div class="welcome"><div class="welcome-in wide st-w">${stepper(1)}
        <div class="w-head">${flag(S.tgt,'xl')}<div><h1>Où en es-tu en ${E(n)} ?</h1><p class="muted">${covBadge(S.tgt,true)}</p></div></div>
        <div class="st-choices">
          <button class="st-choice main" type="button" data-st="begin"><span class="st-ci">🌱</span><span><b>Je débute</b><small>Première activité tout de suite (moins d'une minute).</small></span><span class="st-go" aria-hidden="true">→</span></button>
          <button class="st-choice" type="button" data-st="test"><span class="st-ci">🎯</span><span><b>Je connais déjà un peu</b><small>Test de positionnement facultatif, 2 minutes.</small></span><span class="st-go" aria-hidden="true">→</span></button>
        </div>
        <details class="st-more"><summary>Choisir mon niveau moi-même</summary><div class="lvl-grid">${LEVEL_INFO.map((x,i)=>`<button class="lvl-tile" data-level="${x.id}" style="--h:${210+i*22}"><b>${x.id}</b><strong>${E(x.n)}</strong><small>${E(x.d)}</small></button>`).join('')}</div></details>
        <button class="btn ghost" type="button" data-welcome="start">← Changer de langue</button></div></div>`;
      try{if(typeof translateDom==='function')translateDom(w)}catch(e){}return}
    prevWelcome.apply(this,arguments);
    const w=document.querySelector('#welcomeRoot .welcome-in');if(!w)return;
    const brand=w.querySelector('.w-brand div');
    if(brand)brand.innerHTML=`<h1>La langue telle qu'on la parle vraiment</h1><p class="muted">Des situations de la vie réelle, l'usage courant et ses registres. Gratuit, sans compte pour commencer.</p><button class="st-link" type="button" data-st="method">Comment ça marche ?</button>`;
    const sp=w.querySelector('.stepper');if(sp)sp.outerHTML=stepper(0);
    try{if(typeof translateDom==='function')translateDom(w)}catch(e){}};

  // Le choix du royaume ne bloque plus l'accès au premier exercice.
  const prevFinishWelcome=finishWelcome;
  finishWelcome=function(){S.onbPending=true;if(!S.royaumeChosen){S.royaumeChosen=true;S.royaumeLater=true}save();
    if(hasSituation()){S.onboarded=true;save();$("#welcomeRoot").innerHTML="";render();setTimeout(()=>window.CastellumSituations.start(),200);return}
    return prevFinishWelcome.apply(this,arguments)};
  // Le bandeau « crée un compte » n'interrompt plus les premières activités.
  if(typeof guestNudge==='function'){const prevNudge=guestNudge;guestNudge=function(){if((S.lessons||0)<3||S.onbPending)return;return prevNudge.apply(this,arguments)}}

  /* ---------- 5. Résultat de la première activité ---------- */
  function resultBlock(){const body=document.querySelector('#lxBody .done-screen');if(!body||body.querySelector('.st-result'))return;
    body.insertAdjacentHTML('afterbegin',stepper(3));
    body.insertAdjacentHTML('beforeend',`<div class="st-result"><p>💾 <span>Ta progression est enregistrée sur cet appareil.</span></p>
      <div class="st-opt"><button class="btn ghost" type="button" data-st="royaume">🏰 <span>Personnaliser mon royaume</span></button>${typeof Cloud!=='undefined'&&Cloud.enabled&&!Cloud.signedIn?`<button class="btn ghost" type="button" data-st="account">☁️ <span>Créer un compte (facultatif)</span></button>`:''}</div>
      <small class="muted">Tu pourras le faire plus tard depuis l'onglet Château.</small></div>`);
    S.onbPending=false;try{save()}catch(e){}
    try{if(typeof translateDom==='function')translateDom(body)}catch(e){}}
  window.castellumOnboardResult=()=>{if(S.onbPending)resultBlock()};
  const prevFinish=finish;
  finish=function(){const pend=S.onbPending&&LX&&!LX.sx&&LX.mode==='lesson';const r=prevFinish.apply(this,arguments);if(pend)try{resultBlock()}catch(e){}return r};

  /* ---------- Clics ---------- */
  let fromTest=false;
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-st],[data-lt-set],[data-lt="quit"]');if(!t)return;
    if(t.dataset.ltSet&&fromTest){e.preventDefault();e.stopImmediatePropagation();fromTest=false;try{setLevel(t.dataset.ltSet);save()}catch(err){}try{window.CastellumReturn.ltClose()}catch(err){}finishWelcome();return}
    if(t.dataset.lt==='quit'&&fromTest){e.preventDefault();e.stopImmediatePropagation();fromTest=false;try{window.CastellumReturn.ltClose()}catch(err){}finishWelcome();return}
    if(!t.dataset.st)return;e.preventDefault();const a=t.dataset.st;
    if(a==='method')return method();
    if(a==='begin'){try{setLevel('A1')}catch(err){}return finishWelcome()}
    if(a==='test'){fromTest=true;try{window.CastellumReturn.ltStart()}catch(err){fromTest=false;finishWelcome()}return}
    if(a==='royaume'){try{closeLx()}catch(err){}go('castle');setTimeout(()=>{const b=document.createElement('button');b.dataset.domainOpen='styles';b.hidden=true;document.body.appendChild(b);b.click();b.remove()},150);return}
    if(a==='account'){try{closeLx()}catch(err){}authMode='signup';go('account');return}
  },true);
  window.CastellumStart={method,coverageText};

  const css=document.createElement('style');css.id='castellum-start-css';css.textContent=`
.st-steps{list-style:none;display:flex;flex-wrap:wrap;gap:6px 10px;justify-content:center;padding:0;margin:0 0 6px}
.st-steps li{display:flex;align-items:center;gap:6px;color:var(--ink-2);font-weight:800;font-size:.85rem}
.st-steps li b{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:var(--surface-2);color:var(--ink-2);font-size:.8rem}
.st-steps li.on{color:var(--accent)}.st-steps li.on b{background:var(--accent);color:#fff}
.st-steps li.done b{background:var(--good);color:#fff}
.cov2{display:inline-flex;flex-wrap:wrap;gap:2px 4px;justify-content:center;font-size:.72rem;font-weight:800;color:var(--ink-2);line-height:1.3}
.cov2.big{font-size:.85rem}
.st-link{border:0;background:none;color:var(--accent);font:inherit;font-weight:900;text-decoration:underline;cursor:pointer;padding:6px 0;min-height:36px}
.st-choices{display:grid;gap:10px}
.st-choice{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:18px;padding:16px;font:inherit;cursor:pointer;min-height:72px}
.st-choice b{display:block;font-size:1.1rem}.st-choice small{display:block;color:var(--ink-2);margin-top:2px}
.st-choice.main{border-color:var(--accent);background:var(--accent-soft)}
.st-ci{font-size:2rem}.st-go{margin-left:auto;font-weight:900;color:var(--accent);font-size:1.2rem}
.st-more summary{cursor:pointer;font-weight:900;color:var(--accent);padding:10px 0;min-height:44px;display:flex;align-items:center}
.st-sheet{display:grid;gap:6px}.st-sheet h3{margin:12px 0 0;font-size:1.05rem}.st-sheet ul{margin:4px 0;padding-left:20px;line-height:1.5}
.st-result{margin-top:14px;text-align:center;display:grid;gap:8px;justify-items:center}.st-result p{margin:0;font-weight:800}
.st-opt{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.done-screen .st-steps{margin-bottom:10px}
`;document.head.appendChild(css);
  try{const w=document.getElementById('welcomeRoot');if(w&&w.innerHTML&&!S.onboarded)welcomeStep('start')}catch(e){}
})();
