/* « Se présenter » adapté à l'apprenant : le pays et la ville suivent la langue qu'il parle
   (francophone → France, Paris ; hispanophone → Espagne, Madrid…), au lieu de « Je suis belge / J'habite à Bruxelles ».
   Concerne les 8 langues principales ; les autres gardent les phrases d'origine (traductions non relues sinon). */
(function(){
  if(typeof setData!=='function'||typeof COLS==='undefined')return;
  const ORIG={fr:['Je suis belge',"J'habite à Bruxelles"],it:['Sono belga','Abito a Bruxelles'],es:['Soy belga','Vivo en Bruselas'],pt:['Sou belga','Moro em Bruxelas'],
    en:["I'm Belgian",'I live in Brussels'],de:['Ich bin Belgier','Ich wohne in Brüssel'],nl:['Ik ben Belg','Ik woon in Brussel'],ary:['Ana beljiki','Ana saken f Bruxelles']};
  // pays d'origine (selon la langue parlée) → [« je viens de… », « j'habite à… »] dans chaque langue
  const O=['fr','it','es','pt','en','de','nl','ary'];
  const FROM={
    fr:['Je viens de France',"Je viens d'Italie","Je viens d'Espagne",'Je viens du Portugal','Je viens du Royaume-Uni',"Je viens d'Allemagne",'Je viens des Pays-Bas','Je viens du Maroc'],
    it:['Vengo dalla Francia',"Vengo dall'Italia",'Vengo dalla Spagna','Vengo dal Portogallo','Vengo dal Regno Unito','Vengo dalla Germania','Vengo dai Paesi Bassi','Vengo dal Marocco'],
    es:['Soy de Francia','Soy de Italia','Soy de España','Soy de Portugal','Soy del Reino Unido','Soy de Alemania','Soy de los Países Bajos','Soy de Marruecos'],
    pt:['Sou de França','Sou de Itália','Sou de Espanha','Sou de Portugal','Sou do Reino Unido','Sou da Alemanha','Sou dos Países Baixos','Sou de Marrocos'],
    en:["I'm from France","I'm from Italy","I'm from Spain","I'm from Portugal","I'm from the UK","I'm from Germany","I'm from the Netherlands","I'm from Morocco"],
    de:['Ich komme aus Frankreich','Ich komme aus Italien','Ich komme aus Spanien','Ich komme aus Portugal','Ich komme aus Großbritannien','Ich komme aus Deutschland','Ich komme aus den Niederlanden','Ich komme aus Marokko'],
    nl:['Ik kom uit Frankrijk','Ik kom uit Italië','Ik kom uit Spanje','Ik kom uit Portugal','Ik kom uit het Verenigd Koninkrijk','Ik kom uit Duitsland','Ik kom uit Nederland','Ik kom uit Marokko'],
    ary:['Ana mn Fransa','Ana mn Italia','Ana mn Sbanya','Ana mn l-Portugal','Ana mn Britanya','Ana mn Alamanya','Ana mn Holanda','Ana mn l-Meghrib']};
  const CITY={
    fr:["J'habite à Paris","J'habite à Rome","J'habite à Madrid","J'habite à Lisbonne","J'habite à Londres","J'habite à Berlin","J'habite à Amsterdam","J'habite à Casablanca"],
    it:['Abito a Parigi','Abito a Roma','Abito a Madrid','Abito a Lisbona','Abito a Londra','Abito a Berlino','Abito ad Amsterdam','Abito a Casablanca'],
    es:['Vivo en París','Vivo en Roma','Vivo en Madrid','Vivo en Lisboa','Vivo en Londres','Vivo en Berlín','Vivo en Ámsterdam','Vivo en Casablanca'],
    pt:['Moro em Paris','Moro em Roma','Moro em Madrid','Moro em Lisboa','Moro em Londres','Moro em Berlim','Moro em Amesterdão','Moro em Casablanca'],
    en:['I live in Paris','I live in Rome','I live in Madrid','I live in Lisbon','I live in London','I live in Berlin','I live in Amsterdam','I live in Casablanca'],
    de:['Ich wohne in Paris','Ich wohne in Rom','Ich wohne in Madrid','Ich wohne in Lissabon','Ich wohne in London','Ich wohne in Berlin','Ich wohne in Amsterdam','Ich wohne in Casablanca'],
    nl:['Ik woon in Parijs','Ik woon in Rome','Ik woon in Madrid','Ik woon in Lissabon','Ik woon in Londen','Ik woon in Berlijn','Ik woon in Amsterdam','Ik woon in Casablanca'],
    ary:['Ana saken f Paris','Ana saken f Roma','Ana saken f Madrid','Ana saken f Lichbona','Ana saken f London','Ana saken f Berlin','Ana saken f Amsterdam','Ana saken f Dar l-Bida']};
  const prev=setData;
  setData=function(id){const r=prev.apply(this,arguments);
    try{if(!Array.isArray(r)||!COLS.includes(S.tgt)||!ORIG[S.src]||!ORIG[S.tgt])return r;
      const o=O.indexOf(S.src);if(o<0)return r;
      const iFrom=r.findIndex(x=>x&&x.t===ORIG[S.tgt][0]),iCity=r.findIndex(x=>x&&x.t===ORIG[S.tgt][1]);
      if(iFrom<0&&iCity<0)return r;
      const out=r.slice();
      if(iFrom>=0)out[iFrom]=Object.assign({},r[iFrom],{s:FROM[S.src][o],t:FROM[S.tgt][o]});
      if(iCity>=0)out[iCity]=Object.assign({},r[iCity],{s:CITY[S.src][o],t:CITY[S.tgt][o]});
      return out}catch(e){return r}};
  window.CastellumOrigin={FROM,CITY,O};
})();
