/**
 * Banque de questions — Cinéma & Musique
 * Catégories cinéma : Films, Acteurs, Répliques, Années, Records (+ Blind test à ajouter avec un lien YouTube)
 * Format : voir Banque1.gs
 */
function banque3_() {
  const C = 'Cinéma', M = 'Musique';
  return [
    // ---------------- CINÉMA ----------------
    [C, 'Films', 1, 'QCM', 'Dans quelle saga trouve-t-on le capitaine Jack Sparrow ?', 'Pirates des Caraïbes', 'Indiana Jones', 'Hook', 'Le Seigneur des anneaux', 'Joué par Johnny Depp depuis 2003.', ''],
    [C, 'Acteurs', 1, 'QCM', 'Quel acteur joue Jack dans « Titanic » (1997) ?', 'Leonardo DiCaprio', 'Brad Pitt', 'Tom Cruise', 'Matt Damon', 'Face à Kate Winslet.', ''],
    [C, 'Films', 1, 'VF', '« Le Roi lion » est un film des studios Disney.', 'Vrai', '', '', '', 'Sorti en 1994, avec une nouvelle version en 2019.', ''],
    [C, 'Répliques', 1, 'QCM', 'Quel personnage de Star Wars révèle à Luke : « Je suis ton père » ?', 'Dark Vador', 'Yoda', 'Obi-Wan Kenobi', 'L\'Empereur', 'Dans « L\'Empire contre-attaque » (1980).', ''],
    [C, 'Films', 1, 'QCM', 'Quel animal est Nemo ?', 'Un poisson-clown', 'Un poisson-chirurgien', 'Une tortue', 'Un hippocampe', 'Dory, elle, est un poisson-chirurgien bleu.', ''],
    [C, 'Répliques', 1, 'QCM', 'Quel personnage de « Toy Story » lance « Vers l\'infini et au-delà ! » ?', 'Buzz l\'Éclair', 'Woody', 'Rex', 'Monsieur Patate', '', ''],

    [C, 'Films', 2, 'QCM', 'Comment s\'appelle l\'école de sorcellerie d\'Harry Potter ?', 'Poudlard', 'Beauxbâtons', 'Durmstrang', 'Ilvermorny', 'Hogwarts en version originale.', ''],
    [C, 'Acteurs', 2, 'QCM', 'Qui joue Obélix dans « Astérix et Obélix contre César » (1999) ?', 'Gérard Depardieu', 'Christian Clavier', 'Jean Reno', 'Gérard Jugnot', 'Christian Clavier y joue Astérix.', ''],
    [C, 'Films', 2, 'QCM', 'Dans « Les Visiteurs », comment s\'appelle l\'écuyer joué par Christian Clavier ?', 'Jacquouille la Fripouille', 'Godefroy de Montmirail', 'Lancelot du Lac', 'Perceval le Gallois', 'Jean Reno joue Godefroy de Montmirail.', ''],
    [C, 'Années', 2, 'ESTIMATION', 'En quelle année est sorti le tout premier « Star Wars » au cinéma ?', '1977', '', '2', '', 'Réalisé par George Lucas.', ''],
    [C, 'Records', 2, 'VF', '« Titanic » a remporté 11 Oscars.', 'Vrai', '', '', '', 'Un record partagé avec « Ben-Hur » et « Le Retour du roi ».', ''],
    [C, 'Acteurs', 2, 'QCM', 'Quelle actrice joue Amélie Poulain ?', 'Audrey Tautou', 'Marion Cotillard', 'Sophie Marceau', 'Juliette Binoche', 'Dans « Le Fabuleux Destin d\'Amélie Poulain » (2001).', ''],
    [C, 'Films', 2, 'QCM', 'Qui a réalisé « Jurassic Park » ?', 'Steven Spielberg', 'James Cameron', 'George Lucas', 'Ridley Scott', 'Sorti en 1993.', ''],
    [C, 'Répliques', 2, 'QCM', 'Quel personnage répète « Mon précieux » dans « Le Seigneur des anneaux » ?', 'Gollum', 'Bilbon', 'Frodon', 'Saroumane', '', ''],

    [C, 'Répliques', 3, 'QCM', 'Dans quel film entend-on « Houston, nous avons un problème » ?', 'Apollo 13', 'Gravity', 'Armageddon', 'Interstellar', 'Film de 1995 avec Tom Hanks, d\'après une mission réelle de 1970.', ''],
    [C, 'Films', 3, 'QCM', 'Quel film de 2011 réunit Omar Sy et François Cluzet ?', 'Intouchables', 'Bienvenue chez les Ch\'tis', 'Qu\'est-ce qu\'on a fait au Bon Dieu ?', 'Le Dîner de cons', 'Plus de 19 millions d\'entrées en France.', ''],
    [C, 'Records', 3, 'QCM', 'Quel film français détient le record d\'entrées en salle en France ?', 'Bienvenue chez les Ch\'tis', 'Intouchables', 'La Grande Vadrouille', 'Astérix : Mission Cléopâtre', 'Environ 20,4 millions d\'entrées en 2008. Seul « Titanic » a fait mieux, tous films confondus.', ''],
    [C, 'Acteurs', 3, 'QCM', 'Quel acteur incarne James Bond dans « Casino Royale » (2006) ?', 'Daniel Craig', 'Pierce Brosnan', 'Sean Connery', 'Roger Moore', 'Son premier des cinq films dans le rôle.', ''],
    [C, 'Années', 3, 'ORDRE', 'Classez ces films par date de sortie.', 'Le Magicien d\'Oz | Psychose | Star Wars | Titanic', 'Du plus ancien au plus récent', '', '', '1939, 1960, 1977, 1997.', ''],
    [C, 'Films', 3, 'VF', '« Le Parrain » a été réalisé par Martin Scorsese.', 'Faux', '', '', '', 'Il a été réalisé par Francis Ford Coppola (1972).', ''],
    [C, 'Acteurs', 3, 'QCM', 'Quel acteur français a remporté l\'Oscar du meilleur acteur pour « The Artist » ?', 'Jean Dujardin', 'Omar Sy', 'Vincent Cassel', 'Gérard Depardieu', 'En 2012, pour un film muet en noir et blanc.', ''],
    [C, 'Films', 3, 'QCM', 'Quel est le premier long métrage d\'animation de Disney (1937) ?', 'Blanche-Neige et les Sept Nains', 'Pinocchio', 'Cendrillon', 'Fantasia', '', ''],

    [C, 'Records', 4, 'QCM', 'Quel film a réalisé le plus gros box-office mondial de l\'histoire (sans tenir compte de l\'inflation) ?', 'Avatar', 'Avengers : Endgame', 'Titanic', 'Star Wars : Le Réveil de la Force', 'Environ 2,9 milliards de dollars, ressorties comprises.', 'Tous les trois sont de James Cameron… sauf Endgame.'],
    [C, 'Acteurs', 4, 'QCM', 'Pour quel film Leonardo DiCaprio a-t-il enfin remporté l\'Oscar du meilleur acteur ?', 'The Revenant', 'Le Loup de Wall Street', 'Inception', 'Titanic', 'En 2016, après cinq nominations comme acteur.', ''],
    [C, 'Années', 4, 'ESTIMATION', 'En quelle année a eu lieu la première projection publique payante des frères Lumière ?', '1895', '', '3', '', 'Le 28 décembre 1895, au Salon indien du Grand Café, à Paris.', ''],
    [C, 'Films', 4, 'QCM', 'Qui a réalisé « Pulp Fiction » ?', 'Quentin Tarantino', 'Martin Scorsese', 'Guy Ritchie', 'David Fincher', 'Palme d\'or à Cannes en 1994.', ''],
    [C, 'Répliques', 4, 'QCM', 'Dans « Le Dîner de cons », comment s\'appelle le personnage joué par Jacques Villeret ?', 'François Pignon', 'Pierre Brochant', 'Juste Leblanc', 'Lucien Cheval', '« Il s\'appelle Juste Leblanc »… mais c\'est un autre personnage !', ''],
    [C, 'Records', 4, 'VF', 'Meryl Streep est l\'actrice la plus nommée de l\'histoire des Oscars.', 'Vrai', '', '', '', '21 nominations et 3 statuettes.', ''],
    [C, 'Répliques', 4, 'QCM', 'Quelle danse est devenue culte grâce à « La Cité de la peur » ?', 'La Carioca', 'Le Madison', 'La Macarena', 'Le Twist', 'Film des Nuls (1994), avec Alain Chabat et Gérard Darmon.', ''],
    [C, 'Films', 4, 'QCM', 'Qui a réalisé « Le Fabuleux Destin d\'Amélie Poulain » ?', 'Jean-Pierre Jeunet', 'Luc Besson', 'Jacques Audiard', 'Michel Gondry', '', ''],

    [C, 'Records', 5, 'ESTIMATION', 'Combien d\'Oscars a remporté « Le Seigneur des anneaux : Le Retour du roi » ?', '11', 'Oscars', '0', '', 'Il a gagné dans les 11 catégories où il était nommé.', ''],
    [C, 'Années', 5, 'ORDRE', 'Classez ces films par date de sortie.', 'Le Chanteur de jazz | Autant en emporte le vent | Les Dents de la mer | Avatar', 'Du plus ancien au plus récent', '', '', '1927 (premier long métrage parlant), 1939, 1975, 2009.', ''],
    [C, 'Acteurs', 5, 'ESTIMATION', 'Dans combien de films officiels Sean Connery a-t-il joué James Bond ?', '6', 'films', '0', '', 'Sept en comptant « Jamais plus jamais » (1983), qui n\'est pas un film officiel.', 'Accepter la discussion sur le 7e.'],
    [C, 'Records', 5, 'VF', 'Alfred Hitchcock n\'a jamais remporté l\'Oscar du meilleur réalisateur.', 'Vrai', '', '', '', 'Nommé cinq fois, sans jamais gagner. Il a reçu un prix honorifique en 1968.', ''],
    [C, 'Films', 5, 'QCM', 'Quel réalisateur japonais a signé « Le Voyage de Chihiro » ?', 'Hayao Miyazaki', 'Akira Kurosawa', 'Isao Takahata', 'Makoto Shinkai', 'Oscar du meilleur film d\'animation en 2003.', ''],

    // ---------------- MUSIQUE ----------------
    [M, 'Chanson française', 1, 'QCM', 'Qui chante « La Vie en rose » ?', 'Édith Piaf', 'Dalida', 'Barbara', 'Mireille Mathieu', '', ''],
    [M, 'Instruments', 1, 'QCM', 'Combien de cordes compte une guitare classique ?', '6', '4', '5', '12', '', ''],
    [M, 'Classique', 1, 'VF', 'Mozart est né à Salzbourg, en Autriche actuelle.', 'Vrai', '', '', '', 'Né en 1756.', ''],
    [M, 'Pop-rock', 1, 'QCM', 'Quel groupe réunissait John, Paul, George et Ringo ?', 'Les Beatles', 'Les Rolling Stones', 'Queen', 'The Who', 'Groupe de Liverpool.', ''],
    [M, 'Instruments', 1, 'QCM', 'Quel instrument a des touches noires et blanches ?', 'Le piano', 'Le violon', 'La trompette', 'La batterie', '', ''],
    [M, 'Pop-rock', 1, 'QCM', 'Qui est surnommé le « roi de la pop » ?', 'Michael Jackson', 'Elvis Presley', 'Prince', 'Freddie Mercury', '', ''],

    [M, 'Pop-rock', 2, 'QCM', 'Qui est surnommé « le King » du rock\'n\'roll ?', 'Elvis Presley', 'Chuck Berry', 'Johnny Hallyday', 'Little Richard', '', ''],
    [M, 'Chanson française', 2, 'QCM', 'Quel chanteur français était surnommé « l\'idole des jeunes » ?', 'Johnny Hallyday', 'Claude François', 'Eddy Mitchell', 'Michel Sardou', '', ''],
    [M, 'Solfège', 2, 'ESTIMATION', 'Combien de notes différentes compte la gamme do, ré, mi… ?', '7', 'notes', '0', '', 'Do, ré, mi, fa, sol, la, si.', ''],
    [M, 'Classique', 2, 'VF', 'Beethoven est devenu sourd.', 'Vrai', '', '', '', 'Il a composé sa 9e symphonie en étant presque totalement sourd.', ''],
    [M, 'Pop-rock', 2, 'QCM', 'Quel groupe chante « Bohemian Rhapsody » ?', 'Queen', 'Les Beatles', 'Pink Floyd', 'Led Zeppelin', 'Sorti en 1975, chanté par Freddie Mercury.', ''],
    [M, 'Eurovision', 2, 'QCM', 'Quel groupe suédois a gagné l\'Eurovision 1974 avec « Waterloo » ?', 'ABBA', 'Roxette', 'Ace of Base', 'Europe', '', ''],

    [M, 'Classique', 3, 'QCM', 'Qui a composé « Les Quatre Saisons » ?', 'Antonio Vivaldi', 'Jean-Sébastien Bach', 'Wolfgang Amadeus Mozart', 'Georg Friedrich Haendel', 'Quatre concertos pour violon, vers 1720.', ''],
    [M, 'Francophonie', 3, 'QCM', 'Quel artiste belge a chanté « Alors on danse » ?', 'Stromae', 'Angèle', 'Jacques Brel', 'Arno', 'Sorti en 2009, numéro 1 dans une dizaine de pays.', ''],
    [M, 'Chronologie', 3, 'ORDRE', 'Classez ces chansons par date de sortie.', 'La Vie en rose (Piaf) | Hey Jude (Beatles) | Thriller (Michael Jackson) | Get Lucky (Daft Punk)', 'De la plus ancienne à la plus récente', '', '', 'Vers 1947, 1968, 1982, 2013.', ''],
    [M, 'Électro', 3, 'VF', 'Le groupe Daft Punk est français.', 'Vrai', '', '', '', 'Thomas Bangalter et Guy-Manuel de Homem-Christo, séparés en 2021.', ''],
    [M, 'Classique', 3, 'ESTIMATION', 'Combien de symphonies Beethoven a-t-il achevées ?', '9', 'symphonies', '0', '', 'La 9e contient « L\'Hymne à la joie », devenu l\'hymne européen.', ''],
    [M, 'Festivals', 3, 'QCM', 'Quel grand festival de musique se tient chaque été à Carhaix, en Bretagne ?', 'Les Vieilles Charrues', 'Les Eurockéennes', 'Rock en Seine', 'Le Printemps de Bourges', '', ''],
    [M, 'Chanson française', 3, 'QCM', 'Qui a écrit et chanté « Ne me quitte pas » ?', 'Jacques Brel', 'Charles Aznavour', 'Georges Brassens', 'Léo Ferré', 'Chanson de 1959.', ''],

    [M, 'Instruments', 4, 'QCM', 'De quel instrument joue le célèbre musicien Yo-Yo Ma ?', 'Du violoncelle', 'Du violon', 'Du piano', 'De la contrebasse', '', ''],
    [M, 'Classique', 4, 'QCM', 'Quel compositeur a écrit le « Boléro » ?', 'Maurice Ravel', 'Claude Debussy', 'Erik Satie', 'Hector Berlioz', 'En 1928. L\'une des œuvres françaises les plus jouées au monde.', ''],
    [M, 'Culture', 4, 'ESTIMATION', 'En quelle année la Fête de la musique a-t-elle été créée en France ?', '1982', '', '2', '', 'À l\'initiative de Jack Lang et Maurice Fleuret.', 'Au début des années 80.'],
    [M, 'Pop-rock', 4, 'VF', 'Freddie Mercury est né à Zanzibar.', 'Vrai', '', '', '', 'Né Farrokh Bulsara en 1946, sur l\'île de Zanzibar (Tanzanie actuelle).', ''],
    [M, 'Chanson française', 4, 'QCM', 'Quel était le vrai nom de Johnny Hallyday ?', 'Jean-Philippe Smet', 'Jean-Pierre Smet', 'Jacques Smet', 'Jean-Paul Hallier', '', ''],
    [M, 'Pop-rock', 4, 'QCM', 'Quel groupe a sorti l\'album « The Dark Side of the Moon » ?', 'Pink Floyd', 'Genesis', 'Yes', 'The Doors', 'Sorti en 1973, l\'un des albums les plus vendus de l\'histoire.', ''],

    [M, 'Opéra', 5, 'QCM', 'Quel compositeur a écrit l\'opéra « Carmen » ?', 'Georges Bizet', 'Giuseppe Verdi', 'Giacomo Puccini', 'Charles Gounod', 'Créé à Paris en 1875.', ''],
    [M, 'Instruments', 5, 'ESTIMATION', 'Combien de touches compte un piano standard ?', '88', 'touches', '0', '', '52 blanches et 36 noires.', ''],
    [M, 'Classique', 5, 'ORDRE', 'Classez ces compositeurs selon leur date de naissance.', 'Bach | Mozart | Beethoven | Debussy', 'Du plus ancien au plus récent', '', '', '1685, 1756, 1770, 1862.', ''],
    [M, 'Culture', 5, 'VF', '« La Marseillaise » a été composée à Marseille.', 'Faux', '', '', '', 'Composée à Strasbourg en 1792 par Rouget de Lisle, elle doit son nom aux volontaires marseillais.', ''],
    [M, 'Jazz', 5, 'QCM', 'Quel jazzman était surnommé « Satchmo » ?', 'Louis Armstrong', 'Duke Ellington', 'Miles Davis', 'Charlie Parker', '', ''],
    [M, 'Classique', 5, 'QCM', 'Vers quel âge Mozart aurait-il composé ses premières œuvres ?', '5 ans', '10 ans', '3 ans', '12 ans', 'Des petites pièces pour clavier, notées par son père Leopold.', ''],
  ];
}
