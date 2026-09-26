# Castellum Lingua : comptes et sauvegarde dans le cloud (Supabase)

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète (inchangée pour les visiteurs, avec en plus les comptes) |
| `config.js` | Configuration publique (URL + clé anon). Régénéré par Netlify à partir des variables d'environnement |
| `vendor/supabase.js` | Bibliothèque officielle `@supabase/supabase-js` v2, incluse localement |
| `scripts/make-config.js` | Script de build : écrit `config.js` à partir de `SUPABASE_URL` / `SUPABASE_ANON_KEY` |
| `netlify.toml` | Commande de build Netlify et en-têtes de sécurité |
| `.env.example` | Liste des variables à définir |
| `supabase/schema.sql` | Tout le SQL à exécuter dans Supabase |

Sans configuration, l'app marche exactement comme avant, en local, sans comptes.

## 1. Créer le projet Supabase
1. Va sur https://supabase.com, puis **New project**. Choisis une région proche (par exemple Frankfurt) et note le mot de passe de la base.
2. Ouvre **SQL Editor**, puis **New query**. Colle tout le contenu de `supabase/schema.sql` et clique sur **Run**. Le message attendu est « Success. No rows returned ». Le script peut être relancé sans risque.
3. Dans **Table Editor**, vérifie que les 7 tables existent (`profiles`, `user_languages`, `lesson_progress`, `vocabulary_progress`, `user_achievements`, `daily_activity`, `saved_words`) et que chacune porte le badge **RLS enabled**.

## 2. Authentification
**Authentication → Sign In / Providers → Email** :
- laisse *Email* activé ;
- *Confirm email* : activé en production (l'utilisateur reçoit un lien). Pour tes premiers tests, tu peux le désactiver afin de te connecter tout de suite ;
- *Minimum password length* : 8.

**Authentication → URL Configuration** :
- *Site URL* : `https://TON-SITE.netlify.app` ;
- *Redirect URLs* : ajoute `https://TON-SITE.netlify.app/**` (et `http://localhost:8080/**` si tu testes en local).

**Google** (Authentication → Sign In / Providers → Google) :
1. Dans Google Cloud Console, va dans **APIs & Services → Credentials → Create credentials → OAuth client ID** (type *Web application*).
2. Dans *Authorized redirect URIs*, colle l'URL « Callback URL » affichée par Supabase dans l'écran Google (`https://xxxx.supabase.co/auth/v1/callback`).
3. Copie le *Client ID* et le *Client secret* dans Supabase, puis active Google.

**Apple (plus tard)** : active le fournisseur Apple dans Supabase, puis mets `ENABLE_APPLE_SIGNIN=true` dans Netlify. Le bouton est déjà prévu dans l'app.

**Mot de passe oublié** : fonctionne tout de suite avec l'e-mail par défaut de Supabase. Pour un vrai site, configure un SMTP (Project Settings → Auth → SMTP), car l'e-mail par défaut est limité à quelques envois par heure.

## 3. Variables d'environnement (Netlify)
Supabase → **Project Settings → API** (ou **API Keys**) :
- `SUPABASE_URL` = *Project URL* ;
- `SUPABASE_ANON_KEY` = clé **anon** / **publishable**. Jamais la clé `service_role` / `secret` : le build s'arrête s'il la détecte.

Netlify → ton site → **Site configuration → Environment variables** : ajoute ces deux variables, plus `AUTH_REDIRECT_URL` (optionnel, ex. `https://TON-SITE.netlify.app/`).

## 4. Déployer
- **Avec Git (recommandé)** : mets ce dossier dans un dépôt GitHub, puis dans Netlify fais **Add new site → Import from Git**. Netlify lit `netlify.toml`, lance `node scripts/make-config.js` et publie. Les clés ne sont jamais écrites dans le dépôt.
- **Glisser-déposer** : le glisser-déposer n'exécute pas de build. Ouvre alors `config.js`, remplis `supabaseUrl` et `supabaseAnonKey` (la clé anon est publique), puis glisse tout le dossier dans Netlify → Deploys.

### Avec Vercel
- `vercel.json` est inclus : Vercel lance `node scripts/make-config.js` et publie le dossier.
- Vercel → ton projet → **Settings → Environment Variables** : ajoute `SUPABASE_URL` et `SUPABASE_ANON_KEY` (cocher Production, Preview, Development), puis **Deployments → ⋯ → Redeploy**.
- Dans Supabase → Authentication → URL Configuration, mets `https://TON-PROJET.vercel.app` comme Site URL et `https://TON-PROJET.vercel.app/**` dans Redirect URLs.
- Sans variables, `config.js` est gardé tel quel : tu peux aussi le remplir à la main.

## 5. Tester la création de compte
1. Ouvre le site en navigation privée. Fais une leçon sans compte : l'app propose « Garde ta progression ».
2. Clique sur **Créer un compte**, puis entre un prénom, un e-mail et un mot de passe d'au moins 8 caractères.
3. Si *Confirm email* est activé, clique sur le lien reçu par e-mail, puis connecte-toi.
4. L'app propose d'ajouter la progression faite sur l'appareil. Clique sur **Ajouter à mon compte**, et tu arrives sur « Bonjour [prénom] 👋 ».
5. Dans Supabase → Table Editor → `profiles`, ta ligne apparaît avec `total_xp` et `local_migrated_at` renseignés.
6. Teste aussi « Mot de passe oublié », « Continuer avec Google » et **Profil → Se déconnecter**.

## 6. Vérifier que deux utilisateurs ont des progressions séparées
1. Navigateur 1 : crée le compte A, puis fais 2 leçons d'italien.
2. Navigateur 2 (ou fenêtre privée) : crée le compte B, puis fais 1 leçon de russe. B ne voit ni l'italien ni les XP de A.
3. Dans Supabase → SQL Editor, exécute :
   ```sql
   select p.display_name, u.language_id, u.current_level, u.xp,
          (select count(*) from lesson_progress l where l.user_id = p.id) as etapes
   from profiles p left join user_languages u on u.user_id = p.id order by 1;
   ```
   Chaque compte doit avoir ses propres lignes.
4. Reconnecte A sur un autre appareil : il retrouve exactement ses XP, ses leçons, ses mots enregistrés et sa langue en cours.

## Sécurité en bref
- La Row Level Security est activée sur toutes les tables, et chaque politique compare `auth.uid()` au propriétaire de la ligne.
- Les XP, les séries, les leçons terminées et l'activité quotidienne ne s'écrivent que via les fonctions `complete_lesson`, `record_activity`, `unlock_achievement` et `import_local_progress`. Ces fonctions utilisent `auth.uid()` et plafonnent les XP à 100 par étape et 60 par partie.
- Le profil n'expose en écriture que `username`, `display_name`, `avatar_url` et `settings`.
- La migration de la progression locale ne peut avoir lieu qu'une fois par compte (`local_migrated_at`).
