/* Fenêtre « Choisis ton architecture » :
   1. Mode sombre : le fond était forcé en blanc alors que les textes passaient en clair (blanc sur blanc).
   2. Légèreté : les 17 aperçus de royaume (≈ 1,8 Mo de dessin) deviennent des images, dessinées seulement
      quand elles apparaissent à l'écran. Sur téléphone, la fenêtre s'affiche tout de suite. */
(function(){
  const css=document.createElement('style');css.id='castellum-modal-fix-css';
  const dark=`.domain50-dialog{background:var(--surface)!important;color:var(--ink)!important}
.domain50-dialog-head{background:color-mix(in srgb,var(--surface) 96%,transparent)!important;color:var(--ink)}
.domain50-dialog h2,.domain50-dialog h3,.domain50-dialog b,.domain50-dialog strong{color:var(--ink)}
.domain50-dialog small,.domain50-dialog .muted{color:var(--ink-2)!important}
.domain50-style,.royaume-card,.royaume-title-btn{background:var(--surface-2)!important;color:var(--ink)!important;border-color:var(--line)!important}
.royaume-title-btn.on{background:rgba(227,166,51,.22)!important;border-color:#e0a22f!important}
.domain50-close{color:var(--ink)!important;background:var(--surface-2)!important}
.domain50-style-preview{background:linear-gradient(180deg,#1f2d55,#2a3a66)!important}`;
  css.textContent=`@media (prefers-color-scheme:dark){${dark.replace(/(^|\})\s*([^{}]+)\{/g,(m,a,sel)=>a+sel.split(',').map(s=>':root:not([data-theme="light"]) '+s.trim()).join(',')+'{')}}
${dark.replace(/(^|\})\s*([^{}]+)\{/g,(m,a,sel)=>a+sel.split(',').map(s=>':root[data-theme="dark"] '+s.trim()).join(',')+'{')}
.rc-art.lite{display:block;background:#cfe3f3}.rc-art.lite img{width:100%;height:100%;object-fit:cover;display:block}`;
  document.head.appendChild(css);

  // Aperçus légers : SVG → image, rendue à l'apparition
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const h=e.target;io.unobserve(h);const src=h.__src;if(src){h.innerHTML=`<img alt="${h.dataset.label||''}" decoding="async" src="${src}">`;h.__src=null}}),{rootMargin:'200px'}):null;
  function lighten(root){
    root.querySelectorAll('.rc-art:not(.lite) > svg, .royaume-evo-item .rc-art:not(.lite) > svg').forEach(svg=>{
      const h=svg.parentElement;h.classList.add('lite');
      const label=(svg.getAttribute('aria-label')||'').replace(/"/g,'&quot;');h.dataset.label=label;
      let xml=svg.outerHTML;if(!/xmlns=/.test(xml))xml=xml.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
      const src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
      if(io){h.__src=src;h.innerHTML='';h.setAttribute('role','img');h.setAttribute('aria-label',label);io.observe(h)}
      else h.innerHTML=`<img alt="${label}" decoding="async" src="${src}">`;
    })}
  new MutationObserver(()=>{const m=document.getElementById('domain50Modal');if(m&&!m.hidden&&m.querySelector('.rc-art:not(.lite) > svg'))lighten(m)}).observe(document.body,{childList:true,subtree:true});
  window.castellumLightenPreviews=lighten;
})();
