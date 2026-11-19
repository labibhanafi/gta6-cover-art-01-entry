// Neon Vice Cover Studio — make.fun entry hand-in (gta6-cover-art-01).
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json with buildDossier from the kit's
// vendor/makefun-app.ts. Node 22, standard library only, no network.
//
// The output directory may be a mount the process cannot remove
// (the grader's /output): this program NEVER removes the output
// directory itself. It creates it, then empties its contents
// child by child, so a stale run leaves nothing behind.
import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
} as const;

/** Empty a directory's contents without removing the directory itself. */
function emptyDirContents(dir: string): void {
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function main(): void {
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    throw new Error(`main.ts: app/ is missing in ${repoRoot}`);
  }
  if (!existsSync(shotsDir) || !statSync(shotsDir).isDirectory()) {
    throw new Error(`main.ts: screenshots/ is missing in ${repoRoot}`);
  }

  // Create the output directory (never delete it) and clear stale contents.
  mkdirSync(outputDir, { recursive: true });
  emptyDirContents(outputDir);

  cpSync(appDir, join(outputDir, 'app'), { recursive: true });
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });

  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  const dossierPath = join(outputDir, 'dossier.json');
  writeFileSync(dossierPath, dossier);

  // Verify the hand-in actually landed before claiming success.
  const written = statSync(dossierPath);
  if (!written.isFile() || written.size !== dossier.length) {
    throw new Error(`main.ts: dossier.json not written correctly in ${outputDir}`);
  }
  const countFiles = (dir: string): number =>
    readdirSync(dir, { withFileTypes: true }).reduce(
      (n, e) => n + (e.isDirectory() ? countFiles(join(dir, e.name)) : 1),
      0,
    );
  const appFiles = countFiles(join(outputDir, 'app'));
  const shotNames = readdirSync(join(outputDir, 'screenshots'))
    .filter((n) => !n.startsWith('.'))
    .sort();
  console.log(`hand-in done: ${outputDir}`);
  console.log(`  app/ copied (${appFiles} files) + screenshots/ copied (${shotNames.length}: ${shotNames.join(', ')})`);
  console.log(`  dossier.json written (${dossier.length} bytes, verified ${written.size} bytes on disk)`);
}

main();
