/* ================== Maître du jeu : préparation, questions, classement ================== */

const ALL_TYPES = ['QCM', 'VF', 'ESTIMATION', 'ORDRE', 'CARTE'];

function defaultChapter(name, nb, level, extra) {
  const c = Object.assign({ name: name, themes: [], cats: [], eras: [], types: ALL_TYPES.slice(),
    media: 'tous', nb: nb, level: level, autoName: true }, extra || {});
  c.name = chapterAutoName(c) || name;
  return c;
}

/**
 * Nom du chapitre déduit de ce qui a été coché : le maître du jeu n'a plus à
 * inventer un titre. Dès qu'il en écrit un lui-même, on n'y touche plus.
 */
function chapterAutoName(c) {
  const bouts = [];
  if (c.themes.length === 1) bouts.push(c.themes[0]);
  else if (c.themes.length === 2) bouts.push(c.themes.join(' & '));
  else if (c.themes.length > 2) bouts.push('Mélange de ' + c.themes.length + ' thèmes');

  if (c.cats.length === 1) bouts.push(c.cats[0]);
  else if (c.cats.length > 1 && c.cats.length <= 3) bouts.push(c.cats.join(', '));
  else if (c.cats.length > 3) bouts.push(c.cats.length + ' catégories');

  if (c.eras.length === 1) bouts.push(c.eras[0]);
  else if (c.eras.length > 1) bouts.push(c.eras.length + ' époques');

  if (c.ids && c.ids.length) bouts.push(c.ids.length + ' extraits choisis');
  if (c.regles && c.regles.duration) bouts.push(c.regles.duration + ' s');
  if (c.dates) bouts.push('📅 Dates');
  if (c.media === 'photo') bouts.push('📸 Photos');
  else if (c.media === 'son') bouts.push('🎧 Extraits');
  else if (c.media === 'sans') bouts.push('sans média');

  const t = c.types || [];
  if (t.length === 1) bouts.push(typeLabel(t[0]));
  else if (t.length && t.length < ALL_TYPES.length) bouts.push(t.map(typeLabel).join(' / '));

  return bouts.length ? bouts.join(' · ').slice(0, 60) : 'Culture générale';
}

/** Recalcule les noms automatiques de tous les chapitres. */
function refreshChapterNames(d) {
  d.chapters.forEach(c => { if (c.autoName !== false) c.name = chapterAutoName(c); });
}

function defaultDraft() {
  return {
    title: 'Quizz', duration: 30, maxPlayers: 15, points: 'rapidite', estimation: 'marge', margePct: 10,
    chrono: 'auto', autoReveal: true, visual: 'plateau', sounds: true, audioOn: 'ecran', choix: 'adaptatifs',
    estimQcm: 'auto', saisie: 'auto', saisieNiveau: 4,
    format: 'classique', lives: 3, teams: 2, bonus: false, finale: false, joker: true,
    chapters: [defaultChapter('Culture générale', 15, 1)],
  };
}
const withFmt = (o, x) => Object.assign(defaultDraft(), x, o);

const PRESETS = {
  'Classique · 15 questions': () => defaultDraft(),
  'Express · 10 questions / 20 s': () => Object.assign(defaultDraft(), { duration: 20, chrono: 'auto', chapters: [defaultChapter('Express', 10, 2)] }),
  'Soirée en 3 chapitres': () => Object.assign(defaultDraft(), { chapters: [
    defaultChapter('Échauffement', 5, 1),
    defaultChapter('Cinéma', 5, 2, { themes: ['Cinéma'] }),
    defaultChapter('Grand final', 5, 3),
  ] }),
  'Blind test musique': () => Object.assign(defaultDraft(), { chapters: [defaultChapter('Blind test musique', 10, 1, { themes: ['Blind test musique'] })] }),
  'Blind test cinéma': () => Object.assign(defaultDraft(), { chapters: [defaultChapter('Blind test cinéma', 10, 1, { themes: ['Blind test cinéma'] })] }),
  'Soirée blind test': () => Object.assign(defaultDraft(), { chapters: [
    defaultChapter('Blind test musique', 6, 1, { themes: ['Blind test musique'] }),
    defaultChapter('Blind test cinéma', 6, 1, { themes: ['Blind test cinéma'] }),
  ] }),
  '⚔️ Face à face': () => withFmt({ format: 'face', points: 'rapidite', duration: 20, chapters: [defaultChapter('Face à face', 16, 2)] }),
  '💀 Survie': () => withFmt({ format: 'survie', lives: 3, duration: 20, chapters: [defaultChapter('Survie', 30, 1)] }),
  '👥 Équipes': () => withFmt({ format: 'equipes', teams: 2, chapters: [
    defaultChapter('Manche 1', 8, 1), defaultChapter('Manche 2 · Blind test', 6, 1, { themes: ['Blind test musique', 'Blind test cinéma'] }), defaultChapter('Manche 3', 6, 3)] }),
  '⚡ Le plus rapide': () => withFmt({ format: 'buzzer', duration: 15, chapters: [defaultChapter('Le plus rapide', 15, 2)] }),
  '🌍 Tour du monde (cartes)': () => withFmt({ duration: 25, chapters: [defaultChapter('Tour du monde', 12, 1, { types: ['CARTE'] })] }),
  '📸 Que des photos': () => withFmt({ chapters: [defaultChapter('Photos', 15, 1, { media: 'photo' })] }),
  '🤪 Insolite': () => withFmt({ chapters: [defaultChapter('Insolite', 12, 1, { themes: ['Insolite'] })] }),
  '📰 Actualité': () => withFmt({ chapters: [defaultChapter('Actualité', 12, 1, { themes: ['Actualité'] })] }),
  '🎰 Grand jeu surprise': () => withFmt({ bonus: true, finale: true, joker: true, chapters: [
    defaultChapter('Mise en jambes', 5, 1),
    defaultChapter('📸 Photos', 4, 2, { media: 'photo' }),
    defaultChapter('📍 Cartes', 3, 2, { types: ['CARTE'] }),
    defaultChapter('🎧 Blind test', 4, 2, { themes: ['Blind test musique', 'Blind test cinéma'] }),
    defaultChapter('🤪 Insolite', 3, 3, { themes: ['Insolite'] }),
    defaultChapter('Grande finale', 3, 4)] }),
};

A.draft = (() => { try { return JSON.parse(store('qc_draft')) || defaultDraft(); } catch (e) { return defaultDraft(); } })();
A.draft.chrono = 'auto'; // ancien réglage « chrono manuel » supprimé
A.draft.choix = A.draft.choix || 'adaptatifs';
A.draft.estimQcm = A.draft.estimQcm || 'auto';
A.draft.saisie = A.draft.saisie || 'auto';
A.draft.saisieNiveau = A.draft.saisieNiveau || 4;
A.draft.chapters.forEach(c => {
  c.eras = c.eras || [];
  if (c.types && c.types.length === 4 && c.types.indexOf('CARTE') < 0) c.types = ALL_TYPES.slice(); // ancien brouillon « tous les types »
});
['format', 'lives', 'teams', 'bonus', 'finale', 'joker'].forEach(k => { if (A.draft[k] === undefined) A.draft[k] = defaultDraft()[k]; });
function saveDraft() { store('qc_draft', JSON.stringify(A.draft)); }

/* ---------------- Préparer une partie ---------------- */

function themeNames() { return Object.keys((A.catalog && A.catalog.themes) || {}).sort(); }

