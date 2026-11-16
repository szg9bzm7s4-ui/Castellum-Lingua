/* Conversation avec une IA dans la langue étudiée (API Claude).
   Connexion, dans l'ordre : l'appli ouverte dans Claude ; une clé personnelle enregistrée sur l'appareil ;
   la fonction Supabase « castellum-chat » pour les utilisateurs connectés. */
(function(){
  if(typeof render!=="function")return;
  const MODEL="claude-opus-5-5";
  const KEY_STORE="castellum-anthropic-key";
  const E=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const SCEN=[["libre","💬","Conversation libre"],["rencontre","🤝","Faire connaissance"],["cafe","☕","Au café"],["voyage","🚆","En voyage"],["hotel","🏨","À l'hôtel"],["marche","🧺","Au marché"],["medecin","🩺","Chez le médecin"],["entretien","💼","Entretien d'embauche"],["debat","🗣️","Débat d'idées"],["rome","🏛️","Au forum romain"]];
  const ANCIENT=new Set(["la","grc","arc","egy","sux","akk"]);
  const SCEN_EN={libre:"a free, friendly conversation about the learner's life, tastes and day",cafe:"ordering at a café or restaurant; you are the waiter",voyage:"travelling: at the train station, asking for directions, buying tickets; you are a helpful local",hotel:"checking into a hotel; you are the receptionist",medecin:"a visit to the doctor; you are the doctor",entretien:"a job interview; you are the recruiter",rencontre:"meeting someone new at a party; you are a friendly guest",marche:"shopping at a market; you are the stallholder",debat:"a respectful debate of ideas on a topic you propose, adapted to the level",rome:"daily life in ancient Rome; you are a Roman citizen in the forum"};
  const st={mission:null,open:false,scen:"libre",correct:true,auto:true,msgs:[],busy:false,err:"",settings:false,lang:null,listening:false};
  let root=null,rec=null;

  const langName=c=>(typeof L!=="undefined"&&L[c]?.n)||c;
  const getKey=()=>{try{return localStorage.getItem(KEY_STORE)||""}catch(e){return ""}};
  const setKey=k=>{try{k?localStorage.setItem(KEY_STORE,k):localStorage.removeItem(KEY_STORE)}catch(e){}};
  const cfg=()=>(typeof CLOUD_CFG!=="undefined"?CLOUD_CFG:(window.CASTELLUM_CONFIG||{}));
  const cloudReady=()=>{try{return !!(Cloud&&Cloud.enabled&&Cloud.signedIn&&cfg().supabaseUrl)}catch(e){return false}};
  async function sampleFn(){try{return typeof getSample==="function"?await getSample():null}catch(e){return null}}

  // Même consigne que la fonction serveur (supabase/functions/castellum-chat/index.ts)
  function systemPrompt(){
    const p={lang:S.tgt,langName:langName(S.tgt),srcName:langName(S.src),level:S.level||"A1",scenario:st.scen,correct:st.correct};
    const lines=[
      "You are Castellum, a warm and patient conversation partner in a language-learning app.",
      `The learner speaks ${p.srcName} and is learning ${p.langName} at CEFR level ${p.level}.`,
      `Reply only in ${p.langName}, at a level suited to ${p.level}: very short and simple sentences for A1-A2, natural everyday language for B1-B2, rich and idiomatic language for C1-C2.`,
      "Keep each reply to 1-4 sentences and end with a question or a prompt that keeps the conversation going.",
      `Situation: ${SCEN_EN[p.scenario]||SCEN_EN.libre}. Stay in that role.`,
      `If the learner writes in ${p.srcName} or seems stuck, help in one short sentence of ${p.srcName}, then continue in ${p.langName}.`,
      p.correct?`If the learner's last message contains mistakes in ${p.langName}, add a final line starting with "✏️ " that gives the corrected sentence and a very short explanation in ${p.srcName}. If there is no mistake, add nothing.`:"Do not correct the learner's mistakes; just keep the conversation natural.",
      `If ${p.langName} is not written in the Latin alphabet, write it in its own script and, for levels A1-B1, add a final line starting with "🔤 " giving a romanization of your reply.`,
      "Plain text only: no markdown, no lists, no headings."];
    if(ANCIENT.has(p.lang))lines.push(`${p.langName} is an ancient language: use its classical, attested forms; for modern things, use a natural periphrasis instead of inventing words.`);
    return lines.join("\n");
  }
  const START_MSG=()=>st.mission?`[End-of-unit mission. Theme: "${st.mission.title}". We will have exactly 3 short exchanges in ${langName(S.tgt)}, at my level. Naturally use some of these words or phrases I have just learned, and encourage me to use them too: ${st.mission.words.join(" / ")}. Start now with a short greeting and one simple question about the theme.]`:`[Start the conversation now, in ${langName(S.tgt)}, with a short greeting suited to the situation.]`;
  const userCount=()=>st.msgs.filter(m=>m.role==="user").length;
  function apiMessages(){const out=[];if(!st.msgs.length||st.msgs[0].role!=="user")out.push({role:"user",content:START_MSG()});let nu=0;st.msgs.forEach(m=>{if(m.content&&!m.err){let c=m.content;if(m.role==="user"){nu++;if(st.mission&&nu===3)c+="\n[This was my third and last message of the mission: reply briefly, congratulate me warmly in one sentence and do not ask any more question.]"}out.push({role:m.role,content:c})}});return out.slice(-24)}

  /* ---- Les trois façons de joindre Claude ---- */
  async function viaSample(s,onText){
    const sys=systemPrompt(),msgs=apiMessages();
    const turns=msgs.map((m,i)=>({role:m.role,content:i===0?sys+"\n\n"+m.content:m.content}));
    const r=await s(turns,{cache:false,onText:({text})=>onText(text)});return r?.text||"";
  }
  function loadSdk(){return new Promise((ok,ko)=>{if(window.Anthropic)return ok(window.Anthropic);const sc=document.createElement("script");sc.src="vendor/anthropic.js";sc.onload=()=>window.Anthropic?ok(window.Anthropic):ko(new Error("sdk"));sc.onerror=()=>ko(new Error("sdk"));document.head.appendChild(sc)})}
  async function viaKey(key,onText){
    const Anthropic=await loadSdk();
    const client=new Anthropic({apiKey:key,dangerouslyAllowBrowser:true});
    let snap="";
    try{
      const stream=client.beta.messages.stream({model:MODEL,max_tokens:2048,output_config:{effort:"low"},betas:["server-side-fallback-2026-07-01"],fallbacks:"default",system:systemPrompt(),messages:apiMessages()});
      stream.on("text",(d,s)=>{snap=s;onText(s)});
      const final=await stream.finalMessage();
      if(final.stop_reason==="refusal")throw new Error("refus");
      return snap;
    }catch(err){
      if(Anthropic.APIConnectionError&&err instanceof Anthropic.APIConnectionError)throw new Error(navigator.onLine===false?"Pas de connexion internet pour le moment.":"Impossible de joindre Anthropic : vérifie ta connexion internet.");
      if(err instanceof Anthropic.AuthenticationError)throw new Error("Clé refusée : vérifie ta clé Anthropic dans les réglages.");
      if(err instanceof Anthropic.RateLimitError)throw new Error("Trop de demandes pour le moment : réessaie dans un instant.");
      if(err instanceof Anthropic.APIError)throw new Error(`Le service a répondu par une erreur (${err.status}).`);
      if(err.message==="refus")throw new Error("L'IA a refusé de répondre à ce message.");
      throw new Error("Connexion impossible : vérifie ta connexion internet.");
    }
  }
  async function viaCloud(onText){
    const {data}=await Cloud.client.auth.getSession();const tok=data?.session?.access_token;if(!tok)throw new Error("Reconnecte-toi pour discuter avec l'IA.");
    const url=cfg().supabaseUrl.replace(/\/$/,"")+"/functions/v1/"+(cfg().aiChatFunction||"castellum-chat");
    if(navigator.onLine===false)throw new Error("Pas de connexion internet pour le moment.");
    let res;try{res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+tok,apikey:cfg().supabaseAnonKey||""},body:JSON.stringify({lang:S.tgt,langName:langName(S.tgt),srcName:langName(S.src),level:S.level||"A1",scenario:st.scen,correct:st.correct,messages:apiMessages()})})}catch(e){throw new Error("NOSERVER")}
    if(res.status===404)throw new Error("NOSERVER");
    if(!res.ok||!res.body)throw new Error(`Le serveur a répondu par une erreur (${res.status}).`);
    const rd=res.body.getReader(),dec=new TextDecoder();let txt="";
    for(;;){const {value,done}=await rd.read();if(done)break;txt+=dec.decode(value,{stream:true});onText(txt.replace(/\n?\[\[(refus|erreur[^\]]*)\]\]$/,""))}
    if(/\[\[refus\]\]$/.test(txt))throw new Error("L'IA a refusé de répondre à ce message.");
    if(/\[\[erreur[^\]]*\]\]$/.test(txt))throw new Error("Le service IA est momentanément indisponible.");
    return txt;
  }
  async function mode(){if(await sampleFn())return "claude";if(getKey())return "key";if(cloudReady())return "cloud";return null}

  async function ask(){
    if(st.busy)return;st.busy=true;st.err="";
    const m={role:"assistant",content:""};st.msgs.push(m);draw();
    const onText=t=>{m.content=t;const b=root&&root.querySelector(".ac-msgs .ac-ai:last-child .ac-bubble");if(b){b.innerHTML=fmt(t);scrollEnd()}};
    try{
      const md=await mode();
      if(!md)throw new Error("NOCONF");
      const out=md==="claude"?await viaSample(await sampleFn(),onText):md==="key"?await viaKey(getKey(),onText):await viaCloud(onText);
      m.content=(out||m.content||"").trim();
      if(!m.content)throw new Error("Réponse vide : réessaie.");
      try{addXP(2);day().xp+=2;save()}catch(e){}
      if(st.auto)speakReply(m.content);
      if(st.mission&&!st.mission.done&&userCount()>=3){st.mission.done=true;try{addXP(15);day().xp+=15;S.missionsDone=(S.missionsDone||0)+1;save()}catch(e){}try{confetti()}catch(e){}}
    }catch(err){st.msgs.pop();if(err.message==="NOCONF"){st.settings=true;st.notice=""}else if(err.message==="NOSERVER"){st.settings=true;st.notice="La conversation IA n'est pas encore activée sur le serveur Castellum. En attendant, tu peux utiliser ta propre clé Anthropic ci-dessous."}else st.err=/^(Load failed|Failed to fetch|NetworkError)/i.test(err.message||"")?"Connexion impossible : vérifie ta connexion internet et réessaie.":(err.message||"Erreur inattendue.")}
    st.busy=false;draw();
  }
  const mainText=t=>String(t||"").split("\n").filter(l=>!/^\s*(✏️|🔤)/.test(l)).join(" ").trim();
  function speakReply(t){try{speak(mainText(t),S.tgt)}catch(e){}}
  function fmt(t){return String(t||"").split("\n").map(l=>/^\s*✏️/.test(l)?`<span class="ac-fix">${E(l)}</span>`:/^\s*🔤/.test(l)?`<span class="ac-rom">${E(l)}</span>`:E(l)).join("<br>")}
  function scrollEnd(){const c=root&&root.querySelector(".ac-msgs");if(c)c.scrollTop=c.scrollHeight}

  /* ---- Micro ---- */
  function listen(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){st.err="La dictée vocale n'est pas disponible dans ce navigateur.";draw();return}
    if(st.listening){try{rec&&rec.stop()}catch(e){}return}
    rec=new SR();rec.lang=(L[S.tgt]&&L[S.tgt].t)||(S.tgt==="la"?"it-IT":S.tgt);rec.interimResults=true;rec.maxAlternatives=1;
    const inp=root.querySelector("#acIn");const base=inp?inp.value:"";
    rec.onresult=e=>{let t="";for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;const x=root.querySelector("#acIn");if(x)x.value=(base?base+" ":"")+t};
    rec.onend=()=>{st.listening=false;draw()};rec.onerror=()=>{st.listening=false;draw()};
    try{rec.start();st.listening=true;draw()}catch(e){st.listening=false}
  }

  /* ---- Interface ---- */
  function css(){if(document.getElementById("ac-css"))return;const s=document.createElement("style");s.id="ac-css";s.textContent=`
#aiChatRoot .ac-bg{position:fixed;inset:0;background:rgba(10,14,30,.55);z-index:85;display:flex;align-items:flex-end;justify-content:center}
@media(min-width:760px){#aiChatRoot .ac-bg{align-items:center}}
#aiChatRoot .ac{background:var(--bg,#fff);color:var(--ink,#111);width:100%;max-width:760px;height:94vh;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden}
@media(min-width:760px){#aiChatRoot .ac{border-radius:22px;height:88vh}}
#aiChatRoot .ac-head{display:flex;align-items:center;gap:8px;padding:14px 16px 8px}
#aiChatRoot .ac-head h2{margin:0;font-size:1.1rem;flex:1}
#aiChatRoot .ac-x{border:0;background:var(--surface-2,#eee);color:inherit;border-radius:12px;min-width:38px;height:38px;font-size:1rem;font-weight:900;padding:0 10px}
#aiChatRoot .ac-scen{display:flex;gap:6px;overflow-x:auto;padding:0 16px 8px}
#aiChatRoot .ac-scen button{flex:0 0 auto;border:2px solid var(--line,#ddd);background:var(--surface,#fff);color:inherit;border-radius:999px;padding:6px 12px;font-weight:800;font-size:.85rem}
#aiChatRoot .ac-scen button[aria-pressed=true]{background:var(--accent,#3b6);color:var(--accent-ink,#fff);border-color:var(--accent,#3b6)}
#aiChatRoot .ac-msgs{flex:1;overflow-y:auto;padding:8px 16px;display:flex;flex-direction:column;gap:10px}
#aiChatRoot .ac-me{align-self:flex-end;max-width:85%;background:var(--accent,#3b6);color:var(--accent-ink,#fff);border-radius:18px 18px 4px 18px;padding:10px 14px;font-weight:600}
#aiChatRoot .ac-ai{align-self:flex-start;max-width:90%;display:flex;gap:6px;align-items:flex-end}
#aiChatRoot .ac-bubble{background:var(--surface,#fff);border:2px solid var(--line,#ddd);border-radius:18px 18px 18px 4px;padding:10px 14px;line-height:1.45}
#aiChatRoot .ac-fix{display:block;margin-top:6px;color:var(--bad-ink,#7a1d1d);background:var(--bad-soft,#fde7e7);border-radius:10px;padding:6px 8px;font-size:.92rem}
#aiChatRoot .ac-rom{display:block;margin-top:4px;color:var(--ink-2,#666);font-size:.9rem;font-style:italic}
#aiChatRoot .ac-say{border:0;background:var(--surface-2,#eee);border-radius:10px;width:30px;height:30px;flex:0 0 auto}
#aiChatRoot .ac-foot{display:flex;gap:8px;padding:10px 16px calc(12px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line,#ddd)}
#aiChatRoot .ac-foot textarea{flex:1;resize:none;font:inherit;border:2px solid var(--line,#ddd);border-radius:14px;padding:10px 12px;background:var(--surface,#fff);color:inherit;max-height:120px}
#aiChatRoot .ac-btn{border:0;border-radius:14px;padding:0 16px;font-weight:900;background:var(--accent,#3b6);color:var(--accent-ink,#fff);box-shadow:0 3px 0 var(--accent-dark,#285)}
#aiChatRoot .ac-btn.alt{background:var(--surface-2,#eee);color:var(--ink,#111);box-shadow:0 3px 0 var(--line,#ccc)}
#aiChatRoot .ac-btn.on{background:var(--bad,#d33);color:#fff}
#aiChatRoot .ac-note{color:var(--ink-2,#666);font-size:.88rem;margin:0}
#aiChatRoot .ac-card{background:var(--surface,#fff);border:2px solid var(--line,#ddd);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px}
#aiChatRoot .ac-card input[type=password]{font:inherit;padding:10px 12px;border-radius:12px;border:2px solid var(--line,#ddd);background:var(--surface,#fff);color:inherit}
#aiChatRoot .ac-err{background:var(--bad-soft,#fde7e7);color:var(--bad-ink,#7a1d1d);border-radius:12px;padding:10px 12px;font-weight:700}
#aiChatRoot .ac-tog{display:flex;gap:8px;flex-wrap:wrap;padding:0 16px 6px}
#aiChatRoot .ac-tog label{display:flex;align-items:center;gap:6px;font-weight:700;font-size:.85rem;color:var(--ink-2,#666)}
.ac-entry{display:flex;gap:12px;align-items:center;text-align:left;width:100%;border:2px solid var(--accent,#3b6);background:var(--accent-soft,#e8f0ff);color:inherit;border-radius:18px;padding:14px;margin:0 0 12px}
#aiChatRoot .ac-mission{margin:0 16px 8px;padding:10px 12px;border-radius:14px;background:var(--accent-soft,#eef);display:grid;gap:6px;font-size:.9rem}
#aiChatRoot .ac-steps{display:flex;align-items:center;gap:6px}#aiChatRoot .ac-steps i{width:28px;height:8px;border-radius:99px;background:var(--line,#ddd)}#aiChatRoot .ac-steps i.on{background:var(--good,#3b6)}
#aiChatRoot .ac-mw{display:flex;flex-wrap:wrap;gap:5px}#aiChatRoot .ac-mw span{background:var(--surface,#fff);border-radius:99px;padding:3px 9px;font-weight:800;font-size:.82rem}
#aiChatRoot .ac-win{border:2px solid var(--good,#3b6);text-align:center}
.ac-entry b{display:block;font-size:1.02rem}.ac-entry small{color:var(--ink-2,#666)}.ac-entry .ac-ico{font-size:1.8rem}
`;document.head.appendChild(s)}
  function openChat(){css();if(st.lang!==S.tgt){st.lang=S.tgt;st.msgs=[];st.err=""}st.open=true;st.settings=false;st.notice="";root=document.getElementById("aiChatRoot");if(!root){root=document.createElement("div");root.id="aiChatRoot";document.body.appendChild(root)}document.body.style.overflow="hidden";draw();if(!st.msgs.length&&!st.settings)mode().then(m=>{if(m)ask();else{st.settings=true;draw()}})}
  function closeChat(){st.open=false;st.mission=null;try{rec&&rec.stop()}catch(e){}if(root)root.innerHTML="";document.body.style.overflow="";try{speechSynthesis.cancel()}catch(e){}}
  function settingsV(){
    const k=getKey(),signed=cloudReady();
    return `<div class="ac-msgs">${st.notice?`<div class="ac-err">${E(st.notice)}</div>`:""}<div class="ac-card"><b>Comment se connecter à l'IA</b>
      <p class="ac-note">La conversation utilise Claude, une IA d'Anthropic, qui demande une connexion internet. Deux possibilités :</p>
      <p class="ac-note">1. <b>Avec ton compte Castellum</b> ${signed?"✅ tu es connecté : la conversation passe par le serveur de l'appli, si son administrateur l'a activée.":"(connecte-toi depuis l'écran Compte) : la conversation passe par le serveur de l'appli, si son administrateur l'a activée."}</p>
      <p class="ac-note">2. <b>Avec ta propre clé Anthropic</b> (créée sur platform.claude.com, facturée sur ton compte Anthropic). Elle reste uniquement sur cet appareil et sert seulement à parler à Claude.</p>
      <input type="password" id="acKey" placeholder="sk-ant-…" value="${E(k)}" autocomplete="off">
      <div style="display:flex;gap:8px"><button class="ac-btn" data-ac="savekey" style="flex:1;padding:12px">Enregistrer la clé</button>${k?`<button class="ac-btn alt" data-ac="delkey" style="flex:1;padding:12px">Effacer la clé</button>`:""}</div>
      <p class="ac-note">⚠️ Ne saisis jamais ta clé sur un appareil partagé. Tu peux fixer une limite de dépenses dans la console Anthropic.</p>
      <button class="ac-btn alt" data-ac="back" style="padding:12px">${st.msgs.length?"Revenir à la conversation":"Essayer de démarrer la conversation"}</button></div></div>`;
  }
  function draw(){
    if(!root||!st.open)return;
    const head=`<div class="ac-head"><h2>💬 Conversation en ${E(langName(S.tgt))} · ${E(S.level||"A1")}</h2><button class="ac-x" data-ac="settings" title="Connexion">⚙️</button><button class="ac-x" data-ac="reset" title="Nouvelle conversation">↺</button><button class="ac-x" data-ac="close" aria-label="Fermer">✕</button></div>`;
    if(st.settings){root.innerHTML=`<div class="ac-bg" data-ac="bg"><div class="ac" role="dialog">${head}${settingsV()}</div></div>`;return}
    const scen=SCEN.filter(([k])=>k!=="rome"||ANCIENT.has(S.tgt)||S.tgt==="la");
    const msgs=st.msgs.map((m,i)=>m.role==="user"?`<div class="ac-me">${E(m.content)}</div>`:`<div class="ac-ai"><div class="ac-bubble">${m.content?fmt(m.content):'<span class="spinner" style="display:inline-block"></span>'}</div>${m.content&&!(st.busy&&i===st.msgs.length-1)?`<button class="ac-say" data-ac="say" data-k="${i}" aria-label="Écouter">🔊</button>`:""}</div>`).join("");
    root.innerHTML=`<div class="ac-bg" data-ac="bg"><div class="ac" role="dialog" aria-label="Conversation IA">${head}
      ${st.mission?missionBar():`<div class="ac-scen">${scen.map(([k,i,n])=>`<button data-ac="scen" data-k="${k}" aria-pressed="${st.scen===k}">${i} ${n}</button>`).join("")}</div>`}
      <div class="ac-tog"><label><input type="checkbox" data-ac="correct" ${st.correct?"checked":""}> Corriger mes erreurs</label><label><input type="checkbox" data-ac="auto" ${st.auto?"checked":""}> Lire les réponses à voix haute</label></div>
      <div class="ac-msgs">${msgs||`<p class="ac-note">Choisis une situation : l'IA lance la conversation en ${E(langName(S.tgt))}, à ton niveau.</p>`}${st.err?`<div class="ac-err">${E(st.err)}</div>`:""}${st.mission&&st.mission.done&&!st.busy?`<div class="ac-card ac-win"><b>🏆 <span>Mission accomplie !</span></b><p class="ac-note"><span>Tu as tenu une vraie conversation en</span> ${E(langName(S.tgt))}. +15 XP</p><button class="ac-btn" data-ac="close" style="padding:12px">Terminer</button></div>`:""}</div>
      <form class="ac-foot" data-ac="form"${st.mission&&st.mission.done?' hidden':''}><button type="button" class="ac-btn alt ${st.listening?"on":""}" data-ac="mic" aria-label="Parler">🎤</button><textarea id="acIn" rows="1" placeholder="Écris en ${E(langName(S.tgt))}…" ${st.busy?"disabled":""}></textarea><button class="ac-btn" type="submit" ${st.busy?"disabled":""}>➤</button></form>
    </div></div>`;
    scrollEnd();const t=root.querySelector("#acIn");if(t&&!st.busy&&window.innerWidth>760)t.focus();
  }
  function missionBar(){const m=st.mission,n=Math.min(3,userCount());
    return `<div class="ac-mission"><div><b>🎯 <span>Mission de fin d'unité</span></b> · <span>${E(m.title)}</span></div><div class="ac-steps">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}<small><span>${n}</span>/3 <span>échanges</span></small></div>${m.words.length?`<div class="ac-mw">${m.words.slice(0,6).map(w=>`<span lang="${S.tgt}" data-noi18n>${E(w)}</span>`).join("")}</div>`:""}</div>`}
  function mission(words,title){st.mission={words:(words||[]).slice(0,8),title:title||"",done:false};st.scen="libre";st.msgs=[];st.err="";st.lang=S.tgt;openChat()}
  function send(){const t=root.querySelector("#acIn");const v=(t&&t.value||"").trim();if(!v||st.busy)return;st.msgs.push({role:"user",content:v});ask()}

  document.addEventListener("click",e=>{
    const ent=e.target.closest&&e.target.closest("[data-aichat]");
    if(ent){e.preventDefault();e.stopImmediatePropagation();openChat();return}
    if(!root||!root.contains(e.target))return;
    const b=e.target.closest("[data-ac]");if(!b)return;const a=b.dataset.ac;
    if(a==="bg"){if(e.target===b)closeChat();return}
    if(["correct","auto","form"].includes(a))return;
    e.stopPropagation();
    if(a==="close")closeChat();
    else if(a==="settings"){st.settings=true;draw()}
    else if(a==="back"){st.settings=false;draw();if(!st.msgs.length)mode().then(m=>{if(m)ask();else{st.settings=true;st.err="";draw()}})}
    else if(a==="savekey"){const k=(root.querySelector("#acKey").value||"").trim();if(!/^sk-ant-/.test(k)){alert("Une clé Anthropic commence par « sk-ant- ».");return}setKey(k);st.settings=false;draw();if(!st.msgs.length)ask()}
    else if(a==="delkey"){setKey("");draw()}
    else if(a==="reset"){if(st.busy)return;if(st.mission)st.mission.done=false;st.msgs=[];st.err="";draw();ask()}
    else if(a==="scen"){if(st.busy)return;st.scen=b.dataset.k;st.msgs=[];st.err="";draw();ask()}
    else if(a==="say"){const m=st.msgs[+b.dataset.k];if(m)speakReply(m.content)}
    else if(a==="mic")listen();
  },true);
  document.addEventListener("change",e=>{if(!root||!root.contains(e.target))return;const a=e.target.dataset&&e.target.dataset.ac;if(a==="correct")st.correct=e.target.checked;if(a==="auto")st.auto=e.target.checked},true);
  document.addEventListener("submit",e=>{if(!root||!root.contains(e.target))return;e.preventDefault();e.stopPropagation();send()},true);
  document.addEventListener("keydown",e=>{if(!root||!st.open)return;if(e.key==="Escape"){e.stopImmediatePropagation();closeChat();return}if(e.key==="Enter"&&!e.shiftKey&&e.target&&e.target.id==="acIn"){e.preventDefault();send()}},true);

  /* ---- Points d'entrée : écran Professeur et écran Jeux ---- */
  const entry=()=>`<button class="ac-entry" data-aichat="1"><span class="ac-ico">💬</span><span><b>Converser avec l'IA en ${E(langName(S.tgt))}</b><small>Une vraie conversation à ton niveau, avec corrections, voix et situations (café, voyage, entretien…)</small></span></button>`;
  try{const tv=teacherView;teacherView=function(){const h=tv.apply(this,arguments);css();const i=h.indexOf('<section class="card"');return i<0?entry()+h:h.slice(0,i)+entry()+h.slice(i)}}catch(e){}
  try{const pv=playView;playView=function(){const h=pv.apply(this,arguments);css();return entry()+h}}catch(e){}
  window.CastellumAIChat={open:openChat,mission,state:st,systemPrompt,apiMessages};
})();

