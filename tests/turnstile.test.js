import test from 'node:test';
import assert from 'node:assert/strict';
import { getTurnstileToken } from '../src/utils/turnstile.js';

test('reads the current widget response before falling back to React state', () => {
  const turnstile = { getResponse: () => 'fresh-token' };
  assert.equal(getTurnstileToken(turnstile, 'widget-1', 'stale-token'), 'fresh-token');
});

test('uses the cached token when the widget response is unavailable', () => {
  assert.equal(getTurnstileToken(null, null, 'cached-token'), 'cached-token');
});
