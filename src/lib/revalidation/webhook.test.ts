import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { describe, it } from 'node:test';
import { verifySignature, webhookPayloadSchema } from './webhook.ts';

const SECRET = 'test-secret';
const NOW = 1_760_430_000;

/** Signs `rawBody` as the backend does: HMAC-SHA256 over `timestamp.body`. */
function signed(rawBody: string) {
  const timestamp = String(NOW);
  const digest = createHmac('sha256', SECRET).update(`${timestamp}.${rawBody}`).digest('hex');
  return { timestamp, signature: `sha256=${digest}`, rawBody };
}

/** What the route does with a body before it calls `revalidatePath` on each path. */
function receive(rawBody: string) {
  assert.deepEqual(verifySignature(SECRET, signed(rawBody), NOW), { ok: true });
  return webhookPayloadSchema.safeParse(JSON.parse(rawBody));
}

describe('webhookPayloadSchema', () => {
  it('CONTENT_REORDERED with a null itemPublicId is accepted, and its paths are kept as sent', () => {
    const rawBody = JSON.stringify({
      event: 'CONTENT_REORDERED',
      screenCode: 'NEWS_IN_THE_NEWS',
      itemPublicId: null,
      paths: ['/newsroom/in-the-news/', '/newsroom/', '/'],
      occurredAt: '2026-10-14T11:20:00.000+05:30',
    });

    const payload = receive(rawBody);

    if (!payload.success) assert.fail(payload.error.message);
    assert.equal(payload.data.itemPublicId, null);
    assert.deepEqual(payload.data.paths, ['/newsroom/in-the-news/', '/newsroom/', '/']);
  });

  it('HOME_HIGHLIGHTS_CHANGED with a null itemPublicId is accepted, and revalidates / alone', () => {
    const rawBody = JSON.stringify({
      event: 'HOME_HIGHLIGHTS_CHANGED',
      screenCode: 'NEWS_IN_THE_NEWS',
      itemPublicId: null,
      paths: ['/'],
      occurredAt: '2026-10-14T11:20:00.000+05:30',
    });

    const payload = receive(rawBody);

    if (!payload.success) assert.fail(payload.error.message);
    assert.equal(payload.data.itemPublicId, null);
    assert.deepEqual(payload.data.paths, ['/']);
  });

  it('a body without paths is still refused', () => {
    const payload = receive(
      JSON.stringify({ event: 'HOME_HIGHLIGHTS_CHANGED', itemPublicId: null, paths: [] }),
    );

    assert.equal(payload.success, false);
  });
});
