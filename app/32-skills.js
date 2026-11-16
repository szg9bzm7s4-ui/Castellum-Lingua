/* Étape 1 : le château reflète l'apprentissage.
   Six bâtiments-compétences, calculés à partir des données existantes (S.srs, S.done, série)
   et de compteurs par langue (S.skc) alimentés par les exercices. Les mots en retard
   « abîment » les maisons ; une révision les répare. Rien n'est jamais détruit. */
(function(){
  if(typeof S==='undefined'||typeof srsList!=='function')return;
  const DAY=24*3600e3;
  const SK=[
    {id:'vocab',ic:'🏠',b:'Maisons',n:'Vocabulaire',d:'Chaque mot appris construit une maison.',u:'mots appris',th:[10,25,50,100,175,275,400,600,850,1200],act:'Apprendre de nouveaux mots'},
    {id:'gram',ic:'📚',b:'Bibliothèque',n:'Grammaire',d:'Les fiches et les quiz de grammaire agrandissent la bibliothèque.',u:'réponses justes',th:[5,15,30,50,80,120,170,230,300,400],act:'Ouvrir la grammaire'},
    {id:'oral',ic:'🎭',b:'Théâtre',n:'Oral',d:'Chaque phrase réussie au micro fait grandir le théâtre.',u:'phrases dites',th:[3,10,20,35,55,80,110,150,200,260],act:'Parler au micro'},
    {id:'sit',ic:'🛒',b:'Marché',n:'Situations',d:'Dialogues, mini-histoires et situations animent le marché.',u:'échanges réussis',th:[3,10,20,35,55,80,110,150,200,260],act:'Jouer un dialogue'},
    {id:'boss',ic:'🏰',b:'Donjon',n:'Défis du château',d:'Chaque défi du château réussi élève le donjon.',u:'défis réussis',th:[1,2,3,5,7,10,14,19,25,32],act:'Affronter le prochain défi'},
    {id:'streak',ic:'⛲',b:'Fontaine',n:'Régularité',d:'Ta meilleure série de jours fait jaillir la fontaine.',u:'jours de série (record)',th:[1,3,5,7,10,14,21,30,50,100],act:'Faire ma leçon du jour'}
  ];
  const T=()=>S.tgt;
  const cnt=()=>{S.skc=S.skc||{};const t=T();if(!S.skc[t]||typeof S.skc[t]!=='object')S.skc[t]={oral:0,gram:0,sit:0};return S.skc[t]};
  // Étapes déjà réussies dans le parcours (pour ne pas repartir de zéro avec une ancienne sauvegarde)
  function doneStats(){const t=T()+':',o={les:0,parole:0,sit:0,boss:0};
    for(const k of Object.keys(S.done||{})){if(!k.startsWith(t)||!S.done[k])continue;const l=k.split(':').pop();
      if(l==='3')o.boss++;else if(l==='5')o.parole++;else if(l==='6')o.sit++;else if(l==='0'||l==='1'||l==='2')o.les++}
    return o}
  function bestStreak(){let s=0;try{s=streak()}catch(e){}if(!(S.bestStreak>=s)){S.bestStreak=s}return S.bestStreak}
  function values(){const c=cnt(),d=doneStats(),list=srsList();
    return {vocab:list.filter(e=>e.b>=2).length,gram:c.gram+Math.floor(d.les/2),oral:c.oral+d.parole*2,sit:c.sit+d.sit*3,boss:d.boss,streak:bestStreak()}}
  function levelOf(sk,v){let l=0;while(l<sk.th.length&&v>=sk.th[l])l++;const lo=l?sk.th[l-1]:0,hi=sk.th[l];
    return {lvl:l,max:sk.th.length,v,lo,hi:hi==null?null:hi,pct:hi==null?100:Math.round((v-lo)/(hi-lo)*100)}}
  // Mots en retard depuis plus d'un jour : 5 ou plus = murs fissurés, 20 ou plus = lierre
  function repair(){const now=Date.now();const late=srsList().filter(e=>e.due&&e.due<now-DAY).length;return {late,state:late>=20?2:late>=5?1:0}}
  function all(){const v=values();return SK.map(sk=>Object.assign({sk},levelOf(sk,v[sk.id])))}
  window.CastellumSkills={SK,all,repair,values,levelOf};

  /* Compteurs : alimentés après chaque réponse juste */
  if(typeof grade==='function'){const prev=grade;grade=function(ok){const st=(typeof LX!=='undefined'&&LX&&LX.steps)?LX.steps[LX.i]:null;
    const r=prev.apply(this,arguments);
    try{if(ok&&st){const c=cnt();
      if(st.k==='speak')c.oral++;
      else if(LX.game==='quiz'||st.k==='gaptype')c.gram++;
      else if(['dialogue','story','free','center'].includes(st.k)||['dialogue','story','free'].includes(LX.game))c.sit++;
      save()}}catch(e){}
    return r}}

  /* Interface */
  const fmt=n=>Number(n||0).toLocaleString('fr-FR');
  const tile=s=>`<button type="button" class="sk-tile${s.sk.id==='vocab'&&repair().state?' warn':''}" data-sk="${s.sk.id}" aria-label="${esc(s.sk.b)}"><span class="sk-ic">${s.sk.ic}</span><b>${s.lvl}</b><small>${esc(s.sk.n)}</small><i class="sk-mini"><i style="width:${s.pct}%"></i></i></button>`;
  function repairHTML(compact){const r=repair();if(!r.state)return'';
    return `<div class="sk-repair${r.state===2?' ivy':''}"><span class="sk-r-ic">${r.state===2?'🌿':'🧱'}</span><span class="sk-r-t"><b>${r.state===2?'Le lierre envahit les maisons':'Les murs des maisons se fissurent'}</b>${compact?'':`<small>${r.late} mots commencent à s'effacer. Une révision les répare : rien n'est jamais détruit.</small>`}</span><button type="button" class="sk-btn gold" data-sk-repair>🔧 <span>Réparer</span></button></div>`}
  function strip(){const a=all();return `<section class="sk-strip" aria-label="Tes bâtiments"><div class="sk-head"><b>Tes bâtiments</b><small>Touche un bâtiment pour le faire grandir.</small></div><div class="sk-grid">${a.map(tile).join('')}</div>${repairHTML(true)}</section>`}
  window.castellumSkillsStrip=strip;
  function openSkill(id){const s=all().find(x=>x.sk.id===id);if(!s)return;const sk=s.sk,rep=id==='vocab'?repair():{state:0};
    const actLabel=id==='vocab'&&dueItems().length?'Réviser mes mots':sk.act;
    openSheet(`<div class="sk-sheet">
      <div class="sk-sh-head"><span class="sk-big">${sk.ic}</span><div><span class="eyebrow">${esc(sk.n)}</span><h2><span>${esc(sk.b)}</span> · <span>niveau</span> ${s.lvl}</h2></div><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
      <p class="muted">${esc(sk.d)}</p>
      <div class="sk-prog"><div class="sk-bar"><i style="width:${s.pct}%"></i></div>
        <div class="sk-prog-t"><span><b>${fmt(s.v)}</b> <span>${esc(sk.u)}</span></span>${s.hi!=null?`<span><span>Niveau suivant :</span> <b>${fmt(s.hi)}</b></span>`:`<span>👑 <span>Niveau maximal !</span></span>`}</div></div>
      ${rep.state?repairHTML(false):''}
      <h3>Comment le faire grandir ?</h3>
      <button type="button" class="sk-btn acc sk-go" data-sk-go="${id}">${sk.ic} <span>${esc(actLabel)}</span></button>
      <div class="sk-others">${all().filter(x=>x.sk.id!==id).map(tile).join('')}</div>
    </div>`)}
  window.castellumOpenSkill=openSkill;
  function go2(id){closeSheet();try{
    if(id==='vocab'){if(dueItems().length)startMode('review');else clickContinue()}
    else if(id==='gram')go('grammar');
    else if(id==='oral'){if(learnedItems().length>=4&&canListen(S.tgt))startMode('speak');else clickContinue()}
    else if(id==='sit'){if(learnedItems().length>=4)startMode('dialogue');else clickContinue()}
    else clickContinue()}catch(e){console.warn('skills',e)}}
  function clickContinue(){go('learn');setTimeout(()=>{const b=document.querySelector('.today-btn.main,[data-act="resume"]');if(b)b.click()},80)}

  // Notifications : bâtiment qui monte de niveau, maisons réparées
  function check(){try{
    if(typeof LX!=='undefined'&&LX)return;
    if(document.getElementById('sheetRoot')?.innerHTML||document.getElementById('welcomeRoot')?.innerHTML)return;
    S.skSeen=S.skSeen||{};const t=T(),seen=S.skSeen[t]=S.skSeen[t]||{},a=all();let msg='';
    const first=seen._init==null;
    for(const s of a){if(!first&&s.lvl>(seen[s.sk.id]||0))msg=msg||`${s.sk.ic} ${s.sk.b} · niveau ${s.lvl} !`;seen[s.sk.id]=Math.max(seen[s.sk.id]||0,s.lvl)}
    const r=repair().state;if(!first&&seen._rep>0&&r===0)msg=msg||'🔧 Maisons réparées, bravo !';
    seen._rep=r;seen._init=1;save();
    if(msg){try{toast(msg)}catch(e){}}
  }catch(e){}}

  // Bande des bâtiments sous la carte du royaume, sur l'écran Apprendre
  if(typeof pathView==='function'){const prev=pathView;pathView=function(){let h=prev.apply(this,arguments);if(typeof h!=='string')return h;
    try{const i=h.indexOf('<section class="rq-card"');if(i>=0){const j=h.indexOf('</section>',i)+10;h=h.slice(0,j)+strip()+h.slice(j)}else h=strip()+h}catch(e){}
    return h}}
  // Dans la fenêtre « Mon royaume » : section ajoutée dès que la fenêtre s'ouvre
  function inject(){const sh=document.querySelector('#sheetRoot .rq-sheet:not(.rq-up)');if(!sh||sh.querySelector('.sk-inroyaume'))return;
    const anchor=[...sh.querySelectorAll('h3')].find(h=>/Comment ça marche|\?$/.test(h.textContent))||sh.querySelector('h3');
    const div=document.createElement('div');div.className='sk-inroyaume';div.innerHTML=`<h3>Tes bâtiments</h3><p class="muted" style="margin:-4px 0 8px;font-size:.88rem">Ton château reflète ce que tu sais faire : chaque bâtiment grandit avec une compétence.</p><div class="sk-grid">${all().map(tile).join('')}</div>${repairHTML(false)}`;
    if(anchor)sh.insertBefore(div,anchor);else sh.appendChild(div)}
  const sr=document.getElementById('sheetRoot');if(sr)new MutationObserver(inject).observe(sr,{childList:true,subtree:true});

  window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sk],[data-sk-go],[data-sk-repair]');if(!t)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(t.dataset.skRepair!=null){closeSheet();try{startMode('review')}catch(err){}return}
    if(t.dataset.skGo){go2(t.dataset.skGo);return}
    openSkill(t.dataset.sk)},true);

  const css=document.createElement('style');css.id='castellum-skills-css';css.textContent=`
.sk-strip{background:var(--surface);border:2px solid var(--line);border-radius:18px;padding:12px;margin:0 0 16px;display:grid;gap:10px}
.sk-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.sk-head b{font-size:.95rem}.sk-head small{color:var(--ink-2);font-size:.75rem}
.sk-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
@media(max-width:520px){.sk-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.sk-tile{border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:14px;padding:7px 4px 8px;display:grid;justify-items:center;gap:1px;font:inherit;cursor:pointer;min-width:0}
.sk-tile:active{transform:translateY(2px)}.sk-tile:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.sk-tile .sk-ic{font-size:1.25rem;line-height:1.1}.sk-tile b{font-size:1.05rem;line-height:1}.sk-tile small{font-size:.66rem;color:var(--ink-2);font-weight:800;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sk-tile.warn{border-color:#F3A13B;background:#FFF4E5}
.sk-mini{display:block;width:80%;height:5px;border-radius:99px;background:var(--surface-2);overflow:hidden;margin-top:3px}.sk-mini i{display:block;height:100%;background:var(--gold)}
.sk-repair{display:flex;align-items:center;gap:10px;background:#FFF4E5;border:2px solid #F3C27A;border-radius:14px;padding:8px 10px;color:#5A3A00}
.sk-repair.ivy{background:#EEF8E6;border-color:#9CCB7A;color:#24461A}
.sk-r-ic{font-size:1.4rem}.sk-r-t{flex:1;display:grid;gap:2px;font-size:.85rem}.sk-r-t small{font-weight:700;opacity:.85}
.sk-btn{border:0;border-radius:12px;padding:9px 12px;font:inherit;font-weight:900;font-size:.85rem;cursor:pointer;white-space:nowrap}
.sk-btn.gold{background:var(--gold);color:#fff;box-shadow:0 3px 0 var(--gold-dark)}
.sk-btn.acc{background:var(--accent);color:#fff;box-shadow:0 4px 0 var(--accent-dark);width:100%;padding:13px;font-size:1rem}
.sk-sheet{display:grid;gap:12px}.sk-sh-head{display:flex;align-items:center;gap:12px}.sk-sh-head>div{flex:1}
.sk-big{width:58px;height:58px;border-radius:16px;background:var(--accent-soft);display:grid;place-items:center;font-size:2rem;flex:none}
.sk-prog{display:grid;gap:6px}.sk-bar{height:12px;border-radius:99px;background:var(--surface-2);overflow:hidden}.sk-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--gold),#FFD86C);border-radius:inherit}
.sk-prog-t{display:flex;justify-content:space-between;gap:8px;font-size:.82rem;color:var(--ink-2);flex-wrap:wrap}.sk-prog-t b{color:var(--ink)}
.sk-others{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .sk-tile.warn,:root:not([data-theme="light"]) .sk-repair{background:#3A2A12;border-color:#8A5A1A;color:#FFD9A0}:root:not([data-theme="light"]) .sk-repair.ivy{background:#1E3A1E;border-color:#3E7A3E;color:#BFE8B0}}
:root[data-theme="dark"] .sk-tile.warn,:root[data-theme="dark"] .sk-repair{background:#3A2A12;border-color:#8A5A1A;color:#FFD9A0}
:root[data-theme="dark"] .sk-repair.ivy{background:#1E3A1E;border-color:#3E7A3E;color:#BFE8B0}
`;document.head.appendChild(css);

  if(typeof render==='function'){const prevR=render;render=function(){const r=prevR.apply(this,arguments);setTimeout(check,900);return r}}
  try{bestStreak();if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
