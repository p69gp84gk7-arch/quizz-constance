/**
 * Fabrique supabase/functions/jeu/bundle.ts : les trois fichiers du serveur
 * réunis en un seul, à coller tel quel dans l'éditeur d'Edge Function de Supabase.
 * Usage : node scripts/bundle.mjs
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

const dbjs = strip(read('db.js'));
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

/* ================= BASE DE DONNÉES (db.js) ================= */
${dbjs}
/* ================= MOTEUR (engine.js) ================= */
${engine}
/* ================= ACTIONS (actions.js) ================= */
${actions}
/* ================= ENTRÉE (index.ts) ================= */
${entry}`;

// Empreinte du contenu : le serveur annonce cette version, on sait toujours ce qui est déployé
let texte = out.replace(/\n{4,}/g, '\n\n\n');
const empreinte = new Date().toISOString().slice(0, 10) + '-' + crypto.createHash('sha1').update(texte).digest('hex').slice(0, 6);
texte = texte.replace(/const BUILD = '[^']*';/, "const BUILD = '" + empreinte + "';");
fs.writeFileSync(path.join(DIR, 'bundle.ts'), texte);
console.log('version : ' + empreinte);
console.log('bundle.ts écrit : ' + texte.split('\n').length + ' lignes');
