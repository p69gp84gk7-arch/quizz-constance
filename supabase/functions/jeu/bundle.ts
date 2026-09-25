/**
 * Le Quizz de Constance — fonction serveur, version « un seul fichier ».
 *
 * ⚠️  Fichier ENGENDRÉ : ne le modifiez pas à la main.
 *     Sources : supabase/functions/jeu/{engine.js, actions.js, index.ts}
 *     Reconstruction : node scripts/bundle.mjs
 *
 * À coller dans Supabase → Edge Functions → jeu → index.ts
 */

/* ================= BASE DE DONNÉES (db.js) ================= */
/**
 * Petit client de base de données, écrit à la main.
 *
 * Pourquoi ne pas utiliser la bibliothèque officielle @supabase/supabase-js ?
 * Parce qu'elle est téléchargée sur Internet au démarrage de la fonction. Quand
 * Supabase réveille une instance neuve (ce qui arrive sans arrêt), ce
 * téléchargement pouvait bloquer la requête pendant 15 à 40 secondes : le joueur
 * voyait la partie « charger » interminablement.
 *
 * Ici, aucune dépendance : on parle directement à PostgREST, l'interface HTTP de
 * la base, incluse dans Supabase. Le démarrage est immédiat.
 *
 * L'interface imite celle de supabase-js, pour que actions.js ne change pas :
 *   db.from('table').select('*').eq('code', 'AB12').maybeSingle()
 *   db.from('table').insert(rows) / .update(champs).eq(…) / .upsert(rows, {onConflict}) / .delete().eq(…)
 */

function createDb(url, serviceKey, opts) {
  // Première tentative généreuse (la base peut être en train de se réveiller),
  // deuxième plus courte pour ne pas faire patienter indéfiniment.
  const T1 = (opts && opts.timeoutMs) || 30000;
  const T2 = (opts && opts.retryMs) || 20000;
  const base = String(url).replace(/\/+$/, '') + '/rest/v1/';
  const headers = {
    apikey: serviceKey,
    Authorization: 'Bearer ' + serviceKey,
    'Content-Type': 'application/json',
  };

  /**
   * Une requête HTTP vers PostgREST. Sur le forfait gratuit, la base s'endort :
   * la première requête après une longue inactivité peut demander une trentaine
   * de secondes. On patiente donc, et on réessaie une fois avant d'abandonner.
   */
  async function send(path, reqOpts, deuxieme) {
    const ctrl = new AbortController();
    const stop = setTimeout(() => ctrl.abort(), deuxieme ? T2 : T1);
    try {
      const res = await fetch(base + path, Object.assign({ signal: ctrl.signal }, reqOpts, {
        headers: Object.assign({}, headers, reqOpts.headers || {}),
      }));
      const txt = await res.text();
      let body = null;
      if (txt) { try { body = JSON.parse(txt); } catch (e) { body = txt; } }
      if (!res.ok) {
        const msg = (body && body.message) || (typeof body === 'string' ? body : '') || ('HTTP ' + res.status);
        return { data: null, error: { message: msg, code: body && body.code, status: res.status } };
      }
      return { data: body, error: null };
    } catch (e) {
      clearTimeout(stop);
      // première tentative ratée : la base était probablement en train de se réveiller
      if (!deuxieme) return send(path, reqOpts, true);
      const aborted = e && e.name === 'AbortError';
      return { data: null, error: { message: aborted
        ? 'La base met trop de temps à répondre (elle se réveille). Réessaie dans quelques secondes.'
        : String(e && e.message || e) } };
    } finally {
      clearTimeout(stop);
    }
  }

  const enc = encodeURIComponent;

  function builder(table, op, payload, opts) {
    const filters = [];
    const q = [];
    let wantSingle = false;
    let wantReturn = op === 'select';
    let rangeHdr = null;

    const url = () => {
      const parts = filters.map(([c, v, op]) => enc(c) + '=' + (op || 'eq') + '.' + enc(v)).concat(q);
      return table + (parts.length ? '?' + parts.join('&') : '');
    };

    async function run() {
      if (op === 'select') {
        const hdr = rangeHdr ? { Range: rangeHdr, 'Range-Unit': 'items' } : {};
        const r = await send(url(), { method: 'GET', headers: hdr });
        if (r.error) return r;
        const rows = Array.isArray(r.data) ? r.data : (r.data == null ? [] : [r.data]);
        return { data: wantSingle ? (rows[0] || null) : rows, error: null };
      }
      const prefer = [];
      if (op === 'upsert') prefer.push('resolution=merge-duplicates');
      prefer.push(wantReturn ? 'return=representation' : 'return=minimal');
      const method = op === 'update' ? 'PATCH' : op === 'delete' ? 'DELETE' : 'POST';
      const r = await send(url(), {
        method: method,
        headers: { Prefer: prefer.join(',') },
        body: op === 'delete' ? undefined : JSON.stringify(payload),
      });
      if (r.error) return r;
      return { data: Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []), error: null };
    }

    const api = {
      eq(col, val) { filters.push([col, String(val)]); return api; },
      /** Motif SQL : « Blind test% » = commence par. */
      like(col, motif) { filters.push([col, String(motif), 'like']); return api; },
      order(col, o) { q.push('order=' + enc(col) + '.' + (!o || o.ascending !== false ? 'asc' : 'desc')); return api; },
      limit(n) { q.push('limit=' + Number(n)); return api; },
      range(a, b) { rangeHdr = a + '-' + b; return api; },
      maybeSingle() { wantSingle = true; return api; },
      single() { wantSingle = true; return api; },
      /** Sur un select : les colonnes voulues. Sur une écriture : « rends-moi les lignes écrites ». */
      select(cols) {
        if (op === 'select') q.unshift('select=' + (cols && cols !== '*' ? cols.split(',').map(c => enc(c.trim())).join(',') : '*'));
        else wantReturn = true;
        return api;
      },
      then(res, rej) { return run().then(res, rej); },
    };
    if (op === 'upsert' && opts && opts.onConflict) q.push('on_conflict=' + opts.onConflict.split(',').map(c => enc(c.trim())).join(','));
    return api;
  }

  return {
    from(table) {
      return {
        select: cols => builder(table, 'select').select(cols || '*'),
        insert: p => builder(table, 'insert', p),
        update: p => builder(table, 'update', p),
        upsert: (p, o) => builder(table, 'upsert', p, o),
        delete: () => builder(table, 'delete'),
      };
    },

    /** Appelle une fonction SQL (ex. recalculer_difficulte). */
    async rpc(nom, params) {
      const r = await send('rpc/' + encodeURIComponent(nom), {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
      return r;
    },

    /** Vérifie le jeton du maître du jeu auprès de Supabase Auth. */
    async getUser(jwt) {
      try {
        const ctrl = new AbortController();
        const stop = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch(String(url).replace(/\/+$/, '') + '/auth/v1/user', {
          headers: { apikey: serviceKey, Authorization: 'Bearer ' + jwt },
          signal: ctrl.signal,
        });
        clearTimeout(stop);
        if (!res.ok) return null;
        const u = await res.json();
        return u && u.id ? u : null;
      } catch (e) {
        return null;
      }
    },
  };
}

/* ================= MOTEUR (engine.js) ================= */
/**
 * Quizz — moteur de jeu (logique pure, sans base de données).
 *
 * Porté depuis Jeu.gs (Google Apps Script). Aucune fonction d'ici ne lit ni
 * n'écrit : elles reçoivent l'état et les questions, et rendent le nouvel état.
 * C'est ce qui permet de tout tester avec Node avant de déployer.
 *
 * Statuts : LOBBY → CHAPTER → INTRO → QUESTION → REVEAL → (SCORES) → … → END
 * Formats : classique, face à face, survie, équipes, « le plus rapide ».
 */

const EPOQUES = ['Avant 1970', 'Années 70', 'Années 80', 'Années 90', 'Années 2000', 'Années 2010', 'Années 2020'];
const TYPES = ['QCM', 'VF', 'ESTIMATION', 'ORDRE', 'CARTE'];
const FORMATS = ['classique', 'face', 'survie', 'equipes', 'buzzer'];
const TEAM_NAMES = ['🔴 Rouges', '🔵 Bleus', '🟢 Verts', '🟡 Jaunes'];
const LIVE = ['INTRO', 'READ', 'QUESTION'];
const INTRO_S = 5;      // compte à rebours avant chaque question
const GRACE_S = 1.5;    // tolérance réseau après la fin du chrono
const MAP_OK = 0.75;    // « bonne réponse » sur la carte à partir de 75 % de précision
const APP_NAME = 'Quizz';

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 1987 reste « 1987 » (année), 3600 devient « 3 600 » ; avec une unité, toujours le format nombre. */
function formatNum(n, unit) {
  if (isNaN(n)) return '?';
  return !unit && Math.abs(n) >= 1000 && Math.abs(n) < 3000 && n === Math.round(n)
    ? String(n) : Number(n).toLocaleString('fr-FR');
}

function formatKm(km) {
  if (km === null || km === undefined) return '';
  return km < 1 ? Math.round(km * 1000) + ' m'
    : km < 10 ? (Math.round(km * 10) / 10).toLocaleString('fr-FR') + ' km'
      : Math.round(km).toLocaleString('fr-FR') + ' km';
}

const clamp = (v, a, b, d) => { v = Number(v); return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

function normalizeSettings(s) {
  s = s || {};
  let chapters = (s.chapters || []).map((c, i) => {
    let types = (c.types && c.types.length ? c.types : TYPES).filter(t => TYPES.indexOf(t) >= 0);
    if (types.length === 4 && types.indexOf('CARTE') < 0) types = TYPES.slice(); // ancien montage « tous les types »
    return {
      name: String(c.name || ('Chapitre ' + (i + 1))).slice(0, 60),
      themes: (c.themes || []).map(String),
      cats: (c.cats || []).map(String),
      types: types,
      media: ['tous', 'avec', 'sans', 'photo', 'son'].indexOf(c.media) >= 0 ? c.media : 'tous',
      eras: (c.eras || []).map(String),
      dates: !!c.dates,
      nb: clamp(c.nb, 1, 50, 15),
      level: clamp(c.level, 1, 5, 1),
      // Sélection à la main : uniquement ces questions (ids), ou tout sauf celles-là (exclus)
      ids: (c.ids || []).map(String),
      exclus: (c.exclus || []).map(String),
    };
  });
  if (!chapters.length) {
    chapters = [{ name: 'Culture générale', themes: [], cats: [], types: TYPES.slice(), media: 'tous', eras: [], dates: false, nb: 15, level: 1 }];
  }
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
    chrono: 'auto', // le chrono démarre toujours seul à la fin du compte à rebours
    autoReveal: s.autoReveal !== false,
    choix: s.choix === 'fixes' ? 'fixes' : 'adaptatifs',
    // « auto » : QCM aux niveaux faciles, saisie au clavier quand la difficulté monte
    estimQcm: ['libre', 'qcm', 'mixte', 'auto'].indexOf(s.estimQcm) >= 0 ? s.estimQcm : 'auto',
    saisie: ['auto', 'jamais', 'toujours'].indexOf(s.saisie) >= 0 ? s.saisie : 'auto',
    saisieNiveau: clamp(s.saisieNiveau, 2, 5, 4),   // à partir de quel niveau on tape la réponse
    format: FORMATS.indexOf(s.format) >= 0 ? s.format : 'classique',
    lives: clamp(s.lives, 1, 5, 3),
    teams: clamp(s.teams, 2, 4, 2),
    bonus: !!s.bonus,
    finale: !!s.finale,
    joker: s.joker !== false,
    title: String(s.title || APP_NAME).slice(0, 60),
  };
}

/* ------------------------------------------------------------------ */
/* Banque de questions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Question dont la réponse est une année (« En quelle année… », 1789…).
 * La base calcule ce drapeau elle-même (colonne est_annee) : quand il est là,
 * inutile de transporter le texte de la question et sa réponse.
 */
function isDateQ(q) {
  if (q.est_annee !== undefined && q.est_annee !== null) return !!q.est_annee;
  return /(en|quelle) ann[ée]e/i.test(String(q.question)) && /^\s*\d{3,4}\s*$/.test(String(q.reponse));
}

function isImage(url) {
  url = String(url || '').trim();
  return !!url && !/youtu/.test(url);
}

/** Difficulté réellement utilisée : celle mesurée sur les parties si elle existe, sinon la note d'origine. */
function effDiff(r) {
  const m = Number(r.difficulte_mesuree);
  return m >= 1 && m <= 5 ? m : (Number(r.difficulte) || 1);
}

/** Les blind tests dépendent de la culture de chacun : leur note n'est pas fiable. */
function isBlind(r) {
  return /^blind test/i.test(String(r.theme || ''));
}

/** Pool d'un chapitre : [id, difficulté, utilisations, dernier passage, souple] pour chaque question retenue. */
function buildPools(settings, questions) {
  return settings.chapters.map(ch => {
    const pool = [];
    const choisies = ch.ids && ch.ids.length ? ch.ids : null;
    const ecartees = ch.exclus && ch.exclus.length ? ch.exclus : null;
    questions.forEach(r => {
      if (String(r.actif || 'oui').toLowerCase() === 'non' || !r.question) return;
      // Liste choisie à la main par le maître du jeu : elle a le dernier mot
      if (choisies) { if (choisies.indexOf(String(r.id)) < 0) return; }
      else if (ecartees && ecartees.indexOf(String(r.id)) >= 0) return;
      if (choisies) { pool.push([r.id, effDiff(r), Number(r.utilisations) || 0,
        r.dernier_jeu ? new Date(r.dernier_jeu).getTime() : 0, isBlind(r) ? 1 : 0]); return; }
      if (ch.themes.length && ch.themes.indexOf(String(r.theme)) < 0) return;
      if (ch.cats.length && ch.cats.indexOf(String(r.categorie)) < 0) return;
      if (ch.eras.length && ch.eras.indexOf(String(r.epoque || '')) < 0) return;
      if (ch.types.indexOf(String(r.type).toUpperCase()) < 0) return;
      if (ch.dates && !isDateQ(r)) return;
      const m = String(r.media_url || '').trim();
      if (ch.media === 'avec' && !m) return;
      if (ch.media === 'sans' && m) return;
      if (ch.media === 'photo' && !isImage(m)) return;
      if (ch.media === 'son' && !/youtu/.test(m)) return;
      pool.push([r.id, effDiff(r), Number(r.utilisations) || 0,
        r.dernier_jeu ? new Date(r.dernier_jeu).getTime() : 0,
        isBlind(r) ? 1 : 0]);
    });
    return pool;
  });
}

/**
 * Familles de questions qui se répètent (même thème + même intitulé, ex. « Quel est ce titre ? »).
 * Leurs bonnes réponses servent de réservoir de pièges.
 */
function buildFamilies(questions) {
  const fam = {};
  questions.forEach(r => {
    if (String(r.type).toUpperCase() !== 'QCM' || !r.question || String(r.actif || 'oui').toLowerCase() === 'non') return;
    const k = String(r.theme) + '|' + String(r.question);
    const rep = String(r.reponse).trim();
    const f = fam[k] = fam[k] || [];
    if (rep && !f.some(x => x[0] === rep)) f.push([rep, String(r.categorie || ''), String(r.epoque || '')]);
  });
  Object.keys(fam).forEach(k => { if (fam[k].length < 6) delete fam[k]; });
  return fam;
}

function newCode(taken) {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let k = 0; k < 40; k++) {
    let c = '';
    for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)];
    if (!taken || taken.indexOf(c) < 0) return c;
  }
  throw new Error('Impossible de générer un code de partie.');
}

