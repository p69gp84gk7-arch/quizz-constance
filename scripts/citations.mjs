/**
 * Nouveau thème « Citations & expressions » : des phrases à compléter.
 *
 * Trois familles, toutes en texte à trou (le mot manquant est remplacé par « … ») :
 *   - proverbes et expressions françaises   → catégorie « Expression »
 *   - répliques et phrases célèbres         → catégorie « Citation »
 *   - sens d'une expression imagée          → catégorie « Sens caché »
 *
 * Le moteur décide tout seul de la forme : QCM tant que la question est facile,
 * réponse au clavier au-delà de 4,5 ★. Rien à régler ici.
 *
 * Usage : node scripts/citations.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);

/* ------------------------------------------------------------------ */
/* 1. Proverbes et expressions à compléter                             */
/*    [phrase avec …, mot manquant, difficulté, explication, 3 leurres]*/
/* ------------------------------------------------------------------ */

const EXPRESSIONS = [
  ['Rien ne sert de courir, il faut partir à …', 'point', 1,
    'La morale du « Lièvre et la Tortue » de La Fontaine : la régularité vaut mieux que la précipitation.',
    ['temps', 'l\'heure', 'l\'aube']],
  ['Petit à petit, l\'oiseau fait son …', 'nid', 1,
    'Proverbe médiéval : les grandes choses se bâtissent par petites touches répétées.',
    ['trou', 'chant', 'chemin']],
  ['L\'habit ne fait pas le …', 'moine', 1,
    'L\'apparence ne dit rien de ce qu\'une personne vaut vraiment ; l\'expression date du XIIIe siècle.',
    ['prêtre', 'roi', 'métier']],
  ['Il ne faut pas vendre la peau de l\'ours avant de l\'avoir …', 'tué', 2,
    'Autre fable de La Fontaine : on ne se réjouit pas d\'un profit qu\'on n\'a pas encore obtenu.',
    ['vu', 'chassé', 'vendu']],
  ['Qui vole un œuf vole un …', 'bœuf', 1,
    'Un petit larcin annonce les grands : le proverbe joue aussi sur la rime entre les deux mots.',
    ['veau', 'champ', 'trésor']],
  ['La nuit porte …', 'conseil', 1,
    'Dormir avant de décider : le sommeil réorganise les idées, ce que la recherche a depuis confirmé.',
    ['bonheur', 'malheur', 'chance']],
  ['Après la pluie, le beau …', 'temps', 1,
    'Les mauvaises passes ne durent pas : l\'expression est attestée en français dès le XIIIe siècle.',
    ['ciel', 'jour', 'soleil']],
  ['Chat échaudé craint l\'eau …', 'froide', 2,
    'Après une mauvaise expérience, on se méfie même de ce qui est inoffensif.',
    ['chaude', 'bouillante', 'claire']],
  ['Tel est pris qui croyait …', 'prendre', 2,
    'Le trompeur devient sa propre victime — encore une morale de La Fontaine, tirée du « Rat et l\'Huître ».',
    ['gagner', 'fuir', 'voler']],
  ['Il n\'y a pas de fumée sans …', 'feu', 1,
    'Toute rumeur aurait un fond de vérité — un raisonnement que les faits démentent pourtant souvent.',
    ['flamme', 'braise', 'cendre']],
  ['C\'est en forgeant qu\'on devient …', 'forgeron', 1,
    'Traduction d\'un proverbe latin : seule la pratique répétée donne la maîtrise.',
    ['habile', 'fort', 'sage']],
  ['Les cordonniers sont toujours les plus mal …', 'chaussés', 2,
    'On néglige chez soi ce qu\'on fait le mieux pour les autres.',
    ['payés', 'compris', 'servis']],
  ['Qui sème le vent récolte la …', 'tempête', 1,
    'Formule biblique (le livre d\'Osée) : les petites violences en provoquent de grandes.',
    ['pluie', 'foudre', 'grêle']],
  ['On ne fait pas d\'omelette sans casser des …', 'œufs', 1,
    'Aucun changement ne se fait sans quelques dégâts : l\'expression apparaît au XIXe siècle.',
    ['assiettes', 'coquilles', 'poêles']],
  ['Mieux vaut tard que …', 'jamais', 1,
    'Arriver en retard reste préférable à ne pas venir du tout ; la formule vient de Tite-Live.',
    ['rien', 'trop tôt', 'demain']],
  ['L\'appétit vient en …', 'mangeant', 1,
    'Popularisée par Rabelais : l\'envie grandit à mesure qu\'on est servi.',
    ['cuisinant', 'attendant', 'travaillant']],
  ['Un tiens vaut mieux que deux tu l\'…', 'auras', 2,
    'Mieux vaut une chose certaine que deux promesses — encore La Fontaine, « Le Petit Poisson et le Pêcheur ».',
    ['espères', 'attends', 'veux']],
  ['Pierre qui roule n\'amasse pas …', 'mousse', 2,
    'Qui change sans cesse de place ne construit rien de durable ; la formule a donné son nom aux Rolling Stones.',
    ['fortune', 'poussière', 'terre']],
  ['Il faut battre le fer pendant qu\'il est …', 'chaud', 1,
    'Agir tant que les circonstances sont favorables : l\'image vient de la forge.',
    ['froid', 'tendre', 'rouge']],
  ['La vérité sort de la bouche des …', 'enfants', 1,
    'Les enfants disent sans détour ce que les adultes taisent ; l\'expression vient des Psaumes.',
    ['sages', 'fous', 'innocents']],
  ['Qui ne risque rien n\'a …', 'rien', 1,
    'Sans prise de risque, aucun gain : le proverbe est attesté en français dès le XVe siècle.',
    ['tout', 'peur', 'raison']],
  ['À cheval donné on ne regarde pas les …', 'dents', 3,
    'On n\'examine pas un cadeau : l\'âge d\'un cheval se lit justement à l\'usure de ses dents.',
    ['sabots', 'yeux', 'pattes']],
  ['Les chiens ne font pas des …', 'chats', 1,
    'On hérite des traits de ses parents — dit le plus souvent avec malice.',
    ['loups', 'souris', 'lions']],
  ['Ventre affamé n\'a point d\'…', 'oreilles', 3,
    'On n\'écoute pas les beaux discours quand on a faim : la formule est de La Fontaine.',
    ['yeux', 'amis', 'honte']],
  ['La fin justifie les …', 'moyens', 2,
    'Formule attribuée à Machiavel, qui ne l\'a jamais écrite telle quelle dans « Le Prince ».',
    ['choix', 'actes', 'causes']],
  ['Toute peine mérite …', 'salaire', 2,
    'Tout effort doit être récompensé, même modestement.',
    ['repos', 'respect', 'récompense']],
  ['L\'argent n\'a pas d\'…', 'odeur', 2,
    'Réponse de l\'empereur Vespasien à son fils, qui lui reprochait de taxer les urines publiques.',
    ['idée', 'ami', 'patrie']],
  ['Loin des yeux, loin du …', 'cœur', 1,
    'L\'absence défait les attachements ; le proverbe existe dans presque toutes les langues d\'Europe.',
    ['corps', 'monde', 'souvenir']],
];

