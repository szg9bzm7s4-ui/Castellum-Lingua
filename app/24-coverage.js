/* Parcours sans impasse : pour une langue, seules les unités qui ont réellement du contenu hors ligne
   apparaissent. Les unités manquantes sont toutes en fin de niveau : les indices (et donc la progression
   sauvegardée) ne changent pas. */
(function(){
  if(typeof LEVELS==="undefined")return;
  const avail=(set,lang)=>COLS.includes(lang)||!!((S.packs||{})[lang+">"+set.id]||packHas(lang,set.id));
  const cache={};
  Object.keys(LEVELS).forEach(lv=>{
    const all=LEVELS[lv].units.slice();LEVELS[lv].allUnits=all;
    Object.defineProperty(LEVELS[lv],"units",{configurable:true,get(){
      const lang=S.tgt,k=lang+"|"+Object.keys(S.packs||{}).length,c=cache[lv]||(cache[lv]={});
      if(c[k])return c[k];let n=all.length;while(n>1&&!avail(all[n-1],lang))n--;return c[k]=all.slice(0,n)}});
  });
  try{if(typeof render==="function")render()}catch(e){}
})();