function available(ch) {
  const th = A.catalog ? A.catalog.themes : {};
  const names = ch.themes.length ? ch.themes : Object.keys(th);
  let n = 0;
  names.forEach(t => {
    if (!th[t]) return;
    const x = th[t];
    let k = x.count;
    if (ch.cats.length) k = ch.cats.reduce((a, c) => a + (x.cats[c] || 0), 0);
    if (ch.eras && ch.eras.length) k = Math.min(k, ch.eras.reduce((a, e) => a + ((ch.dates ? x.erasDates : x.eras) || {})[e] || 0, 0));
    else if (ch.dates) k = Math.min(k, x.dates || 0);
    if (ch.types && ch.types.length < ALL_TYPES.length && x.types) k = Math.min(k, ch.types.reduce((a, ty) => a + (x.types[ty] || 0), 0));
    if (ch.media === 'photo') k = Math.min(k, x.photos || 0);
    if (ch.media === 'son') k = Math.min(k, x.sons || 0);
    if (ch.media === 'avec') k = Math.min(k, (x.photos || 0) + (x.sons || 0));
    if (ch.media === 'sans') k = Math.min(k, x.count - (x.photos || 0) - (x.sons || 0));
    n += k;
  });
  return n;
}

function renderPreparer() {
  const d = A.draft;
  const root = $('#tab-preparer');
  const total = d.chapters.reduce((a, c) => a + Number(c.nb || 0), 0);
  const opt = (val, cur, label) => `<option value="${val}" ${String(val) === String(cur) ? 'selected' : ''}>${label}</option>`;

  root.innerHTML = `
  <div class="col">
    <div class="card row">
      <b>Modèles :</b>
      ${Object.keys(PRESETS).map(p => `<button class="btn small" data-preset="${esc(p)}">${esc(p)}</button>`).join('')}
      <span class="spacer"></span>
      <select id="mont" style="width:auto"><option value="">— Mes montages (${A.montages.length}) —</option>${A.montages.map((m, i) => `<option value="${i}">${esc(m.name)}</option>`).join('')}</select>
      <button class="btn small" id="montLoad">Charger</button>
      <button class="btn small" id="montDel">Supprimer</button>
      <button class="btn small" id="montSave">💾 Enregistrer ce montage</button>
    </div>

    ${yearsCard()}

    <div class="card row">
      <b>🎲 Quiz aléatoire :</b>
      <select id="rnd-nb" style="width:auto">${[10, 15, 20, 25, 30].map(n => `<option value="${n}" ${n === (A.rnd.nb || 15) ? 'selected' : ''}>${n} questions</option>`).join('')}</select>
      <select id="rnd-mode" style="width:auto">
        <option value="chapitres" ${A.rnd.mode !== 'melange' ? 'selected' : ''}>en chapitres (thèmes tirés au sort)</option>
        <option value="melange" ${A.rnd.mode === 'melange' ? 'selected' : ''}>tout mélangé</option></select>
      <label class="switch"><input type="checkbox" id="rnd-bt" ${A.rnd.bt !== false ? 'checked' : ''}> avec blind tests</label>
      <label class="switch"><input type="checkbox" id="rnd-era" ${A.rnd.era ? 'checked' : ''}> époques au hasard</label>
      <span class="spacer"></span>
      <button class="btn small" id="rnd-go">🎲 Générer</button>
      <button class="btn small primary" id="rnd-play">🎲 Générer et créer la partie</button>
    </div>

    <div class="card col">
      <h2>⚙️ Réglages de la partie</h2>
      <div class="grid2">
        <div><label class="lbl">Titre affiché</label><input type="text" data-k="title" value="${esc(d.title)}"></div>
        <div><label class="lbl">Temps par question (s)</label><input type="number" min="10" max="120" data-k="duration" value="${d.duration}"></div>
        <div><label class="lbl">Joueurs maximum (2 à 15)</label><input type="number" min="2" max="15" data-k="maxPlayers" value="${d.maxPlayers}"></div>
        <div><label class="lbl">Système de points</label><select data-k="points">
          ${opt('rapidite', d.points, 'Points + bonus de rapidité')}${opt('series', d.points, 'Rapidité + bonus de séries')}${opt('simple', d.points, '1 point par bonne réponse')}</select></div>
        <div><label class="lbl">Questions d'estimation</label><select data-k="estimation" data-rerender>
          ${opt('marge', d.estimation, 'Juste si dans la marge')}${opt('proche', d.estimation, 'Seul le plus proche gagne')}</select></div>
        ${d.estimation === 'marge' ? `<div><label class="lbl">Marge par défaut (%)</label><input type="number" min="1" max="50" data-k="margePct" value="${d.margePct}"></div>` : ''}
        <div><label class="lbl">Propositions de réponse</label><select data-k="choix">
          ${opt('adaptatifs', d.choix, 'Tirées au sort selon la difficulté')}${opt('fixes', d.choix, 'Toujours celles du Sheet')}</select></div>
        <div><label class="lbl">Estimations (années, nombres…)</label><select data-k="estimQcm">
          ${opt('auto', d.estimQcm, 'Selon la difficulté : QCM puis valeur exacte')}${opt('mixte', d.estimQcm, 'Mélange : libre ou QCM')}${opt('qcm', d.estimQcm, 'Toujours en QCM')}${opt('libre', d.estimQcm, 'Toujours en réponse libre')}</select></div>
        <div><label class="lbl">Réponse tapée au clavier</label><select data-k="saisie">
          ${opt('auto', d.saisie, 'Selon la difficulté (recommandé)')}${opt('jamais', d.saisie, 'Jamais : toujours 4 propositions')}${opt('toujours', d.saisie, 'Toujours taper la réponse')}</select>
          <div class="muted" style="font-size:12px">En mode automatique, les propositions disparaissent à partir du niveau
            <select data-k="saisieNiveau" style="width:auto;display:inline-block">${[2, 3, 4, 5].map(n => `<option value="${n}" ${d.saisieNiveau == n ? 'selected' : ''}>${'★'.repeat(n)}</option>`).join('')}</select>
            : il faut alors écrire la réponse. Les accents et une faute de frappe sont pardonnés.</div></div>
        <div><label class="lbl">Son du blind test</label><select data-k="audioOn">
          ${opt('ecran', d.audioOn, 'Sur l\'écran public')}${opt('admin', d.audioOn, 'Sur mon appareil')}${opt('joueurs', d.audioOn, 'Sur les téléphones des joueurs')}${opt('tous', d.audioOn, 'Partout à la fois')}</select>
          ${d.audioOn === 'joueurs' || d.audioOn === 'tous' ? '<div class="muted" style="font-size:12px">Chaque joueur devra toucher « 🔊 Activer le son » en arrivant : les téléphones interdisent de lancer un son sans geste de leur part. Prévenez-les d\'utiliser des écouteurs, sinon les extraits se chevauchent d\'un téléphone à l\'autre.</div>' : ''}</div>
        <div><label class="lbl">Ambiance</label><select data-k="visual">${Object.keys(VISUALS).map(k => opt(k, d.visual, VISUALS[k])).join('')}</select></div>
        <div class="col" style="gap:6px;justify-content:flex-end">
          <label class="switch"><input type="checkbox" data-k="sounds" ${d.sounds ? 'checked' : ''}> Sons (bonne/mauvaise réponse)</label>
          <label class="switch"><input type="checkbox" data-k="autoReveal" ${d.autoReveal ? 'checked' : ''}> Révéler à la fin du chrono</label>
        </div>
      </div>
      <h3 style="margin:8px 0 0">🎮 Format de jeu</h3>
      <div class="grid2">
        <div><label class="lbl">Format</label><select data-k="format" data-rerender>
          ${opt('classique', d.format, 'Classique : tout le monde joue')}${opt('face', d.format, '⚔️ Face à face : un duel par question')}${opt('survie', d.format, '💀 Survie : des vies, le dernier gagne')}
          ${opt('equipes', d.format, '👥 Équipes')}${opt('buzzer', d.format, '⚡ Le plus rapide : seul le 1er marque')}</select></div>
        ${d.format === 'survie' ? `<div><label class="lbl">Vies par joueur</label><select data-k="lives">${[1, 2, 3, 4, 5].map(n => opt(n, d.lives, '❤️'.repeat(n))).join('')}</select></div>` : ''}
        ${d.format === 'equipes' ? `<div><label class="lbl">Nombre d'équipes</label><select data-k="teams">${[2, 3, 4].map(n => opt(n, d.teams, n + ' équipes')).join('')}</select></div>` : ''}
        <div class="col" style="gap:6px;justify-content:flex-end">
          <label class="switch"><input type="checkbox" data-k="joker" ${d.joker ? 'checked' : ''}> 🃏 Un joker 50/50 par joueur</label>
          <label class="switch"><input type="checkbox" data-k="bonus" ${d.bonus ? 'checked' : ''}> ⭐ Questions en or (×2) au hasard</label>
          <label class="switch"><input type="checkbox" data-k="finale" ${d.finale ? 'checked' : ''}> 🏁 Dernière question ×3</label>
        </div>
      </div>
      <p class="muted" style="margin:0;font-size:13px">${{
        classique: 'Tout le monde répond à toutes les questions.',
        face: 'À chaque question, deux joueurs sont tirés (chacun son tour) : le plus rapide à trouver marque. Les autres répondent pour le fun, sans points.',
        survie: 'Une mauvaise réponse (ou pas de réponse) coûte une vie. Si tous les survivants se trompent, personne ne perd de vie. Le dernier en vie gagne : prévois beaucoup de questions.',
        equipes: 'Les joueurs sont répartis au hasard (tu peux refaire le tirage dans la salle d\'attente). Points d\'équipe = moyenne de ses joueurs.',
        buzzer: 'Seul le joueur le plus rapide à donner la bonne réponse marque des points.',
      }[d.format]}</p>
    </div>

    <div class="row"><h2 style="margin:0">📖 Chapitres</h2></div>
    <p class="muted" style="margin:0 0 6px">Un chapitre = un paquet de questions avec ses propres règles de tirage.
      <b>Cochez simplement les thèmes qui vous intéressent : le titre du chapitre s'écrit tout seul.</b>
      La difficulté part du niveau indiqué, monte quand les joueurs répondent juste, et ne redescend jamais.</p>
    ${d.chapters.map((c, i) => chapterCard(c, i)).join('')}
    <div class="row">
      <button class="btn" id="addCh">➕ Ajouter un chapitre</button>
      <span class="spacer"></span>
      <span class="pill">Total : <b>${total}</b> questions · ${d.chapters.length} chapitre${d.chapters.length > 1 ? 's' : ''}</span>
      <button class="btn primary big" id="create">▶ Créer la partie</button>
    </div>
  </div>`;
  bindPreparer();
}

function chapterCard(c, i) {
  const th = A.catalog ? A.catalog.themes : {};
  const cats = {};
  (c.themes.length ? c.themes : []).forEach(t => Object.keys((th[t] || {}).cats || {}).forEach(k => { cats[k] = true; }));
  // Époques présentes dans les thèmes choisis (ou dans tout le catalogue si aucun thème n'est choisi)
  const eraCount = {};
  (c.themes.length ? c.themes : Object.keys(th)).forEach(t => Object.keys((th[t] || {}).eras || {}).forEach(e => { eraCount[e] = (eraCount[e] || 0) + th[t].eras[e]; }));
  const eras = (A.catalog.epoques || []).filter(e => eraCount[e]);
  const avail = available(c);
  return `<div class="card col chapter" data-ch="${i}">
    <div class="row">
      <b style="font-size:18px">${i + 1}.</b>
      <input type="text" class="grow" data-ck="name" value="${esc(c.name)}" style="max-width:320px;font-weight:700"
        title="${c.autoName === false ? 'Nom choisi par toi' : 'Nom automatique : il suit tes cases cochées'}">
      ${c.autoName === false
        ? '<button class="btn small" data-autoname title="Revenir au nom automatique">↺ auto</button>'
        : '<span class="muted" style="font-size:12px">nom automatique</span>'}
      <label>Questions <input type="number" min="1" max="50" data-ck="nb" value="${c.nb}" style="width:80px"></label>
      <label>Départ <select data-ck="level" style="width:auto">${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n == c.level ? 'selected' : ''}>${'★'.repeat(n)}</option>`).join('')}</select></label>
      <span class="spacer"></span>
      <button class="btn small" data-mv="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="btn small" data-mv="1" ${i === A.draft.chapters.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="btn small" data-del ${A.draft.chapters.length === 1 ? 'disabled' : ''}>✕</button>
    </div>
    <div><label class="lbl">Thèmes (aucun sélectionné = tous)</label>
      ${themeNames().map(t => `<button class="chip ${c.themes.indexOf(t) >= 0 ? 'on' : ''}" data-theme="${esc(t)}">${esc(t)} <span style="opacity:.6">${th[t].count}</span></button>`).join('')}</div>
    ${Object.keys(cats).length ? `<div><label class="lbl">Catégories (aucune = toutes)</label>
      ${Object.keys(cats).sort().map(k => `<button class="chip ${c.cats.indexOf(k) >= 0 ? 'on' : ''}" data-cat="${esc(k)}">${esc(k)}</button>`).join('')}</div>` : ''}
    ${eras.length ? `<div><label class="lbl">Époques (aucune = toutes)</label>
      ${eras.map(e => `<button class="chip ${c.eras.indexOf(e) >= 0 ? 'on' : ''}" data-era="${esc(e)}">${esc(e)} <span style="opacity:.6">${eraCount[e]}</span></button>`).join('')}</div>` : ''}
    <div class="row">
      <span class="lbl" style="margin:0">Types :</span>
      ${ALL_TYPES.map(t => `<button class="chip ${c.types.indexOf(t) >= 0 ? 'on' : ''}" data-type="${t}">${typeLabel(t)}</button>`).join('')}
      <span class="lbl" style="margin:0 0 0 12px">Médias :</span>
      <select data-ck="media" style="width:auto">
        <option value="tous" ${c.media === 'tous' ? 'selected' : ''}>Toutes les questions</option>
        <option value="photo" ${c.media === 'photo' ? 'selected' : ''}>📸 Seulement des photos</option>
        <option value="son" ${c.media === 'son' ? 'selected' : ''}>🎧 Seulement des extraits (blind test)</option>
        <option value="avec" ${c.media === 'avec' ? 'selected' : ''}>Photos et extraits</option>
        <option value="sans" ${c.media === 'sans' ? 'selected' : ''}>Sans média</option></select>
      <button class="chip ${c.dates ? 'on' : ''}" data-dates>📅 Questions de dates</button>
      <button class="btn small" data-extraits>🎧 Choisir les extraits${c.ids && c.ids.length ? ' (' + c.ids.length + ')' : ''}</button>
      <span class="spacer"></span>
      <span class="pill" style="${avail < c.nb ? 'background:var(--ko);color:#fff' : ''}">≈ ${avail} disponibles</span>
    </div>
    ${reglesChapitre(c, i)}
  </div>`;
}

