/* Étape 5 : leçons plus engageantes.
   - Un personnage récurrent par langue et une mini-histoire (scène d'ouverture de chaque leçon).
   - Variété : jamais trois exercices du même type d'affilée.
   - Plus de production : des QCM deviennent des phrases à construire ou à écrire.
   - Un « pourquoi ? » sous chaque erreur.
   - « Ce que tu sais faire maintenant » en fin de leçon.
   - Fin d'unité : mission de 3 échanges avec le professeur IA. */
(function(){
  if(typeof buildLesson!=='function'||typeof stepHTML!=='function'||typeof renderFoot!=='function'||typeof finish!=='function')return;
  const CHAR={it:['Giulia','👩🏻'],es:['Lucía','👩🏽'],fr:['Camille','🧑🏼'],pt:['Inês','👩🏻‍🦰'],en:['Oliver','🧑🏻‍🦰'],de:['Lena','👱🏼‍♀️'],nl:['Sem','🧑🏼'],ary:['Yassine','🧔🏽'],la:['Marcus','🧔🏻'],grc:['Sophia','👩🏻']};
  const who=()=>CHAR[S.tgt]||['Alex','🧑'];
  const city=()=>{try{return CITY[S.tgt]?tr(CITY[S.tgt]):''}catch(e){return ''}};
  const E=s=>typeof esc==='function'?esc(s):String(s);
  const STORY={0:'Une nouvelle aventure commence. Apprends les premiers mots pour suivre la conversation.',1:"L'aventure continue : de nouveaux mots t'attendent.",2:'Dernière leçon avant le défi du château. Montre ce que tu as retenu !',3:'Le défi du château : tout ce que tu as appris dans cette unité.',4:'Tends l\'oreille : écoute les habitants de la ville.',5:'À toi de parler : les habitants veulent t\'entendre.',6:'Une vraie situation : réponds comme si tu y étais.'};
  const CAN={0:'Comprendre et utiliser ces mots :',1:'Comprendre et utiliser ces mots :',2:'Comprendre et utiliser ces mots :',3:'Tu as terminé toute l\'unité. Tu sais maintenant utiliser :',4:'Reconnaître à l\'oral :',5:'Prononcer :',6:'Te débrouiller dans cette situation avec :'};
  const graded=k=>!['intro','scene'].includes(k);
  const PROD=new Set(['build','type','dictee','speak','gaptype','free']);

  /* Variété : on déplace un exercice quand trois du même type se suivent (une présentation reste collée à son exercice). */
  function vary(steps,items){
    const blocks=[];for(let i=0;i<steps.length;i++){const s=steps[i];if(s.k==='intro'&&!s.scene&&steps[i+1]){blocks.push([s,steps[i+1]]);i++}else blocks.push([s])}
    const kind=b=>b[b.length-1].k;
    // 1) au fil de l'eau : après deux exercices identiques, on avance le prochain exercice d'un autre type
    const out=[],rest=blocks.slice();
    while(rest.length){let idx=0;const a=out.length?kind(out[out.length-1]):null,b=out.length>1?kind(out[out.length-2]):null;
      if(a&&a===b&&graded(a)&&kind(rest[0])===a){const j=rest.findIndex(x=>kind(x)!==a);if(j>=0)idx=j}
      out.push(rest.splice(idx,1)[0])}
    // 2) une série restée en fin de leçon : on replace le dernier bloc plus tôt, entre deux types différents
    for(let guard=0;guard<6;guard++){let bad=-1;for(let i=2;i<out.length;i++){const k=kind(out[i]);if(graded(k)&&kind(out[i-1])===k&&kind(out[i-2])===k){bad=i;break}}
      if(bad<0)break;const k=kind(out[bad]);let p=-1;
      for(let i=Math.max(1,Math.floor(out.length/3));i<out.length;i++){if(i===bad||i===bad+1)continue;const prev=out[i-1],next=out[i];if(prev&&next&&kind(prev)!==k&&kind(next)!==k&&!(i>=2&&kind(out[i-2])===k&&kind(prev)===k)){p=i;break}}
      if(p<0)break;const blk=out.splice(bad,1)[0];out.splice(p>bad?p-1:p,0,blk)}
    // 3) si une série résiste (peu de types possibles), l'exercice du milieu change de forme
    const flat=out.flat(),ALT={build:'type',type:'build',mc:'rev',rev:'mc',listen:'mc',tf:'mc',gap:'mc',dictee:'type'};
    for(let i=2;i<flat.length;i++){const k=flat[i].k;if(!graded(k)||flat[i-1].k!==k||flat[i-2].k!==k)continue;const mid=flat[i-1];if(!mid.it||mid.alpha)continue;
      let alt=ALT[k];if(alt==='type'&&!((typeof isLatin==='function'&&isLatin(mid.it.t))||mid.it.p))alt='rev';if(alt==='build'&&mid.it.t.split(/\s+/).length<2)alt='rev';
      if(!alt)continue;try{const x=makeStep(alt,mid.it,items&&items.length?items:[mid.it]);if(x&&x.k!==k){x.retry=mid.retry;flat[i-1]=x}}catch(e){}}
    return flat}
  /* Production : un exercice sur deux portant sur un mot déjà vu devient « construis » ou « écris ». */
  function produce(steps,items){
    const seen=new Set();let flip=0;
    const prodKind=it=>it.t.split(/\s+/).length>=2?'build':((typeof isLatin==='function'&&isLatin(it.t))||it.p?'type':null);
    for(let i=0;i<steps.length;i++){const s=steps[i];if(!s.it||s.alpha||s.scene)continue;const key=s.it.t;
      if((s.k==='mc'||s.k==='rev')&&seen.has(key)&&(flip++%2===0)){const k=prodKind(s.it);if(k){try{const n=makeStep(k,s.it,items);if(n&&n.k===k)steps[i]=n}catch(e){}}}
      if(graded(s.k))seen.add(key)}
    // au moins deux exercices de production par leçon
    let n=steps.filter(s=>PROD.has(s.k)).length;
    for(let i=steps.length-1;i>=0&&n<2;i--){const s=steps[i];if((s.k==='mc'||s.k==='rev'||s.k==='tf')&&s.it&&!s.alpha){const k=prodKind(s.it);if(k){try{const x=makeStep(k,s.it,items);if(x&&x.k===k){steps[i]=x;n++}}catch(e){}}}}
    return steps}

  const prevBuild=buildLesson;
  buildLesson=function(u,l,items){
    let steps=prevBuild.apply(this,arguments);
    try{
      if(!Array.isArray(steps)||!steps.length)return steps;
      if(l<3)steps=produce(steps,items);
      steps=vary(steps,items);
      const U=lvUnits()[u];
      /* Mot d'ouverture : il dépend de la leçon (avant, c'était toujours le 1er mot de l'unité) */
      const seen=new Set(),pool=[];steps.forEach(x=>{const it=x&&x.it;if(it&&it.t&&!x.alpha&&!seen.has(it.t)){seen.add(it.t);pool.push(it)}});
      if(!pool.length)(items||[]).forEach(x=>{if(x&&x.t&&!seen.has(x.t)){seen.add(x.t);pool.push(x)}});
      const ph=pool.filter(x=>/\s/.test(x.t.trim())&&!/^(l'|la |le |les |il |lo |el |los |las |o |a |os |as |the |der |die |das |de |het |un |una |une )\S+$/i.test(x.t.trim()));
      const cand=(ph.length?ph:pool),GK=S.tgt+':'+S.level+':'+u,GM=(window.__lsGreet=window.__lsGreet||{})[GK]=(window.__lsGreet[GK]||{});
      const used=new Set(Object.keys(GM).filter(k=>+k!==l).map(k=>GM[k])),ix=Math.max(0,LORDER.indexOf(l));
      let greet=null;if(l<3&&pool[0]&&!used.has(pool[0].t))greet=pool[0];
      if(!greet){const all=l<3?pool:cand.concat(pool.filter(x=>!cand.includes(x)));const st=(ix*2+u)%(all.length||1);
        for(let k=0;k<all.length&&!greet;k++){const x=all[(st+k)%all.length];if(!used.has(x.t))greet=x}if(!greet)greet=all[st]||null}
      if(greet)GM[l]=greet.t;
      if(greet)steps.unshift({k:'intro',scene:true,it:{t:greet.t,s:greet.s,p:greet.p||''},l,u,title:U?unitTitle(U):''});
    }catch(e){console.warn('lessons2',e)}
    return steps};

  const prevHTML=stepHTML;
  stepHTML=function(st){
    if(st&&st.scene){const [n,av]=who(),c=city(),hasV=typeof canSpeak==='function'&&canSpeak(S.tgt);
      return `<div class="ls-scene">
        <div class="ls-chap"><span class="ls-pin">📍</span><span>${E(c)}</span>${st.title?` · <b>${E(st.title)}</b>`:''}</div>
        <div class="ls-char"><span class="ls-av" aria-hidden="true">${av}</span><div class="ls-bubble"><b class="ls-name" data-noi18n>${E(n)}</b><div class="ls-say" lang="${S.tgt}" data-noi18n>${E(st.it.t)}${hasV?` <button class="mini-say" data-say="${E(st.it.t)}" aria-label="Écouter">🔊</button>`:''}</div>${st.it.p?`<small class="ls-p" data-noi18n>${E(st.it.p)}</small>`:''}<small class="ls-tr" data-noi18n>${E(st.it.s||'')}</small></div></div>
        <p class="ls-story">${STORY[st.l]||STORY[0]}</p>
        <div class="ls-goal">🎯 <span>Ta mission :</span> <b>${E(st.title||'')}</b></div></div>`}
    return prevHTML.apply(this,arguments)};

  /* « Pourquoi ? » sous chaque erreur */
  const findBy=(f,v)=>{const pool=(LX&&LX.items)||[];return pool.find(x=>x&&x[f]===v)};
  const q=(s,lang)=>`<span class="ls-w"${lang?` lang="${lang}"`:''} data-noi18n>« ${E(s)} »</span>`;
  function why(st){
    if(!st||st.duel)return '';
    if(st.why)return st.why;if(st.expl)return st.expl;
    const tg=S.tgt;let chosen=null;
    if(st.opts&&LX.sel!=null)chosen=st.opts[LX.sel];
    const it=st.it;
    switch(st.k){
      case 'mc':case 'listen':{if(!it)return '';let h=`${q(it.t,tg)} <span>veut dire</span> ${q(it.s)}.`;const o=chosen&&findBy('t',chosen);if(o&&o.t!==it.t)h+=` <span>Ta réponse</span> ${q(o.t,tg)} <span>veut dire</span> ${q(o.s)}.`;return h}
      case 'rev':{if(!it)return '';let h=`${q(it.t,tg)} <span>veut dire</span> ${q(it.s)}.`;const o=chosen&&findBy('s',chosen);if(o&&o.s!==it.s)h+=` ${q(o.s)} <span>se dirait</span> ${q(o.t,tg)}.`;return h}
      case 'tf':return it?`${q(it.t,tg)} <span>veut dire</span> ${q(it.s)}${st.shown&&st.shown!==it.s?` <span>et non</span> ${q(st.shown)}`:''}.`:'';
      case 'story':return it?`${q(it.t,tg)} = ${q(it.s)}`:'';
      case 'gap':{let h=`<span>Le mot qui manque est</span> ${q(st.ans,st.lang||tg)}.`;if(st.full&&st.hint)h+=` ${q(st.full,tg)} = ${q(st.hint)}.`;else if(st.hint)h+=` <span>Indice :</span> <span data-noi18n>${E(st.hint)}</span>.`;const o=chosen&&findBy('t',chosen);if(o)h+=` ${q(o.t,tg)} <span>veut dire</span> ${q(o.s)}.`;return h}
      case 'build':{if(!it)return '';const mine=(st.built||[]).map(ix=>st.bank[ix]),want=it.t.split(/\s+/);
        const same=mine.length===want.length&&[...mine].map(norm).sort().join(' ')===[...want].map(norm).sort().join(' ');
        if(same)return `<span>Tu as tous les bons mots, mais pas dans le bon ordre.</span> ${q(it.t,tg)}`;
        const miss=want.filter(w=>!mine.map(norm).includes(norm(w))),extra=mine.filter(w=>!want.map(norm).includes(norm(w)));
        let h='';if(miss.length)h+=`<span>Il manque :</span> ${miss.map(w=>q(w,tg)).join(' ')}. `;if(extra.length)h+=`<span>En trop :</span> ${extra.map(w=>q(w,tg)).join(' ')}.`;return h||`${q(it.t,tg)} = ${q(it.s)}`}
      case 'type':case 'dictee':case 'gaptype':{const v=(document.getElementById('typeIn')||{}).value||'';const a=String(st.ans!=null?st.ans:(it&&it.t)||'').replace(/\(.*?\)/g,'').trim();
        if(!v.trim())return `${q(a,tg)}${it&&it.s&&st.k!=='gaptype'?` = ${q(it.s)}`:''}`;
        let d=99;try{d=lev(norm(v),norm(a))}catch(e){}
        if(d<=3)return `<span>Tu y étais presque : seulement</span> <b>${d}</b> <span>${d>1?'lettres à corriger':'lettre à corriger'}</span>. ${st.hint&&st.k==='gaptype'?`<span data-noi18n>(${E(st.hint)})</span>`:''}`;
        return `<span>Relis la bonne réponse et répète-la à voix haute :</span> ${q(a,tg)}`}
      case 'dialogue':return st.a&&st.a.t?`<span>La réplique qui convient :</span> ${q(st.a.t,tg)}${st.a.s?` = ${q(st.a.s)}`:''}`:'';
    }
    return ''}
  const prevFoot=renderFoot;
  renderFoot=function(extra){
    prevFoot.apply(this,arguments);
    try{if(!LX||LX.state!=='bad'||LX.game==='chrono')return;const st=LX.steps[LX.i];const h=why(st);if(!h)return;
      const box=document.querySelector('#lxFoot .foot-msg > div');if(!box||box.querySelector('.ls-why'))return;
      box.insertAdjacentHTML('beforeend',`<small class="ls-why">💡 <strong class="ls-why-t">Pourquoi ?</strong> ${h}</small>`)}catch(e){}};

  /* Fin de leçon : ce que tu sais faire + mission IA en fin d'unité */
  const prevFinish=finish;
  finish=function(){
    const info=LX?{mode:LX.mode,l:LX.l,u:LX.u,items:LX.items||[],steps:LX.steps||[],sp:LX.special,cp:LX.checkpoint,duel:LX.duel}:null;
    const r=prevFinish.apply(this,arguments);
    try{if(!info||info.mode!=='lesson'||info.duel||info.cp||info.sp)return r;
      const body=document.querySelector('#lxBody .done-screen');if(!body||body.querySelector('.ls-can'))return r;
      const fpI=freshPer(info.items.length);let its=info.l<3?info.items.slice(info.l*fpI,info.l*fpI+fpI):[];
      if(!its.length){const m=new Map();info.steps.forEach(s=>{if(s.it&&s.it.t&&!s.scene&&!m.has(s.it.t))m.set(s.it.t,s.it)});its=[...m.values()].slice(0,5)}
      const [n,av]=who();
      const chips=its.filter(x=>x&&x.t).map(x=>`<span class="ls-chip"><b lang="${S.tgt}" data-noi18n>${E(x.t)}</b><small data-noi18n>${E(x.s||'')}</small></span>`).join('');
      let U=null;try{U=lvUnits()[info.u]}catch(e){}
      const missionBtn=info.l===3&&window.CastellumAIChat&&typeof window.CastellumAIChat.mission==='function'?`<button class="btn ls-mbtn" type="button" data-ls-mission>💬 <span>Mission finale : 3 échanges avec le professeur</span></button>`:'';
      body.insertAdjacentHTML('beforeend',`<div class="ls-can"><b>✅ <span>Ce que tu sais faire maintenant</span></b><p>${CAN[info.l]||CAN[0]}</p><div class="ls-chips">${chips}</div></div>
        <div class="ls-bye"><span class="ls-av">${av}</span><div class="ls-bubble"><b class="ls-name" data-noi18n>${E(n)}</b><span>${info.l===3?'Bravo ! Tu as terminé l\'unité. On continue l\'aventure ensemble ?':'Bravo ! À la prochaine leçon.'}</span></div></div>${missionBtn}`);
      if(missionBtn){const words=[...new Set(info.items.map(x=>x&&x.t).filter(Boolean))].slice(0,8),title=U?unitTitle(U):'';
        window.__lsMission={words,title}}
    }catch(e){console.warn('lessons2 finish',e)}
    return r};
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ls-mission]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    const m=window.__lsMission||{words:[],title:''};try{closeLx()}catch(err){}setTimeout(()=>{try{window.CastellumAIChat.mission(m.words,m.title)}catch(err){console.warn(err)}},60)},true);

  const css=document.createElement('style');css.id='castellum-lessons2-css';css.textContent=`
.ls-scene{display:grid;gap:16px;padding-top:6px}
.ls-chap{display:flex;align-items:center;gap:6px;flex-wrap:wrap;color:var(--ink-2);font-weight:800;font-size:.9rem}
.ls-chap b{color:var(--ink)}
.ls-char,.ls-bye{display:flex;align-items:flex-end;gap:10px}
.ls-av{font-size:3.4rem;line-height:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,.15))}
.ls-bubble{position:relative;flex:1;background:var(--surface);border:2px solid var(--line);border-radius:20px 20px 20px 6px;padding:12px 14px;display:grid;gap:3px;text-align:left}
.ls-name{color:var(--accent);font-size:.82rem;text-transform:uppercase;letter-spacing:.05em}
.ls-say{font-size:1.45rem;font-weight:900;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.ls-p,.ls-tr{color:var(--ink-2);font-weight:700}
.ls-story{margin:0;font-size:1.05rem;line-height:1.45}
.ls-goal{background:var(--accent-soft);border-radius:14px;padding:10px 12px;font-weight:800}
.ls-why{display:block;margin-top:6px;font-size:.86rem!important;font-weight:700;line-height:1.4;opacity:.95}.ls-why .ls-why-t{font-size:inherit!important;font-weight:900}
.ls-why .ls-w{font-weight:900}
.ls-can{margin-top:16px;text-align:left;background:var(--surface);border:2px solid var(--good);border-radius:18px;padding:12px 14px}
.ls-can p{margin:4px 0 8px;color:var(--ink-2);font-weight:700}
.ls-chips{display:flex;flex-wrap:wrap;gap:6px}
.ls-chip{display:grid;background:color-mix(in srgb,var(--good) 12%,var(--surface));border-radius:12px;padding:6px 10px}
.ls-chip small{color:var(--ink-2);font-size:.75rem}
.ls-bye{margin-top:14px}.ls-bye .ls-av{font-size:2.6rem}
.ls-mbtn{margin-top:14px;width:100%}
`;document.head.appendChild(css);
})();
