/**
 * Banque de questions — Sciences & Nature / Animaux
 * Format : voir Banque1.gs
 */
function banque2_() {
  const S = 'Sciences', N = 'Nature & Animaux';
  return [
    // ---------------- SCIENCES ----------------
    [S, 'Espace', 1, 'QCM', 'Quelle planète est la plus proche du Soleil ?', 'Mercure', 'Vénus', 'Mars', 'La Terre', '', ''],
    [S, 'Chimie', 1, 'QCM', 'Quelle est la formule chimique de l\'eau ?', 'H2O', 'CO2', 'O2', 'NaCl', 'Deux atomes d\'hydrogène et un atome d\'oxygène.', ''],
    [S, 'Espace', 1, 'VF', 'Le Soleil est une étoile.', 'Vrai', '', '', '', 'Une étoile naine jaune, âgée d\'environ 4,6 milliards d\'années.', ''],
    [S, 'Espace', 1, 'QCM', 'Combien de planètes compte le système solaire ?', '8', '9', '7', '10', 'Pluton a été reclassée en « planète naine » en 2006.', ''],
    [S, 'Corps humain', 1, 'QCM', 'Quel organe pompe le sang dans le corps ?', 'Le cœur', 'Les poumons', 'Le foie', 'Les reins', 'Environ 100 000 battements par jour.', ''],
    [S, 'Physique', 1, 'VF', 'Au niveau de la mer, l\'eau bout à 100 °C.', 'Vrai', '', '', '', 'En altitude, elle bout à une température plus basse.', ''],

    [S, 'Espace', 2, 'QCM', 'Quelle est la plus grande planète du système solaire ?', 'Jupiter', 'Saturne', 'Neptune', 'Uranus', 'Plus de 1 300 fois le volume de la Terre.', ''],
    [S, 'Biologie', 2, 'QCM', 'Quel gaz les plantes absorbent-elles pour la photosynthèse ?', 'Le dioxyde de carbone', 'L\'oxygène', 'L\'azote', 'L\'hélium', 'Elles rejettent de l\'oxygène.', ''],
    [S, 'Corps humain', 2, 'ESTIMATION', 'Combien d\'os compte le squelette d\'un adulte ?', '206', 'os', '6', '', 'Un nouveau-né en a environ 300 : certains fusionnent en grandissant.', ''],
    [S, 'Physique', 2, 'VF', 'Le son se déplace plus vite que la lumière.', 'Faux', '', '', '', 'Environ 340 m/s pour le son, contre 300 000 km/s pour la lumière. C\'est pourquoi on voit l\'éclair avant d\'entendre le tonnerre.', ''],
    [S, 'Savants', 2, 'QCM', 'Qui a formulé la théorie de la relativité ?', 'Albert Einstein', 'Isaac Newton', 'Galilée', 'Marie Curie', 'Relativité restreinte en 1905, générale en 1915.', 'E = mc².'],
    [S, 'Espace', 2, 'ORDRE', 'Classez ces planètes selon leur distance au Soleil.', 'Mercure | Vénus | Terre | Mars', 'De la plus proche à la plus éloignée', '', '', '', ''],
    [S, 'Savants', 2, 'QCM', 'Quel savant est associé à la loi de la gravitation universelle ?', 'Isaac Newton', 'Galilée', 'Johannes Kepler', 'Albert Einstein', 'Publiée en 1687. La pomme serait une légende embellie.', 'Une histoire de pomme…'],

    [S, 'Chimie', 3, 'QCM', 'Quel est le symbole chimique de l\'or ?', 'Au', 'Or', 'Ag', 'Go', 'Du latin « aurum ». Ag est l\'argent (argentum).', ''],
    [S, 'Savants', 3, 'QCM', 'Quelle scientifique a reçu deux prix Nobel dans deux sciences différentes ?', 'Marie Curie', 'Rosalind Franklin', 'Ada Lovelace', 'Irène Joliot-Curie', 'Physique en 1903, chimie en 1911.', ''],
    [S, 'Physique', 3, 'ESTIMATION', 'Quelle est la vitesse de la lumière dans le vide, en km/s ?', '300000', 'km/s', '10000', '', 'Précisément 299 792 km/s.', ''],
    [S, 'Chimie', 3, 'VF', 'Les diamants sont composés de carbone.', 'Vrai', '', '', '', 'Comme le graphite des mines de crayon, mais organisé autrement.', ''],
    [S, 'Biologie', 3, 'QCM', 'Dans quelle partie de la cellule se trouve l\'essentiel de l\'ADN ?', 'Le noyau', 'La membrane', 'Le cytoplasme', 'Le ribosome', '', ''],
    [S, 'Savants', 3, 'QCM', 'Quel savant a découvert la pénicilline en 1928 ?', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Claude Bernard', 'Grâce à une moisissure qui avait contaminé une boîte de culture.', 'Découverte par hasard.'],
    [S, 'Physique', 3, 'QCM', 'Quelle particule porte une charge électrique négative ?', 'L\'électron', 'Le proton', 'Le neutron', 'Le photon', '', ''],

    [S, 'Espace', 4, 'QCM', 'Quel est l\'élément chimique le plus abondant dans l\'Univers ?', 'L\'hydrogène', 'L\'hélium', 'L\'oxygène', 'Le carbone', 'Environ 74 % de la matière ordinaire.', ''],
    [S, 'Espace', 4, 'ESTIMATION', 'Combien de minutes met la lumière du Soleil pour atteindre la Terre ?', '8', 'min', '1', '', 'Environ 8 minutes et 20 secondes.', ''],
    [S, 'Corps humain', 4, 'QCM', 'Combien de chromosomes possède une cellule humaine (hors cellules sexuelles) ?', '46', '23', '48', '44', '23 paires.', ''],
    [S, 'Espace', 4, 'VF', 'Vénus est la planète la plus chaude du système solaire.', 'Vrai', '', '', '', 'Environ 465 °C à cause de son effet de serre, alors que Mercure est plus proche du Soleil.', ''],
    [S, 'Biologie', 4, 'ORDRE', 'Classez-les par taille.', 'Atome | Virus | Bactérie | Cellule humaine', 'Du plus petit au plus grand', '', '', '', ''],

    [S, 'Physique', 5, 'QCM', 'Quel est le métal qui conduit le mieux l\'électricité ?', 'L\'argent', 'Le cuivre', 'L\'or', 'L\'aluminium', 'Le cuivre est préféré dans les câbles car il est bien moins cher.', ''],
    [S, 'Physique', 5, 'ESTIMATION', 'Quelle est la température du zéro absolu, en °C ?', '-273', '°C', '2', '', 'Précisément −273,15 °C, soit 0 kelvin.', 'C\'est un nombre négatif !'],
    [S, 'Espace', 5, 'QCM', 'Combien de temps la Lune met-elle environ pour faire le tour de la Terre ?', 'Environ 27 jours', 'Environ 12 jours', 'Environ 60 jours', 'Environ 365 jours', '27,3 jours. Il y a 29,5 jours entre deux pleines lunes.', ''],
    [S, 'Physique', 5, 'VF', 'Le verre est un liquide qui coule très lentement.', 'Faux', '', '', '', 'C\'est un mythe : le verre est un solide amorphe. Les vitraux anciens étaient irréguliers dès leur fabrication.', ''],
    [S, 'Espace', 5, 'QCM', 'Quelle grande galaxie spirale est la plus proche de la Voie lactée ?', 'Andromède', 'Le Sombrero', 'Le Tourbillon', 'Le Grand Nuage de Magellan', 'À environ 2,5 millions d\'années-lumière.', ''],
    [S, 'Inventions', 5, 'ORDRE', 'Classez ces inventions par ordre d\'apparition.', 'Imprimerie | Machine à vapeur | Téléphone | Internet', 'De la plus ancienne à la plus récente', '', '', 'Vers 1450, XVIIIe siècle, 1876, fin du XXe siècle.', ''],

    // ---------------- NATURE & ANIMAUX ----------------
    [N, 'Mammifères', 1, 'QCM', 'Quel est le plus grand animal du monde ?', 'La baleine bleue', 'L\'éléphant d\'Afrique', 'Le requin-baleine', 'La girafe', 'Jusqu\'à 30 m et plus de 150 tonnes.', ''],
    [N, 'Petites bêtes', 1, 'QCM', 'Combien de pattes a une araignée ?', '8', '6', '10', '12', 'Les insectes en ont 6. L\'araignée est un arachnide.', ''],
    [N, 'Mammifères', 1, 'VF', 'La baleine est un mammifère.', 'Vrai', '', '', '', 'Elle respire de l\'air et allaite ses petits.', ''],
    [N, 'Mammifères', 1, 'QCM', 'Quel animal est surnommé « le roi des animaux » ?', 'Le lion', 'Le tigre', 'L\'éléphant', 'Le gorille', '', ''],
    [N, 'Ferme', 1, 'QCM', 'Comment s\'appelle le petit de la vache ?', 'Le veau', 'Le poulain', 'L\'agneau', 'Le chevreau', '', ''],
    [N, 'Mammifères', 1, 'VF', 'La chauve-souris est un oiseau.', 'Faux', '', '', '', 'C\'est un mammifère, le seul capable de vraiment voler.', ''],

    [N, 'Records', 2, 'QCM', 'Quel est l\'animal terrestre le plus rapide ?', 'Le guépard', 'Le lion', 'L\'antilope', 'Le cheval', 'Plus de 100 km/h en pointe.', ''],
    [N, 'Mer', 2, 'ESTIMATION', 'Combien de cœurs possède une pieuvre ?', '3', 'cœurs', '0', '', 'Deux pour les branchies, un pour le reste du corps. Son sang est bleu.', ''],
    [N, 'Mammifères', 2, 'QCM', 'De quoi se nourrit principalement le panda géant ?', 'De bambou', 'De poissons', 'De fruits', 'D\'insectes', 'Il en mange jusqu\'à 12 heures par jour.', ''],
    [N, 'Mer', 2, 'VF', 'Le dauphin respire avec des branchies.', 'Faux', '', '', '', 'C\'est un mammifère : il respire par un évent au sommet de la tête.', ''],
    [N, 'Plantes', 2, 'QCM', 'Quel arbre produit les glands ?', 'Le chêne', 'Le hêtre', 'Le châtaignier', 'Le noisetier', '', ''],
    [N, 'Vocabulaire', 2, 'QCM', 'Comment appelle-t-on un animal qui mange de tout ?', 'Omnivore', 'Herbivore', 'Carnivore', 'Insectivore', '', ''],

    [N, 'Oiseaux', 3, 'QCM', 'Quel est le plus grand oiseau du monde ?', 'L\'autruche', 'L\'émeu', 'Le condor', 'L\'albatros', 'Jusqu\'à 2,7 m. Elle ne vole pas.', ''],
    [N, 'Mammifères', 3, 'ESTIMATION', 'Combien de mois dure la gestation d\'une éléphante ?', '22', 'mois', '2', '', 'Près de deux ans, un record chez les mammifères terrestres.', ''],
    [N, 'Petites bêtes', 3, 'VF', 'Une abeille ouvrière meurt généralement après avoir piqué un humain.', 'Vrai', '', '', '', 'Son dard barbelé reste accroché dans la peau et s\'arrache avec une partie de son abdomen.', ''],
    [N, 'Reptiles', 3, 'QCM', 'Quel reptile change de couleur et bouge ses yeux indépendamment l\'un de l\'autre ?', 'Le caméléon', 'Le gecko', 'L\'iguane', 'Le lézard vert', '', ''],
    [N, 'Mammifères', 3, 'ORDRE', 'Classez ces animaux selon leur poids.', 'Éléphant d\'Afrique | Girafe | Lion | Renard', 'Du plus lourd au plus léger', '', '', '', ''],
    [N, 'Mer', 3, 'QCM', 'Quel est le plus grand récif corallien du monde ?', 'La Grande Barrière de corail', 'Le récif du Belize', 'Le lagon de Nouvelle-Calédonie', 'Les récifs de la mer Rouge', 'Plus de 2 300 km au large de l\'Australie.', ''],

    [N, 'Ferme', 4, 'QCM', 'Combien de compartiments compte l\'estomac d\'une vache ?', '4', '2', '1', '3', 'Panse, bonnet, feuillet et caillette.', ''],
    [N, 'Mammifères', 4, 'QCM', 'Quel est le plus grand félin du monde ?', 'Le tigre', 'Le lion', 'Le jaguar', 'Le léopard', 'Le tigre de Sibérie peut dépasser 3 m de long.', ''],
    [N, 'Records', 4, 'ESTIMATION', 'Quelle est la vitesse de pointe d\'un guépard, en km/h ?', '110', 'km/h', '15', '', 'Entre 100 et 120 km/h selon les mesures, sur de courtes distances.', ''],
    [N, 'Mer', 4, 'VF', 'Le requin est un poisson.', 'Vrai', '', '', '', 'Un poisson cartilagineux : il n\'a pas d\'os.', ''],
    [N, 'Plantes', 4, 'QCM', 'Quelle espèce d\'arbre détient le record de hauteur ?', 'Le séquoia à feuilles d\'if', 'Le baobab', 'L\'eucalyptus', 'Le cèdre du Liban', 'Hyperion, en Californie, mesure environ 116 m.', ''],
    [N, 'Mammifères', 4, 'QCM', 'Quel mammifère pond des œufs ?', 'L\'ornithorynque', 'Le koala', 'Le paresseux', 'Le tatou', 'Comme l\'échidné, c\'est un monotrème.', ''],

    [N, 'Mammifères', 5, 'ESTIMATION', 'Combien de mois dure la gestation d\'une girafe ?', '15', 'mois', '1', '', 'Environ 15 mois. Le girafon tombe de 2 m de haut à la naissance.', ''],
    [N, 'Vocabulaire', 5, 'QCM', 'Comment s\'appelle la femelle du sanglier ?', 'La laie', 'La hase', 'La biche', 'La chevrette', 'La hase est la femelle du lièvre.', ''],
    [N, 'Mammifères', 5, 'VF', 'Le koala est un ours.', 'Faux', '', '', '', 'C\'est un marsupial, comme le kangourou.', ''],
    [N, 'Petites bêtes', 5, 'QCM', 'Combien d\'yeux possède une abeille ?', '5', '2', '4', '8', 'Deux grands yeux composés et trois petits ocelles sur le dessus de la tête.', ''],
    [N, 'Records', 5, 'ORDRE', 'Classez ces animaux selon leur vitesse de pointe.', 'Faucon pèlerin (en piqué) | Guépard | Cheval | Humain', 'Du plus rapide au plus lent', '', '', 'Plus de 300 km/h, environ 110, environ 70, environ 44 km/h.', ''],
    [N, 'Oiseaux', 5, 'QCM', 'Quel animal actuel pond les plus gros œufs ?', 'L\'autruche', 'L\'émeu', 'Le crocodile du Nil', 'Le python', 'Environ 1,5 kg, soit l\'équivalent de 24 œufs de poule.', ''],
  ];
}
