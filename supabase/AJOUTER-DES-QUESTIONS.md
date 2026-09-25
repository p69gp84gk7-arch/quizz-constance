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

## En cas d'erreur « duplicate key »

C'est que le fichier a déjà été importé : les identifiants existent déjà.
Rien n'est cassé, il n'y a rien à faire.
