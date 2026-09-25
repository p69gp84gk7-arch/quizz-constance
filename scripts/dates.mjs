/**
 * Questions de dates, dans le sens inverse de ce que la banque contenait déjà.
 *
 * La banque comptait 77 questions « En quelle année… ? » mais seulement 3 de la
 * forme « Que s'est-il passé en 1969 ? ». Ce script produit :
 *   - 60 questions « Que s'est-il passé en telle année ? » (QCM, 4 événements)
 *   - 8 questions de classement chronologique
 * Elles deviennent automatiquement des réponses à taper aux niveaux difficiles.
 *
 * Usage : node scripts/dates.mjs  →  supabase/questions-dates.csv
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

// [année, événement, thème, difficulté, explication]
const E = [
  [1783, 'Le premier vol habité en ballon, par les frères Montgolfier', 'Sciences', 4, "Le 21 novembre 1783 au-dessus de Paris : 25 minutes de vol et près de 9 km parcourus."],
  [1789, "La Déclaration des droits de l'homme et du citoyen", 'Histoire', 2, "Adoptée le 26 août, un mois après la prise de la Bastille : dix-sept articles qui fondent le droit français."],
  [1799, "Le coup d'État de Napoléon Bonaparte", 'Histoire', 4, "Le 18 brumaire an VIII : il met fin au Directoire et ouvre la voie au Consulat, puis à l'Empire."],
  [1815, 'La bataille de Waterloo', 'Histoire', 2, "Défaite de Napoléon face aux Anglais et aux Prussiens : elle met fin aux Cent-Jours et à l'Empire."],
  [1848, 'La proclamation de la Deuxième République française', 'Histoire', 4, "La même année, le suffrage universel masculin et l'abolition définitive de l'esclavage sont proclamés."],
  [1861, 'Le début de la guerre de Sécession américaine', 'Histoire', 3, "Onze États esclavagistes du Sud font sécession : le conflit durera quatre ans et fera plus de 600 000 morts."],
  [1865, "L'abolition de l'esclavage aux États-Unis", 'Histoire', 3, "Le treizième amendement est ratifié quelques mois après la fin de la guerre de Sécession."],
  [1870, 'La proclamation de la Troisième République française', 'Histoire', 4, "Deux jours après la défaite de Sedan : ce régime durera soixante-dix ans, le plus long depuis 1789."],
  [1889, "L'inauguration de la tour Eiffel", 'Histoire', 2, "Construite pour l'Exposition universelle, elle devait être démontée au bout de vingt ans."],
  [1895, 'La première projection payante du cinématographe', 'Cinéma', 3, "Le 28 décembre à Paris, dans le salon indien du Grand Café : trente-trois spectateurs."],
  [1898, 'La découverte du radium par Pierre et Marie Curie', 'Sciences', 3, "Il leur a fallu traiter des tonnes de minerai pour en isoler un dixième de gramme."],
  [1903, 'Le premier Tour de France cycliste', 'Sport', 3, "Six étapes seulement, dont certaines de plus de 400 km, remportées par Maurice Garin."],
  [1912, 'Le naufrage du Titanic', 'Histoire', 1, "Le paquebot a heurté un iceberg lors de sa traversée inaugurale, avec seulement vingt canots pour 2 200 personnes."],
  [1917, 'La révolution russe', 'Histoire', 3, "Deux révolutions la même année : celle de février renverse le tsar, celle d'octobre porte les bolcheviks au pouvoir."],
  [1918, "L'armistice de la Première Guerre mondiale", 'Histoire', 2, "Signé le 11 novembre dans un wagon, en forêt de Compiègne, à 5 h 15 du matin."],
  [1919, 'La signature du traité de Versailles', 'Histoire', 3, "Signé dans la galerie des Glaces, il impose à l'Allemagne des réparations que beaucoup jugeront ruineuses."],
  [1922, 'La découverte du tombeau de Toutânkhamon', 'Histoire', 3, "Howard Carter met au jour une sépulture presque intacte, après six ans de fouilles infructueuses."],
  [1927, "La première traversée de l'Atlantique en solitaire, par Lindbergh", 'Histoire', 4, "Trente-trois heures et demie de vol sans escale, de New York au Bourget, sans radio ni pilote automatique."],
  [1928, 'La découverte de la pénicilline', 'Sciences', 2, "Alexander Fleming la doit à une négligence : une moisissure avait envahi une boîte oubliée."],
  [1936, 'Les premiers congés payés en France', 'Histoire', 3, "Deux semaines accordées par le Front populaire, en même temps que la semaine de 40 heures."],
  [1944, 'Le droit de vote accordé aux femmes françaises', 'Histoire', 2, "Une ordonnance d'avril 1944 : elles votent pour la première fois aux municipales de 1945."],
  [1945, "La capitulation de l'Allemagne nazie", 'Histoire', 1, "Signée le 8 mai à Berlin. La guerre se poursuit dans le Pacifique jusqu'en septembre."],
  [1947, "L'indépendance de l'Inde", 'Histoire', 3, "Obtenue après trente ans de lutte non violente menée par Gandhi, et accompagnée d'une partition sanglante."],
  [1948, 'La Déclaration universelle des droits de l\'homme', 'Histoire', 3, "Adoptée par l'ONU à Paris, elle a été traduite en plus de cinq cents langues."],
  [1949, "La création de l'OTAN", 'Histoire', 4, "Douze pays signataires au départ, dont la France, pour organiser la défense de l'Atlantique nord."],
  [1953, "La description de la double hélice de l'ADN", 'Sciences', 3, "Watson et Crick s'appuient sur les clichés de Rosalind Franklin, longtemps restée dans l'ombre."],
  [1957, 'Le lancement de Spoutnik 1', 'Sciences', 3, "Une sphère de 58 cm qui émettait un simple bip : elle a déclenché la course à l'espace."],
  [1958, 'Le retour au pouvoir du général de Gaulle', 'Histoire', 3, "La crise d'Algérie le ramène aux affaires : il fait adopter une nouvelle Constitution la même année."],
  [1961, "Le premier homme dans l'espace", 'Sciences', 2, "Youri Gagarine a fait un tour complet de la Terre en 108 minutes."],
  [1962, "L'indépendance de l'Algérie", 'Histoire', 2, "Les accords d'Évian mettent fin à huit ans de guerre et à cent trente ans de présence française."],
  [1963, "L'assassinat de John F. Kennedy", 'Histoire', 2, "À Dallas, le 22 novembre. La commission d'enquête n'a jamais fait taire les soupçons."],
  [1966, "L'Angleterre championne du monde de football", 'Sport', 4, "Son seul titre à ce jour, obtenu à domicile face à l'Allemagne, avec un but resté contesté."],
  [1967, 'La première greffe de cœur', 'Sciences', 3, "Réalisée au Cap par Christiaan Barnard ; le patient a survécu dix-huit jours."],
  [1968, 'Les événements de Mai 68 en France', 'Histoire', 2, "Grève générale de plusieurs millions de salariés, la plus importante de l'histoire du pays."],
  [1969, 'Le festival de Woodstock', 'Musique', 3, "Trois jours de concerts et près de 400 000 spectateurs, dans une ferme de l'État de New York."],
  [1970, 'La séparation des Beatles', 'Musique', 3, "Paul McCartney annonce son départ en avril, huit ans après le premier disque du groupe."],
  [1971, 'Le premier microprocesseur', 'Sciences', 4, "L'Intel 4004 tenait 2 300 transistors sur une puce ; un processeur actuel en compte des dizaines de milliards."],
  [1974, "L'élection de Valéry Giscard d'Estaing", 'Histoire', 4, "À 48 ans, il devient le plus jeune président de la Ve République, élu de justesse face à Mitterrand."],
  [1977, "La mort d'Elvis Presley", 'Musique', 3, "À 42 ans, dans sa maison de Graceland, devenue depuis le deuxième domicile le plus visité des États-Unis."],
  [1979, 'La sortie du premier baladeur Sony', 'Divers', 3, "Le Walkman a fait de la musique une affaire privée : plus de 200 millions d'exemplaires vendus."],
  [1981, "L'abolition de la peine de mort en France", 'Histoire', 2, "Portée par Robert Badinter, quatre ans après la dernière exécution."],
  [1982, "La sortie d'E.T. au cinéma", 'Cinéma', 2, "Le film a détrôné Star Wars au box-office et tenu la tête pendant onze ans."],
  [1983, "L'identification du virus du sida à l'Institut Pasteur", 'Sciences', 4, "Les travaux de Luc Montagnier et Françoise Barré-Sinoussi leur ont valu le prix Nobel en 2008."],
  [1985, 'La découverte du trou dans la couche d\'ozone', 'Sciences', 4, "Observée au-dessus de l'Antarctique, elle a conduit deux ans plus tard à interdire les gaz responsables."],
  [1986, 'La catastrophe de Tchernobyl', 'Histoire', 2, "L'explosion du réacteur numéro 4 a contaminé une zone encore interdite aujourd'hui."],
  [1989, 'La chute du mur de Berlin', 'Histoire', 1, "Dans la nuit du 9 novembre, après vingt-huit ans de séparation, l'annonce d'un porte-parole suffit à ouvrir les postes-frontières."],
  [1989, 'La naissance du World Wide Web', 'Sciences', 4, "Tim Berners-Lee en écrit le projet au CERN, pour que les chercheurs partagent leurs documents."],
  [1990, "La réunification de l'Allemagne", 'Histoire', 3, "Moins d'un an après la chute du mur, les deux États n'en forment plus qu'un, le 3 octobre."],
  [1991, "La dissolution de l'URSS", 'Histoire', 3, "Quinze républiques indépendantes en sortent ; Gorbatchev démissionne le 25 décembre."],
  [1991, 'La mort de Freddie Mercury', 'Musique', 3, "À 45 ans, quelques mois après le dernier album enregistré avec Queen."],
  [1993, "L'entrée en vigueur du traité de Maastricht", 'Histoire', 4, "Il crée l'Union européenne et prépare la monnaie unique, adoptée neuf ans plus tard."],
  [1994, 'La première élection de Nelson Mandela', 'Histoire', 2, "Premier scrutin ouvert à tous les Sud-Africains, quatre ans après sa sortie de prison."],
  [1994, "L'ouverture du tunnel sous la Manche", 'Géographie', 3, "50 km de tunnel, dont 38 sous la mer, après six ans de travaux et une vieille idée du XIXe siècle."],
  [1997, 'La sortie de Titanic au cinéma', 'Cinéma', 2, "Le film est resté le plus gros succès mondial pendant douze ans, jusqu'à Avatar."],
  [2001, 'La sortie du premier Harry Potter au cinéma', 'Cinéma', 2, "Les trois acteurs principaux avaient 11 et 12 ans au début du tournage."],
  [2004, 'La création de Facebook', 'Divers', 3, "Lancé dans une chambre d'étudiant de Harvard, réservé au départ aux seuls élèves de l'université."],
  [2005, 'La création de YouTube', 'Divers', 3, "La première vidéo mise en ligne, 19 secondes au zoo de San Diego, est toujours visible."],
  [2008, 'La crise financière mondiale', 'Actualité', 3, "La faillite de la banque Lehman Brothers en septembre a entraîné la pire récession depuis 1929."],
  [2010, 'La sortie du premier iPad', 'Divers', 3, "Apple en a vendu 15 millions la première année, créant un marché qui n'existait pas."],
  [2011, "L'accident nucléaire de Fukushima", 'Actualité', 3, "Provoqué par un séisme et un tsunami : plus de 150 000 personnes ont été évacuées."],
  [2012, 'La découverte du boson de Higgs', 'Sciences', 4, "Confirmée au CERN après quarante-huit ans de recherche et la construction du plus grand accélérateur du monde."],
  [2016, 'Le référendum du Brexit', 'Actualité', 2, "51,9 % des Britanniques votent pour la sortie de l'Union européenne, effective en 2020."],
  [2019, "La première image d'un trou noir", 'Sciences', 4, "Obtenue en combinant huit radiotélescopes répartis sur la planète, soit un télescope de la taille de la Terre."],
  [2020, 'Le début de la pandémie de Covid-19', 'Actualité', 1, "L'Organisation mondiale de la santé la déclare pandémie le 11 mars ; la moitié de l'humanité sera confinée."],
  [2024, 'Les Jeux olympiques de Paris', 'Sport', 1, "Cent ans après les Jeux de 1924, avec une cérémonie d'ouverture sur la Seine."],
];

/* ------------------------------------------------------------------ */

