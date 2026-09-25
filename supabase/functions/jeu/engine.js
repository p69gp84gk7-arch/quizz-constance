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

export const EPOQUES = ['Avant 1970', 'Années 70', 'Années 80', 'Années 90', 'Années 2000', 'Années 2010', 'Années 2020'];
export const TYPES = ['QCM', 'VF', 'ESTIMATION', 'ORDRE', 'CARTE'];
export const FORMATS = ['classique', 'face', 'survie', 'equipes', 'buzzer'];
export const TEAM_NAMES = ['🔴 Rouges', '🔵 Bleus', '🟢 Verts', '🟡 Jaunes'];
export const LIVE = ['INTRO', 'READ', 'QUESTION'];
export const INTRO_S = 5;      // compte à rebours avant chaque question
export const GRACE_S = 1.5;    // tolérance réseau après la fin du chrono
export const MAP_OK = 0.75;    // « bonne réponse » sur la carte à partir de 75 % de précision
const APP_NAME = 'Quizz';

/* ------------------------------------------------------------------ */
/* Outils                                                              */
/* ------------------------------------------------------------------ */

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 1987 reste « 1987 » (année), 3600 devient « 3 600 » ; avec une unité, toujours le format nombre. */
export function formatNum(n, unit) {
  if (isNaN(n)) return '?';
  return !unit && Math.abs(n) >= 1000 && Math.abs(n) < 3000 && n === Math.round(n)
    ? String(n) : Number(n).toLocaleString('fr-FR');
}

export function formatKm(km) {
  if (km === null || km === undefined) return '';
  return km < 1 ? Math.round(km * 1000) + ' m'
    : km < 10 ? (Math.round(km * 10) / 10).toLocaleString('fr-FR') + ' km'
      : Math.round(km).toLocaleString('fr-FR') + ' km';
}

const clamp = (v, a, b, d) => { v = Number(v); return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };

/* ------------------------------------------------------------------ */
/* Réglages                                                            */
/* ------------------------------------------------------------------ */

/** Réglages qu'un chapitre peut redéfinir pour lui seul. */
export const REGLES_CHAPITRE = ['duration', 'points', 'estimation', 'margePct', 'estimQcm',
  'saisie', 'saisieNiveau', 'joker', 'bonus', 'autoReveal'];

