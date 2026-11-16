/* Langues anciennes : vocabulaire authentique ajouté à la suite des thèmes existants (aucun mot moderne). */
window.CASTELLUM_ANCIENT_FILL=window.CASTELLUM_ANCIENT_FILL||{};
(function(){const F=window.CASTELLUM_ANCIENT_FILL||{};Object.entries(F).forEach(([lang,sets])=>Object.entries(sets).forEach(([id,txt])=>{const k=lang+">"+id;const add=txt.split("\n").map(l=>{const i=l.indexOf("|");return {t:l.slice(0,i).trim(),p:l.slice(i+1).trim()}});BUILT[k]=(BUILT[k]||[]).concat(add)}))})();
