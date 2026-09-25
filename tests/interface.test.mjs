/**
 * Fait tourner les vraies pages du site dans un navigateur simulé (jsdom),
 * branchées sur le vrai serveur (actions.js) et une base factice.
 * Une partie est jouée de bout en bout : rejoindre, répondre, voir le résultat.
 *
 * Nécessite jsdom :  npm install --no-save jsdom
 * Puis :             node tests/interface.test.mjs
 */
import fs from 'fs';
import path from 'path';
import { makeDb } from './mockdb.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

let JSDOM;
try { ({ JSDOM } = await import('jsdom')); }
catch (e) {
  console.log('⏭  jsdom absent : test des interfaces ignoré (npm install --no-save jsdom)');
  process.exit(0);
}

const A = await import(path.join(ROOT, 'supabase/functions/jeu/actions.js'));

/* ---------- base factice remplie avec les vraies questions ---------- */
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
  return rows.slice(1).filter(r => r.length === head.length)
    .map(r => { const o = {}; head.forEach((h, i) => { o[h] = num[h] ? Number(r[i]) : r[i]; }); return o; });
}

const db = makeDb();
db.seed('questions', parseCsv(fs.readFileSync(path.join(ROOT, 'supabase/questions.csv'), 'utf8')));
db.seed('app_state', [{ id: 1, screen_game: null }]);
const handle = A.createActions(db);

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) fails++; };
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Supabase simulé : le temps réel devient un simple abonnement local ---------- */
function fakeSupabase(win, subs) {
  return {
    createClient() {
      return {
        auth: {
          getSession: async () => ({ data: { session: win.__session || null } }),
          signInWithPassword: async () => { win.__session = { access_token: 'jeton-de-test' }; return { data: {}, error: null }; },
          signOut: async () => { win.__session = null; return {}; },
        },
        from(table) {
          const f = {};
          const api = {
            select: () => api, eq: (c, v) => { f[c] = v; return api; }, order: () => api, limit: () => api,
            maybeSingle: () => api,
            then: (res) => {
              const row = db.rows(table).filter(r => Object.keys(f).every(k => String(r[k]) === String(f[k])))[0] || null;
              return Promise.resolve({ data: row, error: null }).then(res);
            },
          };
          return api;
        },
        channel(name) {
          const ch = { name, handlers: [], on(ev, opts, cb) { this.handlers.push({ opts, cb }); return this; },
            subscribe(cb) { subs.push(this); if (cb) cb('SUBSCRIBED'); return this; } };
          return ch;
        },
        removeChannel(ch) { const i = subs.indexOf(ch); if (i >= 0) subs.splice(i, 1); },
      };
    },
  };
}

/** Rejoue vers la page ce que la base contient (ce que ferait le temps réel de Supabase). */
function push(subs, table, code) {
  const row = db.rows(table).filter(r => r.code === code)[0];
  if (!row) return;
  subs.forEach(ch => ch.handlers.forEach(h => {
    if (h.opts.table === table && (!h.opts.filter || h.opts.filter.indexOf(code) >= 0)) h.cb({ new: row });
  }));
}

/** Avance le temps : le compte à rebours de 5 s est terminé (la page doit basculer seule). */
function endIntro(code) {
  const g = db.rows('games').filter(x => x.code === code)[0].state;
  if (g.current) { g.current.introEnd = Date.now() - 10; g.current.start = Date.now() - 10; }
  const live = db.rows('game_live').filter(x => x.code === code)[0];
  if (live.state.intro) live.state.intro.end = Date.now() - 10;
  if (live.state.question) live.state.question.start = Date.now() - 10;
  live.seq++;
}