/**
 * Tire la prochaine question. Trois principes, dans cet ordre :
 *  1. rester proche du niveau visé, mais sans s'y enfermer : si le niveau 5 est
 *     presque vide (c'est le cas des blind tests), on accepte volontiers 4 ou 3
 *     plutôt que de resservir éternellement les 4 mêmes questions ;
 *  2. privilégier les questions peu jouées et pas jouées récemment ;
 *  3. garder du hasard, pour que deux soirées identiques ne se ressemblent pas.
 *
 * `pool` = [id, difficulté, utilisations, joué le (ms)].
 */
function pickId(pool, level, used) {
  const free = pool.filter(p => used.indexOf(p[0]) < 0);
  if (!free.length) return null;

  const maintenant = Date.now();
  const JOUR = 86400000;
  const usages = free.map(p => Number(p[2]) || 0);
  const usageMax = Math.max.apply(null, usages.concat([1]));

  const note = p => {
    // Blind test : la difficulté ne vient pas du morceau (tout le monde n'a pas la
    // même culture) mais de la forme de la réponse. On ne filtre donc pas par niveau.
    const ecart = p[4] ? 0 : Math.abs((Number(p[1]) || 1) - level);
    // le niveau pèse lourd, sans être une barrière : s'éloigner de deux crans
    // reste possible, s'éloigner de quatre devient rare
    let n = Math.pow(0.42, ecart);
    // question peu jouée = plus de chances
    n *= 1 - 0.55 * ((Number(p[2]) || 0) / usageMax);
    // jouée dans les 15 derniers jours : nettement moins de chances
    const vu = Number(p[3]) || 0;
    if (vu) {
      const jours = (maintenant - vu) / JOUR;
      if (jours < 15) n *= 0.15 + 0.85 * (jours / 15);
    }
    return Math.max(n, 0.001);
  };

  // tirage au sort pondéré : le meilleur candidat est favori, sans être garanti
  const poids = free.map(note);
  const total = poids.reduce((a, b) => a + b, 0);
  let tirage = Math.random() * total;
  for (let i = 0; i < free.length; i++) {
    tirage -= poids[i];
    if (tirage <= 0) return free[i][0];
  }
  return free[free.length - 1][0];
}

/* ------------------------------------------------------------------ */
/* Média                                                               */
/* ------------------------------------------------------------------ */

