(function(){
  const D=window.CastellumDomain50;
  if(!D||typeof window.KingdomWorld!=='function'||typeof CASTLE_STYLE_DATA==='undefined')return;
  const F=window.KINGDOM_FEATURES||[];
  const fmt=n=>Number(n||0).toLocaleString('fr-FR');
  const key=()=>(S.castleStyle&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval';
  const nm=i=>String(D.names[i]||'').replace(/ \(touche[^)]*\)/,'');
  const ic=i=>D.icons[i]||'🏰';
  const isTap=i=>/\(touche/.test(String((F[i]||[])[1]||''));
  const world=(lv,o)=>window.KingdomWorld(key(),lv,Object.assign({anim:true,label:'Mon royaume'},o||{}));
  const nextHTML=d=>d.next!=null
    ?`<div class="rq-next"><span class="rq-ic">${ic(d.ix+1)}</span><div><span>Prochain bâtiment</span><br><b>${esc(nm(d.ix+1))}</b> · <span>encore ${fmt(d.next-d.xp)} XP</span></div></div>`
    :`<div class="rq-next"><span class="rq-ic">👑</span><b>Royaume terminé !</b></div>`;

  /* 1. Grande carte en haut du parcours (remplace la petite vignette) */
  function card(){
    const d=D.progress();
    return `<section class="rq-card" data-rq-open role="button" tabindex="0" aria-label="Mon royaume">
      <div class="rq-art">${world(d.level)}</div>
      <span class="rq-badge">🏰 <span>Niveau</span> ${d.level}/50</span>
      <span class="rq-help">❓ <span>Comment ça marche ?</span></span>
      <div class="rq-body">
        <div class="rq-row"><b>${esc(nm(d.ix))}</b><small>⚡ ${fmt(d.xp)} XP</small></div>
        <div class="rq-bar"><i style="width:${d.next!=null?d.pct:100}%"></i></div>
        ${nextHTML(d)}
      </div></section>`;
  }
  window.castellumRoyaumeCard=card;
  if(typeof pathView==='function'){
    const prev=pathView;
    pathView=function(){
      let h=prev.apply(this,arguments);if(typeof h!=='string')return h;
      h=h.replace(/<button type="button" class="royaume-banner"[\s\S]*?<\/button>/,'');
      let c='';try{c=card()}catch(e){console.warn('royaume',e)}
      return c+h;
    };
  }

  /* 2. Fenêtre « Mon royaume » : comment ça marche + les 50 bâtiments */
  function openRoyaume(){
    const d=D.progress();
    const title=typeof window.castellumTitle==='function'?window.castellumTitle():'';
    const eras=D.eras.map(e=>{
      let rows='';
      for(let l=e.from;l<=e.to;l++){const i=l-1,state=i<d.ix?'done':i===d.ix?'current':'locked';
        rows+=`<div class="rq-item ${state}"${state==='current'?' data-rq-cur':''}><span class="rq-lv">${l}</span><span class="rq-ic">${ic(i)}</span><span class="rq-nm">${esc(nm(i))}${isTap(i)?` <span class="rq-tag">👆 <span>à toucher</span></span>`:''}</span><span class="rq-st">${state==='done'?'✓':state==='current'?'<span>Tu es ici</span>':`${fmt(D.thresholds[i])} XP`}</span></div>`}
      return `<div class="rq-era"><h3><span>${e.icon}</span><span>${esc(e.name)}</span></h3><div class="rq-list">${rows}</div></div>`;
    }).join('');
    openSheet(`<div class="rq-sheet">
      <div class="rq-head"><div><span class="eyebrow">Mon royaume</span><h2><span>Niveau ${d.level}</span> · <span>${esc(nm(d.ix))}</span></h2></div><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
      <div class="rq-art">${world(d.level)}</div>
      <div class="rq-row"><b>⚡ ${fmt(d.xp)} XP</b><small>${d.level}/50</small></div>
      <div class="rq-bar"><i style="width:${d.next!=null?d.pct:100}%"></i></div>
      ${nextHTML(d)}
      <h3>Comment ça marche ?</h3>
      <ul class="rq-how">
        <li><span class="rq-ic">⚡</span><p>Chaque leçon, jeu ou révision te rapporte des XP.</p></li>
        <li><span class="rq-ic">🏗️</span><p>Tes XP construisent ton royaume : un nouveau bâtiment à chaque niveau, 50 en tout.</p></li>
        <li><span class="rq-ic">👆</span><p>Touche les bâtiments spéciaux : le marché ouvre les listes de mots, la bibliothèque la grammaire, le stade les jeux, et la tour du professeur le professeur.</p></li>
        <li><span class="rq-ic">👑</span><p>Ton titre grandit avec toi, de Voyageur jusqu'à Souverain de Castellum.</p></li>
        <li><span class="rq-ic">⚜️</span><p>Choisis l'architecture de ton royaume parmi 15 styles. Tu peux en changer quand tu veux, sans rien perdre.</p></li>
      </ul>
      ${title?`<div class="rq-row"><span>Ton titre</span><b>👑 ${String(title).split(' / ').map(x=>`<span>${esc(x)}</span>`).join(' / ')}</b></div>`:''}
      <div class="rq-actions"><button class="btn ghost" type="button" data-domain-open="styles">⚜️ <span>Changer d'architecture</span></button></div>
      <h3>Les 50 bâtiments</h3>
      ${eras}
    </div>`);
  }
  window.castellumOpenRoyaume=openRoyaume;
  window.addEventListener('click',e=>{
    const t=e.target.closest&&e.target.closest('[data-rq-open],[data-domain-open="timeline"]');
    if(t){e.preventDefault();e.stopImmediatePropagation();openRoyaume();return}
    if(e.target.closest&&e.target.closest('.rq-sheet [data-domain-open="styles"]'))closeSheet();
  },true);
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement?.classList?.contains('rq-card')){e.preventDefault();openRoyaume()}},true);

  /* 3. Fête quand un nouveau bâtiment est construit (après la leçon, jamais pendant) */
  function checkLevelUp(){
    try{
      if(typeof LX!=='undefined'&&LX)return;
      if(document.getElementById('welcomeRoot')?.innerHTML||document.getElementById('sheetRoot')?.innerHTML)return;
      const d=D.progress();
      if(S.rqSeen==null||d.level<S.rqSeen){S.rqSeen=d.level;save();return}
      if(d.level===S.rqSeen)return;
      const fresh=[];for(let n=S.rqSeen+1;n<=d.level;n++)fresh.push(n);
      S.rqSeen=d.level;S.kwSeen=d.level;save();
      const list=fresh.slice(-4).map(n=>`<li><span class="rq-ic">${ic(n-1)}</span><b>${esc(nm(n-1))}</b></li>`).join('');
      openSheet(`<div class="rq-sheet rq-up">
        <div class="rq-art">${world(d.level,{fresh})}</div>
        <h2>🎉 <span>Niveau ${d.level} !</span></h2>
        <p class="muted">${fresh.length>1?'Nouveaux bâtiments dans ton royaume':'Nouveau bâtiment dans ton royaume'}</p>
        <ul class="rq-newlist">${list}</ul>
        ${nextHTML(d)}
        <div class="rq-actions"><button class="btn" type="button" data-act="closesheet">Continuer</button><button class="btn ghost" type="button" data-rq-open>Voir mon royaume</button></div>
      </div>`);
      try{tone(SND.good)}catch(e){}
      try{if(typeof mqSpeak==='function')mqSpeak('Bravo !',300)}catch(e){}
    }catch(e){console.warn('royaume level',e)}
  }
  if(typeof render==='function'){const prevR=render;render=function(){const r=prevR.apply(this,arguments);setTimeout(checkLevelUp,700);return r}}
  // L'ancienne notification (petit message en bas) est remplacée par la fête.
  if(typeof castleProgressCard==='function'){const prevC=castleProgressCard;castleProgressCard=function(){try{S.kwSeen=D.progress().level}catch(e){}return prevC.apply(this,arguments)}}
  try{const d=D.progress();if(S.rqSeen==null){S.rqSeen=d.level;S.kwSeen=d.level;save()}}catch(e){}
  try{if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
