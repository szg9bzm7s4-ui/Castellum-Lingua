/* Qualité des QCM : un distracteur ne doit jamais être une autre bonne réponse possible.
   On écarte les options qui contiennent la réponse en début de phrase (« Ciao » / « Ciao, che si dice? »)
   ou qui y sont contenues (« Merci beaucoup » / « Merci »), et, pour un mot isolé, les phrases qui le contiennent. */
(function(){
  if(typeof hardOpts!=='function'||typeof norm!=='function')return;
  const prev=hardOpts;
  function ambiguous(a,v){const na=norm(a),nv=norm(v);if(!na||!nv)return false;
    if(nv.startsWith(na+' ')||na.startsWith(nv+' ')||nv.endsWith(' '+na)||na.endsWith(' '+nv))return true;
    const wa=na.split(' '),wv=nv.split(' ');
    if(wa.length===1&&wv.includes(na))return true;if(wv.length===1&&wa.includes(nv))return true;return false}
  hardOpts=function(answer,cands){const ok=(cands||[]).filter(v=>!ambiguous(answer,v));return prev.call(this,answer,ok.length>=3?ok:cands)};
  window.CastellumQuality={ambiguous};
})();