function parseMedia(url, start, dur) {
  url = String(url || '').trim();
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  if (yt) {
    const t = url.match(/[?&]t=(\d+)/);
    return { kind: 'youtube', id: yt[1], start: Number(start) || (t ? Number(t[1]) : 0), dur: Number(dur) || 15 };
  }
  // Fichier audio (extrait MP3 déposé dans Supabase Storage) : pas de publicité
  if (/\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(url)) {
    return { kind: 'audio', url: url, start: Number(start) || 0, dur: Number(dur) || 15 };
  }
  // Photo : « #zoom » = gros plan qui se dézoome, « #flou » = image qui se précise
  const fx = (url.match(/#(zoom|flou)$/) || [])[1] || '';
  return { kind: 'image', url: url.replace(/#(zoom|flou)$/, ''), fx: fx };
}

const SOUND_KINDS = ['youtube', 'audio'];
const isSound = m => !!m && SOUND_KINDS.indexOf(m.kind) >= 0;

/* ------------------------------------------------------------------ */
/* Réponses tapées au clavier                                          */
/* ------------------------------------------------------------------ */

/** « L'Étoile   noire ! » → « etoile noire » : on compare le fond, pas la forme. */
function normText(x) {
  return String(x == null ? '' : x)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')      // accents
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\bl'/g, ' ')                                  // l'Étoile → etoile
    .replace(/^(le|la|les|un|une|des|du|de|d)\s+/g, '')
    .replace(/[^a-z0-9àâçéèêëîïôûùüÿñ ]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distance de Levenshtein : combien de lettres séparent deux mots. */
function distance(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m + n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Les écritures acceptées pour une réponse tapée. « Queen – Bohemian Rhapsody »
 * accepte la réponse entière, mais aussi « Bohemian Rhapsody » seul : on demande
 * le titre, pas une dictée.
 */
function acceptedForms(rep, question) {
  const brut = String(rep || '');
  const formes = [brut];
  const parts = brut.split(/\s[–—-]\s|\s\/\s/).map(x => x.trim()).filter(x => x.length >= 3);
  const q = String(question || '');
  if (parts.length === 2) {
    // « Queen – Bohemian Rhapsody » : on demande le titre ou l'artiste, pas les deux
    // l'ordre compte : « Qui chante ce titre ? » parle d'artiste, pas de titre
    if (/\bqui\b|artiste|groupe|chante|interpr|composit/i.test(q)) formes.push(parts[0]);
    else if (/titre|chanson|morceau|film|album/i.test(q)) formes.push(parts[1]);
    else formes.push(parts[0], parts[1]);
  } else {
    parts.forEach(x => formes.push(x));
  }
  const sansParen = brut.replace(/\([^)]*\)/g, '').trim();
  if (sansParen && sansParen !== brut) formes.push(sansParen);
  const out = [];
  formes.map(normText).forEach(f => { if (f && out.indexOf(f) < 0) out.push(f); });
  return out;
}

/**
 * Ce qu'on attend vraiment que le joueur tape : pour « Queen – Bohemian Rhapsody »
 * à la question « Quel est ce titre ? », c'est « Bohemian Rhapsody ».
 * Sert à donner les indices (nombre de lettres, initiale) sans induire en erreur.
 */
function answerTarget(rep, question) {
  const brut = String(rep || '').trim();
  const parts = brut.split(/\s[–—-]\s|\s\/\s/).map(x => x.trim()).filter(x => x.length >= 3);
  if (parts.length !== 2) return brut;
  const q = String(question || '');
  if (/\bqui\b|artiste|groupe|chante|interpr|composit/i.test(q)) return parts[0];
  if (/titre|chanson|morceau|film|album/i.test(q)) return parts[1];
  return brut;
}

/** La réponse tapée est-elle acceptée ? Une faute de frappe est pardonnée sur les mots longs. */
function matchText(donnee, formes) {
  const d = normText(donnee);
  if (!d) return false;
  for (const f of formes) {
    if (d === f) return true;
    const tol = f.length >= 12 ? 2 : f.length >= 6 ? 1 : 0;
    if (tol && distance(d, f) <= tol) return true;
  }
  return false;
}

/** Une réponse est-elle raisonnablement « tapable » ? (ni liste, ni phrase entière) */
function typable(rep) {
  const r = String(rep || '').trim();
  return r.length >= 2 && r.length <= 42 && r.split(/\s+/).length <= 6 && !/[|;]/.test(r);
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

// full = distance (km) sous laquelle on marque tous les points ; zero = distance à partir de laquelle on ne marque plus rien
const ZONES = {
  monde: { full: 150, zero: 3000 }, europe: { full: 40, zero: 900 }, france: { full: 12, zero: 250 },
  afrique: { full: 120, zero: 2500 }, asie: { full: 120, zero: 2500 }, ameriques: { full: 120, zero: 2500 },
  paris: { full: 0.3, zero: 6 },
};

function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2
    + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Précision d'un point posé sur la carte : 1 = parfait, 0 = trop loin. */
function mapScore(q, a) {
  if (!a || a.length !== 2 || isNaN(Number(a[0])) || isNaN(Number(a[1]))) return { f: 0, km: null };
  const km = distKm(Number(a[0]), Number(a[1]), q.secret.lat, q.secret.lon);
  const s = q.secret;
  const f = km <= s.full ? 1 : Math.max(0, 1 - (km - s.full) / (s.zero - s.full));
  return { f: f, km: km };
}

/* ------------------------------------------------------------------ */
/* Propositions dynamiques                                             */
/* ------------------------------------------------------------------ */

/**
 * 3 pièges choisis selon le niveau :
 *  - 1-2 : réponses éloignées (autre époque, autre catégorie) → facile
 *  - 3   : un piège écrit à la main + des réponses assez proches
 *  - 4-5 : les pièges écrits à la main + la réponse la plus proche → difficile
 */
function adaptiveDistractors(rep, fixed, fam, cat, era, level) {
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
  const fx = shuffle(fixed);
  if (level >= 4) { add(fx.slice(0, 2)); add(ranked); }
  else if (level === 3) { add(fx.slice(0, 1)); add(shuffle(ranked.slice(0, Math.max(3, Math.ceil(ranked.length / 3))))); }
  else add(shuffle(ranked.slice(-Math.max(3, Math.ceil(ranked.length / 2)))));
  add(fx); add(ranked); // complète si besoin
  return out;
}

/** 4 nombres dont la bonne réponse, triés ; l'écart se resserre quand le niveau monte. */
function numericChoices(v, level, unit) {
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
      c = roundLike(v * (1 + sign() * pct), v);
    }
    if (out.indexOf(c) < 0) out.push(c);
  }
  return out.sort((a, b) => a - b);
}

/** Arrondit une proposition comme la bonne réponse (206 → dizaines, 384 400 → dizaines de milliers). */
function roundLike(c, v) {
  const dec = (String(v).split('.')[1] || '').length;
  if (dec) return Number(c.toFixed(Math.min(dec, 1)));
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.abs(v))) - 1));
  return Math.round(c / mag) * mag;
}

/* ------------------------------------------------------------------ */
/* Construction d'une question jouable                                 */
/* ------------------------------------------------------------------ */

/** `r` = ligne de la table questions ; `st` = état de la partie (niveau, réglages). */
function loadQuestion(r, st, families) {
  const type = String(r.type).toUpperCase().trim();
  const q = {
    id: String(r.id), theme: String(r.theme), cat: String(r.categorie || ''),
    diff: Number(r.difficulte) || 1, type: type, text: String(r.question),
    expl: String(r.explication || ''), indices: String(r.indices || ''),
    media: parseMedia(r.media_url, r.media_debut, r.media_duree), secret: {},
    epoque: String(r.epoque || ''), anecdote: String(r.anecdote || ''),
  };
  const level = st ? st.level : q.diff;
  const rep = String(r.reponse).trim();

  if (type === 'VF') {
    q.choices = ['Vrai', 'Faux'];
    q.secret.correct = /^v/i.test(rep) ? 0 : 1;
    q.answerText = q.choices[q.secret.correct];
  } else if (type === 'ESTIMATION') {
    q.secret.value = Number(rep.replace(/\s/g, '').replace(',', '.'));
    q.unit = String(r.choix2 || '');
    q.secret.tol = (r.choix3 === '' || r.choix3 === null || r.choix3 === undefined)
      ? null : Number(String(r.choix3).replace(',', '.'));
    q.answerText = formatNum(q.secret.value, q.unit) + (q.unit ? ' ' + q.unit : '');
    const mode = st ? st.settings.estimQcm : 'libre';
    // « auto » : on propose 4 nombres tant que c'est facile, puis on demande la valeur exacte
    const enQcm = mode === 'qcm' || (mode === 'mixte' && Math.random() < 0.5) || (mode === 'auto' && level <= 2);
    if (!isNaN(q.secret.value) && enQcm) {
      const nums = numericChoices(q.secret.value, level, q.unit);
      q.type = 'QCM';
      q.fromEstimation = true;
      q.choices = nums.map(n => formatNum(n, q.unit) + (q.unit ? ' ' + q.unit : ''));
      q.secret.correct = nums.indexOf(q.secret.value);
    }
  } else if (type === 'CARTE') {
    // Réponse = « latitude, longitude » ; choix2 = zone ; choix3 = nom du lieu ; choix4 = rayon plein score (km)
    const ll = rep.split(/[,;\s]+/).map(Number);
    q.zone = String(r.choix2 || 'monde').trim().toLowerCase();
    if (!ZONES[q.zone]) q.zone = 'monde';
    q.place = String(r.choix3 || '').trim();
    const z = ZONES[q.zone];
    const k = [1.3, 1.15, 1, 0.85, 0.7][Math.max(1, Math.min(5, level)) - 1];
    q.secret.lat = ll[0]; q.secret.lon = ll[1];
    q.secret.full = (Number(r.choix4) || z.full) * k;
    q.secret.zero = z.zero * k;
    q.answerText = q.place || (ll[0].toFixed(2) + ', ' + ll[1].toFixed(2));
  } else if (type === 'ORDRE') {
    const items = rep.split('|').map(s => s.trim()).filter(Boolean);
    let sh = shuffle(items);
    for (let k = 0; k < 5 && sh.join() === items.join(); k++) sh = shuffle(items);
    q.items = sh;
    q.hint = String(r.choix2 || '');
    q.secret.order = items;
    q.answerText = items.join(' → ');
  } else {
    q.type = 'QCM';
    q.answerText = rep;
    // Difficulté par la forme de la réponse : QCM en facile, clavier en difficile
    const regle = st ? st.settings.saisie : 'jamais';
    const seuil = st ? st.settings.saisieNiveau : 4;
    const auClavier = typable(rep) && (regle === 'toujours' || (regle === 'auto' && level >= seuil));
    if (auClavier) {
      q.type = 'SAISIE';
      q.secret.formes = acceptedForms(rep, q.text);
      const cible = answerTarget(rep, q.text);
      // Échelle de difficulté par la forme : au dernier niveau, plus aucune aide
      if (level < 5) {
        q.lettres = cible.replace(/[^A-Za-zÀ-ÿ0-9]/g, '').length;
        q.initiale = cible.charAt(0).toUpperCase();
      }
    } else {
      const fixed = [r.choix2, r.choix3, r.choix4].map(x => String(x == null ? '' : x).trim()).filter(x => x && x !== rep);
      let wrong = fixed;
      const fam = st && st.settings.choix === 'adaptatifs' && families ? families[q.theme + '|' + q.text] : null;
      if (fam) wrong = adaptiveDistractors(rep, fixed, fam, q.cat, q.epoque, level);
      q.choices = shuffle([rep].concat(wrong.slice(0, 3)));
      q.secret.correct = q.choices.indexOf(rep);
    }
  }
  return q;
}

/* ------------------------------------------------------------------ */
/* Déroulé de la partie                                                */
/* ------------------------------------------------------------------ */

function newState(code, settings) {
  return {
    code: code, created: Date.now(), status: 'LOBBY', settings: settings,
    qIndex: -1, chapIndex: -1, chapQ: 0, level: settings.chapters[0].level,
    total: settings.chapters.reduce((a, c) => a + c.nb, 0),
    used: [], current: null, reveal: null, media: { seq: 0, action: 'stop' },
    pools: [], finished: false, persisted: false,
  };
}

/** Fin de l'intro calculée à la volée : aucun appel serveur à la bonne milliseconde. */
function promote(st) {
  if (st && st.status === 'INTRO' && st.current && Date.now() >= st.current.introEnd) {
    st.status = st.settings.chrono === 'auto' ? 'QUESTION' : 'READ';
  }
  return st;
}

/** Thème + compte à rebours de 5 s, puis la question démarre toute seule. */
function beginIntro(st) {
  const q = st.current;
  // L'extrait dure le temps de réponse : 30 s de chrono = 30 s de musique
  if (isSound(q.media)) q.media.dur = st.settings.duration;
  st.status = 'INTRO';
  q.introEnd = Date.now() + INTRO_S * 1000;
  q.start = q.introEnd;
  st.media = isSound(q.media)
    ? { seq: st.media.seq + 1, action: 'play', at: q.start }
    : { seq: st.media.seq + 1, action: 'stop' };
}

function startTimer(st) {
  st.status = 'QUESTION';
  st.current.start = Date.now();
  if (isSound(st.current.media)) st.media = { seq: st.media.seq + 1, action: 'play', at: st.current.start };
}

/**
 * Ce qui entoure la question selon le format : duel, question en or, finale ×3.
 * `prev` = question remplacée (le duel et le bonus sont conservés).
 */
function decorate(st, players, prev) {
  const q = st.current;
  const s = st.settings;
  q.mult = 1;
  if (prev) { q.gold = prev.gold; q.duel = prev.duel; q.mult = prev.mult || 1; return; }
  if (s.finale && st.qIndex === st.total - 1) q.mult = 3;
  else if (s.bonus && st.qIndex > 0 && !st.lastGold && Math.random() < 0.2) { q.gold = true; q.mult = 2; }
  st.lastGold = !!q.gold;
  if (s.format === 'face') q.duel = pickDuel(st, players);
}

/** Deux joueurs qui ont le moins joué de duels, en privilégiant ceux qui ne se sont pas affrontés. */
function pickDuel(st, players) {
  const pids = Object.keys(players);
  if (pids.length < 2) return null;
  const faced = st.faced = st.faced || {};
  const pair = (x, y) => [x, y].sort().join('|');
  const duels = p => players[p].duels || 0;
  const r = {};
  pids.forEach(p => { r[p] = Math.random(); });
  const a = pids.slice().sort((x, y) => duels(x) - duels(y) || r[x] - r[y])[0];
  const b = pids.filter(p => p !== a)
    .sort((x, y) => duels(x) - duels(y) || (faced[pair(a, x)] || 0) - (faced[pair(a, y)] || 0) || r[x] - r[y])[0];
  faced[pair(a, b)] = (faced[pair(a, b)] || 0) + 1;
  return [a, b];
}

/** Équipes : un nouveau joueur rejoint l'équipe la moins nombreuse. */
function smallestTeam(st, players) {
  const n = [];
  for (let i = 0; i < st.settings.teams; i++) n.push(0);
  Object.keys(players).forEach(p => { const t = players[p].team; if (n[t] !== undefined) n[t]++; });
  const min = Math.min.apply(null, n);
  const c = n.map((v, i) => i).filter(i => n[i] === min);
  return c[Math.floor(Math.random() * c.length)];
}

/* ------------------------------------------------------------------ */
/* Correction, points et difficulté                                    */
/* ------------------------------------------------------------------ */

function points(s, diff, t, streak) {
  if (s.points === 'simple') return 1;
  const base = 100 * diff;
  const speed = Math.max(0, 1 - (t || 0) / s.duration);
  let pts = base + Math.round(base * 0.5 * speed);
  if (s.points === 'series' && streak >= 3) pts += Math.min(200, 50 * (streak - 2));
  return pts;
}

/**
 * Corrige la question en cours. `players` = { pid: joueur }, `answers` = { pid: {a, t} }.
 * Modifie st (reveal, level, statut) et les joueurs (score, séries, vies) ; rend les résultats.
 */
function doReveal(st, players, answers) {
  const q = st.current;
  const s = st.settings;
  const pids = Object.keys(players);
  const results = {};
  const dist = q.choices ? q.choices.map(() => 0) : null;
  const mult = q.mult || 1;

  // Qui joue vraiment cette question ? (face à face : les 2 duellistes ; survie : les vivants)
  const plays = p => s.format === 'face' ? !!(q.duel && q.duel.indexOf(p) >= 0)
    : s.format === 'survie' ? !players[p].out : true;
  const inPlay = pids.filter(plays);

  // Estimation « le plus proche » : distance minimale parmi les joueurs en jeu
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
        txt = formatNum(Number(a));
      } else if (q.type === 'SAISIE') {
        ok = matchText(a, q.secret.formes);
        txt = String(a || '').trim();
      } else if (q.type === 'ORDRE') {
        const seq = (a || []).map(i => q.items[i]);
        ok = seq.join('|') === q.secret.order.join('|');
        txt = seq.join(' → ');
      } else if (q.type === 'CARTE') {
        const m = mapScore(q, a);
        f = m.f; km = m.km;
        ok = f >= MAP_OK;
        txt = km === null ? '' : 'à ' + formatKm(km);
      }
    }
    const pl = players[p];
    let pts = 0;
    if (plays(p) && ans && (ok || (q.type === 'CARTE' && f > 0))) {
      const base = points(s, q.diff, ans.t, ok ? (pl.streak || 0) + 1 : 0);
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
    winner = best(q.duel.filter(p => players[p]));
    q.duel.forEach(p => {
      if (players[p]) {
        players[p].duels = (players[p].duels || 0) + 1;
        if (p !== winner) results[p].pts = 0;
      }
    });
    if (winner) players[winner].duelWins = (players[winner].duelWins || 0) + 1;
  }
  let eliminated = [], repechage = false;
  if (s.format === 'survie') {
    const failed = inPlay.filter(p => !results[p].ok);
    // Si tous les survivants se trompent, personne ne perd de vie (repêchage)
    repechage = failed.length > 0 && failed.length === inPlay.length;
    if (!repechage) failed.forEach(p => {
      const pl = players[p];
      pl.lives = Math.max(0, (pl.lives === undefined ? s.lives : pl.lives) - 1);
      results[p].lostLife = true;
      if (!pl.lives) { pl.out = st.qIndex + 1; eliminated.push(pl.pseudo); }
    });
  }

  // 3. Scores, séries, statistiques
  let nbOk = 0;
  pids.forEach(p => {
    const pl = players[p];
    const r = results[p];
    if (r.spect) return;
    pl.streak = r.ok ? (pl.streak || 0) + 1 : 0;
    pl.score = (pl.score || 0) + r.pts;
    pl.good = (pl.good || 0) + (r.ok ? 1 : 0);
    if (r.ok) pl.time = Math.round(((pl.time || 0) + r.t) * 10) / 10;
    if (r.ok) nbOk++;
  });

  // 4. Difficulté évolutive : elle monte, jamais elle ne redescend
  const rate = inPlay.length ? nbOk / inPlay.length : 0;
  const before = st.level;
  if (inPlay.length) {
    if (rate === 1) st.level = Math.min(5, st.level + 2);
    else if (rate >= 0.8) st.level = Math.min(5, st.level + 1);
  }

  let closest = null, pins = null;
  if (q.type === 'ESTIMATION' || q.type === 'CARTE') {
    closest = pids.filter(p => answers[p] && (q.type !== 'CARTE' || results[p].km !== null)).map(p => ({
      pseudo: players[p].pseudo, a: results[p].a, ok: results[p].ok, pts: results[p].pts, t: results[p].t,
      d: q.type === 'CARTE' ? results[p].km : Math.abs(Number(answers[p].a) - q.secret.value),
    })).sort((x, y) => x.d - y.d || x.t - y.t).slice(0, q.type === 'CARTE' ? 15 : 5);
  }
  if (q.type === 'CARTE') {
    pins = pids.filter(p => answers[p] && results[p].km !== null).map(p => ({
      pseudo: players[p].pseudo, lat: Number(answers[p].a[0]), lon: Number(answers[p].a[1]),
      km: Math.round(results[p].km * 10) / 10, ok: results[p].ok, t: results[p].t,
    }));
  }

  // La vedette de la question : le plus proche (carte, estimation), sinon la bonne réponse la plus rapide
  let top = null, fast = [];
  const pseudoT = p => ({ pseudo: players[p].pseudo, t: results[p].t, ok: results[p].ok });
  if (q.type === 'ESTIMATION' || q.type === 'CARTE') {
    const dOf = p => q.type === 'CARTE' ? results[p].km : Math.abs(Number(answers[p].a) - q.secret.value);
    const cand = inPlay.filter(p => answers[p] && dOf(p) !== null && !isNaN(dOf(p)))
      .sort((x, y) => dOf(x) - dOf(y) || results[x].t - results[y].t);
    if (cand.length) top = Object.assign(pseudoT(cand[0]), { kind: 'proche', d: dOf(cand[0]), a: results[cand[0]].a });
  } else {
    fast = inPlay.filter(p => answers[p] && results[p].ok).sort((x, y) => results[x].t - results[y].t).slice(0, 3).map(pseudoT);
    if (fast.length) top = Object.assign({ kind: 'rapide' }, fast[0]);
  }

  const alive = s.format === 'survie' ? pids.filter(p => !players[p].out).length : null;
  if (s.format === 'survie' && pids.length >= 2 && alive <= 1) st.finished = true;

  st.reveal = {
    qIndex: st.qIndex, correct: q.secret.correct, answerText: q.answerText, order: q.secret.order || null,
    dist: dist, rate: rate, nbOk: nbOk, nbPlay: inPlay.length, levelBefore: before, levelAfter: st.level,
    results: results, closest: closest,
    tol: q.type === 'ESTIMATION' && s.estimation === 'marge' ? tol : null,
    pins: pins, target: q.type === 'CARTE' ? { lat: q.secret.lat, lon: q.secret.lon, full: q.secret.full } : null,
    winner: winner ? players[winner].pseudo : null, mult: mult, top: top, fast: fast,
    eliminated: eliminated, repechage: repechage, alive: alive,
  };
  st.status = 'REVEAL';
  st.media = { seq: st.media.seq + 1, action: 'stop' };
  return results;
}

