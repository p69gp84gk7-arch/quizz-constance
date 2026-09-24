/* ================== Utilitaires communs (admin, écran, joueur) ================== */

/** Version de l'appli, affichée en bas de l'écran d'accueil : permet de vérifier
 *  qu'un téléphone tourne bien la dernière version et pas une copie en cache. */
const APP_VERSION = '2026-09-24-a';

const VISUALS = {
  plateau: 'Plateau TV', elegant: 'Élégant', pop: 'Pop', neon: 'Néon', nature: 'Nature', enfants: 'Enfants',
};
const SHAPES = ['▲', '◆', '●', '■'];

/* ---------- Connexion à Supabase ---------- */

/** Client Supabase : sert au temps réel et à la connexion du maître du jeu. */
const SB = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'quizz-mj' },
  realtime: { params: { eventsPerSecond: 20 } },
});

/**
 * Appel au serveur : rpc('adminNext', {code}).then(…)
 * Le jeton du maître du jeu est ajouté automatiquement quand il est connecté,
 * sinon on utilise la clé publique (suffisante pour rejoindre et répondre).
 */
async function rpc(action, params) {
  const { data: sess } = await SB.auth.getSession();
  const token = (sess && sess.session && sess.session.access_token) || CONFIG.anonKey;
  const res = await fetch(CONFIG.url + '/functions/v1/jeu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'apikey': CONFIG.anonKey },
    body: JSON.stringify(Object.assign({ action: action }, params || {})),
  });
  let body = null;
  try { body = await res.json(); } catch (e) { throw new Error('Le serveur n\'a pas répondu (réseau ?).'); }
  if (!body || body.ok !== true) throw new Error((body && body.error) || 'Erreur serveur (' + res.status + ').');
  if (body.now) Clock.sync(body.now, Date.now() - 200);
  return body.data;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const $ = (sel, root) => (root || document).querySelector(sel);

function toast(msg, isErr) {
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg && msg.message ? msg.message : String(msg);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), isErr ? 5000 : 2500);
}

function applyVisual(name) {
  if (document.body.dataset.visual !== name) document.body.dataset.visual = VISUALS[name] ? name : 'plateau';
}

/* ---------- Horloge synchronisée avec le serveur ---------- */
const Clock = {
  offset: 0,
  sync(serverNow, sentAt) {
    const now = Date.now();
    const rtt = now - sentAt;
    // une réponse très lente donne une mesure imprécise : on garde l'ancienne
    if (rtt > 2500 && this.offset !== 0) return;
    const off = serverNow + rtt / 2 - now;
    // lissage pour éviter les sauts du chrono
    this.offset = this.offset === 0 ? off : this.offset * 0.7 + off * 0.3;
  },
  now() { return Date.now() + this.offset; },
  remaining(start, duration) {
    if (!start) return duration;
    return Math.max(0, duration - (this.now() - start) / 1000);
  },
};

/* ---------- Boucle de synchronisation robuste ---------- */
/**
 * Interroge le serveur en boucle. Si une requête reste bloquée (réseau faible, téléphone en veille),
 * un chien de garde relance une nouvelle requête au bout de 5 s au lieu d'attendre indéfiniment.
 * Les réponses arrivées dans le désordre (plus anciennes que la dernière reçue) sont ignorées.
 *   call()   : renvoie la Promise de l'appel serveur
 *   onData(v, sentAt)
 *   delay()  : délai avant la requête suivante (ms)
 */
function createPoller(call, onData, delay) {
  const P = { timer: null, inFlight: 0, lastNow: 0, stopped: false };
  const schedule = ms => { clearTimeout(P.timer); if (!P.stopped) P.timer = setTimeout(tick, ms); };
  function tick() {
    if (P.stopped) return;
    if (P.inFlight >= 3) return schedule(1000); // trop de requêtes en attente : on patiente
    const sent = Date.now();
    let settled = false;
    P.inFlight++;
    const release = next => { if (settled) return; settled = true; P.inFlight--; schedule(next); };
    const watchdog = setTimeout(() => release(0), 5000);
    call().then(v => {
      if (v && v.now) {
        if (v.now < P.lastNow) return; // réponse périmée
        P.lastNow = v.now;
      }
      onData(v, sent);
    }).catch(() => {}).finally(() => { clearTimeout(watchdog); release(delay()); });
  }
  P.start = () => { P.stopped = false; schedule(0); };
  P.now = () => schedule(0); // actualisation immédiate
  P.stop = () => { P.stopped = true; clearTimeout(P.timer); };
  P.reset = () => { P.lastNow = 0; };
  return P;
}

