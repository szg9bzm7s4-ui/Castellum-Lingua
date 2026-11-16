(function(){
  /* On garde les fonctions/données originales intactes et on remplace seulement l'affichage. */
  if(typeof castleV2ForXP!=="function" || typeof CASTLE_STAGE_XP==="undefined") return;

  function simpleCastleDrawing(level){
    const n=Math.max(1,Math.min(8,Number(level)||1));
    const towerH=70+n*7;
    const centerH=85+n*8;
    const wallW=138+n*5;
    return `<svg viewBox="0 0 420 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="342" cy="45" r="24" fill="#fff1b2" opacity=".95"/>
      <ellipse cx="82" cy="48" rx="44" ry="14" fill="#fff" opacity=".75"/>
      <ellipse cx="121" cy="54" rx="33" ry="12" fill="#fff" opacity=".7"/>
      <path d="M0 196 Q95 168 180 192 T420 184 V250 H0Z" fill="#6f9c55"/>
      <g transform="translate(210 197)">
        <rect x="${-wallW/2}" y="-64" width="${wallW}" height="64" rx="3" fill="#e2cfaa" stroke="#bda679" stroke-width="3"/>
        <rect x="${-wallW/2-35}" y="${-towerH}" width="54" height="${towerH}" rx="3" fill="#dbc79f" stroke="#bda679" stroke-width="3"/>
        <rect x="${wallW/2-19}" y="${-towerH}" width="54" height="${towerH}" rx="3" fill="#dbc79f" stroke="#bda679" stroke-width="3"/>
        <rect x="-38" y="${-centerH}" width="76" height="${centerH}" rx="3" fill="#ead8b2" stroke="#bda679" stroke-width="3"/>
        <polygon points="-45,${-centerH} 0,${-centerH-43} 45,${-centerH}" fill="#a8483e"/>
        <polygon points="${-wallW/2-41},${-towerH} ${-wallW/2-8},${-towerH-32} ${-wallW/2+25},${-towerH}" fill="#a8483e"/>
        <polygon points="${wallW/2-25},${-towerH} ${wallW/2+8},${-towerH-32} ${wallW/2+41},${-towerH}" fill="#a8483e"/>
        <path d="M-18 0 v-35 q18-23 36 0 V0Z" fill="#594029"/>
        <rect x="-12" y="${-centerH+24}" width="24" height="33" rx="10" fill="#416bb1"/>
        <rect x="${-wallW/2-22}" y="${-towerH+26}" width="17" height="27" rx="7" fill="#416bb1"/>
        <rect x="${wallW/2+5}" y="${-towerH+26}" width="17" height="27" rx="7" fill="#416bb1"/>
        ${n>=4?`<rect x="${-wallW/2-72}" y="-46" width="42" height="46" fill="#d7c397" stroke="#b49e72" stroke-width="3"/><rect x="${wallW/2+30}" y="-46" width="42" height="46" fill="#d7c397" stroke="#b49e72" stroke-width="3"/>`:``}
        ${n>=6?`<rect x="-4" y="${-centerH-61}" width="8" height="20" fill="#243f89"/><path d="M4 ${-centerH-61} q30 8 0 23z" fill="#ffd15d"/>`:``}
      </g>
    </svg>`;
  }

  castleProgressCard=function(){
    const xp=Math.max(0,Number(Cloud?.profile?.total_xp ?? S.xp ?? 0)||0);
    const key=castleStyleKey();
    const c=castleV2ForXP(xp,key);
    const base=CASTLE_STAGE_XP[c.index]||0;
    const next=c.next;
    const pct=next?Math.max(0,Math.min(100,Math.round((xp-base)/(next-base)*100))):100;
    const nextName=next?c.style.stages[c.index+1]:c.n;
    return `<section class="card simple-castle-v3">
      <div class="simple-castle-v3-inner">
        <div class="simple-castle-v3-art">
          <span class="simple-castle-v3-tag">🏰 Mon château · Niveau ${c.index+1}/8</span>
          ${simpleCastleDrawing(c.index+1)}
        </div>
        <div class="simple-castle-v3-copy">
          <div>
            <span class="eyebrow">${esc(c.style.name)}</span>
            <h2>${esc(c.n)}</h2>
            <p>Ton château évolue simplement avec l'XP gagnée.</p>
          </div>
          <div class="simple-castle-v3-row">
            <b>⚡ ${xp.toLocaleString("fr-FR")} XP</b>
            <span>${next?`${next.toLocaleString("fr-FR")} XP pour le niveau suivant`:"Niveau maximum"}</span>
          </div>
          <div class="simple-castle-v3-bar"><i style="width:${pct}%"></i></div>
          <div class="simple-castle-v3-next">
            ${next?`Encore <b>${Math.max(0,next-xp).toLocaleString("fr-FR")} XP</b> pour débloquer <b>${esc(nextName)}</b>.`:`🏆 Ton château a atteint son dernier niveau.`}
          </div>
        </div>
      </div>
    </section>`;
  };

  /* Force un rerender seulement après que toute l'application est chargée. */
  try{ if(typeof render==="function") render(); }catch(e){ console.warn("Simple castle render skipped",e); }
})();
