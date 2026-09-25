/**
 * Nouveaux extraits pour le blind test musique.
 *
 * Le script cherche lui-même la vidéo YouTube de chaque titre, écarte les reprises,
 * les versions live et les chaînes douteuses, puis VÉRIFIE que la vidéo existe et
 * accepte d'être lue dans le jeu (oEmbed). Seuls les titres vérifiés sont écrits.
 *
 * Usage : node scripts/blindtest-nouveaux.mjs [--limite N]
 *   → supabase/questions-blindtest.csv
 *   → scripts/blindtest-rejets.txt (ce qui n'a pas passé le contrôle)
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const I = 'International', F = 'Chanson française';

// [artiste, titre, année, catégorie, difficulté, explication]
export const TITRES = [
  // ---------- Rock et pop internationale ----------
  ['The Kinks', 'You Really Got Me', 1964, I, 4, "1964. Le son saturé viendrait d'un ampli que le guitariste avait fendu à la lame de rasoir."],
  ['Bob Dylan', 'Like a Rolling Stone', 1965, I, 3, "1965. Six minutes quand les radios en voulaient trois : la maison de disques a failli la refuser."],
  ['James Brown', 'I Got You (I Feel Good)', 1965, I, 3, "1965. Le cri d'ouverture est devenu l'un des plus repris de la musique populaire."],
  ['Nina Simone', 'Feeling Good', 1965, I, 3, "1965. La chanson vient d'une comédie musicale anglaise ; l'interprétation de Simone l'a éclipsée."],
  ['Jimi Hendrix', 'Hey Joe', 1966, I, 3, "1966, premier single du guitariste à Londres : une reprise qui a fait sa réputation."],
  ['Marvin Gaye', 'I Heard It Through the Grapevine', 1968, I, 3, "1968. La Motown jugeait le morceau trop sombre et a tardé un an à le sortir."],
  ['Led Zeppelin', 'Whole Lotta Love', 1969, I, 3, "1969. Le riff a longtemps servi de générique à l'émission Top of the Pops."],
  ['The Who', 'Baba O\'Riley', 1971, I, 4, "1971. L'orgue répétitif du début a été programmé sur un synthétiseur primitif, à partir de données biographiques."],
  ['Creedence Clearwater Revival', 'Have You Ever Seen the Rain', 1971, I, 3, "1971. La « pluie » du titre évoquait en réalité la dissolution annoncée du groupe."],
  ['Deep Purple', 'Smoke on the Water', 1972, I, 2, "1972. Le texte raconte l'incendie d'un casino suisse pendant un concert de Frank Zappa."],
  ['Barry White', 'You\'re the First, the Last, My Everything', 1974, I, 3, "1974. La mélodie venait d'une chanson country jamais publiée, écrite vingt ans plus tôt."],
  ['Sister Sledge', 'We Are Family', 1979, I, 3, "1979, produit par Nile Rodgers et Bernard Edwards : l'hymne est devenu celui d'une équipe de baseball."],
  ['AC/DC', 'Highway to Hell', 1979, I, 2, "1979, dernier album avec le chanteur Bon Scott, mort quelques mois plus tard."],
  ['The Cure', 'Boys Don\'t Cry', 1979, I, 4, "1979. Le groupe anglais a réenregistré la chanson en 1986, avec une voix plus grave."],
  ['Survivor', 'Eye of the Tiger', 1982, I, 1, "1982, écrite à la demande de Sylvester Stallone pour Rocky III, après un refus de Queen."],
  ['The Clash', 'Should I Stay or Should I Go', 1982, I, 3, "1982. Les chœurs en espagnol ont été improvisés en studio par un ami du groupe."],
  ['New Order', 'Blue Monday', 1983, I, 4, "1983. La pochette imitait une disquette : si complexe à fabriquer que chaque vente faisait perdre de l'argent."],
  ['The Police', 'Every Breath You Take', 1983, I, 2, "1983. Souvent prise pour une chanson d'amour, elle décrit en fait une surveillance obsessionnelle."],
  ['Irene Cara', 'Flashdance... What a Feeling', 1983, I, 3, "1983, Oscar de la meilleure chanson pour le film Flashdance."],
  ['Bryan Adams', 'Summer of \'69', 1984, I, 2, "1984. Le chanteur avait 9 ans en 1969 : le titre renvoie moins à l'année qu'à un souvenir inventé."],
  ['Simple Minds', 'Don\'t You (Forget About Me)', 1985, I, 3, "1985. Le groupe écossais a d'abord refusé la chanson, écrite pour le film Breakfast Club."],
  ['Depeche Mode', 'Enjoy the Silence', 1990, I, 3, "1990. Conçue comme une ballade lente, elle est devenue un tube après avoir été accélérée en studio."],
  ['Sinéad O\'Connor', 'Nothing Compares 2 U', 1990, I, 3, "1990. La chanson est signée Prince ; le clip tient en un seul plan sur le visage de la chanteuse."],
  ['Roxette', 'It Must Have Been Love', 1990, I, 3, "1990. Le duo suédois avait écrit la chanson pour Noël avant qu'elle ne serve au film Pretty Woman."],
  ['Metallica', 'Nothing Else Matters', 1991, I, 2, "1991. James Hetfield l'avait écrite au téléphone, pour lui seul, sans penser à en faire une chanson."],
  ['Radiohead', 'Creep', 1992, I, 3, "1992. Le groupe a longtemps refusé de la jouer en concert, lassé de son succès."],
  ['Rednex', 'Cotton Eye Joe', 1994, I, 3, "1994. Des Suédois reprenant un air traditionnel américain : le disque s'est vendu à des millions d'exemplaires."],
  ['Mariah Carey', 'All I Want for Christmas Is You', 1994, I, 1, "1994. Écrite en un quart d'heure, elle revient chaque décembre en tête des classements."],
  ['Björk', 'It\'s Oh So Quiet', 1995, I, 4, "1995. La chanteuse islandaise reprend un morceau de music-hall allemand des années 1940."],
  ['Los del Río', 'Macarena', 1995, I, 2, "1995. Le duo andalou avait improvisé le refrain lors d'un voyage au Venezuela."],
  ['Gala', 'Freed from Desire', 1996, I, 3, "1996. Devenue un chant de stade trente ans plus tard, elle revient à chaque grande compétition."],
  ['The Prodigy', 'Firestarter', 1996, I, 4, "1996. Le clip tourné dans le métro londonien a été jugé trop inquiétant par la BBC."],
  ['Blur', 'Song 2', 1997, I, 3, "1997. Deux minutes, deux couplets : la chanson devait être une parodie de rock américain."],
  ['Daft Punk', 'Around the World', 1997, I, 3, "1997. Le clip de Michel Gondry attribue à chaque instrument un groupe de danseurs différent."],
  ['Stardust', 'Music Sounds Better with You', 1998, I, 4, "1998. Le groupe n'a sorti que cette chanson : l'un des sommets de la French touch."],
  ['Massive Attack', 'Teardrop', 1998, I, 4, "1998. Devenue le générique de la série Dr House, elle est chantée par Elizabeth Fraser."],
  ['Moby', 'Why Does My Heart Feel So Bad?', 1999, I, 4, "1999. L'album Play a été entièrement construit sur des enregistrements de chants gospel des années 1930."],
  ['TLC', 'No Scrubs', 1999, I, 4, "1999. Le mot « scrub » désigne un homme qui se vante sans rien avoir : la chanson a lancé l'expression."],
  ['Christina Aguilera', 'Genie in a Bottle', 1999, I, 3, "1999, premier single de la chanteuse, sorti la même année que celui de Britney Spears."],
  ['Modjo', 'Lady (Hear Me Tonight)', 2000, I, 3, "2000. Le duo français a bâti le morceau sur un extrait de Chic, « Soup for One »."],
  ['Destiny\'s Child', 'Survivor', 2001, I, 3, "2001. Le texte répond aux critiques après les départs successifs de membres du groupe."],
  ['System of a Down', 'Chop Suey!', 2001, I, 4, "2001. Le titre d'origine, jugé trop provocant, a été remplacé par le nom d'un plat sino-américain."],
  ['50 Cent', 'In da Club', 2003, I, 3, "2003. Produit par Dr. Dre, le morceau a lancé l'un des albums de rap les plus vendus."],
  ['Sean Paul', 'Get Busy', 2003, I, 3, "2003. Le Jamaïcain a porté le dancehall en tête des classements américains."],
  ['Evanescence', 'Bring Me to Life', 2003, I, 3, "2003. La maison de disques a imposé la voix masculine du refrain, contre l'avis du groupe."],
  ['Crazy Frog', 'Axel F', 2005, I, 3, "2005. La grenouille reprend le thème du Flic de Beverly Hills, composé par Harold Faltermeyer."],
  ['Kanye West', 'Stronger', 2007, I, 3, "2007. Le morceau reprend « Harder, Better, Faster, Stronger » de Daft Punk."],
  ['Muse', 'Uprising', 2009, I, 3, "2009. Le riff de synthé rappelle volontairement le générique de la série Doctor Who."],
  ['Shakira', 'Waka Waka (This Time for Africa)', 2010, I, 2, "2010, hymne de la Coupe du monde en Afrique du Sud, adapté d'un chant camerounais."],
  ['David Guetta', 'Titanium', 2011, I, 2, "2011. Sia avait enregistré la voix comme simple maquette : elle est restée sur le disque final."],
  ['Of Monsters and Men', 'Little Talks', 2011, I, 4, "2011. Le groupe islandais s'est fait connaître en remportant un concours de radio dans son pays."],
  ['Passenger', 'Let Her Go', 2012, I, 3, "2012. Le chanteur britannique jouait encore dans la rue quand la chanson est devenue un tube mondial."],
  ['Hozier', 'Take Me to Church', 2013, I, 3, "2013. L'Irlandais l'a enregistrée dans le grenier de ses parents."],
  ['Arctic Monkeys', 'Do I Wanna Know?', 2013, I, 3, "2013. Le riff lourd et lent tranchait avec le rock nerveux des débuts du groupe."],
  ['Pitbull', 'Timber', 2013, I, 3, "2013, en duo avec Kesha : l'harmonica du refrain est emprunté à un morceau de blues country."],
  ['Calvin Harris', 'Summer', 2014, I, 3, "2014. L'Écossais a été plusieurs années le DJ le mieux payé du monde."],
  ['Twenty One Pilots', 'Stressed Out', 2015, I, 3, "2015. Le duo de l'Ohio y chante la nostalgie de l'enfance face aux responsabilités."],
  ['Tame Impala', 'The Less I Know the Better', 2015, I, 4, "2015. L'Australien Kevin Parker joue lui-même tous les instruments de ses disques."],
  ['Portugal. The Man', 'Feel It Still', 2017, I, 4, "2017. Le refrain reprend la ligne de basse de « Please Mr. Postman », des Marvelettes."],
  ['Drake', 'God\'s Plan', 2018, I, 3, "2018. Le clip montre le rappeur distribuant le budget du tournage, près d'un million de dollars, à des inconnus."],
  ['Lewis Capaldi', 'Someone You Loved', 2018, I, 3, "2018. L'Écossais a mis près d'un an à imposer la chanson, sortie sans promotion."],
  ['Post Malone', 'Circles', 2019, I, 3, "2019. Le morceau est resté plus d'un an dans le classement américain, un record."],
  ['Doja Cat', 'Say So', 2019, I, 3, "2019. Le succès est parti d'une chorégraphie devenue virale sur TikTok."],
  ['Lizzo', 'About Damn Time', 2022, I, 3, "2022. La chanteuse joue aussi de la flûte traversière, qu'elle a étudiée au conservatoire."],

  // ---------- Chanson française ----------
  ['Charles Trenet', 'La Mer', 1946, F, 3, "Écrite en 1943 dans un train, sur un coin de papier ; elle a été reprise dans le monde entier."],
  ['Jean Ferrat', 'La Montagne', 1964, F, 4, "1964. La chanson raconte l'exode rural et reste l'une des plus diffusées du chanteur."],
  ['Christophe', 'Aline', 1965, F, 3, "1965. Enregistrée quand le chanteur avait 19 ans, elle est redevenue un tube lors de sa réédition en 1979."],
  ['Michel Polnareff', 'Love Me, Please Love Me', 1966, F, 4, "1966, premier succès du chanteur, écrit alors qu'il jouait de la guitare au pied du Sacré-Cœur."],
  ['Georges Moustaki', 'Le Métèque', 1969, F, 4, "1969. Le chanteur reprend à son compte une insulte pour en faire un portrait fier de l'étranger."],
  ['Barbara', 'L\'Aigle noir', 1970, F, 3, "1970. Le disque s'est vendu à plus d'un million d'exemplaires en quelques mois."],
  ['Léo Ferré', 'Avec le temps', 1970, F, 4, "1970. Écrite en une nuit, elle est considérée comme l'un des sommets de la chanson française."],
  ['Michel Berger', 'La Groupie du pianiste', 1980, F, 3, "1980. Le chanteur y raconte avec tendresse l'admiration des fans, qu'il observait depuis la scène."],
  ['Lio', 'Amoureux solitaires', 1980, F, 4, "1980. Les paroles sont signées Jacques Duvall, la musique du groupe Marie et les Garçons."],
  ['Ottawan', 'T\'es OK', 1980, F, 3, "1980. Le duo antillais a vendu plusieurs millions de disques en pleine vague disco."],
  ['Pierre Bachelet', 'Les Corons', 1982, F, 3, "1982. Devenue l'hymne du nord de la France, elle est chantée avant chaque match à Lens."],
  ['Axel Bauer', 'Cargo', 1983, F, 4, "1983. Le clip, tourné par Jean-Baptiste Mondino, a été l'un des premiers grands clips français."],
  ['La Compagnie Créole', 'C\'est bon pour le moral', 1983, F, 2, "1983. Le groupe antillais en a fait l'indémodable des fêtes de famille."],
  ['Elsa', 'T\'en va pas', 1986, F, 3, "1986. La chanteuse avait 13 ans : le titre venait du film « La Femme de ma vie »."],
  ['Mano Negra', 'Mala Vida', 1988, F, 4, "1988. Le groupe de Manu Chao mêlait rock, punk et musiques latines, chanté en trois langues."],
  ['Les Négresses Vertes', 'Voilà l\'été', 1988, F, 4, "1988. Le groupe mélangeait fanfare, rock et accents méditerranéens."],
  ['Laurent Voulzy', 'Le Pouvoir des fleurs', 1994, F, 3, "1994. Le chanteur y rend hommage aux années hippies de sa jeunesse."],
  ['Louise Attaque', 'J\'t\'emmène au vent', 1997, F, 3, "1997. Porté par un violon, le premier album du groupe s'est vendu à plus de deux millions d'exemplaires."],
  ['Tryo', 'L\'Hymne de nos campagnes', 1998, F, 3, "1998. Le groupe acoustique en a fait un classique des feux de camp."],
  ['Manu Chao', 'Clandestino', 1998, F, 3, "1998. Enregistré au fil de ses voyages, l'album a été un succès dans toute l'Amérique latine."],
  ['M', 'Je dis aime', 1999, F, 4, "1999. Matthieu Chedid a inventé le personnage de M, cheveux en forme de lettre, pour monter sur scène."],
  ['Yannick', 'Ces soirées-là', 2000, F, 3, "2000. Le rap reprend « Cette année-là » de Claude François, lui-même adapté d'un tube américain."],
  ['Carla Bruni', 'Quelqu\'un m\'a dit', 2002, F, 3, "2002. L'ancienne mannequin a écrit et composé la chanson elle-même."],
  ['Calogero', 'En apesanteur', 2002, F, 3, "2002. La chanson décrit un coup de foudre dans un ascenseur, en une minute d'arrêt entre deux étages."],
  ['Cali', 'C\'est quand le bonheur ?', 2003, F, 4, "2003. Le chanteur catalan s'est fait connaître par ses concerts particulièrement physiques."],
  ['Camille', 'Ta douleur', 2005, F, 4, "2005. La chanteuse construit ses morceaux à la voix et aux percussions corporelles."],
  ['Philippe Katerine', 'Louxor j\'adore', 2005, F, 4, "2005. Le titre évoque une discothèque imaginaire, sur une rythmique volontairement minimale."],
  ['Renan Luce', 'Les Voisines', 2007, F, 3, "2007. Le premier album du chanteur lui a valu la Victoire de la révélation de l'année."],
  ['Thomas Dutronc', 'J\'aime plus Paris', 2007, F, 3, "2007. Le fils de Jacques Dutronc y répond, en creux, au « Il est cinq heures, Paris s'éveille » de son père."],
  ['Zazie', 'Je suis un homme', 2007, F, 3, "2007. La chanteuse y interroge la place de l'humain dans un monde qu'il détruit."],
  ['Yael Naim', 'New Soul', 2007, F, 3, "2007. Le morceau a fait le tour du monde après avoir servi à une publicité pour un ordinateur."],
  ['Cœur de pirate', 'Comme des enfants', 2008, F, 3, "2008. La Québécoise avait 18 ans et s'accompagnait seule au piano."],
  ['Grand Corps Malade', 'Roméo kiffe Juliette', 2010, F, 3, "2010. Le slameur transpose Shakespeare dans une cité, entre deux familles que tout oppose."],
  ['Sexion d\'Assaut', 'Désolé', 2010, F, 3, "2010. Le groupe parisien réunissait huit rappeurs, dont Maître Gims et Black M."],
  ['Ben l\'Oncle Soul', 'Soulman', 2010, F, 3, "2010. Le chanteur tourangeau revendique l'héritage de la soul américaine des années 60."],
  ['Shy\'m', 'Et alors !', 2012, F, 3, "2012. La chanteuse venait de remporter Danse avec les stars."],
  ['Nekfeu', 'On verra', 2015, F, 3, "2015. Le rappeur parisien a écrit le morceau sur une production de Diabi, entre doute et ambition."],
  ['Amir', 'J\'ai cherché', 2016, F, 2, "2016. Le titre a offert à la France sa meilleure place à l'Eurovision depuis vingt ans, une sixième position."],
  ['Claudio Capéo', 'Un homme debout', 2016, F, 2, "2016. L'accordéoniste alsacien y chante la dignité de ceux qui n'ont rien."],
  ['Lomepal', 'Trop beau', 2017, F, 3, "2017. Le rappeur a d'abord publié le morceau sans clip : le bouche-à-oreille a fait le reste."],
  ['Eddy de Pretto', 'Kid', 2017, F, 4, "2017. Le chanteur y raconte l'injonction à la virilité reçue dans l'enfance."],
  ['Hoshi', 'Ta marinière', 2018, F, 3, "2018. La chanteuse avait 22 ans et s'accompagnait à la guitare dans les couloirs du métro."],
  ['PNL', 'Au DD', 2019, F, 4, "2019. Le clip a été tourné au sommet de la tour Eiffel, une première."],
  ['Pomme', 'On brûlera', 2019, F, 4, "2019. La chanteuse s'accompagne à l'autoharpe, un instrument à cordes rare en chanson française."],
];

/* ------------------------------------------------------------------ */
/* Recherche et vérification                                           */
/* ------------------------------------------------------------------ */

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const dors = ms => new Promise(r => setTimeout(r, ms));