/** Correction « en direct » pour le maître du jeu, avant la révélation. */
function liveJudge(st, answers) {
  const q = st.current;
  if (!q) return () => null;
  if (q.type === 'QCM' || q.type === 'VF') return a => Number(a) === q.secret.correct;
  if (q.type === 'SAISIE') return a => matchText(a, q.secret.formes);
  if (q.type === 'ORDRE') return a => (a || []).map(i => q.items[i]).join('|') === q.secret.order.join('|');
  if (q.type === 'CARTE') return a => mapScore(q, a).f >= MAP_OK;
  const s = st.settings;
  if (s.estimation === 'proche') {
    const ds = Object.keys(answers).map(p => Math.abs(Number(answers[p].a) - q.secret.value)).filter(d => !isNaN(d));
    const min = ds.length ? Math.min.apply(null, ds) : null;
    return a => Math.abs(Number(a) - q.secret.value) === min;
  }
  const tol = q.secret.tol !== null && !isNaN(q.secret.tol) ? q.secret.tol : Math.abs(q.secret.value) * s.margePct / 100;
  return a => Math.abs(Number(a) - q.secret.value) <= tol;
}

/* ------------------------------------------------------------------ */
/* Classements                                                         */
/* ------------------------------------------------------------------ */

function ranking(st, players) {
  const survie = st.settings.format === 'survie';
  return Object.keys(players).map(p => Object.assign({ pid: p }, players[p]))
    .sort((a, b) => (survie ? ((b.out || 1e9) - (a.out || 1e9)) || ((b.lives || 0) - (a.lives || 0)) : 0)
      || (b.score || 0) - (a.score || 0) || (a.time || 0) - (b.time || 0) || a.pseudo.localeCompare(b.pseudo))
    .map((p, i) => Object.assign(p, { rank: i + 1 }));
}

