/* Unités enrichies : 6 phrases de plus par unité pour les 8 langues principales et le latin
   (data/units-extra.js). Les autres langues gardent leurs 12 phrases : leurs traductions sont
   alignées par position et setData s'arrête à la longueur de leur paquet. */
(function(){const X=window.__UNITS_EXTRA;if(!X||typeof SETMAP==="undefined")return;
  const C=typeof COLS!=="undefined"?COLS:["fr","it","es","pt","en","de","nl","ary"];
  for(const id in X.main||{}){const set=SETMAP[id];if(!set||!Array.isArray(set.items)||set.__x)continue;set.__x=1;
    X.main[id].split("\n").forEach(r=>{const c=r.split("|");if(c.length===8)set.items.push(c)})}
  for(const id in X.la||{}){const set=SETMAP[id],B=typeof BUILT!=="undefined"?BUILT["la>"+id]:null;if(!set||!B||set.__x)continue;set.__x=1;
    X.la[id].split("\n").forEach(r=>{const c=r.split("|");if(c.length!==9)return;const [la,fr,en,it,es,pt,de,nl,ary]=c,m={fr,en,it,es,pt,de,nl,ary};
      set.items.push(C.map(k=>m[k]||en));B.push({t:la,p:""})})}})();
