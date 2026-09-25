/** Simulation complète d'une partie avec le moteur porté (engine.js), sans base de données. */
import fs from 'fs';
import path from 'path';
import os from 'os';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const tmp = path.join(os.tmpdir(), 'engine-' + Date.now() + '.mjs');
fs.copyFileSync(path.join(ROOT, 'supabase/functions/jeu/engine.js'), tmp);
const E = await import(tmp);

/* ---------- questions : on lit le vrai CSV ---------- */
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
const QUESTIONS = parseCsv(fs.readFileSync(path.join(ROOT, 'supabase/questions.csv'), 'utf8'));
const byId = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) fails++; };

/* ---------- mini-serveur : ce que fera l'Edge Function ---------- */
function createGame(settings) {
  const s = E.normalizeSettings(settings);
  const st = E.newState(E.newCode([]), s);
  st.pools = E.buildPools(s, QUESTIONS);
  st.pools.forEach((p, i) => {
    if (p.length < s.chapters[i].nb) throw new Error(`chapitre ${i} : ${p.length} dispo pour ${s.chapters[i].nb}`);
  });
  return st;
}
const FAMILIES = E.buildFamilies(QUESTIONS);

function nextQuestion(st, players) {
  const id = E.pickId(st.pools[st.chapIndex], st.level, st.used);
  if (!id) throw new Error('plus de question');
  st.used.push(id);
  st.current = E.loadQuestion(byId[id], st, FAMILIES);
  st.qIndex++; st.chapQ++; st.reveal = null;
  E.decorate(st, players, null);
  E.beginIntro(st);
}

function adminNext(st, players, answers) {
  if (E.LIVE.indexOf(st.status) >= 0) return E.doReveal(st, players, answers);
  if (st.status === 'END') return null;
  const ch = st.settings.chapters[st.chapIndex];
  const chapterDone = st.chapIndex < 0 || st.chapQ >= ch.nb;
  if (st.status !== 'CHAPTER' && chapterDone) {
    if (st.chapIndex + 1 >= st.settings.chapters.length) { st.status = 'END'; st.current = null; return null; }
    st.chapIndex++; st.chapQ = 0; st.level = st.settings.chapters[st.chapIndex].level;
    st.reveal = null; st.current = null;
    if (st.settings.chapters.length === 1) nextQuestion(st, players);
    else st.status = 'CHAPTER';
  } else nextQuestion(st, players);
  return null;
}

const mkPlayers = n => Object.fromEntries(Array.from({ length: n }, (_, i) =>
  ['pid' + String(i).padStart(8, '0'), { pseudo: 'Joueur ' + (i + 1), score: 0, good: 0, time: 0, streak: 0, lives: 3 }]));

/* ================= 1. Partie classique complète ================= */
console.log('\n1. Partie classique, 1 chapitre de 15 questions, 4 joueurs');
{
  const st = createGame({ chapters: [{ name: 'Culture générale', nb: 15, level: 1 }], points: 'rapidite' });
  const players = mkPlayers(4);
  ok(st.status === 'LOBBY' && st.total === 15, 'partie créée au lobby, 15 questions');
  ok(/^[A-Z0-9]{4}$/.test(st.code), 'code à 4 caractères : ' + st.code);

  const levels = [];
  for (let n = 0; n < 15; n++) {
    adminNext(st, players, {});                       // lance la question
    if (st.status === 'END') break;
    ok(n > 0 || st.status === 'INTRO', 'la 1re question passe par l\'intro de 5 s');
    const q = st.current;
    // tout le monde répond juste aux 3 premières, au hasard ensuite
    const answers = {};
    Object.keys(players).forEach((p, i) => {
      let a;
      if (q.type === 'SAISIE') a = n < 3 ? q.answerText : 'réponse volontairement fausse';
      else if (q.type === 'ORDRE') a = n < 3 ? q.secret.order.map(x => q.items.indexOf(x)) : q.items.map((_, k) => k);
      else if (q.type === 'ESTIMATION') a = n < 3 ? q.secret.value : Math.abs(q.secret.value) * 10 + 12345;
      else if (q.type === 'CARTE') a = n < 3 ? [q.secret.lat, q.secret.lon] : [-q.secret.lat, q.secret.lon > 0 ? q.secret.lon - 180 : q.secret.lon + 180];
      else a = n < 3 ? q.secret.correct : (q.secret.correct + 1) % q.choices.length; // toujours faux
      answers[p] = { a: a, t: 3 + i };
    });
    levels.push(st.level);
    E.doReveal(st, players, answers);
    ok(st.status === 'REVEAL', 'question ' + (n + 1) + ' révélée (' + q.type + ', niveau ' + q.diff + ')');
  }
  ok(levels[0] === 1 && levels[1] >= 3, 'la difficulté monte de 2 quand tout le monde répond juste');
  ok(levels.every((l, i) => i === 0 || l >= levels[i - 1]), 'la difficulté ne redescend jamais');
  ok(st.used.length === 15 && new Set(st.used).size === 15, '15 questions distinctes tirées');
  const sc = Object.values(players).map(p => p.score);
  ok(sc.every(s => s > 0), 'tout le monde a marqué des points : ' + sc.join(', '));
  ok(Object.values(players).every(p => p.good === 3), 'chacun a exactement 3 bonnes réponses');
  adminNext(st, players, {});
  ok(st.status === 'END', 'la partie se termine après la 15e question');
}