/**
 * Règles propres au chapitre. Tout ce qui reste sur « comme la partie » suit les
 * réglages généraux : le maître du jeu ne remplit que ce qu'il veut changer.
 */
function reglesChapitre(c, i) {
  const r = c.regles || {};
  const n = Object.keys(r).length;
  const sel = (cle, libelles) => `<select data-cr="${cle}" style="width:auto">
    <option value="">comme la partie</option>
    ${Object.keys(libelles).map(k => {
      const val = typeof r[cle] === 'boolean' ? (r[cle] ? 'oui' : 'non') : String(r[cle]);
      return `<option value="${k}" ${val === k ? 'selected' : ''}>${libelles[k]}</option>`;
    }).join('')}</select>`;
  const durees = {};
  [10, 15, 20, 25, 30, 45, 60, 90].forEach(d => { durees[d] = d + ' s'; });
  const niveaux = { 2: '★★', 3: '★★★', 4: '★★★★', 5: '★★★★★' };
  return `<details class="settings-card" ${n ? 'open' : ''}>
    <summary class="lbl" style="cursor:pointer">⚙️ Règles de ce chapitre${n ? ` <span class="pill accent">${n} réglage${n > 1 ? 's' : ''}</span>` : ' <span class="muted">(identiques à la partie)</span>'}</summary>
    <div class="grid2" style="margin-top:8px">
      <label>Chrono ${sel('duration', durees)}</label>
      <label>Points ${sel('points', { simple: '1 point', rapidite: 'rapidité', series: 'séries' })}</label>
      <label>Réponse tapée ${sel('saisie', { auto: 'selon la difficulté', jamais: 'jamais', toujours: 'toujours' })}</label>
      <label>À partir du niveau ${sel('saisieNiveau', niveaux)}</label>
      <label>Estimations ${sel('estimQcm', { auto: 'selon la difficulté', mixte: 'mélange', qcm: 'en QCM', libre: 'réponse libre' })}</label>
      <label>Joker 50/50 ${sel('joker', { oui: 'autorisé', non: 'interdit' })}</label>
      <label>Questions en or ${sel('bonus', { oui: 'oui', non: 'non' })}</label>
      <label>Révélation ${sel('autoReveal', { oui: 'automatique', non: 'à la main' })}</label>
    </div>
    ${n ? `<div class="row"><button class="btn small" data-creset>↺ Tout remettre comme la partie</button></div>` : ''}
  </details>`;
}

