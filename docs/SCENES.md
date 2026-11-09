# Les scènes de la carte de ville

Dans « Apprendre », chaque lieu de la carte ouvre une vraie scène : un court dialogue de la vie courante (5 à 7 répliques), à écouter avant les exercices. La scène reprend le vocabulaire de l'unité.

| Niveau | Scènes | Répliques | Fichier |
|---|---|---|---|
| A1 | 26 | 133 | `data/scenes/a1.js` |
| A2 | 24 | 127 | `data/scenes/a2.js` |
| B1 | 24 | 149 | `data/scenes/b1.js` |
| B2 | 24 | 147 | `data/scenes/b2.js` |
| C1 | 26 | 160 | `data/scenes/c1.js` |
| C2 | 25 | 153 | `data/scenes/c2.js` |

Soit 149 scènes et 869 répliques : chaque lieu des niveaux A1 à C2 a sa scène.

- **Langues** : chaque réplique, chaque contexte et chaque rôle existent en français, italien, espagnol, portugais, anglais, allemand, néerlandais et darija. On peut donc apprendre l'une de ces langues depuis n'importe quelle autre. Pour les autres langues, le lieu affiche les phrases de l'unité. Les expressions idiomatiques, l'argot et les proverbes (C1, C2) sont rendus par leur équivalent naturel dans chaque langue, pas traduits mot à mot.
- **Chargement à la demande** : le fichier du niveau n'est chargé qu'à l'ouverture d'un lieu.
- **Format** : `window.__castellumScenes("A1", {roles, scenes})`. `scenes` a une entrée par unité (`u0`, `a2u0`, `b1u0`…), avec `set` (le contexte) et `lines` (`r` pour le rôle, puis une clé par langue).
- **Audio** : les répliques en italien, français, espagnol, anglais et portugais sont enregistrées à l'avance avec la voix Kokoro (`audio/<langue>/`, sources dans `audio/sources/<langue>.json`). En allemand, néerlandais et darija, l'appli utilise la voix en ligne ou celle de l'appareil. « Écouter toute la scène » attend la fin de chaque réplique avant de passer à la suivante.

## Rejouer la scène

Après l'écoute, « Rejouer la scène » donne à l'apprenant le rôle « Toi ». Les autres personnages parlent avec leur audio. À son tour, l'apprenant voit sa réplique dans sa propre langue et doit la dire dans la langue apprise :

- au micro, quand le navigateur offre la reconnaissance vocale (pas pour le darija) : la réplique est acceptée si 60 % de ses mots sont reconnus ;
- ou en choisissant la bonne réplique parmi trois (les deux autres viennent d'autres scènes du même niveau).

Les erreurs sont comptées, et le lieu affiche ensuite « Déjà rejouée » (`S.ui.scRole`).

## Dire autrement

Sous la scène, « Dire autrement » montre une fonction de la vie courante (saluer, remercier, refuser poliment, se plaindre, demander le prix…) en trois tons : familier, courant et soutenu. Il y a 24 fonctions, chacune en 8 langues, reliées aux 149 lieux dans `data/registres.js` (chargé à la demande).

- **Code** : modules `castellum-ville-js` (`placeSheet`, `sceneLoad`, `sceneOf`) et `castellum-scenes-plus` (Rejouer, Dire autrement) à la fin de `index.html`.

À faire relire par des locuteurs natifs, surtout le darija, l'argot (A2 « Le parler des jeunes », B1 « Expressions familières », C1 « La langue de la rue », C2 « Argot » et « Argot des réseaux sociaux ») et les registres soutenus.
