/**
 * Banque de questions « En quelle année… ? » dans tous les thèmes, pour le modèle par années.
 * Ce sont des estimations : selon le réglage de la partie, elles se jouent en réponse libre ou en QCM
 * (4 années proposées, d'autant plus proches que le niveau monte).
 * y(thème, catégorie, difficulté, question, année, tolérance ±, explication, anecdote MJ)
 */
function banqueAnnees_() {
  const y = (th, cat, diff, texte, annee, tol, expl, anec) =>
    [th, cat, diff, 'ESTIMATION', texte, String(annee), '', String(tol), '', expl, '', '', '', '', '', anec || ''];
  const H = 'Histoire', S = 'Sciences', SP = 'Sport', C = 'Cinéma', M = 'Musique', A = 'Arts & Littérature', D = 'Divers', G = 'Géographie', GA = 'Gastronomie';
  return [
    // ---------------- Histoire ----------------
    y(H, 'Dates', 1, 'En quelle année a eu lieu le débarquement en Normandie ?', 1944, 1, 'Le 6 juin 1944, le « D-Day ».', 'Le nom de code de l\'opération était « Overlord ». La météo était si mauvaise que les Allemands ne s\'attendaient pas à une attaque ce jour-là.'),
    y(H, 'Dates', 1, 'En quelle année l\'armistice de la Première Guerre mondiale a-t-il été signé ?', 1918, 1, 'Le 11 novembre 1918, dans un wagon, en forêt de Compiègne.', 'Hitler a exigé que la France signe l\'armistice de 1940 dans le même wagon, au même endroit. Le wagon a ensuite été emmené en Allemagne.'),
    y(H, 'Dates', 2, 'En quelle année Christophe Colomb a-t-il atteint l\'Amérique ?', 1492, 2, 'Le 12 octobre 1492, aux Bahamas.', 'La même année, les rois catholiques achevaient la reconquête de Grenade, en Espagne.'),
    y(H, 'Dates', 2, 'En quelle année Napoléon a-t-il été sacré empereur ?', 1804, 3, 'Le 2 décembre 1804, à Notre-Dame de Paris.', 'Un an jour pour jour plus tard, il remportait la bataille d\'Austerlitz.'),
    y(H, 'Dates', 2, 'En quelle année a eu lieu l\'attentat contre les tours du World Trade Center ?', 2001, 1, 'Le 11 septembre 2001, à New York.', 'Près de 3 000 personnes sont mortes. Un mémorial avec deux bassins occupe aujourd\'hui l\'emplacement des tours.'),
    y(H, 'Dates', 3, 'En quelle année l\'esclavage a-t-il été définitivement aboli en France ?', 1848, 5, 'Grâce au décret porté par Victor Schœlcher, le 27 avril 1848.', 'Une première abolition avait été votée en 1794 pendant la Révolution, puis Napoléon avait rétabli l\'esclavage en 1802.'),
    y(H, 'Dates', 3, 'En quelle année la Ve République a-t-elle été fondée ?', 1958, 2, 'Sa Constitution a été adoptée par référendum le 28 septembre 1958.', 'C\'est la République française qui a duré le plus longtemps après la IIIe (1870-1940).'),
    y(H, 'Dates', 3, 'En quelle année Jeanne d\'Arc a-t-elle délivré Orléans ?', 1429, 10, 'En mai 1429, ce qui lui a valu le surnom de « Pucelle d\'Orléans ».', 'Orléans fête chaque année Jeanne d\'Arc, début mai, depuis 1430 : une des plus anciennes fêtes de France.'),
    y(H, 'Dates', 4, 'En quelle année le Titanic a-t-il coulé ?', 1912, 2, 'Dans la nuit du 14 au 15 avril 1912.', 'Un passager, le boulanger Charles Joughin, aurait survécu plus de deux heures dans l\'eau glacée… en ayant bu beaucoup de whisky.'),
    y(H, 'Dates', 4, 'En quelle année a eu lieu la bataille d\'Hastings, conquête de l\'Angleterre par Guillaume le Conquérant ?', 1066, 10, 'Le duc de Normandie est devenu roi d\'Angleterre.', 'La tapisserie de Bayeux, longue de près de 70 m, raconte la conquête. On y voit la comète de Halley, passée en 1066.'),
    y(H, 'Dates', 5, 'En quelle année Constantinople a-t-elle été prise par les Ottomans ?', 1453, 15, 'Le 29 mai 1453, par le sultan Mehmed II. La ville deviendra Istanbul.', 'On date souvent de cet événement la fin du Moyen Âge. La même année s\'achevait la guerre de Cent Ans.'),

    // ---------------- Sciences ----------------
    y(S, 'Dates', 2, 'En quelle année le premier Spoutnik a-t-il été lancé dans l\'espace ?', 1957, 3, 'Le 4 octobre 1957, par l\'URSS : le premier satellite artificiel.', 'Il émettait un simple « bip-bip » que les radioamateurs du monde entier pouvaient capter. Il ne pesait que 84 kg.'),
    y(S, 'Dates', 3, 'En quelle année Darwin a-t-il publié « De l\'origine des espèces » ?', 1859, 10, 'Le livre expose la théorie de l\'évolution par la sélection naturelle.', 'Le premier tirage (1 250 exemplaires) a été épuisé le jour même de sa sortie.'),
    y(S, 'Dates', 3, 'En quelle année Pierre et Marie Curie ont-ils découvert le radium ?', 1898, 10, 'La même année que le polonium, baptisé en hommage à la Pologne natale de Marie.', 'Ils ont dû traiter plusieurs tonnes de minerai dans un hangar mal chauffé pour obtenir quelques décigrammes de radium.'),
    y(S, 'Dates', 4, 'En quelle année a eu lieu la première greffe du cœur ?', 1967, 5, 'Par le chirurgien sud-africain Christiaan Barnard, au Cap.', 'Le patient, Louis Washkansky, a survécu 18 jours. Il est mort d\'une pneumonie, pas d\'un rejet du cœur.'),
    y(S, 'Dates', 4, 'En quelle année est née la brebis Dolly, premier mammifère cloné à partir d\'une cellule adulte ?', 1996, 3, 'En Écosse, à l\'institut Roslin.', 'Elle a été clonée à partir d\'une cellule de glande mammaire : c\'est pour ça que les chercheurs l\'ont baptisée d\'après la chanteuse Dolly Parton.'),
    y(S, 'Dates', 5, 'En quelle année Galilée a-t-il pointé une lunette vers le ciel et découvert les lunes de Jupiter ?', 1610, 15, 'Il a découvert Io, Europe, Ganymède et Callisto, les « satellites galiléens ».', 'Condamné par l\'Église en 1633 pour avoir défendu que la Terre tourne autour du Soleil, il n\'a été officiellement réhabilité qu\'en 1992.'),

    // ---------------- Sport ----------------
    y(SP, 'Dates', 1, 'En quelle année la France a-t-elle remporté sa deuxième Coupe du monde de football ?', 2018, 1, 'En Russie, 4-2 contre la Croatie en finale.', 'Kylian Mbappé avait 19 ans : il est devenu le deuxième plus jeune buteur d\'une finale après Pelé en 1958.'),
    y(SP, 'Dates', 2, 'En quelle année Paris a-t-il accueilli les Jeux olympiques pour la deuxième fois ?', 1924, 5, 'Après 1900, et avant 2024.', 'Le film « Les Chariots de feu » raconte ces Jeux de 1924. C\'est là que Johnny Weissmuller, futur Tarzan au cinéma, a gagné trois médailles d\'or en natation.'),
    y(SP, 'Dates', 3, 'En quelle année s\'est disputée la première Coupe du monde de rugby ?', 1987, 3, 'En Nouvelle-Zélande et en Australie, remportée par les All Blacks.', 'La France a perdu la finale contre la Nouvelle-Zélande. Seules 16 équipes y participaient, sur invitation.'),
    y(SP, 'Dates', 4, 'En quelle année a eu lieu le tout premier Tour de France ?', 1903, 3, 'Le premier Tour a été gagné par Maurice Garin.', 'Les étapes étaient gigantesques (jusqu\'à plus de 400 km), et on roulait de nuit. Seuls 21 coureurs sur 60 ont terminé.'),
    y(SP, 'Dates', 4, 'En quelle année Yannick Noah a-t-il remporté Roland-Garros ?', 1983, 3, 'Il reste le dernier Français vainqueur du tournoi en simple messieurs.', 'Son père a traversé le court en courant pour le serrer dans ses bras, une image devenue culte.'),
    y(SP, 'Dates', 5, 'En quelle année a été disputé le premier Tournoi des Cinq Nations avec la France ?', 1910, 10, 'La France a rejoint le tournoi des Home Nations (Angleterre, Écosse, Irlande, pays de Galles).', 'La France a gagné son premier match du tournoi en 1911, contre l\'Écosse. L\'Italie est arrivée en 2000, pour former les Six Nations.'),

    // ---------------- Cinéma ----------------
    y(C, 'Dates', 2, 'En quelle année est sorti « Titanic » de James Cameron ?', 1997, 2, 'Avec Leonardo DiCaprio et Kate Winslet.', 'Le film est sorti en décembre 1997 aux États-Unis et en janvier 1998 en France, où il est resté à l\'affiche pendant des mois.'),
    y(C, 'Dates', 2, 'En quelle année est sorti « Le Fabuleux Destin d\'Amélie Poulain » ?', 2001, 2, 'Réalisé par Jean-Pierre Jeunet, avec Audrey Tautou.', 'Il a été nommé à 5 Oscars. Le nain de jardin voyageur a rendu célèbre une vraie blague : envoyer des photos d\'un nain volé posant aux quatre coins du monde.'),
    y(C, 'Dates', 3, 'En quelle année est sorti « Les Tontons flingueurs » ?', 1963, 3, 'Réalisé par Georges Lautner, dialogues de Michel Audiard.', 'À sa sortie, la critique l\'a boudé. Il est devenu culte grâce aux diffusions à la télévision.'),
    y(C, 'Dates', 3, 'En quelle année est sorti « E.T. l\'extra-terrestre » ?', 1982, 2, 'Réalisé par Steven Spielberg.', 'Il a détrôné « Star Wars » comme plus gros succès de l\'histoire du cinéma, avant d\'être dépassé par « Jurassic Park », du même Spielberg.'),
    y(C, 'Dates', 4, 'En quelle année a eu lieu la première cérémonie des Oscars ?', 1929, 5, 'Au Hollywood Roosevelt Hotel, devant environ 270 invités. Elle a duré 15 minutes.', 'Les lauréats étaient connus trois mois à l\'avance. Le mot « Oscar » viendrait d\'une employée qui trouvait que la statuette ressemblait à son oncle Oscar.'),
    y(C, 'Dates', 4, 'En quelle année s\'est tenu le tout premier Festival de Cannes ?', 1946, 3, 'Prévu en 1939, il a été annulé par la guerre et s\'est finalement tenu en septembre 1946.', 'En 1968, le festival a été interrompu en plein milieu par des cinéastes, dont Godard et Truffaut, en soutien aux grèves de Mai 68.'),

    // ---------------- Musique ----------------
    y(M, 'Dates', 2, 'En quelle année a eu lieu le festival de Woodstock ?', 1969, 2, 'En août 1969, dans l\'État de New York.', 'Environ 400 000 personnes sont venues, bien plus que prévu. Jimi Hendrix y a joué un hymne américain saturé resté célèbre.'),
    y(M, 'Dates', 2, 'En quelle année est sorti « Thriller » de Michael Jackson ?', 1982, 2, 'L\'album le plus vendu de l\'histoire.', 'Sept des neuf titres de l\'album sont sortis en single et sont tous entrés dans le top 10 américain.'),
    y(M, 'Dates', 3, 'En quelle année sont morts Claude François et Jacques Brel ?', 1978, 3, 'Claude François en mars, électrocuté dans sa baignoire ; Jacques Brel en octobre, d\'un cancer.', 'Brel est enterré aux îles Marquises, en Polynésie, à quelques mètres du peintre Paul Gauguin.'),
    y(M, 'Dates', 4, 'En quelle année les Beatles se sont-ils séparés ?', 1970, 2, 'Paul McCartney a annoncé son départ en avril 1970.', 'Leur dernier concert public a été donné en 1969… sur le toit de leur maison de disques à Londres, jusqu\'à l\'arrivée de la police.'),
    y(M, 'Dates', 5, 'En quelle année Mozart est-il mort ?', 1791, 10, 'À Vienne, à seulement 35 ans, en pleine composition de son Requiem.', 'Il a été enterré dans une fosse commune, comme la plupart des Viennois à l\'époque : on ne sait pas exactement où reposent ses restes.'),

    // ---------------- Arts & Littérature ----------------
    y(A, 'Dates', 2, 'En quelle année la pyramide du Louvre a-t-elle été inaugurée ?', 1989, 3, 'Dessinée par l\'architecte Ieoh Ming Pei.', 'Elle a été très critiquée à l\'annonce du projet. Elle est aujourd\'hui l\'un des symboles de Paris.'),
    y(A, 'Dates', 3, 'En quelle année a été publié « Les Misérables » de Victor Hugo ?', 1862, 10, 'Hugo l\'a achevé en exil, à Guernesey.', 'Le roman a été publié simultanément dans plusieurs pays, un vrai lancement mondial pour l\'époque.'),
    y(A, 'Dates', 4, 'En quelle année est mort Pablo Picasso ?', 1973, 5, 'À Mougins, dans les Alpes-Maritimes, à 91 ans.', 'Il aurait réalisé environ 50 000 œuvres au cours de sa vie : peintures, dessins, sculptures, céramiques…'),
    y(A, 'Dates', 5, 'En quelle année Molière est-il mort ?', 1673, 10, 'Après une représentation du « Malade imaginaire ».', 'Le fauteuil dans lequel il a joué sa dernière représentation est conservé à la Comédie-Française.'),

    // ---------------- Géographie / Divers / Gastronomie ----------------
    y(G, 'Dates', 3, 'En quelle année le tunnel sous la Manche a-t-il été inauguré ?', 1994, 2, 'Le 6 mai 1994, par la reine Élisabeth II et François Mitterrand.', 'Il mesure environ 50 km, dont 38 sous la mer. Les équipes française et britannique se sont rejointes au milieu en 1990.'),
    y(G, 'Dates', 4, 'En quelle année le canal de Suez a-t-il été inauguré ?', 1869, 5, 'Réalisé sous la direction du Français Ferdinand de Lesseps.', 'Verdi aurait dû écrire un opéra pour l\'inauguration : « Aïda » n\'a finalement été créé au Caire qu\'en 1871.'),
    y(D, 'Dates', 2, 'En quelle année Google a-t-il été fondé ?', 1998, 2, 'Par Larry Page et Sergey Brin, alors étudiants à Stanford.', 'Le nom vient de « googol », le nombre 1 suivi de 100 zéros. Le premier « bureau » était un garage loué en Californie.'),
    y(D, 'Dates', 3, 'En quelle année le Minitel a-t-il été définitivement arrêté en France ?', 2012, 3, 'Le 30 juin 2012, après 30 ans de service.', 'À son apogée, environ 25 millions de Français l\'utilisaient. On y consultait l\'annuaire, les horaires de train… et le « 3615 ».'),
    y(D, 'Dates', 4, 'En quelle année a été créé le premier SMS ?', 1992, 3, 'Envoyé depuis un ordinateur vers un téléphone, au Royaume-Uni.', 'Il disait simplement « Merry Christmas ». Il a été vendu aux enchères en 2021 sous forme de NFT.'),
    y(GA, 'Dates', 3, 'En quelle année est apparu le guide Michelin ?', 1900, 5, 'Distribué gratuitement aux automobilistes pour les inciter à rouler… et à user leurs pneus.', 'Il n\'y avait alors qu\'environ 3 000 voitures en France. Le guide listait surtout des garages, des médecins et des hôtels.'),
    y(GA, 'Dates', 4, 'En quelle année la baguette a-t-elle été inscrite au patrimoine immatériel de l\'Unesco ?', 2022, 1, 'Pour « les savoir-faire artisanaux et la culture de la baguette de pain ».', 'La France produit environ 6 milliards de baguettes par an, soit environ 190 par seconde.'),
  ];
}
