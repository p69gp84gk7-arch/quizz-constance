/**
 * Nouvelles questions « répliques de film », en texte (sans extrait sonore).
 *
 * Pourquoi en texte plutôt qu'en extrait ? Une réplique se reconnaît très bien
 * écrite, et cette forme n'a aucun des défauts de l'audio : pas de publicité,
 * pas de lien YouTube qui meurt, pas de vidéo qui contient dix répliques à la
 * fois. Elles s'ajoutent au thème « Cinéma », catégorie « Répliques », et
 * profitent du réglage QCM / réponse tapée selon la difficulté.
 *
 * Usage : node scripts/repliques.mjs  →  supabase/questions-repliques.csv
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

// [réplique, film (réponse), année, difficulté, explication, 3 mauvaises réponses]
const R = [
  // ---------- Cinéma français ----------
  ['T\'as de beaux yeux, tu sais.', 'Quai des brumes', 1938, 3,
    'Jean Gabin la glisse à Michèle Morgan dans le film de Marcel Carné. Elle est devenue le symbole du « réalisme poétique » français.',
    ['Le Jour se lève', 'Pépé le Moko', 'La Bête humaine']],
  ['Atmosphère, atmosphère… Est-ce que j\'ai une gueule d\'atmosphère ?', 'Hôtel du Nord', 1938, 3,
    'Arletty la lance à Louis Jouvet, sur une passerelle du canal Saint-Martin à Paris. Le décor du film était entièrement reconstitué en studio.',
    ['Quai des brumes', 'Les Enfants du paradis', 'Drôle de drame']],
  ['Les cons, ça ose tout. C\'est même à ça qu\'on les reconnaît.', 'Les Tontons flingueurs', 1963, 2,
    'Signée Michel Audiard, dans la bouche de Bernard Blier. Le film a été un échec à sa sortie avant de devenir culte à la télévision.',
    ['Le Cave se rebiffe', 'Un taxi pour Tobrouk', 'Mélodie en sous-sol']],
  ['Ça va marcher beaucoup moins bien, forcément.', 'Le Corniaud', 1965, 3,
    'Bourvil constate les dégâts sur sa 2 CV pulvérisée par la Rolls de Louis de Funès. La scène a nécessité trois carrosseries identiques.',
    ['La Grande Vadrouille', 'Le Gendarme de Saint-Tropez', 'La Traversée de Paris']],
  ['C\'est cela, oui…', 'Le Père Noël est une ordure', 1982, 2,
    'La rengaine de Thérèse (Anémone), excédée. Le film est né d\'une pièce jouée par la troupe du Splendid au théâtre du Splendid.',
    ['Papy fait de la résistance', 'Les Bronzés', 'Le Grand Bleu']],
  ['Que trépasse si je faiblis !', 'Les Visiteurs', 1993, 1,
    'Le cri de guerre de Godefroy de Montmirail (Jean Reno). Le film a réuni près de 14 millions de spectateurs en France.',
    ['Les Couloirs du temps', 'Astérix et Obélix : Mission Cléopâtre', 'Le Bossu']],
  ['Il s\'appelle Juste Leblanc.', 'Le Dîner de cons', 1998, 1,
    'Jacques Villeret ne comprend pas que « Juste » est un prénom. Francis Veber a d\'abord écrit l\'histoire pour le théâtre, où Villeret tenait déjà le rôle.',
    ['La Chèvre', 'Les Compères', 'Le Placard']],
  ['C\'est toujours comme ça, la vie, ou seulement quand on est petit ?', 'Léon', 1994, 3,
    'Mathilda (Natalie Portman, 12 ans au tournage) à Jean Reno. C\'était le premier grand rôle de l\'actrice.',
    ['Nikita', 'Le Grand Bleu', 'Subway']],
  ['Multipass !', 'Le Cinquième Élément', 1997, 2,
    'Leeloo (Milla Jovovich) brandit son passe universel. Elle parle dans le film une langue inventée par Luc Besson, le « divin langage ».',
    ['Le Grand Bleu', 'Léon', 'Jeanne d\'Arc']],
  ['Je te casse !', 'Brice de Nice', 2005, 2,
    'Le tic de Jean Dujardin en surfeur niçois qui n\'a jamais vu une vague. Le personnage venait de ses spectacles de scène.',
    ['Camping', 'Les Bronzés 3', 'OSS 117 : Le Caire, nid d\'espions']],
  ['Pas de bras, pas de chocolat.', 'Intouchables', 2011, 1,
    'La blague cruelle d\'Omar Sy à Philippe Pozzo di Borgo, dont l\'histoire vraie a inspiré le film. Plus de 19 millions de spectateurs en France.',
    ['Le Sens de la fête', 'Samba', 'Hors normes']],
  ['Ils sont fous, ces Romains !', 'Astérix et Obélix : Mission Cléopâtre', 2002, 2,
    'La réplique d\'Obélix, reprise des albums de Goscinny et Uderzo. Le film d\'Alain Chabat est resté le plus populaire de la série.',
    ['Astérix et Obélix contre César', 'Astérix aux Jeux olympiques', 'Les Visiteurs']],

  // ---------- Cinéma américain : les incontournables ----------
  ['Je suis ton père.', 'Star Wars : L\'Empire contre-attaque', 1980, 1,
    'Dark Vador à Luke Skywalker. Pour garder le secret, l\'acteur avait tourné une autre phrase : la vraie a été ajoutée au doublage.',
    ['Star Wars : Un nouvel espoir', 'Star Wars : Le Retour du Jedi', 'Star Trek']],
  ['Que la Force soit avec toi.', 'Star Wars : Un nouvel espoir', 1977, 1,
    'La formule d\'adieu des Jedi. Le 4 mai est devenu la journée mondiale Star Wars, par jeu de mots avec « May the Fourth ».',
    ['L\'Empire contre-attaque', 'Le Retour du Jedi', 'Dune']],
  ['Je vais te faire une offre que tu ne pourras pas refuser.', 'Le Parrain', 1972, 1,
    'Don Vito Corleone, joué par Marlon Brando, qui s\'était fabriqué ses joues tombantes avec des prothèses dentaires.',
    ['Les Affranchis', 'Scarface', 'Il était une fois en Amérique']],
  ['Je reviendrai.', 'Terminator', 1984, 2,
    'Le fameux « I\'ll be back » d\'Arnold Schwarzenegger. Il voulait dire « I will be back », son accent autrichien rendant la contraction difficile.',
    ['Terminator 2', 'Predator', 'Total Recall']],
  ['Hasta la vista, baby.', 'Terminator 2 : Le Jugement dernier', 1991, 2,
    'C\'est le jeune John Connor qui apprend l\'expression au Terminator. Le film fut le plus cher jamais produit à sa sortie.',
    ['Terminator', 'Predator', 'True Lies']],
  ['La vie, c\'est comme une boîte de chocolats : on ne sait jamais sur quoi on va tomber.', 'Forrest Gump', 1994, 1,
    'La phrase de la mère de Forrest, citée par Tom Hanks sur son banc. Le film a remporté six Oscars, dont meilleur film et meilleur acteur.',
    ['Rain Man', 'Philadelphia', 'Big Fish']],
  ['E.T. téléphone maison.', 'E.T. l\'extra-terrestre', 1982, 1,
    'La phrase de l\'extraterrestre de Steven Spielberg. Sa voix a été composée à partir de celle d\'une fumeuse de 65 ans et de bruits d\'animaux.',
    ['Rencontres du troisième type', 'Les Goonies', 'Cocoon']],
  ['Nom de Zeus !', 'Retour vers le futur', 1985, 1,
    'L\'exclamation de Doc Brown dans la version française (« Great Scott ! » en anglais). La DeLorean n\'avait été produite qu\'à 9 000 exemplaires.',
    ['Retour vers le futur 2', 'L\'Aventure intérieure', 'Explorers']],
  ['Là où on va, on n\'a pas besoin de routes.', 'Retour vers le futur', 1985, 2,
    'La dernière phrase du film, juste avant que la DeLorean ne s\'envole. Elle annonçait la suite, tournée cinq ans plus tard.',
    ['Retour vers le futur 2', 'Retour vers le futur 3', 'Les Visiteurs']],
  ['Des serpents… Pourquoi faut-il toujours que ce soient des serpents ?', 'Les Aventuriers de l\'arche perdue', 1981, 2,
    'La phobie d\'Indiana Jones. Pour la scène du puits, l\'équipe avait rassemblé plusieurs milliers de serpents, dont des pythons inoffensifs.',
    ['Indiana Jones et le Temple maudit', 'Indiana Jones et la Dernière Croisade', 'La Momie']],
  ['Ça appartient à un musée !', 'Indiana Jones et la Dernière Croisade', 1989, 3,
    'La devise de l\'archéologue, reprise par son père Sean Connery. Connery n\'avait que douze ans de plus qu\'Harrison Ford.',
    ['Les Aventuriers de l\'arche perdue', 'Indiana Jones et le Temple maudit', 'Le Crâne de cristal']],
  ['La vie trouve toujours un chemin.', 'Jurassic Park', 1993, 2,
    'Le mathématicien Ian Malcolm (Jeff Goldblum) doute qu\'on puisse contrôler des dinosaures. Le rugissement du T-Rex mêle bébé éléphant, tigre et alligator.',
    ['Le Monde perdu', 'Jurassic World', 'King Kong']],
  ['Bienvenue à Jurassic Park.', 'Jurassic Park', 1993, 2,
    'John Hammond découvre son parc aux visiteurs, sur la musique de John Williams. Les dinosaures n\'apparaissent que quinze minutes à l\'écran.',
    ['Jurassic World', 'Le Monde perdu', 'Westworld']],
  ['Pourquoi tant de sérieux ?', 'The Dark Knight : Le Chevalier noir', 2008, 2,
    'Le Joker de Heath Ledger, récompensé d\'un Oscar à titre posthume. Il avait tenu un carnet intime pour construire le personnage.',
    ['Batman Begins', 'The Dark Knight Rises', 'Joker']],
  ['Tu meurs en héros, ou tu vis assez longtemps pour devenir le méchant.', 'The Dark Knight : Le Chevalier noir', 2008, 4,
    'Harvey Dent annonce sans le savoir sa propre chute. La phrase résume le basculement du personnage en Double-Face.',
    ['Batman Begins', 'The Dark Knight Rises', 'Watchmen']],
  ['Je suis Iron Man.', 'Iron Man', 2008, 2,
    'Tony Stark révèle son identité en conférence de presse. Robert Downey Jr. improvisait une bonne partie de ses dialogues.',
    ['Avengers', 'Iron Man 2', 'Captain America']],
  ['Je suis le roi du monde !', 'Titanic', 1997, 1,
    'Leonardo DiCaprio à la proue du paquebot. Le film a été le premier à dépasser le milliard de dollars de recettes.',
    ['Pearl Harbor', 'Abyss', 'Master and Commander']],
  ['Vous ne passerez pas !', 'Le Seigneur des anneaux : La Communauté de l\'anneau', 2001, 2,
    'Gandalf face au Balrog, sur le pont de Khazad-dûm. Ian McKellen a tourné la scène seul, devant un décor et une créature ajoutés ensuite.',
    ['Les Deux Tours', 'Le Retour du roi', 'Le Hobbit']],
  ['Vous êtes un sorcier, Harry.', 'Harry Potter à l\'école des sorciers', 2001, 1,
    'Hagrid apprend à Harry ce qu\'il est. Robbie Coltrane portait un costume rembourré et des échasses pour dominer les enfants de deux têtes.',
    ['La Chambre des secrets', 'Le Prisonnier d\'Azkaban', 'Les Animaux fantastiques']],
  ['Je vois des gens morts.', 'Sixième Sens', 1999, 2,
    'L\'aveu du jeune Cole à Bruce Willis. Le film est resté célèbre pour son retournement final, que l\'équipe avait consigne de ne pas révéler.',
    ['Incassable', 'Le Village', 'Les Autres']],
  ['La première règle du Fight Club, c\'est qu\'on ne parle pas du Fight Club.', 'Fight Club', 1999, 3,
    'Tyler Durden (Brad Pitt) énonce ses règles. Le film a été un échec en salles avant de devenir un succès en DVD.',
    ['Seven', 'American Psycho', 'Trainspotting']],
  ['Je m\'appelle Maximus Decimus Meridius.', 'Gladiator', 2000, 3,
    'Russell Crowe se dévoile devant l\'empereur Commode, dans l\'arène. Le film a reçu cinq Oscars, dont celui du meilleur acteur.',
    ['Troie', 'Alexandre', 'Ben-Hur']],
  ['Ils peuvent nous prendre nos vies, mais jamais notre liberté !', 'Braveheart', 1995, 3,
    'Le cri de William Wallace, joué et réalisé par Mel Gibson. Le vrai Wallace combattait deux siècles avant l\'époque des kilts montrés au film.',
    ['Rob Roy', 'Gladiator', 'Le Dernier des Mohicans']],
  ['Personne ne met Bébé dans un coin.', 'Dirty Dancing', 1987, 3,
    'Patrick Swayze vient chercher Jennifer Grey pour la danse finale. Le film, tourné avec un très petit budget, a rapporté plus de 200 millions de dollars.',
    ['Flashdance', 'Footloose', 'Grease']],
  ['Tu me parles à moi ?', 'Taxi Driver', 1976, 4,
    'Robert De Niro devant son miroir : la réplique a été improvisée, le scénario indiquait seulement qu\'il se parlait à lui-même.',
    ['Raging Bull', 'Les Affranchis', 'Serpico']],
  ['Yippee ki-yay !', 'Piège de cristal', 1988, 3,
    'La signature de John McClane (Bruce Willis), moquerie de cow-boy lancée au méchant par radio. Le titre original, « Die Hard », a donné son nom à la série.',
    ['58 minutes pour vivre', 'L\'Arme fatale', 'Speed']],
  ['Vous ne pouvez pas encaisser la vérité !', 'Des hommes d\'honneur', 1992, 4,
    'Jack Nicholson craque à la barre face à Tom Cruise. La scène du procès a été tournée en plusieurs jours, Nicholson rejouant son éclat à chaque prise.',
    ['Le Verdict', 'La Firme', 'JFK']],
  ['Ce n\'est qu\'une égratignure !', 'Monty Python : Sacré Graal !', 1975, 4,
    'Le Chevalier noir, amputé des deux bras, refuse d\'admettre sa défaite. Faute de budget, les chevaliers imitent le galop avec des noix de coco.',
    ['La Vie de Brian', 'Le Sens de la vie', 'Les Visiteurs']],
  ['Mon nom est Inigo Montoya. Tu as tué mon père. Prépare-toi à mourir.', 'Princess Bride', 1987, 4,
    'La phrase que le personnage répète pendant tout le film en cherchant l\'homme aux six doigts. Mandy Patinkin s\'était entraîné des mois à l\'escrime.',
    ['Robin des Bois', 'Les Trois Mousquetaires', 'Willow']],
  ['Toto, je crois que nous ne sommes plus au Kansas.', 'Le Magicien d\'Oz', 1939, 4,
    'Dorothy découvre le pays d\'Oz, où le film passe du sépia à la couleur. Le rôle de Toto était tenu par une chienne cairn terrier nommée Terry.',
    ['Blanche-Neige et les Sept Nains', 'Autant en emporte le vent', 'Mary Poppins']],
  ['Franchement, ma chère, c\'est le cadet de mes soucis.', 'Autant en emporte le vent', 1939, 4,
    'La dernière réplique de Rhett Butler à Scarlett. Le mot « damn » de la version originale a failli être censuré par le code Hays.',
    ['Casablanca', 'Le Magicien d\'Oz', 'Les Hauts de Hurlevent']],
  ['Nous aurons toujours Paris.', 'Casablanca', 1942, 3,
    'Humphrey Bogart à Ingrid Bergman, sur le tarmac. Le scénario n\'était pas terminé au début du tournage : les acteurs ignoraient la fin.',
    ['Autant en emporte le vent', 'Le Faucon maltais', 'Le Grand Sommeil']],
  ['Bond. James Bond.', 'James Bond 007 contre Dr No', 1962, 2,
    'La toute première apparition de Sean Connery en 007, à une table de baccara. Six acteurs ont depuis endossé le rôle au cinéma.',
    ['Bons baisers de Russie', 'Goldfinger', 'Casino Royale']],
  ['Hakuna Matata.', 'Le Roi lion', 1994, 1,
    'La devise de Timon et Pumbaa : « sans souci » en swahili. Les animateurs Disney ont observé de vrais lions amenés au studio.',
    ['Le Livre de la jungle', 'Tarzan', 'Madagascar']],
  ['Tout ce que la lumière touche est notre royaume.', 'Le Roi lion', 1994, 3,
    'Mufasa montre les Terres du Milieu à Simba au lever du soleil. L\'histoire emprunte sa trame à Hamlet, de Shakespeare.',
    ['Bambi', 'Le Livre de la jungle', 'Pocahontas']],
  ['Vers l\'infini et au-delà !', 'Toy Story', 1995, 1,
    'Le cri de Buzz l\'Éclair. Toy Story est le premier long métrage entièrement réalisé en images de synthèse.',
    ['Toy Story 2', 'Monstres et Cie', 'Les Indestructibles']],
  ['Ô Capitaine ! Mon Capitaine !', 'Le Cercle des poètes disparus', 1989, 3,
    'Les élèves montent sur leurs tables pour saluer Robin Williams. La phrase vient d\'un poème de Walt Whitman écrit à la mort de Lincoln.',
    ['Will Hunting', 'Les Choristes', 'Entre les murs']],
  ['Carpe diem. Cueillez le jour présent.', 'Le Cercle des poètes disparus', 1989, 3,
    'La leçon du professeur Keating à ses élèves. La formule latine vient du poète Horace, un siècle avant notre ère.',
    ['Will Hunting', 'La Société des poètes', 'Le Nom de la rose']],
  ['Houston, nous avons un problème.', 'Apollo 13', 1995, 2,
    'Tom Hanks en Jim Lovell. Les vrais astronautes avaient dit « Houston, nous avons eu un problème » : le film a mis la phrase au présent.',
    ['L\'Étoffe des héros', 'Gravity', 'First Man']],
  ['Adrian !', 'Rocky', 1976, 3,
    'Le cri de Sylvester Stallone après le combat. Stallone a écrit le scénario en trois jours et refusé de vendre son rôle à un autre acteur.',
    ['Rocky II', 'Raging Bull', 'Million Dollar Baby']],
  ['Un martini. Au shaker, pas à la cuillère.', 'James Bond 007 contre Dr No', 1962, 4,
    'La commande rituelle de 007. Les puristes objectent que secouer le gin le dilue : c\'est bien l\'idée du personnage, qui aime son cocktail glacé.',
    ['Goldfinger', 'Casino Royale', 'Skyfall']],
  ['Élémentaire, mon cher Watson.', 'Le Retour de Sherlock Holmes', 1929, 5,
    'Contrairement à la légende, la phrase n\'existe dans aucun roman de Conan Doyle : c\'est le cinéma qui l\'a inventée, ici dans un film parlant de 1929.',
    ['Le Chien des Baskerville', 'Sherlock Holmes', 'Le Signe des quatre']],
  ['Rosebud.', 'Citizen Kane', 1941, 5,
    'Le dernier mot du magnat mourant, dont tout le film cherche le sens. Orson Welles avait 25 ans et signait là son premier long métrage.',
    ['Le Troisième Homme', 'La Splendeur des Amberson', 'Les Raisins de la colère']],
  ['Libérée, délivrée !', 'La Reine des neiges', 2013, 1,
    'La chanson d\'Elsa, « Let It Go » en version originale. Écrite après coup, elle a fait transformer le personnage, prévu au départ comme la méchante.',
    ['Raiponce', 'Vaiana', 'Rebelle']],
  ['La vengeance est un plat qui se mange froid.', 'Kill Bill', 2003, 4,
    'Le proverbe ouvre le film de Quentin Tarantino, attribué à l\'écran aux Klingons de Star Trek : un clin d\'œil assumé.',
    ['Pulp Fiction', 'Django Unchained', 'Old Boy']],
  ['Dessine-moi comme l\'une de tes Françaises.', 'Titanic', 1997, 3,
    'Kate Winslet pose pour le carnet de Jack. Les mains qui dessinent à l\'écran sont celles de James Cameron, gaucher, filmé en miroir.',
    ['Moulin Rouge', 'Le Fabuleux Destin d\'Amélie Poulain', 'La Belle Époque']],
];

const HEAD = ['id', 'theme', 'categorie', 'difficulte', 'type', 'question', 'reponse', 'choix2', 'choix3', 'choix4',
  'explication', 'indices', 'media_url', 'media_debut', 'media_duree', 'actif', 'utilisations', 'epoque', 'anecdote'];

const epoqueDe = a => a < 1970 ? 'Avant 1970' : a < 1980 ? 'Années 70' : a < 1990 ? 'Années 80'
  : a < 2000 ? 'Années 90' : a < 2010 ? 'Années 2000' : a < 2020 ? 'Années 2010' : 'Années 2020';

const cell = v => {
  v = v === undefined || v === null ? '' : String(v);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

const lignes = R.map(([rep, film, annee, diff, expl, faux], i) => [
  'Q' + (2001 + i), 'Cinéma', 'Répliques', diff, 'QCM',
  '🎬 De quel film vient cette réplique ? « ' + rep + ' »',
  film, faux[0], faux[1], faux[2],
  expl, '', '', 0, 15, 'oui', 0, epoqueDe(annee), '',
]);

// Contrôles : rien de vide, pas de doublon, la bonne réponse n'est pas dans les pièges
const vus = new Set();
lignes.forEach((l, i) => {
  const q = l[5], rep = l[6];
  if (vus.has(q)) throw new Error('réplique en double : ' + q);
  vus.add(q);
  if (!l[10] || l[10].length < 40) throw new Error('explication trop courte : ' + rep);
  [7, 8, 9].forEach(j => { if (l[j] === rep) throw new Error('piège identique à la réponse : ' + rep); });
});

const csv = [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n');
fs.writeFileSync(path.join(ROOT, 'supabase/questions-repliques.csv'), csv);

const parNiveau = {};
lignes.forEach(l => { parNiveau[l[3]] = (parNiveau[l[3]] || 0) + 1; });
console.log(lignes.length + ' répliques écrites → supabase/questions-repliques.csv');
console.log('par niveau : ' + Object.keys(parNiveau).sort().map(k => '★'.repeat(k) + ' ' + parNiveau[k]).join(' · '));
