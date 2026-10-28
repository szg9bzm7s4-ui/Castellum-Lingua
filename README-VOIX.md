# Castellum Lingua : l'audio

L'appli cherche l'audio dans cet ordre, phrase par phrase :

| Ordre | Source | Disponible | Ce qu'il faut |
|---|---|---|---|
| 1 | 📦 **Audio intégré** : fichiers MP3 servis avec l'appli (`audio/`) | Hors ligne, une fois chargés | Générer ou enregistrer les fichiers (section A) |
| 2 | ☁️ **Voix en ligne** : fonction Supabase `castellum-tts` (voix neuronales Azure) | Comptes connectés, connexion requise | Déployer la fonction avec la clé Azure (sections 1 à 3 ci-dessous) |
| 3 | 📱 **Voix de l'appareil** | Hors ligne, selon les voix installées | Rien |

Si aucune source ne marche, l'exercice l'indique clairement (« Aucune voix pour cette langue sur cet appareil »), propose « Réessayer » et la transcription reste affichée. Aucune clé n'est jamais placée dans le navigateur.

## A. Audio intégré (prioritaire pour les premières leçons)

Les 66 phrases de la première semaine d'italien et de la situation « Au bar, à Naples » sont listées dans :
- `audio/sources/it.json` (utilisé par le script) ;
- `audio/sources/it-a-enregistrer.csv` (à ouvrir dans un tableur pour une séance d'enregistrement).

**Enregistrements natifs (recommandé).** Fais enregistrer chaque phrase par un locuteur natif, en MP3, en nommant le fichier d'après la colonne `cle` (par exemple `32b9a2a6.mp3`). Puis :

```bash
node scripts/make-audio.mjs it --native dossier/des/enregistrements
```

**En attendant : voix neuronales Azure.** Sur ton ordinateur (la clé ne quitte pas ta machine et n'est jamais écrite dans le dépôt) :

```bash
AZURE_SPEECH_KEY=ta-clé AZURE_SPEECH_REGION=westeurope node scripts/make-audio.mjs it
```

Le script écrit `audio/it/<cle>.mp3` et met à jour `audio/manifest.json`. Un enregistrement natif remplace toujours la voix de synthèse pour la même phrase, et l'appli l'affiche « Enregistrement natif ». Pour une autre langue, crée `audio/sources/<langue>.json` sur le même modèle.

## B. Voix en ligne

La fonction `castellum-tts` lit désormais l'italien, l'espagnol, le français, le portugais, l'anglais, l'allemand et le néerlandais, en plus des trois darijas. Elle se déploie comme expliqué ci-dessous ; si elle était déjà déployée, redéploie-la pour ajouter les nouvelles langues.

---

# Voix marocaine et voix en ligne (détails)

Les téléphones et les ordinateurs n'ont presque jamais de voix marocaine. Sans serveur, l'appli lit donc la darija avec la voix arabe de l'appareil. Cette voix a un accent d'arabe standard (Maged sur iPhone, la voix arabe Google sur Android).

Pour une vraie voix marocaine, l'appli peut passer par la fonction Supabase `castellum-tts`. Cette fonction utilise les voix neuronales de Microsoft Azure :

| Darija | Voix féminine | Voix masculine |
|---|---|---|
| Marocaine | Mouna (ar-MA) | Jamal (ar-MA) |
| Algérienne | Amina (ar-DZ) | Ismael (ar-DZ) |
| Tunisienne | Reem (ar-TN) | Hedi (ar-TN) |

Ce qu'il faut savoir :

- **Qui l'entend :** seuls les utilisateurs connectés à leur compte. Les autres gardent la voix de leur appareil.
- **Changer de voix :** le bouton « 🎙️ Voix » d'un exercice passe de Mouna à Jamal.
- **Sans serveur :** si la fonction n'est pas installée ou ne répond pas, l'appli reprend la voix de l'appareil, sans message d'erreur.
- **Coût :** chaque phrase déjà entendue est gardée sur l'appareil, donc elle n'est demandée qu'une fois.

## 1. Créer la clé Azure (gratuit)

1. Va sur https://portal.azure.com et crée un compte. L'offre gratuite suffit.
2. Clique sur **Créer une ressource**, cherche **Speech** (service Azure AI Speech), puis clique sur **Créer**.
3. Choisis :
   - une région, par exemple **West Europe** ;
   - le niveau tarifaire **Free F0**.
4. Une fois la ressource créée, ouvre **Clés et point de terminaison**. Note la **Clé 1** et l'**Emplacement / Région** (par exemple `westeurope`).

Le niveau **Free F0** permet environ 500 000 caractères de voix neuronale par mois, sans payer. Une phrase de leçon fait 10 à 40 caractères.

## 2. Déployer la fonction

Avec la ligne de commande Supabase, depuis le dossier du projet :

```bash
npx supabase login
npx supabase link --project-ref fvbbhekjiuqfihxvxytk
npx supabase secrets set AZURE_SPEECH_KEY=ta-clé-azure AZURE_SPEECH_REGION=westeurope
npx supabase functions deploy castellum-tts
```

Sans ligne de commande, tu peux tout faire depuis le tableau de bord Supabase :

1. Ouvre **Edge Functions**, clique sur **Deploy a new function**, puis sur **Via Editor**.
2. Nomme la fonction `castellum-tts` et colle le contenu de `supabase/functions/castellum-tts/index.ts`.
3. Dans **Edge Functions → Secrets**, ajoute `AZURE_SPEECH_KEY` et `AZURE_SPEECH_REGION`.

Laisse **Verify JWT** activé : seuls les utilisateurs connectés pourront utiliser ta clé.

## 3. Vérifier

1. Connecte-toi dans l'appli.
2. Choisis **Darija marocaine** et ouvre une leçon.
3. Sous le mot, l'appli doit afficher **« Voix : Mouna · ar-MA »**.

Si l'appli affiche le nom de la voix du téléphone, vérifie ces deux points :

- la fonction est bien déployée sous le nom `castellum-tts` ;
- les deux secrets sont bien enregistrés.

## Sécurité

- **Clé Azure :** ne la mets jamais dans `index.html`, `config.js` ou le dépôt Git. Elle ne doit se trouver que dans les secrets Supabase.
- **Limite de dépenses :** dans le portail Azure, garde le niveau **Free F0**. Si tu passes un jour en payant, fixe une alerte de budget.
