/* Point de grammaire dans la leçon.
   Dans chaque leçon de mots (les trois premiers jeux d'un lieu), une carte « Point de grammaire » s'insère
   après les premiers exercices : la règle en une phrase, deux exemples à écouter, et la fiche complète
   à déplier. La fiche est choisie parmi celles du niveau (grammaire de l'appli) : celle dont les exemples
   partagent le plus de mots avec les phrases du lieu ; chaque leçon d'un même lieu en montre une différente.
   Les explications sont écrites en français : la carte n'apparaît que pour les francophones. */
(function(){
  if(typeof buildLesson!=="function"||typeof stepHTML!=="function"||typeof ownFiches!=="function")return;
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const T=t=>{try{return tr(t)}catch(e){return t}};
  const words=t=>String(t||"").toLowerCase().normalize("NFC").split(/[\s'’.,;:!?¿¡«»"()\-–—…·]+/).filter(w=>w.length>=2);
  const tgtSide=x=>String(x||"").split(" · ")[0];
  const srcSide=x=>{const i=String(x||"").indexOf(" · ");return i<0?"":String(x).slice(i+3)};
  function firstSentence(e){const s=String(e||"").trim();const m=s.match(/^(.{40,240}?[.!?])(\s|$)/);return m?m[1]:(s.length>240?s.slice(0,237).replace(/\s+\S*$/,"")+"…":s)}

  function pick(u,l,items){
    let F=[];try{F=ownFiches()||[]}catch(e){}
    F=F.filter(f=>f&&f.t&&f.e&&Array.isArray(f.x)&&f.x.length);if(!F.length)return null;
    const bag=new Set(items.flatMap(it=>words(it.t)));
    const scored=F.map((f,i)=>{const ex=f.x.map(tgtSide);const hits=ex.reduce((a,x)=>a+words(x).filter(w=>bag.has(w)).length,0);return {f,i,hits}});
    /* d'abord les fiches qui partagent des mots avec le lieu, puis les autres dans l'ordre du programme ;
       chaque lieu commence ailleurs dans la liste, pour ne pas toujours retomber sur la même fiche */
    const rot=(i)=>(i-u%F.length+F.length)%F.length;
    scored.sort((a,b)=>(b.hits>0)-(a.hits>0)||b.hits-a.hits||rot(a.i)-rot(b.i));
    const f=scored[Math.min(l,scored.length-1)].f;
    const ex=f.x.map(x=>({t:tgtSide(x),s:srcSide(x),hits:words(tgtSide(x)).filter(w=>bag.has(w)).length}))
      .sort((a,b)=>b.hits-a.hits).slice(0,2);
    return {f,ex}}

  const prevBuild=buildLesson;
  buildLesson=function(u,l,items){
    const steps=prevBuild.apply(this,arguments);
    try{
      if(!Array.isArray(steps)||l>=3||S.src!=="fr"||!Array.isArray(items)||!items.length)return steps;
      const g=pick(u,l,items);if(!g)return steps;
      const card={k:"intro",gram:g.f,gx:g.ex,it:{t:g.ex[0].t,s:g.ex[0].s,p:""},nospeak:true};
      /* après le troisième exercice (hors présentations), jamais en premier ni en dernier */
      let n=0,at=Math.min(steps.length,4);
      for(let i=0;i<steps.length;i++){const s=steps[i];if(s.k!=="intro"&&!s.scene){n++;if(n===3){at=i+1;break}}}
      steps.splice(at,0,card);
    }catch(e){console.warn("grammaire-lecon",e)}
    return steps};

  const prevHTML=stepHTML;
  stepHTML=function(st){
    if(!st||!st.gram)return prevHTML.apply(this,arguments);
    const f=st.gram,rule=firstSentence(f.e),more=f.e.trim()!==rule.trim();
    const ex=(st.gx||[]).map(x=>`<li><button type="button" class="mini-say" data-say="${E(x.t)}" aria-label="${E(T("Écouter"))}">🔊</button><span><b lang="${S.tgt}" data-noi18n>${E(x.t)}</b>${x.s?`<small data-noi18n>${E(x.s)}</small>`:""}</span></li>`).join("");
    return `<div class="gl-card"><span class="gl-eyebrow">${E(T("Point de grammaire"))}</span>
      <h2 class="gl-title" data-noi18n>${E(f.t)}</h2>
      <p class="gl-rule" data-noi18n>${E(rule)}</p>
      ${ex?`<ul class="gl-ex">${ex}</ul>`:""}
      ${more?`<details class="gl-more"><summary>${E(T("Lire la fiche complète"))}</summary><p data-noi18n>${E(f.e)}</p></details>`:""}</div>`};

  /* la carte ne marque aucun mot comme « vu » et ne lit rien toute seule : on retire ce que fait une présentation */
  if(typeof renderStep==="function"){const pr=renderStep;renderStep=function(){const st=LX&&LX.steps&&LX.steps[LX.i];
    if(!st||!st.gram)return pr.apply(this,arguments);
    const key=S.tgt+st.it.t,had=S.seen&&S.seen[key],sp=window.speak;window.speak=function(){return true};
    try{return pr.apply(this,arguments)}finally{setTimeout(()=>{window.speak=sp},400);if(!had&&S.seen)delete S.seen[key]}}}

  if(typeof I18N!=="undefined"){const U={it:["Punto di grammatica","Leggi la scheda completa"],es:["Punto de gramática","Leer la ficha completa"],pt:["Ponto de gramática","Ler a ficha completa"],en:["Grammar point","Read the full sheet"],de:["Grammatikpunkt","Ganzes Blatt lesen"],nl:["Grammaticapunt","Lees de hele fiche"],ary:["No9ta d n-na7w","9ra l-fiche kamla"]};
    for(const l in U){I18N[l]=I18N[l]||{};["Point de grammaire","Lire la fiche complète"].forEach((k,i)=>{if(I18N[l][k]==null)I18N[l][k]=U[l][i]})}}

  const css=document.createElement("style");css.id="castellum-grammaire-lecon-css";css.textContent=`
.gl-card{display:flex;flex-direction:column;gap:12px;background:var(--gold-soft,#FDF1C7);border:2.5px solid var(--af-edge,#111);border-radius:18px;padding:18px;box-shadow:5px 5px 0 var(--af-edge,#111)}
.gl-eyebrow{align-self:flex-start;background:var(--af-edge,#111);color:var(--bg,#fff);font-weight:800;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:8px}
.gl-title{margin:0;font-size:1.45rem!important;line-height:1.05!important;color:var(--ink)}
.gl-rule{margin:0;font-size:1.05rem;line-height:1.45;font-weight:600;color:var(--ink)}
.gl-ex{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.gl-ex li{display:flex;align-items:center;gap:10px;background:var(--surface,#fff);border:2px solid var(--af-edge,#111);border-radius:12px;padding:8px 12px}
.gl-ex li>span{display:flex;flex-direction:column;gap:2px;min-width:0}
.gl-ex b{font-size:1.05rem}.gl-ex small{color:var(--ink-2)}
.gl-ex .mini-say{flex:none}
.gl-more summary{cursor:pointer;font-weight:800;text-decoration:underline;min-height:40px;line-height:40px;color:var(--ink)}
.gl-more p{margin:4px 0 0;line-height:1.5;color:var(--ink)}
#lxStep:has(.gl-card) .audio-premium-bar,#lxStep:has(.gl-card) .a2-status,#lxStep:has(.gl-card) .jx-nosound,#lxStep:has(.gl-card) .jx-help{display:none!important}`;
  document.head.appendChild(css);
})();
