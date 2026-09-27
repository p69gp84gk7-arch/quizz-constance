-- Les joueurs notent la difficulté des questions.
--
-- Après avoir répondu, chacun donne 1 à 5 étoiles. Cet avis rejoint le taux de
-- réussite et le temps de réponse pour corriger « difficulte_mesuree » : c'est
-- ce que le jeu utilise pour tirer les questions et décider quand il faut taper
-- la réponse au clavier.
-- À coller dans Supabase → SQL Editor → Run. Sans risque si déjà passé.

alter table answers   add column if not exists note int;          -- 1 à 5, donné par le joueur
alter table questions add column if not exists note_joueurs numeric;  -- moyenne des avis
alter table questions add column if not exists stats_notes  int;      -- combien d'avis

create or replace function recalculer_difficulte() returns int
language plpgsql security definer as $$
declare touchees int;
begin
  with stats as (
    select a.question_id,
           count(*)                                         as n,
           avg(case when a.correct then 1.0 else 0.0 end)    as p,
           avg(a.temps)                                     as t,
           count(a.note)                                    as m,   -- avis donnés
           avg(a.note)                                      as v    -- note moyenne
    from answers a
    where a.question_id is not null and a.correct is not null
    group by a.question_id
  ),
  calcul as (
    select s.question_id, s.n, s.p, s.t, s.m, s.v,
           -- 1. la note brute vient du taux de réussite : personne ne trouve = 5 étoiles
           (5.0 - 4.0 * s.p)
           -- 2. le temps affine : répondu très vite = plus facile, très lentement = plus dur
           + case when s.t is null then 0
                  when s.t <= 5  then -0.5
                  when s.t <= 10 then -0.2
                  when s.t >= 20 then  0.5
                  else 0 end                                as mesuree
    from stats s
  )
  update questions q
     set stats_n        = c.n,
         stats_reussite = round(100 * c.p, 1),
         stats_temps    = round(c.t, 1),
         stats_notes    = c.m,
         note_joueurs   = case when c.m > 0 then round(c.v::numeric, 2) else null end,
         -- 3. on mélange trois avis : la note d'origine, ce qu'on observe, ce que les
         --    joueurs en disent. Chaque étoile donnée pèse une observation et demie.
         difficulte_mesuree = case when c.n >= 4 or c.m >= 3 then
             round(greatest(1, least(5,
               (q.difficulte * 6.0 + c.mesuree * c.n + coalesce(c.v, 0) * 1.5 * c.m)
               / (6.0 + c.n + 1.5 * c.m)
             ))::numeric, 2)
           else null end
    from calcul c
   where c.question_id = q.id;

  select count(*) into touchees from questions where difficulte_mesuree is not null;
  return touchees;
end $$;

-- Recalcul immédiat avec l'historique existant
select recalculer_difficulte() as questions_reevaluees;
