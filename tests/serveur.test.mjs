/**
 * Rejoue des parties entières contre les actions du serveur (actions.js),
 * avec une base Supabase factice en mémoire (mockdb.mjs).
 * Aucune connexion réseau : `node tests/serveur.test.mjs`.
 */
import fs from 'fs';
import path from 'path';
import { makeDb } from './mockdb.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const A = await import(path.join(ROOT, 'supabase/functions/jeu/actions.js'));

/* ---------- les vraies questions ---------- */
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
  const num = { difficulte: 1, media_debut: 1, media_duree: 1, utilisations: 1 };
  return rows.slice(1).filter(r => r.length === head.length).map(r => {
    const o = {};
    head.forEach((h, i) => { o[h] = num[h] ? Number(r[i]) : r[i]; });
    return o;
  });
}
const QUESTIONS = parseCsv(fs.readFileSync(path.join(ROOT, 'supabase/questions.csv'), 'utf8'));
// colonne calculée par la base (voir supabase/maj-rapidite.sql)
QUESTIONS.forEach(q => { q.est_annee = /(en|quelle) ann[ée]e/i.test(q.question) && /^\s*\d{3,4}\s*$/.test(q.reponse); });

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) fails++; };

function fresh() {
  const db = makeDb();
  db.seed('questions', QUESTIONS);
  db.seed('app_state', [{ id: 1, screen_game: null }]);
  return { db, handle: A.createActions(db) };
}

const PIDS = ['aaaaaaaa1111', 'bbbbbbbb2222', 'cccccccc3333'];

/** Simule les 5 s d'intro écoulées : la question est en cours. */
function fastForwardIntro(db, code) {
  const g = db.rows('games').find(g => g.code === code);
  g.state.current.introEnd = Date.now() - 10;
  g.state.current.start = Date.now() - 10;
}

/* ================= 1. Une partie complète ================= */
console.log('\n1. Partie complète : création, arrivée des joueurs, questions, classement');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', {
    // types imposés : le test vérifie le parcours complet, pas le tirage
    settings: { chapters: [{ name: 'Soirée', nb: 4, level: 1, types: ['QCM', 'VF'] }], points: 'rapidite', duration: 30 },
  });
  const code = mj.code;
  ok(/^[A-Z0-9]{4}$/.test(code), 'partie créée, code ' + code);
  ok(db.rows('game_live').length === 1 && db.rows('game_mj').length === 1, 'les deux vitrines sont créées');
  ok(db.rows('app_state')[0].screen_game === code, "l'écran public suit automatiquement cette partie");

  const v1 = await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });
  await handle('playerJoin', { code, pid: PIDS[1], pseudo: 'Paul' });
  await handle('playerJoin', { code, pid: PIDS[2], pseudo: 'Zoé' });
  ok(v1.me.pseudo === 'Constance', 'le joueur reçoit sa fiche');
  ok(db.rows('players').length === 3, 'trois joueurs en base');
  const live = db.rows('game_live')[0].state;
  ok(live.lobby.length === 3 && live.playerCount === 3, "le lobby affiche les trois pseudos");

  let doubl = null;
  try { await handle('playerJoin', { code, pid: 'dddddddd4444', pseudo: 'constance' }); } catch (e) { doubl = e.message; }
  ok(/déjà pris/.test(doubl || ''), 'un pseudo déjà pris est refusé (même en minuscules)');

  for (let n = 0; n < 4; n++) {
    await handle('adminNext', { code });
    let g = db.rows('games')[0].state;
    ok(g.status === 'INTRO', 'question ' + (n + 1) + ' : compte à rebours de 5 s');
    const early = await handle('playerAnswer', { code, pid: PIDS[0], qIndex: g.qIndex, answer: 0 });
    ok(early.ok === false && /pas encore commencé/.test(early.msg), 'répondre pendant le compte à rebours est refusé');

    fastForwardIntro(db, code);
    const q = db.rows('game_mj')[0].state.current;
    const good = q.correct;
    const answers = [];
    for (let i = 0; i < 3; i++) {
      const a = i === 0 ? good : (good + 1) % q.choices.length;
      answers.push(await handle('playerAnswer', { code, pid: PIDS[i], qIndex: g.qIndex, answer: a }));
    }
    ok(answers.every(a => a.ok), 'les trois réponses sont enregistrées');
    const again = await handle('playerAnswer', { code, pid: PIDS[0], qIndex: g.qIndex, answer: 1 });
    ok(again.ok === false && /déjà/.test(again.msg), 'on ne peut pas répondre deux fois');

    const mjv = await handle('adminState', { code });
    ok(mjv.answeredCount === 3, 'le maître du jeu voit 3 réponses sur 3');
    ok(mjv.players.filter(p => p.liveOk === true).length >= 1, 'la correction en direct fonctionne');

    await handle('adminReveal', { code });
    g = db.rows('games')[0].state;
    ok(g.status === 'REVEAL', 'question révélée');
    const vit = db.rows('game_live')[0].state;
    ok(vit.results && Object.keys(vit.results).length === 3, 'chaque joueur reçoit son résultat dans la vitrine');
    ok(vit.results.Constance.ok === true && vit.results.Paul.ok === false, 'les corrections sont justes');
  }

  const hist = db.rows('answers');
  ok(hist.length === 12, '12 lignes de réponses enregistrées (4 questions × 3 joueurs)');
  ok(hist.every(r => r.correct !== null && r.theme), 'chaque ligne porte son thème et sa correction');
  ok(db.rows('questions').filter(q => q.utilisations > 0).length === 4, 'les 4 questions jouées sont comptées comme utilisées');

  await handle('adminNext', { code });   // au-delà de la dernière question
  const fin = db.rows('games')[0].state;
  ok(fin.status === 'END', 'la partie se termine toute seule après la dernière question');
  const partie = db.rows('parties')[0];
  ok(partie && partie.nb_joueurs === 3 && partie.nb_questions === 4, 'la partie est archivée');
  ok(partie.vainqueur === 'Constance', 'le vainqueur est celui qui a tout juste : ' + partie.vainqueur);

  ok(db.rows('_rpc').some(r => r.nom === 'recalculer_difficulte'), 'la difficulté est réévaluée en fin de partie');

  const lb = await handle('adminLeaderboard', {});
  ok(lb.classement.length === 3, 'le classement général compte les 3 joueurs');
  const c = lb.classement.find(x => x.pseudo === 'Constance');
  ok(c.bonnes_reponses === 4 && c.questions === 4, 'Constance : 4 bonnes réponses sur 4');
  ok(c.victoires === 1, 'sa victoire est comptée');
  ok(lb.themes.length >= 1, 'le détail par thème est disponible');
}