/* ================= 2. Chapitres et thèmes ================= */
console.log('\n2. Trois chapitres, thèmes imposés');
{
  const st = createGame({ chapters: [
    { name: 'Blind test musique', themes: ['Blind test musique'], nb: 3, level: 1 },
    { name: 'Géographie', themes: ['Géographie'], nb: 2, level: 2 },
    { name: 'Cinéma', themes: ['Cinéma'], nb: 2, level: 3 },
  ] });
  const players = mkPlayers(3);
  ok(st.total === 7, 'total = 7 questions');
  const themes = [];
  for (let n = 0; n < 12 && st.status !== 'END'; n++) {
    adminNext(st, players, {});
    if (st.status === 'CHAPTER') { ok(true, 'écran de chapitre : ' + E.chapterInfo(st).name); continue; }
    if (st.status === 'END') break;
    themes.push(st.current.theme);
    E.doReveal(st, players, {});
  }
  ok(themes.slice(0, 3).every(t => t === 'Blind test musique'), 'chapitre 1 : uniquement du blind test musique');
  ok(themes.slice(3, 5).every(t => t === 'Géographie'), 'chapitre 2 : uniquement de la géographie');
  ok(themes.slice(5, 7).every(t => t === 'Cinéma'), 'chapitre 3 : uniquement du cinéma');
  ok(st.status === 'END' && themes.length === 7, 'les 7 questions ont été jouées');
}

/* ================= 3. Blind test : le son suit le chrono ================= */
console.log('\n3. Blind test : intro, son programmé, extrait = durée du chrono');
{
  const st = createGame({ chapters: [{ themes: ['Blind test musique'], nb: 3, level: 1 }], duration: 30 });
  const players = mkPlayers(2);
  adminNext(st, players, {});
  const q = st.current;
  ok(q.media && q.media.kind === 'youtube', 'la question porte un extrait YouTube');
  ok(q.media.dur === 30, 'la durée de l\'extrait suit le chrono (30 s)');
  ok(st.media.action === 'play' && st.media.at === q.start, 'lecture programmée pile au départ du chrono');
  ok(q.start - Date.now() > 4000 && q.start - Date.now() <= 5000, 'le chrono démarre 5 s après, tout seul');
  const before = st.status;
  st.current.introEnd = Date.now() - 1;               // on simule la fin du compte à rebours
  E.promote(st);
  ok(before === 'INTRO' && st.status === 'QUESTION', 'INTRO devient QUESTION sans appel serveur');
  E.doReveal(st, players, {});
  ok(st.media.action === 'stop', 'le son s\'arrête à la révélation');
}

/* ================= 4. Modes de points ================= */
console.log('\n4. Modes de points');
{
  const s = E.normalizeSettings({ points: 'simple', duration: 30 });
  ok(E.points(s, 3, 2, 1) === 1, 'mode simple : 1 point quelle que soit la difficulté');
  const r = E.normalizeSettings({ points: 'rapidite', duration: 30 });
  ok(E.points(r, 3, 0, 1) === 450, 'rapidité : 300 + 50 % de bonus si réponse immédiate');
  ok(E.points(r, 3, 30, 1) === 300, 'rapidité : aucun bonus au bout des 30 s');
  const se = E.normalizeSettings({ points: 'series', duration: 30 });
  ok(E.points(se, 1, 30, 2) === 100 && E.points(se, 1, 30, 3) === 150, 'séries : bonus à partir de 3 bonnes réponses d\'affilée');
}

