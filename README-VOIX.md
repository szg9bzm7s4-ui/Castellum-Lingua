# Castellum Lingua : la vraie voix marocaine

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
