/**
 * Le Quizz de Constance — les actions du serveur.
 *
 * Ce module ne connaît que deux choses : le moteur (engine.js) et un objet `db`
 * qui parle à Supabase. `db` est fourni de l'extérieur, ce qui permet de rejouer
 * des parties entières en test, avec une base factice (tests/serveur.test.mjs).
 *
 * Les vitrines :
 *   game_live → l'écran et les téléphones  (aucune bonne réponse n'y figure)
 *   game_mj   → le maître du jeu connecté  (réponse, indices, anecdote, copies)
 */

import * as E from './engine.js';

export const ADMIN_ACTIONS = new Set([
  'adminCreateGame', 'adminState', 'adminNext', 'adminStartTimer', 'adminReveal', 'adminShowScores',
  'adminSkip', 'adminEnd', 'adminMedia', 'adminSetLevel', 'adminUpdateSettings', 'adminKick',
  'adminShuffleTeams', 'adminCatalog', 'adminAddQuestion', 'adminMontages', 'adminSaveMontage',
  'adminDeleteMontage', 'adminLeaderboard',
]);

export function createActions(db) {
  const check = r => { if (r && r.error) throw new Error(r.error.message || String(r.error)); return r; };
  const nowISO = () => new Date().toISOString();

  /* ---------------- Lecture ---------------- */

  /** Toutes les questions (au-delà de la limite de 1 000 lignes par requête). */
  async function allQuestions() {
    const out = [];
    for (let from = 0; ; from += 1000) {
      const { data } = check(await db.from('questions').select('*').range(from, from + 999));
      out.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return out;
  }

  async function loadGame(code) {
    if (!code) throw new Error('Partie introuvable.');
    const { data } = check(await db.from('games').select('*').eq('code', String(code).toUpperCase()).maybeSingle());
    if (!data) throw new Error('Partie introuvable ou expirée.');
    return E.promote(data.state);
  }

  /** Les joueurs sous la forme attendue par le moteur : { pid: {pseudo, score, …} }. */
  async function loadPlayers(code) {
    const { data } = check(await db.from('players').select('*').eq('game_code', code));
    const out = {};
    (data || []).forEach(r => {
      out[r.pid] = Object.assign({ pseudo: r.pseudo }, r.data || {}, {
        vis: r.vis, exits: r.exits || 0, lastSeen: r.last_seen ? new Date(r.last_seen).getTime() : null,
      });
    });
    return out;
  }

  /** Les réponses de la question en cours : { pid: {a, t} }. */
  async function loadAnswers(code, qIndex) {
    if (qIndex < 0) return {};
    const { data } = check(await db.from('answers').select('*').eq('game_code', code).eq('q_index', qIndex));
    const out = {};
    (data || []).forEach(r => { if (r.valeur !== null && r.valeur !== undefined) out[r.pid] = { a: r.valeur, t: Number(r.temps) }; });
    return out;
  }

  /* ---------------- Écriture ---------------- */

  /** Réécrit les joueurs dont le moteur a changé le score, la série ou les vies. */
  async function savePlayers(code, players) {
    const rows = Object.keys(players).map(pid => {
      const p = Object.assign({}, players[pid]);
      const pseudo = p.pseudo;
      delete p.pseudo; delete p.vis; delete p.exits; delete p.lastSeen; delete p.pid; delete p.rank;
      return { game_code: code, pid: pid, pseudo: pseudo, data: p };
    });
    if (rows.length) check(await db.from('players').upsert(rows, { onConflict: 'game_code,pid' }));
  }

  /** Écrit l'état complet et les deux vitrines : c'est ce qui déclenche le temps réel. */
  async function publish(st, players, answers) {
    const pub = E.publicView(st, players, answers, null);
    // Tableau des scores sans identifiant : chaque téléphone s'y retrouve par son pseudo
    pub.board = E.ranking(st, players).map(p => ({
      pseudo: p.pseudo, score: p.score || 0, rank: p.rank, good: p.good || 0,
      streak: p.streak || 0, lives: p.lives, out: p.out || 0, team: p.team,
    }));
    const mj = E.adminView(st, players, answers);
    check(await db.from('games').upsert({
      code: st.code, status: st.status, state: st,
      ended_at: st.status === 'END' ? nowISO() : null,
    }, { onConflict: 'code' }));
    // seq strictement croissant : les écrans ignorent les messages arrivés dans le désordre
    const seq = Date.now();
    check(await db.from('game_live').upsert({
      code: st.code, status: st.status, state: pub, seq: seq, updated_at: nowISO(),
    }, { onConflict: 'code' }));
    check(await db.from('game_mj').upsert({
      code: st.code, state: mj, seq: seq, updated_at: nowISO(),
    }, { onConflict: 'code' }));
    return mj;
  }

  /* ---------------- Questions ---------------- */

  async function questionById(id) {
    const { data } = check(await db.from('questions').select('*').eq('id', id).maybeSingle());
    if (!data) throw new Error('Question introuvable : ' + id);
    return data;
  }

  /**
   * Réservoir de pièges d'une question qui se répète (même thème, même intitulé,
   * ex. « Quel est ce titre ? ») : sert à fabriquer les propositions selon le niveau.
   */
  async function familyOf(theme, text) {
    const { data } = check(await db.from('questions').select('*')
      .eq('theme', theme).eq('question', text).eq('type', 'QCM').limit(400));
    const seen = {};
    const fam = [];
    (data || []).forEach(r => {
      const rep = String(r.reponse || '').trim();
      if (rep && !seen[rep]) { seen[rep] = true; fam.push([rep, String(r.categorie || ''), String(r.epoque || '')]); }
    });
    return fam.length >= 6 ? { [theme + '|' + text]: fam } : {};
  }

  /** Tire la prochaine question du chapitre et lance son compte à rebours de 5 s. */
  async function nextQuestion(st, players, prev) {
    const id = E.pickId(st.pools[st.chapIndex] || [], st.level, st.used);
    if (!id) throw new Error('Plus de question disponible dans ce chapitre.');
    st.used.push(id);
    const row = await questionById(id);
    const fam = String(row.type).toUpperCase() === 'QCM' ? await familyOf(row.theme, row.question) : {};
    st.current = E.loadQuestion(row, st, fam);
    if (!prev) { st.qIndex++; st.chapQ++; }
    st.reveal = null;
    E.decorate(st, players, prev || null);
    E.beginIntro(st);
  }

  /* ---------------- Révélation et fin de partie ---------------- */

  /** Écrit le détail des réponses : c'est ce qui alimente le classement général. */
  async function logAnswers(st, players, results) {
    const q = st.current;
    const ch = st.settings.chapters[st.chapIndex];
    for (const pid of Object.keys(results).filter(x => !results[x].spect)) {
      const r = results[pid];
      const fields = {
        chapitre: ch ? ch.name : '', question_id: q.id, theme: q.theme, categorie: q.cat, difficulte: q.diff,
        correct: r.ok, points: r.pts, temps: r.t, reponse_txt: r.answered ? r.a : '(pas de réponse)',
      };
      // Le joueur qui a répondu a déjà sa ligne (sa réponse brute y figure) : on la complète.
      const up = check(await db.from('answers').update(fields)
        .eq('game_code', st.code).eq('q_index', st.qIndex).eq('pid', pid).select('id'));
      if (!up.data || !up.data.length) {
        check(await db.from('answers').insert(Object.assign({
          game_code: st.code, pid: pid, pseudo: players[pid].pseudo, q_index: st.qIndex, valeur: null,
        }, fields)));
      }
    }
    const { data: cur } = check(await db.from('questions').select('*').eq('id', q.id).maybeSingle());
    check(await db.from('questions').update({ utilisations: (cur?.utilisations || 0) + 1 }).eq('id', q.id));
  }

  async function reveal(st, players) {
    const answers = await loadAnswers(st.code, st.qIndex);
    const results = E.doReveal(st, players, answers);
    await savePlayers(st.code, players);
    await logAnswers(st, players, results);
    return answers;
  }

  async function endGame(st, players) {
    st.status = 'END';
    st.current = null;
    st.media = { seq: st.media.seq + 1, action: 'stop' };
    if (st.persisted || st.qIndex < 0) return;
    st.persisted = true;
    const rk = E.ranking(st, players);
    const s = st.settings;
    check(await db.from('parties').upsert({
      code: st.code, jouee_le: nowISO(),
      chapitres: s.chapters.map(c => c.name + ' (' + c.nb + ')').join(' · '),
      nb_questions: st.qIndex + 1,
      mode_points: s.points + (s.format !== 'classique' ? ' · ' + s.format : ''),
      nb_joueurs: rk.length, vainqueur: rk[0] ? rk[0].pseudo : '', score: rk[0] ? (rk[0].score || 0) : 0,
      podium: rk.slice(0, 3).map(p => ({ rank: p.rank, pseudo: p.pseudo, score: p.score || 0 })),
    }, { onConflict: 'code' }));
  }

  /* ------------------------------------------------------------------ */
  /* Les actions                                                         */
  /* ------------------------------------------------------------------ */

  return async function handle(action, p) {
    p = p || {};
    switch (action) {

      case 'time':
        return { now: Date.now() };

      /* ---------------- Préparation ---------------- */

      /** Inventaire de la banque : sert à tous les menus de la préparation. */
      case 'adminCatalog': {
        const qs = await allQuestions();
        const out = { themes: {}, total: 0, withMedia: 0, photos: 0, cartes: 0, epoques: E.EPOQUES };
        const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
        qs.forEach(r => {
          if (!r.question || String(r.actif || 'oui').toLowerCase() === 'non') return;
          const th = String(r.theme || 'Divers');
          const cat = String(r.categorie || '');
          const d = Math.max(1, Math.min(5, Number(r.difficulte) || 1));
          const era = String(r.epoque || '');
          const type = String(r.type).toUpperCase();
          const m = String(r.media_url || '').trim();
          const t = out.themes[th] = out.themes[th]
            || { count: 0, levels: [0, 0, 0, 0, 0], cats: {}, eras: {}, types: {}, dates: 0, erasDates: {}, photos: 0, sons: 0 };
          t.count++;
          t.levels[d - 1]++;
          inc(t.types, type);
          if (cat) inc(t.cats, cat);
          if (era) inc(t.eras, era);
          if (E.isDateQ(r)) { t.dates++; if (era) inc(t.erasDates, era); }
          if (E.isImage(m)) { t.photos++; out.photos++; }
          if (/youtu/.test(m) || /\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(m)) t.sons++;
          if (type === 'CARTE') out.cartes++;
          out.total++;
          if (m) out.withMedia++;
        });
        return out;
      }

      case 'adminCreateGame': {
        const settings = E.normalizeSettings(p.settings);
        const qs = await allQuestions();
        const pools = E.buildPools(settings, qs);
        const problems = [];
        settings.chapters.forEach((ch, i) => {
          if (pools[i].length < ch.nb) {
            problems.push(`« ${ch.name} » : ${pools[i].length} question(s) disponible(s) pour ${ch.nb} demandée(s)`);
          }
        });
        if (problems.length) throw new Error('Pas assez de questions :\n' + problems.join('\n'));

        const { data: old } = check(await db.from('games').select('*').order('created_at', { ascending: false }).limit(50));
        const st = E.newState(E.newCode((old || []).map(g => g.code)), settings);
        st.pools = pools;
        check(await db.from('games').insert({ code: st.code, status: 'LOBBY', state: st, created_at: nowISO() }));
        check(await db.from('game_live').insert({ code: st.code, status: 'LOBBY', state: {} }));
        check(await db.from('game_mj').insert({ code: st.code, state: {} }));
        check(await db.from('app_state').update({ screen_game: st.code, updated_at: nowISO() }).eq('id', 1));
        return await publish(st, {}, {});
      }

      /* ---------------- Déroulé ---------------- */

      case 'adminState': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        return E.adminView(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminNext': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        let answers = {};
        if (E.LIVE.indexOf(st.status) >= 0) {
          answers = await reveal(st, players);
        } else if (st.status === 'END') {
          return E.adminView(st, players, {});
        } else if (st.finished) {
          await endGame(st, players);          // survie : il ne reste qu'un joueur
        } else {
          const ch = st.settings.chapters[st.chapIndex];
          const chapterDone = st.chapIndex < 0 || st.chapQ >= ch.nb;
          if (st.status !== 'CHAPTER' && chapterDone) {
            if (st.chapIndex + 1 >= st.settings.chapters.length) {
              await endGame(st, players);
            } else {
              st.chapIndex++;
              st.chapQ = 0;
              st.level = st.settings.chapters[st.chapIndex].level;
              st.reveal = null;
              st.current = null;
              // Un seul chapitre : pas d'écran de chapitre, on enchaîne sur l'intro
              if (st.settings.chapters.length === 1) await nextQuestion(st, players);
              else st.status = 'CHAPTER';
            }
          } else {
            await nextQuestion(st, players);
          }
        }
        return await publish(st, players, answers);
      }

      case 'adminStartTimer': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (st.status === 'READ' || (st.status === 'INTRO' && !st.current.start)) E.startTimer(st);
        return await publish(st, players, {});
      }

      case 'adminReveal': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (E.LIVE.indexOf(st.status) < 0) return E.adminView(st, players, {});
        const answers = await reveal(st, players);
        return await publish(st, players, answers);
      }

      case 'adminShowScores': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (st.status === 'REVEAL') st.status = 'SCORES';
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      /** Remplace la question en cours par une autre du même niveau. */
      case 'adminSkip': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (E.LIVE.indexOf(st.status) < 0) return E.adminView(st, players, {});
        check(await db.from('answers').delete().eq('game_code', st.code).eq('q_index', st.qIndex));
        await nextQuestion(st, players, st.current);
        return await publish(st, players, {});
      }

      case 'adminEnd': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (E.LIVE.indexOf(st.status) >= 0) await reveal(st, players);
        await endGame(st, players);
        return await publish(st, players, {});
      }

      case 'adminMedia': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        st.media = { seq: st.media.seq + 1, action: p.mediaAction === 'stop' ? 'stop' : 'play' };
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminSetLevel': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        st.level = Math.max(1, Math.min(5, Number(p.level) || 1));
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminUpdateSettings': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        ['visual', 'sounds', 'audioOn', 'autoReveal', 'duration', 'choix', 'estimQcm'].forEach(k => {
          if (p.patch && p.patch[k] !== undefined) st.settings[k] = p.patch[k];
        });
        st.settings = E.normalizeSettings(st.settings);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminKick': {
        const st = await loadGame(p.code);
        check(await db.from('players').delete().eq('game_code', st.code).eq('pid', String(p.pid)));
        const players = await loadPlayers(st.code);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      case 'adminShuffleTeams': {
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        E.shuffle(Object.keys(players)).forEach((pid, i) => { players[pid].team = i % st.settings.teams; });
        await savePlayers(st.code, players);
        return await publish(st, players, await loadAnswers(st.code, st.qIndex));
      }

      /* ---------------- Banque et montages ---------------- */

      case 'adminAddQuestion': {
        const q = p.question || {};
        const type = String(q.type || 'QCM').toUpperCase();
        if (E.TYPES.indexOf(type) < 0) throw new Error('Type de question inconnu.');
        if (!String(q.question || '').trim() || !String(q.reponse || '').trim()) {
          throw new Error('Il faut au moins une question et une réponse.');
        }
        const { data: last } = check(await db.from('questions').select('*').order('id', { ascending: false }).limit(1));
        const n = last && last[0] ? (parseInt(String(last[0].id).replace(/\D/g, ''), 10) || 0) + 1 : 1;
        const id = 'Q' + String(n).padStart(4, '0');
        check(await db.from('questions').insert({
          id: id, theme: String(q.theme || 'Divers'), categorie: String(q.categorie || ''),
          difficulte: Math.max(1, Math.min(5, Number(q.difficulte) || 1)), type: type,
          question: String(q.question).trim(), reponse: String(q.reponse).trim(),
          choix2: String(q.choix2 || ''), choix3: String(q.choix3 || ''), choix4: String(q.choix4 || ''),
          explication: String(q.explication || ''), indices: String(q.indices || ''),
          media_url: String(q.media_url || ''), media_debut: Number(q.media_debut) || 0,
          media_duree: Number(q.media_duree) || 15, actif: 'oui', utilisations: 0,
          epoque: String(q.epoque || ''), anecdote: String(q.anecdote || ''),
        }));
        return { id: id };
      }

      case 'adminMontages': {
        const { data } = check(await db.from('montages').select('*').order('nom'));
        return { montages: data || [] };
      }

      case 'adminSaveMontage': {
        const nom = String(p.nom || '').trim().slice(0, 60);
        if (!nom) throw new Error('Donne un nom à ce montage.');
        check(await db.from('montages').upsert({
          nom: nom, description: String(p.description || ''), config: p.config || {}, created_at: nowISO(),
        }, { onConflict: 'nom' }));
        return { ok: true };
      }

      case 'adminDeleteMontage': {
        check(await db.from('montages').delete().eq('nom', String(p.nom || '')));
        return { ok: true };
      }

      case 'adminLeaderboard': {
        const { data: g } = check(await db.from('classement').select('*').order('points', { ascending: false }).limit(200));
        const { data: t } = check(await db.from('classement_par_theme').select('*'));
        const { data: parties } = check(await db.from('parties').select('*').order('jouee_le', { ascending: false }).limit(50));
        return { classement: g || [], themes: t || [], parties: parties || [] };
      }

      /* ---------------- Joueurs ---------------- */

      case 'playerJoin': {
        const pid = E.checkPid(p.pid);
        const pseudo = E.cleanPseudo(p.pseudo);
        const st = await loadGame(p.code);
        if (st.status === 'END') throw new Error('Cette partie est terminée.');
        const players = await loadPlayers(st.code);
        const low = pseudo.toLowerCase();
        if (Object.keys(players).some(x => x !== pid && players[x].pseudo.toLowerCase() === low)) {
          throw new Error('Ce pseudo est déjà pris dans la partie.');
        }
        if (!players[pid]) {
          if (Object.keys(players).length >= st.settings.maxPlayers) throw new Error('La partie est complète.');
          const data = { score: 0, good: 0, time: 0, streak: 0, lives: st.settings.lives };
          if (st.settings.format === 'equipes') data.team = E.smallestTeam(st, players);
          // Survie : un joueur qui arrive en cours de partie commence avec une seule vie
          if (st.settings.format === 'survie' && st.qIndex >= 0) data.lives = 1;
          const res = await db.from('players').insert({
            game_code: st.code, pid: pid, pseudo: pseudo, data: data, vis: 'visible', last_seen: nowISO(),
          });
          if (res.error) {
            throw new Error(/duplicate|unique/i.test(res.error.message)
              ? 'Ce pseudo est déjà pris dans la partie.' : res.error.message);
          }
          players[pid] = Object.assign({ pseudo: pseudo }, data);
        } else {
          check(await db.from('players').update({ pseudo: pseudo, last_seen: nowISO() })
            .eq('game_code', st.code).eq('pid', pid));
          players[pid].pseudo = pseudo;
        }
        const answers = await loadAnswers(st.code, st.qIndex);
        await publish(st, players, answers);
        return E.publicView(st, players, answers, pid);
      }

      case 'playerAnswer': {
        const pid = E.checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        if (!players[pid]) return { ok: false, msg: 'Tu ne fais plus partie de la partie.' };
        if (st.status === 'INTRO' && st.qIndex === p.qIndex) return { ok: false, msg: "La question n'a pas encore commencé." };
        if (st.status !== 'QUESTION' || st.qIndex !== p.qIndex) return { ok: false, msg: 'Trop tard !' };
        if (st.settings.format === 'survie' && players[pid].out) return { ok: false, msg: 'Tu es éliminé·e 💀 Regarde la suite !' };
        const t = E.answerTime(st, Date.now());
        if (t === null) return { ok: false, msg: 'Temps écoulé !' };
        if (st.current.type === 'CARTE' && !(Array.isArray(p.answer) && p.answer.length === 2
          && !isNaN(Number(p.answer[0])) && !isNaN(Number(p.answer[1])))) {
          return { ok: false, msg: 'Pose un point sur la carte.' };
        }
        const res = await db.from('answers').insert({
          game_code: st.code, pid: pid, pseudo: players[pid].pseudo, q_index: st.qIndex,
          valeur: p.answer, temps: t, created_at: nowISO(),
        });
        if (res.error) {
          return { ok: false, msg: /duplicate|unique/i.test(res.error.message) ? 'Réponse déjà enregistrée.' : res.error.message };
        }
        return { ok: true, t: t };
      }

      /** Joker 50/50 : retire deux mauvaises réponses (une fois par partie). */
      case 'playerJoker': {
        const pid = E.checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        const pl = players[pid];
        const q = st.current;
        if (!pl || !st.settings.joker) return { ok: false, msg: 'Pas de joker dans cette partie.' };
        if (st.status !== 'QUESTION' || st.qIndex !== p.qIndex) return { ok: false, msg: 'Trop tard !' };
        if (q.type !== 'QCM' || !q.choices || q.choices.length < 4) {
          return { ok: false, msg: 'Le joker ne marche que sur un QCM à 4 propositions.' };
        }
        if (pl.joker) return { ok: false, msg: 'Tu as déjà utilisé ton joker.' };
        const wrong = E.shuffle(q.choices.map((_, i) => i).filter(i => i !== q.secret.correct)).slice(0, 2);
        pl.joker = { q: st.qIndex, hide: wrong };
        await savePlayers(st.code, { [pid]: pl });
        return { ok: true, hide: wrong };
      }

      /** Vue personnelle : appelée en rejoignant et à chaque révélation. */
      case 'playerView': {
        const pid = E.checkPid(p.pid);
        const st = await loadGame(p.code);
        const players = await loadPlayers(st.code);
        return E.publicView(st, players, await loadAnswers(st.code, st.qIndex), pid);
      }

      /** Présence : appelée quand l'appli passe en arrière-plan ou revient. */
      case 'playerPresence': {
        const pid = E.checkPid(p.pid);
        const code = String(p.code || '').toUpperCase();
        const hidden = p.vis === 'hidden';
        const { data } = check(await db.from('players').select('*')
          .eq('game_code', code).eq('pid', pid).maybeSingle());
        if (!data) return { ok: true };
        const st = await loadGame(code).catch(() => null);
        const countExit = hidden && data.vis !== 'hidden' && st && st.status === 'QUESTION';
        check(await db.from('players').update({
          vis: hidden ? 'hidden' : 'visible',
          exits: (data.exits || 0) + (countExit ? 1 : 0),
          last_seen: nowISO(),
        }).eq('game_code', code).eq('pid', pid));
        return { ok: true };
      }

      /* ---------------- Écran public ---------------- */

      /** L'écran suit toujours la dernière partie créée : inutile de le recharger. */
      case 'screenGame': {
        const { data } = check(await db.from('app_state').select('*').eq('id', 1).maybeSingle());
        return { code: (data && data.screen_game) || null, now: Date.now() };
      }

      default:
        throw new Error('Action inconnue : ' + action);
    }
  };
}