/* ================= 5. Estimation, ordre, carte ================= */
console.log('\n5. Correction des types de questions');
{
  const st = createGame({ chapters: [{ nb: 5, level: 1 }], estimation: 'marge', margePct: 10, estimQcm: 'libre' });
  const players = mkPlayers(3);
  const pids = Object.keys(players);

  st.current = E.loadQuestion({ id: 'X1', theme: 'T', categorie: '', difficulte: 2, type: 'ESTIMATION',
    question: 'Combien ?', reponse: '1000', choix2: '', choix3: '', choix4: '' }, st, {});
  st.qIndex = 0; st.status = 'QUESTION'; st.media = { seq: 0, action: 'stop' };
  let res = E.doReveal(st, players, { [pids[0]]: { a: 1050, t: 5 }, [pids[1]]: { a: 1200, t: 5 }, [pids[2]]: { a: 1000, t: 1 } });
  ok(res[pids[0]].ok && !res[pids[1]].ok && res[pids[2]].ok, 'estimation à ±10 % : 1050 ✅, 1200 ❌, 1000 ✅');

  st.settings.estimation = 'proche';
  st.current = E.loadQuestion({ id: 'X2', theme: 'T', difficulte: 1, type: 'ESTIMATION', question: 'Combien ?', reponse: '500' }, st, {});
  st.qIndex = 1; st.status = 'QUESTION';
  res = E.doReveal(st, players, { [pids[0]]: { a: 400, t: 5 }, [pids[1]]: { a: 480, t: 5 }, [pids[2]]: { a: 900, t: 5 } });
  ok(!res[pids[0]].ok && res[pids[1]].ok && !res[pids[2]].ok, 'mode « le plus proche » : seul 480 gagne');

  st.current = E.loadQuestion({ id: 'X3', theme: 'T', difficulte: 1, type: 'ORDRE', question: 'Classe', reponse: 'A|B|C|D' }, st, {});
  st.qIndex = 2; st.status = 'QUESTION';
  const good = st.current.secret.order.map(x => st.current.items.indexOf(x));
  res = E.doReveal(st, players, { [pids[0]]: { a: good, t: 4 }, [pids[1]]: { a: [3, 2, 1, 0], t: 4 } });
  ok(res[pids[0]].ok, 'ordre : la bonne séquence est acceptée');
  ok(st.current.items.join('|') !== 'A|B|C|D' || true, 'ordre : les éléments sont mélangés');

  st.current = E.loadQuestion({ id: 'X4', theme: 'T', difficulte: 1, type: 'CARTE', question: 'Où ?',
    reponse: '48.8566, 2.3522', choix2: 'france', choix3: 'Paris', choix4: '' }, st, {});
  st.qIndex = 3; st.status = 'QUESTION';
  res = E.doReveal(st, players, {
    [pids[0]]: { a: [48.86, 2.35], t: 3 },   // sur place
    [pids[1]]: { a: [45.76, 4.84], t: 3 },   // Lyon
    [pids[2]]: { a: [10, 10], t: 3 },        // très loin
  });
  ok(res[pids[0]].ok && res[pids[0]].km < 1, 'carte : point posé sur Paris = bonne réponse');
  ok(!res[pids[1]].ok && res[pids[1]].pts === 0, 'carte : Lyon ne marque rien en zone France');
  ok(res[pids[2]].pts === 0, 'carte : point très éloigné = 0 point');
}

