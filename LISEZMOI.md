# 🎯 Le Quizz de Constance — Guide d'installation et d'utilisation

Une web app de quiz en direct : le maître du jeu pilote la partie depuis un PC, une tablette ou un téléphone, l'écran public est diffusé sur une TV, et chaque joueur répond sur son téléphone après avoir scanné un QR code.

---

## 1. Installation (15 minutes, une seule fois)

### a) Créer le projet
1. Ouvre ton Google Sheet **Le Quizz de Constance**.
2. Menu **Extensions → Apps Script**.
3. Dans l'éditeur, crée les fichiers ci-dessous avec le bouton **＋** et **exactement** ces noms (sans extension), puis colle le contenu de chaque fichier de ce dossier :

| Type (bouton ＋) | Nom dans l'éditeur | Fichier à copier |
|---|---|---|
| Script | `Code` (existe déjà, remplace son contenu) | `Code.gs` |
| Script | `Jeu` | `Jeu.gs` |
| Script | `Classement` | `Classement.gs` |
| Script | `Banque1` à `Banque9` | `Banque1.gs` … `Banque9.gs` |
| Script | `BanqueAnnees`, `BanqueInsolite`, `BanqueActualite` | `BanqueAnnees.gs`, `BanqueInsolite.gs`, `BanqueActualite.gs` |
| Script | `BanquePhotos`, `BanqueCarte` | `BanquePhotos.gs`, `BanqueCarte.gs` |
| Script | `BanqueBlindTest`, `BanqueBlindTest2`, `BanqueBlindTest3` | `BanqueBlindTest.gs`, `BanqueBlindTest2.gs`, `BanqueBlindTest3.gs` |
| Script | `Anecdotes` | `Anecdotes.gs` |
| HTML | `Styles`, `Commun`, `Admin`, `AdminJs`, `AdminPrep`, `Ecran`, `Joueur` | les fichiers `.html` du même nom |

4. ⚙️ **Paramètres du projet** : fuseau horaire **Europe/Paris**. Tu peux aussi cocher « Afficher le fichier manifeste » et coller `appsscript.json`.
5. 💾 Enregistre (Ctrl/⌘ + S).

### b) Préparer le Sheet
1. Recharge le Google Sheet : un menu **🎯 Quizz** apparaît.
2. **🎯 Quizz → 1. Installer les onglets**. Google demande une autorisation : choisis ton compte, puis *Paramètres avancés → Accéder au projet (non sécurisé)*. C'est normal pour un script personnel.
3. **🎯 Quizz → 2. Importer la banque de questions** : **1 521 questions**. Tu peux relancer l'import sans risque : seules les nouvelles questions sont ajoutées, et les anciennes sont complétées (époque, anecdote).
4. **🎯 Quizz → Changer le code maître du jeu** : le code par défaut est `1234`, change-le.

### c) Publier la web app
1. Dans Apps Script : **Déployer → Nouveau déploiement → ⚙️ → Application Web**.
2. **Exécuter en tant que : Moi**, **Qui a accès : Tout le monde**. Les joueurs n'ont ainsi besoin d'aucun compte Google.
3. Copie l'URL (elle finit par `/exec`). **Cette URL (sans rien derrière) est ton interface maître du jeu** : ajoute-la à tes favoris. Les joueurs, eux, arrivent par le QR code que tu diffuses (ou par `…/exec?v=joueur` en tapant le code).

> 🆕 **Mise à jour depuis une version précédente** : colle les fichiers modifiés, crée les nouveaux, redéploie une nouvelle version, puis lance **2. Importer la banque de questions**. La colonne **Anecdote MJ** est ajoutée et remplie automatiquement.

> 🔄 **Après une modification du code**, fais **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version**. L'URL reste la même.

> 🕶️ **Confidentialité** : les joueurs voient un bandeau Google (« Cette application a été créée par un utilisateur de Google Apps Script »), mais ils n'ont accès ni à ton Sheet, ni aux réponses.

---

## 2. Préparer une partie (onglet 🧩 Préparer)

### Modèles tout prêts
Classique, Express, Soirée en 3 chapitres, Blind test musique / cinéma, Soirée blind test, **⚔️ Face à face**, **💀 Survie**, **👥 Équipes**, **⚡ Le plus rapide**, **🌍 Tour du monde (cartes)**, **📸 Que des photos**, **🤪 Insolite**, **📰 Actualité** et **🎰 Grand jeu surprise** (un chapitre de chaque sorte, questions en or et finale ×3).

### 📅 Modèle par années
Choisis une ou plusieurs **époques** (Avant 1970 → Années 2020) et, si tu veux, des **thèmes**, puis :
- **⏳ Voyage dans le temps** : un chapitre par époque, dans l'ordre chronologique ;
- **📖 Un chapitre par thème** : chaque thème, limité aux époques choisies ;
- **🎲 Tout mélangé**.
La case **« seulement En quelle année… ? »** ne garde que les questions de dates (77 dans la banque). Les blind tests sont classés par année de sortie ; les autres questions par la date dont elles parlent (après 1950).

