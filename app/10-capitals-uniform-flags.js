(function(){
  function normalizeCapitalFlags(){
    document.querySelectorAll('.capital-flag-stage').forEach(stage=>{
      stage.classList.remove('wind-strong','wind-soft');

      const hint=stage.querySelector('.capital-flag-hint');
      if(hint) hint.remove();

      const fabric=stage.querySelector('.capital-flag-fabric');
      if(fabric){
        /* Remove old interaction-set inline values. CSS above becomes authoritative. */
        ['transform','animation','transition','perspective','width','height','top','left']
          .forEach(prop=>fabric.style.removeProperty(prop));
      }

      const img=stage.querySelector('.capital-flag-img');
      if(img){
        ['transform','animation','transition','filter','clip-path',
         'object-fit','object-position','width','height','max-width','max-height']
          .forEach(prop=>img.style.removeProperty(prop));
      }
    });
  }

  document.addEventListener('DOMContentLoaded',normalizeCapitalFlags);
  window.addEventListener('load',normalizeCapitalFlags);

  const observer=new MutationObserver(normalizeCapitalFlags);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
