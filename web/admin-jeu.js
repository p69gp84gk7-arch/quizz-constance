/* ================== Maître du jeu : connexion, onglets, pilotage de la partie ================== */

const A = {
  code: null, view: null, catalog: null, montages: [],
  busy: false, polling: false, key: '', autoRevealFor: null, presence: {}, tab: 'partie', fiches: {},
};

/* L'interface s'adapte à l'écran : téléphone, tablette ou ordinateur */
function screenType() { const w = window.innerWidth; return w <= 700 ? 'phone' : w <= 1100 ? 'tablet' : 'desktop'; }
function applyScreen() {
  const t = screenType();
  if (document.body.dataset.screen !== t) { document.body.dataset.screen = t; if (A.view && A.tab === 'partie') { A.key = ''; refreshPartie(); } }
}
window.addEventListener('resize', () => { clearTimeout(A.rsz); A.rsz = setTimeout(applyScreen, 200); });

function boot() {
  $('#loginBtn').onclick = login;
  $('#pin').onkeydown = e => { if (e.key === 'Enter') login(); };
  document.querySelectorAll('nav .tab').forEach(t => t.onclick = () => showTab(t.dataset.tab));
  $('#helpBtn').onclick = showHelp;
  document.addEventListener('keydown', onKey);
  applyVisual(store('qc_visual') || 'plateau');
  $('#email').onkeydown = e => { if (e.key === 'Enter') $('#pin').focus(); };
  $('#playerLink').href = URL_BASE + 'joueur.html';
  applyScreen();
  const mail = store('qc_mail');
  if (mail) $('#email').value = mail;
  // Session déjà ouverte (le navigateur la garde) : on entre directement
  SB.auth.getSession().then(({ data }) => { if (data && data.session) afterLogin(); });
}

function loginMsg(txt, isErr) {
  const m = $('#loginMsg');
  if (m) { m.textContent = txt || ''; m.style.color = isErr ? 'var(--ko)' : 'var(--muted)'; }
}

/** Connexion du maître du jeu : un vrai compte, pas un code partagé. */
function login() {
  Sound.unlock();
  const mail = $('#email').value.trim();
  const pass = $('#pin').value;
  if (!mail || !pass) return loginMsg('Entre ton adresse et ton mot de passe.', true);
  $('#loginBtn').disabled = true;
  loginMsg('Connexion…');
  SB.auth.signInWithPassword({ email: mail, password: pass }).then(({ error }) => {
    if (error) throw new Error(/Invalid login/i.test(error.message) ? 'Adresse ou mot de passe incorrect.' : error.message);
    store('qc_mail', mail);
    return afterLogin();
  }).catch(e => loginMsg('❌ ' + (e && e.message ? e.message : String(e)), true))
    .finally(() => { $('#loginBtn').disabled = false; });
}

/** Charge la banque, les montages et reprend la partie en cours s'il y en a une. */
function afterLogin() {
  loginMsg('Chargement de la banque de questions…');
  return Promise.all([rpc('adminCatalog', {}), rpc('adminMontages', {}), rpc('screenGame', {})])
    .then(([catalog, m, scr]) => {
      A.catalog = catalog;
      A.montages = (m.montages || []).map(x => ({ name: x.nom, desc: x.description, settings: x.config }));
      loginMsg('');
      $('#login').classList.add('hidden');
      $('#main').classList.remove('hidden');
      renderPartie();
      renderPreparer();
      renderQuestions();
      // Une partie est déjà ouverte : on la reprend (rechargement de page, autre appareil…)
      if (scr.code) {
        return rpc('adminState', { code: scr.code }).then(v => {
          if (v.status !== 'END') { A.code = scr.code; startPolling(); onView(v); }
        }).catch(() => {});
      }
    });
}

/** Recharge la liste des montages depuis la base. */
function reloadMontages() {
  return rpc('adminMontages', {}).then(m => {
    A.montages = (m.montages || []).map(x => ({ name: x.nom, desc: x.description, settings: x.config }));
    return A.montages;
  });
}

function logout() {
  stopPolling();
  SB.auth.signOut().then(() => location.reload());
}

