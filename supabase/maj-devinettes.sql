-- Autorise le nouveau type de question « INDICE » (les devinettes à 4 indices).
--
-- La table « questions » n'acceptait que cinq types : QCM, VF, ESTIMATION, ORDRE
-- et CARTE. Sans cette mise à jour, l'import de questions-devinettes.csv échoue
-- avec l'erreur 23514 (contrainte violée).
--
-- À passer AVANT d'importer supabase/questions-devinettes.csv.
-- Supabase → SQL Editor → New query → coller → Run. Sans risque si déjà passé.

-- On retire l'ancienne contrainte, quel que soit le nom que Postgres lui a donné.
do $$
declare nom text;
begin
  select conname into nom
    from pg_constraint
   where conrelid = 'questions'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%ESTIMATION%';
  if nom is not null then
    execute format('alter table questions drop constraint %I', nom);
  end if;
end $$;

alter table questions add constraint questions_type_check
  check (type in ('QCM', 'VF', 'ESTIMATION', 'ORDRE', 'CARTE', 'INDICE'));

-- Combien de devinettes sont déjà en base ? (0 avant l'import, 65 après)
select count(*) as devinettes_en_base from questions where type = 'INDICE';
