(function(){
  if(typeof S==='undefined')return;
  const PUNCT=/^[¿¡«"“'(\[]+|[?!.,;:»"”')\]…]+$/g;
  const voiceOK=()=>typeof canSpeak==='function'&&canSpeak(S.tgt);
  function wrapText(el){
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
      if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      if(n.parentElement.closest('.wtap,.blank,button,textarea,input,kbd,.say'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      const frag=document.createDocumentFragment();let par=0;
      n.nodeValue.split(/(\s+)/).forEach(tok=>{
        if(!tok)return;
        const core=tok.replace(PUNCT,'');
        const inPar=par>0||tok.startsWith('(')||(tok.endsWith(')')&&!tok.includes('('));par+=(tok.match(/\(/g)||[]).length-(tok.match(/\)/g)||[]).length;if(par<0)par=0;
        if(/^\s+$/.test(tok)||!core||core==='___'||inPar){frag.appendChild(document.createTextNode(tok));return}
        const sp=document.createElement('span');sp.className='wtap';sp.setAttribute('data-word-say',core);sp.textContent=tok;
        sp.setAttribute('role','button');sp.setAttribute('aria-label','Écouter « '+core+' »');
        frag.appendChild(sp);
      });
      n.parentNode.replaceChild(frag,n);
    });
  }
  function enhance(){
    const host=document.getElementById('lxStep');if(!host)return;
    host.querySelectorAll('[lang]').forEach(el=>{
      if(el.getAttribute('lang')!==S.tgt)return;
      if(el.matches('button,textarea,input,.tray,.bank')||el.closest('button,.opts,.match,.bank,.tray'))return;
      wrapText(el);
    });
  }
  let pending=false;
  new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}).observe(document.body,{childList:true,subtree:true});

  // Mise en évidence du mot prononcé (le clic lui-même est géré par le module audio).
  document.addEventListener('click',e=>{
    const w=e.target.closest?.('.wtap');if(!w)return;
    document.querySelectorAll('.wtap.playing').forEach(x=>x.classList.remove('playing'));
    w.classList.add('playing');setTimeout(()=>w.classList.remove('playing'),900);
    try{if(!localStorage.getItem('cl-wtap-tip')){localStorage.setItem('cl-wtap-tip','1');toast('👆 Touche n\'importe quel mot pour l\'entendre')}}catch(err){}
  },true);

  // Tuiles, paires et réponses dans la langue apprise : on les entend en les touchant.
  document.addEventListener('click',e=>{
    if(!voiceOK()||typeof LX==='undefined'||!LX||LX.state!=='idle')return;
    const t=e.target.closest?.('#lxStep .bank .tok[data-b], #lxStep [data-ml], #lxStep .opt[lang]');
    if(!t||(t.hasAttribute('lang')&&t.getAttribute('lang')!==S.tgt))return;
    const txt=(t.querySelector('span')||t).textContent.replace(/^\d+\s*/,'').trim();
    if(txt)try{speak(txt,S.tgt,false)}catch(err){}
  },false);
})();
