/**
 * Devinettes à quatre indices : « Qui suis-je ? », « Quel est ce lieu ? »…
 * Les indices vont du plus vague au plus parlant ; le joueur qui trouve dès le
 * premier gagne le double de points.
 *
 * Chaque entrée : [réponse, thème, catégorie, difficulté, [4 indices], explication, [2 leurres]]
 * Les leurres ne servent qu'au repli : en partie, le moteur pioche de vrais pièges
 * dans la même famille de questions.
 *
 * Usage : node scripts/devinettes.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

/* ------------------------------------------------------------------ */
/* Les devinettes                                                      */
/* ------------------------------------------------------------------ */

const D = [
  /* ---------------- Histoire · Personnalité ---------------- */
  ['Napoléon Bonaparte', 'Histoire', 'Personnalité', 1, [
    'Je suis né sur une île méditerranéenne en 1769.',
    'Officier d\'artillerie, je prends le pouvoir par un coup d\'État.',
    'Je me couronne empereur à Notre-Dame en 1804.',
    'Je perds ma dernière bataille à Waterloo et meurs à Sainte-Hélène.',
  ], 'Né en Corse, empereur des Français de 1804 à 1815, il meurt en exil à Sainte-Hélène en 1821.',
    ['Louis XVI', 'Robespierre']],

  ['Cléopâtre', 'Histoire', 'Personnalité', 2, [
    'Je règne sur un royaume traversé par un très long fleuve.',
    'Je descends d\'une dynastie grecque installée là depuis Alexandre.',
    'J\'ai séduit deux des hommes les plus puissants de Rome.',
    'Dernière reine d\'Égypte, je me serais donné la mort par la morsure d\'un serpent.',
  ], 'Cléopâtre VII, dernière souveraine de l\'Égypte ptolémaïque, alliée de César puis de Marc Antoine, morte en 30 av. J.-C.',
    ['Néfertiti', 'Hatchepsout']],

  ['Jeanne d\'Arc', 'Histoire', 'Personnalité', 1, [
    'Je suis née dans un village lorrain vers 1412.',
    'J\'affirme entendre des voix qui me confient une mission.',
    'Je fais lever le siège d\'Orléans et conduis le roi à Reims.',
    'Capturée puis jugée, je suis brûlée vive à Rouen en 1431.',
  ], 'Jeanne d\'Arc délivre Orléans en 1429 et fait sacrer Charles VII ; brûlée à Rouen en 1431, elle est canonisée en 1920.',
    ['Aliénor d\'Aquitaine', 'Catherine de Médicis']],

  ['Christophe Colomb', 'Histoire', 'Personnalité', 1, [
    'Je suis probablement né à Gênes au XVe siècle.',
    'Je cherche une route vers les Indes en allant vers l\'ouest.',
    'Une reine d\'Espagne finance mon expédition de trois navires.',
    'En 1492, je touche une île des Caraïbes en croyant atteindre l\'Asie.',
  ], 'Parti de Palos en août 1492 avec la Santa María, la Pinta et la Niña, il aborde les Bahamas le 12 octobre.',
    ['Vasco de Gama', 'Fernand de Magellan']],

  ['Louis XIV', 'Histoire', 'Personnalité', 2, [
    'Je monte sur le trône à quatre ans, sous une régence.',
    'Une révolte des nobles marque mon enfance et m\'en laisse méfiant.',
    'Je déplace la cour dans un château que je fais agrandir sans relâche.',
    'On me surnomme le Roi-Soleil et je règne soixante-douze ans.',
  ], 'Roi de France de 1643 à 1715, il installe la cour à Versailles en 1682 : le plus long règne de l\'histoire de France.',
    ['Henri IV', 'François Ier']],

  ['Vercingétorix', 'Histoire', 'Personnalité', 2, [
    'Je suis le chef d\'un peuple gaulois d\'Auvergne.',
    'J\'unis plusieurs tribus contre l\'envahisseur venu du sud.',
    'Je remporte une victoire à Gergovie avant d\'être encerclé.',
    'Je dépose les armes devant César à Alésia en 52 av. J.-C.',
  ], 'Chef arverne, vainqueur à Gergovie puis assiégé à Alésia, il est exécuté à Rome six ans après sa reddition.',
    ['Astérix', 'Brennus']],

  ['Toutânkhamon', 'Histoire', 'Personnalité', 2, [
    'Je deviens roi vers l\'âge de neuf ans.',
    'Mon règne est court et je meurs adolescent.',
    'Ma tombe est restée presque intacte pendant trois mille ans.',
    'Howard Carter la découvre en 1922 et mon masque d\'or devient célèbre.',
  ], 'Pharaon de la XVIIIe dynastie mort vers 18 ans ; sa tombe presque intacte est découverte dans la Vallée des Rois en 1922.',
    ['Ramsès II', 'Khéops']],

  ['Charlemagne', 'Histoire', 'Personnalité', 2, [
    'Je suis roi des Francs à partir de 768.',
    'J\'agrandis mon royaume jusqu\'à en faire un empire.',
    'Je crée des écoles auprès des monastères et des évêchés.',
    'Le pape me couronne empereur le jour de Noël 800.',
  ], 'Couronné empereur d\'Occident à Rome le 25 décembre 800, il relance l\'enseignement : la « renaissance carolingienne ».',
    ['Clovis', 'Hugues Capet']],

  /* ---------------- Sciences · Personnalité ---------------- */
  ['Marie Curie', 'Sciences', 'Personnalité', 2, [
    'Je suis née à Varsovie en 1867 et j\'ai étudié à Paris.',
    'J\'ai travaillé avec mon mari sur des minerais très rayonnants.',
    'J\'ai donné son nom à un élément en hommage à mon pays natal.',
    'Je suis la seule personne à avoir obtenu un Nobel en physique et un en chimie.',
  ], 'Marie Curie découvre le polonium et le radium avec Pierre Curie ; Nobel de physique en 1903 et de chimie en 1911.',
    ['Rosalind Franklin', 'Ada Lovelace']],

  ['Albert Einstein', 'Sciences', 'Personnalité', 1, [
    'Je suis né en Allemagne en 1879.',
    'J\'ai d\'abord travaillé dans un bureau des brevets en Suisse.',
    'J\'ai bouleversé notre idée du temps et de l\'espace.',
    'Ma formule la plus connue tient en cinq caractères : E = mc².',
  ], 'Auteur de la relativité restreinte (1905) puis générale (1915), prix Nobel de physique 1921 pour l\'effet photoélectrique.',
    ['Niels Bohr', 'Max Planck']],

  ['Isaac Newton', 'Sciences', 'Personnalité', 2, [
    'Je suis né en Angleterre l\'année de la mort de Galilée.',
    'J\'ai décomposé la lumière blanche avec un prisme.',
    'J\'ai posé trois lois qui décrivent le mouvement des corps.',
    'Une pomme qui tombe aurait inspiré ma loi de la gravitation.',
  ], 'Ses « Principia » (1687) énoncent les lois du mouvement et la gravitation universelle, base de la physique pendant deux siècles.',
    ['Galilée', 'Johannes Kepler']],

  ['Charles Darwin', 'Sciences', 'Personnalité', 2, [
    'Jeune, j\'embarque pour un tour du monde de cinq ans.',
    'J\'observe des pinsons aux becs différents sur un archipel du Pacifique.',
    'Je mets vingt ans à oser publier ma théorie.',
    'Mon livre de 1859 explique l\'évolution par la sélection naturelle.',
  ], 'Le voyage du Beagle (1831-1836) et les Galápagos nourrissent « L\'Origine des espèces », publié en 1859.',
    ['Jean-Baptiste de Lamarck', 'Gregor Mendel']],

  ['Louis Pasteur', 'Sciences', 'Personnalité', 2, [
    'Je suis né à Dole en 1822 et j\'ai d\'abord étudié les cristaux.',
    'Je montre que les microbes ne naissent pas spontanément.',
    'Un procédé de chauffage des aliments porte mon nom.',
    'En 1885, je sauve un enfant mordu par un chien enragé.',
  ], 'Pasteur réfute la génération spontanée, invente la pasteurisation et vaccine Joseph Meister contre la rage en 1885.',
    ['Claude Bernard', 'Alexander Fleming']],

  ['Alan Turing', 'Sciences', 'Personnalité', 3, [
    'Je suis mathématicien britannique, né en 1912.',
    'J\'imagine une machine théorique qui fonde l\'informatique.',
    'Pendant la guerre, je casse un code allemand réputé inviolable.',
    'Un test porte mon nom : il demande si une machine peut passer pour humaine.',
  ], 'Turing conçoit la « machine de Turing », décrypte Enigma à Bletchley Park et propose en 1950 son fameux test.',
    ['John von Neumann', 'Claude Shannon']],

  ['Galilée', 'Sciences', 'Personnalité', 3, [
    'Je suis né à Pise en 1564.',
    'Je perfectionne une lunette pour observer le ciel.',
    'Je découvre quatre satellites autour de la plus grosse planète.',
    'L\'Inquisition me force à renier que la Terre tourne autour du Soleil.',
  ], 'Galilée observe les lunes de Jupiter en 1610 et abjure en 1633 ; l\'Église ne le réhabilitera qu\'en 1992.',
    ['Nicolas Copernic', 'Tycho Brahe']],

  /* ---------------- Cinéma · Personnalité ---------------- */
  ['Charlie Chaplin', 'Cinéma', 'Personnalité', 1, [
    'Je suis né à Londres en 1889, dans une famille très pauvre.',
    'Je pars faire carrière aux États-Unis dans le cinéma muet.',
    'Mon personnage porte une canne, un chapeau melon et de grandes chaussures.',
    'On me connaît sous le nom de Charlot.',
  ], 'Charlie Chaplin crée Charlot en 1914 et signe « Les Temps modernes » (1936) et « Le Dictateur » (1940).',
    ['Buster Keaton', 'Harold Lloyd']],

  ['Alfred Hitchcock', 'Cinéma', 'Personnalité', 2, [
    'Je suis né à Londres et j\'ai fini par tourner à Hollywood.',
    'J\'apparais quelques secondes dans presque tous mes films.',
    'On m\'appelle le maître du suspense.',
    'J\'ai filmé une douche meurtrière et une attaque d\'oiseaux.',
  ], 'Hitchcock signe « Psychose » (1960), « Les Oiseaux » (1963), « Vertigo » et « Fenêtre sur cour » : 53 films en 50 ans.',
    ['Orson Welles', 'Fritz Lang']],

  ['Louis de Funès', 'Cinéma', 'Personnalité', 1, [
    'Je suis né en 1914 de parents espagnols.',
    'J\'ai longtemps été pianiste de bar avant de percer, vers quarante ans.',
    'Mes grimaces et mes colères font ma marque de fabrique.',
    'J\'ai joué un gendarme de Saint-Tropez et le râleur de « La Grande Vadrouille ».',
  ], 'Louis de Funès devient l\'acteur le plus populaire de France dans les années 1960-70 : « Le Gendarme », « La Grande Vadrouille », « La Folie des grandeurs ».',
    ['Bourvil', 'Fernandel']],

  ['Steven Spielberg', 'Cinéma', 'Personnalité', 2, [
    'Je tourne mes premiers films en amateur, adolescent.',
    'Mon requin de 1975 vide les plages américaines.',
    'J\'ai fait pédaler un vélo devant la Lune.',
    'J\'ai aussi filmé des dinosaures clonés et la liste de Schindler.',
  ], 'Spielberg signe « Les Dents de la mer » (1975), « E.T. » (1982), « Jurassic Park » et « La Liste de Schindler » (1993).',
    ['George Lucas', 'James Cameron']],

  /* ---------------- Cinéma · Film ---------------- */
  ['Titanic', 'Cinéma', 'Film', 1, [
    'Je sors en 1997 et je dure plus de trois heures.',
    'Mon histoire d\'amour se déroule sur un bateau.',
    'Je remporte onze Oscars, un record égalé.',
    'Ma chanson est chantée par Céline Dion et mon héros meurt dans l\'eau glacée.',
  ], 'Film de James Cameron (1997) avec Leonardo DiCaprio et Kate Winslet ; 11 Oscars et « My Heart Will Go On ».',
    ['Avatar', 'Pearl Harbor']],

  ['Le Parrain', 'Cinéma', 'Film', 2, [
    'Je sors en 1972 et je suis adapté d\'un roman.',
    'Je raconte une famille d\'immigrés italiens à New York.',
    'Marlon Brando y parle avec de la ouate dans les joues.',
    'Une tête de cheval se retrouve dans un lit.',
  ], '« Le Parrain » de Francis Ford Coppola (1972), d\'après Mario Puzo, avec Marlon Brando et Al Pacino.',
    ['Les Affranchis', 'Scarface']],

  ['La Grande Vadrouille', 'Cinéma', 'Film', 1, [
    'Je sors en 1966 et je reste 40 ans le plus gros succès français.',
    'Des aviateurs anglais tombent en plein Paris occupé.',
    'Un chef d\'orchestre et un peintre en bâtiment les aident.',
    'Bourvil et de Funès traversent la France en tandem jusqu\'en zone libre.',
  ], 'Comédie de Gérard Oury (1966) avec Bourvil et Louis de Funès : 17 millions d\'entrées en France.',
    ['Les Aventures de Rabbi Jacob', 'Le Corniaud']],

  ['Jurassic Park', 'Cinéma', 'Film', 1, [
    'Je sors en 1993, adapté d\'un roman de Michael Crichton.',
    'Un milliardaire ouvre un parc sur une île du Costa Rica.',
    'De l\'ADN retrouvé dans un moustique fossilisé sert de point de départ.',
    'Un verre d\'eau tremble avant l\'arrivée du T-Rex.',
  ], 'Film de Steven Spielberg (1993) : ses effets numériques ont changé le cinéma et il fut le plus gros succès mondial de son temps.',
    ['King Kong', 'Godzilla']],

  ['Le Roi Lion', 'Cinéma', 'Film', 1, [
    'Je sors en 1994 et je suis entièrement dessiné.',
    'Mon histoire ressemble beaucoup à Hamlet.',
    'Un phacochère et un suricate y chantent l\'insouciance.',
    'Un lionceau nommé Simba venge son père Mufasa.',
  ], 'Dessin animé des studios Disney (1994), avec « Hakuna Matata » et « Le Cercle de la vie » d\'Elton John.',
    ['Le Livre de la jungle', 'Bambi']],

  ['Intouchables', 'Cinéma', 'Film', 1, [
    'Je sors en 2011 et je suis inspiré d\'une histoire vraie.',
    'Un homme très riche engage un aide-soignant sans expérience.',
    'Une Maserati traverse Paris au petit matin.',
    'Omar Sy et François Cluzet y forment un duo improbable.',
  ], 'Film d\'Olivier Nakache et Éric Toledano (2011), inspiré de Philippe Pozzo di Borgo : plus de 19 millions d\'entrées.',
    ['Le Fabuleux Destin d\'Amélie Poulain', 'Bienvenue chez les Ch\'tis']],

  /* ---------------- Musique · Personnalité ---------------- */
  ['Wolfgang Amadeus Mozart', 'Musique', 'Personnalité', 2, [
    'Je suis né à Salzbourg en 1756.',
    'Mon père me promène dans toutes les cours d\'Europe dès l\'enfance.',
    'J\'écris plus de six cents œuvres en trente-cinq ans de vie.',
    'Je meurs à Vienne en laissant un Requiem inachevé.',
  ], 'Mozart compose dès 5 ans, signe « La Flûte enchantée » et meurt à 35 ans en 1791, son Requiem inachevé.',
    ['Joseph Haydn', 'Franz Schubert']],

  ['Ludwig van Beethoven', 'Musique', 'Personnalité', 2, [
    'Je suis né à Bonn en 1770 et je m\'installe à Vienne.',
    'Je perds progressivement l\'audition à partir de la trentaine.',
    'J\'ai composé neuf symphonies.',
    'La dernière s\'achève sur un « Hymne à la joie », devenu hymne européen.',
  ], 'Beethoven compose la 9e Symphonie (1824) alors qu\'il est complètement sourd ; son « Hymne à la joie » est l\'hymne de l\'Europe.',
    ['Johannes Brahms', 'Richard Wagner']],

  ['Édith Piaf', 'Musique', 'Personnalité', 1, [
    'Je suis née à Paris en 1915 et j\'ai chanté dans la rue.',
    'Un directeur de cabaret me surnomme d\'après un petit oiseau.',
    'Ma vie est marquée par les deuils et les accidents.',
    'Je chante « La Vie en rose » et « Non, je ne regrette rien ».',
  ], 'Édith Gassion, dite Piaf, devient la plus grande chanteuse française du XXe siècle ; elle meurt en 1963 à 47 ans.',
    ['Barbara', 'Dalida']],

  ['David Bowie', 'Musique', 'Personnalité', 2, [
    'Je suis né à Londres en 1947 et mes yeux semblent de couleurs différentes.',
    'Je change de personnage à chaque époque de ma carrière.',
    'L\'un d\'eux est un extraterrestre roux venu de Mars.',
    'Je chante « Space Oddity » et « Heroes ».',
  ], 'David Bowie invente Ziggy Stardust en 1972, enregistre « Heroes » à Berlin et meurt deux jours après son dernier album, en 2016.',
    ['Lou Reed', 'Iggy Pop']],

  ['Jacques Brel', 'Musique', 'Personnalité', 2, [
    'Je suis né à Bruxelles en 1929.',
    'Je transpire énormément sur scène tant je me donne.',
    'J\'arrête les tournées à 37 ans, en pleine gloire.',
    'Je chante « Ne me quitte pas » et je finis ma vie aux Marquises.',
  ], 'Jacques Brel abandonne la scène en 1966, devient aviateur et navigateur, et meurt en 1978 ; il est enterré à Hiva Oa.',
    ['Georges Brassens', 'Léo Ferré']],

  ['Michael Jackson', 'Musique', 'Personnalité', 1, [
    'Je chante en public dès l\'âge de six ans, avec mes frères.',
    'Je porte un gant blanc à une seule main.',
    'J\'ai popularisé une marche qui semble reculer.',
    'Mon album « Thriller » est le plus vendu de tous les temps.',
  ], '« Thriller » (1982) reste l\'album le plus vendu de l\'histoire ; le moonwalk est présenté en 1983.',
    ['Prince', 'James Brown']],

  /* ---------------- Arts & Littérature · Personnalité ---------------- */
  ['Victor Hugo', 'Arts & Littérature', 'Personnalité', 1, [
    'Je suis né à Besançon en 1802.',
    'Je passe près de vingt ans en exil sur des îles anglo-normandes.',
    'Je défends les pauvres et je combats la peine de mort.',
    'J\'ai écrit « Les Misérables » et « Notre-Dame de Paris ».',
  ], 'Victor Hugo, exilé à Jersey puis Guernesey de 1851 à 1870, reçoit des funérailles nationales en 1885 au Panthéon.',
    ['Émile Zola', 'Honoré de Balzac']],

  ['Molière', 'Arts & Littérature', 'Personnalité', 1, [
    'Je suis né à Paris en 1622 et je m\'appelle en réalité Jean-Baptiste.',
    'Je dirige une troupe protégée par le roi.',
    'Je me moque des médecins, des avares et des faux dévots.',
    'Je meurs peu après avoir joué « Le Malade imaginaire ».',
  ], 'Jean-Baptiste Poquelin, dit Molière, meurt en 1673 quelques heures après la 4e représentation du « Malade imaginaire ».',
    ['Jean Racine', 'Pierre Corneille']],

  ['Agatha Christie', 'Arts & Littérature', 'Personnalité', 2, [
    'Je suis née en Angleterre en 1890.',
    'J\'ai été infirmière et j\'ai appris à connaître les poisons.',
    'J\'ai disparu mystérieusement pendant onze jours en 1926.',
    'J\'ai inventé un détective belge à moustaches et une vieille dame curieuse.',
  ], 'Agatha Christie crée Hercule Poirot et Miss Marple ; elle est la romancière la plus vendue au monde.',
    ['Arthur Conan Doyle', 'Georges Simenon']],

  ['Jules Verne', 'Arts & Littérature', 'Personnalité', 1, [
    'Je suis né à Nantes en 1828, près des bateaux.',
    'J\'écris des romans où la science permet des voyages impossibles.',
    'J\'ai imaginé un sous-marin bien avant qu\'il existe.',
    'J\'envoie Phileas Fogg faire le tour du monde en quatre-vingts jours.',
  ], 'Jules Verne publie « Vingt mille lieues sous les mers » (1870) et « Le Tour du monde en 80 jours » (1872).',
    ['H. G. Wells', 'Alexandre Dumas']],

  ['Antoine de Saint-Exupéry', 'Arts & Littérature', 'Personnalité', 2, [
    'Je suis pilote et j\'ouvre des lignes postales en Afrique et en Amérique du Sud.',
    'Je tombe en panne en plein désert en 1935 et j\'y survis de justesse.',
    'Mon avion disparaît en Méditerranée en 1944.',
    'J\'ai écrit un conte où un enfant apprivoise un renard sur son astéroïde.',
  ], 'Saint-Exupéry écrit « Le Petit Prince » en 1943 ; son avion disparaît au large de Marseille le 31 juillet 1944.',
    ['Joseph Kessel', 'Romain Gary']],

  ['Léonard de Vinci', 'Arts & Littérature', 'Personnalité', 1, [
    'Je suis né en Toscane en 1452.',
    'J\'écris mes carnets à l\'envers, lisibles dans un miroir.',
    'Je dessine des machines volantes bien avant l\'aviation.',
    'Je meurs en France après avoir peint un sourire très commenté.',
  ], 'Léonard de Vinci meurt au Clos Lucé en 1519, invité par François Ier ; la Joconde est au Louvre.',
    ['Michel-Ange', 'Raphaël']],

  /* ---------------- Politique · Personnalité ---------------- */
  ['Charles de Gaulle', 'Histoire', 'Personnalité', 1, [
    'Je suis né à Lille en 1890 et je mesure près de deux mètres.',
    'Je refuse l\'armistice et je pars à Londres.',
    'Je lance un appel à la radio le 18 juin 1940.',
    'Je fonde la Ve République et je démissionne après un référendum perdu.',
  ], 'De Gaulle lance l\'Appel du 18 juin 1940, fonde la Ve République en 1958 et démissionne en 1969.',
    ['Georges Pompidou', 'Philippe Pétain']],

  ['Nelson Mandela', 'Histoire', 'Personnalité', 1, [
    'Je suis né en 1918 dans une famille de chefs xhosas.',
    'Je combats un régime qui sépare les gens selon leur couleur de peau.',
    'Je passe vingt-sept ans en prison, dont beaucoup sur une île.',
    'Libéré, je deviens président de l\'Afrique du Sud en 1994.',
  ], 'Mandela est emprisonné de 1962 à 1990, dont 18 ans à Robben Island ; prix Nobel de la paix 1993, président en 1994.',
    ['Desmond Tutu', 'Martin Luther King']],

  ['Simone Veil', 'Histoire', 'Personnalité', 2, [
    'Je suis déportée à seize ans et je reviens des camps.',
    'Je deviens magistrate puis ministre de la Santé.',
    'Je défends en 1974 une loi devant une Assemblée très hostile.',
    'Je préside le premier Parlement européen élu au suffrage universel.',
  ], 'Simone Veil fait adopter la loi sur l\'IVG en 1975, préside le Parlement européen en 1979 et entre au Panthéon en 2018.',
    ['Gisèle Halimi', 'Françoise Giroud']],

  ['Martin Luther King', 'Histoire', 'Personnalité', 2, [
    'Je suis pasteur dans le sud des États-Unis.',
    'Je défends la non-violence, inspiré par Gandhi.',
    'En 1963, je parle devant 250 000 personnes à Washington.',
    'Mon discours commence par « I have a dream » ; je suis assassiné en 1968.',
  ], 'Martin Luther King prononce « I have a dream » le 28 août 1963, reçoit le Nobel de la paix en 1964 et est tué à Memphis en 1968.',
    ['Malcolm X', 'Rosa Parks']],

  /* ---------------- Géographie · Lieu ---------------- */
  ['Venise', 'Géographie', 'Lieu', 1, [
    'Je suis bâtie sur une lagune, sur des pieux de bois.',
    'On circule chez moi en bateau, pas en voiture.',
    'Mon carnaval et mes masques sont célèbres.',
    'Ma place Saint-Marc et mon pont du Rialto attirent le monde entier.',
  ], 'Venise s\'étend sur 118 îlots reliés par plus de 400 ponts ; la ville s\'enfonce de 1 à 2 mm par an.',
    ['Amsterdam', 'Bruges']],

  ['Le Machu Picchu', 'Géographie', 'Lieu', 2, [
    'Je me trouve à 2 400 mètres d\'altitude, dans les Andes.',
    'On m\'a construit au XVe siècle sans mortier ni roue.',
    'Je suis resté ignoré des conquérants espagnols.',
    'Un explorateur américain me révèle au monde en 1911, au Pérou.',
  ], 'Cité inca bâtie vers 1450, redécouverte par Hiram Bingham en 1911 ; ses pierres sont ajustées sans mortier.',
    ['Chichén Itzá', 'Petra']],

  ['Le Mont-Saint-Michel', 'Géographie', 'Lieu', 1, [
    'Je me dresse sur un rocher, entre deux régions qui se disputent mon adresse.',
    'La mer m\'entoure puis se retire très loin.',
    'Une abbaye occupe mon sommet depuis le Moyen Âge.',
    'On m\'appelle la Merveille de l\'Occident, à la limite de la Normandie et de la Bretagne.',
  ], 'Le Mont-Saint-Michel connaît les plus grandes marées d\'Europe continentale ; son abbaye date du VIIIe siècle.',
    ['Saint-Malo', 'Carcassonne']],

  ['L\'Islande', 'Géographie', 'Lieu', 2, [
    'Je suis une île posée sur une dorsale océanique.',
    'Mon énergie vient presque entièrement de mes volcans et de mes rivières.',
    'On peut voir chez moi le soleil de minuit et des aurores boréales.',
    'Mon volcan Eyjafjallajökull a cloué au sol l\'Europe en 2010.',
  ], 'L\'Islande tire plus de 85 % de son énergie de sources renouvelables ; l\'éruption de 2010 a annulé 100 000 vols.',
    ['La Norvège', 'Le Groenland']],

  ['Le Sahara', 'Géographie', 'Lieu', 1, [
    'Je m\'étends sur une dizaine de pays.',
    'Ma surface approche celle des États-Unis.',
    'Il m\'arrive de geler la nuit en hiver.',
    'Je suis le plus grand désert chaud du monde, au nord de l\'Afrique.',
  ], 'Le Sahara couvre environ 9 millions de km² ; contrairement à l\'idée reçue, les dunes n\'en occupent qu\'un cinquième.',
    ['Le désert de Gobi', 'Le Kalahari']],

  ['Le Vatican', 'Géographie', 'Lieu', 2, [
    'Je suis entièrement entouré par une seule ville.',
    'Ma superficie tient dans un petit quartier.',
    'Ma garde est composée de Suisses en uniforme coloré.',
    'Je suis le plus petit État du monde et le pape y réside.',
  ], 'Le Vatican couvre 0,44 km² et compte environ 800 habitants ; il est indépendant depuis les accords du Latran, en 1929.',
    ['Monaco', 'Saint-Marin']],

  ['L\'Everest', 'Géographie', 'Lieu', 1, [
    'Je me trouve à la frontière de deux pays d\'Asie.',
    'Je grandis de quelques millimètres chaque année.',
    'Au-dessus de 8 000 mètres, on parle chez moi de « zone de la mort ».',
    'Hillary et Tensing atteignent mon sommet en 1953, à 8 849 mètres.',
  ], 'L\'Everest culmine à 8 849 m entre le Népal et la Chine ; Edmund Hillary et Tensing Norgay l\'atteignent le 29 mai 1953.',
    ['Le K2', 'Le Mont Blanc']],

  ['L\'Amazone', 'Géographie', 'Lieu', 2, [
    'Je nais dans les Andes péruviennes.',
    'Je traverse un continent d\'ouest en est.',
    'Aucun pont ne me franchit sur presque tout mon cours.',
    'Je déverse un cinquième de l\'eau douce des fleuves de la planète.',
  ], 'L\'Amazone débite environ 209 000 m³/s, soit plus que les six fleuves suivants réunis.',
    ['Le Nil', 'Le Congo']],

  /* ---------------- Nature & Animaux ---------------- */
  ['Le manchot empereur', 'Nature & Animaux', 'Animal', 2, [
    'Je vis là où personne d\'autre ne s\'installe volontiers.',
    'Je ne vole pas mais je nage à toute vitesse.',
    'Le père couve l\'œuf sur ses pattes pendant deux mois, sans manger.',
    'Je suis le plus grand des manchots et je vis en Antarctique.',
  ], 'Le manchot empereur mesure jusqu\'à 1,20 m ; les mâles jeûnent plus de 100 jours en couvant l\'œuf par -40 °C.',
    ['Le pingouin torda', 'Le macareux']],

  ['Le caméléon', 'Nature & Animaux', 'Animal', 1, [
    'Mes yeux bougent chacun de leur côté.',
    'Ma langue peut dépasser la longueur de mon corps.',
    'Ma queue s\'enroule autour des branches.',
    'Je change de couleur, surtout selon mon humeur et la température.',
  ], 'Le caméléon change de couleur en réorganisant des nanocristaux dans sa peau — pour communiquer plus que pour se cacher.',
    ['Le gecko', 'L\'iguane']],

  ['L\'ornithorynque', 'Nature & Animaux', 'Animal', 3, [
    'Je vis dans les rivières d\'Australie.',
    'J\'ai un bec et des pattes palmées, mais je suis un mammifère.',
    'Je ponds des œufs et j\'allaite mes petits.',
    'Le mâle porte un éperon venimeux à la patte arrière.',
  ], 'L\'ornithorynque est l\'un des cinq mammifères qui pondent des œufs ; il détecte ses proies grâce aux champs électriques.',
    ['Le tatou', 'L\'échidné']],

  ['La pieuvre', 'Nature & Animaux', 'Animal', 2, [
    'J\'ai trois cœurs et du sang bleu.',
    'Je peux me glisser dans n\'importe quel trou plus large que mon bec.',
    'Je change de couleur et de texture en une seconde.',
    'Mes huit bras contiennent les deux tiers de mes neurones.',
  ], 'La pieuvre possède environ 500 millions de neurones, dont les deux tiers dans les bras ; son sang est bleu (hémocyanine).',
    ['Le calmar', 'La seiche']],

  ['L\'abeille', 'Nature & Animaux', 'Animal', 1, [
    'Je vis dans une société très organisée, autour d\'une seule mère.',
    'Je communique la direction des fleurs en dansant.',
    'Je visite des millions de fleurs pour un seul pot.',
    'Je fabrique du miel dans des alvéoles hexagonales.',
  ], 'Il faut environ 4 millions de fleurs butinées pour produire un kilo de miel ; la danse en huit indique la direction du nectar.',
    ['La guêpe', 'Le bourdon']],

  /* ---------------- Gastronomie ---------------- */
  ['Le champagne', 'Gastronomie', 'Boisson', 1, [
    'Je viens d\'une région française au nord de Paris.',
    'Mes bulles naissent d\'une seconde fermentation en bouteille.',
    'On me tourne régulièrement d\'un quart de tour pendant mon vieillissement.',
    'Un moine nommé Dom Pérignon a amélioré ma fabrication.',
  ], 'Le champagne tire ses bulles d\'une seconde fermentation en bouteille ; seule la Champagne peut porter ce nom.',
    ['Le prosecco', 'Le cidre']],

  ['Le roquefort', 'Gastronomie', 'Fromage', 2, [
    'Je suis fait de lait de brebis.',
    'Je vieillis dans des caves naturelles traversées par des courants d\'air.',
    'Un champignon me donne mes veines bleues.',
    'Je viens d\'un village de l\'Aveyron et je fus le premier AOC français.',
  ], 'Le roquefort affine dans les caves de Roquefort-sur-Soulzon, ventilées par les « fleurines » ; AOC depuis 1925.',
    ['Le bleu d\'Auvergne', 'Le gorgonzola']],

  ['Le couscous', 'Gastronomie', 'Plat', 1, [
    'Je viens d\'Afrique du Nord.',
    'Ma base est de la semoule roulée à la main.',
    'On me cuit à la vapeur dans un récipient à deux étages.',
    'Je me sers avec un bouillon de légumes et de la viande, et je suis l\'un des plats préférés des Français.',
  ], 'Le couscous est inscrit au patrimoine immatériel de l\'Unesco depuis 2020, au nom de quatre pays du Maghreb.',
    ['Le tajine', 'La paella']],

  ['La pizza Margherita', 'Gastronomie', 'Plat', 2, [
    'Je suis née à Naples à la fin du XIXe siècle.',
    'Je porte le prénom d\'une reine d\'Italie.',
    'Trois ingrédients seulement me garnissent.',
    'Mes couleurs — rouge, blanc, vert — rappellent le drapeau italien.',
  ], 'Créée en 1889 par Raffaele Esposito pour la reine Marguerite de Savoie : tomate, mozzarella, basilic.',
    ['La pizza quatre fromages', 'La focaccia']],

  /* ---------------- Sport · Personnalité ---------------- */
  ['Zinédine Zidane', 'Sport', 'Personnalité', 1, [
    'Je suis né à Marseille en 1972.',
    'Je marque deux fois de la tête dans une finale de Coupe du monde.',
    'Je termine ma carrière sur un carton rouge en finale.',
    'Je deviens ensuite entraîneur et gagne trois Ligues des champions d\'affilée.',
  ], 'Zidane marque deux têtes en finale 1998, reçoit un rouge en 2006 et gagne trois C1 comme entraîneur du Real (2016-2018).',
    ['Michel Platini', 'Thierry Henry']],

  ['Mohamed Ali', 'Sport', 'Personnalité', 2, [
    'Je deviens champion olympique à dix-huit ans.',
    'Je change de nom après ma conversion religieuse.',
    'Je refuse de partir à la guerre et on me retire mon titre.',
    'Je dis voler comme un papillon et piquer comme une abeille.',
  ], 'Cassius Clay devient Mohamed Ali en 1964 ; privé de licence de 1967 à 1970, il gagne le « combat du siècle » à Kinshasa en 1974.',
    ['Mike Tyson', 'Joe Frazier']],

  ['Usain Bolt', 'Sport', 'Personnalité', 1, [
    'Je viens d\'une île des Caraïbes.',
    'Je mesure 1,95 m, ce qui est rare dans ma discipline.',
    'Je célèbre mes victoires en pointant le ciel comme un archer.',
    'Je détiens le record du monde du 100 m en 9 s 58.',
  ], 'Usain Bolt, jamaïcain, court le 100 m en 9"58 à Berlin en 2009 ; huit fois champion olympique.',
    ['Carl Lewis', 'Yohan Blake']],

  /* ---------------- Insolite / Divers ---------------- */
  ['La tour Eiffel', 'Insolite', 'Monument', 1, [
    'Je devais être démontée au bout de vingt ans.',
    'Des artistes ont signé une pétition contre ma construction.',
    'Je grandis de quelques centimètres quand il fait chaud.',
    'Je domine Paris depuis 1889 et je suis le monument payant le plus visité au monde.',
  ], 'Construite pour l\'Exposition universelle de 1889, sauvée par les antennes de radio, elle varie de 15 cm selon la température.',
    ['L\'Arc de Triomphe', 'La Sagrada Família']],

  ['La Joconde', 'Arts & Littérature', 'Œuvre', 1, [
    'Je mesure à peine 77 centimètres de haut.',
    'Je n\'ai ni sourcils ni cils visibles.',
    'On m\'a volée en 1911, ce qui m\'a rendue mondialement célèbre.',
    'Mon sourire intrigue les visiteurs du Louvre derrière une vitre blindée.',
  ], 'Peinte par Léonard de Vinci vers 1503-1519, volée par Vincenzo Peruggia en 1911 et retrouvée deux ans plus tard.',
    ['La Jeune Fille à la perle', 'Le Cri']],

  ['La Grande Muraille de Chine', 'Histoire', 'Monument', 2, [
    'On m\'a bâtie et rebâtie pendant près de deux mille ans.',
    'Je servais autant à surveiller qu\'à contrôler le commerce.',
    'Contrairement à la légende, on ne me voit pas à l\'œil nu depuis la Lune.',
    'Mes tronçons cumulés dépassent 20 000 kilomètres.',
  ], 'Les relevés officiels de 2012 donnent 21 196 km tous tronçons confondus ; l\'essentiel visible date des Ming.',
    ['Le Colisée', 'Angkor Vat']],

  ['Le Titanic', 'Histoire', 'Événement', 1, [
    'Je suis parti de Southampton en avril 1912.',
    'On me disait pratiquement insubmersible.',
    'Je n\'avais de canots que pour la moitié des personnes à bord.',
    'J\'ai heurté un iceberg lors de mon voyage inaugural.',
  ], 'Le Titanic coule dans la nuit du 14 au 15 avril 1912 : environ 1 500 morts sur 2 200 personnes à bord.',
    ['Le Lusitania', 'Le Concordia']],
];

