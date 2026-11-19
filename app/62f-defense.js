/* Défense du château : un mini-jeu jouable à tout moment depuis la page Château.
   Des envahisseurs avancent vers les remparts, chacun porteur d'un mot de la langue apprise.
   On le repousse en touchant la bonne traduction avant qu'il arrive. 3 vagues (archers, cavaliers, dragon),
   de plus en plus rapides ; 3 remparts : un envahisseur qui passe en abat un.
   Les mots viennent de ce qu'on a appris (avec ceux à réviser en priorité) ; chaque réponse compte comme
   une révision. Récompense en pièces une fois par jour, record conservé. */
(function(){
  if(typeof S==="undefined")return;
  const T=t=>{try{return tr(t)}catch(e){return t}};
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const today=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
  const cst=()=>{const c=S.cst=S.cst||{};c.bonus=c.bonus||0;c.def=c.def||{best:0,day:"",wins:0};return c};
  const WAVES=[{n:"Les archers",ic:"🏹",ms:9000,k:4},{n:"Les cavaliers",ic:"🐎",ms:7000,k:4},{n:"Le dragon",ic:"🐉",ms:5500,k:4}];

  function pool(){let out=[];
    try{const due=typeof reviewPool==="function"?reviewPool("due"):[];const l=typeof learnedItems==="function"?learnedItems():[];out=[...due,...l]}catch(e){}
    if(out.length<8){try{const UN=lvUnits();for(let u=0;u<UN.length&&out.length<24;u++){const d=setData(UN[u].id);if(d)out.push(...d.slice(0,12))}}catch(e){}}
    const seen=new Set();out=out.filter(it=>it&&it.t&&it.s&&!seen.has(it.t)&&seen.add(it.t));
    const short=out.filter(it=>it.t.split(/\s+/).length<=4);return short.length>=8?short:out}

  let G=null;
  function start(){const P=pool();if(P.length<4){try{toast(T("Apprends d'abord quelques mots pour défendre ton château"))}catch(e){}return}
    const qs=shuf(P);const need=WAVES.reduce((a,w)=>a+w.k,0);while(qs.length<need)qs.push(...shuf(P));
    G={P,qs:qs.slice(0,need),i:0,walls:3,score:0,wave:0,inWave:0,timer:null,t0:0,lock:false,missed:[]};
    let r=document.getElementById("defRoot");if(!r){r=document.createElement("div");r.id="defRoot";document.body.appendChild(r)}
    document.body.style.overflow="hidden";waveIntro()}
  function close(){clearTimeout(G&&G.timer);cancelAnimationFrame(G&&G.raf);const r=document.getElementById("defRoot");if(r)r.remove();document.body.style.overflow="";G=null;try{render()}catch(e){}}
  const walls=()=>`<div class="df-walls" aria-label="${G.walls} ${T("remparts")}">${[0,1,2].map(i=>`<span class="${i<G.walls?"on":""}" aria-hidden="true"></span>`).join("")}</div>`;
  const head=()=>`<header class="df-top"><button type="button" class="df-x" data-df="quit" aria-label="${E(T("Quitter"))}">✕</button>${walls()}<span class="df-score">⚔️ ${G.score}</span></header>`;
  function waveIntro(){const w=WAVES[G.wave];
    document.getElementById("defRoot").innerHTML=`<div class="df">${head()}<div class="df-wave"><span class="df-wave-ic" aria-hidden="true">${w.ic}</span>
      <small>${E(T("Vague"))} ${G.wave+1} / ${WAVES.length}</small><h2>${E(T(w.n))}</h2><p>${E(T("Touche la bonne traduction avant qu'ils atteignent les remparts."))}</p>
      <button type="button" class="df-go" data-df="go">${E(T("En garde !"))}</button></div></div>`}
  function round(){const w=WAVES[G.wave],it=G.qs[G.i];
    const wrong=shuf(G.P.filter(x=>x.s!==it.s&&x.t!==it.t)).slice(0,3).map(x=>x.s);
    const opts=shuf([it.s,...wrong]);G.cur={it,opts,ms:w.ms};G.lock=false;
    document.getElementById("defRoot").innerHTML=`<div class="df">${head()}
      <div class="df-field"><div class="df-castle" aria-hidden="true">🏰</div><div class="df-lane"><div class="df-foe" id="dfFoe"><span class="df-foe-ic" aria-hidden="true">${w.ic}</span><b lang="${S.tgt}" data-noi18n>${E(it.t)}</b></div></div></div>
      <div class="df-timer"><i id="dfBar"></i></div>
      <div class="df-opts">${opts.map((o,k)=>`<button type="button" class="df-opt" data-df-opt="${k}" data-noi18n>${E(o)}</button>`).join("")}</div>
      <p class="df-hint">${E(T("Vague"))} ${G.wave+1} · ${G.inWave+1} / ${w.k}</p></div>`;
    try{speak(it.t,S.tgt)}catch(e){}
    G.t0=performance.now();const tick=()=>{if(!G||G.lock)return;const p=Math.min(1,(performance.now()-G.t0)/w.ms);
      const f=document.getElementById("dfFoe"),b=document.getElementById("dfBar");if(f)f.style.left=(100-p*100)+"%";if(b)b.style.width=(100-p*100)+"%";
      if(p>=1){answer(-1);return}G.raf=requestAnimationFrame(tick)};G.raf=requestAnimationFrame(tick)}
  function answer(k){if(!G||G.lock)return;G.lock=true;cancelAnimationFrame(G.raf);const {it,opts}=G.cur,ok=k>=0&&opts[k]===it.s;
    try{if(typeof srsUpdate==="function")srsUpdate(it,ok)}catch(e){}
    const bs=[...document.querySelectorAll("#defRoot .df-opt")];bs.forEach((b,i)=>{if(opts[i]===it.s)b.classList.add("ok");else if(i===k)b.classList.add("no");b.disabled=true});
    const foe=document.getElementById("dfFoe");
    if(ok){G.score++;if(foe)foe.classList.add("hit")}else{G.walls--;G.missed.push(it);if(foe)foe.classList.add("pass");const c=document.querySelector("#defRoot .df-castle");if(c)c.classList.add("shake")}
    const wl=document.querySelector("#defRoot .df-walls");if(wl)wl.outerHTML=walls();const sc=document.querySelector("#defRoot .df-score");if(sc)sc.textContent="⚔️ "+G.score;
    G.timer=setTimeout(next,ok?650:1400)}
  function next(){if(!G)return;if(G.walls<=0)return end(false);G.i++;G.inWave++;
    if(G.inWave>=WAVES[G.wave].k){G.wave++;G.inWave=0;if(G.wave>=WAVES.length)return end(true);return waveIntro()}round()}
  function end(won){const c=cst(),d=c.def,first=d.day!==today();let coins=0;
    if(won&&first){coins=G.score*5+(G.walls===3?20:0);c.bonus+=coins;d.day=today();d.wins=(d.wins||0)+1}
    const best=G.score>(d.best||0);if(best)d.best=G.score;try{save()}catch(e){}
    if(won)try{confetti()}catch(e){}
    const miss=G.missed.slice(0,6).map(it=>`<li><b lang="${S.tgt}" data-noi18n>${E(it.t)}</b><span data-noi18n>${E(it.s)}</span></li>`).join("");
    document.getElementById("defRoot").innerHTML=`<div class="df"><header class="df-top"><button type="button" class="df-x" data-df="quit" aria-label="${E(T("Quitter"))}">✕</button></header>
      <div class="df-end ${won?"win":"lose"}"><span class="df-wave-ic" aria-hidden="true">${won?"🛡️":"🔥"}</span>
      <h2>${E(T(won?"Château défendu !":"Les remparts sont tombés"))}</h2>
      <p class="df-big">${G.score} / ${G.qs.length} ${E(T("envahisseurs repoussés"))}</p>
      ${coins?`<p class="df-coins">🪙 +${coins}</p>`:won?`<p class="df-note">${E(T("Récompense du jour déjà gagnée : reviens demain pour de nouvelles pièces."))}</p>`:`<p class="df-note">${E(T("Pas de pièces cette fois : il faut finir les trois vagues."))}</p>`}
      ${best?`<p class="df-note">🏆 ${E(T("Nouveau record !"))}</p>`:""}
      ${miss?`<h3>${E(T("À revoir"))}</h3><ul class="df-miss">${miss}</ul>`:""}
      <div class="df-row"><button type="button" class="df-go" data-df="again">${E(T("Rejouer"))}</button><button type="button" class="df-ghost" data-df="quit">${E(T("Retour au château"))}</button></div></div></div>`}

  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-df],[data-df-opt],[data-defense]");if(!b)return;
    if(b.dataset.defense!=null){e.preventDefault();e.stopPropagation();start();return}
    if(!G)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.dfOpt!=null)return answer(+b.dataset.dfOpt);
    const a=b.dataset.df;if(a==="quit")close();else if(a==="go")round();else if(a==="again"){close();start()}},true);
  document.addEventListener("keydown",e=>{if(!G)return;if(e.key==="Escape"){close();return}const n=+e.key;if(n>=1&&n<=4&&document.querySelector("#defRoot .df-opt")){e.preventDefault();answer(n-1)}},true);

  /* Carte d'entrée sur la page Château */
  function card(){const d=cst().def,done=d.day===today();
    return `<section class="df-card"><span class="df-card-ic" aria-hidden="true">⚔️</span><div><b>${E(T("Défends ton château"))}</b>
      <small>${E(T("Des envahisseurs arrivent avec des mots : repousse-les en choisissant la bonne traduction."))}</small>
      <small class="df-card-meta">${d.best?`🏆 ${E(T("Record"))} : ${d.best} · `:""}${done?E(T("Récompense du jour gagnée")):"🪙 "+E(T("Jusqu'à 80 pièces aujourd'hui"))}</small></div>
      <button type="button" class="df-go sm" data-defense="1">${E(T("Jouer"))}</button></section>`}
  const C=window.CastellumCastle;
  if(C&&typeof C.view==="function"){const pv=C.view;C.view=function(){const h=pv.apply(this,arguments);
    if(typeof h!=="string")return h;const i=h.indexOf('<section class="cs-card');
    return i<0?card()+h:h.slice(0,i)+card()+h.slice(i)}}

  if(typeof I18N!=="undefined"){const K=["remparts","Quitter","Vague","Les archers","Les cavaliers","Le dragon","Touche la bonne traduction avant qu'ils atteignent les remparts.","En garde !","Château défendu !","Les remparts sont tombés","envahisseurs repoussés","Récompense du jour déjà gagnée : reviens demain pour de nouvelles pièces.","Pas de pièces cette fois : il faut finir les trois vagues.","Nouveau record !","À revoir","Rejouer","Retour au château","Défends ton château","Des envahisseurs arrivent avec des mots : repousse-les en choisissant la bonne traduction.","Record","Récompense du jour gagnée","Jusqu'à 80 pièces aujourd'hui","Jouer","Apprends d'abord quelques mots pour défendre ton château"];
    const V={it:["bastioni","Esci","Ondata","Gli arcieri","I cavalieri","Il drago","Tocca la traduzione giusta prima che raggiungano i bastioni.","In guardia!","Castello difeso!","I bastioni sono caduti","invasori respinti","Premio di oggi già vinto: torna domani per nuove monete.","Niente monete stavolta: bisogna finire le tre ondate.","Nuovo record!","Da ripassare","Rigioca","Torna al castello","Difendi il tuo castello","Arrivano invasori con delle parole: respingili scegliendo la traduzione giusta.","Record","Premio di oggi vinto","Fino a 80 monete oggi","Gioca","Impara prima qualche parola per difendere il castello"],
      es:["murallas","Salir","Oleada","Los arqueros","Los jinetes","El dragón","Toca la traducción correcta antes de que lleguen a las murallas.","¡En guardia!","¡Castillo defendido!","Las murallas han caído","invasores rechazados","Premio de hoy ya ganado: vuelve mañana para más monedas.","Sin monedas esta vez: hay que terminar las tres oleadas.","¡Nuevo récord!","Para repasar","Jugar otra vez","Volver al castillo","Defiende tu castillo","Llegan invasores con palabras: recházalos eligiendo la traducción correcta.","Récord","Premio de hoy ganado","Hasta 80 monedas hoy","Jugar","Aprende primero algunas palabras para defender tu castillo"],
      pt:["muralhas","Sair","Vaga","Os arqueiros","Os cavaleiros","O dragão","Toca na tradução certa antes que cheguem às muralhas.","Em guarda!","Castelo defendido!","As muralhas caíram","invasores repelidos","Prémio de hoje já ganho: volta amanhã para mais moedas.","Sem moedas desta vez: é preciso acabar as três vagas.","Novo recorde!","Para rever","Jogar outra vez","Voltar ao castelo","Defende o teu castelo","Chegam invasores com palavras: repele-os escolhendo a tradução certa.","Recorde","Prémio de hoje ganho","Até 80 moedas hoje","Jogar","Aprende primeiro algumas palavras para defender o castelo"],
      en:["walls","Quit","Wave","The archers","The riders","The dragon","Tap the right translation before they reach the walls.","En garde!","Castle defended!","The walls have fallen","invaders repelled","Today's reward already won: come back tomorrow for more coins.","No coins this time: you need to finish all three waves.","New record!","To review","Play again","Back to the castle","Defend your castle","Invaders arrive carrying words: drive them back by choosing the right translation.","Record","Today's reward won","Up to 80 coins today","Play","Learn a few words first to defend your castle"],
      de:["Mauern","Beenden","Welle","Die Bogenschützen","Die Reiter","Der Drache","Tippe die richtige Übersetzung, bevor sie die Mauern erreichen.","En garde!","Burg verteidigt!","Die Mauern sind gefallen","Angreifer zurückgeschlagen","Belohnung heute schon gewonnen: Komm morgen für neue Münzen wieder.","Diesmal keine Münzen: Du musst alle drei Wellen schaffen.","Neuer Rekord!","Zum Wiederholen","Nochmal spielen","Zurück zur Burg","Verteidige deine Burg","Angreifer kommen mit Wörtern: Schlag sie zurück, indem du die richtige Übersetzung wählst.","Rekord","Belohnung heute gewonnen","Bis zu 80 Münzen heute","Spielen","Lerne zuerst ein paar Wörter, um deine Burg zu verteidigen"],
      nl:["muren","Stoppen","Golf","De boogschutters","De ruiters","De draak","Tik de juiste vertaling aan voordat ze de muren bereiken.","En garde!","Kasteel verdedigd!","De muren zijn gevallen","indringers verjaagd","Beloning van vandaag al gewonnen: kom morgen terug voor nieuwe munten.","Deze keer geen munten: je moet alle drie de golven halen.","Nieuw record!","Om te herhalen","Opnieuw spelen","Terug naar het kasteel","Verdedig je kasteel","Indringers komen met woorden: verjaag ze door de juiste vertaling te kiezen.","Record","Beloning van vandaag gewonnen","Tot 80 munten vandaag","Spelen","Leer eerst een paar woorden om je kasteel te verdedigen"],
      ary:["l-aswar","Khrej","Mouja","R-rmmaya","L-fersan","T-tnnin","Brek 3la t-tarjama s-s7i7a 9bel ma ywslou l l-aswar.","Wjed rasek!","L-9al3a t7mat!","L-aswar t7ydou","dyal l-mohajimin tredou","Jayza d lyoum diha: rje3 ghedda l flous jdad.","Ma kayn flous had l-merra: khassek tkemmel t-tlata d l-amwaj.","Ra9m 9iyasi jdid!","Bach traje3hom","3awed l3eb","Rje3 l l-9al3a","Dafe3 3la l-9al3a dyalek","Jayin mohajimin b klimat: rddhom b t-tarjama s-s7i7a.","Ra9m 9iyasi","Jayza d lyoum t3tat","7tta l 80 l-flous lyoum","L3eb","T3ellem chi klimat bach tdafe3 3la l-9al3a"]};
    for(const l in V){I18N[l]=I18N[l]||{};K.forEach((k,i)=>{if(I18N[l][k]==null)I18N[l][k]=V[l][i]})}}

  const css=document.createElement("style");css.id="castellum-defense-css";css.textContent=`
#defRoot{position:fixed;inset:0;z-index:1200;background:var(--bg);color:var(--ink);overflow:auto}
.df{max-width:560px;margin:0 auto;min-height:100%;box-sizing:border-box;padding:16px 16px calc(24px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:16px}
.df-top{display:flex;align-items:center;gap:12px}
.df-x{width:44px;height:44px;border-radius:12px;border:2.5px solid var(--af-edge);background:var(--surface);color:var(--ink);font-size:1.1rem;font-weight:800;cursor:pointer}
.df-walls{flex:1;display:flex;gap:6px}.df-walls span{flex:1;height:16px;border-radius:5px;border:2.5px solid var(--af-edge);background:transparent}.df-walls span.on{background:#E4472B}
.df-score{font-family:var(--display);font-size:1.2rem}
.df-wave,.df-end{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px}
.df-wave-ic{font-size:4.5rem;line-height:1}.df-wave small{font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-2)}
.df-wave h2,.df-end h2{margin:0;font-size:2rem!important}.df-wave p{margin:0;max-width:320px;line-height:1.4}
.df-go{min-height:56px;padding:0 28px;border:2.5px solid var(--af-edge);border-radius:14px;background:var(--gold);color:#111;font-family:var(--display);font-size:1.15rem;text-transform:uppercase;box-shadow:4px 4px 0 var(--af-edge);cursor:pointer}
.df-go:active{transform:translate(2px,2px);box-shadow:2px 2px 0 var(--af-edge)}.df-go.sm{min-height:46px;padding:0 16px;font-size:.95rem;flex:none}
.df-ghost{min-height:56px;padding:0 18px;border:2.5px solid var(--af-edge);border-radius:14px;background:var(--surface);color:var(--ink);font-weight:800;cursor:pointer}
.df-field{display:flex;align-items:center;gap:0;height:130px;border:2.5px solid var(--af-edge);border-radius:18px;background:var(--good-soft);overflow:hidden;box-shadow:5px 5px 0 var(--af-edge)}
.df-castle{flex:none;width:76px;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--surface-2);border-right:2.5px solid var(--af-edge)}
.df-castle.shake{animation:dfShake .45s}
@keyframes dfShake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-3px)}}
.df-lane{position:relative;flex:1;height:100%}
.df-foe{position:absolute;top:50%;left:100%;transform:translate(-100%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;white-space:nowrap}
.df-foe-ic{font-size:2.2rem;line-height:1}
.df-foe b{background:var(--surface);border:2.5px solid var(--af-edge);border-radius:10px;padding:4px 10px;font-size:1.05rem;max-width:62vw;overflow:hidden;text-overflow:ellipsis}
.df-foe.hit{transition:transform .5s,opacity .5s;transform:translate(-60%,-160%) rotate(25deg);opacity:0}
.df-foe.pass{transition:left .35s;left:0!important}
.df-timer{height:12px;border:2px solid var(--af-edge);border-radius:6px;overflow:hidden;background:var(--surface)}.df-timer i{display:block;height:100%;width:100%;background:var(--gold)}
.df-opts{display:grid;grid-template-columns:1fr;gap:10px}
@media (min-width:520px){.df-opts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.df-opt{min-height:58px;border:2.5px solid var(--af-edge);border-radius:14px;background:var(--surface);color:var(--ink);font:inherit;font-weight:700;font-size:1.05rem;padding:8px 14px;text-align:left;cursor:pointer}
.df-opt.ok{background:var(--good-soft);color:var(--good-ink);box-shadow:4px 4px 0 var(--good)}.df-opt.no{background:var(--bad);color:#111}
.df-hint{margin:0;text-align:center;color:var(--ink-2);font-weight:700;font-size:.85rem}
.df-big{margin:0;font-weight:800;font-size:1.15rem}.df-coins{margin:0;font-family:var(--display);font-size:2rem}.df-note{margin:0;color:var(--ink-2);max-width:340px;line-height:1.4}
.df-end h3{margin:8px 0 0;font-size:1rem}.df-miss{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;width:100%;max-width:380px}
.df-miss li{display:flex;justify-content:space-between;gap:10px;border:2px solid var(--af-edge);border-radius:10px;padding:6px 10px;background:var(--surface);text-align:left}
.df-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:6px}
.df-card{display:flex;align-items:center;gap:12px;border:2.5px solid var(--af-edge);border-radius:18px;padding:14px;background:#E4472B;color:#111;box-shadow:5px 5px 0 var(--af-edge);margin:6px 0 14px}
.df-card>div{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.df-card b{font-family:var(--display);font-weight:400;text-transform:uppercase;font-size:1.15rem}
.df-card small{font-size:.86rem;line-height:1.3}.df-card .df-card-meta{font-weight:800}.df-card-ic{font-size:2rem}
@media (prefers-reduced-motion:reduce){.df-foe.hit,.df-foe.pass,.df-castle.shake{transition:none;animation:none}}`;
  document.head.appendChild(css);
})();
