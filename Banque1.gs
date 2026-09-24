/**
 * Banque de questions — Histoire & Géographie
 * Format : [thème, catégorie, difficulté 1-5, type, question, réponse, choix2, choix3, choix4, explication, indices MJ]
 *  - QCM        : réponse = bonne réponse, choix 2-4 = mauvaises réponses
 *  - VF         : réponse = Vrai ou Faux
 *  - ESTIMATION : réponse = nombre, choix2 = unité, choix3 = tolérance (vide = % réglé dans la partie)
 *  - ORDRE      : réponse = éléments dans le bon ordre séparés par |, choix2 = consigne
 */
function banque1_() {
  const H = 'Histoire', G = 'Géographie';
  return [
    // ---------------- HISTOIRE ----------------
    [H, 'France', 1, 'QCM', 'En quelle année a eu lieu la prise de la Bastille ?', '1789', '1792', '1715', '1804', 'Le 14 juillet 1789, symbole du début de la Révolution française.', 'Même année que la Déclaration des droits de l\'homme.'],
    [H, 'France', 1, 'QCM', 'Quel roi était surnommé le « Roi-Soleil » ?', 'Louis XIV', 'Louis XVI', 'François Ier', 'Henri IV', 'Louis XIV a régné 72 ans (1643-1715), un record en Europe.', 'Il a fait construire Versailles.'],
    [H, 'Personnages', 1, 'VF', 'Napoléon Bonaparte est né en Corse.', 'Vrai', '', '', '', 'Né à Ajaccio le 15 août 1769.', ''],
    [H, 'Antiquité', 1, 'QCM', 'Quelle civilisation a construit les pyramides de Gizeh ?', 'Les Égyptiens', 'Les Romains', 'Les Mayas', 'Les Grecs', 'Construites il y a environ 4 500 ans, sous les pharaons Khéops, Khéphren et Mykérinos.', ''],
    [H, 'Explorateurs', 1, 'QCM', 'Quel navigateur a atteint l\'Amérique en 1492 ?', 'Christophe Colomb', 'Vasco de Gama', 'Fernand de Magellan', 'Jacques Cartier', 'Il pensait avoir atteint les Indes, d\'où le nom « Indiens ».', 'Trois navires : la Niña, la Pinta et la Santa María.'],
    [H, 'XXe siècle', 1, 'VF', 'Le premier homme à avoir marché sur la Lune est Neil Armstrong.', 'Vrai', '', '', '', 'Mission Apollo 11, juillet 1969. Buzz Aldrin l\'a suivi quelques minutes plus tard.', ''],

    [H, 'France', 2, 'QCM', 'Quelle reine de France a été guillotinée en 1793 ?', 'Marie-Antoinette', 'Catherine de Médicis', 'Anne d\'Autriche', 'Joséphine de Beauharnais', 'Épouse de Louis XVI, exécutée le 16 octobre 1793.', 'Elle était autrichienne.'],
    [H, 'XXe siècle', 2, 'ESTIMATION', 'En quelle année a commencé la Première Guerre mondiale ?', '1914', '', '1', '', 'Déclenchée à l\'été 1914, elle s\'achève avec l\'armistice du 11 novembre 1918.', ''],
    [H, 'XXe siècle', 2, 'QCM', 'Quel mur est tombé en novembre 1989 ?', 'Le mur de Berlin', 'Le mur d\'Hadrien', 'La Grande Muraille', 'Le mur des Lamentations', 'Sa chute, le 9 novembre 1989, annonce la réunification allemande (1990).', ''],
    [H, 'France', 2, 'QCM', 'Qui a été le premier président de la Ve République ?', 'Charles de Gaulle', 'Georges Pompidou', 'René Coty', 'Vincent Auriol', 'Président de 1959 à 1969.', 'Le général de l\'appel du 18 juin.'],
    [H, 'Personnages', 2, 'VF', 'Jeanne d\'Arc a été brûlée à Rouen.', 'Vrai', '', '', '', 'Le 30 mai 1431, place du Vieux-Marché.', ''],
    [H, 'Chronologie', 2, 'ORDRE', 'Remettez ces événements dans l\'ordre chronologique.', 'Chute de l\'Empire romain d\'Occident | Découverte de l\'Amérique | Révolution française | Première Guerre mondiale', 'Du plus ancien au plus récent', '', '', '476, 1492, 1789, 1914.', ''],

    [H, 'France', 3, 'QCM', 'Quel roi a signé l\'édit de Nantes en 1598 ?', 'Henri IV', 'Louis XIII', 'François Ier', 'Charles IX', 'L\'édit accorde la liberté de culte aux protestants.', 'Le « bon roi » de la poule au pot.'],
    [H, 'Napoléon', 3, 'QCM', 'Quelle bataille de 1815 marque la défaite définitive de Napoléon ?', 'Waterloo', 'Austerlitz', 'Iéna', 'Trafalgar', 'Le 18 juin 1815, en Belgique actuelle.', ''],
    [H, 'France', 3, 'ESTIMATION', 'En quelle année les femmes ont-elles voté pour la première fois en France ?', '1945', '', '3', '', 'Droit accordé en avril 1944, premier vote aux municipales d\'avril 1945.', 'Juste à la fin de la Seconde Guerre mondiale.'],
    [H, 'Antiquité', 3, 'QCM', 'Quel empereur romain est accusé par la légende d\'avoir incendié Rome ?', 'Néron', 'Caligula', 'Auguste', 'Trajan', 'Grand incendie de l\'an 64. Sa responsabilité réelle est très discutée.', ''],
    [H, 'Moyen Âge', 3, 'VF', 'La guerre de Cent Ans a duré exactement 100 ans.', 'Faux', '', '', '', 'De 1337 à 1453, soit 116 ans.', ''],
    [H, 'Antiquité', 3, 'QCM', 'Quel pharaon a vu son tombeau découvert presque intact en 1922 ?', 'Toutânkhamon', 'Ramsès II', 'Khéops', 'Akhenaton', 'Découvert par Howard Carter dans la Vallée des Rois.', 'Célèbre pour son masque en or.'],
    [H, 'France', 3, 'QCM', 'Comment s\'appelle la dynastie de rois fondée par Hugues Capet en 987 ?', 'Les Capétiens', 'Les Mérovingiens', 'Les Carolingiens', 'Les Bourbons', 'Les Valois et les Bourbons en sont des branches.', ''],

    [H, 'XXe siècle', 4, 'QCM', 'Quel traité a mis fin à la Première Guerre mondiale avec l\'Allemagne ?', 'Le traité de Versailles', 'Le traité de Rome', 'Le traité de Maastricht', 'Le traité de Vienne', 'Signé le 28 juin 1919 dans la galerie des Glaces.', ''],
    [H, 'Chronologie', 4, 'ORDRE', 'Remettez ces souverains dans l\'ordre chronologique.', 'Clovis | Charlemagne | Saint Louis | Louis XIV', 'Du plus ancien au plus récent', '', '', 'Clovis (vers 500), Charlemagne (800), Saint Louis (XIIIe s.), Louis XIV (XVIIe s.).', ''],
    [H, 'Moyen Âge', 4, 'ESTIMATION', 'En quelle année Charlemagne a-t-il été couronné empereur ?', '800', '', '10', '', 'Couronné à Rome le jour de Noël de l\'an 800.', 'Un nombre tout rond.'],
    [H, 'Moyen Âge', 4, 'QCM', 'Quelle ville était la capitale de l\'Empire byzantin ?', 'Constantinople', 'Rome', 'Athènes', 'Alexandrie', 'Aujourd\'hui Istanbul, prise par les Ottomans en 1453.', ''],
    [H, 'XXe siècle', 4, 'VF', 'Le Titanic a coulé lors de son voyage inaugural.', 'Vrai', '', '', '', 'Dans la nuit du 14 au 15 avril 1912, après avoir heurté un iceberg.', ''],
    [H, 'Monde', 4, 'QCM', 'Qui est le principal rédacteur de la Déclaration d\'indépendance des États-Unis ?', 'Thomas Jefferson', 'George Washington', 'Benjamin Franklin', 'Abraham Lincoln', 'Adoptée le 4 juillet 1776. Jefferson deviendra le 3e président.', ''],
    [H, 'Explorateurs', 4, 'QCM', 'Quel navigateur a dirigé la première expédition autour du monde (1519-1522) ?', 'Fernand de Magellan', 'James Cook', 'Vasco de Gama', 'Amerigo Vespucci', 'Magellan est mort en route. Juan Sebastián Elcano a achevé le voyage.', ''],

    [H, 'France', 5, 'ESTIMATION', 'En quelle année a eu lieu la bataille de Marignan ?', '1515', '', '5', '', 'Victoire de François Ier sur les Suisses.', 'Date très connue des écoliers.'],
    [H, 'Monde', 5, 'QCM', 'Quel homme d\'État prussien est considéré comme l\'artisan de l\'unité allemande en 1871 ?', 'Otto von Bismarck', 'Guillaume II', 'Metternich', 'Frédéric le Grand', 'Le « chancelier de fer ». L\'Empire allemand est proclamé à Versailles.', ''],
    [H, 'Monde', 5, 'QCM', 'Quelle reine a régné sur l\'Angleterre de 1558 à 1603 ?', 'Élisabeth Ire', 'Marie Tudor', 'Victoria', 'Anne Boleyn', 'Fille d\'Henri VIII, dernière des Tudor.', 'La « reine vierge ».'],
    [H, 'Chronologie', 5, 'ORDRE', 'Remettez ces régimes français dans l\'ordre chronologique.', 'Premier Empire | Restauration | Second Empire | Troisième République', 'Du plus ancien au plus récent', '', '', '1804, 1814, 1852, 1870.', ''],
    [H, 'Europe', 5, 'VF', 'Le traité de Rome de 1957 a créé la Communauté économique européenne.', 'Vrai', '', '', '', 'Signé par six pays : France, RFA, Italie, Belgique, Pays-Bas, Luxembourg.', ''],

    // ---------------- GÉOGRAPHIE ----------------
    [G, 'Capitales', 1, 'QCM', 'Quelle est la capitale de l\'Italie ?', 'Rome', 'Milan', 'Naples', 'Florence', '', ''],
    [G, 'France', 1, 'QCM', 'Quel est le plus long fleuve de France ?', 'La Loire', 'La Seine', 'Le Rhône', 'La Garonne', 'Environ 1 000 km, du mont Gerbier-de-Jonc à l\'Atlantique.', ''],
    [G, 'Monde', 1, 'VF', 'Le Brésil est le plus grand pays d\'Amérique du Sud.', 'Vrai', '', '', '', 'Il couvre près de la moitié du continent.', ''],
    [G, 'France', 1, 'QCM', 'Quel océan borde la côte ouest de la France ?', 'L\'océan Atlantique', 'L\'océan Pacifique', 'L\'océan Indien', 'L\'océan Arctique', '', ''],
    [G, 'Monuments', 1, 'QCM', 'Dans quel pays se trouve la tour de Pise ?', 'Italie', 'Espagne', 'Grèce', 'Portugal', 'En Toscane. Elle penche d\'environ 4 degrés.', ''],
    [G, 'Capitales', 1, 'QCM', 'Quelle est la capitale de l\'Espagne ?', 'Madrid', 'Barcelone', 'Séville', 'Valence', '', ''],

    [G, 'Montagnes', 2, 'QCM', 'Quel est le plus haut sommet des Alpes ?', 'Le mont Blanc', 'Le Cervin', 'Le mont Rose', 'La Barre des Écrins', 'Il culmine à environ 4 806 m, entre la France et l\'Italie.', ''],
    [G, 'Capitales', 2, 'QCM', 'Quelle est la capitale du Canada ?', 'Ottawa', 'Toronto', 'Montréal', 'Vancouver', 'Située dans l\'Ontario, à la frontière du Québec.', 'Piège : ce n\'est pas la plus grande ville.'],
    [G, 'Europe', 2, 'ESTIMATION', 'Combien de pays sont membres de l\'Union européenne ?', '27', 'pays', '1', '', 'Depuis la sortie du Royaume-Uni en 2020.', ''],
    [G, 'Monde', 2, 'VF', 'Le Sahara est le plus grand désert chaud du monde.', 'Vrai', '', '', '', 'Environ 9 millions de km². Les déserts polaires (Antarctique) sont plus grands.', ''],
    [G, 'Villes', 2, 'QCM', 'Quel fleuve traverse Londres ?', 'La Tamise', 'La Seine', 'Le Danube', 'Le Rhin', '', ''],
    [G, 'France', 2, 'QCM', 'Combien de départements compte la France métropolitaine ?', '96', '95', '101', '100', '96 en métropole (dont la Corse, divisée en 2), 101 au total avec l\'outre-mer.', ''],
    [G, 'Villes', 2, 'QCM', 'Dans quel pays se trouve la ville de Marrakech ?', 'Maroc', 'Tunisie', 'Algérie', 'Égypte', '', ''],

    [G, 'Capitales', 3, 'QCM', 'Quelle est la capitale de l\'Australie ?', 'Canberra', 'Sydney', 'Melbourne', 'Perth', 'Ville créée pour départager Sydney et Melbourne.', 'Piège classique !'],
    [G, 'Montagnes', 3, 'ESTIMATION', 'Quelle est l\'altitude du mont Blanc, en mètres ?', '4806', 'm', '50', '', 'Environ 4 806 m. Elle varie de quelques mètres selon l\'épaisseur de neige.', ''],
    [G, 'Fleuves', 3, 'QCM', 'Quel fleuve est le plus souvent cité comme le plus long du monde ?', 'Le Nil', 'L\'Amazone', 'Le Yangzi Jiang', 'Le Mississippi', 'Environ 6 650 km. Certaines mesures donnent l\'Amazone plus long.', 'Le débat Nil / Amazone existe, accepter la discussion.'],
    [G, 'Europe', 3, 'VF', 'Le Portugal a une frontière commune avec la France.', 'Faux', '', '', '', 'Le Portugal ne touche que l\'Espagne.', ''],
    [G, 'Monde', 3, 'QCM', 'Quel détroit sépare l\'Espagne du Maroc ?', 'Le détroit de Gibraltar', 'Le Bosphore', 'Le détroit de Magellan', 'Le détroit de Béring', 'À peine 14 km au point le plus étroit.', ''],
    [G, 'Population', 3, 'ORDRE', 'Classez ces pays selon leur population.', 'Inde | États-Unis | Brésil | France', 'Du plus peuplé au moins peuplé', '', '', 'L\'Inde a dépassé la Chine en 2023 (plus de 1,4 milliard d\'habitants).', ''],

    [G, 'Capitales', 4, 'QCM', 'Quelle est la capitale de la Nouvelle-Zélande ?', 'Wellington', 'Auckland', 'Christchurch', 'Queenstown', 'Auckland est la plus grande ville, mais Wellington est la capitale.', ''],
    [G, 'Monde', 4, 'QCM', 'Quel est le plus petit pays du monde ?', 'Le Vatican', 'Monaco', 'Saint-Marin', 'Le Liechtenstein', 'Environ 0,44 km², enclavé dans Rome.', ''],
    [G, 'Fleuves', 4, 'ESTIMATION', 'Combien de kilomètres mesure la Loire ?', '1006', 'km', '60', '', 'Environ 1 000 km selon les mesures.', ''],
    [G, 'France', 4, 'QCM', 'Quel pays compte le plus de fuseaux horaires, territoires d\'outre-mer compris ?', 'La France', 'La Russie', 'Les États-Unis', 'Le Royaume-Uni', '12 fuseaux grâce à l\'outre-mer (13 avec la Terre Adélie).', 'Réponse surprenante, penser aux DOM-TOM.'],
    [G, 'Capitales', 4, 'VF', 'Istanbul est la capitale de la Turquie.', 'Faux', '', '', '', 'La capitale est Ankara depuis 1923.', ''],
    [G, 'Montagnes', 4, 'ORDRE', 'Classez ces sommets par altitude.', 'Everest | Aconcagua | Kilimandjaro | Mont Blanc', 'Du plus haut au plus bas', '', '', '8 849 m, 6 961 m, 5 895 m, environ 4 806 m.', ''],

    [G, 'Capitales', 5, 'QCM', 'Quelle est la capitale du Kazakhstan ?', 'Astana', 'Almaty', 'Tachkent', 'Bichkek', 'Elle a repris le nom d\'Astana en 2022, après s\'être appelée Noursoultan.', ''],
    [G, 'Monde', 5, 'QCM', 'Quel est le lac le plus profond du monde ?', 'Le lac Baïkal', 'Le lac Tanganyika', 'Le lac Supérieur', 'La mer Caspienne', 'Plus de 1 600 m de profondeur, en Sibérie.', ''],
    [G, 'Monde', 5, 'ESTIMATION', 'Combien d\'États sont membres de l\'ONU ?', '193', 'États', '5', '', 'Le dernier admis est le Soudan du Sud, en 2011.', ''],
    [G, 'France', 5, 'QCM', 'Avec quel pays la France partage-t-elle sa plus longue frontière terrestre ?', 'Le Brésil', 'L\'Espagne', 'La Belgique', 'La Suisse', 'Environ 730 km, via la Guyane.', 'Penser à l\'outre-mer.'],
    [G, 'Fleuves', 5, 'QCM', 'Quel fleuve traverse le plus de pays ?', 'Le Danube', 'Le Nil', 'Le Rhin', 'L\'Amazone', 'Il traverse ou longe 10 pays, dont quatre capitales : Vienne, Bratislava, Budapest, Belgrade.', ''],
    [G, 'Europe', 5, 'VF', 'Le point culminant de l\'Espagne se trouve aux îles Canaries.', 'Vrai', '', '', '', 'Le Teide, volcan de Tenerife, culmine à 3 715 m.', ''],
  ];
}
