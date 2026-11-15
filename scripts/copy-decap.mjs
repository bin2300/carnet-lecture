// Copie le bundle Decap CMS (auto-hébergé, version figée par package-lock) vers public/admin/.
// Évite de charger du JavaScript depuis un CDN tiers sur la page d'administration.
import { cp, mkdir, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const src = path.resolve('node_modules/decap-cms/dist');
const dst = path.resolve('public/admin/vendor');

if (!existsSync(src)) {
  console.error('decap-cms introuvable : lance `npm ci` d’abord.');
  process.exit(1);
}

await rm(dst, { recursive: true, force: true });
await mkdir(dst, { recursive: true });
let n = 0;
for (const f of await readdir(src)) {
  if (f.endsWith('.map')) continue; // inutile en prod, allège le déploiement
  await cp(path.join(src, f), path.join(dst, f));
  n++;
}
console.log(`[decap] ${n} fichiers copiés vers public/admin/vendor/`);