### 🎲 Quiz aléatoire
Nombre de questions, « en chapitres » ou « tout mélangé », avec ou sans blind tests, avec ou sans époques tirées au hasard, puis **Générer** (tu peux ajuster) ou **Générer et créer la partie**.

### Chapitres
Pour chaque chapitre : thèmes, catégories, époques, types (QCM, Vrai/Faux, Estimation, Ordre, **📍 Carte**), médias (**📸 seulement des photos**, **🎧 seulement des extraits**, les deux, ou sans média), **📅 questions de dates**, nombre de questions et niveau de départ. **💾 Enregistre** tes montages pour les réutiliser.

### Réglages
Temps par question (30 s par défaut), joueurs maximum (2 à 15), système de points, estimations, propositions tirées au sort selon la difficulté, ambiance visuelle, sons, et le **format de jeu** :

| Format | Règle |
|---|---|
| Classique | Tout le monde répond à toutes les questions. |
| ⚔️ Face à face | À chaque question, deux joueurs s'affrontent (chacun son tour, en évitant de refaire les mêmes duels) : le plus rapide à trouver marque. Les autres peuvent répondre pour le fun, sans points. |
| 💀 Survie | 1 à 5 vies. Une erreur ou une absence de réponse coûte une vie. Si tous les survivants se trompent, personne ne perd de vie (repêchage). Le dernier en vie gagne. |
| 👥 Équipes | 2 à 4 équipes tirées au sort (bouton 🔀 dans la salle d'attente pour refaire le tirage). Points d'équipe = moyenne de ses joueurs. |
| ⚡ Le plus rapide | Seule la première bonne réponse rapporte des points. |

Options à cocher : **🃏 joker 50/50** (un par joueur et par partie, il retire deux mauvaises réponses sur son téléphone), **⭐ questions en or** (points ×2, au hasard), **🏁 dernière question ×3**.

---

## 3. Déroulé d'une partie

1. **▶ Créer la partie** : un code à 4 caractères et un QR code s'affichent.
2. Ouvre **📺 Écran public** et diffuse-le (bouton **Aide diffusion** : HDMI, AirPlay, Chromecast). Clique une fois dessus pour activer le son. Ce lien (`…/exec?v=ecran`) est **permanent** : l'écran et les téléphones passent tout seuls à la partie suivante.
3. Les joueurs scannent le QR code et saisissent leur pseudo.
4. Tu rythmes la partie avec le gros bouton (ou la **barre d'espace**) :
   - le **thème** s'affiche avec un compte à rebours de 5 s (et le duel ou la question en or s'il y en a) ;
   - la question et le chrono démarrent **en même temps partout** ;
   - **📡 Réponses en direct** : qui a répondu quoi, en combien de temps, juste ou faux ;
   - révélation automatique à la fin du chrono ou quand tout le monde a répondu.
5. Pour animer, tu as sous les yeux : la **réponse** et l'explication, 🕵️ les **indices**, 🎙️ **« Pour animer »** (une anecdote à raconter, pour plus de 800 questions) et 📖 une **fiche Wikipédia** trouvée automatiquement par ton navigateur (à vérifier : elle peut parfois tomber à côté).

### L'interface s'adapte à ton écran
- **Ordinateur** : question à gauche, joueurs à droite.
- **Tablette** : même disposition, plus compacte, gros boutons tactiles.
- **Téléphone** : onglets en haut, tout en une colonne, **le bouton principal reste collé en bas de l'écran**, réglages repliés.

### Difficulté évolutive (par chapitre)
- **Tout le monde** a juste : **+2 niveaux** ; **80 % ou plus** : **+1 niveau** ; sinon le niveau reste le même. **Il ne redescend jamais.**
- En face à face ou en survie, seuls les joueurs en jeu comptent.
- Boutons **− / +** pour forcer le niveau.

### Suivi des joueurs
🟢 en ligne · 🟠 a quitté l'appli · 🔴 déconnecté · ⚠N sorties pendant une question · ✕ retirer un joueur. Selon le format : ❤️ vies, 💀 éliminé, ⚔️ en duel, 🃏 joker utilisé, pastille d'équipe.

### Systèmes de points
| Mode | Calcul |
|---|---|
| Rapidité | 100 × niveau de la question, plus jusqu'à +50 % si on répond vite |
| Rapidité + séries | Pareil, avec un bonus à partir de 3 bonnes réponses d'affilée (🔥) |
| 1 point par bonne réponse | Simple. En cas d'égalité, le plus rapide (temps cumulé) passe devant |

---

## 4. Les types de questions

### 📍 Carte
Les joueurs placent un point sur une carte sans aucun nom de lieu (relief, frontières, photo satellite quand on zoome). **Plus on est près, plus on marque** : tous les points sous un certain rayon, puis de moins en moins, et plus rien au-delà d'une certaine distance. Est « juste » (sons, difficulté) un point à au moins 75 % de précision. Plus le niveau monte, plus il faut être précis. À la réponse, l'écran public montre la bonne position, les points de chacun et les distances.
Zones : monde, Europe, France, Paris, Afrique, Asie, Amériques. **161 lieux** dans la banque (villes, monuments, sites historiques, sportifs, naturels).
Pour en créer une : onglet **➕ Questions**, type **📍 Carte**, choisis la zone et **touche la carte** à l'endroit de la réponse.

### 📸 Photos
**116 questions photo** dans tous les thèmes (monuments, drapeaux, animaux, tableaux, personnages, plats, stades, instruments, objets…), avec des photos libres de Wikimedia. Certaines utilisent un effet :
- **🔍 gros plan** qui se dézoome pendant le chrono ;
- **🌫️ image floue** qui se précise.
La photo s'affiche sur l'écran public **et** sur les téléphones. Pour en ajouter une : colle l'adresse d'une image dans **Média** et choisis l'effet.

### Estimations en QCM
Selon le réglage, les estimations (années, nombres) se jouent en réponse libre ou en QCM avec 4 propositions générées, d'autant plus proches que le niveau monte.

### Colonnes du Sheet (onglet Questions)
| Colonne | Contenu |
|---|---|
| Type | `QCM`, `VF`, `ESTIMATION`, `ORDRE` ou `CARTE` |
| Réponse | QCM : la bonne réponse · VF : `Vrai`/`Faux` · ESTIMATION : un nombre · ORDRE : `a \| b \| c` · CARTE : `latitude, longitude` |
| Choix 2-4 | QCM : les mauvaises réponses · ESTIMATION : unité, tolérance ± · ORDRE : consigne · CARTE : Choix 2 = zone, Choix 3 = nom du lieu, Choix 4 = rayon « tous les points » en km (facultatif) |
| Explication | Affichée à tous après la révélation |
| Indices MJ | Visibles uniquement par le maître du jeu |
| Média (URL) | Lien YouTube (blind test) ou adresse d'une photo (ajoute `#zoom` ou `#flou` à la fin pour l'effet) |
| Début média | Pour YouTube : seconde de départ. **L'extrait dure le temps de réponse** |
| Époque | Remplie automatiquement, sert aux filtres |
| Anecdote MJ | « Pour animer » : visible uniquement par le maître du jeu |
| Actif | `non` pour désactiver une question sans la supprimer |