function bindPreparer() {
  const d = A.draft;
  const root = $('#tab-preparer');
  const rerender = () => { refreshChapterNames(d); saveDraft(); renderPreparer(); };

  root.querySelectorAll('[data-k]').forEach(el => {
    const k = el.dataset.k;
    const ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'onchange' : 'oninput';
    el[ev] = () => {
      d[k] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? Number(el.value) : el.value);
      if (k === 'visual') applyVisual(el.value);
      if (el.hasAttribute('data-rerender')) rerender(); else saveDraft();
    };
  });

  root.querySelectorAll('[data-ch]').forEach(card => {
    const i = Number(card.dataset.ch);
    const c = d.chapters[i];
    card.querySelectorAll('[data-ck]').forEach(el => {
      const k = el.dataset.ck;
      el[el.tagName === 'SELECT' ? 'onchange' : 'oninput'] = () => {
        c[k] = el.type === 'number' || k === 'level' ? Number(el.value) : el.value;
        if (k === 'name') c.autoName = false;   // le maître du jeu a choisi son titre
        saveDraft();
        if (k === 'media' || k === 'nb') rerender();
      };
    });
    const toggle = (arr, v) => { const j = arr.indexOf(v); if (j >= 0) arr.splice(j, 1); else arr.push(v); };
    card.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => {
      toggle(c.themes, b.dataset.theme);
      c.cats = [];
      rerender();
    });
    card.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { toggle(c.cats, b.dataset.cat); rerender(); });
    card.querySelectorAll('[data-era]').forEach(b => b.onclick = () => { toggle(c.eras, b.dataset.era); rerender(); });
    const dt = card.querySelector('[data-dates]');
    if (dt) dt.onclick = () => { c.dates = !c.dates; rerender(); };
    card.querySelectorAll('[data-cr]').forEach(el => el.onchange = () => {
      const k = el.dataset.cr;
      c.regles = c.regles || {};
      const v = el.value;
      if (v === '') delete c.regles[k];
      else if (k === 'joker' || k === 'bonus' || k === 'autoReveal') c.regles[k] = v === 'oui';
      else if (k === 'duration' || k === 'saisieNiveau') c.regles[k] = Number(v);
      else c.regles[k] = v;
      rerender();
    });
    const cz = card.querySelector('[data-creset]');
    if (cz) cz.onclick = () => { c.regles = {}; rerender(); };
    const an = card.querySelector('[data-autoname]');
    if (an) an.onclick = () => { c.autoName = true; rerender(); };
    const ex = card.querySelector('[data-extraits]');
    if (ex) ex.onclick = () => choisirExtraits(c, rerender);
    card.querySelectorAll('[data-type]').forEach(b => b.onclick = () => {
      toggle(c.types, b.dataset.type);
      if (!c.types.length) c.types = ALL_TYPES.slice();
      rerender();
    });
    card.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => {
      const j = i + Number(b.dataset.mv);
      [d.chapters[i], d.chapters[j]] = [d.chapters[j], d.chapters[i]];
      rerender();
    });
    const del = card.querySelector('[data-del]');
    if (del) del.onclick = () => { d.chapters.splice(i, 1); rerender(); };
  });

  const readRnd = () => { A.rnd = { nb: Number($('#rnd-nb').value), mode: $('#rnd-mode').value, bt: $('#rnd-bt').checked, era: $('#rnd-era').checked }; };
  $('#rnd-go').onclick = () => { readRnd(); randomQuiz(); rerender(); toast('🎲 Quiz généré : ajuste si besoin, puis « Créer la partie ».'); };
  $('#rnd-play').onclick = () => { readRnd(); randomQuiz(); rerender(); $('#create').click(); };

  bindYears(rerender);

  $('#addCh').onclick = () => { d.chapters.push(defaultChapter('Chapitre ' + (d.chapters.length + 1), 5, 1)); rerender(); };

  root.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
    const keepVisual = d.visual;
    A.draft = PRESETS[b.dataset.preset]();
    A.draft.visual = keepVisual;
    rerender();
  });

  $('#montLoad').onclick = () => {
    const i = $('#mont').value;
    if (i === '') return toast('Choisis un montage.', true);
    A.draft = JSON.parse(JSON.stringify(A.montages[i].settings));
    applyVisual(A.draft.visual);
    rerender();
    toast('Montage « ' + A.montages[i].name + ' » chargé');
  };
  $('#montDel').onclick = () => {
    const i = $('#mont').value;
    if (i === '' || !confirm('Supprimer le montage « ' + A.montages[i].name + ' » ?')) return;
    rpc('adminDeleteMontage', { nom: A.montages[i].name }).then(reloadMontages).then(renderPreparer).catch(e => toast(e, true));
  };
  $('#montSave').onclick = () => {
    const name = prompt('Nom du montage :', d.title);
    if (!name) return;
    const desc = d.chapters.map(c => c.name + ' (' + c.nb + ')').join(' · ');
    rpc('adminSaveMontage', { nom: name, description: desc, config: d }).then(reloadMontages)
      .then(() => { renderPreparer(); toast('Montage enregistré ✔'); }).catch(e => toast(e, true));
  };

  $('#create').onclick = () => {
    if (A.code && A.view && A.view.status !== 'END' && !confirm('Une partie est déjà en cours (' + A.code + '). En créer une nouvelle ?')) return;
    const btn = $('#create');
    btn.disabled = true; btn.textContent = 'Création…';
    rpc('adminCreateGame', { settings: d }).then(v => {
      A.code = v.code; A.key = ''; A.presence = {};
      showTab('partie');
      onView(v);
      startPolling();
    }).catch(e => toast(e, true)).finally(() => { btn.disabled = false; btn.textContent = '▶ Créer la partie'; });
  };
}

