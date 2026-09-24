/**
 * Le Quizz de Constance — point d'entrée, menu et installation du Google Sheet.
 */

const APP_NAME = 'Le Quizz de Constance';

const SH = {
  QUESTIONS: 'Questions',
  PARTIES: 'Parties',
  REPONSES: 'Réponses',
  CLASSEMENT: 'Classement',
  PAR_THEME: 'Classement par thème',
  MONTAGES: 'Montages',
};

const HEADERS = {
  'Questions': ['ID', 'Thème', 'Catégorie', 'Difficulté', 'Type', 'Question', 'Réponse', 'Choix 2', 'Choix 3', 'Choix 4',
    'Explication', 'Indices MJ', 'Média (URL)', 'Début média (s)', 'Durée média (s)', 'Actif', 'Utilisations', 'Époque', 'Anecdote MJ'],
  'Parties': ['Code', 'Date', 'Chapitres', 'Nb questions', 'Mode points', 'Mode estimation', 'Nb joueurs', 'Vainqueur', 'Score vainqueur', 'Podium'],
  'Réponses': ['Date', 'Partie', 'Chapitre', 'N°', 'ID question', 'Thème', 'Catégorie', 'Difficulté', 'Joueur',
    'Réponse donnée', 'Correct', 'Temps (s)', 'Points'],
  'Classement': ['Rang', 'Pseudo', 'Parties', 'Victoires', 'Points', 'Bonnes réponses', 'Questions', '% réussite',
    'Meilleur score', 'Temps moyen (s)', 'Dernière partie'],
  'Classement par thème': ['Pseudo'],
  'Montages': ['Nom', 'Description', 'Configuration (JSON)', 'Créé le'],
};

// Index des colonnes de l'onglet Questions (base 0)
const QC = {
  ID: 0, THEME: 1, CAT: 2, DIFF: 3, TYPE: 4, TEXTE: 5, REP: 6, C2: 7, C3: 8, C4: 9,
  EXPL: 10, INDICES: 11, MEDIA: 12, DEBUT: 13, DUREE: 14, ACTIF: 15, UTIL: 16, EPOQUE: 17, ANECDOTE: 18,
};

const EPOQUES = ['Avant 1970', 'Années 70', 'Années 80', 'Années 90', 'Années 2000', 'Années 2010', 'Années 2020'];

/** Époque à partir d'une année (1987 -> « Années 80 »). */
function eraOf_(year) {
  const y = Number(year);
  if (!y || y < 1000) return '';
  if (y < 1970) return EPOQUES[0];
  const i = Math.min(EPOQUES.length - 1, 1 + Math.floor((y - 1970) / 10));
  return EPOQUES[i];
}

/** Époque déduite de la première année (19xx / 20xx) trouvée dans un texte, ex. l'explication. */
function eraFromText_(txt) {
  const m = String(txt || '').match(/\b(19\d\d|20[0-2]\d)\b/);
  return m ? eraOf_(m[1]) : '';
}

/** Pour les questions classiques : époque seulement si le sujet date d'après 1950 (la Révolution n'est pas « Avant 1970 »). */
function eraRecent_(txt) {
  const m = String(txt || '').match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  return m ? eraOf_(m[1]) : '';
}

/** Époque d'une question de la banque : année fournie, sinon déduite du texte. */
function eraOfQuestion_(q) {
  if (q.annee) return eraOf_(q.annee);
  if (/youtu/.test(String(q.media || ''))) return eraFromText_(q.expl);
  return eraRecent_([q.texte, q.rep, q.expl].join(' '));
}

const TYPES = ['QCM', 'VF', 'ESTIMATION', 'ORDRE', 'CARTE'];

/* ------------------------------------------------------------------ */
/* Web app                                                             */
/* ------------------------------------------------------------------ */

