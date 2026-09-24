/**
 * Moteur de jeu : état de la partie, chapitres, difficulté évolutive, points, présence.
 *
 * L'état vit dans CacheService (rapide), avec une copie de secours dans ScriptProperties.
 * Les réponses et la présence des joueurs sont stockées dans des clés séparées
 * (une par joueur) pour éviter tout verrou quand 15 personnes répondent en même temps.
 *
 * Statuts : LOBBY → CHAPTER → INTRO → QUESTION → REVEAL → (SCORES) → … → END
 *
 * Formats de jeu : classique, face à face (duel à chaque question), survie (vies), équipes,
 * « le plus rapide » (seule la première bonne réponse marque).
 */

const TTL = 21600; // 6 h, maximum autorisé par CacheService
const GRACE_S = 1.5; // tolérance réseau après la fin du chrono

/* ------------------------------------------------------------------ */
/* Stockage                                                            */
/* ------------------------------------------------------------------ */

function cache_() { return CacheService.getScriptCache(); }

function getState_(code) {
  if (!code) return null;
  let s = cache_().get('st_' + code);
  if (!s) {
    s = PropertiesService.getScriptProperties().getProperty('st_' + code);
    if (s) cache_().put('st_' + code, s, TTL);
  }
  return s ? promote_(JSON.parse(s)) : null;
}

function saveState_(st) {
  st.version = (st.version || 0) + 1;
  const json = JSON.stringify(st);
  cache_().put('st_' + st.code, json, TTL);
  try { PropertiesService.getScriptProperties().setProperty('st_' + st.code, json); } catch (e) { /* trop gros : cache seul */ }
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function mustState_(code) {
  const st = getState_(code);
  if (!st) throw new Error('Partie introuvable ou expirée.');
  return st;
}

function ansKey_(st, pid) { return ['an', st.code, st.qIndex, st.current.id, pid].join('_'); }
function hbKey_(code, pid) { return 'hb_' + code + '_' + pid; }
function poolKey_(code, i) { return 'pool_' + code + '_' + i; }

function collectAnswers_(st) {
  if (!st.current) return {};
  const pids = Object.keys(st.players);
  const raw = cache_().getAll(pids.map(p => ansKey_(st, p)));
  const out = {};
  pids.forEach(p => { const v = raw[ansKey_(st, p)]; if (v) out[p] = JSON.parse(v); });
  return out;
}

/* ------------------------------------------------------------------ */
/* Réglages et création                                                */
/* ------------------------------------------------------------------ */

function normalizeSettings_(s) {
  s = s || {};
  const clamp = (v, a, b, d) => { v = Number(v); return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };
  let chapters = (s.chapters || []).map((c, i) => {
    let types = (c.types && c.types.length ? c.types : TYPES).filter(t => TYPES.indexOf(t) >= 0);
    if (types.length === 4 && types.indexOf('CARTE') < 0) types = TYPES.slice(); // ancien montage « tous les types »
    return {
      name: String(c.name || ('Chapitre ' + (i + 1))).slice(0, 60),
      themes: (c.themes || []).map(String),
      cats: (c.cats || []).map(String),
      types: types,
      media: ['tous', 'avec', 'sans', 'photo', 'son'].indexOf(c.media) >= 0 ? c.media : 'tous',
      eras: (c.eras || []).map(String), // époques (vide = toutes)
      dates: !!c.dates, // seulement les questions dont la réponse est une année
      nb: clamp(c.nb, 1, 50, 15),
      level: clamp(c.level, 1, 5, 1),
    };
  });
  if (!chapters.length) chapters = [{ name: 'Culture générale', themes: [], cats: [], types: TYPES.slice(), media: 'tous', eras: [], dates: false, nb: 15, level: 1 }];
  return {
    chapters: chapters,
    duration: clamp(s.duration, 10, 120, 30),
    maxPlayers: clamp(s.maxPlayers, 2, 15, 15),
    points: ['simple', 'rapidite', 'series'].indexOf(s.points) >= 0 ? s.points : 'rapidite',
    estimation: s.estimation === 'proche' ? 'proche' : 'marge',
    margePct: clamp(s.margePct, 1, 50, 10),
    visual: String(s.visual || 'plateau'),
    sounds: s.sounds !== false,
    audioOn: s.audioOn === 'admin' ? 'admin' : 'ecran',
    chrono: 'auto', // le chrono démarre toujours tout seul à la fin du compte à rebours de 5 s
    autoReveal: s.autoReveal !== false,
    // Propositions : « adaptatifs » = pièges tirés au sort et ajustés au niveau, « fixes » = ceux du Sheet
    choix: s.choix === 'fixes' ? 'fixes' : 'adaptatifs',
    // Questions d'estimation : réponse libre, en QCM (4 propositions générées) ou mélange des deux
    estimQcm: ['libre', 'qcm', 'mixte'].indexOf(s.estimQcm) >= 0 ? s.estimQcm : 'mixte',
    // Format de jeu
    format: FORMATS.indexOf(s.format) >= 0 ? s.format : 'classique',
    lives: clamp(s.lives, 1, 5, 3),
    teams: clamp(s.teams, 2, 4, 2),
    bonus: !!s.bonus, // questions en or (points ×2) tirées au hasard
    finale: !!s.finale, // dernière question ×3
    joker: s.joker !== false, // un joker 50/50 par joueur et par partie
    title: String(s.title || APP_NAME).slice(0, 60),
  };
}

const FORMATS = ['classique', 'face', 'survie', 'equipes', 'buzzer'];
const TEAM_NAMES = ['🔴 Rouges', '🔵 Bleus', '🟢 Verts', '🟡 Jaunes'];

/** Question dont la réponse est une année (« En quelle année… », 1789…). */
function isDateQ_(r) {
  return /(en|quelle) ann[ée]e/i.test(String(r[QC.TEXTE])) && /^\s*\d{3,4}\s*$/.test(String(r[QC.REP]));
}

function isImage_(url) {
  url = String(url || '').trim();
  return !!url && !/youtu/.test(url);
}

function readQuestions_() {
  const sh = sheet_(SH.QUESTIONS);
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, HEADERS.Questions.length).getValues() : [];
}

/** Lit l'onglet Questions et construit un pool par chapitre : [ligne, difficulté, utilisations]. */
function buildPools_(settings, data) {
  data = data || readQuestions_();
  return settings.chapters.map(ch => {
    const pool = [];
    data.forEach((r, i) => {
      if (String(r[QC.ACTIF]).toLowerCase() === 'non' || !r[QC.TEXTE]) return;
      if (ch.themes.length && ch.themes.indexOf(String(r[QC.THEME])) < 0) return;
      if (ch.cats.length && ch.cats.indexOf(String(r[QC.CAT])) < 0) return;
      if (ch.eras.length && ch.eras.indexOf(String(r[QC.EPOQUE])) < 0) return;
      if (ch.types.indexOf(String(r[QC.TYPE]).toUpperCase()) < 0) return;
      if (ch.dates && !isDateQ_(r)) return;
      const m = String(r[QC.MEDIA]).trim();
      if (ch.media === 'avec' && !m) return;
      if (ch.media === 'sans' && m) return;
      if (ch.media === 'photo' && !isImage_(m)) return;
      if (ch.media === 'son' && !/youtu/.test(m)) return;
      pool.push([i + 2, Number(r[QC.DIFF]) || 1, Number(r[QC.UTIL]) || 0]);
    });
    return pool;
  });
}

