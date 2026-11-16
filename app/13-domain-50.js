(function(){
  if(typeof CASTLE_STYLE_DATA==='undefined') return;

  const DOMAIN50_MAX_XP=20000;
  const DOMAIN50_NAMES=[
    'Fondations du domaine','Campement fortifié','Palissade','Première tour','Porte fortifiée',
    'Petit donjon','Mur d’enceinte','Tour d’angle','Cour intérieure','Domaine fortifié',
    'Écuries','Atelier des bâtisseurs','Caserne','Deuxième tour','Sanctuaire',
    'Grande porte','Marché du domaine','Quartier des artisans','Muraille renforcée','Château seigneurial',
    'Jardins du domaine','Bibliothèque','Tour maîtresse','Arsenal','Deuxième enceinte',
    'Grand hall','Quartier résidentiel','Pont monumental','Garnison royale','Grande forteresse',
    'Place centrale','Académie','Monument du royaume','Quartier marchand','Citadelle',
    'Palais souverain','Grande bibliothèque','Grand sanctuaire','Avenue royale','Cité royale',
    'Remparts extérieurs','Tours monumentales','Jardins royaux','Palais agrandi','Quartier diplomatique',
    'Grande cité','Complexe impérial','Capitale du royaume','Capitale impériale','Castellum éternel'
  ];
  const DOMAIN50_ICONS=['🪨','⛺','🪵','🗼','🚪','🏰','🧱','🗼','🏘️','🛡️','🐎','🔨','⚔️','🗼','🏛️','🚪','🛒','⚒️','🧱','🏰','🌿','📚','🏯','🛡️','🧱','👑','🏘️','🌉','⚔️','🏰','⛲','📜','🗿','🛍️','🏯','👑','📚','🏛️','🛣️','🌆','🧱','🗼','🌳','🏛️','🤝','🌇','✨','👑','🌃','💎'];
  const DOMAIN50_ERAS=[
    {from:1,to:8,name:'Fondation',icon:'🪨'},
    {from:9,to:16,name:'Seigneurie',icon:'🛡️'},
    {from:17,to:26,name:'Royaume',icon:'👑'},
    {from:27,to:38,name:'Empire',icon:'🦅'},
    {from:39,to:50,name:'Légende',icon:'✨'}
  ];
  const DOMAIN50_RANKS=[
    [0,'Voyageur / Voyageuse'],[170,'Écuyer / Écuyère'],[730,'Seigneur / Dame'],[1830,'Baron / Baronne'],[3640,'Comte / Comtesse'],[5940,'Duc / Duchesse'],[8690,'Prince / Princesse'],[11840,'Roi / Reine'],[16020,'Empereur / Impératrice'],[20000,'Souverain / Souveraine de Castellum']
  ];
  // Une courbe douce : progression rapide au début, prestigieuse sur la durée.
  // Niveau 2 dès la première leçon, puis un nouveau bâtiment toutes les quelques séances.
  const DOMAIN50_XP=Array.from({length:50},(_,i)=>i===0?0:Math.round((DOMAIN50_MAX_XP*Math.pow(i/49,1.7))/10)*10);
  DOMAIN50_XP[49]=DOMAIN50_MAX_XP;

  function totalXP(){
    const cloud=(typeof Cloud!=='undefined'&&Cloud?.profile?.total_xp!=null)?Number(Cloud.profile.total_xp):0;
    return Math.max(0,Number(S?.xp||0),cloud||0);
  }
  function levelIndexForXP(xp){let ix=0;for(let i=0;i<DOMAIN50_XP.length;i++)if(xp>=DOMAIN50_XP[i])ix=i;return ix}
  function rankForXP(xp){let r=DOMAIN50_RANKS[0][1];for(const [need,name] of DOMAIN50_RANKS)if(xp>=need)r=name;return r}
  function eraForLevel(level){return DOMAIN50_ERAS.findIndex(e=>level>=e.from&&level<=e.to)}
  function architectureIndex(level){return Math.min(7,Math.floor((level-1)*8/50))}
  function currentStyleKey(){return (S?.castleStyle&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval'}
  function domain50CastleSVG(styleKey,level){
    const lv=Math.max(1,Math.min(50,Number(level)||1));
    const style=CASTLE_STYLE_DATA[styleKey]||CASTLE_STYLE_DATA.medieval;
    const extra=Math.min(5,Math.floor((lv-1)/10));
    const isRoman=styleKey==='romain'||styleKey==='grec';
    const isOrient=['japonais','oriental','ottoman','persan','andalou','byzantin'].includes(styleKey);
    const isNord=['nordique','celtique'].includes(styleKey);
    const roof=isOrient?'#b2493d':isNord?'#5d4938':'#9d4039';
    const stone=isRoman?'#ead9b6':isOrient?'#e4cfac':'#d9c7a4';
    const dark=isRoman?'#bda77f':'#a58f6b';
    const accent=styleKey==='japonais'?'#be2f36':styleKey==='ottoman'?'#2a7d67':styleKey==='persan'?'#2d6da8':'#244c91';
    let extras='';
    if(lv>=6) extras+=`<rect x="88" y="222" width="54" height="58" rx="3" fill="${stone}" stroke="${dark}" stroke-width="4"/><polygon points="84,222 115,191 146,222" fill="${roof}"/>`;
    if(lv>=12) extras+=`<rect x="458" y="222" width="54" height="58" rx="3" fill="${stone}" stroke="${dark}" stroke-width="4"/><polygon points="454,222 485,191 516,222" fill="${roof}"/>`;
    if(lv>=18) extras+=`<path d="M58 282 Q300 236 542 282" fill="none" stroke="${dark}" stroke-width="12" stroke-linecap="round" opacity=".9"/>`;
    if(lv>=24) extras+=`<rect x="175" y="242" width="48" height="38" rx="3" fill="${stone}" stroke="${dark}" stroke-width="3"/><rect x="377" y="242" width="48" height="38" rx="3" fill="${stone}" stroke="${dark}" stroke-width="3"/>`;
    if(lv>=30) extras+=`<circle cx="300" cy="289" r="26" fill="#78a45e"/><circle cx="300" cy="289" r="14" fill="#96c976"/>`;
    if(lv>=38) extras+=`<path d="M42 306 Q300 260 558 306" fill="none" stroke="#9bb7d7" stroke-width="16" opacity=".85"/>`;
    if(lv>=44) extras+=`<g opacity=".95"><rect x="28" y="245" width="44" height="35" fill="${stone}" stroke="${dark}" stroke-width="3"/><rect x="528" y="245" width="44" height="35" fill="${stone}" stroke="${dark}" stroke-width="3"/></g>`;
    const crown=lv>=48?`<path d="M280 78 l12 13 8-20 8 20 12-13 -4 27 h-32z" fill="#f1bd49"/>`:'';
    const flag=lv>=10?`<rect x="296" y="67" width="5" height="52" fill="#23355c"/><path d="M301 70 q38 8 0 25z" fill="${accent}"/>`:'';
    const roman=isRoman?`<g fill="${stone}" stroke="${dark}" stroke-width="3"><rect x="238" y="150" width="124" height="130"/><rect x="224" y="136" width="152" height="20"/><polygon points="220,136 300,92 380,136" fill="${roof}"/>${[252,278,304,330].map(x=>`<rect x="${x}" y="166" width="15" height="88"/>`).join('')}</g>`:'';
    const oriental=isOrient?`<g><rect x="235" y="145" width="130" height="135" rx="5" fill="${stone}" stroke="${dark}" stroke-width="4"/><path d="M218 152 Q300 117 382 152 Q365 126 300 105 Q235 126 218 152Z" fill="${roof}"/><path d="M245 116 Q300 88 355 116 Q341 92 300 76 Q259 92 245 116Z" fill="${roof}"/><rect x="284" y="218" width="32" height="62" rx="16" fill="#5d4532"/></g>`:'';
    const medieval=(!isRoman&&!isOrient)?`<g><rect x="220" y="145" width="160" height="135" rx="4" fill="${stone}" stroke="${dark}" stroke-width="4"/><rect x="170" y="180" width="62" height="100" rx="4" fill="${stone}" stroke="${dark}" stroke-width="4"/><rect x="368" y="180" width="62" height="100" rx="4" fill="${stone}" stroke="${dark}" stroke-width="4"/><polygon points="164,180 201,142 238,180" fill="${roof}"/><polygon points="362,180 399,142 436,180" fill="${roof}"/><polygon points="210,145 300,95 390,145" fill="${roof}"/><path d="M283 280 v-54 q17-24 34 0 v54z" fill="#594029"/></g>`:'';
    return `<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" aria-label="${esc(style.name)} niveau ${lv}"><defs><linearGradient id="sky50" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc2ed"/><stop offset="1" stop-color="#e5edf5"/></linearGradient></defs><rect width="600" height="340" fill="url(#sky50)"/><circle cx="500" cy="61" r="31" fill="#fff1af" opacity=".95"/><g fill="#fff" opacity=".76"><ellipse cx="96" cy="67" rx="58" ry="18"/><ellipse cx="143" cy="74" rx="40" ry="14"/></g><path d="M0 272 Q120 225 240 264 T600 254 V340 H0Z" fill="#6f9656"/><path d="M0 296 Q132 251 257 292 T600 281 V340 H0Z" fill="#527d48"/>${extras}${roman||oriental||medieval}${flag}${crown}</svg>`;
  }
  function progressData(){
    const xp=totalXP(),ix=levelIndexForXP(xp),level=ix+1,next=DOMAIN50_XP[ix+1]??null,base=DOMAIN50_XP[ix],pct=next?Math.max(0,Math.min(100,Math.round((xp-base)/(next-base)*100))):100;
    const key=currentStyleKey(),style=CASTLE_STYLE_DATA[key],arch=architectureIndex(level),image='';
    return {xp,ix,level,next,base,pct,key,style,arch,image,rank:rankForXP(xp),era:eraForLevel(level),name:DOMAIN50_NAMES[ix],icon:DOMAIN50_ICONS[ix]};
  }
  function nextTransformationLevel(level){
    const now=architectureIndex(level);for(let l=level+1;l<=50;l++)if(architectureIndex(l)>now)return l;return null;
  }
  function eraHTML(level){
    const ei=eraForLevel(level);
    return DOMAIN50_ERAS.map((e,i)=>`<div class="domain50-era ${i<ei?'done':i===ei?'current':'locked'}"><span>${e.icon}</span><b>${e.name}</b><small>Niv. ${e.from}–${e.to}</small></div>`).join('');
  }
  function nearbyUpgrades(ix){
    const start=Math.max(0,ix-2),end=Math.min(49,ix+4);let out='';
    for(let i=start;i<=end;i++)out+=`<span class="domain50-upgrade ${i===ix?'current':''}">${i<ix?'✓ ':i===ix?'⚒️ ':'🔒 '}${i+1}. ${esc(DOMAIN50_NAMES[i])}</span>`;
    return out;
  }

  castleProgressCard=function(){
    const d=progressData();
    const remaining=d.next==null?0:Math.max(0,d.next-d.xp);
    const transformAt=nextTransformationLevel(d.level);
    const macroName=d.style.stages?.[d.arch]||d.style.name;
    return `<section class="card domain50-card">
      <div class="domain50-hero" data-domain-open="timeline" role="button" tabindex="0" aria-label="Voir l'évolution complète de mon domaine">
        <div class="domain50-hero-art">${domain50CastleSVG(d.key,d.level)}</div>
        <div class="domain50-top"><span class="domain50-pill">${d.style.icon} ${esc(d.style.name)} · Niveau ${d.level}/50</span><button class="domain50-customize" type="button" data-domain-open="styles">⚜️ Personnaliser</button></div>
        <div class="domain50-caption"><span class="domain50-kicker">${DOMAIN50_ERAS[d.era].icon} Ère ${d.era+1} · ${DOMAIN50_ERAS[d.era].name}</span><h2>${esc(d.name)}</h2><p>${esc(macroName)} · Ton domaine conserve son architecture et grandit avec chacune de tes leçons.</p></div>
      </div>
      <div class="domain50-body">
        <div class="domain50-status"><div><div class="domain50-title"><strong>${d.icon} ${esc(d.name)}</strong><span class="domain50-rank">🎖️ ${esc(d.rank)}</span></div></div><div class="domain50-xp"><b>⚡ ${d.xp.toLocaleString('fr-FR')} XP</b><small>XP totale</small></div></div>
        <div class="domain50-progress-head"><b>Progression du niveau ${d.level}</b><span>${d.next?`${d.next.toLocaleString('fr-FR')} XP pour atteindre le niveau ${d.level+1}`:'Prestige maximal atteint'}</span></div>
        <div class="domain50-bar"><i style="width:${d.pct}%"></i></div>
        <div class="domain50-next"><span class="domain50-next-icon">${d.next?DOMAIN50_ICONS[d.ix+1]:'👑'}</span><div>${d.next?`<b>Prochaine amélioration : ${esc(DOMAIN50_NAMES[d.ix+1])}</b><small>Encore ${remaining.toLocaleString('fr-FR')} XP.${transformAt&&transformAt===d.level+1?' Cette amélioration transformera aussi visuellement ton château.':''}</small>`:`<b>Castellum éternel</b><small>Tu as atteint le dernier niveau du domaine.</small>`}</div></div>
        <div class="domain50-eras">${eraHTML(d.level)}</div>
        <div class="domain50-upgrades">${nearbyUpgrades(d.ix)}</div>
        <div class="domain50-actions"><button class="primary" type="button" data-domain-open="timeline">🏰 Voir les 50 niveaux</button><button class="soft" type="button" data-domain-open="styles">⚜️ Choisir mon architecture</button></div>
      </div>
    </section>`;
  };

  function ensureModal(){
    let m=document.getElementById('domain50Modal');
    if(!m){m=document.createElement('div');m.id='domain50Modal';m.className='domain50-modal';m.hidden=true;document.body.appendChild(m)}
    return m;
  }
  function openTimeline(){
    const d=progressData(),m=ensureModal();
    const rows=DOMAIN50_NAMES.map((name,i)=>{const state=i<d.ix?'done':i===d.ix?'current':'locked',era=DOMAIN50_ERAS[eraForLevel(i+1)];return `<div class="domain50-step ${state}" ${i===d.ix?'data-domain-current="1"':''}><span class="domain50-step-num">${i+1}</span><div><b>${DOMAIN50_ICONS[i]} ${esc(name)}</b><small>${era.icon} ${era.name}${i===d.ix?' · niveau actuel':''}</small></div><span class="domain50-step-xp">${DOMAIN50_XP[i].toLocaleString('fr-FR')} XP</span></div>`}).join('');
    m.innerHTML=`<div class="domain50-dialog"><div class="domain50-dialog-head"><div><small class="eyebrow">Progression complète</small><h2>Ton domaine · 50 niveaux</h2></div><button class="domain50-close" data-domain-close aria-label="Fermer">×</button></div><div class="domain50-timeline">${rows}</div></div>`;
    m.hidden=false;m.removeAttribute('hidden');m.style.display='flex';document.documentElement.style.overflow='hidden';setTimeout(()=>m.querySelector('[data-domain-current]')?.scrollIntoView({block:'center'}),60);
  }
  function openStyles(){
    const d=progressData(),m=ensureModal();
    const cards=Object.entries(CASTLE_STYLE_DATA).map(([k,v])=>`<button class="domain50-style ${k===d.key?'on':''}" type="button" data-domain-style="${k}"><span class="domain50-style-preview"><span>${v.icon}</span></span><span class="domain50-style-copy"><b>${v.icon} ${esc(v.name)}</b><small>${esc(v.motto)}</small><span class="domain50-style-check">${k===d.key?'✓ Architecture actuelle':'Choisir ce royaume'}</span></span></button>`).join('');
    m.innerHTML=`<div class="domain50-dialog"><div class="domain50-dialog-head"><div><small class="eyebrow">Ton royaume</small><h2>Choisis ton architecture</h2><small style="color:var(--muted)">Ton XP et tes 50 niveaux ne changent jamais quand tu changes de style.</small></div><button class="domain50-close" data-domain-close aria-label="Fermer">×</button></div><div class="domain50-style-grid">${cards}</div></div>`;
    m.hidden=false;m.removeAttribute('hidden');m.style.display='flex';document.documentElement.style.overflow='hidden';
  }
  function closeModal(){const m=document.getElementById('domain50Modal');if(m){m.hidden=true;m.setAttribute('hidden','');m.style.display='none'}document.documentElement.style.overflow=''}

  document.addEventListener('click',function(e){
    const open=e.target.closest?.('[data-domain-open]');
    if(open){e.preventDefault();e.stopImmediatePropagation();open.dataset.domainOpen==='styles'?openStyles():openTimeline();return}
    const style=e.target.closest?.('[data-domain-style]');
    if(style){e.preventDefault();e.stopImmediatePropagation();const k=style.dataset.domainStyle;if(!CASTLE_STYLE_DATA[k])return;S.castleStyle=k;if(S.settings)S.settings.castleStyle=k;save();closeModal();toast(`🏰 Royaume ${CASTLE_STYLE_DATA[k].name} sélectionné`);render();return}
    if(e.target.closest?.('[data-domain-close]')||e.target.id==='domain50Modal'){e.preventDefault();closeModal();return}
  },true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();if((e.key==='Enter'||e.key===' ')&&document.activeElement?.matches?.('[data-domain-open="timeline"]')){e.preventDefault();openTimeline()}},true);

  // La ligue affiche désormais le niveau de domaine 1–50 au lieu de l'ancien palier 1–8.
  if(typeof socialTabView==='function'){
    const previousSocialTabView=socialTabView;
    socialTabView=function(tab,D){
      if(tab!=='league')return previousSocialTabView(tab,D);
      const friends=D.friends||[],me={id:Cloud.user?.id,display_name:Cloud.profile?.display_name||'Moi',username:Cloud.profile?.username||'',avatar_url:Cloud.profile?.avatar_url||'',weekly_xp:D.me_weekly_xp||0,total_xp:Cloud.profile?.total_xp||S.xp,current_streak:Cloud.profile?.current_streak||streak(),castle_style:S.castleStyle||'medieval',is_me:true};
      const rows=[me,...friends].sort((a,b)=>(b.weekly_xp||0)-(a.weekly_xp||0));
      return `<section class="card"><div class="section-head"><div><h2>🏆 Ligue des amis</h2><p class="muted">XP depuis lundi · domaine sur 50 niveaux</p></div><button class="btn sm ghost" data-social="refresh">↻</button></div><div>${rows.map((p,i)=>{const px=Number(p.total_xp||0),li=levelIndexForXP(px),key=(p.castle_style&&CASTLE_STYLE_DATA[p.castle_style])?p.castle_style:'medieval',st=CASTLE_STYLE_DATA[key];return `<div class="rank-row"><div class="rank-pos">${i<3?['🥇','🥈','🥉'][i]:i+1}</div>${socialAvatar(p,38)}<div>${socialName(p)}<span class="fr-meta">${st.icon} ${esc(st.name)} · niveau ${li+1}/50 · ${esc(DOMAIN50_NAMES[li])} · 🔥 ${p.current_streak||0} · ⚡ ${px} XP${p.is_me?' · toi':''}</span></div><div class="rank-xp"><b>${p.weekly_xp||0}</b><small>XP semaine</small></div></div>`}).join('')}</div>${friends.length===0?`<p class="social-note">Ajoute au moins un ami pour créer ta propre ligue privée.</p>`:''}</section>`;
    };
  }

  // Expose uniquement ce qui peut être utile ailleurs dans l'application.
  window.CastellumDomain50={thresholds:DOMAIN50_XP,names:DOMAIN50_NAMES,icons:DOMAIN50_ICONS,eras:DOMAIN50_ERAS,progress:progressData};
  try{if(typeof render==='function')render()}catch(err){console.warn('Domain 50 render skipped',err)}
})();
