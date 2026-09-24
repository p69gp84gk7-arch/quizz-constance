-- Mise à jour des deux vues de classement (ajout du meilleur score par joueur).
-- À coller dans Supabase → SQL Editor → Run. Ne touche à aucune donnée.

-- On supprime d'abord : Postgres refuse de changer l'ordre des colonnes d'une vue existante.
drop view if exists classement_par_theme;
drop view if exists classement;

create view classement as
with par_partie as (
  select game_code, pseudo, sum(points) as pts
  from answers where correct is not null
  group by game_code, pseudo
),
meilleur as (
  select pseudo, max(pts) as meilleur_score from par_partie group by pseudo
)
select
  a.pseudo,
  count(distinct a.game_code)                                        as parties,
  count(distinct a.game_code) filter (where p.vainqueur = a.pseudo)  as victoires,
  coalesce(sum(a.points), 0)                                         as points,
  count(*) filter (where a.correct)                                  as bonnes_reponses,
  count(*)                                                           as questions,
  round(100.0 * count(*) filter (where a.correct) / nullif(count(*), 0), 1) as reussite_pct,
  round(avg(a.temps), 1)                                             as temps_moyen_s,
  max(m.meilleur_score)                                              as meilleur_score,
  max(a.created_at)                                                  as derniere_partie
from answers a
left join parties p on p.code = a.game_code
left join meilleur m on m.pseudo = a.pseudo
where a.correct is not null
group by a.pseudo;

create view classement_par_theme as
select a.pseudo, a.theme,
       coalesce(sum(a.points), 0)        as points,
       count(*) filter (where a.correct) as bonnes_reponses,
       count(*)                          as questions
from answers a
where a.correct is not null and a.theme <> ''
group by a.pseudo, a.theme;

grant select on classement, classement_par_theme to anon, authenticated;