function newCode_() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let k = 0; k < 20; k++) {
    let c = '';
    for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)];
    if (!getState_(c)) return c;
  }
  throw new Error('Impossible de générer un code de partie.');
}

function adminCreateGame(pin, rawSettings) {
  checkPin_(pin);
  const settings = normalizeSettings_(rawSettings);
  const data = readQuestions_();
  const pools = buildPools_(settings, data);
  const problems = [];
  settings.chapters.forEach((ch, i) => {
    if (pools[i].length < ch.nb) problems.push(`« ${ch.name} » : ${pools[i].length} question(s) disponible(s) pour ${ch.nb} demandée(s)`);
  });
  if (problems.length) throw new Error('Pas assez de questions :\n' + problems.join('\n'));

  // Nettoie les sauvegardes des anciennes parties (ScriptProperties est limité à 500 Ko)
  const props = PropertiesService.getScriptProperties();
  props.getKeys().filter(k => k.indexOf('st_') === 0).forEach(k => props.deleteProperty(k));

  const code = newCode_();
  pools.forEach((p, i) => cache_().put(poolKey_(code, i), JSON.stringify(p), TTL));
  cache_().put('fam_' + code, JSON.stringify(buildFamilies_(data)), TTL);
  const st = {
    code: code, created: Date.now(), status: 'LOBBY', settings: settings, players: {},
    qIndex: -1, chapIndex: -1, chapQ: 0, level: settings.chapters[0].level,
    total: settings.chapters.reduce((a, c) => a + c.nb, 0),
    used: [], current: null, reveal: null, media: { seq: 0, action: 'stop' }, persisted: false,
  };
  saveState_(st);
  props.setProperty('CURRENT_GAME', code);
  props.setProperty('SCREEN_GAME', code); // l'écran public et les téléphones suivent la dernière partie créée
  cache_().put('screen_game', code, TTL);
  return adminView_(st);
}

/* ------------------------------------------------------------------ */
/* Déroulé                                                             */
/* ------------------------------------------------------------------ */

const LIVE = ['INTRO', 'READ', 'QUESTION']; // une question est en cours
const INTRO_S = 5; // compte à rebours avant chaque question

function adminNext(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (LIVE.indexOf(st.status) >= 0) doReveal_(st);
    else if (st.status === 'END') return adminView_(st);
    else if (st.finished) endGame_(st); // survie : il ne reste qu'un joueur
    else {
      const ch = st.settings.chapters[st.chapIndex];
      const chapterDone = st.chapIndex < 0 || st.chapQ >= ch.nb;
      if (st.status !== 'CHAPTER' && chapterDone) {
        if (st.chapIndex + 1 >= st.settings.chapters.length) {
          endGame_(st);
        } else {
          st.chapIndex++;
          st.chapQ = 0;
          st.level = st.settings.chapters[st.chapIndex].level;
          st.reveal = null;
          st.current = null;
          // Un seul chapitre : pas d'écran de chapitre, on enchaîne directement sur l'intro
          if (st.settings.chapters.length === 1) nextQuestion_(st);
          else st.status = 'CHAPTER';
        }
      } else {
        nextQuestion_(st);
      }
    }
    saveState_(st);
    return adminView_(st);
  });
}

function nextQuestion_(st) {
  const row = pickRow_(getPool_(st, st.chapIndex), st.level, st.used);
  if (!row) throw new Error('Plus de question disponible dans ce chapitre.');
  st.used.push(row);
  st.current = loadQuestion_(row, st);
  st.qIndex++;
  st.chapQ++;
  st.reveal = null;
  decorate_(st, null);
  beginIntro_(st);
}

/**
 * Ce qui entoure la question selon le format : duel du face à face, question en or, finale ×3.
 * `prev` = question remplacée (le duel et le bonus sont conservés).
 */
function decorate_(st, prev) {
  const q = st.current;
  const s = st.settings;
  q.mult = 1;
  if (prev) { q.gold = prev.gold; q.duel = prev.duel; q.mult = prev.mult || 1; return; }
  if (s.finale && st.qIndex === st.total - 1) q.mult = 3;
  else if (s.bonus && st.qIndex > 0 && !st.lastGold && Math.random() < 0.2) { q.gold = true; q.mult = 2; }
  st.lastGold = !!q.gold;
  if (s.format === 'face') q.duel = pickDuel_(st);
}

/** Deux joueurs qui ont le moins joué de duels, en privilégiant les adversaires qui ne se sont pas encore affrontés. */
function pickDuel_(st) {
  const pids = Object.keys(st.players);
  if (pids.length < 2) return null;
  const faced = st.faced = st.faced || {};
  const pair = (x, y) => [x, y].sort().join('|');
  const duels = p => st.players[p].duels || 0;
  const r = {};
  pids.forEach(p => { r[p] = Math.random(); });
  const a = pids.slice().sort((x, y) => duels(x) - duels(y) || r[x] - r[y])[0];
  const b = pids.filter(p => p !== a)
    .sort((x, y) => duels(x) - duels(y) || (faced[pair(a, x)] || 0) - (faced[pair(a, y)] || 0) || r[x] - r[y])[0];
  faced[pair(a, b)] = (faced[pair(a, b)] || 0) + 1;
  return [a, b];
}

/** Thème + compte à rebours de 5 s, puis la question démarre toute seule. */
function beginIntro_(st) {
  const q = st.current;
  // L'extrait dure le temps de réponse : 30 s de chrono = 30 s de musique
  if (q.media && q.media.kind === 'youtube') q.media.dur = st.settings.duration;
  st.status = 'INTRO';
  q.introEnd = Date.now() + INTRO_S * 1000;
  if (st.settings.chrono === 'auto') {
    q.start = q.introEnd;
    if (q.media && q.media.kind === 'youtube') st.media = { seq: st.media.seq + 1, action: 'play', at: q.start };
    else st.media = { seq: st.media.seq + 1, action: 'stop' };
  } else {
    q.start = null;
    st.media = { seq: st.media.seq + 1, action: 'stop' };
  }
}

/** Fin de l'intro calculée à la volée : pas besoin d'un appel serveur au bon moment. */
function promote_(st) {
  if (st && st.status === 'INTRO' && st.current && Date.now() >= st.current.introEnd) {
    st.status = st.settings.chrono === 'auto' ? 'QUESTION' : 'READ';
  }
  return st;
}

function startTimer_(st) {
  st.status = 'QUESTION';
  st.current.start = Date.now();
  if (st.current.media && st.current.media.kind === 'youtube') st.media = { seq: st.media.seq + 1, action: 'play', at: st.current.start };
}

function adminStartTimer(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (st.status === 'READ' || (st.status === 'INTRO' && !st.current.start)) { startTimer_(st); saveState_(st); }
    return adminView_(st);
  });
}

