// Étape 2 du login admin : GitHub revient ici avec ?code=...
// Sécurités : vérification du state (CSRF), échange du code côté serveur (le secret ne sort jamais),
// et LISTE BLANCHE : seul le compte GitHub ALLOWED_GITHUB_USER obtient un jeton.

function getCookie(request, name) {
  const m = (request.headers.get('Cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? m[1] : null;
}

function page(status, nonce, body, origin) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0',
    },
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));

  const fail = (msg, status = 400) =>
    new Response(`<!doctype html><meta charset="utf-8"><p>${msg}</p>`, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'",
        'Set-Cookie': 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0',
      },
    });

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(request, 'oauth_state');
  if (!code || !state || !cookieState || state !== cookieState) return fail('Session OAuth invalide.');
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.ALLOWED_GITHUB_USER) {
    return fail('Configuration serveur incomplète.', 500);
  }

  // 1. Échange du code contre un jeton
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'carnet-lecture-admin' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
  });
  const tokenJson = await tokenRes.json().catch(() => ({}));
  const token = tokenJson.access_token;
  if (!token) return fail('Échec de l’authentification GitHub.', 401);

  // 2. Liste blanche : qui est derrière ce jeton ?
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'carnet-lecture-admin', Accept: 'application/vnd.github+json' },
  });
  const user = await userRes.json().catch(() => ({}));
  if (!user.login || user.login.toLowerCase() !== env.ALLOWED_GITHUB_USER.toLowerCase()) {
    return fail('Accès refusé.', 403);
  }

  // 3. Protocole Decap : le popup envoie le jeton UNIQUEMENT à notre propre origine.
  const payload = JSON.stringify({ token, provider: 'github' }).replace(/</g, '\\u003c');
  const html = `<!doctype html><meta charset="utf-8"><title>Connexion…</title>
<script nonce="${nonce}">
(function () {
  var ORIGIN = ${JSON.stringify(origin)};
  function receive(e) {
    if (e.origin !== ORIGIN) return;
    window.opener.postMessage('authorization:github:success:' + ${JSON.stringify(payload)}, ORIGIN);
    window.removeEventListener('message', receive, false);
    window.close();
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', ORIGIN);
})();
</script>
<p>Connexion en cours…</p>`;

  return page(200, nonce, html, origin);
}