const epoqueDe = a => a < 1970 ? 'Avant 1970' : a < 1980 ? 'Années 70' : a < 1990 ? 'Années 80'
  : a < 2000 ? 'Années 90' : a < 2010 ? 'Années 2000' : a < 2020 ? 'Années 2010' : 'Années 2020';

const melange = a => a.slice().sort(() => Math.random() - 0.5);

/** Trois événements d'autres années, du même thème si possible. */
function leurres(ev) {
  const autres = E.filter(x => x[0] !== ev[0]);
  const memeTheme = melange(autres.filter(x => x[2] === ev[2]));
  const reste = melange(autres.filter(x => x[2] !== ev[2]));
  const out = [];
  for (const x of memeTheme.concat(reste)) {
    if (out.length >= 3) break;
    if (!out.some(y => y[0] === x[0])) out.push(x);   // jamais deux fois la même année
  }
  return out.map(x => x[1]);
}

const HEAD = ['id', 'theme', 'categorie', 'difficulte', 'type', 'question', 'reponse', 'choix2', 'choix3', 'choix4',
  'explication', 'indices', 'media_url', 'media_debut', 'media_duree', 'actif', 'utilisations', 'epoque', 'anecdote'];

const lignes = [];
let n = 2301;

// 1. « Que s'est-il passé en … ? »
E.forEach(ev => {
  const [annee, libelle, theme, diff, expl] = ev;
  const f = leurres(ev);
  lignes.push(['Q' + (n++), theme, 'Dates', diff, 'QCM',
    `📅 Que s'est-il passé en ${annee} ?`, libelle, f[0], f[1], f[2],
    expl, '', '', 0, 15, 'oui', 0, epoqueDe(annee), '']);
});

