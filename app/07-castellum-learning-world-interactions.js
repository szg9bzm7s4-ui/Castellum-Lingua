/* ===== CASTELLUM · LEARNING WORLD INTERACTIONS ===== */
(function(){
  function rerenderWorld(){
    if(typeof render==='function')render();
    requestAnimationFrame(()=>document.querySelector('[data-lw-world]')?.scrollIntoView({block:'center',behavior:'smooth'}));
  }
  document.addEventListener('click',function(e){
    const prev=e.target.closest?.('[data-lw-prev]');
    const next=e.target.closest?.('[data-lw-next]');
    const home=e.target.closest?.('[data-lw-home]');
    const chest=e.target.closest?.('[data-lw-chest]');
    if(prev&&!prev.disabled){e.preventDefault();LWPreview=Math.max(0,(LWPreview??0)-1);rerenderWorld();return}
    if(next&&!next.disabled){e.preventDefault();LWPreview=Math.min(lvUnits().length-1,(LWPreview??0)+1);rerenderWorld();return}
    if(home){e.preventDefault();LWPreview=Math.min(Math.floor(firstUndone()/(typeof LPU==='number'?LPU:4)),lvUnits().length-1);rerenderWorld();return}
if(chest){e.preventDefault();const u=LWPreview??0,n=[0,1,2,3].filter(l=>!!S.done[nodeKey(u,l)]).length;toast(n>=3?'🎁 Coffre prêt : termine le boss pour sceller ce territoire !':`🎁 Encore ${Math.max(0,3-n)} étape${3-n>1?'s':''} avant le coffre.`);return}
  },true);

  let sx=0,sy=0;
  document.addEventListener('touchstart',e=>{
    const w=e.target.closest?.('[data-lw-world]');if(!w||!e.touches?.[0])return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
  },{passive:true});
  document.addEventListener('touchend',e=>{
    const w=e.target.closest?.('[data-lw-world]');if(!w||!e.changedTouches?.[0])return;
    const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.25)return;
    const max=lvUnits().length-1;
    if(dx<0&&LWPreview<max){LWPreview++;rerenderWorld()}
    else if(dx>0&&LWPreview>0){LWPreview--;rerenderWorld()}
  },{passive:true});
})();