/* ---------------- Choisir les extraits d'un blind test ---------------- */

A.blind = null;      // liste chargée une fois par session
A.blindFiltre = { texte: '', theme: '', cat: '' };

/**
 * Ouvre la liste des extraits : le maître du jeu écoute, coche ce qu'il garde,
 * et voit lesquels sont déjà passés. Rien n'est coché = le tirage habituel.
 */
function choisirExtraits(c, apres) {
  const m = modal('<h2>🎧 Extraits du blind test</h2><p class="muted">Chargement de la liste…</p>');
  const dessine = () => {
    const sel = new Set(c.ids || []);
    const f = A.blindFiltre;
    const themes = Array.from(new Set(A.blind.map(x => x.theme))).sort();
    const cats = Array.from(new Set(A.blind.filter(x => !f.theme || x.theme === f.theme).map(x => x.cat).filter(Boolean))).sort();
    const mots = f.texte.trim().toLowerCase();
    const vus = A.blind.filter(x =>
      (!f.theme || x.theme === f.theme) && (!f.cat || x.cat === f.cat) &&
      (!mots || (x.reponse + ' ' + x.cat + ' ' + x.epoque).toLowerCase().indexOf(mots) >= 0));

    const jours = d => {
      if (!d) return '—';
      const n = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
      return n <= 0 ? "aujourd'hui" : n === 1 ? 'hier' : 'il y a ' + n + ' j';
    };

    m.querySelector('.modal').innerHTML = `
      <h2>🎧 Extraits du blind test</h2>
      <p class="muted" style="margin:0">Cochez ce que vous voulez entendre pendant la partie.
        Rien de coché = tirage automatique dans tout le thème.
        <b>▶</b> ouvre l'extrait sur YouTube au bon moment pour le vérifier.</p>
      <div class="row">
        <input type="text" id="bf-texte" placeholder="Rechercher un artiste, un titre…" value="${esc(f.texte)}" class="grow">
        <select id="bf-theme" style="width:auto"><option value="">Tous les thèmes</option>${themes.map(t => `<option ${f.theme === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
        <select id="bf-cat" style="width:auto"><option value="">Toutes les catégories</option>${cats.map(t => `<option ${f.cat === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
      </div>
      <div class="row">
        <span class="pill">${sel.size} choisi${sel.size > 1 ? 's' : ''} · ${vus.length} affiché${vus.length > 1 ? 's' : ''}</span>
        <button class="btn small" id="bf-all">Tout cocher (affichés)</button>
        <button class="btn small" id="bf-none">Tout décocher</button>
        <button class="btn small" id="bf-jamais">Cocher ceux jamais joués</button>
        <span class="spacer"></span>
        <button class="btn primary" id="bf-ok">Valider</button>
      </div>
      <div style="max-height:52vh;overflow:auto">
        <table class="tbl"><thead><tr><th></th><th>Réponse</th><th>Catégorie</th><th class="num">Niveau</th>
          <th class="num">Joué</th><th>Dernière fois</th><th class="num">Réussite</th><th></th></tr></thead>
        <tbody>${vus.map(x => `<tr>
          <td><input type="checkbox" data-bid="${esc(x.id)}" ${sel.has(x.id) ? 'checked' : ''}></td>
          <td><b>${esc(x.reponse)}</b>${x.actif ? '' : ' <span class="muted">(désactivée)</span>'}</td>
          <td>${esc(x.cat || '')}${x.epoque ? ' · ' + esc(x.epoque) : ''}</td>
          <td class="num">${levelStars(Math.round(x.diff))}${x.mesuree ? ' <span class="muted" title="difficulté mesurée sur les parties jouées">mesurée</span>' : ''}</td>
          <td class="num">${x.joue}</td>
          <td>${jours(x.dernier)}</td>
          <td class="num">${x.reussite === null ? '—' : x.reussite + ' %'}</td>
          <td><a class="btn small" href="${esc(x.url)}${x.url.indexOf('?') >= 0 ? '&' : '?'}t=${x.debut}" target="_blank" rel="noreferrer">▶</a></td>
        </tr>`).join('')}</tbody></table>
      </div>`;

    const on = (sel2, ev, fn) => { const el = m.querySelector(sel2); if (el) el[ev] = fn; };
    on('#bf-texte', 'oninput', e => { f.texte = e.target.value; dessine(); });
    on('#bf-theme', 'onchange', e => { f.theme = e.target.value; f.cat = ''; dessine(); });
    on('#bf-cat', 'onchange', e => { f.cat = e.target.value; dessine(); });
    m.querySelectorAll('[data-bid]').forEach(cb => cb.onchange = () => {
      const id = cb.dataset.bid;
      c.ids = c.ids || [];
      const i = c.ids.indexOf(id);
      if (cb.checked) { if (i < 0) c.ids.push(id); } else if (i >= 0) c.ids.splice(i, 1);
      saveDraft();
      dessine();
    });
    on('#bf-all', 'onclick', () => { c.ids = Array.from(new Set((c.ids || []).concat(vus.map(x => x.id)))); saveDraft(); dessine(); });
    on('#bf-none', 'onclick', () => { c.ids = []; saveDraft(); dessine(); });
    on('#bf-jamais', 'onclick', () => { c.ids = vus.filter(x => !x.joue).map(x => x.id); saveDraft(); dessine(); });
    on('#bf-ok', 'onclick', () => { m.remove(); apres(); });
  };

  const charger = A.blind ? Promise.resolve(A.blind) : rpc('adminBlindList', {}).then(r => (A.blind = r.liste));
  charger.then(dessine).catch(e => {
    m.querySelector('.modal').innerHTML = '<h2>🎧 Extraits</h2><p>Impossible de charger la liste : ' + esc(e.message || e) + '</p>';
  });
}

/* ---------------- Quiz aléatoire ---------------- */

A.rnd = { nb: 15, mode: 'chapitres', bt: true, era: false };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffled(arr) { return arr.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]); }

/** Compose un montage au hasard à partir du catalogue (thèmes, blind tests, époques, niveaux de départ). */
function randomQuiz() {
  const th = A.catalog.themes;
  const isBT = t => /^Blind test/i.test(t);
  const classic = Object.keys(th).filter(t => !isBT(t));
  const bts = A.rnd.bt ? Object.keys(th).filter(isBT) : [];
  const nb = A.rnd.nb;
  const keep = keepSettings();
  let chapters;
  if (A.rnd.mode === 'melange') {
    const themes = shuffled(classic).slice(0, 3 + Math.floor(Math.random() * 3)).concat(bts.length ? [pick(bts)] : []);
    chapters = [defaultChapter('🎲 Quiz surprise', nb, 1 + Math.floor(Math.random() * 2), { themes: themes })];
  } else {
    const k = nb <= 10 ? 2 : nb <= 20 ? 3 : 4;
    let themes = shuffled(classic).slice(0, k);
    if (bts.length) themes[Math.floor(Math.random() * k)] = pick(bts); // au moins un chapitre blind test
    const base = Math.floor(nb / k);
    chapters = themes.map((t, i) => {
      const n = base + (i < nb - base * k ? 1 : 0);
      const ch = defaultChapter(t, n, 1 + Math.floor(Math.random() * 2) + (i === k - 1 ? 1 : 0), { themes: [t] });
      // Époque au hasard (si coché) parmi celles qui ont assez de questions
      if (A.rnd.era && th[t].eras) {
        const ok = Object.keys(th[t].eras).filter(e => th[t].eras[e] >= n + 2);
        if (ok.length) { const e = pick(ok); ch.eras = [e]; ch.name = t + ' · ' + e; }
      }
      return ch;
    });
  }
  A.draft = Object.assign(defaultDraft(), keep, { chapters: chapters });
}

function keepSettings() {
  const d = A.draft;
  const k = {};
  ['title', 'visual', 'duration', 'maxPlayers', 'points', 'sounds', 'audioOn', 'choix', 'estimQcm', 'saisie', 'saisieNiveau', 'format', 'lives', 'teams', 'bonus', 'finale', 'joker', 'estimation', 'margePct', 'autoReveal']
    .forEach(x => { k[x] = d[x]; });
  return k;
}

/* ---------------- Modèle « par années » ---------------- */

A.yrs = { eras: [], themes: [], org: 'epoque', nb: 15, dates: false };

/** Nombre de questions pour des thèmes × époques donnés (dates = seulement les questions « en quelle année »). */
function countYears(themes, eras, dates) {
  const th = A.catalog.themes;
  return (themes.length ? themes : Object.keys(th)).reduce((a, t) => {
    const x = th[t];
    if (!x) return a;
    const src = dates ? x.erasDates || {} : x.eras || {};
    return a + (eras.length ? eras : Object.keys(src)).reduce((b, e) => b + (src[e] || 0), 0);
  }, 0);
}

function yearsCard() {
  const y = A.yrs;
  const th = A.catalog.themes;
  const eras = (A.catalog.epoques || []);
  const themes = themeNames().filter(t => countYears([t], y.eras, y.dates) > 0);
  const n = countYears(y.themes, y.eras, y.dates);
  return `<details class="card col" id="yrs" ${A.yrsOpen ? 'open' : ''}>
    <summary style="cursor:pointer"><b>📅 Modèle par années</b> <span class="muted">— une décennie, un voyage dans le temps, les thèmes de ton choix</span></summary>
    <div class="col" style="margin-top:10px">
      <div><label class="lbl">Époques (aucune = toutes)</label>
        ${eras.map(e => { const k = countYears(y.themes, [e], y.dates); return `<button class="chip ${y.eras.indexOf(e) >= 0 ? 'on' : ''}" data-yera="${esc(e)}" ${k ? '' : 'disabled style="opacity:.35"'}>${esc(e)} <span style="opacity:.6">${k}</span></button>`; }).join('')}</div>
      <div><label class="lbl">Thèmes (aucun = tous)</label>
        ${themes.map(t => `<button class="chip ${y.themes.indexOf(t) >= 0 ? 'on' : ''}" data-ytheme="${esc(t)}">${esc(t)} <span style="opacity:.6">${countYears([t], y.eras, y.dates)}</span></button>`).join('')}</div>
      <div class="row">
        <select id="y-org" style="width:auto">
          <option value="epoque" ${y.org === 'epoque' ? 'selected' : ''}>⏳ Voyage dans le temps : un chapitre par époque</option>
          <option value="theme" ${y.org === 'theme' ? 'selected' : ''}>📖 Un chapitre par thème</option>
          <option value="melange" ${y.org === 'melange' ? 'selected' : ''}>🎲 Tout mélangé</option></select>
        <select id="y-nb" style="width:auto">${[10, 15, 20, 25, 30, 40].map(k => `<option value="${k}" ${k === y.nb ? 'selected' : ''}>${k} questions</option>`).join('')}</select>
        <label class="switch"><input type="checkbox" id="y-dates" ${y.dates ? 'checked' : ''}> seulement « En quelle année… ? »</label>
        <span class="spacer"></span><span class="pill">${n} questions disponibles</span>
        <button class="btn small" id="y-go">📅 Générer</button><button class="btn small primary" id="y-play">📅 Générer et créer la partie</button>
      </div>
      <p class="muted" style="margin:0;font-size:13px">Les blind tests sont classés par année de sortie ; les autres questions par la date dont elles parlent (après 1950).</p>
    </div></details>`;
}

function bindYears(rerender) {
  const y = A.yrs;
  const box = $('#yrs');
  if (!box) return;
  box.ontoggle = () => { A.yrsOpen = box.open; };
  const toggle = (arr, v) => { const j = arr.indexOf(v); if (j >= 0) arr.splice(j, 1); else arr.push(v); };
  box.querySelectorAll('[data-yera]').forEach(b => b.onclick = () => { toggle(y.eras, b.dataset.yera); rerender(); });
  box.querySelectorAll('[data-ytheme]').forEach(b => b.onclick = () => { toggle(y.themes, b.dataset.ytheme); rerender(); });
  const read = () => { y.org = $('#y-org').value; y.nb = Number($('#y-nb').value); y.dates = $('#y-dates').checked; };
  $('#y-dates').onchange = () => { read(); rerender(); };
  $('#y-go').onclick = () => { read(); if (yearsQuiz()) { rerender(); toast('📅 Quiz généré : ajuste si besoin, puis « Créer la partie ».'); } };
  $('#y-play').onclick = () => { read(); if (yearsQuiz()) { rerender(); $('#create').click(); } };
}

function yearsQuiz() {
  const y = A.yrs;
  const all = A.catalog.epoques || [];
  let eras = (y.eras.length ? all.filter(e => y.eras.indexOf(e) >= 0) : all).filter(e => countYears(y.themes, [e], y.dates) > 0);
  if (!eras.length) { toast('Aucune question pour ces époques et ces thèmes.', true); return false; }
  const split = (n, k) => Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i < n % k ? 1 : 0));
  const label = es => es.length === 1 ? es[0] : es.length === all.length ? 'Toutes époques' : es[0] + ' → ' + es[es.length - 1];
  let chapters;
  if (y.org === 'melange') {
    chapters = [defaultChapter('📅 ' + label(eras), y.nb, 1, { eras: eras, themes: y.themes.slice(), dates: y.dates })];
  } else if (y.org === 'theme') {
    let themes = y.themes.length ? y.themes.slice() : themeNames().filter(t => countYears([t], eras, y.dates) >= 3)
      .sort((a, b) => countYears([b], eras, y.dates) - countYears([a], eras, y.dates)).slice(0, 4);
    if (!themes.length) { toast('Pas assez de questions pour ces époques.', true); return false; }
    const ns = split(y.nb, themes.length);
    chapters = themes.map((t, i) => defaultChapter(t + ' · ' + label(eras), ns[i], Math.min(3, 1 + i), { eras: eras, themes: [t], dates: y.dates }));
  } else {
    if (eras.length > 6) eras = eras.slice(-6);
    const ns = split(y.nb, eras.length);
    chapters = eras.map((e, i) => defaultChapter('⏳ ' + e, ns[i], 1 + Math.floor(i * 3 / eras.length), { eras: [e], themes: y.themes.slice(), dates: y.dates }));
  }
  const short = chapters.filter(c => available(c) < c.nb);
  A.draft = Object.assign(defaultDraft(), keepSettings(), { title: 'Quizz · ' + label(eras), chapters: chapters });
  if (short.length) toast('⚠ Pas assez de questions pour : ' + short.map(c => c.name).join(', ') + '. Réduis le nombre de questions ou ajoute des thèmes.', true);
  return true;
}