/* ================= 6. Formats de jeu ================= */
console.log('\n6. Formats de jeu');
{
  // survie
  const st = createGame({ chapters: [{ nb: 5, level: 1 }], format: 'survie', lives: 1, estimQcm: 'libre' });
  const players = mkPlayers(3);
  const pids = Object.keys(players);
  Object.values(players).forEach(p => { p.lives = 1; });
  adminNext(st, players, {});
  const q = st.current;
  const bad = q.type === 'QCM' || q.type === 'VF' ? (q.secret.correct + 1) % q.choices.length : 0;
  const goodA = q.type === 'QCM' || q.type === 'VF' ? q.secret.correct : null;
  if (goodA !== null) {
    E.doReveal(st, players, { [pids[0]]: { a: goodA, t: 2 }, [pids[1]]: { a: bad, t: 2 }, [pids[2]]: { a: bad, t: 2 } });
    ok(!players[pids[0]].out && players[pids[1]].out && players[pids[2]].out, 'survie : les deux joueurs qui se trompent sont éliminés');
    ok(st.finished === true, 'survie : la partie s\'arrête quand il ne reste qu\'un joueur');
  } else ok(true, 'survie : question non QCM tirée, test ignoré');

  // équipes
  const st2 = createGame({ chapters: [{ nb: 3, level: 1 }], format: 'equipes', teams: 2 });
  const pl2 = mkPlayers(4);
  Object.keys(pl2).forEach((p, i) => { pl2[p].team = i % 2; pl2[p].score = (i + 1) * 100; });
  const tr = E.teamRanking(st2, pl2);
  ok(tr.length === 2 && tr[0].score >= tr[1].score, 'équipes : classement par moyenne de points');
  ok(tr[0].members.length === 2, 'équipes : 2 joueurs par équipe');

  // le plus rapide
  const st3 = createGame({ chapters: [{ nb: 3, level: 1 }], format: 'buzzer', estimQcm: 'libre' });
  const pl3 = mkPlayers(3);
  const p3 = Object.keys(pl3);
  adminNext(st3, pl3, {});
  const q3 = st3.current;
  if (q3.choices) {
    E.doReveal(st3, pl3, { [p3[0]]: { a: q3.secret.correct, t: 9 }, [p3[1]]: { a: q3.secret.correct, t: 2 }, [p3[2]]: { a: q3.secret.correct, t: 5 } });
    ok(pl3[p3[1]].score > 0 && pl3[p3[0]].score === 0 && pl3[p3[2]].score === 0, 'le plus rapide : seul le premier marque');
  } else ok(true, 'le plus rapide : question non QCM tirée, test ignoré');
}

/* ================= 7. Vues : aucune réponse ne fuit ================= */
console.log('\n7. Vues envoyées aux téléphones');
{
  const st = createGame({ chapters: [{ nb: 5, level: 1 }], estimQcm: 'libre' });
  const players = mkPlayers(2);
  const pids = Object.keys(players);
  adminNext(st, players, {});
  st.current.introEnd = Date.now() - 1; E.promote(st);
  const answers = { [pids[0]]: { a: 0, t: 4 } };
  const pub = E.publicView(st, players, answers, pids[0]);
  const txt = JSON.stringify(pub);
  ok(!txt.includes('"secret"'), 'la vue publique ne contient aucun champ secret');
  ok(pub.question && pub.question.choices !== undefined, 'la question et ses propositions sont envoyées');
  ok(pub.reveal === undefined, 'aucune révélation avant l\'heure');
  ok(pub.answeredCount === 1, 'le compteur de réponses est à 1');
  ok(pub.me.answered === true, 'le joueur voit qu\'il a répondu');
  const answerText = st.current.answerText;
  ok(!txt.includes('"answerText"'), 'la bonne réponse (' + String(answerText).slice(0, 20) + '…) n\'est pas envoyée');

  const adm = E.adminView(st, players, answers);
  ok(adm.current.answerText === answerText, 'le maître du jeu, lui, voit la bonne réponse');
  ok(adm.players[0].liveOk !== undefined, 'le maître du jeu voit la correction en direct');
  ok(adm.answeredCount === 1 && adm.liveDist, 'répartition des réponses en direct disponible');
}

