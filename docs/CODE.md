# Organisation du code

`index.html` ne contient plus que la structure de la page et les styles. Le code et les données sont dans `app/`,
un fichier par bloc, chargés dans l'ordre de leur numéro (l'ordre compte : un bloc peut compléter ou remplacer
une fonction définie par un bloc précédent).

| Fichiers | Contenu |
|---|---|
| `app/01-packs-boot.js` | Index des langues hors des 8 principales (chargement à la demande de `data/lang/<code>.js`) |
| `app/02-coeur.js` | Cœur de l'appli : langues, unités, listes, traductions d'interface, moteur de leçons, vues |
| `app/17-word-tip.js` | Traduction mot à mot au toucher (dictionnaire inclus) |
| `app/20-grammar-full-data.js` | Fiches de grammaire A1 à C2 |
| `app/29-latin-workshop.js`, `app/48-latin.js`, `app/31-la-macrons.js` | Latin : atelier, parcours, voyelles longues |
| `app/35-castle-view.js` et blocs « castle », « royaume », « world » | Château |
| `app/36-lessons2.js`, `app/60-jeux-ux.js` | Leçons : scène d'ouverture, variété, retours, glisser-déposer, voix |
| `app/38-audio2.js` | Audio : fichiers intégrés, voix en ligne, voix de l'appareil |
| `app/57-ville.js`, `app/58-scenes-plus.js` | Page Apprendre (chemin de la ville), fiche d'un lieu, scènes |
| `app/62-tour.js` | Visite guidée et écran « Bravo » |
| `app/63-version.js` | Bandeau « Nouvelle version disponible » |
| `data/units-extra.js` | 6 phrases de plus par unité (8 langues et latin) |

## Publier

```
python3 scripts/version.py   # empreintes des fichiers et numéro de version
sh tests/run.sh              # tous les tests
```

Chaque fichier de `app/` est cité dans `index.html` avec une empreinte (`?v=…`). `scripts/version.py` la recalcule :
un fichier modifié change d'adresse, un fichier inchangé reste en mémoire dans le navigateur.
