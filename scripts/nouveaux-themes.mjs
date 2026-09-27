/**
 * Huit nouveaux thèmes pour la banque de questions.
 *
 * Format d'une question : [énoncé, bonne réponse, [3 mauvaises réponses], difficulté, explication]
 * Le moteur choisit tout seul la forme (QCM en facile, réponse tapée au-delà de
 * 4,5 ★) et remplace au besoin les mauvaises réponses par des pièges de la même
 * famille : celles écrites ici sont le filet de sécurité.
 *
 * Usage : node scripts/nouveaux-themes.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

/* ================================================================== */
const THEMES = {

/* ---------------------------------------------------------------- */
'Mythologie & légendes': {
  'Grèce antique': [
    ['Qui est le roi des dieux dans la mythologie grecque ?', 'Zeus', ['Poséidon', 'Hadès', 'Apollon'], 1,
      'Zeus règne depuis l\'Olympe sur les dieux et les hommes ; son attribut est la foudre.'],
    ['Quel héros grec doit accomplir douze travaux ?', 'Héraclès', ['Thésée', 'Persée', 'Jason'], 1,
      'Héraclès (Hercule chez les Romains) accomplit douze travaux pour expier le meurtre de sa famille.'],
    ['Quel monstre au corps de taureau vit dans le labyrinthe de Crète ?', 'Le Minotaure', ['Le Cyclope', 'La Chimère', 'Le Sphinx'], 1,
      'Le Minotaure, enfermé dans le labyrinthe de Dédale, est tué par Thésée guidé par le fil d\'Ariane.'],
    ['Quelle déesse est née de l\'écume de la mer ?', 'Aphrodite', ['Athéna', 'Héra', 'Artémis'], 2,
      'Aphrodite, déesse de l\'amour et de la beauté, naît de l\'écume près de Chypre — la Vénus des Romains.'],
    ['Qui a ouvert la boîte contenant tous les maux de l\'humanité ?', 'Pandore', ['Cassandre', 'Europe', 'Médée'], 2,
      'Pandore libère les maux de la jarre offerte par Zeus ; seule l\'espérance reste au fond.'],
    ['Quel navigateur grec met dix ans à rentrer chez lui après la guerre de Troie ?', 'Ulysse', ['Achille', 'Hector', 'Agamemnon'], 1,
      'L\'Odyssée d\'Homère raconte les dix années de retour d\'Ulysse vers Ithaque et Pénélope.'],
    ['Quel est le point faible d\'Achille ?', 'Son talon', ['Son épaule', 'Son genou', 'Sa nuque'], 1,
      'Sa mère Thétis l\'a plongé dans le Styx en le tenant par le talon, seul endroit resté vulnérable.'],
    ['Quel supplice subit Sisyphe aux Enfers ?', 'Rouler un rocher qui retombe toujours', ['Être dévoré chaque jour', 'Porter le ciel sur ses épaules', 'Ne jamais pouvoir boire'], 2,
      'Sisyphe pousse éternellement un rocher au sommet d\'une colline, d\'où il redescend aussitôt.'],
  ],
  'Rome et Égypte': [
    ['Quel dieu romain correspond au grec Arès ?', 'Mars', ['Jupiter', 'Mercure', 'Vulcain'], 2,
      'Mars est le dieu romain de la guerre ; il a donné son nom au mois de mars et à la planète rouge.'],
    ['Quelles jumelles légendaires fondent Rome ?', 'Romulus et Rémus', ['Castor et Pollux', 'Énée et Anchise', 'Numa et Tullus'], 1,
      'Élevés par une louve, les jumeaux fondent Rome en 753 av. J.-C. ; Romulus tue Rémus et donne son nom à la ville.'],
    ['Quel dieu égyptien a une tête de chacal ?', 'Anubis', ['Horus', 'Rê', 'Sobek'], 2,
      'Anubis veille sur l\'embaumement et guide les morts ; Horus, lui, a une tête de faucon.'],
    ['Quel dieu égyptien est le soleil ?', 'Rê', ['Osiris', 'Seth', 'Thot'], 2,
      'Rê (ou Râ) traverse le ciel chaque jour dans sa barque solaire ; les pharaons se disent ses fils.'],
  ],
  'Nordique et créatures': [
    ['Quel dieu nordique manie le marteau Mjöllnir ?', 'Thor', ['Odin', 'Loki', 'Freyr'], 1,
      'Thor, dieu du tonnerre, lance Mjöllnir qui revient toujours dans sa main ; il a donné son nom au jeudi anglais.'],
    ['Comment s\'appelle le paradis des guerriers dans la mythologie nordique ?', 'Le Valhalla', ['Le Ragnarök', 'Asgard', 'Midgard'], 2,
      'Odin accueille au Valhalla les guerriers morts au combat, choisis par les Valkyries.'],
    ['Quelle créature a un corps de lion, des ailes et une tête d\'aigle ?', 'Le griffon', ['Le centaure', 'La harpie', 'Le basilic'], 2,
      'Le griffon garde les trésors dans les légendes antiques ; il figure sur de nombreux blasons.'],
    ['Quel oiseau légendaire renaît de ses cendres ?', 'Le phénix', ['Le griffon', 'La harpie', 'Le roc'], 1,
      'Le phénix se consume puis renaît, symbole de renaissance présent en Égypte comme en Chine.'],
    ['Quelle créature marine attire les marins par son chant ?', 'La sirène', ['La naïade', 'La nymphe', 'L\'ondine'], 1,
      'Dans l\'Odyssée, Ulysse se fait attacher au mât pour entendre leur chant sans y succomber.'],
  ],
},

/* ---------------------------------------------------------------- */
'Espace & astronomie': {
  'Système solaire': [
    ['Quelle est la plus grosse planète du système solaire ?', 'Jupiter', ['Saturne', 'Neptune', 'Uranus'], 1,
      'Jupiter fait 11 fois le diamètre de la Terre et pèse deux fois et demie toutes les autres planètes réunies.'],
    ['Quelle planète tourne sur elle-même à l\'envers des autres ?', 'Vénus', ['Mars', 'Jupiter', 'Neptune'], 3,
      'Vénus tourne dans le sens rétrograde et très lentement : un jour vénusien dure plus long qu\'une année vénusienne.'],
    ['Quelle planète est la plus chaude du système solaire ?', 'Vénus', ['Mercure', 'Mars', 'Jupiter'], 2,
      'Malgré sa distance, Vénus dépasse 460 °C : son atmosphère de CO₂ provoque un effet de serre extrême.'],
    ['Combien de temps la lumière du Soleil met-elle à nous parvenir ?', 'Environ 8 minutes', ['Environ 1 seconde', 'Environ 1 heure', 'Environ 1 jour'], 2,
      'La lumière parcourt les 150 millions de kilomètres Terre-Soleil en 8 minutes et 20 secondes.'],
    ['Quelle planète possède les anneaux les plus visibles ?', 'Saturne', ['Jupiter', 'Uranus', 'Neptune'], 1,
      'Les anneaux de Saturne, faits de glace et de roches, s\'étendent sur 280 000 km mais font moins d\'un kilomètre d\'épaisseur.'],
    ['Quel est le plus haut volcan du système solaire ?', 'Olympus Mons, sur Mars', ['Le Mauna Kea, sur Terre', 'Le Maat Mons, sur Vénus', 'Le Pélé, sur Io'], 3,
      'Olympus Mons culmine à environ 22 km, presque trois fois l\'Everest, pour 600 km de large.'],
    ['Pourquoi Pluton n\'est-elle plus une planète ?', 'Elle n\'a pas nettoyé son orbite', ['Elle est trop froide', 'Elle n\'a pas de lune', 'Elle tourne à l\'envers'], 3,
      'En 2006, l\'Union astronomique internationale ajoute ce critère : Pluton devient une « planète naine ».'],
  ],
  'Exploration': [
    ['Qui fut le premier homme dans l\'espace ?', 'Youri Gagarine', ['Neil Armstrong', 'Alan Shepard', 'Valentina Terechkova'], 1,
      'Le Soviétique Youri Gagarine fait le tour de la Terre le 12 avril 1961, en 108 minutes.'],
    ['Qui fut la première femme dans l\'espace ?', 'Valentina Terechkova', ['Sally Ride', 'Claudie Haigneré', 'Mae Jemison'], 2,
      'Valentina Terechkova vole seule à bord de Vostok 6 en juin 1963, à 26 ans.'],
    ['Comment s\'appelle le télescope spatial lancé en 1990 ?', 'Hubble', ['James Webb', 'Kepler', 'Spitzer'], 2,
      'Hubble tourne à 540 km d\'altitude ; sa vue myope a été corrigée par une mission de réparation en 1993.'],
    ['Quel engin s\'est posé sur Mars en 2021 pour y chercher des traces de vie ?', 'Perseverance', ['Curiosity', 'Opportunity', 'Spirit'], 3,
      'Perseverance s\'est posé dans le cratère Jezero en février 2021, avec le petit hélicoptère Ingenuity.'],
    ['Combien d\'hommes ont marché sur la Lune ?', 'Douze', ['Six', 'Deux', 'Vingt-quatre'], 3,
      'Douze astronautes, tous américains, ont marché sur la Lune entre 1969 et 1972, lors de six missions Apollo.'],
  ],
  'Étoiles et galaxies': [
    ['Quelle galaxie va percuter la nôtre dans environ 4 milliards d\'années ?', 'Andromède', ['Le Triangle', 'Le Grand Nuage de Magellan', 'le Sombrero'], 3,
      'Andromède fonce vers nous à 110 km/s ; la collision formera une seule grande galaxie elliptique.'],
    ['Qu\'est-ce qu\'une année-lumière ?', 'Une distance', ['Une durée', 'Une vitesse', 'Une masse'], 2,
      'C\'est la distance parcourue par la lumière en un an : environ 9 461 milliards de kilomètres.'],
    ['Que devient une étoile très massive en fin de vie ?', 'Un trou noir', ['Une planète', 'Une comète', 'Une nébuleuse froide'], 2,
      'Au-delà d\'une certaine masse, l\'étoile s\'effondre sur elle-même après une supernova et forme un trou noir.'],
    ['Quelle est l\'étoile la plus proche de la Terre ?', 'Le Soleil', ['Proxima du Centaure', 'Sirius', 'l\'étoile Polaire'], 1,
      'Le Soleil est une étoile, à 150 millions de km ; la suivante, Proxima du Centaure, est à 4,2 années-lumière.'],
  ],
},

/* ---------------------------------------------------------------- */
'Corps humain & santé': {
  'Anatomie': [
    ['Quel organe humain est capable de se régénérer presque entièrement ?', 'Le foie', ['Le cœur', 'Les reins', 'Le cerveau'], 2,
      'Le foie peut repousser après l\'ablation de deux tiers de son volume : c\'est ce qui rend le don possible.'],
    ['Quelle partie de l\'œil ne contient aucun vaisseau sanguin ?', 'La cornée', ['La rétine', 'l\'iris', 'le cristallin'], 3,
      'La cornée se nourrit des larmes et de l\'humeur aqueuse : c\'est ce qui rend sa greffe si bien tolérée.'],
    ['Quel est le plus petit os du corps humain ?', 'L\'étrier', ['Le scaphoïde', 'La rotule', 'Le coccyx'], 3,
      'L\'étrier, dans l\'oreille moyenne, mesure environ 3 mm et transmet les vibrations à l\'oreille interne.'],
    ['Combien de litres de sang un adulte a-t-il environ ?', '5 litres', ['2 litres', '10 litres', '20 litres'], 1,
      'Environ 5 litres, soit 7 à 8 % du poids du corps ; le cœur les fait circuler en une minute au repos.'],
    ['Quel organe produit l\'insuline ?', 'Le pancréas', ['Le foie', 'Les reins', 'La rate'], 2,
      'Les îlots de Langerhans du pancréas produisent l\'insuline, qui règle le taux de sucre dans le sang.'],
    ['Quel est le muscle le plus puissant du corps, à sa taille ?', 'Le masséter (mâchoire)', ['Le biceps', 'Le mollet', 'Le cœur'], 3,
      'Le masséter peut exercer plusieurs centaines de newtons : c\'est lui qui ferme la mâchoire.'],
    ['Combien de dents un adulte a-t-il, dents de sagesse comprises ?', '32', ['20', '28', '36'], 1,
      '32 dents définitives, contre 20 dents de lait ; les dents de sagesse manquent chez certaines personnes.'],
  ],
  'Comment ça marche': [
    ['Quel organe filtre le sang pour fabriquer l\'urine ?', 'Les reins', ['Le foie', 'La vessie', 'La rate'], 1,
      'Les deux reins filtrent environ 180 litres de sang par jour pour en tirer 1,5 litre d\'urine.'],
    ['Combien de fois le cœur bat-il en moyenne par minute au repos ?', 'Environ 70', ['Environ 30', 'Environ 120', 'Environ 200'], 1,
      'Entre 60 et 80 battements par minute chez l\'adulte au repos, soit environ 100 000 par jour.'],
    ['Quelle partie du cerveau gère l\'équilibre ?', 'Le cervelet', ['Le cortex', 'L\'hypophyse', 'Le bulbe'], 2,
      'Le cervelet, à l\'arrière du crâne, coordonne les mouvements et l\'équilibre sans qu\'on y pense.'],
    ['Combien de temps un globule rouge vit-il environ ?', '120 jours', ['24 heures', '10 ans', 'Toute la vie'], 3,
      'Les globules rouges vivent environ quatre mois ; la moelle osseuse en fabrique 2 millions par seconde.'],
    ['Quel sens est le plus lié à la mémoire des souvenirs anciens ?', 'L\'odorat', ['La vue', 'L\'ouïe', 'Le toucher'], 2,
      'Les voies olfactives rejoignent directement l\'hippocampe et l\'amygdale, sièges de la mémoire et des émotions.'],
  ],
  'Santé': [
    ['Qui a découvert la pénicilline ?', 'Alexander Fleming', ['Louis Pasteur', 'Robert Koch', 'Jonas Salk'], 2,
      'En 1928, Fleming remarque qu\'une moisissure tombée par hasard dans une boîte tue les bactéries.'],
    ['Contre quelle maladie Pasteur a-t-il mis au point un vaccin en 1885 ?', 'La rage', ['La variole', 'La tuberculose', 'Le choléra'], 2,
      'Le 6 juillet 1885, Pasteur vaccine Joseph Meister, mordu par un chien enragé : l\'enfant survit.'],
    ['Combien d\'heures de sommeil un adulte a-t-il besoin en moyenne ?', '7 à 9 heures', ['3 à 4 heures', '5 à 6 heures', '11 à 12 heures'], 1,
      'Sept à neuf heures selon les personnes ; le manque chronique augmente les risques cardiovasculaires.'],
  ],
},

/* ---------------------------------------------------------------- */
'Inventions & technologie': {
  'Grandes inventions': [
    ['Qui a inventé l\'imprimerie à caractères mobiles en Europe ?', 'Gutenberg', ['Léonard de Vinci', 'Galilée', 'Newton'], 1,
      'Vers 1450 à Mayence, Gutenberg met au point les caractères mobiles en métal : le livre devient accessible.'],
    ['Qui a déposé le brevet du téléphone en 1876 ?', 'Alexander Graham Bell', ['Thomas Edison', 'Nikola Tesla', 'Samuel Morse'], 2,
      'Bell dépose son brevet quelques heures avant Elisha Gray, le 14 février 1876 — la paternité reste discutée.'],
    ['Quels frères ont inventé le cinématographe ?', 'Les frères Lumière', ['Les frères Pathé', 'Les frères Wright', 'Les frères Montgolfier'], 1,
      'Auguste et Louis Lumière projettent leurs premiers films payants à Paris le 28 décembre 1895.'],
    ['Quels frères ont réalisé le premier vol motorisé en 1903 ?', 'Les frères Wright', ['Les frères Lumière', 'Les frères Voisin', 'Les frères Caudron'], 1,
      'Le 17 décembre 1903 à Kitty Hawk, le Flyer vole 12 secondes sur 37 mètres.'],
    ['Qui a inventé la pile électrique ?', 'Alessandro Volta', ['Michael Faraday', 'André-Marie Ampère', 'Georg Ohm'], 2,
      'Volta présente sa pile en 1800 ; son nom a donné le volt, unité de tension électrique.'],
    ['Quelle invention de 1928 a révolutionné l\'emballage alimentaire ?', 'Le scotch (ruban adhésif)', ['Le film plastique', 'La boîte de conserve', 'Le carton ondulé'], 3,
      'Richard Drew met au point chez 3M le ruban adhésif transparent, commercialisé sous le nom Scotch en 1930.'],
    ['Qui a mis au point le premier vaccin, contre la variole ?', 'Edward Jenner', ['Louis Pasteur', 'Robert Koch', 'Ignace Semmelweis'], 3,
      'En 1796, Jenner inocule la vaccine à un enfant : le mot « vaccin » vient de vacca, la vache.'],
  ],
  'Informatique': [
    ['En quelle année le World Wide Web a-t-il été inventé ?', '1989', ['1969', '1979', '1999'], 2,
      'Tim Berners-Lee propose le Web au CERN en mars 1989 ; le premier site ouvre en 1991.'],
    ['Qui a inventé le World Wide Web ?', 'Tim Berners-Lee', ['Bill Gates', 'Steve Jobs', 'Vint Cerf'], 2,
      'Physicien au CERN, Berners-Lee invente les adresses web, le HTML et le premier navigateur.'],
    ['Que signifie « www » ?', 'World Wide Web', ['World Web Wide', 'Wide World Web', 'Web World Wide'], 1,
      'La « toile mondiale » : l\'ensemble des pages reliées par des liens, accessibles par Internet.'],
    ['Quelle société a lancé le premier iPhone ?', 'Apple', ['Nokia', 'Samsung', 'BlackBerry'], 1,
      'Steve Jobs présente l\'iPhone le 9 janvier 2007 ; il sort aux États-Unis le 29 juin de la même année.'],
    ['Que mesure un octet ?', 'Une quantité d\'information', ['Une vitesse', 'Une fréquence', 'Une tension'], 2,
      'Un octet vaut 8 bits et suffit à coder un caractère ; mille milliards d\'octets font un téraoctet.'],
    ['Comment s\'appelle le premier ordinateur électronique, mis en service en 1946 ?', 'l\'ENIAC', ['l\'UNIVAC', 'le Colossus', 'le Mark I'], 3,
      'L\'ENIAC pesait 30 tonnes, occupait 167 m² et consommait 150 kW pour 5 000 additions par seconde.'],
  ],
  'Objets du quotidien': [
    ['Quel objet du quotidien a été inventé par Whitcomb Judson en 1893 ?', 'La fermeture éclair', ['Le trombone', 'L\'agrafeuse', 'Le stylo à bille'], 3,
      'Brevetée en 1893, la fermeture à glissière ne devient fiable qu\'en 1913 grâce à Gideon Sundback.'],
    ['Qui a inventé le stylo à bille moderne ?', 'László Bíró', ['Marcel Bich', 'Waterman', 'Parker'], 3,
      'Le journaliste hongrois Bíró dépose son brevet en 1938 ; Marcel Bich en fera le Bic en 1950.'],
    ['Le micro-ondes a été découvert grâce à quel incident ?', 'Une barre chocolatée fondue dans une poche', ['Un incendie de laboratoire', 'Une panne de radar', 'Un café renversé'], 3,
      'En 1945, l\'ingénieur Percy Spencer remarque que le magnétron d\'un radar a fait fondre la barre dans sa poche.'],
  ],
},

/* ---------------------------------------------------------------- */
'Séries & télévision': {
  'Séries cultes': [
    ['Dans quelle ville se déroule la série « Friends » ?', 'New York', ['Los Angeles', 'Chicago', 'Boston'], 1,
      'Les six amis vivent à Manhattan ; la série a compté 236 épisodes entre 1994 et 2004.'],
    ['Quel est le café où se retrouvent les personnages de « Friends » ?', 'Central Perk', ['Central Park Café', 'The Coffee Bean', 'Monk\'s'], 2,
      'Le nom joue sur Central Park ; le canapé orange du Central Perk est devenu un objet culte.'],
    ['Dans « Breaking Bad », quel était le métier de Walter White ?', 'Professeur de chimie', ['Médecin', 'Comptable', 'Pharmacien'], 2,
      'Professeur de lycée atteint d\'un cancer, il bascule dans la fabrication de drogue pour payer ses soins.'],
    ['Quelle série met en scène les familles Stark, Lannister et Targaryen ?', 'Game of Thrones', ['Vikings', 'The Witcher', 'Rome'], 1,
      'Adaptée des romans de George R. R. Martin, la série HBO a duré huit saisons, de 2011 à 2019.'],
    ['Dans quelle série une famille jaune vit-elle à Springfield ?', 'Les Simpson', ['Family Guy', 'South Park', 'American Dad'], 1,
      'Créée par Matt Groening en 1989, c\'est la série animée la plus longue de la télévision américaine.'],
    ['Quelle série espagnole met en scène des braqueurs en combinaison rouge ?', 'La Casa de Papel', ['Élite', 'Narcos', 'Vis a vis'], 2,
      'Les braqueurs portent un masque de Dalí et le chant « Bella ciao » est devenu l\'hymne de la série.'],
    ['Dans « Stranger Things », comment s\'appelle le monde parallèle ?', 'Le Monde à l\'envers', ['L\'Autre Côté', 'La Zone', 'Le Vide'], 3,
      'The Upside Down en version originale : un double sombre et glacé de la ville de Hawkins.'],
  ],
  'Télévision française': [
    ['Quelle série française suit les habitants de Montmartre autour d\'un bar, depuis 2004 ?', 'Plus belle la vie', ['Un si grand soleil', 'Demain nous appartient', 'Scènes de ménages'], 3,
      'Diffusée de 2004 à 2022 puis relancée, la série se déroule en réalité au Mistral, quartier fictif de Marseille.'],
    ['Quelle série humoristique met en scène le roi Arthur à Kaamelott ?', 'Kaamelott', ['Perceval', 'Les Chevaliers', 'Excalibur'], 1,
      'Créée par Alexandre Astier en 2005, la série revisite la légende arthurienne en épisodes de 3 minutes.'],
    ['Quel présentateur a animé « Fort Boyard » avec Passe-Partout ?', 'Olivier Minne', ['Nagui', 'Jean-Pierre Foucault', 'Patrick Sabatier'], 2,
      'Olivier Minne anime Fort Boyard depuis 2003 ; l\'émission a été créée en 1990.'],
    ['Quel jeu télévisé demande de trouver un mot à partir de lettres et de chiffres ?', 'Des chiffres et des lettres', ['Questions pour un champion', 'Motus', 'Slam'], 2,
      'Créé en 1965 sous le nom « Le mot le plus long », c\'est l\'un des plus vieux jeux de la télévision française.'],
  ],
},

/* ---------------------------------------------------------------- */
'Marques & publicité': {
  'Logos et origines': [
    ['Quelle marque a pour logo une pomme croquée ?', 'Apple', ['Android', 'Blackberry', 'Orange'], 1,
      'Le logo est croqué pour qu\'on ne le confonde pas avec une cerise ; il date de 1977.'],
    ['Quelle marque automobile a quatre anneaux entrelacés ?', 'Audi', ['Volkswagen', 'BMW', 'Opel'], 1,
      'Les quatre anneaux rappellent la fusion de quatre constructeurs allemands en 1932.'],
    ['De quel pays la marque IKEA est-elle originaire ?', 'La Suède', ['Le Danemark', 'La Norvège', 'La Finlande'], 1,
      'Fondée en 1943 par Ingvar Kamprad, 17 ans ; IKEA vient de ses initiales et de celles de sa ferme natale.'],
    ['Quelle marque de sport a pour slogan « Just Do It » ?', 'Nike', ['Adidas', 'Puma', 'Reebok'], 1,
      'Le slogan date de 1988 ; le nom Nike vient de la déesse grecque de la victoire.'],
    ['Quelles marques ont été fondées par deux frères brouillés à vie ?', 'Adidas et Puma', ['Nike et Reebok', 'Lacoste et Le Coq Sportif', 'Fila et Kappa'], 3,
      'Adolf et Rudolf Dassler se fâchent en 1948 : Adi fonde Adidas, Rudolf fonde Puma, dans le même village allemand.'],
    ['Quelle marque de soda a inventé le père Noël rouge tel qu\'on le connaît ?', 'Coca-Cola', ['Pepsi', 'Schweppes', 'Orangina'], 2,
      'La publicité de 1931 signée Haddon Sundblom a fixé son costume rouge — le rouge existait déjà, mais elle l\'a imposé.'],
    ['Que vendait la marque Nokia à ses débuts, en 1865 ?', 'Du papier', ['Des radios', 'Des pneus', 'Des montres'], 3,
      'Nokia démarre comme papeterie en Finlande, puis fabrique des bottes en caoutchouc avant les téléphones.'],
  ],
  'Slogans': [
    ['Quelle marque dit « Parce que je le vaux bien » ?', 'L\'Oréal', ['Nivea', 'Dove', 'Garnier'], 1,
      'Slogan créé en 1971 par une rédactrice de 23 ans, Ilon Specht, pour valoriser le choix des femmes.'],
    ['« Un café nommé désir » est le slogan de quelle marque ?', 'Carte Noire', ['Nespresso', 'Lavazza', 'Grand-Mère'], 2,
      'Slogan lancé en 1982, clin d\'œil à la pièce de Tennessee Williams « Un tramway nommé Désir ».'],
    ['Quelle marque a pour signature « Think different » ?', 'Apple', ['IBM', 'Microsoft', 'Sony'], 2,
      'Campagne de 1997, au retour de Steve Jobs, rendant hommage aux « fous » qui changent le monde.'],
  ],
},

/* ---------------------------------------------------------------- */
'Contes & dessins animés': {
  'Contes': [
    ['Qui perd une pantoufle de verre à minuit ?', 'Cendrillon', ['Blanche-Neige', 'La Belle au bois dormant', 'Peau d\'Âne'], 1,
      'Le conte de Perrault (1697) ; la pantoufle était peut-être de vair (fourrure) avant d\'être de verre.'],
    ['Combien de nains accueillent Blanche-Neige ?', 'Sept', ['Cinq', 'Six', 'Huit'], 1,
      'Les frères Grimm ne leur donnent pas de nom : ce sont les studios Disney qui les baptiseront en 1937.'],
    ['Quel personnage voit son nez s\'allonger quand il ment ?', 'Pinocchio', ['Peter Pan', 'Aladdin', 'Le Petit Poucet'], 1,
      'Créé par Carlo Collodi en 1881, le pantin de bois devient un vrai garçon à la fin du roman.'],
    ['Qui sème des cailloux pour retrouver son chemin ?', 'Le Petit Poucet', ['Hansel', 'Jack', 'Tom Pouce'], 2,
      'Chez Perrault, il sème d\'abord des cailloux blancs, puis des miettes de pain que les oiseaux mangent.'],
    ['Quel conte met en scène une princesse endormie cent ans ?', 'La Belle au bois dormant', ['Cendrillon', 'Raiponce', 'Blanche-Neige'], 1,
      'Piquée par un fuseau, elle dort cent ans avec tout le château : Perrault en 1697, puis les Grimm.'],
    ['Qui a écrit « La Petite Sirène » et « Le Vilain Petit Canard » ?', 'Hans Christian Andersen', ['Charles Perrault', 'Les frères Grimm', 'La Comtesse de Ségur'], 2,
      'Le Danois Andersen publie ces contes dans les années 1830-40 ; sa statue veille sur le port de Copenhague.'],
  ],
  'Dessins animés': [
    ['Quel est le premier long métrage d\'animation de Disney ?', 'Blanche-Neige et les Sept Nains', ['Pinocchio', 'Fantasia', 'Bambi'], 2,
      'Sorti en 1937, on l\'appelait « la folie de Disney » avant son triomphe au box-office.'],
    ['Quel studio japonais a réalisé « Mon voisin Totoro » ?', 'Le studio Ghibli', ['Toei Animation', 'Madhouse', 'Sunrise'], 2,
      'Fondé en 1985 par Hayao Miyazaki et Isao Takahata ; Totoro est devenu l\'emblème du studio.'],
    ['Quel film de Miyazaki a reçu l\'Oscar du meilleur film d\'animation en 2003 ?', 'Le Voyage de Chihiro', ['Princesse Mononoké', 'Le Château ambulant', 'Ponyo'], 3,
      'Sorti en 2001, il reste le film le plus vu au Japon pendant près de vingt ans.'],
    ['Quel est le premier long métrage entièrement en images de synthèse ?', 'Toy Story', ['Shrek', 'Fourmiz', 'Le Roi Lion'], 2,
      'Sorti en 1995, le premier film de Pixar a demandé quatre ans de production et 800 000 heures de calcul.'],
    ['Dans « Le Roi Lion », comment s\'appelle le lionceau ?', 'Simba', ['Mufasa', 'Scar', 'Kovu'], 1,
      'Simba signifie « lion » en swahili ; Mufasa est son père et Scar son oncle.'],
    ['Quel personnage de dessin animé mange des épinards pour devenir fort ?', 'Popeye', ['Bugs Bunny', 'Tom', 'Droopy'], 1,
      'Créé en 1929, Popeye a fait grimper la consommation d\'épinards aux États-Unis d\'un tiers.'],
  ],
},

/* ---------------------------------------------------------------- */
'Transports': {
  'Route et rail': [
    ['Quel train français a battu le record du monde de vitesse sur rail en 2007 ?', 'Le TGV', ['Le Shinkansen', 'l\'ICE', 'l\'Eurostar'], 2,
      'Le 3 avril 2007, une rame TGV atteint 574,8 km/h sur la ligne Est — record du monde sur rail classique.'],
    ['Quelle voiture est la plus vendue de tous les temps ?', 'La Toyota Corolla', ['La Volkswagen Coccinelle', 'La Ford T', 'La Renault Clio'], 3,
      'Plus de 50 millions d\'exemplaires depuis 1966, devant la Golf et la Coccinelle.'],
    ['Quel constructeur a lancé la 2CV en 1948 ?', 'Citroën', ['Renault', 'Peugeot', 'Simca'], 1,
      'Conçue pour « transporter deux paysans et 50 kg de pommes de terre à 60 km/h », elle sera produite jusqu\'en 1990.'],
    ['De quel côté de la route roule-t-on au Japon ?', 'À gauche', ['À droite', 'Au centre', 'Cela dépend des régions'], 2,
      'Le Japon roule à gauche, comme le Royaume-Uni, l\'Inde ou l\'Australie — environ un tiers de l\'humanité.'],
    ['Quelle est la plus longue ligne de chemin de fer du monde ?', 'Le Transsibérien', ['l\'Orient-Express', 'le Canadien Pacifique', 'le Ghan australien'], 2,
      'De Moscou à Vladivostok : 9 289 km, sept fuseaux horaires et six jours de voyage.'],
  ],
  'Air et mer': [
    ['Quel avion supersonique de ligne franco-britannique a volé jusqu\'en 2003 ?', 'Le Concorde', ['Le Tupolev 144', 'le Boeing 747', 'l\'Airbus A380'], 1,
      'Le Concorde reliait Paris à New York en 3 h 30 à Mach 2 ; il est retiré du service en octobre 2003.'],
    ['Quel est l\'avion de ligne le plus gros du monde ?', 'l\'Airbus A380', ['Le Boeing 747', 'l\'Antonov 225', 'le Boeing 777'], 2,
      'L\'A380 peut transporter plus de 850 passagers sur deux ponts ; sa production s\'est arrêtée en 2021.'],
    ['Qui a traversé l\'Atlantique en solitaire et sans escale en 1927 ?', 'Charles Lindbergh', ['Jean Mermoz', 'Amelia Earhart', 'Louis Blériot'], 2,
      'Lindbergh relie New York à Paris en 33 h 30 à bord du Spirit of St. Louis, en mai 1927.'],
    ['Qui a traversé la Manche en avion le premier, en 1909 ?', 'Louis Blériot', ['Les frères Wright', 'Roland Garros', 'Clément Ader'], 2,
      'Le 25 juillet 1909, Blériot relie Calais à Douvres en 37 minutes et empoche le prix du Daily Mail.'],
    ['Quel canal relie la Méditerranée à la mer Rouge ?', 'Le canal de Suez', ['Le canal de Panama', 'Le canal de Corinthe', 'Le canal de Kiel'], 1,
      'Ouvert en 1869 sous la direction de Ferdinand de Lesseps, il évite de contourner l\'Afrique.'],
    ['Quel canal relie l\'Atlantique au Pacifique ?', 'Le canal de Panama', ['Le canal de Suez', 'Le détroit de Magellan', 'Le canal de Corinthe'], 1,
      'Ouvert en 1914, long de 77 km, il fait gagner 13 000 km par rapport au cap Horn.'],
  ],
},

};