function adminReveal(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (LIVE.indexOf(st.status) >= 0) { doReveal_(st); saveState_(st); }
    return adminView_(st);
  });
}

function adminShowScores(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (st.status === 'REVEAL') { st.status = 'SCORES'; saveState_(st); }
    return adminView_(st);
  });
}

/** Remplace la question en cours par une autre du même niveau (question ratée, doublon…). */
function adminSkip(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (LIVE.indexOf(st.status) < 0) return adminView_(st);
    const row = pickRow_(getPool_(st, st.chapIndex), st.level, st.used);
    if (!row) throw new Error('Aucune question de remplacement disponible.');
    st.used.push(row);
    const prev = st.current;
    st.current = loadQuestion_(row, st);
    decorate_(st, prev);
    beginIntro_(st);
    saveState_(st);
    return adminView_(st);
  });
}

function adminEnd(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    if (LIVE.indexOf(st.status) >= 0) doReveal_(st);
    endGame_(st);
    saveState_(st);
    return adminView_(st);
  });
}

function adminMedia(pin, code, action) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    st.media = { seq: st.media.seq + 1, action: action === 'stop' ? 'stop' : 'play' };
    saveState_(st);
    return adminView_(st);
  });
}

function adminSetLevel(pin, code, level) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    st.level = Math.max(1, Math.min(5, Number(level) || 1));
    saveState_(st);
    return adminView_(st);
  });
}

/** Réglages modifiables en cours de partie. */
function adminUpdateSettings(pin, code, patch) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    ['visual', 'sounds', 'audioOn', 'chrono', 'autoReveal', 'duration', 'choix', 'estimQcm'].forEach(k => {
      if (patch && patch[k] !== undefined) st.settings[k] = patch[k];
    });
    st.settings = normalizeSettings_(st.settings);
    saveState_(st);
    return adminView_(st);
  });
}

function adminKick(pin, code, pid) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    delete st.players[pid];
    saveState_(st);
    return adminView_(st);
  });
}

/** Équipes : nouveau tirage au sort équilibré. */
function adminShuffleTeams(pin, code) {
  checkPin_(pin);
  return withLock_(() => {
    const st = mustState_(code);
    shuffle_(Object.keys(st.players)).forEach((p, i) => { st.players[p].team = i % st.settings.teams; });
    saveState_(st);
    return adminView_(st);
  });
}

function adminState(pin, code) {
  checkPin_(pin);
  return adminView_(mustState_(code));
}

/* ------------------------------------------------------------------ */
/* Sélection des questions                                             */
/* ------------------------------------------------------------------ */

function getPool_(st, i) {
  const c = cache_().get(poolKey_(st.code, i));
  if (c) return JSON.parse(c);
  const pools = buildPools_(st.settings);
  pools.forEach((p, k) => cache_().put(poolKey_(st.code, k), JSON.stringify(p), TTL));
  return pools[i];
}

/** Cherche au niveau visé, puis au-dessus, puis en dessous ; privilégie les questions les moins jouées. */
function pickRow_(pool, level, used) {
  const free = pool.filter(p => used.indexOf(p[0]) < 0);
  const order = [level];
  for (let d = 1; d <= 4; d++) { order.push(level + d); order.push(level - d); }
  for (let k = 0; k < order.length; k++) {
    const L = order[k];
    if (L < 1 || L > 5) continue;
    const c = free.filter(p => p[1] === L);
    if (!c.length) continue;
    const minUse = Math.min.apply(null, c.map(p => p[2]));
    const best = c.filter(p => p[2] === minUse);
    return best[Math.floor(Math.random() * best.length)][0];
  }
  return null;
}

