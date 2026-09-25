/**
 * Base Supabase factice, en mémoire : juste ce que les actions du serveur utilisent
 * (select / insert / update / upsert / delete, eq, order, limit, range, maybeSingle),
 * plus les contraintes d'unicité et les deux vues de classement.
 * Sert uniquement aux tests : rien ici ne part en production.
 */

/** Valeurs par défaut des colonnes, comme Postgres les applique à l'insertion. */
const DEFAULTS = {
  game_live: { seq: 0, status: 'LOBBY', state: {} },
  game_mj: { seq: 0, state: {} },
  players: { vis: 'visible', exits: 0 },
  answers: { points: 0 },
  questions: { utilisations: 0, actif: 'oui' },
};

const UNIQUE = {
  questions: [['id']],
  games: [['code']],
  game_live: [['code']],
  game_mj: [['code']],
  players: [['game_code', 'pid'], ['game_code', 'pseudo:i']],
  answers: [['game_code', 'q_index', 'pid']],
  parties: [['code']],
  montages: [['nom']],
  app_state: [['id']],
};

const keyOf = (row, cols) => cols.map(c => {
  const i = c.endsWith(':i');
  const name = i ? c.slice(0, -2) : c;
  const v = row[name];
  return i ? String(v ?? '').toLowerCase() : String(v ?? '');
}).join('\u0000');

export function makeDb() {
  const T = {};
  let seq = 1;
  const rows = name => (T[name] = T[name] || []);

  /** Les deux vues sont recalculées à la volée, comme Postgres le ferait. */
  function view(name) {
    const ans = rows('answers').filter(a => a.correct !== null && a.correct !== undefined);
    if (name === 'classement') {
      const by = {};
      ans.forEach(a => {
        const p = by[a.pseudo] = by[a.pseudo] || { pseudo: a.pseudo, parties: new Set(), points: 0, bonnes_reponses: 0, questions: 0, victoires: 0, temps: [] };
        p.parties.add(a.game_code);
        p.points += a.points || 0;
        p.questions++;
        if (a.correct) p.bonnes_reponses++;
        if (a.temps !== null && a.temps !== undefined) p.temps.push(Number(a.temps));
      });
      rows('parties').forEach(g => { if (by[g.vainqueur]) by[g.vainqueur].victoires++; });
      return Object.values(by).map(p => ({
        pseudo: p.pseudo, parties: p.parties.size, victoires: p.victoires, points: p.points,
        bonnes_reponses: p.bonnes_reponses, questions: p.questions,
        reussite_pct: p.questions ? Math.round(1000 * p.bonnes_reponses / p.questions) / 10 : null,
        temps_moyen_s: p.temps.length ? Math.round(10 * p.temps.reduce((a, b) => a + b, 0) / p.temps.length) / 10 : null,
      }));
    }
    if (name === 'classement_par_theme') {
      const by = {};
      ans.filter(a => a.theme).forEach(a => {
        const k = a.pseudo + '|' + a.theme;
        const p = by[k] = by[k] || { pseudo: a.pseudo, theme: a.theme, points: 0, bonnes_reponses: 0, questions: 0 };
        p.points += a.points || 0;
        p.questions++;
        if (a.correct) p.bonnes_reponses++;
      });
      return Object.values(by);
    }
    return null;
  }

  function dupCheck(table, row, ignore) {
    for (const cols of (UNIQUE[table] || [])) {
      const k = keyOf(row, cols);
      const clash = rows(table).some(r => r !== ignore && keyOf(r, cols) === k);
      if (clash) return { message: 'duplicate key value violates unique constraint (' + cols.join(',') + ')' };
    }
    return null;
  }

  function builder(table, op, payload, opts) {
    const filters = [];
    const state = { order: null, limit: null, range: null, single: false, cols: null };

    const match = r => filters.every(([c, v, op]) => {
      if (op === 'like') {
        const re = new RegExp('^' + String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i');
        return re.test(String(r[c] ?? ''));
      }
      return String(r[c]) === String(v);
    });

    function run() {
      let data = view(table) || rows(table);
      if (op === 'select') {
        data = data.filter(match);
        if (state.order) {
          const { col, asc } = state.order;
          data = data.slice().sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
        }
        if (state.range) data = data.slice(state.range[0], state.range[1] + 1);
        if (state.limit !== null) data = data.slice(0, state.limit);
        // comme PostgREST : on ne rend que les colonnes demandées
        if (state.cols) data = data.map(r => Object.fromEntries(state.cols.map(c => [c, r[c]])));
        if (state.single) return { data: data[0] || null, error: null };
        return { data: data, error: null };
      }
      if (op === 'insert') {
        const list = Array.isArray(payload) ? payload : [payload];
        for (const r of list) {
          const row = Object.assign({ id: seq++ }, DEFAULTS[table] || {}, r);
          const err = dupCheck(table, row, null);
          if (err) return { data: null, error: err };
          rows(table).push(row);
        }
        return { data: list, error: null };
      }
      if (op === 'update') {
        const hit = rows(table).filter(match);
        hit.forEach(r => Object.assign(r, JSON.parse(JSON.stringify(payload))));
        return { data: hit, error: null };
      }
      if (op === 'upsert') {
        const list = Array.isArray(payload) ? payload : [payload];
        const cols = String(opts?.onConflict || '').split(',').map(s => s.trim()).filter(Boolean);
        for (const r of list) {
          const existing = cols.length
            ? rows(table).find(x => cols.every(c => String(x[c]) === String(r[c]))) : null;
          if (existing) Object.assign(existing, JSON.parse(JSON.stringify(r)));
          else {
            const row = Object.assign({ id: seq++ }, DEFAULTS[table] || {}, JSON.parse(JSON.stringify(r)));
            const err = dupCheck(table, row, null);
            if (err) return { data: null, error: err };
            rows(table).push(row);
          }
        }
        return { data: list, error: null };
      }
      if (op === 'delete') {
        T[table] = rows(table).filter(r => !match(r));
        return { data: null, error: null };
      }
      return { data: null, error: { message: 'op inconnue' } };
    }

    const api = {
      eq(col, val) { filters.push([col, val]); return api; },
      like(col, motif) { filters.push([col, motif, 'like']); return api; },
      order(col, o) { state.order = { col: col, asc: !o || o.ascending !== false }; return api; },
      limit(n) { state.limit = n; return api; },
      range(a, b) { state.range = [a, b]; return api; },
      maybeSingle() { state.single = true; return api; },
      single() { state.single = true; return api; },
      select(cols) {
        if (op === 'select' && cols && cols !== '*') state.cols = cols.split(',').map(c => c.trim());
        return api;
      },
      then(res, rej) { try { return Promise.resolve(run()).then(res, rej); } catch (e) { return Promise.reject(e).catch(rej); } },
    };
    return api;
  }

  return {
    from(table) {
      return {
        select: cols => builder(table, 'select').select(cols || '*'),
        insert: p => builder(table, 'insert', p),
        update: p => builder(table, 'update', p),
        upsert: (p, o) => builder(table, 'upsert', p, o),
        delete: () => builder(table, 'delete'),
      };
    },
    /** Fonctions SQL : on enregistre l'appel pour que les tests puissent le vérifier. */
    rpc(nom) { rows('_rpc').push({ nom: nom }); return Promise.resolve({ data: null, error: null }); },
    seed(table, list) { T[table] = list.map(r => Object.assign({ id: r.id ?? seq++ }, r)); },
    rows,
  };
}
