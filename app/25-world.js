/* Royaume en vue isométrique : un petit monde de jeu dessiné entièrement en code (aucune image).
   Chaque niveau (1 → 50) construit un nouvel élément ; 15 architectures ; jour / nuit ; habitants animés. */
(function(){
  const TW=34,TH=17,OX=300,OY=66,N=14;
  const P=(i,j,z=0)=>[OX+(i-j)*TW/2,OY+(i+j)*TH/2-z];
  const f1=n=>Math.round(n*10)/10;
  const pts=a=>a.map(p=>f1(p[0])+','+f1(p[1])).join(' ');
  const poly=(a,fill,x='')=>`<polygon points="${pts(a)}" fill="${fill}"${x}/>`;
  const EDGE=' stroke="rgba(20,20,40,.18)" stroke-width=".6" stroke-linejoin="round"';
  function hx(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(k=>parseInt(h.substr(k,2),16))}
  function sh(h,f){const c=hx(h).map(v=>f<1?v*f:v+(255-v)*(f-1));return '#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
  function mix(a,b,t){const A=hx(a),B=hx(b);return '#'+A.map((v,k)=>Math.round(v+(B[k]-v)*t).toString(16).padStart(2,'0')).join('')}
  let SEED=1;const rnd=()=>{SEED=(SEED*16807)%2147483647;return (SEED-1)/2147483646};

  /* ---------- 15 architectures ---------- */
  const ST={
    medieval:{wall:'#cdbb98',roof:'#9a3f35',flag:'#244c91',tower:'cone',house:'gable',keep:'castle',tree:'round',grass:'#86b35c',stone:'#b9ae98'},
    occidental:{gm:.45,wall:'#efe7d7',roof:'#4c5b74',flag:'#1f3f8f',tower:'cone',house:'pyramid',keep:'castle',tree:'round',grass:'#8cbb62',stone:'#d9d0bd',gold:1},
    oriental:{wall:'#f4eee2',roof:'#d6a83c',flag:'#c0392b',tower:'onion',house:'flat',keep:'dome',tree:'palm',grass:'#b3b86a',stone:'#e4d6b8'},
    romain:{land:'collines',wall:'#efe2c4',roof:'#b5553b',flag:'#9e1b1b',tower:'pyramid',house:'gable',keep:'temple',tree:'cypress',grass:'#9cb863',stone:'#d9c9a3'},
    grec:{land:'iles',gm:.3,wall:'#f7f4ee',roof:'#2f6fb3',flag:'#2a5d9f',tower:'dome',house:'flat',keep:'temple',tree:'cypress',grass:'#a9b870',stone:'#e8e2d4'},
    byzantin:{wall:'#e7caa0',roof:'#d9a93a',flag:'#6b2d7a',tower:'dome',house:'gable',keep:'dome',tree:'cypress',grass:'#93b463',stone:'#c9a57a',houseRoof:'#b86b4b'},
    ottoman:{wall:'#efe8da',roof:'#8494a8',flag:'#b3261e',tower:'minaret',house:'pyramid',keep:'dome',tree:'cypress',grass:'#8fb561',stone:'#d8cdb6',houseRoof:'#b5553b'},
    andalou:{land:'sierra',wall:'#dcaa78',roof:'#2e7d5b',flag:'#2e7d5b',tower:'flat',house:'flat',keep:'castle',tree:'palm',grass:'#a8ad62',stone:'#c99b6c'},
    nordique:{gm:.3,wall:'#8a5e3c',roof:'#4a3b30',flag:'#b3261e',tower:'spire',house:'gable',keep:'hall',tree:'pine',grass:'#6f9a5e',stone:'#8f918f',wood:1},
    celtique:{wall:'#aba797',roof:'#c29a55',flag:'#2f7d3b',tower:'thatch',house:'thatch',keep:'castle',tree:'round',grass:'#6fa55a',stone:'#9d9a8a'},
    renaissance:{wall:'#eadcc0',roof:'#b5553b',flag:'#1f3f8f',tower:'pyramid',house:'pyramid',keep:'dome',tree:'cypress',grass:'#93b863',stone:'#dccdb0'},
    gothique:{gm:.14,wall:'#8d91a2',roof:'#353d63',flag:'#7a1d2e',tower:'spire',house:'gable',keep:'castle',tree:'pine',grass:'#6f8f5c',stone:'#7d8192',steep:1},
    japonais:{gm:.22,wall:'#f2ede1',roof:'#3b3f4a',flag:'#b83d35',tower:'pagoda',house:'pagoda',keep:'pagoda',tree:'cherry',grass:'#8ab561',stone:'#9a968c',trim:'#b83d35'},
    persan:{wall:'#d7a85c',roof:'#2a9bb0',flag:'#613e70',tower:'onion',house:'flat',keep:'dome',tree:'cypress',grass:'#a6b566',stone:'#c9985a'},
    mediterraneen:{wall:'#f1d6a8',roof:'#c8643f',flag:'#1f7a3e',tower:'pyramid',house:'pyramid',keep:'dome',tree:'cypress',grass:'#a7bd6a',stone:'#e0c594',houseRoof:'#cf6e45',land:'vesuvio'},
    kasbah:{gm:.3,wall:'#c97b4b',roof:'#2e7d5b',flag:'#c1272d',tower:'flat',house:'flat',keep:'castle',tree:'palm',grass:'#c4b072',stone:'#b8693f',houseRoof:'#2e7d5b',land:'atlas'},
    fantasy:{wall:'#dcd5f2',roof:'#7b4fd0',flag:'#ffcf4a',tower:'spire',house:'cone',keep:'castle',tree:'magic',grass:'#7cc28a',stone:'#bdb3e0',gm:.18}
  };

  /* ---------- 50 éléments débloqués niveau par niveau ---------- */
  const FEAT=[
    [1,"La première demeure"],[2,"Le bosquet"],[3,"Le puits"],[4,"Les champs"],[5,"La tour du seigneur"],
    [6,"Une maison"],[7,"Le chemin de terre"],[8,"La palissade"],[9,"Une deuxième maison"],[10,"La tour nord"],
    [11,"Le marché (touche-le : listes de mots)"],[12,"La tour ouest"],[13,"Le donjon"],[14,"Le moulin"],[15,"Une troisième maison"],
    [16,"Les remparts de pierre et la porte"],[17,"La tour est"],[18,"La bibliothèque (touche-la : grammaire)"],[19,"La tour sud"],[20,"Le château fort"],
    [21,"La fontaine"],[22,"La forge"],[23,"De nouvelles maisons"],[24,"Les bannières"],[25,"La tour du professeur (touche-la)"],
    [26,"Le port"],[27,"Le premier bateau"],[28,"Le stade (touche-le : jeux)"],[29,"Le verger"],[30,"Le grand château"],
    [31,"Les lanternes"],[32,"La statue du héros"],[33,"Les jardins"],[34,"Le quartier des artisans"],[35,"Le phare"],
    [36,"Le trésor royal"],[37,"Le palais"],[38,"Les oiseaux du royaume"],[39,"La flotte"],[40,"Les toits d'or"],
    [41,"Les parterres de fleurs"],[42,"Le clocher"],[43,"L'arc de triomphe"],[44,"Les jardins royaux"],[45,"La citadelle"],
    [46,"Les étendards d'or"],[47,"Les fontaines dorées"],[48,"Le parc aux lumières"],[49,"La grande statue d'or"],[50,"Castellum éternel"]
  ];
  window.KINGDOM_FEATURES=FEAT;

  /* ---------- primitives ---------- */
  let LIGHTS=[],UID=0,ANIM=true;
  function box(i,j,w,d,h,z,col,o={}){
    const t=[P(i,j,z+h),P(i+w,j,z+h),P(i+w,j+d,z+h),P(i,j+d,z+h)];
    const L=[P(i,j+d,z),P(i+w,j+d,z),P(i+w,j+d,z+h),P(i,j+d,z+h)];
    const R=[P(i+w,j,z),P(i+w,j+d,z),P(i+w,j+d,z+h),P(i+w,j,z+h)];
    return (o.noTop?'':poly(t,o.top||sh(col,1.14),EDGE))+poly(L,col,EDGE)+poly(R,sh(col,.76),EDGE)}
  // fenêtre sur la face avant-gauche (le long de i, en j=jf) ou avant-droite (le long de j, en i=if)
  function winL(i,jf,z,w=.22,h=6,col='#2b2f45'){const a=[P(i,jf,z),P(i+w,jf,z),P(i+w,jf,z+h),P(i,jf,z+h)];LIGHTS.push(a);return poly(a,col)}
  function winR(ifc,j,z,w=.22,h=6,col='#252a3d'){const a=[P(ifc,j,z),P(ifc,j+w,z),P(ifc,j+w,z+h),P(ifc,j,z+h)];LIGHTS.push(a);return poly(a,col)}
  function doorL(i,jf,w=.34,h=9,col='#5b3a22'){return poly([P(i,jf,0),P(i+w,jf,0),P(i+w,jf,h),P(i,jf,h)],col)}
  function roofPyr(i,j,w,d,zt,rh,col,o=.12){const A=P(i+w/2,j+d/2,zt+rh),Lf=P(i-o,j+d+o,zt),F=P(i+w+o,j+d+o,zt),R=P(i+w+o,j-o,zt);
    return poly([Lf,F,A],col,EDGE)+poly([F,R,A],sh(col,.74),EDGE)}
  function roofGable(i,j,w,d,zt,rh,col,wall,o=.12){ // faîte le long de i
    const r1=P(i-o,j+d/2,zt+rh),r2=P(i+w+o,j+d/2,zt+rh);
    return poly([P(i-o,j-o,zt),P(i+w+o,j-o,zt),r2,r1],sh(col,.86),EDGE)+poly([P(i+w,j,zt),P(i+w,j+d,zt),P(i+w,j+d/2,zt+rh)],sh(wall,.8),EDGE)+poly([P(i-o,j+d+o,zt),P(i+w+o,j+d+o,zt),r2,r1],col,EDGE)}
  function roofGableJ(i,j,w,d,zt,rh,col,wall,o=.12){ // faîte le long de j (pignon devant)
    const r1=P(i+w/2,j-o,zt+rh),r2=P(i+w/2,j+d+o,zt+rh);
    return poly([P(i+w+o,j-o,zt),P(i+w+o,j+d+o,zt),r2,r1],sh(col,.76),EDGE)+poly([P(i,j+d,zt),P(i+w,j+d,zt),P(i+w/2,j+d,zt+rh)],wall,EDGE)+poly([P(i-o,j+d+o,zt),P(i+w/2,j+d+o,zt+rh),P(i+w/2,j+d+o,zt+rh)],col)}
  function merlons(i,j,w,d,zt,col,n=4){let s='';const m=.2;
    for(let k=0;k<n;k++){const x=i+(k+.15)*w/n;s+=box(x,j+d-m,w/n*.55,m,4,zt,col)}
    for(let k=0;k<n;k++){const y=j+(k+.15)*d/n;s+=box(i+w-m,y,m,d/n*.55,4,zt,col)}return s}
  function flag(x,y,h,col,big){const s=big?1.4:1;return `<g><line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y-h)}" stroke="#4a3b30" stroke-width="1.2"/><path class="kw-flag" d="M${f1(x)} ${f1(y-h)}l${f1(11*s)} ${f1(2.5*s)}l${f1(-11*s)} ${f1(5*s)}z" fill="${col}"/></g>`}
  function dome(cx,cy,rx,col,tall=1){const ry=rx*.5,h=rx*.95*tall;
    return `<path d="M${f1(cx-rx)} ${f1(cy)}A${f1(rx)} ${f1(h)} 0 0 1 ${f1(cx+rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx-rx)} ${f1(cy)}Z" fill="${col}"${EDGE}/><path d="M${f1(cx)} ${f1(cy-h)}A${f1(rx)} ${f1(h)} 0 0 1 ${f1(cx+rx)} ${f1(cy)}A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx)} ${f1(cy+ry)}Z" fill="${sh(col,.78)}"/><path d="M${f1(cx-rx*.55)} ${f1(cy-h*.55)}q${f1(rx*.2)} ${f1(-h*.3)} ${f1(rx*.5)} ${f1(-h*.38)}" stroke="rgba(255,255,255,.55)" stroke-width="1.6" fill="none" stroke-linecap="round"/><line x1="${f1(cx)}" y1="${f1(cy-h)}" x2="${f1(cx)}" y2="${f1(cy-h-6)}" stroke="#d6a83c" stroke-width="1.6"/><circle cx="${f1(cx)}" cy="${f1(cy-h-6.5)}" r="1.6" fill="#e9c35a"/>`}
  function onion(cx,cy,rx,col,rh){rh=rh||rx*2.2;
    return `<path d="M${f1(cx-rx*.9)} ${f1(cy)}C${f1(cx-rx*1.45)} ${f1(cy-rh*.45)} ${f1(cx-rx*.25)} ${f1(cy-rh*.7)} ${f1(cx)} ${f1(cy-rh)}C${f1(cx+rx*.25)} ${f1(cy-rh*.7)} ${f1(cx+rx*1.45)} ${f1(cy-rh*.45)} ${f1(cx+rx*.9)} ${f1(cy)}Z" fill="${col}"${EDGE}/><path d="M${f1(cx)} ${f1(cy-rh)}C${f1(cx+rx*.25)} ${f1(cy-rh*.7)} ${f1(cx+rx*1.45)} ${f1(cy-rh*.45)} ${f1(cx+rx*.9)} ${f1(cy)}L${f1(cx)} ${f1(cy)}Z" fill="${sh(col,.78)}"/><circle cx="${f1(cx)}" cy="${f1(cy-rh-2)}" r="1.8" fill="#e9c35a"/>`}
  // tour ronde : centre (ci,cj), rayon r (tuiles), hauteur h
  function tower(ci,cj,r,h,z,wall,roofT,roofC,rh,o={}){
    const [cx,cy]=P(ci,cj,z),rx=r*TW*.72,ry=rx*.5,yt=cy-h;let s='';
    s+=`<path d="M${f1(cx-rx)} ${f1(yt)}V${f1(cy)}A${f1(rx)} ${f1(ry)} 0 0 0 ${f1(cx+rx)} ${f1(cy)}V${f1(yt)}Z" fill="${wall}"${EDGE}/>`;
    s+=`<path d="M${f1(cx+rx*.15)} ${f1(yt)}V${f1(cy+ry*.99)}A${f1(rx)} ${f1(ry)} 0 0 0 ${f1(cx+rx)} ${f1(cy)}V${f1(yt)}Z" fill="${sh(wall,.8)}"/>`;
    s+=`<ellipse cx="${f1(cx)}" cy="${f1(yt)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${sh(wall,1.1)}"${EDGE}/>`;
    // fenêtres
    for(let k=1;k<=Math.floor(h/18);k++){const wy=cy-k*16;const a=[[cx-rx*.35,wy],[cx-rx*.1,wy],[cx-rx*.1,wy-6],[cx-rx*.35,wy-6]];LIGHTS.push(a);s+=poly(a,'#2b2f45')}
    const R=rx*1.14,RY=ry*1.14;rh=rh||rx*2.2;
    if(roofT==='cone'||roofT==='spire'||roofT==='thatch'||roofT==='pyramid'){const H=roofT==='spire'?rh*1.7:roofT==='thatch'?rh*.8:rh;
      s+=`<path d="M${f1(cx-R)} ${f1(yt)}L${f1(cx)} ${f1(yt-H)}L${f1(cx+R)} ${f1(yt)}A${f1(R)} ${f1(RY)} 0 0 1 ${f1(cx-R)} ${f1(yt)}Z" fill="${roofC}"${EDGE}/><path d="M${f1(cx)} ${f1(yt-H)}L${f1(cx+R)} ${f1(yt)}A${f1(R)} ${f1(RY)} 0 0 1 ${f1(cx)} ${f1(yt+RY)}Z" fill="${sh(roofC,.75)}"/>`;
      if(roofT==='thatch')s+=`<path d="M${f1(cx-R*.6)} ${f1(yt-H*.35)}Q${f1(cx)} ${f1(yt-H*.2)} ${f1(cx+R*.6)} ${f1(yt-H*.35)}" stroke="${sh(roofC,.7)}" fill="none" stroke-width="1"/>`;
      if(o.flag)s+=flag(cx,yt-H+1,14,o.flag,o.big);
    }else if(roofT==='dome'){s+=dome(cx,yt,R*.95,roofC);if(o.flag)s+=flag(cx,yt-R-4,12,o.flag)}
    else if(roofT==='onion'){s+=onion(cx,yt,R,roofC);if(o.flag)s+=flag(cx,yt-R*2.4,12,o.flag)}
    else if(roofT==='pagoda'){for(let k=0;k<2;k++){const y=yt-k*9,RR=R*(1.5-k*.35);s+=`<path d="M${f1(cx-RR)} ${f1(y+2)}Q${f1(cx-RR*.6)} ${f1(y-3)} ${f1(cx-RR*.45)} ${f1(y-7)}H${f1(cx+RR*.45)}Q${f1(cx+RR*.6)} ${f1(y-3)} ${f1(cx+RR)} ${f1(y+2)}Z" fill="${roofC}"${EDGE}/>`}if(o.flag)s+=flag(cx,yt-18,12,o.flag)}
    else if(roofT==='minaret'){s+=`<ellipse cx="${f1(cx)}" cy="${f1(yt)}" rx="${f1(R*1.2)}" ry="${f1(RY*1.2)}" fill="${sh(wall,.9)}"${EDGE}/><path d="M${f1(cx-R*.8)} ${f1(yt)}L${f1(cx)} ${f1(yt-rh*1.4)}L${f1(cx+R*.8)} ${f1(yt)}Z" fill="${roofC}"${EDGE}/>`}
    else { // plat crénelé
      for(let k=-2;k<=2;k++){const x=cx+k*rx*.38,yy=yt+ry*Math.sqrt(Math.max(0,1-(k*.38)**2));s+=`<rect x="${f1(x-rx*.13)}" y="${f1(yy-5)}" width="${f1(rx*.26)}" height="5" fill="${sh(wall,k>0?.82:1.02)}"${EDGE}/>`}
      if(o.flag)s+=flag(cx,yt,16,o.flag,o.big)}
    return s}
  function tree(i,j,type,s=1){const [x,y]=P(i,j);let g='';
    g+=`<ellipse cx="${f1(x)}" cy="${f1(y+1)}" rx="${f1(8*s)}" ry="${f1(3.5*s)}" fill="rgba(0,0,0,.14)"/>`;
    if(type==='pine'){g+=`<rect x="${f1(x-1.3*s)}" y="${f1(y-6*s)}" width="${f1(2.6*s)}" height="${f1(6*s)}" fill="#6b4a2d"/>`;[0,1,2].forEach(k=>{const w=(9-k*2.2)*s,yy=y-5*s-k*7*s;g+=`<path d="M${f1(x-w)} ${f1(yy)}L${f1(x)} ${f1(yy-11*s)}L${f1(x+w)} ${f1(yy)}Z" fill="${k%2?'#2f6b45':'#28603d'}"/><path d="M${f1(x)} ${f1(yy-11*s)}L${f1(x+w)} ${f1(yy)}H${f1(x)}Z" fill="#1f4d31"/>`})}
    else if(type==='palm'){g+=`<path d="M${f1(x)} ${f1(y)}q${f1(2*s)} ${f1(-12*s)} ${f1(-1*s)} ${f1(-24*s)}" stroke="#8a6a3f" stroke-width="${f1(2.6*s)}" fill="none"/>`;const tx=x-1*s,ty=y-24*s;[[-12,-2],[12,-1],[-8,6],[9,7],[0,-9]].forEach(([dx,dy])=>{g+=`<path d="M${f1(tx)} ${f1(ty)}q${f1(dx*s*.5)} ${f1((dy-6)*s*.5)} ${f1(dx*s)} ${f1(dy*s)}" stroke="#3f8f45" stroke-width="${f1(3*s)}" fill="none" stroke-linecap="round"/>`})}
    else if(type==='cypress'){g+=`<rect x="${f1(x-1.2*s)}" y="${f1(y-5*s)}" width="${f1(2.4*s)}" height="${f1(5*s)}" fill="#6b4a2d"/><ellipse cx="${f1(x)}" cy="${f1(y-16*s)}" rx="${f1(4.6*s)}" ry="${f1(13*s)}" fill="#2f6a3e"/><ellipse cx="${f1(x+1.6*s)}" cy="${f1(y-15*s)}" rx="${f1(2.6*s)}" ry="${f1(11*s)}" fill="#265833"/>`}
    else{const c=type==='cherry'?['#f4b6c8','#e98fab','#fbd3df']:type==='magic'?['#8fd9ff','#b58cff','#e2d1ff']:['#5d9e48','#4a8a3b','#76b55a'];
      g+=`<rect x="${f1(x-1.5*s)}" y="${f1(y-8*s)}" width="${f1(3*s)}" height="${f1(8*s)}" fill="#6b4a2d"/><circle cx="${f1(x-4*s)}" cy="${f1(y-12*s)}" r="${f1(6*s)}" fill="${c[1]}"/><circle cx="${f1(x+4*s)}" cy="${f1(y-12*s)}" r="${f1(6*s)}" fill="${c[1]}"/><circle cx="${f1(x)}" cy="${f1(y-17*s)}" r="${f1(7*s)}" fill="${c[0]}"/><circle cx="${f1(x-2*s)}" cy="${f1(y-19*s)}" r="${f1(3*s)}" fill="${c[2]}" opacity=".8"/>`;
      if(type==='magic')g+=`<circle class="kw-glow" cx="${f1(x)}" cy="${f1(y-15*s)}" r="${f1(11*s)}" fill="#b58cff" opacity=".18"/>`}
    return g}
  function tile(i,j,w,d,col,x=''){return poly([P(i,j),P(i+w,j),P(i+w,j+d),P(i,j+d)],col,x)}

  /* ---------- bâtiments ---------- */
  function house(i,j,w,d,h,st,v=0){
    const wall=st.wood?sh(st.wall,1.12+v*.05):(v%2?sh(st.wall,.95):st.wall),roof=st.houseRoof||st.roof;let s=box(i,j,w,d,h,0,wall);
    s+=winL(i+w*.55,j+d,h*.45)+winR(i+w,j+d*.3,h*.45)+doorL(i+w*.18,j+d,.26,Math.min(9,h*.6));
    const t=st.house;
    if(t==='flat'){s+=box(i-.05,j-.05,w+.1,d+.1,2,h,sh(wall,1.05))+(st.keep==='dome'?dome(...P(i+w*.5,j+d*.5,h+2),w*TW*.24,st.roof):'')}
    else if(t==='pyramid'||t==='cone')s+=roofPyr(i,j,w,d,h,t==='cone'?16:10,roof);
    else if(t==='pagoda'){s+=roofPyr(i,j,w,d,h,7,roof,.3)+(st.trim?poly([P(i-.3,j+d+.3,h),P(i+w+.3,j+d+.3,h),P(i+w+.3,j+d+.3,h-1.6),P(i-.3,j+d+.3,h-1.6)],st.trim):'')}
    else if(t==='thatch')s+=roofGable(i,j,w,d,h,13,st.roof,wall,.2);
    else s+=(v%2?roofGableJ(i,j,w,d,h,st.steep?16:11,roof,wall):roofGable(i,j,w,d,h,st.steep?16:11,roof,wall));
    return s}
  function chimneySmoke(x,y){return ANIM?`<g class="kw-smoke"><circle cx="${f1(x)}" cy="${f1(y)}" r="2.6"/><circle cx="${f1(x+2)}" cy="${f1(y-2)}" r="2.2" style="animation-delay:-1.2s"/><circle cx="${f1(x-1)}" cy="${f1(y-1)}" r="2" style="animation-delay:-2.4s"/></g>`:''}

  function keepHTML(k,st,gold){
    const wall=st.wall,roof=gold?mix(st.roof,'#e2b33c',st.gm??.65):st.roof,items=[];const add=(d,s)=>items.push({d,s});
    const tRoof=st.tower,fl=st.flag;
    const K=st.keep;
    if(K==='pagoda'){
      const tiers=[1,2,2,3,3,4,4,5][k],base=k>=2;let z=0;
      let s='';if(base){s+=box(4.6,4.6,3.8,3.8,10,0,st.stone);z=10}
      for(let t=0;t<tiers;t++){const w=3-t*.45-(base?0:1.2);const i=4.6+(3.8-w)/2,h=t===0?16:12;s+=box(i,i,w,w,h,z,wall);s+=winL(i+w*.4,i+w,z+h*.4)+winR(i+w,i+w*.4,z+h*.4);z+=h;s+=roofPyr(i,i,w,w,z,6,roof,.38)+poly([P(i-.38,i+w+.38,z),P(i+w+.38,i+w+.38,z),P(i+w+.38,i+w+.38,z-1.6),P(i-.38,i+w+.38,z-1.6)],st.trim||'#b83d35');z+=4}
      const [fx,fy]=P(6.5,6.5,z+2);s+=`<path d="M${f1(fx-3)} ${f1(fy)}q3 -6 6 0" fill="${gold?'#e9c35a':'#c9a24a'}"/>`;
      add(17,s);return items}
    if(K==='temple'){
      const sz=[1.8,2.2,2.8,3.2,3.4,3.6,3.8,3.8][k],i=6.5-sz/2,h=[14,16,20,24,26,28,30,32][k];let s=box(i-.3,i-.3,sz+.6,sz+.6,5,0,st.stone);
      s+=box(i+.35,i+.35,sz-.7,sz-.7,h,5,sh(wall,.9));
      const nc=Math.max(3,Math.round(sz*2));for(let c=0;c<nc;c++){const x=i+.1+c*(sz-.2)/(nc-1);const a=P(x,i+sz,5),b=P(x,i+sz,5+h);s+=`<rect x="${f1(a[0]-2)}" y="${f1(b[1])}" width="4" height="${f1(a[1]-b[1])}" fill="${wall}"${EDGE}/>`}
      for(let c=0;c<nc;c++){const y=i+.1+c*(sz-.2)/(nc-1);const a=P(i+sz,y,5),b=P(i+sz,y,5+h);s+=`<rect x="${f1(a[0]-2)}" y="${f1(b[1])}" width="4" height="${f1(a[1]-b[1])}" fill="${sh(wall,.85)}"${EDGE}/>`}
      s+=box(i-.1,i-.1,sz+.2,sz+.2,4,5+h,wall);
      s+=roofGableJ(i-.1,i-.1,sz+.2,sz+.2,9+h,7+sz*2,st.keep==='temple'&&st.roof==='#2f6fb3'?sh(wall,.93):roof,sh(wall,1.02),.08);
      add(15,s);
      if(k>=4){add(16.5,tower(8.9,5.2,.62,34,0,wall,'dome',gold?'#e2b33c':st.roof,0,{}))}
      if(k>=5)add(16.6,tower(5.2,8.9,.62,34,0,wall,'dome',gold?'#e2b33c':st.roof,0,{}));
      if(k>=6){add(17,tower(8.9,8.9,.5,44,0,st.stone,'flat',roof,0,{flag:fl,big:true}))}
      return items}
    if(K==='hall'){ // nordique : grandes halles de bois
      let s=box(5,5.8,3.2,1.6,18+k*2,0,wall)+winL(5.6,7.4,8)+winL(7,7.4,8)+doorL(6.4,7.4,.4,11);s+=roofGable(5,5.8,3.2,1.6,18+k*2,20+k,st.roof,wall,.2);
      s+=`<path d="M${f1(P(4.8,6.6,38+k*3)[0])} ${f1(P(4.8,6.6,38+k*3)[1])}l-4 -6M${f1(P(8.4,6.6,38+k*3)[0])} ${f1(P(8.4,6.6,38+k*3)[1])}l4 -6" stroke="#4a3b30" stroke-width="2"/>`;add(15,s);
      if(k>=2){let t='';let z=0;const tiers=Math.min(4,1+Math.floor(k/2));for(let q=0;q<tiers;q++){const w=1.8-q*.35,ii=8.6+q*.17;t+=box(ii,4.3+q*.17,w,w,12,z,sh(wall,1.05));z+=12;t+=roofPyr(ii,4.3+q*.17,w,w,z,6,st.roof,.25);z+=3}
        const [x,y]=P(9.5,5.2,z+2);t+=`<path d="M${f1(x-2)} ${f1(y)}L${f1(x)} ${f1(y-16)}L${f1(x+2)} ${f1(y)}Z" fill="${st.roof}"/>`;if(k>=6)t+=flag(x,y-14,10,fl);add(15.2,t)}
      if(k>=3)add(12.5,box(4.4,4,2.2,1.2,14,0,sh(wall,.92))+roofGable(4.4,4,2.2,1.2,14,12,st.roof,wall,.2));
      if(k>=5){add(16.4,tower(5,8.8,.5,40,0,st.stone,'spire',roof,26,{flag:fl}))}
      return items}
    // château (castle) ou palais à coupole (dome)
    const domeK=K==='dome';
    if(k===0){let s=box(5.7,5.7,1.6,1.6,16,0,wall)+winL(6.4,7.3,7)+winR(7.3,6.1,7)+doorL(5.95,7.3);
      s+=domeK?box(5.65,5.65,1.7,1.7,2,16,sh(wall,1.05))+dome(...P(6.5,6.5,18),13,roof):roofPyr(5.7,5.7,1.6,1.6,16,14,roof);
      const [x,y]=P(6.5,6.5,domeK?30:30);s+=flag(x,y,10,fl);add(14.6,s);return items}
    if(k===1){let s=box(5.5,5.5,2,2,40,0,wall)+winL(6.2,7.5,12)+winL(6.2,7.5,26)+winR(7.5,6.2,12)+winR(7.5,6.2,26)+doorL(5.8,7.5);
      s+=domeK?box(5.45,5.45,2.1,2.1,3,40,sh(wall,1.05))+dome(...P(6.5,6.5,43),17,roof):(tRoof==='flat'||tRoof==='minaret'?merlons(5.5,5.5,2,2,40,wall,3)+flag(...P(6.5,6.5,40),16,fl):roofPyr(5.5,5.5,2,2,40,22,roof));
      if(!domeK&&!(tRoof==='flat'||tRoof==='minaret')){const [x,y]=P(6.5,6.5,62);s+=flag(x,y,10,fl)}
      add(15,s);add(13.6,box(5.1,7.6,2.4,.9,16,0,sh(wall,.95))+roofGable(5.1,7.6,2.4,.9,16,9,roof,wall));return items}
    // k >= 2 : donjon
    const H=[0,0,44,52,58,62,66,72][k],KH=box(5,5,3,3,H,0,wall);
    let s=KH;[[.8,.35],[.8,.65],[.45,.35]].forEach(([a,b])=>{});
    for(let f=1;f<=Math.floor(H/16);f++){s+=winL(5.5,8,f*14-4)+winL(6.4,8,f*14-4)+winL(7.3,8,f*14-4)+winR(8,5.6,f*14-4)+winR(8,6.5,f*14-4)+winR(8,7.4,f*14-4)}
    s+=poly([P(6.2,8,0),P(6.8,8,0),P(6.8,8,12),P(6.5,8,15),P(6.2,8,12)],'#3e2a1c');
    if(domeK){s+=box(4.95,4.95,3.1,3.1,3,H,sh(wall,1.06));
      if(k>=4)s+=tower(6.5,6.5,.95,12+k*2,H+3,sh(wall,1.03),'dome',roof,0,{});else s+=dome(...P(6.5,6.5,H+3),26+k*2,roof);
      [[5.35,5.35],[7.65,5.35],[5.35,7.65],[7.65,7.65]].forEach(([a,b],q)=>{if(k>=3||q===0||q===3){s+=box(a-.3,b-.3,.6,.6,6,H+3,sh(wall,1.02))+dome(...P(a,b,H+9),6,roof)}})}
    else{
      if(tRoof==='flat'||tRoof==='minaret')s+=merlons(5,5,3,3,H,wall,5);
      else if(k<4)s+=merlons(5,5,3,3,H,wall,5)+roofPyr(5.6,5.6,1.8,1.8,H,20+k*3,roof,.15);
      else s+=merlons(5,5,3,3,H,wall,5);
      if(k>=4){const uh=[0,0,0,0,22,32,34,40][k];s+=box(5.8,5.8,1.4,1.4,uh,H,sh(wall,1.04))+winL(6.3,7.2,H+uh*.5)+winR(7.2,6.3,H+uh*.5);
        if(tRoof==='flat'||tRoof==='minaret'){s+=merlons(5.8,5.8,1.4,1.4,H+uh,wall,3);const [x,y]=P(6.5,6.5,H+uh);s+=flag(x,y,18,fl,true)}
        else{const rh=tRoof==='spire'?46+k*4:28+k*2;s+=roofPyr(5.8,5.8,1.4,1.4,H+uh,rh,roof,.12);const [x,y]=P(6.5,6.5,H+uh+rh);s+=flag(x,y,12,fl,true)}}
      else{const [x,y]=P(6.5,6.5,H+(tRoof==='flat'||tRoof==='minaret'?0:20+k*3));s+=flag(x,y,14,fl,true)}}
    add(16,s);
    const tH=H+12,tr=.58;
    const side=(a,b,d)=>add(d,tower(a,b,tr,tH,0,wall,tRoof==='flat'&&!domeK?'flat':tRoof,roof,tRoof==='spire'?26:20,{flag:k>=5?fl:null}));
    side(8.45,5.4,14.3);
    if(k>=3)side(5.4,8.45,14.35);
    if(k>=4){side(8.45,8.45,17.4);side(5.2,5.2,10.9)}
    if(domeK&&st.tower==='minaret'&&k>=3){[[4.4,4.4],[8.7,4.4],[4.4,8.7],[8.7,8.7]].slice(0,k>=5?4:2).forEach(([a,b])=>add(a+b+.3,tower(a,b,.22,H+26,0,sh(wall,1.04),'minaret',roof,14,{})))}
    return items}

  /* ---------- scène ---------- */
  function world(key,level,opt={}){
    const st=ST[key]||ST.medieval,lv=Math.max(1,Math.min(50,Number(level)||1));
    ANIM=!!opt.anim;LIGHTS=[];SEED=7;const u='kw'+(++UID);const has=n=>lv>=n;
    const hr=opt.hour!=null?opt.hour:new Date().getHours();const night=opt.anim&&(hr<7||hr>=21),dusk=opt.anim&&!night&&(hr>=18);
    const gold=has(40),stoneWalls=has(16),newSet=new Set(opt.fresh||[]);
    const sky=night?['#0b1638','#2a3d74']:dusk?['#f39a6b','#fdd9a6']:['#7cc4f2','#dff1fb'];
    const sea=night?['#12306a','#0a1c45']:dusk?['#4f8fc0','#2c5f94']:['#4fb2e0','#2a7fc0'];
    let bg=`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sea[0]}"/><stop offset="1" stop-color="${sea[1]}"/></linearGradient><radialGradient id="${u}h" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>`;
    bg+=`<rect width="600" height="360" fill="url(#${u}s)"/>`;
    if(night){for(let k=0;k<40;k++)bg+=`<circle cx="${f1(rnd()*600)}" cy="${f1(rnd()*110)}" r="${f1(.5+rnd()*1.1)}" fill="#fff" opacity="${f1(.4+rnd()*.6)}"${ANIM&&k%4===0?` class="kw-twinkle" style="animation-delay:-${f1(rnd()*3)}s"`:''}/>`;bg+=`<circle cx="520" cy="46" r="15" fill="#f4f1dc"/><circle cx="527" cy="41" r="13" fill="${sky[0]}"/>`}
    else bg+=`<circle cx="525" cy="44" r="${dusk?22:18}" fill="${dusk?'#ffb45e':'#ffe27a'}" opacity=".95"/>`;
    bg+=`<rect y="104" width="600" height="256" fill="url(#${u}w)"/>`;
    // lointains
    bg+=`<path d="M0 106Q60 92 120 104T260 100T420 102T600 98V108H0Z" fill="${night?'#1d3564':'#8fb7a0'}" opacity=".6"/>`;
    // paysage propre à chaque langue (volcan, montagnes, collines, îles)
    if(st.land){const m=night?'#22355f':dusk?'#b77a72':'#8ea5a6',m2=night?'#2b4170':dusk?'#c98b7c':'#a7bcbb',snow=night?'#c9d3ea':'#fbfbf7';
      if(st.land==='vesuvio'){bg+=`<path d="M30 106L96 74Q112 66 128 68L140 70Q150 66 160 72L232 106Z" fill="${m}"/><path d="M118 70Q130 64 142 70L136 74Q130 71 124 74Z" fill="${night?'#3a2a3a':'#6f6f6f'}"/>`;if(ANIM)bg+=`<g class="kw-smoke"><circle cx="130" cy="64" r="3.4"/><circle cx="133" cy="60" r="3" style="animation-delay:-1.2s"/><circle cx="128" cy="62" r="2.6" style="animation-delay:-2.4s"/></g>`}
      else if(st.land==='atlas'){bg+=`<path d="M330 106L380 78L404 88L452 64L492 84L520 76L578 106Z" fill="${m}"/><path d="M442 70L452 64L464 72L456 74Z M374 82L380 78L388 83Z M514 79L520 76L528 80Z" fill="${snow}"/><path d="M30 106Q70 96 110 104T190 102L200 106Z" fill="${night?'#3a3550':'#e3c48c'}"/>`}
      else if(st.land==='sierra'){bg+=`<path d="M340 106L372 84L392 92L420 76L446 90L470 80L520 106Z" fill="${m}"/><path d="M414 80L420 76L428 81Z" fill="${snow}"/>`}
      else if(st.land==='collines'){bg+=`<path d="M24 106Q60 84 96 100Q128 82 166 98Q196 88 226 106Z" fill="${m2}"/>`;[[60,92],[130,90],[180,94]].forEach(([x,y])=>{bg+=`<ellipse cx="${x}" cy="${y-6}" rx="2.4" ry="7" fill="${night?'#1f3a2c':'#3f6b47'}"/>`})}
      else if(st.land==='iles'){bg+=`<path d="M40 106Q70 90 100 106Z M150 106Q170 96 190 106Z M420 106Q470 84 520 106Z" fill="${m2}"/><path d="M462 92h12v-6h-12z" fill="${night?'#b9c2dd':'#fff'}"/>`}}
    // reflets sur l'eau
    for(let k=0;k<14;k++){const x=rnd()*600,y=120+rnd()*230;bg+=`<path d="M${f1(x)} ${f1(y)}h${f1(8+rnd()*14)}" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"${ANIM?` class="kw-wave" style="animation-delay:-${f1(rnd()*4)}s"`:''}/>`}
    // nuages
    const cloud=(x,y,s,d)=>{const g=`<g opacity="${night?.25:.9}"><ellipse cx="${x}" cy="${y}" rx="${26*s}" ry="${8*s}" fill="#fff"/><ellipse cx="${x+14*s}" cy="${y-6*s}" rx="${15*s}" ry="${9*s}" fill="#fff"/><ellipse cx="${x-12*s}" cy="${y-3*s}" rx="${11*s}" ry="${7*s}" fill="#fff"/></g>`;
      return ANIM?`<g>${g}<animateTransform attributeName="transform" type="translate" from="-80 0" to="680 0" dur="${d}s" begin="-${f1(d*rnd())}s" repeatCount="indefinite"/></g>`:g};
    bg+=cloud(0,34,1,90)+cloud(0,70,.7,120)+cloud(0,22,.55,150);

    // île
    const g0=st.grass,items=[];const add=(d,s,id)=>items.push({d,s,id});
    let ground=poly([P(0,N,0),P(N,N,0),P(N,N,-16),P(0,N,-16)],'#8a6a45',EDGE)+poly([P(N,0,0),P(N,N,0),P(N,N,-16),P(N,0,-16)],'#6f5436',EDGE);
    ground+=poly([P(0,N,-11),P(N,N,-11),P(N,N,-16),P(0,N,-16)],'#6b5238')+poly([P(N,0,-11),P(N,N,-11),P(N,N,-16),P(N,0,-16)],'#584330');
    ground+=`<path d="M${pts([P(0,N,-16)])} ${pts([P(N,N,-16)])} ${pts([P(N,0,-16)])}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
    ground+=poly([P(0,0),P(N,0),P(N,N),P(0,N)],g0,EDGE);
    for(let k=0;k<55;k++){const i=rnd()*N,j=rnd()*N;ground+=tile(i,j,.35,.35,sh(g0,rnd()>.5?.9:1.08))}
    // chemins
    const road=has(16)?st.stone:'#c8a978';
    if(has(7)){ground+=tile(6,8,1,N-8,sh(road,1.05));ground+=tile(1,13,12.6,.8,sh('#c8a978',1.02))+tile(12.8,1,.8,12.8,sh('#c8a978',1.02))}
    if(has(4)){for(let r=0;r<5;r++)ground+=tile(.4,3.3+r*.5,2.3,.34,r%2?'#b8a24a':'#d4b95a');}
    if(has(33))ground+=tile(3.5,3.5,1.5,1.5,sh(g0,.85))+tile(3.7,3.7,1.1,1.1,sh(g0,1.15));
    if(has(44)){for(let r=0;r<3;r++)ground+=tile(9.6+r*.12,11+r*.12,1.3-r*.24,1.3-r*.24,r%2?sh(g0,1.15):sh(g0,.75))}
    if(has(48))ground+=tile(0.3,6.6,2.4,2.4,sh(g0,1.1));

    // arbres du bosquet
    [[12.6,12.2,.8],[.9,4.2,.7]].forEach(([i,j,s])=>add(i+j,tree(i,j,st.tree,s)));
    [[2.2,6.3],[11.8,2.2],[4.8,12.9],[12.3,7.1]].forEach(([i,j])=>{const [x,y]=P(i,j);add(i+j,`<ellipse cx="${f1(x)}" cy="${f1(y-2)}" rx="5" ry="3.2" fill="#9a9b98"/><ellipse cx="${f1(x-1)}" cy="${f1(y-3)}" rx="3" ry="1.8" fill="#b9bab7"/>`)});
    if(!has(13)){const [x,y]=P(8.4,8.2);add(16.6,`<g><path d="M${f1(x-6)} ${f1(y)}l12 -3M${f1(x-6)} ${f1(y-3)}l12 3" stroke="#6b4a2d" stroke-width="2"/><path d="M${f1(x-4)} ${f1(y-2)}q4 -12 8 0z" fill="#ff8a3d"${ANIM?' class="kw-fire"':''}/><path d="M${f1(x-2)} ${f1(y-2)}q2 -7 4 0z" fill="#ffd36b"/></g>`);if(ANIM)add(16.7,chimneySmoke(x,y-12))}
    if(lv<8){const [x,y]=P(7.6,5.4);add(13,`<path d="M${f1(x-12)} ${f1(y)}L${f1(x)} ${f1(y-16)}L${f1(x+12)} ${f1(y)}Z" fill="${st.flag}"/><path d="M${f1(x)} ${f1(y-16)}L${f1(x+12)} ${f1(y)}H${f1(x)}Z" fill="rgba(0,0,0,.2)"/><path d="M${f1(x-3)} ${f1(y)}L${f1(x)} ${f1(y-7)}L${f1(x+3)} ${f1(y)}Z" fill="#3b2c22"/>`)}
    if(has(2))[[.8,.9,1],[1.9,.6,.9],[1.2,2,1.1],[2.5,1.6,.85]].forEach(([i,j,s])=>add(i+j,tree(i,j,st.tree,s)));
    // champs (déjà au sol), puits
    if(has(3)){const [x,y]=P(4.1,8.9);add(13,`<g data-kf="3"><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="4" fill="#8f918f"/><rect x="${f1(x-8)}" y="${f1(y-6)}" width="16" height="6" fill="#a3a5a3"/><ellipse cx="${f1(x)}" cy="${f1(y-6)}" rx="8" ry="4" fill="#bfc1bf"/><ellipse cx="${f1(x)}" cy="${f1(y-6)}" rx="5.5" ry="2.6" fill="#2e5d86"/><path d="M${f1(x-7)} ${f1(y-6)}V${f1(y-18)}M${f1(x+7)} ${f1(y-6)}V${f1(y-18)}" stroke="#6b4a2d" stroke-width="1.6"/><path d="M${f1(x-10)} ${f1(y-17)}L${f1(x)} ${f1(y-24)}L${f1(x+10)} ${f1(y-17)}Z" fill="${st.houseRoof||st.roof}"/></g>`,3)}
    // château
    const K=lv>=45?7:lv>=37?6:lv>=30?5:lv>=26?4:lv>=20?3:lv>=13?2:lv>=5?1:0;
    keepHTML(K,st,gold).forEach(o=>add(o.d,`<g class="kw-keep" data-kfeat="keep">${o.s}</g>`,[1,5,13,20,30,37,45].filter(x=>x<=lv).pop()));
    // maisons du village
    const H=(n,i,j,w,d,h,v)=>{if(has(n))add(i+w+j+d,`<g>${house(i,j,w,d,h,st,v)}${ANIM&&v%2===0?chimneySmoke(...P(i+w*.3,j+d*.3,h+14)):''}</g>`,n)};
    H(6,11.4,3.6,1.2,1,16,0);H(9,11.4,5.5,1.1,1.1,15,1);H(15,8.3,11.2,1.2,1,16,2);H(23,11.4,9.4,1.1,1,15,3);H(23,9.8,11.3,1,1,14,1);
    H(34,4,0.7,1.2,1,15,0);H(34,6,0.7,1.1,1,17,1);H(34,8,0.7,1.2,1,15,2);
    // forge
    if(has(22)){let s=box(11.4,7.4,1.2,1,12,0,sh(st.stone,.9))+roofPyr(11.4,7.4,1.2,1,12,7,'#5a4a42')+box(11.5,7.5,.3,.3,24,0,'#6d6560');s+=`<rect x="${f1(P(11.9,8.4,2)[0]-4)}" y="${f1(P(11.9,8.4,8)[1])}" width="8" height="6" fill="#ff8a3d" class="kw-fire"/>`;if(ANIM)s+=chimneySmoke(...P(11.65,7.65,26));add(20,s,22)}
    // marché
    if(has(11)){let s='';[[3.5,11.2,'#d9463b'],[4.6,11.2,'#2f7ad6'],[3.5,12.2,'#e1a92d']].forEach(([i,j,c])=>{s+=box(i,j,.8,.7,7,0,'#b88a55',{top:'#c79a62'});s+=poly([P(i-.1,j+.8,11),P(i+.9,j+.8,11),P(i+.9,j-.1,13),P(i-.1,j-.1,13)],c)+poly([P(i+.9,j-.1,13),P(i+.9,j+.8,11),P(i+.9,j+.8,9),P(i+.9,j-.1,11)],sh(c,.75));
      const [x,y]=P(i+.4,j+.7,7);s+=`<circle cx="${f1(x-3)}" cy="${f1(y-1)}" r="1.8" fill="#f2c14e"/><circle cx="${f1(x+1)}" cy="${f1(y)}" r="1.8" fill="#e05a47"/><circle cx="${f1(x+4)}" cy="${f1(y-1)}" r="1.8" fill="#6bb04f"/>`});
      add(15.6,`<g class="kw-tap" data-kgo="lists">${s}${badge(4.4,11.8,22,'📜')}</g>`,11)}
    // tours d'angle et remparts
    const wallH=has(30)?20:has(16)?15:0,wc=st.stone;
    if(has(8)&&!has(16)){let s='';for(let x=3;x<10;x+=.5){if(x>=6&&x<7)continue;s+=stakes(x,10.2)}add(20.5,s,8);let b='';for(let y=3;y<10;y+=.5)b+=stakes2(10.2,y);add(20.4,b,8);let c='';for(let x=3;x<10;x+=.5)c+=stakes(x,3);for(let y=3;y<10;y+=.5)c+=stakes2(3,y);add(6,c,8)}
    if(has(16)){
      for(let x=3.4;x<10.2;x+=1){const w=Math.min(1,10.2-x);add(x+3+.4,box(x,3,w,.4,wallH,0,wc)+merl(x,3,w,wallH,wc),16)}
      for(let y=3.4;y<10.2;y+=1){const w=Math.min(1,10.2-y);add(3+y+.4,box(3,y,.4,w,wallH,0,wc)+merlR(3,y,w,wallH,wc),16)}
      for(let x=3.4;x<10.2;x+=1){if(x>=5.4&&x<7.4)continue;const w=Math.min(1,10.2-x);add(x+w+10.6,box(x,10.2,w,.4,wallH,0,wc)+merl(x,10.2,w,wallH,wc)+(has(24)&&Math.round(x)%2?banner(x+.5,10.6,wallH-2,st.flag):''),16)}
      for(let y=3.4;y<10.2;y+=1){const w=Math.min(1,10.2-y);add(10.6+y+w,box(10.2,y,.4,w,wallH,0,wc)+merlR(10.2,y,w,wallH,wc)+(has(24)&&Math.round(y)%2?bannerR(10.6,y+.5,wallH-2,st.flag):''),16)}
      // porte
      let g=box(5.5,9.9,.7,1,wallH+10,0,sh(wc,1.05))+box(6.8,9.9,.7,1,wallH+10,0,sh(wc,1.05))+box(5.5,10,2,.8,8,wallH,sh(wc,.98));
      g+=poly([P(6.2,10.8,0),P(6.8,10.8,0),P(6.8,10.8,wallH-2),P(6.5,10.8,wallH+1),P(6.2,10.8,wallH-2)],'#2d2118');
      g+=merl(5.5,10,2,wallH+8,wc);if(has(46)){const [x,y]=P(5.85,10.9,wallH+10);g+=flag(x,y,16,'#e1b54a',true);const [x2,y2]=P(7.15,10.9,wallH+10);g+=flag(x2,y2,16,'#e1b54a',true)}
      add(18.6,g,16)}
    const cT=st.tower==='minaret'?'dome':st.tower;
    const CT=(n,i,j,d)=>{if(has(n))add(d,tower(i,j,.62,(wallH||12)+16,0,stoneWalls?wc:st.wall,st.wood&&!stoneWalls?'cone':cT,gold?mix(st.roof,'#e2b33c',st.gm??.65):st.roof,cT==='spire'?24:18,{flag:has(24)?st.flag:null}),n)};
    CT(10,3.2,3.2,6.5);CT(12,3.2,10.4,13.7);CT(17,10.4,3.2,13.7);CT(19,10.4,10.4,21);
    // bibliothèque, trésor, fontaine, jardins, statue
    if(has(18)){let s=box(8.5,3.7,1.3,1.2,17,0,sh(st.wall,1.03))+winL(8.8,4.9,6,.2,8)+winL(9.3,4.9,6,.2,8)+winR(9.8,4,6,.2,8);s+=st.keep==='dome'?box(8.45,3.65,1.4,1.3,2,17,st.wall)+dome(...P(9.15,4.3,19),11,st.roof):roofGable(8.5,3.7,1.3,1.2,17,10,st.houseRoof||st.roof,st.wall);add(13.6,`<g class="kw-tap" data-kgo="grammar">${s}${badge(9.15,4.3,40,'📚')}</g>`,18)}
    if(has(36)){let s=box(3.7,5.8,1,1,11,0,'#b98b3a',{top:'#e3b54c'})+merlons(3.7,5.8,1,1,11,'#c99a45',2);const [x,y]=P(4.2,6.3,15);s+=`<text x="${f1(x)}" y="${f1(y)}" font-size="9" text-anchor="middle">💰</text>`;add(10.5,s,36)}
    if(has(21)){const gl=has(47);const [x,y]=P(8.9,8.9);add(17.8,`<g><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="12" ry="6" fill="${gl?'#d6a83c':'#9b9d9b'}"/><ellipse cx="${f1(x)}" cy="${f1(y-2)}" rx="10" ry="5" fill="#4aa3df"/><rect x="${f1(x-2)}" y="${f1(y-14)}" width="4" height="12" fill="${gl?'#e9c35a':'#b5b7b5'}"/><ellipse cx="${f1(x)}" cy="${f1(y-14)}" rx="5" ry="2.4" fill="${gl?'#e9c35a':'#c5c7c5'}"/>${ANIM?`<path class="kw-jet" d="M${f1(x)} ${f1(y-15)}q-5 -8 -9 2M${f1(x)} ${f1(y-15)}q5 -8 9 2" stroke="#bfe6ff" stroke-width="1.6" fill="none"/>`:''}</g>`,21)}
    if(has(33)){[[3.7,3.7],[4.6,3.7],[3.7,4.6],[4.6,4.6]].forEach(([i,j])=>add(i+j+.4,tree(i+.2,j+.2,'round',.45)))}
    if(has(32)){const big=has(49);const [x,y]=P(7.8,12);add(19.9,`<g><rect x="${f1(x-6)}" y="${f1(y-8)}" width="12" height="8" fill="#a3a5a3"/><ellipse cx="${f1(x)}" cy="${f1(y-8)}" rx="6" ry="3" fill="#c5c7c5"/><path d="M${f1(x-3)} ${f1(y-8)}v${big?-22:-14}h6v${big?22:14}z" fill="${big?'#e2b33c':'#8f918f'}"/><circle cx="${f1(x)}" cy="${f1(y-(big?33:25))}" r="${big?5:4}" fill="${big?'#f2cf5b':'#a3a5a3'}"/>${big?`<path d="M${f1(x+3)} ${f1(y-26)}l9 -12" stroke="#f2cf5b" stroke-width="2.4" stroke-linecap="round"/><circle cx="${f1(x)}" cy="${f1(y-26)}" r="18" fill="url(#${u}h)"/>`:''}</g>`,32)}
    // moulin
    if(has(14)){const [hx_,hy]=P(1.4,12.3,30);let s=tower(1.4,12.3,.5,30,0,st.wood?sh(st.wall,1.1):'#e8dcc4','cone',st.houseRoof||st.roof,14,{});
      const sails=`<g><path d="M${f1(hx_)} ${f1(hy)}l-2 -22h4z M${f1(hx_)} ${f1(hy)}l22 -2v4z M${f1(hx_)} ${f1(hy)}l2 22h-4z M${f1(hx_)} ${f1(hy)}l-22 2v-4z" fill="#f4efe4" stroke="#6b4a2d" stroke-width=".8"/>${ANIM?`<animateTransform attributeName="transform" type="rotate" from="0 ${f1(hx_)} ${f1(hy)}" to="360 ${f1(hx_)} ${f1(hy)}" dur="7s" repeatCount="indefinite"/>`:''}</g><circle cx="${f1(hx_)}" cy="${f1(hy)}" r="2.2" fill="#6b4a2d"/>`;
      add(13.8,s+sails,14)}
    // tour du professeur
    if(has(25)){let s=tower(1.5,7.3,.6,44,0,sh(st.wall,1.04),st.tower==='flat'?'cone':cT,'#3656a8',22,{flag:'#e1b54a'});const [x,y]=P(1.5,7.3,30);s+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="#ffe9a8" class="kw-glow"/>`;add(9,`<g class="kw-tap" data-kgo="teacher">${s}${badge(1.5,7.3,78,'🎓')}</g>`,25)}
    // verger
    if(has(29))[[.7,9.6],[1.7,9.9],[2.5,9.3],[.9,10.8],[2.1,11]].forEach(([i,j])=>add(i+j,tree(i,j,st.tree==='palm'?'palm':st.tree==='pine'?'pine':'round',.7)));
    if(has(48))[[.8,7],[1.8,8.3],[2.6,7.2]].forEach(([i,j])=>add(i+j,tree(i,j,'magic',.65)));
    // clocher
    if(has(42))add(2,tower(.9,2.9,.45,48,0,sh(st.wall,1.05),st.tower==='onion'||st.tower==='dome'?st.tower:'spire',st.roof,20,{flag:st.flag}),42);
    // stade
    if(has(28)){let s=tile(11,0.4,2.7,2.5,'#3f9a4b')+tile(11.15,.55,2.4,2.2,'#4cae57');const c=P(12.35,1.65);s+=`<ellipse cx="${f1(c[0])}" cy="${f1(c[1])}" rx="9" ry="4.5" fill="none" stroke="#fff" stroke-width="1"/><path d="M${pts([P(11.15,1.65)])} L${pts([P(13.55,1.65)])}" stroke="#fff" stroke-width="1"/>`;
      s+=box(11,.1,2.7,.3,8,0,'#c9ccd6')+box(10.7,.4,.3,2.5,8,0,'#c9ccd6');[[11.1,.2],[13.6,.2]].forEach(([i,j])=>{const [x,y]=P(i,j,26);s+=`<line x1="${f1(x)}" y1="${f1(y+26)}" x2="${f1(x)}" y2="${f1(y)}" stroke="#7a7f8f" stroke-width="1.4"/><rect x="${f1(x-4)}" y="${f1(y-3)}" width="8" height="4" fill="#fff6c9"/>`});
      const [bx,by]=P(12.7,1.3);s+=`<circle cx="${f1(bx)}" cy="${f1(by-2)}" r="1.8" fill="#fff" stroke="#333" stroke-width=".5"${ANIM?' class="kw-ball"':''}/>`;
      add(11.5,`<g class="kw-tap" data-kgo="play">${s}${badge(12.3,1.6,20,'⚽')}</g>`,28)}
    // port, bateaux, phare, pont
    if(has(26)){let s='';for(let x=0;x<3;x++)s+=box(13.9+x*.8,10.8,.8,.7,2,-6,'#8a6a45',{top:'#a8845a'});[[14.1,11.5],[15.5,11.5]].forEach(([i,j])=>{const [x,y]=P(i,j,-4);s+=`<rect x="${f1(x-1)}" y="${f1(y-4)}" width="2" height="12" fill="#6b4a2d"/>`});add(40,s,26)}
    if(has(27))add(41,boat(16.4,9.4,st,ANIM,0),27);
    if(has(39)){add(41,boat(16.2,4.2,st,ANIM,1.5),39);add(41,boat(9,16.2,st,ANIM,3),39)}
    if(has(35)){const [x,y]=P(15.6,-.6,-10);let s=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="16" ry="7" fill="#8f918f"/><ellipse cx="${f1(x)}" cy="${f1(y-2)}" rx="13" ry="5.5" fill="#a9aba9"/>`;s+=tower(15.6,-.6,.42,46,-8,'#f2f2f2','cone','#c0392b',12,{});const [lx,ly]=P(15.6,-.6,34);s+=`<rect x="${f1(lx-5)}" y="${f1(ly-8)}" width="10" height="4" fill="#c0392b"/><rect x="${f1(lx-5)}" y="${f1(ly-18)}" width="10" height="4" fill="#c0392b"/>`;
      if(night&&ANIM)s+=`<path class="kw-beam" d="M${f1(lx)} ${f1(ly-30)}L${f1(lx-120)} ${f1(ly-50)}L${f1(lx-120)} ${f1(ly-14)}Z" fill="#fff3b0" opacity=".25"/>`;add(1,s,35)}
    if(has(41)){const fc=['#e8505b','#f7c948','#f28fb3','#ffffff','#7a5cd6'];[[3.3,11.3],[8.1,12.6],[11,11.1],[.6,6.1],[9.6,2.9]].forEach(([i,j],q)=>{let s=tile(i,j,.9,.5,'#6b4a2d');for(let k=0;k<7;k++){const [x,y]=P(i+.1+(k%4)*.22,j+.12+Math.floor(k/4)*.24);s+=`<circle cx="${f1(x)}" cy="${f1(y-1.5)}" r="1.6" fill="${fc[(k+q)%5]}"/>`}add(i+j+.5,s,41)})}
    if(has(43)){const [x,y]=P(6.5,13.1);let s=box(5.7,12.9,.5,.5,26,0,st.stone)+box(7,12.9,.5,.5,26,0,st.stone)+box(5.7,12.9,1.8,.5,8,26,sh(st.stone,1.05));s+=poly([P(6.2,13.4,0),P(7,13.4,0),P(7,13.4,22),P(6.6,13.4,26),P(6.2,13.4,22)],'rgba(0,0,0,0)');add(20.8,s,43)}
    // lanternes
    if(has(31))[[6,9.2],[7,9.2],[6,11.8],[7,11.8],[6,13.4],[7,13.4]].forEach(([i,j])=>{const [x,y]=P(i,j);add(i+j+.05,`<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y-13)}" stroke="#3b3b3b" stroke-width="1.2"/><rect x="${f1(x-2)}" y="${f1(y-17)}" width="4" height="4.5" fill="${night||dusk?'#ffd66b':'#f4e6b4'}"/>${night?`<circle cx="${f1(x)}" cy="${f1(y-15)}" r="9" fill="url(#${u}h)"/>`:''}`,31)});
    // oiseaux
    let fx='';
    if(!night&&!has(38)&&ANIM){const s=`<path d="M0 0q3 -3 6 0q3 -3 6 0" stroke="#2c3550" stroke-width="1.2" fill="none"/>`;fx+=`<g>${s}<animateTransform attributeName="transform" type="translate" values="-30 70;300 50;640 64" dur="38s" begin="-${f1(38*rnd())}s" repeatCount="indefinite"/></g>`}
    if(has(38)&&!night){const b=(x,y,d)=>{const s=`<path d="M${x} ${y}q4 -4 8 0q4 -4 8 0" stroke="#2c3550" stroke-width="1.4" fill="none"/>`;return ANIM?`<g>${s}<animateTransform attributeName="transform" type="translate" values="0 0;340 -20;680 10" dur="${d}s" begin="-${f1(d*rnd())}s" repeatCount="indefinite"/></g>`:s};fx+=b(-40,60,26)+b(-60,72,30)+b(-20,50,34)}
    if(ANIM&&!night)fx+=`<g class="kw-fish"><path d="M0 0q4 -3 9 0q-5 3 -9 0z M9 0l4 -3v6z" fill="#e98b3a"/></g><g class="kw-splash"><ellipse cx="0" cy="0" rx="7" ry="2" fill="none" stroke="#fff" stroke-width="1.2"/></g>`;
    if(ANIM&&night)[[2,9],[11,12.5],[1.5,3],[12.5,5],[4.5,13.2],[9,1.2]].forEach(([i,j],q)=>{const [x,y]=P(i,j,6);fx+=`<circle class="kw-fly" cx="${f1(x)}" cy="${f1(y)}" r="1.5" fill="#fff59a" style="animation-delay:-${q*.7}s"/>`});
    // halo final
    if(has(50))fx+=`<circle cx="${f1(P(6.5,6.5,90)[0])}" cy="${f1(P(6.5,6.5,90)[1])}" r="70" fill="url(#${u}h)"${ANIM?' class="kw-glow"':''}/><text x="${f1(P(6.5,6.5,150)[0])}" y="${f1(P(6.5,6.5,150)[1])}" font-size="18" text-anchor="middle">👑</text>`;
    // habitants
    let walkers='';
    if(ANIM){const cols=['#c0392b','#2f7ad6','#e1a92d','#7a3fb0','#2f9a5b'];
      const route=(ptsArr,dur,c,delay)=>{const d='M'+ptsArr.map(p=>f1(p[0])+' '+f1(p[1])).join(' L');return `<g><ellipse cx="0" cy="0" rx="3" ry="1.3" fill="rgba(0,0,0,.2)"/><rect x="-2.2" y="-8" width="4.4" height="7" rx="2" fill="${c}"/><circle cx="0" cy="-10" r="2.4" fill="#f1c9a5"/><animateMotion dur="${dur}s" begin="-${delay}s" repeatCount="indefinite" path="${d}"/></g>`};
      const n=Math.min(5,1+Math.floor(lv/9));
      const R1=[P(.8,13.4),P(13.4,13.4),P(13.4,11.8),P(13.4,13.4),P(.8,13.4)],R2=[P(6.5,10.9),P(6.5,13.8),P(6.5,10.9)];
      for(let k=0;k<n;k++)walkers+=k%2?route(R2,14+k*2,cols[k],k*3):route(R1,40+k*5,cols[k],k*9)}
    // tri du plus loin au plus proche
    items.sort((a,b)=>a.d-b.d);
    let mid='';items.forEach(o=>{if(!o.s)return;const fresh=o.id&&newSet.has(o.id);mid+=fresh?`<g class="kw-new">${o.s}</g>`:o.s});
    // nuit : voile et lumières des fenêtres
    let over='';
    if(night){over+=`<rect width="600" height="360" fill="#0a1540" opacity=".38"/>`;LIGHTS.forEach(a=>{over+=poly(a,'#ffd56a',' opacity=".95"')})}
    else if(dusk){over+=`<rect width="600" height="360" fill="#ff8a3d" opacity=".08"/>`}
    const vb=opt.vb||'22 20 556 318';
    return `<svg class="kw-svg${ANIM?' kw-anim':''}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${(opt.label||'Mon royaume').replace(/"/g,'&quot;')}" xmlns="http://www.w3.org/2000/svg">${bg}<g>${ground}</g>${mid}${walkers}${over}${fx}</svg>`;

    function stakes(x,y){return box(x+.05,y,.4,.25,10,0,'#8a6a45')+poly([P(x+.05,y+.25,10),P(x+.45,y+.25,10),P(x+.25,y+.25,13)],'#a07a4f')}
    function stakes2(x,y){return box(x,y+.05,.25,.4,10,0,'#8a6a45')+poly([P(x+.25,y+.05,10),P(x+.25,y+.45,10),P(x+.25,y+.25,13)],'#7a5c3b')}
    function merl(x,y,w,h,c){return box(x+.05,y+.2,w*.4,.2,4,h,c)+box(x+w*.55,y+.2,w*.4,.2,4,h,c)}
    function merlR(x,y,w,h,c){return box(x+.2,y+.05,.2,w*.4,4,h,c)+box(x+.2,y+w*.55,.2,w*.4,4,h,c)}
    function banner(i,j,z,c){return poly([P(i-.15,j,z),P(i+.15,j,z),P(i+.15,j,z-10),P(i,j,z-13),P(i-.15,j,z-10)],c)}
    function bannerR(i,j,z,c){return poly([P(i,j-.15,z),P(i,j+.15,z),P(i,j+.15,z-10),P(i,j,z-13),P(i,j-.15,z-10)],sh(c,.85))}
    function badge(i,j,z,e){if(!ANIM)return '';const [x,y]=P(i,j,z);return `<g class="kw-badge"><circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="#fff" stroke="#1B2B5E" stroke-width="1.4"/><text x="${f1(x)}" y="${f1(y+3.4)}" font-size="9.5" text-anchor="middle">${e}</text></g>`}
  }
  function boat(i,j,st,anim,delay){const [x,y]=P(i,j,-9);const s=`<path d="M${f1(x-16)} ${f1(y)}h32l-6 7h-20z" fill="#7a5230"/><path d="M${f1(x-16)} ${f1(y)}h32" stroke="#5b3a22" stroke-width="1.2"/><line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y-28)}" stroke="#5b3a22" stroke-width="1.6"/><path d="M${f1(x+1)} ${f1(y-26)}q14 10 0 22z" fill="#f4efe4"/><path d="M${f1(x-1)} ${f1(y-22)}q-10 8 0 16z" fill="#efe6d4"/><path d="M${f1(x)} ${f1(y-28)}l8 2l-8 2z" fill="${st.flag}"/>`;
    return anim?`<g class="kw-boat" style="animation-delay:-${delay}s">${s}</g>`:s}

  window.KingdomWorld=world;
})();