function parseMedia_(url, start, dur) {
  url = String(url || '').trim();
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  if (yt) {
    const t = url.match(/[?&]t=(\d+)/);
    return { kind: 'youtube', id: yt[1], start: Number(start) || (t ? Number(t[1]) : 0), dur: Number(dur) || 15 };
  }
  // Photo : « #zoom » = gros plan qui se dézoome, « #flou » = image floue qui se précise pendant le chrono
  const fx = (url.match(/#(zoom|flou)$/) || [])[1] || '';
  return { kind: 'image', url: url.replace(/#(zoom|flou)$/, ''), fx: fx };
}

function loadQuestion_(row, st) {
  const r = sheet_(SH.QUESTIONS).getRange(row, 1, 1, HEADERS.Questions.length).getValues()[0];
  const type = String(r[QC.TYPE]).toUpperCase().trim();
  const q = {
    id: String(r[QC.ID]), row: row, theme: String(r[QC.THEME]), cat: String(r[QC.CAT]),
    diff: Number(r[QC.DIFF]) || 1, type: type, text: String(r[QC.TEXTE]),
    expl: String(r[QC.EXPL] || ''), indices: String(r[QC.INDICES] || ''),
    media: parseMedia_(r[QC.MEDIA], r[QC.DEBUT], r[QC.DUREE]), secret: {},
    epoque: String(r[QC.EPOQUE] || ''), anecdote: String(r[QC.ANECDOTE] || ''),
  };
  const level = st ? st.level : q.diff;
  const rep = String(r[QC.REP]).trim();
  if (type === 'VF') {
    q.choices = ['Vrai', 'Faux'];
    q.secret.correct = /^v/i.test(rep) ? 0 : 1;
    q.answerText = q.choices[q.secret.correct];
  } else if (type === 'ESTIMATION') {
    q.secret.value = Number(rep.replace(/\s/g, '').replace(',', '.'));
    q.unit = String(r[QC.C2] || '');
    q.secret.tol = r[QC.C3] === '' ? null : Number(String(r[QC.C3]).replace(',', '.'));
    q.answerText = formatNum_(q.secret.value, q.unit) + (q.unit ? ' ' + q.unit : '');
    // Estimation posée en QCM : 4 propositions générées, d'autant plus proches que le niveau est élevé
    const mode = st ? st.settings.estimQcm : 'libre';
    if (!isNaN(q.secret.value) && (mode === 'qcm' || (mode === 'mixte' && Math.random() < 0.5))) {
      const nums = numericChoices_(q.secret.value, level, q.unit);
      q.type = 'QCM';
      q.fromEstimation = true;
      q.choices = nums.map(n => formatNum_(n, q.unit) + (q.unit ? ' ' + q.unit : ''));
      q.secret.correct = nums.indexOf(q.secret.value);
    }
  } else if (type === 'CARTE') {
    // Réponse = « latitude, longitude » ; choix 2 = zone de la carte ; choix 3 = nom du lieu ; choix 4 = rayon « plein score » (km)
    const ll = rep.split(/[,;\s]+/).map(Number);
    q.zone = String(r[QC.C2] || 'monde').trim().toLowerCase();
    if (!ZONES[q.zone]) q.zone = 'monde';
    q.place = String(r[QC.C3] || '').trim();
    const z = ZONES[q.zone];
    const k = [1.3, 1.15, 1, 0.85, 0.7][Math.max(1, Math.min(5, level)) - 1]; // plus le niveau monte, plus il faut être précis
    q.secret.lat = ll[0]; q.secret.lon = ll[1];
    q.secret.full = (Number(r[QC.C4]) || z.full) * k;
    q.secret.zero = z.zero * k;
    q.answerText = q.place || (ll[0].toFixed(2) + ', ' + ll[1].toFixed(2));
  } else if (type === 'ORDRE') {
    const items = rep.split('|').map(s => s.trim()).filter(String);
    let sh = shuffle_(items);
    for (let k = 0; k < 5 && sh.join() === items.join(); k++) sh = shuffle_(items);
    q.items = sh;
    q.hint = String(r[QC.C2] || '');
    q.secret.order = items;
    q.answerText = items.join(' → ');
  } else {
    q.type = 'QCM';
    const fixed = [r[QC.C2], r[QC.C3], r[QC.C4]].map(x => String(x).trim()).filter(x => x && x !== rep);
    let wrong = fixed;
    const fam = st && st.settings.choix === 'adaptatifs' ? getFamilies_(st)[q.theme + '|' + q.text] : null;
    if (fam) wrong = adaptiveDistractors_(rep, fixed, fam, q.cat, q.epoque, level);
    q.choices = shuffle_([rep].concat(wrong.slice(0, 3)));
    q.secret.correct = q.choices.indexOf(rep);
    q.answerText = rep;
  }
  return q;
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

// full = distance (km) sous laquelle on marque tous les points ; zero = distance à partir de laquelle on ne marque plus rien
const ZONES = {
  monde: { full: 150, zero: 3000 }, europe: { full: 40, zero: 900 }, france: { full: 12, zero: 250 },
  afrique: { full: 120, zero: 2500 }, asie: { full: 120, zero: 2500 }, ameriques: { full: 120, zero: 2500 }, paris: { full: 0.3, zero: 6 },
};

function distKm_(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Précision d'un point posé sur la carte : 1 = parfait, 0 = trop loin. */
function mapScore_(q, a) {
  if (!a || a.length !== 2 || isNaN(Number(a[0])) || isNaN(Number(a[1]))) return { f: 0, km: null };
  const km = distKm_(Number(a[0]), Number(a[1]), q.secret.lat, q.secret.lon);
  const s = q.secret;
  const f = km <= s.full ? 1 : Math.max(0, 1 - (km - s.full) / (s.zero - s.full));
  return { f: f, km: km };
}
const MAP_OK = 0.75; // « bonne réponse » (sons, difficulté, statistiques) à partir de 75 % de précision

function formatKm_(km) {
  if (km === null || km === undefined) return '';
  return km < 1 ? Math.round(km * 1000) + ' m' : km < 10 ? (Math.round(km * 10) / 10).toLocaleString('fr-FR') + ' km' : Math.round(km).toLocaleString('fr-FR') + ' km';
}

/* ------------------------------------------------------------------ */
/* Propositions dynamiques                                             */
/* ------------------------------------------------------------------ */

/**
 * Familles de questions qui se répètent (même thème + même intitulé, ex. « Quel est ce titre ? »).
 * Leurs bonnes réponses servent de réservoir de pièges : { "thème|intitulé": [[réponse, catégorie, époque], …] }
 */
function buildFamilies_(data) {
  const fam = {};
  data.forEach(r => {
    if (String(r[QC.TYPE]).toUpperCase() !== 'QCM' || !r[QC.TEXTE] || String(r[QC.ACTIF]).toLowerCase() === 'non') return;
    const k = String(r[QC.THEME]) + '|' + String(r[QC.TEXTE]);
    const rep = String(r[QC.REP]).trim();
    const f = fam[k] = fam[k] || [];
    if (rep && !f.some(x => x[0] === rep)) f.push([rep, String(r[QC.CAT]), String(r[QC.EPOQUE] || '')]);
  });
  Object.keys(fam).forEach(k => { if (fam[k].length < 6) delete fam[k]; });
  return fam;
}

function getFamilies_(st) {
  const c = cache_().get('fam_' + st.code);
  if (c) return JSON.parse(c);
  const fam = buildFamilies_(readQuestions_());
  cache_().put('fam_' + st.code, JSON.stringify(fam), TTL);
  return fam;
}

/**
 * Choisit 3 pièges selon le niveau de la partie :
 *  - niveau 1-2 : réponses éloignées (autre époque, autre catégorie) → facile
 *  - niveau 3   : un piège écrit à la main + des réponses assez proches
 *  - niveau 4-5 : les pièges écrits à la main (même artiste…) + la réponse la plus proche (même époque) → difficile
 */
function adaptiveDistractors_(rep, fixed, fam, cat, era, level) {
  const norm = x => String(x).trim().toLowerCase();
  const taken = {};
  taken[norm(rep)] = true;
  const fixedN = fixed.map(norm);
  const ranked = fam.filter(f => !taken[norm(f[0])] && fixedN.indexOf(norm(f[0])) < 0)
    .map(f => ({ t: f[0], close: (f[1] === cat ? 1 : 0) + (era && f[2] === era ? 2 : 0) + Math.random() * 0.9 }))
    .sort((a, b) => b.close - a.close)
    .map(x => x.t);
  const out = [];
  const add = arr => arr.forEach(x => { if (out.length < 3 && !taken[norm(x)]) { taken[norm(x)] = true; out.push(x); } });
  const fx = shuffle_(fixed);
  if (level >= 4) { add(fx.slice(0, 2)); add(ranked); }
  else if (level === 3) { add(fx.slice(0, 1)); add(shuffle_(ranked.slice(0, Math.max(3, Math.ceil(ranked.length / 3))))); }
  else add(shuffle_(ranked.slice(-Math.max(3, Math.ceil(ranked.length / 2)))));
  add(fx); add(ranked); // complète si besoin
  return out;
}

/** 4 nombres dont la bonne réponse, triés ; l'écart se resserre quand le niveau monte. */
function numericChoices_(v, level, unit) {
  const L = Math.max(1, Math.min(5, Number(level) || 1));
  const isYear = v === Math.round(v) && v >= 1000 && v <= 2100 && !unit;
  const smallInt = v === Math.round(v) && Math.abs(v) <= 20;
  const nowY = new Date().getFullYear();
  const sign = () => (Math.random() < 0.5 ? -1 : 1);
  const out = [v];
  for (let guard = 0; out.length < 4 && guard < 300; guard++) {
    let c;
    if (isYear) {
      const d = 1 + Math.floor(Math.random() * [0, 12, 8, 5, 3, 2][L]);
      c = v + sign() * d;
      if (c > nowY) c = v - d;
    } else if (smallInt) {
      const d = 1 + Math.floor(Math.random() * [0, 5, 4, 3, 2, 2][L]);
      c = v + sign() * d;
      if (v >= 0 && c < 0) c = v + d;
    } else if (v === 0) {
      c = sign() * (1 + Math.floor(Math.random() * 4 * (6 - L)));
    } else {
      const pct = [0, 0.6, 0.4, 0.25, 0.15, 0.08][L] * (0.35 + Math.random() * 0.65);
      c = roundLike_(v * (1 + sign() * pct), v);
    }
    if (out.indexOf(c) < 0) out.push(c);
  }
  return out.sort((a, b) => a - b);
}

/** Arrondit une proposition comme la bonne réponse (206 → dizaines, 384 400 → dizaines de milliers, 42,195 → 1 décimale). */
function roundLike_(c, v) {
  const dec = (String(v).split('.')[1] || '').length;
  if (dec) return Number(c.toFixed(Math.min(dec, 1)));
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.abs(v))) - 1));
  return Math.round(c / mag) * mag;
}

/** 1987 reste « 1987 » (année), 3600 devient « 3 600 » ; avec une unité, toujours le format nombre. */
function formatNum_(n, unit) {
  if (isNaN(n)) return '?';
  return !unit && Math.abs(n) >= 1000 && Math.abs(n) < 3000 && n === Math.round(n) ? String(n) : Number(n).toLocaleString('fr-FR');
}

/* ------------------------------------------------------------------ */
/* Correction, points et difficulté                                    */
/* ------------------------------------------------------------------ */

function doReveal_(st) {
  const q = st.current;
  const s = st.settings;
  const answers = collectAnswers_(st);
  const pids = Object.keys(st.players);
  const results = {};
  const dist = q.choices ? q.choices.map(() => 0) : null;
  const mult = q.mult || 1;

  // Qui joue vraiment cette question ? (face à face : les 2 duellistes ; survie : les joueurs encore en vie)
  const plays = p => s.format === 'face' ? !!(q.duel && q.duel.indexOf(p) >= 0) : s.format === 'survie' ? !st.players[p].out : true;
  const inPlay = pids.filter(plays);

  // Estimation « le plus proche » : distance minimale parmi les réponses des joueurs en jeu
  let minDist = null;
  if (q.type === 'ESTIMATION' && s.estimation === 'proche') {
    inPlay.forEach(p => {
      if (!answers[p]) return;
      const d = Math.abs(Number(answers[p].a) - q.secret.value);
      if (!isNaN(d) && (minDist === null || d < minDist)) minDist = d;
    });
  }
  const tol = q.type === 'ESTIMATION'
    ? (q.secret.tol !== null && !isNaN(q.secret.tol) ? q.secret.tol : Math.abs(q.secret.value) * s.margePct / 100)
    : 0;

  // 1. Correction de chaque réponse
  pids.forEach(p => {
    const ans = answers[p];
    let ok = false, txt = '', f = null, km = null;
    if (ans) {
      const a = ans.a;
      if (q.type === 'QCM' || q.type === 'VF') {
        ok = Number(a) === q.secret.correct;
        txt = q.choices[Number(a)] || '';
        if (dist && dist[Number(a)] !== undefined) dist[Number(a)]++;
      } else if (q.type === 'ESTIMATION') {
        const d = Math.abs(Number(a) - q.secret.value);
        ok = !isNaN(d) && (s.estimation === 'proche' ? d === minDist && plays(p) : d <= tol);
        txt = formatNum_(Number(a));
      } else if (q.type === 'ORDRE') {
        const seq = (a || []).map(i => q.items[i]);
        ok = seq.join('|') === q.secret.order.join('|');
        txt = seq.join(' → ');
      } else if (q.type === 'CARTE') {
        const m = mapScore_(q, a);
        f = m.f; km = m.km;
        ok = f >= MAP_OK;
        txt = km === null ? '' : 'à ' + formatKm_(km);
      }
    }
    const pl = st.players[p];
    let pts = 0;
    if (plays(p) && ans && (ok || (q.type === 'CARTE' && f > 0))) {
      const base = points_(s, q.diff, ans.t, ok ? (pl.streak || 0) + 1 : 0);
      pts = q.type === 'CARTE' ? (s.points === 'simple' ? (ok ? 1 : 0) : Math.round(base * f)) : base;
      pts *= mult;
    }
    results[p] = { ok: ok, pts: pts, a: txt, t: ans ? ans.t : null, answered: !!ans, f: f, km: km, spect: !plays(p) };
  });

  // 2. Règles du format
  let winner = null;
  const best = list => list.filter(p => results[p].ok).sort((x, y) =>
    (q.type === 'CARTE' ? (results[y].f - results[x].f) : 0) || (results[x].t - results[y].t))[0] || null;
  if (s.format === 'buzzer') {
    winner = best(inPlay);
    inPlay.forEach(p => { if (p !== winner) results[p].pts = 0; });
  } else if (s.format === 'face' && q.duel) {
    winner = best(q.duel.filter(p => st.players[p]));
    q.duel.forEach(p => { if (st.players[p]) { st.players[p].duels = (st.players[p].duels || 0) + 1; if (p !== winner) results[p].pts = 0; } });
    if (winner) st.players[winner].duelWins = (st.players[winner].duelWins || 0) + 1;
  }
  let eliminated = [], repechage = false;
  if (s.format === 'survie') {
    const failed = inPlay.filter(p => !results[p].ok);
    // Si tous les survivants se trompent en même temps, personne ne perd de vie (repêchage)
    repechage = failed.length > 0 && failed.length === inPlay.length;
    if (!repechage) failed.forEach(p => {
      const pl = st.players[p];
      pl.lives = Math.max(0, (pl.lives === undefined ? s.lives : pl.lives) - 1);
      results[p].lostLife = true;
      if (!pl.lives) { pl.out = st.qIndex + 1; eliminated.push(pl.pseudo); }
    });
  }

  // 3. Scores, séries, statistiques
  let nbOk = 0;
  pids.forEach(p => {
    const pl = st.players[p];
    const r = results[p];
    if (r.spect) return;
    pl.streak = r.ok ? (pl.streak || 0) + 1 : 0;
    pl.score = (pl.score || 0) + r.pts;
    pl.good = (pl.good || 0) + (r.ok ? 1 : 0);
    if (r.ok) pl.time = Math.round(((pl.time || 0) + r.t) * 10) / 10;
    if (r.ok) nbOk++;
  });

  const rate = inPlay.length ? nbOk / inPlay.length : 0;
  const before = st.level;
  if (inPlay.length) {
    if (rate === 1) st.level = Math.min(5, st.level + 2);
    else if (rate >= 0.8) st.level = Math.min(5, st.level + 1);
  }

  let closest = null, pins = null;
  if (q.type === 'ESTIMATION' || q.type === 'CARTE') {
    closest = pids.filter(p => answers[p] && (q.type !== 'CARTE' || results[p].km !== null)).map(p => ({
      pseudo: st.players[p].pseudo, a: results[p].a, ok: results[p].ok, pts: results[p].pts, t: results[p].t,
      d: q.type === 'CARTE' ? results[p].km : Math.abs(Number(answers[p].a) - q.secret.value),
    })).sort((x, y) => x.d - y.d || x.t - y.t).slice(0, q.type === 'CARTE' ? 15 : 5);
  }
  if (q.type === 'CARTE') {
    pins = pids.filter(p => answers[p] && results[p].km !== null).map(p => ({
      pseudo: st.players[p].pseudo, lat: Number(answers[p].a[0]), lon: Number(answers[p].a[1]), km: Math.round(results[p].km * 10) / 10, ok: results[p].ok, t: results[p].t,
    }));
  }

  // La vedette de la question : le plus proche (carte, estimation), sinon la bonne réponse la plus rapide
  let top = null, fast = [];
  const pseudoT = p => ({ pseudo: st.players[p].pseudo, t: results[p].t, ok: results[p].ok });
  if (q.type === 'ESTIMATION' || q.type === 'CARTE') {
    const dOf = p => q.type === 'CARTE' ? results[p].km : Math.abs(Number(answers[p].a) - q.secret.value);
    const cand = inPlay.filter(p => answers[p] && dOf(p) !== null && !isNaN(dOf(p)))
      .sort((x, y) => dOf(x) - dOf(y) || results[x].t - results[y].t);
    if (cand.length) top = Object.assign(pseudoT(cand[0]), { kind: 'proche', d: dOf(cand[0]), a: results[cand[0]].a });
  } else {
    fast = inPlay.filter(p => answers[p] && results[p].ok).sort((x, y) => results[x].t - results[y].t).slice(0, 3).map(pseudoT);
    if (fast.length) top = Object.assign({ kind: 'rapide' }, fast[0]);
  }

  const alive = s.format === 'survie' ? pids.filter(p => !st.players[p].out).length : null;
  if (s.format === 'survie' && pids.length >= 2 && alive <= 1) st.finished = true;

  st.reveal = {
    qIndex: st.qIndex, correct: q.secret.correct, answerText: q.answerText, order: q.secret.order || null,
    dist: dist, rate: rate, nbOk: nbOk, nbPlay: inPlay.length, levelBefore: before, levelAfter: st.level, results: results,
    closest: closest, tol: q.type === 'ESTIMATION' && s.estimation === 'marge' ? tol : null,
    pins: pins, target: q.type === 'CARTE' ? { lat: q.secret.lat, lon: q.secret.lon, full: q.secret.full } : null,
    winner: winner ? st.players[winner].pseudo : null, mult: mult, top: top, fast: fast,
    eliminated: eliminated, repechage: repechage, alive: alive,
  };
  st.status = 'REVEAL';
  st.media = { seq: st.media.seq + 1, action: 'stop' };

  logAnswers_(st, results);
}

function points_(s, diff, t, streak) {
  if (s.points === 'simple') return 1;
  const base = 100 * diff;
  const speed = Math.max(0, 1 - (t || 0) / s.duration);
  let pts = base + Math.round(base * 0.5 * speed);
  if (s.points === 'series' && streak >= 3) pts += Math.min(200, 50 * (streak - 2));
  return pts;
}

function logAnswers_(st, results) {
  try {
    const q = st.current;
    const ch = st.settings.chapters[st.chapIndex];
    const now = new Date();
    const rows = Object.keys(results).filter(p => !results[p].spect).map(p => {
      const r = results[p];
      return [now, st.code, ch ? ch.name : '', st.qIndex + 1, q.id, q.theme, q.cat, q.diff, st.players[p].pseudo,
        r.answered ? r.a : '(pas de réponse)', r.ok, r.t === null ? '' : r.t, r.pts];
    });
    const sh = sheet_(SH.REPONSES);
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    const cell = sheet_(SH.QUESTIONS).getRange(q.row, QC.UTIL + 1);
    cell.setValue((Number(cell.getValue()) || 0) + 1);
  } catch (e) {
    console.error('logAnswers_', e);
  }
}

function ranking_(st) {
  const survie = st.settings.format === 'survie';
  return Object.keys(st.players).map(p => Object.assign({ pid: p }, st.players[p]))
    .sort((a, b) => (survie ? ((b.out || 1e9) - (a.out || 1e9)) || ((b.lives || 0) - (a.lives || 0)) : 0)
      || (b.score || 0) - (a.score || 0) || (a.time || 0) - (b.time || 0) || a.pseudo.localeCompare(b.pseudo))
    .map((p, i) => Object.assign(p, { rank: i + 1 }));
}

/** Classement des équipes : moyenne des points par joueur (équitable si les équipes n'ont pas le même nombre de joueurs). */
function teamRanking_(st) {
  if (st.settings.format !== 'equipes') return null;
  const t = [];
  for (let i = 0; i < st.settings.teams; i++) t.push({ team: i, name: TEAM_NAMES[i], members: [], total: 0 });
  Object.keys(st.players).forEach(p => {
    const pl = st.players[p];
    const x = t[pl.team || 0] || t[0];
    x.members.push(pl.pseudo);
    x.total += pl.score || 0;
  });
  t.forEach(x => { x.score = x.members.length ? Math.round(x.total / x.members.length) : 0; });
  return t.sort((a, b) => b.score - a.score).map((x, i) => Object.assign(x, { rank: i + 1 }));
}

/** Équipes : un nouveau joueur rejoint l'équipe la moins nombreuse. */
function smallestTeam_(st) {
  const n = [];
  for (let i = 0; i < st.settings.teams; i++) n.push(0);
  Object.keys(st.players).forEach(p => { const t = st.players[p].team; if (n[t] !== undefined) n[t]++; });
  const min = Math.min.apply(null, n);
  const c = n.map((v, i) => i).filter(i => n[i] === min);
  return c[Math.floor(Math.random() * c.length)];
}

function endGame_(st) {
  st.status = 'END';
  st.current = null;
  st.media = { seq: st.media.seq + 1, action: 'stop' };
  if (st.persisted) return;
  st.persisted = true;
  PropertiesService.getScriptProperties().deleteProperty('CURRENT_GAME');
  if (st.qIndex < 0) return; // partie annulée avant la première question : rien à enregistrer
  try {
    const rk = ranking_(st);
    const s = st.settings;
    sheet_(SH.PARTIES).appendRow([st.code, new Date(), s.chapters.map(c => c.name + ' (' + c.nb + ')').join(' · '),
      st.qIndex + 1, s.points + (s.format !== 'classique' ? ' · ' + s.format : ''), s.estimation, rk.length, rk[0] ? rk[0].pseudo : '', rk[0] ? rk[0].score : '',
      rk.slice(0, 3).map(p => p.rank + '. ' + p.pseudo + ' (' + p.score + ')').join(' · ')]);
    recalculerClassement_();
  } catch (e) {
    console.error('endGame_', e);
  }
  PropertiesService.getScriptProperties().deleteProperty('CURRENT_GAME');
}

/* ------------------------------------------------------------------ */
/* Joueurs                                                             */
/* ------------------------------------------------------------------ */

function checkPid_(pid) {
  if (!/^[a-z0-9]{8,40}$/i.test(String(pid))) throw new Error('Identifiant joueur invalide.');
}

function playerJoin(code, pid, pseudo) {
  checkPid_(pid);
  pseudo = String(pseudo || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  if (pseudo.length < 2) throw new Error('Pseudo trop court (2 caractères minimum).');
  return withLock_(() => {
    const st = mustState_(String(code).toUpperCase());
    if (st.status === 'END') throw new Error('Cette partie est terminée.');
    const low = pseudo.toLowerCase();
    const taken = Object.keys(st.players).some(p => p !== pid && st.players[p].pseudo.toLowerCase() === low);
    if (taken) throw new Error('Ce pseudo est déjà pris dans la partie.');
    if (!st.players[pid]) {
      if (Object.keys(st.players).length >= st.settings.maxPlayers) throw new Error('La partie est complète.');
      st.players[pid] = { pseudo: pseudo, score: 0, good: 0, time: 0, streak: 0, joined: Date.now(), lives: st.settings.lives };
      if (st.settings.format === 'equipes') st.players[pid].team = smallestTeam_(st);
      // Survie : un joueur qui arrive en cours de partie commence avec une seule vie
      if (st.settings.format === 'survie' && st.qIndex >= 0) st.players[pid].lives = 1;
    } else {
      st.players[pid].pseudo = pseudo;
    }
    saveState_(st);
    heartbeat_(st.code, pid, 'visible');
    return publicView_(st, pid);
  });
}

function playerAnswer(code, pid, qIndex, answer) {
  checkPid_(pid);
  const st = mustState_(code);
  if (!st.players[pid]) return { ok: false, msg: 'Tu ne fais plus partie de la partie.' };
  if (st.status === 'INTRO' && st.qIndex === qIndex) return { ok: false, msg: 'La question n\'a pas encore commencé.' };
  if (st.status !== 'QUESTION' || st.qIndex !== qIndex) return { ok: false, msg: 'Trop tard !' };
  if (st.settings.format === 'survie' && st.players[pid].out) return { ok: false, msg: 'Tu es éliminé·e 💀 Regarde la suite !' };
  const elapsed = (Date.now() - st.current.start) / 1000;
  if (elapsed > st.settings.duration + GRACE_S) return { ok: false, msg: 'Temps écoulé !' };
  if (st.current.type === 'CARTE' && !(Array.isArray(answer) && answer.length === 2 && !isNaN(Number(answer[0])) && !isNaN(Number(answer[1])))) {
    return { ok: false, msg: 'Pose un point sur la carte.' };
  }
  const key = ansKey_(st, pid);
  if (cache_().get(key)) return { ok: false, msg: 'Réponse déjà enregistrée.' };
  const t = Math.round(Math.min(elapsed, st.settings.duration) * 10) / 10;
  cache_().put(key, JSON.stringify({ a: answer, t: t }), TTL);
  return { ok: true, t: t };
}

/** Joker 50/50 : retire deux mauvaises réponses (une fois par partie). */
function playerJoker(code, pid, qIndex) {
  checkPid_(pid);
  return withLock_(() => {
    const st = mustState_(code);
    const pl = st.players[pid];
    const q = st.current;
    if (!pl || !st.settings.joker) return { ok: false, msg: 'Pas de joker dans cette partie.' };
    if (st.status !== 'QUESTION' || st.qIndex !== qIndex) return { ok: false, msg: 'Trop tard !' };
    if (q.type !== 'QCM' || !q.choices || q.choices.length < 4) return { ok: false, msg: 'Le joker ne marche que sur un QCM à 4 propositions.' };
    if (pl.joker) return { ok: false, msg: 'Tu as déjà utilisé ton joker.' };
    const wrong = shuffle_(q.choices.map((c, i) => i).filter(i => i !== q.secret.correct)).slice(0, 2);
    pl.joker = { q: st.qIndex, hide: wrong };
    saveState_(st);
    return { ok: true, hide: wrong };
  });
}

function playerPoll(code, pid, vis) {
  checkPid_(pid);
  const st = getState_(code);
  if (!st || st.status === 'END') {
    // Une nouvelle partie a été créée : le téléphone la rejoint tout seul avec le même pseudo
    const next = nextGame_(code);
    if (next) return { status: 'SWITCH', code: next };
    if (!st) return { status: 'NOGAME' };
  }
  if (st.players[pid]) heartbeat_(code, pid, vis);
  return publicView_(st, pid);
}

/** Code de la dernière partie créée, si elle est différente et encore ouverte. */
/** Dernière partie créée (cache rapide, avec les propriétés du script en secours). */
function screenGame_() {
  let g = cache_().get('screen_game');
  if (!g) {
    g = PropertiesService.getScriptProperties().getProperty('SCREEN_GAME');
    if (g) cache_().put('screen_game', g, TTL);
  }
  return g;
}

function nextGame_(code) {
  const latest = screenGame_();
  if (!latest || latest === code) return null;
  const st = getState_(latest);
  return st && st.status !== 'END' ? latest : null;
}

/** Appelé quand l'appli passe en arrière-plan / revient. */
function playerPresence(code, pid, vis) {
  checkPid_(pid);
  const st = getState_(code);
  if (st && st.players[pid]) heartbeat_(code, pid, vis, st.status === 'QUESTION');
  return true;
}

function heartbeat_(code, pid, vis, countExit) {
  const k = hbKey_(code, pid);
  const prev = JSON.parse(cache_().get(k) || '{"exits":0}');
  const hidden = vis === 'hidden';
  if (hidden && countExit && prev.vis !== 'hidden') prev.exits = (prev.exits || 0) + 1;
  cache_().put(k, JSON.stringify({ t: Date.now(), vis: hidden ? 'hidden' : 'visible', exits: prev.exits || 0 }), TTL);
}

/** L'écran public suit toujours la dernière partie créée : inutile de le recharger entre deux parties. */
function screenPoll(code) {
  const latest = screenGame_();
  if (latest && latest !== code && getState_(latest)) return { status: 'SWITCH', code: latest };
  const st = getState_(code);
  if (!st) return { status: 'NOGAME' };
  return publicView_(st, null);
}

/* ------------------------------------------------------------------ */
/* Vues                                                                */
/* ------------------------------------------------------------------ */

function publicQuestion_(q) {
  if (!q) return null;
  return {
    id: q.id, type: q.type, text: q.text, theme: q.theme, cat: q.cat, diff: q.diff,
    choices: q.choices || null, unit: q.unit || '', items: q.items || null, hint: q.hint || '',
    media: q.media, start: q.start || null, epoque: q.epoque || '', zone: q.zone || null,
    mult: q.mult || 1, gold: !!q.gold,
  };
}

function chapterInfo_(st) {
  const ch = st.settings.chapters[st.chapIndex];
  if (!ch) return null;
  return { idx: st.chapIndex + 1, count: st.settings.chapters.length, name: ch.name, nb: ch.nb, themes: ch.themes, level: ch.level };
}

function publicView_(st, pid) {
  const s = st.settings;
  const v = {
    code: st.code, status: st.status, version: st.version, now: Date.now(), title: s.title,
    visual: s.visual, sounds: s.sounds, audioOn: s.audioOn, duration: s.duration, points: s.points,
    qIndex: st.qIndex, total: st.total, chapQ: st.chapQ, level: st.level, chapter: chapterInfo_(st),
    media: st.media, playerCount: Object.keys(st.players).length,
    format: s.format, lives: s.lives, joker: s.joker, finished: !!st.finished,
  };
  if (s.format === 'equipes') v.teams = teamRanking_(st);
  if (s.format === 'survie') {
    v.survivors = Object.keys(st.players).filter(p => !st.players[p].out).map(p => ({ pseudo: st.players[p].pseudo, lives: st.players[p].lives }));
  }
  if (st.current && st.current.duel && LIVE.concat(['REVEAL']).indexOf(st.status) >= 0) {
    v.duel = st.current.duel.filter(p => st.players[p]).map(p => st.players[p].pseudo);
  }
  if (st.status === 'LOBBY' || st.status === 'CHAPTER') v.lobby = Object.keys(st.players).map(p => st.players[p].pseudo);
  if (['INTRO', 'READ', 'QUESTION', 'REVEAL'].indexOf(st.status) >= 0) v.question = publicQuestion_(st.current);
  if (st.status === 'INTRO') {
    // la question est envoyée pendant l'intro (sans la réponse) pour s'afficher pile à la fin du compte à rebours
    v.intro = { end: st.current.introEnd, next: s.chrono === 'auto' ? 'QUESTION' : 'READ' };
  }
  if (st.status === 'QUESTION' || st.status === 'INTRO') {
    const pids = Object.keys(st.players);
    const got = cache_().getAll(pids.map(p => ansKey_(st, p)));
    v.answeredCount = Object.keys(got).length;
  }
  if (st.reveal && (st.status === 'REVEAL' || st.status === 'SCORES')) {
    const r = st.reveal;
    v.reveal = { correct: r.correct, answerText: r.answerText, order: r.order, dist: r.dist, rate: r.rate, nbOk: r.nbOk, nbPlay: r.nbPlay,
      levelUp: r.levelAfter > r.levelBefore, closest: r.closest, tol: r.tol, expl: st.current ? st.current.expl : '',
      pins: r.pins, target: r.target, winner: r.winner, mult: r.mult, top: r.top, fast: r.fast, eliminated: r.eliminated, repechage: r.repechage, alive: r.alive };
  }
  const rk = ranking_(st);
  if (['REVEAL', 'SCORES', 'END'].indexOf(st.status) >= 0) {
    v.ranking = rk.slice(0, st.status === 'END' ? 15 : 10).map(p => ({ pseudo: p.pseudo, score: p.score, rank: p.rank, good: p.good,
      lives: p.lives, out: p.out || 0, team: p.team, duelWins: p.duelWins || 0 }));
  }
  if (pid && st.players[pid]) {
    const me = rk.filter(p => p.pid === pid)[0];
    v.me = { pseudo: me.pseudo, score: me.score, rank: me.rank, good: me.good, streak: me.streak || 0,
      lives: me.lives, out: me.out || 0, team: me.team, jokerUsed: !!me.joker,
      spectator: s.format === 'face' && !!(st.current && st.current.duel) && st.current.duel.indexOf(pid) < 0 };
    if (me.joker && me.joker.q === st.qIndex) v.me.hide = me.joker.hide;
    if (LIVE.indexOf(st.status) >= 0) {
      const a = st.current ? cache_().get(ansKey_(st, pid)) : null;
      v.me.answered = !!a;
      if (a) v.me.answer = JSON.parse(a).a;
    }
    if (st.reveal && st.status === 'REVEAL') v.me.result = st.reveal.results[pid] || { ok: false, pts: 0, answered: false };
  } else if (pid) {
    v.notJoined = true;
  }
  return v;
}

function adminView_(st) {
  const v = publicView_(st, null);
  v.settings = st.settings;
  v.url = ScriptApp.getService().getUrl();
  v.current = st.current ? Object.assign({}, publicQuestion_(st.current), {
    answerText: st.current.answerText, expl: st.current.expl, indices: st.current.indices, correct: st.current.secret.correct,
    anecdote: st.current.anecdote || '',
    target: st.current.type === 'CARTE' ? { lat: st.current.secret.lat, lon: st.current.secret.lon, full: st.current.secret.full } : null,
  }) : null;
  v.reveal = st.reveal && (st.status === 'REVEAL' || st.status === 'SCORES') ? st.reveal : null;

  const answers = LIVE.indexOf(st.status) >= 0 ? collectAnswers_(st) : {};
  const judge = liveJudge_(st, answers);
  const pids = Object.keys(st.players);
  const hb = cache_().getAll(pids.map(p => hbKey_(st.code, p)));
  const now = Date.now();
  const live = st.current && st.current.choices ? st.current.choices.map(() => 0) : null;

  v.players = ranking_(st).map(p => {
    const h = hb[hbKey_(st.code, p.pid)] ? JSON.parse(hb[hbKey_(st.code, p.pid)]) : null;
    let presence = 'off';
    if (h) presence = h.vis === 'hidden' ? 'bg' : (now - h.t < 10000 ? 'on' : 'off');
    const a = answers[p.pid];
    let answerText = '';
    if (a && st.current) {
      if (st.current.choices) { answerText = st.current.choices[Number(a.a)] || ''; if (live && live[Number(a.a)] !== undefined) live[Number(a.a)]++; }
      else if (st.current.type === 'ORDRE') answerText = (a.a || []).map(i => st.current.items[i]).join(' → ');
      else if (st.current.type === 'CARTE') answerText = 'à ' + formatKm_(mapScore_(st.current, a.a).km);
      else answerText = formatNum_(Number(a.a));
    }
    const res = v.reveal && v.reveal.results ? v.reveal.results[p.pid] : null;
    return {
      pid: p.pid, pseudo: p.pseudo, score: p.score, good: p.good, time: p.time, streak: p.streak || 0, rank: p.rank,
      presence: presence, exits: h ? h.exits : 0, lastSeen: h ? Math.round((now - h.t) / 1000) : null,
      answered: !!a || (res ? res.answered : false), answerText: a ? answerText : (res ? res.a : ''), t: a ? a.t : (res ? res.t : null),
      ok: res ? res.ok : null, pts: res ? res.pts : null,
      a: a ? a.a : null, liveOk: a ? judge(a.a) : null,
      lives: p.lives, out: p.out || 0, team: p.team, duelWins: p.duelWins || 0,
      joker: !!(p.joker && st.current && p.joker.q === st.qIndex), jokerUsed: !!p.joker,
      duel: !!(st.current && st.current.duel && st.current.duel.indexOf(p.pid) >= 0),
      lostLife: res ? !!res.lostLife : false,
    };
  });
  v.answeredCount = Object.keys(answers).length;
  v.liveDist = live;
  return v;
}

/** Correction « en direct » pour le maître du jeu, avant la révélation. */
function liveJudge_(st, answers) {
  const q = st.current;
  if (!q) return () => null;
  if (q.type === 'QCM' || q.type === 'VF') return a => Number(a) === q.secret.correct;
  if (q.type === 'ORDRE') return a => (a || []).map(i => q.items[i]).join('|') === q.secret.order.join('|');
  if (q.type === 'CARTE') return a => mapScore_(q, a).f >= MAP_OK;
  const s = st.settings;
  if (s.estimation === 'proche') {
    const ds = Object.keys(answers).map(p => Math.abs(Number(answers[p].a) - q.secret.value)).filter(d => !isNaN(d));
    const min = ds.length ? Math.min.apply(null, ds) : null;
    return a => Math.abs(Number(a) - q.secret.value) === min;
  }
  const tol = q.secret.tol !== null && !isNaN(q.secret.tol) ? q.secret.tol : Math.abs(q.secret.value) * s.margePct / 100;
  return a => Math.abs(Number(a) - q.secret.value) <= tol;
}
