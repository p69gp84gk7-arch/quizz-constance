/**
 * Le Quizz de Constance — point d'entrée de la fonction serveur (Supabase Edge Function).
 *
 * Ce fichier ne fait que trois choses : ouvrir la connexion à la base avec la clé
 * secrète, vérifier que les actions « admin… » viennent bien du maître du jeu
 * connecté, et passer la main à actions.js (qui contient toute la logique).
 *
 * Déploiement : Supabase → Edge Functions → jeu. Aucune variable à régler :
 * SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournies automatiquement.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { createActions, ADMIN_ACTIONS } from './actions.js';

const db = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const handle = createActions(db);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** Le maître du jeu est un vrai compte Supabase : lui seul voit les bonnes réponses. */
async function requireMJ(req: Request) {
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) throw new Error('Connexion du maître du jeu nécessaire.');
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data?.user) throw new Error('Connexion du maître du jeu nécessaire.');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    if (!action) return json({ ok: false, error: 'Action manquante.' }, 400);
    if (ADMIN_ACTIONS.has(action)) await requireMJ(req);
    const data = await handle(action, body);
    return json({ ok: true, data: data, now: Date.now() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const auth = /Connexion du maître du jeu/.test(msg);
    return json({ ok: false, error: msg }, auth ? 401 : 400);
  }
});
