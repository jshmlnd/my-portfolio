const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const MAX_FORM_BYTES = 128 * 1024;

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

const allowedHostnames = (env) => new Set(
  (env.TURNSTILE_HOSTNAMES || '')
    .split(',')
    .map((hostname) => hostname.trim())
    .filter(Boolean),
);

const verifyTurnstile = async (request, token, env) => {
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048 || !env.TURNSTILE_SECRET) {
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || '',
      }),
    });
    if (!response.ok) {
      console.error(JSON.stringify({ event: 'turnstile_verify_failed', status: response.status }));
      return false;
    }

    const result = await response.json();
    const valid = result.success === true
      && result.action === 'contact'
      && allowedHostnames(env).has(result.hostname);
    if (!valid) {
      console.error(JSON.stringify({
        event: 'turnstile_rejected',
        codes: result['error-codes'] || [],
        action: result.action || null,
        hostname: result.hostname || null,
      }));
    }
    return valid;
  } catch {
    console.error(JSON.stringify({ event: 'turnstile_verify_error' }));
    return false;
  }
};

const handleContact = async (request, env) => {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_FORM_BYTES) return json({ success: false }, 413);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ success: false }, 400);
  }

  const token = form.get('cf-turnstile-response');
  if (!await verifyTurnstile(request, token, env)) return json({ success: false }, 403);
  if (!env.WEB3FORMS_ACCESS_KEY) return json({ success: false }, 503);

  form.delete('cf-turnstile-response');
  form.delete('botcheck');
  form.set('access_key', env.WEB3FORMS_ACCESS_KEY);

  try {
    const response = await fetch(WEB3FORMS_URL, { method: 'POST', body: form });
    if (!response.ok) {
      console.error(JSON.stringify({ event: 'contact_forward_failed', status: response.status }));
      return json({ success: false }, 502);
    }
    const result = await response.json();
    if (result.success !== true) {
      console.error(JSON.stringify({ event: 'contact_forward_rejected' }));
      return json({ success: false }, 502);
    }
    return json({ success: true });
  } catch {
    console.error(JSON.stringify({ event: 'contact_forward_error' }));
    return json({ success: false }, 502);
  }
};

const handleClientError = async (request) => {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ success: false }, 403);

  try {
    const body = await request.json();
    const source = typeof body.source === 'string' ? body.source.slice(0, 40) : 'unknown';
    const message = typeof body.message === 'string' ? body.message.slice(0, 240) : 'unknown';
    const pathname = typeof body.pathname === 'string' ? body.pathname.slice(0, 160) : '/';
    console.error(JSON.stringify({ event: 'client_error', source, message, pathname }));
    return json({ success: true }, 202);
  } catch {
    return json({ success: false }, 400);
  }
};

// The deployed Worker still retains this Durable Object class from the removed game.
// Keep the export so new asset deployments can replace the Worker safely.
export class GameServer {
  async fetch() {
    return new Response('This game server has been retired.', { status: 410 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health' && request.method === 'GET') return json({ status: 'ok' });
    if (url.pathname === '/api/client-error' && request.method === 'POST') return handleClientError(request);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ success: false }, 405);
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
