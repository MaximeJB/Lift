/**
 * Verifie que toute classe utilitaire ecrite dans src/ existe reellement dans le
 * theme ferme.
 *
 * Le theme etant ferme, une classe absente ne leve AUCUNE erreur : le composant
 * s'affiche simplement sans le style attendu. Ce controle transforme cet echec
 * silencieux en echec bruyant.
 *
 * Usage : node scripts/check-classes.mjs <dossier-du-build-storybook>
 */
import fs from 'node:fs';
import path from 'node:path';

const buildDir = process.argv[2];
if (!buildDir) {
  console.error('usage: node scripts/check-classes.mjs <dossier-build>');
  process.exit(2);
}

const assets = path.join(buildDir, 'assets');
const cssName = fs.readdirSync(assets).find((f) => f.endsWith('.css'));
const css = fs.readFileSync(path.join(assets, cssName), 'utf8');

// Selecteurs de classe reellement emis.
// Le CSS echappe ':' en '\:' DANS le nom ; un ':' non echappe demarre une pseudo-classe.
// On avance donc sur [\w-] et sur les paires echappees, et on s'arrete au premier
// ':' nu — sinon `.active\:opacity-70:active` serait lu comme la classe
// « active:opacity-70:active », qui n'existe pas.
const present = new Set(
  [...css.matchAll(/\.((?:[\w-]|\\.)+)/g)].map((m) => m[1].split('\\').join('')),
);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return e.name.endsWith('.tsx') ? [p] : [];
  });

/**
 * Un litteral de gabarit peut contenir une expression : `... ${cond ? 'a b' : 'c'}`.
 * Le decoupage sur les espaces laisse alors de la ponctuation collee aux tokens de
 * bord : `'a`, `b'`, `c'}`, `${cond`. On la retire avant toute verification.
 */
const clean = (w) => w.replace(/^[$'"`{(\s]+/, '').replace(/['"`})\s]+$/, '');

/** Ressemble a un utilitaire Tailwind plutot qu'a du texte quelconque. */
const isUtility = (w) => /^[a-z][a-z0-9:-]*-[a-z0-9]/.test(w) || w === 'uppercase';

const used = new Map(); // classe -> fichiers

for (const file of walk('src')) {
  const txt = fs.readFileSync(file, 'utf8');
  const add = (w) => {
    if (!used.has(w)) used.set(w, new Set());
    used.get(w).add(file);
  };

  // attributs className, sous leurs trois formes
  for (const m of txt.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g)) {
    for (const part of [m[1], m[2], m[3]]) {
      if (part) part.split(/\s+/).map(clean).filter(isUtility).forEach(add);
    }
  }
  // Tables de classes (VARIANT_CLASSES, VARIANT.container...) : chaines composees
  // UNIQUEMENT d'utilitaires. On exige au moins deux mots : une chaine d'un seul mot
  // est presque toujours autre chose — une cle de token (`tokens.colors['text-support']`),
  // une valeur de prop (`'on-action'`), un nom de module (`'react-native'`).
  for (const m of txt.matchAll(/'([a-z][a-z0-9:\-\s]*)'/g)) {
    const ws = m[1].split(/\s+/).filter(Boolean);
    if (ws.length > 1 && ws.every(isUtility)) ws.forEach(add);
  }
}

const missing = [...used.keys()].filter((c) => !present.has(c)).sort();

console.log(`classes utilisees : ${used.size}   selecteurs emis : ${present.size}`);

if (missing.length === 0) {
  console.log('OK — toutes les classes existent dans le theme ferme.');
  process.exit(0);
}

console.error(`\nECHEC — ${missing.length} classe(s) absente(s) du theme :\n`);
for (const c of missing) {
  console.error(`  ${c}`);
  for (const f of used.get(c)) console.error(`      ${f}`);
}
console.error('\nUne classe absente ne leve aucune erreur au rendu : le style est');
console.error('simplement ignore. Soit le nom est faux, soit le token manque.');
process.exit(1);
