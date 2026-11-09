# Le parcours de latin

Le latin a son propre parcours, pensé pour **lire les Romains** : on apprend la grammaire pas à pas, avec des phrases et des citations authentiques, et on finit sur les textes originaux. Il remplace l'ancien parcours, qui traduisait en latin des situations modernes (« Bonum vesperum », gare, aéroport…).

| Niveau | Contenu | Unités |
|---|---|---|
| A1 · Premiers pas | Saluer à la romaine, la famille, 1re et 2e déclinaisons, *esse*, 1re conjugaison, adjectifs, maison romaine, nombres romains, le temps, premières citations | 12 |
| A2 · Les fondations | 2e, 3e et 4e conjugaisons, 3e déclinaison, génitif, datif et ablatif, prépositions, imparfait, futur, parfait, pronoms, impératif, la ville de Rome | 12 |
| B1 · Lire les Romains | 4e et 5e déclinaisons, comparatif, participe, ablatif absolu, proposition infinitive, subjonctif ; récits suivis (Romulus et Rémus, César en Gaule, Pompéi) ; du latin au français | 10 |
| B2 et C1 · Les auteurs | Les six séries de citations (maximes, Sénèque, César et les historiens, Catulle-Ovide-Martial, Cicéron, Virgile et Horace), avec leurs références | 6 |
| C2 · Textes suivis | Textes originaux, vers par vers : César (*Guerre des Gaules*, I, 1), Catulle (poème 5), Virgile (*Énéide*, I, 1-11), Cicéron (*Première Catilinaire*, 1-2) | 4 |

- **Voyelles longues** : notées (ā, ē, ī…) en A1, A2 et B1, comme dans les manuels. Les textes d'auteurs suivent l'usage des éditions, sans ces signes. La correction ignore ces signes : taper « rosa » pour « rosā » est juste.
- **Formes à retenir** : entre parenthèses (« rēx (rēgis) ») ; seule la forme principale est demandée.
- **Grammaire** : les 36 fiches de `GRAM_FULL.la` (A1 à C2) et l'Atelier latin existaient déjà ; s'y ajoutent une fiche de prononciation, la 1re conjugaison et les tableaux de conjugaison (esse, habēre, īre, facere, loquī ; présent et parfait).
- **Langues de l'apprenant** : tout est traduit en italien, anglais, espagnol, portugais, allemand, néerlandais et darija. Cela couvre les phrases du parcours, les titres d'unités, les 38 fiches de grammaire et l'Atelier latin : onglets, tables, exercices, jeu « Quel cas ? », racines, vers, quêtes, citations du jour, ainsi que les 32 textes d'auteurs avec le sens des mots, les analyses, les traductions et les questions. Ces traductions ne s'appliquent que lorsqu'on apprend le latin.
- **Chargement à la demande** : les traductions sont dans `data/lang/la-ui-<langue>.js`, environ 300 Ko par langue. Le fichier n'est chargé que si l'on apprend le latin depuis cette langue.
- **Prononciations** : les transcriptions sont adaptées à chaque langue. Par exemple, la prononciation d'église de Cicero s'écrit « Chichero » en anglais, « chíchero » en espagnol, « Tschitschero » en allemand et « Tsjitsjero » en néerlandais.
- **Darija** : écrit en lettres latines avec chiffres (3, 7, 9), comme le reste de l'interface darija. Les termes de grammaire restent en français (« l-accusatif », « COD »), comme on les apprend au Maroc.
- **Onglet Racines** : le latin est comparé au français, à l'italien, à l'espagnol, au portugais, à l'anglais, à l'allemand et au néerlandais. La langue de l'apprenant vient en premier, et le jeu demande le mot de sa langue. Le darija suit le français. Les mots dérivés ne passent jamais par la traduction de l'interface.
- **Audio** : 1594 phrases enregistrées à l'avance dans `audio/la` (prononciation classique) et `audio/la-e` (prononciation d'église). Elles couvrent le parcours, les citations, les racines, les tables de l'Atelier, les textes d'auteurs et leurs mots. La voix est Kokoro italienne : pour la prononciation classique, le texte est réécrit avant la synthèse (c et g durs, v = w, accent latin). L'appli choisit le jeu selon le réglage de l'Atelier. Les autres formes passent par la voix de l'appareil.
- **Progression** : les clés enregistrées ne changent pas. Un apprenant qui avait terminé des unités de l'ancien parcours les voit comme terminées dans le nouveau, au même rang.
- **Code** : module `castellum-latin-js` à la fin de `index.html`.

À faire relire :
- par un latiniste : les traductions françaises et anglaises des textes de C2, et les voyelles longues ;
- par des locuteurs natifs : les traductions en espagnol, portugais, allemand, néerlandais et darija (terminologie grammaticale scolaire de chaque pays) ;
- à l'oreille : l'audio latin, surtout la prononciation classique (accent tonique, voyelles longues).
