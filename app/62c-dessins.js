/* Dessins dans le style « Affiche » :
   - la mascotte : une tour de château avec un visage, contours noirs épais, ombre décalée, drapeau jaune ;
     son expression suit l'humeur demandée (idle, happy, sad, cheer, party) ;
   - les icônes des lieux : un dessin au trait par thème, à la place des emojis, sur le chemin de la ville. */
(function(){
  if(typeof S==="undefined")return;

  /* ---------- Mascotte ---------- */
  const MOUTH={
    idle:'<path d="M50 84q10 8 20 0" fill="none" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>',
    happy:'<path d="M47 82q13 15 26 0z" fill="#111" stroke="#111" stroke-width="3" stroke-linejoin="round"/><path d="M53 89q7 3 14 0" fill="none" stroke="#F0586C" stroke-width="3" stroke-linecap="round"/>',
    sad:'<path d="M50 90q10-8 20 0" fill="none" stroke="#111" stroke-width="4.5" stroke-linecap="round"/>',
    cheer:'<path d="M46 81q14 18 28 0z" fill="#111" stroke="#111" stroke-width="3" stroke-linejoin="round"/>',
    party:'<path d="M46 81q14 18 28 0z" fill="#111" stroke="#111" stroke-width="3" stroke-linejoin="round"/>'};
  const BODY="M22 30H38V42H52V30H68V42H82V30H98V130H22Z";
  function art(mood){const m=MOUTH[mood]?mood:(mood==="mini"?"idle":"idle"),arms=m==="cheer"||m==="party",sad=m==="sad";
    return `<path d="${BODY}" transform="translate(6 6)" fill="currentColor"/>`+
      (arms?'<path d="M24 82 8 62M96 82l16-20" stroke="#111" stroke-width="6" stroke-linecap="round"/><circle cx="8" cy="60" r="6" fill="#F7C948" stroke="#111" stroke-width="4"/><circle cx="112" cy="60" r="6" fill="#F7C948" stroke="#111" stroke-width="4"/>':'')+
      '<path d="M60 30V6" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/><path d="M60 6l24 6-24 7z" fill="#F7C948" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/>'+
      `<path d="${BODY}" fill="#F7F4EE" stroke="#111" stroke-width="5" stroke-linejoin="round"/>`+
      '<path d="M22 108H98V130H22Z" fill="#E4472B" stroke="#111" stroke-width="5" stroke-linejoin="round"/>'+
      '<path d="M50 130v-14a10 10 0 0 1 20 0v14z" fill="#111"/>'+
      (sad?'<path d="M38 60l12 4M82 60l-12 4" stroke="#111" stroke-width="4" stroke-linecap="round"/>':'')+
      '<circle cx="47" cy="70" r="7" fill="#111"/><circle cx="73" cy="70" r="7" fill="#111"/><circle cx="49.5" cy="67.5" r="2.3" fill="#fff"/><circle cx="75.5" cy="67.5" r="2.3" fill="#fff"/>'+
      '<ellipse cx="36" cy="84" rx="5.5" ry="3.5" fill="#F0586C"/><ellipse cx="84" cy="84" rx="5.5" ry="3.5" fill="#F0586C"/>'+MOUTH[m]+
      (m==="party"?'<path d="M14 24l6 3M104 20l-5 5M10 44l7-1M108 40l6 3" stroke="#3DBE95" stroke-width="4" stroke-linecap="round"/><path d="M28 12l3 5M92 10l-3 5" stroke="#E4472B" stroke-width="4" stroke-linecap="round"/>':'')}
  window.castellumMascotSVG=art;
  /* La mascotte d'origine (image) est conservée : ce dessin n'est plus utilisé à sa place. */

  /* ---------- Icônes des lieux ---------- */
  const P=d=>`<path d="${d}"/>`;
  const IC={
    hand:P("M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.5 14a1.6 1.6 0 0 1 2.6-1.8L7 13.5"),
    person:P("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"),
    numbers:P("M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"),
    people:P("M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 13.6a6.5 6.5 0 0 1 4 6.4"),
    cup:P("M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"),
    buildings:P("M3 21h18M5 21V8l6-4v17M11 21V9h8v12M14 12h2M14 16h2M7.5 11h1M7.5 15h1"),
    clock:P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2"),
    palette:P("M12 3a9 9 0 1 0 0 18c1.2 0 2-.8 2-1.9 0-1.4-1.2-1.6-1.2-2.9 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3zM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01"),
    sun:P("M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"),
    house:P("M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6"),
    key:P("M8 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 12l9-9M17 6l2 2M14.5 8.5l2 2"),
    heart:P("M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"),
    bag:P("M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"),
    ball:P("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5l4 3-1.5 4.7h-5L8 10.5zM12 3v4.5M16 10.5l4.5-1.5M14.5 15.2l2.8 3.8M9.5 15.2l-2.8 3.8M8 10.5 3.5 9"),
    book:P("M5 4h13v14H7a2 2 0 0 0-2 2zM5 20a2 2 0 0 0 2 2h11v-4"),
    cross:P("M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"),
    paw:'<circle cx="6.5" cy="10" r="2"/><circle cx="17.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/>'+P("M12 12.5c-3 0-5.5 3.2-5.5 5.5 0 1.7 1.5 2.7 3.4 2.2 1.4-.4 2.8-.4 4.2 0 1.9.5 3.4-.5 3.4-2.2 0-2.3-2.5-5.5-5.5-5.5z"),
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/>'+P("M11 18h2"),
    plane:P("M2.5 12.5 21 4l-5.5 16-4-6.5zM11.5 13.5 15 10"),
    bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><circle cx="8" cy="20.5" r="1.5"/><circle cx="16" cy="20.5" r="1.5"/>'+P("M4 11h16M8 7h8"),
    fork:P("M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.5 1.5-3.5 4-3.5 7.5H17"),
    star:P("M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.8l6.1-.9z"),
    cloud:P("M8 6.5V4M3.5 9H2M4.6 4.6 6 6M17 19H7.5a4.5 4.5 0 1 1 1-8.9A5.5 5.5 0 0 1 19 12a3.5 3.5 0 0 1-2 7zM11 8.3A4 4 0 0 0 4.3 11"),
    briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/>'+P("M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"),
    coin:'<circle cx="12" cy="12" r="9"/>'+P("M12 6.5v11M15 9.3c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3-1.6"),
    speech:P("M4 5h16v11H9l-5 4z"),
    news:'<rect x="3" y="4" width="18" height="16" rx="2"/>'+P("M7 8h10M7 12h4M7 16h4M14 12h3v4h-3z"),
    mountain:P("M2 20 9 8l4 6 3-4 6 10z"),
    film:'<rect x="3" y="4" width="18" height="16" rx="2"/>'+P("M7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"),
    music:P("M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"),
    scroll:P("M8 3h10a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H8M8 3a2 2 0 0 0-2 2v2h4V5a2 2 0 0 0-2-2zM8 21a3 3 0 0 1-3-3v-1h9v1a3 3 0 0 0 3 3M10 9h7M10 13h7"),
    quill:P("M20 3C12 4 7 9 5 17l-1 4M20 3c-1 6-5 10-11 11M13 10l-3 3"),
    castle:P("M4 21V9h3V6h3v3h4V6h3v3h3v12zM10 21v-4a2 2 0 0 1 4 0v4")};
  const MAP=[["salut","hand"],["présent","person"],["nouveau venu","person"],["nombre","numbers"],["famille","people"],["voisin","people"],
    ["café","cup"],["boisson","cup"],["au bar","cup"],["petit-déj","fork"],["restaurant","fork"],["cuisine","fork"],["gastronom","fork"],["recette","fork"],
    ["marché","bag"],["magasin","bag"],["courses","bag"],["shopping","bag"],["mode","bag"],["consomm","bag"],["poste","bag"],["colis","bag"],
    ["foot","ball"],["match","ball"],["supporter","ball"],["mercato","ball"],["tactique","ball"],["sport","ball"],["salle de sport","ball"],
    ["heure","clock"],["temps","clock"],["journée","clock"],["projet","clock"],["souvenir","clock"],["histoire","quill"],
    ["couleur","palette"],["musée","palette"],["art","palette"],["quotidien","sun"],["vacances","sun"],["plage","sun"],["été","sun"],
    ["maison","house"],["chez moi","house"],["ménag","house"],["logement","key"],["immobilier","key"],["hôtel","key"],
    ["aime","heart"],["amour","heart"],["amitié","heart"],["séduction","heart"],["émotion","heart"],["sentiment","heart"],["conflit","heart"],["parents","people"],
    ["médecin","cross"],["santé","cross"],["pharmacie","cross"],["soins","cross"],["corps","cross"],["forme","cross"],["vétérinaire","paw"],["animal","paw"],
    ["école","book"],["étud","book"],["éducation","book"],["littérature","book"],["étymolog","book"],["curiosités","book"],["philosoph","book"],["mythologie","quill"],
    ["déclinaison","scroll"],["conjugaison","scroll"],["verbe esse","scroll"],["accusatif","scroll"],["génitif","scroll"],["datif","scroll"],["ablatif","scroll"],
    ["participe","scroll"],["subjonctif","scroll"],["impératif","scroll"],["pronom","scroll"],["imparfait","scroll"],["futur","scroll"],["parfait","scroll"],
    ["infinitive","scroll"],["comparatif","scroll"],["adjectif","scroll"],["préposition","scroll"],["latin au","scroll"],
    ["auteurs","quill"],["citation","quill"],["proverbe","quill"],["récit","quill"],["texte","quill"],["césar","quill"],["virgile","quill"],["cicéron","quill"],["catulle","quill"],
    ["téléphone","phone"],["réseau","phone"],["texto","phone"],["technolog","phone"],["numérique","phone"],["informatique","phone"],
    ["voyage","plane"],["avion","plane"],["ailleurs","plane"],["bus","bus"],["transport","bus"],["gare","bus"],["taxi","bus"],["voiture","bus"],["chemin","bus"],
    ["ville","buildings"],["rome","buildings"],["urban","buildings"],["fête","star"],["tradition","star"],["concert","music"],["musique","music"],
    ["cinéma","film"],["série","film"],["culture","film"],["spectacle","film"],["météo","cloud"],["saison","cloud"],
    ["climat","mountain"],["écolog","mountain"],["nature","mountain"],["randonnée","mountain"],["camping","mountain"],["mer ","mountain"],
    ["travail","briefcase"],["emploi","briefcase"],["bureau","briefcase"],["entreprise","briefcase"],["boulot","briefcase"],["embauche","briefcase"],["métier","briefcase"],
    ["argent","coin"],["banque","coin"],["économie","coin"],["inégalit","coin"],
    ["actualité","news"],["média","news"],["presse","news"],["politique","news"],["justice","news"],["juridique","news"],["administrat","news"],["diplomat","news"],["société","news"],
    ["débat","speech"],["avis","speech"],["argument","speech"],["conversation","speech"],["négoci","speech"],["vendre","speech"],["humour","speech"],["argot","speech"],
    ["familier","speech"],["jeune","speech"],["idiom","speech"],["expression","speech"],["juron","speech"],["éloquence","speech"],["rhétorique","speech"],["registre","speech"],
    ["politesse","speech"],["faux amis","speech"],["double sens","speech"],["métaphore","speech"],["nuance","speech"],["doute","speech"],["diriger","speech"],["parler","speech"],["si j'étais","speech"],["interview","speech"],["connaissance","speech"]];
  function iconName(U){const n=String((U&&U.n)||"").toLowerCase()+" ";const f=MAP.find(([k])=>n.includes(k));return f?f[1]:"castle"}
  const svg=name=>`<svg class="am-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name]||IC.castle}</svg>`;
  window.castellumUnitIcon=U=>svg(iconName(U));
  function paint(){
    /* images de l'ancienne mascotte déjà affichées avant le chargement de ce module (écran de bienvenue) */
    try{const UN=lvUnits();
    document.querySelectorAll(".vl-stop .vl-node>span[aria-hidden]:not([data-am])").forEach(el=>{const b=el.closest("[data-vpin]");if(!b)return;const U=UN[+b.dataset.vpin];if(!U)return;el.dataset.am=1;el.innerHTML=svg(iconName(U))})}catch(e){}}
  new MutationObserver(paint).observe(document.body,{childList:true,subtree:true});
  paint();

  const css=document.createElement("style");css.id="castellum-dessins-css";css.textContent=`
.am-mascot{display:block;height:auto;color:var(--af-edge,#111);overflow:visible}
.am-mascot path,.am-mascot circle,.am-mascot ellipse{vector-effect:none}
.react .am-mascot{width:44px!important}
.done-screen .am-mascot{width:118px!important;margin:6px auto 0!important}
.empty .am-mascot,.w-m.am-mascot,.hello-m.am-mascot{width:110px!important}
.speaker .am-mascot{width:64px!important;flex:none}
.vl-node .am-ic{width:28px;height:28px;color:var(--ink)}
.vl-stop.cur .vl-node .am-ic{width:32px;height:32px}
.vl-stop.done .vl-node .am-ic,.vl-stop.cur .vl-node .am-ic{color:#111}
.vl-stop.locked .vl-node .am-ic{color:var(--ink-2)}
.vl-stop.locked .vl-node>span:first-child{filter:none!important;opacity:.75!important}`;
  document.head.appendChild(css);
  try{if(typeof render==="function"&&S.onboarded)render()}catch(e){}
})();
