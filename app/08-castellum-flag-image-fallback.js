/* ===== CASTELLUM · FLAG IMAGE FALLBACK ===== */
document.addEventListener('error',function(e){
  const img=e.target;
  if(!(img instanceof HTMLImageElement)||!img.classList.contains('capital-flag-img'))return;
  img.style.display='none';
  const fb=img.parentElement?.querySelector('.capital-flag-fallback');
  if(fb)fb.style.display='grid';
},true);