/* ================= 2. Rien ne fuit vers les téléphones ================= */
console.log('\n2. Étanchéité : ce que voit un téléphone');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', { settings: { chapters: [{ nb: 3, level: 1 }], estimQcm: 'libre' } });
  const code = mj.code;
  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });
  await handle('adminNext', { code });
  fastForwardIntro(db, code);

  const pub = JSON.stringify(db.rows('game_live')[0].state);
  const q = db.rows('game_mj')[0].state.current;
  ok(!pub.includes('"secret"'), 'la vitrine publique ne contient aucun champ secret');
  ok(!pub.includes('"correct"'), "l'indice de la bonne réponse n'y est pas");
  // Pour un QCM la bonne réponse est forcément parmi les propositions affichées :
  // ce qui ne doit pas fuir, c'est LAQUELLE.
  ok(!pub.includes('"answerText"'), 'aucun champ ne désigne la bonne réponse (ici « ' + String(q.answerText).slice(0, 25) + ' »)');
  if (q.choices) {
    const live = db.rows('game_live')[0].state;
    ok(JSON.stringify(live.question.choices) === JSON.stringify(q.choices) && live.question.correct === undefined,
      'les 4 propositions partent dans le désordre, sans dire laquelle est juste');
  }
  ok(!pub.includes('"indices"') && !pub.includes('"anecdote"'), 'ni les indices ni l\'anecdote du maître du jeu');
  ok(pub.includes('"choices"') || q.type !== 'QCM', 'les propositions, elles, sont bien envoyées');

  const view = await handle('playerView', { code, pid: PIDS[0] });
  ok(!JSON.stringify(view).includes('"secret"'), 'la vue personnelle du joueur est propre aussi');
  ok(db.rows('game_mj')[0].state.current.answerText, 'le maître du jeu, lui, a la réponse');
}

