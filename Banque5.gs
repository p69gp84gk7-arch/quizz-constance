/**
 * Banque de questions — Gastronomie & Divers (langue française, tech, maths, traditions)
 * Format : voir Banque1.gs
 */
function banque5_() {
  const GA = 'Gastronomie', D = 'Divers';
  return [
    // ---------------- GASTRONOMIE ----------------
    [GA, 'Monde', 1, 'QCM', 'Quel fruit est la base du guacamole ?', 'L\'avocat', 'Le kiwi', 'Le citron vert', 'La mangue', 'Recette mexicaine.', ''],
    [GA, 'Fromages', 1, 'VF', 'Le camembert est un fromage normand.', 'Vrai', '', '', '', 'Camembert est un village de l\'Orne.', ''],
    [GA, 'Monde', 1, 'QCM', 'De quel pays viennent les sushis ?', 'Du Japon', 'De la Chine', 'De la Corée', 'De la Thaïlande', '', ''],
    [GA, 'Monde', 1, 'QCM', 'Quelle céréale sert à préparer le risotto ?', 'Le riz', 'Le blé', 'L\'orge', 'Le maïs', 'Souvent du riz arborio ou carnaroli.', ''],
    [GA, 'Traditions', 1, 'QCM', 'Que mange-t-on traditionnellement à l\'Épiphanie ?', 'La galette des rois', 'La bûche', 'Des crêpes', 'Des œufs en chocolat', 'Celui qui trouve la fève devient le roi.', ''],
    [GA, 'Régions', 1, 'QCM', 'De quelle région les crêpes sont-elles la grande spécialité ?', 'La Bretagne', 'L\'Alsace', 'La Provence', 'La Savoie', '', ''],

    [GA, 'Monde', 2, 'QCM', 'De quelle ville italienne vient la pizza margherita ?', 'Naples', 'Rome', 'Milan', 'Venise', 'Créée, selon la tradition, en l\'honneur de la reine Marguerite en 1889.', 'Ses couleurs rappellent le drapeau italien.'],
    [GA, 'Cuisine', 2, 'QCM', 'Quels sont les deux ingrédients de base de la mayonnaise ?', 'Jaune d\'œuf et huile', 'Crème et beurre', 'Lait et farine', 'Blanc d\'œuf et vinaigre', 'Avec un peu de moutarde, sel et poivre.', ''],
    [GA, 'Fromages', 2, 'VF', 'Le roquefort est fabriqué avec du lait de brebis.', 'Vrai', '', '', '', 'Il est affiné dans les caves de Roquefort-sur-Soulzon (Aveyron).', ''],
    [GA, 'Régions', 2, 'QCM', 'Quelle région est célèbre pour sa choucroute ?', 'L\'Alsace', 'La Bretagne', 'La Provence', 'La Normandie', '', ''],
    [GA, 'Épices', 2, 'QCM', 'Quelle épice donne au curry sa couleur jaune ?', 'Le curcuma', 'Le safran', 'Le paprika', 'Le cumin', '', ''],
    [GA, 'Traditions', 2, 'ORDRE', 'Remettez dans l\'ordre ces étapes d\'un repas traditionnel français.', 'Apéritif | Entrée | Plat | Fromage | Dessert', 'Du début à la fin du repas', '', '', '', ''],
    [GA, 'Cuisine', 2, 'QCM', 'Quel fruit utilise-t-on pour la tarte Tatin ?', 'La pomme', 'La poire', 'L\'abricot', 'La prune', 'Une tarte renversée, née en Sologne chez les sœurs Tatin.', ''],

    [GA, 'Épices', 3, 'QCM', 'Quelle est l\'épice la plus chère du monde ?', 'Le safran', 'La vanille', 'La cardamome', 'La cannelle', 'Il faut environ 150 000 fleurs de crocus pour obtenir 1 kg de safran.', ''],
    [GA, 'Botanique', 3, 'VF', 'Pour un botaniste, la tomate est un fruit.', 'Vrai', '', '', '', 'Elle vient de la fleur et contient les graines.', ''],
    [GA, 'Pain', 3, 'ESTIMATION', 'Combien de grammes pèse une baguette classique ?', '250', 'g', '20', '', 'Environ 250 g pour une longueur de 55 à 65 cm.', ''],
    [GA, 'Régions', 3, 'QCM', 'Quelle soupe de poissons est la spécialité de Marseille ?', 'La bouillabaisse', 'La ratatouille', 'La tapenade', 'La pissaladière', '', ''],
    [GA, 'Fromages', 3, 'QCM', 'Quel fromage met-on traditionnellement dans la tartiflette ?', 'Le reblochon', 'Le comté', 'Le fromage à raclette', 'Le beaufort', '', ''],
    [GA, 'Guides', 3, 'QCM', 'Qui a créé le guide qui attribue des étoiles aux restaurants ?', 'Les frères Michelin', 'Henri Gault et Christian Millau', 'Auguste Escoffier', 'Paul Bocuse', 'Premier guide en 1900, distribué avec les pneus. Les étoiles arrivent en 1926.', ''],
    [GA, 'Cuisine', 3, 'ESTIMATION', 'Combien de minutes faut-il cuire un œuf à la coque, dans l\'eau bouillante ?', '3', 'min', '0', '', '', ''],
    [GA, 'Monde', 3, 'QCM', 'De quel poisson vient le vrai caviar ?', 'L\'esturgeon', 'Le saumon', 'Le hareng', 'La truite', '', ''],

    [GA, 'Monde', 4, 'QCM', 'Quel légume est la base du « baba ganoush » ?', 'L\'aubergine', 'Le pois chiche', 'La courgette', 'Le poivron', 'Caviar d\'aubergine du Proche-Orient, au tahini.', ''],
    [GA, 'Épices', 4, 'ORDRE', 'Classez-les selon leur force.', 'Piment habanero | Piment de Cayenne | Piment jalapeño | Poivron', 'Du plus fort au plus doux', '', '', 'Mesurée en unités de Scoville.', ''],
    [GA, 'Cuisine', 4, 'ESTIMATION', 'À quelle température (en °C) le sucre commence-t-il à caraméliser ?', '160', '°C', '20', '', 'Environ 160 °C. Au-delà de 190 °C, il brûle.', ''],
    [GA, 'Vins', 4, 'VF', 'Le champagne ne peut être produit que dans la région Champagne.', 'Vrai', '', '', '', 'C\'est une appellation d\'origine protégée.', ''],
    [GA, 'Desserts', 4, 'QCM', 'Quel alcool sert à flamber les crêpes Suzette ?', 'Une liqueur d\'orange', 'Du calvados', 'Du pastis', 'De la vodka', 'Souvent du Grand Marnier ou du curaçao.', ''],
    [GA, 'Monde', 4, 'QCM', 'De quel pays vient la feta ?', 'La Grèce', 'La Turquie', 'L\'Italie', 'Chypre', '', ''],

    [GA, 'Fromages', 5, 'QCM', 'Quel fromage est devenu la première appellation d\'origine fromagère en France, en 1925 ?', 'Le roquefort', 'Le comté', 'Le camembert', 'Le brie de Meaux', '', ''],
    [GA, 'Vins', 5, 'QCM', 'Le malbec, cépage emblématique de l\'Argentine, est originaire de quel pays ?', 'La France', 'L\'Espagne', 'L\'Italie', 'Le Chili', 'Il vient du Sud-Ouest, notamment de Cahors.', ''],
    [GA, 'Monde', 5, 'VF', 'Le wasabi servi dans les restaurants est souvent du raifort coloré.', 'Vrai', '', '', '', 'Le vrai wasabi est rare et cher.', ''],
    [GA, 'Métiers', 5, 'QCM', 'Comment appelle-t-on le spécialiste chargé des vins dans un restaurant ?', 'Le sommelier', 'L\'œnologue', 'Le caviste', 'Le maître d\'hôtel', 'L\'œnologue, lui, s\'occupe de la fabrication du vin.', ''],
    [GA, 'Monde', 5, 'QCM', 'Quel pays est le premier producteur mondial de café ?', 'Le Brésil', 'La Colombie', 'Le Vietnam', 'L\'Éthiopie', 'Environ un tiers de la production mondiale.', ''],

    // ---------------- DIVERS ----------------
    [D, 'Maths', 1, 'QCM', 'Combien de jours compte une année bissextile ?', '366', '365', '364', '367', '', ''],
    [D, 'Couleurs', 1, 'QCM', 'Quelle couleur obtient-on en mélangeant du bleu et du jaune ?', 'Du vert', 'Du violet', 'De l\'orange', 'Du marron', '', ''],
    [D, 'Maths', 1, 'VF', 'Un hexagone a 6 côtés.', 'Vrai', '', '', '', 'La France est surnommée « l\'Hexagone » à cause de sa forme.', ''],
    [D, 'Langue française', 1, 'QCM', 'Combien de lettres compte l\'alphabet français ?', '26', '24', '28', '25', '', ''],
    [D, 'Langue française', 1, 'QCM', 'Quel est le contraire de « généreux » ?', 'Avare', 'Riche', 'Gentil', 'Timide', '', ''],
    [D, 'Langue française', 1, 'QCM', 'Quel est le pluriel de « cheval » ?', 'Chevaux', 'Chevals', 'Chevaus', 'Chevauxs', '', ''],

    [D, 'Tech', 2, 'QCM', 'Quelle entreprise a créé l\'iPhone ?', 'Apple', 'Samsung', 'Google', 'Nokia', '', ''],
    [D, 'Maths', 2, 'ESTIMATION', 'Combien y a-t-il de secondes dans une heure ?', '3600', 's', '0', '', '60 × 60.', ''],
    [D, 'Langue française', 2, 'VF', 'Le mot « parmi » ne prend jamais de « s ».', 'Vrai', '', '', '', 'Une faute très courante.', ''],
    [D, 'Maths', 2, 'QCM', 'Quel chiffre romain vaut 50 ?', 'L', 'C', 'D', 'V', 'I=1, V=5, X=10, L=50, C=100, D=500, M=1000.', ''],
    [D, 'Tech', 2, 'QCM', 'Quel réseau social avait un oiseau bleu pour logo avant de devenir X ?', 'Twitter', 'Facebook', 'Instagram', 'Snapchat', '', ''],
    [D, 'Tech', 2, 'QCM', 'Qui a fondé Amazon ?', 'Jeff Bezos', 'Elon Musk', 'Larry Page', 'Bill Gates', 'En 1994, d\'abord comme librairie en ligne.', ''],

    [D, 'Tech', 3, 'ESTIMATION', 'En quelle année le premier iPhone a-t-il été présenté ?', '2007', '', '1', '', 'Présenté par Steve Jobs en janvier 2007.', ''],
    [D, 'Langue française', 3, 'QCM', 'Lequel de ces mots est un palindrome (il se lit de la même façon dans les deux sens) ?', 'Kayak', 'Canoë', 'Radeau', 'Voilier', 'Comme « radar » ou « rotor ».', ''],
    [D, 'Langue française', 3, 'VF', 'Le mot « oiseau » contient les cinq voyelles a, e, i, o, u.', 'Vrai', '', '', '', 'Six lettres dont cinq voyelles différentes !', 'Faire épeler lentement.'],
    [D, 'Tech', 3, 'ORDRE', 'Classez ces unités de stockage.', 'Kilooctet | Mégaoctet | Gigaoctet | Téraoctet', 'De la plus petite à la plus grande', '', '', '', ''],
    [D, 'Maths', 3, 'QCM', 'Quelle année s\'écrit MMXXIV en chiffres romains ?', '2024', '2014', '1024', '2026', 'MM = 2000, XX = 20, IV = 4.', ''],
    [D, 'Maths', 3, 'QCM', 'Combien de zéros compte un milliard ?', '9', '6', '12', '10', '', ''],
    [D, 'Vocabulaire', 3, 'QCM', 'Comment appelle-t-on la peur des araignées ?', 'L\'arachnophobie', 'L\'agoraphobie', 'La claustrophobie', 'L\'acrophobie', '', ''],

    [D, 'Langues', 4, 'QCM', 'Quelle est la langue maternelle la plus parlée au monde ?', 'Le mandarin', 'L\'espagnol', 'L\'anglais', 'L\'hindi', 'En comptant aussi les personnes qui l\'apprennent, l\'anglais passe devant.', ''],
    [D, 'Tech', 4, 'QCM', 'Qui est considéré comme l\'inventeur du Web ?', 'Tim Berners-Lee', 'Bill Gates', 'Vint Cerf', 'Steve Jobs', 'En 1989, au CERN, près de Genève.', ''],
    [D, 'Langue française', 4, 'VF', '« Après que » doit être suivi de l\'indicatif.', 'Vrai', '', '', '', 'On écrit « après qu\'il est parti », même si l\'usage du subjonctif est très répandu.', ''],
    [D, 'Vocabulaire', 4, 'QCM', 'Comment appelle-t-on un collectionneur de timbres ?', 'Un philatéliste', 'Un numismate', 'Un cruciverbiste', 'Un colombophile', 'Le numismate collectionne les pièces de monnaie.', ''],
    [D, 'Langue française', 4, 'VF', 'Après un point-virgule, on met une majuscule.', 'Faux', '', '', '', '', ''],
    [D, 'Inventions', 4, 'QCM', 'Quel inventeur a commercialisé l\'ampoule électrique à incandescence en 1879 ?', 'Thomas Edison', 'Nikola Tesla', 'Graham Bell', 'Alessandro Volta', '', ''],

    [D, 'Francophonie', 5, 'ESTIMATION', 'Dans combien de pays le français est-il langue officielle ?', '29', 'pays', '3', '', 'Environ 29 pays, dont une majorité en Afrique.', ''],
    [D, 'Typographie', 5, 'QCM', 'Comment s\'appelle le signe « & » ?', 'L\'esperluette', 'L\'arobase', 'Le tilde', 'Le dièse', 'C\'est une ligature des lettres e et t (« et » en latin).', ''],
    [D, 'Maths', 5, 'ORDRE', 'Classez ces préfixes selon leur valeur.', 'Nano | Micro | Milli | Kilo', 'Du plus petit au plus grand', '', '', '10⁻⁹, 10⁻⁶, 10⁻³, 10³.', ''],
    [D, 'Langue française', 5, 'QCM', 'Quel est le pluriel de « un œil » quand on parle du « œil-de-bœuf » (petite fenêtre) ?', 'Des œils-de-bœuf', 'Des yeux-de-bœuf', 'Des œil-de-bœufs', 'Des yeux-de-bœufs', 'Hors du sens anatomique, « œil » fait parfois « œils ».', ''],
    [D, 'Maths', 5, 'QCM', 'Quel nombre vient juste après 7 dans la suite des nombres premiers ?', '11', '9', '13', '10', '2, 3, 5, 7, 11, 13…', ''],
  ];
}
