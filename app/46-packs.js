/* Chargement à la demande du contenu d'une langue (data/lang/<code>.js).
   La langue enregistrée sur l'appareil est déjà chargée au démarrage ; les autres se chargent quand on
   change de langue, qu'on ouvre le dictionnaire ou qu'on lance une leçon. Le contenu est intégré exactement
   comme au démarrage (même table BUILT), donc les leçons et la progression ne changent pas. */
(function(){
  const IDX=window.__PACK_INDEX||{},loading={};
  const loaded=c=>!!(window.__PACKS||{})[c];
  const needs=c=>!!c&&!!IDX[c]&&!loaded(c);
  const parseA=txt=>txt.trim().split("\n").map(l=>{const i=l.indexOf("|");return i<0?{t:l.trim(),p:""}:{t:l.slice(0,i).trim(),p:l.slice(i+1).trim()}});
  function integrate(c){const p=(window.__PACKS||{})[c];if(!p||p.__in)return;p.__in=1;
    if(p.extra){EXTRA_A1[c]=p.extra;const lines=p.extra.trim().split("\n").map(l=>{const [t,pp]=l.split("|");return {t:t.trim(),p:(pp||"").trim()}});for(let u=0;u<10;u++)BUILT[`${c}>u${u}`]=lines.slice(u*12,u*12+12)}
    if(p.tr){TR[c]=p.tr;Object.entries(p.tr).forEach(([id,txt])=>{BUILT[`${c}>${id}`]=parseA(txt)})}
    if(p.fill)Object.entries(p.fill).forEach(([id,txt])=>{const k=c+">"+id;const add=txt.split("\n").map(l=>{const i=l.indexOf("|");return i<0?{t:l.trim(),p:""}:{t:l.slice(0,i).trim(),p:l.slice(i+1).trim()}});BUILT[k]=(BUILT[k]||[]).concat(add)});
    if(p.ancient)Object.entries(p.ancient).forEach(([id,txt])=>{const k=c+">"+id;const add=txt.split("\n").map(l=>{const i=l.indexOf("|");return {t:l.slice(0,i).trim(),p:l.slice(i+1).trim()}});BUILT[k]=(BUILT[k]||[]).concat(add)});
    try{bigPoolCache.k=""}catch(e){}try{I18N_CT.k=""}catch(e){}
    try{Object.keys(covCache).forEach(k=>delete covCache[k])}catch(e){}
    try{Object.keys(dictCache).forEach(k=>delete dictCache[k])}catch(e){}}
  // Les langues déjà chargées au démarrage sont intégrées par le code d'origine : on les marque.
  Object.values(window.__PACKS||{}).forEach(p=>{p.__in=1});
  function ensure(c){if(!needs(c))return Promise.resolve(true);if(loading[c])return loading[c];
    loading[c]=new Promise(res=>{const s=document.createElement('script');s.src='data/lang/'+encodeURIComponent(c)+'.js';s.async=true;
      s.onload=()=>{integrate(c);res(loaded(c))};s.onerror=()=>{delete loading[c];res(false)};document.head.appendChild(s)});
    return loading[c]}
  window.CastellumPacks={ensure,integrate,needs,loaded};

  /* Affichage : si la langue en cours (ou celles du dictionnaire) n'est pas encore là, on la charge puis on réaffiche. */
  let busy=false;
  function wanted(){const w=[S.tgt];try{if(typeof view!=='undefined'&&view==='dict'){if(dFrom)w.push(dFrom);if(dTo)w.push(dTo)}}catch(e){}return w.filter(needs)}
  if(typeof render==='function'){const prev=render;render=function(){const r=prev.apply(this,arguments);
    const w=wanted();if(w.length&&!busy){busy=true;showLoading(true);Promise.all(w.map(ensure)).then(ok=>{busy=false;showLoading(false);if(ok.some(x=>!x))try{toast('Contenu de la langue indisponible : vérifie ta connexion')}catch(e){}try{render()}catch(e){}})}
    return r}}
  function showLoading(on){let el=document.getElementById('packLoading');
    if(on&&!el){el=document.createElement('div');el.id='packLoading';el.setAttribute('role','status');el.innerHTML='<span class="a2-spin" aria-hidden="true"></span> <span>Chargement de la langue…</span>';document.body.appendChild(el)}
    else if(!on&&el)el.remove()}
  /* Démarrer une activité : on attend le contenu de la langue avant de construire les exercices. */
  ['startLesson','startMode','startListLesson','startDuel'].forEach(fn=>{try{const f=window[fn]||eval(fn);if(typeof f!=='function')return;
    const wrapped=function(){const args=arguments,self=this;if(!needs(S.tgt))return f.apply(self,args);showLoading(true);
      return ensure(S.tgt).then(()=>{showLoading(false);return f.apply(self,args)})};
    eval(fn+'=wrapped')}catch(e){}});
  const css=document.createElement('style');css.id='castellum-packs-css';css.textContent=`#packLoading{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:120;background:var(--surface);color:var(--ink);border:2px solid var(--line);border-radius:99px;padding:8px 14px;font-weight:800;display:flex;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.15)}`;document.head.appendChild(css);
})();
