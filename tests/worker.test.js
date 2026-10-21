import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { GameServer } from '../src/worker.js';

const env = {
  TURNSTILE_SECRET: 'turnstile-secret',
  TURNSTILE_HOSTNAMES: 'jshmlnd.dev',
  WEB3FORMS_ACCESS_KEY: 'web3forms-key',
};

test('keeps the retired Durable Object export for deployment compatibility', () => {
  assert.equal(typeof GameServer, 'function');
});

const contactRequest = () => new Request('https://jshmlnd.dev/api/contact', {
  method: 'POST',
  body: new URLSearchParams({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    projectType: 'Web-Application',
    message: 'Build something useful.',
    'cf-turnstile-response': 'token',
  }),
});

test('rejects a failed Turnstile response before forwarding the contact form', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ success: false }, { status: 200 });
  };

  try {
    const response = await worker.fetch(contactRequest(), env);
    assert.equal(response.status, 403);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('logs safe Turnstile rejection diagnostics without credentials', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const logs = [];
  console.error = (message) => logs.push(message);
  globalThis.fetch = async () => Response.json({
    success: false,
    action: 'contact',
    hostname: 'jshmlnd.dev',
    'error-codes': ['timeout-or-duplicate'],
  });

  try {
    await worker.fetch(contactRequest(), env);
    assert.equal(logs.length, 1);
    assert.match(logs[0], /turnstile_rejected/);
    assert.match(logs[0], /timeout-or-duplicate/);
    assert.doesNotMatch(logs[0], /turnstile-secret|token/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

test('forwards a verified contact form without the browser token', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (request, options) => {
    requests.push({ request, options });
    return requests.length === 1
      ? Response.json({ success: true, action: 'contact', hostname: 'jshmlnd.dev' })
      : Response.json({ success: true });
  };

  try {
    const response = await worker.fetch(contactRequest(), env);
    assert.equal(response.status, 200);
    const forwarded = await requests[1].options.body;
    assert.equal(forwarded.get('access_key'), env.WEB3FORMS_ACCESS_KEY);
    assert.equal(forwarded.get('cf-turnstile-response'), null);
    assert.equal(forwarded.get('name'), 'Ada Lovelace');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('exposes a cache-free health endpoint for uptime checks', async () => {
  const response = await worker.fetch(new Request('https://jshmlnd.dev/api/health'), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('accepts structured client errors without exposing request details', async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (message) => logs.push(message);

  try {
    const response = await worker.fetch(new Request('https://jshmlnd.dev/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://jshmlnd.dev' },
      body: JSON.stringify({ source: 'repositories', message: 'HTTP 503', pathname: '/#projects' }),
    }), env);
    assert.equal(response.status, 202);
    assert.equal(logs.length, 1);
    assert.match(logs[0], /client_error/);
    assert.match(logs[0], /repositories/);
  } finally {
    console.error = originalError;
  }
});
