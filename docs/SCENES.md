# Les scènes de la carte de ville

Dans « Apprendre », chaque lieu de la carte ouvre une vraie scène : un court dialogue de la vie courante (5 à 7 répliques), à écouter avant les exercices. La scène reprend le vocabulaire de l'unité.

| Niveau | Scènes | Répliques | Fichier |
|---|---|---|---|
| A1 | 26 | 133 | `data/scenes/a1.js` |
| A2 | 24 | 127 | `data/scenes/a2.js` |
| B1 | 24 | 149 | `data/scenes/b1.js` |

- **Langues** : chaque réplique, chaque contexte et chaque rôle existent en français, italien, espagnol, portugais, anglais, allemand, néerlandais et darija. On peut donc apprendre l'une de ces langues depuis n'importe quelle autre. Pour les autres langues, ou un niveau sans scènes, le lieu affiche les phrases de l'unité.
- **Chargement à la demande** : le fichier du niveau n'est chargé qu'à l'ouverture d'un lieu.
- **Format** : `window.__castellumScenes("A1", {roles, scenes})`. `scenes` a une entrée par unité (`u0`, `a2u0`, `b1u0`…), avec `set` (le contexte) et `lines` (`r` pour le rôle, puis une clé par langue).
- **Audio** : les répliques en italien, français, espagnol, anglais et portugais sont enregistrées à l'avance avec la voix Kokoro (`audio/<langue>/`, sources dans `audio/sources/<langue>.json`). En allemand, néerlandais et darija, l'appli utilise la voix en ligne ou celle de l'appareil. « Écouter toute la scène » attend la fin de chaque réplique avant de passer à la suivante.
- **Code** : module `castellum-ville-js` à la fin de `index.html` (`placeSheet`, `sceneLoad`, `sceneOf`).

À faire relire par des locuteurs natifs, surtout le darija et les scènes d'argot (A2 « Le parler des jeunes », B1 « Expressions familières »).
