import { defineConfig } from 'astro/config';

// ⚠️ Remplace par ton URL réelle une fois le site créé sur Cloudflare Pages
// (ex. https://carnet-lecture.pages.dev). Sert au RSS et aux liens absolus.
const SITE = 'https://carnet-lecture.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  build: {
    // Tout le CSS dans des fichiers externes : permet une CSP stricte sans 'unsafe-inline' pour les scripts.
    inlineStylesheets: 'never',
  },
  // Ne jamais inliner les scripts : CSP `script-src 'self'` sans 'unsafe-inline'.
  vite: { build: { assetsInlineLimit: 0 } },
  devToolbar: { enabled: false },
});
