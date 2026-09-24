-- Le Quizz de Constance — base Supabase
-- À coller dans Supabase → SQL Editor → Run. Le script est ré-exécutable sans danger.
--
-- Principe de sécurité : les tables qui contiennent les bonnes réponses ne sont
-- JAMAIS lisibles depuis un téléphone. Les Edge Functions (clé secrète) écrivent
-- dans deux tables « vitrine » : game_live (tout le monde) et game_mj (maître du
-- jeu connecté). Le temps réel de Supabase pousse ces deux tables aux écrans.

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
create index if not exists questions_theme_idx on questions (theme, categorie);
create index if not exists questions_filtre_idx on questions (actif, type, difficulte);

-- ------------------------------------------------------------------
-- 2. Parties (état complet, réponses secrètes comprises)
-- ------------------------------------------------------------------
create table if not exists games (
  code        text primary key,
  created_at  timestamptz default now(),
  status      text not null default 'LOBBY',
  settings    jsonb not null default '{}',
  level       int  not null default 1,
  q_index     int  not null default -1,
  chap_index  int  not null default -1,
  chap_q      int  not null default 0,
  total       int  not null default 15,
  used        text[] not null default '{}',
  pool        jsonb not null default '[]',   -- questions tirées à l'avance, par chapitre
  current     jsonb,                          -- question en cours + bonne réponse
  reveal      jsonb,
  media       jsonb not null default '{"seq":0,"action":"stop"}',
  intro_end   timestamptz,                    -- fin du compte à rebours de 5 s
  started_at  timestamptz,                    -- départ du chrono
  ended_at    timestamptz
);
create index if not exists games_recent_idx on games (created_at desc);

-- Vitrine publique : un seul enregistrement par partie, réécrit à chaque
-- changement par les Edge Functions. C'est ce que lisent l'écran et les joueurs.
create table if not exists game_live (
  code        text primary key references games(code) on delete cascade,
  seq         bigint not null default 0,      -- incrémenté à chaque écriture
  status      text not null default 'LOBBY',
  state       jsonb not null default '{}',    -- question sans la réponse, joueurs, scores, compte à rebours
  updated_at  timestamptz default now()
);

-- Vitrine du maître du jeu : réponses en clair, indices, anecdote, bonne réponse.
create table if not exists game_mj (
  code        text primary key references games(code) on delete cascade,
  seq         bigint not null default 0,
  state       jsonb not null default '{}',
  updated_at  timestamptz default now()
);

-- La partie que l'écran public suit quand aucun code ne lui est donné.
create table if not exists app_state (
  id          int primary key default 1 check (id = 1),
  screen_game text,
  updated_at  timestamptz default now()
);
insert into app_state (id) values (1) on conflict do nothing;

-- ------------------------------------------------------------------
-- 3. Joueurs
-- ------------------------------------------------------------------
create table if not exists players (
  id          uuid primary key default gen_random_uuid(),
  game_code   text not null references games(code) on delete cascade,
  pseudo      text not null,
  jeton       text not null,                 -- secret du téléphone, sert à reprendre la main
  score       int not null default 0,
  streak      int not null default 0,
  team        text default '',
  alive       boolean not null default true,
  joker_used  boolean not null default false,
  kicked      boolean not null default false,
  last_seen   timestamptz default now(),
  joined_at   timestamptz default now(),
  unique (game_code, pseudo)
);
create index if not exists players_game_idx on players (game_code);

-- ------------------------------------------------------------------
-- 4. Réponses : le live ET l'historique du classement général
-- ------------------------------------------------------------------
create table if not exists answers (
  id          bigserial primary key,
  game_code   text not null references games(code) on delete cascade,
  player_id   uuid references players(id) on delete set null,
  pseudo      text not null,
  q_index     int  not null,
  chap_index  int  not null default 0,
  question_id text,
  theme       text default '',
  categorie   text default '',
  difficulte  int  default 1,
  valeur      jsonb,
  correct     boolean,
  temps_ms    int,
  points      int not null default 0,
  created_at  timestamptz default now(),
  unique (game_code, q_index, player_id)
);
create index if not exists answers_game_idx on answers (game_code, q_index);
create index if not exists answers_pseudo_idx on answers (pseudo);

-- ------------------------------------------------------------------
-- 5. Historique des parties + montages du MJ
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
-- 6. Classement général : calculé par la base, plus aucun recalcul à lancer
-- ------------------------------------------------------------------
create or replace view classement as
select
  a.pseudo,
  count(distinct a.game_code)                    as parties,
  count(distinct a.game_code) filter (where p.vainqueur = a.pseudo) as victoires,
  coalesce(sum(a.points), 0)                     as points,
  count(*) filter (where a.correct)              as bonnes_reponses,
  count(*)                                       as questions,
  round(100.0 * count(*) filter (where a.correct) / nullif(count(*), 0), 1) as reussite_pct,
  round(avg(a.temps_ms) / 1000.0, 1)             as temps_moyen_s,
  max(a.created_at)                              as derniere_partie
from answers a
left join parties p on p.code = a.game_code
group by a.pseudo;

create or replace view classement_par_theme as
select a.pseudo, a.theme,
       coalesce(sum(a.points), 0)        as points,
       count(*) filter (where a.correct) as bonnes_reponses,
       count(*)                          as questions
from answers a
group by a.pseudo, a.theme;

-- ------------------------------------------------------------------
-- 7. Sécurité (RLS)
--    Écriture : jamais depuis un navigateur, toujours par Edge Function.
--    Lecture  : game_live + joueurs + classement pour tous ;
--               game_mj + questions réservés au compte du maître du jeu.
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

drop policy if exists live_read     on game_live;
drop policy if exists players_read  on players;
drop policy if exists parties_read  on parties;
drop policy if exists app_read      on app_state;
drop policy if exists mj_read       on game_mj;
drop policy if exists mj_questions  on questions;
drop policy if exists mj_montages   on montages;

create policy live_read    on game_live for select to anon, authenticated using (true);
create policy players_read on players   for select to anon, authenticated using (true);
create policy parties_read on parties   for select to anon, authenticated using (true);
create policy app_read     on app_state for select to anon, authenticated using (true);
-- « authenticated » = le maître du jeu connecté avec son compte Supabase
create policy mj_read      on game_mj   for select to authenticated using (true);
create policy mj_questions on questions for select to authenticated using (true);
create policy mj_montages  on montages  for select to authenticated using (true);

grant select on classement, classement_par_theme to anon, authenticated;

-- ------------------------------------------------------------------
-- 8. Temps réel : Supabase pousse les changements, plus personne n'interroge
-- ------------------------------------------------------------------
do $$
begin
  execute 'alter publication supabase_realtime add table game_live';
exception when duplicate_object then null;
end $$;
do $$
begin
  execute 'alter publication supabase_realtime add table game_mj';
exception when duplicate_object then null;
end $$;
do $$
begin
  execute 'alter publication supabase_realtime add table players';
exception when duplicate_object then null;
end $$;
