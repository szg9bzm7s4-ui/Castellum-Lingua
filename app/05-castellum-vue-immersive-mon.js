/* ===== CASTELLUM · VUE IMMERSIVE MON CHATEAU ===== */
(function(){
  function immersiveData(){
    const xp=Math.max(S.xp,Cloud.profile?.total_xp||0);
    const key=castleStyleKey();
    const c=castleV2ForXP(xp,key);
    const next=c.next;
    const base=CASTLE_STAGE_XP[c.index];
    const pct=next?Math.max(0,Math.min(100,Math.round((xp-base)/(next-base)*100))):100;
    const image=castleStageVisual(key,c.index);
    return {xp,key,c,next,pct,image};
  }
  function openCastleImmersive(){
    const d=immersiveData(),c=d.c,nextName=d.next?c.style.stages[c.index+1]:c.n;
    let el=document.getElementById('castleImmersive');
    if(!el){
      el=document.createElement('div');
      el.id='castleImmersive';
      el.className='castle-immersive';
      document.body.appendChild(el);
    }
    el.hidden=false;
    el.innerHTML=`
      <div class="ci-top">
        <button class="ci-back" type="button" data-castle-close>‹ Retour</button>
        <div class="ci-title">Mon château</div>
        <span style="width:76px"></span>
      </div>
      <div class="ci-stage">
        ${d.image?`<img src="${d.image}" alt="${castleStageText(c)}">`:''}
        <div class="ci-caption">
          <div class="ci-kicker">${c.style.icon} ${c.style.name} · ${c.label}</div>
          <h1>${c.n}</h1>
          <p>${c.style.motto}</p>
        </div>
      </div>
      <div class="ci-panel">
        <div class="ci-levelrow">
          <b>⚡ ${d.xp.toLocaleString('fr-FR')} XP</b>
          <span>${d.next?`${d.next.toLocaleString('fr-FR')} XP pour le prochain niveau`:'Niveau ultime atteint 👑'}</span>
        </div>
        <div class="ci-bar"><i style="width:${d.pct}%"></i></div>
        <div class="ci-next">${d.next?`Encore <strong>${Math.max(0,d.next-d.xp).toLocaleString('fr-FR')} XP</strong> pour débloquer <b>${nextName}</b>.`:`Tu as débloqué <b>${c.n}</b>, le niveau ultime de cette voie.`}</div>
        <div class="ci-actions">
          <button type="button" data-castle-close>← Revenir au jeu</button>
          <button type="button" data-castle-evolution>Voir l'évolution</button>
        </div>
      </div>
      <div class="ci-note">🏰 Vue immersive : admire ton domaine en grand. Ton style et ton niveau restent liés à ton XP.</div>`;
    document.documentElement.style.overflow='hidden';
    document.body.style.overflow='hidden';
    el.scrollTop=0;
  }
  function closeCastleImmersive(){
    const el=document.getElementById('castleImmersive');
    if(el)el.hidden=true;
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
  }
  document.addEventListener('click',function(e){
    if(e.target.closest?.('[data-castle-open]')){
      e.preventDefault(); e.stopPropagation(); openCastleImmersive(); return;
    }
    if(e.target.closest?.('[data-castle-close]')){
      e.preventDefault(); closeCastleImmersive(); return;
    }
    if(e.target.closest?.('[data-castle-evolution]')){
      e.preventDefault(); closeCastleImmersive();
      setTimeout(()=>document.querySelector('.castle-stage-road')?.scrollIntoView({behavior:'smooth',block:'center'}),80);
    }
  },true);
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      const el=document.getElementById('castleImmersive');
      if(el&&!el.hidden)closeCastleImmersive();
    }
    if((e.key==='Enter'||e.key===' ')&&document.activeElement?.matches?.('[data-castle-open]')){
      e.preventDefault();openCastleImmersive();
    }
  });
})();
