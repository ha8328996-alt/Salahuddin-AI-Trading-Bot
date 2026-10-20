import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticateClient, AUTHORIZED_CLIENT } from './auth.ts';

test('authenticateClient rejects unauthorized email', async () => {
  const result = await authenticateClient('unauthorized@test.com', 'password123');
  assert.equal(result.success, false);
  assert.match(result.error || '', /Access Denied/);
});

test('authenticateClient rejects authorized email with wrong password', async () => {
  const result = await authenticateClient(AUTHORIZED_CLIENT.email, 'wrongpass');
  assert.equal(result.success, false);
  assert.match(result.error || '', /Authentication Failed/);
});

test('authenticateClient accepts Salahuddin credentials and returns ClientUser session', async () => {
  const result = await authenticateClient(AUTHORIZED_CLIENT.email, 'salahuddin2026');
  assert.equal(result.success, true);
  assert.ok(result.user);
  assert.equal(result.user?.name, 'Salahuddin');
  assert.equal(result.user?.role, 'client_principal');
  assert.equal(result.user?.accessLevel, 'Tier 1 - Institutional Private');
});
