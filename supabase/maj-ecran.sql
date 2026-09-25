-- L'écran public affiche qui a répondu et en combien de temps, en direct.
-- Le déclencheur complète la vitrine à chaque réponse reçue.
-- À coller dans Supabase → SQL Editor → Run.

create or replace function bump_answered() returns trigger language plpgsql security definer as $$
declare n int;
begin
  select count(*) into n from answers
   where game_code = new.game_code and q_index = new.q_index;
  update game_live
     set state = jsonb_set(
                   jsonb_set(state, '{answeredCount}', to_jsonb(n)),
                   '{answered}',
                   coalesce(state -> 'answered', '[]'::jsonb)
                     || jsonb_build_object('pseudo', new.pseudo, 't', new.temps)
                 ),
         seq = seq + 1,
         updated_at = now()
   where code = new.game_code
     and status in ('QUESTION', 'INTRO')          -- pas pendant la correction
     and coalesce((state->>'qIndex')::int, -1) = new.q_index;
  return new;
end $$;

drop trigger if exists answers_bump on answers;
create trigger answers_bump after insert on answers
for each row execute function bump_answered();