// 2. Classements chronologiques : 4 événements à remettre dans l'ordre
const parAnnee = E.slice().sort((a, b) => a[0] - b[0]);
for (let k = 0; k + 4 <= 32; k += 4) {
  const lot = melange(parAnnee).slice(0, 4).sort((a, b) => a[0] - b[0]);
  if (new Set(lot.map(x => x[0])).size < 4) continue;
  lignes.push(['Q' + (n++), 'Histoire', 'Dates', 3, 'ORDRE',
    '📅 Classez ces événements du plus ancien au plus récent.',
    lot.map(x => x[1]).join(' | '), 'Du plus ancien au plus récent', '', '',
    lot.map(x => x[0]).join(', ') + ' : ' + lot.map(x => x[1].replace(/^(Le|La|Les|L')\s*/i, '')).join(', ') + '.',
    '', '', 0, 15, 'oui', 0, epoqueDe(lot[0][0]), '']);
}

/* ---------- contrôles ---------- */
const vu = new Set();
lignes.forEach(l => {
  if (vu.has(l[5] + l[6])) throw new Error('doublon : ' + l[5]);
  vu.add(l[5] + l[6]);
  if (!l[10] || l[10].length < 40) throw new Error('explication trop courte : ' + l[6]);
  if (l[4] === 'QCM') {
    if ([7, 8, 9].some(j => !l[j])) throw new Error('piège manquant : ' + l[6]);
    if ([7, 8, 9].some(j => l[j] === l[6])) throw new Error('piège identique à la réponse : ' + l[6]);
    // l'année de la réponse ne doit pas apparaître dans un piège
    const annee = Number(l[5].match(/\d{4}/)[0]);
    const evsPieges = [7, 8, 9].map(j => E.find(x => x[1] === l[j]));
    if (evsPieges.some(x => !x || x[0] === annee)) throw new Error('piège de la même année : ' + l[5]);
  }
});

const cell = v => {
  v = v === undefined || v === null ? '' : String(v);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
fs.writeFileSync(path.join(ROOT, 'supabase/questions-dates.csv'),
  [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n'));

const parType = {}, parTheme = {};
lignes.forEach(l => { parType[l[4]] = (parType[l[4]] || 0) + 1; parTheme[l[1]] = (parTheme[l[1]] || 0) + 1; });
console.log(`${lignes.length} questions de dates → supabase/questions-dates.csv`);
console.log('par type  :', JSON.stringify(parType));
console.log('par thème :', JSON.stringify(parTheme));
