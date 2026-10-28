# Audit du contenu : italien pour francophones, première semaine (A1, unités 1 à 4)

Date : 28 octobre 2026. Périmètre : unités A1 « Salutations », « Se présenter », « Les nombres » et « La famille », plus les exercices produits par le moteur de leçons. Méthode : lecture des 48 éléments et mesure automatique sur 80 leçons générées (419 QCM).

Cet audit est une relecture technique et linguistique interne. Il ne remplace pas la relecture par un enseignant ou un locuteur natif, qui reste à faire.

## 1. Constats sur les éléments

| Unité | Constat | Gravité | Action |
|---|---|---|---|
| Salutations | Liste de 12 formules sans contexte : on apprend « Buongiorno » sans savoir quand l'employer. | Haute | ✅ Corrigé pour l'entrée du parcours : la situation « Au bar, à Naples » montre les formules en contexte, avec registres. |
| Salutations | Registres absents : « Ciao » (familier) et « Buongiorno » (poli) présentés comme équivalents ; « Scusa » et « Come stai? » sont des formes en *tu* sans le dire ; aucune forme de politesse (*Mi scusi*, *Come sta?*). | Haute | ✅ Registres expliqués dans la situation. ⏳ Ajouter *Mi scusi* et *Come sta?* à l'unité, après relecture. |
| Salutations | « Per favore = S'il te plaît » : traduction juste mais partielle (aussi « s'il vous plaît »). | Faible | ⏳ Traduire « S'il te plaît / s'il vous plaît ». |
| Se présenter | « Sono belga », « Abito a Bruxelles » : modèle centré sur un apprenant belge, peu adapté aux autres francophones. | Moyenne | ⏳ Proposer des variantes (francese, svizzero, canadese…) ou un exemple neutre. |
| Se présenter | « Lavoro nelle vendite » : compréhensible mais peu naturel ; « Lavoro nel commercio » ou « Faccio il commerciale » sont plus courants. | Moyenne | ⏳ À valider par un locuteur natif avant de modifier. |
| Les nombres | Nombres isolés, jamais utilisés dans une situation (prix, âge, téléphone). | Moyenne | ✅ Réemploi dans la situation (prix : « Un euro e venti »). ⏳ Ajouter une situation « au marché ». |
| La famille | Contenu correct. La règle de l'article avec les possessifs (*mia madre* mais *i miei genitori*) n'est pas expliquée. | Moyenne | ⏳ Ajouter une note de grammaire dans l'unité. |

## 2. Constats sur les exercices (mesures avant / après)

| Problème | Avant | Après | Correction |
|---|---|---|---|
| QCM ambigus : un distracteur est aussi acceptable (« Ciao » / « Ciao, che si dice? », « Merci beaucoup » / « Merci ») | 76 sur 419 (18 %) | 0 | Filtre des distracteurs (`castellum-quality-js`). |
| QCM réussissables par élimination (la bonne réponse est la seule de sa longueur) | 28 (7 %) | 13 (3 %) | Effet du même filtre. |
| Distracteurs hors du niveau A1 (« Je tousse beaucoup », « sauter ») | 336 (80 %) | 319 (76 %) | ⏳ Choix assumé du moteur (pièges proches à l'écrit). À limiter au niveau en cours pour les débutants. |
| Trois exercices du même type d'affilée | fréquent | 0 | Rééquilibrage des leçons (étape 5). |
| Peu de production (QCM majoritaires) | 1 à 2 par leçon | 3 à 4 minimum | QCM sur mots déjà vus transformés en « construis » / « écris ». |
| Erreurs sans explication | toujours | jamais | Ligne « Pourquoi ? » sous chaque erreur. |
| « Passer » un exercice oral compte comme une erreur | oui | non, dans les situations | ⏳ À étendre aux leçons classiques. |

## 3. Recommandations, par priorité

1. Faire relire les 48 éléments et la situation « Au bar, à Naples » par un locuteur natif de Naples (registres, naturel, prix réaliste).
2. Ajouter les formes de politesse manquantes et indiquer le registre de chaque élément dans les données (champ `reg` : standard, familier, régional, dialectal, vulgaire).
3. Construire une situation par unité sur le modèle de `CastellumSituations` : dialogue, compréhension, usage, exercice guidé, production libre, bilan.
4. Limiter les distracteurs au niveau en cours pendant les deux premières semaines.
5. Enregistrer l'audio natif des 66 phrases listées dans `audio/sources/it-a-enregistrer.csv`.
