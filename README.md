# Carnet de lecture — « Trois Millions »

Site statique **Astro** (FR/EN), hébergé gratuitement sur **Cloudflare Pages**, administré avec **Decap CMS** via ton compte GitHub.
Pas de serveur ni de base de données : les fiches sont des fichiers Markdown dans le dépôt, les images sont dans `public/uploads/`.

## Structure

```
src/content/books/*.md      une fiche = un livre (modifiable via /admin)
src/data/site.json          nom du site, objectif, date de départ, décalage du compteur
src/pages/[lang]/           accueil, fiche livre, RSS (fr + en)
src/styles/global.css       thème sombre (#0D0F12 / #161920 / #E6E4DD / #C89B54)
public/admin/               Decap CMS (config.yml à adapter)
public/_headers             en-têtes de sécurité + CSP
functions/api/auth.js       login GitHub (étape 1)
functions/api/callback.js   login GitHub (étape 2) + liste blanche de TON compte
scripts/check-build.mjs     fait échouer le build si la CSP stricte est cassée
```

## 1. Installation locale

```bash
node -v                       # >= 22.23.4 requis
cd carnet-lecture
npm ci                        # (ou npm install la 1re fois)
npm run dev                   # http://localhost:4321  -> redirige vers /fr/
npm run build                 # build + contrôle CSP
npm run preview               # teste le build
```

En local, `/admin` ne peut pas se connecter à GitHub (l'OAuth pointe vers le site en ligne) : édite les `.md` à la main en local, ou utilise l'admin en production.

## 2. Sécuriser ton compte GitHub (AVANT tout)

Ton compte GitHub devient la clé de l'administration. Active la 2FA : GitHub → Settings → Password and authentication → Two-factor authentication (application TOTP ou clé de sécurité). Garde les codes de récupération hors ligne.

## 3. Créer le dépôt GitHub

Crée un dépôt **public** vide `carnet-lecture` sur github.com (sans README), puis :

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_PSEUDO/carnet-lecture.git
git push -u origin main
```

(Dépôt privé possible, mais il faudra la variable `GITHUB_SCOPE=repo` à l'étape 5.)

## 4. Déployer sur Cloudflare Pages

1. Compte gratuit sur https://dash.cloudflare.com (2FA recommandée aussi).
2. **Workers & Pages → Create → Pages → Connect to Git** → choisis `carnet-lecture`.
3. Réglages de build :
   - Framework preset : **Astro**
   - Build command : `npm run build`
   - Build output directory : `dist`
   - Variable d'environnement : `NODE_VERSION` = `22.23.4` (ou plus récent)
4. Déploie. Tu obtiens `https://<nom>.pages.dev`.
5. Mets cette URL dans **3 fichiers** puis push :
   - `astro.config.mjs` → `const SITE = '...'`
   - `public/admin/config.yml` → `repo`, `base_url`, `site_url`

## 5. Brancher l'admin (OAuth GitHub)

1. GitHub → Settings → Developer settings → **OAuth Apps → New OAuth App**
   - Homepage URL : `https://<nom>.pages.dev`
   - Authorization callback URL : `https://<nom>.pages.dev/api/callback`
2. Récupère le **Client ID** et génère un **Client secret** (affiché une seule fois).
3. Cloudflare → ton projet Pages → **Settings → Variables and Secrets** (Production), ajoute :
   - `GITHUB_CLIENT_ID` = (texte)
   - `GITHUB_CLIENT_SECRET` = (**Secret**, chiffré)
   - `ALLOWED_GITHUB_USER` = ton pseudo GitHub exact
   - (optionnel) `GITHUB_SCOPE` = `repo` si dépôt privé ; sinon `public_repo` par défaut
4. Redéploie (Deployments → Retry), puis ouvre `https://<nom>.pages.dev/admin/` → « Login with GitHub ».

## 6. Utilisation au quotidien

- `/admin/` → **Livres** : ajoute un livre, mets à jour `Pages lues`, rédige la note (Markdown), ajoute des visuels Canva.
- **Réglages** : objectif, date de départ, décalage du compteur.
- Enregistrer = un commit sur `main` = redéploiement automatique. **Délai : ~1 minute** (ce n'est pas du temps réel).
- Le total affiché = somme des `pagesRead` de tous les livres + `pagesOffset`.
- Un livre terminé : statut `Terminé`, `pagesRead` = pages totales, date de fin.

## 7. Images Canva

Exporte en **WebP ou JPG** (PNG seulement si nécessaire), largeur ≤ 1600 px, idéalement < 1 Mo (ex. squoosh.app). Le dépôt Git grossit à chaque image : évite les gros fichiers. Limite Cloudflare Pages : 25 Mo par fichier, 20 000 fichiers.

## Sécurité : ce qui est en place

- Aucun serveur applicatif ni base de données exposés → pas d'injection SQL, pas d'XSS stockée côté serveur.
- Auth admin déléguée à GitHub (2FA) + liste blanche `ALLOWED_GITHUB_USER` + `state` anti-CSRF + secret OAuth uniquement côté Cloudflare.
- CSP stricte sur le site public (`script-src 'self'`, aucun inline), HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy.
- `/uploads/*` servi avec une CSP `sandbox` : un fichier piégé ne peut rien exécuter.
- Polices auto-hébergées (aucun appel à Google Fonts), Decap auto-hébergé (aucun CDN).
- HTTPS automatique (Cloudflare).

## Limites connues (à connaître)

- La CSP de `/admin/*` est plus permissive (Decap exige des styles inline). À valider dans ton navigateur ; si l'écran reste blanc, ouvre la console (F12) et lis l'erreur CSP.
- `npm audit` signale des vulnérabilités dans les dépendances **de Decap CMS** (surtout transitives, côté navigateur, sur une page accessible uniquement à toi). Surveille les mises à jour de `decap-cms`.
- Le brute-force sur un mot de passe n'existe plus ici (pas de mot de passe) ; la protection repose sur GitHub (2FA) et la liste blanche.
- Cloudflare Pages Functions : quota gratuit de 100 000 requêtes/jour, très largement suffisant.