/* ------------------------------------------------------------------ */
/* 2. Phrases célèbres : compléter, puis dire de qui elles sont        */
/*    [phrase avec …, mot manquant, auteur, difficulté, explication]   */
/* ------------------------------------------------------------------ */

const CITATIONS = [
  ['Je pense, donc je …', 'suis', 'René Descartes', 1,
    'Le « cogito » du « Discours de la méthode » (1637) : la seule certitude qui résiste au doute.',
    ['vis', 'doute', 'sais']],
  ['Veni, vidi, … (je suis venu, j\'ai vu, j\'ai vaincu)', 'vici', 'Jules César', 2,
    'Formule envoyée au Sénat après sa victoire éclair sur Pharnace II, en 47 av. J.-C.',
    ['vinci', 'victa', 'venci']],
  ['L\'enfer, c\'est les …', 'autres', 'Jean-Paul Sartre', 2,
    'Réplique finale de « Huis clos » (1944) : le regard d\'autrui nous enferme dans une image.',
    ['hommes', 'nôtres', 'mots']],
  ['On ne naît pas femme, on le …', 'devient', 'Simone de Beauvoir', 2,
    'Ouverture du second tome du « Deuxième Sexe » (1949), texte fondateur du féminisme moderne.',
    ['reste', 'choisit', 'paraît']],
  ['Un petit pas pour l\'homme, un bond de géant pour l\'…', 'humanité', 'Neil Armstrong', 1,
    'Prononcée le 21 juillet 1969 en posant le pied sur la Lune, devant 600 millions de téléspectateurs.',
    ['Amérique', 'avenir', 'espèce']],
  ['Je vous ai …', 'compris', 'Charles de Gaulle', 3,
    'Lancée à Alger le 4 juin 1958 depuis le balcon du Gouvernement général, la phrase resta volontairement ambiguë.',
    ['entendus', 'écoutés', 'reconnus']],
  ['La France a perdu une bataille, mais la France n\'a pas perdu la …', 'guerre', 'Charles de Gaulle', 2,
    'Affiche placardée à Londres en août 1940, souvent confondue avec l\'Appel du 18 juin.',
    ['paix', 'face', 'foi']],
  ['Et pourtant, elle …', 'tourne', 'Galilée', 3,
    'Phrase qu\'il aurait murmurée après son abjuration de 1633 — la légende est née un siècle plus tard.',
    ['bouge', 'vit', 'roule']],
  ['Le hasard ne favorise que les esprits …', 'préparés', 'Louis Pasteur', 3,
    'Extrait de sa leçon inaugurale à Lille, en 1854 : une découverte fortuite demande un esprit prêt à la voir.',
    ['curieux', 'libres', 'savants']],
  ['Rien ne se perd, rien ne se crée, tout se …', 'transforme', 'Antoine Lavoisier', 2,
    'Reformulation du principe de conservation de la masse, énoncé par le chimiste en 1789.',
    ['répète', 'déplace', 'conserve']],
  ['Liberté, Égalité, …', 'Fraternité', 'la devise de la République française', 1,
    'Devise fixée définitivement par la IIIe République ; elle figure dans la Constitution depuis 1958.',
    ['Solidarité', 'Unité', 'Dignité']],
  ['Je ne suis pas d\'accord avec ce que vous dites, mais je me battrai pour que vous puissiez le …', 'dire', 'Voltaire', 3,
    'Résumé de la pensée de Voltaire écrit en 1906 par sa biographe Evelyn Hall : il ne l\'a jamais écrit ainsi.',
    ['penser', 'écrire', 'croire']],
  ['Le plus grand risque est de ne prendre aucun …', 'risque', 'Mark Zuckerberg', 3,
    'Phrase de 2011 : dans un monde qui change vite, l\'immobilisme est le seul échec garanti.',
    ['pari', 'engagement', 'virage']],
];

