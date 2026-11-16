(function(){
  if(typeof ownFiches!=='function'||typeof grammarView!=='function')return;
  const lvIndex=(lv,topic)=>{const a=(LEVEL_GTOPICS[lv]||[]);const i=a.indexOf(topic);return i<0?99:i};
  // Toutes les fiches du niveau : les fiches d'origine, puis les fiches complètes dans l'ordre du programme.
  ownFiches=function(){
    const base=(S.level==="A1"?(GRAM[S.tgt]||[]):S.level==="A2"?(GRAM_A2[S.tgt]?[GRAM_A2[S.tgt]]:[]):S.level==="B1"?(GRAM_B1[S.tgt]?[GRAM_B1[S.tgt]]:[]):[]);
    const extra=((window.GRAM_FULL||{})[S.tgt]||{})[S.level]||[];
    return [...base,...extra.slice().sort((a,b)=>lvIndex(S.level,a.topic)-lvIndex(S.level,b.topic))];
  };
  const prevView=grammarView;
  grammarView=function(){
    let html=prevView.apply(this,arguments);
    if(gTab!=="grammar"){
      // Conjugaison : même fonctionnement, sans nommer l'outil.
      return html.replace(/ ; le reste \(✦\) est conjugué par Claude\./,' ; les autres (✦) sont générés automatiquement.')
        .replace(/Conjugaison créée par Claude\./g,'Conjugaison générée automatiquement.')
        .replace(/Claude conjugue « ([^»]*) » au/g,'Conjugaison de « $1 » au')
        .replace(/ Générer la conjugaison</g,' Générer la conjugaison<')
        .replace(/<p class="muted">Disponible quand l'application est ouverte dans Claude\.<\/p>/g,'');
    }
    const own=ownFiches(),info=LEVEL_INFO.find(x=>x.id===S.level)||{n:''};
    const i=html.indexOf('<div class="seg lvchips">');const j=html.indexOf('</div>',i)+6;
    const top=i>=0?html.slice(0,j):html;
    const list=own.length?`<div class="gram-lv-head"><b>Niveau ${S.level} · ${esc(info.n)}</b><small>${own.length} fiche${own.length>1?'s':''}</small></div>
      <div class="list-grid">${own.map((f,k)=>`<button class="gcard" data-gram="${k}"><span class="gnum">Fiche ${k+1}</span><b>${esc(f.t)}</b><small class="clamp3">${esc(f.e)}</small><span class="gq">${(f.quiz||f.q).length} questions</span></button>`).join("")}</div>`
      :`<div class="card empty">${typeof mascot==='function'?mascot():''}<p>Les fiches de grammaire du niveau ${S.level} sont en préparation pour ${esc(L[S.tgt].n.toLowerCase())}.</p><button class="btn" data-gtab="conj">Voir la conjugaison</button></div>`;
    return top+list;
  };
  if(typeof openFiche==='function'){
    const prevOpen=openFiche;
    openFiche=function(f){const r=prevOpen.apply(this,arguments);const eb=document.querySelector('#sheetRoot .eyebrow');if(eb&&/Claude/.test(eb.textContent))eb.textContent='Fiche de grammaire';openFiche.cur=f;return r};
  }
  try{if(typeof view!=='undefined'&&view==='grammar')render()}catch(e){}
})();
