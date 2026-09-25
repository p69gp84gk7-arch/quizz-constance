/**
 * Explications manquantes de la banque de questions.
 *
 * Règle d'écriture : l'explication ne répète jamais la réponse, elle ajoute
 * quelque chose — une date, un chiffre, une origine, une anecdote. C'est ce qui
 * rend la révélation intéressante même pour ceux qui savaient déjà.
 *
 * Usage : node scripts/explications.mjs
 *   → supabase/maj-explications.sql (à exécuter dans Supabase)
 *   → met aussi à jour supabase/questions.csv pour que le dépôt reste cohérent
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

const E = {
  // ---------------- Géographie ----------------
  Q0032: "Rome est la seule capitale au monde à abriter un État étranger : le Vatican, 44 hectares.",
  Q0035: "La façade atlantique française court sur près de 2 000 km, du Pays basque à la pointe bretonne.",
  Q0037: "C'est la capitale la plus haute d'Europe de l'Ouest, à 650 m d'altitude.",
  Q0042: "La Tamise reste soumise aux marées jusqu'à Teddington, à 90 km de la mer.",
  Q0044: "Fondée en 1070, la ville a donné son nom au pays tout entier.",
  Q0337: "La City, cœur financier, ne fait qu'un mille carré et possède son propre maire, distinct de celui de la ville.",
  Q0340: "Bonn a tenu ce rôle de 1949 à 1990 ; le parlement n'est revenu qu'en 1999.",
  Q0341: "Détruite par le séisme de 1755, la ville a été rebâtie sur un plan quadrillé antisismique.",
  Q0343: "Longue de 430 km, la chaîne abrite l'Andorre, seul pays entièrement pyrénéen.",
  Q0350: "C'est la capitale administrative ; Casablanca, bien plus peuplée, est la capitale économique.",
  Q0354: "La Russie couvre à elle seule 11 % des terres émergées, sur onze fuseaux horaires.",
  Q0355: "C'est la capitale la plus froide du monde : −25 °C de moyenne en janvier.",

  // ---------------- Sciences ----------------
  Q0063: "Elle boucle son orbite en 88 jours, mais une seule de ses journées dure 176 jours terrestres.",
  Q0074: "Moyen mnémotechnique : « Me Voici Tout Mouillé, Je Suis Une Nouille ».",
  Q0080: "Une petite part de l'ADN se loge aussi dans les mitochondries, transmises uniquement par la mère.",
  Q0082: "Sa charge sert d'unité de référence à toute l'électricité : −1,602 × 10⁻¹⁹ coulomb.",
  Q0087: "Un virus est environ cent fois plus petit qu'une bactérie : il a fallu le microscope électronique pour le voir.",
  Q0360: "La glace flotte parce qu'en gelant l'eau gagne environ 9 % de volume — une exception rare dans la nature.",
  Q0362: "Déployée, leur surface d'échange couvrirait un terrain de tennis.",
  Q0363: "Sous pression normale : en altitude ou dans l'eau salée, le point de congélation change.",
  Q0370: "Soit environ 7 % du poids du corps ; le cœur en fait circuler l'équivalent chaque minute.",
  Q0371: "Du nom de James Watt. Un cheval-vapeur vaut 736 watts.",
  Q0372: "Jupiter est si grosse que toutes les autres planètes tiendraient à l'intérieur.",
  Q0373: "Newton l'a formulée en 1687 ; Einstein l'a réinterprétée en 1915 comme une courbure de l'espace-temps.",
  Q0375: "Il l'a essayé sur Joseph Meister, 9 ans, mordu par un chien enragé — alors qu'il n'était pas médecin.",

  // ---------------- Nature & Animaux ----------------
  Q0097: "C'est pourtant le seul félin réellement social : il vit en groupes, appelés troupes.",
  Q0098: "Il pèse environ 40 kg à la naissance et double son poids en six semaines.",
  Q0104: "Un chêne peut en produire 50 000 par an, mais seulement à partir d'une vingtaine d'années.",
  Q0105: "L'ours, le cochon et l'humain le sont : leur dentition mêle incisives, canines et molaires.",
  Q0109: "Il change de couleur pour communiquer et régler sa température, bien plus que pour se camoufler.",
  Q0110: "Un éléphant d'Afrique adulte atteint 6 tonnes, le poids de quatre voitures.",
  Q0382: "Il faut butiner 4 millions de fleurs pour produire un kilo de miel.",
  Q0383: "Six pattes et trois parties du corps : c'est ce qui le distingue de l'araignée, qui en a huit.",
  Q0384: "Elle compte environ 40 000 muscles ; le bras humain en a moins de 800.",
  Q0385: "Les chats adultes ne s'en servent presque qu'avec les humains : entre eux, ils communiquent autrement.",
  Q0386: "Il se met debout dans l'heure qui suit sa naissance.",
  Q0387: "Jusqu'à 4 m au garrot. La baleine bleue est plus grande, mais elle est marine.",
  Q0388: "L'image vient du récit biblique du Déluge ; Picasso l'a popularisée en 1949 pour le Congrès de la paix.",
  Q0389: "L'autruche atteint 2,70 m, le colibri d'Elena 5 cm : c'est le plus petit oiseau du monde.",
  Q0392: "Les chats d'intérieur vivent souvent 18 à 20 ans ; le record homologué est de 38 ans.",
  Q0398: "Seul conifère européen à perdre ses aiguilles, il dore les Alpes en octobre avant de se dénuder.",
  Q0399: "Ses ailes battent jusqu'à 80 fois par seconde, en dessinant un huit.",

  // ---------------- Cinéma ----------------
  Q0129: "Son nom rend hommage à Buzz Aldrin, deuxième homme à marcher sur la Lune.",
  Q0137: "Il s'appelait Sméagol avant que l'anneau ne le ronge pendant près de cinq siècles.",
  Q0145: "Hollywood parlait de « la folie de Disney » : le film a rapporté huit millions de dollars en pleine Dépression.",
  Q0153: "Le rôle avait d'abord été proposé à Emily Watson, qui ne parlait pas assez français.",
  Q0426: "Le personnage devait être à l'origine un pantin de ventriloque, jugé trop inquiétant.",
  Q0427: "Le mot vient de l'allemand « Schreck », la frayeur.",
  Q0429: "Le studio refusait l'acteur, jugé trop risqué : son essai filmé a emporté la décision.",
  Q0430: "Son vrai nom, Tom Elvis Jedusor en français, est l'anagramme de « Je suis Voldemort ».",
  Q0432: "Il a plongé douze fois sur l'épave réelle : les images du navire englouti sont authentiques.",
  Q0433: "Créée en 1955 ; auparavant, le festival remettait un Grand Prix.",
  Q0440: "Le studio était un département de Lucasfilm, racheté par Steve Jobs pour 5 millions de dollars en 1986.",
  Q0443: "La catégorie venait d'être créée : le film a devancé Monstres et Cie.",

  // ---------------- Musique ----------------
  Q0159: "Elle en a écrit les paroles en 1945 ; la chanson s'est vendue à des millions d'exemplaires dans le monde.",
  Q0160: "Accordées mi, la, ré, sol, si, mi — de la plus grave à la plus aiguë.",
  Q0163: "Un piano compte 88 touches : 52 blanches et 36 noires.",
  Q0164: "Son album Thriller (1982) reste le plus vendu de l'histoire, avec plus de 60 millions d'exemplaires.",
  Q0165: "Il a enregistré plus de 700 chansons sans jamais en composer une seule.",
  Q0166: "Le surnom vient de son tube de 1962 ; sa carrière a duré 57 ans.",
  Q0170: "Cette victoire a lancé le groupe : la chanson compare une déclaration d'amour à la reddition de Napoléon.",
  Q0176: "Créé entre amis en 1992, le festival accueille aujourd'hui plus de 250 000 personnes en quatre jours.",
  Q0178: "Né à Paris de parents chinois, il a joué devant huit présidents américains.",
  Q0182: "Son nom de scène vient de son cousin par alliance, le danseur américain Lee Halliday.",
  Q0188: "Le surnom viendrait de « satchel mouth », « bouche en sacoche ».",
  Q0446: "L'archet est monté avec environ 150 crins de cheval, frottés de colophane.",
  Q0447: "La batterie moderne est née à La Nouvelle-Orléans vers 1900, pour qu'un seul musicien tienne plusieurs percussions.",
  Q0448: "Le clip de 14 minutes, réalisé par John Landis, a coûté 500 000 dollars : un record à l'époque.",
  Q0449: "Puis trio, quatuor, quintette… la série se poursuit jusqu'au nonette, à neuf musiciens.",
  Q0450: "Le surnom vient de ses débuts : c'est lui qui récupérait le cachet du groupe et le partageait.",
  Q0451: "Le nom est formé des initiales des quatre prénoms : Agnetha, Björn, Benny, Anni-Frid.",
  Q0455: "Gaucher, il jouait une guitare de droitier retournée et recordée à l'envers.",
  Q0456: "Le manuscrit, retrouvé quarante ans après sa mort, était peut-être dédié à Thérèse : l'écriture du compositeur était illisible.",
  Q0458: "Il a composé presque exclusivement pour le piano et donné très peu de concerts publics : une trentaine en vingt ans.",
  Q0459: "Yoko Ono a été officiellement reconnue coautrice de la chanson en 2017, quarante-six ans après.",
  Q0460: "Le nom de scène vient de « Radio Ga Ga », la chanson de Queen.",
  Q0463: "Le ballet a été un échec à sa création en 1877 : il n'a triomphé qu'après la mort du compositeur.",
  Q1173: "Extrait de l'album Cosmopolitanie (2014) du rappeur marseillais.",

  // ---------------- Sport ----------------
  Q0190: "Le chiffre est fixé depuis 1897 ; avant, chaque club négociait l'effectif avant le match.",
  Q0191: "Le volant dépasse 400 km/h en smash : la vitesse la plus élevée de tous les sports de raquette.",
  Q0195: "Il ne valait aucun point à l'origine : il donnait seulement le droit d'« essayer » de tirer au but.",
  Q0197: "Le tournoi porte le nom d'un aviateur, premier à traverser la Méditerranée en 1913.",
  Q0200: "Champion du monde 1998 et Ballon d'or, il avait marqué deux buts de la tête en finale.",
  Q0204: "Le chiffre vient du parcours de St Andrews, en Écosse, ramené à 18 trous en 1764.",
  Q0210: "Les pierres sont taillées dans le granit d'une seule île écossaise, Ailsa Craig.",
  Q0213: "Il a égalé Michael Schumacher en 2020 et détient le record de victoires en Grand Prix.",
  Q0215: "Le marathon fait 42,195 km : la distance a été fixée aux Jeux de Londres, en 1908.",
  Q0222: "Six joueurs, qui tournent d'une position à chaque point gagné sur le service adverse.",
  Q0403: "Cinq joueurs — mais l'inventeur du basket en avait prévu neuf par équipe lors du premier match, en 1891.",
  Q0404: "Le ballon était à l'origine une vessie de porc, naturellement ovale.",
  Q0405: "Toucher la balle avec la main ou le corps fait perdre le point, même par accident.",
  Q0406: "France, Angleterre, Écosse, Irlande, Pays de Galles, et l'Italie entrée en 2000.",
  Q0414: "Quatre titres individuels en cinq jours : du jamais-vu depuis Michael Phelps.",
  Q0415: "50 m sur 25, huit à dix couloirs, et 2 m de profondeur minimum.",
  Q0416: "Le ballon de basket fait 24 cm de diamètre, la balle de golf 4,3 cm.",
  Q0418: "Il a porté le record du monde à 6,16 m en 2014, battant celui de Bubka vieux de 21 ans.",
  Q0420: "Quinze titres, dont les cinq premières éditions consécutives à partir de 1956.",

  // ---------------- Arts & Littérature ----------------
  Q0225: "Elle est protégée par une vitre blindée depuis son vol en 1911, qui l'a rendue mondialement célèbre.",
  Q0226: "Chez Perrault, la pantoufle est bien « de verre » : l'histoire d'une erreur de traduction avec « vair » est une légende.",
  Q0228: "Ils n'ont reçu leurs prénoms qu'au cinéma, chez Disney : les frères Grimm les laissaient anonymes.",
  Q0234: "Écrite vers 1595, la pièce s'inspire d'un récit italien publié quelques décennies plus tôt.",
  Q0239: "La statue faisait partie de « La Porte de l'Enfer » : le penseur y représentait Dante.",
  Q0241: "L'artiste disait s'être inspiré d'un camembert fondant au soleil.",
  Q0242: "À 44 ans, il est le deuxième plus jeune lauréat de littérature après Kipling.",
  Q0245: "Sur ses 143 tableaux, 55 sont des autoportraits : « je me peins parce que je suis souvent seule ».",
  Q0247: "Monet a offert ces huit panneaux à la France au lendemain de l'armistice de 1918.",
  Q0251: "Elle prenait un nom d'homme pour être publiée, et fumait le cigare en public, ce qui faisait scandale.",
  Q0467: "L'auteur travaillait avec des collaborateurs, dont Auguste Maquet, pour tenir le rythme des feuilletons.",
  Q0468: "La fable reprend un texte d'Ésope, écrit en grec vingt-deux siècles plus tôt.",
  Q0469: "L'éditeur lui a imposé ses initiales, craignant que les garçons n'achètent pas un livre signé par une femme.",
  Q0470: "Chez Perrault, en 1697, l'histoire finit mal : ce sont les frères Grimm qui ont ajouté le chasseur.",
  Q0471: "Phileas Fogg gagne son pari grâce au décalage horaire : un jour gagné en franchissant le méridien.",
  Q0472: "Haute de 55 cm, la statue possède une garde-robe de près de mille costumes.",
  Q0474: "Hergé l'aurait baptisé d'après le surnom d'une amie, Marie-Louise ; en anglais, il s'appelle Snowy.",
  Q0475: "L'auteur a écrit 75 romans et 28 nouvelles avec ce personnage, parfois en onze jours.",
  Q0476: "Il en a peint plusieurs versions pour décorer la chambre de Gauguin, à Arles.",
  Q0479: "Le roman a valu à son auteur un procès pour outrage aux bonnes mœurs en 1857 : il a été acquitté.",

  // ---------------- Gastronomie ----------------
  Q0257: "À l'origine, le riz vinaigré servait à conserver le poisson, et se jetait avant de manger.",
  Q0260: "Le sarrasin, base des galettes salées, est arrivé dans la région au XVe siècle.",
  Q0264: "Le chou fermente six semaines dans le sel : c'est la fermentation, pas le vin, qui l'acidifie.",
  Q0265: "La même épice colore la moutarde américaine ; sa teinte vient de la curcumine.",
  Q0266: "Le repas gastronomique des Français est inscrit au patrimoine immatériel de l'Unesco depuis 2010.",
  Q0271: "C'était le plat des pêcheurs, fait des poissons de roche invendus.",
  Q0272: "Le plat a été popularisé dans les années 1980 par le syndicat du fromage, pour écouler la production.",
  Q0274: "Trois minutes pour un blanc pris et un jaune coulant ; six minutes donnent un œuf mollet.",
  Q0275: "Ce poisson existe depuis plus de 200 millions d'années ; plusieurs espèces sont aujourd'hui menacées.",
  Q0281: "Depuis 2002, seul le fromage grec au lait de brebis peut porter ce nom dans l'Union européenne.",
  Q0282: "Protégé dès 1411 par Charles VI, il a obtenu la première appellation d'origine française en 1925.",
  Q0487: "Botaniquement, c'est une baie, et le bananier est une herbe géante, pas un arbre.",
  Q0488: "Il faut environ 400 fèves pour obtenir un kilo de chocolat.",
  Q0489: "Elle produit du gaz carbonique en digérant les sucres : ce sont ces bulles qui font gonfler la pâte.",
  Q0490: "Compter par douze vient des Babyloniens, qui comptaient les phalanges de quatre doigts avec le pouce.",
  Q0492: "Blanc, rouge, vert : la pizza aurait été créée en 1889 aux couleurs du drapeau italien, pour la reine Marguerite.",
  Q0495: "L'appellation désigne une recette, pas une origine : la plupart des graines viennent aujourd'hui du Canada.",
  Q0496: "Le mot signifie simplement « pois chiche » en arabe.",
  Q0497: "Né en Vénétie dans les années 1960, son nom signifie « remonte-moi ».",
  Q0498: "À cœur, on passe d'environ 50 °C pour un bleu à 70 °C pour un bien cuit.",
  Q0501: "Il faut 450 litres de lait pour une meule de 40 kg, affinée au moins quatre mois.",
  Q0504: "C'est l'épice la plus chère du monde : il faut 150 000 fleurs pour en obtenir un kilo.",

  // ---------------- Histoire ----------------
  Q0318: "Le mot « drakkar » est une invention du XIXe siècle : eux disaient « langskip », navire long.",
  Q0330: "Dernière souveraine de l'Égypte des Ptolémées, elle parlait neuf langues et descendait d'une lignée grecque.",
  Q0334: "Ils fondent l'idée moderne d'État souverain, base du droit international actuel.",

  // ---------------- Divers ----------------
  Q0287: "Un jour s'ajoute tous les quatre ans, sauf les années séculaires non divisibles par 400 : 1900 ne l'était pas, 2000 si.",
  Q0288: "En peinture seulement : en lumière, mélanger ces deux couleurs donnerait du blanc.",
  Q0290: "Le w et le k, longtemps réservés aux mots étrangers, n'y figurent officiellement que depuis le XIXe siècle.",
  Q0291: "Le mot vient du latin avarus, « avide », de la même racine qu'avidité.",
  Q0292: "Même règle pour journal, animal ou vitrail — mais bal, carnaval et festival prennent un s.",
  Q0293: "Présenté par Steve Jobs en janvier 2007, il n'avait ni copier-coller ni boutique d'applications.",
  Q0297: "L'oiseau s'appelait Larry, en hommage au basketteur Larry Bird. Le réseau est devenu X en 2023.",
  Q0302: "Chaque marche multiplie par 1 024, et non par 1 000 : l'informatique compte en puissances de deux.",
  Q0304: "Attention au faux ami : le « billion » américain vaut un milliard, pas mille milliards.",
  Q0305: "C'est l'une des phobies les plus répandues : près d'une personne sur vingt en souffre.",
  Q0310: "Le point-virgule relie deux propositions d'une même phrase : la seconde garde donc sa minuscule.",
  Q0311: "Il n'a pas inventé l'ampoule, mais le premier filament assez durable pour la vendre : 1 200 heures avec du bambou carbonisé.",
  Q0507: "Trois côtés, trois angles, et une somme d'angles toujours égale à 180°.",
  Q0508: "Le calendrier romain n'en comptait que dix : septembre à décembre gardent les noms des 7e au 10e mois.",
  Q0509: "Un siècle va de l'an 1 à l'an 100 : le XXIe a donc commencé le 1er janvier 2001.",
  Q0510: "Ajouter du blanc éclaircit sans changer la teinte : on parle de nuance pastel.",
  Q0511: "La seconde est la seule définie par la physique : 9 192 631 770 vibrations d'un atome de césium.",
  Q0513: "Le mot est attesté dès le XVIe siècle, bien avant les débats récents sur la féminisation.",
  Q0514: "Matt Groening a donné aux personnages les prénoms de sa propre famille, sauf Bart, anagramme de « brat », le garnement.",
  Q0517: "C'est la plus ancienne monnaie encore en circulation : elle a plus de 1 200 ans.",
  Q0518: "Du grec penta, cinq. Le bâtiment du Pentagone, à Washington, en a la forme.",
  Q0520: "Le mot a été forgé en 1944 par Donald Watson, avec les premières et dernières lettres de « vegetarian ».",
  Q0521: "Chaque degré multiplie l'énergie libérée par environ 32 : une magnitude 7 est mille fois plus puissante qu'une 5.",
  Q0525: "Vrai en géométrie plane seulement : tracé sur une sphère, un triangle dépasse les 180°.",
};

/* ---------- Écriture du SQL ---------- */
const csvPath = path.join(ROOT, 'supabase/questions.csv');
const brut = fs.readFileSync(csvPath, 'utf8');

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
  return rows;
}