function doGet(e) {
  const p = (e && e.parameter) || {};
  // Lien principal (sans paramètre) = maître du jeu : c'est lui qui diffuse le QR code.
  // Les joueurs arrivent avec ?p=CODE (QR code) ou ?v=joueur ; l'écran public avec ?v=ecran.
  let view = 'Admin';
  if (p.p || p.v === 'joueur') view = 'Joueur';
  else if (p.v === 'ecran') view = 'Ecran';

  const t = HtmlService.createTemplateFromFile(view);
  t.code = String(p.p || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  t.url = ScriptApp.getService().getUrl();

  return t.evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/* ------------------------------------------------------------------ */
/* Menu du Sheet                                                       */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🎯 Quizz')
    .addItem('1. Installer les onglets', 'installerOnglets')
    .addItem('2. Importer la banque de questions', 'importerBanque')
    .addSeparator()
    .addItem('Changer le code maître du jeu', 'changerCodeMJ')
    .addItem('Afficher les liens de la web app', 'afficherLiens')
    .addItem('Recalculer les classements', 'recalculerClassement')
    .addItem('Vérifier les fichiers de la web app', 'verifierFichiers')
    .addToUi();
}

function installerOnglets() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(HEADERS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const h = HEADERS[name];
    sh.getRange(1, 1, 1, h.length).setValues([h])
      .setFontWeight('bold').setBackground('#1f2a5c').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  });

  const q = ss.getSheetByName(SH.QUESTIONS);
  q.setColumnWidth(QC.TEXTE + 1, 420);
  q.setColumnWidth(QC.EXPL + 1, 280);
  q.setColumnWidth(QC.INDICES + 1, 220);
  q.setColumnWidth(QC.ANECDOTE + 1, 320);
  const col = i => q.getRange(2, i + 1, q.getMaxRows() - 1, 1);
  col(QC.DIFF).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['1', '2', '3', '4', '5']).setAllowInvalid(true).build());
  col(QC.TYPE).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(TYPES).setAllowInvalid(false).build());
  col(QC.ACTIF).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['oui', 'non']).build());

  ['Feuille 1', 'Sheet1'].forEach(n => {
    const s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s);
  });

  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_PIN')) {
    PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', '1234');
  }
  SpreadsheetApp.getUi().alert('Onglets installés ✅\nCode maître du jeu par défaut : 1234 (à changer dans le menu 🎯 Quizz).');
}

function importerBanque() {
  const sh = sheet_(SH.QUESTIONS);
  if (!sh) return SpreadsheetApp.getUi().alert("Lance d'abord « Installer les onglets ».");
  sh.getRange(1, 1, 1, HEADERS.Questions.length).setValues([HEADERS.Questions])
    .setFontWeight('bold').setBackground('#1f2a5c').setFontColor('#ffffff');

  // Clé de doublon : texte + média + réponse (plusieurs blind tests ou « Classez… » partagent le même intitulé)
  const key = (texte, media, rep) => String(texte).trim().toLowerCase() + '|' + String(media || '').trim() + '|' + String(rep).trim().toLowerCase();
  const existing = new Set();
  const rowOf = {}; // clé -> index dans data (pour mettre à jour thème/catégorie des blind tests déjà importés)
  let maxId = 0;
  const data = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.Questions.length).getValues() : [];
  if (data.length) {
    data.forEach((r, i) => {
      existing.add(key(r[QC.TEXTE], r[QC.MEDIA], r[QC.REP]));
      rowOf[key(r[QC.TEXTE], r[QC.MEDIA], r[QC.REP])] = i;
      const n = parseInt(String(r[QC.ID]).replace(/\D/g, ''), 10);
      if (n > maxId) maxId = n;
    });
  }

  const banque = [].concat(banque1_(), banque2_(), banque3_(), banque4_(), banque5_(), banque6_(), banque7_(),
    banque8_(), banque9_(), banqueAnnees_(), banqueInsolite_(), banqueActualite_(), banquePhotos_(), banqueCarte_(),
    banqueBlindTest_(), banqueBlindTest2_(), banqueBlindTest3_());
  const anec = anecdotes_();
  const rows = [];
  let moved = 0;
  const meta = data.map(r => [r[QC.THEME], r[QC.CAT], r[QC.EPOQUE] || '', r[QC.ANECDOTE] || '']);
  banque.forEach(b => {
    // b = [thème, catégorie, difficulté, type, question, réponse, choix2, choix3, choix4, explication, indices, média, début, durée, année, anecdote]
    const q = {
      theme: b[0], cat: b[1], diff: b[2], type: b[3], texte: b[4], rep: b[5], c2: b[6], c3: b[7], c4: b[8], expl: b[9],
      indices: b[10], media: b[11], debut: b[12], duree: b[13], annee: b[14],
    };
    q.epoque = eraOfQuestion_(q);
    q.anecdote = b[15] || anec[String(b[4]).trim()] || '';
    const k = key(b[4], b[11], b[5]);
    if (existing.has(k)) {
      // Question déjà présente : on complète thème / catégorie / époque / anecdote (le reste, dont le début d'extrait, est conservé)
      const i = rowOf[k];
      if (i === undefined) return;
      const m = meta[i];
      const upd = [b[11] ? b[0] : m[0], b[11] ? b[1] : m[1], q.epoque || m[2], m[3] || q.anecdote];
      if (upd.join('|') !== m.join('|')) { meta[i] = upd; moved++; }
      return;
    }
    existing.add(k);
    maxId++;
    rows.push(questionRow_(nextId_(maxId), q));
  });
  if (moved) {
    sh.getRange(2, QC.THEME + 1, meta.length, 2).setValues(meta.map(m => [m[0], m[1]]));
    sh.getRange(2, QC.EPOQUE + 1, meta.length, 2).setValues(meta.map(m => [m[2], m[3]]));
  }
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  SpreadsheetApp.getUi().alert(rows.length + ' questions importées ✅' + (moved ? '\n' + moved + ' questions existantes complétées (époque, anecdote, classement).' : ''));
}

