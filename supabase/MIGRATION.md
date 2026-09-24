# Migration vers Supabase — Le Quizz de Constance

## Étape 1 — Créer la base (5 min)

1. Ouvrez votre projet sur [supabase.com](https://supabase.com).
2. Menu de gauche → **SQL Editor** → **New query**.
3. Copiez tout le contenu de `schema.sql`, collez-le, cliquez **Run**.
4. Vous devez voir « Success. No rows returned ». Dans **Table Editor**, les tables
   `questions`, `games`, `players`, `answers`… apparaissent.

## Étape 2 — Importer les questions (2 min)

1. **Table Editor** → table **questions** → bouton **Insert** → **Import data from CSV**.
2. Choisissez le fichier `questions.csv` (1 521 questions, généré depuis les banques du projet).
3. Vérifiez que les colonnes se correspondent une à une, puis **Import**.

> `questions.csv` contient la banque complète. Si vous avez modifié des questions
> à la main dans le Google Sheet (par exemple un début d'extrait), exportez plutôt
> l'onglet **Questions** du tableur en CSV : Fichier → Télécharger → CSV. Les
> en-têtes français devront alors être renommés comme ceux de `questions.csv`.

## Étape 3 — Reprendre l'historique du classement (facultatif)

Le classement général se recalcule tout seul à partir de la table `answers`.
Pour garder les parties déjà jouées :

1. Dans le Google Sheet, onglet **Réponses** → Fichier → Télécharger → **CSV**.
2. Onglet **Parties** → même chose.
3. Envoyez-moi les deux fichiers : je les convertis au format des tables
   `answers` et `parties`, colonne par colonne.

## Étape 4 — Récupérer les clés

Dans **Project Settings → API**, notez :

- **Project URL** : `https://xxxx.supabase.co`
- **anon public key** : elle part dans le code du site, c'est prévu pour.
- **service_role key** : ⚠️ SECRÈTE. Elle ne va que dans les Edge Functions,
  jamais dans une page web, jamais dans un dépôt GitHub public.

## Étape 5 — Le compte du maître du jeu

Le code PIN est remplacé par un vrai compte : **Authentication → Users → Add user**,
avec votre adresse et un mot de passe. C'est ce compte qui aura le droit de voir
les bonnes réponses et de piloter la partie.

## Ce qui reste à écrire (le code)

| Aujourd'hui (Apps Script) | Demain (Supabase) |
|---|---|
| `Code.gs` (menu, onglets, import) | `schema.sql` + import CSV ✅ |
| `Jeu.gs` (moteur de jeu) | Edge Function `jeu` (Deno/TypeScript) |
| `Classement.gs` | vues SQL `classement` ✅ |
| `Banque*.gs` | table `questions` ✅ |
| `Admin/Joueur/Ecran/Commun/Styles.html` | mêmes pages, servies par l'hébergeur |
| `rpc()` / `act()` + interrogation toutes les secondes | appels aux Edge Functions + temps réel |

Les pages d'interface sont reprises telles quelles : tous les appels au serveur
passent déjà par les deux fonctions `rpc()` et `act()`, c'est le seul endroit à
remplacer.
