/* Professeur particulier : fonctionne entièrement hors ligne à partir des données de l'application
   (vocabulaire, dictionnaire, fiches de grammaire, conjugaisons). */
(function(){
  if(typeof teacherView!=="function")return;
  const T={mode:null,q:null,list:[],i:0,score:0,fiches:[]};
  window.CASTELLUM_TUTOR=T;
  const tl=()=>L[S.tgt].n.toLowerCase(), sl=()=>L[S.src].n.toLowerCase();
  const de=x=>/^[aeiouyéèêh]/i.test(x)?"d'"+x:"de "+x;
  const say=t=>(typeof canSpeak==="function"&&canSpeak(S.tgt))?`<button class="icon-btn tt-say" data-say="${esc(String(t).replace(/\(.*?\)/g,"").trim())}" aria-label="Écouter">${SPEAK}</button>`:"";
  const row=(t,sub,p)=>`<div class="tt-row"><div class="tt-t"><b lang="${S.tgt}">${esc(t)}</b>${p?` <small>${esc(p)}</small>`:""}${sub?`<small>${esc(sub)}</small>`:""}</div>${say(t)}</div>`;
  const acts=a=>`<div class="tt-act">${a.map(([lab,pr])=>`<button class="chip" data-prompt="${esc(pr)}">${esc(lab)}</button>`).join("")}</div>`;
  function dist(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=Array.from({length:n+1},(_,j)=>j);
    for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[n]}
  const sim=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return 0;return 1-dist(a,b)/Math.max(a.length,b.length)};

  /* ---------- données ---------- */
  let PC={k:null,v:[]};
  function pairs(){const k=S.src+">"+S.tgt+">"+Object.keys(S.packs||{}).length;if(PC.k===k)return PC.v;const out=[],seen=new Set();
    SETS.forEach(set=>{let d=null;try{d=setData(set.id)}catch(e){}(d||[]).forEach(x=>{if(!x||!x.s||!x.t)return;const kk=norm(x.t);if(seen.has(kk))return;seen.add(kk);out.push({s:x.s,t:x.t,p:x.p||"",set:set.n,lv:set.lv||"A1"})})});
    PC={k,v:out};WS=null;return out}
  function levelPairs(){const lv=S.level,ps=pairs();const a=ps.filter(x=>x.lv===lv);return a.length>=6?a:ps}
  let WS=null;
  function wordSets(){if(WS)return WS;const t=new Set(),s=new Set();pairs().forEach(x=>{norm(x.t).split(" ").forEach(w=>w&&t.add(w));norm(x.s).split(" ").forEach(w=>w&&s.add(w))});WS={t,s};return WS}
  function allFiches(){const g=S.tgt,out=[];const add=(lv,f)=>f&&f.t&&out.push({lv,f});
    (typeof GRAM!=="undefined"&&GRAM[g]||[]).forEach(f=>add("A1",f));
    if(typeof GRAM_A2!=="undefined")add("A2",GRAM_A2[g]);if(typeof GRAM_B1!=="undefined")add("B1",GRAM_B1[g]);
    const F=(window.GRAM_FULL||{})[g]||{};Object.keys(F).forEach(lv=>F[lv].forEach(f=>add(lv,f)));return out}

  /* ---------- réponses ---------- */
  function help(first){
    return {text:"",html:`${first?`<span class="tt-h">Salut ! Je suis le château, ton professeur ${esc(de(tl()))}.</span>`:`<span class="tt-h">Voici ce que je sais faire :</span>`}
      <p class="tt-p">• Traduire : « Comment dit-on merci ? »<br>• Corriger : écris une phrase en ${esc(tl())}<br>• Expliquer : « Explique le passé »<br>• Conjuguer : « Conjugue le verbe aller »<br>• T'interroger : « Fais-moi un mini-test »<br>• Jouer une situation : « Simule un café »</p>
      <p class="tt-p">Tout fonctionne même sans connexion.</p>${acts([["Mini-test","Fais-moi un mini-test"],["Expliquer une règle","Explique-moi une règle de grammaire"],["Simuler un café","Simule une conversation au café"]])}`}}

  function translate(q){
    q=q.replace(/[«»"“”?¿!]/g," ").replace(/\s+/g," ").trim();if(!q)return {text:"Quel mot ou quelle phrase veux-tu traduire ?"};
    let idx;try{idx=dictIndex(S.src,S.tgt)}catch(e){idx=[]}
    const res=dictSearch(idx,q).slice(0,40);const nq=norm(q);
    const exact=res.filter(e=>norm(e.a)===nq||norm(e.b)===nq);
    const pick=(exact.length?exact:res).slice(0,3);
    if(pick.length){const fromT=exact.length&&norm(exact[0].b)===nq;
      return {html:`<span class="tt-h">${fromT?`« ${esc(q)} » en ${esc(sl())} :`:`« ${esc(q)} » en ${esc(tl())} :`}</span>`+
        pick.map(e=>row(e.b,e.a,e.bp)).join("")+
        (res.length>pick.length?`<p class="tt-p">Il y a d'autres expressions avec ce mot dans le dictionnaire.</p>`:"")+
        acts([["Autre mot","Comment dit-on : "],["Mini-test","Fais-moi un mini-test"]])}}
    // mot à mot
    const words=nq.split(" ").filter(w=>w.length>1);const gl=[];
    words.forEach(w=>{const e=idx.find(x=>norm(x.a)===w||norm(x.a).replace(/^(le|la|les|l|un|une|des|to|the|a|de|het|der|die|das|il|lo|el|o) /,"")===w);if(e)gl.push([w,e])});
    if(gl.length)return {html:`<span class="tt-h">Je n'ai pas cette expression telle quelle, mais voici mot à mot :</span>`+gl.map(([w,e])=>row(e.b,e.a,e.bp)).join("")+`<p class="tt-p">Essaie une formule plus courte pour une traduction exacte.</p>`};
    // mot le plus proche
    let best=null,bs=0;idx.forEach(e=>{const v=sim(e.a,q);if(v>bs){bs=v;best=e}});
    if(best&&bs>.6)return {html:`<span class="tt-h">Tu voulais dire « ${esc(best.a)} » ?</span>`+row(best.b,best.a,best.bp)};
    return {text:`Je ne trouve pas « ${q} » dans mes listes de ${tl()}. Essaie un mot plus simple, ou ouvre le dictionnaire.`,html:`<p class="tt-p">Je ne trouve pas « ${esc(q)} » dans mes listes de ${esc(tl())}. Essaie un mot plus simple ou plus court.</p>${acts([["Ouvrir le dictionnaire","__go:dict"]])}`};
  }

  const VERB_ALIASES={etre:"être",avoir:"avoir",aller:"aller",faire:"faire",parler:"parler",manger:"manger",boire:"boire",vouloir:"vouloir",pouvoir:"pouvoir",venir:"venir",prendre:"prendre",savoir:"savoir"};
  function findVerb(t){const w=t.split(" ");
    for(const x of w)if(VERB_ALIASES[x])return VERB_ALIASES[x];
    const V=(CONJ.verbs||{})[S.tgt]||{};for(const [k,v] of Object.entries(V)){const inf=norm(v[0]).replace(/^to /,"");if(inf&&(" "+t+" ").includes(" "+inf+" "))return k}
    return null}
  function conjugate(t){
    const verb=findVerb(t)||"être";
    let tense=/passe|passato|preterit|perfekt|past/.test(t)?"Passé":/futur|future|futuro/.test(t)?"Futur":"Présent";
    let c=null;try{c=conjData(verb,tense)}catch(e){}
    let note="";
    if(!c&&tense!=="Présent"){try{c=conjData(verb,"Présent")}catch(e){}if(c){note=`Je n'ai pas encore le ${tense.toLowerCase()} de ce verbe hors ligne : voici le présent.`;tense="Présent"}}
    if(!c){const V=Object.keys((CONJ.verbs||{})[S.tgt]||{});
      return {html:`<p class="tt-p">Je n'ai pas encore le verbe « ${esc(verb)} » en ${esc(tl())} hors ligne.</p>${V.length?`<p class="tt-p">Je connais : ${V.map(esc).join(", ")}.</p>${acts(V.slice(0,4).map(v=>["Conjuguer "+v,"Conjugue le verbe "+v]))}`:""}`}}
    T.fiches=T.fiches||[];
    return {html:`<span class="tt-h">${esc(c.inf)} · ${esc(tense.toLowerCase())}</span>${note?`<p class="tt-p">${esc(note)}</p>`:""}
      <table class="tt-tab">${c.forms.map((f,i)=>`<tr><td>${esc(c.pron[i]||"")}</td><td><b lang="${S.tgt}">${esc(f)}</b></td></tr>`).join("")}</table>
      ${c.note?`<p class="tt-p">${esc(c.note)}</p>`:""}${say(c.forms.map((f,i)=>(String(c.pron[i]||"").split(" /")[0])+" "+f).join(", "))}
      ${acts([["Au passé","Conjugue "+verb+" au passé"],["Un autre verbe","Conjugue le verbe "+pick(["avoir","aller","faire","parler"].filter(v=>v!==verb))],["M'interroger","Fais-moi un mini-test"]])}`}}

  const STOP=new Set("le la les l de des du d un une et en a au aux ce c est quoi explique expliquer moi m regle regles grammaire comment utiliser quand on dit pour avec sur difference entre peux tu me simple simplement utile debutant exemples exemple 3 trois fiche sur parle parler de la du les une qu que qui ou dans il elle je".split(" "));
  function grammar(t){
    const F=allFiches();if(!F.length)return {html:`<p class="tt-p">Je n'ai pas encore de fiches de grammaire en ${esc(tl())}. En attendant, je peux traduire, corriger et t'interroger sur le vocabulaire.</p>${acts([["Mini-test","Fais-moi un mini-test"]])}`};
    const kw=t.split(" ").filter(w=>w.length>2&&!STOP.has(w));
    let best=null,bs=0;
    if(kw.length)F.forEach(o=>{const title=norm(o.f.t+" "+(o.f.topic||"")),body=norm(o.f.e||"");let v=0;kw.forEach(w=>{if(title.includes(w))v+=3;else if(body.includes(w))v+=1});if(o.lv===S.level)v+=.2;if(v>bs){bs=v;best=o}});
    if(!best||bs<1){const here=F.filter(o=>o.lv===S.level);best=pick(here.length?here:F)}
    const f=best.f;T.fiches.push(f);const fi=T.fiches.length-1;
    const ex=(f.x||[]).slice(0,4).map(x=>{const [a,b]=String(x).split(" · ");return row(a,b||"")}).join("");
    return {html:`<span class="tt-h">${esc(f.t)} <small style="opacity:.7">(${esc(best.lv)})</small></span><p class="tt-p">${esc(f.e)}</p>${ex}
      <div class="tt-act"><button class="chip" data-tfiche="${fi}">Voir la fiche et son quiz</button><button class="chip" data-prompt="Explique-moi une autre règle de grammaire">Une autre règle</button></div>`}}

  function startQuiz(){
    const ps=shuffle(levelPairs().filter(x=>x.t.length<40));if(ps.length<3)return {text:`Je n'ai pas encore assez de vocabulaire en ${tl()} pour un test. Ouvre d'abord une liste de mots.`};
    T.mode="quiz";T.list=ps.slice(0,5);T.i=0;T.score=0;
    return {html:`<span class="tt-h">Mini-test : 5 questions (niveau ${esc(S.level)}).</span><p class="tt-p">Écris ta réponse en ${esc(tl())}${isLatin(T.list[0].t)?"":" (l'écriture latine est acceptée)"}. Tape « stop » pour arrêter.</p>`+askQuiz()}}
  function askQuiz(){const x=T.list[T.i];return `<p class="tt-p"><b>${T.i+1}/5</b> · Comment dit-on « ${esc(x.s)} » ?</p>`}
  function checkAnswer(ans,x){const v=Math.max(sim(ans,x.t),x.p?sim(ans,x.p):0,...String(x.t).split(/\s*[\/;]\s*/).map(z=>sim(ans,z)));return v>=.86?"ok":v>=.6?"close":"no"}
  function quizTurn(ans){const x=T.list[T.i];const r=checkAnswer(ans,x);let h="";
    if(r==="ok"){T.score++;h=`<span class="tt-ok">${typeof mqHTML==="function"?(c=>{mqSpeak(c,300);return mqHTML(c)})(mqPick(QUIPS.good)):pick(QUIPS.good)}</span>`+row(x.t,x.s,x.p);try{addXP(2);day().xp+=2;save()}catch(e){}}
    else if(r==="close"){h=`<span class="tt-ok">Presque !</span> Attention à l'orthographe :`+row(x.t,x.s,x.p)}
    else h=`<span class="tt-no">Pas tout à fait.</span> La bonne réponse :`+row(x.t,x.s,x.p);
    T.i++;
    if(T.i>=T.list.length){T.mode=null;const n=T.score;return {html:h+`<span class="tt-h">Résultat : ${n}/5 ${n===5?"🏆":n>=3?"👏":"💪"}</span><p class="tt-p">${n===5?"Parfait, le château est fier de toi !":n>=3?"Bien joué ! Encore un petit effort.":"On continue à s'entraîner, tu vas progresser."}</p>`+acts([["Rejouer","Fais-moi un mini-test"],["Expliquer une règle","Explique-moi une règle de grammaire"]])}}
    return {html:h+askQuiz()}}

  const SIT=[["cafe","Au café",["cafe","boisson","bar","commander"]],["restaurant","Au restaurant",["restaurant","repas","cuisine","commander"]],["foot","Football",["foot","football","match","stade","sport"]],
    ["hotel","À l'hôtel",["hotel","logement","voyage"]],["gare","À la gare",["gare","train","transport","voyage"]],["aeroport","À l'aéroport",["aeroport","avion","voyage"]],
    ["courses","Faire les courses",["courses","magasin","marche","acheter","shopping"]],["medecin","Chez le médecin",["medecin","sante","corps","pharmacie"]],["travail","Au travail",["travail","bureau","metier"]],["famille","La famille",["famille"]]];
  function startSituation(t){
    let sit=SIT.find(([k])=>t.includes(k))||SIT[0];const [,label,keys]=sit;
    const sets=SETS.filter(s=>keys.some(k=>norm(s.n+" "+(s.d||"")).includes(k)));
    let items=[];sets.forEach(s=>{let d=null;try{d=setData(s.id)}catch(e){}(d||[]).forEach(x=>x&&x.s&&x.t&&items.push(x))});
    items=items.filter(x=>norm(x.t).split(" ").length>=3);
    if(items.length<3)items=levelPairs().filter(x=>norm(x.t).split(" ").length>=3);
    if(items.length<3)return {text:`Je n'ai pas encore de phrases pour cette situation en ${tl()}.`};
    T.mode="sit";T.list=shuffle(items).slice(0,5);T.i=0;T.score=0;T.label=label;
    const first=T.list[0];
    return {html:`<span class="tt-h">🎭 ${esc(label)}</span><p class="tt-p">On joue la scène ! Je te dis ce que tu veux exprimer, et tu le dis en ${esc(tl())}. Tape « stop » pour arrêter.</p>`+askSit()}}
  function askSit(){const x=T.list[T.i];return `<p class="tt-p"><b>${T.i+1}/${T.list.length}</b> · Tu veux dire : « ${esc(x.s)} »</p>`}
  function sitTurn(ans){const x=T.list[T.i];const r=checkAnswer(ans,x);let h="";
    if(r==="ok"){T.score++;h=`<span class="tt-ok">${typeof mqHTML==="function"?(c=>{mqSpeak(c,300);return mqHTML(c)})(mqPick(QUIPS.good)):pick(QUIPS.good)}</span> Un natif dirait exactement ça :`+row(x.t,x.s,x.p);try{addXP(2);day().xp+=2;save()}catch(e){}}
    else if(r==="close")h=`<span class="tt-ok">Je t'ai compris !</span> Version exacte :`+row(x.t,x.s,x.p);
    else h=`<span class="tt-no">Pas tout à fait.</span> On dirait plutôt :`+row(x.t,x.s,x.p);
    T.i++;
    if(T.i>=T.list.length){T.mode=null;return {html:h+`<span class="tt-h">Fin de la scène : ${T.score}/${T.list.length} phrases parfaites.</span>`+acts([["Rejouer la scène","Simule "+norm(T.label)],["Autre situation","Simule "+pick(SIT).at(1).toLowerCase()],["Mini-test","Fais-moi un mini-test"]])}}
    return {html:h+askSit()}}

  function correct(txt){
    txt=txt.trim();if(!txt)return {text:`Écris la phrase en ${tl()} après « Corrige : » et je la vérifie.`};
    const ps=pairs();let best=null,bs=0;ps.forEach(x=>{const v=sim(txt,x.t);if(v>bs){bs=v;best=x}});
    if(best&&bs>=.999)return {html:`<span class="tt-ok">Parfait, c'est correct !</span>`+row(best.t,"= "+best.s,best.p)};
    if(best&&bs>=.8){const want=best.t.split(/\s+/),got=new Set(norm(txt).split(" "));
      const marked=want.map(w=>got.has(norm(w))?esc(w):`<span class="tt-fix">${esc(w)}</span>`).join(" ");
      return {html:`<span class="tt-ok">Presque !</span><p class="tt-p">La phrase correcte (les corrections sont surlignées) :</p><div class="tt-row"><div class="tt-t"><b lang="${S.tgt}">${marked}</b><small>= ${esc(best.s)}</small></div>${say(best.t)}</div>${acts([["Encore une phrase","Corrige : "]])}`}}
    // vérification mot par mot
    const W=wordSets().t,ws=norm(txt).split(" ").filter(Boolean);const unk=ws.filter(w=>!W.has(w)&&!/^\d+$/.test(w));
    const sugg=unk.slice(0,4).map(w=>{let b=null,d=9;W.forEach(v=>{if(Math.abs(v.length-w.length)>2)return;const x=dist(v,w);if(x<d){d=x;b=v}});return d<=2&&b?[w,b]:null}).filter(Boolean);
    const big=ws.filter(w=>w.length>=4);const near=ps.map(x=>{const a=new Set(norm(x.t).split(" "));return [big.filter(w=>a.has(w)).length,x]}).filter(z=>z[0]>=Math.max(1,Math.ceil(big.length*.6))&&z[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,2);
    let h="";
    if(!unk.length)h+=`<span class="tt-ok">Je reconnais tous les mots 👍</span><p class="tt-p">Je ne connais pas cette phrase exacte, mais le vocabulaire est bon.</p>`;
    else h+=`<p class="tt-p">Je ne connais pas encore : ${unk.slice(0,5).map(w=>`<b>${esc(w)}</b>`).join(", ")}. Vérifie l'orthographe.</p>`+(sugg.length?`<p class="tt-p">Mot proche dans mes listes : ${sugg.map(([a,b])=>`${esc(a)} → <b>${esc(b)}</b> ?`).join(", ")}</p>`:"");
    if(near.length)h+=`<p class="tt-p">Des phrases proches que je connais :</p>`+near.map(([,x])=>row(x.t,x.s,x.p)).join("");
    return {html:h}}

  function looksTarget(t){const {t:W,s:Sw}=wordSets();const ws=t.split(" ").filter(w=>w.length>1);if(!ws.length)return false;
    if(!isLatin(t))return true;let a=0,b=0;ws.forEach(w=>{if(W.has(w))a++;if(Sw.has(w))b++});return a>b&&a>=Math.ceil(ws.length/2)}

  function reply(raw){
    const t=norm(raw);
    if(T.mode&&/^(stop|arrete|arreter|fin|termine|quitter|annule)$/.test(t)){const m=T.mode;T.mode=null;return {text:m==="quiz"?`Test arrêté (${T.score} bonne(s) réponse(s)). On fait autre chose ?`:"Scène terminée. On fait autre chose ?"}}
    if(T.mode==="quiz"&&!/^(corrige|conjug|explique|traduis|comment dit)/.test(t))return quizTurn(raw);
    if(T.mode==="sit"&&!/^(corrige|conjug|explique|traduis|comment dit|simule)/.test(t))return sitTurn(raw);
    T.mode=null;
    if(/^(bonjour|salut|coucou|hello|hi|hey|ciao|hola|bonsoir|ola|hallo|hoi|salam|yo)( .{0,20})?$/.test(t))return help(true);
    if(/(aide|help|que (peux|sais) tu|tu (peux|sais) faire|comment ca marche|que fais tu)/.test(t))return help(false);
    if(/^corrige/.test(t)){const m=raw.replace(/^[^:]*:\s*/,"");return correct(m===raw?raw.replace(/^\s*corrige[a-z]*( moi)?( cette phrase)?( et explique mes erreurs)?\s*/i,""):m)}
    if(/conjug/.test(t))return conjugate(t);
    if(/(mini test|quiz|teste moi|interroge|questionne|fais moi un test|test de vocabulaire|revision)/.test(t))return startQuiz();
    if(/(simul|situation|jeu de role|joue(ons)? une scene|parlons|dialogue|conversation)/.test(t)||/^(au |a l )?(cafe|restaurant|hotel|gare|aeroport)$/.test(t))return startSituation(t);
    if(/(explique|regle|grammaire|difference entre|quand (utiliser|employer)|c est quoi (le|la|les) )/.test(t))return grammar(t);
    const tr=raw.match(/(?:comment (?:est-ce qu'?|est ce qu'?)?(?:on )?(?:dit|dire|dis|se dit)(?:-on| on)?|tradui[a-z]*(?: moi)?|traduction de|que veut dire|qu'est-ce que veut dire|que signifie|ça veut dire quoi|c'est quoi)\s*:?\s*(.*)$/i);
    if(tr){let q=tr[1].replace(new RegExp("\\s+(en|in)\\s+"+L[S.tgt].n+"\\s*\\??$","i"),"").replace(/\s+(en|in)\s+[a-zéèû]+\s*\??$/i,"").replace(/\s*(s'il te pla[iî]t|stp|svp)\s*/i," ");return translate(q)}
    if(looksTarget(t))return correct(raw);
    const idx=(()=>{try{return dictIndex(S.src,S.tgt)}catch(e){return []}})();
    if(t.split(" ").length<=4&&dictSearch(idx,raw).some(e=>norm(e.a)===t||norm(e.b)===t))return translate(raw);
    return null}

  /* ---------- rendu ---------- */
  const prevView=teacherView;
  teacherView=function(){
    let html=prevView.apply(this,arguments);
    const msgs=chat.length?chat.map(m=>m.role==="user"?`<div class="msg me">${esc(m.content)}</div>`:`<div class="msg-ai">${mascot()}<div class="msg ai${m.html?" rich":""}">${m.html||esc(m.content)||'<span class="spinner" style="display:inline-block"></span>'}</div></div>`).join("")
      :`<div class="empty">${mascot()}<p>Écris en ${esc(sl())} ou en ${esc(tl())} : je traduis, je corrige, j'explique la grammaire, je conjugue et je te fais pratiquer. Ça marche aussi sans connexion !</p></div>`;
    const a=html.indexOf('<div class="chat" id="chat">'),b=html.indexOf('<div class="chips">',a);
    if(a>=0&&b>a)html=html.slice(0,a)+`<div class="chat" id="chat">${msgs}</div>\n    `+html.slice(b);
    html=html.replace(/<p class="note-box bad">[^<]*<\/p>/,"").replace(/<span class="eyebrow">[^<]*<\/span><h1>Professeur<\/h1>/,`<span class="eyebrow">Ton professeur particulier</span><h1>Professeur</h1><span class="tutor-badge"><i></i> Disponible hors ligne</span>`);
    const chips=`<div class="chips">
      <button class="chip" data-prompt="Comment dit-on : ">Traduire</button>
      <button class="chip" data-prompt="Corrige : ">Corriger une phrase</button>
      <button class="chip" data-prompt="Explique-moi une règle de grammaire">Expliquer une règle</button>
      <button class="chip" data-prompt="Conjugue le verbe être">Conjugaison</button>
      <button class="chip" data-prompt="Fais-moi un mini-test">Mini-test</button>
      <button class="chip" data-prompt="Simule une conversation au café">Simuler un café</button>
      <button class="chip" data-prompt="Simule une conversation sur le football">Parler foot</button>
    </div>`;
    html=html.replace(/<div class="chips">[\s\S]*?<\/div>\s*<form class="composer"/,chips+`\n    <form class="composer"`);
    html=html.replace(/(<textarea id="chatInput"[^>]*?)\sdisabled>/,"$1>").replace(/<button class="btn" type="submit" disabled>/,`<button class="btn" type="submit" ${chatBusy?"disabled":""}>`);
    return html};

  function post(r){chat.push({role:"assistant",content:r.text||String(r.html||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(),html:r.html||""});
    render();setTimeout(()=>{const c=document.querySelector("#chat");if(c)c.scrollTop=1e9},30)}

  document.addEventListener("submit",async e=>{
    if(!e.target||e.target.id!=="composer")return;e.preventDefault();e.stopImmediatePropagation();
    const i=document.querySelector("#chatInput"),txt=(i&&i.value||"").trim();if(!txt||chatBusy)return;
    chat.push({role:"user",content:txt});
    let r=null;try{r=reply(txt)}catch(err){console.error(err);r=null}
    if(r){post(r);return}
    // Question libre : réponse enrichie si un service en ligne est disponible, sinon aide hors ligne.
    let s=null;try{s=sample||(typeof getSample==="function"?await getSample():null)}catch(err){s=null}
    if(!s){post({html:`<p class="tt-p">Je n'ai pas bien compris ta demande. Hors ligne, je peux :</p>`+help(false).html.replace(/^<span class="tt-h">[^<]*<\/span>/,"")});return}
    chat.push({role:"assistant",content:""});chatBusy=true;render();
    const sys=`Tu es le château, la mascotte et le professeur de langues de l'application Castellum Lingua. L'élève parle ${L[S.src].n} et apprend ${L[S.tgt].n}, niveau CECRL ${S.level}. Réponds surtout en ${L[S.src].n}, avec les exemples en ${L[S.tgt].n}. Corrige avec bienveillance, sois concis (moins de 120 mots), sans markdown, et termine par une petite question.`;
    const turns=chat.slice(0,-1).filter(m=>m.content).map((m,ix)=>({role:m.role,content:ix===0?sys+"\n\nMessage de l'élève : "+m.content:m.content}));
    try{const res=await s(turns,{cache:false,onText:({text})=>{chat[chat.length-1].content=text;const b=document.querySelector("#chat .msg-ai:last-child .msg");if(b&&view==="teacher")b.textContent=text}});chat[chat.length-1].content=res.text||"…";try{addXP(2);day().xp+=2;save()}catch(e){}}
    catch(err){chat.pop();chatBusy=false;post({html:`<p class="tt-p">Je n'ai pas bien compris ta demande. Voici ce que je sais faire :</p>`+help(false).html.replace(/^<span class="tt-h">[^<]*<\/span>/,"")});return}
    chatBusy=false;if(view==="teacher")render();
  },true);

  document.addEventListener("click",e=>{
    const f=e.target.closest&&e.target.closest("[data-tfiche]");
    if(f){e.preventDefault();e.stopImmediatePropagation();const fi=T.fiches[+f.dataset.tfiche];if(fi)openFiche(fi);return}
    const g=e.target.closest&&e.target.closest('[data-prompt^="__go:"]');
    if(g){e.preventDefault();e.stopImmediatePropagation();go(g.dataset.prompt.slice(5));return}
    const c=e.target.closest&&e.target.closest('[data-act="clearchat"]');if(c){T.mode=null;T.fiches=[]}
  },true);
  // Le premier message s'affiche tout de suite, même sans connexion.
  window.CastellumTutorReply=reply;
})();
