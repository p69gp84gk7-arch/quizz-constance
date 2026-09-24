/**
 * Classements, catalogue des questions, création de questions et montages de parties.
 */

/* ------------------------------------------------------------------ */
/* Connexion du maître du jeu                                          */
/* ------------------------------------------------------------------ */

function adminLogin(pin) {
  checkPin_(pin);
  const cur = PropertiesService.getScriptProperties().getProperty('CURRENT_GAME');
  const st = cur ? getState_(cur) : null;
  return {
    url: ScriptApp.getService().getUrl(),
    catalog: adminCatalog_(),
    montages: listMontages_(),
    currentGame: st && st.status !== 'END' ? st.code : null,
  };
}

/** Thèmes → catégories, avec le nombre de questions actives par niveau. */
function adminCatalog_() {
  const sh = sheet_(SH.QUESTIONS);
  const n = sh ? sh.getLastRow() - 1 : 0;
  const out = { themes: {}, total: 0, withMedia: 0, photos: 0, cartes: 0, epoques: EPOQUES };
  if (n <= 0) return out;
  const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
  sh.getRange(2, 1, n, HEADERS.Questions.length).getValues().forEach(r => {
    if (!r[QC.TEXTE] || String(r[QC.ACTIF]).toLowerCase() === 'non') return;
    const th = String(r[QC.THEME] || 'Divers');
    const cat = String(r[QC.CAT] || '');
    const d = Math.max(1, Math.min(5, Number(r[QC.DIFF]) || 1));
    const era = String(r[QC.EPOQUE] || '');
    const type = String(r[QC.TYPE]).toUpperCase();
    const m = String(r[QC.MEDIA]).trim();
    const t = out.themes[th] = out.themes[th] || { count: 0, levels: [0, 0, 0, 0, 0], cats: {}, eras: {}, types: {}, dates: 0, erasDates: {}, photos: 0, sons: 0 };
    t.count++;
    t.levels[d - 1]++;
    inc(t.types, type);
    if (cat) inc(t.cats, cat);
    if (era) inc(t.eras, era);
    if (isDateQ_(r)) { t.dates++; if (era) inc(t.erasDates, era); }
    if (isImage_(m)) { t.photos++; out.photos++; }
    if (/youtu/.test(m)) t.sons++;
    if (type === 'CARTE') out.cartes++;
    out.total++;
    if (m) out.withMedia++;
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* Création de questions depuis l'interface                            */
/* ------------------------------------------------------------------ */

function adminAddQuestion(pin, q) {
  checkPin_(pin);
  q = q || {};
  const type = String(q.type || 'QCM').toUpperCase();
  if (TYPES.indexOf(type) < 0) throw new Error('Type inconnu.');
  if (!String(q.texte || '').trim()) throw new Error('La question est vide.');
  if (!String(q.rep || '').trim()) throw new Error('La réponse est vide.');
  if (type === 'QCM' && (!q.c2 || !q.c3)) throw new Error('Un QCM demande au moins 2 mauvaises réponses.');
  if (type === 'ESTIMATION' && isNaN(Number(String(q.rep).replace(',', '.').replace(/\s/g, '')))) throw new Error("La réponse d'une estimation doit être un nombre.");
  if (type === 'ORDRE' && String(q.rep).split('|').length < 3) throw new Error('Un « ORDRE » demande au moins 3 éléments séparés par |');
  if (type === 'CARTE') {
    const ll = String(q.rep).split(/[,;\s]+/).map(Number);
    if (ll.length !== 2 || isNaN(ll[0]) || isNaN(ll[1]) || Math.abs(ll[0]) > 90 || Math.abs(ll[1]) > 180) throw new Error('Touche la carte pour placer la bonne réponse.');
    if (!ZONES[String(q.c2 || '').toLowerCase()]) q.c2 = 'monde';
  }

  return withLock_(() => {
    const sh = sheet_(SH.QUESTIONS);
    let maxId = 0;
    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(r => {
        const n = parseInt(String(r[0]).replace(/\D/g, ''), 10);
        if (n > maxId) maxId = n;
      });
    }
    const id = nextId_(maxId + 1);
    q.type = type;
    sh.appendRow(questionRow_(id, q));
    return { id: id, catalog: adminCatalog_() };
  });
}

/* ------------------------------------------------------------------ */
/* Montages (modèles de parties en chapitres)                          */
/* ------------------------------------------------------------------ */

function listMontages_() {
  const sh = sheet_(SH.MONTAGES);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues()
    .filter(r => r[0])
    .map(r => { try { return { name: String(r[0]), desc: String(r[1]), settings: JSON.parse(r[2]) }; } catch (e) { return null; } })
    .filter(Boolean);
}

function adminSaveMontage(pin, name, desc, settings) {
  checkPin_(pin);
  name = String(name || '').trim().slice(0, 60);
  if (!name) throw new Error('Donne un nom au montage.');
  return withLock_(() => {
    const sh = sheet_(SH.MONTAGES);
    const json = JSON.stringify(normalizeSettings_(settings));
    const n = sh.getLastRow() - 1;
    const names = n > 0 ? sh.getRange(2, 1, n, 1).getValues().map(r => String(r[0])) : [];
    const i = names.indexOf(name);
    if (i >= 0) sh.getRange(i + 2, 1, 1, 4).setValues([[name, desc || '', json, new Date()]]);
    else sh.appendRow([name, desc || '', json, new Date()]);
    return listMontages_();
  });
}

function adminDeleteMontage(pin, name) {
  checkPin_(pin);
  return withLock_(() => {
    const sh = sheet_(SH.MONTAGES);
    const n = sh.getLastRow() - 1;
    if (n > 0) {
      const names = sh.getRange(2, 1, n, 1).getValues().map(r => String(r[0]));
      const i = names.indexOf(String(name));
      if (i >= 0) sh.deleteRow(i + 2);
    }
    return listMontages_();
  });
}

/* ------------------------------------------------------------------ */
/* Classements                                                         */
/* ------------------------------------------------------------------ */

function recalculerClassement() {
  const n = recalculerClassement_();
  SpreadsheetApp.getUi().alert('Classements recalculés ✅ (' + n + ' joueurs)');
}

/** Agrège l'onglet Réponses (et Parties pour les victoires) par pseudo et par thème. */
function computeLeaderboard_() {
  const rep = sheet_(SH.REPONSES);
  const par = sheet_(SH.PARTIES);
  const players = {};
  const themes = {};

  const n = rep.getLastRow() - 1;
  const rows = n > 0 ? rep.getRange(2, 1, n, HEADERS['Réponses'].length).getValues() : [];
  const perGame = {};
  rows.forEach(r => {
    const [date, game, , , , theme, , , pseudo, , correct, t, pts] = r;
    if (!pseudo) return;
    const key = String(pseudo).trim().toLowerCase();
    const p = players[key] = players[key] || { pseudo: String(pseudo).trim(), games: {}, wins: 0, points: 0, good: 0, n: 0, time: 0, best: 0, last: null, themes: {} };
    p.pseudo = String(pseudo).trim();
    p.games[game] = true;
    const ok = correct === true || String(correct).toUpperCase() === 'TRUE' || correct === 'VRAI';
    p.points += Number(pts) || 0;
    p.n++;
    if (ok) { p.good++; p.time += Number(t) || 0; }
    if (!p.last || date > p.last) p.last = date;
    const th = String(theme || 'Divers');
    themes[th] = true;
    const pt = p.themes[th] = p.themes[th] || { points: 0, good: 0, n: 0 };
    pt.points += Number(pts) || 0;
    pt.n++;
    if (ok) pt.good++;
    const g = game + '|' + key;
    perGame[g] = (perGame[g] || 0) + (Number(pts) || 0);
  });

  Object.keys(perGame).forEach(g => {
    const key = g.split('|')[1];
    if (players[key] && perGame[g] > players[key].best) players[key].best = perGame[g];
  });

  const pn = par.getLastRow() - 1;
  if (pn > 0) {
    par.getRange(2, 8, pn, 1).getValues().forEach(r => {
      const key = String(r[0]).trim().toLowerCase();
      if (players[key]) players[key].wins++;
    });
  }

  const list = Object.keys(players).map(k => {
    const p = players[k];
    return {
      pseudo: p.pseudo, games: Object.keys(p.games).length, wins: p.wins, points: p.points, good: p.good, n: p.n,
      pct: p.n ? Math.round(1000 * p.good / p.n) / 10 : 0, best: p.best,
      avgTime: p.good ? Math.round(10 * p.time / p.good) / 10 : null, last: p.last, themes: p.themes,
    };
  }).sort((a, b) => b.points - a.points || b.pct - a.pct || a.pseudo.localeCompare(b.pseudo));
  list.forEach((p, i) => { p.rank = i + 1; });
  return { players: list, themes: Object.keys(themes).sort() };
}

function recalculerClassement_() {
  const lb = computeLeaderboard_();

  const sh = sheet_(SH.CLASSEMENT);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  const rows = lb.players.map(p => [p.rank, p.pseudo, p.games, p.wins, p.points, p.good, p.n, p.pct / 100, p.best, p.avgTime === null ? '' : p.avgTime, p.last || '']);
  if (rows.length) {
    sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
    sh.getRange(2, 8, rows.length, 1).setNumberFormat('0.0%');
    sh.getRange(2, 11, rows.length, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  }

  // Classement par thème : une colonne « points » et une colonne « % » par thème
  const pt = sheet_(SH.PAR_THEME);
  pt.clear();
  const head = ['Pseudo'];
  lb.themes.forEach(t => { head.push(t + ' — points'); head.push(t + ' — %'); });
  pt.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1f2a5c').setFontColor('#ffffff');
  pt.setFrozenRows(1);
  pt.setFrozenColumns(1);
  const trows = lb.players.map(p => {
    const r = [p.pseudo];
    lb.themes.forEach(t => {
      const x = p.themes[t];
      r.push(x ? x.points : '');
      r.push(x && x.n ? x.good / x.n : '');
    });
    return r;
  });
  if (trows.length) {
    pt.getRange(2, 1, trows.length, head.length).setValues(trows);
    lb.themes.forEach((t, i) => pt.getRange(2, 3 + i * 2, trows.length, 1).setNumberFormat('0%'));
  }
  return lb.players.length;
}

/** Classement général + détail par thème, pour l'interface du maître du jeu. */
function adminLeaderboard(pin) {
  checkPin_(pin);
  const lb = computeLeaderboard_();
  lb.players.forEach(p => { p.last = p.last ? Utilities.formatDate(new Date(p.last), Session.getScriptTimeZone(), 'dd/MM/yyyy') : ''; });
  return lb;
}
