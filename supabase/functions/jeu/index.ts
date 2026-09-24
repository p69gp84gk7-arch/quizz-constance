/**
 * Le Quizz de Constance — point d'entrée de la fonction serveur (Supabase Edge Function).
 *
 * Ce fichier ne fait que trois choses : ouvrir la connexion à la base avec la clé
 * secrète, vérifier que les actions « admin… » viennent bien du maître du jeu
 * connecté, et passer la main à actions.js (qui contient toute la logique).
 *
 * Déploiement : Supabase → Edge Functions → jeu. Aucune variable à régler :
 * SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournies automatiquement.
 *
 * Aucune bibliothèque n'est téléchargée au démarrage : db.js parle directement à
 * la base. C'est ce qui évite les réveils de 15 à 40 secondes.
 */

import { createDb } from './db.js';
import { createActions, ADMIN_ACTIONS } from './actions.js';

const db = createDb(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const handle = createActions(db);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

/** Le maître du jeu est un vrai compte Supabase : lui seul voit les bonnes réponses. */
async function requireMJ(req) {
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) throw new Error('Connexion du maître du jeu nécessaire.');
  const user = await db.getUser(jwt);
  if (!user) throw new Error('Connexion du maître du jeu nécessaire.');
}

Deno.serve(async (req) => {
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