function showTab(name) {
  A.tab = name;
  document.querySelectorAll('nav .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  ['partie', 'preparer', 'questions', 'classement'].forEach(n => $('#tab-' + n).classList.toggle('hidden', n !== name));
  if (name === 'classement') renderClassement();
  if (name === 'partie') { A.key = ''; renderPartie(); }
}

/* ---------------- Synchronisation ---------------- */

const MJ_LIVE = watchGame('game_mj', (state, row) => { state.version = row.seq; onView(state); });
let ANSWERS = null;

function startPolling() {
  if (A.polling || !A.code) return;
  A.polling = true;
  MJ_LIVE.start(A.code);
  // Chaque réponse qui arrive rafraîchit le tableau des joueurs, au plus une fois par seconde
  if (ANSWERS) ANSWERS.stop();
  ANSWERS = watchAnswers(A.code, () => {
    clearTimeout(A.ansTimer);
    A.ansTimer = setTimeout(() => {
      rpc('adminState', { code: A.code }).then(v => onView(v)).catch(() => {});
    }, 400);
  });
}

function stopPolling() {
  A.polling = false;
  MJ_LIVE.stop();
  if (ANSWERS) { ANSWERS.stop(); ANSWERS = null; }
}

/** Les actions du maître du jeu : un seul argument, nommé selon l'action. */
const ACT_ARG = { adminSetLevel: 'level', adminMedia: 'mediaAction', adminKick: 'pid', adminUpdateSettings: 'patch' };

function act(fn, arg) {
  if (A.busy) return Promise.resolve();
  A.busy = true;
  document.querySelectorAll('[data-act]').forEach(b => b.disabled = true);
  const params = { code: A.code };
  if (ACT_ARG[fn] && arg !== undefined) params[ACT_ARG[fn]] = arg;
  return rpc(fn, params).then(v => { A.key = ''; onView(v); })
    .catch(e => toast(e, true))
    .finally(() => { A.busy = false; document.querySelectorAll('[data-act]').forEach(b => b.disabled = false); });
}

function onView(v) {
  A.view = v;
  applyVisual(v.visual);
  store('qc_visual', v.visual);
  if (v.audioOn === 'admin') MediaSync.apply(v, v.current, true);
  else MediaSync.apply(v, v.current, false);
  checkPresence(v);
  refreshPartie();
}

function refreshPartie() {
  const v = localPromote(A.view);
  if (A.tab !== 'partie' || !v) return;
  const key = [v.status, v.qIndex, v.version, v.answeredCount].join('|');
  if (key !== A.key) { A.key = key; renderPartie(); }
  else renderPlayers(v);
}

/** Alerte quand un joueur quitte l'appli ou perd la connexion. */
function checkPresence(v) {
  v.players.forEach(p => {
    const before = A.presence[p.pid];
    if (before && before !== p.presence && p.presence !== 'on') {
      toast((p.presence === 'bg' ? '🟠 ' + p.pseudo + ' a quitté l\'appli' : '🔴 ' + p.pseudo + ' est déconnecté·e'), p.presence === 'bg' && v.status === 'QUESTION');
    }
    A.presence[p.pid] = p.presence;
  });
}

/* ---------------- Rendu de la partie ---------------- */

function renderPartie() {
  const root = $('#tab-partie');
  const v = A.view;
  if (!A.code || !v) {
    root.innerHTML = `<div class="card center col" style="padding:50px">
      <div style="font-size:50px">🎲</div><h2>Aucune partie en cours</h2>
      <p class="muted">Prépare une partie : thèmes, chapitres, difficulté, nombre de joueurs…</p>
      <div><button class="btn primary big" onclick="showTab('preparer')">🧩 Préparer une partie</button></div></div>`;
    return;
  }
  root.innerHTML = `
    ${topBar(v)}
    <div class="live" style="margin-top:14px">
      <div class="col">${mainCard(v)}${settingsCard(v)}</div>
      <div class="card" id="players"></div>
    </div>`;
  bindMain(v);
  renderPlayers(v);
}

function joinLink(v) { return URL_BASE + 'joueur.html?p=' + v.code; }
// Lien permanent : l'écran public suit tout seul la dernière partie créée (inutile de le recharger)
function screenLink() { return URL_BASE + 'ecran.html'; }

function topBar(v) {
  const st = { LOBBY: '🟢 Salle d\'attente', CHAPTER: '📖 Chapitre', INTRO: '⏳ Intro du thème', READ: '🎤 Lecture', QUESTION: '⏱ Chrono en cours', REVEAL: '✅ Réponse', SCORES: '🏆 Classement', END: '🏁 Terminée' }[v.status];
  return `<div class="card row" style="padding:12px 16px">
    <span class="pill accent" style="font-size:18px">Code ${esc(v.code)}</span>
    <span class="pill">${st}</span>
    ${v.qIndex >= 0 ? `<span class="pill">Question ${v.qIndex + 1}/${v.total}</span>` : `<span class="pill">${v.total} questions</span>`}
    ${v.format !== 'classique' ? `<span class="pill">${FORMAT_LABELS[v.format]}${v.survivors ? ' · ' + v.survivors.length + ' en vie' : ''}</span>` : ''}
    ${v.chapter ? `<span class="pill hide-phone">📖 ${v.chapter.idx}/${v.chapter.count} · ${esc(v.chapter.name)} (${v.chapQ}/${v.chapter.nb})</span>` : ''}
    <span class="pill">Niveau <button class="btn small" data-act onclick="act('adminSetLevel', ${v.level - 1})" style="padding:0 8px">−</button>
      ${levelStars(v.level)} <button class="btn small" data-act onclick="act('adminSetLevel', ${v.level + 1})" style="padding:0 8px">+</button></span>
    <span class="spacer"></span>
    <a class="btn small hide-phone" href="${esc(screenLink())}" target="_blank">📺 Écran public</a>
    <button class="btn small" onclick="showJoin()">📱 QR joueurs</button>
  </div>`;
}

function primaryAction(v) {
  const last = v.qIndex + 1 >= v.total;
  const chapEnd = v.chapter && v.chapQ >= v.chapter.nb && v.chapter.idx < v.chapter.count;
  switch (v.status) {
    case 'LOBBY': return { label: '▶ Démarrer le quiz', fn: 'adminNext', disabled: v.players.length < 1 };
    case 'CHAPTER': return { label: '▶ Première question du chapitre', fn: 'adminNext' };
    case 'INTRO': return v.settings.chrono === 'auto'
      ? { label: '⏳ La question démarre…', fn: null, disabled: true }
      : { label: '⏱ Lancer le chrono', fn: 'adminStartTimer' };
    case 'READ': return { label: '⏱ Lancer le chrono', fn: 'adminStartTimer' };
    case 'QUESTION': return { label: '✅ Révéler la réponse', fn: 'adminReveal' };
    case 'REVEAL':
    case 'SCORES': return { label: last || v.finished ? '🏁 Résultats finaux' : (chapEnd ? '📖 Chapitre suivant' : '▶ Question suivante'), fn: 'adminNext' };
    default: return null;
  }
}

function mainCard(v) {
  const pa = primaryAction(v);
  const btn = pa ? `<button class="btn primary big" data-act id="primary" ${pa.disabled ? 'disabled' : ''}>${pa.label} <span class="kbd">[espace]</span></button>` : '';
  const qrSize = screenType() === 'phone' ? 150 : 200;
  A.qrSize = qrSize;
  const q = v.current;

  if (v.status === 'LOBBY') {
    return `<div class="card col">
      <h2>Salle d'attente · ${v.players.length}/${v.settings.maxPlayers} joueurs</h2>
      <div class="row" style="align-items:flex-start;gap:24px">
        <div id="qrbox"></div>
        <div class="col grow">
          <div><label class="lbl">Lien joueurs</label><div class="row"><input type="text" readonly value="${esc(joinLink(v))}" id="jl"><button class="btn small" onclick="copy('jl')">Copier</button></div></div>
          <div><label class="lbl">Lien écran public (TV / vidéoprojecteur)</label><div class="row"><input type="text" readonly value="${esc(screenLink())}" id="sl"><button class="btn small" onclick="copy('sl')">Copier</button></div></div>
          <p class="muted">Diffuse l'écran public : il affiche le QR code en grand. Les joueurs peuvent aussi saisir le code <b>${esc(v.code)}</b>.<br>
            💡 Ce lien d'écran est permanent : garde-le ouvert sur la TV, il passera tout seul à la partie suivante. Les téléphones aussi.</p>
          ${v.settings.chapters.length > 1 ? `<div><label class="lbl">Montage</label>${v.settings.chapters.map((c, i) => `<div>${i + 1}. <b>${esc(c.name)}</b> · ${c.nb} q. · départ ${levelStars(c.level)}</div>`).join('')}</div>` : ''}
          ${v.format !== 'classique' ? `<div><label class="lbl">Format</label><b>${FORMAT_LABELS[v.format]}</b>${formatNote(v)}</div>` : ''}
        </div></div>
      ${v.teams ? `<div class="grid2">${v.teams.slice().sort((a, b) => a.team - b.team).map(t => `<div class="card" style="padding:10px"><b>${esc(t.name)}</b> <span class="muted">(${t.members.length})</span><div>${t.members.map(esc).join(', ') || '<span class="muted">—</span>'}</div></div>`).join('')}</div>
        <div><button class="btn small" data-act onclick="act('adminShuffleTeams')">🔀 Refaire les équipes au hasard</button></div>` : ''}
      <div class="actions main-actions">${btn}</div>
      <div class="actions"><span class="spacer"></span><button class="btn danger small" onclick="endGame()">Annuler la partie</button></div></div>`;
  }

  if (v.status === 'CHAPTER') {
    return `<div class="card col center" style="padding:40px">
      <div class="muted">Chapitre ${v.chapter.idx} / ${v.chapter.count}</div><h1 style="font-size:40px">${esc(v.chapter.name)}</h1>
      <p class="muted">${v.chapter.nb} questions · ${v.chapter.themes.length ? v.chapter.themes.map(esc).join(', ') : 'Tous thèmes'} · départ ${levelStars(v.chapter.level)}</p>
      <div class="actions main-actions" style="justify-content:center">${btn}</div></div>`;
  }

  if (v.status === 'END') {
    return `<div class="card col center" style="padding:30px"><h1>🏁 Partie terminée</h1>
      ${v.teams ? `<h2>🏆 Victoire des ${esc(v.teams[0].name)}</h2>${teamsTable(v)}` : ''}
      ${(v.ranking || []).map(p => `<div class="row" style="justify-content:center;font-size:18px"><b>${['🥇', '🥈', '🥉'][p.rank - 1] || p.rank + '.'}</b> ${esc(p.pseudo)} · <b>${p.score}</b> pts</div>`).join('')}
      <p class="muted">Résultats enregistrés dans le classement général.</p>
      <div class="actions" style="justify-content:center"><button class="btn primary big" onclick="newGame()">🎲 Nouvelle partie</button>
      <button class="btn" onclick="showTab('classement')">🏆 Classement général</button></div></div>`;
  }

  if (v.status === 'SCORES') {
    return `<div class="card col"><h2>🏆 Classement affiché à l'écran</h2>
      ${v.teams ? teamsTable(v) : ''}
      ${(v.ranking || []).map(p => `<div class="row"><b style="width:30px">${p.rank}.</b><span class="grow">${esc(p.pseudo)} ${playerBadges(v, p)}</span><b>${p.score}</b></div>`).join('')}
      <div class="actions main-actions">${btn}</div>
      <div class="actions"><span class="spacer"></span><button class="btn danger small" onclick="endGame()">Terminer la partie</button></div></div>`;
  }

  // INTRO / READ / QUESTION / REVEAL
  const r = v.reveal;
  const live = v.status === 'QUESTION';
  const intro = v.status === 'INTRO';
  let body = '';
  if (q.choices) {
    const dist = r ? r.dist : v.liveDist;
    const tot = dist ? dist.reduce((a, b) => a + b, 0) : 0;
    body = `<div class="choices admin">${q.choices.map((c, i) => `<div class="choice k${i} ${i === q.correct ? 'good' : (r ? 'dim' : '')}">
        <span class="shape">${SHAPES[i]}</span><span>${esc(c)}${i === q.correct ? ' ✔' : ''}</span>
        ${dist ? `<span class="count">${dist[i]}</span><span class="bar" style="width:${tot ? 100 * dist[i] / tot : 0}%"></span>` : ''}</div>`).join('')}</div>`;
  } else if (q.type === 'ORDRE') {
    body = `<div class="muted">Ordre affiché (mélangé) : ${q.items.map(esc).join(' · ')}</div>`;
  } else if (q.type === 'ESTIMATION' && r && r.closest) {
    body = `<div class="col">${r.closest.map(c => `<div class="row">${c.ok ? '✅' : '❌'} <span class="grow">${esc(c.pseudo)}</span><b>${esc(c.a)}</b></div>`).join('')}</div>`;
  } else if (q.type === 'CARTE') {
    body = `<div id="amap" class="qmap" style="height:${screenType() === 'phone' ? 34 : 40}vh"></div>
      <div class="muted" style="font-size:13px">Zone : ${ZONE_LABELS[q.zone] || q.zone} · tous les points à moins de ${fmtKm(q.target.full)}, plus rien au-delà d'une certaine distance (la précision exigée augmente avec le niveau).</div>`;
  }
  const media = q.media && q.media.kind === 'youtube'
    ? `<div class="row"><span class="pill">🎵 Extrait YouTube · ${q.media.dur}s (${v.audioOn === 'admin' ? 'joué ici' : 'joué sur l\'écran public'})</span>
        <button class="btn small" data-act onclick="act('adminMedia','play')">▶ Rejouer</button>
        <button class="btn small" data-act onclick="act('adminMedia','stop')">■ Stop</button></div>`
    : (q.media ? mediaHtml(q, false) + (q.media.fx ? `<div class="muted center" style="font-size:12px">Effet sur l'écran et les téléphones : ${q.media.fx === 'zoom' ? 'gros plan qui se dézoome' : 'image floue qui se précise'}</div>` : '') : '');
  const banners = [];
  if (v.duel) banners.push(`⚔️ Duel : <b>${esc(v.duel[0])}</b> contre <b>${esc(v.duel[1])}</b>${r ? (r.winner ? ' → 🏆 ' + esc(r.winner) : ' → match nul') : ''}`);
  if (r && v.format === 'buzzer') banners.push(r.winner ? '⚡ Le plus rapide : <b>' + esc(r.winner) + '</b>' : '⚡ Personne n\'a trouvé');
  if (r && v.format === 'survie') {
    if (r.repechage) banners.push('😅 Repêchage : tout le monde s\'est trompé, personne ne perd de vie');
    if (r.eliminated && r.eliminated.length) banners.push('💀 Éliminé' + (r.eliminated.length > 1 ? 's' : '') + ' : ' + r.eliminated.map(esc).join(', '));
    if (v.finished) banners.push('🏆 Il ne reste qu\'un survivant : la partie peut se terminer');
  }

  return `<div class="card col">
    <div class="row muted" style="font-size:13px"><span>${typeLabel(q.type)} · ${esc(q.theme)}${q.cat ? ' / ' + esc(q.cat) : ''} · ${levelStars(q.diff)} · ${esc(q.id)}</span>
      <span class="spacer"></span>${intro ? `<span class="pill accent">⏳ Question dans <b id="aintro">${introLeft(v)}</b> s</span>` : ''}
      ${live ? `<span class="pill">📨 ${v.answeredCount}/${v.players.length}</span>` : ''}</div>
    ${live ? `<div class="row"><div class="timer grow" id="tbar"><div></div></div><span class="timer-num" id="tnum" style="font-size:22px"></span></div>` : ''}
    ${multBadge(q) ? `<div>${multBadge(q)}</div>` : ''}
    ${banners.map(b => `<div class="hint-box" style="border-style:solid">${b}</div>`).join('')}
    <div class="qbig">${esc(q.text)}</div>
    ${q.hint ? `<div class="muted">Consigne : ${esc(q.hint)}</div>` : ''}
    <div class="answer-box"><div class="lbl2">Réponse</div><div style="font-size:20px;font-weight:800">${esc(q.answerText)}</div>
      ${q.expl ? `<div style="margin-top:6px">💡 ${esc(q.expl)}</div>` : ''}</div>
    ${media}
    ${body}
    ${live || r ? liveAnswers(v) : ''}
    ${q.indices ? `<div class="hint-box"><b>🕵️ Indices MJ :</b> ${esc(q.indices)}</div>` : ''}
    ${q.anecdote ? `<div class="hint-box anecdote"><b>🎙️ Pour animer :</b> ${esc(q.anecdote)}</div>` : ''}
    <div id="fiche">${ficheHtml(q)}</div>
    ${r ? `<div class="row"><span class="pill">✅ ${r.nbOk}/${r.nbPlay !== undefined ? r.nbPlay : v.players.length} · ${Math.round(r.rate * 100)} %</span>
      <span class="pill">Niveau ${r.levelBefore} → ${r.levelAfter} ${r.levelAfter > r.levelBefore ? '⬆' : ''}</span>${r.mult > 1 ? `<span class="pill accent">Points ×${r.mult}</span>` : ''}</div>` : ''}
    <div class="actions main-actions">${btn}
      ${v.status === 'REVEAL' ? '<button class="btn" data-act onclick="act(\'adminShowScores\')">🏆 <span class="hide-phone">Afficher le </span>classement</button>' : ''}
      ${intro || v.status === 'READ' || live ? '<button class="btn" data-act onclick="act(\'adminSkip\')" title="Remplacer la question">🔄<span class="hide-phone"> Remplacer la question</span></button>' : ''}</div>
    <div class="actions"><span class="spacer"></span><button class="btn danger small" onclick="endGame()">Terminer la partie</button></div>
  </div>`;
}

function formatNote(v) {
  return {
    face: ' — à chaque question, deux joueurs s\'affrontent (rotation automatique), le plus rapide à trouver gagne.',
    survie: ' — ' + v.lives + ' vie' + (v.lives > 1 ? 's' : '') + ' par joueur, le dernier survivant gagne.',
    equipes: ' — points d\'équipe = moyenne de ses joueurs.',
    buzzer: ' — seule la première bonne réponse marque.',
  }[v.format] || '';
}

function teamsTable(v) {
  return `<div class="col" style="gap:4px;text-align:left">${v.teams.map(t => `<div class="row"><b style="width:30px">${t.rank}.</b><span class="grow"><b>${esc(t.name)}</b> <span class="muted" style="font-size:13px">${t.members.map(esc).join(', ')}</span></span><b>${t.score}</b></div>`).join('')}</div>`;
}

function playerBadges(v, p) {
  const b = [];
  if (v.format === 'survie') b.push(p.out ? '💀' : `<span style="font-size:12px">${hearts(p.lives, v.settings ? v.settings.lives : v.lives)}</span>`);
  if (v.format === 'equipes' && v.teams) { const t = v.teams.filter(x => x.team === p.team)[0]; if (t) b.push(t.name.split(' ')[0]); }
  if (p.duel) b.push('⚔️');
  if (p.joker) b.push('🃏');
  return b.join(' ');
}

/* ---------------- Fiche Wikipédia (chargée en arrière-plan pour chaque question) ---------------- */

function ficheHtml(q) {
  const f = A.fiches[q.id];
  if (f === undefined) return '<div class="muted" style="font-size:13px">📖 Recherche d\'une fiche Wikipédia…</div>';
  if (!f) return '';
  return `<details class="hint-box fiche"><summary><b>📖 Wikipédia : ${esc(f.title)}</b> <span class="muted" style="font-size:12px">(fiche trouvée automatiquement, à vérifier)</span></summary>
    <div class="row" style="align-items:flex-start;margin-top:8px">${f.thumb ? `<img src="${esc(f.thumb)}" alt="" style="width:110px;border-radius:8px">` : ''}
    <div class="grow" style="min-width:200px">${esc(f.extract)} <a href="${esc(f.url)}" target="_blank">Lire la suite ↗</a></div></div></details>`;
}

/** Ce qu'on cherche sur Wikipédia : la réponse quand elle est parlante, sinon la question. */
function ficheQuery(q) {
  const ans = String(q.answerText || '');
  if (q.type === 'CARTE') return ans;
  if (q.media && q.media.kind === 'youtube') return ans.split(/\s[–-]\s/).reverse().join(' ');
  if (q.type === 'QCM' && !/^[\d\s.,]+$/.test(ans) && ans.length > 2) return ans;
  return q.text.replace(/[?!«»"📸📍🎵🎬]/g, ' ').replace(/\b(quel|quelle|quels|quelles|qui|combien|en quelle année|est-ce que)\b/gi, ' ');
}

/** Résumé Wikipédia, demandé directement par le navigateur (aucune autorisation Google nécessaire). */
function wikiFiche(query) {
  const url = 'https:\/\/fr.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&generator=search&gsrlimit=1'
    + '&prop=extracts|pageimages|info&exintro=1&explaintext=1&exsentences=4&piprop=thumbnail&pithumbsize=400&inprop=url'
    + '&gsrsearch=' + encodeURIComponent(String(query).slice(0, 200));
  return fetch(url).then(r => r.json()).then(d => {
    const pg = ((d.query || {}).pages || [])[0];
    return pg && pg.extract ? { title: pg.title, extract: pg.extract, url: pg.fullurl, thumb: pg.thumbnail ? pg.thumbnail.source : '' } : null;
  });
}

function loadFiche(v) {
  const q = v.current;
  if (!q || A.fiches[q.id] !== undefined || A.ficheLoading === q.id) return;
  A.ficheLoading = q.id;
  wikiFiche(ficheQuery(q)).then(f => { A.fiches[q.id] = f || null; }).catch(() => { A.fiches[q.id] = null; })
    .finally(() => {
      A.ficheLoading = null;
      const box = $('#fiche');
      if (box && A.view && A.view.current && A.view.current.id === q.id) box.innerHTML = ficheHtml(q);
    });
}

/** Réponses des joueurs en temps réel, regroupées par proposition (ou listées pour estimation / ordre). */
function liveAnswers(v) {
  const q = v.current;
  const revealed = !!v.reveal;
  const okOf = p => revealed ? p.ok : p.liveOk;
  const chip = p => `<span class="pill" style="margin:2px;${okOf(p) === true ? 'border-color:var(--ok)' : okOf(p) === false ? 'border-color:var(--ko)' : ''}">
      ${okOf(p) === true ? '✅' : okOf(p) === false ? '❌' : ''} ${esc(p.pseudo)} ${p.joker ? '🃏' : ''}${p.duel ? '⚔️' : ''} <span class="muted" style="font-size:12px">${p.t !== null && p.t !== undefined ? p.t + 's' : ''}</span></span>`;
  const answered = v.players.filter(p => p.answered);
  const waiting = v.players.filter(p => !p.answered);
  let html = '';
  if (q.choices) {
    html = `<div class="grid2" style="grid-template-columns:repeat(${q.choices.length === 2 ? 2 : 2}, 1fr)">${q.choices.map((c, i) => {
      const who = answered.filter(p => revealed ? p.answerText === c : Number(p.a) === i);
      return `<div class="card" style="padding:10px;border-left:6px solid var(--c${i + 1})">
        <div class="row" style="font-weight:700"><span>${SHAPES[i]} ${esc(c)} ${i === q.correct ? '✔' : ''}</span><span class="spacer"></span><span class="pill">${who.length}</span></div>
        <div style="margin-top:6px">${who.map(chip).join('') || '<span class="muted" style="font-size:13px">—</span>'}</div></div>`;
    }).join('')}</div>`;
  } else {
    const kmOf = p => { const m = /à ([\d\s ,.]+) (k?m)/.exec(p.answerText || ''); return m ? parseFloat(m[1].replace(/[\s ]/g, '').replace(',', '.')) / (m[2] === 'm' ? 1000 : 1) : 1e9; };
    const rows = answered.slice().sort((a, b) => q.type === 'CARTE' ? kmOf(a) - kmOf(b) : (a.t || 0) - (b.t || 0));
    html = `<table class="tbl"><thead><tr><th>Joueur</th><th>Réponse</th><th class="num">Temps</th><th></th></tr></thead><tbody>
      ${rows.map(p => `<tr><td><b>${esc(p.pseudo)}</b></td><td>${esc(p.answerText)}</td><td class="num">${p.t !== null ? p.t + ' s' : ''}</td>
        <td>${okOf(p) === true ? '✅' : okOf(p) === false ? '❌' : ''}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Aucune réponse pour l\'instant</td></tr>'}
      </tbody></table>`;
  }
  return `<div class="col" style="gap:8px"><div class="row"><h3 style="margin:0">📡 Réponses en direct</h3><span class="spacer"></span>
      <span class="muted" style="font-size:13px">${answered.length}/${v.players.length} ont répondu</span></div>
    ${html}
    ${waiting.length && !revealed ? `<div class="muted" style="font-size:13px">⏳ En attente : ${waiting.map(p => esc(p.pseudo)).join(', ')}</div>` : ''}</div>`;
}

function bindMain(v) {
  const p = $('#primary');
  const pa = primaryAction(v);
  if (p && pa && pa.fn) p.onclick = () => act(pa.fn);
  if (v.status === 'LOBBY' && window.QRCode && $('#qrbox')) new QRCode($('#qrbox'), { text: joinLink(v), width: A.qrSize || 200, height: A.qrSize || 200 });
  bindSettings();
  if (v.current && ['INTRO', 'READ', 'QUESTION', 'REVEAL'].indexOf(v.status) >= 0) loadFiche(v);
  const el = $('#amap');
  if (el && v.current && v.current.type === 'CARTE') {
    const q = v.current;
    const r = v.reveal;
    // Le maître du jeu voit la bonne réponse et les points des joueurs en direct
    const pins = r && r.pins ? r.pins : v.players.filter(x => x.a && x.a.length === 2).map(x => ({ pseudo: x.pseudo, lat: Number(x.a[0]), lon: Number(x.a[1]), ok: x.liveOk }));
    makeMap(el, q.zone, { interactive: true }).then(map => drawMapReveal(map, q.target, pins, q.answerText)).catch(() => {});
  }
}

function settingsCard(v) {
  const s = v.settings;
  if (v.status === 'END') return '';
  return `<details class="card settings-card" ${screenType() === 'phone' ? '' : 'open'}><summary class="muted" style="cursor:pointer;font-weight:700">⚙️ Réglages en direct</summary><div class="row" style="font-size:14px;margin-top:8px">
    <label>Ambiance <select id="s-visual" style="width:auto">${Object.keys(VISUALS).map(k => `<option value="${k}" ${k === s.visual ? 'selected' : ''}>${VISUALS[k]}</option>`).join('')}</select></label>
    <label>Blind test <select id="s-audio" style="width:auto"><option value="ecran" ${s.audioOn === 'ecran' ? 'selected' : ''}>son sur l'écran</option><option value="admin" ${s.audioOn === 'admin' ? 'selected' : ''}>son ici</option></select></label>
    <label class="switch"><input type="checkbox" id="s-sounds" ${s.sounds ? 'checked' : ''}> Sons</label>
    <label class="switch"><input type="checkbox" id="s-auto" ${s.autoReveal ? 'checked' : ''}> Révélation auto</label>
    <span class="muted">· ${s.duration}s · points : ${{ simple: '1 par bonne réponse', rapidite: 'rapidité', series: 'rapidité + séries' }[s.points]}${s.joker ? ' · 🃏 joker 50/50' : ''}${s.bonus ? ' · ⭐ questions en or' : ''}${s.finale ? ' · 🏁 finale ×3' : ''}</span>
  </div></details>`;
}

function bindSettings() {
  const upd = patch => act('adminUpdateSettings', patch);
  const on = (id, fn) => { const el = $(id); if (el) el.onchange = fn; };
  on('#s-visual', e => upd({ visual: e.target.value }));
  on('#s-audio', e => upd({ audioOn: e.target.value }));
  on('#s-sounds', e => upd({ sounds: e.target.checked }));
  on('#s-auto', e => upd({ autoReveal: e.target.checked }));
}

/* ---------------- Joueurs ---------------- */

function renderPlayers(v) {
  const box = $('#players');
  if (!box) return;
  const cnt = { on: 0, bg: 0, off: 0 };
  v.players.forEach(p => cnt[p.presence]++);
  const showAns = ['QUESTION', 'READ', 'REVEAL'].indexOf(v.status) >= 0;
  box.innerHTML = `<div class="row" style="margin-bottom:6px"><h3 style="margin:0">Joueurs (${v.players.length})</h3><span class="spacer"></span>
      <span class="muted" style="font-size:13px"><span class="dot on"></span> ${cnt.on} <span class="dot bg"></span> ${cnt.bg} <span class="dot off"></span> ${cnt.off}</span></div>
    ${v.players.length ? '' : '<p class="muted">En attente de joueurs…</p>'}
    ${v.players.map(p => {
      let st = '';
      if (showAns) {
        if (p.ok === true) st = `✅ ${esc(p.answerText)} <b>+${p.pts}</b>`;
        else if (p.ok === false) st = p.answered ? `❌ ${esc(p.answerText)}` : '⌛ pas de réponse';
        else st = p.answered ? `📨 ${esc(p.answerText)} · ${p.t}s` : '… réfléchit';
      }
      const pres = { on: 'En ligne', bg: 'A quitté l\'appli', off: 'Déconnecté' + (p.lastSeen !== null ? ' depuis ' + p.lastSeen + 's' : '') }[p.presence];
      return `<div class="player" title="${pres}">
        <span class="dot ${p.presence}"></span>
        <div style="min-width:0"><div class="nm">${p.rank}. ${esc(p.pseudo)} ${playerBadges(v, p)} ${p.streak >= 3 ? '🔥' : ''} ${p.exits ? `<span title="Sorties de l'appli pendant une question" style="color:var(--ko)">⚠${p.exits}</span>` : ''}</div>
          ${st ? `<div class="st">${st}</div>` : ''}</div>
        <span class="muted" style="font-size:12px">${p.good}✔</span>
        <span class="sc">${p.score}</span>
        <button class="x" title="Retirer" onclick="kick('${p.pid}', '${esc(p.pseudo).replace(/'/g, '')}')">✕</button></div>`;
    }).join('')}`;
}

function kick(pid, name) {
  if (confirm('Retirer ' + name + ' de la partie ?')) act('adminKick', pid);
}

/* ---------------- Chrono + révélation automatique ---------------- */

setInterval(() => {
  const v = A.view;
  if (v && v.status === 'INTRO') {
    const el = $('#aintro');
    if (el) el.textContent = introLeft(v);
    if (introLeft(v) <= 0) refreshPartie();
    return;
  }
  if (!v || v.status !== 'QUESTION' || !v.current) return;
  const rem = Clock.remaining(v.current.start, v.settings.duration);
  const bar = $('#tbar');
  if (bar) { bar.firstElementChild.style.width = (100 * rem / v.settings.duration) + '%'; bar.classList.toggle('warn', rem <= 5); $('#tnum').textContent = Math.ceil(rem); }
  const allIn = v.players.length > 0 && v.answeredCount >= v.players.length;
  if (v.settings.autoReveal && (rem <= 0 || allIn) && A.autoRevealFor !== v.qIndex + '|' + v.current.id) {
    A.autoRevealFor = v.qIndex + '|' + v.current.id;
    setTimeout(() => { if (A.view.status === 'QUESTION') act('adminReveal'); }, allIn ? 800 : 1600);
  }
}, 250);

/* ---------------- Divers ---------------- */

function onKey(e) {
  if (A.tab !== 'partie' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.code === 'Space' || e.code === 'ArrowRight') {
    const p = $('#primary');
    if (p && !p.disabled) { e.preventDefault(); p.click(); }
  }
}

function endGame() {
  if (!confirm('Terminer la partie maintenant ? Les scores seront enregistrés.')) return;
  act('adminEnd');
}

function newGame() {
  A.code = null; A.view = null; A.key = ''; A.presence = {};
  showTab('preparer');
}

function copy(id) {
  const el = $('#' + id);
  el.select();
  try { navigator.clipboard.writeText(el.value).then(() => toast('Copié ✔')); } catch (e) { document.execCommand('copy'); toast('Copié ✔'); }
}

function modal(html) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="card modal col">${html}<div class="actions"><span class="spacer"></span><button class="btn primary" id="mclose">Fermer</button></div></div>`;
  document.body.appendChild(bg);
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  $('#mclose', bg).onclick = () => bg.remove();
  return bg;
}

function showJoin() {
  const v = A.view;
  const m = modal(`<h2>📱 Rejoindre la partie ${esc(v.code)}</h2><div class="center"><div id="qrbig" style="background:#fff;padding:14px;border-radius:12px;display:inline-block"></div></div>
    <input type="text" readonly value="${esc(joinLink(v))}">`);
  new QRCode($('#qrbig', m), { text: joinLink(v), width: 320, height: 320 });
}

function showHelp() {
  modal(`<h2>📺 Diffuser l'écran public</h2>
    <p>L'écran public n'affiche que les questions, les propositions, le chrono et les résultats. Les réponses et les indices restent sur ton interface.</p>
    <h3>💻 PC + HDMI (le plus simple)</h3>
    <ol><li>Branche la TV ou le vidéoprojecteur et choisis <b>« Étendre »</b> l'affichage (Windows : touche ⊞+P, Mac : Réglages → Moniteurs).</li>
    <li>Clique sur <b>📺 Écran public</b> : un nouvel onglet s'ouvre. Glisse-le sur la TV et passe en plein écran (F11 ou ⌃⌘F).</li>
    <li>Clique une fois sur l'écran public pour activer le son.</li></ol>
    <h3>📱 iPad + AirPlay / Apple TV</h3>
    <p>AirPlay <b>recopie</b> tout l'écran de l'iPad, y compris les réponses. Deux solutions :</p>
    <ul><li>Ouvre le lien de l'écran public sur un <b>autre appareil</b> (vieux téléphone, ordinateur) et c'est lui qui fait l'AirPlay.</li>
    <li>Ou pilote la partie depuis ton téléphone et diffuse l'iPad, qui n'affiche que l'écran public.</li></ul>
    <h3>📺 Smart TV / Chromecast</h3>
    <ul><li>Ouvre le lien de l'écran public dans le navigateur de la TV.</li>
    <li>Ou, depuis Chrome sur un ordinateur : ouvre l'écran public, puis menu ⋮ → <b>Caster…</b> → <b>Caster l'onglet</b>.</li></ul>
    <p class="muted">Astuce : copie le lien de l'écran public depuis la salle d'attente et envoie-le-toi par message.</p>`);
}
