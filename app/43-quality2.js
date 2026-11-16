/* 1. L'oral est facultatif partout : « Passer » un exercice de prononciation avance sans compter d'erreur.
   2. Débutants (A1, A2) : les mauvaises réponses proposées viennent du niveau en cours, pas de mots C1 inconnus. */
(function(){
  window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lx="skip"]');if(!b||typeof LX==='undefined'||!LX||!LX.steps)return;const st=LX.steps[LX.i];
    if(!st||st.k!=='speak'||LX.state!=='idle')return;e.preventDefault();e.stopImmediatePropagation();LX.state='skip';nextStep()},true);
  if(typeof optsFrom!=='function'||typeof bigPool!=='function')return;
  const prevOpts=optsFrom,realBig=bigPool;let lvCache={k:'',v:[]};
  function levelPool(){const k=S.src+'>'+S.tgt+'>'+S.level;if(lvCache.k!==k){const v=[];try{lvUnits().forEach(U=>{const d=setData(U.id);if(d)v.push(...d)})}catch(err){}lvCache={k,v}}return lvCache.v}
  optsFrom=function(){if(!['A1','A2'].includes(S.level))return prevOpts.apply(this,arguments);
    const lp=levelPool();if(lp.length<30)return prevOpts.apply(this,arguments);
    bigPool=()=>lp;try{return prevOpts.apply(this,arguments)}finally{bigPool=realBig}};
})();
