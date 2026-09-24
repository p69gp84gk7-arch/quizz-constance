-- Accélère la création de partie : une colonne calculée par la base évite de
-- transporter le texte des 1 521 questions à chaque composition de quiz.
-- À coller dans Supabase → SQL Editor → Run. Aucune donnée n'est modifiée.

alter table questions add column if not exists est_annee boolean
  generated always as (
    question ~* '(en|quelle) ann[ée]e' and reponse ~ '^[[:space:]]*[0-9]{3,4}[[:space:]]*$'
  ) stored;

create index if not exists questions_annee_idx on questions (est_annee);
