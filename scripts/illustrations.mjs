/**
 * Illustre les questions existantes avec des photos libres de Wikimedia Commons.
 *
 * Principe : on n'illustre JAMAIS la réponse — seulement le sujet dont parle la
 * question. « En quelle année la tour Eiffel a-t-elle été inaugurée ? » reçoit une
 * photo de la tour ; « Quel monument symbolise Paris ? » n'en reçoit pas, sinon
 * la question est offerte. Le script refuse tout seul les cas où le mot cherché
 * apparaît dans la réponse.
 *
 * Chaque image est vérifiée (elle se télécharge vraiment) et son auteur est noté :
 * le crédit s'affiche en petit sous la photo, comme le demandent les licences.
 *
 * Le travail est repris là où il s'est arrêté : scripts/illustrations-trouvees.json.
 *
 *   node scripts/illustrations.mjs          → cherche puis écrit le SQL
 *   node scripts/illustrations.mjs --sql    → réécrit le SQL sans rien rechercher
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const CACHE = path.join(ROOT, 'scripts/illustrations-trouvees.json');
const UA = 'QuizzConstance/1.0 (quiz familial privé)';

/* ------------------------------------------------------------------ */
/* Les sujets à illustrer                                              */
/* [ mot cherché dans la question, recherche Commons, mots attendus    */
/*   dans le titre du fichier (facultatif) ]                           */
/* ------------------------------------------------------------------ */