/** Classement des équipes : moyenne des points par joueur. */
function teamRanking(st, players) {
  if (st.settings.format !== 'equipes') return null;
  const t = [];
  for (let i = 0; i < st.settings.teams; i++) t.push({ team: i, name: TEAM_NAMES[i], members: [], total: 0 });
  Object.keys(players).forEach(p => {
    const pl = players[p];
    const x = t[pl.team || 0] || t[0];
    x.members.push(pl.pseudo);
    x.total += pl.score || 0;
  });
  t.forEach(x => { x.score = x.members.length ? Math.round(x.total / x.members.length) : 0; });
  return t.sort((a, b) => b.score - a.score).map((x, i) => Object.assign(x, { rank: i + 1 }));
}

/* ------------------------------------------------------------------ */
/* Vues envoyées aux écrans                                            */
/* ------------------------------------------------------------------ */

function publicQuestion(q) {
  if (!q) return null;
  return {
    id: q.id, type: q.type, text: q.text, theme: q.theme, cat: q.cat, diff: q.diff,
    choices: q.choices || null, unit: q.unit || '', items: q.items || null, hint: q.hint || '',
    lettres: q.lettres || null, initiale: q.initiale || '',
    media: q.media, start: q.start || null, epoque: q.epoque || '', zone: q.zone || null,
    mult: q.mult || 1, gold: !!q.gold,
  };
}

function chapterInfo(st) {
  const ch = st.settings.chapters[st.chapIndex];
  if (!ch) return null;
  return { idx: st.chapIndex + 1, count: st.settings.chapters.length, name: ch.name, nb: ch.nb, themes: ch.themes, level: ch.level };
}

/**
 * Vue publique (écran + téléphones). `answers` sert uniquement à compter les réponses ;
 * aucune bonne réponse n'en sort tant que le statut n'est pas REVEAL.
 */
function publicView(st, players, answers, pid) {
  const s = st.settings;
  const v = {
    code: st.code, status: st.status, now: Date.now(), title: s.title,
    visual: s.visual, sounds: s.sounds, audioOn: s.audioOn, duration: s.duration, points: s.points,
    qIndex: st.qIndex, total: st.total, chapQ: st.chapQ, level: st.level, chapter: chapterInfo(st),
    media: st.media, playerCount: Object.keys(players).length,
    format: s.format, lives: s.lives, joker: s.joker, finished: !!st.finished,
  };
  if (s.format === 'equipes') v.teams = teamRanking(st, players);
  if (s.format === 'survie') {
    v.survivors = Object.keys(players).filter(p => !players[p].out)
      .map(p => ({ pseudo: players[p].pseudo, lives: players[p].lives }));
  }
  if (st.current && st.current.duel && LIVE.concat(['REVEAL']).indexOf(st.status) >= 0) {
    v.duel = st.current.duel.filter(p => players[p]).map(p => players[p].pseudo);
  }
  if (st.status === 'LOBBY' || st.status === 'CHAPTER') v.lobby = Object.keys(players).map(p => players[p].pseudo);
  if (['INTRO', 'READ', 'QUESTION', 'REVEAL'].indexOf(st.status) >= 0) v.question = publicQuestion(st.current);
  if (st.status === 'INTRO') {
    // la question part pendant l'intro (sans la réponse) pour s'afficher pile à la fin du compte à rebours
    v.intro = { end: st.current.introEnd, next: 'QUESTION' };
  }
  if (st.status === 'QUESTION' || st.status === 'INTRO') {
    v.answeredCount = Object.keys(answers || {}).length;
    // qui a répondu et en combien de temps : de quoi animer l'écran public,
    // sans jamais dire ce qui a été répondu
    v.answered = Object.keys(answers || {})
      .filter(p => players[p])
      .map(p => ({ pseudo: players[p].pseudo, t: answers[p].t }))
      .sort((a, b) => (a.t || 0) - (b.t || 0));
  }
  if (st.reveal && (st.status === 'REVEAL' || st.status === 'SCORES')) {
    const r = st.reveal;
    v.reveal = {
      correct: r.correct, answerText: r.answerText, order: r.order, dist: r.dist, rate: r.rate,
      nbOk: r.nbOk, nbPlay: r.nbPlay, levelUp: r.levelAfter > r.levelBefore, closest: r.closest, tol: r.tol,
      expl: st.current ? st.current.expl : '', pins: r.pins, target: r.target, winner: r.winner,
      mult: r.mult, top: r.top, fast: r.fast, eliminated: r.eliminated, repechage: r.repechage, alive: r.alive,
    };
  }
  const rk = ranking(st, players);
  if (['REVEAL', 'SCORES', 'END'].indexOf(st.status) >= 0) {
    v.ranking = rk.slice(0, st.status === 'END' ? 15 : 10).map(p => ({
      pseudo: p.pseudo, score: p.score, rank: p.rank, good: p.good,
      lives: p.lives, out: p.out || 0, team: p.team, duelWins: p.duelWins || 0,
    }));
  }
  if (pid && players[pid]) {
    const me = rk.filter(p => p.pid === pid)[0];
    v.me = {
      pseudo: me.pseudo, score: me.score, rank: me.rank, good: me.good, streak: me.streak || 0,
      lives: me.lives, out: me.out || 0, team: me.team, jokerUsed: !!me.joker,
      spectator: s.format === 'face' && !!(st.current && st.current.duel) && st.current.duel.indexOf(pid) < 0,
    };
    if (me.joker && me.joker.q === st.qIndex) v.me.hide = me.joker.hide;
    if (LIVE.indexOf(st.status) >= 0) {
      const a = answers ? answers[pid] : null;
      v.me.answered = !!a;
      if (a) v.me.answer = a.a;
    }
    if (st.reveal && st.status === 'REVEAL') v.me.result = st.reveal.results[pid] || { ok: false, pts: 0, answered: false };
  } else if (pid) {
    v.notJoined = true;
  }
  return v;
}