/** Un appel réseau qui ne fait jamais tomber le script : trois essais, puis on passe. */
async function reseau(url, opts, essais = 3) {
  for (let k = 0; k < essais; k++) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      if (k === essais - 1) return null;
      await dors(1200 * (k + 1));
    }
  }
  return null;
}

async function chercher(q) {
  const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D';
  const res = await reseau(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Accept-Language': 'fr-FR,fr;q=0.9' } });
  if (!res) return [];
  const html = await res.text();
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
  if (!m) return [];
  const out = [];
  const walk = o => {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      if (o.videoRenderer) {
        const v = o.videoRenderer;
        const titre = (v.title?.runs || []).map(r => r.text).join('');
        const chaine = v.ownerText?.runs?.[0]?.text || '';
        const duree = v.lengthText?.simpleText || '';
        if (v.videoId) out.push({ id: v.videoId, titre, chaine, duree });
      }
      Object.values(o).forEach(walk);
    }
  };
  walk(JSON.parse(m[1]));
  return out;
}

const MAUVAIS = /\b(live|concert|cover|reprise|karaoke|karaok|instrumental|remix|reaction|tutorial|cours|8 bit|slowed|sped up|nightcore|mashup|medley|full album|compilation|interview|making of|parodie|parody|acoustic|acoustique|unplugged|demo|session|rehearsal|version francaise|sped|edit tiktok)\b/i;

