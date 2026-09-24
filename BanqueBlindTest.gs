/**
 * Banque de questions — thèmes « Blind test musique » et « Blind test cinéma » (extraits YouTube de 15 s)
 * Format : [thème, catégorie, difficulté, type, question, réponse, choix2, choix3, choix4, explication, indices MJ, lien YouTube, début (s), durée (s)]
 *
 * Tous les liens ont été vérifiés (vidéo existante et lecture intégrée autorisée) en septembre 2026.
 * Le début de l'extrait est une estimation : utilise « 🎧 Tester l'extrait » et ajuste la colonne « Début média » si besoin.
 */
function banqueBlindTest_() {
  // Deux thèmes distincts : ils apparaissent séparément dans la préparation et dans le classement par thème
  const M = 'Blind test musique', C = 'Blind test cinéma';
  const yt = id => 'https://www.youtube.com/watch?v=' + id;
  const TITRE = '🎵 Quel est ce titre ?';
  const FILM = '🎬 De quel film vient cette musique ?';
  const ANNEE = '🎵 En quelle année est sorti ce titre ?';
  const COMPO = '🎼 Qui a composé cette musique de film ?';
  return [
    // ---------------- MUSIQUE : international ----------------
    [M, 'International', 1, 'QCM', TITRE, 'Queen – Bohemian Rhapsody', 'Queen – We Will Rock You', 'Elton John – Rocket Man', 'David Bowie – Heroes', 'Sorti en 1975 : près de 6 minutes, sans refrain.', '', yt('fJ9rUzIMcZQ'), 0, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Michael Jackson – Billie Jean', 'Prince – Kiss', 'Lionel Richie – All Night Long', 'Stevie Wonder – Superstition', 'Extrait de l\'album « Thriller » (1982), le plus vendu de l\'histoire.', '', yt('Zi_XLOBDo_Y'), 5, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Luis Fonsi – Despacito', 'Enrique Iglesias – Bailando', 'J Balvin – Mi Gente', 'Shakira – Chantaje', 'Sorti en 2017, avec Daddy Yankee.', '', yt('kJQP7kiw5Fk'), 20, 15],
    [M, 'International', 1, 'QCM', TITRE, 'PSY – Gangnam Style', 'BTS – Dynamite', 'Blackpink – DDU-DU DDU-DU', 'LMFAO – Party Rock Anthem', 'En 2012, première vidéo à dépasser le milliard de vues sur YouTube.', '', yt('9bZkp7q19f0'), 0, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Ed Sheeran – Shape of You', 'Shawn Mendes – Treat You Better', 'Charlie Puth – Attention', 'Sam Smith – Too Good at Goodbyes', '2017.', '', yt('JGwWNGJdvx8'), 10, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Europe – The Final Countdown', 'Survivor – Eye of the Tiger', 'Van Halen – Jump', 'Bon Jovi – Livin\' on a Prayer', 'Groupe suédois, 1986.', '', yt('9jK-NcRmVcw'), 0, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Britney Spears – …Baby One More Time', 'Christina Aguilera – Genie in a Bottle', 'Spice Girls – Wannabe', 'Backstreet Boys – I Want It That Way', 'Premier single de Britney, en 1998.', '', yt('C-u5WLJ9Yk4'), 10, 15],
    [M, 'International', 1, 'QCM', TITRE, 'ABBA – Dancing Queen', 'Boney M. – Rasputin', 'Bee Gees – How Deep Is Your Love', 'Donna Summer – Hot Stuff', '1976.', '', yt('xFrGuyw1V8s'), 0, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Village People – Y.M.C.A.', 'Boney M. – Daddy Cool', 'Gloria Gaynor – I Will Survive', 'Kool & The Gang – Celebration', '1978.', '', yt('CS9OO0S5w2k'), 5, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Gloria Gaynor – I Will Survive', 'Donna Summer – I Feel Love', 'Diana Ross – I\'m Coming Out', 'Sister Sledge – We Are Family', '1978, hymne disco.', '', yt('FHhZPp08s74'), 0, 15],
    [M, 'International', 1, 'QCM', TITRE, 'Pharrell Williams – Happy', 'Justin Timberlake – Can\'t Stop the Feeling!', 'Bruno Mars – Treasure', 'Maroon 5 – Moves Like Jagger', 'Écrit pour le film « Moi, moche et méchant 2 » (2013).', '', yt('ZbZSe6N_BXs'), 0, 15],

    [M, 'International', 2, 'QCM', TITRE, 'Rick Astley – Never Gonna Give You Up', 'Bananarama – Venus', 'Dead or Alive – You Spin Me Round', 'Wham! – Wake Me Up Before You Go-Go', '1987. Devenu le célèbre « Rickroll » sur Internet.', '', yt('dQw4w9WgXcQ'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'a-ha – Take On Me', 'Duran Duran – Rio', 'Depeche Mode – Just Can\'t Get Enough', 'Tears for Fears – Shout', 'Groupe norvégien, 1985. Clip mythique en dessin crayonné.', '', yt('djV11Xbc914'), 45, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Nirvana – Smells Like Teen Spirit', 'Pearl Jam – Alive', 'Red Hot Chili Peppers – Give It Away', 'The Offspring – Self Esteem', '1991, hymne du grunge.', '', yt('hTWKbfoikeg'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Mark Ronson ft. Bruno Mars – Uptown Funk', 'Bruno Mars – 24K Magic', 'Pharrell Williams – Happy', 'Justin Timberlake – Can\'t Stop the Feeling!', '2014.', '', yt('OPf0YbXqDm0'), 5, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Adele – Rolling in the Deep', 'Amy Winehouse – Rehab', 'Duffy – Mercy', 'Florence + The Machine – Dog Days Are Over', '2010, album « 21 ».', '', yt('rYEDA3JcQqw'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Daft Punk – Get Lucky', 'Pharrell Williams – Happy', 'Chic – Le Freak', 'Robin Thicke – Blurred Lines', '2013, avec Pharrell Williams et Nile Rodgers.', '', yt('5NV6Rdv1a3I'), 30, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Oasis – Wonderwall', 'Blur – Song 2', 'The Verve – Bitter Sweet Symphony', 'Radiohead – Creep', '1995, rivalité Oasis / Blur.', '', yt('bx1Bh8ZvH84'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Coldplay – Viva la Vida', 'Imagine Dragons – Radioactive', 'OneRepublic – Counting Stars', 'Keane – Somewhere Only We Know', '2008.', '', yt('dvgZkm1xWPE'), 5, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Guns N\' Roses – Sweet Child O\' Mine', 'Bon Jovi – It\'s My Life', 'AC/DC – Back in Black', 'Aerosmith – Dream On', '1987. Le riff d\'intro de Slash est culte.', '', yt('1w7OgIMMRc4'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Avicii – Wake Me Up', 'Avicii – Hey Brother', 'Kygo – Firestone', 'Calvin Harris – Summer', '2013.', '', yt('IcrbM1l_BoI'), 45, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Lady Gaga – Bad Romance', 'Lady Gaga – Just Dance', 'Katy Perry – Firework', 'Rihanna – Only Girl (In the World)', '2009.', '', yt('qrO4YZeyl0I'), 60, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Eminem – Without Me', 'Eminem – The Real Slim Shady', '50 Cent – In da Club', 'Dr. Dre – Still D.R.E.', '2002.', '', yt('YVkUvmDQ3HY'), 5, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Linkin Park – In the End', 'Linkin Park – Numb', 'Evanescence – Bring Me to Life', 'Papa Roach – Last Resort', '2001.', '', yt('eVTXPUF4Oz4'), 0, 15],
    [M, 'International', 2, 'QCM', TITRE, 'The Weeknd – Blinding Lights', 'The Weeknd – Save Your Tears', 'Dua Lipa – Don\'t Start Now', 'Harry Styles – As It Was', 'Fin 2019. L\'un des titres les plus écoutés de l\'histoire du streaming.', '', yt('4NRXx6U8ABQ'), 30, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Shakira – Waka Waka (This Time for Africa)', 'K\'naan – Wavin\' Flag', 'Ricky Martin – La Copa de la Vida', 'Pitbull – We Are One (Ole Ola)', 'Chanson officielle de la Coupe du monde 2010.', '', yt('pRpeEdMmmQ0'), 30, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Imagine Dragons – Believer', 'Imagine Dragons – Thunder', 'OneRepublic – Counting Stars', 'X Ambassadors – Renegades', '2017.', '', yt('7wtfhZwyrcc'), 30, 15],
    [M, 'International', 2, 'QCM', TITRE, 'Coldplay – Yellow', 'Travis – Why Does It Always Rain on Me?', 'Snow Patrol – Chasing Cars', 'Keane – Everybody\'s Changing', '2000, premier grand succès du groupe.', '', yt('yKNxeF4KMsY'), 0, 15],

    [M, 'International', 3, 'QCM', TITRE, 'Toto – Africa', 'Journey – Separate Ways', 'Foreigner – I Want to Know What Love Is', 'Chicago – Hard to Say I\'m Sorry', '1982.', '', yt('FTQbiNvZqaY'), 75, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Daft Punk – One More Time', 'Modjo – Lady (Hear Me Tonight)', 'Stardust – Music Sounds Better with You', 'Cassius – Feeling for You', '2000, emblème de la « French Touch ».', '', yt('FGBhQbmPwH8'), 5, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Beyoncé – Single Ladies (Put a Ring on It)', 'Beyoncé – Crazy in Love', 'Rihanna – Umbrella', 'Destiny\'s Child – Survivor', '2008. Chorégraphie en noir et blanc devenue culte.', '', yt('4m1EFMoRFvY'), 5, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Gotye – Somebody That I Used to Know', 'Foster the People – Pumped Up Kicks', 'MGMT – Kids', 'Of Monsters and Men – Little Talks', '2011, avec Kimbra.', '', yt('8UVNT4wvIGY'), 0, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Billie Eilish – bad guy', 'Billie Eilish – Ocean Eyes', 'Lorde – Royals', 'Olivia Rodrigo – good 4 u', '2019, coécrit avec son frère Finneas.', '', yt('DyDfgMOUjCI'), 0, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Journey – Don\'t Stop Believin\'', 'Boston – More Than a Feeling', 'REO Speedwagon – Keep On Loving You', 'Styx – Mr. Roboto', '1981.', '', yt('1k8craCGpgs'), 0, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Rihanna – Umbrella', 'Rihanna – Diamonds', 'Beyoncé – Irreplaceable', 'Ciara – Goodies', '2007, avec Jay-Z.', '', yt('CvBfHwUxHIk'), 60, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Katy Perry – Roar', 'Katy Perry – Firework', 'Kesha – Tik Tok', 'Sia – Chandelier', '2013.', '', yt('CevxZvSJLk8'), 60, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Tones and I – Dance Monkey', 'Sia – Cheap Thrills', 'Dua Lipa – New Rules', 'Lewis Capaldi – Someone You Loved', '2019. Artiste australienne.', '', yt('q0hyYWKXF0Q'), 30, 15],
    [M, 'International', 3, 'QCM', TITRE, 'Avicii – Levels', 'Swedish House Mafia – Don\'t You Worry Child', 'David Guetta – Titanium', 'Martin Garrix – Animals', '2011.', '', yt('_ovdm2yX4MA'), 50, 15],
    [M, 'Années', 3, 'ESTIMATION', ANNEE, '1975', '', '2', '', 'Queen – Bohemian Rhapsody (1975).', 'Queen – Bohemian Rhapsody', yt('fJ9rUzIMcZQ'), 0, 15],
    [M, 'Années', 3, 'ESTIMATION', ANNEE, '2012', '', '1', '', 'PSY – Gangnam Style (2012).', 'PSY – Gangnam Style', yt('9bZkp7q19f0'), 0, 15],
    [M, 'Années', 4, 'ESTIMATION', ANNEE, '1991', '', '2', '', 'Nirvana – Smells Like Teen Spirit (1991).', 'Nirvana – Smells Like Teen Spirit', yt('hTWKbfoikeg'), 0, 15],
    [M, 'Années', 4, 'ESTIMATION', ANNEE, '1976', '', '2', '', 'ABBA – Dancing Queen (1976).', 'ABBA – Dancing Queen', yt('xFrGuyw1V8s'), 0, 15],
    [M, 'Années', 4, 'ESTIMATION', ANNEE, '1987', '', '2', '', 'Rick Astley – Never Gonna Give You Up (1987).', 'Rick Astley', yt('dQw4w9WgXcQ'), 0, 15],

    // ---------------- MUSIQUE : chanson française ----------------
    [M, 'Chanson française', 1, 'QCM', TITRE, 'Stromae – Alors on danse', 'Bob Sinclar – Love Generation', 'David Guetta – Memories', 'Martin Solveig – Hello', '2009. Stromae est belge.', '', yt('VHoT4N43jK8'), 10, 15],
    [M, 'Chanson française', 1, 'QCM', TITRE, 'Édith Piaf – Non, je ne regrette rien', 'Édith Piaf – La Vie en rose', 'Charles Aznavour – La Bohème', 'Barbara – L\'Aigle noir', '1960.', '', yt('4r454dad7tc'), 0, 15],
    [M, 'Chanson française', 1, 'QCM', TITRE, 'Johnny Hallyday – Allumer le feu', 'Johnny Hallyday – Que je t\'aime', 'Téléphone – Un autre monde', 'Noir Désir – Le vent nous portera', '1998.', '', yt('s3O1Xro7oAI'), 20, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Stromae – Papaoutai', 'Maître Gims – Est-ce que tu m\'aimes ?', 'Black M – Sur ma route', 'Kendji Girac – Color Gitano', '2013.', '', yt('oiKj0Z_Xnjc'), 45, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Indila – Dernière danse', 'Zaz – Je veux', 'Louane – Jour 1', 'Tal – Le passé', '2013.', '', yt('K5KAc5CoCuk'), 40, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Aya Nakamura – Djadja', 'Aya Nakamura – Pookie', 'Dadju – Reine', 'Wejdene – Anissa', '2018.', '', yt('iPGgnzc34tY'), 20, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Michel Sardou – Les lacs du Connemara', 'Michel Sardou – La maladie d\'amour', 'Johnny Hallyday – Que je t\'aime', 'Michel Delpech – Le Loir-et-Cher', '1981, incontournable des fins de soirée.', '', yt('bpEmjxobvbY'), 0, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Claude François – Alexandrie Alexandra', 'Claude François – Cette année-là', 'Sheila – Spacer', 'Dalida – Gigi l\'amoroso', '1977.', '', yt('ZRaOzXS1slI'), 0, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Céline Dion – Pour que tu m\'aimes encore', 'Céline Dion – S\'il suffisait d\'aimer', 'Lara Fabian – Je t\'aime', 'Patricia Kaas – Mon mec à moi', '1995, écrit par Jean-Jacques Goldman.', '', yt('AzaTyxMduH4'), 30, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Zaz – Je veux', 'Zaz – On ira', 'Carla Bruni – Quelqu\'un m\'a dit', 'Camille – Ta douleur', '2010.', '', yt('0TFNGRYMz1U'), 20, 15],
    [M, 'Chanson française', 2, 'QCM', TITRE, 'Kendji Girac – Andalouse', 'Kendji Girac – Color Gitano', 'Gipsy Kings – Bamboléo', 'Claudio Capéo – Un homme debout', '2014, après sa victoire à The Voice.', '', yt('FndmvPkI1Ms'), 20, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Angèle – Balance ton quoi', 'Angèle – Tout oublier', 'Clara Luciani – La grenade', 'Pomme – Les oiseaux', '2019.', 'Le clip commence par un sketch : régler le début si besoin.', yt('Hi7Rx3En7-k'), 70, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Jean-Jacques Goldman – Encore un matin', 'Jean-Jacques Goldman – Je te donne', 'Francis Cabrel – Je l\'aime à mourir', 'Daniel Balavoine – L\'Aziza', '1984.', '', yt('QdCfruTbumU'), 10, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Dalida – Laissez-moi danser', 'Dalida – Paroles, paroles', 'Sheila – Spacer', 'Jeanne Mas – Toute première fois', '1979.', '', yt('Vho3PPiVu80'), 20, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Louane – Jour 1', 'Louane – Avenir', 'Vitaa – Game Over', 'Tal – À l\'international', '2015.', '', yt('yleB8fUXudw'), 20, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Christophe Maé – Il est où le bonheur', 'Christophe Maé – On s\'attache', 'Vianney – Pas là', 'Kids United – On écrit sur les murs', '2016.', '', yt('m5qXr9lLdwA'), 30, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Vianney – Je m\'en vais', 'Vianney – Pas là', 'Bigflo & Oli – Dommage', 'Julien Doré – Le lac', '2016.', '', yt('eLYyCFuPCX8'), 20, 15],
    [M, 'Chanson française', 3, 'QCM', TITRE, 'Soprano – À la vie à l\'amour', 'Soprano – Cosmo', 'Black M – Sur ma route', 'Kendji Girac – Tiago', '', '', yt('CEGZbjl9J98'), 20, 15],
    [M, 'Chanson française', 4, 'QCM', TITRE, 'Les Rita Mitsouko – Marcia Baila', 'Indochine – L\'aventurier', 'Étienne Daho – Week-end à Rome', 'Taxi Girl – Cherchez le garçon', '1984, hommage à la danseuse Marcia Moretto.', '', yt('1zWlnzFXcKY'), 20, 15],

    // ---------------- CINÉMA : musiques de films ----------------
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Star Wars', 'Star Trek', 'Superman', 'E.T. l\'extra-terrestre', 'Musique de John Williams (1977).', '', yt('ZSthLmvh6Fk'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Harry Potter', 'Le Seigneur des anneaux', 'Le Monde de Narnia', 'Le Hobbit', '« Hedwig\'s Theme », composé par John Williams (2001).', '', yt('wtHra9tFISY'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Pirates des Caraïbes', 'Gladiator', 'Le Masque de Zorro', 'Hook', '« He\'s a Pirate », de Klaus Badelt et Hans Zimmer (2003).', '', yt('dFBBKfw59kA'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Mission : Impossible', 'James Bond', 'Jason Bourne', 'Ocean\'s Eleven', 'Thème de Lalo Schifrin, créé pour la série télé de 1966.', '', yt('XAYhNHhxN0A'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'La Panthère rose', 'Arrête-moi si tu peux', 'Inspecteur Gadget', 'Le Grand Blond avec une chaussure noire', 'Henry Mancini, 1963.', '', yt('wDoDYEFIMas'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Le Roi lion', 'Le Livre de la jungle', 'Tarzan', 'Madagascar', '« Hakuna Matata », 1994.', '', yt('D6h-RxIP7wM'), 20, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Titanic', 'Pearl Harbor', 'Bodyguard', 'Ghost', '« My Heart Will Go On » de Céline Dion (1997).', '', yt('9bFHsd3o1w0'), 5, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'La Reine des neiges', 'Raiponce', 'Vaiana', 'Encanto', '« Libérée, délivrée » (2013).', '', yt('vzgInDxzyGU'), 58, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'James Bond', 'Mission : Impossible', 'OSS 117', 'Austin Powers', 'Le « James Bond Theme », depuis « James Bond 007 contre Dr No » (1962).', '', yt('J9-cDa4JCwM'), 5, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'SOS Fantômes', 'Beetlejuice', 'Gremlins', 'Retour vers le futur', '« Ghostbusters » de Ray Parker Jr. (1984).', '', yt('TaV1r341wYk'), 0, 15],
    [C, 'Musiques de films', 1, 'QCM', FILM, 'Grease', 'La Fièvre du samedi soir', 'Hairspray', 'Fame', '« You\'re the One That I Want », John Travolta et Olivia Newton-John (1978).', '', yt('7oKPYe53h78'), 10, 15],
    [C, 'Musiques de films', 1, 'QCM', '🎬 Cette chanson est la bande originale de quel film ?', 'Rocky III', 'Karaté Kid', 'Top Gun', 'Over the Top', '« Eye of the Tiger » de Survivor (1982).', '', yt('btPJPFnesV4'), 0, 15],

    [C, 'Musiques de films', 2, 'QCM', FILM, 'Les Dents de la mer', 'Psychose', 'Alien', 'Orca', 'Deux notes de John Williams qui font encore peur (1975).', '', yt('BePfzCOMRZQ'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Indiana Jones', 'À la poursuite du diamant vert', 'La Momie', 'Allan Quatermain', '« Raiders March », John Williams (1981).', '', yt('bC77czRbjd0'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Retour vers le futur', 'Qui veut la peau de Roger Rabbit ?', 'Les Goonies', 'Chérie, j\'ai rétréci les gosses', 'Alan Silvestri (1985).', '', yt('e8TZbze72Bc'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Les Choristes', 'Le Cercle des poètes disparus', 'La Guerre des boutons', 'Le Petit Nicolas', '« Vois sur ton chemin », Bruno Coulais (2004).', '', yt('aSO5fQTmHNY'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Rocky', 'Karaté Kid', 'Raging Bull', 'Million Dollar Baby', '« Gonna Fly Now », Bill Conti (1976).', '', yt('AxWejrVYcCg'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'The Greatest Showman', 'La La Land', 'Moulin Rouge', 'Mamma Mia !', '« This Is Me » (2017).', '', yt('wEJd2RyGm8Q'), 70, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Top Gun', 'Footloose', 'Rocky IV', 'Le Flic de Beverly Hills', '« Danger Zone » de Kenny Loggins (1986).', '', yt('siwpn14IE7E'), 20, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Dirty Dancing', 'Flashdance', 'Footloose', 'Grease', '« (I\'ve Had) The Time of My Life » (1987).', '', yt('4BQLE_RrTSU'), 30, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Shrek', 'L\'Âge de glace', 'Madagascar', 'Kung Fu Panda', '« All Star » de Smash Mouth (2001).', '', yt('L_jWHffIx5E'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Encanto', 'Coco', 'Vaiana', 'Raya et le Dernier Dragon', '« We Don\'t Talk About Bruno » (2021).', '', yt('bvWRMAU6V-c'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Vaiana', 'La Reine des neiges', 'Raiponce', 'Encanto', '« How Far I\'ll Go » (« Le Bleu Lumière » en français), 2016.', '', yt('cPAbx5kgCJo'), 30, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'La Fièvre du samedi soir', 'Grease', 'Flashdance', 'Boogie Nights', '« Stayin\' Alive » des Bee Gees (1977).', '', yt('I_izvAbhExY'), 0, 15],
    [C, 'Musiques de films', 2, 'QCM', FILM, 'Bodyguard', 'Titanic', 'Ghost', 'Pretty Woman', '« I Will Always Love You » de Whitney Houston (1992).', '', yt('3JWTaaS7LdU'), 0, 15],

    [C, 'Musiques de films', 3, 'QCM', FILM, 'Le Bon, la Brute et le Truand', 'Il était une fois dans l\'Ouest', 'Pour une poignée de dollars', 'Django', 'Ennio Morricone (1966).', '', yt('LOgNkvinYKg'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Le Fabuleux Destin d\'Amélie Poulain', 'Le Grand Bleu', 'La Haine', 'Intouchables', '« Comptine d\'un autre été », Yann Tiersen (2001).', '', yt('znfYwABeSZ0'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Le Parrain', 'Les Affranchis', 'Scarface', 'Il était une fois en Amérique', 'Nino Rota (1972).', '', yt('AJgE_dLWsuQ'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Gladiator', 'Troie', 'Braveheart', 'Le Dernier Samouraï', '« Now We Are Free », Hans Zimmer et Lisa Gerrard (2000).', '', yt('ghxzLw2wRis'), 30, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Le Seigneur des anneaux', 'Harry Potter', 'Le Monde de Narnia', 'Willow', '« Concerning Hobbits », Howard Shore (2001).', '', yt('CL_3mlOPnGI'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Top Gun', 'Le Flic de Beverly Hills', 'Tonnerre de feu', 'Jours de tonnerre', '« Top Gun Anthem », Harold Faltermeyer (1986).', '', yt('xeQUxNf3G6k'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Pulp Fiction', 'Kill Bill', 'Reservoir Dogs', 'Taxi', '« Misirlou » de Dick Dale (1994).', '', yt('jtkcM7lerFM'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Footloose', 'Flashdance', 'Dirty Dancing', 'Fame', 'Kenny Loggins (1984).', '', yt('ltrMfT4Qz5Y'), 10, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Flashdance', 'Fame', 'Footloose', 'Staying Alive', '« What a Feeling » d\'Irene Cara (1983).', '', yt('ILWSp0m9G2U'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Armageddon', 'Deep Impact', 'Independence Day', 'Pearl Harbor', '« I Don\'t Want to Miss a Thing » d\'Aerosmith (1998).', '', yt('JkK8g6FMEXE'), 20, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'A Star Is Born', 'La La Land', 'Bohemian Rhapsody', 'Rocketman', '« Shallow », Lady Gaga et Bradley Cooper (2018).', '', yt('bo_efYhYU2A'), 75, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'La La Land', 'The Greatest Showman', 'Whiplash', 'Chantons sous la pluie', '« City of Stars » (2016).', '', yt('GTWqwSNQCcg'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Le Flic de Beverly Hills', 'L\'Arme fatale', '48 heures', 'Top Gun', '« Axel F » d\'Harold Faltermeyer (1984).', '', yt('Qx2gvHjNhQ0'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Moi, moche et méchant 2', 'Les Minions', 'Shrek 2', 'Le Lorax', '« Happy » de Pharrell Williams (2013).', '', yt('ZbZSe6N_BXs'), 0, 15],
    [C, 'Musiques de films', 3, 'QCM', FILM, 'Skyfall', 'Casino Royale', 'Spectre', 'Quantum of Solace', 'Chanté par Adele, Oscar de la meilleure chanson (2013).', '', yt('DeumyOzKqgI'), 0, 15],
    [C, 'Compositeurs', 3, 'QCM', COMPO, 'John Williams', 'Hans Zimmer', 'Howard Shore', 'Danny Elfman', 'Le thème de Star Wars (1977).', 'C\'est Star Wars.', yt('ZSthLmvh6Fk'), 0, 15],

    [C, 'Musiques de films', 4, 'QCM', FILM, 'Interstellar', 'Inception', 'Gravity', 'Seul sur Mars', 'Hans Zimmer (2014), avec un orgue d\'église.', 'Inception est aussi de Hans Zimmer : piège !', yt('kpz8lpoLvrA'), 0, 15],
    [C, 'Musiques de films', 4, 'QCM', FILM, 'Top Gun', 'Dirty Dancing', 'Ghost', 'Pretty Woman', '« Take My Breath Away » de Berlin (1986).', '', yt('Bx51eegLTY8'), 20, 15],
    [C, 'Compositeurs', 4, 'QCM', COMPO, 'Ennio Morricone', 'Nino Rota', 'Vladimir Cosma', 'Michel Legrand', 'Le Bon, la Brute et le Truand (1966).', '', yt('LOgNkvinYKg'), 0, 15],
    [C, 'Compositeurs', 4, 'QCM', COMPO, 'Yann Tiersen', 'Alexandre Desplat', 'Éric Serra', 'Vladimir Cosma', 'Amélie Poulain (2001).', '', yt('znfYwABeSZ0'), 0, 15],
    [C, 'Compositeurs', 4, 'QCM', COMPO, 'Hans Zimmer', 'John Williams', 'Alan Silvestri', 'James Horner', 'Interstellar (2014).', '', yt('kpz8lpoLvrA'), 0, 15],
    [C, 'Années', 4, 'ESTIMATION', '🎬 En quelle année est sorti le film dont vient cette musique ?', '1997', '', '1', '', 'Titanic (1997).', 'Titanic', yt('9bFHsd3o1w0'), 5, 15],
    [C, 'Années', 5, 'ESTIMATION', '🎬 En quelle année est sorti le film dont vient cette musique ?', '1972', '', '3', '', 'Le Parrain (1972).', 'Le Parrain', yt('AJgE_dLWsuQ'), 0, 15],
    [C, 'Années', 5, 'ESTIMATION', '🎬 En quelle année est sorti le film dont vient cette musique ?', '1966', '', '3', '', 'Le Bon, la Brute et le Truand (1966).', 'Le Bon, la Brute et le Truand', yt('LOgNkvinYKg'), 0, 15],
  ];
}
