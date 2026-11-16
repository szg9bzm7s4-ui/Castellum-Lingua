/* FIX robuste du bouton Continuer sur mobile */
(function(){
  if(typeof nextStep!=="function"||window.__castellumNextFix)return;
  window.__castellumNextFix=true;
  const originalNextStep=nextStep;
  nextStep=function(){
    if(!LX||!LX.steps)return;
    const before=LX.i;
    try{
      return originalNextStep();
    }catch(err){
      console.error("Castellum next-step recovery",err);
      if(!LX||!LX.steps)return;
      if(LX.i===before)LX.i++;
      while(LX.i<LX.steps.length){
        try{renderStep();return}catch(e){console.error("Skipping invalid step",e);LX.i++}
      }
      try{finish()}catch(e){console.error("Finish after invalid step failed",e);try{closeLx()}catch(_){}}
    }
  };
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('.lx [data-lx="next"]');
    if(!b||b.disabled)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    nextStep();
  },true);
})();
