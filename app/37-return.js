/* Étape 6 : envie de revenir.
   Coffre du jour, mot du jour, défis de la semaine, série et bouclier bien visibles,
   cœurs regagnés en révisant, test de niveau de 2 minutes, tableau de progrès. */
(function(){
  if(typeof pathView!=='function'||typeof S==='undefined')return;
  const E=s=>typeof esc==='function'?esc(s):String(s);
  const R=()=>{const r=S.ret=S.ret||{};r.chest=r.chest||{};r.wotd=r.wotd||{};r.wk=r.wk||{};r.lt=r.lt||{};return r};
  const today=()=>dk(new Date());
  const hash=s=>{let h=2166136261>>>0;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const earn=(n,why)=>{try{window.CastellumCastle?window.CastellumCastle.earn(n,why):toast(`🪙 +${n}`)}catch(e){}};
  const dayXP=k=>((S.days[k]||{}).xp||0);
  const coinsOn=!!window.CastellumCastle;

  /* ---------- Coffre du jour ---------- */
  function chestReward(){const r=hash(today()+S.tgt)%100;
    if(r<10&&(S.shields||0)<2)return {k:'shield',ic:'🛡️',t:'Un bouclier pour protéger ta série'};
    if(r<20&&S.hearts<5)return {k:'hearts',ic:'❤️',t:'Tous tes cœurs sont rechargés'};
    const n=r<75?15+(r%26):50;return {k:'coins',n,ic:'🪙',t:`${n} pièces pour ton château`}}
  function openChest(){const c=R();if(c.chest[today()])return;if(dayXP(today())<=0){toast('Gagne tes premiers XP du jour pour ouvrir le coffre');return}
    const w=chestReward();c.chest[today()]=w.k;
    if(w.k==='shield')S.shields=(S.shields||0)+1;else if(w.k==='hearts'){S.hearts=5;S.heartsAt=Date.now()}else{S.cst=S.cst||{};S.cst.bonus=(S.cst.bonus||0)+w.n}
    try{save()}catch(e){}
    openSheet(`<div class="rt-sheet rt-chest-open"><div class="rt-chest-anim" aria-hidden="true"><span class="rt-box">🎁</span><span class="rt-prize">${w.ic}</span></div><h2>Coffre du jour</h2><p><b>${w.t}</b></p><p class="muted">Reviens demain : un nouveau coffre t'attend.</p><button class="btn" type="button" data-act="closesheet">Super !</button></div>`);
    setTimeout(()=>{try{confetti()}catch(e){}},700)}

  /* ---------- Mot du jour ---------- */
  function wordOfDay(){let pool=[];try{lvUnits().forEach(U=>{const d=setData(U.id);if(d)pool.push(...d.filter(x=>x&&x.t))})}catch(e){}
    if(!pool.length)return null;const known=new Set(srsList().map(x=>x.t));const fresh=pool.filter(x=>!known.has(x.t));const src=fresh.length>10?fresh:pool;return src[hash(today()+S.tgt+S.src)%src.length]}
  function openWord(){const w=wordOfDay();if(!w)return;const c=R(),k=today()+S.tgt,sv=S.saved.some(x=>x.t===w.t&&x.lang===S.tgt),hasV=typeof canSpeak==='function'&&canSpeak(S.tgt);
    openSheet(`<div class="rt-sheet"><span class="eyebrow">Mot du jour</span><div class="rt-word" lang="${S.tgt}" data-noi18n>${E(w.t)}</div>${w.p?`<div class="muted" data-noi18n>${E(w.p)}</div>`:''}<p class="rt-wtr" data-noi18n>${E(w.s)}</p>
      <div class="rt-acts">${hasV?`<button class="btn ghost" type="button" data-say="${E(w.t)}">🔊 <span>Écouter</span></button>`:''}<button class="btn ghost" type="button" data-rt="saveword">${sv?'★':'☆'} <span>Mes mots</span></button></div>
      ${c.wotd[k]?`<p class="muted">✓ Mot du jour appris</p>`:`<button class="btn good" type="button" data-rt="learnword">✓ <span>Je l'ai retenu</span>${coinsOn?' · 🪙 +5':''}</button>`}</div>`);
    if(hasV)setTimeout(()=>{try{speak(w.t)}catch(e){}},250)}

  /* ---------- Défis de la semaine ---------- */
  function week(){const d=new Date(),dow=(d.getDay()+6)%7;const mon=new Date(d);mon.setDate(d.getDate()-dow);const keys=[];for(let i=0;i<=dow;i++){const x=new Date(mon);x.setDate(mon.getDate()+i);keys.push(dk(x))}
    const prev=[];for(let i=1;i<=7;i++){const x=new Date(mon);x.setDate(mon.getDate()-i);prev.push(dk(x))}return {key:dk(mon),keys,prev,left:6-dow}}
  function challenges(){const w=week();const sum=(ks,f)=>ks.reduce((a,k)=>a+((S.days[k]||{})[f]||0),0);
    const talk=Object.keys((S.cst||{}).talk||{}).filter(k=>w.keys.some(d=>k.startsWith(d+':'))).length;
    const list=[{id:'xp',ic:'⚡',t:'Gagne {#} XP',goal:250,v:sum(w.keys,'xp')},{id:'les',ic:'📘',t:'Termine {#} leçons',goal:10,v:sum(w.keys,'lessons')},
      {id:'days',ic:'📅',t:'Apprends {#} jours différents',goal:5,v:w.keys.filter(k=>dayXP(k)>0).length},{id:'talk',ic:'💬',t:'Parle {#} fois aux habitants du château',goal:5,v:talk}];
    const st=R().wk[w.key]=R().wk[w.key]||{};list.forEach(c=>{c.done=c.v>=c.goal;c.claimed=!!st[c.id]});return {w,list,st}}
  function challengesHTML(){const {w,list,st}=challenges();const n=list.filter(c=>c.claimed).length;
    return `<section class="rt-week"><div class="rt-wh"><b>🏆 <span>Défis de la semaine</span></b><small><span>Encore</span> <span>${w.left}</span> <span>${w.left>1?'jours':'jour'}</span></small></div>
      ${list.map(c=>{const p=Math.min(100,Math.round(c.v/c.goal*100));return `<div class="rt-ch${c.claimed?' ok':''}"><span class="rt-ci">${c.ic}</span><div><span>${c.t.replace('{#}',c.goal)}</span><div class="rt-bar"><i style="width:${p}%"></i></div><small>${Math.min(c.v,c.goal)} / ${c.goal}</small></div>${c.claimed?'<span class="rt-tick">✓</span>':c.done?`<button class="cs-btn" type="button" data-rt-claim="${c.id}">🪙 +40</button>`:''}</div>`}).join('')}
      <div class="rt-wfoot"><small>${n===4?'🎉 <span>Tous les défis réussis !</span>':`<span>Réussis les 4 défis pour un bonus de</span> 🪙 100`}</small><button class="rt-link" type="button" data-go="profile">📈 <span>Mes progrès</span></button></div></section>`}

  /* ---------- Test de niveau (2 minutes) ---------- */
  const T={on:false};
  function ltPool(lv){const out=[];try{lvUnits(lv).forEach(U=>{const d=setData(U.id);if(d)out.push(...d.filter(x=>x&&x.t&&x.s))})}catch(e){}return out}
  function ltStart(){const lvls=LEVEL_INFO.map(x=>x.id).filter(lv=>ltPool(lv).length>=8);if(!lvls.length){toast('Test indisponible pour cette langue');return}
    Object.assign(T,{on:true,lvls,ix:Math.min(1,lvls.length-1),end:Date.now()+120000,n:0,streak:0,stat:{},q:null,seen:new Set()});
    let root=document.getElementById('ltRoot');if(!root){root=document.createElement('div');root.id='ltRoot';document.body.appendChild(root)}document.body.style.overflow='hidden';
    T.timer=setInterval(ltTick,250);ltNext()}
  function ltQuestion(){const lv=T.lvls[T.ix],pool=ltPool(lv).filter(x=>!T.seen.has(x.t));const it=pool[Math.floor(Math.random()*pool.length)]||ltPool(lv)[0];T.seen.add(it.t);
    const others=shuffle(ltPool(lv).filter(x=>x.t!==it.t&&x.s!==it.s)).slice(0,3);const rev=Math.random()<.5;
    return rev?{lv,it,prompt:it.t,promptLang:S.tgt,opts:shuffle([it.s,...others.map(x=>x.s)]),ans:it.s,optLang:S.src}:{lv,it,prompt:it.s,promptLang:S.src,opts:shuffle([it.t,...others.map(x=>x.t)]),ans:it.t,optLang:S.tgt}}
  function ltNext(){if(!T.on)return;if(T.n>=15||Date.now()>=T.end)return ltDone();T.q=ltQuestion();ltDraw()}
  function ltDraw(sel){const root=document.getElementById('ltRoot');if(!root||!T.q)return;const q=T.q,left=Math.max(0,Math.ceil((T.end-Date.now())/1000));
    root.innerHTML=`<div class="lt"><div class="lt-top"><button class="x" type="button" data-lt="quit" aria-label="Quitter">✕</button><div class="lt-timer"><i id="ltBar" style="width:${left/1.2}%"></i></div><b id="ltSec">${left}s</b></div>
      <div class="lt-body"><span class="eyebrow">Test de positionnement · 2 min</span><p class="lt-n"><span>Question</span> ${T.n+1}</p>
      <div class="lt-prompt" lang="${q.promptLang}" data-noi18n>${E(q.prompt)}</div><p class="muted">${q.promptLang===S.tgt?'Que veut dire cette phrase ?':'Comment dit-on ceci ?'}</p>
      <div class="lt-opts">${q.opts.map((o,i)=>`<button type="button" class="opt${sel!=null?(o===q.ans?' right':i===sel?' wrong':''):''}" data-lt-opt="${i}" lang="${q.optLang}" data-noi18n ${sel!=null?'disabled':''}>${E(o)}</button>`).join('')}</div>
      <button class="rt-link" type="button" data-lt="skip">Je ne sais pas</button></div></div>`}
  function ltAnswer(i){const q=T.q;if(!q||q.answered)return;q.answered=true;const ok=i>=0&&q.opts[i]===q.ans;const s=T.stat[q.lv]=T.stat[q.lv]||{ok:0,n:0};s.n++;if(ok)s.ok++;T.n++;
    if(ok){T.streak++;if(T.streak>=2&&T.ix<T.lvls.length-1){T.ix++;T.streak=0}}else{T.streak=0;if(T.ix>0)T.ix--}
    ltDraw(i<0?-1:i);setTimeout(ltNext,i<0?250:650)}
  function ltTick(){if(!T.on)return;const left=Math.max(0,Math.ceil((T.end-Date.now())/1000));const b=document.getElementById('ltBar'),s=document.getElementById('ltSec');if(b)b.style.width=(left/1.2)+'%';if(s)s.textContent=left+'s';if(left<=0)ltDone()}
  function ltLevel(){let best=T.lvls[0];T.lvls.forEach(lv=>{const s=T.stat[lv];if(s&&s.ok>=2&&s.ok/s.n>=.6)best=lv});return best}
  function ltDone(){if(!T.on)return;T.on=false;clearInterval(T.timer);const lv=ltLevel(),info=LEVEL_INFO.find(x=>x.id===lv)||{n:''};R().lt[S.tgt]={lv,date:today()};try{save()}catch(e){}
    const tot=Object.values(T.stat).reduce((a,s)=>a+s.n,0),ok=Object.values(T.stat).reduce((a,s)=>a+s.ok,0);
    const root=document.getElementById('ltRoot');if(!root)return;
    root.innerHTML=`<div class="lt"><div class="lt-body lt-res">${typeof mascot==='function'?mascot('party'):''}<span class="eyebrow">Niveau de départ conseillé</span><div class="lt-lv">${lv}</div><p><b>${E(info.n)}</b></p><p class="muted"><span>${ok}</span> / <span>${tot}</span> <span>bonnes réponses</span></p><p class="muted lt-caveat">Ce test rapide mesure ta compréhension de mots et de phrases. Il sert à choisir où commencer ; ce n'est pas une évaluation officielle du CECRL.</p>
      <div class="lt-acts">${lv!==S.level?`<button class="btn good" type="button" data-lt-set="${lv}"><span>Commencer au niveau</span> ${lv}</button><button class="btn ghost" type="button" data-lt="quit"><span>Rester au niveau</span> ${E(S.level)}</button>`:`<button class="btn good" type="button" data-lt="quit"><span>Continuer au niveau</span> ${lv}</button>`}</div></div></div>`;
    try{confetti()}catch(e){}}
  function ltClose(){T.on=false;clearInterval(T.timer);const r=document.getElementById('ltRoot');if(r)r.innerHTML='';document.body.style.overflow='';try{render()}catch(e){}}

  /* ---------- Écran Apprendre : cartes du jour ---------- */
  function todayCards(){const c=R(),opened=c.chest[today()],can=dayXP(today())>0,w=wordOfDay(),wd=c.wotd[today()+S.tgt];
    let st=0;try{st=streak()}catch(e){}const hr=new Date().getHours(),risk=st>0&&!can&&hr>=17;
    let h='';
    if(risk)h+=`<button class="rt-risk" type="button" data-streak-info><span class="rt-ri">🔥</span><span><b><span>Ta série de</span> ${st} <span>${st>1?'jours':'jour'}</span> <span>t'attend !</span></b><small>${(S.shields||0)>0?`🛡️ <span>Un bouclier la protège si tu rates aujourd'hui.</span>`:'<span>Une leçon suffit pour la garder.</span>'}</small></span></button>`;
    h+=`<div class="rt-today">
      <button class="rt-card rt-chest${opened?' done':can?' ready':''}" type="button" data-rt="chest"><span class="rt-ic">${opened?'📦':'🎁'}</span><b>Coffre du jour</b><small>${opened?'Ouvert · reviens demain':can?'Prêt à ouvrir !':'Gagne des XP pour l\'ouvrir'}</small></button>
      ${w?`<button class="rt-card rt-wd${wd?' done':''}" type="button" data-rt="word"><span class="rt-ic">📖</span><b>Mot du jour</b><small class="rt-wprev" lang="${S.tgt}" data-noi18n>${E(w.t)}</small></button>`:''}</div>`;
    if(S.hearts<5)h+=`<button class="rt-hearts" type="button" data-act="review"><span class="rt-hi">❤️ <b>${S.hearts}</b>/5</span><span><b>Regagne tes cœurs en révisant</b><small>Chaque bonne réponse en révision te rend un cœur.</small></span><span class="rt-go">→</span></button>`;
    const lt=R().lt[S.tgt];if(!lt&&(S.lessons||0)<3)h+=`<button class="rt-test" type="button" data-rt="test"><span class="rt-ic">🎯</span><span><b>Tu as déjà des bases en ${E(L[S.tgt].n.toLowerCase())} ?</b><small>Test de positionnement facultatif · 2 minutes</small></span><span class="rt-go">→</span></button>`;
    return h}
  const prevPV=pathView;
  pathView=function(){let html=prevPV.apply(this,arguments);
    try{if(typeof view!=='undefined'&&view!=='learn')return html;if(typeof html!=='string'||!html.includes('learn3'))return html;
      const tpl=document.createElement('template');tpl.innerHTML=html;const R0=tpl.content;
      const stats=R0.querySelector('.l3-stats');if(stats){stats.insertAdjacentHTML('afterend',todayCards());const s=stats.querySelector('.l3-streak');if(s){s.setAttribute('data-streak-info','');s.setAttribute('role','button');s.setAttribute('tabindex','0')}}
      const castle=R0.querySelector('.l3-castle');const box=document.createElement('div');box.innerHTML=challengesHTML();(castle||stats).insertAdjacentElement('afterend',box.firstElementChild);
      const wrap=document.createElement('div');wrap.appendChild(R0.cloneNode(true));return wrap.innerHTML}catch(e){console.warn('return',e);return html}};

  /* ---------- Tableau de progrès (écran Progression) ---------- */
  if(typeof profileView==='function'){const prevP=profileView;profileView=function(){const h=prevP.apply(this,arguments);try{return board()+h}catch(e){console.warn('board',e);return h}}}
  function board(){const w=week(),sum=(ks,f)=>ks.reduce((a,k)=>a+((S.days[k]||{})[f]||0),0);
    const thisXP=sum(w.keys,'xp'),lastXP=sum(w.prev.slice().reverse().slice(0,w.keys.length),'xp'),diff=lastXP?Math.round((thisXP-lastXP)/lastXP*100):null;
    const srs=(typeof srsList==='function'?srsList():[]),mem=srs.length,mast=srs.filter(x=>(x.b||0)>=4).length,due=(typeof dueItems==='function'?dueItems().length:0);
    let st=0;try{st=streak()}catch(e){}const best=Math.max(S.bestStreak||0,st);
    const sk=window.CastellumSkills?CastellumSkills.all():[];const lt=R().lt[S.tgt];
    return `<section class="rt-board"><div class="section-head"><div><span class="eyebrow">Tableau de progrès</span><h2>📈 <span>Ma semaine</span></h2></div></div>
      <div class="rt-kpis">
        <div><b>${thisXP}</b><small>XP cette semaine</small>${diff!=null?`<em class="${diff>=0?'up':'down'}">${diff>=0?'▲':'▼'} ${Math.abs(diff)}%</em>`:''}</div>
        <div><b>${sum(w.keys,'lessons')}</b><small>leçons cette semaine</small></div>
        <div><b>${w.keys.filter(k=>dayXP(k)>0).length}/7</b><small>jours actifs</small></div>
        <div><b>${Math.round(sum(w.keys,'sec')/60)} min</b><small>de pratique</small></div>
        <div><b>🔥 ${st}</b><small><span>série · record</span> ${best}</small></div>
        <div><b>🛡️ ${S.shields||0}</b><small>boucliers</small></div></div>
      <p class="rt-xpnote">ℹ️ <span>Les XP mesurent ton activité, pas ton niveau de langue.</span></p><div class="rt-mem"><div><b>${mem}</b><small>mots en mémoire</small></div><div><b>${mast}</b><small>mots maîtrisés</small></div><div><b>${due}</b><small>à revoir aujourd'hui</small></div></div>
      ${sk.length?`<div class="rt-skills">${sk.map(x=>`<div class="rt-sk"><span>${x.sk.ic}</span><b>${E(x.sk.n)}</b><div class="rt-bar"><i style="width:${Math.round((x.lvl+(x.pct||0)/100)/x.max*100)}%"></i></div><small><span>niv.</span> ${x.lvl}</small></div>`).join('')}</div>`:''}
      <div class="rt-lt"><span>🎯</span><div>${lt?`<b><span>Niveau de départ conseillé :</span> ${lt.lv}</b><small>${new Date(lt.date+'T12:00').toLocaleDateString(S.src==='fr'?'fr-FR':S.src==='ary'?'fr-MA':S.src,{day:'numeric',month:'long',year:'numeric'})}</small>`:`<b>Test de positionnement</b><small>2 minutes pour choisir où commencer</small>`}</div><button class="cs-btn" type="button" data-rt="test">${lt?'Refaire':'Commencer'}</button></div>
    </section>${challengesHTML()}`}

  /* ---------- Cœurs regagnés en révisant ---------- */
  if(typeof grade==='function'){const prevG=grade;grade=function(ok){const r=prevG.apply(this,arguments);
    try{if(ok&&LX&&LX.mode==='game'&&LX.game==='review'&&S.hearts<5){S.hearts++;if(S.hearts>=5)S.heartsAt=Date.now();save();const h=document.getElementById('lxHearts');if(h){h.innerHTML=`❤️ ${S.hearts}/5`;h.classList.remove('rt-pop');void h.offsetWidth;h.classList.add('rt-pop')}}}catch(e){}return r}}

  /* ---------- Clics ---------- */
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-rt],[data-rt-claim],[data-lt],[data-lt-opt],[data-lt-set]');if(!t)return;e.preventDefault();const d=t.dataset,c=R();
    if(d.rt==='chest')return openChest();
    if(d.rt==='word')return openWord();
    if(d.rt==='learnword'){const k=today()+S.tgt;if(!c.wotd[k]){c.wotd[k]=1;const w=wordOfDay();try{if(w&&typeof srsUpdate==='function')srsUpdate(w,true)}catch(err){}if(coinsOn)earn(5,'Mot du jour');else{try{save()}catch(err){}}}closeSheet();render();return}
    if(d.rt==='saveword'){const w=wordOfDay();if(!w)return;const ix=S.saved.findIndex(x=>x.t===w.t&&x.lang===S.tgt);if(ix>=0)S.saved.splice(ix,1);else S.saved.unshift({s:w.s,t:w.t,p:w.p,lang:S.tgt});try{save()}catch(err){}openWord();return}
    if(d.rt==='test'){closeSheet();return ltStart()}
    if(d.rtClaim){const {w,list,st}=challenges();const ch=list.find(x=>x.id===d.rtClaim);if(!ch||!ch.done||st[ch.id])return;st[ch.id]=1;earn(40,'Défi de la semaine');
      if(list.every(x=>x.id===ch.id||st[x.id])&&!st.bonus){st.bonus=1;setTimeout(()=>{earn(100,'Tous les défis de la semaine !');try{confetti()}catch(err){}},600)}try{save()}catch(err){}render();return}
    if(d.ltOpt!=null)return ltAnswer(+d.ltOpt);
    if(d.lt==='skip')return ltAnswer(-1);
    if(d.lt==='quit')return ltClose();
    if(d.ltSet){try{setLevel(d.ltSet);save();render.scrolled=false}catch(err){}ltClose();try{go('learn')}catch(err){}toast(`🎯 ${d.ltSet}`);return}
  });
  document.addEventListener('keydown',e=>{if(!T.on)return;if(e.key==='Escape')ltClose();const n=+e.key;if(n>=1&&n<=4&&T.q&&!T.q.answered)ltAnswer(n-1)});
  window.CastellumReturn={chestReward,wordOfDay,challenges,ltStart,ltClose,board};

  const css=document.createElement('style');css.id='castellum-return-css';css.textContent=`
.rt-today{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rt-card{border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:18px;padding:12px;display:grid;justify-items:start;gap:2px;font:inherit;text-align:left;cursor:pointer;min-width:0}
.rt-card b{font-size:.95rem}.rt-card small{color:var(--ink-2);font-size:.78rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-ic{font-size:1.8rem;line-height:1}
.rt-chest.ready{border-color:#f4b73b;background:color-mix(in srgb,#f4b73b 14%,var(--surface));animation:rtWiggle 2.4s ease-in-out infinite}
.rt-chest.done,.rt-wd.done{opacity:.75}
.rt-wprev{font-weight:900;color:var(--accent)!important;font-size:.9rem!important}
@keyframes rtWiggle{0%,80%,100%{transform:none}84%{transform:rotate(-3deg)}88%{transform:rotate(3deg)}92%{transform:rotate(-2deg)}}
.rt-risk,.rt-hearts,.rt-test{display:flex;align-items:center;gap:12px;width:100%;border:2px solid var(--line);background:var(--surface);color:var(--ink);border-radius:18px;padding:12px 14px;font:inherit;text-align:left;cursor:pointer}
.rt-risk{border-color:#F08A24;background:color-mix(in srgb,#F08A24 12%,var(--surface))}.rt-ri{font-size:2rem;animation:rtWiggle 2s infinite}
.rt-risk b,.rt-hearts b,.rt-test b{display:block}.rt-risk small,.rt-hearts small,.rt-test small{display:block;color:var(--ink-2);font-size:.8rem}
.rt-hearts{border-color:color-mix(in srgb,var(--bad) 45%,var(--line))}.rt-hi{font-size:1.1rem;white-space:nowrap}.rt-hi b{display:inline!important}
.rt-test{border-color:var(--accent);background:var(--accent-soft)}.rt-go{margin-left:auto;font-weight:900;color:var(--accent)}
.rt-week,.rt-board{background:var(--surface);border:2px solid var(--line);border-radius:20px;padding:14px;display:grid;gap:10px}
.rt-wh{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.rt-wh small{color:var(--ink-2);font-weight:800}
.rt-ch{display:flex;align-items:center;gap:10px}.rt-ch>div{flex:1;min-width:0}.rt-ch small{color:var(--ink-2);font-size:.74rem}
.rt-ci{font-size:1.4rem}.rt-ch.ok{opacity:.65}.rt-tick{color:var(--good);font-weight:900;font-size:1.2rem}
.rt-bar{height:8px;border-radius:99px;background:var(--surface-2);overflow:hidden;margin:3px 0}.rt-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#7b2cbf)}
.rt-wfoot{display:flex;justify-content:space-between;align-items:center;gap:8px;color:var(--ink-2)}
.rt-link{border:0;background:none;color:var(--accent);font:inherit;font-weight:900;cursor:pointer;padding:4px}
.rt-sheet{display:grid;gap:10px;justify-items:center;text-align:center}
.rt-word{font-size:2rem;font-weight:900;color:var(--accent)}.rt-wtr{font-size:1.1rem;font-weight:800;margin:0}
.rt-acts{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.rt-chest-anim{position:relative;height:110px;width:110px}
.rt-box{position:absolute;inset:0;font-size:5rem;display:grid;place-items:center;animation:rtShake .7s ease-in-out,rtGone .3s .7s forwards}
.rt-prize{position:absolute;inset:0;font-size:4.4rem;display:grid;place-items:center;opacity:0;animation:rtPop .6s .75s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes rtShake{20%{transform:rotate(-12deg)}40%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
@keyframes rtGone{to{opacity:0;transform:scale(1.6)}}@keyframes rtPop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:none}}
#ltRoot:empty{display:none}#ltRoot{position:fixed;inset:0;z-index:80;background:var(--bg)}
.lt{max-width:560px;margin:0 auto;height:100%;display:flex;flex-direction:column;padding:12px 16px}
.lt-top{display:flex;align-items:center;gap:10px}.lt-top .x{border:0;background:none;font-size:1.3rem;color:var(--ink-2);cursor:pointer}
.lt-timer{flex:1;height:12px;border-radius:99px;background:var(--surface-2);overflow:hidden}.lt-timer i{display:block;height:100%;background:linear-gradient(90deg,var(--good),#f4b73b);transition:width .25s linear}
.lt-body{flex:1;display:grid;align-content:start;gap:12px;padding-top:18px}
.lt-n{margin:0;color:var(--ink-2);font-weight:800}.lt-prompt{font-size:1.6rem;font-weight:900;background:var(--surface);border:2px solid var(--line);border-radius:18px;padding:16px;text-align:center}
.lt-opts{display:grid;gap:10px}.lt-opts .opt{text-align:left;padding:14px;border-radius:16px;font:inherit;font-weight:800}
.lt-res{justify-items:center;text-align:center;align-content:center}.lt-lv{font-size:4rem;font-family:var(--display);color:var(--accent);line-height:1}
.lt-acts{display:grid;gap:10px;width:100%}
.lt-caveat{font-size:.82rem;max-width:420px}
.lt-res .mascot{width:130px!important;height:auto!important}
.rt-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.rt-kpis>div,.rt-mem>div{background:var(--bg);border-radius:14px;padding:10px;display:grid;gap:2px;text-align:center}
.rt-kpis b,.rt-mem b{font-size:1.15rem}.rt-kpis small,.rt-mem small{color:var(--ink-2);font-size:.72rem;font-weight:800}
.rt-kpis em{font-style:normal;font-size:.74rem;font-weight:900}.rt-kpis em.up{color:var(--good)}.rt-kpis em.down{color:var(--bad)}
.rt-xpnote{margin:0;font-size:.8rem;color:var(--ink-2);font-weight:700}
.rt-mem{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.rt-skills{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.rt-sk{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:2px 6px;background:var(--bg);border-radius:12px;padding:8px}
.rt-sk .rt-bar{grid-column:1/-1}.rt-sk b{font-size:.8rem}.rt-sk small{color:var(--ink-2);font-size:.72rem}
.rt-lt{display:flex;align-items:center;gap:10px;background:var(--accent-soft);border-radius:14px;padding:10px}.rt-lt>div{flex:1}.rt-lt b,.rt-lt small{display:block}.rt-lt small{color:var(--ink-2)}
.rt-pop{animation:rtHeart .5s}@keyframes rtHeart{50%{transform:scale(1.4)}}
.learn3 .l3-streak{cursor:pointer}
@media (prefers-reduced-motion:reduce){.rt-chest.ready,.rt-ri,.rt-box,.rt-prize{animation:none!important}.rt-prize{opacity:1}.rt-box{display:none}}
`;document.head.appendChild(css);
  try{if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
