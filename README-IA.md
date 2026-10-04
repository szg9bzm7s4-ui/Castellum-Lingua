# Castellum Lingua : la conversation avec l'IA

L'écran **Professeur** et l'écran **Jeux** proposent « 💬 Converser avec l'IA ». C'est une vraie conversation avec Claude, l'IA d'Anthropic, dans la langue étudiée :

- elle s'adapte au niveau choisi (A1 à C2) ;
- elle propose des situations : café, voyage, entretien, médecin, débat, forum romain pour le latin… ;
- elle corrige les erreurs avec une explication en français ;
- elle peut lire ses réponses à voix haute, et on peut lui parler au micro.

Il faut une connexion internet. L'appli essaie trois connexions, dans cet ordre :

1. **Ouverte dans Claude** : elle utilise directement la connexion de Claude. Rien à configurer.
2. **Clé personnelle** : un utilisateur colle sa propre clé Anthropic (bouton ⚙️ dans la conversation). Elle reste dans le navigateur de cet appareil, et c'est son compte Anthropic qui paie.
3. **Serveur Castellum** : pour les utilisateurs connectés à leur compte, la fonction Supabase `castellum-chat` appelle Claude avec **ta** clé, cachée sur le serveur. C'est la seule option qui marche pour tout le monde, mais c'est toi qui paies.

## Activer la conversation pour tes utilisateurs (option 3)

### 1. Créer une clé Anthropic
1. Va sur https://platform.claude.com, crée un compte, puis va dans **API Keys** et clique sur **Create Key**.
2. Dans **Billing**, ajoute un moyen de paiement et fixe une **limite de dépenses mensuelle** (par exemple 20 €). C'est ta protection contre les mauvaises surprises.

### 2. Déployer la fonction
Avec la ligne de commande Supabase, depuis le dossier du projet :

```bash
npx supabase login
npx supabase link --project-ref fvbbhekjiuqfihxvxytk
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...ta-clé...
npx supabase functions deploy castellum-chat
```

Sans ligne de commande, tu peux tout faire depuis le tableau de bord Supabase :
1. Dans **Edge Functions**, clique sur **Deploy a new function**, puis **Via Editor**.
2. Nomme la fonction `castellum-chat` et colle le contenu de `supabase/functions/castellum-chat/index.ts`.
3. Dans **Edge Functions → Secrets**, ajoute `ANTHROPIC_API_KEY` avec ta clé.

La vérification du jeton (« Verify JWT ») doit rester **activée**. Elle est activée par défaut. Ainsi, seuls les utilisateurs connectés à Castellum peuvent utiliser la fonction.

### 3. Vérifier
Connecte-toi dans l'appli, ouvre **Professeur**, puis « 💬 Converser avec l'IA ». La première réponse arrive en quelques secondes.

## Coût
- **Modèle :** Claude Opus 5.5 (`claude-opus-5-5`), avec un effort de réflexion bas, adapté au dialogue.
- **Tarifs :** 4 $ par million de jetons envoyés et 20 $ par million de jetons générés.
- **Par message :** l'appli renvoie au plus les 24 derniers messages, ce qui fait environ **1 à 2 centimes** par message.
- **Pour diviser la facture environ par deux :** remplace `claude-opus-5-5` par `claude-sonnet-5-5` dans `supabase/functions/castellum-chat/index.ts` (ligne `const MODEL`) et dans le script `castellum-ai-chat` de `index.html`.

Si Claude refuse un message pour des raisons de sécurité, la requête est automatiquement relancée sur un autre modèle recommandé par Anthropic (`fallbacks: "default"`).

## Sécurité
- Ne mets **jamais** la clé Anthropic dans `index.html`, `config.js` ou le dépôt Git. Elle ne vit que dans les secrets Supabase.
- La clé secrète Supabase (`sb_secret_…`) partagée plus tôt doit être révoquée (Project Settings → API Keys) si ce n'est pas déjà fait.
- La clé publique (`sb_publishable_…`) de `config.js` peut rester publique : c'est prévu.
