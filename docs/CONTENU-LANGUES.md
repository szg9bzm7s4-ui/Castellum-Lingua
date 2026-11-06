# Où se trouve le contenu des langues

Pour que l'appli s'ouvre vite, `index.html` ne contient plus le contenu de toutes les langues.

| Contenu | Emplacement | Chargé |
|---|---|---|
| Les 8 langues principales (fr, it, es, pt, en, de, nl, ary) | `index.html` | toujours |
| Les 55 autres langues | `data/lang/<code>.js` (un fichier par langue) | seulement quand on apprend cette langue, ou qu'on l'ouvre dans le dictionnaire |
| Images (logo, mascotte, châteaux) | `img/app/` | seulement quand elles s'affichent |

Chaque fichier `data/lang/<code>.js` appelle `window.__castellumPack(code, { extra, tr, fill, ancient })` :
- `extra` : les 120 phrases du cours A1 écrit pour cette langue ;
- `tr` : les traductions des unités et des thèmes ;
- `fill` et `ancient` : les compléments ajoutés ensuite.

`index.html` garde un petit index (`window.__PACK_INDEX`) qui dit quelles leçons existent hors ligne pour chaque langue. L'affichage (« A1 → C2 intégrés », nombre d'unités) ne dépend donc pas du chargement, et la progression enregistrée reste valable.

Pour modifier le contenu d'une de ces langues, modifie son fichier dans `data/lang/`. Si tu ajoutes ou retires une leçon, mets aussi à jour `window.__PACK_INDEX` dans `index.html`.