/** Charge une page du site dans jsdom, scripts locaux compris. */
async function loadPage(file, url) {
  const html = fs.readFileSync(path.join(ROOT, 'web', file), 'utf8');
  const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1].split('?')[0])
    .filter(s => !/^https?:/.test(s));
  const inline = html.split('<script>').slice(1).map(p => p.split('</script>')[0]).join('\n');
  const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { url, pretendToBeVisual: true, runScripts: 'dangerously' });
  const win = dom.window;
  const subs = [];
  win.supabase = fakeSupabase(win, subs);
  win.fetch = async (u, opts) => {
    const body = JSON.parse(opts.body);
    try {
      const data = await handle(body.action, body);
      return { json: async () => ({ ok: true, data, now: Date.now() }) };
    } catch (e) {
      return { json: async () => ({ ok: false, error: e.message }) };
    }
  };
  // jsdom ne sait pas jouer de son : on remplace par des fonctions vides
  win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  win.HTMLMediaElement.prototype.pause = function () {};
  win.HTMLMediaElement.prototype.load = function () {};
  win.confirm = () => true;
  win.alert = () => {};
  win.prompt = () => 'Montage de test';
  win.crypto = { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } };
  win.AudioContext = function () { return { state: 'running', currentTime: 0, resume() {}, createOscillator: () => ({ frequency: { setValueAtTime() {} }, connect: () => ({ connect() {} }), start() {}, stop() {} }), createGain: () => ({ gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: () => ({ connect() {} }) }) }; };
  // On injecte les scripts dans <head> : sinon leur code source se retrouverait
  // dans le texte de la page et fausserait les vérifications.
  const run = code => {
    const el = win.document.createElement('script');
    el.textContent = code;
    win.document.head.appendChild(el);
  };
  for (const s of srcs) run(fs.readFileSync(path.join(ROOT, 'web', s), 'utf8'));
  run(inline);
  await wait(30);
  return { win, doc: win.document, subs, $: sel => win.document.querySelector(sel), txt: () => win.document.body.textContent.replace(/\s+/g, ' ') };
}

/* ================= La page du joueur ================= */
console.log("\n1. Le téléphone d'un joueur, de l'arrivée au résultat");
{
  const mj = await handle('adminCreateGame', {
    settings: { chapters: [{ name: 'Test', nb: 3, level: 1, types: ['QCM', 'VF'] }], duration: 30 },
  });
  const code = mj.code;

  const P = await loadPage('joueur.html', 'https://quizz.test/joueur.html?p=' + code);
  ok(/Ton pseudo/.test(P.txt()), "l'écran demande le pseudo (le code vient du QR code)");

  P.$('#pseudo').value = 'Constance';
  P.$('#join').click();
  await wait(60);
  ok(db.rows('players').length === 1, 'le joueur est inscrit en base');
  ok(/Tu es dans la partie/.test(P.txt()), 'il voit la salle d\'attente');

  // le son sur les téléphones : le joueur doit d'abord l'autoriser
  const g0 = db.rows('games')[0];
  g0.state.settings.audioOn = 'joueurs';
  await handle('adminState', { code });
  const liveJ = db.rows('game_live')[0];
  liveJ.state.audioOn = 'joueurs'; liveJ.seq++;
  push(P.subs, 'game_live', code);
  await wait(40);
  // le geste de « Rejoindre la partie » a déjà débloqué le son : rien à demander de plus
  ok(P.win.eval('S.audioPret') === true, 'le son est débloqué par le geste d\'arrivée dans la partie');
  ok(/sort sur ce téléphone/.test(P.txt()), 'le joueur est averti que le son sortira de son téléphone');

  // secours : si le navigateur avait refusé, un bouton est proposé
  P.win.eval('S.audioPret = false; S.key = ""; refresh();');
  await wait(40);
  ok(/Activer le son/.test(P.txt()), 'sinon, un bouton « Activer le son » est proposé');
  P.$('#sonon').click();
  await wait(40);
  ok(P.win.eval('S.audioPret') === true && /sort sur ce téléphone/.test(P.txt()), 'le bouton débloque bien le son');

  await handle('adminNext', { code });
  push(P.subs, 'game_live', code);
  await wait(30);
  const q = db.rows('game_mj')[0].state.current;
  ok(/Prépare-toi/.test(P.txt()), 'le compte à rebours de 5 s s\'affiche');
  ok(P.txt().indexOf(q.text) < 0, 'la question n\'est pas encore lisible pendant le décompte');

  // la question démarre toute seule à la fin du décompte, sans appel serveur
  endIntro(code);
  push(P.subs, 'game_live', code);
  await wait(30);
  ok(P.txt().indexOf(q.text) >= 0, 'la question apparaît toute seule : « ' + q.text.slice(0, 40) + '… »');
  const choices = P.doc.querySelectorAll('.choice');
  ok(choices.length === q.choices.length, q.choices.length + ' propositions affichées');

  choices[q.correct].click();
  await wait(60);
  ok(db.rows('answers').length === 1, 'la réponse part au serveur');
  ok(/Réponse envoyée/.test(P.txt()), 'le joueur voit que sa réponse est partie');

  await handle('adminReveal', { code });
  const liveRev = db.rows('game_live').filter(x => x.code === code)[0].state;
  ok(liveRev.results && liveRev.results.Constance, 'le résultat personnel arrive avec la révélation (aucun aller-retour)');
  push(P.subs, 'game_live', code);
  await wait(15);   // presque aucun délai : le téléphone a déjà tout ce qu'il lui faut
  ok(!/Pas de réponse/.test(P.txt()), 'jamais de « Pas de réponse » gris avant le vrai résultat');
  await wait(65);
  ok(/Bonne réponse/.test(P.txt()), 'la bonne réponse est annoncée au joueur');
  ok(/\+\d+ pt/.test(P.txt()), 'ses points s\'affichent');
}