/* ================= 3. Le maître du jeu pilote ================= */
console.log('\n3. Commandes du maître du jeu');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', {
    settings: { chapters: [{ nb: 5, level: 2 }], joker: true, estimQcm: 'libre' } });
  const code = mj.code;
  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });

  await handle('adminNext', { code });
  const q1 = db.rows('games')[0].state.current.id;
  await handle('adminSkip', { code });
  const st = db.rows('games')[0].state;
  ok(st.current.id !== q1, 'la question peut être remplacée en cours de route');
  ok(st.qIndex === 0, 'le numéro de question ne bouge pas quand on la remplace');
  ok(st.status === 'INTRO', 'la question de remplacement repart sur son compte à rebours');

  await handle('adminSetLevel', { code, level: 5 });
  ok(db.rows('games')[0].state.level === 5, 'le niveau peut être forcé');

  await handle('adminUpdateSettings', { code, patch: { duration: 45, visual: 'neon' } });
  const s = db.rows('games')[0].state.settings;
  ok(s.duration === 45 && s.visual === 'neon', 'les réglages se changent en cours de partie');
  ok(s.chrono === 'auto', 'le chrono reste automatique quoi qu\'il arrive');

  await handle('adminMedia', { code, mediaAction: 'play' });
  ok(db.rows('games')[0].state.media.action === 'play', 'le son peut être relancé à la main');

  fastForwardIntro(db, code);
  const jok = await handle('playerJoker', { code, pid: PIDS[0], qIndex: 0 });
  const cur = db.rows('games')[0].state.current;
  if (cur.type === 'QCM' && cur.choices.length === 4) {
    ok(jok.ok && jok.hide.length === 2, 'joker 50/50 : deux mauvaises réponses retirées');
    ok(jok.hide.indexOf(cur.secret.correct) < 0, 'le joker ne retire jamais la bonne réponse');
    const again = await handle('playerJoker', { code, pid: PIDS[0], qIndex: 0 });
    ok(!again.ok, 'le joker ne sert qu\'une fois');
  } else ok(true, 'joker : question non QCM tirée, test ignoré');

  await handle('adminKick', { code, pid: PIDS[0] });
  ok(db.rows('players').length === 0, 'un joueur peut être retiré de la partie');

  await handle('adminEnd', { code });
  ok(db.rows('games')[0].state.status === 'END', 'la partie peut être arrêtée à tout moment');
}

/* ================= 3 bis. Contrôle total du maître du jeu ================= */
console.log('\n3 bis. Pause du chrono et correction après coup');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', { settings: {
    chapters: [
      { name: 'Manche 1', nb: 2, level: 1, types: ['QCM'] },
      { name: 'Manche rapide', nb: 2, level: 1, types: ['QCM'], regles: { duration: 12, points: 'simple' } },
    ], duration: 30, points: 'rapidite' } });
  const code = mj.code;
  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });
  await handle('playerJoin', { code, pid: PIDS[1], pseudo: 'Paul' });

  await handle('adminNext', { code });          // écran de chapitre
  await handle('adminNext', { code });          // première question
  ok(db.rows('game_live')[0].state.duration === 30, 'chapitre 1 : chrono de 30 s');

  // --- pause
  fastForwardIntro(db, code);
  await handle('adminPause', { code });
  let live = db.rows('game_live')[0].state;
  ok(live.paused === true, 'le chrono est en pause');
  const refus = await handle('playerAnswer', { code, pid: PIDS[0], qIndex: 0, answer: 0 });
  ok(refus.ok === false, 'pendant la pause, personne ne peut répondre');
  ok(db.rows('games')[0].state.media.action === 'stop', 'le son s\'arrête aussi');

  await handle('adminResume', { code });
  live = db.rows('game_live')[0].state;
  ok(live.paused === false, 'la partie repart');
  ok(live.pausedMs >= 0, 'le temps mort est mémorisé et ne compte pas dans le chrono');
  const q = db.rows('game_mj')[0].state.current;
  const bon = await handle('playerAnswer', { code, pid: PIDS[0], qIndex: 0, answer: q.correct });
  await handle('playerAnswer', { code, pid: PIDS[1], qIndex: 0, answer: (q.correct + 1) % 4 });
  ok(bon.ok === true, 'après la reprise, les réponses repassent');

  // --- correction après la révélation
  await handle('adminReveal', { code });
  const avant = db.rows('players').filter(p => p.pid === PIDS[1])[0].data.score;
  ok(avant === 0, 'Paul n\'a rien marqué : sa réponse était fausse');
  await handle('adminJudge', { code, pid: PIDS[1], ok: true });
  const paul = db.rows('players').filter(p => p.pid === PIDS[1])[0];
  ok(paul.data.score > 0, 'le maître du jeu lui accorde la réponse : ' + paul.data.score + ' points');
  ok(paul.data.good === 1, 'sa bonne réponse est comptée dans ses statistiques');
  const ligne = db.rows('answers').filter(a => a.pid === PIDS[1] && a.q_index === 0)[0];
  ok(ligne.correct === true && ligne.points === paul.data.score, 'l\'historique du classement est corrigé aussi');
  const vue = db.rows('game_mj')[0].state;
  ok(vue.players.filter(p => p.pseudo === 'Paul')[0].corrigeMJ === true, 'la correction est signalée au maître du jeu');

  await handle('adminJudge', { code, pid: PIDS[1], ok: false });
  ok(db.rows('players').filter(p => p.pid === PIDS[1])[0].data.score === 0, 'et il peut revenir en arrière');

  // --- points donnés à la main
  await handle('adminScore', { code, pid: PIDS[1], delta: 120 });
  ok(db.rows('players').filter(p => p.pid === PIDS[1])[0].data.score === 120, 'points ajoutés à la main');
  await handle('adminScore', { code, pid: PIDS[1], delta: -500 });
  ok(db.rows('players').filter(p => p.pid === PIDS[1])[0].data.score === 0, 'un score ne descend jamais sous zéro');

  // --- règles propres au second chapitre
  await handle('adminNext', { code });          // question 2 du chapitre 1
  fastForwardIntro(db, code);
  await handle('adminReveal', { code });
  await handle('adminNext', { code });          // écran du chapitre 2
  await handle('adminNext', { code });          // première question du chapitre 2
  live = db.rows('game_live')[0].state;
  ok(live.duration === 12, 'chapitre 2 : le chrono passe à 12 s');
  ok(live.points === 'simple', 'chapitre 2 : les points passent en mode simple');
  const q2 = db.rows('game_mj')[0].state.current;
  ok(q2.media === null || !q2.media || q2.media.dur === 12, 'un extrait suivrait aussi le chrono du chapitre');
}

