/* Premiers pas : une visite guidée en 4 étapes (une fois), des Outils expliqués,
   et un « bravo » après la toute première leçon avec la suite à faire. */
(function(){
  if(typeof S==="undefined"||typeof render!=="function")return;
  const T=s=>{try{return tr(s)}catch(e){return s}};
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const nDone=()=>{try{return Object.keys(S.done||{}).length}catch(e){return 0}};
  const ui=()=>(S.ui=S.ui||{});
  const visible=sel=>[...document.querySelectorAll(sel)].find(x=>x.offsetParent&&x.getBoundingClientRect().width>0);
  const STEPS=[
    {sel:".vl-playbig",ic:"▶",t:"Apprendre",d:"Ta ville, lieu par lieu. Touche « Jouer » : chaque jeu dure 2 à 3 minutes, et tu entends tout de suite les mots."},
    {sel:'[data-go="play"]',ic:"🎮",t:"Pratiquer",d:"Pour t'entraîner librement : révisions, jeux rapides, scènes de la vie réelle et conversation avec le professeur IA."},
    {sel:'[data-go="castle"]',ic:"🏰",t:"Château",d:"Chaque leçon te rapporte des pièces 🪙. Agrandis ton château et suis ta progression."},
    {sel:'[data-act="more"],[data-go="dict"]',ic:"🧰",t:"Outils",d:"Dictionnaire, grammaire, listes de mots par thème, tes mots enregistrés et tes erreurs à revoir."}];
  let k=-1;
  function clear(){document.querySelectorAll(".ct-hl").forEach(x=>x.classList.remove("ct-hl"));const r=document.getElementById("ctRoot");if(r)r.remove()}
  function end(play){clear();k=-1;ui().tour=1;try{save()}catch(e){}
    if(play){const b=visible(".vl-playbig");if(b)b.click()}}
  function show(){clear();const st=STEPS[k];if(!st)return end(false);
    const el=visible(st.sel);if(el){el.classList.add("ct-hl");try{el.scrollIntoView({block:"center",behavior:"smooth"})}catch(e){el.scrollIntoView()}}
    const last=k===STEPS.length-1,first=nDone()===0;
    const d=document.createElement("div");d.id="ctRoot";d.className="ct-root";d.setAttribute("role","dialog");d.setAttribute("aria-label",T("Visite guidée"));
    d.innerHTML=`<div class="ct-card"><div class="ct-top"><span class="ct-ic" aria-hidden="true">${st.ic}</span><div><small>${k+1} / ${STEPS.length}</small><h3>${E(T(st.t))}</h3></div></div>
      <p>${E(T(st.d))}</p><div class="ct-dots" aria-hidden="true">${STEPS.map((_,i)=>`<i class="${i===k?"on":""}"></i>`).join("")}</div>
      <div class="ct-row"><button type="button" class="ct-skip" data-ct="skip">${E(T("Passer"))}</button>
      <button type="button" class="ct-next" data-ct="${last?"go":"next"}">${E(T(last?(first?"▶ Jouer ma première leçon":"C'est parti !"):"Suivant"))}</button></div></div>`;
    document.body.appendChild(d)}
  function start(){if(typeof view!=="undefined"&&view!=="learn"){try{go("learn")}catch(e){}}k=0;setTimeout(show,250)}
  window.castellumTour=start;
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ct]");if(!b)return;e.preventDefault();e.stopPropagation();
    const a=b.dataset.ct;if(a==="next"){k++;show()}else if(a==="skip")end(false);else if(a==="go")end(true);
    else if(a==="tour"){try{closeSheet()}catch(err){}start()}
    else if(a==="win-next"){try{closeSheet()}catch(err){}const p=visible(".vl-playbig");if(p)p.click()}
    else if(a==="win-castle"||a==="win-play"){try{closeSheet()}catch(err){}go(a==="win-castle"?"castle":"play")}},true);
  document.addEventListener("keydown",e=>{if(k>=0&&e.key==="Escape")end(false)});

  /* Bravo après la première leçon : la suite, clairement */
  function firstWin(){if(ui().firstWin||nDone()<1||nDone()>3||typeof openSheet!=="function")return false;ui().firstWin=1;try{save()}catch(e){}
    let coins=0;try{coins=(window.CastellumCastle&&window.CastellumCastle.coins&&window.CastellumCastle.coins())||S.coins||0}catch(e){}
    openSheet(`<div class="ct-win"><div class="ct-burst" aria-hidden="true">🎉</div><h2>${E(T("Bravo, ta première leçon est faite !"))}</h2>
      <p class="muted">${E(T("Quelques minutes par jour suffisent pour progresser. Voici ce que tu peux faire maintenant :"))}</p>
      <button type="button" class="ct-opt main" data-ct="win-next"><span aria-hidden="true">▶</span><span><b>${E(T("Continuer avec le jeu suivant"))}</b><small>${E(T("2 à 3 minutes"))}</small></span></button>
      <button type="button" class="ct-opt" data-ct="win-castle"><span aria-hidden="true">🏰</span><span><b>${E(T("Voir mon château"))}</b><small>${E(T("Dépense tes premières pièces 🪙"))}${coins?" · "+coins+" 🪙":""}</small></span></button>
      <button type="button" class="ct-opt" data-ct="win-play"><span aria-hidden="true">🎮</span><span><b>${E(T("Pratiquer autrement"))}</b><small>${E(T("Révisions, jeux et scènes de la vie réelle"))}</small></span></button>
      <button type="button" class="btn ghost block" data-act="closesheet">${E(T("Plus tard"))}</button></div>`);return true}

  /* Déclenchement : nouvel utilisateur sur Apprendre, sans accueil ni leçon ouverte */
  const busy=()=>{const w=document.getElementById("welcomeRoot");if(w&&w.innerText.trim())return true;const sr=document.getElementById("sheetRoot"),lx=document.getElementById("lxRoot");
    return !!((sr&&sr.innerHTML.trim())||(lx&&lx.innerHTML.trim())||(typeof LX!=="undefined"&&LX))};
  const pr=render;render=function(){const r=pr.apply(this,arguments);
    try{if(S.onboarded&&typeof view!=="undefined"&&view==="learn")setTimeout(()=>{if(busy()||k>=0||document.getElementById("ctRoot"))return;
      if(!ui().tour){if(nDone()>3){ui().tour=1;try{save()}catch(e){}return}if(nDone()===0&&visible(".vl-playbig"))start();else if(nDone()>0){ui().tour=1;try{save()}catch(e){}firstWin()}}
      else firstWin()},700)}catch(e){}return r};

  /* Outils : chaque outil dit à quoi il sert, et la visite peut être relancée */
  const DESC={dict:"Cherche un mot dans les deux sens",grammar:"Les règles, expliquées simplement",alpha:"Lire et prononcer les lettres",lists:"Des mots par thème : animaux, cuisine…",words:"Les mots que tu as mis de côté ⭐",errors:"Revois ce que tu as raté",teacher:"Pose tes questions, converse",langs:"Apprendre une autre langue",friends:"Tes amis et leurs progrès",account:"Sauvegarde ta progression"};
  const deco=()=>{const s=document.querySelector("#sheetRoot .u2-tools");if(!s||s.dataset.ctdeco)return;s.dataset.ctdeco=1;
    s.querySelectorAll(".u2-tool").forEach(b=>{const key=b.dataset.go||(b.dataset.act==="errors"?"errors":"");if(DESC[key]&&!b.querySelector("small")){const bb=b.querySelector("b");if(bb){const w=document.createElement("span");w.className="ct-tt";bb.replaceWith(w);w.appendChild(bb);const sm=document.createElement("small");sm.textContent=T(DESC[key]);w.appendChild(sm)}}});
    const head=s.querySelector(".section-head");if(head&&!s.querySelector('[data-ct="tour"]')){const b=document.createElement("button");b.type="button";b.className="u2-tool wide ct-tourbtn";b.dataset.ct="tour";
      b.innerHTML=`<span aria-hidden="true">🧭</span><span class="ct-tt"><b>${E(T("Visite guidée de l'appli"))}</b><small>${E(T("1 minute pour tout découvrir"))}</small></span>`;head.after(b)}};
  new MutationObserver(deco).observe(document.body,{childList:true,subtree:true});

  const css=document.createElement("style");css.textContent=`
.ct-hl{position:relative;z-index:1001!important;outline:4px solid #f4b73b!important;outline-offset:4px;border-radius:14px;box-shadow:0 0 0 9999px rgba(10,25,40,.55)!important}
.ct-root{position:fixed;left:0;right:0;bottom:calc(84px + env(safe-area-inset-bottom));z-index:1002;display:flex;justify-content:center;padding:0 16px;pointer-events:none}
@media (min-width:900px){.ct-root{bottom:32px}}
.ct-card{pointer-events:auto;width:100%;max-width:440px;background:var(--surface,#fff);color:var(--ink,#14324A);border-radius:20px;padding:16px 18px;box-shadow:0 12px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:10px;animation:ctIn .25s ease-out}
@keyframes ctIn{from{transform:translateY(16px);opacity:0}}
.ct-top{display:flex;gap:12px;align-items:center}.ct-ic{font-size:1.8rem;width:48px;height:48px;border-radius:14px;background:color-mix(in srgb,#f4b73b 25%,transparent);display:flex;align-items:center;justify-content:center}
.ct-top small{color:var(--ink-2,#4E5F6B);font-weight:700}.ct-top h3{margin:0;font-size:1.25rem}
.ct-card p{margin:0;line-height:1.45}
.ct-dots{display:flex;gap:6px}.ct-dots i{width:8px;height:8px;border-radius:50%;background:var(--line,#dfe3e6)}.ct-dots i.on{background:#f4b73b;width:22px;border-radius:6px}
.ct-row{display:flex;gap:10px;align-items:center;justify-content:space-between}
.ct-skip{background:none;border:0;color:var(--ink-2,#4E5F6B);font:inherit;font-weight:700;min-height:44px;cursor:pointer;text-decoration:underline}
.ct-next{flex:1;max-width:260px;min-height:50px;border:0;border-radius:14px;background:#C2410C;color:#fff;font:inherit;font-weight:800;font-size:1rem;cursor:pointer}
.ct-win{display:flex;flex-direction:column;gap:10px;text-align:center}.ct-win h2{margin:0}.ct-burst{font-size:3rem;animation:ctIn .4s ease-out}
.ct-opt{display:flex;gap:12px;align-items:center;text-align:left;width:100%;min-height:60px;padding:12px 14px;border-radius:16px;border:2px solid var(--line,#dfe3e6);background:var(--surface,#fff);color:var(--ink,#14324A);font:inherit;cursor:pointer}
.ct-opt>span:first-child{font-size:1.5rem}.ct-opt span:last-child{display:flex;flex-direction:column}.ct-opt small{color:var(--ink-2,#4E5F6B)}
.ct-opt.main{background:#C2410C;border-color:#C2410C;color:#fff}.ct-opt.main small{color:#ffe7d9}
.ct-tt{display:flex;flex-direction:column;gap:1px;min-width:0;font-size:1rem!important;line-height:1.25}.u2-tool .ct-tt b{font-size:1rem!important;line-height:1.2}.u2-tool .ct-tt small{font-size:.8rem!important}.ct-tt small{font-size:.76rem;font-weight:500;color:var(--ink-2,#4E5F6B);line-height:1.25}
.ct-tourbtn{margin:4px 0 6px;border-color:#f4b73b!important}
@media (prefers-reduced-motion:reduce){.ct-card,.ct-burst{animation:none}}`;document.head.appendChild(css);
})();
