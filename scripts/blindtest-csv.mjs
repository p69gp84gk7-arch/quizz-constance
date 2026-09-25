/**
 * Transforme les extraits vérifiés (blindtest-retenus.json) en questions prêtes
 * à importer : supabase/questions-blindtest.csv
 *
 * Les trois mauvaises réponses sont tirées d'autres titres de la même catégorie
 * et d'une époque proche — le moteur les remplacera de toute façon par des pièges
 * adaptés au niveau, mais elles servent de secours.
 *
 * Usage : node scripts/blindtest-csv.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const retenus = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/blindtest-retenus.json'), 'utf8'));

/* ---------- la banque existante, pour ne pas créer de doublon ---------- */
function parseCsv(text) {
  const rows = []; let cur = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { cur.push(f); f = ''; }
    else if (c === '\n') { cur.push(f); rows.push(cur); cur = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || cur.length) { cur.push(f); rows.push(cur); }
  const head = rows[0];
  return rows.slice(1).filter(r => r.length === head.length)
    .map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const banque = parseCsv(fs.readFileSync(path.join(ROOT, 'supabase/questions.csv'), 'utf8'));
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const dejaLa = new Set(banque.map(r => norm(r.reponse)));
const dejaId = new Set(banque.map(r => norm(r.media_url)).filter(Boolean));

const epoqueDe = a => a < 1970 ? 'Avant 1970' : a < 1980 ? 'Années 70' : a < 1990 ? 'Années 80'
  : a < 2000 ? 'Années 90' : a < 2010 ? 'Années 2000' : a < 2020 ? 'Années 2010' : 'Années 2020';

/* ---------- réservoir de pièges : les titres de la banque, par catégorie ---------- */
const reservoir = {};
banque.filter(r => r.theme === 'Blind test musique' && r.question.includes('titre'))
  .forEach(r => { (reservoir[r.categorie] = reservoir[r.categorie] || []).push({ rep: r.reponse, epoque: r.epoque }); });

const doublons = [];
const nouvelles = [];
retenus.forEach(x => {
  const rep = `${x.artiste} – ${x.titre}`;
  if (dejaLa.has(norm(rep)) || dejaId.has(norm('https://www.youtube.com/watch?v=' + x.id))) {
    doublons.push(rep);
    return;
  }
  nouvelles.push({ ...x, rep: rep, epoque: epoqueDe(x.annee) });
});

/** Trois pièges : même catégorie, époque proche si possible, jamais le même artiste. */
function pieges(n) {
  const pool = (reservoir[n.cat] || []).concat(nouvelles.filter(o => o.cat === n.cat).map(o => ({ rep: o.rep, epoque: o.epoque })));
  const memeArtiste = r => norm(r.rep.split('–')[0]) === norm(n.artiste);
  const proches = pool.filter(r => r.epoque === n.epoque && !memeArtiste(r) && r.rep !== n.rep);
  const autres = pool.filter(r => r.epoque !== n.epoque && !memeArtiste(r) && r.rep !== n.rep);
  const melange = a => a.slice().sort(() => Math.random() - 0.5);
  const out = [];
  for (const r of melange(proches).concat(melange(autres))) {
    if (out.length >= 3) break;
    if (!out.includes(r.rep)) out.push(r.rep);
  }
  return out;
}

const HEAD = ['id', 'theme', 'categorie', 'difficulte', 'type', 'question', 'reponse', 'choix2', 'choix3', 'choix4',
  'explication', 'indices', 'media_url', 'media_debut', 'media_duree', 'actif', 'utilisations', 'epoque', 'anecdote'];

const cell = v => {
  v = v === undefined || v === null ? '' : String(v);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

const lignes = nouvelles.map((n, i) => {
  const f = pieges(n);
  return ['Q' + (2101 + i), 'Blind test musique', n.cat, n.diff, 'QCM', '🎵 Quel est ce titre ?',
    n.rep, f[0] || '', f[1] || '', f[2] || '', n.expl, '',
    'https://www.youtube.com/watch?v=' + n.id, 0, 15, 'oui', 0, n.epoque, ''];
});

// contrôles
lignes.forEach(l => {
  if (!l[6] || !l[12]) throw new Error('ligne incomplète : ' + l[0]);
  if ([7, 8, 9].some(j => l[j] === l[6])) throw new Error('piège identique à la réponse : ' + l[6]);
  if (!l[10] || l[10].length < 40) throw new Error('explication trop courte : ' + l[6]);
});

fs.writeFileSync(path.join(ROOT, 'supabase/questions-blindtest.csv'),
  [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n'));

const parCat = {}, parEpoque = {};
nouvelles.forEach(n => { parCat[n.cat] = (parCat[n.cat] || 0) + 1; parEpoque[n.epoque] = (parEpoque[n.epoque] || 0) + 1; });
console.log(`${lignes.length} extraits écrits → supabase/questions-blindtest.csv`);
console.log('par catégorie :', JSON.stringify(parCat));
console.log('par époque    :', JSON.stringify(parEpoque));
if (doublons.length) console.log('déjà dans la banque, ignorés : ' + doublons.join(', '));
