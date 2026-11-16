/* Exercices et jeux, plus simples à jouer :
   - questions à choix : un seul toucher suffit, la réponse est vérifiée tout de suite ;
   - « Passer » devient un lien discret « Je ne sais pas » ; « Indice » aussi ;
   - la question s'affiche dans une grande carte, sans la mascotte à côté ;
   - correction claire : « Pas tout à fait », puis « Bonne réponse : … » et l'explication ;
   - « Associe les paires » n'affiche plus de bouton « Vérifier » inutile. */
(function(){
  if(typeof renderFoot!=="function"||typeof renderStep!=="function"||typeof check!=="function")return;
  const T=t=>{try{return tr(t)}catch(e){return t}};
  const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const cur=()=>(typeof LX!=="undefined"&&LX&&LX.steps)?LX.steps[LX.i]:null;
  const isChoice=st=>!!st&&Array.isArray(st.opts)&&st.opts.length>1&&st.k!=="build"&&st.k!=="match";
  const hasOpts=()=>!!document.querySelector("#lxInner .opt");

  /* Traductions mot à mot déduites des phrases parallèles (data/gloss/<langue>.js), chargées à la demande */
  const GL={},glLoad={};
  window.__castellumGloss=(t,d)=>{GL[t]=d};
  function glossLoad(t){if(GL[t]||glLoad[t]||!/^(fr|it|es|pt|en|de|nl|ary)$/.test(t))return;glLoad[t]=1;const sc=document.createElement("script");sc.src="data/gloss/"+t+".js";sc.onerror=()=>{glLoad[t]=0};document.head.appendChild(sc)}
  window.castellumGloss=function(word,dir){try{const d=GL[S.tgt]&&GL[S.tgt][S.src];if(!d)return "";const m=d[dir==="r"?"r":"t"];
    const k=String(word||"").toLowerCase().normalize("NFC").replace(/’/g,"'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}']+$/gu,"");if(!k)return "";
    if(m[k])return m[k];const i=k.lastIndexOf("'");if(i>0&&i<k.length-1){const a=m[k.slice(i+1)];if(a)return a}return ""}catch(e){return ""}};
  window.castellumGlossLoad=()=>glossLoad(S.tgt);
  const pStep=renderStep;renderStep=function(){try{glossLoad(S.tgt)}catch(e){}const r=pStep.apply(this,arguments);try{const R=document.getElementById("lxRoot");if(R)R.classList.add("jx");const st=cur(),inn=document.getElementById("lxInner");if(st&&inn)inn.dataset.k=st.k}catch(e){}return r};

  const pFoot=renderFoot;renderFoot=function(){const r=pFoot.apply(this,arguments);try{foot()}catch(e){}try{voiceChoice()}catch(e){}return r};
  function foot(){const st=cur(),f=document.getElementById("lxFoot");if(!st||!f||LX.game==="chrono")return;
    const R=document.getElementById("lxRoot");if(R)R.classList.add("jx");
    if(LX.state==="idle"){
      if(isChoice(st)&&hasOpts()){const skip=!!f.querySelector('[data-lx="skip"]');
        f.innerHTML=`<div class="foot-in jx-idle"><span class="jx-hint">${E(T("Touche ta réponse"))}</span>${skip?`<button class="jx-link" data-lx="skip">${E(T("Je ne sais pas"))}</button>`:""}${["listen","dictee"].includes(st.k)?`<button class="jx-link" data-lx="nohear">🔇 ${E(T("Je ne peux pas entendre"))}</button>`:""}</div>`;return}
      if(st.k==="match"){f.innerHTML=`<div class="foot-in jx-idle"><span class="jx-hint">${E(T("Touche un mot, puis sa traduction"))}</span></div>`;return}
      if(st.k==="build"&&f.querySelector('[data-lx="check"]')&&!f.querySelector(".jx-hint")){const fi=f.querySelector(".foot-in");if(fi)fi.insertAdjacentHTML("afterbegin",`<span class="jx-hint jx-hint-build">${E(T("Touche les mots ou fais-les glisser"))}</span>`)}
      if(f.querySelector('[data-lx="check"]')){f.classList.add("jx-stack");
        f.querySelectorAll('.foot-left [data-lx]').forEach(b=>{b.classList.remove("btn","ghost","hint-btn");b.classList.add("jx-link");if(b.dataset.lx==="skip")b.textContent=T("Je ne sais pas")})}
      return}
    if(LX.state!=="good"&&LX.state!=="bad")return;
    const good=LX.state==="good";f.classList.add("jx-fb");
    const badge=f.querySelector(".foot-msg .badge");if(badge){badge.className="badge jx-badge";badge.textContent=good?"✓":"✕";badge.setAttribute("aria-hidden","true")}
    const title=f.querySelector(".foot-msg b");
    if(!good&&title&&st.k!=="card"&&st.k!=="match"){title.textContent=T("Pas tout à fait");
      const ans=title.nextElementSibling;if(ans&&ans.tagName==="SPAN"&&!f.querySelector(".jx-lab"))ans.insertAdjacentHTML("beforebegin",`<small class="jx-lab">${E(T("Bonne réponse :"))}</small>`)}}

  /* Voix : celle du téléphone d'abord quand elle est native pour la langue (plus naturelle que l'audio
     intégré, synthétisé avec un accent). Réglage « Audio intégré » pour revenir aux fichiers. Le latin garde ses fichiers. */
  const DEV_LANGS=new Set(["it","fr","es","pt","en","de","nl"]);
  const vsrc=()=>{try{return localStorage.getItem("castellumVoiceSrc")||"device"}catch(e){return "device"}};
  let devBad=0;
  function goodDevice(code){try{if(devBad>=2||!DEV_LANGS.has(code)||vsrc()==="files"||!window.speechSynthesis)return null;
    const v=typeof voiceFor==="function"?voiceFor(code):null;if(!v||!v.lang)return null;
    if(!v.lang.toLowerCase().replace("_","-").startsWith(code))return null;
    if(/espeak|festival|pico|mbrola/i.test(v.name||""))return null;return v}catch(e){return null}}
  window.castellumDeviceFirst=code=>!!goodDevice(code);
  const pSpeak=speak;speak=function(text,code,slow){code=code||S.tgt;const v=goodDevice(code);if(!v)return pSpeak.apply(this,arguments);
    try{const A=window.CastellumAudio;if(A){A.seq++;try{if(A.audio&&!A.audio.paused)A.audio.pause()}catch(e){}A.state="idle"}
      speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text||"").replace(/\s*\(.*?\)/g,"").trim());
      u.voice=v;u.lang=v.lang;u.__mine=true;let r=.92;try{r=Number(JSON.parse(localStorage.getItem("castellumAudioPrefsV2")||"{}").rate)||.92}catch(e){}
      u.rate=slow?.62:r;
      /* iPhone : un cancel() suivi tout de suite de speak() avale parfois la phrase ; et si la voix ne démarre pas,
         on reprend l'audio intégré ou la voix en ligne au lieu de rester muet. */
      const ss=speechSynthesis,busy=ss.speaking||ss.pending,args=arguments,self=this;let started=false,dead=false;
      const back=()=>{if(dead||started||window.__jxUtt!==u)return;dead=true;devBad++;try{ss.cancel()}catch(e){}try{pSpeak.apply(self,args)}catch(e){}try{const A=window.CastellumAudio;if(A&&A.refresh)A.refresh()}catch(e){}};
      u.onstart=()=>{started=true;devBad=0};u.onerror=ev=>{const k=ev&&ev.error;if(k==="interrupted"||k==="canceled")return;back()};
      window.__jxUtt=u;if(busy){ss.cancel();setTimeout(()=>{if(window.__jxUtt===u)ss.speak(u)},90)}else ss.speak(u);
      setTimeout(()=>{if(!started&&!ss.speaking)back()},1800);
      return true}catch(e){return pSpeak.apply(this,arguments)}};
  /* « Pas de son ? » : aide courte à côté de la source audio, avec un bouton pour passer à l'audio intégré */
  function soundHelp(){document.querySelectorAll("#lxStep [data-a2-status]").forEach(el0=>{const el=el0.closest(".audio-premium-bar")||el0;if(el.nextElementSibling&&el.nextElementSibling.classList.contains("jx-nosound"))return;
    el.insertAdjacentHTML("afterend",`<button type="button" class="jx-nosound" data-jxsound="1">${E(T("Pas de son ?"))}</button>`)})}
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-jxsound],[data-jxfiles]");if(!b)return;e.preventDefault();e.stopPropagation();
    if(b.dataset.jxfiles){try{localStorage.setItem("castellumVoiceSrc","files")}catch(err){}try{const h=document.getElementById("jxHelp");if(h)h.remove()}catch(err){}try{const A=window.CastellumAudio;if(A&&A.refresh)A.refresh()}catch(err){}
      const st=cur();if(st&&st.it&&st.it.t)try{speak(st.it.t)}catch(err){}try{toast(T("Audio intégré activé"))}catch(err){}return}
    const old=document.getElementById("jxHelp");if(old){old.remove();return}
    b.insertAdjacentHTML("afterend",`<div class="jx-help" id="jxHelp"><ol><li>${E(T("Monte le volume du téléphone."))}</li><li>${E(T("iPhone : désactive le mode silencieux (petit interrupteur sur le côté). En mode silencieux, la voix du téléphone est coupée."))}</li>
      <li>${E(T("Toujours rien ? Passe à l'audio intégré : il marche même en mode silencieux."))}</li></ol>
      <button type="button" class="jx-usefiles" data-jxfiles="1">📦 ${E(T("Utiliser l'audio intégré"))}</button></div>`)},true);
  if(typeof renderFoot==="function"){const pf=renderFoot;renderFoot=function(){const r=pf.apply(this,arguments);try{soundHelp()}catch(e){}return r}}
  function voiceChoice(){const more=document.querySelector("#lxStep .a2-more");if(!more||more.querySelector(".jx-vsrc"))return;
    if(!DEV_LANGS.has(S.tgt))return;const cur=vsrc(),has=!!(typeof voiceFor==="function"&&voiceFor(S.tgt));
    more.insertAdjacentHTML("afterbegin",`<div class="jx-vsrc" role="radiogroup" aria-label="${E(T("Voix"))}"><b>${E(T("Voix"))}</b>
      <button type="button" role="radio" aria-checked="${cur!=="files"}" data-vsrc="device">📱 ${E(T("Voix du téléphone"))}${has?"":` <small>(${E(T("aucune installée"))})</small>`}</button>
      <button type="button" role="radio" aria-checked="${cur==="files"}" data-vsrc="files">📦 ${E(T("Audio intégré"))}</button></div>`)}
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-vsrc]");if(!b)return;e.preventDefault();e.stopPropagation();
    try{localStorage.setItem("castellumVoiceSrc",b.dataset.vsrc)}catch(err){}
    b.parentElement.querySelectorAll("[data-vsrc]").forEach(x=>x.setAttribute("aria-checked",String(x===b)));
    try{const A=window.CastellumAudio;if(A&&A.refresh)A.refresh()}catch(err){}
    const st=cur();if(st&&st.it&&st.it.t)try{speak(st.it.t)}catch(err){}},true);

  /* « Traduis cette phrase » : glisser-déposer en plus du toucher.
     Réserve → réponse (insertion à l'endroit du lâcher), réordonner dans la réponse, ramener vers la réserve pour retirer. */
  let DR=null;
  const inside=(el,e)=>{const r=el.getBoundingClientRect();return e.clientX>=r.left-12&&e.clientX<=r.right+12&&e.clientY>=r.top-16&&e.clientY<=r.bottom+16};
  function insertIndex(tray,e,skip){const toks=[...tray.querySelectorAll(".tok")].filter(x=>x!==skip);
    for(let i=0;i<toks.length;i++){const r=toks[i].getBoundingClientRect();if(e.clientY<r.top||(e.clientY<=r.bottom&&e.clientX<r.left+r.width/2))return i}return toks.length}
  function markInsert(tray,idx,skip){if(!tray)return;const toks=[...tray.querySelectorAll(".tok")].filter(x=>x!==skip);
    toks.forEach((t,i)=>t.classList.toggle("jx-before",i===idx));tray.classList.toggle("jx-end",idx>=0&&idx===toks.length)}
  function dragEnd(){if(!DR)return;try{DR.g&&DR.g.remove()}catch(e){}DR.t&&DR.t.classList.remove("jx-dragsrc");
    const tray=document.getElementById("tray");if(tray){tray.classList.remove("jx-over","jx-end");tray.querySelectorAll(".jx-before").forEach(x=>x.classList.remove("jx-before"))}DR=null}
  document.addEventListener("pointerdown",e=>{if(e.button>0)return;const t=e.target.closest&&e.target.closest("#lxStep .bank .tok[data-b],#lxStep .tray .tok[data-unb]");
    if(!t||typeof LX==="undefined"||!LX||LX.state!=="idle")return;const st=cur();if(!st||st.k!=="build")return;
    DR={t,x:e.clientX,y:e.clientY,id:e.pointerId,on:false,from:t.dataset.b!=null?"bank":"tray",ix:+(t.dataset.b!=null?t.dataset.b:t.dataset.unb)}},true);
  document.addEventListener("pointermove",e=>{if(!DR||e.pointerId!==DR.id)return;
    if(!DR.on){if(Math.hypot(e.clientX-DR.x,e.clientY-DR.y)<8)return;DR.on=true;const r=DR.t.getBoundingClientRect();
      const g=DR.t.cloneNode(true);g.removeAttribute("data-b");g.removeAttribute("data-unb");g.classList.add("jx-ghost");g.style.width=r.width+"px";g.style.left=r.left+"px";g.style.top=r.top+"px";
      document.body.appendChild(g);DR.g=g;DR.ox=DR.x-r.left;DR.oy=DR.y-r.top;DR.t.classList.add("jx-dragsrc")}
    e.preventDefault();DR.g.style.left=(e.clientX-DR.ox)+"px";DR.g.style.top=(e.clientY-DR.oy)+"px";
    const tray=document.getElementById("tray");const over=!!(tray&&inside(tray,e));if(tray)tray.classList.toggle("jx-over",over);
    markInsert(tray,over?insertIndex(tray,e,DR.from==="tray"?DR.t:null):-1,DR.from==="tray"?DR.t:null)},{passive:false});
  document.addEventListener("pointerup",e=>{if(!DR||e.pointerId!==DR.id)return;const d=DR;if(!d.on){DR=null;return}
    e.preventDefault();const tray=document.getElementById("tray");const over=!!(tray&&inside(tray,e));
    const at=over?insertIndex(tray,e,d.from==="tray"?d.t:null):-1;dragEnd();window.__jxNoClick=Date.now();
    const st=cur();if(!st||st.k!=="build"||LX.state!=="idle")return;
    if(d.from==="bank"){if(!over)return;st.built.splice(at,0,d.ix);try{tone(SND.tap)}catch(err){}try{speak(st.bank[d.ix])}catch(err){}}
    else{const val=st.built[d.ix];st.built.splice(d.ix,1);if(over)st.built.splice(at,0,val)}
    const box=document.getElementById("lxStep");if(box)box.innerHTML=stepHTML(st);try{refreshCheck()}catch(err){}},true);
  document.addEventListener("pointercancel",e=>{if(DR&&e.pointerId===DR.id)dragEnd()},true);
  document.addEventListener("click",e=>{if(window.__jxNoClick&&Date.now()-window.__jxNoClick<250&&e.target.closest&&e.target.closest("#lxStep .tok,.jx-ghost")){e.stopPropagation();e.preventDefault()}},true);

  /* Un toucher = une réponse (le module d'origine retient le choix, puis on vérifie) */
  function autoCheck(st){setTimeout(()=>{try{if(LX&&LX.state==="idle"&&LX.sel!=null&&cur()===st)check()}catch(e){}},170)}
  document.addEventListener("click",e=>{const o=e.target.closest&&e.target.closest("#lxInner .opt");if(!o||o.disabled)return;
    const st=cur();if(!st||!isChoice(st)||LX.state!=="idle"||LX.game==="chrono")return;autoCheck(st)});
  document.addEventListener("keydown",e=>{if(!/^[1-9]$/.test(e.key))return;const st=cur();if(!st||!isChoice(st)||!LX||LX.state!=="idle"||LX.game==="chrono")return;
    if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;autoCheck(st)});

  const css=document.createElement("style");css.textContent=`
.jx .q-title{font-size:1rem;font-weight:700;color:var(--muted);margin:2px 0 10px;letter-spacing:0}
.jx .speaker{display:block}.jx .speaker>.mascot,.jx .speaker>img.mascot{display:none}
.jx .bubble{width:100%;margin:0 0 18px;border-radius:18px;padding:18px;font-size:1.4rem;font-weight:800;line-height:1.3;background:var(--surface);border:2px solid var(--line);box-shadow:none;color:var(--ink)}
.jx .bubble::before,.jx .bubble::after{display:none}
.jx .opts{gap:10px}
.jx .opt{min-height:58px;border-radius:14px;box-shadow:none;font-weight:700;font-size:1.08rem;padding:14px 16px;transition:transform .08s,border-color .15s,background .15s}
.jx .opt:active{transform:scale(.98)}
.jx .opt.right,.jx .opt.wrong{box-shadow:none}
.jx .opt.right::after{content:"✓";margin-left:auto;font-weight:900;font-size:1.2rem}
.jx .opt.wrong::after{content:"✕";margin-left:auto;font-weight:900;font-size:1.1rem}
@media (pointer:coarse){.jx .opt kbd{display:none}}
.jx .tip{padding:10px 14px;border-radius:14px;gap:10px;margin-bottom:14px;align-items:center}
.jx .tip .mascot{width:32px!important;height:32px!important;flex:none}
.jx .tip p{font-size:.88rem;line-height:1.35;margin:0}
.jx .tok{border-radius:12px;min-height:46px;box-shadow:none;font-weight:700}
.jx .tray{min-height:62px;border-radius:14px;border:2px dashed var(--line);padding:8px;margin-bottom:14px}
.jx-idle{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:56px}
.jx-hint{color:var(--muted);font-weight:600;font-size:.95rem}
.jx-link{background:none;border:0;color:var(--accent);font:inherit;font-weight:700;font-size:.95rem;padding:8px 12px;min-height:40px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;box-shadow:none}
.jx-stack .foot-in{display:flex;flex-direction:column;align-items:stretch;gap:4px}
.jx-stack .foot-in>[data-lx="check"]{width:100%;order:1}
.jx-stack .foot-left{order:2;display:flex;justify-content:center;gap:8px}
.jx-stack .jx-hint-build{order:0;text-align:center;margin-bottom:4px}
.jx-fb .foot-in{display:flex;flex-direction:column;align-items:stretch;gap:12px}
.jx-fb .foot-msg{display:flex;align-items:flex-start;gap:12px}
.jx-badge{width:36px;height:36px;border-radius:50%;display:flex!important;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;flex:none;background:var(--good);color:#fff}
.lx-foot.bad .jx-badge{background:var(--bad)}
.jx-fb .foot-msg b{font-size:1.2rem;display:block}
.jx-fb .foot-msg>div>span[lang]{font-size:1.1rem;font-weight:800}
.jx .lx-foot .mbadge img,.jx .lx-foot .badge img{display:none!important}
.jx .lx-foot.jx-fb .badge{width:36px;height:36px;border-radius:50%;display:flex!important;align-items:center;justify-content:center;flex:none;background:var(--good);color:#fff;font-size:0}
.jx .lx-foot.jx-fb.bad .badge{background:var(--bad)}
.jx .lx-foot.jx-fb .badge::before{content:"✓";font-size:1.15rem;font-weight:900}
.jx .lx-foot.jx-fb.bad .badge::before{content:"✕"}
.jx .tok.ghost{background:transparent;border:2px dashed var(--line);color:transparent;box-shadow:none}
.charbar{display:none!important}
.u2-tool[data-go="home"]{display:none!important}
.cs-h2{margin:18px 2px 10px;font-size:1.25rem}
.cs-progress{margin-bottom:6px}
.cs-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}
.cs-stats>div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 4px;border-radius:14px;background:var(--surface);border:1.5px solid var(--line);text-align:center}
.cs-stats b{font-size:1.25rem}.cs-stats span{font-size:.72rem;color:var(--muted);line-height:1.2}
.cs-more{display:block;margin:10px auto 0;font-weight:700}
#lxStep .bank .tok[data-b],#lxStep .tray .tok[data-unb]{touch-action:none;-webkit-user-select:none;user-select:none;cursor:grab}
.jx-ghost{position:fixed;z-index:9999;pointer-events:none;margin:0!important;transform:rotate(-2deg) scale(1.06);box-shadow:0 10px 24px rgba(0,0,0,.22)!important;opacity:.96;cursor:grabbing}
#lxStep .tok.jx-dragsrc{opacity:.3}
#lxStep .tray.jx-over{border-color:var(--accent)!important;background:color-mix(in srgb,var(--accent) 8%,transparent)}
#lxStep .tray .tok.jx-before{box-shadow:-6px 0 0 -2px var(--accent)!important;margin-left:8px}
#lxStep .tray.jx-end::after{content:"";display:inline-block;width:4px;height:40px;border-radius:2px;background:var(--accent);vertical-align:middle;margin-left:4px}
.jx-vsrc{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0 8px}.jx-vsrc b{width:100%;font-size:.85rem}
.jx-vsrc [data-vsrc]{min-height:40px;padding:6px 12px;border-radius:999px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink);font:inherit;font-weight:700;font-size:.9rem;cursor:pointer}
.jx-vsrc [data-vsrc][aria-checked="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.vl .cov2{display:none}
.vl .levels{display:flex!important;flex-wrap:nowrap;overflow-x:auto;gap:6px;scrollbar-width:none;padding:2px 0 4px;margin:0}
.vl .levels::-webkit-scrollbar{display:none}
.vl .lvl{flex:0 0 auto!important;min-width:0!important;display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 14px 8px!important;border-radius:14px!important;box-shadow:none!important;border-width:1.5px}
.vl .lvl>span{display:none}
.vl .lvl b{font-size:.95rem}
.vl .lvl i{display:block;width:30px;height:3px;border-radius:2px;background:var(--line);overflow:hidden}
.vl .lvl i em{display:block;height:100%;background:var(--vl-acc,#C2410C)}
.vl .lvl.on{background:var(--ink)!important;border-color:var(--ink)!important;color:var(--bg)!important}
.vl .lvl.on b{color:var(--bg)}
.vl .lvl{flex:1 1 0!important;padding-left:6px!important;padding-right:6px!important}
.modes{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.modes .mode{display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding:14px!important;border-radius:16px!important;min-height:0;text-align:left;box-shadow:none!important;border:1.5px solid var(--line)!important;background:var(--surface)}
.modes .mode .mode-ic{width:40px!important;height:40px!important;border-radius:12px!important;box-shadow:none!important}
.modes .mode .mode-t b{font-size:1rem;line-height:1.2}
.modes .mode .mode-t small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:.82rem;line-height:1.3;margin-top:3px}
.modes .mode[data-mode="review"]{grid-column:1/-1;flex-direction:row;align-items:center;border:2px solid var(--good)!important}
.modes .mode .tag.jx-gone{display:none}
.modes .mode:not([data-mode="review"]){flex-direction:column!important;align-items:flex-start!important;position:relative}
.modes .mode:not([data-mode="review"])>*{width:auto!important;max-width:100%}
.modes .mode .mode-t{flex:1 1 auto!important;min-width:0}
.modes .mode .tag{position:absolute;top:10px;right:10px;margin:0!important}
.modes .mode{display:flex!important;grid-template-columns:none!important;background:var(--surface)!important;color:var(--ink)!important}.modes .mode .mode-ic{grid-row:auto!important;grid-column:auto!important}.modes .mode .mode-t{grid-column:auto!important;padding-right:0}
@media (min-width:900px){.modes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.jx-lab{display:block;font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;opacity:.8;margin-top:6px}
.jx-fb .quip{display:none}
.jx-nosound{all:unset;display:inline-block;margin:2px 0 0;font-size:.85rem;font-weight:700;color:var(--blue,#3b6cf6);text-decoration:underline;cursor:pointer;min-height:32px;line-height:32px}
.jx-help{margin:6px 0 10px;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line,#dfe3e6);background:var(--surface,#fff);color:var(--ink,#14324A);font-size:.92rem}
.jx-help ol{margin:0 0 10px;padding-left:20px;display:flex;flex-direction:column;gap:6px;line-height:1.4}
.jx-usefiles{all:unset;box-sizing:border-box;display:block;width:100%;text-align:center;min-height:46px;line-height:46px;border-radius:12px;background:var(--blue,#3b6cf6);color:#fff;font-weight:800;cursor:pointer}
.jx-fb .foot-in>div:last-child{justify-content:stretch!important;flex-wrap:nowrap!important}
.jx-fb #nextBtn{flex:1}`;
  document.head.appendChild(css);
  /* Menu simplifié : Apprendre · Pratiquer · Château, puis Outils. Progrès est dans le Château, Accueil disparaît
     (on arrive sur Apprendre). Les pages restent accessibles par leurs liens. */
  try{if(typeof NAV_SET==="function"&&typeof NAV_BASE!=="undefined"){
    NAV_SET=function(){NAV.length=0;const main=["learn","play","castle"];main.forEach(k=>{const n=NAV_BASE.find(x=>x[0]===k);if(n)NAV.push(n)});
      const signed=typeof Cloud!=="undefined"&&Cloud.signedIn;if(signed)NAV.push(["friends","Amis"],["account","Profil"]);else if(typeof Cloud!=="undefined"&&Cloud.enabled)NAV.push(["account","Se connecter"]);
      NAV.push(...NAV_BASE.filter(n=>!main.includes(n[0])&&n[0]!=="profile"&&n[0]!=="home"))};NAV_SET()}}catch(e){}
  if(typeof navHTML==="function"){const pN=navHTML;navHTML=function(mobile){if(!mobile)return pN.apply(this,arguments);
    const cur=view==="list"?"lists":view;const items=[...NAV.slice(0,3),["more","Outils"]];
    return items.map(([k,n])=>`<button ${k==="more"?'data-act="more"':`data-go="${k}"`} ${cur===k||(k==="castle"&&cur==="profile")||(k==="more"&&!["learn","play","castle","profile"].includes(cur))?'aria-current="page"':""} aria-label="${n}">${svgI(I[k==="more"?"more":k])}<span>${n}</span></button>`).join("")}}
  /* Plus de touches d'accents sous les champs (le clavier du téléphone suffit) : l'astuce ne les mentionne plus */
  try{const LONG=" Les touches sous la case t'aident à écrire les lettres spéciales.";
    for(const k in TIPS){if(typeof TIPS[k]==="string"&&TIPS[k].includes(LONG)){const full=TIPS[k],short=full.replace(LONG,"");TIPS[k]=short;
      if(typeof I18N!=="undefined")for(const l in I18N){const t=I18N[l]&&I18N[l][full];if(t&&I18N[l][short]==null){const m=t.match(/^.*?[.!。]\s/);I18N[l][short]=m?m[0].trim():t}}}}}catch(e){}
  /* Les cœurs n'existent plus : on retire les phrases et étiquettes qui en parlent encore (page Jouer) */
  if(typeof render==="function"){const pr=render;render=function(){try{if(typeof view!=="undefined"&&view==="home")view="learn"}catch(err){}const r=pr.apply(this,arguments);try{
    document.querySelectorAll("#view .section-head p.muted").forEach(p=>{if(/cœur|cuor|coraz|hearts?\b|Herz|hart/i.test(p.textContent)&&p.closest("#view .section-head").querySelector("#playSet,.field")||/cœurs?/.test(p.textContent))p.remove()});
    document.querySelectorAll("#view .modes .mode .tag").forEach(t=>{if(/cœur|♥|heart|cuor|coraz|Herz|hart/i.test(t.textContent))t.classList.add("jx-gone")})}catch(e){}return r}}
  if(typeof I18N!=="undefined"){const V={it:{"Voix":"Voce","Voix du téléphone":"Voce del telefono","Audio intégré":"Audio integrato","aucune installée":"nessuna installata"},
    es:{"Voix":"Voz","Voix du téléphone":"Voz del teléfono","Audio intégré":"Audio integrado","aucune installée":"ninguna instalada"},
    pt:{"Voix":"Voz","Voix du téléphone":"Voz do telemóvel","Audio intégré":"Áudio integrado","aucune installée":"nenhuma instalada"},
    en:{"Voix":"Voice","Voix du téléphone":"Phone voice","Audio intégré":"Built-in audio","aucune installée":"none installed"},
    de:{"Voix":"Stimme","Voix du téléphone":"Stimme des Handys","Audio intégré":"Integriertes Audio","aucune installée":"keine installiert"},
    nl:{"Voix":"Stem","Voix du téléphone":"Stem van de telefoon","Audio intégré":"Ingebouwde audio","aucune installée":"geen geïnstalleerd"},
    ary:{"Voix":"S-sowt","Voix du téléphone":"Sowt t-tilifoun","Audio intégré":"L-audio dyal l-application","aucune installée":"ma kayn 7tta wa7ed"}};
    const X={it:{"Ma progression":"I miei progressi","Mon royaume":"Il mio regno","Toutes mes statistiques et réglages":"Tutte le statistiche e le impostazioni"},
      es:{"Ma progression":"Mi progreso","Mon royaume":"Mi reino","Toutes mes statistiques et réglages":"Todas mis estadísticas y ajustes"},
      pt:{"Ma progression":"O meu progresso","Mon royaume":"O meu reino","Toutes mes statistiques et réglages":"Todas as estatísticas e definições"},
      en:{"Ma progression":"My progress","Mon royaume":"My kingdom","Toutes mes statistiques et réglages":"All my stats and settings"},
      de:{"Ma progression":"Mein Fortschritt","Mon royaume":"Mein Königreich","Toutes mes statistiques et réglages":"Alle Statistiken und Einstellungen"},
      nl:{"Ma progression":"Mijn voortgang","Mon royaume":"Mijn koninkrijk","Toutes mes statistiques et réglages":"Al mijn statistieken en instellingen"},
      ary:{"Ma progression":"T-ta9addom dyali","Mon royaume":"L-mamlaka dyali","Toutes mes statistiques et réglages":"Ga3 l-i7sa2iyat w l-i3dadat dyali"}};
    for(const l in X){V[l]=V[l]||{};Object.assign(V[l],X[l])}
    const W={it:"Tocca le parole o trascinale",es:"Toca las palabras o arrástralas",pt:"Toca nas palavras ou arrasta-as",en:"Tap the words or drag them",de:"Tippe die Wörter an oder zieh sie",nl:"Tik de woorden aan of sleep ze",ary:"Wrrek 3la l-klimat wla jerrhom"};
    for(const l in W){V[l]=V[l]||{};V[l]["Touche les mots ou fais-les glisser"]=W[l]}
    for(const l in V){I18N[l]=I18N[l]||{};for(const k in V[l])if(I18N[l][k]==null)I18N[l][k]=V[l][k]}
    const U={
    it:{"Touche ta réponse":"Tocca la tua risposta","Je ne sais pas":"Non lo so","Touche un mot, puis sa traduction":"Tocca una parola, poi la sua traduzione","Pas tout à fait":"Non proprio"},
    es:{"Touche ta réponse":"Toca tu respuesta","Je ne sais pas":"No lo sé","Touche un mot, puis sa traduction":"Toca una palabra y luego su traducción","Pas tout à fait":"No del todo"},
    pt:{"Touche ta réponse":"Toca na tua resposta","Je ne sais pas":"Não sei","Touche un mot, puis sa traduction":"Toca numa palavra e depois na tradução","Pas tout à fait":"Não exatamente"},
    en:{"Touche ta réponse":"Tap your answer","Je ne sais pas":"I don't know","Touche un mot, puis sa traduction":"Tap a word, then its translation","Pas tout à fait":"Not quite"},
    de:{"Touche ta réponse":"Tippe deine Antwort an","Je ne sais pas":"Ich weiß es nicht","Touche un mot, puis sa traduction":"Tippe ein Wort an, dann seine Übersetzung","Pas tout à fait":"Nicht ganz"},
    nl:{"Touche ta réponse":"Tik je antwoord aan","Je ne sais pas":"Ik weet het niet","Touche un mot, puis sa traduction":"Tik een woord aan en dan de vertaling","Pas tout à fait":"Niet helemaal"},
    ary:{"Touche ta réponse":"Wrrek 3la l-jawab dyalek","Je ne sais pas":"Ma 3reftch","Touche un mot, puis sa traduction":"Wrrek 3la kelma, w men b3d 3la t-tarjama dyalha","Pas tout à fait":"Machi bezzaf"}};
    for(const l in U){I18N[l]=I18N[l]||{};for(const k in U[l])if(I18N[l][k]==null)I18N[l][k]=U[l][k]}}
})();
