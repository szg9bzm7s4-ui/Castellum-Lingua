/* Apprendre, version carte de ville. Chaque niveau se passe dans la ville de la langue apprise (CITY),
   chaque unité est un lieu de cette ville, regroupé par quartiers de 6. Un lieu s'ouvre sur sa scène
   (les premières phrases de l'unité, à écouter), puis ses étapes (les mêmes leçons qu'avant).
   Le passeport garde un tampon par lieu terminé et la liste de ce que l'on sait faire.
   Pas de coffre ni de mascotte sur cette page. S.ui.classicPath = true revient à l'ancien chemin. */
(function(){
  if(typeof pathView!=="function"||typeof lvUnits!=="function")return;
  const prev=pathView;
  const QN=["Le centre","Le vieux quartier","Le marché","Le port","Les hauteurs","La gare","Le quartier des artistes","Les faubourgs"];
  const POS=[[12,10],[60,6],[36,34],[74,38],[8,58],[52,62]];
  let Qsel=null,QselKey="";
  /* Icônes des unités latines (sinon toutes des châteaux) */
  try{if(Array.isArray(EMOJI))[["déclinaison","📜"],["conjugaison","🗣️"],["verbe","🗣️"],["citation","💬"],["texte","📖"],["récit","📖"],["auteurs","🖋️"],["accusatif","🎯"],["génitif","🔗"],["datif","🎁"],["ablatif","🧭"],["prépositions","🧭"],["imparfait","⏳"],["futur","🔮"],["parfait","✅"],["pronoms","👉"],["impératif","📣"],["adjectifs","🎨"],["comparatif","📏"],["participe","🌀"],["subjonctif","🌠"],["infinitive","💭"],["ville de rome","🏛️"],["temps qui passe","⏰"],["latin au français","🌱"]].forEach(p=>{if(!EMOJI.some(([k])=>k===p[0]))EMOJI.push(p)})}catch(e){}
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const unitDone=u=>!!S.done[nodeKey(u,BOSS)];
  const cityName=()=>{try{return tr(CITY[S.tgt]||L[S.tgt].n)}catch(e){return ""}};
  const curUnitIx=()=>Math.min(lvUnits().length-1,Math.floor(firstUndone()/LPU));
  function stepsOf(u){const n=LORDER.filter(l=>stepDone(u,l)).length;return {n,t:LORDER.length}}
  function placeHTML(U,u,cu,i,n){
    const dn=unitDone(u),isCur=u===cu,locked=u>cu,cls=dn?"done":isCur?"cur":locked?"locked":"open";
    const st=stepsOf(u),dots=LORDER.map(l=>`<i class="${stepDone(u,l)?"on":""}"></i>`).join("");
    const prevU=locked&&u>0?lvUnits()[u-1]:null;
    const sub=locked?tr("Termine d'abord « {X} »").replace("{X}",prevU?tr(prevU.n):"…"):tr(U.d||"");
    const act=dn?`<span class="vl-act ok">✓ ${tr("Refaire")}</span>`:locked?`<span class="vl-act lock" aria-hidden="true">🔒</span>`:`<span class="vl-act go">▶ ${tr(st.n?"Continuer":"Jouer")}</span>`;
    return `<li class="vl-stop ${cls} ${i%2?"r":"l"}${i===n-1?" last":""}"><button class="vl-stopbtn" data-vpin="${u}" aria-label="${E(unitTitle(U))}"${locked?' aria-disabled="true"':""}>
      <span class="vl-node"><span aria-hidden="true">${unitEmoji(U)}</span>${dn?'<b class="vl-badge" aria-hidden="true">✓</b>':""}</span>
      <span class="vl-info"><b>${E(tr(U.n))}</b><small>${E(sub)}</small>${locked?"":`<span class="vl-dots" aria-label="${st.n} / ${st.t}">${dots}<em>${st.n}/${st.t}</em></span>`}</span>
      ${act}</button></li>`}
  function mapHTML(UN,cu){
    const nq=Math.ceil(UN.length/6),key=S.tgt+":"+S.level;
    if(QselKey!==key||Qsel==null||Qsel>=nq){Qsel=Math.floor(cu/6);QselKey=key}
    const q=Qsel,start=q*6,list=UN.slice(start,start+6);
    const tabs=nq>1?`<div class="vl-tabs" role="tablist" aria-label="Quartiers">${Array.from({length:nq},(_,i)=>{const a=i*6,b=Math.min(UN.length,a+6);let d=0;for(let u=a;u<b;u++)if(unitDone(u))d++;
      return `<button role="tab" aria-selected="${i===q}" class="vl-tab ${i===q?"on":""}" data-vq="${i}">${E(tr(QN[i%QN.length]))}<small>${d}/${b-a}</small></button>`}).join("")}</div>`:"";
    return `${tabs}<ol class="vl-trail" aria-label="Chemin du quartier">${list.map((U,k)=>placeHTML(U,start+k,cu,k,list.length)).join("")}</ol>`}
  function nextCard(UN,cu){
    const U=UN[cu];if(!U)return "";const it=(typeof setData==="function"&&setData(U.id))||[];
    const chips=it.filter(x=>x&&x.t).slice(0,2).map(x=>`<span class="vl-chip" lang="${S.tgt}" data-noi18n="1">${E(x.t)}</span>`).join("");
    const st=stepsOf(cu);
    return `<section class="vl-next"><span class="vl-eyebrow">Prochain lieu</span><h2 data-noi18n="1">${E(unitTitle(U))}</h2>
      <p class="vl-muted">${E(tr(U.d||""))}</p>${chips?`<div class="vl-chips">${chips}</div>`:""}
      <button class="vl-btn vl-playbig" data-vgo="${cu}"><span aria-hidden="true">▶</span> ${tr(st.n?"Continuer":"Jouer")}</button>
      <div class="vl-row"><span class="vl-muted">${st.n} / ${st.t} étapes</span><button class="vl-link" data-vplace="${cu}">${tr("Voir le lieu et la scène")}</button></div></section>`}
  function passHTML(UN){
    const dn=UN.map((U,u)=>({U,u})).filter(x=>unitDone(x.u));
    const last=dn.slice(-3).reverse(),cu=curUnitIx(),todo=UN.slice(cu,cu+2).map((U,i)=>({U,u:cu+i})).filter(x=>!unitDone(x.u));
    const row=(x,ok)=>`<li class="${ok?"ok":""}"><span class="vl-ck" aria-hidden="true">${ok?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>':""}</span><span><b>${E(tr(x.U.n))}</b><small data-noi18n="1">${E(unitTitle(x.U))}</small></span></li>`;
    return `<section class="vl-pass"><div class="vl-pass-head"><div><span class="vl-eyebrow">Mon passeport</span><h3 data-noi18n="1">${E(cityName())} · ${S.level}</h3></div><span class="vl-stamps-n">${dn.length} / ${UN.length}</span></div>
      <div class="vl-stamps">${UN.slice(0,Math.max(8,Math.min(UN.length,dn.length+4))).map((U,u)=>`<span class="vl-stamp ${unitDone(u)?"on":""}" style="--r:${(u*37%15)-7}deg" title="${E(tr(U.n))}">${unitDone(u)?unitEmoji(U):""}</span>`).join("")}</div>
      <h4>Ce que je sais faire</h4><ul class="vl-can">${last.map(x=>row(x,true)).join("")}${todo.map(x=>row(x,false)).join("")}${!last.length&&!todo.length?"":""}</ul></section>`}
  function quickHTML(){let due=0,errs=0;try{due=dueItems().length}catch(e){}try{errs=errorItems().length}catch(e){}
    const SX=window.CastellumSituations;let sx="";
    try{if(SX&&SX.list)sx=SX.list.map((x,i)=>({x,i})).filter(o=>o.x.tgt===S.tgt&&o.x.src===S.src).map(({x,i})=>{const done=S.cando&&S.cando[x.tgt+':'+x.id];
      return `<button type="button" class="vl-sx" data-sx-start="${i}"><span class="vl-sx-ic" aria-hidden="true">${x.ic||"☕"}</span><span><b>${E(x.title)}</b><small>${E(x.sub)} · ${E(x.lv)}${done?" · ✓":""}</small></span></button>`}).join("")}catch(e){}
    return `${sx?`<section class="vl-sxs"><span class="vl-eyebrow">Scènes de la vie réelle</span>${sx}</section>`:""}<div class="vl-quick"><button class="vl-q" data-act="review"><b>Réviser</b><small>${due?due+" mot"+(due>1?"s":"")+" à revoir":"tout est à jour"}</small></button><button class="vl-q" data-aichat="1"><b>Parler</b><small>Avec le professeur IA (en ligne)</small></button></div>`}
  pathView=function(){
    /* Onglet Château : il a sa propre page (castleView), on ne la remplace pas par la carte */
    if(typeof view!=="undefined"&&view==="castle"){let h="";try{if(window.CastellumCastle&&window.CastellumCastle.view)h=window.CastellumCastle.view()}catch(e){}if(!h)return prev.apply(this,arguments);
      /* Une phrase pour dire à quoi sert cette page */
      /* Ni habitants ni décorations : on garde le royaume, le siège et les amis */
      if(typeof h==="string")h=h.replace(/<section class="cs-card"><h2>[^<]*<span>(Les habitants|Décorations)<\/span>[\s\S]*?<\/section>/g,"");
      return typeof h==="string"?h.replace(/(<div class="cs-head">[\s\S]*?<\/div>)/,`$1<p class="cs-intro">${tr("Ici, c'est ton royaume. Chaque leçon te rapporte des pièces 🪙 : dépense-les pour agrandir ton château et le défendre.")}</p>${progressHTML()}`):h}
    if(S.ui&&S.ui.classicPath){const h=prev.apply(this,arguments);return typeof h==="string"?`<p class="vl-classic"><button class="vl-link" data-vmap="1">Voir la carte de la ville</button></p>`+h:h}
    let base="";try{base=prev.apply(this,arguments)}catch(e){}
    const pick=(re)=>{const m=typeof base==="string"&&base.match(re);return m?m[0]:""};
    const head=pick(/<div class="path-head">[\s\S]*?<\/div>/);
    const cp=pick(/<section class="checkpoint[\s\S]*?<\/section>/);
    /* une fois le niveau commencé, la phrase d'accueil et le test de positionnement n'encombrent plus la page */
    const started=firstUndone()>0;
    const test=started?"":pick(/<button class="rt-test"[\s\S]*?<\/button>/);
    const UN=lvUnits(),cu=curUnitIx(),city=cityName();
    const lead=S.tgt==="la"?tr("Tu arrives à Rome. Chaque lieu de la ville est une étape pour apprendre à lire les Romains."):tr("Tu arrives à {V}. Chaque lieu de la ville est une situation à vivre.").replace("{V}",city);
    return `<div class="vl">${head}${levelBar()}
      <header class="vl-head"><h1 data-noi18n="1">${E(city)}</h1>${started?"":`<p class="vl-muted" data-noi18n="1">${E(lead)}</p>`}</header>
      ${test}${nextCard(UN,cu)}<h2 class="vl-trail-h">${tr("Ton chemin dans la ville")}</h2>${mapHTML(UN,cu)}
      ${cp}</div>`};
  /* Château : la progression en tête (chiffres du jour), le reste de la page est le château */
  function progressHTML(){let st="";try{const d=day(),sk=streak(),goal=S.goal||20;
      st=`<div class="cs-stats"><div><b>${d.xp||0}</b><span>${tr("XP aujourd'hui")}</span></div><div><b>${sk}</b><span>${tr("jours de série")}</span></div><div><b>${d.lessons||0}</b><span>${tr("leçons aujourd'hui")}</span></div><div><b>${Math.min(100,Math.round((d.xp||0)/goal*100))} %</b><span>${tr("objectif du jour")}</span></div></div>`}catch(e){}
    return `<section class="cs-progress"><h2 class="cs-h2">${tr("Ma progression")}</h2>${st}<button type="button" class="vl-link cs-more" data-go="profile">${tr("Toutes mes statistiques et réglages")} →</button></section><h2 class="cs-h2">${tr("Mon royaume")}</h2>`}
  /* Vraies scènes : data/scenes/<niveau>.js, un dialogue par lieu en 8 langues, chargé à la demande */
  const SC={},scLoading={},SC_LANGS=["fr","it","es","pt","en","de","nl","ary"];
  window.__castellumScenes=function(lv,d){SC[lv]=d};
  function sceneLoad(lv){if(SC[lv]||scLoading[lv])return Promise.resolve(SC[lv]);scLoading[lv]=new Promise(res=>{const s=document.createElement("script");s.src="data/scenes/"+lv.toLowerCase()+".js";s.onload=()=>res(SC[lv]);s.onerror=()=>res(null);document.head.appendChild(s)});return scLoading[lv]}
  function sceneOf(U){const d=SC[S.level];if(!d||!SC_LANGS.includes(S.tgt))return null;const sc=d.scenes[U.id];if(!sc||!sc.lines.length||!sc.lines[0][S.tgt])return null;window.__vlScene={id:U.id,lv:S.level,sc,roles:d.roles,all:d.scenes};return {sc,roles:d.roles}}
  const inSrc=o=>o?(o[S.src]||o.fr||o.en||""):"";
  function realSceneHTML(x){const {sc,roles}=x;
    return `<p class="vl-set">${E(inSrc(sc.set))}</p><button class="vl-playall" data-vplayall="1"><span aria-hidden="true">▶ </span>Écouter toute la scène</button>
      <div class="vl-scene vl-hide" id="vlScene">${sc.lines.map(l=>`<div class="vl-line ${l.r==="toi"?"me":""}"><button class="mini-say" data-say="${E(l[S.tgt])}" aria-label="Écouter">🔊</button><div><span class="vl-who">${E(inSrc(roles[l.r]))}</span><b lang="${S.tgt}" data-noi18n="1">${E(l[S.tgt])}</b><small class="vl-tr" data-noi18n="1">${E(inSrc(l))}</small></div></div>`).join("")}</div>
      <button class="vl-link" data-vtr="1">Voir la traduction</button>
      <div class="vl-roleact"><button class="vl-playall vl-role" data-vrole="1"><span aria-hidden="true">🎭 </span>Rejouer la scène</button></div><div id="vlRolePlay" hidden></div>`}
  function placeSheet(u){const UN=lvUnits(),U=UN[u];if(!U)return;const cu=curUnitIx();
    if(SC_LANGS.includes(S.tgt)&&S.tgt!=="la"&&!SC[S.level]&&!scLoading[S.level]){sceneLoad(S.level).then(()=>placeSheet(u));return}
    const go=()=>{const it=setData(U.id)||[];const ok=it.filter(x=>x&&x.t),many=ok.filter(x=>/\s/.test(x.t.trim()));const lines=(many.length>=3?many:ok).slice(0,4);
      const real=sceneOf(U);
      const scene=real?realSceneHTML(real):lines.length?`<div class="vl-scene">${lines.map(x=>`<div class="vl-line"><button class="mini-say" data-say="${E(x.t)}" aria-label="Écouter">🔊</button><div><b lang="${S.tgt}" data-noi18n="1">${E(x.t)}</b><small data-noi18n="1">${E(x.s||"")}</small></div></div>`).join("")}</div>`:"";
      const cur=firstUndone();
      const sp=specialOf(u),spd=!!S.done[xKey(u,"sp")],spl=!spd&&!stepDone(u,2);
      /* Parcours du lieu : un bouton pour l'étape suivante, puis la liste des étapes dans l'ordre, expliquées */
      const SD={0:["Premiers mots",tr("Des mots nouveaux, travaillés une fois chacun")],1:["Nouveaux mots",tr("D'autres mots, et un rappel des lieux précédents")],2:["Derniers mots",tr("Les derniers mots du lieu")],
        4:["Écouter","Petites histoires et vrai ou faux, à l'oreille"],5:["Parler","Répète les phrases à voix haute"],6:["En situation","Des dialogues : réponds comme sur place"],3:["Défi du château",tr("Écouter, parler, écrire : tout le lieu en un défi")]};
      const PS=LORDER.map(l=>({at:`data-node="${u},${l}"`,done:stepDone(u,l),lock:(u*LPU+posOf(l))>cur,t:(SD[l]||[(SECTION_INFO[l]||{}).n||""])[0],d:(SD[l]||["",""])[1],boss:l===BOSS}))
        .concat([{at:`data-special="${u}"`,done:spd,lock:spl,t:sp.n,d:"Bonus",bonus:true}]);
      const nx=PS.find(x=>!x.done&&!x.lock),nd=PS.filter(x=>x.done).length;
      const pathHTML=`<section class="vl-path"><div class="vl-path-head"><h3 class="vl-h3">Ton parcours</h3><span class="vl-path-n">${nd} / ${PS.length}</span></div>
        <div class="vl-path-bar"><i style="width:${Math.round(nd/PS.length*100)}%"></i></div>
        ${nx?`<button class="vl-go" ${nx.at}><span class="vl-go-k">${nd?"Continuer":"Commencer"}</span><b>${E(nx.t)}</b><small>${E(nx.d)}</small><span class="vl-go-arr" aria-hidden="true">→</span></button>`:`<p class="vl-alldone">✓ <span>Lieu terminé ! Tu peux refaire n'importe quelle étape.</span></p>`}
        <ol class="vl-stepper">${PS.map((x,k)=>{const cls=(x.done?" done":"")+(x===nx?" cur":"")+(x.lock?" lock":"")+(x.bonus?" bonus":"");
          const dot=x.done?"✓":x.bonus?"★":x.boss?"🏰":String(k+1);
          const inner=`<span class="vl-st-dot" aria-hidden="true">${dot}</span><span class="vl-st-t"><b>${E(x.t)}</b><small>${E(x.d)}</small></span>${x.lock?`<span class="vl-st-lock" aria-label="Verrouillé">🔒</span>`:x.done?`<span class="vl-st-re">Refaire</span>`:""}`;
          return `<li class="vl-sti${cls}">${x.lock?`<div class="vl-st">${inner}</div>`:`<button class="vl-st" ${x.at}>${inner}</button>`}</li>`}).join("")}</ol></section>`;
      openSheet(`<div class="vl-sheet"><div class="section-head"><div><span class="eyebrow">${E(tr(U.n))} · ${E(cityName())}</span><h2 data-noi18n="1">${E(unitTitle(U))}</h2></div><button class="icon-btn" data-act="closesheet" aria-label="Fermer">✕</button></div>
        ${scene?`<h3 class="vl-h3">La scène</h3><p class="vl-muted">Écoute d'abord, sans lire la traduction.</p>${scene}`:""}
        ${pathHTML}
        <div id="vlReg"></div>
        <button class="btn ghost block" data-openlist="${U.id}">Voir toutes les phrases du lieu</button></div>`);try{window.__vlAfterSheet&&window.__vlAfterSheet(U,!!real)}catch(err){}};
    if(setData(U.id))go();else if(typeof ensureSet==="function"){ensureSet(U.id).then(go).catch(go)}else go()}
  document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-vplace],[data-vpin],[data-vgo],[data-vq],[data-vclassic],[data-vmap],[data-vtr],[data-vplayall]");
    if(t){e.preventDefault();e.stopPropagation();
      if(t.dataset.vpin!=null||t.dataset.vgo!=null){const u=+(t.dataset.vpin!=null?t.dataset.vpin:t.dataset.vgo);if(u>curUnitIx()){toast("Termine d'abord les lieux précédents");return}
        const cur=firstUndone(),l=LORDER.find(l=>!stepDone(u,l)&&(u*LPU+posOf(l))<=cur);
        if(l!=null&&!unitDone(u)){startLesson(u,l);return}placeSheet(u);return}
      if(t.dataset.vplace!=null){const u=+t.dataset.vplace;if(u>curUnitIx()){toast("Termine d'abord les lieux précédents");return}placeSheet(u);return}
      if(t.dataset.vq!=null){Qsel=+t.dataset.vq;render();return}
      if(t.dataset.vtr){const z=document.getElementById("vlScene");if(z){const h=z.classList.toggle("vl-hide");t.textContent=tr(h?"Voir la traduction":"Masquer la traduction")}return}
      if(t.dataset.vplayall){const L=[...document.querySelectorAll("#vlScene [data-say]")].map(b=>b.dataset.say);let i=0,tok=Date.now();window.__vlPlay=tok;
        const next=()=>{if(window.__vlPlay!==tok||i>=L.length||!document.getElementById("vlScene"))return;const txt=L[i++];
          document.querySelectorAll("#vlScene .vl-line").forEach((el,k)=>el.classList.toggle("now",k===i-1));
          try{speak(txt,S.tgt)}catch(err){}
          /* on attend la fin réelle de la réplique (fichier, voix en ligne ou voix de l'appareil), puis une courte pause */
          const t0=Date.now(),max=4000+txt.length*110,A=window.CastellumAudio;
          const wait=()=>{if(window.__vlPlay!==tok)return;const el=Date.now()-t0;let busy=false;
            try{busy=(A&&(A.state==="loading"||A.state==="playing"))||(window.speechSynthesis&&speechSynthesis.speaking)}catch(err){}
            if(el>max||(el>500&&!busy))setTimeout(next,450);else setTimeout(wait,150)};
          setTimeout(wait,200)};next();return}
      if(t.dataset.vmap){S.ui=S.ui||{};S.ui.classicPath=false;save();render();return}
      if(t.dataset.vclassic){S.ui=S.ui||{};S.ui.classicPath=true;save();render();toast("Parcours classique activé");return}}
    const n=e.target.closest&&e.target.closest("#sheetRoot [data-node],#sheetRoot [data-special],#sheetRoot [data-openlist]");
    if(n&&!n.classList.contains("locked"))setTimeout(()=>{try{closeSheet()}catch(err){}},0)},true);
  window.castellumVille={on:()=>{S.ui=S.ui||{};S.ui.classicPath=false;save();render()}};
  const css=document.createElement("style");css.textContent=`
.vl{display:flex;flex-direction:column;gap:16px;--vl-ink:#14324A;--vl-acc:#C2410C;--vl-acc-ink:#fff;--vl-ground:#EDE8DD;--vl-card:var(--card,#fff);--vl-muted:#4E5F6B}
.vl-head{display:flex;flex-direction:column;gap:4px;padding:2px 2px 0}.vl-head h1{margin:0;font-size:2rem;line-height:1.05;font-weight:800;color:var(--ink,#14324A)}
.vl-eyebrow{font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--vl-acc)}
.vl-muted{margin:0;color:var(--muted,#4E5F6B);font-size:.95rem;line-height:1.45}
.vl-tabs{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 4px;scrollbar-width:none}.vl-tabs::-webkit-scrollbar{display:none}
.vl-tab{flex:none;display:flex;gap:6px;align-items:baseline;min-height:40px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line,#dfe3e6);background:var(--vl-card);color:var(--ink,#14324A);font:inherit;font-weight:600;font-size:.9rem;cursor:pointer}
.vl-tab small{color:var(--muted,#4E5F6B);font-weight:600}.vl-tab.on{background:var(--vl-ink);border-color:var(--vl-ink);color:#fff}.vl-tab.on small{color:#cfe0ec}
.vl-map{position:relative;height:470px;border-radius:22px;background:var(--vl-ground);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}
.vl-blk{position:absolute;border-radius:10px;background:#E2DACB}.vl-park{position:absolute;border-radius:40%;background:#CFE0C3}
.vl-street{position:absolute;background:#fff;border-radius:6px;opacity:.95}
.vl-place{position:absolute;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer;font:inherit;color:var(--vl-ink);transform:translateX(-10%);max-width:44%}
.vl-pin{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:#fff;border:2px dashed #9AA7B0;box-sizing:border-box}
.vl-place.done .vl-pin{background:var(--vl-ink);color:#fff;border:3px solid #fff;box-shadow:0 2px 6px rgba(20,50,74,.25)}
.vl-place.cur .vl-pin{width:74px;height:74px;font-size:2rem;background:var(--vl-acc);border:4px solid #fff;box-shadow:0 0 0 6px rgba(194,65,12,.25),0 6px 16px rgba(194,65,12,.35)}
.vl-place.open .vl-pin{border-style:solid;border-color:var(--vl-ink)}.vl-place.locked{opacity:.85}
.vl-lab{font-size:.76rem;font-weight:700;background:#fff;color:#14324A;padding:4px 8px;border-radius:9px;text-align:center;line-height:1.2;box-shadow:0 1px 3px rgba(0,0,0,.08);max-width:130px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vl-lab small{display:block;font-weight:600;color:var(--vl-acc)}
.vl-place.cur .vl-lab{-webkit-line-clamp:3}
.vl-trail-h{margin:6px 0 -6px;font-size:1.15rem;font-weight:800;color:var(--ink,#14324A)}
.vl-trail{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px;position:relative}
.vl-stop{position:relative}
.vl-stop:not(.last)::after{content:"";position:absolute;left:35px;top:72px;bottom:-22px;width:0;border-left:4px dotted #C9D2D9;z-index:0}
.vl-stop.done:not(.last)::after{border-left:4px solid #2E9E5B}
.vl-stopbtn{position:relative;z-index:1;width:100%;display:flex;align-items:center;gap:14px;text-align:left;font:inherit;color:var(--ink,#14324A);background:var(--vl-card);border:2px solid var(--line,#dfe3e6);border-radius:20px;padding:10px 14px 10px 8px;min-height:84px;cursor:pointer;box-shadow:0 3px 0 rgba(20,50,74,.08);transition:transform .12s}
.vl-stopbtn:active{transform:translateY(2px);box-shadow:none}
.vl-node{position:relative;flex:none;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.7rem;background:#EEF4F8;border:3px solid #fff;box-shadow:0 0 0 3px #C9D2D9}
.vl-badge{position:absolute;right:-4px;bottom:-4px;width:22px;height:22px;border-radius:50%;background:#2E9E5B;color:#fff;font-size:.8rem;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.vl-info{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
.vl-info>b{font-size:1.05rem;line-height:1.2}.vl-info>small{font-size:.86rem;line-height:1.3;color:var(--muted,#4E5F6B);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.vl-dots{display:flex;align-items:center;gap:4px;margin-top:3px}.vl-dots i{width:14px;height:6px;border-radius:3px;background:#DCE3E8}.vl-dots i.on{background:#2E9E5B}.vl-dots em{font-style:normal;font-size:.75rem;font-weight:700;color:var(--muted,#4E5F6B);margin-left:4px}
.vl-act{flex:none;font-weight:800;font-size:.9rem;border-radius:999px;padding:9px 14px;white-space:nowrap}
.vl-act.go{background:var(--vl-acc);color:var(--vl-acc-ink,#fff);box-shadow:0 3px 0 rgba(120,40,8,.35)}
.vl-act.ok{background:#E3F4EA;color:#1F7A45}.vl-act.lock{font-size:1.1rem;padding:6px;opacity:.7}
.vl-stop.done .vl-node{background:#E3F4EA;box-shadow:0 0 0 3px #2E9E5B}
.vl-stop.cur .vl-stopbtn{border-color:var(--vl-acc);background:linear-gradient(180deg,#FFF4EC,var(--vl-card) 70%);box-shadow:0 4px 0 rgba(194,65,12,.3),0 10px 24px rgba(194,65,12,.16);min-height:100px}
.vl-stop.cur .vl-node{width:66px;height:66px;font-size:2rem;background:#FFE3D0;box-shadow:0 0 0 4px var(--vl-acc);animation:vlPulse 1.8s ease-in-out infinite}
.vl-stop.cur:not(.last)::after{left:39px;top:86px}
.vl-stop.cur .vl-act.go{animation:vlBob 1.4s ease-in-out infinite;font-size:1rem;padding:11px 16px}
@keyframes vlPulse{50%{box-shadow:0 0 0 4px var(--vl-acc),0 0 0 12px rgba(194,65,12,.16)}}
.vl-stop.locked .vl-stopbtn{background:transparent;border-style:dashed;box-shadow:none;cursor:not-allowed}
.vl-stop.locked .vl-node{filter:grayscale(1);opacity:.55;background:transparent}
.vl-stop.locked .vl-info>b{color:var(--muted,#4E5F6B)}
@media (min-width:700px){.vl-trail{gap:16px}.vl-stop.r{margin-left:56px}.vl-stop.l{margin-right:56px}.vl-stop.l:not(.last)::after,.vl-stop.r:not(.last)::after{display:none}}
@media (prefers-reduced-motion:reduce){.vl-stop.cur .vl-node,.vl-stop.cur .vl-act.go{animation:none}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .vl-stop.cur .vl-stopbtn{background:linear-gradient(180deg,rgba(194,65,12,.22),var(--vl-card) 70%)}:root:not([data-theme="light"]) .vl-node{background:rgba(255,255,255,.08);border-color:transparent}:root:not([data-theme="light"]) .vl-dots i{background:rgba(255,255,255,.16)}:root:not([data-theme="light"]) .vl-dots i.on{background:#2E9E5B}:root:not([data-theme="light"]) .vl-act.ok{background:rgba(46,158,91,.2);color:#7FD8A4}}
:root[data-theme="dark"] .vl-stop.cur .vl-stopbtn,body.dark .vl-stop.cur .vl-stopbtn{background:linear-gradient(180deg,rgba(194,65,12,.22),var(--vl-card) 70%)}
:root[data-theme="dark"] .vl-node,body.dark .vl-node{background:rgba(255,255,255,.08);border-color:transparent}
:root[data-theme="dark"] .vl-dots i,body.dark .vl-dots i{background:rgba(255,255,255,.16)}
:root[data-theme="dark"] .vl-act.ok,body.dark .vl-act.ok{background:rgba(46,158,91,.2);color:#7FD8A4}

.vl-next .vl-playbig{flex:0 0 auto;height:auto;width:100%;min-height:58px;font-size:1.15rem;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 4px 0 rgba(120,40,8,.35)}
.vl-playbig:active{transform:translateY(2px);box-shadow:0 2px 0 rgba(120,40,8,.35)}
.vl-next .vl-row{justify-content:space-between}
.vl-hint{margin:2px 0 -4px;text-align:center;font-size:.9rem;font-weight:600;color:var(--muted,#4E5F6B)}
.vl-pin{position:relative}
.vl-lock{position:absolute;right:-6px;bottom:-4px;font-size:.95rem;background:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.vl-place.locked .vl-pin>span:first-child{filter:grayscale(1);opacity:.55}.vl-place.locked{cursor:not-allowed}
.vl-playtag{background:var(--vl-acc);color:var(--vl-acc-ink,#fff);font-weight:800;font-size:.85rem;padding:5px 12px;border-radius:999px;box-shadow:0 2px 6px rgba(194,65,12,.35);animation:vlBob 1.4s ease-in-out infinite}
@keyframes vlBob{50%{transform:translateY(-3px)}}
@media (prefers-reduced-motion:reduce){.vl-playtag{animation:none}}

.vl-next{margin-top:0;position:relative;background:var(--vl-card);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 24px rgba(20,50,74,.14)}
.vl-next h2{margin:0;font-size:1.4rem;line-height:1.15;font-weight:800;color:var(--ink,#14324A)}
.vl-chips{display:flex;gap:8px;flex-wrap:wrap}.vl-chip{font-size:.85rem;padding:6px 10px;border-radius:999px;background:#EEF4F8;color:#14324A}
.vl-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.vl-btn{min-height:50px;padding:0 20px;border:0;border-radius:14px;background:var(--vl-acc);color:var(--vl-acc-ink);font:inherit;font-weight:700;font-size:1rem;cursor:pointer;flex:1 1 200px}
.vl-sxs{display:flex;flex-direction:column;gap:8px}.vl-sx{display:flex;align-items:center;gap:12px;width:100%;min-height:60px;padding:12px 14px;border-radius:16px;border:2px solid var(--vl-acc);background:var(--vl-card);color:var(--ink,#14324A);font:inherit;text-align:left;cursor:pointer}.vl-sx b{display:block}.vl-sx small{display:block;color:var(--muted,#4E5F6B)}.vl-sx-ic{font-size:1.6rem}
.vl-quick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.vl-q{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:58px;padding:10px 14px;border-radius:16px;border:1.5px solid var(--line,#dfe3e6);background:var(--vl-card);color:var(--ink,#14324A);font:inherit;text-align:left;cursor:pointer}.vl-q small{color:var(--muted,#4E5F6B)}
.vl-pass{background:#14324A;color:#fff;border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px}
.vl-pass .vl-eyebrow{color:#F2A57E}.vl-pass-head{display:flex;justify-content:space-between;align-items:flex-end}.vl-pass h3{margin:2px 0 0;font-size:1.25rem;font-weight:800}.vl-pass h4{margin:4px 0 0;font-size:.95rem}
.vl-stamps-n{color:#cfe0ec;font-weight:600}
.vl-stamps{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:10px}
.vl-stamp{aspect-ratio:1;border-radius:50%;border:2px dashed #5F7D93;display:flex;align-items:center;justify-content:center;font-size:1.4rem}
.vl-stamp.on{border:3px solid #F2A57E;transform:rotate(var(--r))}
.vl-can{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.vl-can li{display:flex;gap:10px;align-items:flex-start}.vl-can li span:last-child{display:flex;flex-direction:column}.vl-can small{color:#cfe0ec}
.vl-ck{width:24px;height:24px;border-radius:50%;flex:none;border:2px solid #5F7D93;box-sizing:border-box;display:flex;align-items:center;justify-content:center}
.vl-can li.ok .vl-ck{background:#F2A57E;border-color:#F2A57E;color:#14324A}
.vl-classic{margin:0;text-align:center}.vl-link{background:none;border:0;color:var(--muted,#4E5F6B);text-decoration:underline;font:inherit;font-size:.9rem;cursor:pointer;min-height:44px}
.vl-sheet .vl-h3{margin:14px 0 4px;font-size:1rem}
.vl-sheet>.section-head{display:flex;flex-wrap:nowrap;align-items:flex-start;gap:10px}.vl-sheet>.section-head>div{flex:1 1 auto;min-width:0}.vl-sheet>.section-head>.icon-btn{flex:none}
.vl-set{margin:6px 0 8px;font-size:.95rem;line-height:1.45;font-style:italic;color:var(--muted,#4E5F6B)}
.vl-playall{min-height:44px;padding:0 16px;border-radius:12px;border:0;background:#14324A;color:#fff;font:inherit;font-weight:700;cursor:pointer}
.vl-who{font-size:.75rem;font-weight:700;color:var(--muted,#4E5F6B)}.vl-line.me{background:#FBEDE6;margin-left:24px}.vl-line.now{outline:2px solid #C2410C}
.vl-hide .vl-tr{visibility:hidden}
.vl-scene{display:flex;flex-direction:column;gap:8px;margin-top:8px}.vl-line{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:var(--soft,#F2F5F7)}
.vl-line>div{display:flex;flex-direction:column;gap:2px}.vl-line small{color:var(--muted,#4E5F6B)}
.vl-steps{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0 14px}
.vl-step{display:flex;align-items:center;gap:8px;min-height:48px;padding:8px 12px;border-radius:12px;border:1.5px solid var(--line,#dfe3e6);background:var(--card,#fff);color:var(--ink,#14324A);font:inherit;font-weight:600;text-align:left;cursor:pointer}
.vl-step.done{border-color:#14324A;background:#EEF4F8;color:#14324A}.vl-step.locked{opacity:.6}.vl-step-ic{width:26px;text-align:center}
@media (prefers-color-scheme:dark){.vl{--vl-ground:#2A2F33}.vl-blk{background:#353B40}.vl-park{background:#2F4030}.vl-street{background:#454C52}.vl-chip{background:#24384A;color:#E4EEF5}}
`;document.head.appendChild(css);
  try{if(typeof render==="function")render()}catch(e){}
})();