/* ================================================================== */
/* Écriture du CSV                                                     */
/* ================================================================== */

const HEAD = ['id', 'theme', 'categorie', 'difficulte', 'type', 'question', 'reponse', 'choix2', 'choix3', 'choix4',
  'explication', 'indices', 'media_url', 'media_debut', 'media_duree', 'actif', 'utilisations', 'epoque', 'anecdote'];

const cell = v => {
  v = v === undefined || v === null ? '' : String(v);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
/** Comparaison d'énoncés : on ignore les emoji, la ponctuation et les accents. */
const normQ = s => norm(s);

/** Tout ce qui est déjà en banque, pour ne pas reposer deux fois la même question. */
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

const dejaPosees = new Set();
['questions', 'questions-repliques', 'questions-dates', 'questions-devinettes', 'questions-citations']
  .forEach(f => {
    const chemin = path.join(ROOT, 'supabase/' + f + '.csv');
    if (!fs.existsSync(chemin)) return;
    parseCsv(fs.readFileSync(chemin, 'utf8')).forEach(r => dejaPosees.add(normQ(r.question)));
  });

const lignes = [];
const vues = new Set();
let n = 2600;

Object.keys(THEMES).forEach(theme => {
  Object.keys(THEMES[theme]).forEach(cat => {
    THEMES[theme][cat].forEach(([q, rep, faux, diff, expl]) => {
      if (!q || !rep) throw new Error('question incomplète : ' + q);
      if (!faux || faux.length !== 3) throw new Error('il faut 3 mauvaises réponses : ' + q);
      if (!expl || expl.length < 45) throw new Error('explication trop courte : ' + q);
      if (!(diff >= 1 && diff <= 5)) throw new Error('difficulté hors bornes : ' + q);
      if (vues.has(normQ(q))) throw new Error('question en double : ' + q);
      if (dejaPosees.has(normQ(q))) throw new Error('cette question est déjà en banque : ' + q);
      vues.add(normQ(q));
      const tous = [rep].concat(faux).map(norm);
      if (new Set(tous).size !== 4) throw new Error('propositions en double : ' + q);
      lignes.push(['Q' + (n++), theme, cat, diff, 'QCM', q, rep, faux[0], faux[1], faux[2],
        expl, '', '', 0, 15, 'oui', 0, '', '']);
    });
  });
});

fs.writeFileSync(path.join(ROOT, 'supabase/questions-nouveaux-themes.csv'),
  [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n'));

const parTheme = {};
lignes.forEach(l => { parTheme[l[1]] = (parTheme[l[1]] || 0) + 1; });
console.log(`${lignes.length} questions écrites → supabase/questions-nouveaux-themes.csv`);
Object.keys(parTheme).forEach(t => console.log(`  ${String(parTheme[t]).padStart(3)} · ${t}`));
console.log('identifiants : Q2600 à Q' + (n - 1));
