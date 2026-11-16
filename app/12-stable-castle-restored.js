(function(){
  const CASTLE_SIMPLE_THRESHOLDS=[0,250,750,1500,3000,6000,12000,25000];
  const CASTLE_SIMPLE_NAMES=[
    "Tour fortifiée",
    "Donjon",
    "Fort militaire",
    "Domaine fortifié",
    "Château noble",
    "Grande forteresse",
    "Citadelle royale",
    "Castellum impérial"
  ];
  const CASTLE_SIMPLE_HERO='img/app/821dafeb89b0.webp';

  function castleSimpleIndex(xp){
    let ix=0;
    for(let i=0;i<CASTLE_SIMPLE_THRESHOLDS.length;i++){
      if(xp>=CASTLE_SIMPLE_THRESHOLDS[i]) ix=i;
    }
    return ix;
  }

  castleProgressCard=function(){
    const xp=Math.max(0,Number(Cloud?.profile?.total_xp ?? S.xp ?? 0)||0);
    const ix=castleSimpleIndex(xp);
    const base=CASTLE_SIMPLE_THRESHOLDS[ix];
    const next=CASTLE_SIMPLE_THRESHOLDS[ix+1] ?? null;
    const pct=next
      ? Math.max(0,Math.min(100,Math.round((xp-base)/(next-base)*100)))
      : 100;

    const road=CASTLE_SIMPLE_NAMES.map((name,i)=>{
      const state=i<ix?"done":i===ix?"current":"locked";
      return `<div class="castle-stable-step ${state}">
        <b>${esc(name)}</b>
        <small>${CASTLE_SIMPLE_THRESHOLDS[i].toLocaleString("fr-FR")} XP</small>
      </div>`;
    }).join("");

    return `<section class="card castle-stable-card">
      <div class="castle-stable-image">
        <img src="${CASTLE_SIMPLE_HERO}" alt="${esc(CASTLE_SIMPLE_NAMES[ix])}">
        <div class="castle-stable-badge">🏰 Mon château · Niveau ${ix+1}/8</div>
      </div>

      <div class="castle-stable-body">
        <div class="castle-stable-head">
          <div>
            <span class="eyebrow">Progression du domaine</span>
            <h2>${esc(CASTLE_SIMPLE_NAMES[ix])}</h2>
            <p>Ton château évolue uniquement avec l'XP gagnée.</p>
          </div>
          <div class="castle-stable-level">
            <b>${xp.toLocaleString("fr-FR")} XP</b>
            <small>XP totale</small>
          </div>
        </div>

        <div class="castle-stable-xprow">
          <b>⚡ Niveau ${ix+1}/8</b>
          <span>${next?`${next.toLocaleString("fr-FR")} XP pour le niveau suivant`:"Niveau maximum atteint"}</span>
        </div>

        <div class="castle-stable-bar"><i style="width:${pct}%"></i></div>

        <div class="castle-stable-next">
          ${next
            ? `Encore <b>${Math.max(0,next-xp).toLocaleString("fr-FR")} XP</b> pour débloquer <b>${esc(CASTLE_SIMPLE_NAMES[ix+1])}</b>.`
            : `👑 Ton château a atteint <b>${esc(CASTLE_SIMPLE_NAMES[ix])}</b>.`}
        </div>

        <div class="castle-stable-road">${road}</div>
      </div>
    </section>`;
  };

  try{ if(typeof render==="function") render(); }catch(e){ console.warn("Stable castle render skipped",e); }
})();
