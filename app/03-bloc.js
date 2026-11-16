document.addEventListener('click',function(e){
  const m=e.target.closest&&e.target.closest('.mascot');
  if(!m)return;
  const previous=m.dataset.mood||'idle';
  m.classList.remove('mascot-tap');void m.offsetWidth;m.classList.add('mascot-tap');
  if(previous==='idle')m.dataset.mood='cheer';
  setTimeout(function(){m.classList.remove('mascot-tap');if(previous==='idle')m.dataset.mood='idle'},650);
});