const SUJETS = [
  // Monuments et lieux
  ['tour Eiffel', 'Eiffel Tower Paris', ['eiffel']],
  ['Joconde', 'Mona Lisa Leonardo', ['mona lisa', 'joconde']],
  ['Louvre', 'Louvre Pyramid Paris', ['louvre']],
  ['Notre-Dame', 'Notre-Dame de Paris cathedral', ['notre']],
  ['Mont-Saint-Michel', 'Mont Saint-Michel', ['mont']],
  ['Versailles', 'Château de Versailles facade', ['versailles']],
  ['Arc de Triomphe', 'Arc de Triomphe Paris', ['arc de triomphe']],
  ['Sacré-Cœur', 'Sacré-Cœur Montmartre basilica', ['sacre', 'sacré']],
  ['Colisée', 'Colosseum Rome', ['colosseum', 'colisee', 'colosseo']],
  ['tour de Pise', 'Leaning Tower of Pisa', ['pisa', 'pise']],
  ['Big Ben', 'Big Ben London', ['big ben']],
  ['Statue de la Liberté', 'Statue of Liberty New York', ['liberty']],
  ['Taj Mahal', 'Taj Mahal', ['taj']],
  ['Grande Muraille', 'Great Wall of China', ['great wall', 'muraille']],
  ['Machu Picchu', 'Machu Picchu', ['machu']],
  ['Stonehenge', 'Stonehenge', ['stonehenge']],
  ['Acropole', 'Parthenon Acropolis Athens', ['parthenon', 'acropolis']],
  ['pyramides', 'Pyramids of Giza', ['giza', 'pyramid']],
  ['Kremlin', 'Moscow Kremlin Red Square', ['kremlin']],
  ['Golden Gate', 'Golden Gate Bridge', ['golden gate']],
  ['Christ Rédempteur', 'Christ the Redeemer Rio', ['christ']],
  ['Sagrada Família', 'Sagrada Familia Barcelona', ['sagrada']],
  ['Alhambra', 'Alhambra Granada', ['alhambra']],
  ['Chambord', 'Château de Chambord', ['chambord']],
  ['Carcassonne', 'Cité de Carcassonne', ['carcassonne']],
  ['Pont du Gard', 'Pont du Gard', ['pont du gard']],
  ['Angkor', 'Angkor Wat', ['angkor']],
  ['Petra', 'Petra Jordan Treasury', ['petra', 'treasury']],

  // Villes
  ['Venise', 'Venice Grand Canal', ['venice', 'venezia', 'venise']],
  ['Marseille', 'Marseille Vieux-Port', ['marseille']],
  ['Lyon', 'Lyon Fourvière panorama', ['lyon']],
  ['Bordeaux', 'Bordeaux Place de la Bourse', ['bordeaux']],
  ['Strasbourg', 'Strasbourg Petite France', ['strasbourg']],
  ['New York', 'Manhattan skyline New York', ['manhattan', 'new york']],
  ['Tokyo', 'Tokyo skyline Shibuya', ['tokyo']],
  ['Londres', 'London Tower Bridge', ['london', 'tower bridge']],
  ['Berlin', 'Brandenburg Gate Berlin', ['brandenburg', 'berlin']],
  ['Rio de Janeiro', 'Rio de Janeiro Sugarloaf', ['rio']],
  ['Sydney', 'Sydney Opera House', ['sydney']],
  ['Istanbul', 'Hagia Sophia Istanbul', ['hagia', 'istanbul']],
  ['Moscou', 'Saint Basil Cathedral Moscow', ['basil', 'moscow']],

  // Nature et géographie
  ['Everest', 'Mount Everest summit', ['everest']],
  ['Mont Blanc', 'Mont Blanc massif', ['mont blanc']],
  ['Kilimandjaro', 'Kilimanjaro mountain', ['kilimanjaro']],
  ['Sahara', 'Sahara desert dunes', ['sahara']],
  ['Amazone', 'Amazon River rainforest', ['amazon']],
  ['Nil', 'Nile river Egypt', ['nile']],
  ['Grand Canyon', 'Grand Canyon', ['grand canyon']],
  ['Niagara', 'Niagara Falls', ['niagara']],
  ['Islande', 'Iceland landscape waterfall', ['iceland']],
  ['Antarctique', 'Antarctica iceberg landscape', ['antarctic']],
  ['Vésuve', 'Mount Vesuvius Naples', ['vesuv']],
  ['Étna', 'Mount Etna eruption', ['etna']],
  ['Galápagos', 'Galapagos Islands landscape', ['galapagos']],
  ['barrière de corail', 'Great Barrier Reef coral', ['barrier reef', 'coral']],

  // Animaux
  ['éléphant', 'African elephant savanna', ['elephant']],
  ['girafe', 'Giraffe savanna', ['giraffe']],
  ['manchot', 'Emperor penguin Antarctica', ['penguin']],
  ['pingouin', 'Razorbill bird', ['razorbill', 'alca']],
  ['caméléon', 'Chameleon close-up', ['chameleon']],
  ['ornithorynque', 'Platypus', ['platypus']],
  ['pieuvre', 'Octopus underwater', ['octopus']],
  ['abeille', 'Honey bee flower', ['bee', 'apis']],
  ['baleine', 'Humpback whale breaching', ['whale']],
  ['requin', 'Great white shark', ['shark']],
  ['koala', 'Koala eucalyptus', ['koala']],
  ['panda', 'Giant panda bamboo', ['panda']],
  ['tortue', 'Sea turtle underwater', ['turtle']],
  ['flamant rose', 'Flamingo group', ['flamingo']],
  ['loup', 'Grey wolf', ['wolf', 'lupus']],
  ['guépard', 'Cheetah running', ['cheetah']],
  ['ours polaire', 'Polar bear ice', ['polar bear']],
  ['hibou', 'Owl close-up', ['owl']],
  ['papillon', 'Butterfly wings macro', ['butterfly']],
  ['dauphin', 'Bottlenose dolphin', ['dolphin']],

  // Sciences et espace
  ['Lune', 'Full Moon photograph', ['moon']],
  ['Mars', 'Mars planet surface', ['mars']],
  ['Saturne', 'Saturn planet rings', ['saturn']],
  ['Jupiter', 'Jupiter planet', ['jupiter']],
  ['Soleil', 'Sun solar surface', ['sun', 'sol']],
  ['Voie lactée', 'Milky Way night sky', ['milky way']],
  ['ADN', 'DNA double helix structure', ['dna']],
  ['squelette', 'Human skeleton anatomy', ['skeleton']],
  ['cerveau', 'Human brain anatomy', ['brain']],
  ['volcan', 'Volcano eruption lava', ['volcano', 'eruption']],
  ['microscope', 'Optical microscope', ['microscope']],
  ['dinosaure', 'Tyrannosaurus skeleton museum', ['tyrannosaurus', 'dinosaur']],

  // Art et objets
  ['Van Gogh', 'Van Gogh Starry Night', ['starry night', 'van gogh']],
  ['Picasso', 'Picasso Guernica museum', ['picasso']],
  ['Monet', 'Claude Monet Impression Sunrise', ['monet']],
  ['Michel-Ange', 'Sistine Chapel ceiling Michelangelo', ['sistine', 'michelangelo']],
  ['Cène', 'Last Supper Leonardo da Vinci', ['last supper', 'cenacolo']],
  ['Vénus de Milo', 'Venus de Milo Louvre', ['venus de milo']],
  ['Penseur', 'The Thinker Rodin', ['thinker', 'penseur']],
  ['Guernica', 'Guernica Picasso', ['guernica']],

  // Gastronomie
  ['croissant', 'Croissant pastry', ['croissant']],
  ['fromage', 'French cheese platter', ['cheese', 'fromage']],
  ['champagne', 'Champagne bottle glasses', ['champagne']],
  ['sushi', 'Sushi plate', ['sushi']],
  ['pizza', 'Pizza margherita', ['pizza']],
  ['paella', 'Paella valenciana', ['paella']],
  ['couscous', 'Couscous dish', ['couscous']],
  ['macaron', 'Macarons colorful', ['macaron']],
  ['baguette', 'French baguette bread', ['baguette']],
  ['chocolat', 'Chocolate bar pieces', ['chocolate']],

  // Sport
  ['Tour de France', 'Tour de France peloton', ['tour de france']],
  ['Roland-Garros', 'Roland Garros clay court', ['roland']],
  ['Wimbledon', 'Wimbledon Centre Court', ['wimbledon']],
  ['Jeux olympiques', 'Olympic rings stadium', ['olympic']],
  ['marathon', 'Marathon runners race', ['marathon']],
  ['Stade de France', 'Stade de France stadium', ['stade de france']],
];