/**
 * Diagnostic : construit chaque page telle que Google la sert et teste chacun de ses blocs de script.
 * Pour un bloc en erreur, affiche la ligne exacte qui pose problème.
 * À lancer depuis le menu 🎯 Quizz ou depuis l'éditeur (▶ Exécuter).
 */
function verifierFichiers() {
  const out = [];
  ['Admin', 'Ecran', 'Joueur'].forEach(page => {
    try {
      const t = HtmlService.createTemplateFromFile(page);
      t.url = ScriptApp.getService().getUrl() || 'https://exemple';
      t.code = '';
      const html = t.evaluate().getContent();
      const re = /<script>([\s\S]*?)<\/script>/g;
      let m, n = 0, bad = 0;
      while ((m = re.exec(html))) {
        n++;
        const code = m[1];
        try { new Function(code); } catch (e) {
          bad++;
          const lines = code.split('\n');
          let at = -1;
          for (let k = 1; k <= lines.length && at < 0; k++) {
            const last = lines[k - 1];
            if (last.indexOf('/*') >= 0 && last.indexOf('*/') < 0) continue; // commentaire ouvert : pas une vraie erreur
            try { new Function(lines.slice(0, k).join('\n') + '\n/* */'); } catch (e2) { if (e2.message === e.message) at = k; }
          }
          out.push('❌ ' + page + ', bloc n°' + n + ' : ' + e.message);
          if (at > 0) for (let k = Math.max(0, at - 2); k < at; k++) out.push('    ligne ' + (k + 1) + ' : ' + JSON.stringify(lines[k].slice(0, 220)));
        }
      }
      out.push((bad ? '❌ ' : '✅ ') + page + ' : ' + n + ' blocs de script testés, ' + bad + ' en erreur.');
    } catch (e) {
      out.push('❌ ' + page + ' : impossible de construire la page : ' + e.message);
    }
  });
  const txt = out.join('\n');
  console.log(txt);
  try { SpreadsheetApp.getUi().alert('Vérification des fichiers', txt, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
  return txt;
}

function changerCodeMJ() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Nouveau code maître du jeu', 'Choisis un code (4 caractères minimum) :', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const pin = r.getResponseText().trim();
  if (pin.length < 4) return ui.alert('4 caractères minimum.');
  PropertiesService.getScriptProperties().setProperty('ADMIN_PIN', pin);
  ui.alert('Code enregistré ✅');
}

function afficherLiens() {
  const url = ScriptApp.getService().getUrl();
  const html = url
    ? `<div style="font-family:sans-serif;font-size:14px">
         <p><b>Maître du jeu (lien principal) :</b><br><a target="_blank" href="${url}">${url}</a></p>
         <p><b>Écran public (lien permanent, suit toujours la dernière partie) :</b><br><a target="_blank" href="${url}?v=ecran">${url}?v=ecran</a></p>
         <p><b>Joueurs :</b> ils scannent le QR code affiché par le maître du jeu, ou ouvrent <a target="_blank" href="${url}?v=joueur">${url}?v=joueur</a> et tapent le code.</p></div>`
    : '<p style="font-family:sans-serif">La web app n\'est pas encore déployée (Déployer → Nouveau déploiement).</p>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(560).setHeight(220), 'Liens');
}

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function sheet_(name) {
  return SpreadsheetApp.getActive().getSheetByName(name);
}

function nextId_(n) {
  return 'Q' + ('000' + n).slice(-4);
}

function questionRow_(id, q) {
  const v = x => (x === undefined || x === null ? '' : x);
  return [id, v(q.theme), v(q.cat), Number(q.diff) || 1, String(q.type || 'QCM').toUpperCase(), v(q.texte), v(q.rep),
    v(q.c2), v(q.c3), v(q.c4), v(q.expl), v(q.indices), v(q.media), v(q.debut), v(q.duree), q.actif || 'oui', 0,
    v(q.epoque) || eraOfQuestion_(q), v(q.anecdote)];
}

function shuffle_(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPin_() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_PIN') || '1234';
}

function checkPin_(pin) {
  if (String(pin) !== getPin_()) throw new Error('Code maître du jeu incorrect.');
}
