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

---

## Étape 6 — Mettre la base à jour (à refaire une fois)

Le moteur de jeu est écrit : la base a besoin de quelques tables de plus.

1. Supabase → **SQL Editor** → **New query**.
2. Collez de nouveau tout `schema.sql` (il a changé) et cliquez **Run**.

⚠️ Ce script **recrée les tables de jeu** (parties, joueurs, réponses) : elles sont
vides pour l'instant, donc rien n'est perdu. **Vos 1 521 questions ne sont pas touchées**,
c'est écrit noir sur blanc en tête du fichier.

## Étape 7 — Déployer la fonction serveur

1. Supabase → **Edge Functions** (colonne de gauche) → **Deploy a new function**
   → **Via Editor**.
2. Nom de la fonction : **`jeu`** (exactement, en minuscules).
3. Effacez le contenu de l'éditeur, puis collez tout le fichier
   **`supabase/functions/jeu/bundle.ts`** (1 414 lignes : les trois fichiers du
   serveur réunis, pour n'avoir qu'un copier-coller à faire).
4. Cliquez **Deploy function**.

Aucune clé à régler : Supabase fournit automatiquement `SUPABASE_URL` et
`SUPABASE_SERVICE_ROLE_KEY` à la fonction.

### Vérifier que ça répond

Dans le terminal (remplacez les deux valeurs par les vôtres) :

```sh
curl -s -X POST "https://VOTRE-PROJET.supabase.co/functions/v1/jeu" \
  -H "Authorization: Bearer VOTRE_CLE_ANON" \
  -H "Content-Type: application/json" \
  -d '{"action":"time"}'
```

Réponse attendue : `{"ok":true,"data":{"now":1758...},"now":1758...}`

## Étape 8 — Le compte du maître du jeu

**Authentication → Users → Add user** : votre adresse et un mot de passe.
Ce compte remplace le code PIN ; c'est lui qui aura le droit de voir les bonnes
réponses et de piloter la partie.

## Pour les curieux : comment c'est fait

- `supabase/functions/jeu/engine.js` — les règles du jeu, sans réseau ni base.
- `supabase/functions/jeu/actions.js` — les actions (créer, rejoindre, répondre…).
- `supabase/functions/jeu/index.ts` — l'entrée Deno et le contrôle du compte MJ.
- `supabase/functions/jeu/bundle.ts` — les trois réunis, **fichier engendré**,
  reconstruit par `node scripts/bundle.mjs`.
- `tests/` — les parties rejouées automatiquement : `npm test`.

---

## Étape 9 — Mettre à jour les deux classements

SQL Editor → New query → collez `supabase/maj-vues.sql` → **Run**.
Ça ajoute le « meilleur score » au classement général. Aucune donnée n'est touchée.

## Étape 10 — Mettre le site en ligne (Netlify)

1. Allez sur **netlify.com** → **Sign up** → **GitHub**, et autorisez l'accès.
2. **Add new site** → **Import an existing project** → **GitHub**.
3. Choisissez le dépôt **quizz-constance** (autorisez Netlify à le voir s'il le demande).
4. Ne changez rien : le fichier `netlify.toml` indique déjà quoi publier (`web`).
5. **Deploy**.

Au bout d'une minute, le site est en ligne à une adresse du type
`https://quelque-chose-12345.netlify.app`. Vous pouvez la renommer dans
**Site configuration → Change site name** (par exemple `quizz-constance`).

### Les trois adresses

| Qui | Adresse |
|---|---|
| Maître du jeu | `https://…netlify.app/` |
| Écran public (TV) | `https://…netlify.app/ecran.html` |
| Joueurs | `https://…netlify.app/joueur.html` (ou le QR code) |

L'écran public n'a pas besoin de code : il suit tout seul la dernière partie créée.

### À chaque modification

Un commit poussé sur GitHub redéploie le site tout seul, en une minute.
