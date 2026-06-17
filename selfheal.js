// selfheal.js — pure logica voor de src/-selfheal beslissing.
//
// Root cause (fix 3A, 2026-06-07):
// De oude self-heal in server.js schreef een placeholder App.tsx zodra
// src/main.tsx ontbrak EN src/App.tsx ontbrak — maar die check keek ALLEEN naar
// App.tsx, niet naar andere bestaande src-bestanden.  Na een src/-wipe waarbij de
// agent in dezelfde POST /files write niet alle bestanden meelevert (bv. alleen
// een component), schreef de self-heal de placeholder over de agent-intentie heen.
//
// Gewenst gedrag:
//   1. Echte lege sandbox (geen enkele bruikbare src-file) → placeholder + main.tsx  OK
//   2. Src-bestanden bestaan al (component, App, …) maar main.tsx ontbreekt →
//      schrijf alleen een generieke main.tsx, NOOIT placeholder App.tsx overschrijven
//   3. App.tsx bestaat maar heeft // SANDBOX_PLACEHOLDER marker → is GEEN
//      bruikbare code; behandel als afwezig (laat self-heal placeholder schrijven)

import fs from 'fs';
import path from 'path';
import { CODE_EXTENSIONS } from './wipe.js';

/**
 * Geeft true terug als het bestand op `filePath` een bruikbare (niet-placeholder)
 * broncode-file is.
 */
export function isUsableCodeFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const lower = filePath.toLowerCase();
  if (!CODE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return false;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return !content.includes('// SANDBOX_PLACEHOLDER');
  } catch {
    return false;
  }
}

/**
 * Geeft een lijst van bruikbare broncode-bestanden in `srcDir`.
 * Recursief, maxDepth=3 om te voorkomen dat node_modules e.d. worden gescand.
 */
export function listUsableSrcFiles(srcDir, depth = 0) {
  if (depth > 3 || !fs.existsSync(srcDir)) return [];
  const result = [];
  let entries;
  try {
    entries = fs.readdirSync(srcDir, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const entry of entries) {
    const full = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listUsableSrcFiles(full, depth + 1));
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if (CODE_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
        // Controleer op placeholder-marker
        try {
          const content = fs.readFileSync(full, 'utf-8');
          if (!content.includes('// SANDBOX_PLACEHOLDER')) {
            result.push(full);
          }
        } catch {
          // Onleesbaar → niet bruikbaar
        }
      }
    }
  }
  return result;
}

/**
 * Voert de self-heal uit voor de src/-directory.
 *
 * @param {string} srcDir   - absoluut pad naar src/
 * @param {string} mainPath - absoluut pad naar src/main.tsx
 * @param {string} appPath  - absoluut pad naar src/App.tsx
 * @param {object} opts
 * @param {(msg: string) => void} opts.log  - logger (default console.log)
 * @param {(p: string, c: string) => void} opts.writeFile  - schrijf-hook (default fs.writeFileSync)
 * @param {(p: string) => void} opts.mkdirp  - mkdir-hook (default fs.mkdirSync)
 */
export function applySelfHeal(srcDir, mainPath, appPath, opts = {}) {
  const log = opts.log || console.log;
  const writeFile = opts.writeFile || ((p, c) => fs.writeFileSync(p, c, 'utf-8'));
  const mkdirp = opts.mkdirp || ((p) => fs.mkdirSync(p, { recursive: true }));

  if (fs.existsSync(mainPath)) {
    // Niets te doen — entry point bestaat.
    return;
  }

  mkdirp(srcDir);

  // Check of er al bruikbare src-bestanden zijn (excl. placeholder App.tsx zelf).
  const usableFiles = listUsableSrcFiles(srcDir);

  if (usableFiles.length === 0) {
    // Echte lege / first-time sandbox: schrijf placeholder App.tsx + generieke main.tsx.
    writeFile(appPath, `// SANDBOX_PLACEHOLDER
export default function App() {
  return <div style={{ padding: 32, fontFamily: 'system-ui' }}>App herstelt…</div>;
}
`);
    log('[sandbox] Restored placeholder src/App.tsx (was missing, no other src files)');
  } else {
    // Er zijn al bruikbare bestanden: GEEN placeholder schrijven.
    // App.tsx niet aanraken als er een bruikbare bestaat.
    log(`[sandbox] WARNING: src/main.tsx missing but ${usableFiles.length} src file(s) exist — skipping App.tsx placeholder`);
  }

  // Schrijf altijd een generieke main.tsx (importeert App via vaste conventie).
  writeFile(mainPath, `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
`);
  log('[sandbox] Restored src/main.tsx (entry point was missing)');
}
