(function(){
  const D=window.CastellumDomain50;
  if(!D||typeof castleProgressCard!=='function'||typeof CASTLE_STYLE_DATA==='undefined')return;
  const fmt=n=>Number(n||0).toLocaleString('fr-FR');
  const eraOf=level=>Math.max(0,D.eras.findIndex(e=>level>=e.from&&level<=e.to));
  const art=(key,level,label)=>typeof window.royaumeSVG==='function'?window.royaumeSVG(key,level,label):'';

  castleProgressCard=function(){
    const d=D.progress(),key=(S.castleStyle&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval',st=CASTLE_STYLE_DATA[key];
    const ei=eraOf(d.level),era=D.eras[ei];
    const title=typeof window.castellumTitle==='function'?window.castellumTitle():d.rank;
    const hasNext=d.next!=null,done=d.xp-d.base,span=hasNext?d.next-d.base:1,rest=hasNext?Math.max(0,d.next-d.xp):0;
    const fillPct=Math.round((ei+(d.level-era.from)/Math.max(1,era.to-era.from+1))/(D.eras.length-1)*100);
    const eras=D.eras.map((e,i)=>`<div class="rk-era-dot ${i<ei?'done':i===ei?'current':'locked'}"><span>${e.icon}</span><b>${esc(e.name)}</b></div>`).join('');
    return `<section class="card rk-card">
      <div class="rk-hero" data-domain-open="timeline" role="button" tabindex="0" aria-label="Voir l'évolution de mon royaume">
        <div class="rk-art">${art(key,d.level,`${st.name} · niveau ${d.level}`)}</div>
        <div class="rk-top"><span class="rk-chip">${st.icon} ${esc(st.name)}</span><button type="button" class="rk-chip" data-domain-open="styles">⚜️ Architecture</button></div>
        <div class="rk-cap">
          <span class="rk-era">${era.icon} Ère ${ei+1} · ${esc(era.name)}</span>
          <h2>${esc(d.name)}</h2>
          <div class="rk-meta"><span class="rk-lvl">Niveau ${d.level}<small>/50</small></span><button type="button" class="rk-chip rk-rank" data-domain-open="styles" aria-label="Changer mon titre">🎖️ ${esc(title)}</button></div>
        </div>
      </div>
      <div class="rk-body">
        <div class="rk-next">
          <div class="rk-next-ic">${hasNext?(D.icons[d.ix+1]||'🏰'):'👑'}</div>
          <div><small>${hasNext?'Prochaine amélioration':'Prestige maximal'}</small><b>${hasNext?esc(D.names[d.ix+1]):'Castellum éternel'}</b>
            <div class="rk-bar"><i style="width:${hasNext?d.pct:100}%"></i></div>
            <div class="rk-xp"><span><b>${fmt(done)}</b> / ${fmt(span)} XP</span><span>${hasNext?`encore ${fmt(rest)} XP`:'👑 Tout est débloqué'}</span></div></div>
        </div>
        <div class="rk-eras" aria-label="Ères du royaume"><i class="rk-fill" style="width:calc((100% - 48px) * ${Math.min(100,fillPct)/100})"></i>${eras}</div>
        <div class="rk-actions"><button type="button" class="rk-primary" data-domain-open="timeline">🏰 Évolution</button><button type="button" class="rk-secondary" data-domain-open="styles">⚜️ Architecture</button></div>
      </div>
    </section>`;
  };

  // Fenêtre « 50 niveaux » : niveaux groupés par ère, en cartes compactes.
  function rebuildTimeline(m){
    const tl=m.querySelector('.domain50-timeline');if(!tl||tl.dataset.rk)return;
    tl.dataset.rk='1';tl.classList.add('rk-tl');tl.classList.remove('domain50-timeline');
    const d=D.progress();
    tl.innerHTML=D.eras.map((e,ei)=>{
      const lv=[];for(let l=e.from;l<=e.to;l++)lv.push(l);
      const got=lv.filter(l=>l<=d.level).length;
      return `<section class="rk-tl-era"><div class="rk-tl-era-head"><span class="ic">${e.icon}</span><div><b>Ère ${ei+1} · ${esc(e.name)}</b><small>Niveaux ${e.from} à ${e.to}</small></div><span class="count">${got}/${lv.length}</span></div>
        <div class="rk-tl-grid">${lv.map(l=>{const i=l-1,state=i<d.ix?'done':i===d.ix?'current':'locked';
          return `<div class="rk-tl-item ${state}" ${state==='current'?'data-domain-current="1"':''}><span class="ic">${D.icons[i]||'🏰'}<em>${l}</em></span><div><b>${esc(D.names[i])}</b><small>${state==='done'?'✓ Débloqué':state==='current'?'⚒️ Tu es ici':fmt(D.thresholds[i])+' XP'}</small></div></div>`}).join('')}</div></section>`;
    }).join('');
  }
  function watch(){const m=document.getElementById('domain50Modal');if(!m||m.dataset.rkWatch)return;m.dataset.rkWatch='1';new MutationObserver(()=>rebuildTimeline(m)).observe(m,{childList:true,subtree:true});rebuildTimeline(m)}
  new MutationObserver(watch).observe(document.body,{childList:true});watch();
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement?.classList?.contains('rk-hero')){e.preventDefault();document.activeElement.click()}},true);
  try{if(typeof render==='function')render()}catch(e){}
})();