const rows = parseCsv(brut);
const head = rows[0];
const iId = head.indexOf('id'), iExpl = head.indexOf('explication');
const iQ = head.indexOf('question'), iRep = head.indexOf('reponse');

const connus = new Set(rows.slice(1).map(r => r[iId]));
const inconnus = Object.keys(E).filter(id => !connus.has(id));
if (inconnus.length) throw new Error('identifiants absents de la banque : ' + inconnus.join(', '));

// Contrôle de qualité : ni redite de la réponse, ni explication trop maigre
const soucis = [];
rows.slice(1).forEach(r => {
  const e = E[r[iId]];
  if (!e) return;
  if (e.length < 40) soucis.push(r[iId] + ' : trop courte');
  const rep = r[iRep].trim().toLowerCase();
  if (rep.length > 4 && e.toLowerCase() === rep) soucis.push(r[iId] + ' : répète la réponse');
});
if (soucis.length) throw new Error(soucis.join('\n'));

const esc = s => s.replace(/'/g, "''");
const sql = ['-- Explications ajoutées aux questions qui n\'en avaient pas.',
  '-- À coller dans Supabase → SQL Editor → Run. Rien d\'autre n\'est modifié.',
  '',
  ...Object.keys(E).sort().map(id =>
    `update questions set explication = '${esc(E[id])}' where id = '${id}' and coalesce(explication, '') = '';`),
  '',
  `-- ${Object.keys(E).length} questions complétées`].join('\n');
fs.writeFileSync(path.join(ROOT, 'supabase/maj-explications.sql'), sql + '\n');

// Le CSV du dépôt reste le reflet de la banque
let n = 0;
rows.slice(1).forEach(r => { if (E[r[iId]] && !r[iExpl].trim()) { r[iExpl] = E[r[iId]]; n++; } });
const cell = v => (/[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
fs.writeFileSync(csvPath, rows.map(r => r.map(cell).join(',')).join('\n'));

const restantes = rows.slice(1).filter(r => !r[iExpl].trim()).length;
console.log(`${n} explications écrites → supabase/maj-explications.sql`);
console.log(`questions encore sans explication : ${restantes}`);