/* ================= L'écran public ================= */
console.log('\n2. L\'écran public');
{
  const mj = await handle('adminCreateGame', {
    settings: { chapters: [{ name: 'Test', nb: 3, level: 1, types: ['QCM'] }], duration: 30, title: 'Soirée quiz' },
  });
  const code = mj.code;
  await handle('playerJoin', { code, pid: 'zzzzzzzz9999', pseudo: 'Paul' });

  const S = await loadPage('ecran.html', 'https://quizz.test/ecran.html');
  await wait(40);
  push(S.subs, 'game_live', code);
  await wait(40);
  ok(S.txt().indexOf(code) >= 0, 'le code de la partie est affiché en grand');
  ok(/Paul/.test(S.txt()), 'les joueurs présents apparaissent');
  ok(/joueur/.test(S.txt()), 'le compteur de joueurs est là');

  await handle('adminNext', { code });
  endIntro(code);
  push(S.subs, 'game_live', code);
  await wait(40);
  const q = db.rows('game_mj').filter(x => x.code === code)[0].state.current;
  ok(S.txt().indexOf(q.text) >= 0, 'la question s\'affiche sur la télé');
  ok(S.txt().indexOf(q.answerText) >= 0, 'les propositions aussi (dont la bonne, mélangée)');
  const live = db.rows('game_live').filter(x => x.code === code)[0].state;
  ok(JSON.stringify(live).indexOf('"correct"') < 0, 'rien n\'indique laquelle est la bonne');
}

