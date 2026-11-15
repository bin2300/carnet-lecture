// Étape 1 du login admin : redirige vers GitHub (OAuth). Cloudflare Pages Function.
// Variables d'environnement requises : GITHUB_CLIENT_ID (+ GITHUB_CLIENT_SECRET, ALLOWED_GITHUB_USER pour callback.js)

function randomHex(bytes = 16) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID) return new Response('Configuration manquante', { status: 500 });

  const origin = new URL(request.url).origin;
  const state = randomHex(16); // anti-CSRF

  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  gh.searchParams.set('redirect_uri', `${origin}/api/callback`);
  // public_repo = moindre privilège si le dépôt est public. Mets "repo" uniquement si le dépôt est privé.
  gh.searchParams.set('scope', env.GITHUB_SCOPE || 'public_repo');
  gh.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.toString(),
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
