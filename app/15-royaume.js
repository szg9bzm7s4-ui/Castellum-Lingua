(function(){
  if(typeof CASTLE_STYLE_DATA==='undefined'||typeof S==='undefined')return;

  /* ---------------- 1. ARCHITECTURES ---------------- */
  const BASE={sky:['#8fc3ee','#e8f1f7'],hill:'#9fbf8a',hill2:'#7fa56c',ground:['#86ad62','#577f40'],road:'#d8c79f',line:'#4a3b2a',win:'#2f2a33',lit:'#ffd66b',wood:'#8a5a34',woodDark:'#5e3b20',water:'#6fa9d6',sun:'#fff1b0'};
  const P=o=>Object.assign({},BASE,o);
  const ARCH={
    medieval:{main:'tower',troof:'cone',top:'crenel',win:'arch',tree:'round',sig:'bergfried',pal:P({wall:'#cdbb98',shade:'#9f8b68',roof:'#8e3b33',roofShade:'#6b2a24',flag:'#244c91',cloth:'#c9b27c'})},
    occidental:{main:'tower',troof:'slate',top:'crenel',win:'square',tree:'round',sig:'pavilion',pal:P({wall:'#eee6d6',shade:'#c7bba4',roof:'#4c5b74',roofShade:'#36435a',flag:'#1f3f8f',cloth:'#dcd2bd',gold:'#d4ab45'})},
    oriental:{main:'domed',troof:'onion',top:'flat',win:'arch',tree:'palm',sig:'chhatri',dome:'onion',pal:P({wall:'#f4eee2',shade:'#d8cbb2',roof:'#f7f2e8',roofShade:'#dccfb8',flag:'#c0392b',cloth:'#e9c98a',gold:'#d6a83c',sky:['#9fcdf0','#f6ead2'],ground:['#b5a86b','#8a7d45'],hill:'#c9b98a',hill2:'#b3a26f'})},
    romain:{main:'temple',troof:'tile',top:'crenel',win:'square',tree:'cypress',sig:'rotunda',pal:P({wall:'#efe2c4',shade:'#cdb88f',roof:'#b5553b',roofShade:'#8e3f2a',flag:'#9e1b1b',cloth:'#c9a15a',gold:'#d6a83c'})},
    grec:{main:'temple',troof:'pediment',top:'flat',win:'square',tree:'cypress',sig:'acropolis',pal:P({wall:'#f6f3ec',shade:'#d9d2c2',roof:'#e2dac8',roofShade:'#c3b89f',flag:'#2a5d9f',cloth:'#e6dcc4',sky:['#7fbff0','#eaf4fb'],hill:'#c7c09a',hill2:'#aaa37e'})},
    byzantin:{main:'domed',troof:'dome',top:'flat',win:'arch',tree:'cypress',sig:'domes',dome:'dome',pal:P({wall:'#e7caa0',shade:'#bd9b6f',roof:'#d9a93a',roofShade:'#b48527',flag:'#6b2d7a',cloth:'#b86b4b',gold:'#e1b54a',brick:'#b86b4b'})},
    ottoman:{main:'domed',troof:'minaret',top:'flat',win:'arch',tree:'cypress',sig:'minarets',dome:'lead',pal:P({wall:'#efe8da',shade:'#cfc4ae',roof:'#8494a8',roofShade:'#66758a',flag:'#b3261e',cloth:'#1f7a5c',gold:'#d6a83c'})},
    andalou:{main:'tower',troof:'stepped',top:'stepped',win:'horseshoe',tree:'palm',sig:'patio',pal:P({wall:'#dcaa78',shade:'#b5825a',roof:'#2e7d5b',roofShade:'#215c43',flag:'#2e7d5b',cloth:'#e8c07a',gold:'#d6a83c',sky:['#8cc6f0','#f7ebd6'],ground:['#a9a660','#7f7c3f']})},
    nordique:{main:'hall',troof:'gable',top:'palisade',win:'slit',tree:'pine',sig:'stave',pal:P({wall:'#8a5e3c',shade:'#6a452a',roof:'#4a3b30',roofShade:'#33281f',flag:'#b3261e',cloth:'#a9926d',stone:'#8f918f',sky:['#9dbfd9','#e9eef2'],ground:['#7d9e6a','#51704a'],hill:'#8ea39a',hill2:'#6f8779'})},
    celtique:{main:'tower',troof:'thatch',top:'crenel',win:'slit',tree:'round',sig:'stones',round:true,pal:P({wall:'#aba797',shade:'#86826f',roof:'#b8914f',roofShade:'#8e6c35',flag:'#2f7d3b',cloth:'#b89a5e',sky:['#a9c6dc','#eef2ef'],ground:['#6ea45a','#44793b'],hill:'#7eaf6b',hill2:'#5e8f52'})},
    renaissance:{main:'tower',troof:'hip',top:'cornice',win:'square',tree:'cypress',sig:'duomo',pal:P({wall:'#ecd1a5',shade:'#c9a877',roof:'#b8633f',roofShade:'#8f4a2d',flag:'#1f5f9e',cloth:'#d9b77b',gold:'#d6a83c'})},
    gothique:{main:'tower',troof:'spire',top:'crenel',win:'pointed',tree:'pine',sig:'cathedral',pal:P({wall:'#a4a4ad',shade:'#7c7c87',roof:'#3b3f52',roofShade:'#272a38',flag:'#6b1f2a',cloth:'#8a7d6a',sky:['#9aaecb','#e4e6ec'],ground:['#6f8d5c','#4a6440'],hill:'#8199a0',hill2:'#667f86'})},
    japonais:{main:'pagoda',troof:'pagoda',top:'tiled',win:'square',tree:'sakura',sig:'torii',pal:P({wall:'#f7f5ef',shade:'#d9d5ca',roof:'#3e4a55',roofShade:'#2a333c',flag:'#be2f36',cloth:'#e8e2d2',stone:'#8f8b80',gold:'#d6a83c',sky:['#a8d0f0','#f8ecef'],hill:'#9dbb8e',hill2:'#7d9e70'})},
    persan:{main:'domed',troof:'dome',top:'stepped',win:'pointed',tree:'cypress',sig:'iwan',dome:'turquoise',pal:P({wall:'#e8d4ae',shade:'#c2a97d',roof:'#2b9bb0',roofShade:'#1d7686',flag:'#1f5f9e',cloth:'#1f5f9e',gold:'#d6a83c',tile:'#1f5f9e',sky:['#8ec9ef','#f6ead3'],ground:['#a9ad68','#7d8445']})},
    fantasy:{main:'tower',troof:'spire',top:'crenel',win:'pointed',tree:'crystal',sig:'floating',pal:P({wall:'#dcd6f2',shade:'#aea5d6',roof:'#5b3fa3',roofShade:'#40297c',flag:'#26b5c9',cloth:'#9e8fd6',gold:'#f2c94c',sky:['#4d4b9a','#d8a8d8'],sun:'#fff3c4',ground:['#6fa37a','#436e52'],hill:'#7d79b8',hill2:'#615da0',water:'#7ee0ff'})}
  };
  const archOf=k=>ARCH[k]||ARCH.medieval;

  /* ---------------- 2. PRIMITIVES SVG ---------------- */
  const r1=n=>Math.round(n*10)/10;
  let SVG_UID=0;
  function block(x,y,w,h,p,fill){
    let s=`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill||p.wall}"/>`;
    s+=`<rect x="${r1(x+w*.7)}" y="${r1(y)}" width="${r1(w*.3)}" height="${r1(h)}" fill="${p.shade}" opacity=".5"/>`;
    if(h>28)for(let yy=y+13;yy<y+h-5;yy+=13)s+=`<line x1="${r1(x)}" x2="${r1(x+w)}" y1="${r1(yy)}" y2="${r1(yy)}" stroke="${p.line}" stroke-width="1" opacity=".12"/>`;
    return s+`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="none" stroke="${p.line}" stroke-width="1.4" opacity=".45"/>`;
  }
  function win1(cx,cy,ww,kind,fill){
    const wh=ww*1.8,x0=cx-ww/2,x1=cx+ww/2,y0=cy-wh/2,y1=cy+wh/2;
    if(kind==='square')return `<rect x="${r1(x0)}" y="${r1(y0)}" width="${r1(ww)}" height="${r1(wh*.8)}" rx="1" fill="${fill}"/>`;
    if(kind==='slit')return `<rect x="${r1(cx-ww*.2)}" y="${r1(y0)}" width="${r1(ww*.4)}" height="${r1(wh)}" fill="${fill}"/>`;
    if(kind==='pointed')return `<path d="M${r1(x0)} ${r1(y1)}V${r1(y0+ww*.6)}Q${r1(x0)} ${r1(y0)} ${r1(cx)} ${r1(y0-ww*.35)}Q${r1(x1)} ${r1(y0)} ${r1(x1)} ${r1(y0+ww*.6)}V${r1(y1)}Z" fill="${fill}"/>`;
    if(kind==='horseshoe')return `<path d="M${r1(x0+ww*.1)} ${r1(y1)}V${r1(y0+ww*.55)}A${r1(ww*.55)} ${r1(ww*.55)} 0 1 1 ${r1(x1-ww*.1)} ${r1(y0+ww*.55)}V${r1(y1)}Z" fill="${fill}"/>`;
    return `<path d="M${r1(x0)} ${r1(y1)}V${r1(y0+ww/2)}A${r1(ww/2)} ${r1(ww/2)} 0 0 1 ${r1(x1)} ${r1(y0+ww/2)}V${r1(y1)}Z" fill="${fill}"/>`;
  }
  function windows(x,y,w,h,a,cols,rows,lit){
    const p=a.pal,ww=Math.max(4,Math.min(10,w/(cols*2.4)));let s='';
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)s+=win1(x+w*(c+.5)/cols,y+h*(r+.5)/rows,ww,a.win,lit&&((r+c)%2===0)?p.lit:p.win);
    return s;
  }
  function roof(kind,x,y,w,p,h){
    const cx=x+w/2;
    switch(kind){
      case 'cone':case 'spire':case 'slate':case 'minaret':{
        const ov=kind==='minaret'?1:4;
        let s=`<path d="M${r1(x-ov)} ${r1(y)}L${r1(cx)} ${r1(y-h)}L${r1(x+w+ov)} ${r1(y)}Z" fill="${p.roof}"/><path d="M${r1(cx)} ${r1(y-h)}L${r1(x+w+ov)} ${r1(y)}L${r1(cx)} ${r1(y)}Z" fill="${p.roofShade}" opacity=".7"/>`;
        if(kind==='slate'&&p.gold)s+=`<circle cx="${r1(cx)}" cy="${r1(y-h-3)}" r="2.6" fill="${p.gold}"/>`;
        if(kind==='spire')s+=`<line x1="${r1(cx)}" y1="${r1(y-h)}" x2="${r1(cx)}" y2="${r1(y-h-9)}" stroke="${p.roofShade}" stroke-width="1.6"/>`;
        if(kind==='minaret')s+=`<line x1="${r1(cx)}" y1="${r1(y-h)}" x2="${r1(cx)}" y2="${r1(y-h-7)}" stroke="${p.gold||'#caa24a'}" stroke-width="1.6"/>`;
        return s;}
      case 'hip':case 'tile':
        return `<path d="M${r1(x-5)} ${r1(y)}L${r1(x+w*.22)} ${r1(y-h)}L${r1(x+w*.78)} ${r1(y-h)}L${r1(x+w+5)} ${r1(y)}Z" fill="${p.roof}"/><path d="M${r1(x+w*.78)} ${r1(y-h)}L${r1(x+w+5)} ${r1(y)}L${r1(x+w*.6)} ${r1(y)}Z" fill="${p.roofShade}" opacity=".6"/>`;
      case 'pediment':
        return `<rect x="${r1(x-6)}" y="${r1(y-5)}" width="${r1(w+12)}" height="5" fill="${p.shade}"/><path d="M${r1(x-6)} ${r1(y-5)}L${r1(cx)} ${r1(y-5-h)}L${r1(x+w+6)} ${r1(y-5)}Z" fill="${p.roof}" stroke="${p.shade}" stroke-width="2"/>`;
      case 'gable':
        return `<path d="M${r1(x-9)} ${r1(y)}L${r1(cx)} ${r1(y-h)}L${r1(x+w+9)} ${r1(y)}Z" fill="${p.roof}"/><path d="M${r1(cx)} ${r1(y-h)}L${r1(x+w+9)} ${r1(y)}L${r1(cx)} ${r1(y)}Z" fill="${p.roofShade}" opacity=".6"/><path d="M${r1(cx-5)} ${r1(y-h+6)}L${r1(cx+7)} ${r1(y-h-8)}M${r1(cx+5)} ${r1(y-h+6)}L${r1(cx-7)} ${r1(y-h-8)}" stroke="${p.woodDark}" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'thatch':
        return `<path d="M${r1(x-6)} ${r1(y)}Q${r1(x+w*.12)} ${r1(y-h*.85)} ${r1(cx)} ${r1(y-h)}Q${r1(x+w*.88)} ${r1(y-h*.85)} ${r1(x+w+6)} ${r1(y)}Z" fill="${p.roof}"/><path d="M${r1(cx)} ${r1(y-h)}Q${r1(x+w*.88)} ${r1(y-h*.85)} ${r1(x+w+6)} ${r1(y)}L${r1(cx)} ${r1(y)}Z" fill="${p.roofShade}" opacity=".55"/>`;
      case 'dome':case 'lead':case 'turquoise':
        return `<path d="M${r1(x)} ${r1(y)}A${r1(w/2)} ${r1(h)} 0 0 1 ${r1(x+w)} ${r1(y)}Z" fill="${p.roof}"/><path d="M${r1(cx)} ${r1(y-h)}A${r1(w/2)} ${r1(h)} 0 0 1 ${r1(x+w)} ${r1(y)}L${r1(cx)} ${r1(y)}Z" fill="${p.roofShade}" opacity=".55"/><line x1="${r1(cx)}" y1="${r1(y-h)}" x2="${r1(cx)}" y2="${r1(y-h-9)}" stroke="${p.gold||'#caa24a'}" stroke-width="2"/><circle cx="${r1(cx)}" cy="${r1(y-h-10)}" r="2.4" fill="${p.gold||'#caa24a'}"/>`;
      case 'onion':
        return `<path d="M${r1(x+w*.06)} ${r1(y)}C${r1(x-w*.12)} ${r1(y-h*.5)} ${r1(cx-w*.3)} ${r1(y-h*.78)} ${r1(cx)} ${r1(y-h)}C${r1(cx+w*.3)} ${r1(y-h*.78)} ${r1(x+w*1.12)} ${r1(y-h*.5)} ${r1(x+w*.94)} ${r1(y)}Z" fill="${p.roof}" stroke="${p.shade}" stroke-width="1.2"/><line x1="${r1(cx)}" y1="${r1(y-h)}" x2="${r1(cx)}" y2="${r1(y-h-9)}" stroke="${p.gold}" stroke-width="2"/><circle cx="${r1(cx)}" cy="${r1(y-h-10)}" r="2.2" fill="${p.gold}"/>`;
      case 'pagoda':
        return `<path d="M${r1(x-w*.24)} ${r1(y+2)}Q${r1(x+w*.08)} ${r1(y-h*.15)} ${r1(x+w*.14)} ${r1(y-h)}L${r1(x+w*.86)} ${r1(y-h)}Q${r1(x+w*.92)} ${r1(y-h*.15)} ${r1(x+w*1.24)} ${r1(y+2)}Z" fill="${p.roof}"/><path d="M${r1(x+w*.14)} ${r1(y-h)}L${r1(x+w*.86)} ${r1(y-h)}" stroke="#fff" stroke-opacity=".25" stroke-width="1.5"/>`;
      case 'stepped':case 'crenel':case 'flat':case 'cornice':case 'tiled':case 'palisade':
        return topEdge(kind,x,y,w,p);
    }
    return '';
  }
  function topEdge(kind,x,y,w,p){
    let s='';
    if(kind==='crenel'){const n=Math.max(2,Math.round(w/12)),mw=w/(n*2-1);for(let i=0;i<n;i++)s+=`<rect x="${r1(x+i*2*mw)}" y="${r1(y-7)}" width="${r1(mw)}" height="7.5" fill="${p.wall}" stroke="${p.line}" stroke-width="1" stroke-opacity=".35"/>`;return s}
    if(kind==='stepped'){const n=Math.max(2,Math.round(w/11)),mw=w/n;for(let i=0;i<n;i++){const a=x+i*mw;s+=`<path d="M${r1(a+mw*.12)} ${r1(y)}V${r1(y-4)}H${r1(a+mw*.28)}V${r1(y-7)}H${r1(a+mw*.72)}V${r1(y-4)}H${r1(a+mw*.88)}V${r1(y)}Z" fill="${p.wall}"/>`}return s}
    if(kind==='cornice')return `<rect x="${r1(x-3)}" y="${r1(y-4)}" width="${r1(w+6)}" height="4" fill="${p.shade}"/>`;
    if(kind==='tiled')return `<path d="M${r1(x-4)} ${r1(y+1)}Q${r1(x+w/2)} ${r1(y-5)} ${r1(x+w+4)} ${r1(y+1)}L${r1(x+w)} ${r1(y-5)}H${r1(x)}Z" fill="${p.roof}"/>`;
    if(kind==='palisade'){const n=Math.max(3,Math.round(w/7));for(let i=0;i<n;i++){const a=x+i*w/n;s+=`<path d="M${r1(a)} ${r1(y)}V${r1(y-4)}L${r1(a+w/n/2)} ${r1(y-8)}L${r1(a+w/n)} ${r1(y-4)}V${r1(y)}Z" fill="${p.wood}"/>`}return s}
    return `<rect x="${r1(x-2)}" y="${r1(y-3)}" width="${r1(w+4)}" height="3" fill="${p.shade}"/>`;
  }
  function flag(x,y,color,big){const h=big?30:20;return `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(y-h)}" stroke="#3a2f28" stroke-width="1.6"/><path d="M${r1(x)} ${r1(y-h)}q${big?16:11} 3 ${big?24:17} ${big?1:0}q-8 5 0 ${big?11:8}q-${big?10:7} -2 -${big?24:17} 1z" fill="${color}"/>`}
  function tree(x,G,s,kind,p){
    s=s||1;
    if(kind==='pine')return `<rect x="${r1(x-1.5*s)}" y="${r1(G-8*s)}" width="${r1(3*s)}" height="${r1(8*s)}" fill="#5b3d24"/><path d="M${r1(x)} ${r1(G-34*s)}L${r1(x-11*s)} ${r1(G-6*s)}H${r1(x+11*s)}Z" fill="#2f5a3a"/><path d="M${r1(x)} ${r1(G-42*s)}L${r1(x-8*s)} ${r1(G-20*s)}H${r1(x+8*s)}Z" fill="#3a6c45"/>`;
    if(kind==='cypress')return `<rect x="${r1(x-1.2*s)}" y="${r1(G-6*s)}" width="${r1(2.4*s)}" height="${r1(6*s)}" fill="#5b3d24"/><ellipse cx="${r1(x)}" cy="${r1(G-22*s)}" rx="${r1(5.5*s)}" ry="${r1(19*s)}" fill="#2f5b35"/>`;
    if(kind==='palm')return `<path d="M${r1(x)} ${r1(G)}Q${r1(x+3*s)} ${r1(G-16*s)} ${r1(x+1*s)} ${r1(G-32*s)}" stroke="#7a5a3a" stroke-width="${r1(2.6*s)}" fill="none"/><path d="M${r1(x+1*s)} ${r1(G-32*s)}q-14 -2 -18 8M${r1(x+1*s)} ${r1(G-32*s)}q14 -2 18 8M${r1(x+1*s)} ${r1(G-32*s)}q-8 -10 -16 -8M${r1(x+1*s)} ${r1(G-32*s)}q8 -10 16 -8" stroke="#3d7d3f" stroke-width="${r1(3.2*s)}" fill="none" stroke-linecap="round"/>`;
    if(kind==='sakura')return `<rect x="${r1(x-1.5*s)}" y="${r1(G-12*s)}" width="${r1(3*s)}" height="${r1(12*s)}" fill="#5b3d24"/><circle cx="${r1(x-5*s)}" cy="${r1(G-17*s)}" r="${r1(8*s)}" fill="#f4b6c8"/><circle cx="${r1(x+5*s)}" cy="${r1(G-19*s)}" r="${r1(8*s)}" fill="#f7c6d4"/><circle cx="${r1(x)}" cy="${r1(G-25*s)}" r="${r1(8*s)}" fill="#f9d3de"/>`;
    if(kind==='crystal')return `<path d="M${r1(x)} ${r1(G-30*s)}L${r1(x+7*s)} ${r1(G-8*s)}L${r1(x)} ${r1(G)}L${r1(x-7*s)} ${r1(G-8*s)}Z" fill="${p.water}" opacity=".9"/><path d="M${r1(x)} ${r1(G-30*s)}L${r1(x+7*s)} ${r1(G-8*s)}L${r1(x)} ${r1(G)}Z" fill="#fff" opacity=".35"/>`;
    return `<rect x="${r1(x-1.6*s)}" y="${r1(G-10*s)}" width="${r1(3.2*s)}" height="${r1(10*s)}" fill="#5b3d24"/><circle cx="${r1(x)}" cy="${r1(G-19*s)}" r="${r1(11*s)}" fill="#4f8a3f"/><circle cx="${r1(x+4*s)}" cy="${r1(G-22*s)}" r="${r1(6*s)}" fill="#67a352"/>`;
  }
  function gate(cx,G,w,h,a){
    const p=a.pal,kind=a.win==='horseshoe'?'horseshoe':a.win==='pointed'?'pointed':'arch';
    let s='';
    if(a.sig==='iwan'){s+=`<rect x="${r1(cx-w*.85)}" y="${r1(G-h*1.45)}" width="${r1(w*1.7)}" height="${r1(h*1.45)}" fill="${p.tile}"/><rect x="${r1(cx-w*.85)}" y="${r1(G-h*1.45)}" width="${r1(w*1.7)}" height="${r1(h*1.45)}" fill="none" stroke="${p.gold}" stroke-width="2"/>`}
    const x0=cx-w/2,x1=cx+w/2,top=G-h;
    if(kind==='pointed')s+=`<path d="M${r1(x0)} ${G}V${r1(top+w*.5)}Q${r1(x0)} ${r1(top)} ${r1(cx)} ${r1(top-w*.3)}Q${r1(x1)} ${r1(top)} ${r1(x1)} ${r1(top+w*.5)}V${G}Z" fill="#3b2c22"/>`;
    else if(kind==='horseshoe')s+=`<path d="M${r1(x0+w*.08)} ${G}V${r1(top+w*.5)}A${r1(w*.56)} ${r1(w*.56)} 0 1 1 ${r1(x1-w*.08)} ${r1(top+w*.5)}V${G}Z" fill="#3b2c22"/>`;
    else s+=`<path d="M${r1(x0)} ${G}V${r1(top+w/2)}A${r1(w/2)} ${r1(w/2)} 0 0 1 ${r1(x1)} ${r1(top+w/2)}V${G}Z" fill="#3b2c22"/>`;
    return s+`<path d="M${r1(x0+3)} ${G}V${r1(top+w/2)}" stroke="${p.wood}" stroke-width="2" opacity=".6"/>`;
  }
  function tower(cx,G,w,h,a,T,lit,opts){
    const p=a.pal,x=cx-w/2,y=G-h;let s='';
    const kind=a.troof;
    if(kind==='pagoda'){
      s+=`<path d="M${r1(x-6)} ${G}L${r1(x+2)} ${r1(G-h*.35)}H${r1(x+w-2)}L${r1(x+w+6)} ${G}Z" fill="${p.stone}"/>`;
      s+=block(x+2,y,w-4,h*.65,p)+windows(x+2,y+4,w-4,h*.5,a,2,1,lit)+roof('pagoda',x+2,y,w-4,p,w*.28);
      return s;
    }
    if(kind==='minaret'){
      const mw=Math.max(8,w*.42),mx=cx-mw/2;
      s+=block(mx,y-h*.35,mw,h*1.35,p)+`<rect x="${r1(mx-3)}" y="${r1(y+h*.1)}" width="${r1(mw+6)}" height="4" fill="${p.shade}"/><rect x="${r1(mx-3)}" y="${r1(y-h*.2)}" width="${r1(mw+6)}" height="4" fill="${p.shade}"/>`+roof('minaret',mx,y-h*.35,mw,p,mw*2.2);
      return s;
    }
    s+=block(x,y,w,h,p);
    if(a.round)s+=`<ellipse cx="${r1(cx)}" cy="${r1(y)}" rx="${r1(w/2)}" ry="3" fill="${p.shade}"/>`;
    s+=windows(x,y+8,w,Math.max(20,h-26),a,1,Math.max(1,Math.min(3,Math.floor(h/42))),lit);
    if(kind==='onion'){s+=topEdge('flat',x,y,w,p)+`<rect x="${r1(x+w*.12)}" y="${r1(y-6)}" width="${r1(w*.76)}" height="6" fill="${p.wall}"/>`+roof('onion',x+w*.12,y-6,w*.76,p,w*.9);return s}
    if(kind==='dome'){s+=topEdge('flat',x,y,w,p)+roof(a.dome==='turquoise'?'turquoise':'dome',x+w*.1,y-2,w*.8,p,w*.42);return s}
    if(kind==='stepped'||a.top==='stepped'&&kind!=='cone'){return s+topEdge('stepped',x,y,w,p)}
    if(kind==='gable')return s+roof('gable',x,y,w,p,w*.75);
    const rh=kind==='spire'?w*1.7:kind==='thatch'?w*.62:kind==='hip'||kind==='tile'?w*.35:w*.95;
    if(opts&&opts.crenelOnly)return s+topEdge('crenel',x,y,w,p);
    if(kind==='slate'||kind==='cone'||kind==='spire'){s+=`<rect x="${r1(x-2)}" y="${r1(y-3)}" width="${r1(w+4)}" height="3" fill="${p.shade}"/>`}
    return s+roof(kind,x,y-3,w,p,rh);
  }
  function house(x,G,w,h,a){
    const p=a.pal;let s=block(x,G-h,w,h,p);
    s+=win1(x+w*.3,G-h*.55,Math.min(6,w*.18),a.win==='horseshoe'?'arch':a.win,p.win)+`<rect x="${r1(x+w*.6)}" y="${r1(G-h*.55)}" width="${r1(w*.2)}" height="${r1(h*.55)}" fill="#4a3526"/>`;
    const m=a.main;
    if(m==='pagoda')s+=roof('pagoda',x,G-h,w,p,h*.45);
    else if(m==='domed'){s+=topEdge(a.top==='stepped'?'stepped':'flat',x,G-h,w,p);if(w>22)s+=roof(a.dome==='onion'?'onion':a.dome==='turquoise'?'turquoise':'dome',x+w*.3,G-h-2,w*.4,p,w*.22)}
    else if(m==='hall')s+=roof('gable',x,G-h,w,p,h*.7);
    else if(a.troof==='stepped')s+=topEdge('stepped',x,G-h,w,p);
    else if(a.troof==='thatch')s+=roof('thatch',x,G-h,w,p,h*.7);
    else s+=roof(m==='temple'?'tile':'hip',x,G-h,w,p,h*.55);
    return s;
  }

  /* ---------------- 3. BÂTIMENT PRINCIPAL PAR ARCHITECTURE ---------------- */
  function mainBuilding(a,cx,G,T,lit){
    const p=a.pal,kw=52+T*7,kh=58+T*13;let s='';
    if(a.main==='temple'){
      const w=kw*1.55,h=kh*.62,x=cx-w/2,base=G;
      if(a.sig==='acropolis'&&T>=5){ } // la colline est dessinée plus bas
      s+=`<rect x="${r1(x-10)}" y="${r1(base-6)}" width="${r1(w+20)}" height="6" fill="${p.shade}"/><rect x="${r1(x-5)}" y="${r1(base-11)}" width="${r1(w+10)}" height="5" fill="${p.wall}"/>`;
      const n=4+2*Math.min(3,Math.floor(T/2)),cw=w/(n*2-1);
      s+=`<rect x="${r1(x)}" y="${r1(base-11-h)}" width="${r1(w)}" height="${r1(h)}" fill="${p.shade}" opacity=".55"/>`;
      for(let i=0;i<n;i++)s+=`<rect x="${r1(x+i*2*cw)}" y="${r1(base-11-h)}" width="${r1(cw)}" height="${r1(h)}" fill="${p.wall}"/><line x1="${r1(x+i*2*cw+cw*.5)}" x2="${r1(x+i*2*cw+cw*.5)}" y1="${r1(base-11-h)}" y2="${r1(base-11)}" stroke="${p.shade}" stroke-width="1"/>`;
      if(lit)s+=`<rect x="${r1(cx-cw)}" y="${r1(base-11-h*.7)}" width="${r1(cw*2)}" height="${r1(h*.7)}" fill="${p.lit}" opacity=".55"/>`;
      s+=`<rect x="${r1(x-4)}" y="${r1(base-11-h-9)}" width="${r1(w+8)}" height="9" fill="${p.wall}" stroke="${p.shade}" stroke-width="1.4"/>`;
      s+=roof(a.troof==='tile'?'pediment':'pediment',x,base-11-h-9,w,a.troof==='tile'?Object.assign({},p,{roof:p.roof}):p,h*.42);
      return {svg:s,top:base-11-h-9-h*.42,w};
    }
    if(a.main==='domed'){
      const w=kw*1.45,h=kh*.58,x=cx-w/2;
      s+=block(x,G-h,w,h,p)+windows(x+6,G-h+6,w-12,h-18,a,Math.min(6,3+Math.floor(T/3)),h>70?2:1,lit)+topEdge(a.top==='stepped'?'stepped':'flat',x,G-h,w,p);
      const dw=w*.62,dh=dw*(a.dome==='onion'?.95:.5),dx=cx-dw/2,drumH=8+T*1.2;
      s+=`<rect x="${r1(dx+dw*.06)}" y="${r1(G-h-drumH)}" width="${r1(dw*.88)}" height="${r1(drumH)}" fill="${p.wall}" stroke="${p.line}" stroke-opacity=".3"/>`;
      for(let i=0;i<5;i++)s+=win1(dx+dw*(.2+i*.15),G-h-drumH/2,3,'arch',p.win);
      s+=roof(a.dome==='onion'?'onion':a.dome==='turquoise'?'turquoise':'dome',dx,G-h-drumH,dw,p,dh);
      if(a.sig==='iwan'&&T>=2)s+=gate(cx,G,Math.max(16,w*.16),h*.62,a);
      else s+=gate(cx,G,Math.max(14,w*.13),h*.5,a);
      return {svg:s,top:G-h-drumH-dh-10,w};
    }
    if(a.main==='pagoda'){
      const tiers=Math.min(5,1+Math.floor((T+1)/2)),bw=kw*1.25,baseH=16+T*2.2;let y=G-baseH,w=bw;
      s+=`<path d="M${r1(cx-bw/2-14)} ${G}L${r1(cx-bw/2+2)} ${r1(y)}H${r1(cx+bw/2-2)}L${r1(cx+bw/2+14)} ${G}Z" fill="${p.stone}"/>`;
      for(let i=0;i<5;i++)s+=`<line x1="${r1(cx-bw/2-12+i*3)}" x2="${r1(cx+bw/2+12-i*3)}" y1="${r1(G-i*baseH/5)}" y2="${r1(G-i*baseH/5)}" stroke="#6f6b61" stroke-width="1" opacity=".5"/>`;
      for(let t=0;t<tiers;t++){
        const th=20+T*1.6-t*1.5,x=cx-w/2;
        s+=block(x,y-th,w,th,p)+windows(x+4,y-th+3,w-8,th-6,a,Math.max(2,Math.round(w/18)),1,lit&&t===0);
        s+=roof('pagoda',x,y-th,w,p,9+T*.5);
        y=y-th-9-T*.5+3;w=w*.8;
      }
      s+=`<path d="M${r1(cx-w*.35)} ${r1(y-1)}l-3 -6M${r1(cx+w*.35)} ${r1(y-1)}l3 -6" stroke="${p.gold}" stroke-width="2.4" stroke-linecap="round"/>`;
      return {svg:s,top:y-10,w:bw};
    }
    if(a.main==='hall'){
      const w=kw*1.7,h=kh*.42,x=cx-w/2;
      s+=`<rect x="${r1(x-4)}" y="${r1(G-8)}" width="${r1(w+8)}" height="8" fill="${p.stone}"/>`;
      s+=block(x,G-h,w,h-6,p);
      for(let i=1;i<8;i++)s+=`<line x1="${r1(x+w*i/8)}" x2="${r1(x+w*i/8)}" y1="${r1(G-h)}" y2="${r1(G-8)}" stroke="${p.woodDark}" stroke-width="1.2" opacity=".6"/>`;
      s+=`<path d="M${r1(x-12)} ${r1(G-h+2)}Q${r1(cx)} ${r1(G-h-kh*.55)} ${r1(x+w+12)} ${r1(G-h+2)}Z" fill="${p.roof}"/><path d="M${r1(cx)} ${r1(G-h-kh*.42)}Q${r1(x+w*.8)} ${r1(G-h-kh*.3)} ${r1(x+w+12)} ${r1(G-h+2)}L${r1(cx)} ${r1(G-h+2)}Z" fill="${p.roofShade}" opacity=".55"/>`;
      s+=`<path d="M${r1(x-12)} ${r1(G-h+2)}q-8 -10 -2 -18M${r1(x+w+12)} ${r1(G-h+2)}q8 -10 2 -18" stroke="${p.woodDark}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      s+=gate(cx,G-6,14,20,a);
      if(lit)s+=`<rect x="${r1(cx-30)}" y="${r1(G-h+8)}" width="6" height="8" fill="${p.lit}"/><rect x="${r1(cx+24)}" y="${r1(G-h+8)}" width="6" height="8" fill="${p.lit}"/>`;
      let top=G-h-kh*.42;
      if(T>=4){ // église en bois debout (stavkirke) au centre
        const sw=34+T*2;let y=G-h-kh*.3;
        for(let t=0;t<3;t++){const ww=sw*(1-t*.22),x0=cx-ww/2;s+=block(x0,y-18,ww,18,p)+roof('gable',x0,y-18,ww,p,14);y-=24}
        top=y-10;
      }
      return {svg:s,top,w};
    }
    // tour / donjon (médiéval, occidental, gothique, celtique, renaissance, andalou, fantasy)
    const x=cx-kw/2;
    s+=block(x,G-kh,kw,kh,p);
    if(a.round)s+=`<ellipse cx="${r1(cx)}" cy="${r1(G-kh)}" rx="${r1(kw/2)}" ry="4" fill="${p.shade}"/>`;
    s+=windows(x+6,G-kh+10,kw-12,kh-38,a,kw>80?3:2,Math.max(1,Math.min(4,Math.floor(kh/45))),lit);
    s+=gate(cx,G,Math.max(14,kw*.24),Math.max(20,kh*.26),a);
    let top=G-kh;
    if(a.troof==='stepped'){s+=topEdge('stepped',x,G-kh,kw,p);top-=10}
    else if(a.troof==='hip'){s+=topEdge('cornice',x,G-kh,kw,p)+roof('hip',x,G-kh-4,kw,p,kw*.32);top-=kw*.32+6}
    else{
      const rh=a.troof==='spire'?kw*1.35:a.troof==='thatch'?kw*.6:kw*.72;
      if(a.troof!=='thatch')s+=topEdge('crenel',x,G-kh,kw,p);
      const rw=kw*(a.troof==='thatch'?1:.72),rx=cx-rw/2;
      if(a.troof!=='thatch')s+=block(rx,G-kh-14,rw,14,p);
      s+=roof(a.troof,rx,a.troof==='thatch'?G-kh:G-kh-14,rw,p,rh);
      top=G-kh-14-rh;
    }
    return {svg:s,top,w:kw};
  }

  /* ---------------- 4. ÉLÉMENTS SIGNATURE ---------------- */
  function signature(a,cx,G,T,kw,kh,lit){
    const p=a.pal;let s='';
    switch(a.sig){
      case 'bergfried':s+=tower(cx-kw*.62,G-10,20+T,kh*1.08,a,T,lit)+tower(cx+kw*.62,G-10,20+T,kh*.98,a,T,lit);break;
      case 'pavilion':{const w=kw*2.2,h=kh*.5;s+=block(cx-w/2,G-h-8,w,h,p)+windows(cx-w/2+6,G-h,w-12,h-16,a,8,2,lit)+roof('slate',cx-w/2,G-h-8,w,p,h*.5);break}
      case 'rotunda':{const w=kw*1.3,h=kh*.42;s+=block(cx-w/2,G-kh*.55-h,w,h,p)+roof('dome',cx-w/2,G-kh*.55-h,w,Object.assign({},p,{roof:'#d8ccb2',roofShade:'#b3a584'}),w*.42);break}
      case 'acropolis':break;
      case 'domes':s+=tower(cx-kw*1.05,G-6,22+T,kh*.55,Object.assign({},a,{troof:'dome'}),T,lit)+tower(cx+kw*1.05,G-6,22+T,kh*.55,Object.assign({},a,{troof:'dome'}),T,lit);break;
      case 'minarets':{const n=T>=6?2:1;for(let i=0;i<n;i++){const off=kw*(.95+i*.5);s+=tower(cx-off,G,16,kh*(1.05-i*.12),a,T,lit)+tower(cx+off,G,16,kh*(1.05-i*.12),a,T,lit)}break}
      case 'chhatri':for(const d of [-1,1]){const x=cx+d*kw*.95-12;s+=block(x,G-kh*.72,24,kh*.72,p)+roof('onion',x+2,G-kh*.72,20,p,20)}break;
      case 'patio':{const w=kw*2.1,h=kh*.45;s+=block(cx-w/2,G-h,w,h,p)+windows(cx-w/2+6,G-h+6,w-12,h-12,a,7,1,lit)+roof('hip',cx-w/2,G-h,w,p,11);break}
      case 'stave':break;
      case 'stones':for(let i=0;i<5;i++){const x=cx-kw*1.45+i*9;s+=`<rect x="${r1(x)}" y="${r1(G-12-(i%2)*4)}" width="6" height="${12+(i%2)*4}" rx="2" fill="#8b877a"/>`}
        s+=tower(cx-kw*.75,G-6,26+T,kh*.8,a,T,lit)+tower(cx+kw*.75,G-6,26+T,kh*.72,a,T,lit);break;
      case 'duomo':{const w=kw*1.1,y=G-kh*.6;s+=block(cx-w/2+kw*.9,y-24,w*.8,24,p)+`<path d="M${r1(cx+kw*.9-w*.1)} ${r1(y-24)}A${r1(w*.4)} ${r1(w*.5)} 0 0 1 ${r1(cx+kw*.9+w*.7)} ${r1(y-24)}Z" fill="${p.roof}"/><path d="M${r1(cx+kw*.9+w*.3)} ${r1(y-24-w*.5)}V${r1(y-24)}M${r1(cx+kw*.9+w*.1)} ${r1(y-24-w*.42)}Q${r1(cx+kw*.9+w*.05)} ${r1(y-30)} ${r1(cx+kw*.9)} ${r1(y-24)}" stroke="#fff" stroke-width="1.6" opacity=".7"/>`;
        s+=tower(cx-kw*.95,G-6,18,kh*1.05,Object.assign({},a,{troof:'hip'}),T,lit);break}
      case 'cathedral':{const w=kw*1.6,h=kh*.62;s+=block(cx-w/2,G-h-8,w,h,p)+`<circle cx="${r1(cx)}" cy="${r1(G-h+14)}" r="${r1(8+T*.6)}" fill="${lit?p.lit:'#5a4b6b'}" stroke="${p.shade}" stroke-width="2"/>`;
        s+=tower(cx-w/2+10,G-8,22+T,kh*1.12,a,T,lit)+tower(cx+w/2-10,G-8,22+T,kh*1.12,a,T,lit);break}
      case 'torii':break;
      case 'iwan':s+=tower(cx-kw*1.05,G,14,kh*.95,Object.assign({},a,{troof:'minaret'}),T,lit)+tower(cx+kw*1.05,G,14,kh*.95,Object.assign({},a,{troof:'minaret'}),T,lit);break;
      case 'floating':break;
    }
    return s;
  }

  /* ---------------- 5. COMPOSITION : 50 NIVEAUX ---------------- */
  function illusStage(styleKey,level){const il=window.CASTELLUM_ILLUS&&window.CASTELLUM_ILLUS[styleKey];if(!il)return null;const lv=Math.max(1,Math.min(50,Number(level)||1));let i=0;il.from.forEach((f,ix)=>{if(lv>=f)i=ix});return {i,...il.stages[i]}}
  function royaumeSVG(styleKey,level,label){
    if(window.KingdomWorld)return window.KingdomWorld(styleKey,level,{label});
    const ist=illusStage(styleKey,level);
    if(ist)return `<img class="royaume-img" src="${ist.img}" alt="${esc(label||ist.n)}" decoding="async">`;
    const a=archOf(styleKey),p=a.pal,lv=Math.max(1,Math.min(50,Number(level)||1)),T=Math.floor((lv-1)/5),sub=(lv-1)%5,G=288,cx=300,u='rv'+(++SVG_UID);
    const lit=sub>=4||T>=9,treesN=Math.min(6,1+sub+Math.floor(T/3));
    let bg='',back='',mid='',front='',fx='';
    // ciel, soleil, nuages, collines
    bg+=`<defs><linearGradient id="${u}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ground[0]}"/><stop offset="1" stop-color="${p.ground[1]}"/></linearGradient></defs>`;
    bg+=`<rect width="600" height="340" fill="url(#${u}s)"/><circle cx="505" cy="62" r="30" fill="${p.sun}" opacity=".95"/>`;
    bg+=`<g fill="#fff" opacity=".8"><ellipse cx="110" cy="62" rx="40" ry="11"/><ellipse cx="138" cy="54" rx="24" ry="11"/><ellipse cx="400" cy="92" rx="30" ry="8"/></g>`;
    bg+=`<path d="M0 238Q90 190 180 226T360 214T600 222V340H0Z" fill="${p.hill}"/><path d="M0 262Q120 226 250 252T600 246V340H0Z" fill="${p.hill2}"/>`;
    if(a.sig==='acropolis'&&T>=4)bg+=`<path d="M150 ${G}Q170 ${G-38} 220 ${G-44}H380Q430 ${G-38} 450 ${G}Z" fill="#b9ab88"/><path d="M220 ${G-44}H380L372 ${G-36}H228Z" fill="#cfc2a0"/>`;
    bg+=`<rect y="${G-2}" width="600" height="${342-G}" fill="url(#${u}g)"/>`;
    bg+=`<path d="M${cx-14} ${G}L${cx-40} 340H${cx+40}L${cx+14} ${G}Z" fill="${p.road}" opacity=".85"/>`;
    const GG=(a.sig==='acropolis'&&T>=4)?G-44:G;

    if(T===0){
      // Fondations : campement + palissade qui grandit
      const tents=[[cx-38,1],[cx+30,.85],[cx-92,.75],[cx+86,.7]].slice(0,1+Math.min(3,sub));
      mid+=`<ellipse cx="${cx}" cy="${G+2}" rx="130" ry="7" fill="#000" opacity=".08"/>`;
      tents.forEach(([x,s])=>{mid+=`<path d="M${r1(x-26*s)} ${G}L${r1(x)} ${r1(G-38*s)}L${r1(x+26*s)} ${G}Z" fill="${p.cloth}"/><path d="M${r1(x)} ${r1(G-38*s)}L${r1(x+26*s)} ${G}H${r1(x)}Z" fill="${p.shade}" opacity=".5"/><path d="M${r1(x-6*s)} ${G}L${r1(x)} ${r1(G-16*s)}L${r1(x+6*s)} ${G}Z" fill="#3b2c22"/>`});
      mid+=`<path d="M${cx-8} ${G}l8 -10l8 10z" fill="#e8812f"/><path d="M${cx-4} ${G}l4 -6l4 6z" fill="#ffd36b"/>`;
      const half=60+sub*22;
      front+=topEdge('palisade',cx-half,G-2,half-22,p)+`<rect x="${cx-half}" y="${G-6}" width="${half-22}" height="6" fill="${p.wood}"/>`;
      front+=topEdge('palisade',cx+22,G-2,half-22,p)+`<rect x="${cx+22}" y="${G-6}" width="${half-22}" height="6" fill="${p.wood}"/>`;
      if(sub>=2){const x=cx+half-6;front+=`<rect x="${x-9}" y="${G-54}" width="18" height="54" fill="${p.wood}"/><rect x="${x-12}" y="${G-58}" width="24" height="7" fill="${p.woodDark}"/>`+roof(a.troof==='pagoda'?'pagoda':a.troof==='dome'||a.troof==='onion'||a.troof==='minaret'?'hip':a.troof==='stepped'?'hip':'cone',x-12,G-58,24,p,14)}
      if(sub>=1)fx+=flag(cx-38,G-38,p.flag,false);
    }else{
      const kw=52+T*7,kh=58+T*13;
      // arrière-plan : deuxième enceinte et ville
      if(T>=8){back+=`<rect x="70" y="${G-78}" width="460" height="40" fill="${p.wall}" opacity=".75"/>`+topEdge(a.top==='stepped'?'stepped':a.top==='tiled'?'tiled':'crenel',70,G-78,460,p);for(const x of [70,200,400,530])back+=`<g opacity=".85">${tower(x,G-38,24,70,a,T,lit)}</g>`}
      if(T>=6){for(let i=0;i<7;i++){const x=90+i*65+(i%2)*10;back+=`<g opacity=".7">${house(x,G-24,30,26+(i%3)*6,a)}</g>`}}
      if(a.sig==='floating'&&T>=3){const y=90-T*2;back+=`<path d="M430 ${y}Q470 ${y-6} 510 ${y}L470 ${y+36}Z" fill="#6d5aa8"/>`+tower(470,y,18,26+T*2,a,T,lit);for(let i=0;i<Math.min(5,T-2);i++)back+=`<path d="M${80+i*40} ${80+(i%2)*26}l6 12l-6 12l-6 -12z" fill="${p.water}" opacity=".85"/>`}
      if(a.sig==='torii'&&T>=3)front+=`<g transform="translate(${cx-150} 0)"><rect x="-16" y="${G-40}" width="4" height="40" fill="#be2f36"/><rect x="12" y="${G-40}" width="4" height="40" fill="#be2f36"/><path d="M-24 ${G-44}Q0 ${G-49} 24 ${G-44}V${G-39}H-24Z" fill="#be2f36"/><rect x="-18" y="${G-34}" width="36" height="3" fill="#be2f36"/></g>`;
      if(T>=4)mid+=signature(a,cx,GG,T,kw,kh,lit);
      // ailes du palais
      if(T>=4&&a.main!=='temple'&&a.main!=='hall'){const w=kw+70+T*6,h=kh*.45;mid+=block(cx-w/2,GG-h,w,h,p)+windows(cx-w/2+6,GG-h+6,w-12,h-14,a,Math.round(w/22),1,lit)+(a.main==='pagoda'?roof('pagoda',cx-w/2,GG-h,w,p,10):a.top==='stepped'?topEdge('stepped',cx-w/2,GG-h,w,p):a.main==='domed'?topEdge('flat',cx-w/2,GG-h,w,p):roof(a.troof==='thatch'?'thatch':'hip',cx-w/2,GG-h,w,p,14))}
      const mb=mainBuilding(a,cx,GG,T,lit);mid+=mb.svg;
      if(T>=1&&sub>=1)fx+=flag(cx,mb.top+2,p.flag,T>=5);
      // tours et remparts
      const offs=[];if(T>=3)offs.push(Math.max(kw,mb.w)/2+32);if(T>=5)offs.push(offs[0]+72);if(T>=7)offs.push(offs[0]+140);
      if(T>=2){
        const span=offs.length?Math.min(250,offs[offs.length-1]):Math.max(kw,mb.w)/2+40,wh=26+T*3.2,wall=T<=2&&(a.main==='hall')?p.wood:null;
        const wx=cx-span,ww=span*2;
        front+=`<rect x="${r1(wx)}" y="${r1(G-wh)}" width="${r1(ww)}" height="${r1(wh)}" fill="${wall||p.wall}"/><rect x="${r1(wx)}" y="${r1(G-wh)}" width="${r1(ww)}" height="${r1(wh)}" fill="${p.shade}" opacity=".18"/>`;
        for(let yy=G-wh+10;yy<G-3;yy+=10)front+=`<line x1="${r1(wx)}" x2="${r1(wx+ww)}" y1="${r1(yy)}" y2="${r1(yy)}" stroke="${p.line}" opacity=".1"/>`;
        front+=topEdge(a.main==='hall'&&T<5?'palisade':a.top==='tiled'?'tiled':a.top==='stepped'?'stepped':a.top==='flat'||a.top==='cornice'?'crenel':'crenel',wx,G-wh,ww,p);
        if(sub>=3)for(const d of [-1,1])front+=`<rect x="${r1(cx+d*span*.55-5)}" y="${r1(G-wh+2)}" width="10" height="${r1(wh*.6)}" fill="${p.flag}"/><path d="M${r1(cx+d*span*.55-5)} ${r1(G-wh+2+wh*.6)}l5 5l5 -5z" fill="${p.flag}"/>`;
        front+=gate(cx,G,22+T,24+T*2.4,a)+`<rect x="${cx-15-T/2}" y="${r1(G-26-T*2.4-4)}" width="${30+T}" height="4" fill="${p.shade}"/>`;
        offs.forEach((o,i)=>{const tw=30+T*1.4-i*3,th=wh+34+T*4-i*12;front+=tower(cx-o,G,tw,th,a,T,lit)+tower(cx+o,G,tw,th,a,T,lit)});
        if(T>=5&&sub>=2&&offs.length)fx+=flag(cx-offs[0],G-(wh+34+T*4)-(a.troof==='spire'?60:30),p.flag,false)+flag(cx+offs[0],G-(wh+34+T*4)-(a.troof==='spire'?60:30),p.flag,false);
      }else{
        // niveaux 6 à 10 : palissade autour du premier bâtiment
        const half=Math.max(kw,mb.w)/2+34;
        front+=topEdge('palisade',cx-half,G-2,half-16,p)+`<rect x="${cx-half}" y="${G-6}" width="${half-16}" height="6" fill="${p.wood}"/>`+topEdge('palisade',cx+16,G-2,half-16,p)+`<rect x="${cx+16}" y="${G-6}" width="${half-16}" height="6" fill="${p.wood}"/>`;
      }
      // douves et pont
      if(T>=7){front+=`<path d="M40 ${G+10}Q300 ${G+2} 560 ${G+10}L560 ${G+20}Q300 ${G+12} 40 ${G+20}Z" fill="${p.water}" opacity=".85"/><rect x="${cx-18}" y="${G+2}" width="36" height="22" fill="${p.road}"/><rect x="${cx-20}" y="${G+2}" width="40" height="3" fill="${p.shade}"/>`}
      // maisons devant les remparts
      if(T>=6){const n=T>=8?4:2;for(let i=0;i<n;i++){const x=i%2?545-Math.floor(i/2)*38:25+Math.floor(i/2)*38;front+=house(x,G+2,30,24,a)}}
      if(T>=9)fx+=`<path d="M${cx-10} ${r1(mb.top-24)}l5 6 5 -9 5 9 5 -6 -2 11h-16z" fill="${p.gold||'#f1bd49'}"/>`;
    }
    // arbres : un de plus à chaque niveau
    const spots=[[18,1.05],[582,1],[60,.9],[540,.9],[120,.8],[478,.8]];
    // Caméra : les premiers niveaux sont cadrés de plus près pour remplir l'image.
    const zoom=[2.4,1.9,1.5,1.25,1.1][T]||1;
    let trees='';for(let i=0;i<treesN;i++)trees+=tree(spots[i][0],G+4,spots[i][1]*Math.min(1.35,zoom),a.tree,p);
    const title=label||`${CASTLE_STYLE_DATA[styleKey]?.name||''} · niveau ${lv}`;
    return `<svg class="royaume-svg" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}">${bg}<g transform="translate(${cx} ${G}) scale(${zoom}) translate(${-cx} ${-G})">${back}${mid}${front}${fx}</g>${trees}</svg>`;
  }
  window.royaumeSVG=royaumeSVG;

  /* ---------------- 6. TITRES : MASCULIN / FÉMININ / NEUTRE ---------------- */
  const RANK_XP=[0,170,730,1830,3640,5940,8690,11840,16020,20000];
  const RANKS={
    m:['Voyageur','Écuyer','Seigneur','Baron','Comte','Duc','Prince','Roi','Empereur','Souverain de Castellum'],
    f:['Voyageuse','Écuyère','Dame','Baronne','Comtesse','Duchesse','Princesse','Reine','Impératrice','Souveraine de Castellum'],
    n:['Voyageur·se','Écuyer·ère','Noble','Baron·ne','Comte·sse','Duc·hesse','Altesse','Monarque','Majesté impériale','Souverain·e de Castellum']
  };
  function titleForm(){return ['m','f','n'].includes(S.titleForm)?S.titleForm:null}
  function rankIndex(xp){let r=0;RANK_XP.forEach((need,i)=>{if(xp>=need)r=i});return r}
  function rankName(xp,form){const i=rankIndex(xp),f=form||titleForm();return f?RANKS[f][i]:`${RANKS.m[i]} / ${RANKS.f[i]}`}
  function totalXP(){const c=(typeof Cloud!=='undefined'&&Cloud?.profile?.total_xp!=null)?Number(Cloud.profile.total_xp):0;return Math.max(0,Number(S.xp||0),c||0)}
  window.castellumTitle=()=>rankName(totalXP());
  function titleChooserHTML(){
    const xp=totalXP(),i=rankIndex(xp),cur=titleForm();
    const opt=(f,lab)=>`<button type="button" class="royaume-title-btn ${cur===f?'on':''}" data-title-form="${f}" aria-pressed="${cur===f}">${esc(RANKS[f][7])}<small>${lab}</small></button>`;
    return `<div class="royaume-titles"><div class="royaume-titles-row">${opt('m','Masculin')}${opt('f','Féminin')}${opt('n','Neutre')}</div><small class="muted">Titre actuel : <b>${esc(rankName(xp))}</b></small></div>`;
  }

  /* ---------------- 7. CARTE DU DOMAINE ---------------- */
  const REPRESENTATIVE_LEVEL=44;
  function styleCardsHTML(attr,selected){
    return Object.entries(CASTLE_STYLE_DATA).sort((a,b)=>(window.CASTELLUM_ILLUS?.[b[0]]?1:0)-(window.CASTELLUM_ILLUS?.[a[0]]?1:0)).map(([k,v])=>`<button type="button" class="royaume-card ${k===selected?'on':''}" ${attr}="${k}" aria-pressed="${k===selected}"><span class="rc-art">${royaumeSVG(k,REPRESENTATIVE_LEVEL,v.name)}</span><span class="rc-copy"><b>${v.icon} ${esc(v.name)}</b><small>${esc(v.motto)}</small><span class="rc-state">${k===selected?'✓ Ton architecture':'Choisir'}</span></span></button>`).join('');
  }
  function currentKey(){return (S.castleStyle&&CASTLE_STYLE_DATA[S.castleStyle])?S.castleStyle:'medieval'}
  if(typeof castleProgressCard==='function'){
    const prevCard=castleProgressCard;
    castleProgressCard=function(){
      let html=prevCard.apply(this,arguments);
      const d=window.CastellumDomain50?.progress?.();
      const level=d?.level||1,key=currentKey();
      html=html.replace(/(<div class="domain50-hero-art">)[\s\S]*?<\/svg>(<\/div>)/,(m,a,b)=>a+royaumeSVG(key,level,`${CASTLE_STYLE_DATA[key].name} · niveau ${level}`)+b);
      html=html.replace(/<span class="domain50-rank">[\s\S]*?<\/span>/,`<button type="button" class="domain50-rank domain50-rank-btn" data-domain-open="styles" aria-label="Changer mon titre">🎖️ ${esc(rankName(totalXP()))}</button>`);
      return html;
    };
  }

  // Bandeau compact du royaume en haut du parcours (visible aussi sans compte).
  function royaumeBanner(){
    const d=window.CastellumDomain50?.progress?.();if(!d)return '';
    const key=currentKey(),names=window.CastellumDomain50.names||[];
    const rest=d.next==null?0:Math.max(0,d.next-d.xp);
    return `<button type="button" class="royaume-banner" data-domain-open="timeline" aria-label="Voir l'évolution de mon royaume"><span class="rb-art">${royaumeSVG(key,d.level,`${CASTLE_STYLE_DATA[key].name} · niveau ${d.level}`)}</span><span class="rb-copy"><small>🏰 Mon royaume · niveau ${d.level}/50</small><b>${esc(d.name)}</b><span class="rb-bar"><i style="width:${d.pct}%"></i></span><small>${d.next?`Encore ${rest.toLocaleString('fr-FR')} XP → ${esc(names[d.ix+1]||'')}`:'Prestige maximal atteint 👑'}</small></span></button>`;
  }
  if(typeof pathView==='function'){
    const prevPath=pathView;
    pathView=function(){
      const html=prevPath.apply(this,arguments);
      if(typeof html!=='string')return html;
      let b='';try{b=royaumeBanner()}catch(e){console.warn('royaume banner',e)}
      return b+html;
    };
  }

  /* ---------------- 8. FENÊTRES : ARCHITECTURES + ÉVOLUTION ---------------- */
  function enhanceModal(m){
    if(!m||m.hidden)return;
    const grid=m.querySelector('.domain50-style-grid');
    if(grid&&!grid.dataset.royaume){
      grid.dataset.royaume='1';grid.classList.add('royaume-grid');
      grid.innerHTML=styleCardsHTML('data-domain-style',currentKey());
      grid.insertAdjacentHTML('beforebegin',`<div class="royaume-modal-section" data-royaume-titles><h3>👑 Ton titre</h3><small class="muted">Choisis comment ton titre s'affiche dans le royaume.</small>${titleChooserHTML()}</div><div class="royaume-modal-section"><h3>🏰 Ton architecture</h3><small class="muted">Aperçu au niveau ${REPRESENTATIVE_LEVEL}. Ton château garde ce style du niveau 1 au niveau 50.</small></div>`);
    }
    const tl=m.querySelector('.domain50-timeline');
    if(tl&&!m.querySelector('.royaume-evo')){
      const d=window.CastellumDomain50?.progress?.()||{level:1},key=currentKey(),names=window.CastellumDomain50?.names||[];
      const curT=Math.floor((d.level-1)/5),il=window.CASTELLUM_ILLUS?.[key];
      if(il){const cs=illusStage(key,d.level).i;const its=il.stages.map((st,i)=>{const state=i<cs?'done':i===cs?'current':'locked',to=il.from[i+1]?il.from[i+1]-1:50;return `<div class="royaume-evo-item ${state}"><span class="rc-art"><img class="royaume-img" src="${st.img}" alt="${esc(st.n)}"></span><em>${state==='locked'?'🔒 ':state==='current'?'⚒️ ':'✓ '}Niv. ${il.from[i]}–${to}</em><span>${esc(st.n)}<br><small class="muted">${esc(st.d)}</small></span></div>`}).join('');
        tl.insertAdjacentHTML('beforebegin',`<div class="royaume-evo"><h3>${il.stages.length>1?`Les ${il.stages.length} grandes étapes`:'Ton royaume'} · ${esc(CASTLE_STYLE_DATA[key].name)}</h3><div class="royaume-evo-strip">${its}</div></div>`);
        setTimeout(()=>{const dlg=m.querySelector('.domain50-dialog');if(dlg)dlg.scrollTop=0},120);return}
      const items=Array.from({length:10},(_,t)=>{const lv=t*5+1,state=t<curT?'done':t===curT?'current':'locked';return `<div class="royaume-evo-item ${state}"><span class="rc-art">${royaumeSVG(key,t===curT?d.level:lv+4,names[lv-1]||'')}</span><em>${state==='locked'?'🔒 ':state==='current'?'⚒️ ':'✓ '}Niv. ${lv}</em><span>${esc(names[lv-1]||('Étape '+(t+1)))}</span></div>`}).join('');
      tl.insertAdjacentHTML('beforebegin',`<div class="royaume-evo"><h3>Les 10 grandes transformations · ${esc(CASTLE_STYLE_DATA[key].name)}</h3><div class="royaume-evo-strip">${items}</div></div>`);
      setTimeout(()=>{const dlg=m.querySelector('.domain50-dialog'),strip=m.querySelector('.royaume-evo-strip'),cur=m.querySelector('.royaume-evo-item.current');if(dlg)dlg.scrollTop=0;if(strip&&cur)strip.scrollLeft=Math.max(0,cur.offsetLeft-strip.offsetLeft-(strip.clientWidth-cur.clientWidth)/2)},120);
    }
  }
  let modalObs=null;
  function watchModal(){const m=document.getElementById('domain50Modal');if(!m||modalObs)return;modalObs=new MutationObserver(()=>enhanceModal(m));modalObs.observe(m,{childList:true,attributes:true,attributeFilter:['hidden','style']});enhanceModal(m)}
  new MutationObserver(watchModal).observe(document.body,{childList:true});
  watchModal();

  document.addEventListener('click',function(e){
    const t=e.target.closest?.('[data-title-form]');if(!t)return;
    e.preventDefault();S.titleForm=t.dataset.titleForm;save();
    document.querySelectorAll('[data-royaume-titles] .royaume-titles, [data-royaume-welcome-titles] .royaume-titles').forEach(el=>{el.outerHTML=titleChooserHTML()});
    toast(`👑 Titre : ${rankName(totalXP())}`);
    if(!document.getElementById('welcomeRoot')?.innerHTML)render();
  },true);

  /* ---------------- 9. ACCUEIL : ÉTAPE « ROYAUME » ---------------- */
  if(typeof stepper==='function')stepper=function(n){return `<div class="stepper">${["Langue","Niveau","Royaume","C'est parti"].map((t,i)=>`<span class="${i<n?"done":i===n?"on":""}"><b>${i<n?"✓":i+1}</b>${t}</span>`).join('<i></i>')}</div>`};
  function royaumeWelcome(){
    const w=document.getElementById('welcomeRoot');if(!w)return false;
    const key=currentKey(),st=CASTLE_STYLE_DATA[key];
    w.innerHTML=`<div class="welcome"><div class="welcome-in wide">${stepper(2)}
      <div><h1 style="margin:0 0 6px">Fonde ton royaume</h1><p class="muted" style="margin:0">Chaque leçon fait grandir ton domaine : d'un simple campement jusqu'à une capitale légendaire. Choisis son architecture.</p></div>
      <figure class="royaume-welcome-hero" style="margin:0"><span class="rc-art">${royaumeSVG(key,REPRESENTATIVE_LEVEL,st.name)}</span><figcaption><b>${st.icon} ${esc(st.name)}</b>Aujourd'hui : un campement · Demain : ${esc(st.stages[st.stages.length-1])}</figcaption></figure>
      <div class="royaume-grid">${styleCardsHTML('data-royaume-style',key)}</div>
      <div class="royaume-modal-section" data-royaume-welcome-titles style="padding:0"><h3>👑 Ton titre</h3>${titleChooserHTML()}</div>
      <button class="btn royaume-go" type="button" data-royaume-go>🏰 Fonder mon royaume</button>
    </div></div>`;
    return true;
  }
  if(typeof finishWelcome==='function'){
    const prevFinish=finishWelcome;
    finishWelcome=function(){
      if(!S.royaumeChosen&&!(Number(S.xp)>0)&&royaumeWelcome())return;
      return prevFinish.apply(this,arguments);
    };
    document.addEventListener('click',function(e){
      const s=e.target.closest?.('[data-royaume-style]');
      if(s){e.preventDefault();e.stopImmediatePropagation();const k=s.dataset.royaumeStyle;if(!CASTLE_STYLE_DATA[k])return;S.castleStyle=k;save();const y=document.querySelector('.welcome')?.scrollTop||0;royaumeWelcome();const wl=document.querySelector('.welcome');if(wl)wl.scrollTop=y;return}
      if(e.target.closest?.('[data-royaume-go]')){e.preventDefault();e.stopImmediatePropagation();S.royaumeChosen=true;save();prevFinish()}
    },true);
  }

  /* ---------------- 10. SÉRIE DOUCE : BOUCLIERS ---------------- */
  const SH_MAX=2;
  function shieldState(){if(typeof S.shields!=='number'||!isFinite(S.shields))S.shields=1;if(!S.shieldDays||typeof S.shieldDays!=='object')S.shieldDays={};if(!S.shieldEarned||typeof S.shieldEarned!=='object')S.shieldEarned={}}
  streak=function(){
    shieldState();let n=0;const d=new Date();
    if(!(S.days[todayKey()]?.xp>0))d.setDate(d.getDate()-1);
    for(let g=0;g<5000;g++){const k=dk(d);if(S.days[k]?.xp>0)n++;else if(!S.shieldDays[k])break;d.setDate(d.getDate()-1)}
    return n;
  };
  function applyShields(){
    shieldState();const d=new Date();d.setDate(d.getDate()-1);const missing=[];let found=false;
    for(let i=0;i<45;i++){const k=dk(d);if(S.days[k]?.xp>0){found=true;break}if(!S.shieldDays[k])missing.push(k);d.setDate(d.getDate()-1)}
    if(!found||!missing.length||missing.length>S.shields)return;
    missing.forEach(k=>S.shieldDays[k]=true);S.shields-=missing.length;save();
    const msg=missing.length>1?`🛡️ ${missing.length} boucliers ont protégé ta série`:'🛡️ Un bouclier a protégé ta série';
    setTimeout(()=>{try{toast(msg);if(typeof react==='function')react('happy','Ta série est sauvée !',1600)}catch(e){}},900);
  }
  function maybeEarnShield(){
    shieldState();const k=todayKey();if(!(S.days[k]?.xp>0)||S.shieldEarned[k])return;
    const n=streak();if(n>0&&n%7===0){S.shieldEarned[k]=true;if(S.shields<SH_MAX){S.shields++;setTimeout(()=>{try{toast(`🛡️ ${n} jours de série : +1 bouclier !`)}catch(e){}},1200)}save()}
  }
  function prune(obj,days){const lim=new Date();lim.setDate(lim.getDate()-days);const cut=dk(lim),out={};Object.keys(obj||{}).forEach(k=>{if(k>=cut)out[k]=true});return out}
  if(typeof addXP==='function'){const prevAdd=addXP;addXP=function(){const r=prevAdd.apply(this,arguments);try{setTimeout(maybeEarnShield,0);setTimeout(updateCastleVisuals,0)}catch(e){}return r}}
  if(typeof statsChips==='function'){
    const prevChips=statsChips;
    statsChips=function(){
      shieldState();
      return prevChips.apply(this,arguments).replace(/<span class="stat-chip c-fire" title="Série de jours">([\s\S]*?)<\/span>/,(m,inner)=>`<button type="button" class="stat-chip c-fire" data-streak-info title="Série de jours · ${S.shields} bouclier${S.shields>1?'s':''}" aria-label="Série de ${streak()} jours, ${S.shields} bouclier${S.shields>1?'s':''}">${inner}${S.shields>0?`<span class="streak-shield">🛡️${S.shields}</span>`:''}</button>`);
    };
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest?.('[data-streak-info]'))return;e.preventDefault();e.stopImmediatePropagation();shieldState();
    const n=Math.max(streak(),typeof Cloud!=='undefined'&&Cloud.displayStreak?Cloud.displayStreak():0);
    const sh=Array.from({length:SH_MAX},(_,i)=>`<span class="${i<S.shields?'':'off'}">🛡️</span>`).join('');
    const html=`<div class="streak-sheet"><h2>🔥 ${n} jour${n>1?'s':''} de série</h2>
      <p class="muted" style="margin:0">Une leçon par jour suffit. Pas de panique si tu rates un jour : tes boucliers protègent ta série automatiquement.</p>
      <div class="streak-shields" aria-label="${S.shields} bouclier(s) sur ${SH_MAX}">${sh}</div>
      <ul><li>Tu as <b>${S.shields}/${SH_MAX}</b> bouclier${S.shields>1?'s':''}.</li><li>Un jour manqué utilise un bouclier, sans rien perdre d'autre.</li><li>Tous les <b>7 jours</b> de série, tu gagnes un bouclier.</li></ul>
      <button class="btn" type="button" data-act="closesheet">Compris</button></div>`;
    if(typeof openSheet==='function')openSheet(html);
  },true);

  /* ---------------- 11. SYNCHRONISATION SUPABASE (profile.settings) ---------------- */
  if(typeof settingsOf==='function'){
    const prevSettings=settingsOf;
    settingsOf=function(state){
      const o=prevSettings.apply(this,arguments)||{};
      if(state.titleForm)o.titleForm=state.titleForm;
      if(state.royaumeChosen)o.royaumeChosen=true;
      if(typeof state.shields==='number')o.shields=state.shields;
      if(state.shieldDays)o.shieldDays=Object.keys(prune(state.shieldDays,120));
      if(state.shieldEarned)o.shieldEarned=Object.keys(prune(state.shieldEarned,120));
      return o;
    };
  }
  if(typeof hydrate==='function'){
    const prevHydrate=hydrate;
    hydrate=function(snap){
      const r=prevHydrate.apply(this,arguments);
      try{
        const set=snap?.profile?.settings||{};
        if(['m','f','n'].includes(set.titleForm))S.titleForm=set.titleForm;
        if(set.royaumeChosen)S.royaumeChosen=true;
        if(typeof set.shields==='number')S.shields=Math.max(0,Math.min(SH_MAX,set.shields));
        if(Array.isArray(set.shieldDays)){S.shieldDays=S.shieldDays||{};set.shieldDays.forEach(k=>S.shieldDays[k]=true)}
        if(Array.isArray(set.shieldEarned)){S.shieldEarned=S.shieldEarned||{};set.shieldEarned.forEach(k=>S.shieldEarned[k]=true)}
        applyShields();
      }catch(e){console.warn('royaume hydrate',e)}
      return r;
    };
  }
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){applyShields();try{if(typeof LX==='undefined'||!LX)render()}catch(e){}}});

  applyShields();
  try{if(typeof render==='function'&&!document.getElementById('welcomeRoot')?.innerHTML)render()}catch(err){console.warn('Royaume render skipped',err)}
})();
