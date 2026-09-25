-- La difficulté se corrige d'elle-même d'après les parties jouées.
--
-- Chaque question garde la note d'origine (« difficulte »), mais le jeu utilise
-- « difficulte_mesuree » quand assez de joueurs y ont répondu : une question notée
-- 5 étoiles à laquelle tout le monde répond juste en 3 secondes redescend, et
-- inversement. Le maître du jeu voit les deux.
-- À coller dans Supabase → SQL Editor → Run.

alter table questions add column if not exists difficulte_mesuree numeric;
alter table questions add column if not exists stats_n        int;      -- réponses observées
alter table questions add column if not exists stats_reussite numeric;  -- % de bonnes réponses
alter table questions add column if not exists stats_temps    numeric;  -- temps moyen (s)

create or replace function recalculer_difficulte() returns int
language plpgsql security definer as $$
declare touchees int;
begin
  with stats as (
    select a.question_id,
           count(*)                                         as n,
           avg(case when a.correct then 1.0 else 0.0 end)    as p,
           avg(a.temps)                                      as t
    from answers a
    where a.question_id is not null and a.correct is not null
    group by a.question_id
  ),
  calcul as (
    select s.question_id, s.n, s.p, s.t,
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
         -- 3. on mélange avec la note d'origine : il faut des observations pour la déplacer
         difficulte_mesuree = case when c.n >= 4 then
             round(greatest(1, least(5,
               (q.difficulte * 6.0 + c.mesuree * c.n) / (6.0 + c.n)
             ))::numeric, 2)
           else null end
    from calcul c
   where c.question_id = q.id;

  select count(*) into touchees from questions where difficulte_mesuree is not null;
  return touchees;
end $$;

-- Premier calcul avec l'historique existant
select recalculer_difficulte() as questions_reevaluees;