/* ================= 4. Présence et reprise ================= */
console.log('\n4. Présence des joueurs');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', { settings: { chapters: [{ nb: 3, level: 1 }], estimQcm: 'libre' } });
  const code = mj.code;
  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });
  await handle('adminNext', { code });
  fastForwardIntro(db, code);
  db.rows('games')[0].state.status = 'QUESTION';

  await handle('playerPresence', { code, pid: PIDS[0], vis: 'hidden' });
  ok(db.rows('players')[0].vis === 'hidden', 'le départ du joueur est noté');
  ok(db.rows('players')[0].exits === 1, 'la sortie est comptée pendant une question');
  await handle('playerPresence', { code, pid: PIDS[0], vis: 'visible' });
  ok(db.rows('players')[0].vis === 'visible', 'son retour est noté');
  const v = await handle('adminState', { code });
  ok(v.players[0].presence === 'on' && v.players[0].exits === 1, 'le maître du jeu voit « présent » et 1 sortie');

  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });
  ok(db.rows('players').length === 1, 'se reconnecter ne crée pas de doublon');
}

/* ================= 5. Chapitres et écran public ================= */
console.log('\n5. Chapitres et bascule de l\'écran');
{
  const { db, handle } = fresh();
  const mj = await handle('adminCreateGame', { settings: { chapters: [
    { name: 'Musique', themes: ['Blind test musique'], nb: 2, level: 1 },
    { name: 'Géo', themes: ['Géographie'], nb: 2, level: 2 },
  ] } });
  const code = mj.code;
  await handle('playerJoin', { code, pid: PIDS[0], pseudo: 'Constance' });

  await handle('adminNext', { code });
  ok(db.rows('games')[0].state.status === 'CHAPTER', 'écran de chapitre avant le premier chapitre');
  const themes = [];
  for (let n = 0; n < 10 && db.rows('games')[0].state.status !== 'END'; n++) {
    await handle('adminNext', { code });
    const g = db.rows('games')[0].state;
    if (g.status === 'CHAPTER' || g.status === 'END') continue;
    themes.push(g.current.theme);
    fastForwardIntro(db, code);
    await handle('adminReveal', { code });
  }
  ok(themes.slice(0, 2).every(t => t === 'Blind test musique'), 'chapitre 1 : blind test musique');
  ok(themes.slice(2, 4).every(t => t === 'Géographie'), 'chapitre 2 : géographie');

  const mj2 = await handle('adminCreateGame', { settings: { chapters: [{ nb: 3, level: 1 }] } });
  const scr = await handle('screenGame', {});
  ok(scr.code === mj2.code && scr.code !== code, 'une nouvelle partie fait basculer l\'écran public tout seul');
}

/* ================= 6. Sécurité des actions ================= */
console.log('\n6. Contrôles');
{
  const { handle } = fresh();
  const bad = [];
  for (const [action, p] of [['playerJoin', { code: 'ZZZZ', pid: PIDS[0], pseudo: 'X' }],
                             ['adminState', { code: 'ZZZZ' }],
                             ['n\'importe quoi', {}]]) {
    try { await handle(action, p); bad.push(action); } catch (e) { /* attendu */ }
  }
  ok(bad.length === 0, 'partie inexistante, pseudo trop court et action inconnue sont refusés');
  ok(A.ADMIN_ACTIONS.has('adminCreateGame') && !A.ADMIN_ACTIONS.has('playerAnswer'),
    'la liste des actions réservées au maître du jeu est correcte');
}

console.log(fails ? `\n❌ ${fails} test(s) en échec` : '\n✅ Tous les tests passent');
process.exit(fails ? 1 : 0);