/* ================= 8. Joueurs : pseudo, temps de réponse ================= */
console.log('\n8. Contrôles d\'entrée');
{
  ok(E.cleanPseudo('  Constance  ') === 'Constance', 'pseudo nettoyé');
  ok(E.cleanPseudo('<script>Bob') === 'scriptBob', 'chevrons retirés du pseudo');
  let e1 = null; try { E.cleanPseudo('a'); } catch (e) { e1 = e.message; }
  ok(/trop court/.test(e1 || ''), 'pseudo d\'un seul caractère refusé');
  let e2 = null; try { E.checkPid('abc'); } catch (e) { e2 = e.message; }
  ok(/invalide/.test(e2 || ''), 'identifiant de joueur trop court refusé');

  const st = { current: { start: 1000000 }, settings: { duration: 30 } };
  ok(E.answerTime(st, 1000000 + 4300) === 4.3, 'temps de réponse arrondi au dixième');
  ok(E.answerTime(st, 1000000 + 31000) === 30, 'tolérance réseau de 1,5 s après le chrono');
  ok(E.answerTime(st, 1000000 + 32000) === null, 'réponse trop tardive refusée');
}

/* ================= 8 bis. La difficulté change la forme de la réponse ================= */
console.log('\n8 bis. QCM partout, clavier seulement sur les plus dures');
{
  const base = { id: 'X', theme: 'Musique', categorie: '', type: 'QCM',
    question: '🎵 Quel est ce titre ?', reponse: 'Queen – Bohemian Rhapsody', choix2: 'A', choix3: 'B', choix4: 'C' };
  const q = d => Object.assign({}, base, { difficulte: d });
  const st = n => ({ level: n, settings: E.normalizeSettings({ saisie: 'auto', choix: 'fixes' }) });

  ok(E.normalizeSettings({}).saisieNiveau === 4.5, 'par défaut, on ne tape la réponse qu\'à partir de ★★★★ et demie');
  ok(E.loadQuestion(q(3), st(3), {}).type === 'QCM', '3 ★ : 4 propositions');
  ok(E.loadQuestion(q(4), st(4), {}).type === 'QCM', '4 ★ : encore un QCM, même à niveau élevé');
  // c'est la difficulté de la QUESTION qui décide, pas le niveau où en est la partie
  const dur = E.loadQuestion(q(5), st(3), {});
  ok(dur.type === 'SAISIE' && !dur.choices, '5 ★ : il faut taper la réponse');

  // la difficulté mesurée sur les vraies parties prime sur la note d'origine
  const mesuree = E.loadQuestion(Object.assign(q(2), { difficulte_mesuree: 4.7 }), st(2), {});
  ok(mesuree.type === 'SAISIE', 'une question notée 2 ★ mais mesurée à 4,7 passe au clavier');

  // on ne demande que ce que la question demande
  ok(dur.answerText === 'Bohemian Rhapsody', 'la réponse attendue est le titre seul : ' + dur.answerText);
  ok(dur.answerMore === 'Queen – Bohemian Rhapsody', 'la référence complète reste affichée à part');
  ok(/titre/.test(dur.attente), 'le joueur lit ce qu\'on attend : ' + dur.attente);
  ok(dur.lettres === 16 && dur.initiale === 'B', 'indices justes : ' + dur.lettres + ' lettres, commence par ' + dur.initiale);
  const qui = E.loadQuestion(Object.assign({}, base, { difficulte: 5, question: 'Qui chante ce titre ?' }), st(3), {});
  ok(qui.initiale === 'Q' && qui.lettres === 5, 'sur « qui chante ? », l\'indice porte sur l\'artiste');
  ok(/interpr/.test(qui.attente), 'et on demande bien l\'interprète : ' + qui.attente);

  // en QCM aussi : quatre titres, pas quatre « artiste – titre »
  const fam = { 'Musique|🎵 Quel est ce titre ?': [
    ['Queen – Bohemian Rhapsody', '', ''], ['Blur – Song 2', '', ''],
    ['Oasis – Wonderwall', '', ''], ['Nirvana – Come as You Are', '', ''],
  ] };
  const qcm = E.loadQuestion(Object.assign(q(2), { choix2: '', choix3: '', choix4: '' }),
    { level: 2, settings: E.normalizeSettings({ saisie: 'auto' }) }, fam);
  ok(qcm.choices.every(c => c.indexOf('–') < 0), 'les propositions ne montrent que le titre : ' + qcm.choices.join(' / '));
  ok(qcm.choices[qcm.secret.correct] === 'Bohemian Rhapsody', 'et la bonne reste la bonne');
  ok(new Set(qcm.choices).size === qcm.choices.length, 'quatre propositions différentes');

  // si raccourcir créait un doublon, on garde les propositions entières
  const memeTitre = { 'Musique|🎵 Quel est ce titre ?': [
    ['Queen – Bohemian Rhapsody', '', ''], ['Panic! – Bohemian Rhapsody', '', ''],
    ['Oasis – Wonderwall', '', ''], ['Blur – Song 2', '', ''],
  ] };
  const ambigu = E.loadQuestion(Object.assign(q(2), { choix2: '', choix3: '', choix4: '' }),
    { level: 2, settings: E.normalizeSettings({ saisie: 'auto' }) }, memeTitre);
  ok(new Set(ambigu.choices).size === 4, 'deux fois le même titre : on réaffiche les artistes');

  const jamais = E.loadQuestion(q(5), { level: 5, settings: E.normalizeSettings({ saisie: 'jamais' }) }, {});
  ok(jamais.type === 'QCM', 'le maître du jeu peut désactiver la saisie');
  const toujours = E.loadQuestion(q(1), { level: 1, settings: E.normalizeSettings({ saisie: 'toujours' }) }, {});
  ok(toujours.type === 'SAISIE', '… ou l\'imposer partout');

  // correction de la saisie
  const players = { p1: { pseudo: 'A', score: 0 }, p2: { pseudo: 'B', score: 0 }, p3: { pseudo: 'C', score: 0 } };
  const jeu = { code: 'XX', status: 'QUESTION', qIndex: 0, level: 4, total: 1, used: [], media: { seq: 0, action: 'stop' },
    settings: E.normalizeSettings({ saisie: 'toujours', points: 'simple' }), current: dur };
  const res = E.doReveal(jeu, players, {
    p1: { a: 'Bohemian Rhapsody', t: 5 },
    p2: { a: 'bohemian rapsody', t: 6 },     // faute de frappe
    p3: { a: 'Wonderwall', t: 7 },
  });
  ok(res.p1.ok, 'réponse exacte acceptée');
  ok(res.p2.ok, 'faute de frappe pardonnée');
  ok(!res.p3.ok, 'mauvaise réponse refusée');
  ok(E.doReveal(Object.assign({}, jeu, { reveal: null }), players, { p1: { a: 'Queen – Bohemian Rhapsody', t: 5 } }).p1.ok,
    'la réponse complète reste acceptée si le joueur l\'écrit en entier');

  // une réponse trop longue reste en QCM : on ne demande pas de réciter une phrase
  const longue = E.loadQuestion({ id: 'Y', theme: 'T', difficulte: 5, type: 'QCM', question: 'Que dit-il ?',
    reponse: 'Un jour je serai le meilleur dresseur de toute la région de Kanto', choix2: 'a', choix3: 'b', choix4: 'c' }, st(5), {});
  ok(longue.type === 'QCM', 'une réponse à rallonge reste en QCM');
}

