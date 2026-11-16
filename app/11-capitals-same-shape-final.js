(function(){
  function normalizeFlags(){
    document.querySelectorAll('.capital-flag-stage').forEach(stage=>{
      stage.classList.remove('wind-strong','wind-soft');

      stage.querySelectorAll('.flag-pole,.capital-flag-hint').forEach(el=>el.remove());

      const fabric=stage.querySelector('.capital-flag-fabric');
      if(fabric){
        [
          'left','top','width','height','max-width','transform','animation',
          'transition','perspective','background','box-shadow','padding'
        ].forEach(prop=>fabric.style.removeProperty(prop));
      }

      const img=stage.querySelector('.capital-flag-img');
      if(img){
        [
          'width','height','max-width','max-height','object-fit','object-position',
          'transform','animation','transition','filter','clip-path','border-radius',
          'box-shadow','background'
        ].forEach(prop=>img.style.removeProperty(prop));
      }
    });
  }

  document.addEventListener('DOMContentLoaded',normalizeFlags);
  window.addEventListener('load',normalizeFlags);

  const observer=new MutationObserver(normalizeFlags);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
