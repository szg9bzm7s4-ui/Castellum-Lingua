/* Étape 2 : écran Apprendre réorganisé.
   En haut : « Continuer », objectif du jour + série, château compact. Puis le chemin dans la ville
   du cours : l'unité en cours sur une route qui serpente, la suivante en aperçu, le reste dans la brume.
   Tout le HTML des étapes (data-node, data-chest, data-special…) est réutilisé tel quel. */
(function(){
  if(typeof pathView!=='function')return;
  let SHOW_DONE=false,SHOW_ALL=false;
  const DECOR={it:['🍕','🌋','⛵','🏛️','🍋','🛵'],es:['💃','🥘','🏟️','🌞','🎸','🫒'],fr:['🥐','🗼','🧀','🎨','🚲','🍷'],pt:['🚋','🐟','⛵','🌞','🥮','🎶'],en:['💂','☕','🚌','🎡','🌧️','📚'],de:['🥨','🏰','🚲','🌲','🎻','🍺'],nl:['🌷','🚲','🧀','⛵','🌬️','🎨'],ary:['🕌','🫖','🐪','🌴','🥘','🎨'],la:['🏛️','🍇','🛡️','📜','🏺','🌿'],grc:['🏺','🫒','🏛️','⛵','🦉','📜']};
  const deco=()=>DECOR[S.tgt]||['🌳','🏠','🌻','⛲','🌲','🏡'];
  const X=[0,58,84,58,0,-58,-84,-58],ROW=104;
  const Q=(root,sel)=>root.querySelector(sel),QA=(root,sel)=>[...root.querySelectorAll(sel)];
  const outer=el=>el?el.outerHTML:'';

  function road(sec){
    const nodesEl=Q(sec,'.nodes');if(!nodesEl)return;
    const wraps=QA(nodesEl,':scope > .node-wrap2');if(!wraps.length)return;
    const H=wraps.length*ROW+70,d=deco();
    const pts=wraps.map((w,i)=>[X[i%8],56+i*ROW]);
    // courbe lisse qui passe par chaque étape (Catmull-Rom → Bézier)
    let p=`M${pts[0][0]} ${pts[0][1]}`;
    for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
      p+=` C${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6} ${p2[0]} ${p2[1]}`}
    const curI=wraps.findIndex(w=>w.querySelector('.node.cur'));
    const doneUpTo=curI<0?wraps.length-1:curI;
    let done='';if(doneUpTo>0){done=`M${pts[0][0]} ${pts[0][1]}`;for(let i=0;i<doneUpTo;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;done+=` C${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6} ${p2[0]} ${p2[1]}`}}
    let decoHTML='';for(let i=0;i<wraps.length;i++){const side=X[i%8]>=0?-1:1;decoHTML+=`<span class="l3-deco" style="left:calc(50% + ${side*(118+(i%3)*14)}px);top:${44+i*ROW+((i%2)?18:-6)}px">${d[i%d.length]}</span>`}
    const svg=`<svg class="l3-svg" width="420" height="${H}" viewBox="-210 0 420 ${H}" aria-hidden="true"><path d="${p}" class="l3-path-bed"/><path d="${p}" class="l3-path-top"/>${done?`<path d="${done}" class="l3-path-done"/>`:''}<path d="${p}" class="l3-path-dash"/></svg>`;
    const items=wraps.map((w,i)=>{w.removeAttribute('style');w.classList.add('l3-stop');w.setAttribute('style',`left:calc(50% + ${pts[i][0]}px);top:${pts[i][1]}px`);const m=w.querySelector('.l2-mascot');if(m){m.classList.remove('left','right');m.classList.add(pts[i][0]>0?'left':'right')}return w.outerHTML}).join('');
    const box=document.createElement('div');box.className='l3-road';box.style.height=H+'px';box.innerHTML=svg+decoHTML+items;
    nodesEl.replaceWith(box);
  }

  const prev=pathView;
  pathView=function(){
    let html=prev.apply(this,arguments);if(typeof html!=='string')return html;
    try{
      try{render.scrolled=true}catch(e){}
      const tpl=document.createElement('template');tpl.innerHTML=html;const R=tpl.content;
      const rq=Q(R,'.rq-card'),sk=Q(R,'.sk-strip'),head=Q(R,'.path-head'),today=Q(R,'.today'),levels=Q(R,'.levels'),linfo=Q(R,'.level-info'),cp=Q(R,'.checkpoint');
      const units=QA(R,'section.unit');
      // 1. Continuer
      const main=today&&Q(today,'.today-btn.main');
      let cont='';
      if(main){const sm=Q(main,'small');if(sm&&sm.children.length===0){const m=sm.textContent.match(/^(.*) · leçon (\d+)$/);if(m){sm.innerHTML='';const a=document.createElement('span');a.textContent=m[1];const c=document.createElement('span');c.textContent='leçon';sm.append(a,' · ',c,' ',String(m[2]))}}main.classList.add('l3-continue');main.classList.remove('today-btn');cont=main.outerHTML}
      else if(cp)cont=`<div class="l3-continue l3-done"><span class="tb-ic">🏁</span><span><b>Niveau terminé !</b><small>Passe l'examen du niveau pour continuer.</small></span></div>`;
      // 2. Objectif du jour + série
      const d=typeof day==='function'?day():{xp:0},goal=S.goal||20,pct=Math.min(100,Math.round((d.xp||0)/goal*100));
      let st=0;try{st=streak()}catch(e){}
      const sh=typeof S.shields==='number'?S.shields:0;
      const stats=`<div class="l3-stats">
        <div class="l3-goal"><div class="l3-ring" style="--p:${pct}"><span>${pct}%</span></div><div><b>Objectif du jour</b><small><span>${d.xp||0}</span> / <span>${goal}</span> XP</small></div></div>
        <div class="l3-streak"><span class="l3-fire${st?'':' off'}">🔥</span><div><b>${st} <span>${st>1?'jours':'jour'}</span></b><small>🛡️ ${sh} <span>${sh>1?'boucliers':'bouclier'}</span></small></div></div>
      </div>`;
      // 3. Réviser / Mes erreurs
      const others=today?QA(today,'.today-btn').map(outer).join(''):'';
      const quick=others?`<div class="l3-quick">${others}</div>`:'';
      // 4. Château compact
      let castle='';
      if(rq){const art=Q(rq,'.rq-art'),name=Q(rq,'.rq-row b'),badge=Q(rq,'.rq-badge'),bar=Q(rq,'.rq-bar'),nx=Q(rq,'.rq-next');
        const chips=sk?QA(sk,'.sk-tile').map(t=>`<button type="button" class="l3-chip${t.classList.contains('warn')?' warn':''}" data-sk="${t.dataset.sk}" aria-label="${t.getAttribute('aria-label')||''}">${t.querySelector('.sk-ic').textContent}<b>${t.querySelector('b').textContent}</b></button>`).join(''):'';
        const rep=sk?Q(sk,'.sk-repair'):null;
        castle=`<section class="l3-castle">
          <div class="l3-c-top"><div class="l3-c-art" data-rq-open role="button" tabindex="0" aria-label="Mon royaume">${art?art.innerHTML:''}</div>
            <div class="l3-c-info" data-go="castle" role="button" tabindex="0"><small>${badge?badge.innerHTML:''}</small><b>${name?name.innerHTML:''}</b>${bar?bar.outerHTML:''}${nx?`<small class="l3-c-next">${nx.querySelector('div')?nx.querySelector('div').innerHTML:outer(Q(nx,'b'))}</small>`:''}</div></div>
          ${chips?`<div class="l3-chips">${chips}</div>`:''}
          ${rep?rep.outerHTML:''}
        </section>`}
      // 5. Le parcours
      let cur=-1;units.forEach((u,i)=>{if(cur<0&&!u.classList.contains('finished')&&!u.classList.contains('locked'))cur=i});
      const finished=units.filter(u=>u.classList.contains('finished'));
      let path='';
      if(SHOW_ALL){path=units.map(u=>{u.classList.remove('open');return u.outerHTML}).join('')+`<button type="button" class="l3-more" data-l3="all">▲ <span>Revenir à mon unité</span></button>`}
      else{
        if(finished.length){path+=`<button type="button" class="l3-more" data-l3="done">✓ <span>${finished.length}</span> <span>${finished.length>1?'unités terminées':'unité terminée'}</span> <span class="l3-chev">${SHOW_DONE?'▲':'▼'}</span></button>`;
          if(SHOW_DONE)path+=finished.map(u=>{u.classList.remove('open');return u.outerHTML}).join('')}
        if(cur>=0){const sec=units[cur];sec.classList.add('open','l3-unit');const h=Q(sec,'.unit-head');if(h){h.removeAttribute('data-u2');h.removeAttribute('role');h.removeAttribute('tabindex');const ch=Q(h,'.u2-chev');if(ch)ch.remove()}
          road(sec);path+=sec.outerHTML;
          const nx=units[cur+1];
          if(nx){const em=Q(nx,'.u-emoji'),ey=Q(nx,'.eyebrow'),t=Q(nx,'h2');
            path+=`<div class="l3-next"><span class="l3-next-ic">${em?em.innerHTML:'🔒'}</span><div><small>${ey?ey.innerHTML:''}</small><b data-noi18n>${t?t.innerHTML:''}</b><small class="l3-next-hint">🔒 <span>Se débloque après le défi du château</span></small></div></div>`}
          const rest=units.length-cur-2;
          if(rest>0)path+=`<button type="button" class="l3-fog" data-l3="all"><span class="l3-fog-cl">☁️ ☁️ ☁️</span><b><span>${rest}</span> <span>${rest>1?'autres unités à découvrir':'autre unité à découvrir'}</span></b><small>Voir tout le parcours</small></button>`;
        }else path+=units.map(u=>u.outerHTML).join('');
      }
      const lang=`<div class="l3-section">${outer(head)}${outer(levels)}${outer(linfo)}</div>`;
      const save=(typeof guestBanner==='function'&&S.lessons>0)?guestBanner():'';
      return `<div class="learn2 learn3">${cont}${stats}${castle}${quick}${lang}<div class="l3-path">${path}</div>${outer(cp)}${save}</div>`;
    }catch(e){console.warn('learn3',e);return html}
  };
  // Le bandeau « Sauvegarde ta progression » descend en bas de l'écran
  if(typeof guestBanner==='function'&&typeof render==='function'){const gb=guestBanner;let inPath=false;
    guestBanner=function(){return (typeof view!=='undefined'&&view==='learn'&&!inPath)?'':gb.apply(this,arguments)};
    const pv=pathView;pathView=function(){inPath=true;try{return pv.apply(this,arguments)}finally{inPath=false}}}

  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-l3]');if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.l3==='done')SHOW_DONE=!SHOW_DONE;else{SHOW_ALL=!SHOW_ALL;SHOW_DONE=false}
    render();if(!SHOW_ALL)requestAnimationFrame(()=>{const c=document.querySelector('.l3-unit');if(c)c.scrollIntoView({block:'start',behavior:'smooth'})})},true);

  const css=document.createElement('style');css.id='castellum-learn3-css';css.textContent=`
.learn3{display:grid;gap:14px}
.learn3 .l3-continue{display:flex;align-items:center;gap:14px;width:100%;border:0;border-radius:22px;padding:16px 18px;min-height:78px;color:#fff;text-align:left;cursor:pointer;font:inherit;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 65%,#7b2cbf));box-shadow:0 6px 0 var(--accent-dark),0 16px 28px -14px var(--accent)}
.learn3 .l3-continue:active{transform:translateY(4px);box-shadow:0 2px 0 var(--accent-dark)}
.learn3 .l3-continue .tb-ic{width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,.2);display:grid;place-items:center;flex:none;color:#fff}
.learn3 .l3-continue b{display:block;font-size:1.35rem;line-height:1.1}.learn3 .l3-continue small{display:block;opacity:.9;font-size:.86rem;margin-top:2px}
.learn3 .l3-continue.l3-done{background:linear-gradient(135deg,var(--good),var(--good-dark));box-shadow:0 6px 0 var(--good-dark)}
.l3-stats{display:grid;grid-template-columns:1.25fr 1fr;gap:10px}
.l3-goal,.l3-streak{display:flex;align-items:center;gap:10px;background:var(--surface);border:2px solid var(--line);border-radius:18px;padding:10px 12px;min-width:0}
.l3-goal b,.l3-streak b{display:block;font-size:.95rem;line-height:1.15}.l3-goal small,.l3-streak small{display:block;color:var(--ink-2);font-size:.78rem}
.l3-ring{--p:0;width:56px;height:56px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--good) calc(var(--p)*1%),var(--surface-2) 0)}
.l3-ring span{width:42px;height:42px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-size:.78rem;font-weight:900}
.l3-fire{font-size:2rem;line-height:1}.l3-fire.off{filter:grayscale(1);opacity:.5}
.l3-castle{background:var(--surface);border:2px solid var(--line);border-radius:20px;padding:10px;display:grid;gap:10px}
.l3-c-top{display:flex;gap:12px;align-items:center}
.l3-c-art{width:132px;height:86px;border-radius:14px;overflow:hidden;flex:none;cursor:pointer;background:#cfe3f3;position:relative}
.l3-c-art>*{width:100%;height:100%;display:block}.l3-c-art svg,.l3-c-art img{width:100%;height:100%;object-fit:cover}
.l3-c-info{flex:1;min-width:0;cursor:pointer;display:grid;gap:3px}
.l3-c-info small{color:var(--ink-2);font-size:.74rem;font-weight:800}.l3-c-info b{font-size:1rem;line-height:1.15}
.l3-c-info .rq-bar{height:7px;border-radius:99px;background:var(--surface-2);overflow:hidden}.l3-c-info .rq-bar i{display:block;height:100%;background:linear-gradient(90deg,#e09a2b,#ffd66b)}
.l3-c-next>*+*{margin-left:4px}.l3-c-next{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.l3-c-next br{display:none}
.l3-chips{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.l3-chip{border:2px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:5px 2px;font:inherit;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px}
.l3-chip b{font-size:.85rem}.l3-chip.warn{border-color:#F3A13B;background:#FFF4E5}
.l3-quick{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.learn3 .l3-quick .today-btn{border:1.5px solid var(--line);border-radius:18px;box-shadow:none;padding:10px 12px;min-height:54px;background:var(--surface)}
.l3-section{display:grid;gap:10px;margin-top:4px}
.l3-path{display:grid;gap:12px}
.learn3 .l3-unit{overflow:hidden}
.learn3 .l3-unit .unit-head{cursor:default}
.l3-road{position:relative;margin:0 0 6px;background:linear-gradient(180deg,color-mix(in srgb,var(--surface) 70%,#cfeec0),color-mix(in srgb,var(--surface) 55%,#d6efc6) 60%,color-mix(in srgb,var(--surface) 80%,#e8f5dd));border-radius:0 0 24px 24px;overflow:hidden}
.l3-svg{position:absolute;left:50%;top:0;transform:translateX(-50%);overflow:visible;pointer-events:none}
.l3-path-bed{fill:none;stroke:#C9B48A;stroke-width:30;stroke-linecap:round}
.l3-path-top{fill:none;stroke:#E8D9B0;stroke-width:22;stroke-linecap:round}
.l3-path-done{fill:none;stroke:#F2C55C;stroke-width:22;stroke-linecap:round}
.l3-path-dash{fill:none;stroke:rgba(255,255,255,.7);stroke-width:3;stroke-dasharray:2 14;stroke-linecap:round}
.learn3 .l3-stop{position:absolute!important;transform:translate(-50%,-50%)!important;width:auto;z-index:2}
.l3-deco{position:absolute;font-size:1.5rem;transform:translate(-50%,-50%);opacity:.9;pointer-events:none;z-index:1}
@media(max-width:400px){.l3-deco{display:none}}
.l3-more{border:2px dashed var(--line);background:var(--surface);color:var(--ink-2);border-radius:16px;padding:11px;font:inherit;font-weight:900;cursor:pointer;width:100%}
.l3-next{display:flex;gap:12px;align-items:center;background:var(--surface);border:2px solid var(--line);border-radius:20px;padding:12px;opacity:.85}
.l3-next-ic{width:48px;height:48px;border-radius:14px;background:var(--surface-2);display:grid;place-items:center;font-size:1.5rem;flex:none}
.l3-next small{display:block;color:var(--ink-2);font-size:.7rem;letter-spacing:.04em}.l3-next b{display:block;font-size:1rem;margin:2px 0}
.l3-fog{border:0;width:100%;border-radius:20px;padding:22px 12px 16px;cursor:pointer;font:inherit;color:var(--ink-2);background:linear-gradient(180deg,var(--surface-2),var(--bg));display:grid;gap:4px;justify-items:center}
.l3-fog-cl{font-size:1.4rem;letter-spacing:6px;opacity:.75}.l3-fog b{color:var(--ink)}.l3-fog small{color:var(--accent);font-weight:900}
.learn3 .save-banner{opacity:.92}
@media (prefers-reduced-motion:reduce){.learn3 .node.cur{animation:none!important}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .l3-path-bed{stroke:#5A4A2E}:root:not([data-theme="light"]) .l3-path-top{stroke:#7A6A48}:root:not([data-theme="light"]) .l3-chip.warn{background:#3A2A12;border-color:#8A5A1A}}
:root[data-theme="dark"] .l3-path-bed{stroke:#5A4A2E}:root[data-theme="dark"] .l3-path-top{stroke:#7A6A48}:root[data-theme="dark"] .l3-chip.warn{background:#3A2A12;border-color:#8A5A1A}
`;document.head.appendChild(css);
  try{if(typeof render==='function'&&typeof view!=='undefined'&&view==='learn'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