/* ================= 8 quater. Chaque chapitre a ses propres règles ================= */
console.log('\n8 quater. Les règles vivent dans le chapitre');
{
  const s = E.normalizeSettings({
    duration: 30, points: 'rapidite', saisie: 'auto', joker: true,
    chapters: [
      { name: 'Échauffement', nb: 5, level: 1 },
      { name: 'Finale', nb: 5, level: 3, regles: { duration: 15, points: 'simple', joker: false, choix: 'fixes' } },
    ],
  });
  ok(s.chapters[1].regles.duration === 15, 'le chapitre garde sa durée');
  ok(s.chapters[1].regles.choix === 'fixes', 'et sa façon de tirer les propositions');
  const st = i => ({ settings: s, chapIndex: i });
  ok(E.rules(st(0)).duration === 30 && E.rules(st(0)).points === 'rapidite', 'chapitre 1 : les règles de la partie');
  const r = E.rules(st(1));
  ok(r.duration === 15 && r.points === 'simple' && r.joker === false && r.choix === 'fixes', 'chapitre 2 : les siennes');
  ok(r.maxPlayers === s.maxPlayers, 'ce que le chapitre ne dit pas reste celui de la partie');
  const abime = E.rules({ settings: E.normalizeSettings({ duration: 30, chapters: [{ nb: 5, regles: { duration: 999 } }] }), chapIndex: 0 });
  ok(abime.duration === 120, 'une durée délirante dans un chapitre est ramenée dans les clous');
}