/* ---------------- Créer une question ---------------- */

function renderQuestions() {
  const root = $('#tab-questions');
  const th = themeNames();
  const catsAll = {};
  th.forEach(t => Object.keys(A.catalog.themes[t].cats).forEach(c => { catsAll[c] = true; }));
  root.innerHTML = `
  <div class="card col" style="max-width:900px">
    <div class="row"><h2 style="margin:0">➕ Nouvelle question</h2><span class="spacer"></span>
      <span class="muted">${A.catalog.total} questions actives · ${A.catalog.withMedia} avec média</span></div>
    <div class="grid2">
      <div><label class="lbl">Thème</label><input type="text" id="f-theme" list="dl-themes" placeholder="ex. Cinéma"></div>
      <div><label class="lbl">Catégorie (facultatif)</label><input type="text" id="f-cat" list="dl-cats" placeholder="ex. Répliques, Chanson française…"></div>
      <div><label class="lbl">Difficulté</label><select id="f-diff">${[1, 2, 3, 4, 5].map(n => `<option value="${n}">${n} ${'★'.repeat(n)}</option>`).join('')}</select></div>
      <div><label class="lbl">Type</label><select id="f-type">${ALL_TYPES.map(t => `<option value="${t}">${typeLabel(t)}</option>`).join('')}</select></div>
      <div><label class="lbl">Époque (facultatif, pour filtrer)</label><select id="f-epoque"><option value="">—</option>${(A.catalog.epoques || []).map(e => `<option>${esc(e)}</option>`).join('')}</select></div>
    </div>
    <datalist id="dl-themes">${th.map(t => `<option value="${esc(t)}">`).join('')}</datalist>
    <datalist id="dl-cats">${Object.keys(catsAll).sort().map(c => `<option value="${esc(c)}">`).join('')}</datalist>
    <div><label class="lbl">Question</label><textarea id="f-texte" rows="2"></textarea></div>
    <div id="f-answers"></div>
    <div class="grid2">
      <div><label class="lbl">Explication (affichée à tous après la réponse)</label><textarea id="f-expl" rows="2"></textarea></div>
      <div><label class="lbl">Indices / notes MJ (visibles par toi seul)</label><textarea id="f-indices" rows="2"></textarea></div>
    </div>
    <div class="grid2">
      <div style="grid-column: span 2"><label class="lbl">Média : lien YouTube (blind test) ou adresse d'une photo (facultatif)</label><input type="text" id="f-media" placeholder="https:\/\/www.youtube.com/watch?v=…  ou  https:\/\/…/photo.jpg"></div>
      <div><label class="lbl">Début de l'extrait (s)</label><input type="number" id="f-debut" min="0" placeholder="0"></div>
      <div><label class="lbl">Effet sur la photo</label><select id="f-fx"><option value="">Aucun</option><option value="zoom">🔍 Gros plan qui se dézoome</option><option value="flou">🌫️ Floue puis nette</option></select></div>
      <div class="muted" style="font-size:13px;align-self:end;grid-column: span 2">⏱ En partie, l'extrait dure le temps de réponse (ex. 30 s). 📸 Pour une photo : clic droit sur une image (Wikipédia…) → « Copier l'adresse de l'image ».</div>
    </div>
    <div class="actions"><button class="btn" id="f-test">🎧 Tester l'extrait</button><button class="btn" id="f-stop">■</button>
      <span class="spacer"></span><button class="btn primary big" id="f-save">Enregistrer la question</button></div>
  </div>`;
  $('#f-type').onchange = answerFields;
  answerFields();
  $('#f-test').onclick = () => {
    const url = $('#f-media').value;
    const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/)([\w-]{11})/);
    if (!m) return toast('Lien YouTube non reconnu.', true);
    Sound.unlock();
    YT_PLAYER.play({ kind: 'youtube', id: m[1], start: Number($('#f-debut').value) || 0, dur: Number(A.draft.duration) || 30 });
  };
  $('#f-stop').onclick = () => YT_PLAYER.stop();
  $('#f-save').onclick = saveQuestion;
}