/* ---------- Temps réel : le serveur pousse, personne n'interroge ---------- */
/**
 * Suit une partie. `table` vaut 'game_live' (écran, joueurs) ou 'game_mj' (maître du jeu).
 * Supabase pousse chaque changement ; un filet de sécurité relit la vitrine toutes les 8 s
 * au cas où la connexion temps réel tomberait (tunnel, wifi qui saute, téléphone en veille).
 * onNewGame est appelé quand une AUTRE partie est créée : l'écran et les téléphones suivent.
 */
function watchGame(table, onState, onNewGame) {
  const W = { code: null, seq: -1, chan: null, filet: null, stopped: true };

  const apply = row => {
    if (!row || !row.state || row.code !== W.code) return;
    if (row.seq !== undefined && row.seq <= W.seq) return; // message plus ancien : on ignore
    if (row.seq !== undefined) W.seq = row.seq;
    onState(row.state, row);
  };

  W.refresh = async () => {
    if (!W.code) return;
    const { data } = await SB.from(table).select('*').eq('code', W.code).maybeSingle();
    if (data) apply(data);
  };

  function subscribe() {
    if (W.chan) { SB.removeChannel(W.chan); W.chan = null; }
    if (!W.code) return;
    W.chan = SB.channel('q-' + table + '-' + W.code + '-' + Math.random().toString(36).slice(2, 7))
      .on('postgres_changes', { event: '*', schema: 'public', table: table, filter: 'code=eq.' + W.code },
        p => apply(p.new))
      // Une nouvelle partie crée une ligne dans game_live : c'est le signal de bascule
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_live' }, p => {
        if (onNewGame && p.new && p.new.code && p.new.code !== W.code) onNewGame(p.new.code);
      })
      .subscribe(st => { if (st === 'SUBSCRIBED') W.refresh(); });
  }

  W.follow = code => {
    if (code === W.code) return;
    W.code = code || null;
    W.seq = -1;
    if (!W.stopped) subscribe();
  };
  W.start = code => {
    W.stopped = false;
    if (code) { W.code = code; W.seq = -1; }
    subscribe();
    clearInterval(W.filet);
    W.filet = setInterval(() => { if (!document.hidden) W.refresh(); }, 8000);
  };
  W.stop = () => {
    W.stopped = true;
    clearInterval(W.filet);
    if (W.chan) { SB.removeChannel(W.chan); W.chan = null; }
  };
  return W;
}

/** Prévient le maître du jeu dès qu'une réponse arrive (table réservée à son compte). */
function watchAnswers(code, onAnswer) {
  const chan = SB.channel('q-ans-' + code)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers', filter: 'game_code=eq.' + code },
      p => onAnswer(p.new))
    .subscribe();
  return { stop: () => SB.removeChannel(chan) };
}

/* ---------- Sons (générés, aucun fichier) ---------- */
const Sound = {
  ctx: null,
  enabled: true,
  unlock() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {}
  },
  tone(freq, start, dur, type, vol) {
    if (!this.ctx || !this.enabled) return;
    const t0 = this.ctx.currentTime + start;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.25, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  },
  good() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.09, 0.25, 'triangle', 0.3)); },
  bad() { this.tone(220, 0, 0.25, 'sawtooth', 0.18); this.tone(165, 0.22, 0.45, 'sawtooth', 0.18); },
  tick() { this.tone(1200, 0, 0.05, 'square', 0.08); },
  start() { [392, 523].forEach((f, i) => this.tone(f, i * 0.12, 0.2, 'triangle', 0.22)); },
  reveal() { [440, 554, 659].forEach((f, i) => this.tone(f, i * 0.07, 0.35, 'sine', 0.22)); },
  fanfare() { [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.13, 0.22, 'triangle', 0.28)); },
};