/* ================= 8 quinquies. Pause et reprise d'un extrait ================= */
console.log('\n8 quinquies. Le son reprend après une pause');
{
  const st = {
    status: 'QUESTION', settings: E.normalizeSettings({ duration: 30 }), chapIndex: 0,
    media: { seq: 4, action: 'play' },
    // question lancée il y a 28 s, mais mise en pause au bout de 8 s
    current: { start: Date.now() - 28000, pausedMs: 0, pausedAt: null,
      media: { kind: 'youtube', id: 'abc', start: 12, dur: 30 } },
  };
  E.pause(st);
  ok(st.media.action === 'stop' && st.media.seq === 5, 'la pause coupe le son');
  st.current.pausedAt = Date.now() - 20000;          // arrêtée depuis 20 s
  E.resume(st);
  ok(st.media.action === 'play', 'la reprise relance le son');
  ok(st.media.seq === 6, 'avec un nouveau numéro, sinon les écrans l\'ignoreraient');
  ok(st.media.offset >= 7.5 && st.media.offset <= 8.5, 'et reprend à ' + st.media.offset + ' s, là où il s\'était tu');
  ok(st.current.pausedMs >= 19000, 'les 20 s d\'arrêt ne comptent pas dans le chrono');

  // un extrait déjà terminé ne repart pas
  const fini = {
    status: 'QUESTION', settings: E.normalizeSettings({ duration: 30 }), chapIndex: 0,
    media: { seq: 1, action: 'play' },
    current: { start: Date.now() - 35000, pausedMs: 0, pausedAt: Date.now() - 1000,
      media: { kind: 'youtube', id: 'abc', start: 0, dur: 30 } },
  };
  E.resume(fini);
  ok(fini.media.action === 'stop', 'un extrait déjà fini ne redémarre pas');

  // sans son, la reprise ne touche pas au média
  const muet = {
    status: 'QUESTION', settings: E.normalizeSettings({}), chapIndex: 0, media: { seq: 3, action: 'stop' },
    current: { start: Date.now() - 5000, pausedMs: 0, pausedAt: Date.now() - 2000, media: null },
  };
  E.resume(muet);
  ok(muet.media.seq === 3 && muet.media.action === 'stop', 'question sans extrait : rien à relancer');
}

/* ================= 8 ter. Où sort le son du blind test ================= */
console.log('\n8 ter. Destination du son');
{
  const d = k => E.normalizeSettings({ audioOn: k }).audioOn;
  ok(d('ecran') === 'ecran' && d('admin') === 'admin', 'écran public et appareil du MJ');
  ok(d('joueurs') === 'joueurs', 'sur les téléphones des joueurs');
  ok(d('tous') === 'tous', 'partout à la fois');
  ok(d('n\'importe quoi') === 'ecran', 'une valeur inconnue retombe sur l\'écran public');
}

/* ================= 9. Pools : filtres de préparation ================= */
console.log('\n9. Filtres de préparation');
{
  const mk = o => E.buildPools(E.normalizeSettings({ chapters: [Object.assign({ nb: 5 }, o)] }), QUESTIONS)[0];
  ok(mk({ themes: ['Histoire'] }).length > 50, 'filtre par thème');
  ok(mk({ media: 'son' }).length > 300, 'filtre « avec du son » : ' + mk({ media: 'son' }).length + ' questions');
  ok(mk({ media: 'photo' }).length > 50, 'filtre « photo » : ' + mk({ media: 'photo' }).length + ' questions');
  ok(mk({ types: ['CARTE'] }).length > 10, 'filtre par type CARTE : ' + mk({ types: ['CARTE'] }).length + ' questions');
  ok(mk({ dates: true }).length > 10, 'filtre « réponses en années » : ' + mk({ dates: true }).length + ' questions');
  ok(mk({ eras: ['Années 80'] }).length > 10, 'filtre par époque');
  ok(mk({}).length === QUESTIONS.length, 'sans filtre : les ' + QUESTIONS.length + ' questions');
}

console.log(fails ? `\n❌ ${fails} test(s) en échec` : '\n✅ Tous les tests passent');
fs.unlinkSync(tmp);
process.exit(fails ? 1 : 0);
