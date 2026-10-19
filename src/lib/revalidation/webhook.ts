import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

/**
 * The backend's revalidation webhook: its signature and its body.
 * docs/api-contracts.md §7. The route at `app/api/revalidate/route.ts` is the
 * only caller.
 */

/** How far `X-SAEL-Timestamp` may be from this server's clock, either way. */
export const MAX_CLOCK_SKEW_SECONDS = 300;

/** Unsigned unix seconds. The length cap keeps `Number()` exact. */
const TIMESTAMP = /^\d{1,15}$/;

/** `sha256=` and lower-case hex, exactly as the backend renders it. */
const SIGNATURE = /^sha256=[0-9a-f]{64}$/;

export type Verification = { ok: true } | { ok: false; reason: string };

export interface SignedRequest {
  timestamp: string | null;
  signature: string | null;
  /** The body exactly as received. Never a re-serialisation of the parsed JSON. */
  rawBody: string;
}

/**
 * Whether the request was signed with `secret`, and recently.
 *
 * The signature is checked before the timestamp, so a forged request learns
 * nothing about this server's clock. The comparison is constant-time:
 * `SIGNATURE` fixes the length, which `timingSafeEqual` requires, and says
 * nothing about the secret.
 */
export function verifySignature(
  secret: string,
  { timestamp, signature, rawBody }: SignedRequest,
  nowSeconds: number,
): Verification {
  if (timestamp === null || signature === null) {
    return { ok: false, reason: 'unsigned: X-SAEL-Timestamp or X-SAEL-Signature is missing' };
  }
  if (!TIMESTAMP.test(timestamp)) return { ok: false, reason: 'malformed X-SAEL-Timestamp' };
  if (!SIGNATURE.test(signature)) return { ok: false, reason: 'malformed X-SAEL-Signature' };

  const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')}`;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return { ok: false, reason: 'signature does not match' };
  }

  const skew = nowSeconds - Number(timestamp);
  if (Math.abs(skew) > MAX_CLOCK_SKEW_SECONDS) {
    return {
      ok: false,
      reason: `X-SAEL-Timestamp is ${String(skew)} s from now, beyond ±${String(MAX_CLOCK_SKEW_SECONDS)} s`,
    };
  }

  return { ok: true };
}

/**
 * One path to revalidate: absolute, no query or fragment, no dynamic
 * segment. `revalidatePath` accepts anything and reports nothing, so a path
 * it cannot match would be acknowledged and never refreshed; refusing it
 * makes the backend retry and, in the end, say so.
 *
 * The trailing slash the backend sends is kept. `revalidatePath` removes it
 * itself before deriving the cache tag, the same as Next does for the page's
 * own tag under `trailingSlash: true`.
 */
const sitePath = z
  .string()
  .max(1024)
  .regex(/^\/[^?#[\]\s]*$/, 'must be an absolute site path with no query, fragment or [segment]')
  .refine((path) => !path.split('/').includes('..'), 'must not contain ".."');

/**
 * The body. Only `paths` is acted on, so only `paths` is required: a field the
 * backend renames or adds must not stop a page being refreshed. The rest is
 * read for the log line, and each may be `null` as well as absent —
 * `CONTENT_REORDERED` and `HOME_HIGHLIGHTS_CHANGED` are about a list rather
 * than one record, and send `"itemPublicId": null`.
 */
export const webhookPayloadSchema = z.object({
  event: z.string().nullish(),
  screenCode: z.string().nullish(),
  itemPublicId: z.string().nullish(),
  paths: z.array(sitePath).min(1).max(100),
  occurredAt: z.string().nullish(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
