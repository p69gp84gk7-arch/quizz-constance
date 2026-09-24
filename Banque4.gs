/**
 * Banque de questions — Sport & Arts / Littérature
 * Format : voir Banque1.gs
 */
function banque4_() {
  const SP = 'Sport', A = 'Arts & Littérature';
  return [
    // ---------------- SPORT ----------------
    [SP, 'Football', 1, 'QCM', 'Combien de joueurs par équipe y a-t-il sur un terrain de football ?', '11', '10', '12', '9', '', ''],
    [SP, 'Raquettes', 1, 'QCM', 'Dans quel sport utilise-t-on un volant ?', 'Le badminton', 'Le tennis', 'Le squash', 'Le tennis de table', '', ''],
    [SP, 'JO', 1, 'VF', 'Les Jeux olympiques d\'été ont lieu tous les 4 ans.', 'Vrai', '', '', '', 'Ceux de Tokyo 2020 ont exceptionnellement été décalés à 2021.', ''],
    [SP, 'Cyclisme', 1, 'QCM', 'Quelle est la couleur du maillot du leader du Tour de France ?', 'Jaune', 'Vert', 'À pois rouges', 'Blanc', 'Le jaune rappelle la couleur du papier du journal L\'Auto, organisateur du premier Tour.', ''],
    [SP, 'Football', 1, 'QCM', 'Quel pays a gagné la Coupe du monde de football 2018 ?', 'La France', 'La Croatie', 'Le Brésil', 'L\'Allemagne', 'Victoire 4-2 contre la Croatie en finale, à Moscou.', ''],
    [SP, 'Rugby', 1, 'QCM', 'Dans quel sport marque-t-on des essais ?', 'Le rugby', 'Le football', 'Le handball', 'Le basket', '', ''],

    [SP, 'Raquettes', 2, 'QCM', 'Au tennis, comment appelle-t-on un score de 40 partout ?', 'Égalité', 'Avantage', 'Balle de match', 'Jeu décisif', '« Deuce » en anglais.', ''],
    [SP, 'Raquettes', 2, 'QCM', 'Quel tournoi du Grand Chelem se joue sur terre battue à Paris ?', 'Roland-Garros', 'Wimbledon', 'L\'US Open', 'L\'Open d\'Australie', '', ''],
    [SP, 'Athlétisme', 2, 'ESTIMATION', 'Combien de kilomètres mesure un marathon ?', '42.195', 'km', '1', '', 'Exactement 42,195 km depuis les JO de Londres 1908.', ''],
    [SP, 'Athlétisme', 2, 'VF', 'Usain Bolt détient le record du monde du 100 m.', 'Vrai', '', '', '', '9,58 secondes à Berlin, en 2009.', ''],
    [SP, 'Football', 2, 'QCM', 'Quel footballeur français est surnommé « Zizou » ?', 'Zinédine Zidane', 'Kylian Mbappé', 'Thierry Henry', 'Michel Platini', '', ''],
    [SP, 'JO', 2, 'QCM', 'Quelle ville a accueilli les Jeux olympiques d\'été de 2024 ?', 'Paris', 'Los Angeles', 'Tokyo', 'Londres', 'Cent ans après les JO de Paris 1924.', ''],
    [SP, 'Basket', 2, 'QCM', 'Dans quel sport Tony Parker s\'est-il illustré ?', 'Le basket', 'Le handball', 'Le tennis', 'Le football', 'Quatre titres NBA avec les San Antonio Spurs.', ''],

    [SP, 'Natation', 3, 'QCM', 'Quel nageur détient le record de médailles d\'or olympiques ?', 'Michael Phelps', 'Mark Spitz', 'Ian Thorpe', 'Léon Marchand', '23 médailles d\'or, 28 médailles au total.', ''],
    [SP, 'Golf', 3, 'ESTIMATION', 'Combien de trous compte un parcours de golf standard ?', '18', 'trous', '0', '', '', ''],
    [SP, 'Football', 3, 'QCM', 'Quel pays a remporté le plus de Coupes du monde de football ?', 'Le Brésil', 'L\'Allemagne', 'L\'Italie', 'L\'Argentine', 'Cinq titres : 1958, 1962, 1970, 1994, 2002.', ''],
    [SP, 'Cyclisme', 3, 'VF', 'L\'arrivée finale du Tour de France a toujours lieu à Paris.', 'Faux', '', '', '', 'En 2024, à cause des JO, le Tour s\'est terminé à Nice.', ''],
    [SP, 'JO', 3, 'ORDRE', 'Classez ces villes selon la date à laquelle elles ont accueilli les JO d\'été.', 'Barcelone | Sydney | Pékin | Tokyo', 'De la plus ancienne à la plus récente', '', '', '1992, 2000, 2008, 2021.', ''],
    [SP, 'Combat', 3, 'QCM', 'Quel sport pratique Teddy Riner ?', 'Le judo', 'La lutte', 'Le rugby', 'La boxe', 'Multiple champion du monde et champion olympique.', ''],
    [SP, 'Football', 3, 'ESTIMATION', 'En quelle année la France a-t-elle gagné sa première Coupe du monde de football ?', '1998', '', '1', '', 'Victoire 3-0 contre le Brésil au Stade de France.', ''],
    [SP, 'Glisse', 3, 'QCM', 'Dans quel sport fait-on glisser des « pierres » sur la glace en balayant devant elles ?', 'Le curling', 'Le hockey', 'Le biathlon', 'Le bobsleigh', '', ''],

    [SP, 'Rugby', 4, 'QCM', 'Combien de temps dure un match de rugby à XV, sans les prolongations ?', '80 minutes', '90 minutes', '70 minutes', '60 minutes', 'Deux mi-temps de 40 minutes.', ''],
    [SP, 'JO', 4, 'ESTIMATION', 'En quelle année ont eu lieu les premiers Jeux olympiques modernes ?', '1896', '', '4', '', 'À Athènes, sous l\'impulsion de Pierre de Coubertin.', ''],
    [SP, 'Automobile', 4, 'QCM', 'Quel pilote partage avec Michael Schumacher le record de 7 titres de champion du monde de F1 ?', 'Lewis Hamilton', 'Ayrton Senna', 'Alain Prost', 'Sebastian Vettel', '', ''],
    [SP, 'JO', 4, 'QCM', 'Quelle ville française a accueilli les Jeux olympiques d\'hiver de 1992 ?', 'Albertville', 'Grenoble', 'Chamonix', 'Annecy', 'Grenoble les avait accueillis en 1968 et Chamonix en 1924.', ''],
    [SP, 'Athlétisme', 4, 'ORDRE', 'Classez ces courses selon leur distance.', 'Marathon | Semi-marathon | 10 000 m | 1 500 m', 'De la plus longue à la plus courte', '', '', '', ''],
    [SP, 'Cyclisme', 4, 'VF', 'Le premier Tour de France a eu lieu en 1903.', 'Vrai', '', '', '', 'Gagné par Maurice Garin.', ''],
    [SP, 'Athlétisme', 4, 'QCM', 'Dans quel sport Marie-José Pérec a-t-elle remporté trois titres olympiques ?', 'L\'athlétisme', 'La natation', 'Le judo', 'L\'escrime', '400 m en 1992, puis doublé 200 m / 400 m en 1996.', ''],

    [SP, 'Raquettes', 5, 'ESTIMATION', 'Combien de fois Rafael Nadal a-t-il gagné Roland-Garros ?', '14', 'fois', '0', '', 'Un record absolu pour un même tournoi du Grand Chelem.', ''],
    [SP, 'Cyclisme', 5, 'QCM', 'Quel cycliste français a gagné cinq Tours de France, dont le premier en 1978 ?', 'Bernard Hinault', 'Jacques Anquetil', 'Laurent Fignon', 'Louison Bobet', 'Surnommé « le Blaireau ». Dernier Français vainqueur du Tour, en 1985.', ''],
    [SP, 'Rugby', 5, 'QCM', 'Quelle nation a remporté le plus de Coupes du monde de rugby ?', 'L\'Afrique du Sud', 'La Nouvelle-Zélande', 'L\'Australie', 'L\'Angleterre', 'Quatre titres : 1995, 2007, 2019, 2023.', ''],
    [SP, 'Raquettes', 5, 'VF', 'Le volant de badminton peut dépasser les 400 km/h lors d\'un smash.', 'Vrai', '', '', '', 'Le record dépasse 490 km/h : c\'est le sport de raquette le plus rapide.', ''],
    [SP, 'Volley', 5, 'ESTIMATION', 'Combien de joueurs par équipe y a-t-il sur un terrain de volley-ball ?', '6', 'joueurs', '0', '', '', ''],

    // ---------------- ARTS & LITTÉRATURE ----------------
    [A, 'Peinture', 1, 'QCM', 'Qui a peint « La Joconde » ?', 'Léonard de Vinci', 'Michel-Ange', 'Raphaël', 'Pablo Picasso', 'Peinte au début du XVIe siècle.', ''],
    [A, 'Littérature', 1, 'QCM', 'Qui a écrit « Les Misérables » ?', 'Victor Hugo', 'Émile Zola', 'Honoré de Balzac', 'Gustave Flaubert', 'Publié en 1862.', 'Jean Valjean, Cosette, Gavroche…'],
    [A, 'Musées', 1, 'VF', '« La Joconde » est exposée au musée du Louvre.', 'Vrai', '', '', '', '', ''],
    [A, 'Contes', 1, 'QCM', 'Quelle héroïne de conte perd sa pantoufle de verre ?', 'Cendrillon', 'Blanche-Neige', 'La Belle au bois dormant', 'Le Petit Chaperon rouge', '', ''],
    [A, 'Littérature', 1, 'QCM', 'Qui a écrit « Le Petit Prince » ?', 'Antoine de Saint-Exupéry', 'Jules Verne', 'Albert Camus', 'Marcel Pagnol', 'Publié en 1943, c\'est l\'un des livres les plus traduits au monde.', ''],
    [A, 'Contes', 1, 'ESTIMATION', 'Combien de nains accompagnent Blanche-Neige ?', '7', 'nains', '0', '', '', ''],

    [A, 'Littérature', 2, 'QCM', 'Quel auteur a créé Sherlock Holmes ?', 'Arthur Conan Doyle', 'Agatha Christie', 'Edgar Allan Poe', 'Maurice Leblanc', 'Maurice Leblanc a créé Arsène Lupin.', ''],
    [A, 'Peinture', 2, 'QCM', 'Quel peintre néerlandais s\'est coupé une partie de l\'oreille ?', 'Vincent van Gogh', 'Rembrandt', 'Johannes Vermeer', 'Piet Mondrian', 'En 1888, à Arles.', ''],
    [A, 'Littérature', 2, 'QCM', 'Qui a écrit « Vingt Mille Lieues sous les mers » ?', 'Jules Verne', 'Alexandre Dumas', 'Victor Hugo', 'H. G. Wells', 'Le capitaine Nemo et son sous-marin, le Nautilus.', ''],
    [A, 'Théâtre', 2, 'VF', 'Molière est l\'auteur de « L\'Avare ».', 'Vrai', '', '', '', 'Comédie de 1668, avec le personnage d\'Harpagon.', ''],
    [A, 'Architecture', 2, 'ESTIMATION', 'En quelle année la tour Eiffel a-t-elle été inaugurée ?', '1889', '', '3', '', 'Pour l\'Exposition universelle et le centenaire de la Révolution.', ''],
    [A, 'Théâtre', 2, 'QCM', 'Qui a écrit « Roméo et Juliette » ?', 'William Shakespeare', 'Molière', 'Jean Racine', 'Oscar Wilde', '', ''],

    [A, 'Peinture', 3, 'QCM', 'À quel mouvement artistique Claude Monet est-il associé ?', 'L\'impressionnisme', 'Le cubisme', 'Le surréalisme', 'Le baroque', 'Le mot vient de son tableau « Impression, soleil levant » (1872).', ''],
    [A, 'Peinture', 3, 'QCM', 'Qui a peint le plafond de la chapelle Sixtine ?', 'Michel-Ange', 'Léonard de Vinci', 'Raphaël', 'Botticelli', 'De 1508 à 1512.', ''],
    [A, 'Littérature', 3, 'ORDRE', 'Classez ces écrivains selon leur date de naissance.', 'Molière | Victor Hugo | Émile Zola | Albert Camus', 'Du plus ancien au plus récent', '', '', '1622, 1802, 1840, 1913.', ''],
    [A, 'Peinture', 3, 'QCM', 'Quel peintre a réalisé « Guernica » ?', 'Pablo Picasso', 'Salvador Dalí', 'Joan Miró', 'Francisco de Goya', 'Peint en 1937 après le bombardement de la ville basque.', ''],
    [A, 'Sculpture', 3, 'QCM', 'Qui a sculpté « Le Penseur » ?', 'Auguste Rodin', 'Camille Claudel', 'Michel-Ange', 'Auguste Bartholdi', '', ''],
    [A, 'Poésie', 3, 'QCM', 'Qui a écrit « Les Fleurs du mal » ?', 'Charles Baudelaire', 'Arthur Rimbaud', 'Paul Verlaine', 'Stéphane Mallarmé', 'Publié en 1857, puis condamné pour « outrage à la morale publique ».', ''],
    [A, 'Peinture', 3, 'QCM', 'Quel peintre surréaliste a peint des montres molles dans « La Persistance de la mémoire » ?', 'Salvador Dalí', 'René Magritte', 'Max Ernst', 'Joan Miró', '', ''],

    [A, 'Littérature', 4, 'QCM', 'Quel auteur de « L\'Étranger » a reçu le prix Nobel de littérature en 1957 ?', 'Albert Camus', 'Jean-Paul Sartre', 'André Malraux', 'Marguerite Yourcenar', '', ''],
    [A, 'Littérature', 4, 'VF', 'Jean-Paul Sartre a refusé le prix Nobel de littérature.', 'Vrai', '', '', '', 'En 1964 : il refusait les distinctions officielles.', ''],
    [A, 'Architecture', 4, 'QCM', 'Quel architecte a conçu la pyramide du Louvre ?', 'Ieoh Ming Pei', 'Le Corbusier', 'Jean Nouvel', 'Renzo Piano', 'Inaugurée en 1989.', ''],
    [A, 'Peinture', 4, 'QCM', 'Quelle est la nationalité de la peintre Frida Kahlo ?', 'Mexicaine', 'Espagnole', 'Colombienne', 'Argentine', '', ''],
    [A, 'Histoire de l\'art', 4, 'ORDRE', 'Classez ces mouvements artistiques par ordre d\'apparition.', 'Renaissance | Baroque | Impressionnisme | Cubisme', 'Du plus ancien au plus récent', '', '', 'XVe, XVIIe, fin XIXe, début XXe siècle.', ''],
    [A, 'Musées', 4, 'QCM', 'Dans quel musée parisien voit-on « Les Nymphéas » de Monet dans deux salles ovales ?', 'Le musée de l\'Orangerie', 'Le Louvre', 'Le musée d\'Orsay', 'Le Centre Pompidou', '', ''],
    [A, 'Poésie', 4, 'ESTIMATION', 'Combien de vers compte un sonnet ?', '14', 'vers', '0', '', 'Deux quatrains puis deux tercets.', ''],
    [A, 'Poésie', 4, 'QCM', 'Quel poète a écrit « Le Dormeur du val » ?', 'Arthur Rimbaud', 'Paul Verlaine', 'Charles Baudelaire', 'Victor Hugo', 'Écrit en 1870, à 16 ans.', ''],

    [A, 'Peinture', 5, 'QCM', 'Qui a peint « La Jeune Fille à la perle » ?', 'Johannes Vermeer', 'Rembrandt', 'Jan van Eyck', 'Pierre Paul Rubens', 'Vers 1665. Surnommée « la Joconde du Nord ».', ''],
    [A, 'Littérature', 5, 'QCM', 'Quel est le vrai nom de l\'écrivaine George Sand ?', 'Amantine Aurore Lucile Dupin', 'Marie d\'Agoult', 'Louise Colet', 'Juliette Drouet', '', ''],
    [A, 'Musées', 5, 'VF', 'Le Louvre est le musée d\'art le plus visité au monde.', 'Vrai', '', '', '', 'Entre 8 et 10 millions de visiteurs par an.', ''],
    [A, 'Littérature', 5, 'ESTIMATION', 'En combien de tomes est publié « À la recherche du temps perdu » de Marcel Proust ?', '7', 'tomes', '0', '', 'De « Du côté de chez Swann » (1913) au « Temps retrouvé » (1927).', ''],
    [A, 'Littérature', 5, 'QCM', 'Quel auteur a écrit « Cent ans de solitude » ?', 'Gabriel García Márquez', 'Jorge Luis Borges', 'Pablo Neruda', 'Mario Vargas Llosa', 'Prix Nobel de littérature en 1982.', ''],
  ];
}