export function normalizeSettings(s) {
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
      // Règles propres au chapitre : ce qui n'est pas renseigné suit les réglages de la partie
      regles: REGLES_CHAPITRE.reduce((o, k) => {
        if (c.regles && c.regles[k] !== undefined && c.regles[k] !== '') o[k] = c.regles[k];
        return o;
      }, {}),
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
    // Où sort le son du blind test : écran public, appareil du MJ, téléphones des
    // joueurs, ou partout à la fois.
    audioOn: ['ecran', 'admin', 'joueurs', 'tous'].indexOf(s.audioOn) >= 0 ? s.audioOn : 'ecran',
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

/**
 * Les règles qui s'appliquent vraiment : celles de la partie, corrigées par
 * celles du chapitre en cours. C'est ce que tout le moteur doit consulter.
 */
export function rules(st) {
  const s = st.settings || {};
  const ch = (s.chapters || [])[st.chapIndex];
  if (!ch || !ch.regles || !Object.keys(ch.regles).length) return s;
  const out = Object.assign({}, s, ch.regles);
  // on revalide les valeurs venues du chapitre
  out.duration = clamp(out.duration, 10, 120, s.duration);
  out.margePct = clamp(out.margePct, 1, 50, s.margePct);
  out.saisieNiveau = clamp(out.saisieNiveau, 2, 5, s.saisieNiveau);
  if (['simple', 'rapidite', 'series'].indexOf(out.points) < 0) out.points = s.points;
  if (['libre', 'qcm', 'mixte', 'auto'].indexOf(out.estimQcm) < 0) out.estimQcm = s.estimQcm;
  if (['auto', 'jamais', 'toujours'].indexOf(out.saisie) < 0) out.saisie = s.saisie;
  if (out.estimation !== 'proche' && out.estimation !== 'marge') out.estimation = s.estimation;
  return out;
}

/* ------------------------------------------------------------------ */
/* Banque de questions                                                 */
/* ------------------------------------------------------------------ */

/**
 * Question dont la réponse est une année (« En quelle année… », 1789…).
 * La base calcule ce drapeau elle-même (colonne est_annee) : quand il est là,
 * inutile de transporter le texte de la question et sa réponse.
 */
export function isDateQ(q) {
  if (q.est_annee !== undefined && q.est_annee !== null) return !!q.est_annee;
  return /(en|quelle) ann[ée]e/i.test(String(q.question)) && /^\s*\d{3,4}\s*$/.test(String(q.reponse));
}

export function isImage(url) {
  url = String(url || '').trim();
  return !!url && !/youtu/.test(url);
}

/** Difficulté réellement utilisée : celle mesurée sur les parties si elle existe, sinon la note d'origine. */
export function effDiff(r) {
  const m = Number(r.difficulte_mesuree);
  return m >= 1 && m <= 5 ? m : (Number(r.difficulte) || 1);
}

/** Les blind tests dépendent de la culture de chacun : leur note n'est pas fiable. */
export function isBlind(r) {
  return /^blind test/i.test(String(r.theme || ''));
}

/** Pool d'un chapitre : [id, difficulté, utilisations, dernier passage, souple] pour chaque question retenue. */
export function buildPools(settings, questions) {
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
export function buildFamilies(questions) {
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

export function newCode(taken) {
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
export function pickId(pool, level, used) {
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

export function parseMedia(url, start, dur) {
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

export const SOUND_KINDS = ['youtube', 'audio'];
export const isSound = m => !!m && SOUND_KINDS.indexOf(m.kind) >= 0;

/* ------------------------------------------------------------------ */
/* Réponses tapées au clavier                                          */
/* ------------------------------------------------------------------ */

/** « L'Étoile   noire ! » → « etoile noire » : on compare le fond, pas la forme. */
export function normText(x) {
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
export function distance(a, b) {
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
export function acceptedForms(rep, question) {
  const brut = String(rep || '');
  const formes = [brut];
  // Titre à deux temps : « The Dark Knight : Le Chevalier noir » s'accepte des deux côtés
  brut.split(/\s:\s/).map(x => x.trim()).forEach(x => { if (x.length >= 4) formes.push(x); });
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
export function answerTarget(rep, question) {
  let brut = String(rep || '').trim();
  // pour les indices, on vise la partie la plus parlante d'un titre à deux temps
  const deuxTemps = brut.split(/\s:\s/).map(x => x.trim()).filter(x => x.length >= 4);
  if (deuxTemps.length === 2) brut = deuxTemps[0];
  const parts = brut.split(/\s[–—-]\s|\s\/\s/).map(x => x.trim()).filter(x => x.length >= 3);
  if (parts.length !== 2) return brut;
  const q = String(question || '');
  if (/\bqui\b|artiste|groupe|chante|interpr|composit/i.test(q)) return parts[0];
  if (/titre|chanson|morceau|film|album/i.test(q)) return parts[1];
  return brut;
}

/** La réponse tapée est-elle acceptée ? Une faute de frappe est pardonnée sur les mots longs. */
export function matchText(donnee, formes) {
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
export function typable(rep) {
  const r = String(rep || '').trim();
  return r.length >= 2 && r.length <= 42 && r.split(/\s+/).length <= 6 && !/[|;]/.test(r);
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

// full = distance (km) sous laquelle on marque tous les points ; zero = distance à partir de laquelle on ne marque plus rien
export const ZONES = {
  monde: { full: 150, zero: 3000 }, europe: { full: 40, zero: 900 }, france: { full: 12, zero: 250 },
  afrique: { full: 120, zero: 2500 }, asie: { full: 120, zero: 2500 }, ameriques: { full: 120, zero: 2500 },
  paris: { full: 0.3, zero: 6 },
};

export function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2
    + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lon2 - lon1) * rad / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Précision d'un point posé sur la carte : 1 = parfait, 0 = trop loin. */
export function mapScore(q, a) {
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
export function adaptiveDistractors(rep, fixed, fam, cat, era, level) {
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
export function numericChoices(v, level, unit) {
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
export function roundLike(c, v) {
  const dec = (String(v).split('.')[1] || '').length;
  if (dec) return Number(c.toFixed(Math.min(dec, 1)));
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(Math.abs(v))) - 1));
  return Math.round(c / mag) * mag;
}

/* ------------------------------------------------------------------ */
/* Construction d'une question jouable                                 */
/* ------------------------------------------------------------------ */

/** `r` = ligne de la table questions ; `st` = état de la partie (niveau, réglages). */
export function loadQuestion(r, st, families) {
  const type = String(r.type).toUpperCase().trim();
  const q = {
    id: String(r.id), theme: String(r.theme), cat: String(r.categorie || ''),
    diff: Number(r.difficulte) || 1, type: type, text: String(r.question),
    expl: String(r.explication || ''), indices: String(r.indices || ''),
    media: parseMedia(r.media_url, r.media_debut, r.media_duree), secret: {},
    epoque: String(r.epoque || ''), anecdote: String(r.anecdote || ''),
  };
  const level = st ? st.level : q.diff;
  const reg = st ? rules(st) : {};
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
    const mode = st ? reg.estimQcm : 'libre';
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
    const regle = st ? reg.saisie : 'jamais';
    const seuil = st ? reg.saisieNiveau : 4;
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
      const fam = st && reg.choix === 'adaptatifs' && families ? families[q.theme + '|' + q.text] : null;
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

export function newState(code, settings) {
  return {
    code: code, created: Date.now(), status: 'LOBBY', settings: settings,
    qIndex: -1, chapIndex: -1, chapQ: 0, level: settings.chapters[0].level,
    total: settings.chapters.reduce((a, c) => a + c.nb, 0),
    used: [], current: null, reveal: null, media: { seq: 0, action: 'stop' },
    pools: [], finished: false, persisted: false,
  };
}

/** Fin de l'intro calculée à la volée : aucun appel serveur à la bonne milliseconde. */
export function promote(st) {
  if (st && st.status === 'INTRO' && st.current && Date.now() >= st.current.introEnd) {
    st.status = st.settings.chrono === 'auto' ? 'QUESTION' : 'READ';
  }
  return st;
}

/** Thème + compte à rebours de 5 s, puis la question démarre toute seule. */
export function beginIntro(st) {
  const q = st.current;
  const s = rules(st);
  // L'extrait dure le temps de réponse, celui du chapitre : 30 s de chrono = 30 s de musique
  if (isSound(q.media)) q.media.dur = s.duration;
  // une nouvelle question repart sans temps mort
  q.pausedMs = 0;
  q.pausedAt = null;
  st.status = 'INTRO';
  q.introEnd = Date.now() + INTRO_S * 1000;
  q.start = q.introEnd;
  st.media = isSound(q.media)
    ? { seq: st.media.seq + 1, action: 'play', at: q.start }
    : { seq: st.media.seq + 1, action: 'stop' };
}

/** Temps mort accumulé sur la question en cours, en millisecondes. */
export function pausedMs(st) {
  const q = st.current;
  if (!q) return 0;
  const acc = Number(q.pausedMs) || 0;
  return q.pausedAt ? acc + (Date.now() - q.pausedAt) : acc;
}

/** Met le chrono en pause : le temps cesse de courir pour tout le monde. */
export function pause(st) {
  const q = st.current;
  if (!q || q.pausedAt) return false;
  q.pausedAt = Date.now();
  st.media = { seq: st.media.seq + 1, action: 'stop' };   // le son s'arrête aussi
  return true;
}

/** Repart où on s'était arrêté, en décalant le départ du chrono. */
export function resume(st) {
  const q = st.current;
  if (!q || !q.pausedAt) return false;
  q.pausedMs = (Number(q.pausedMs) || 0) + (Date.now() - q.pausedAt);
  q.pausedAt = null;
  if (q.introEnd) q.introEnd += 0;   // l'intro n'est pas concernée : elle est déjà passée
  return true;
}

export function startTimer(st) {
  st.status = 'QUESTION';
  st.current.start = Date.now();
  if (isSound(st.current.media)) st.media = { seq: st.media.seq + 1, action: 'play', at: st.current.start };
}

/**
 * Ce qui entoure la question selon le format : duel, question en or, finale ×3.
 * `prev` = question remplacée (le duel et le bonus sont conservés).
 */
export function decorate(st, players, prev) {
  const q = st.current;
  const s = rules(st);
  q.mult = 1;
  if (prev) { q.gold = prev.gold; q.duel = prev.duel; q.mult = prev.mult || 1; return; }
  if (s.finale && st.qIndex === st.total - 1) q.mult = 3;
  else if (s.bonus && st.qIndex > 0 && !st.lastGold && Math.random() < 0.2) { q.gold = true; q.mult = 2; }
  st.lastGold = !!q.gold;
  if (s.format === 'face') q.duel = pickDuel(st, players);
}

/** Deux joueurs qui ont le moins joué de duels, en privilégiant ceux qui ne se sont pas affrontés. */
export function pickDuel(st, players) {
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
export function smallestTeam(st, players) {
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

export function points(s, diff, t, streak) {
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
export function doReveal(st, players, answers) {
  const q = st.current;
  const s = rules(st);
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
export function liveJudge(st, answers) {
  const q = st.current;
  if (!q) return () => null;
  if (q.type === 'QCM' || q.type === 'VF') return a => Number(a) === q.secret.correct;
  if (q.type === 'SAISIE') return a => matchText(a, q.secret.formes);
  if (q.type === 'ORDRE') return a => (a || []).map(i => q.items[i]).join('|') === q.secret.order.join('|');
  if (q.type === 'CARTE') return a => mapScore(q, a).f >= MAP_OK;
  const s = rules(st);
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

export function ranking(st, players) {
  const survie = st.settings.format === 'survie';
  return Object.keys(players).map(p => Object.assign({ pid: p }, players[p]))
    .sort((a, b) => (survie ? ((b.out || 1e9) - (a.out || 1e9)) || ((b.lives || 0) - (a.lives || 0)) : 0)
      || (b.score || 0) - (a.score || 0) || (a.time || 0) - (b.time || 0) || a.pseudo.localeCompare(b.pseudo))
    .map((p, i) => Object.assign(p, { rank: i + 1 }));
}

/** Classement des équipes : moyenne des points par joueur. */
export function teamRanking(st, players) {
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

export function publicQuestion(q) {
  if (!q) return null;
  return {
    id: q.id, type: q.type, text: q.text, theme: q.theme, cat: q.cat, diff: q.diff,
    choices: q.choices || null, unit: q.unit || '', items: q.items || null, hint: q.hint || '',
    lettres: q.lettres || null, initiale: q.initiale || '',
    media: q.media, start: q.start || null, epoque: q.epoque || '', zone: q.zone || null,
    mult: q.mult || 1, gold: !!q.gold,
  };
}

export function chapterInfo(st) {
  const ch = st.settings.chapters[st.chapIndex];
  if (!ch) return null;
  return { idx: st.chapIndex + 1, count: st.settings.chapters.length, name: ch.name, nb: ch.nb, themes: ch.themes, level: ch.level };
}

/**
 * Vue publique (écran + téléphones). `answers` sert uniquement à compter les réponses ;
 * aucune bonne réponse n'en sort tant que le statut n'est pas REVEAL.
 */
export function publicView(st, players, answers, pid) {
  const s = rules(st);
  const v = {
    code: st.code, status: st.status, now: Date.now(), title: s.title,
    visual: s.visual, sounds: s.sounds, audioOn: s.audioOn, duration: s.duration, points: s.points,
    qIndex: st.qIndex, total: st.total, chapQ: st.chapQ, level: st.level, chapter: chapterInfo(st),
    media: st.media, playerCount: Object.keys(players).length,
    // chrono : temps mort accumulé et pause en cours, pour que tous les écrans s'accordent
    pausedMs: pausedMs(st), paused: !!(st.current && st.current.pausedAt),
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
export function adminView(st, players, answers) {
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
      corrigeMJ: res ? !!res.corrigeMJ : false,
    };
  });
  v.answeredCount = Object.keys(live).length;
  v.liveDist = dist;
  return v;
}

/* ------------------------------------------------------------------ */
/* Validation des entrées                                              */
/* ------------------------------------------------------------------ */

export function checkPid(pid) {
  if (!/^[a-z0-9]{8,40}$/i.test(String(pid))) throw new Error('Identifiant joueur invalide.');
  return String(pid);
}

export function cleanPseudo(pseudo) {
  const p = String(pseudo || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  if (p.length < 2) throw new Error('Pseudo trop court (2 caractères minimum).');
  return p;
}

/** Vérifie qu'une réponse arrive à temps et rend le temps de réponse en secondes. */
export function answerTime(st, now) {
  if (st.current && st.current.pausedAt) return null;       // chrono en pause : personne ne répond
  const duree = rules(st).duration;
  const elapsed = (now - st.current.start - pausedMs(st)) / 1000;
  if (elapsed > duree + GRACE_S) return null;
  return Math.round(Math.min(Math.max(elapsed, 0), duree) * 10) / 10;
}