/* ---------- Lecteur YouTube caché (blind test) ---------- */
const YT_PLAYER = {
  player: null, ready: false, pending: null, stopTimer: null,
  init() {
    if (this.player || document.getElementById('yt-wrap')) return;
    const wrap = document.createElement('div');
    wrap.id = 'yt-wrap';
    wrap.innerHTML = '<div id="yt-player"></div>';
    document.body.appendChild(wrap);
    window.onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player('yt-player', {
        width: 200, height: 200,
        playerVars: { controls: 0, disablekb: 1, modestbranding: 1, rel: 0, playsinline: 1 },
        events: { onReady: () => { this.ready = true; if (this.pending) { const p = this.pending; this.pending = null; this.play(p, this.pendingAt); } } },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  },
  /** Joue l'extrait ; si `at` (heure serveur) est dans le futur, la vidéo est préchargée puis lancée pile à l'heure. */
  play(m, at) {
    if (!m || m.kind !== 'youtube') return;
    this.init();
    if (!this.ready) { this.pending = m; this.pendingAt = at; return; }
    clearTimeout(this.stopTimer); clearTimeout(this.startTimer);
    const opts = { videoId: m.id, startSeconds: m.start || 0, endSeconds: (m.start || 0) + (m.dur || 15) };
    const delay = at ? at - Clock.now() : 0;
    const armStop = () => { this.stopTimer = setTimeout(() => this.stop(), ((m.dur || 15) + 3) * 1000); };
    this.player.setVolume(100);
    if (delay > 800) {
      this.player.cueVideoById(opts);
      this.startTimer = setTimeout(() => { this.player.playVideo(); armStop(); }, delay);
    } else {
      this.player.loadVideoById(opts);
      armStop();
    }
  },
  stop() {
    clearTimeout(this.stopTimer); clearTimeout(this.startTimer);
    this.pending = null;
    if (this.player && this.ready && this.player.stopVideo) this.player.stopVideo();
  },
};

/* ---------- Lecteur de fichier audio (extrait MP3, aucune publicité) ---------- */
const AUDIO_PLAYER = {
  el: null, timer: null,
  /** Sur iPhone/iPad, un son ne peut démarrer qu'après un geste : on débloque au premier clic. */
  unlock() {
    if (!this.el) {
      this.el = document.createElement('audio');
      this.el.preload = 'auto';
      this.el.style.display = 'none';
      document.body.appendChild(this.el);
    }
    try { this.el.play().catch(() => {}); this.el.pause(); } catch (e) {}
  },
  play(m, at) {
    if (!this.el) {
      this.el = document.createElement('audio');
      this.el.preload = 'auto';
      this.el.style.display = 'none';
      document.body.appendChild(this.el);
    }
    clearTimeout(this.timer);
    const go = () => {
      this.el.currentTime = m.start || 0;
      this.el.play().catch(() => {});
      this.timer = setTimeout(() => this.stop(), ((m.dur || 15) + 0.5) * 1000);
    };
    if (this.el.src !== m.url) { this.el.src = m.url; this.el.load(); }
    const delay = at ? at - Clock.now() : 0;
    if (delay > 80) this.timer = setTimeout(go, delay); else go();
  },
  stop() {
    clearTimeout(this.timer);
    if (this.el) { this.el.pause(); try { this.el.currentTime = 0; } catch (e) {} }
  },
};

/** Aiguillage : extrait YouTube ou fichier audio, même interface. */
const MEDIA_PLAYER = {
  play(m, at) {
    if (!m) return;
    if (m.kind === 'audio') { YT_PLAYER.stop(); AUDIO_PLAYER.play(m, at); }
    else if (m.kind === 'youtube') { AUDIO_PLAYER.stop(); YT_PLAYER.play(m, at); }
  },
  stop() { YT_PLAYER.stop(); AUDIO_PLAYER.stop(); },
};

/** Applique les commandes média (seq incrémenté côté serveur à chaque lecture/arrêt). */
const MediaSync = {
  lastSeq: null,
  apply(view, question, isPlayerHere) {
    if (!view.media) return;
    if (this.lastSeq === null) { this.lastSeq = view.media.seq; if (view.status !== 'QUESTION') return; }
    if (view.media.seq === this.lastSeq) return;
    this.lastSeq = view.media.seq;
    if (!isPlayerHere) return;
    if (view.media.action === 'play' && question && question.media) MEDIA_PLAYER.play(question.media, view.media.at);
    else MEDIA_PLAYER.stop();
  },
};

/* ---------- Intro (thème + compte à rebours) ---------- */
/** Passe localement de l'intro à la question dès la fin du compte à rebours, sans attendre le serveur. */
function localPromote(v) {
  if (v && v.status === 'INTRO' && v.intro && Clock.now() >= v.intro.end) v.status = v.intro.next;
  return v;
}

function introLeft(v) {
  return v && v.intro ? Math.max(0, Math.ceil((v.intro.end - Clock.now()) / 1000)) : 0;
}

const THEME_ICONS = {
  'Histoire': '🏛️', 'Géographie': '🌍', 'Sciences': '🔬', 'Nature & Animaux': '🦁', 'Cinéma': '🎬',
  'Musique': '🎵', 'Sport': '⚽', 'Arts & Littérature': '🎨', 'Gastronomie': '🍽️', 'Divers': '🎲',
  'Blind test musique': '🎧', 'Blind test cinéma': '🎬', 'Insolite': '🤪', 'Actualité': '📰',
};
function themeIcon(q) {
  if (q && q.type === 'CARTE') return '📍';
  if (q && THEME_ICONS[q.theme]) return THEME_ICONS[q.theme];
  if (q && q.media && (q.media.kind === 'youtube' || q.media.kind === 'audio')) return /cin/i.test(q.theme) ? '🎬' : '🎧';
  return '❓';
}
function introTitle(q) {
  const son = q.media && (q.media.kind === 'youtube' || q.media.kind === 'audio');
  if (/^blind test/i.test(q.theme) || !son) return q.theme;
  return 'Blind test ' + (/cin/i.test(q.theme) ? 'cinéma' : 'musique');
}

/* ---------- Rendu partagé d'une question ---------- */
function levelStars(n) {
  n = Math.max(1, Math.min(5, Number(n) || 1));
  return '★'.repeat(n) + '<span style="opacity:.3">' + '★'.repeat(5 - n) + '</span>';
}

function typeLabel(t) {
  return { QCM: 'QCM', VF: 'Vrai ou faux', ESTIMATION: 'Estimation', ORDRE: 'Remettre dans l\'ordre', CARTE: '📍 Carte' }[t] || t;
}

const FORMAT_LABELS = { classique: 'Classique', face: '⚔️ Face à face', survie: '💀 Survie', equipes: '👥 Équipes', buzzer: '⚡ Le plus rapide' };
function hearts(n, max) { return '❤️'.repeat(Math.max(0, n || 0)) + '<span style="opacity:.25">🖤</span>'.repeat(Math.max(0, (max || 0) - (n || 0))); }
function multBadge(q) {
  if (!q || !q.mult || q.mult < 2) return '';
  return `<span class="pill accent pop-in">${q.mult === 3 ? '🏁 Finale : points ×3' : '⭐ Question en or : points ×2'}</span>`;
}

/**
 * Photo. Avec l'effet « zoom » (gros plan qui se dézoome) ou « flou » (qui se précise) pendant le chrono :
 * l'animation est calée sur l'heure de départ du chrono, donc synchronisée sur tous les écrans.
 *   live = { start, duration } pendant la question ; absent = image nette (réponse, maître du jeu).
 */
function mediaHtml(q, big, live) {
  if (!q || !q.media) return '';
  if (q.media.kind === 'image') {
    const fx = live && q.media.fx ? q.media.fx : '';
    let style = big ? '' : 'max-height:22vh';
    if (fx) {
      const d = live.duration * 0.9;
      const el = Math.max(0, (Clock.now() - (live.start || Clock.now())) / 1000);
      const h = String(q.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      style += `;animation-duration:${d}s;animation-delay:-${Math.min(el, d)}s;transform-origin:${25 + h % 50}% ${25 + (h * 7) % 50}%`;
    }
    return `<div class="media-box"><img class="media-img ${fx ? 'fx-' + fx : ''}" src="${esc(q.media.url)}" alt="" style="${style}" referrerpolicy="no-referrer"></div>`;
  }
  if (q.media.kind === 'youtube' || q.media.kind === 'audio') return `<div class="center"><div class="eq" id="eq"><span></span><span></span><span></span><span></span><span></span></div><div class="muted" style="margin-top:6px">🎵 Blind test</div></div>`;
  return '';
}

/* ---------- Carte (Leaflet, fond de carte sans noms de lieux) ---------- */
const ZONE_BOUNDS = {
  monde: [[-56, -165], [74, 185]], europe: [[35, -11], [63, 38]], france: [[41.3, -5.2], [51.1, 9.6]],
  afrique: [[-35, -19], [37, 52]], asie: [[-8, 28], [56, 146]], ameriques: [[-55, -125], [62, -34]],
  paris: [[48.815, 2.225], [48.902, 2.47]],
};
const ZONE_LABELS = { monde: 'Monde', europe: 'Europe', france: 'France', afrique: 'Afrique', asie: 'Asie', ameriques: 'Amériques', paris: 'Paris' };

let _leaflet = null;
function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (_leaflet) return _leaflet;
  _leaflet = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    js.onload = () => resolve(window.L);
    js.onerror = () => { _leaflet = null; reject(new Error('Carte indisponible (réseau).')); };
    document.head.appendChild(js);
  });
  return _leaflet;
}