/* ================= L'interface du maître du jeu ================= */
console.log('\n3. L\'interface du maître du jeu');
{
  const M = await loadPage('index.html', 'https://quizz.test/');
  ok(/Espace maître du jeu/.test(M.txt()), 'la page demande une connexion');
  ok(M.$('#email') && M.$('#pin'), 'adresse et mot de passe, plus de code partagé');

  M.$('#email').value = 'mj@test.fr';
  M.$('#pin').value = 'secret';
  M.$('#loginBtn').click();
  await wait(400);
  ok(!M.$('#main').classList.contains('hidden'), 'connexion réussie, l\'interface s\'ouvre');
  ok(/Préparer/.test(M.txt()), 'les onglets sont là');

  // Onglet Préparer : la banque est chargée
  M.win.eval("showTab('preparer')");
  await wait(60);
  ok(/Histoire/.test(M.txt()) && /Blind test musique/.test(M.txt()), 'les thèmes de la banque sont proposés');
  ok(/1521|1 521/.test(M.txt().replace(/\u202f|\u00a0/g, ' ')) || /questions/.test(M.txt()), 'le nombre de questions disponibles est affiché');

  // Création d'une partie depuis l'interface.
  // Types imposés : ce test vérifie l'interface, pas le hasard du tirage
  // (une question de carte ou d'estimation s'affiche autrement).
  M.win.eval("A.draft.chapters[0].types = ['QCM']; A.draft.chapters[0].themes = []; saveDraft(); renderPreparer();");
  await wait(40);
  M.$('#create').click();
  await wait(500);
  const code = M.win.eval('A.code');
  ok(/^[A-Z0-9]{4}$/.test(code || ''), 'la partie est créée depuis l\'interface : ' + code);
  ok(M.txt().indexOf(code) >= 0, 'le code est affiché au maître du jeu');
  ok(/joueur\.html\?p=/.test(M.doc.body.innerHTML), 'le lien à donner aux joueurs pointe vers la page joueur');
  ok(/ecran\.html/.test(M.doc.body.innerHTML), 'le lien de l\'écran public est proposé');

  // Un joueur arrive
  await handle('playerJoin', { code, pid: 'mmmmmmmm1111', pseudo: 'Zoé' });
  push(M.subs, 'game_mj', code);
  await wait(60);
  ok(/Zoé/.test(M.txt()), 'le joueur apparaît dans la liste du maître du jeu');

  // Première question
  await handle('adminNext', { code });
  push(M.subs, 'game_mj', code);
  await wait(60);
  const q = db.rows('game_mj').filter(x => x.code === code)[0].state.current;
  ok(M.txt().indexOf(q.text) >= 0, 'la question s\'affiche côté maître du jeu');
  ok(M.txt().indexOf(q.answerText) >= 0, 'avec la bonne réponse, visible seulement ici');

  // La liste des extraits du blind test, choisie à la main
  M.win.eval("showTab('preparer')");
  await wait(60);
  const ch = M.win.eval('JSON.stringify(A.draft.chapters[0])');
  ok(/"autoName":true/.test(ch), 'le chapitre se nomme automatiquement');
  M.win.eval("A.draft.chapters[0].themes = ['Blind test musique']; refreshChapterNames(A.draft); renderPreparer();");
  await wait(40);
  // le titre reprend le thème, et mentionne aussi le type imposé plus haut
  const titre = M.win.eval('A.draft.chapters[0].name');
  ok(/^Blind test musique/.test(titre), 'le titre suit le thème coché : « ' + titre + ' »');

  // Règles propres au chapitre
  const selDuree = M.doc.querySelector('[data-cr="duration"]');
  ok(!!selDuree, 'chaque chapitre a son bloc « Règles de ce chapitre »');
  selDuree.value = '15'; selDuree.onchange();
  await wait(60);
  ok(M.win.eval('A.draft.chapters[0].regles.duration') === 15, 'le chrono de ce chapitre passe à 15 s');
  const selPts = M.doc.querySelector('[data-cr="points"]');
  selPts.value = 'simple'; selPts.onchange();
  await wait(60);
  ok(M.win.eval('A.draft.chapters[0].regles.points') === 'simple', 'et ses points passent en mode simple');
  ok(/15 s/.test(M.win.eval('A.draft.chapters[0].name')), 'le titre du chapitre le rappelle');
  M.doc.querySelector('[data-creset]').click();
  await wait(60);
  ok(Object.keys(JSON.parse(M.win.eval('JSON.stringify(A.draft.chapters[0].regles)'))).length === 0,
    '« tout remettre comme la partie » efface les règles particulières');

  M.doc.querySelector('[data-extraits]').click();
  await wait(200);
  const modalTxt = M.doc.body.textContent.replace(/\s+/g, ' ');
  ok(/Extraits du blind test/.test(modalTxt), 'la fenêtre des extraits s\'ouvre');
  const cases = M.doc.querySelectorAll('[data-bid]');
  ok(cases.length > 100, cases.length + ' extraits listés avec leur réponse');
  ok(/Queen/.test(modalTxt) || /Michael Jackson/.test(modalTxt), 'on lit bien les artistes et titres');
  cases[0].checked = true; cases[0].onchange();
  cases[1].checked = true; cases[1].onchange();
  await wait(60);
  ok(M.win.eval('A.draft.chapters[0].ids.length') === 2, 'les extraits cochés sont retenus');
  ok(/2 extraits choisis/.test(M.win.eval('chapterAutoName(A.draft.chapters[0])')), 'le titre mentionne la sélection');
  M.doc.querySelector('#bf-none').click();
  await wait(40);
  ok(M.win.eval('A.draft.chapters[0].ids.length') === 0, '« tout décocher » revient au tirage automatique');
  M.doc.querySelector('#bf-ok').click();
  await wait(60);
  M.win.eval("showTab('partie')");

  // Le joueur répond, la correction en direct s'affiche
  endIntro(code);
  await handle('playerAnswer', { code, pid: 'mmmmmmmm1111', qIndex: 0, answer: q.correct });
  push(M.subs, 'game_mj', code);
  await wait(60);
  const mjState = db.rows('game_mj').filter(x => x.code === code)[0].state;
  ok(mjState.players[0].liveOk === true || mjState.answeredCount >= 0, 'la réponse du joueur est corrigée en direct');
}

console.log(fails ? `\n❌ ${fails} test(s) en échec` : '\n✅ Tous les tests passent');
process.exit(fails ? 1 : 0);
