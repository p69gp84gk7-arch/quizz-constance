-- Mémorise la date du dernier passage de chaque question, pour éviter de
-- resservir les mêmes d'une soirée à l'autre.
-- À coller dans Supabase → SQL Editor → Run.

alter table questions add column if not exists dernier_jeu timestamptz;
create index if not exists questions_dernier_jeu_idx on questions (dernier_jeu);
