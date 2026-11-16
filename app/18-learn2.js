(function(){
  if(typeof pathView!=='function'||typeof LORDER==='undefined')return;
  const OPEN=new Set(),CLOSED=new Set();
  const prev=pathView;
  pathView=function(){
    let html=prev.apply(this,arguments);
    if(typeof html!=='string')return html;
    try{
      const parts=html.split('<section class="unit ');
      for(let i=1;i<parts.length;i++){
        const u=i-1,cls=parts[i].slice(0,parts[i].indexOf('"'));
        const finished=/\bfinished\b/.test(cls),locked=/\blocked\b/.test(cls);
        const isCurrent=!finished&&!locked;
        const open=OPEN.has(u)||(isCurrent&&!CLOSED.has(u));
        const n=LORDER.filter(l=>stepDone(u,l)).length,pct=Math.round(n/LORDER.length*100);
        const label=finished?'✓ Unité terminée':locked?'🔒 À débloquer':`${n}/${LORDER.length} étapes`;
        parts[i]=(open?'open ':'')+parts[i]
          .replace('</p></div>',`</p><div class="u2-prog" aria-hidden="true"><i style="width:${pct}%"></i></div><small class="u2-count">${label}</small></div>`)
          .replace('</header>',`<span class="u2-chev" aria-hidden="true">▾</span></header>`)
          .replace('<header class="unit-head big"',`<header class="unit-head big" data-u2="${u}" role="button" tabindex="0" aria-expanded="${open}"`);
      }
      // Mascotte : juste à côté de l'étape en cours, du côté opposé au décalage du chemin.
      for(let i=1;i<parts.length;i++){
        const ci=parts[i].indexOf(' cur"');if(ci<0)continue;
        const ws=parts[i].lastIndexOf('<div class="node-wrap2"',ci),ns=parts[i].indexOf('<div class="nodes">');
        if(ws<0||ns<0||ws<ns)continue;
        const idx=parts[i].slice(ns,ws).split('<div class="node-wrap2"').length-1;
        const side=idx%4===1?'left':'right';
        const boss=/node[^"]*boss[^"]*cur"/.test(parts[i].slice(ws,ci+5));
        const first=!/\bdone\b/.test(parts[i].slice(ns,ws));
        const say=boss?'Courage pour le boss !':first?"C'est parti !":'À toi de jouer !';
        const mood=(typeof S!=='undefined'&&S.hearts<=0)?'sad':(typeof streak==='function'&&streak()>=3)?'cheer':'happy';
        const tagEnd=parts[i].indexOf('>',ws)+1;
        parts[i]=parts[i].slice(0,tagEnd)+`<div class="l2-mascot ${side}" aria-hidden="true" data-say="${say.replace(/"/g,"&quot;")}"><span class="l2-bubble">${typeof mqHTML==='function'?mqHTML(say):say}</span>${typeof mascot==='function'?mascot(mood):''}</div>`+parts[i].slice(tagEnd);
      }
      html=parts.join('<section class="unit ');
    }catch(e){console.warn('learn2',e)}
    return `<div class="learn2">${html}</div>`;
  };
  function toggle(h){
    const u=+h.dataset.u2,sec=h.closest('.unit');if(!sec)return;
    const open=!sec.classList.contains('open');
    sec.classList.toggle('open',open);h.setAttribute('aria-expanded',open);
    if(open){OPEN.add(u);CLOSED.delete(u)}else{OPEN.delete(u);CLOSED.add(u)}
    if(open)requestAnimationFrame(()=>sec.scrollIntoView({block:'nearest',behavior:'smooth'}));
  }
  document.addEventListener('click',e=>{
    const h=e.target.closest?.('.learn2 [data-u2]');if(!h||e.target.closest('.guide,button'))return;
    e.preventDefault();toggle(h);
  },true);
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement?.matches?.('.learn2 [data-u2]')){e.preventDefault();toggle(document.activeElement)}},true);
  try{if(typeof render==='function'&&typeof view!=='undefined'&&view==='learn')render()}catch(e){}
})();
