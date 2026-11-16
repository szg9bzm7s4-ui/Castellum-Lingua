/* Interface allégée.
   - Leçon : barre audio compacte (Écouter en grand, Ralentir et Réglages en icônes), ligne d'état audio
     affichée seulement pendant un chargement ou en cas de problème, plus de phrase d'ambiance sous la scène.
   - Pratiquer : les jeux d'abord, puis « Parler en situation » (scènes et conversation avec l'IA). */
(function(){
  if(typeof S==="undefined"||typeof render!=="function")return;
  const T=t=>{try{return tr(t)}catch(e){return t}};
  if(typeof playView==="function"){const prev=playView;playView=function(){const html=prev.apply(this,arguments);
    try{if(typeof html!=="string")return html;const tpl=document.createElement("template");tpl.innerHTML=html;const R=tpl.content;
      const head=R.querySelector(".section-head"),modes=R.querySelector(".modes");if(!head||!modes)return html;
      const eb=head.querySelector(".eyebrow");if(eb)eb.remove();const h1=head.querySelector("h1");if(h1)h1.textContent=T("Pratiquer");
      const talk=[...R.querySelectorAll(".u2-sxlist,.ac-entry")];
      const box=document.createElement("div");box.className="ix-play";box.appendChild(head);box.appendChild(modes);
      if(talk.length){const h=document.createElement("h2");h.className="ix-h2";h.textContent=T("Parler en situation");box.appendChild(h);
        talk.forEach(el=>{const t=el.querySelector(":scope>h2");if(t)t.remove();box.appendChild(el)})}
      [...R.childNodes].forEach(n=>box.appendChild(n));
      const w=document.createElement("div");w.appendChild(box);return w.innerHTML}catch(e){return html}}}
  if(typeof I18N!=="undefined"){const U={it:["Esercitarsi","Parlare in situazione"],es:["Practicar","Hablar en situación"],pt:["Praticar","Falar em situação"],en:["Practise","Speak in real situations"],de:["Üben","In Situationen sprechen"],nl:["Oefenen","Spreken in situaties"],ary:["Tmren","Hder f l-mawa9if"]};
    for(const l in U){I18N[l]=I18N[l]||{};["Pratiquer","Parler en situation"].forEach((k,i)=>{if(I18N[l][k]==null)I18N[l][k]=U[l][i]})}}
  const css=document.createElement("style");css.id="castellum-interface-css";css.textContent=`
.ix-play{display:flex;flex-direction:column;gap:16px}
.ix-h2{margin:10px 0 -4px;font-size:1.2rem}
.ix-play .u2-sxlist{display:flex;flex-direction:column;gap:10px}
/* Leçon : barre audio compacte */
#lxStep .audio-premium-bar{gap:8px!important;align-items:center}
#lxStep .audio-premium-bar [data-audio-slow],#lxStep .audio-premium-bar .a2-more-btn{width:48px;min-width:48px;height:48px;padding:0!important;display:inline-flex;align-items:center;justify-content:center;font-size:1.15rem}
#lxStep .audio-premium-bar [data-audio-slow] span,#lxStep .audio-premium-bar .a2-more-btn span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
#lxStep .audio-premium-bar [data-audio-play]{flex:1 1 auto;min-height:48px}
#lxStep .a2-status:not(:has(.a2-warn,.a2-spin)){display:none}
#lxStep .jx-nosound{font-size:.78rem;min-height:28px;line-height:28px;opacity:.85}
.ls-story{display:none}
.ls-scene{gap:12px}`;
  document.head.appendChild(css);
})();
