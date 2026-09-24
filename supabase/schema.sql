-- Le Quizz de Constance — base Supabase
-- À coller dans Supabase → SQL Editor → Run. Ré-exécutable sans danger :
-- la table « questions » et ses 1 521 lignes ne sont JAMAIS touchées.
--
-- Sécurité : les bonnes réponses vivent dans « games.state » et dans « questions »,
-- deux tables qu'aucun téléphone ne peut lire. La fonction serveur (clé secrète)
-- recopie en permanence ce qui est publiable dans deux tables vitrines :
--   game_live → tout le monde (écran + joueurs)
--   game_mj   → le maître du jeu connecté
-- Le temps réel de Supabase pousse ces vitrines : plus personne n'interroge le serveur.

-- ------------------------------------------------------------------
-- 1. Questions (remplace l'onglet « Questions » du tableur)
-- ------------------------------------------------------------------
create table if not exists questions (
  id            text primary key,
  theme         text not null,
  categorie     text default '',
  difficulte    int  not null default 1 check (difficulte between 1 and 5),
  type          text not null default 'QCM' check (type in ('QCM','VF','ESTIMATION','ORDRE','CARTE')),
  question      text not null,
  reponse       text not null,
  choix2        text default '',
  choix3        text default '',
  choix4        text default '',
  explication   text default '',
  indices       text default '',
  media_url     text default '',
  media_debut   int  default 0,
  media_duree   int  default 15,
  actif         text default 'oui',
  utilisations  int  default 0,
  epoque        text default '',
  anecdote      text default '',
  created_at    timestamptz default now()
);
create index if not exists questions_theme_idx  on questions (theme, categorie);
create index if not exists questions_filtre_idx on questions (actif, type, difficulte);

-- ------------------------------------------------------------------
-- 2. Parties (on repart à zéro : ces tables ne contiennent que du jeu)
-- ------------------------------------------------------------------
drop table if exists answers   cascade;
drop table if exists players   cascade;
drop table if exists game_live cascade;
drop table if exists game_mj   cascade;
drop table if exists games     cascade;

-- État complet de la partie, bonnes réponses comprises. Illisible côté joueur.
create table games (
  code       text primary key,
  created_at timestamptz default now(),
  status     text not null default 'LOBBY',
  state      jsonb not null,
  ended_at   timestamptz
);
create index games_recent_idx on games (created_at desc);

-- Vitrine publique : l'écran et les téléphones ne lisent que ça.
create table game_live (
  code       text primary key references games(code) on delete cascade,
  seq        bigint not null default 0,
  status     text not null default 'LOBBY',
  state      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- Vitrine du maître du jeu : bonne réponse, indices, anecdote, réponses des joueurs.
create table game_mj (
  code       text primary key references games(code) on delete cascade,
  seq        bigint not null default 0,
  state      jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- La partie que l'écran suit quand on ne lui donne aucun code : la dernière créée.
create table if not exists app_state (
  id          int primary key default 1 check (id = 1),
  screen_game text,
  updated_at  timestamptz default now()
);
insert into app_state (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- 3. Joueurs (le « pid » est l'identifiant que le téléphone se donne)
-- ------------------------------------------------------------------
create table players (
  game_code  text not null references games(code) on delete cascade,
  pid        text not null,
  pseudo     text not null,
  data       jsonb not null default '{}',   -- score, bonnes réponses, série, vies, équipe, joker
  vis        text default 'visible',        -- « hidden » = le joueur a quitté l'appli
  exits      int  default 0,
  last_seen  timestamptz default now(),
  joined_at  timestamptz default now(),
  primary key (game_code, pid)
);
create unique index players_pseudo_idx on players (game_code, lower(pseudo));

-- ------------------------------------------------------------------
-- 4. Réponses : la question en cours ET l'historique du classement
-- ------------------------------------------------------------------
create table answers (
  id          bigserial primary key,
  game_code   text not null references games(code) on delete cascade,
  pid         text not null,
  pseudo      text not null,
  q_index     int  not null,
  valeur      jsonb,              -- la réponse telle qu'envoyée par le téléphone
  temps       numeric,            -- secondes
  -- complétés à la révélation
  chapitre    text default '',
  question_id text,
  theme       text default '',
  categorie   text default '',
  difficulte  int  default 1,
  correct     boolean,
  points      int  not null default 0,
  reponse_txt text default '',
  created_at  timestamptz default now(),
  unique (game_code, q_index, pid)
);
create index answers_game_idx   on answers (game_code, q_index);
create index answers_pseudo_idx on answers (lower(pseudo));

-- Dès qu'une réponse arrive, le compteur « x sur y ont répondu » est poussé à tous
-- les écrans, sans que le serveur ait quoi que ce soit à faire.
create or replace function bump_answered() returns trigger language plpgsql security definer as $$
declare n int;
begin
  select count(*) into n from answers
   where game_code = new.game_code and q_index = new.q_index;
  update game_live
     set state = jsonb_set(state, '{answeredCount}', to_jsonb(n)),
         seq = seq + 1, updated_at = now()
   where code = new.game_code
     and status in ('QUESTION', 'INTRO')          -- pas pendant la correction
     and coalesce((state->>'qIndex')::int, -1) = new.q_index;
  return new;
end $$;

drop trigger if exists answers_bump on answers;
create trigger answers_bump after insert on answers
for each row execute function bump_answered();

-- ------------------------------------------------------------------
-- 5. Historique des parties + montages du maître du jeu
-- ------------------------------------------------------------------
create table if not exists parties (
  code         text primary key,
  jouee_le     timestamptz default now(),
  chapitres    text default '',
  nb_questions int default 0,
  mode_points  text default '',
  nb_joueurs   int default 0,
  vainqueur    text default '',
  score        int default 0,
  podium       jsonb default '[]'
);

create table if not exists montages (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null unique,
  description text default '',
  config      jsonb not null,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------------
-- 6. Classement général : calculé par la base, aucun recalcul à lancer
-- ------------------------------------------------------------------
-- On supprime d'abord : Postgres refuse de changer l'ordre des colonnes d'une vue existante.
drop view if exists classement_par_theme;
drop view if exists classement;

create view classement as
with par_partie as (
  select game_code, pseudo, sum(points) as pts
  from answers where correct is not null
  group by game_code, pseudo
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
  (select max(pp.pts) from par_partie pp where pp.pseudo = a.pseudo)  as meilleur_score,
  max(a.created_at)                                                  as derniere_partie
from answers a
left join parties p on p.code = a.game_code
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

-- ------------------------------------------------------------------
-- 7. Sécurité (RLS)
--    Écriture : jamais depuis un navigateur, toujours par la fonction serveur.
--    Lecture  : la vitrine publique et les classements pour tous,
--               la vitrine du MJ et les questions pour le compte connecté.
-- ------------------------------------------------------------------
alter table questions  enable row level security;
alter table games      enable row level security;
alter table game_live  enable row level security;
alter table game_mj    enable row level security;
alter table app_state  enable row level security;
alter table players    enable row level security;
alter table answers    enable row level security;
alter table parties    enable row level security;
alter table montages   enable row level security;

drop policy if exists live_read    on game_live;
drop policy if exists app_read     on app_state;
drop policy if exists parties_read on parties;
drop policy if exists mj_live      on game_mj;
drop policy if exists mj_answers   on answers;
drop policy if exists mj_players   on players;
drop policy if exists mj_questions on questions;
drop policy if exists mj_montages  on montages;

-- tout le monde (les joueurs et l'écran, sans compte)
create policy live_read    on game_live for select to anon, authenticated using (true);
create policy app_read     on app_state for select to anon, authenticated using (true);
create policy parties_read on parties   for select to anon, authenticated using (true);
-- le maître du jeu, connecté avec son compte Supabase
create policy mj_live      on game_mj   for select to authenticated using (true);
create policy mj_answers   on answers   for select to authenticated using (true);
create policy mj_players   on players   for select to authenticated using (true);
create policy mj_questions on questions for select to authenticated using (true);
create policy mj_montages  on montages  for select to authenticated using (true);

grant select on classement, classement_par_theme to anon, authenticated;

-- ------------------------------------------------------------------
-- 8. Temps réel : Supabase pousse, personne n'interroge
-- ------------------------------------------------------------------
do $$ begin
  execute 'alter publication supabase_realtime add table game_live';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table game_mj';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table answers';
exception when duplicate_object then null; end $$;
do $$ begin
  execute 'alter publication supabase_realtime add table players';
exception when duplicate_object then null; end $$;