/* ------------------------------------------------------------------ */
/* 3. Le sens d'une expression imagée                                  */
/*    [expression, sens (réponse), difficulté, explication, 3 leurres] */
/* ------------------------------------------------------------------ */

const SENS = [
  ['Tomber dans les pommes', 'S\'évanouir', 1,
    'L\'origine viendrait de « pâmoison », déformé en « pomme » au XIXe siècle.',
    ['Se tromper lourdement', 'Tomber amoureux', 'Perdre son argent']],
  ['Poser un lapin', 'Ne pas venir à un rendez-vous', 1,
    'Au XIXe siècle, « poser un lapin » signifiait partir sans payer ce qu\'on devait.',
    ['Piéger quelqu\'un', 'Raconter une blague', 'Faire une demande en mariage']],
  ['Avoir le cafard', 'Être déprimé', 1,
    'L\'image vient de Baudelaire : le cafard, insecte noir des recoins, pour la mélancolie qui s\'installe.',
    ['Avoir très faim', 'Être en colère', 'Avoir peur du noir']],
  ['Couper la poire en deux', 'Faire un compromis', 1,
    'Chacun renonce à une part pour que l\'accord se fasse.',
    ['Trancher sans discuter', 'Partir à deux', 'Renoncer à tout']],
  ['Mettre la charrue avant les bœufs', 'Faire les choses dans le désordre', 1,
    'La charrue ne sert à rien devant l\'attelage : on a inversé l\'ordre logique.',
    ['Travailler trop vite', 'Se donner du mal pour rien', 'Choisir la facilité']],
  ['Jeter l\'éponge', 'Abandonner', 1,
    'Vient de la boxe : l\'entraîneur jette l\'éponge sur le ring pour arrêter le combat.',
    ['Nettoyer derrière soi', 'Changer d\'avis', 'Se mettre en colère']],
  ['Avoir d\'autres chats à fouetter', 'Avoir des choses plus importantes à faire', 2,
    'Déformation ancienne d\'une expression grivoise ; le chat n\'a jamais été maltraité ici.',
    ['Chercher la bagarre', 'Manquer de temps libre', 'Avoir beaucoup d\'animaux']],
  ['Être au taquet', 'Être à fond, au maximum', 2,
    'Le taquet est la butée qu\'on ne peut pas dépasser, en menuiserie comme en marine.',
    ['Être en retard', 'Être coincé', 'Être fatigué']],
  ['Faire chou blanc', 'Échouer, revenir bredouille', 2,
    'Vient du jeu de quilles : « coup blanc », prononcé « choup » en Berry, désignait le coup manqué.',
    ['Pâlir de peur', 'Cuisiner sans talent', 'Dire des bêtises']],
  ['Prendre des vessies pour des lanternes', 'Se tromper grossièrement', 2,
    'Des vessies séchées servaient autrefois de lanternes bon marché : les confondre, c\'est n\'y rien voir.',
    ['Mentir effrontément', 'Exagérer un récit', 'Se faire voler']],
  ['Avoir un poil dans la main', 'Être très paresseux', 1,
    'L\'image : si la main ne travaille jamais, un poil a le temps d\'y pousser.',
    ['Être maladroit', 'Être radin', 'Porter malheur']],
  ['Découvrir le pot aux roses', 'Découvrir le secret', 2,
    'Le « pot aux roses » désignait le fard des dames : l\'ouvrir, c\'était voir ce qu\'on cachait.',
    ['Trouver un trésor', 'Faire une gaffe', 'Tomber amoureux']],
  ['Rester sur sa faim', 'Être déçu, ne pas avoir eu assez', 1,
    'On s\'attendait à mieux ou à plus : l\'appétit n\'a pas été satisfait, au propre comme au figuré.',
    ['Refuser de manger', 'Partir fâché', 'Attendre longtemps']],
  ['Tirer les marrons du feu', 'Profiter du travail d\'un autre', 3,
    'La fable de La Fontaine : le singe fait sortir les marrons du feu par la patte du chat, et les mange.',
    ['Prendre tous les risques', 'Se brûler les doigts', 'Terminer un travail']],
  ['Avoir voix au chapitre', 'Avoir le droit de donner son avis', 2,
    'Le chapitre était l\'assemblée des moines : seuls certains y avaient le droit de parole.',
    ['Chanter juste', 'Écrire un livre', 'Diriger une réunion']],
  ['Être dans de beaux draps', 'Être dans une situation embarrassante', 2,
    'Ironie ancienne : les « beaux draps » étaient ceux dans lesquels on exposait les coupables.',
    ['Être très à l\'aise', 'Dormir tard', 'Avoir de la chance']],
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

const THEME = 'Citations & expressions';
const lignes = [];
let n = 2500;

EXPRESSIONS.forEach(([phrase, mot, diff, expl, faux]) => {
  if (phrase.indexOf('…') < 0) throw new Error('pas de trou : ' + phrase);
  if (faux.length !== 3) throw new Error('il faut 3 leurres : ' + phrase);
  lignes.push(['Q' + (n++), THEME, 'Expression', diff, 'QCM',
    '📜 Complétez : « ' + phrase + ' »', mot, faux[0], faux[1], faux[2], expl, '', '', 0, 15, 'oui', 0, '', '']);
});

/** Trois autres auteurs de la liste, pour les questions « qui a dit ? ». */
function autresAuteurs(vrai) {
  const pool = CITATIONS.map(c => c[2]).filter((a, i, t) => a !== vrai && t.indexOf(a) === i);
  return pool.slice().sort(() => Math.random() - 0.5).slice(0, 3);
}

CITATIONS.forEach(([phrase, mot, auteur, diff, expl, faux]) => {
  if (!faux || faux.length !== 3) throw new Error('il faut 3 mots leurres : ' + phrase);
  if (phrase.indexOf('…') < 0) throw new Error('pas de trou : ' + phrase);
  // 1. compléter la phrase
  lignes.push(['Q' + (n++), THEME, 'Citation', diff, 'QCM',
    '📜 Complétez : « ' + phrase + ' »', mot, faux[0], faux[1], faux[2],
    expl + ' — ' + auteur, '', '', 0, 15, 'oui', 0, '', '']);
  // 2. qui l'a dite ? — la phrase est donnée entière
  const a = autresAuteurs(auteur);
  lignes.push(['Q' + (n++), THEME, 'Citation', Math.min(5, diff + 1), 'QCM',
    '📜 Qui a dit : « ' + phrase.replace('…', mot) + ' » ?', auteur, a[0], a[1], a[2],
    expl, '', '', 0, 15, 'oui', 0, '', '']);
});

SENS.forEach(([expr, sens, diff, expl, faux]) => {
  lignes.push(['Q' + (n++), THEME, 'Sens caché', diff, 'QCM',
    '📜 Que veut dire « ' + expr + ' » ?', sens, faux[0], faux[1], faux[2], expl, '', '', 0, 15, 'oui', 0, '', '']);
});

// contrôles
const vus = new Set();
lignes.forEach(l => {
  const cle = norm(l[5]);
  if (vus.has(cle)) throw new Error('question en double : ' + l[5]);
  vus.add(cle);
  if (!l[6]) throw new Error('réponse vide : ' + l[5]);
  if (!l[10] || l[10].length < 40) throw new Error('explication trop courte : ' + l[5]);
  if ([7, 8, 9].some(j => l[j] && norm(l[j]) === norm(l[6]))) throw new Error('leurre identique à la réponse : ' + l[5]);
  if ([7, 8, 9].some(j => !l[j])) throw new Error('il manque une mauvaise réponse : ' + l[5]);
  if (norm(l[7]) === norm(l[8]) || norm(l[8]) === norm(l[9]) || norm(l[7]) === norm(l[9])) {
    throw new Error('deux leurres identiques : ' + l[5]);
  }
});

fs.writeFileSync(path.join(ROOT, 'supabase/questions-citations.csv'),
  [HEAD.join(',')].concat(lignes.map(l => l.map(cell).join(','))).join('\n'));

const parCat = {};
lignes.forEach(l => { parCat[l[2]] = (parCat[l[2]] || 0) + 1; });
console.log(`${lignes.length} questions écrites → supabase/questions-citations.csv`);
console.log('par catégorie :', JSON.stringify(parCat));
console.log('identifiants  : Q2500 à Q' + (n - 1));
