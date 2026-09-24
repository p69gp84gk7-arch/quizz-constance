/**
 * Vérifie le petit client de base (db.js) : les requêtes envoyées à PostgREST
 * sont-elles exactement celles attendues ? Un faux serveur HTTP local enregistre
 * chaque appel — aucune connexion à Supabase.
 */
import http from 'http';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const { createDb } = await import(path.join(ROOT, 'supabase/functions/jeu/db.js'));

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) fails++; };

/* ---------- faux PostgREST ---------- */
const seen = [];
let reply = { status: 200, body: '[]' };
const srv = http.createServer((req, res) => {
  let body = '';
  req.on('data', c => { body += c; });
  req.on('end', () => {
    seen.push({ method: req.method, url: req.url, headers: req.headers, body: body ? JSON.parse(body) : null });
    res.writeHead(reply.status, { 'Content-Type': 'application/json' });
    res.end(reply.body);
  });
});
await new Promise(r => srv.listen(0, r));
const url = 'http://127.0.0.1:' + srv.address().port;
const db = createDb(url, 'CLE-SECRETE');
const last = () => seen[seen.length - 1];

console.log('\n1. Lecture');
{
  reply = { status: 200, body: JSON.stringify([{ code: 'AB12', state: { status: 'LOBBY' } }]) };
  const r = await db.from('games').select('*').eq('code', 'AB12').maybeSingle();
  ok(last().method === 'GET', 'un select est un GET');
  ok(/^\/rest\/v1\/games\?/.test(last().url) && /code=eq\.AB12/.test(last().url) && /select=\*/.test(last().url),
    'filtre traduit correctement : ' + last().url);
  ok(last().headers.apikey === 'CLE-SECRETE' && /Bearer CLE-SECRETE/.test(last().headers.authorization), 'la clé de service est envoyée');
  ok(r.data && r.data.code === 'AB12' && !Array.isArray(r.data), 'maybeSingle rend un seul enregistrement');

  await db.from('questions').select('id,theme').range(0, 999);
  ok(last().headers.range === '0-999', 'la pagination passe par l\'en-tête Range');
  ok(/select=id,theme/.test(last().url), 'seules les colonnes demandées sont réclamées');

  await db.from('parties').select('*').order('jouee_le', { ascending: false }).limit(50);
  ok(/order=jouee_le\.desc/.test(last().url) && /limit=50/.test(last().url), 'tri et limite : ' + last().url);

  reply = { status: 200, body: '[]' };
  const vide = await db.from('games').select('*').eq('code', 'ZZZZ').maybeSingle();
  ok(vide.data === null && vide.error === null, 'aucun résultat = data nul, sans erreur');
}

console.log('\n2. Écriture');
{
  reply = { status: 201, body: '[]' };
  await db.from('players').insert({ game_code: 'AB12', pid: 'abc', pseudo: 'Zoé' });
  ok(last().method === 'POST' && last().url === '/rest/v1/players', 'insert = POST');
  ok(last().body.pseudo === 'Zoé', 'le contenu est transmis tel quel (accents compris)');

  await db.from('game_live').upsert({ code: 'AB12', seq: 7 }, { onConflict: 'code' });
  ok(/on_conflict=code/.test(last().url), 'upsert indique la colonne de conflit : ' + last().url);
  ok(/merge-duplicates/.test(last().headers.prefer), 'upsert demande la fusion plutôt qu\'une erreur');

  await db.from('players').upsert([{ game_code: 'AB12', pid: 'a' }, { game_code: 'AB12', pid: 'b' }], { onConflict: 'game_code,pid' });
  ok(Array.isArray(last().body) && last().body.length === 2, 'un upsert peut porter sur plusieurs lignes');
  ok(/on_conflict=game_code,pid/.test(last().url), 'conflit sur deux colonnes');

  reply = { status: 200, body: JSON.stringify([{ id: 12 }]) };
  const up = await db.from('answers').update({ correct: true }).eq('game_code', 'AB12').eq('q_index', '0').select('id');
  ok(last().method === 'PATCH', 'update = PATCH');
  ok(last().url === '/rest/v1/answers?game_code=eq.AB12&q_index=eq.0', 'les filtres s\'accumulent : ' + last().url);
  ok(/return=representation/.test(last().headers.prefer), 'avec .select(), on demande les lignes modifiées');
  ok(up.data.length === 1 && up.data[0].id === 12, 'les lignes modifiées sont rendues');

  reply = { status: 204, body: '' };
  await db.from('answers').delete().eq('game_code', 'AB12').eq('q_index', '3');
  ok(last().method === 'DELETE' && /q_index=eq\.3/.test(last().url), 'delete = DELETE avec ses filtres');
}

console.log('\n3. Erreurs');
{
  reply = { status: 409, body: JSON.stringify({ message: 'duplicate key value violates unique constraint', code: '23505' }) };
  const r = await db.from('answers').insert({ pid: 'x' });
  ok(r.error && /duplicate/.test(r.error.message), 'un doublon rend une erreur lisible');
  ok(r.error.code === '23505', 'le code d\'erreur Postgres est conservé');

  reply = { status: 500, body: 'boum' };
  const r2 = await db.from('games').select('*');
  ok(r2.error && r2.data === null, 'une panne serveur rend une erreur, jamais de fausses données');
}

console.log('\n4. Connexion du maître du jeu');
{
  reply = { status: 200, body: JSON.stringify({ id: 'uuid-123', email: 'mj@test.fr' }) };
  const u = await db.getUser('un-jeton');
  ok(u && u.id === 'uuid-123', 'un jeton valide identifie le maître du jeu');
  ok(/Bearer un-jeton/.test(last().headers.authorization), 'le jeton du navigateur est vérifié auprès de Supabase');

  reply = { status: 401, body: JSON.stringify({ message: 'invalid token' }) };
  ok((await db.getUser('faux')) === null, 'un jeton invalide est rejeté');
}

console.log('\n5. Garde-fou réseau');
{
  // un serveur qui ne répond jamais ne doit pas bloquer la partie éternellement
  const mort = http.createServer(() => { /* silence */ });
  await new Promise(r => mort.listen(0, r));
  // délais réduits pour le test : en production, 30 s puis 20 s
  const lent = createDb('http://127.0.0.1:' + mort.address().port, 'k', { timeoutMs: 400, retryMs: 300 });
  const t0 = Date.now();
  const p = lent.from('games').select('*');
  const r = await Promise.race([p, new Promise(res => setTimeout(() => res('toujours en attente'), 5000))]);
  const ms = Date.now() - t0;
  ok(r !== 'toujours en attente' && r.error && ms >= 700, 'une base muette rend la main avec une erreur, après une seconde tentative (' + ms + ' ms)');
  mort.close();
}

srv.close();
console.log(fails ? `\n❌ ${fails} test(s) en échec` : '\n✅ Tous les tests passent');
process.exit(fails ? 1 : 0);