/* Branchement dans l'application : la carte de l'accueil affiche le monde animé,
   les autres vignettes (styles, évolution, bandeau) une version fixe. */
(function(){
  if(typeof castleProgressCard!=='function'||!window.CastellumDomain50)return;
  const prev=castleProgressCard;
  castleProgressCard=function(){
    let h=prev.apply(this,arguments);
    try{
      const d=window.CastellumDomain50.progress(),key=(S.castleStyle&&typeof CASTLE_STYLE_DATA!=='undefined'&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval';
      let fresh=[];
      if(S.kwSeen==null){S.kwSeen=d.level;try{save()}catch(e){}}
      else if(d.level>S.kwSeen){for(let n=S.kwSeen+1;n<=d.level;n++)fresh.push(n);const names=fresh.map(n=>(window.KINGDOM_FEATURES[n-1]||[])[1]).filter(Boolean);S.kwSeen=d.level;try{save()}catch(e){}
        setTimeout(()=>{try{toast('🏗️ Nouveau dans ton royaume : '+names.slice(-2).join(' · ').replace(/ \(touche[^)]*\)/g,''))}catch(e){}},700)}
      else if(d.level<S.kwSeen){S.kwSeen=d.level}
      const w=window.KingdomWorld(key,d.level,{anim:true,fresh,label:'Mon royaume · niveau '+d.level});
      h=h.replace(/<div class="rk-art">[\s\S]*?<\/svg>\s*<\/div>/,'<div class="rk-art">'+w+'</div>').replace('class="rk-hero"','class="rk-hero rk-world"');
    }catch(e){console.warn('royaume',e)}
    return h};
  // Toucher un bâtiment ouvre la section correspondante (sans ouvrir la fenêtre d'évolution).
  window.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-kgo]');if(!t)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{go(t.getAttribute('data-kgo'))}catch(err){}},true);
  // Le monde dessiné remplace les illustrations (les fichiers restent disponibles).
  try{window.CASTELLUM_ILLUS_SAVED=window.CASTELLUM_ILLUS;window.CASTELLUM_ILLUS={}}catch(e){}
  // Les noms et icônes des 50 niveaux correspondent à ce qui se construit réellement dans le monde.
  try{const D=window.CastellumDomain50,F=window.KINGDOM_FEATURES;
    const IC=['🏠','🌳','🪣','🌾','🗼','🏡','🛤️','🪵','🏘️','🗼','🛒','🗼','🏯','🌬️','🏡','🧱','🗼','📚','🗼','🏰','⛲','⚒️','🏘️','🚩','🎓','⚓','⛵','⚽','🍎','🏰','🏮','🗿','🌷','🛠️','🔦','💰','🏛️','🕊️','⛵','✨','🌸','🔔','🏛️','🌳','🏰','🚩','⛲','🌟','🗽','👑'];
    if(D&&Array.isArray(D.names)&&D.names.length===50){D.names.splice(0,50,...F.map(f=>f[1].replace(/ \(touche[^)]*\)/,'')));if(Array.isArray(D.icons)&&D.icons.length===50)D.icons.splice(0,50,...IC)}}catch(e){}
  try{if(typeof render==='function')render()}catch(e){}
})();
