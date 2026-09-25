/**
 * Petit client de base de données, écrit à la main.
 *
 * Pourquoi ne pas utiliser la bibliothèque officielle @supabase/supabase-js ?
 * Parce qu'elle est téléchargée sur Internet au démarrage de la fonction. Quand
 * Supabase réveille une instance neuve (ce qui arrive sans arrêt), ce
 * téléchargement pouvait bloquer la requête pendant 15 à 40 secondes : le joueur
 * voyait la partie « charger » interminablement.
 *
 * Ici, aucune dépendance : on parle directement à PostgREST, l'interface HTTP de
 * la base, incluse dans Supabase. Le démarrage est immédiat.
 *
 * L'interface imite celle de supabase-js, pour que actions.js ne change pas :
 *   db.from('table').select('*').eq('code', 'AB12').maybeSingle()
 *   db.from('table').insert(rows) / .update(champs).eq(…) / .upsert(rows, {onConflict}) / .delete().eq(…)
 */

export function createDb(url, serviceKey, opts) {
  // Première tentative généreuse (la base peut être en train de se réveiller),
  // deuxième plus courte pour ne pas faire patienter indéfiniment.
  const T1 = (opts && opts.timeoutMs) || 30000;
  const T2 = (opts && opts.retryMs) || 20000;
  const base = String(url).replace(/\/+$/, '') + '/rest/v1/';
  const headers = {
    apikey: serviceKey,
    Authorization: 'Bearer ' + serviceKey,
    'Content-Type': 'application/json',
  };

  /**
   * Une requête HTTP vers PostgREST. Sur le forfait gratuit, la base s'endort :
   * la première requête après une longue inactivité peut demander une trentaine
   * de secondes. On patiente donc, et on réessaie une fois avant d'abandonner.
   */
  async function send(path, reqOpts, deuxieme) {
    const ctrl = new AbortController();
    const stop = setTimeout(() => ctrl.abort(), deuxieme ? T2 : T1);
    try {
      const res = await fetch(base + path, Object.assign({ signal: ctrl.signal }, reqOpts, {
        headers: Object.assign({}, headers, reqOpts.headers || {}),
      }));
      const txt = await res.text();
      let body = null;
      if (txt) { try { body = JSON.parse(txt); } catch (e) { body = txt; } }
      if (!res.ok) {
        const msg = (body && body.message) || (typeof body === 'string' ? body : '') || ('HTTP ' + res.status);
        return { data: null, error: { message: msg, code: body && body.code, status: res.status } };
      }
      return { data: body, error: null };
    } catch (e) {
      clearTimeout(stop);
      // première tentative ratée : la base était probablement en train de se réveiller
      if (!deuxieme) return send(path, reqOpts, true);
      const aborted = e && e.name === 'AbortError';
      return { data: null, error: { message: aborted
        ? 'La base met trop de temps à répondre (elle se réveille). Réessaie dans quelques secondes.'
        : String(e && e.message || e) } };
    } finally {
      clearTimeout(stop);
    }
  }

  const enc = encodeURIComponent;

  function builder(table, op, payload, opts) {
    const filters = [];
    const q = [];
    let wantSingle = false;
    let wantReturn = op === 'select';
    let rangeHdr = null;

    const url = () => {
      const parts = filters.map(([c, v, op]) => enc(c) + '=' + (op || 'eq') + '.' + enc(v)).concat(q);
      return table + (parts.length ? '?' + parts.join('&') : '');
    };

    async function run() {
      if (op === 'select') {
        const hdr = rangeHdr ? { Range: rangeHdr, 'Range-Unit': 'items' } : {};
        const r = await send(url(), { method: 'GET', headers: hdr });
        if (r.error) return r;
        const rows = Array.isArray(r.data) ? r.data : (r.data == null ? [] : [r.data]);
        return { data: wantSingle ? (rows[0] || null) : rows, error: null };
      }
      const prefer = [];
      if (op === 'upsert') prefer.push('resolution=merge-duplicates');
      prefer.push(wantReturn ? 'return=representation' : 'return=minimal');
      const method = op === 'update' ? 'PATCH' : op === 'delete' ? 'DELETE' : 'POST';
      const r = await send(url(), {
        method: method,
        headers: { Prefer: prefer.join(',') },
        body: op === 'delete' ? undefined : JSON.stringify(payload),
      });
      if (r.error) return r;
      return { data: Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []), error: null };
    }

    const api = {
      eq(col, val) { filters.push([col, String(val)]); return api; },
      /** Motif SQL : « Blind test% » = commence par. */
      like(col, motif) { filters.push([col, String(motif), 'like']); return api; },
      order(col, o) { q.push('order=' + enc(col) + '.' + (!o || o.ascending !== false ? 'asc' : 'desc')); return api; },
      limit(n) { q.push('limit=' + Number(n)); return api; },
      range(a, b) { rangeHdr = a + '-' + b; return api; },
      maybeSingle() { wantSingle = true; return api; },
      single() { wantSingle = true; return api; },
      /** Sur un select : les colonnes voulues. Sur une écriture : « rends-moi les lignes écrites ». */
      select(cols) {
        if (op === 'select') q.unshift('select=' + (cols && cols !== '*' ? cols.split(',').map(c => enc(c.trim())).join(',') : '*'));
        else wantReturn = true;
        return api;
      },
      then(res, rej) { return run().then(res, rej); },
    };
    if (op === 'upsert' && opts && opts.onConflict) q.push('on_conflict=' + opts.onConflict.split(',').map(c => enc(c.trim())).join(','));
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

    /** Appelle une fonction SQL (ex. recalculer_difficulte). */
    async rpc(nom, params) {
      const r = await send('rpc/' + encodeURIComponent(nom), {
        method: 'POST',
        body: JSON.stringify(params || {}),
      });
      return r;
    },

    /** Vérifie le jeton du maître du jeu auprès de Supabase Auth. */
    async getUser(jwt) {
      try {
        const ctrl = new AbortController();
        const stop = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch(String(url).replace(/\/+$/, '') + '/auth/v1/user', {
          headers: { apikey: serviceKey, Authorization: 'Bearer ' + jwt },
          signal: ctrl.signal,
        });
        clearTimeout(stop);
        if (!res.ok) return null;
        const u = await res.json();
        return u && u.id ? u : null;
      } catch (e) {
        return null;
      }
    },
  };
}