/** Vue du maître du jeu : bonne réponse, indices, anecdote et réponses des joueurs en direct. */
function adminView(st, players, answers) {
  const v = publicView(st, players, answers, null);
  v.settings = st.settings;
  v.current = st.current ? Object.assign({}, publicQuestion(st.current), {
    answerText: st.current.answerText, expl: st.current.expl, indices: st.current.indices,
    correct: st.current.secret.correct, anecdote: st.current.anecdote || '',
    target: st.current.type === 'CARTE'
      ? { lat: st.current.secret.lat, lon: st.current.secret.lon, full: st.current.secret.full } : null,
  }) : null;
  v.reveal = st.reveal && (st.status === 'REVEAL' || st.status === 'SCORES') ? st.reveal : null;

  const live = LIVE.indexOf(st.status) >= 0 ? answers : {};
  const judge = liveJudge(st, live);
  const now = Date.now();
  const dist = st.current && st.current.choices ? st.current.choices.map(() => 0) : null;

  v.players = ranking(st, players).map(p => {
    const a = live[p.pid];
    let answerText = '';
    if (a && st.current) {
      if (st.current.choices) {
        answerText = st.current.choices[Number(a.a)] || '';
        if (dist && dist[Number(a.a)] !== undefined) dist[Number(a.a)]++;
      } else if (st.current.type === 'ORDRE') answerText = (a.a || []).map(i => st.current.items[i]).join(' → ');
      else if (st.current.type === 'CARTE') answerText = 'à ' + formatKm(mapScore(st.current, a.a).km);
      else if (st.current.type === 'SAISIE') answerText = String(a.a || '').trim();
      else answerText = formatNum(Number(a.a));
    }
    const res = v.reveal && v.reveal.results ? v.reveal.results[p.pid] : null;
    const seen = p.lastSeen ? now - p.lastSeen : null;
    let presence = 'off';
    // le téléphone donne signe de vie toutes les 20 s : on laisse de la marge pour le réseau
    if (seen !== null) presence = p.vis === 'hidden' ? 'bg' : (seen < 45000 ? 'on' : 'off');
    return {
      pid: p.pid, pseudo: p.pseudo, score: p.score, good: p.good, time: p.time, streak: p.streak || 0, rank: p.rank,
      presence: presence, exits: p.exits || 0, lastSeen: seen === null ? null : Math.round(seen / 1000),
      answered: !!a || (res ? res.answered : false),
      answerText: a ? answerText : (res ? res.a : ''), t: a ? a.t : (res ? res.t : null),
      ok: res ? res.ok : null, pts: res ? res.pts : null,
      a: a ? a.a : null, liveOk: a ? judge(a.a) : null,
      lives: p.lives, out: p.out || 0, team: p.team, duelWins: p.duelWins || 0,
      joker: !!(p.joker && st.current && p.joker.q === st.qIndex), jokerUsed: !!p.joker,
      duel: !!(st.current && st.current.duel && st.current.duel.indexOf(p.pid) >= 0),
      lostLife: res ? !!res.lostLife : false,
    };
  });
  v.answeredCount = Object.keys(live).length;
  v.liveDist = dist;
  return v;
}

/* ------------------------------------------------------------------ */
/* Validation des entrées                                              */
/* ------------------------------------------------------------------ */

function checkPid(pid) {
  if (!/^[a-z0-9]{8,40}$/i.test(String(pid))) throw new Error('Identifiant joueur invalide.');
  return String(pid);
}