---

## 5. Contenu de la banque (1 521 questions)
- **10 thèmes classiques** : Histoire, Géographie, Sciences, Nature & Animaux, Cinéma, Musique, Sport, Arts & Littérature, Gastronomie, Divers.
- **🤪 Insolite** (66) : animaux étonnants, idées reçues, records bizarres, histoire insolite.
- **📰 Actualité** (49) : 2024, 2025 et début 2026 (JO de Paris, Ligue des champions du PSG, pape Léon XIV, vol du Louvre, Coupe du monde 2026…). Rédigée en septembre 2026 : désactive les questions qui vieillissent.
- **🎧 Blind test musique** (273) : des années 50 à 2024, International et Chanson française.
- **🎬 Blind test cinéma** (136) : musiques de films, compositeurs, années et **63 répliques cultes** en VF.
- **📍 161 cartes**, **📸 116 photos**, **📅 77 questions de dates**.

> ⚠️ Blind tests : la seconde de départ est une estimation. Avant ta soirée, passe les extraits en revue avec **🎧 Tester l'extrait** et ajuste **Début média** (quelques répliques le signalent dans les indices MJ). Une vidéo YouTube ou une photo peut disparaître un jour : passe alors la question en `Actif = non`.

---

## 6. Classements
- **🏆 Classement** dans l'interface : classement général (tri par colonne), filtre par thème, détail des points par thème en cliquant sur un joueur.
- Dans le Sheet : onglets **Classement** et **Classement par thème**, recalculés à chaque fin de partie.
- Un joueur est reconnu par son **pseudo** (sans mot de passe) : il doit garder le même d'une partie à l'autre.
- En face à face, seules les questions jouées en duel comptent pour le classement général.

---

## 7. Bon à savoir
- **15 joueurs maximum** : c'est la limite confortable pour Apps Script, avec 1 à 2 secondes de latence.
- Une partie doit être terminée dans les **6 heures**.
- Si un joueur recharge sa page ou si son téléphone se met en veille, il retrouve automatiquement sa partie. En survie, un joueur qui arrive en cours de partie commence avec une seule vie.
- Les cartes utilisent les fonds Esri (relief et satellite) et les frontières de Natural Earth, sans clé ni compte.
- Ambiances disponibles : Plateau TV, Élégant, Pop, Néon, Nature, Enfants. Elles se changent aussi en cours de partie.

### Dépannage : « je mets le code et rien ne se passe »
- Un message s'affiche maintenant sous le bouton **Entrer** : lis-le.
- « … is not defined » ou « Erreur dans la page » : un fichier n'a pas été copié ou enregistré. Vérifie la liste du §1, enregistre, puis **redéploie une nouvelle version**.
- « Autorisation requise » : dans l'éditeur Apps Script, choisis la fonction `installerOnglets`, clique ▶ Exécuter et accepte l'autorisation, puis redéploie.
