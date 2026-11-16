# Tests de Castellum Lingua

Ces tests ouvrent l'appli dans un navigateur sans écran et vérifient qu'elle se comporte comme prévu.
Il faut Node.js, Python 3 et Playwright (`npm i playwright`).

```
sh tests/run.sh          # tout (environ 10 minutes)
sh tests/run.sh rapide   # sans les deux grands parcours (environ 2 minutes)
```

| Fichier | Ce qu'il vérifie |
|---|---|
| `parcours.js` | Accueil, première situation, 11 couples de langues (chaque question à choix n'a qu'une bonne réponse), toutes les vues, une leçon complète, une révision |
| `latin.js` | Parcours latin dans les 8 langues d'interface, leçons A1 à C2, grammaire, conjugaison |
| `outils.js` | Chaque bouton du menu Outils ouvre bien sa page (au toucher, sur téléphone) |
| `ecoute.js` | Le bouton « Je ne peux pas entendre » est présent et remplace l'exercice d'écoute |
| `visite.js` | Visite guidée en 4 étapes, écran « Bravo » après la première leçon, relance depuis Outils |
| `lecons.js` | 4 jeux par lieu, nombre d'exercices, répétition maximale d'une phrase, rappels des lieux précédents |
| `son.js` | Si la voix du téléphone ne démarre pas, l'audio intégré prend le relais ; lien « Pas de son ? » |
| `darija.js` | Si la voix en ligne échoue, la voix arabe de l'appareil prend le relais |
| `version.js` | Bandeau « Nouvelle version disponible » et rechargement sur une adresse propre à la version |

Avant chaque publication : `python3 scripts/version.py` puis `sh tests/run.sh`.
