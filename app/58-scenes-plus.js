/* Scènes, suite : « Rejouer la scène » (l'apprenant prend le rôle « Toi » : il dit sa réplique au micro
   ou la choisit parmi trois) et « Dire autrement » (familier, courant, soutenu) pour la fonction du lieu,
   chargé à la demande depuis data/registres.js. */
(function(){
  if(typeof S==="undefined")return;
  const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const T=t=>{try{return tr(t)}catch(e){return t}};
  const inSrc=o=>o?(o[S.src]||o.fr||o.en||""):"";
  const SR_LANG={fr:"fr-FR",it:"it-IT",es:"es-ES",pt:"pt-PT",en:"en-GB",de:"de-DE",nl:"nl-NL"};
  const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;
  const norm=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9ß ]+/g," ").replace(/\s+/g," ").trim();
  function close(heard,want){const w=norm(want).split(" ").filter(Boolean),h=new Set(norm(heard).split(" "));if(!w.length)return 0;return w.filter(x=>h.has(x)).length/w.length}
  function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  /* dit le texte et rappelle cb quand la réplique est vraiment finie (fichier, voix en ligne ou de l'appareil) */
  function sayThen(txt,tok,cb){try{speak(txt,S.tgt)}catch(e){}const t0=Date.now(),max=4000+txt.length*110,A=window.CastellumAudio;
    const wait=()=>{if(R.tok!==tok)return;const el=Date.now()-t0;let busy=false;
      try{busy=(A&&(A.state==="loading"||A.state==="playing"))||(window.speechSynthesis&&speechSynthesis.speaking)}catch(e){}
      if(el>max||(el>500&&!busy))setTimeout(cb,400);else setTimeout(wait,150)};setTimeout(wait,200)}
  const R={tok:0};
  const key=()=>{const v=window.__vlScene;return v?v.lv+":"+v.id+":"+S.tgt:""};
  const doneMap=()=>{S.ui=S.ui||{};return S.ui.scRole=S.ui.scRole||{}};
  function bubble(l,roles,extra){return `<div class="vl-line ${l.r==="toi"?"me":""} ${extra||""}"><div><span class="vl-who">${E(inSrc(roles[l.r]))}</span><b lang="${S.tgt}" data-noi18n="1">${E(l[S.tgt])}</b></div></div>`}
  function start(){const v=window.__vlScene,box=document.getElementById("vlRolePlay");if(!v||!box)return;
    R.tok=Date.now();R.v=v;R.i=0;R.err=0;R.log=[];
    const sc=document.getElementById("vlScene");if(sc)sc.hidden=true;
    document.querySelectorAll("#sheetRoot [data-vplayall],#sheetRoot [data-vtr],#sheetRoot .vl-roleact").forEach(b=>b.hidden=true);
    box.hidden=false;step()}
  function stop(){R.tok=0;const box=document.getElementById("vlRolePlay");if(box){box.hidden=true;box.innerHTML=""}
    const sc=document.getElementById("vlScene");if(sc)sc.hidden=false;
    document.querySelectorAll("#sheetRoot [data-vplayall],#sheetRoot [data-vtr],#sheetRoot .vl-roleact").forEach(b=>b.hidden=false)}
  function paint(tail){const box=document.getElementById("vlRolePlay");if(!box)return;const {roles}=R.v;
    box.innerHTML=`<p class="vl-muted">${E(T("C'est toi qui parles : réponds à chaque réplique."))}</p><div class="vl-scene vl-rp">${R.log.map(x=>bubble(x.l,roles,x.cls)).join("")}</div>${tail||""}`;
    const last=box.querySelector(".vl-rp .vl-line:last-child");if(last)try{last.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}}
  function step(){const tok=R.tok,lines=R.v.sc.lines;if(!document.getElementById("vlRolePlay"))return;
    if(R.i>=lines.length)return finish();
    const l=lines[R.i];
    if(l.r!=="toi"){R.log.push({l,cls:"now"});paint();sayThen(l[S.tgt],tok,()=>{if(R.tok!==tok)return;R.log[R.log.length-1].cls="";R.i++;step()});return}
    /* au tour de l'apprenant : la réplique dans sa langue, le micro si possible, sinon trois choix */
    const want=l[S.tgt],pool=[];for(const id in R.v.all){for(const x of R.v.all[id].lines)if(x.r==="toi"&&x[S.tgt]&&x[S.tgt]!==want)pool.push(x[S.tgt])}
    const near=shuffle(pool).sort((a,b)=>Math.abs(a.length-want.length)-Math.abs(b.length-want.length)).slice(0,6);
    R.opts=shuffle([want,...shuffle(near).slice(0,2)]);R.want=want;R.tried=false;
    const mic=SRC&&SR_LANG[S.tgt]?`<button class="vl-playall vl-mic" data-vrmic="1"><span aria-hidden="true">🎤 </span>${E(T("Parler"))}</button>`:"";
    paint(`<div class="vl-turn"><span class="vl-who">${E(T("À toi ! Dis :"))}</span><b data-noi18n="1">${E(inSrc(l))}</b>${mic}<p class="vl-muted vl-heard" id="vlHeard"></p>
      <p class="vl-muted">${E(T("Ou choisis la bonne réplique :"))}</p><div class="vl-opts">${R.opts.map((o,k)=>`<button class="vl-opt" data-vropt="${k}" lang="${S.tgt}" data-noi18n="1">${E(o)}</button>`).join("")}</div></div>`)}
  function good(){const tok=R.tok,l=R.v.sc.lines[R.i];R.log.push({l,cls:"ok"});paint();sayThen(l[S.tgt],tok,()=>{if(R.tok!==tok)return;R.log[R.log.length-1].cls="";R.i++;step()})}
  function finish(){const k=key(),m=doneMap(),prev=m[k];m[k]=prev==null?R.err:Math.min(prev,R.err);try{save()}catch(e){}
    paint(`<div class="vl-end"><span class="vl-end-ic" aria-hidden="true">🎭</span><b>${E(T("Scène rejouée !"))}</b>
      <span class="vl-muted">${R.err?`${E(T("Erreurs"))}${S.ui&&S.ui.lang==="fr"||S.src==="fr"?" :":":"} ${R.err}`:E(T("Sans faute !"))}</span>
      <div class="vl-end-btns"><button class="vl-playall" data-vrole="1">${E(T("Rejouer encore"))}</button><button class="vl-link" data-vrstop="1">${E(T("Revoir la scène"))}</button></div></div>`);
    try{toast(T("Scène rejouée !"))}catch(e){}}
  function listen(btn){if(!SRC)return;let rec;try{rec=new SRC()}catch(e){return}
    rec.lang=SR_LANG[S.tgt];rec.interimResults=false;rec.maxAlternatives=4;const out=document.getElementById("vlHeard");
    btn.disabled=true;btn.classList.add("on");if(out)out.textContent=T("J'écoute…");
    rec.onresult=ev=>{const alts=[...ev.results[0]].map(a=>a.transcript);const best=Math.max(...alts.map(a=>close(a,R.want)));
      if(out)out.textContent="« "+alts[0]+" »";
      if(best>=.6){setTimeout(good,350)}else{R.err++;if(out)out.textContent="« "+alts[0]+" » · "+T("Pas tout à fait. Réessaie ou choisis la bonne réplique.")}};
    rec.onerror=()=>{if(out)out.textContent=T("Je n'ai pas entendu. Réessaie ou choisis la bonne réplique.")};
    rec.onend=()=>{btn.disabled=false;btn.classList.remove("on")};try{rec.start()}catch(e){btn.disabled=false}}
  document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-vrole],[data-vropt],[data-vrmic],[data-vrstop],[data-vregtab]");if(!t)return;
    e.preventDefault();e.stopPropagation();
    if(t.dataset.vrole){try{window.__vlPlay=0}catch(err){}start();return}
    if(t.dataset.vrstop){stop();return}
    if(t.dataset.vrmic){listen(t);return}
    if(t.dataset.vropt!=null){const o=R.opts[+t.dataset.vropt];if(o===R.want){t.classList.add("ok");document.querySelectorAll(".vl-opt").forEach(b=>b.disabled=true);setTimeout(good,350)}
      else{R.err++;t.classList.add("bad");t.disabled=true;try{navigator.vibrate&&navigator.vibrate(60)}catch(err){}}return}
    if(t.dataset.vregtab!=null){const box=t.closest(".vl-reg");if(!box)return;box.querySelectorAll("[data-vregtab]").forEach(b=>b.setAttribute("aria-checked",b===t?"true":"false"));
      box.querySelectorAll(".vl-reg-p").forEach(p=>p.hidden=p.dataset.p!==t.dataset.vregtab);return}},true);

  /* ——— Dire autrement : trois registres ——— */
  let REG=null,regLoading=null;
  window.__castellumRegistres=d=>{REG=d};
  function regLoad(){if(REG)return Promise.resolve(REG);if(regLoading)return regLoading;
    regLoading=new Promise(res=>{const s=document.createElement("script");s.src="data/registres.js";s.onload=()=>res(REG);s.onerror=()=>res(null);document.head.appendChild(s)});return regLoading}
  const REG_LANGS=["fr","it","es","pt","en","de","nl","ary"];
  function regHTML(f){const P=[["fam","Familier","entre amis, en famille"],["cou","Courant","dans la plupart des situations"],["sou","Soutenu","au travail, à l'écrit, avec des inconnus"]];
    const x=f.t[S.tgt];if(!x)return "";
    return `<section class="vl-reg"><h3 class="vl-h3">${E(T("Dire autrement"))}</h3><p class="vl-muted"><b data-noi18n="1">${E(inSrc(f.n))}</b> · ${E(T("le même sens, trois tons"))}</p>
      <div class="vl-reg-tabs" role="radiogroup">${P.map(([k,n],i)=>`<button role="radio" aria-checked="${i===1}" data-vregtab="${k}">${E(T(n))}</button>`).join("")}</div>
      ${P.map(([k,n,h],i)=>`<div class="vl-reg-p" data-p="${k}" ${i===1?"":"hidden"}><div class="vl-reg-line"><button class="mini-say" data-say="${E(x[k])}" aria-label="Écouter">🔊</button><b lang="${S.tgt}" data-noi18n="1">${E(x[k])}</b></div><small class="vl-muted">${E(T(h))}</small></div>`).join("")}</section>`}
  window.__vlAfterSheet=function(U){if(!REG_LANGS.includes(S.tgt))return;const tgt=S.tgt;
    regLoad().then(d=>{const box=document.getElementById("vlReg");if(!d||!box||S.tgt!==tgt)return;const fid=d.map[U.id];const f=fid&&d.f[fid];if(f)box.innerHTML=regHTML(f)});
    const k=window.__vlScene&&window.__vlScene.id===U.id?key():"";const m=doneMap();
    if(k&&m[k]!=null){const b=document.querySelector("#sheetRoot [data-vrole]");if(b)b.insertAdjacentHTML("afterend",`<span class="vl-badge">✓ ${E(T("Déjà rejouée"))}</span>`)}};

  const css=document.createElement("style");css.textContent=`
.vl-roleact{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px}.vl-role{background:var(--vl-acc,#C2410C)!important}
.vl-badge{font-size:.85rem;font-weight:700;color:#2F6B3B}
.vl-rp .vl-line.ok{outline:2px solid #2F6B3B}.vl-rp{margin-top:8px}
.vl-turn{display:flex;flex-direction:column;gap:8px;margin-top:12px;padding:14px;border-radius:16px;background:var(--card,#fff);box-shadow:0 0 0 2px var(--vl-acc,#C2410C)}
.vl-turn>b{font-size:1.05rem;line-height:1.35}.vl-mic{align-self:flex-start}.vl-mic.on{background:#2F6B3B!important}
.vl-heard{min-height:1.2em}.vl-opts{display:flex;flex-direction:column;gap:8px}
.vl-opt{min-height:48px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line,#dfe3e6);background:var(--card,#fff);color:inherit;font:inherit;font-weight:600;text-align:left;cursor:pointer}
.vl-opt.ok{border-color:#2F6B3B;background:#E6F2E8;color:#1E4D28}.vl-opt.bad{border-color:#B42318;background:#FDECEA;color:#7A1A12;text-decoration:line-through}
.vl-end{display:flex;flex-direction:column;align-items:flex-start;gap:6px;margin-top:12px;padding:16px;border-radius:16px;background:var(--card,#fff)}
.vl-end-ic{font-size:2rem}.vl-end b{font-size:1.15rem}.vl-end-btns{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:4px}
.vl-path{margin-top:16px}.vl-path-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.vl-path-head .vl-h3{margin:0}
.vl-path-n{font-weight:800;color:var(--muted);font-size:.9rem}
.vl-path-bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin:8px 0 14px}.vl-path-bar i{display:block;height:100%;background:var(--good,#2F6B3B);border-radius:3px}
.vl-go{display:grid;grid-template-columns:1fr auto;grid-template-areas:"k arr" "t arr" "d arr";gap:2px 12px;width:100%;text-align:left;padding:16px 18px;border:0;border-radius:16px;background:#C2410C;color:#fff;cursor:pointer;font:inherit;min-height:76px;box-shadow:0 6px 16px rgba(194,65,12,.25)}
.vl-go:active{transform:scale(.99)}.vl-go-k{grid-area:k;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.9}
.vl-go b{grid-area:t;font-size:1.3rem;line-height:1.15}.vl-go small{grid-area:d;opacity:.92;font-size:.9rem}.vl-go-arr{grid-area:arr;align-self:center;font-size:1.7rem;font-weight:800}
.vl-alldone{margin:0;padding:14px 16px;border-radius:14px;background:var(--good-soft,#E6F2E8);color:var(--good-ink,#1E4D28);font-weight:700}
.vl-stepper{list-style:none;margin:14px 0 6px;padding:0}
.vl-sti{position:relative}.vl-sti:not(:last-child)::after{content:"";position:absolute;left:23px;top:44px;bottom:-8px;width:2px;background:var(--line)}
.vl-sti.done:not(:last-child)::after{background:var(--good,#2F6B3B)}
.vl-st{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 8px;border:0;background:none;text-align:left;font:inherit;color:inherit;border-radius:12px}
button.vl-st{cursor:pointer}button.vl-st:hover{background:color-mix(in srgb,var(--line) 45%,transparent)}
.vl-st-dot{position:relative;z-index:1;width:32px;height:32px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.88rem;border:2px solid var(--line);background:var(--surface,#fff);color:var(--muted)}
.vl-sti.done .vl-st-dot{background:var(--good,#2F6B3B);border-color:var(--good,#2F6B3B);color:#fff}
.vl-sti.cur .vl-st-dot{background:#C2410C;border-color:#C2410C;color:#fff;box-shadow:0 0 0 4px rgba(194,65,12,.2)}
.vl-sti.cur .vl-st-t b{color:#C2410C}
.vl-sti.bonus .vl-st-dot{border-style:dashed}
.vl-st-t{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0}.vl-st-t b{font-size:1rem;line-height:1.2}.vl-st-t small{color:var(--muted);font-size:.84rem;line-height:1.3}
.vl-sti.lock .vl-st-t,.vl-sti.lock .vl-st-dot{opacity:.55}
.vl-st-lock{font-size:.85rem;opacity:.6}.vl-st-re{font-size:.82rem;font-weight:800;color:var(--accent)}
.cs-intro{margin:-4px 2px 14px;color:var(--muted);font-size:.95rem;line-height:1.45}
.vl-reg{margin-top:6px}.vl-reg-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;border-radius:12px;background:var(--line,#EEF2F5);margin:8px 0}
.vl-reg-tabs button{min-height:40px;border:0;border-radius:9px;background:transparent;font:inherit;font-size:.9rem;font-weight:600;color:inherit;cursor:pointer}
.vl-reg-tabs button[aria-checked="true"]{background:var(--card,#fff);font-weight:800;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.vl-reg-p{display:flex;flex-direction:column;gap:4px;padding:12px;border-radius:12px;border:1px solid var(--line,#E3E6E8)}
.vl-reg-line{display:flex;gap:10px;align-items:center}.vl-reg-line b{font-size:1.1rem}
`;
  document.head.appendChild(css);
  /* Mode sombre : réglage du téléphone (sauf thème clair forcé) ou thème sombre choisi dans l'appli */
  const DARK=`.vl-line{background:#1B2744}.vl-line.me{background:#3A2619}.vl-line b,.vl-reg-line b,.vl-turn>b,.vl-end b{color:#EEF2FF}
.vl-line small,.vl-who,.vl-set,.vl-muted{color:#A9B8D0}.vl-line.now{outline-color:#F2A57E}
.vl-turn,.vl-end,.vl-opt,.vl-reg-p{background:#16203A;color:#EEF2FF;border-color:#2C3A5C}
.vl-opt.ok{background:#16351d;color:#cfe9d3;border-color:#3E8A50}.vl-opt.bad{background:#3a1512;color:#f3c9c4;border-color:#B42318}
.vl-reg-tabs{background:#0F1830}.vl-reg-tabs button{color:#C9D4E8}.vl-reg-tabs button[aria-checked="true"]{background:#24345A;color:#fff}
.vl-badge{color:#8fd19c}.vl-sti.cur .vl-st-t b{color:#F2A57E}
.vl{--vl-card:#16203A}.vl-tab,.vl-next,.vl-sx,.vl-q,.vl-step{background:#16203A;color:#EEF2FF;border-color:#2C3A5C}
.vl-tab small,.vl-q small,.vl-sx small{color:#A9B8D0}.vl-tab.on{background:#EEF2FF;border-color:#EEF2FF;color:#13224F}.vl-tab.on small{color:#3A4A6B}
.vl-next h2,.vl-head h1{color:#EEF2FF}.vl-chip{background:#24345A;color:#EEF2FF}
.vl-step.done{background:#1E3A2A;border-color:#3E8A50;color:#cfe9d3}.vl-step.locked{opacity:.55}`;
  const pre=(sel,css)=>css.replace(/(^|\})\s*([^{}]+)\{/g,(m,b,list)=>b+list.split(",").map(x=>sel+" "+x.trim()).join(",")+"{");
  const dk=document.createElement("style");
  dk.textContent="@media (prefers-color-scheme:dark){"+pre(':root:not([data-theme="light"])',DARK)+"}"+pre(':root[data-theme="dark"]',DARK);
  document.head.appendChild(dk);
})();