function answerFields() {
  const t = $('#f-type').value;
  const box = $('#f-answers');
  if (t === 'QCM') box.innerHTML = `<div class="grid2">
      <div><label class="lbl" style="color:var(--ok)">✔ Bonne réponse</label><input type="text" id="f-rep"></div>
      <div><label class="lbl">✘ Mauvaise réponse 1</label><input type="text" id="f-c2"></div>
      <div><label class="lbl">✘ Mauvaise réponse 2</label><input type="text" id="f-c3"></div>
      <div><label class="lbl">✘ Mauvaise réponse 3 (facultatif)</label><input type="text" id="f-c4"></div></div>`;
  else if (t === 'VF') box.innerHTML = `<div><label class="lbl">Réponse</label><select id="f-rep"><option>Vrai</option><option>Faux</option></select></div>`;
  else if (t === 'CARTE') {
    box.innerHTML = `<div class="grid2">
      <div><label class="lbl" style="color:var(--ok)">✔ Nom du lieu (affiché à la réponse)</label><input type="text" id="f-c3" placeholder="ex. Tokyo"></div>
      <div><label class="lbl">Zone de la carte</label><select id="f-c2">${Object.keys(ZONE_LABELS).map(z => `<option value="${z}">${ZONE_LABELS[z]}</option>`).join('')}</select></div>
      <div><label class="lbl">Position (touche la carte)</label><input type="text" id="f-rep" placeholder="latitude, longitude" readonly></div>
      <div><label class="lbl">Rayon « tous les points » en km (facultatif)</label><input type="text" id="f-c4" inputmode="decimal" placeholder="auto"></div></div>
      <div id="f-map" class="qmap" style="height:40vh;margin-top:8px"></div>`;
    let mk = null;
    const draw = () => makeMap($('#f-map'), $('#f-c2').value, { interactive: true }).then(map => {
      mk = null;
      map.on('click', e => {
        const ll = e.latlng.wrap();
        $('#f-rep').value = ll.lat.toFixed(4) + ', ' + ll.lng.toFixed(4);
        if (mk) mk.setLatLng(e.latlng); else mk = L.marker(e.latlng, { icon: targetIcon('') }).addTo(map);
      });
    }).catch(e => toast(e, true));
    $('#f-c2').onchange = draw;
    draw();
    if (!$('#f-texte').value) $('#f-texte').value = 'Où se trouve … ?';
  }
  else if (t === 'ESTIMATION') box.innerHTML = `<div class="grid2">
      <div><label class="lbl">Bonne réponse (nombre)</label><input type="text" id="f-rep" inputmode="decimal"></div>
      <div><label class="lbl">Unité (facultatif)</label><input type="text" id="f-c2" placeholder="km, ans, €…"></div>
      <div><label class="lbl">Tolérance ± (vide = marge % de la partie)</label><input type="text" id="f-c3" inputmode="decimal"></div></div>`;
  else box.innerHTML = `<div><label class="lbl">Éléments dans le BON ordre (3 à 6)</label>
      ${[1, 2, 3, 4, 5, 6].map(n => `<input type="text" class="f-ord" placeholder="${n}." style="margin-bottom:6px">`).join('')}</div>
      <div><label class="lbl">Consigne</label><input type="text" id="f-c2" placeholder="ex. Du plus ancien au plus récent"></div>`;
}

