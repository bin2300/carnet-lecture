// Garde-fou post-build : fait échouer le build si une page publique casse la CSP stricte
// (script inline, <style> inline, attribut style="", ressource externe).
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const problems = [];

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p.includes(`${path.sep}admin`)) continue; // l'admin a sa propre CSP
      await walk(p);
    } else if (e.name.endsWith('.html')) {
      const html = await readFile(p, 'utf8');
      const rel = path.relative(dist, p);
      if (/<script(?![^>]*\ssrc=)[^>]*>/i.test(html)) problems.push(`${rel}: <script> inline`);
      if (/<style[\s>]/i.test(html)) problems.push(`${rel}: <style> inline`);
      if (/\sstyle=["']/i.test(html)) problems.push(`${rel}: attribut style=""`);
      if (/\son[a-z]+=["']/i.test(html)) problems.push(`${rel}: gestionnaire on*= inline`);
      if (/(?:src|href)=["']https?:\/\/(?!(?:[\w-]+\.)*pages\.dev)/i.test(html.replace(/<link rel="(?:canonical|alternate)"[^>]*>/gi, '').replace(/<a [^>]*>/gi, ''))) {
        problems.push(`${rel}: ressource externe (src/href http…)`);
      }
    }
  }
}

await walk(dist);
if (problems.length) {
  console.error('\n✗ Contrôle CSP échoué :\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log('✓ Contrôle CSP : aucune ressource inline ni externe sur les pages publiques.');
