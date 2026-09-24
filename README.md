# Le Quizz de Constance

Quiz de culture générale en direct : le maître du jeu pilote la partie sur son
écran, les joueurs répondent sur leur téléphone, et un écran public affiche les
questions (TV, HDMI, AirPlay).

## Où est quoi

| Dossier | Contenu |
|---|---|
| racine (`*.gs`, `*.html`) | version actuelle, Google Apps Script |
| `supabase/` | nouvelle base : `schema.sql`, `questions.csv`, `MIGRATION.md` |

## Migration en cours

Le jeu passe d'Apps Script à Supabase (base + temps réel) avec un site statique.
Voir `supabase/MIGRATION.md`.

## Règle de sécurité

La clé `service_role` de Supabase ne doit jamais se retrouver dans ce dépôt :
elle ne vit que dans les variables d'environnement des Edge Functions.