/** Crée une carte dans `el` cadrée sur la zone. opts.interactive = false pour l'écran public. */
function makeMap(el, zone, opts) {
  opts = opts || {};
  return loadLeaflet().then(L => {
    if (el._map) { el._map.remove(); el._map = null; }
    const i = opts.interactive !== false;
    const map = L.map(el, {
      zoomControl: i, dragging: i, touchZoom: i, scrollWheelZoom: i, doubleClickZoom: false, boxZoom: false, keyboard: false,
      worldCopyJump: true, zoomSnap: 0.25, attributionControl: true, tap: true,
    });
    // Fonds de carte sans aucun nom de lieu : relief jusqu'au zoom 8, puis photo satellite quand on zoome
    const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
    L.tileLayer(ESRI + 'World_Physical_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 8, attribution: 'Tiles © Esri — US National Park Service' }).addTo(map);
    L.tileLayer(ESRI + 'World_Imagery/MapServer/tile/{z}/{y}/{x}', { minZoom: 9, maxZoom: 19, attribution: 'Tiles © Esri — Esri, Maxar, Earthstar Geographics' }).addTo(map);
    map.fitBounds(ZONE_BOUNDS[zone] || ZONE_BOUNDS.monde, { padding: [4, 4] });
    el._map = map;
    loadBorders().then(b => { if (b && el._map === map) L.geoJSON(b, { style: { color: '#5b4a3a', weight: 1, opacity: .55 }, interactive: false }).addTo(map); }).catch(() => {});
    setTimeout(() => map.invalidateSize(), 150);
    return map;
  });
}

/** Frontières des pays (sans noms), dessinées par-dessus le relief. */
let _borders = null;
function loadBorders() {
  if (_borders) return _borders;
  const lib = window.topojson ? Promise.resolve() : new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  _borders = lib.then(() => fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json'))
    .then(r => r.json())
    .then(w => topojson.mesh(w, w.objects.countries, (x, y) => x !== y))
    .catch(() => { _borders = null; return null; });
  return _borders;
}

function pinIcon(label, cls) {
  return L.divIcon({ className: 'qpin ' + (cls || ''), html: `<span class="dotpin"></span>${label ? `<span class="lab">${esc(label)}</span>` : ''}`, iconSize: [18, 18], iconAnchor: [9, 9] });
}
function targetIcon(label) {
  return L.divIcon({ className: 'qpin target', html: `<span class="star">📍</span>${label ? `<span class="lab">${esc(label)}</span>` : ''}`, iconSize: [30, 30], iconAnchor: [15, 28] });
}

/** Réponse sur la carte : le bon endroit, les points des joueurs (reliés à la cible) et le cercle « plein score ». */
function drawMapReveal(map, target, pins, label) {
  if (!map || !target) return;
  const pts = [[target.lat, target.lon]];
  if (target.full) L.circle([target.lat, target.lon], { radius: target.full * 1000, color: '#2ecc71', weight: 1, fillOpacity: .12 }).addTo(map);
  (pins || []).forEach(p => {
    let lon = p.lon;
    while (lon - target.lon > 180) lon -= 360;
    while (target.lon - lon > 180) lon += 360;
    L.polyline([[p.lat, lon], [target.lat, target.lon]], { color: p.ok ? '#2ecc71' : '#ff4d5e', weight: 2, dashArray: '4 6', opacity: .8 }).addTo(map);
    L.marker([p.lat, lon], { icon: pinIcon(p.pseudo + (p.km !== undefined && p.km !== null ? ' · ' + fmtKm(p.km) : ''), p.ok ? 'ok' : 'ko') }).addTo(map);
    pts.push([p.lat, lon]);
  });
  L.marker([target.lat, target.lon], { icon: targetIcon(label), zIndexOffset: 1000 }).addTo(map);
  if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40], maxZoom: 9 });
  else map.setView([target.lat, target.lon], Math.max(map.getZoom(), 5));
}

function fmtKm(km) {
  if (km === null || km === undefined || isNaN(km)) return '';
  return km < 1 ? Math.round(km * 1000) + ' m' : km < 10 ? String(Math.round(km * 10) / 10).replace('.', ',') + ' km' : Math.round(km).toLocaleString('fr-FR') + ' km';
}

function newId() {
  const a = new Uint8Array(12);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return Array.from(a, b => ('0' + b.toString(16)).slice(-2)).join('');
}

function store(key, val) {
  try {
    if (val === undefined) return localStorage.getItem(key);
    if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, val);
  } catch (e) { return null; }
}
