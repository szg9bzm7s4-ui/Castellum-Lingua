/* Plus de cœurs : une erreur ne coûte plus rien, on n'est jamais bloqué. S.hearts reste à 5
   (lecture seule), et les compteurs de cœurs disparaissent de l'écran. */
(function(){
  if(typeof S==="undefined")return;
  function lock(){try{const d=Object.getOwnPropertyDescriptor(S,"hearts");if(!d||!d.get)Object.defineProperty(S,"hearts",{get:()=>5,set:()=>{},enumerable:true,configurable:true})}catch(e){}}
  lock();
  try{const r0=render;render=function(){lock();return r0.apply(this,arguments)}}catch(e){}
  try{const s0=save;save=function(){lock();return s0.apply(this,arguments)}}catch(e){}
  const css=document.createElement("style");css.textContent=".stat-chip.c-heart,#lxHearts,.rt-hearts{display:none!important}";document.head.appendChild(css);
})();