function cleanPseudo(pseudo) {
  const p = String(pseudo || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  if (p.length < 2) throw new Error('Pseudo trop court (2 caractères minimum).');
  return p;
}

/** Vérifie qu'une réponse arrive à temps et rend le temps de réponse en secondes. */
function answerTime(st, now) {
  const elapsed = (now - st.current.start) / 1000;
  if (elapsed > st.settings.duration + GRACE_S) return null;
  return Math.round(Math.min(Math.max(elapsed, 0), st.settings.duration) * 10) / 10;
}

/* ================= ACTIONS (actions.js) ================= */
/**
 * Quizz — les actions du serveur.
 *
 * Ce module ne connaît que deux choses : le moteur (engine.js) et un objet `db`
 * qui parle à Supabase. `db` est fourni de l'extérieur, ce qui permet de rejouer
 * des parties entières en test, avec une base factice (tests/serveur.test.mjs).
 *
 * Les vitrines :
 *   game_live → l'écran et les téléphones  (aucune bonne réponse n'y figure)
 *   game_mj   → le maître du jeu connecté  (réponse, indices, anecdote, copies)
 */

const ADMIN_ACTIONS = new Set([
  'adminCreateGame', 'adminState', 'adminNext', 'adminStartTimer', 'adminReveal', 'adminShowScores',
  'adminSkip', 'adminEnd', 'adminMedia', 'adminSetLevel', 'adminUpdateSettings', 'adminKick',
  'adminShuffleTeams', 'adminCatalog', 'adminAddQuestion', 'adminMontages', 'adminSaveMontage',
  'adminDeleteMontage', 'adminLeaderboard', 'adminBlindList',
]);

function createActions(db) {
  const check = r => { if (r && r.error) throw new Error(r.error.message || String(r.error)); return r; };
  const nowISO = () => new Date().toISOString();

  /* ---------------- Lecture ---------------- */

  // Pour composer une partie, seules ces colonnes servent : inutile de transporter
  // les explications, indices et anecdotes des 1 521 questions.
  const COLS_LEGERES = 'id,theme,categorie,difficulte,difficulte_mesuree,type,question,media_url,epoque,actif,utilisations,est_annee,dernier_jeu';

  /** Toutes les questions (au-delà de la limite de 1 000 lignes par requête). */
  async function allQuestions(cols) {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data } = check(await db.from('questions').select(cols || '*').range(from, from + 999));
      out.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return out;
  }

  async function loadGame(code) {
    if (!code) throw new Error('Partie introuvable.');
    const { data } = check(await db.from('games').select('*').eq('code', String(code).toUpperCase()).maybeSingle());
    if (!data) throw new Error('Partie introuvable ou expirée.');
    return promote(data.state);
  }

  /** Les joueurs sous la forme attendue par le moteur : { pid: {pseudo, score, …} }. */
  async function loadPlayers(code) {
    const { data } = check(await db.from('players').select('*').eq('game_code', code));
    const out = {};
    (data || []).forEach(r => {
      out[r.pid] = Object.assign({ pseudo: r.pseudo }, r.data || {}, {
        vis: r.vis, exits: r.exits || 0, lastSeen: r.last_seen ? new Date(r.last_seen).getTime() : null,
      });
    });
    return out;
  }

  /** Les réponses de la question en cours : { pid: {a, t} }. */
  async function loadAnswers(code, qIndex) {
    if (qIndex < 0) return {};
    const { data } = check(await db.from('answers').select('*').eq('game_code', code).eq('q_index', qIndex));
    const out = {};
    (data || []).forEach(r => { if (r.valeur !== null && r.valeur !== undefined) out[r.pid] = { a: r.valeur, t: Number(r.temps) }; });
    return out;
  }

  /* ---------------- Écriture ---------------- */

  /** Réécrit les joueurs dont le moteur a changé le score, la série ou les vies. */
  async function savePlayers(code, players) {
    const rows = Object.keys(players).map(pid => {
      const p = Object.assign({}, players[pid]);
      const pseudo = p.pseudo;
      delete p.pseudo; delete p.vis; delete p.exits; delete p.lastSeen; delete p.pid; delete p.rank;
      return { game_code: code, pid: pid, pseudo: pseudo, data: p };
    });
    if (rows.length) check(await db.from('players').upsert(rows, { onConflict: 'game_code,pid' }));
  }

  /** Écrit l'état complet et les deux vitrines : c'est ce qui déclenche le temps réel. */
  async function publish(st, players, answers) {
    const pub = publicView(st, players, answers, null);
    // Tableau des scores sans identifiant : chaque téléphone s'y retrouve par son pseudo
    pub.board = ranking(st, players).map(p => ({
      pseudo: p.pseudo, score: p.score || 0, rank: p.rank, good: p.good || 0,
      streak: p.streak || 0, lives: p.lives, out: p.out || 0, team: p.team,
    }));
    // À la révélation, chaque joueur doit connaître SON résultat tout de suite :
    // sans ça, le téléphone affiche « pas de réponse » pendant la demi-seconde d'attente.
    if (st.reveal && (st.status === 'REVEAL' || st.status === 'SCORES')) {
      pub.results = {};
      Object.keys(st.reveal.results).forEach(pid => {
        if (players[pid]) pub.results[players[pid].pseudo] = st.reveal.results[pid];
      });
    }
    const mj = adminView(st, players, answers);
    check(await db.from('games').upsert({
      code: st.code, status: st.status, state: st,
      ended_at: st.status === 'END' ? nowISO() : null,
    }, { onConflict: 'code' }));
    // seq strictement croissant : les écrans ignorent les messages arrivés dans le désordre
    const seq = Date.now();
    check(await db.from('game_live').upsert({
      code: st.code, status: st.status, state: pub, seq: seq, updated_at: nowISO(),
    }, { onConflict: 'code' }));
    check(await db.from('game_mj').upsert({
      code: st.code, state: mj, seq: seq, updated_at: nowISO(),
    }, { onConflict: 'code' }));
    return mj;
  }

  /* ---------------- Questions ---------------- */

  async function questionById(id) {
    const { data } = check(await db.from('questions').select('*').eq('id', id).maybeSingle());
    if (!data) throw new Error('Question introuvable : ' + id);
    return data;
  }

  /**
   * Réservoir de pièges d'une question qui se répète (même thème, même intitulé,
   * ex. « Quel est ce titre ? ») : sert à fabriquer les propositions selon le niveau.
   */
  async function familyOf(theme, text) {
    const { data } = check(await db.from('questions').select('*')
      .eq('theme', theme).eq('question', text).eq('type', 'QCM').limit(400));
    const seen = {};
    const fam = [];
    (data || []).forEach(r => {
      const rep = String(r.reponse || '').trim();
      if (rep && !seen[rep]) { seen[rep] = true; fam.push([rep, String(r.categorie || ''), String(r.epoque || '')]); }
    });
    return fam.length >= 6 ? { [theme + '|' + text]: fam } : {};
  }

  /** Tire la prochaine question du chapitre et lance son compte à rebours de 5 s. */
  async function nextQuestion(st, players, prev) {
    const id = pickId(st.pools[st.chapIndex] || [], st.level, st.used);
    if (!id) throw new Error('Plus de question disponible dans ce chapitre.');
    st.used.push(id);
    const row = await questionById(id);
    const fam = String(row.type).toUpperCase() === 'QCM' ? await familyOf(row.theme, row.question) : {};
    st.current = loadQuestion(row, st, fam);
    if (!prev) { st.qIndex++; st.chapQ++; }
    st.reveal = null;
    decorate(st, players, prev || null);
    beginIntro(st);
  }

  /* ---------------- Révélation et fin de partie ---------------- */

  /** Écrit le détail des réponses : c'est ce qui alimente le classement général. */
  async function logAnswers(st, players, results) {
    const q = st.current;
    const ch = st.settings.chapters[st.chapIndex];
    for (const pid of Object.keys(results).filter(x => !results[x].spect)) {
      const r = results[pid];
      const fields = {
        chapitre: ch ? ch.name : '', question_id: q.id, theme: q.theme, categorie: q.cat, difficulte: q.diff,
        correct: r.ok, points: r.pts, temps: r.t, reponse_txt: r.answered ? r.a : '(pas de réponse)',
      };
      // Le joueur qui a répondu a déjà sa ligne (sa réponse brute y figure) : on la complète.
      const up = check(await db.from('answers').update(fields)
        .eq('game_code', st.code).eq('q_index', st.qIndex).eq('pid', pid).select('id'));
      if (!up.data || !up.data.length) {
        check(await db.from('answers').insert(Object.assign({
          game_code: st.code, pid: pid, pseudo: players[pid].pseudo, q_index: st.qIndex, valeur: null,
        }, fields)));
      }
    }
    const { data: cur } = check(await db.from('questions').select('*').eq('id', q.id).maybeSingle());
    check(await db.from('questions').update({
      utilisations: (cur?.utilisations || 0) + 1, dernier_jeu: nowISO(),
    }).eq('id', q.id));
  }

  async function reveal(st, players) {
    const answers = await loadAnswers(st.code, st.qIndex);
    const results = doReveal(st, players, answers);
    await savePlayers(st.code, players);
    await logAnswers(st, players, results);
    return answers;
  }

  async function endGame(st, players) {
    st.status = 'END';
    st.current = null;
    st.media = { seq: st.media.seq + 1, action: 'stop' };
    if (st.persisted || st.qIndex < 0) return;
    st.persisted = true;
    const rk = ranking(st, players);
    const s = st.settings;
    // Les résultats de cette partie affinent la difficulté des questions jouées
    await db.rpc('recalculer_difficulte').catch(() => {});
    check(await db.from('parties').upsert({
      code: st.code, jouee_le: nowISO(),
      chapitres: s.chapters.map(c => c.name + ' (' + c.nb + ')').join(' · '),
      nb_questions: st.qIndex + 1,
      mode_points: s.points + (s.format !== 'classique' ? ' · ' + s.format : ''),
      nb_joueurs: rk.length, vainqueur: rk[0] ? rk[0].pseudo : '', score: rk[0] ? (rk[0].score || 0) : 0,
      podium: rk.slice(0, 3).map(p => ({ rank: p.rank, pseudo: p.pseudo, score: p.score || 0 })),
    }, { onConflict: 'code' }));
  }

  /* ------------------------------------------------------------------ */
  /* Les actions                                                         */
  /* ------------------------------------------------------------------ */

  return async function handle(action, p) {
    p = p || {};
    switch (action) {

      /** Diagnostic : ce que le serveur voit réellement de la banque de questions. */
      case 'diag': {
        const t0 = Date.now();
        const qs = await allQuestions(COLS_LEGERES);
        const themes = {};
        qs.forEach(q => { if (q.question) themes[q.theme] = (themes[q.theme] || 0) + 1; });
        return {
          questions: qs.length,
          utilisables: qs.filter(q => q.question && String(q.actif || 'oui').toLowerCase() !== 'non').length,
          themes: Object.keys(themes).length,
          colonnes: qs[0] ? Object.keys(qs[0]) : [],
          ms: Date.now() - t0,
        };
      }

      /** Heure du serveur — et petit réveil de la base au passage. */
      case 'time': {
        await db.from('app_state').select('*').eq('id', 1).maybeSingle();
        return { now: Date.now() };
      }

      /* ---------------- Préparation ---------------- */

      /** Inventaire de la banque : sert à tous les menus de la préparation. */
      case 'adminCatalog': {
        const qs = await allQuestions(COLS_LEGERES);
        const out = { themes: {}, total: 0, withMedia: 0, photos: 0, cartes: 0, epoques: EPOQUES };
        const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
        qs.forEach(r => {
          if (!r.question || String(r.actif || 'oui').toLowerCase() === 'non') return;
          const th = String(r.theme || 'Divers');
          const cat = String(r.categorie || '');
          const d = Math.max(1, Math.min(5, Number(r.difficulte) || 1));
          const era = String(r.epoque || '');
          const type = String(r.type).toUpperCase();
          const m = String(r.media_url || '').trim();
          const t = out.themes[th] = out.themes[th]
            || { count: 0, levels: [0, 0, 0, 0, 0], cats: {}, eras: {}, types: {}, dates: 0, erasDates: {}, photos: 0, sons: 0 };
          t.count++;
          t.levels[d - 1]++;
          inc(t.types, type);
          if (cat) inc(t.cats, cat);
          if (era) inc(t.eras, era);
          if (isDateQ(r)) { t.dates++; if (era) inc(t.erasDates, era); }
          if (isImage(m)) { t.photos++; out.photos++; }
          if (/youtu/.test(m) || /\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(m)) t.sons++;
          if (type === 'CARTE') out.cartes++;
          out.total++;
          if (m) out.withMedia++;
        });
        return out;
      }

      /**
       * La liste des extraits d'un blind test, pour que le maître du jeu voie et
       * choisisse ce qui va passer. On rend la réponse (artiste – titre), le lien,
       * et l'historique de passage.
       */
      case 'adminBlindList': {
        const theme = String(p.theme || '');
        const q = db.from('questions').select(
          'id,theme,categorie,difficulte,difficulte_mesuree,stats_n,stats_reussite,question,reponse,media_url,media_debut,media_duree,epoque,actif,utilisations,dernier_jeu');
        // le filtre part à la base : sinon la limite de 1 000 lignes couperait la liste
        const { data } = check(await (theme ? q.eq('theme', theme) : q.like('theme', 'Blind test%')).limit(1000));
        const liste = (data || []).map(r => ({
            id: r.id, theme: r.theme, cat: r.categorie, question: r.question, reponse: r.reponse,
            diff: effDiff(r), diffAuteur: Number(r.difficulte) || 1,
            mesuree: r.difficulte_mesuree ? Number(r.difficulte_mesuree) : null,
            vus: Number(r.stats_n) || 0, reussite: r.stats_reussite === null ? null : Number(r.stats_reussite),
            epoque: r.epoque || '', actif: String(r.actif || 'oui').toLowerCase() !== 'non',
            url: r.media_url, debut: Number(r.media_debut) || 0, duree: Number(r.media_duree) || 15,
            joue: Number(r.utilisations) || 0, dernier: r.dernier_jeu || null,
          }))
          .sort((a, b) => a.theme.localeCompare(b.theme) || String(a.cat).localeCompare(String(b.cat)) || a.reponse.localeCompare(b.reponse));
        return { liste: liste };
      }

      case 'adminCreateGame': {
        const settings = normalizeSettings(p.settings);
        const qs = await allQuestions(COLS_LEGERES);
        const pools = buildPools(settings, qs);
        const problems = [];
        settings.chapters.forEach((ch, i) => {
          if (pools[i].length < ch.nb) {
            problems.push(`« ${ch.name} » : ${pools[i].length} question(s) disponible(s) pour ${ch.nb} demandée(s)`);
          }
        });
        if (problems.length) throw new Error('Pas assez de questions :\n' + problems.join('\n'));

        const { data: old } = check(await db.from('games').select('*').order('created_at', { ascending: false }).limit(50));
        const st = newState(newCode((old || []).map(g => g.code)), settings);
        st.pools = pools;
        check(await db.from('games').insert({ code: st.code, status: 'LOBBY', state: st, created_at: nowISO() }));
        check(await db.from('game_live').insert({ code: st.code, status: 'LOBBY', state: {} }));
        check(await db.from('game_mj').insert({ code: st.code, state: {} }));
        check(await db.from('app_state').update({ screen_game: st.code, updated_at: nowISO() }).eq('id', 1));
        return await publish(st, {}, {});
      }

      /* ---------------- Déroulé ---------------- */

      case 'adminState': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        return adminView(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminNext': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        let answers = {};
        if (LIVE.indexOf(st.status) >= 0) {
          answers = await reveal(st, players);
        } else if (st.status === 'END') {
          return adminView(st, players, {});
        } else if (st.finished) {
          await endGame(st, players);          // survie : il ne reste qu'un joueur
        } else {
          const ch = st.settings.chapters[st.chapIndex];
          const chapterDone = st.chapIndex < 0 || st.chapQ >= ch.nb;
          if (st.status !== 'CHAPTER' && chapterDone) {
            if (st.chapIndex + 1 >= st.settings.chapters.length) {
              await endGame(st, players);
            } else {
              st.chapIndex++;
              st.chapQ = 0;
              st.level = st.settings.chapters[st.chapIndex].level;
              st.reveal = null;
              st.current = null;
              // Un seul chapitre : pas d'écran de chapitre, on enchaîne sur l'intro
              if (st.settings.chapters.length === 1) await nextQuestion(st, players);
              else st.status = 'CHAPTER';
            }
          } else {
            await nextQuestion(st, players);
          }
        }
        return await publish(st, players, answers);
      }

      case 'adminStartTimer': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (st.status === 'READ' || (st.status === 'INTRO' && !st.current.start)) startTimer(st);
        return await publish(st, players, {});
      }

      case 'adminReveal': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (LIVE.indexOf(st.status) < 0) return adminView(st, players, {});
        const answers = await reveal(st, players);
        return await publish(st, players, answers);
      }

      case 'adminShowScores': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (st.status === 'REVEAL') st.status = 'SCORES';
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      /** Remplace la question en cours par une autre du même niveau. */
      case 'adminSkip': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (LIVE.indexOf(st.status) < 0) return adminView(st, players, {});
        check(await db.from('answers').delete().eq('game_code', st.code).eq('q_index', st.qIndex));
        await nextQuestion(st, players, st.current);
        return await publish(st, players, {});
      }

      case 'adminEnd': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (LIVE.indexOf(st.status) >= 0) await reveal(st, players);
        await endGame(st, players);
        return await publish(st, players, {});
      }

      case 'adminMedia': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        st.media = { seq: st.media.seq + 1, action: p.mediaAction === 'stop' ? 'stop' : 'play' };
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminSetLevel': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        st.level = Math.max(1, Math.min(5, Number(p.level) || 1));
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminUpdateSettings': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        ['visual', 'sounds', 'audioOn', 'autoReveal', 'duration', 'choix', 'estimQcm', 'saisie', 'saisieNiveau'].forEach(k => {
          if (p.patch && p.patch[k] !== undefined) st.settings[k] = p.patch[k];
        });
        st.settings = normalizeSettings(st.settings);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminKick': {
        const st = await loadGame(p.code);
        check(await db.from('players').delete().eq('game_code', st.code).eq('pid', String(p.pid)));
        const players = await loadPlayers(st.code);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminShuffleTeams': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        shuffle(Object.keys(players)).forEach((pid, i) => { players[pid].team = i % st.settings.teams; });
        await savePlayers(st.code, players);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      /* ---------------- Banque et montages ---------------- */

      case 'adminAddQuestion': {
        const q = p.question || {};
        const type = String(q.type || 'QCM').toUpperCase();
        if (TYPES.indexOf(type) < 0) throw new Error('Type de question inconnu.');
        if (!String(q.question || '').trim() || !String(q.reponse || '').trim()) {
          throw new Error('Il faut au moins une question et une réponse.');
        }
        const { data: last } = check(await db.from('questions').select('*').order('id', { ascending: false }).limit(1));
        const n = last && last[0] ? (parseInt(String(last[0].id).replace(/\D/g, ''), 10) || 0) + 1 : 1;
        const id = 'Q' + String(n).padStart(4, '0');
        check(await db.from('questions').insert({
          id: id, theme: String(q.theme || 'Divers'), categorie: String(q.categorie || ''),
          difficulte: Math.max(1, Math.min(5, Number(q.difficulte) || 1)), type: type,
          question: String(q.question).trim(), reponse: String(q.reponse).trim(),
          choix2: String(q.choix2 || ''), choix3: String(q.choix3 || ''), choix4: String(q.choix4 || ''),
          explication: String(q.explication || ''), indices: String(q.indices || ''),
          media_url: String(q.media_url || ''), media_debut: Number(q.media_debut) || 0,
          media_duree: Number(q.media_duree) || 15, actif: 'oui', utilisations: 0,
          epoque: String(q.epoque || ''), anecdote: String(q.anecdote || ''),
        }));
        return { id: id };
      }

      case 'adminMontages': {
        const { data } = check(await db.from('montages').select('*').order('nom'));
        return { montages: data || [] };
      }

      case 'adminSaveMontage': {
        const nom = String(p.nom || '').trim().slice(0, 60);
        if (!nom) throw new Error('Donne un nom à ce montage.');
        check(await db.from('montages').upsert({
          nom: nom, description: String(p.description || ''), config: p.config || {}, created_at: nowISO(),
        }, { onConflict: 'nom' }));
        return { ok: true };
      }

      case 'adminDeleteMontage': {
        check(await db.from('montages').delete().eq('nom', String(p.nom || '')));
        return { ok: true };
      }

      case 'adminLeaderboard': {
        const { data: g } = check(await db.from('classement').select('*').order('points', { ascending: false }).limit(200));
        const { data: t } = check(await db.from('classement_par_theme').select('*'));
        const { data: parties } = check(await db.from('parties').select('*').order('jouee_le', { ascending: false }).limit(50));
        return { classement: g || [], themes: t || [], parties: parties || [] };
      }

      /* ---------------- Joueurs ---------------- */

      case 'playerJoin': {
        const pid = checkPid(p.pid);
        const pseudo = cleanPseudo(p.pseudo);
        const st = await loadGame(p.code);
        if (st.status === 'END') throw new Error('Cette partie est terminée.');
        const players = await loadPlayers(st.code);
        const low = pseudo.toLowerCase();
        if (Object.keys(players).some(x => x !== pid && players[x].pseudo.toLowerCase() === low)) {
          throw new Error('Ce pseudo est déjà pris dans la partie.');
        }
        if (!players[pid]) {
          if (Object.keys(players).length >= st.settings.maxPlayers) throw new Error('La partie est complète.');
          const data = { score: 0, good: 0, time: 0, streak: 0, lives: st.settings.lives };
          if (st.settings.format === 'equipes') data.team = smallestTeam(st, players);
          // Survie : un joueur qui arrive en cours de partie commence avec une seule vie
          if (st.settings.format === 'survie' && st.qIndex >= 0) data.lives = 1;
          const res = await db.from('players').insert({
            game_code: st.code, pid: pid, pseudo: pseudo, data: data, vis: 'visible', last_seen: nowISO(),
          });
          if (res.error) {
            throw new Error(/duplicate|unique/i.test(res.error.message)
              ? 'Ce pseudo est déjà pris dans la partie.' : res.error.message);
          }
          players[pid] = Object.assign({ pseudo: pseudo }, data);
        } else {
          check(await db.from('players').update({ pseudo: pseudo, last_seen: nowISO() })
            .eq('game_code', st.code).eq('pid', pid));
          players[pid].pseudo = pseudo;
        }
        const answers = await loadAnswers(st.code, st.qIndex);
        await publish(st, players, answers);
        return publicView(st, players, answers, pid);
      }

      case 'playerAnswer': {
        const pid = checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (!players[pid]) return { ok: false, msg: 'Tu ne fais plus partie de la partie.' };
        if (st.status === 'INTRO' && st.qIndex === p.qIndex) return { ok: false, msg: "La question n'a pas encore commencé." };
        if (st.status !== 'QUESTION' || st.qIndex !== p.qIndex) return { ok: false, msg: 'Trop tard !' };
        if (st.settings.format === 'survie' && players[pid].out) return { ok: false, msg: 'Tu es éliminé·e 💀 Regarde la suite !' };
        const t = answerTime(st, Date.now());
        if (t === null) return { ok: false, msg: 'Temps écoulé !' };
        if (st.current.type === 'CARTE' && !(Array.isArray(p.answer) && p.answer.length === 2
          && !isNaN(Number(p.answer[0])) && !isNaN(Number(p.answer[1])))) {
          return { ok: false, msg: 'Pose un point sur la carte.' };
        }
        const res = await db.from('answers').insert({
          game_code: st.code, pid: pid, pseudo: players[pid].pseudo, q_index: st.qIndex,
          valeur: p.answer, temps: t, created_at: nowISO(),
        });
        if (res.error) {
          return { ok: false, msg: /duplicate|unique/i.test(res.error.message) ? 'Réponse déjà enregistrée.' : res.error.message };
        }
        return { ok: true, t: t };
      }

      /** Joker 50/50 : retire deux mauvaises réponses (une fois par partie). */
      case 'playerJoker': {
        const pid = checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        const pl = players[pid];
        const q = st.current;
        if (!pl || !st.settings.joker) return { ok: false, msg: 'Pas de joker dans cette partie.' };
        if (st.status !== 'QUESTION' || st.qIndex !== p.qIndex) return { ok: false, msg: 'Trop tard !' };
        if (q.type !== 'QCM' || !q.choices || q.choices.length < 4) {
          return { ok: false, msg: 'Le joker ne marche que sur un QCM à 4 propositions.' };
        }
        if (pl.joker) return { ok: false, msg: 'Tu as déjà utilisé ton joker.' };
        const wrong = shuffle(q.choices.map((_, i) => i).filter(i => i !== q.secret.correct)).slice(0, 2);
        pl.joker = { q: st.qIndex, hide: wrong };
        await savePlayers(st.code, { [pid]: pl });
        return { ok: true, hide: wrong };
      }

      /** Vue personnelle : appelée en rejoignant et à chaque révélation. */
      case 'playerView': {
        const pid = checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        return publicView(st, players, await loadAnswers(st.code, st.qIndex), pid);
      }

      /** Présence : appelée quand l'appli passe en arrière-plan ou revient. */
      case 'playerPresence': {
        const pid = checkPid(p.pid);
        const code = String(p.code || '').toUpperCase();
        const hidden = p.vis === 'hidden';
        const { data } = check(await db.from('players').select('*')
          .eq('game_code', code).eq('pid', pid).maybeSingle());
        if (!data) return { ok: true };
        const st = await loadGame(code).catch(() => null);
        const countExit = hidden && data.vis !== 'hidden' && st && st.status === 'QUESTION';
        check(await db.from('players').update({
          vis: hidden ? 'hidden' : 'visible',
          exits: (data.exits || 0) + (countExit ? 1 : 0),
          last_seen: nowISO(),
        }).eq('game_code', code).eq('pid', pid));
        return { ok: true };
      }

      /* ---------------- Écran public ---------------- */

      /** L'écran suit toujours la dernière partie créée : inutile de le recharger. */
      case 'screenGame': {
        const { data } = check(await db.from('app_state').select('*').eq('id', 1).maybeSingle());
        return { code: (data && data.screen_game) || null, now: Date.now() };
      }

      default:
        throw new Error('Action inconnue : ' + action);
    }
  };
}

/* ================= ENTRÉE (index.ts) ================= */
/**
 * Quizz — point d'entrée de la fonction serveur (Supabase Edge Function).
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


/** Version du serveur : renvoyée par l'action « time », pour vérifier ce qui est déployé. */
const BUILD = '2026-09-25-cf1ce8';

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
    return json({ ok: true, data: data, now: Date.now(), build: BUILD });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const auth = /Connexion du maître du jeu/.test(msg);
    return json({ ok: false, error: msg }, auth ? 401 : 400);
  }
});