/* ------------------------------------------------------------------ */
/* Recherche d'une image                                               */
/* ------------------------------------------------------------------ */

const attendre = ms => new Promise(r => setTimeout(r, ms));

/**
 * Wikimedia limite le débit (HTTP 429) : on patiente de plus en plus longtemps
 * plutôt que d'abandonner. Sans ça, la moitié des images passent à la trappe.
 */
async function patient(url, opts) {
  const attentes = [2000, 5000, 12000, 25000];
  for (let essai = 0; essai <= attentes.length; essai++) {
    try {
      const r = await fetch(url, Object.assign({ headers: { 'User-Agent': UA } }, opts || {}));
      if (r.status === 429 || r.status >= 500) throw new Error('HTTP ' + r.status);
      return r;
    } catch (e) {
      if (essai === attentes.length) throw e;
      await attendre(attentes[essai]);
    }
  }
}

async function json(url) {
  const r = await patient(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return await r.json();
}

const sansBalises = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/** L'adresse définitive : upload.wikimedia.org, sans les paramètres de suivi. */
function urlPropre(thumburl) {
  return String(thumburl || '').split('?')[0].replace('//thumb.wikimedia.org/', '//upload.wikimedia.org/');
}

/** Licences qu'on accepte : domaine public et Creative Commons, rien d'autre. */
function licenceOk(lic) {
  const l = String(lic || '').toLowerCase();
  return /public domain|cc0|cc by|cc-by|attribution|pdm/.test(l) && !/non-?commercial|nc\b|nd\b/.test(l);
}

/** Écarte ce qui ne ferait pas une belle illustration à l'écran. */
function utilisable(titre) {
  const t = titre.toLowerCase();
  if (/\.(svg|gif|tif|webm|ogv|pdf|xcf)$/.test(t)) return false;
  return !/(map|carte|diagram|logo|coat of arms|flag|chart|graph|plan |blason|locator|icon|signature|stamp|timbre)/.test(t);
}

/** Cherche la meilleure image pour un sujet. */
async function chercher(recherche, attendus) {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search'
    + '&gsrsearch=' + encodeURIComponent(recherche) + '&gsrnamespace=6&gsrlimit=25'
    + '&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1000';
  const j = await json(url);
  const pages = Object.values((j.query && j.query.pages) || {});
  const notes = [];
  for (const p of pages) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii) continue;
    const titre = String(p.title).replace(/^File:/, '');
    if (!utilisable(titre)) continue;
    const m = ii.extmetadata || {};
    const lic = (m.LicenseShortName || {}).value || '';
    if (!licenceOk(lic)) continue;
    if (ii.width < 640) continue;
    let note = 0;
    const tb = titre.toLowerCase();
    // le titre parle-t-il bien du sujet ?
    (attendus || []).forEach(a => { if (tb.indexOf(a) >= 0) note += 6; });
    // format paysage : mieux pour un écran de télévision
    const ratio = ii.width / ii.height;
    if (ratio >= 1.2 && ratio <= 2.2) note += 3;
    else if (ratio > 1) note += 1;
    if (/public domain|cc0|pdm/i.test(lic)) note += 1;   // pas de crédit obligatoire
    if (ii.width >= 1600) note += 1;
    notes.push({
      note: note, titre: titre, url: urlPropre(ii.thumburl),
      largeur: ii.width, hauteur: ii.height, licence: lic,
      auteur: sansBalises((m.Artist || {}).value).slice(0, 60),
      page: ii.descriptionurl || '',
    });
  }
  notes.sort((a, b) => b.note - a.note);
  // on ne garde que si le titre correspond vraiment au sujet cherché
  return notes.find(x => x.note >= 6) || null;
}

