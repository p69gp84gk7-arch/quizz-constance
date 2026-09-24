/**
 * Fabrique supabase/functions/jeu/bundle.ts : les trois fichiers du serveur
 * réunis en un seul, à coller tel quel dans l'éditeur d'Edge Function de Supabase.
 * Usage : node scripts/bundle.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DIR = path.join(ROOT, 'supabase/functions/jeu');
const read = f => fs.readFileSync(path.join(DIR, f), 'utf8');

/** Retire les import/export locaux : dans un fichier unique, tout est déjà là. */
function strip(src) {
  return src
    .replace(/^\s*import\s+[^;]*from\s+['"]\.\/[^'"]+['"];\s*$/gm, '')
    .replace(/^export\s+(const|function|async function|class|let)\b/gm, '$1')
    .replace(/^\s*export\s*\{[^}]*\};\s*$/gm, '');
}

const engine = strip(read('engine.js'));
const actions = strip(read('actions.js')).replace(/\bE\./g, '');   // le moteur est dans le même fichier
// L'import de supabase-js est déjà en tête du fichier assemblé : on retire celui de l'entrée.
const entry = strip(read('index.ts')).replace(/^\s*import\s+[^;]*;\s*$/gm, '');

const out = `/**
 * Le Quizz de Constance — fonction serveur, version « un seul fichier ».
 *
 * ⚠️  Fichier ENGENDRÉ : ne le modifiez pas à la main.
 *     Sources : supabase/functions/jeu/{engine.js, actions.js, index.ts}
 *     Reconstruction : node scripts/bundle.mjs
 *
 * À coller dans Supabase → Edge Functions → jeu → index.ts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

/* ================= MOTEUR (engine.js) ================= */
${engine}
/* ================= ACTIONS (actions.js) ================= */
${actions}
/* ================= ENTRÉE (index.ts) ================= */
${entry}`;

fs.writeFileSync(path.join(DIR, 'bundle.ts'), out.replace(/\n{4,}/g, '\n\n\n'));
console.log('bundle.ts écrit : ' + out.split('\n').length + ' lignes');