function saveQuestion() {
  const val = id => { const el = $('#' + id); return el ? el.value.trim() : ''; };
  const q = {
    theme: val('f-theme'), cat: val('f-cat'), diff: Number(val('f-diff')), type: val('f-type'), texte: val('f-texte'),
    expl: val('f-expl'), indices: val('f-indices'), media: val('f-media'), debut: val('f-debut'), epoque: val('f-epoque'),
  };
  if (q.media && val('f-fx') && !/youtu/.test(q.media)) q.media = q.media.replace(/#.*$/, '') + '#' + val('f-fx');
  if (!q.theme) return toast('Indique un thème.', true);
  if (q.type === 'ORDRE') {
    q.rep = Array.from(document.querySelectorAll('.f-ord')).map(i => i.value.trim()).filter(Boolean).join(' | ');
    q.c2 = val('f-c2');
  } else {
    q.rep = val('f-rep'); q.c2 = val('f-c2'); q.c3 = val('f-c3'); q.c4 = val('f-c4');
  }
  $('#f-save').disabled = true;
  rpc('adminAddQuestion', { question: {
    theme: q.theme, categorie: q.cat, difficulte: q.diff, type: q.type, question: q.texte, reponse: q.rep,
    choix2: q.c2 || '', choix3: q.c3 || '', choix4: q.c4 || '', explication: q.expl, indices: q.indices,
    media_url: q.media, media_debut: Number(q.debut) || 0, epoque: q.epoque,
  } }).then(r => rpc('adminCatalog', {}).then(c => { A.catalog = c; return r; })).then(r => {
    toast('Question ' + r.id + ' ajoutée ✔');
    const keep = { theme: q.theme, cat: q.cat, diff: q.diff, type: q.type };
    renderQuestions();
    $('#f-theme').value = keep.theme; $('#f-cat').value = keep.cat; $('#f-diff').value = keep.diff; $('#f-type').value = keep.type;
    answerFields();
    renderPreparer();
  }).catch(e => toast(e, true)).finally(() => { const b = $('#f-save'); if (b) b.disabled = false; });
}

/* ---------------- Classement général ---------------- */

A.lb = null; A.lbSort = { k: 'points', dir: -1 }; A.lbTheme = '';

function renderClassement() {
  const root = $('#tab-classement');
  root.innerHTML = '<div class="card">Chargement du classement…</div>';
  rpc('adminLeaderboard', {}).then(r => { A.lb = shapeLeaderboard(r); drawClassement(); }).catch(e => { root.innerHTML = ''; toast(e, true); });
}

/** Met les deux vues SQL (classement général, détail par thème) dans la forme attendue par le tableau. */
function shapeLeaderboard(r) {
  const parThème = {};
  (r.themes || []).forEach(t => {
    (parThème[t.pseudo] = parThème[t.pseudo] || {})[t.theme] = { points: t.points, good: t.bonnes_reponses, n: t.questions };
  });
  const date = d => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '');
  const players = (r.classement || []).map(c => ({
    pseudo: c.pseudo, games: c.parties, wins: c.victoires, points: c.points, good: c.bonnes_reponses,
    n: c.questions, pct: c.reussite_pct === null ? 0 : c.reussite_pct, best: c.meilleur_score || 0,
    avgTime: c.temps_moyen_s === null ? null : Number(c.temps_moyen_s), last: date(c.derniere_partie),
    themes: parThème[c.pseudo] || {},
  }));
  players.sort((a, b) => b.points - a.points).forEach((p, i) => { p.rank = i + 1; });
  const themes = Object.keys((r.themes || []).reduce((m, t) => { m[t.theme] = 1; return m; }, {})).sort();
  return { players: players, themes: themes };
}

function drawClassement() {
  const lb = A.lb;
  const t = A.lbTheme;
  const rows = lb.players.map(p => {
    const x = t ? (p.themes[t] || { points: 0, good: 0, n: 0 }) : null;
    return Object.assign({}, p, t ? { points: x.points, good: x.good, n: x.n, pct: x.n ? Math.round(1000 * x.good / x.n) / 10 : 0 } : {});
  }).filter(p => !t || p.n > 0);
  const k = A.lbSort.k, dir = A.lbSort.dir;
  rows.sort((a, b) => {
    const va = a[k], vb = b[k];
    if (typeof va === 'string') return dir * va.localeCompare(vb);
    return dir * ((va || 0) - (vb || 0)) || (b.pct - a.pct);
  });
  const cols = [['#', null], ['Pseudo', 'pseudo'], ['Parties', 'games'], ['Victoires', 'wins'], ['Points', 'points'], ['Bonnes', 'good'], ['Questions', 'n'], ['% réussite', 'pct'], ['Meilleur score', 'best'], ['Temps moyen', 'avgTime'], ['Dernière partie', 'last']];
  $('#tab-classement').innerHTML = `
  <div class="card col">
    <div class="row"><h2 style="margin:0">🏆 Classement général</h2><span class="spacer"></span>
      <label>Thème <select id="lbTheme" style="width:auto"><option value="">Tous les thèmes</option>${lb.themes.map(x => `<option ${x === t ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <button class="btn small" onclick="renderClassement()">↻ Actualiser</button></div>
    ${rows.length ? '' : '<p class="muted">Aucune partie jouée pour l\'instant.</p>'}
    <div style="overflow:auto"><table class="tbl"><thead><tr>${cols.map(c => `<th class="${c[1] && c[1] !== 'pseudo' && c[1] !== 'last' ? 'num' : ''}" data-k="${c[1] || ''}">${c[0]}${c[1] === k ? (dir < 0 ? ' ▼' : ' ▲') : ''}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((p, i) => `<tr data-p="${esc(p.pseudo)}" style="cursor:pointer">
      <td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td><b>${esc(p.pseudo)}</b></td><td class="num">${p.games}</td><td class="num">${p.wins}</td>
      <td class="num"><b>${p.points}</b></td><td class="num">${p.good}</td><td class="num">${p.n}</td><td class="num">${p.pct} %</td>
      <td class="num">${p.best}</td><td class="num">${p.avgTime === null ? '–' : p.avgTime + ' s'}</td><td>${esc(p.last)}</td></tr>`).join('')}</tbody></table></div>
    <p class="muted" style="font-size:13px">Clique sur un joueur pour voir le détail de ses points par thème. Le classement se met à jour tout seul à la fin de chaque partie.</p>
  </div>`;
  $('#lbTheme').onchange = e => { A.lbTheme = e.target.value; drawClassement(); };
  document.querySelectorAll('#tab-classement th[data-k]').forEach(th => th.onclick = () => {
    const nk = th.dataset.k;
    if (!nk) return;
    A.lbSort = { k: nk, dir: A.lbSort.k === nk ? -A.lbSort.dir : (nk === 'pseudo' || nk === 'avgTime' ? 1 : -1) };
    drawClassement();
  });
  document.querySelectorAll('#tab-classement tr[data-p]').forEach(tr => tr.onclick = () => playerDetail(tr.dataset.p));
}

function playerDetail(pseudo) {
  const p = A.lb.players.filter(x => x.pseudo === pseudo)[0];
  if (!p) return;
  const ths = Object.keys(p.themes).sort((a, b) => p.themes[b].points - p.themes[a].points);
  const max = Math.max.apply(null, ths.map(t => p.themes[t].points).concat([1]));
  modal(`<h2>👤 ${esc(p.pseudo)}</h2>
    <div class="row"><span class="pill">${p.rank}<sup>e</sup> au général</span><span class="pill">${p.games} partie${p.games > 1 ? 's' : ''}</span><span class="pill">${p.wins} victoire${p.wins > 1 ? 's' : ''}</span><span class="pill">${p.points} pts</span><span class="pill">${p.pct} % de réussite</span></div>
    <h3>Points par thème</h3>
    <table class="tbl"><thead><tr><th>Thème</th><th class="num">Points</th><th class="num">Bonnes</th><th class="num">%</th><th style="width:35%"></th></tr></thead><tbody>
    ${ths.map(t => { const x = p.themes[t]; return `<tr><td>${esc(t)}</td><td class="num"><b>${x.points}</b></td><td class="num">${x.good}/${x.n}</td>
      <td class="num">${x.n ? Math.round(100 * x.good / x.n) : 0} %</td><td><div class="mini-bar" style="width:${100 * x.points / max}%"></div></td></tr>`; }).join('')}
    </tbody></table>`);
}
