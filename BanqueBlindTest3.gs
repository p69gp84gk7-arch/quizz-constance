/**
 * Banque de blind tests (3) — encore plus de musique (des années 50 à 2024) et de répliques de films.
 * Format : comme BanqueBlindTest2.gs (15e valeur = année, pour la colonne « Époque »).
 * Tous les liens ont été vérifiés (vidéo existante et lecture intégrée autorisée) en septembre 2026.
 * Pour les répliques, la phrase peut arriver quelques secondes après le début : ajuste « Début média » avec 🎧 Tester l'extrait.
 */
function banqueBlindTest3_() {
  const M = 'Blind test musique', C = 'Blind test cinéma';
  const I = 'International', F = 'Chanson française';
  const yt = id => 'https://www.youtube.com/watch?v=' + id;
  const TITRE = '🎵 Quel est ce titre ?';
  const REPLIQUE = '🎬 De quel film vient cette réplique ?';
  const m = (cat, diff, id, start, year, rep, c2, c3, c4, expl) =>
    [M, cat, diff, 'QCM', TITRE, rep, c2, c3, c4, expl || String(year) + '.', '', yt(id), start, 15, year];
  const f = (cat, diff, id, start, year, q, rep, c2, c3, c4, expl, ind) =>
    [C, cat, diff, 'QCM', q, rep, c2, c3, c4, expl, ind || '', yt(id), start, 15, year];

  return [
    // ================= MUSIQUE — années 50-60 =================
    m(I, 2, 'ZgdufzXvjqw', 0, 1954, 'Bill Haley & His Comets – Rock Around the Clock', 'Elvis Presley – Hound Dog', 'Little Richard – Tutti Frutti', 'Chuck Berry – Maybellene', 'Enregistré en 1954, il devient le premier tube rock\'n\'roll mondial grâce au film « Graine de violence » (1955).'),
    m(I, 2, 'MMmljYkdr-w', 0, 1956, 'Elvis Presley – Hound Dog', 'Elvis Presley – Jailhouse Rock', 'Bill Haley – Rock Around the Clock', 'Jerry Lee Lewis – Great Balls of Fire', '1956. Ses déhanchés à la télévision ont choqué l\'Amérique : on ne le filmait plus qu\'au-dessus de la ceinture.'),
    m(I, 3, 'apBWI6xrbLY', 0, 1966, 'The Beach Boys – Good Vibrations', 'The Beach Boys – Surfin\' U.S.A.', 'The Mamas & the Papas – California Dreamin\'', 'The Byrds – Mr. Tambourine Man', '1966. Brian Wilson a passé des mois en studio : l\'un des singles les plus chers de son époque.'),
    m(I, 3, 'qoX6AKuYWL8', 0, 1967, 'The Doors – Light My Fire', 'The Doors – Riders on the Storm', 'Jefferson Airplane – Somebody to Love', 'Procol Harum – A Whiter Shade of Pale', '1967. Jim Morrison repose au cimetière du Père-Lachaise, à Paris.'),
    m(I, 2, 'rTVjnBo96Ug', 0, 1968, 'Otis Redding – (Sittin\' On) The Dock of the Bay', 'Ben E. King – Stand by Me', 'Sam Cooke – A Change Is Gonna Come', 'Marvin Gaye – I Heard It Through the Grapevine', 'Sorti en 1968, quelques semaines après la mort d\'Otis Redding dans un accident d\'avion.'),
    m(I, 3, '9Qp_SrTgBBs', 0, 1966, 'Nancy Sinatra – These Boots Are Made for Walkin\'', 'Dusty Springfield – Son of a Preacher Man', 'Cher – Bang Bang', 'Petula Clark – Downtown', '1966. La fille de Frank Sinatra.'),
    m(F, 2, 'oR_SZR_tmxM', 0, 1959, 'Jacques Brel – Ne me quitte pas', 'Jacques Brel – Amsterdam', 'Charles Aznavour – Hier encore', 'Léo Ferré – Avec le temps', '1959. Reprise par Nina Simone, Sting, Céline Dion… et en anglais sous le titre « If You Go Away ».'),
    m(F, 2, 'XSNsjEBrLQQ', 0, 1969, 'Johnny Hallyday – Que je t\'aime', 'Johnny Hallyday – Allumer le feu', 'Johnny Hallyday – Gabrielle', 'Michel Sardou – Les Bals populaires', '1969. Un de ses titres les plus repris en concert, souvent en final.'),
    m(F, 3, 'JIQiGN-vO-g', 0, 1969, 'Serge Gainsbourg & Jane Birkin – Je t\'aime… moi non plus', 'Serge Gainsbourg – La Javanaise', 'Jane Birkin – Ex-fan des sixties', 'Serge Gainsbourg & Brigitte Bardot – Bonnie and Clyde', '1969. Écrite pour Brigitte Bardot, elle a été condamnée par le Vatican et interdite sur plusieurs radios.'),

    // ================= MUSIQUE — années 70 =================
    m(I, 1, 'fNFzfwLM72c', 0, 1977, 'Bee Gees – Stayin\' Alive', 'Bee Gees – Night Fever', 'KC and the Sunshine Band – That\'s the Way', 'Boney M. – Daddy Cool', '1977, BO de « La Fièvre du samedi soir ». Son tempo sert à apprendre le rythme du massage cardiaque !'),
    m(I, 2, 'lXgkuM2NhYI', 0, 1977, 'David Bowie – Heroes', 'David Bowie – Let\'s Dance', 'Iggy Pop – The Passenger', 'Lou Reed – Walk on the Wild Side', '1977, enregistré à Berlin, près du Mur.'),
    m(I, 3, 'Y3ywicffOj4', 0, 1977, 'Fleetwood Mac – Dreams', 'Fleetwood Mac – Go Your Own Way', 'Eagles – Hotel California', 'Blondie – Heart of Glass', '1977, album « Rumours ». Revenu dans les classements en 2020 grâce à une vidéo virale d\'un skateur buvant du jus de canneberge.'),
    m(I, 2, 'aXgSHL7efKg', 0, 1978, 'Chic – Le Freak', 'Sister Sledge – We Are Family', 'Donna Summer – Hot Stuff', 'Kool & The Gang – Celebration', '1978. Nile Rodgers l\'a écrit après s\'être fait refuser l\'entrée du Studio 54.'),
    m(I, 3, 'h0ffIJ7ZO4U', 0, 1978, 'Dire Straits – Sultans of Swing', 'Dire Straits – Money for Nothing', 'The Police – Roxanne', 'Supertramp – Breakfast in America', '1978. Le solo de guitare de Mark Knopfler, joué aux doigts, est légendaire.'),
    m(I, 3, 'kln_bIndDJg', 0, 1979, 'Supertramp – The Logical Song', 'Supertramp – Breakfast in America', 'Electric Light Orchestra – Mr. Blue Sky', 'The Alan Parsons Project – Eye in the Sky', '1979.'),
    m(I, 1, '3GwjfUFyY6M', 0, 1980, 'Kool & The Gang – Celebration', 'Chic – Good Times', 'Earth, Wind & Fire – September', 'The Jacksons – Can You Feel It', '1980. Un incontournable des mariages et des fêtes.'),
    m(F, 2, 'ODti1POj86A', 0, 1971, 'Michel Delpech – Pour un flirt', 'Michel Delpech – Le Loir-et-Cher', 'Gérard Lenorman – La Ballade des gens heureux', 'Joe Dassin – L\'Été indien', '1971.'),
    m(F, 2, 'aW3e2knvaE0', 0, 1975, 'Nino Ferrer – Le Sud', 'Nino Ferrer – Mirza', 'Michel Fugain – Une belle histoire', 'Julien Clerc – Ce n\'est rien', '1975. Il l\'a d\'abord enregistrée en anglais (« South »).'),
    m(F, 3, '-bMGM8P_Uao', 0, 1972, 'Véronique Sanson – Amoureuse', 'Véronique Sanson – Chanson sur ma drôle de vie', 'Françoise Hardy – Message personnel', 'Barbara – L\'Aigle noir', '1972. Reprise en anglais sous le titre « Emotion ».'),
    m(F, 3, 'Eixn4x4mgfI', 0, 1978, 'Julien Clerc – Ma préférence', 'Julien Clerc – Femmes, je vous aime', 'Alain Souchon – J\'ai dix ans', 'Laurent Voulzy – Rockollection', '1978, paroles de Jean-Loup Dabadie.'),
    m(F, 3, '0aWzn5DISm0', 0, 1978, 'Daniel Balavoine – Le Chanteur', 'Daniel Balavoine – SOS d\'un terrien en détresse', 'Michel Berger – Seras-tu là', 'Gérard Blanc – Une autre histoire', '1978, son premier grand succès. Ici en live, 1979.'),
    m(F, 2, '7l7eXx_8DHY', 0, 1980, 'France Gall – Il jouait du piano debout', 'France Gall – Ella, elle l\'a', 'Michel Berger – La Groupie du pianiste', 'Véronique Sanson – Chanson sur ma drôle de vie', '1980, écrit par Michel Berger en hommage à Jerry Lee Lewis.'),

    // ================= MUSIQUE — années 80 =================
    m(I, 1, '4V90AmXnguw', 20, 1982, 'Michael Jackson – Thriller', 'Michael Jackson – Bad', 'Ray Parker Jr. – Ghostbusters', 'Prince – 1999', '1982. Le rire final est celui de l\'acteur Vincent Price, star des films d\'horreur.'),
    m(I, 2, 'TvnYmWpD_T8', 0, 1984, 'Prince – Purple Rain', 'Prince – When Doves Cry', 'Bruce Springsteen – Born in the U.S.A.', 'Bryan Adams – Summer of \'69', '1984, chanson-titre de son film.'),
    m(I, 1, 's__rX_WL100', 0, 1984, 'Madonna – Like a Virgin', 'Madonna – Material Girl', 'Cyndi Lauper – Time After Time', 'Whitney Houston – How Will I Know', '1984. Le clip a été tourné en partie à Venise.'),
    m(I, 2, 'PGNiXGX2nLU', 0, 1984, 'Dead or Alive – You Spin Me Round (Like a Record)', 'Bronski Beat – Smalltown Boy', 'Frankie Goes to Hollywood – Relax', 'Soft Cell – Tainted Love', '1984.'),
    m(I, 3, 'aGCdLKXNF3w', 0, 1985, 'Tears for Fears – Everybody Wants to Rule the World', 'Tears for Fears – Shout', 'Simple Minds – Don\'t You (Forget About Me)', 'Duran Duran – The Reflex', '1985.'),
    m(I, 1, 'lDK9QqIzhwk', 0, 1986, 'Bon Jovi – Livin\' on a Prayer', 'Bon Jovi – It\'s My Life', 'Europe – The Final Countdown', 'Survivor – Eye of the Tiger', '1986.'),
    m(I, 1, 'izGwDsrQ1eQ', 0, 1984, 'George Michael – Careless Whisper', 'Wham! – Last Christmas', 'Spandau Ballet – True', 'Phil Collins – Against All Odds', '1984. George Michael aurait écrit ce riff de saxophone à 17 ans, dans un bus.'),
    m(I, 3, 'wp43OdtAAkM', 0, 1985, 'Kate Bush – Running Up That Hill', 'Kate Bush – Wuthering Heights', 'Eurythmics – Sweet Dreams', 'Tears for Fears – Mad World', '1985. Revenu n°1 en 2022 grâce à la série « Stranger Things ».'),
    m(F, 1, 'Ulay2FvUEd8', 0, 1987, 'Vanessa Paradis – Joe le taxi', 'Vanessa Paradis – Be My Baby', 'Elsa – T\'en va pas', 'Jeanne Mas – Toute première fois', '1987. Elle avait 14 ans.'),
    m(F, 2, 'WkPV51HtLfw', 0, 1986, 'Niagara – L\'Amour à la plage', 'Les Rita Mitsouko – Andy', 'Desireless – Voyage, voyage', 'Début de Soirée – Nuit de folie', '1986.'),
    m(F, 2, 'Rd0n3ZL6MeA', 0, 1985, 'Jean-Pierre Mader – Macumba', 'Images – Les Démons de minuit', 'Gold – Capitaine abandonné', 'Émile et Images – Jusqu\'au bout de la nuit', '1985.'),
    m(F, 3, 'y7Yyrt2I608', 0, 1984, 'Cookie Dingler – Femme libérée', 'Jeanne Mas – En rouge et noir', 'Gilbert Montagné – On va s\'aimer', 'Peter et Sloane – Besoin de rien, envie de toi', '1984. On l\'a souvent prise pour un hymne féministe… c\'est en fait plutôt ironique.'),
    m(F, 3, 'ccSPZZ2AKXY', 0, 1985, 'Partenaire Particulier – Partenaire particulier', 'Jean-Pierre Mader – Macumba', 'Images – Les Démons de minuit', 'Gold – Plus près des étoiles', '1985.'),
    m(F, 2, 'v0eR5lnYuqU', 0, 1983, 'Gilbert Montagné – On va s\'aimer', 'Gilbert Montagné – Sous le soleil des tropiques', 'Philippe Lavil – Il tape sur des bambous', 'Peter et Sloane – Besoin de rien, envie de toi', '1983.'),

    // ================= MUSIQUE — années 90 =================
    m(I, 2, 'Jne9t8sHpUc', 0, 1995, 'Alanis Morissette – Ironic', 'Alanis Morissette – You Oughta Know', 'The Cranberries – Linger', 'Sheryl Crow – All I Wanna Do', '1995.'),
    m(I, 2, 'd73tiBBzvFM', 0, 1992, 'Ace of Base – All That She Wants', 'Ace of Base – The Sign', 'Roxette – The Look', 'Dr. Alban – It\'s My Life', '1992, groupe suédois.'),
    m(I, 2, 'JYIaWeVL1JM', 0, 1992, 'SNAP! – Rhythm Is a Dancer', 'Haddaway – What Is Love', 'Culture Beat – Mr. Vain', '2 Unlimited – No Limit', '1992.'),
    m(I, 2, 'oKOtzIo-uYw', 0, 1996, 'Fugees – Killing Me Softly', 'Lauryn Hill – Doo Wop (That Thing)', 'Mary J. Blige – Family Affair', 'TLC – No Scrubs', '1996, reprise d\'un titre de Roberta Flack (1973).'),
    m(I, 3, 'luwAMFcc2f8', 0, 1997, 'Robbie Williams – Angels', 'Robbie Williams – Feel', 'Take That – Back for Good', 'James Blunt – You\'re Beautiful', '1997.'),
    m(I, 2, 'YlUKcNNmywk', 0, 1999, 'Red Hot Chili Peppers – Californication', 'Red Hot Chili Peppers – Scar Tissue', 'Foo Fighters – Everlong', 'Incubus – Drive', '1999.'),
    m(F, 3, 'MaIDRUp2Luo', 0, 1991, 'Alain Bashung – Osez Joséphine', 'Alain Bashung – Ma petite entreprise', 'Noir Désir – Tostaky', 'Jean-Louis Aubert – Voilà, c\'est fini', '1991.'),
    m(F, 2, 'g-gh2hIRhkc', 0, 1997, 'Florent Pagny – Savoir aimer', 'Florent Pagny – Ma liberté de penser', 'Pascal Obispo – Lucie', 'Patrick Bruel – Place des grands hommes', '1997.'),
    m(F, 2, 'Oh0Dqp8AzL0', 0, 1996, '2Be3 – Partir un jour', 'G-Squad – Raide dingue de toi', 'Worlds Apart – Je te donne', 'Alliage – Te garder près de moi', '1996, le boys band préféré des années Club Dorothée.'),
    m(F, 2, 'tRFUiuXK5Hk', 0, 1999, 'Hélène Ségara – Il y a trop de gens qui t\'aiment', 'Lara Fabian – Je t\'aime', 'Lââm – Chanter pour ceux qui sont loin de chez eux', 'Garou – Seul', '1999.'),
    m(F, 2, '2ifpq0TmDRE', 0, 1988, 'Patricia Kaas – Mon mec à moi', 'Patricia Kaas – Mademoiselle chante le blues', 'Mylène Farmer – Pourvu qu\'elles soient douces', 'Liane Foly – Au fur et à mesure', '1988.'),

    // ================= MUSIQUE — années 2000 =================
    m(I, 2, 'KUmZp8pR1uc', 0, 2006, 'Amy Winehouse – Rehab', 'Amy Winehouse – Back to Black', 'Duffy – Mercy', 'Adele – Chasing Pavements', '2006.'),
    m(I, 2, 'HyHNuVaZJ-k', 0, 2005, 'Gorillaz – Feel Good Inc.', 'Gorillaz – Clint Eastwood', 'The Prodigy – Omen', 'Beck – E-Pro', '2005. Un groupe « virtuel » dessiné par Jamie Hewlett.'),
    m(I, 2, 'gGdGFtwCNBE', 0, 2004, 'The Killers – Mr. Brightside', 'Franz Ferdinand – Take Me Out', 'Kaiser Chiefs – Ruby', 'Arctic Monkeys – I Bet You Look Good on the Dancefloor', '2004. Toujours classé dans le top 100 britannique près de 20 ans plus tard.'),
    m(I, 1, 'YnopHCL1Jk8', 0, 2004, 'O-Zone – Dragostea din tei', 'Las Ketchup – Aserejé', 'Crazy Frog – Axel F', 'Eiffel 65 – Blue (Da Ba Dee)', '2004, groupe moldave. Le « Numa Numa » est devenu l\'un des premiers mèmes d\'Internet.'),
    m(I, 1, '5llcBScGuAE', 0, 2002, 'Las Ketchup – Aserejé', 'O-Zone – Dragostea din tei', 'Shakira – Whenever, Wherever', 'Lou Bega – Mambo No. 5', '2002. Les paroles du refrain imitent (mal) « Rapper\'s Delight » de Sugarhill Gang.'),
    m(I, 3, 'Urdlvw0SSEc', 0, 2001, 'Alicia Keys – Fallin\'', 'Alicia Keys – No One', 'Norah Jones – Don\'t Know Why', 'John Legend – Ordinary People', '2001.'),
    m(F, 2, 'CKUZ-ZIUiwg', 0, 1999, 'Magic System – Premier Gaou', 'Magic System – Magic in the Air', 'Tragédie – Hey Oh', 'Alpha Blondy – Brigadier Sabari', 'Sorti en Côte d\'Ivoire en 1999, un tube en France en 2002.'),
    m(I, 2, 'v0NSeysrDYw', 0, 2005, 'Bob Sinclar – Love Generation', 'Bob Sinclar – World, Hold On', 'David Guetta – Love Is Gone', 'Martin Solveig – Hello', '2005. Son refrain sifflé a fait le tour du monde.'),
    m(F, 2, 'QpbHdIrtpNo', 0, 2000, 'Alizée – Moi… Lolita', 'Alizée – J\'en ai marre !', 'Mylène Farmer – Libertine', 'Lorie – Près de moi', '2000, écrite par Mylène Farmer et Laurent Boutonnat.'),
    m(F, 3, 'xHJoY0oSD_Y', 0, 2005, 'Raphaël – Caravane', 'Raphaël – Et dans 150 ans', 'Bénabar – Le Dîner', 'Calogero – En apesanteur', '2005, plus d\'un million d\'albums vendus.'),
    m(F, 3, 'Iwb6u1Jo1Mc', 0, 2003, 'Mickey 3D – Respire', 'Tryo – L\'hymne de nos campagnes', 'Louise Attaque – J\'t\'emmène au vent', 'Sinsemilia – Tout le bonheur du monde', '2003. Une chanson écologiste devenue un classique des écoles.'),
    m(F, 3, 'NrgcRvBJYBE', 0, 2001, 'Noir Désir – Le vent nous portera', 'Noir Désir – Un jour en France', 'Louise Attaque – Léa', 'Saez – Jeune et con', '2001, avec Manu Chao à la guitare.'),

    // ================= MUSIQUE — années 2010-2020 =================
    m(I, 1, 'fWNaR-rxAic', 0, 2012, 'Carly Rae Jepsen – Call Me Maybe', 'Katy Perry – Teenage Dream', 'Owl City – Good Time', 'Selena Gomez – Love You Like a Love Song', '2012. Justin Bieber l\'a repérée à la radio et l\'a fait signer sur son label.'),
    m(I, 1, 'nfWlot6h_JM', 0, 2014, 'Taylor Swift – Shake It Off', 'Taylor Swift – Blank Space', 'Meghan Trainor – All About That Bass', 'Ariana Grande – Problem', '2014.'),
    m(I, 3, 'nlcIKh6sBtc', 0, 2013, 'Lorde – Royals', 'Lana Del Rey – Video Games', 'Birdy – Wings', 'Halsey – Colors', '2013. Elle avait 16 ans quand la chanson est devenue n°1 aux États-Unis.'),
    m(F, 2, 'rs40yxHjTxQ', 0, 2014, 'Christine and the Queens – Christine', 'Christine and the Queens – Saint Claude', 'Jain – Come', 'Angèle – La Loi de Murphy', '2014.'),
    m(F, 2, 'cmE_aahc448', 0, 2013, 'Julien Doré – Paris-Seychelles', 'Julien Doré – Le Lac', 'Vianney – Pas là', 'Fréro Delavega – Le Chant des sirènes', '2013.'),
    m(F, 2, '59Q_lhgGANc', 0, 2015, 'Jain – Makeba', 'Jain – Come', 'Zaz – Je veux', 'Christine and the Queens – Christine', '2015, hommage à la chanteuse sud-africaine Miriam Makeba.'),
    m(I, 1, 'k2qgadSvNyU', 0, 2017, 'Dua Lipa – New Rules', 'Dua Lipa – Don\'t Start Now', 'Rita Ora – Anywhere', 'Anne-Marie – 2002', '2017.'),
    m(I, 2, 'HCjNJDNzw8Y', 0, 2017, 'Camila Cabello – Havana', 'Shakira – Chantaje', 'Luis Fonsi – Despacito', 'Jennifer Lopez – On the Floor', '2017, avec Young Thug.'),
    m(I, 2, 'r7qovpFAGrQ', 0, 2019, 'Lil Nas X – Old Town Road', 'Lil Nas X – Montero', 'Post Malone – Sunflower', 'Billy Ray Cyrus – Achy Breaky Heart', '2019. Record de 19 semaines n°1 aux États-Unis.'),
    m(I, 2, 'Xg72z08aTXY', 0, 2021, 'Måneskin – Beggin\'', 'Måneskin – Zitti e buoni', 'Imagine Dragons – Enemy', 'The Kid LAROI – Stay', 'Reprise d\'un titre des Four Seasons (1967), sortie en 2017 et devenue un tube mondial en 2021, après leur victoire à l\'Eurovision.'),
    m(I, 1, 'eVli-tstM5E', 0, 2024, 'Sabrina Carpenter – Espresso', 'Chappell Roan – Good Luck, Babe!', 'Dua Lipa – Houdini', 'Billie Eilish – Birds of a Feather', '2024, le tube de l\'été.'),
    m(I, 1, 'ekr2nIex040', 0, 2024, 'ROSÉ & Bruno Mars – APT.', 'Bruno Mars & Lady Gaga – Die with a Smile', 'Blackpink – How You Like That', 'Jungkook – Seven', '2024. « APT. » est le nom d\'un jeu à boire coréen.'),
    m(F, 2, 'hTHmZYC7Zws', 0, 2021, 'Juliette Armanet – Le dernier jour du disco', 'Clara Luciani – Respire encore', 'Angèle – Libre', 'Pomme – Anxiété', '2021.'),
    m(F, 2, 'rXF1Si3LEEU', 0, 2021, 'Orelsan – La Quête', 'Orelsan – Basique', 'Bigflo & Oli – Dommage', 'Nekfeu – On verra', '2021, album « Civilisation ».'),
    m(F, 2, 'tfoOop2HXxQ', 0, 2024, 'Slimane – Mon amour', 'Slimane – Viens on s\'aime', 'Vitaa & Slimane – Avant toi', 'Kendji Girac – Andalouse', '2024, 4e à l\'Eurovision.'),

    // ================= CINÉMA — répliques =================
    f('Répliques', 2, 'LD63P7tFgVY', 0, 1961, REPLIQUE, 'Un taxi pour Tobrouk', 'Les Tontons flingueurs', 'Le Cave se rebiffe', 'Un singe en hiver', '« Deux intellectuels assis vont moins loin qu\'une brute qui marche. » (Lino Ventura, dialogues de Michel Audiard).'),
    f('Répliques', 1, 'e4cOBMrliUw', 0, 1964, REPLIQUE, 'Le Gendarme de Saint-Tropez', 'Le Corniaud', 'La Grande Vadrouille', 'Fantomas', '« Une poule sur un mur qui picore du pain dur… » (Louis de Funès).'),
    f('Répliques', 3, 'P2W4FsDVKMY', 0, 1966, REPLIQUE, 'Le Bon, la Brute et le Truand', 'Il était une fois dans l\'Ouest', 'Pour une poignée de dollars', 'Et pour quelques dollars de plus', '« Tu vois, le monde se divise en deux catégories : ceux qui ont un pistolet chargé et ceux qui creusent. »'),
    f('Répliques', 2, '_sJYrReI3h8', 0, 1971, REPLIQUE, 'La Folie des grandeurs', 'Le Corniaud', 'L\'Aile ou la Cuisse', 'Les Aventures de Rabbi Jacob', '« Il est l\'or, Monseignor ! » (Yves Montand et Louis de Funès).'),
    f('Répliques', 3, 'VduL8gl-4Ag', 0, 1976, REPLIQUE, 'Taxi Driver', 'Raging Bull', 'Le Parrain II', 'Mean Streets', '« C\'est à moi que tu parles ? » (Robert De Niro, devant son miroir).'),
    f('Répliques', 2, 'z6JaWSQpBhw', 0, 1978, REPLIQUE, 'Les Bronzés', 'Les Bronzés font du ski', 'Le Père Noël est une ordure', 'Viens chez moi, j\'habite chez une copine', 'Jean-Claude Dusse (Michel Blanc) tente sa chance sur la plage du Club.', 'Piège : c\'est le premier film (1978), au Club Med en Côte d\'Ivoire.'),
    f('Répliques', 2, 'BfzDf-jG1-8', 0, 1982, REPLIQUE, 'E.T. l\'extra-terrestre', 'Rencontres du troisième type', 'Les Goonies', 'Gremlins', '« E.T. téléphone maison. »', 'La réplique arrive au milieu de l\'extrait : ajuster le début si besoin.'),
    f('Répliques', 3, 'bEXQa4SHv3Y', 60, 1939, REPLIQUE, 'Autant en emporte le vent', 'Casablanca', 'Le Magicien d\'Oz', 'Les Hauts de Hurlevent', '« Franchement, ma chère, c\'est le cadet de mes soucis. » (Clark Gable).', 'Scène finale : ajuster le début si besoin.'),
    f('Répliques', 1, 'rVPqprPvv38', 60, 1994, REPLIQUE, 'Le Roi lion', 'Le Livre de la jungle', 'Tarzan', 'Bambi', '« N\'oublie pas qui tu es. » (Mufasa à Simba).', 'Ajuster le début si besoin.'),
    f('Répliques', 2, 'Ie8Jnbd0VmE', 0, 1997, REPLIQUE, 'Le Cinquième Élément', 'Taxi', 'Léon', 'Nikita', '« Multipass ! » (Leeloo, Milla Jovovich).'),
    f('Répliques', 2, 'qASdcPc9bbc', 0, 1999, REPLIQUE, 'Matrix', 'Inception', 'Minority Report', 'Terminator 2', '« La cuillère n\'existe pas. »'),
    f('Répliques', 2, 'iLQgiqLV7k4', 0, 1999, REPLIQUE, 'Fight Club', 'Seven', 'American Psycho', 'Snatch', '« Première règle du Fight Club : il est interdit de parler du Fight Club. »'),
    f('Répliques', 2, 'z7FXdx2AjMg', 120, 2000, REPLIQUE, 'Gladiator', 'Troie', '300', 'Ben-Hur', '« Mon nom est Maximus Decimus Meridius… » (Russell Crowe).', 'La réplique arrive dans la seconde moitié de l\'extrait : ajuster le début.'),
    f('Répliques', 1, 'Lm2Bi-oCjCc', 0, 2003, REPLIQUE, 'Le Monde de Nemo', 'Le Monde de Dory', 'La Petite Sirène', 'Gang de requins', '« Nage droit devant toi… » (Dory).'),
    f('Répliques', 1, 'pRsxDmxA9Qk', 0, 2004, REPLIQUE, 'Shrek 2', 'Shrek', 'Madagascar', 'L\'Âge de glace', '« On est presque arrivés ? » (l\'Âne).', 'Piège : c\'est le 2e film.'),
    f('Répliques', 2, 'jIux_1zk4m0', 0, 2006, REPLIQUE, '300', 'Gladiator', 'Troie', 'Alexandre', '« Spartiates ! Quel est votre métier ? » (Léonidas).'),
    f('Répliques', 2, 'p1PDgep_LOQ', 50, 2007, REPLIQUE, 'Ratatouille', 'Le Monde de Nemo', 'Les Indestructibles', 'Là-haut', 'La critique d\'Anton Ego : « Tout le monde ne peut pas devenir un grand artiste, mais un grand artiste peut venir de n\'importe où. »', 'Ajuster le début si besoin.'),
    f('Répliques', 2, '_Lq6zUbs4KE', 0, 2008, REPLIQUE, 'Kung Fu Panda', 'Madagascar', 'Dragons', 'Le Chat potté', '« Il n\'y a pas d\'ingrédient secret. »'),
    f('Répliques', 2, 'W1o5qmWKOlY', 0, 2008, REPLIQUE, 'The Dark Knight', 'Batman Begins', 'Joker', 'Suicide Squad', '« Pourquoi cet air si sérieux ? » (le Joker, Heath Ledger).'),
    f('Répliques', 2, '2_m_YZhQENI', 0, 2009, REPLIQUE, 'Avatar', 'Dune', 'Pocahontas', 'Interstellar', '« Je te vois. »'),
    f('Répliques', 1, 'lvrSH_--RJ8', 0, 2009, REPLIQUE, 'Là-haut', 'Toy Story 3', 'Ratatouille', 'Wall-E', '« Écureuil ! » (Doug, le chien qui parle).'),
    f('Répliques', 2, 'Xauo2dr9guo', 0, 2009, REPLIQUE, 'OSS 117 : Rio ne répond plus', 'OSS 117 : Le Caire, nid d\'espions', 'The Artist', 'Le Grand Détournement', '« Comment tu parles de ton père ! » (Jean Dujardin).', 'Piège : c\'est le 2e OSS 117, celui qui se passe au Brésil.'),
  ];
}
