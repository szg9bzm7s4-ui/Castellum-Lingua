/* Interface allégée et progrès linguistiques concrets.
   - Trois actions principales : Continuer, Réviser, Pratiquer une conversation.
   - Une seule carte « Aujourd'hui » (objectif, série + bouclier, coffre, mot du jour) au lieu de quatre.
   - Outils secondaires regroupés (dictionnaire, grammaire, alphabets, listes, mots enregistrés…).
   - « Mes acquis » : ce que tu sais faire, avec le niveau de preuve
     (activité terminée → reconnu avec aide → produit seul → confirmé en révision). Les XP ne sont pas un niveau. */
(function(){
  if(typeof pathView!=='function'||typeof S==='undefined')return;
  const E=s=>typeof esc==='function'?esc(s):String(s);

  /* ---------- 1. Preuves d'apprentissage par élément ---------- */
  const REC=new Set(['mc','rev','listen','tf','gap','story','dialogue','match','card']),PROD=new Set(['type','build','dictee','speak','gaptype','free']);
  const ev=()=>{S.ev=S.ev||{};S.ev[S.tgt]=S.ev[S.tgt]||{};return S.ev[S.tgt]};
  // Migration douce : les anciennes réussites comptent comme « reconnu », les mots montés haut en révision comme « confirmé ».
  function migrate(){if(S.evMigrated&&S.evMigrated[S.tgt])return;S.evMigrated=S.evMigrated||{};const e=ev();
    try{Object.keys(S.known||{}).forEach(k=>{if(!k.startsWith(S.tgt+'|'))return;const t=k.slice(S.tgt.length+1);if(!t)return;const x=e[t]=e[t]||{};x.rec=Math.max(x.rec||0,1)})}catch(err){}
    try{(srsList()||[]).forEach(it=>{const x=e[it.t]=e[it.t]||{};if((it.b||0)>=3)x.conf=Math.max(x.conf||0,1)})}catch(err){}
    S.evMigrated[S.tgt]=1}
  if(typeof grade==='function'){const prevG=grade;grade=function(ok){const st=LX&&LX.steps&&LX.steps[LX.i];const r=prevG.apply(this,arguments);
    try{if(ok&&st&&st.it&&st.it.t&&!st.alpha){const e=ev(),x=e[st.it.t]=e[st.it.t]||{},now=Date.now();x.first=x.first||now;
      if(PROD.has(st.k))x.prod=(x.prod||0)+1;else if(REC.has(st.k))x.rec=(x.rec||0)+1;
      // confirmé : réussi en révision au moins deux jours après la première rencontre
      if(LX.game==='review'&&now-x.first>=2*864e5)x.conf=(x.conf||0)+1}}catch(err){}
    return r}}
  function levelOf(t){const x=ev()[t]||{};if(x.conf)return 4;if(x.prod)return 3;if(x.rec)return 2;return 0}

  /* ---------- 2. « Je sais… » ---------- */
  const IT_A1=[
    {u:0,can:'Je sais saluer et prendre congé',keys:['Buongiorno','Ciao','Buonasera','Arrivederci']},
    {u:1,can:'Je sais me présenter',keys:['Mi chiamo Marco','Come ti chiami?','Piacere','Di dove sei?']},
    {sx:'it-napoli-bar',can:'Je sais commander une boisson',keys:['Un caffè, per favore.','Quant\'è?','Grazie, arrivederci!']},
    {u:2,can:'Je sais compter jusqu\'à dix',keys:['uno','tre','cinque','dieci']},
    {u:3,can:'Je sais parler de ma famille',keys:['mia madre','mio padre','i miei genitori','Ho due fratelli']}];
  function cando(){const out=[];let units=[];try{units=lvUnits()}catch(err){}
    const doneUnit=u=>{try{return [0,1,2,3,4,5,6].some(l=>S.done[nodeKey(u,l)])}catch(err){return false}};
    const spec=(S.tgt==='it'&&S.src==='fr'&&S.level==='A1')?IT_A1:units.slice(0,8).map((U,u)=>({u,can:'« '+(typeof unitTitle==='function'?unitTitle(U):U.n)+' »',keys:((typeof setData==='function'&&setData(U.id))||[]).slice(0,4).map(x=>x.t)}));
    spec.forEach(c=>{const started=c.sx?!!(S.cando&&S.cando[S.tgt+':'+c.sx]):doneUnit(c.u)||c.keys.some(k=>levelOf(k)>0);if(!started)return;
      const lv=c.keys.map(levelOf),n=lv.length||1,at=l=>lv.filter(x=>x>=l).length/n;
      const level=at(4)>=.5?4:at(3)>=.5?3:at(2)>=.5?2:1;out.push({can:c.can,keys:c.keys,level})});
    const sx=S.cando&&S.cando[S.tgt+':it-napoli-bar'];
    if(S.tgt==='it'&&sx&&sx.comp)out.push({can:'Je comprends ce dialogue sans traduction',keys:['Au bar, à Naples'],level:sx.noTr?3:2,note:sx.noTr?'':'avec la traduction affichée'});
    const kept=Object.entries(ev()).filter(([t,x])=>x.conf).map(([t])=>t);
    if(kept.length)out.push({can:'Je retiens ces expressions après plusieurs jours',keys:kept.slice(0,6),level:4,count:kept.length});
    return out}
  const LVL=[['','À découvrir'],['📘','Activité terminée'],['👀','Reconnu avec aide'],['✍️','Produit seul'],['🔁','Confirmé en révision']];
  function acquisHTML(){migrate();const list=cando(),e=ev(),vals=Object.values(e);
    const n2=vals.filter(x=>x.rec||x.prod||x.conf).length,n3=vals.filter(x=>x.prod).length,n4=vals.filter(x=>x.conf).length;
    let acts=0;try{acts=Object.keys(S.done||{}).filter(k=>k.startsWith(S.tgt+':')).length+Object.values(S.cando||{}).length}catch(err){}
    return `<section class="u2-acq"><div class="section-head"><div><span class="eyebrow">Mes acquis en ${E(((L[S.tgt]||{}).n||'').toLowerCase())}</span><h2>Ce que je sais faire</h2></div></div>
      <div class="u2-proof">
        <div><b>${acts}</b><small>📘 activités terminées</small></div>
        <div><b>${n2}</b><small>👀 éléments reconnus</small></div>
        <div><b>${n3}</b><small>✍️ produits seul</small></div>
        <div><b>${n4}</b><small>🔁 confirmés en révision</small></div></div>
      ${list.length?`<ul class="u2-can">${list.map(c=>`<li class="lv${c.level}"><span class="u2-badge" aria-hidden="true">${LVL[c.level][0]}</span><div><b>${E(c.can)}</b><small class="u2-lv">${LVL[c.level][1]}${c.note?` · <span>${E(c.note)}</span>`:''}${c.count?` · ${c.count} <span>expressions</span>`:''}</small><small class="u2-keys" lang="${S.tgt}" data-noi18n>${c.keys.map(E).join(' · ')}</small></div></li>`).join('')}</ul>`
        :`<p class="muted">Termine ta première activité pour voir ici ce que tu sais faire.</p>`}
      <p class="u2-legend">📘 <span>activité terminée</span> → 👀 <span>reconnu avec aide (choix multiple)</span> → ✍️ <span>produit seul (écrit ou dit sans choix)</span> → 🔁 <span>confirmé en révision, plusieurs jours après</span>. <span>Les XP mesurent ton activité, pas ton niveau.</span></p></section>`}
  if(typeof profileView==='function'){const prevP=profileView;profileView=function(){const h=prevP.apply(this,arguments);try{return acquisHTML()+h}catch(err){console.warn('acquis',err);return h}}}
  window.CastellumAcquis={cando,levelOf,acquisHTML};

  /* ---------- 3. Barre du haut : moins de compteurs, rien seulement au survol ---------- */
  if(typeof statsChips==='function'){const prevC=statsChips;statsChips=function(){let h=prevC.apply(this,arguments);
    h=h.replace(/<span class="stat-chip c-xp"[^>]*>[\s\S]*?<\/span>/,'');
    h=h.replace('<button class="stat-chip" data-go="langs" title="Changer de langue">',`<button class="stat-chip" data-go="langs" title="Changer de langue" aria-label="Changer de langue (${E((L[S.tgt]||{}).n||'')})">`);
    h=h.replace(/<span class="stat-chip c-heart" title="([^"]*)">([\s\S]*?)<\/span>/,(m,t,inner)=>`<span class="stat-chip c-heart" title="${t}" aria-label="${S.hearts} cœurs sur 5. ${t}">${inner}${S.hearts<5?`<small class="u2-hmin">${typeof nextHeartMin==='function'?nextHeartMin():''} min</small>`:''}</span>`);
    return h}}

  /* ---------- 4. Navigation : Apprendre · Pratiquer · Château · Progrès · Outils ---------- */
  try{const lab={play:'Pratiquer',profile:'Progrès'};NAV_BASE.forEach(n=>{if(lab[n[0]])n[1]=lab[n[0]]});
    const order=['learn','play','castle','profile'];const first=order.map(k=>NAV_BASE.find(n=>n[0]===k)).filter(Boolean);const rest=NAV_BASE.filter(n=>!order.includes(n[0]));
    NAV_BASE.length=0;NAV_BASE.push(...first,...rest);
    NAV_SET=function(){NAV.length=0;NAV.push(...NAV_BASE.slice(0,4));if(Cloud.signedIn)NAV.push(['home','Accueil'],['friends','Amis'],['account','Profil']);else if(Cloud.enabled)NAV.push(['account','Se connecter']);NAV.push(...NAV_BASE.slice(4))};NAV_SET()}catch(err){console.warn('nav',err)}
  if(typeof navHTML==='function'){const prevN=navHTML;navHTML=function(m){let h=prevN.apply(this,arguments);if(m)h=h.replace('aria-label="Plus">','aria-label="Outils">').replace('<span>Plus</span>','<span>Outils</span>');return h}}
  const TOOLS=[['Outils de langue',[['dict','📖','Dictionnaire'],['grammar','📐','Grammaire'],['alpha','🔤','Alphabets'],['lists','📋','Listes de vocabulaire'],['words','⭐','Mots enregistrés'],['errors','🩹','Mes erreurs'],['teacher','🎓','Professeur']]],
    ['Mon compte',[['langs','🌍','Changer de langue'],['friends','👥','Amis'],['home','🏠','Accueil'],['account','👤','Compte']]]];
  function tools(){const signed=typeof Cloud!=='undefined'&&Cloud.signedIn;
    openSheet(`<div class="u2-tools"><div class="section-head"><h2>Outils</h2><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
      ${TOOLS.map(([t,items])=>`<h3>${t}</h3><div class="u2-tgrid">${items.filter(([k])=>signed||!['friends','home'].includes(k)).map(([k,ic,n])=>`<button type="button" class="u2-tool" ${k==='errors'?'data-act="errors"':`data-go="${k}"`}><span aria-hidden="true">${ic}</span><b>${k==='account'&&!signed?'Se connecter':n}</b></button>`).join('')}</div>`).join('')}
      <button type="button" class="u2-tool wide" data-st="method"><span aria-hidden="true">❓</span><b>Comment ça marche ?</b></button></div>`)}
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sx-start]');if(!b||!window.CastellumSituations)return;e.preventDefault();e.stopImmediatePropagation();try{closeSheet()}catch(err){}window.CastellumSituations.start(window.CastellumSituations.list[+b.dataset.sxStart||0])},true);
  if(typeof playView==='function'){const prevPlay=playView;playView=function(){const h=prevPlay.apply(this,arguments);const SX=window.CastellumSituations;if(!SX)return h;
    const list=SX.list.filter(x=>x.tgt===S.tgt&&x.src===S.src);if(!list.length)return h;
    return `<section class="u2-sxlist"><h2>☕ <span>Situations de la vie réelle</span></h2>${list.map((x,i)=>{const done=S.cando&&S.cando[x.tgt+':'+x.id];return `<button type="button" class="u2-sx" data-sx-start="${SX.list.indexOf(x)}"><span aria-hidden="true">${x.ic}</span><span><b>${E(x.title)}</b><small>${E(x.sub)} · ${E(x.lv)}${done?' · ✓':''}</small></span><span class="u2-go" aria-hidden="true">→</span></button>`}).join('')}</section>`+h}}
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act="more"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();tools()},true);

  /* ---------- 5. Écran Apprendre : une action principale, deux secondaires, une carte du jour ---------- */
  const prevPV=pathView;
  pathView=function(){let html=prevPV.apply(this,arguments);
    try{if(typeof view!=='undefined'&&view!=='learn')return html;if(typeof html!=='string'||!html.includes('learn3'))return html;
      const tpl=document.createElement('template');tpl.innerHTML=html;const R=tpl.content,Q=s=>R.querySelector(s);
      const stats=Q('.l3-stats'),today=Q('.rt-today'),quick=Q('.l3-quick'),week=Q('.rt-week'),hearts=Q('.rt-hearts'),cont=Q('.l3-continue');
      // Réviser + Conversation
      let due=0;try{due=dueItems().length}catch(err){}
      const sec=document.createElement('div');sec.className='u2-sec';
      sec.innerHTML=`<button type="button" class="u2-act" data-act="review"><span aria-hidden="true">🔁</span><span><b>Réviser</b><small>${due?`${due} <span>${due>1?'éléments à revoir':'élément à revoir'}</span>`:'<span>Rien d\'urgent</span>'}</small></span></button>
        <button type="button" class="u2-act" data-aichat="1"><span aria-hidden="true">💬</span><span><b>Pratiquer une conversation</b><small>Avec le professeur IA (en ligne)</small></span></button>`;
      // Carte « Aujourd'hui »
      const d=typeof day==='function'?day():{xp:0},goal=S.goal||20,pct=Math.min(100,Math.round((d.xp||0)/goal*100));let st=0;try{st=streak()}catch(err){}
      const r=S.ret||{},opened=r.chest&&r.chest[dk(new Date())],can=(d.xp||0)>0;
      const card=document.createElement('section');card.className='u2-today';card.setAttribute('aria-label','Aujourd\'hui');
      card.innerHTML=`<div class="u2-goal"><div class="l3-ring" style="--p:${pct}" aria-hidden="true"><span>${pct}%</span></div><div><b><span>Objectif du jour</span></b><small><span>${d.xp||0}</span> / <span>${goal}</span> XP</small></div></div>
        <button type="button" class="u2-chip" data-streak-info aria-label="Série de ${st} jours, ${S.shields||0} bouclier(s)"><span aria-hidden="true">🔥</span> ${st} <span>j</span>${(S.shields||0)>0?` <span aria-hidden="true">🛡️</span>${S.shields}`:''}</button>
        <button type="button" class="u2-chip${opened?' off':can?' hot':''}" data-rt="chest" aria-label="Coffre du jour"><span aria-hidden="true">${opened?'📦':'🎁'}</span></button>
        <button type="button" class="u2-chip" data-rt="word" aria-label="Mot du jour"><span aria-hidden="true">📖</span></button>`;
      if(stats)stats.replaceWith(card);else if(cont)cont.after(card);
      if(today)today.remove();
      if(quick)quick.remove();
      (cont||card).after(sec);
      const SX=window.CastellumSituations;
      if(SX&&S.tgt==='it'&&S.src==='fr'&&!(S.cando&&S.cando['it:it-napoli-bar'])){const c=document.createElement('button');c.type='button';c.className='u2-sx';c.dataset.sxStart='0';
        c.innerHTML='<span aria-hidden="true">☕</span><span><b>Situation : au bar, à Naples</b><small>Dialogue, usages de ciao / buongiorno / salve, et ta première commande. 5 minutes.</small></span><span class="u2-go" aria-hidden="true">→</span>';sec.after(c)}
      if(hearts&&S.hearts>2)hearts.remove();
      // Défis de la semaine : repliés sur une ligne
      if(week){let n=0,tot=4;try{const c=window.CastellumReturn.challenges();n=c.list.filter(x=>x.claimed||x.done).length;tot=c.list.length}catch(err){}
        const det=document.createElement('details');det.className='u2-week';det.innerHTML=`<summary><span>🏆 <b>Défis de la semaine</b></span><span class="u2-wn">${n}/${tot}</span></summary>`;
        week.querySelector('.rt-wh')?.remove();det.appendChild(week);const castle=Q('.l3-castle');(castle||card).after(det)}
      const wrap=document.createElement('div');wrap.appendChild(R.cloneNode(true));return wrap.innerHTML}catch(err){console.warn('ui2',err);return html}};

  const css=document.createElement('style');css.id='castellum-ui2-css';css.textContent=`
:focus-visible{outline:3px solid var(--accent)!important;outline-offset:2px}
.bottom button{padding:6px 8px!important;gap:2px;min-width:64px}
.bottom button span{display:block!important;font-size:.7rem;font-weight:800;line-height:1.1}
.bottom svg{width:24px!important;height:24px!important}
.u2-today{flex-wrap:nowrap!important}.u2-goal{min-width:0!important}.u2-goal b{font-size:.88rem!important}
@media(max-width:360px){.u2-today{flex-wrap:wrap!important}.u2-goal{flex-basis:100%!important}.bottom button{min-width:0!important;padding:5px 4px!important}.bottom button span{font-size:.6rem!important}}
#rail .u2-hmin{display:none}
.u2-sec{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.u2-act{display:flex;align-items:center;gap:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:18px;padding:12px;font:inherit;text-align:left;cursor:pointer;min-height:64px}
.u2-act>span:first-child{font-size:1.5rem}.u2-act b{display:block;font-size:.98rem;line-height:1.2}.u2-act small{display:block;color:var(--ink-2);font-size:.8rem;margin-top:2px}
@media(max-width:360px){.u2-sec{grid-template-columns:1fr}}
.u2-sx{display:flex;align-items:center;gap:12px;width:100%;border:2px solid #f4b73b;background:color-mix(in srgb,#f4b73b 12%,var(--surface));color:var(--ink);border-radius:18px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer;min-height:64px}
.u2-sx>span:first-child{font-size:1.8rem}.u2-sx b{display:block}.u2-sx small{display:block;color:var(--ink-2);font-size:.82rem;margin-top:2px}.u2-go{margin-left:auto;font-weight:900;color:var(--accent)}
.u2-sxlist{display:grid;gap:8px;margin-bottom:16px}.u2-sxlist h2{margin:0;font-size:1.15rem}
.u2-today{display:flex;align-items:center;gap:8px;background:var(--surface);border:2px solid var(--line);border-radius:18px;padding:10px 12px;flex-wrap:wrap}
.u2-goal{display:flex;align-items:center;gap:10px;flex:1;min-width:150px}.u2-goal b{display:block;font-size:.95rem}.u2-goal small{color:var(--ink-2);font-size:.82rem}
.u2-today .l3-ring{width:46px;height:46px}.u2-today .l3-ring span{width:34px;height:34px;font-size:.72rem}
.u2-chip{border:2px solid var(--line);background:var(--bg);color:var(--ink);border-radius:14px;min-width:44px;min-height:44px;padding:6px 10px;font:inherit;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:3px}
.u2-chip.hot{border-color:#f4b73b;background:color-mix(in srgb,#f4b73b 16%,var(--surface))}.u2-chip.off{opacity:.6}
.u2-week{background:var(--surface);border:2px solid var(--line);border-radius:18px}
.u2-week summary{list-style:none;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer;min-height:48px}
.u2-week summary::-webkit-details-marker{display:none}.u2-week summary::after{content:'▾';color:var(--ink-2);margin-left:8px}.u2-week[open] summary::after{content:'▴'}
.u2-wn{margin-left:auto;font-weight:900;color:var(--accent)}
.u2-week .rt-week{border:0;padding-top:0}
.c-heart .u2-hmin{font-size:.68rem;margin-left:3px;opacity:.85}
.u2-tools h3{margin:14px 0 6px;font-size:.95rem;color:var(--ink-2)}
.u2-tgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.u2-tool{display:flex;align-items:center;gap:10px;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:14px;padding:12px;font:inherit;text-align:left;cursor:pointer;min-height:52px}
.u2-tool span{font-size:1.3rem}.u2-tool.wide{width:100%;margin-top:14px}
.u2-acq{background:var(--surface);border:2px solid var(--line);border-radius:20px;padding:14px;display:grid;gap:10px;margin-bottom:14px}
.u2-proof{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.u2-proof>div{background:var(--bg);border-radius:12px;padding:8px 4px;text-align:center;display:grid;gap:2px}.u2-proof b{font-size:1.15rem}.u2-proof small{font-size:.72rem;color:var(--ink-2);font-weight:800;line-height:1.2}
@media(max-width:400px){.u2-proof{grid-template-columns:repeat(2,minmax(0,1fr))}}
.u2-can{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.u2-can li{display:flex;gap:10px;align-items:flex-start;border:2px solid var(--line);border-radius:14px;padding:10px}
.u2-can li.lv4{border-color:var(--good)}.u2-can li.lv3{border-color:color-mix(in srgb,var(--good) 55%,var(--line))}
.u2-badge{font-size:1.4rem}.u2-can b{display:block}.u2-lv{display:block;color:var(--accent);font-weight:900;font-size:.82rem}.u2-keys{display:block;color:var(--ink-2);font-size:.82rem;margin-top:2px}
.u2-legend{margin:0;font-size:.8rem;color:var(--ink-2);line-height:1.5}
`;document.head.appendChild(css);
  try{if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(err){}
})();