/* ------------------------------------------------------------------ */
/* Écriture du CSV                                                     */
/* ------------------------------------------------------------------ */

const HEAD = ['id', 'theme', 'categorie', 'difficulte', 'type', 'question', 'reponse', 'choix2', 'choix3', 'choix4',
  'explication', 'indices', 'media_url', 'media_debut', 'media_duree', 'actif', 'utilisations', 'epoque', 'anecdote'];

const cell = v => {
  v = v === undefined || v === null ? '' : String(v);
  return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** L'intitulé dépend de ce qu'on cherche : une personne, un lieu, une œuvre… */
const INTITULE = {
  'Personnalité': '🕵️ Qui suis-je ?',
  'Lieu': '🕵️ Quel est ce lieu ?',
  'Film': '🕵️ Quel est ce film ?',
  'Animal': '🕵️ Quel est cet animal ?',
  'Monument': '🕵️ Quel est ce monument ?',
  'Œuvre': '🕵️ Quelle est cette œuvre ?',
  'Plat': '🕵️ Quel est ce plat ?',
  'Fromage': '🕵️ De quel fromage s\'agit-il ?',
  'Boisson': '🕵️ Quelle est cette boisson ?',
  'Événement': '🕵️ De quel événement s\'agit-il ?',
};

const vus = new Set();
const lignes = D.map(([rep, theme, cat, diff, clues, expl, faux], i) => {
  const q = INTITULE[cat];
  if (!q) throw new Error('catégorie sans intitulé : ' + cat);
  if (clues.length !== 4) throw new Error(rep + ' : il faut exactement 4 indices');
  if (expl.length < 45) throw new Error(rep + ' : explication trop courte');
  if (vus.has(norm(rep))) throw new Error('doublon : ' + rep);
  vus.add(norm(rep));
  // un indice ne doit jamais contenir la réponse, sinon la devinette est offerte
  const mots = norm(rep);
  clues.forEach(c => {
    if (norm(c).indexOf(mots) >= 0) throw new Error(rep + ' : un indice donne la réponse');
    if (c.length < 20) throw new Error(rep + ' : indice trop court « ' + c + ' »');
  });
  if (faux.length !== 2 || faux.some(f => norm(f) === norm(rep))) throw new Error(rep + ' : leurres invalides');
  return [
    'Q' + (2400 + i), theme, cat, diff, 'INDICE', q, rep,
    clues.join(' | '), faux[0], faux[1], expl, '', '', 0, 15, 'oui', 0, '', '',
  ];
});

fs.writeFileSync(path.join(ROOT, 'supabase/questions-devinettes.csv'),
  [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n'));

const parTheme = {}, parCat = {};
D.forEach(([, t, c]) => { parTheme[t] = (parTheme[t] || 0) + 1; parCat[c] = (parCat[c] || 0) + 1; });
console.log(`${lignes.length} devinettes écrites → supabase/questions-devinettes.csv`);
console.log('par thème     :', JSON.stringify(parTheme));
console.log('par catégorie :', JSON.stringify(parCat));
