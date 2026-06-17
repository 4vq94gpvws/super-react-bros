// Pure wipe-beslissing voor de sandbox /files-handler.
//
// Bug (2026-06-07, goossen-it-portfolio): een write met wipe=true die ALLEEN
// assets onder src/ bevatte (bv. "src/public/logos/x.svg") triggerde de oude
// guard `keys.some(f => f.startsWith('src/'))` → de hele src/ werd gewist,
// inclusief src/main.tsx en alle componenten. Resultaat: kapotte dev-preview.
//
// Fix: wis src/ alleen als een binnenkomend bestand ECHTE broncode onder src/ is,
// niet bij een asset-only (svg/png/...) of config-only write.

export const CODE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"];

export function isCodeFile(p) {
  const lower = String(p).toLowerCase();
  return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// Wis src/ uitsluitend wanneer de binnenkomende set echte broncode onder src/ bevat.
export function shouldWipeSrc(fileKeys) {
  return (fileKeys || []).some((f) => f.startsWith("src/") && isCodeFile(f));
}
