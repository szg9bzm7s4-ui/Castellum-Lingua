/* « Le savais-tu ? » : une courte note (origine, usage réel, piège, différence avec le français) sur certains
   mots, affichée la première fois qu'on les découvre en leçon. Les notes sont rattachées au sens en français
   de la phrase (colonne « fr » des unités) et écrites en français : elles n'apparaissent que pour les francophones. */
(function(){
  if(typeof stepHTML!=="function")return;
  const N={
  it:{
    "Bonjour":"« Buongiorno » s'emploie jusqu'au milieu de l'après-midi. Ensuite on passe à « buonasera », bien plus tôt qu'en français.",
    "Salut":"« Ciao » vient du vénitien « s'ciavo », « (je suis votre) esclave », une ancienne formule de politesse. Il sert à dire bonjour et au revoir.",
    "Merci":"On répond « prego » (je t'en prie). « Prego » sert aussi à dire « entrez » ou « je vous écoute » dans un magasin.",
    "Pardon":"« Scusa » se dit à quelqu'un qu'on tutoie, « mi scusi » à quelqu'un qu'on vouvoie.",
    "Enchanté":"« Piacere » veut dire « plaisir ». On peut répondre « piacere mio », « le plaisir est pour moi ».",
    "Je ne comprends pas":"La négation est très simple en italien : on met « non » devant le verbe, sans deuxième mot comme « pas ».",
    "un café":"En Italie, « un caffè » est un expresso, qu'on boit souvent debout au comptoir. Pour un café allongé, on demande « un caffè lungo ».",
    "Quelle heure est-il ?":"Mot à mot « quelles heures sont-elles ? » : on met le pluriel, sauf pour une heure, « è l'una ».",
    "dimanche":"« Domenica » vient du latin « dies dominica », le jour du Seigneur, comme « dimanche » en français.",
    "Allez, allez !":"« Forza ! » (force !) est le cri d'encouragement des supporters italiens.",
    "J'ai faim":"Comme en français, on « a » faim : « ho » = j'ai. Le h ne se prononce jamais en italien.",
    "C'est délicieux":"Pour féliciter le cuisinier, on dit aussi « buonissimo ! » : le suffixe -issimo veut dire « très »."},
  es:{
    "Bonjour":"« Buenos días » s'utilise jusqu'au déjeuner. Ensuite on dit « buenas tardes », qui s'emploie jusqu'à la nuit, vers 20 h ou 21 h.",
    "Salut":"Le h ne se prononce jamais en espagnol : « hola » se dit « ola ».",
    "Merci":"On répond « de nada », « de rien ».",
    "Bonsoir":"« Buenas noches » sert à la fois de « bonsoir » tard le soir et de « bonne nuit ».",
    "Comment ça va ?":"L'espagnol ouvre les questions avec un point d'interrogation à l'envers : ¿Cómo estás? Pareil pour les exclamations : ¡Hola!",
    "Enchanté":"Un homme dit « encantado », une femme « encantada » : on accorde avec la personne qui parle.",
    "J'ai trente ans":"Attention au tilde : « años » veut dire « ans ». Sans le tilde, le mot a un tout autre sens, qu'on préfère éviter.",
    "J'ai faim":"Comme en français, on « a » faim : « tengo » = j'ai.",
    "le sucre":"Beaucoup de mots en a- viennent de l'arabe, avec l'article « al » collé : azúcar (sucre), aceite (huile), almohada (oreiller).",
    "un café":"Au bar, « un cortado » est un café avec un nuage de lait, et « un café con leche » un grand café au lait.",
    "Quel beau but !":"Le suffixe -azo grossit le mot : un « golazo », c'est un but superbe.",
    "dimanche":"« Domingo » vient du latin « dies dominicus », le jour du Seigneur."},
  pt:{
    "Merci":"Un homme dit « obrigado », une femme « obrigada » : on accorde avec la personne qui remercie. Le mot veut dire « obligé ».",
    "Bonjour":"Le « m » de « bom » ne se prononce pas : il rend la voyelle nasale, un peu comme « bon » en français.",
    "Bonsoir":"« Boa noite » sert le soir et pour « bonne nuit ». L'après-midi, on dit « boa tarde ».",
    "Pardon":"« Desculpa » entre proches, « desculpe » quand on vouvoie.",
    "Je m'appelle Marco":"Au Portugal, le pronom se place après le verbe, avec un trait d'union : « chamo-me ». Au Brésil, on dit plutôt « me chamo ».",
    "Je ne comprends pas":"Au Portugal, « perceber » veut dire « comprendre ». Au Brésil, on dit plutôt « não entendo ».",
    "un café":"Au Portugal, « um café » est un expresso. À Lisbonne, on l'appelle aussi « uma bica ».",
    "lundi":"Les jours de la semaine sont numérotés : segunda-feira (2e), terça-feira (3e)… Seuls samedi (sábado) et dimanche (domingo) ont un nom.",
    "le but":"Au Portugal on dit « golo », au Brésil « gol ».",
    "l'équipe":"Au Portugal « a equipa », au Brésil « a equipe ».",
    "Merci beaucoup":"« Muito obrigado » : « muito » veut dire « beaucoup » ou « très »."},
  en:{
    "Comment ça va ?":"« How are you? » est souvent une simple formule : on répond « Fine, thanks, and you? » sans entrer dans les détails.",
    "S'il te plaît":"Les anglophones disent « please » très souvent, même pour une petite demande. L'oublier peut paraître sec.",
    "Pardon":"« Sorry » sert à s'excuser, mais aussi à faire répéter : « Sorry? » veut dire « Pardon ? ».",
    "J'ai trente ans":"En anglais, on « est » son âge : « I am thirty ». On peut ajouter « years old » ou s'arrêter au nombre.",
    "J'ai faim":"On « est » affamé : « I am hungry », jamais « I have hunger ».",
    "Je suis belge":"Les nationalités et les langues prennent une majuscule : Belgian, French, English.",
    "lundi":"Les jours de la semaine prennent aussi une majuscule : Monday, Tuesday…",
    "L'addition, s'il vous plaît":"Au Royaume-Uni on demande « the bill », aux États-Unis « the check ».",
    "le match":"En Amérique du Nord, le football s'appelle « soccer » : « football » y désigne le football américain.",
    "Enchanté":"« Nice to meet you » se dit à la première rencontre. En partant, on dit « Nice to meet you too » ou « Nice meeting you »."},
  de:{
    "Bonjour":"« Guten Morgen » ne se dit que le matin. Dans la journée, on passe à « Guten Tag ».",
    "Merci":"On répond « Bitte » ou « Gern geschehen » (avec plaisir).",
    "S'il te plaît":"« Bitte » sert à tout : « s'il te plaît », « je t'en prie », et même « pardon ? » pour faire répéter.",
    "mon père":"Tous les noms prennent une majuscule en allemand : der Vater, die Mutter, das Haus.",
    "J'ai trente ans":"La lettre ß se prononce comme « ss » : dreißig se dit « draïssich ».",
    "Au revoir":"« Auf Wiedersehen » se lit mot à mot : auf (à) wieder (de nouveau) sehen (voir), exactement « au revoir ».",
    "Quelle heure est-il ?":"Mot à mot « Wie spät ist es? » veut dire « à quel point est-il tard ? ».",
    "Je suis perdu":"« Sich verlaufen » veut dire se perdre à pied. En voiture, on dit « sich verfahren ».",
    "dimanche":"« Sonntag » est le jour du soleil (Sonne), comme « Sunday » en anglais.",
    "mercredi":"« Mittwoch » veut dire « milieu de la semaine ».",
    "l'équipe":"« Mannschaft » vient de « Mann » (homme). C'est aussi le surnom de l'équipe nationale de football."},
  nl:{
    "Merci":"« Dank je » entre proches, « dank u » quand on vouvoie. On ajoute « wel » pour renforcer : « dank je wel ».",
    "S'il te plaît":"« Alsjeblieft » sert aussi quand on tend quelque chose : « tiens, voilà ».",
    "Bonjour":"Le g néerlandais se prononce au fond de la gorge, comme un « r » raclé.",
    "Au revoir":"« Tot ziens » veut dire mot à mot « jusqu'à (se) voir ».",
    "Je suis belge":"En Flandre, au nord de la Belgique, on parle néerlandais, avec un accent et quelques mots propres.",
    "C'est délicieux":"« Lekker » sert à tout : bon à manger, agréable, confortable. « Lekker weer » = il fait bon.",
    "la gare":"Le néerlandais a deux articles, « de » et « het » : il faut les apprendre avec chaque mot. On dit « het station ».",
    "mercredi":"« Woensdag » est le jour de Wodan (Odin), comme « Wednesday » en anglais.",
    "Allez, allez !":"« Hup Holland hup ! » est le chant des supporters néerlandais, toujours en orange."},
  ary:{
    "Bonjour":"Mot à mot « matin de bien ». On répond « sba7 n-nour », « matin de lumière ».",
    "Salut":"« Salam » est la forme courte de « s-salamou 3alaykoum », « la paix sur vous ».",
    "Merci":"On répond « bla jmil », « de rien », mot à mot « sans faveur ».",
    "S'il te plaît":"En darija écrite en lettres latines, les chiffres notent des sons arabes : 3 pour ع, 7 pour ح, 9 pour ق.",
    "Ça va bien, merci":"« Labas » veut dire « pas de mal ». On ajoute presque toujours « l7amdoulillah », « grâce à Dieu ».",
    "Comment ça va ?":"À un homme « kidayr ? », à une femme « kidayra ? ».",
    "Au revoir":"« Bslama » veut dire « avec la paix ».",
    "deux":"« Jouj » (deux) vient du mot arabe pour « paire ».",
    "le thé":"Le thé à la menthe se sert très sucré, versé de haut pour faire de la mousse.",
    "l'hôtel":"Beaucoup de mots viennent du français : l-otel, t-tomobil, l-biro (le bureau).",
    "Combien ça coûte ?":"Au souk, on négocie : le premier prix annoncé n'est presque jamais le dernier."},
  la:{
    "Bonjour ! (à une personne)":"« Salvē » vient de « salvus », « en bonne santé » : on souhaite à l'autre d'aller bien.",
    "Au revoir ! (à une personne)":"« Valē » vient de « valēre », « être fort, bien portant ». Les Romains terminaient leurs lettres par « valē ».",
    "Salut ! (salut solennel)":"C'est le salut adressé à l'empereur : « Avē Caesar ».",
    "Comment vas-tu ?":"Mot à mot, « quid agis ? » veut dire « que fais-tu ? ».",
    "L'erreur est humaine.":"La suite, moins connue : « perseverāre diabolicum », « persévérer est diabolique ».",
    "Attention au chien !":"On peut lire cette inscription sur une mosaïque à l'entrée d'une maison de Pompéi.",
    "Cueille le jour.":"Vers du poète Horace (Odes, I, 11) : profiter du jour présent sans trop compter sur demain.",
    "Le temps fuit.":"Raccourci d'un vers de Virgile : « fugit irreparabile tempus », le temps fuit sans retour.",
    "Je suis venu, j'ai vu, j'ai vaincu.":"Message de César au Sénat après une victoire éclair en Asie Mineure, en 47 av. J.-C.",
    "Le sort en est jeté.":"Phrase attribuée à César au moment de franchir le Rubicon avec son armée, en 49 av. J.-C.",
    "Hâte-toi lentement.":"Selon l'historien Suétone, c'était la devise favorite de l'empereur Auguste.",
    "La vérité est dans le vin.":"Proverbe repris d'un vieux dicton grec : le vin délie les langues."}};
  window.CASTELLUM_SAVAIS=N;
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const T=t=>{try{return tr(t)}catch(e){return t}};
  const noteFor=it=>{if(!it||S.src!=="fr")return null;const D=N[S.tgt];return D?D[String(it.s||"").trim()]||null:null};
  window.castellumNoteFor=noteFor;
  const prevHTML=stepHTML;
  stepHTML=function(st){const h=prevHTML.apply(this,arguments);
    try{if(!st||st.k!=="intro"||st.gram||st.scene)return h;const n=noteFor(st.it);if(!n||typeof h!=="string")return h;
      return h+`<aside class="st-note"><b>💡 ${E(T("Le savais-tu ?"))}</b><span data-noi18n>${E(n)}</span></aside>`}catch(e){return h}};
  if(typeof I18N!=="undefined"){const U={it:"Lo sapevi?",es:"¿Sabías que…?",pt:"Sabias que…?",en:"Did you know?",de:"Wusstest du?",nl:"Wist je dat?",ary:"Wach kont 3aref?"};
    for(const l in U){I18N[l]=I18N[l]||{};if(I18N[l]["Le savais-tu ?"]==null)I18N[l]["Le savais-tu ?"]=U[l]}}
  const css=document.createElement("style");css.id="castellum-savais-css";css.textContent=`
.st-note{display:flex;flex-direction:column;gap:4px;margin-top:14px;padding:12px 14px;background:var(--gold-soft,#FDF1C7);border:2.5px solid var(--af-edge,#111);border-radius:14px;color:var(--ink);line-height:1.45;text-align:left}
.st-note b{font-weight:800;text-transform:uppercase;font-size:.78rem;letter-spacing:.06em}`;
  document.head.appendChild(css);
})();
