/* Contenu complété à la main pour les langues hors des 8 principales (unités et thèmes récents). */
window.CASTELLUM_FILL=window.CASTELLUM_FILL||{};
(function(){const F=window.CASTELLUM_FILL||{};Object.entries(F).forEach(([lang,sets])=>Object.entries(sets).forEach(([id,txt])=>{const k=lang+">"+id;const add=txt.split("\n").map(l=>{const i=l.indexOf("|");return i<0?{t:l.trim(),p:""}:{t:l.slice(0,i).trim(),p:l.slice(i+1).trim()}});BUILT[k]=(BUILT[k]||[]).concat(add)}))})();