/** Vérifie que l'image se télécharge bien (une adresse morte gâcherait la partie). */
async function verifier(url) {
  try {
    const r = await patient(url, { method: 'HEAD' });
    return r.ok && /^image\//.test(r.headers.get('content-type') || '');
  } catch (e) {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Association aux questions                                           */
/* ------------------------------------------------------------------ */

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

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function ecrireSql(trouvees) {
  const banque = [];
  for (const f of ['questions', 'questions-repliques', 'questions-dates', 'questions-devinettes', 'questions-citations']) {
    const p = path.join(ROOT, 'supabase/' + f + '.csv');
    if (fs.existsSync(p)) banque.push(...parseCsv(fs.readFileSync(p, 'utf8')));
  }
  const lignes = [];
  const resume = [];
  const dejaPris = new Set();

  SUJETS.forEach(([mot, recherche]) => {
    const img = trouvees[recherche];
    if (!img || !img.url) return;
    const m = norm(mot);
    const cibles = banque.filter(r => {
      if (dejaPris.has(r.id)) return false;
      if (String(r.media_url || '').trim()) return false;          // déjà illustrée
      if (String(r.type).toUpperCase() === 'CARTE') return false;   // la carte est déjà le support
      if (norm(r.question).indexOf(m) < 0) return false;            // le sujet doit être dans la question
      // jamais illustrer la réponse : ce serait offrir la question
      if (norm(r.reponse).indexOf(m) >= 0) return false;
      if ([r.choix2, r.choix3, r.choix4].some(c => norm(c || '').indexOf(m) >= 0)) return false;
      return true;
    });
    if (!cibles.length) return;
    cibles.forEach(r => dejaPris.add(r.id));
    const credit = img.auteur ? img.auteur + ' · ' + img.licence : img.licence;
    lignes.push(`-- ${mot} → ${img.titre}`);
    lignes.push(`update questions set media_url = '${img.url.replace(/'/g, "''")}', `
      + `media_credit = '${credit.replace(/'/g, "''")}' where id in (`
      + cibles.map(r => `'${r.id}'`).join(', ') + ');');
    resume.push({ mot: mot, n: cibles.length, titre: img.titre });
  });

  const sql = `-- Illustrations libres (Wikimedia Commons) ajoutées aux questions existantes.
--
-- Les photos montrent le SUJET de la question, jamais sa réponse : aucune question
-- n'est offerte. Le crédit de l'auteur s'affiche en petit sous la photo, comme les
-- licences le demandent.
-- À coller dans Supabase → SQL Editor → Run. Sans risque si déjà passé.

alter table questions add column if not exists media_credit text;

${lignes.join('\n')}

select count(*) as questions_illustrees from questions where media_url <> '' and media_url is not null;
`;
  fs.writeFileSync(path.join(ROOT, 'supabase/maj-illustrations.sql'), sql);
  const total = resume.reduce((a, x) => a + x.n, 0);
  console.log(`\n${total} questions illustrées par ${resume.length} images → supabase/maj-illustrations.sql`);
  resume.sort((a, b) => b.n - a.n).slice(0, 15).forEach(x => console.log(`  ${String(x.n).padStart(3)} × ${x.mot}`));
}

/* ------------------------------------------------------------------ */

const trouvees = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

if (process.argv.includes('--sql')) {
  ecrireSql(trouvees);
} else {
  let n = 0;
  for (const [mot, recherche, attendus] of SUJETS) {
    n++;
    if (trouvees[recherche]) { console.log(`${n}/${SUJETS.length} ⏭  ${mot} (déjà trouvé)`); continue; }
    try {
      const img = await chercher(recherche, attendus);
      if (!img) { console.log(`${n}/${SUJETS.length} ❌ ${mot} — rien de convaincant`); trouvees[recherche] = null; }
      else if (!(await verifier(img.url))) { console.log(`${n}/${SUJETS.length} ❌ ${mot} — image injoignable`); trouvees[recherche] = null; }
      else {
        trouvees[recherche] = img;
        console.log(`${n}/${SUJETS.length} ✅ ${mot} → ${img.titre.slice(0, 50)} (${img.licence})`);
      }
    } catch (e) {
      console.log(`${n}/${SUJETS.length} ⚠️  ${mot} — ${e.message}`);
    }
    fs.writeFileSync(CACHE, JSON.stringify(trouvees, null, 1));   // on peut s'arrêter à tout moment
    await attendre(1200);                                         // on ne bouscule pas Commons
  }
  ecrireSql(trouvees);
}
