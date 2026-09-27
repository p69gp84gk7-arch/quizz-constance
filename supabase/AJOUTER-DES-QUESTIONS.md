# Ajouter des questions à la banque

Les nouvelles questions arrivent sous forme de fichier CSV, à importer dans Supabase.
Les questions déjà présentes ne sont jamais touchées : seules les nouvelles lignes s'ajoutent.

## Marche à suivre (2 minutes)

1. Supabase → **Table Editor** → table **questions**.
2. Bouton vert **Insert** → **Import data from CSV**.
3. Choisissez le fichier, par exemple `supabase/questions-repliques.csv`
   (Finder : Départ → Developer → quizz-constance → supabase).
4. Vérifiez que les colonnes se correspondent, puis **Import**.
5. Dans l'interface du maître du jeu, **rechargez la page** : le catalogue est relu
   à la connexion, sinon les nouvelles questions n'apparaissent pas dans la préparation.

## Fichiers disponibles

| Fichier | Contenu |
|---|---|
| `questions.csv` | la banque d'origine, 1 521 questions (déjà importée) |
| `questions-repliques.csv` | 58 répliques de film, thème Cinéma, catégorie Répliques |
| `questions-blindtest.csv` | 105 extraits musicaux, thème Blind test musique |
| `questions-dates.csv` | 73 questions de dates : « Que s'est-il passé en 1969 ? » et classements chronologiques |
| `questions-devinettes.csv` | 65 devinettes à 4 indices (38 personnalités, des lieux, des films, des animaux) |
| `questions-citations.csv` | 70 questions du thème « Citations & expressions » : proverbes à trou, phrases célèbres, sens d'expressions |
| `questions-nouveaux-themes.csv` | 108 questions dans 8 nouveaux thèmes (mythologie, espace, corps humain, inventions, séries, marques, contes, transports) |
| `questions-complement.csv` | 734 questions de plus : chacun des 9 nouveaux thèmes atteint 100 questions |

Importez-les l'un après l'autre : l'ordre n'a pas d'importance.

## Les devinettes : un script SQL d'abord

Les devinettes utilisent un type de question que la base ne connaissait pas.
**Avant** d'importer `questions-devinettes.csv`, passez une fois
`supabase/maj-devinettes.sql` dans **SQL Editor** → **Run**.

Sans lui, l'import échoue avec l'erreur **23514** (« contrainte violée »).

## Les devinettes, en détail

Une devinette (`type = INDICE`) porte ses quatre indices dans la colonne **choix2**,
séparés par une barre verticale : `indice 1 | indice 2 | indice 3 | indice 4`.
Ils se découvrent l'un après l'autre pendant le chrono — trouver dès le premier
rapporte le double de points. Les colonnes **choix3** et **choix4** servent de
mauvaises réponses de secours quand la question se joue en QCM.

On peut aussi en écrire une depuis l'interface : onglet **Questions**, type
**🕵️ Devinette**, puis les quatre indices dans les cases prévues.

## Les illustrations

`supabase/maj-illustrations.sql` n'ajoute pas de questions : il **met des photos sur
des questions déjà en banque**. Ce n'est donc pas un import CSV mais un script à
coller dans **SQL Editor** → **Run**.

Les photos viennent de Wikimedia Commons, en domaine public ou sous licence libre.
Deux règles tenues par le script : la photo montre le **sujet** de la question,
jamais sa réponse (sinon la question serait offerte), et le nom de l'auteur
s'affiche en petit sous l'image, comme les licences le demandent.

Pour en ajouter d'autres, complétez la liste `SUJETS` dans `scripts/illustrations.mjs`
puis relancez `node scripts/illustrations.mjs`. Le travail déjà fait est conservé.

## En cas d'erreur « duplicate key »

C'est que le fichier a déjà été importé : les identifiants existent déjà.
Rien n'est cassé, il n'y a rien à faire.