/**
 * Note un résultat : on veut la version studio du bon morceau, sur une chaîne crédible.
 * Le piège classique : « Gente de Zona - Mas Macarena ft. Los Del Rio » quand on
 * cherche « Macarena ». D'où l'exigence que le titre commence un segment.
 */
function noter(r, artiste, titre) {
  const t = norm(r.titre), c = norm(r.chaine);
  const a = norm(artiste), ti = norm(titre);
  let n = 0;

  // le titre cherché doit apparaître en entier, et commencer un segment du titre vidéo
  const i = t.indexOf(ti);
  if (i < 0) return -1;
  const avant = t.slice(0, i).trim();
  const dernierMot = avant.split(' ').pop() || '';
  const segments = norm(r.titre.replace(/[\-–—|(\[]/g, '|')).split('|').map(x => x.trim());
  const commenceUnSegment = i === 0 || segments.some(seg => seg.startsWith(ti));
  if (!commenceUnSegment && dernierMot && dernierMot !== norm(artiste).split(' ').pop()) return -1;
  n += 4;

  if (t.includes(a) || c.includes(a)) n += 3;
  else return -1;                                            // ni l'artiste dans le titre, ni dans la chaîne
  if (/vevo|topic|official/i.test(r.chaine + ' ' + r.titre)) n += 2;
  if (MAUVAIS.test(r.titre)) n -= 6;
  const mm = (r.duree || '').match(/^(\d+):(\d+)$/);
  if (mm) {
    const sec = Number(mm[1]) * 60 + Number(mm[2]);
    if (sec < 90 || sec > 600) n -= 4;                       // ni extrait, ni version longue
  } else n -= 1;
  return n;
}

/** La vidéo existe-t-elle et accepte-t-elle d'être jouée dans une page ? */
async function verifier(id) {
  const u = 'https://www.youtube.com/oembed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id) + '&format=json';
  const res = await reseau(u, {});
  if (!res || res.status !== 200) return { ok: false, code: res ? res.status : 'réseau' };
  const j = await res.json();
  return { ok: true, titre: j.title, auteur: j.author_name };
}

/* ------------------------------------------------------------------ */

const limite = Number((process.argv.find(a => a.startsWith('--limite=')) || '').split('=')[1]) || TITRES.length;
const FR = path.join(ROOT, 'scripts/blindtest-retenus.json');
const FJ = path.join(ROOT, 'scripts/blindtest-rejets.txt');

// Reprise : un plantage réseau ne fait pas tout recommencer
const retenus = fs.existsSync(FR) ? JSON.parse(fs.readFileSync(FR, 'utf8')) : [];
const rejets = fs.existsSync(FJ) ? fs.readFileSync(FJ, 'utf8').split('\n').filter(Boolean) : [];
const faits = new Set(retenus.map(r => r.artiste + '|' + r.titre).concat(rejets.map(r => r.split(' (')[0].replace(' – ', '|'))));
const sauver = () => {
  fs.writeFileSync(FR, JSON.stringify(retenus, null, 1));
  fs.writeFileSync(FJ, rejets.join('\n') + (rejets.length ? '\n' : ''));
};

for (const [artiste, titre, annee, cat, diff, expl] of TITRES.slice(0, limite)) {
  if (faits.has(artiste + '|' + titre)) continue;
  let choix = null;
  for (const requete of [`${artiste} ${titre} official audio`, `${artiste} ${titre}`]) {
    const res = await chercher(requete);
    const notes = res.map(r => ({ r, n: noter(r, artiste, titre) })).filter(x => x.n > 2).sort((a, b) => b.n - a.n);
    for (const { r, n } of notes.slice(0, 3)) {
      const v = await verifier(r.id);
      if (v.ok) { choix = { ...r, note: n, oembed: v }; break; }
      await dors(150);
    }
    if (choix) break;
    await dors(400);
  }
  if (choix) {
    retenus.push({ artiste, titre, annee, cat, diff, expl, id: choix.id, vu: choix.titre, chaine: choix.chaine });
    console.log(`✅ ${artiste} – ${titre}  →  ${choix.id}  « ${choix.titre.slice(0, 60)} »`);
  } else {
    rejets.push(`${artiste} – ${titre} (${annee})`);
    console.log(`❌ ${artiste} – ${titre} : aucune vidéo sûre`);
  }
  sauver();
  await dors(350);
}

console.log(`\n${retenus.length} extraits vérifiés, ${rejets.length} écartés.`);
console.log('→ scripts/blindtest-retenus.json (le CSV est produit par blindtest-csv.mjs)');
