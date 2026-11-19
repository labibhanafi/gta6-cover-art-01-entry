// Neon Vice Cover Studio — entry program (Node 22, standard library only).
//
// Copies app/ and screenshots/ from this repository into the output directory
// and writes output/dossier.json with buildDossier from vendor/makefun-app.ts.
//
// The output directory may be a mounted /output the grader owns: it must never
// be removed itself (that fails with EPERM on a mount). So this program only
// creates it (mkdir recursive) and empties its *contents* child by child.

import { buildDossier } from './vendor/makefun-app.ts';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function emptyDirectoryContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const from = join(sourceDir, entry.name);
    const to = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
    }
  }
}

function main(): void {
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    throw new Error(`app/ missing in ${repoRoot}`);
  }
  if (!existsSync(shotsDir) || !statSync(shotsDir).isDirectory()) {
    throw new Error(`screenshots/ missing in ${repoRoot}`);
  }

  // Never rmSync(outputDir) itself — clear only what is inside it.
  emptyDirectoryContents(outputDir);
  copyTree(appDir, join(outputDir, 'app'));
  copyTree(shotsDir, join(outputDir, 'screenshots'));

  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  // Verify what was written: re-read the dossier and confirm its size and
  // that the app tree landed in the output.
  const written = statSync(join(outputDir, 'dossier.json'));
  if (written.size !== dossier.length) {
    throw new Error(`dossier.json written ${written.size} bytes, expected ${dossier.length}`);
  }
  const appFiles = readdirSync(join(outputDir, 'app'), { recursive: true });
  const shotFiles = readdirSync(join(outputDir, 'screenshots'));
  console.log(
    `Neon Vice Cover Studio handed in: ${dossier.length} byte dossier, ` +
    `${appFiles.length} app entries, ${shotFiles.length} screenshots in ${outputDir}`,
  );
}

main();
