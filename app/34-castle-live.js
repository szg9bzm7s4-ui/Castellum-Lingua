/* Étape 3 : château vivant.
   - Un style d'architecture par langue apprise (tant que le joueur n'a pas choisi le sien).
   - Animation de construction quand un bâtiment se termine : échafaudage, coups de marteau, puis confettis.
   Le dessin lui-même (habitants, fumée, eau, jour / nuit, paysages) est dans castellum-world-js. */
(function(){
  if(typeof CASTLE_STYLE_DATA==='undefined'||typeof S==='undefined')return;
  CASTLE_STYLE_DATA.mediterraneen=CASTLE_STYLE_DATA.mediterraneen||{name:"Méditerranéen",icon:"🍋",motto:"Soleil, terrasses & palais",
    stages:["Maison de pêcheur","Villa aux citronniers","Palazzo","Palais sur la baie","Palais royal","Cité baroque","Grande capitale","Capitale du soleil"],
    arts:["🏠","🍋","🏛️","⛵","👑","⛪","🌋","☀️"]};
  CASTLE_STYLE_DATA.kasbah=CASTLE_STYLE_DATA.kasbah||{name:"Kasbah",icon:"🕌",motto:"Terre rouge, jardins & remparts",
    stages:["Maison de terre","Ksar","Kasbah","Kasbah fortifiée","Palais du caïd","Médina","Ville impériale","Capitale impériale"],
    arts:["🏠","🧱","🏰","🛡️","🕌","🌴","🏯","🌙"]};
  const LANG_STYLE={it:'mediterraneen',es:'andalou',fr:'medieval',pt:'andalou',en:'occidental',de:'gothique',nl:'renaissance',ary:'kasbah',la:'romain',grc:'grec'};
  const langStyle=()=>{const k=LANG_STYLE[S.tgt];return k&&CASTLE_STYLE_DATA[k]?k:'medieval'};
  // Les anciens joueurs restés sur le style par défaut passent au style de leur langue ; un choix personnel est conservé.
  if(S.castleAuto==null){S.castleAuto=!S.castleStyle||S.castleStyle==='medieval';try{save()}catch(e){}}
  function sync(){if(S.castleAuto===false)return;const k=langStyle();if(S.castleStyle!==k){S.castleStyle=k;if(S.settings)S.settings.castleStyle=k;try{save()}catch(e){}}}
  window.castellumLangStyle=langStyle;
  if(typeof render==='function'){const prev=render;render=function(){try{sync()}catch(e){}return prev.apply(this,arguments)}}
  // Un clic sur une architecture = choix personnel ; « Selon ma langue » revient au style automatique.
  window.addEventListener('click',e=>{
    const t=e.target.closest&&e.target.closest('[data-castle-style],[data-domain-style],[data-royaume-style]');
    if(t){S.castleAuto=false;return}
    const a=e.target.closest&&e.target.closest('[data-cl-auto]');
    if(a){e.preventDefault();e.stopImmediatePropagation();S.castleAuto=true;sync();try{const m=document.getElementById('domain50Modal');if(m){m.hidden=true;m.style.display='none'}document.documentElement.style.overflow=''}catch(err){}
      try{toast('🏰 '+CASTLE_STYLE_DATA[langStyle()].name)}catch(err){}render()}
  },true);
  function autoButton(grid){
    if(!grid||grid.querySelector('[data-cl-auto]'))return;
    const v=CASTLE_STYLE_DATA[langStyle()],on=S.castleAuto!==false;
    const b=document.createElement('button');b.type='button';b.className='domain50-style cl-auto'+(on?' on':'');b.setAttribute('data-cl-auto','');
    b.innerHTML=`<span class="domain50-style-preview"><span>🌍</span></span><span class="domain50-style-copy"><b>🌍 <span>Selon ma langue</span></b><small>${v.icon} ${v.name}</small><span class="domain50-style-check">${on?'✓ Architecture actuelle':'Choisir ce royaume'}</span></span>`;
    grid.prepend(b);
    if(on)grid.querySelectorAll('.domain50-style.on:not(.cl-auto)').forEach(x=>{x.classList.remove('on');const c=x.querySelector('.domain50-style-check');if(c)c.textContent='Choisir ce royaume'});
    try{if(typeof translateDom==='function')translateDom(b)}catch(e){}
  }

  /* Animation de construction (fenêtre « Niveau N ! ») */
  const reduce=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
  function build(sheet){
    if(sheet.dataset.clBuilt)return;sheet.dataset.clBuilt='1';
    const art=sheet.querySelector('.rq-art');if(!art)return;
    if(reduce()){try{confetti()}catch(e){}return}
    art.classList.add('cl-building');
    const o=document.createElement('div');o.className='cl-scaffold';o.setAttribute('aria-hidden','true');
    o.innerHTML=`<svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMax meet"><g stroke="#8a5a2b" stroke-width="3" stroke-linecap="round" fill="none"><path d="M24 98V18M60 98V10M96 98V18"/><path d="M20 78H100M20 54H100M24 30H96"/><path d="M24 78L60 54M60 78L96 54M24 54L60 30M60 54L96 30" stroke-width="2" opacity=".8"/></g><g fill="#c8a06a"><rect x="18" y="74" width="84" height="5" rx="1"/><rect x="18" y="50" width="84" height="5" rx="1"/><rect x="22" y="26" width="76" height="5" rx="1"/></g></svg><span class="cl-hammer">🔨</span><span class="cl-hammer cl-h2">🪚</span><i class="cl-dust"></i><i class="cl-dust d2"></i><i class="cl-dust d3"></i><b class="cl-label">🏗️ <span>Construction…</span></b>`;
    art.appendChild(o);
    try{if(typeof translateDom==='function')translateDom(o)}catch(e){}
    setTimeout(()=>{o.classList.add('done');art.classList.remove('cl-building');art.classList.add('cl-built');try{confetti()}catch(e){}setTimeout(()=>o.remove(),700)},1700);
  }
  const root=document.getElementById('sheetRoot');
  if(root)new MutationObserver(()=>{const s=root.querySelector('.rq-up:not([data-cl-built])');if(s)build(s)}).observe(root,{childList:true,subtree:true});
  new MutationObserver(()=>{const g=document.querySelector('#domain50Modal .domain50-style-grid');if(g&&!g.querySelector('[data-cl-auto]'))autoButton(g)}).observe(document.body,{childList:true,subtree:true});

  const css=document.createElement('style');css.id='castellum-castle-live-css';css.textContent=`
.rq-art{position:relative}
.cl-building .kw-svg{filter:saturate(.75) brightness(.95)}
.rq-up .cl-building .kw-new{animation-play-state:paused;opacity:0}
.rq-up .cl-built .kw-new{animation:kwPop 1s cubic-bezier(.2,1.5,.4,1) both}
.cl-scaffold{position:absolute;inset:0;display:grid;place-items:end center;pointer-events:none;transition:opacity .6s,transform .6s}
.cl-scaffold svg{width:46%;height:78%;margin-bottom:6%;animation:clRise .5s ease-out both;filter:drop-shadow(0 4px 6px rgba(0,0,0,.25))}
@keyframes clRise{from{transform:translateY(30%);opacity:0}}
.cl-scaffold.done{opacity:0;transform:translateY(10%)}
.cl-hammer{position:absolute;left:38%;top:28%;font-size:1.7rem;transform-origin:80% 80%;animation:clHit .35s ease-in-out infinite alternate}
.cl-hammer.cl-h2{left:58%;top:46%;font-size:1.4rem;animation:clSaw .3s linear infinite alternate}
@keyframes clHit{from{transform:rotate(-35deg)}to{transform:rotate(10deg)}}
@keyframes clSaw{from{transform:translateX(-5px)}to{transform:translateX(5px)}}
.cl-dust{position:absolute;left:44%;top:50%;width:10px;height:10px;border-radius:50%;background:rgba(240,230,210,.9);animation:clDust .7s ease-out infinite}
.cl-dust.d2{left:56%;top:64%;animation-delay:.25s}.cl-dust.d3{left:48%;top:72%;animation-delay:.5s}
@keyframes clDust{from{transform:scale(.4);opacity:1}to{transform:translate(8px,-14px) scale(1.8);opacity:0}}
.cl-label{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(20,28,60,.78);color:#fff;border-radius:99px;padding:4px 12px;font-size:.85rem;white-space:nowrap}
.cl-auto{border-style:dashed}
@media (prefers-reduced-motion:reduce){.cl-scaffold{display:none}}
`;document.head.appendChild(css);
  try{sync();if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(e){}
})();
