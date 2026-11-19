// Neon Vice Cover Studio — entry program.
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with the kit's buildDossier. Deterministic: the same
// inputs always produce byte-identical outputs, run after run.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Never delete the output directory itself: in the grader it is a
// mounted volume, so removing it fails with EPERM and kills the run.
// Instead create it if needed and clear only its contents, one child
// at a time, leaving the directory itself in place. This keeps the
// run safe on a mounted /output volume (uid 65534, read-only bot dir).
mkdirSync(outDir, { recursive: true });
for (const child of readdirSync(outDir)) {
  rmSync(join(outDir, child), { recursive: true, force: true });
}

for (const name of ["app", "screenshots"]) {
  const src = join(repoRoot, name);
  if (existsSync(src)) cpSync(src, join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
