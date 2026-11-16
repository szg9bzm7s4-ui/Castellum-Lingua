/* Étape 4 : la section Château (onglet 🏰).
   Pièces gagnées avec l'XP, habitants qui parlent la langue apprise, décorations à acheter,
   album de collection, visite des amis avec cadeau, siège du week-end et fête des 7 jours. */
(function(){
  if(typeof pathView!=='function'||!window.CastellumDomain50||typeof window.KingdomWorld!=='function')return;
  const D=window.CastellumDomain50;
  const st=()=>{const c=S.cst=S.cst||{};c.spent=c.spent||0;c.bonus=c.bonus||0;c.deco=c.deco||{};c.hide=c.hide||{};c.talk=c.talk||{};c.gift=c.gift||{};c.siege=c.siege||{};c.feast=c.feast||{};return c};
  const coins=()=>{const c=st();return Math.max(0,Math.floor((S.xp||0)/5)+c.bonus-c.spent)};
  const earn=(n,why)=>{st().bonus+=n;try{save()}catch(e){}try{toast(`🪙 +${n} · ${why}`)}catch(e){}};
  const today=()=>{try{return dk(new Date())}catch(e){return new Date().toISOString().slice(0,10)}};
  const key=()=>(S.castleStyle&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval';
  const lvl=()=>D.progress().level;
  const e=s=>typeof esc==='function'?esc(s):String(s);

  /* ---------- Habitants ---------- */
  const PEOPLE=[
    {id:'jardinier',ic:'🧑‍🌾',n:'Le jardinier',lv:1},{id:'boulangere',ic:'👩‍🍳',n:'La boulangère',lv:3},
    {id:'garde',ic:'💂',n:'Le garde',lv:6},{id:'marchande',ic:'🧕',n:'La marchande',lv:11},
    {id:'forgeron',ic:'👨‍🏭',n:'Le forgeron',lv:16},{id:'bibliothecaire',ic:'🧑‍🏫',n:'La bibliothécaire',lv:18},
    {id:'pecheur',ic:'🎣',n:'Le pêcheur',lv:26},{id:'musicien',ic:'🧑‍🎤',n:'Le musicien',lv:32},
    {id:'dame',ic:'👸',n:'La dame du palais',lv:37},{id:'roi',ic:'🤴',n:'Le souverain',lv:45}];
  function pool(){let p=[];try{p=learnedItems()}catch(e){}
    if(!p.length){try{const U=lvUnits(S.level||'A1')[0];p=(setData(U.id)||[]).slice(0,4)}catch(e){}}
    return p.filter(x=>x&&x.t)}
  function phraseFor(i){const p=pool();if(!p.length)return null;const n=Math.floor(Date.now()/864e5);return p[(n*3+i*7)%p.length]}

  /* ---------- Décorations ---------- */
  const DECO=[
    {id:'fleurs',ic:'🌷',n:'Parterre de fleurs',p:40,x:20,y:56},{id:'arbre',ic:'🌳',n:'Grand chêne',p:60,x:31,y:70},
    {id:'puits',ic:'⛲',n:'Fontaine fleurie',p:90,x:66,y:73},{id:'cheval',ic:'🐴',n:'Écurie et cheval',p:120,x:80,y:58},
    {id:'lanternes',ic:'🏮',n:'Lanternes',p:150,x:44,y:80},{id:'paon',ic:'🦚',n:'Paon du jardin',p:200,x:27,y:44},
    {id:'tente',ic:'🎪',n:'Tente de foire',p:260,x:74,y:42},{id:'statue',ic:'🗿',n:'Statue ancienne',p:320,x:56,y:86},
    {id:'manege',ic:'🎠',n:'Manège',p:420,x:13,y:62},{id:'montgolfiere',ic:'🎈',n:'Montgolfière',p:520,x:84,y:20},
    {id:'roue',ic:'🎡',n:'Grande roue',p:700,x:88,y:66},{id:'dragon',ic:'🐉',n:'Dragon gardien',p:1000,x:16,y:24}];

  /* ---------- Siège du week-end ---------- */
  const SIEGE_GOAL=60;
  function siege(){const d=new Date(),dow=d.getDay();const sat=new Date(d);if(dow===0)sat.setDate(d.getDate()-1);else if(dow!==6)sat.setDate(d.getDate()+((6-dow+7)%7));
    const sun=new Date(sat);sun.setDate(sat.getDate()+1);const k=dk(sat);const xp=((S.days[k]||{}).xp||0)+((S.days[dk(sun)]||{}).xp||0);
    const days=dow===6||dow===0?0:(6-dow);return {k,on:dow===6||dow===0,xp,won:xp>=SIEGE_GOAL,days}}
  function checkEvents(){const c=st();const s=siege();
    if(s.on&&s.won&&!c.siege[s.k]){c.siege[s.k]=1;earn(50,'Siège repoussé !');try{confetti()}catch(e){}}
    let sk=0;try{sk=streak()}catch(e){}const m=Math.floor(sk/7)*7;
    return {s,sk,feastReady:m>=7&&!c.feast[m],m}}

  /* ---------- Amis ---------- */
  const styleOf=id=>{const ks=Object.keys(CASTLE_STYLE_DATA);let h=0;for(const ch of String(id))h=(h*31+ch.charCodeAt(0))>>>0;return ks[h%ks.length]};
  const levelOf=xp=>{let l=1;D.thresholds.forEach((t,i)=>{if(xp>=t)l=i+1});return Math.min(50,l)};

  function overlay(ev){const c=st();let h='';
    DECO.forEach(d=>{if(c.deco[d.id]&&!c.hide[d.id])h+=`<span class="cs-deco" style="left:${d.x}%;top:${d.y}%">${d.ic}</span>`});
    if(ev&&ev.s.on&&!ev.s.won)h+=`<span class="cs-camp" style="left:6%;top:80%">⛺</span><span class="cs-camp" style="left:12%;top:88%">🏴</span><span class="cs-camp" style="left:92%;top:84%">⛺</span><span class="cs-camp cs-arrow" style="left:22%;top:70%">🏹</span>`;
    if(ev&&ev.sk>=7)h+=`<span class="cs-fest" style="left:30%;top:10%">🎆</span><span class="cs-fest" style="left:62%;top:6%">🎇</span><span class="cs-fest" style="left:48%;top:16%">🎉</span>`;
    return h}

  function castleView(){
    const ev=checkEvents(),c=st(),d=D.progress(),lv=d.level,money=coins();
    if(Cloud&&Cloud.signedIn&&typeof Social!=='undefined'&&!Social.loaded&&!Social.loading)queueMicrotask(()=>{try{Social.load()}catch(e){}});
    if(giftsOK())queueMicrotask(()=>{claimGifts()});
    const world=window.KingdomWorld(key(),lv,{anim:true,label:'Mon royaume'});
    const name=String(D.names[d.ix]||'').replace(/ \(touche[^)]*\)/,'');
    // événement du moment
    let evHTML='';
    if(ev.feastReady)evHTML=`<section class="cs-event fest"><span class="cs-ev-ic">🎉</span><div><b>Fête au château !</b><small><span>${ev.m}</span> <span>jours de suite : tout le royaume fait la fête.</span></small></div><button class="btn sm" type="button" data-cs="feast">🪙 +30</button></section>`;
    else if(ev.s.on)evHTML=`<section class="cs-event ${ev.s.won?'won':'siege'}"><span class="cs-ev-ic">${ev.s.won?'🛡️':'⚔️'}</span><div><b>${ev.s.won?'Siège repoussé !':'Ton château est assiégé !'}</b><small>${ev.s.won?'Les envahisseurs sont partis. Bravo, défenseur !':'Gagne de l\'XP ce week-end pour repousser les envahisseurs.'}</small><div class="cs-bar"><i style="width:${Math.min(100,Math.round(ev.s.xp/SIEGE_GOAL*100))}%"></i></div><small><span>${Math.min(ev.s.xp,SIEGE_GOAL)}</span> / <span>${SIEGE_GOAL}</span> XP</small></div>${ev.s.won?'':`<button class="btn sm" type="button" data-cs="defend">⚔️ <span>Défendre</span></button>`}</section>`;
    else evHTML=`<section class="cs-event soon"><span class="cs-ev-ic">🏴</span><div><b>Un siège se prépare…</b><small><span>Les envahisseurs arrivent samedi. Dans</span> <span>${ev.s.days}</span> <span>${ev.s.days>1?'jours':'jour'}</span>.</small></div></section>`;
    if(!ev.feastReady&&ev.sk>=7&&!ev.s.on)evHTML+=`<section class="cs-event fest"><span class="cs-ev-ic">🎆</span><div><b>Le royaume est en fête</b><small><span>Série de</span> <span>${ev.sk}</span> <span>jours : continue pour garder les feux d'artifice !</span></small></div></section>`;
    // habitants
    const people=PEOPLE.map((p,i)=>{const open=lv>=p.lv,talked=c.talk[today()+':'+p.id];
      return `<button type="button" class="cs-person${open?'':' locked'}" ${open?`data-cs-talk="${i}"`:'disabled'}><span class="cs-p-ic">${open?p.ic:'🔒'}</span><b>${open?p.n:'???'}</b><small>${open?(talked?'✓':'💬'):`<span>niv.</span> <span>${p.lv}</span>`}</small></button>`}).join('');
    // boutique
    const shop=DECO.map(dc=>{const own=!!c.deco[dc.id],shown=own&&!c.hide[dc.id];
      return `<div class="cs-item${own?' own':''}"><span class="cs-i-ic">${dc.ic}</span><b>${dc.n}</b>${own?`<button type="button" class="cs-btn ghost" data-cs-place="${dc.id}">${shown?'Ranger':'Placer'}</button>`:`<button type="button" class="cs-btn" data-cs-buy="${dc.id}"${money<dc.p?' disabled':''}>🪙 ${dc.p}</button>`}</div>`}).join('');
    // amis
    let friends='';
    if(!(Cloud&&Cloud.signedIn))friends=`<div class="cs-empty"><p>Connecte-toi pour visiter les royaumes de tes amis et recevoir leurs cadeaux.</p><button class="btn sm" type="button" data-go="account">Se connecter</button></div>`;
    else{const F=((Social.dashboard||{}).friends)||[];
      friends=F.length?F.slice(0,12).map(f=>{const gl=c.gift[today()+':'+f.id];return `<div class="cs-friend">${typeof socialAvatar==='function'?socialAvatar(f,36):'👤'}<div><b>${e(f.display_name||f.username||'Ami')}</b><small>🏰 <span>niv.</span> <span>${levelOf(f.total_xp||0)}</span></small></div><button type="button" class="cs-btn" data-cs-visit="${e(f.id)}">${gl?'👀':'🎁'} <span>Visiter</span></button></div>`}).join('')
        :`<div class="cs-empty"><p>Ajoute des amis pour visiter leurs royaumes.</p><button class="btn sm" type="button" data-go="friends">👥 <span>Amis</span></button></div>`}
    const owned=DECO.filter(x=>c.deco[x.id]).length,met=PEOPLE.filter(p=>lv>=p.lv).length;
    return `<div class="cs-view">
      <div class="cs-head"><h1>🏰 <span>Mon château</span></h1><span class="cs-coins" title="Pièces">🪙 <b>${money}</b></span></div>
      <section class="cs-world"><div class="cs-art" data-rq-open role="button" tabindex="0" aria-label="Mon royaume">${world}${overlay(ev)}</div>
        <div class="cs-cap"><div><small><span>Niveau</span> <span>${lv}</span>/50</small><b>${e(name)}</b></div><button type="button" class="cs-btn ghost" data-cs="album">📖 <span>Album</span> <small>${met+owned+lv}/<span>${PEOPLE.length+DECO.length+50}</span></small></button></div></section>
      ${evHTML}
      <section class="cs-card"><h2>👥 <span>Les habitants</span></h2><p class="muted">Touche un habitant : il te parle dans la langue que tu apprends.</p><div class="cs-people">${people}</div></section>
      <section class="cs-card"><h2>🛍️ <span>Décorations</span></h2><p class="muted">Achète des décorations avec tes pièces et place-les dans ton royaume.</p><div class="cs-shop">${shop}</div>
        <p class="cs-how">🪙 <span>Tu gagnes 1 pièce tous les 5 XP, et des pièces en bonus en parlant aux habitants, en visitant tes amis, en repoussant les sièges et pendant les fêtes.</span></p></section>
      <section class="cs-card"><h2>🤝 <span>Visiter mes amis</span></h2><p class="muted">Chaque jour, chaque ami te fait un cadeau quand tu visites son royaume.</p><div class="cs-friends">${friends}</div></section>
    </div>`}

  /* ---------- Vrais cadeaux entre amis (supabase/castle_gifts.sql) ---------- */
  const GIFT={off:false,last:0,sent:new Set()};
  const giftsOK=()=>!GIFT.off&&typeof Cloud!=='undefined'&&Cloud.signedIn&&!!Cloud.client;
  const rpc=async(n,a)=>{const {data,error}=await Cloud.client.rpc(n,a||{});if(error)throw error;return data};
  const missing=e=>/castle_|PGRST202|42883|does not exist|Could not find the function/i.test(String((e&&(e.code||''))+' '+(e&&e.message||'')));
  async function claimGifts(){if(!giftsOK()||Date.now()-GIFT.last<60000)return;GIFT.last=Date.now();
    try{const s=await rpc('castle_gift_status');((s&&s.sent_today)||[]).forEach(id=>GIFT.sent.add(String(id)));
      const r=await rpc('castle_claim_gifts');
      if(r&&r.count>0){const c=st();c.bonus+=r.coins||0;try{save()}catch(e){}try{if(typeof view!=='undefined'&&view==='castle')render()}catch(err){}
        const who=(r.from||[]).map(n=>`<b data-noi18n>${e(n)}</b>`).join(', ');
        openSheet(`<div class="cs-sheet" style="text-align:center;justify-items:center"><span class="cs-big">🎁</span><h2>Tes amis t'ont envoyé des cadeaux !</h2><p>${who}</p><div class="cs-gift">🪙 +${r.coins}</div><button class="btn" type="button" data-act="closesheet">Merci !</button></div>`);
        setTimeout(()=>{try{confetti()}catch(err){}},300)}
    }catch(err){if(missing(err))GIFT.off=true;else GIFT.last=0}}
  async function sendGift(id){if(!giftsOK())return;
    try{const r=await rpc('castle_send_gift',{p_to:id});
      if(r&&r.sent){GIFT.sent.add(String(id));toast('🎁 Cadeau envoyé !')}
      else if(r&&r.reason==='already_sent'){GIFT.sent.add(String(id));toast('Tu lui as déjà offert un cadeau aujourd\'hui')}
      else if(r&&r.reason==='daily_limit')toast('Tu as déjà offert 5 cadeaux aujourd\'hui');
    }catch(err){if(missing(err)){GIFT.off=true;toast('Les cadeaux entre amis ne sont pas encore activés')}else toast('Impossible d\'envoyer le cadeau. Réessaie.')}
    visit(id,true)}

  /* ---------- Fenêtres ---------- */
  function talk(i){const p=PEOPLE[i],ph=phraseFor(i),c=st(),k=today()+':'+p.id;
    const tg=S.tgt,said=ph?`<div class="cs-say" lang="${tg}" data-noi18n>${e(ph.t)}${ph.p?`<small>${e(ph.p)}</small>`:''}</div><div class="cs-tr" hidden data-noi18n>${e(ph.s||'')}</div>`:'';
    openSheet(`<div class="cs-sheet"><div class="cs-talker"><span class="cs-big">${p.ic}</span><div><small class="eyebrow">${p.n}</small><b>${ph?'Écoute ce que je dis :':'Bonjour, voyageur !'}</b></div></div>
      ${said}
      <div class="cs-actions">${ph?`<button class="btn ghost" type="button" data-cs-say="${i}">🔊 <span>Écouter</span></button><button class="btn ghost" type="button" data-cs="reveal">👀 <span>Traduction</span></button>`:''}
      ${c.talk[k]?`<button class="btn" type="button" data-act="closesheet">✓ <span>À demain !</span></button>`:`<button class="btn good" type="button" data-cs-ok="${i}">✓ <span>Compris</span> · 🪙 +2</button>`}</div></div>`);
    if(ph)setTimeout(()=>{try{speak(ph.t)}catch(e){}},250)}
  function album(){const c=st(),lv=lvl();
    const grid=(arr)=>`<div class="cs-album">${arr.map(([ok,ic,n])=>`<div class="cs-a${ok?'':' locked'}"><span>${ok?ic:'❔'}</span><small>${ok?n:'???'}</small></div>`).join('')}</div>`;
    const builds=D.names.map((n,i)=>[i<lv,D.icons[i],String(n).replace(/ \(touche[^)]*\)/,'')]);
    const sieges=Object.keys(c.siege).length,feasts=Object.keys(c.feast).length;
    const trophies=[[sieges>=1,'🛡️','Premier siège repoussé'],[sieges>=4,'⚔️','4 sièges repoussés'],[sieges>=12,'🏆','12 sièges repoussés'],[feasts>=1,'🎉','Première fête'],[feasts>=4,'🎆','Fête d\'un mois'],[feasts>=12,'👑','Trois mois de fêtes']];
    openSheet(`<div class="cs-sheet"><div class="section-head"><h2>📖 <span>Album du royaume</span></h2><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
      <h3>👥 <span>Habitants</span> <small>${PEOPLE.filter(p=>lv>=p.lv).length}/${PEOPLE.length}</small></h3>${grid(PEOPLE.map(p=>[lv>=p.lv,p.ic,p.n]))}
      <h3>🛍️ <span>Décorations</span> <small>${DECO.filter(x=>c.deco[x.id]).length}/${DECO.length}</small></h3>${grid(DECO.map(x=>[!!c.deco[x.id],x.ic,x.n]))}
      <h3>🏆 <span>Trophées</span> <small>${trophies.filter(t=>t[0]).length}/${trophies.length}</small></h3>${grid(trophies)}
      <h3>🏗️ <span>Bâtiments</span> <small>${lv}/50</small></h3>${grid(builds)}</div>`)}
  function visit(id,again){const F=((Social.dashboard||{}).friends)||[];const f=F.find(x=>String(x.id)===String(id));if(!f)return;const c=st(),k=today()+':'+f.id;
    const given=Object.keys(c.gift).filter(x=>x.startsWith(today())).length;let gift='';
    if(!again&&!c.gift[k]&&given<5){c.gift[k]=1;st().bonus+=10;try{save()}catch(e){}gift=`<div class="cs-gift">🎁 <b><span>Cadeau de</span> ${e(f.display_name||f.username||'')}</b> · 🪙 +10</div>`;setTimeout(()=>{try{confetti()}catch(e){}},300)}
    else if(c.gift[k]&&!again)gift=`<p class="muted">Tu as déjà reçu son cadeau aujourd'hui. Reviens demain !</p>`;
    const L=levelOf(f.total_xp||0),s=styleOf(f.id);
    openSheet(`<div class="cs-sheet"><div class="section-head"><h2>🏰 <span>Royaume de</span> ${e(f.display_name||f.username||'')}</h2><button class="icon-btn" type="button" data-act="closesheet" aria-label="Fermer">✕</button></div>
      <div class="cs-art small">${window.KingdomWorld(s,L,{anim:true,label:'Royaume'})}</div>
      <p><span>Niveau</span> ${L}/50 · ${CASTLE_STYLE_DATA[s].icon} ${CASTLE_STYLE_DATA[s].name} · 🔥 ${f.current_streak||0}</p>${gift}
      ${giftsOK()?(GIFT.sent.has(String(f.id))?`<p class="muted">✓ <span>Cadeau envoyé aujourd'hui</span></p>`:`<button class="btn good" type="button" data-cs-send="${e(f.id)}">🎁 <span>Offrir 10 pièces à</span> <b data-noi18n>${e(f.display_name||f.username||'')}</b></button>`):''}
      <div class="cs-actions"><button class="btn" type="button" data-act="closesheet">Retour à mon château</button></div></div>`);
    setTimeout(()=>{try{if(typeof view!=='undefined'&&view==='castle')render()}catch(e){}},50)}

  document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('[data-cs-send],[data-cs],[data-cs-talk],[data-cs-buy],[data-cs-place],[data-cs-say],[data-cs-ok],[data-cs-visit]');if(!t)return;
    ev.preventDefault();const c=st(),ds=t.dataset;
    if(ds.csTalk!=null)return talk(+ds.csTalk);
    if(ds.csSay!=null){const ph=phraseFor(+ds.csSay);if(ph)try{speak(ph.t)}catch(e){}return}
    if(ds.csOk!=null){const p=PEOPLE[+ds.csOk],k=today()+':'+p.id;if(!c.talk[k]){c.talk[k]=1;earn(2,p.n)}closeSheet();render();return}
    if(ds.csBuy){const d=DECO.find(x=>x.id===ds.csBuy);if(!d||c.deco[d.id])return;if(coins()<d.p){toast('Il te manque des pièces');return}c.deco[d.id]=1;c.spent+=d.p;try{save()}catch(e){}toast(`${d.ic} ${d.n} · ✓`);try{confetti()}catch(e){}render();return}
    if(ds.csPlace){c.hide[ds.csPlace]=!c.hide[ds.csPlace];try{save()}catch(e){}render();return}
    if(ds.csSend){t.disabled=true;return sendGift(ds.csSend)}
    if(ds.csVisit)return visit(ds.csVisit);
    if(ds.cs==='reveal'){const r=document.querySelector('.cs-tr');if(r)r.hidden=!r.hidden;return}
    if(ds.cs==='album')return album();
    if(ds.cs==='feast'){const ev2=checkEvents();if(ev2.feastReady){c.feast[ev2.m]=1;earn(30,'Fête au château !');try{confetti()}catch(e){}}render();return}
    if(ds.cs==='defend'){go('learn');setTimeout(()=>{const b=document.querySelector('.l3-continue,.today-btn.main');if(b)b.click()},120);return}
  });

  // Branchement : nouvel onglet 🏰 Château
  try{I.castle='<path d="M4 21V9l2 1V6h3v3h2V5h2v4h2V6h3v4l2-1v12z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>';
    if(!NAV_BASE.some(n=>n[0]==='castle'))NAV_BASE.splice(1,0,['castle','Château']);NAV_SET()}catch(e){}
  const prevPV=pathView;
  pathView=function(){if(typeof view!=='undefined'&&view==='castle'){try{return castleView()}catch(e){console.warn('castle',e)}}return prevPV.apply(this,arguments)};
  // Sur l'écran Apprendre, toucher le nom du château ouvre la section Château.
  document.addEventListener('click',ev=>{const t=ev.target.closest&&ev.target.closest('.l3-c-info');if(!t)return;ev.preventDefault();go('castle')});
  document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&document.activeElement&&document.activeElement.classList.contains('l3-c-info')){ev.preventDefault();go('castle')}});
  window.CastellumCastle={coins,earn,PEOPLE,DECO,siege,view:castleView};

  const css=document.createElement('style');css.id='castellum-castle-view-css';css.textContent=`
.cs-view{display:grid;gap:14px;padding-bottom:20px}
.cs-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cs-head h1{margin:0;font-family:var(--display);font-weight:400;font-size:1.7rem}
.cs-coins{background:linear-gradient(135deg,#ffe08a,#f4b73b);color:#5a3a00;border-radius:99px;padding:7px 14px;font-weight:900;box-shadow:0 3px 0 #c98d17;white-space:nowrap}
.cs-world{background:var(--surface);border:2px solid var(--line);border-radius:22px;overflow:hidden}
.cs-art{position:relative;aspect-ratio:556/318;cursor:pointer;background:#cfe3f3}
.cs-art .kw-svg{position:absolute;inset:0}
.cs-art.small{border-radius:16px;overflow:hidden;cursor:default;margin:8px 0}
.cs-deco,.cs-camp,.cs-fest{position:absolute;transform:translate(-50%,-50%);font-size:clamp(1.1rem,5vw,1.6rem);pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));animation:csBob 3s ease-in-out infinite}
.cs-camp{animation:none}.cs-arrow{animation:csShoot 1.6s ease-in infinite}
.cs-fest{animation:csFest 1.8s ease-in-out infinite}
@keyframes csBob{50%{transform:translate(-50%,-58%)}}
@keyframes csShoot{0%{opacity:0;transform:translate(-50%,-50%)}30%{opacity:1}100%{opacity:0;transform:translate(60%,-120%)}}
@keyframes csFest{0%,100%{transform:translate(-50%,-50%) scale(.8);opacity:.6}50%{transform:translate(-50%,-50%) scale(1.15);opacity:1}}
.cs-cap{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px}
.cs-cap small{color:var(--ink-2);font-weight:800;font-size:.76rem;display:block}.cs-cap b{font-size:1.05rem}
.cs-btn{border:2px solid var(--accent);background:var(--accent);color:#fff;border-radius:12px;padding:7px 10px;font:inherit;font-weight:900;font-size:.85rem;cursor:pointer;white-space:nowrap}
.cs-btn.ghost{background:var(--surface);color:var(--accent)}.cs-btn small{opacity:.75;font-size:.72rem}
.cs-btn:disabled{opacity:.45;cursor:not-allowed}
.cs-event{display:flex;align-items:center;gap:12px;border-radius:18px;padding:12px 14px;border:2px solid var(--line);background:var(--surface)}
.cs-event>div{flex:1;min-width:0}.cs-event b{display:block}.cs-event small{display:block;color:var(--ink-2);font-size:.8rem}
.cs-ev-ic{font-size:2rem}
.cs-event.siege{border-color:#e05a47;background:color-mix(in srgb,#e05a47 10%,var(--surface))}
.cs-event.won{border-color:var(--good);background:color-mix(in srgb,var(--good) 10%,var(--surface))}
.cs-event.fest{border-color:#f4b73b;background:color-mix(in srgb,#f4b73b 14%,var(--surface))}
.cs-bar{height:8px;border-radius:99px;background:var(--surface-2);overflow:hidden;margin:6px 0 3px}.cs-bar i{display:block;height:100%;background:linear-gradient(90deg,#e05a47,#f4b73b)}
.cs-card{background:var(--surface);border:2px solid var(--line);border-radius:20px;padding:14px}
.cs-card h2{margin:0 0 2px;font-size:1.15rem}.cs-card>.muted{margin:0 0 10px;font-size:.85rem}
.cs-people{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.cs-person{border:2px solid var(--line);background:var(--bg);color:var(--ink);border-radius:16px;padding:8px 2px;font:inherit;cursor:pointer;display:grid;justify-items:center;gap:2px;text-align:center}
.cs-person b{font-size:.62rem;line-height:1.1;min-height:2.2em}.cs-person small{font-size:.7rem;color:var(--ink-2)}
.cs-p-ic{font-size:1.7rem}.cs-person.locked{opacity:.5;cursor:default}
.cs-shop{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.cs-item{border:2px solid var(--line);border-radius:16px;padding:10px 6px;display:grid;justify-items:center;gap:4px;text-align:center;background:var(--bg)}
.cs-item.own{border-color:var(--good)}.cs-i-ic{font-size:1.8rem}.cs-item b{font-size:.74rem;line-height:1.15;min-height:2.3em}
.cs-how{font-size:.8rem;color:var(--ink-2);margin:10px 0 0}
.cs-friends{display:grid;gap:8px}.cs-friend{display:flex;align-items:center;gap:10px}.cs-friend>div{flex:1;min-width:0}.cs-friend small{display:block;color:var(--ink-2)}
.cs-empty{text-align:center;color:var(--ink-2)}.cs-empty p{margin:4px 0 10px}
.cs-sheet{display:grid;gap:12px}
.cs-talker{display:flex;align-items:center;gap:12px}.cs-big{font-size:3rem}.cs-talker b{display:block;font-size:1.05rem}
.cs-say{position:relative;background:var(--accent-soft);border:2px solid var(--accent);border-radius:18px;padding:14px;font-size:1.4rem;font-weight:900;text-align:center}
.cs-say small{display:block;font-size:.85rem;font-weight:700;color:var(--ink-2)}
.cs-tr{text-align:center;color:var(--ink-2);font-weight:800}
.cs-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.cs-album{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.cs-a{border:2px solid var(--line);border-radius:14px;padding:8px 4px;display:grid;justify-items:center;gap:2px;text-align:center;background:var(--surface)}
.cs-a span{font-size:1.5rem}.cs-a small{font-size:.62rem;line-height:1.1;font-weight:800}.cs-a.locked{opacity:.45}
.cs-sheet h3{margin:6px 0 0;font-size:1rem;display:flex;gap:6px;align-items:baseline}.cs-sheet h3 small{color:var(--ink-2)}
.cs-gift{background:color-mix(in srgb,#f4b73b 18%,var(--surface));border:2px solid #f4b73b;border-radius:14px;padding:10px;text-align:center}
@media (prefers-reduced-motion:reduce){.cs-deco,.cs-fest,.cs-arrow{animation:none!important}}
`;document.head.appendChild(css);
  try{if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
