/* Nouvelle version : chaque publication change <meta name="castellum-build">. Si la page ouverte est plus ancienne
   (cache du navigateur), un bandeau propose de recharger. Vérifié au chargement, au retour sur l'onglet et toutes les 15 min. */
(function(){if(location.protocol==="file:")return;
  const mine=(document.querySelector('meta[name="castellum-build"]')||{}).content||"";if(!mine)return;
  const T=t=>{try{return tr(t)}catch(e){return t}};let shown=false,last=0,newer="";
  async function check(){if(shown||Date.now()-last<60000)return;last=Date.now();
    try{const r=await fetch(location.pathname+"?v="+Date.now(),{cache:"no-store"});if(!r.ok)return;const h=await r.text();
      const m=h.match(/<meta name="castellum-build" content="([^"]+)"/);if(m&&m[1]>mine){newer=m[1];show()}}catch(e){}}
  function show(){shown=true;const d=document.createElement("div");d.id="cvBanner";d.setAttribute("role","status");
    d.innerHTML=`<span>✨ ${T("Nouvelle version disponible")}</span><button type="button" id="cvReload">${T("Recharger")}</button><button type="button" id="cvLater" aria-label="${T("Plus tard")}">✕</button>`;
    document.body.appendChild(d);/* adresse différente à chaque version : le téléphone ne peut pas resservir la page gardée en mémoire */
    d.querySelector("#cvReload").onclick=()=>{try{location.replace(location.pathname+"?v="+encodeURIComponent(newer||Date.now())+location.hash)}catch(e){location.reload()}};d.querySelector("#cvLater").onclick=()=>d.remove()}
  const css=document.createElement("style");css.textContent=`#cvBanner{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9998;display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-radius:999px;background:#14324A;color:#fff;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:calc(100vw - 24px)}
#cvBanner button{border:0;border-radius:999px;font:inherit;font-weight:800;cursor:pointer;min-height:40px}#cvReload{background:#F2A57E;color:#14324A;padding:0 16px}#cvLater{background:transparent;color:#fff;padding:0 8px}
@media (min-width:900px){#cvBanner{bottom:24px}}`;document.head.appendChild(css);
  if(typeof I18N!=="undefined"){const U={it:["Nuova versione disponibile","Ricarica","Più tardi"],es:["Nueva versión disponible","Recargar","Más tarde"],pt:["Nova versão disponível","Recarregar","Mais tarde"],en:["New version available","Reload","Later"],de:["Neue Version verfügbar","Neu laden","Später"],nl:["Nieuwe versie beschikbaar","Herladen","Later"],ary:["Kayna nouskha jdida","3awed 7mmel","Men b3d"]};
    for(const l in U){I18N[l]=I18N[l]||{};["Nouvelle version disponible","Recharger","Plus tard"].forEach((k,i)=>{if(I18N[l][k]==null)I18N[l][k]=U[l][i]})}}
  setTimeout(check,4000);setInterval(check,15*60000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)check()});
})();
