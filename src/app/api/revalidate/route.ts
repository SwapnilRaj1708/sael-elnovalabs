import { revalidatePath, revalidateTag } from 'next/cache';
import { env } from '@/lib/config/env';
import { revalidationTagsFor } from '@/lib/revalidation/tags';
import { verifySignature, webhookPayloadSchema } from '@/lib/revalidation/webhook';

/**
 * The backend's revalidation webhook, after every publish, unpublish and
 * delete. docs/api-contracts.md §7.
 *
 * **Served at `/api/revalidate/`, with the slash.** `trailingSlash: true`
 * answers `/api/revalidate` with a 308, and the backend follows no redirects.
 *
 * **2xx means every path was revalidated.** The backend counts any 2xx as
 * delivered and stops retrying, so nothing here answers 2xx early: anything
 * refused or failed is a non-2xx, which the backend retries five times and
 * then reports as PUBLISH_FAILED.
 *
 * `revalidatePath` only queues the cache tags; Next writes them as the
 * handler returns, before the response is sent. With Next's default cache,
 * the one this site runs (/CLAUDE.md §7), that write is in memory and
 * synchronous, so the 2xx follows it. A custom `cacheHandler` would make the
 * write asynchronous, and this would need revisiting.
 *
 * **Plus the section's tile-list tag**, for any path in an investor section:
 * every page of the section shows its tiles, and the backend names only the
 * index and the tile that changed (`lib/revalidation/tags.ts`). `expire: 0`
 * is what `revalidatePath` does — the next request renders afresh rather
 * than being served the stale page while it does.
 *
 * Idempotent: revalidating a path that is not cached, or twice, does nothing
 * further. CONTENT_DELETED fires for records that were never published.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = env.SAEL_REVALIDATE_SECRET;
  if (secret === undefined) {
    console.error('[revalidate] 503: SAEL_REVALIDATE_SECRET is not set; nothing can be verified.');
    return new Response('not configured', { status: 503 });
  }

  // The raw text, before any parsing: the signature is over these bytes.
  const rawBody = await request.text();

  const verification = verifySignature(
    secret,
    {
      timestamp: request.headers.get('x-sael-timestamp'),
      signature: request.headers.get('x-sael-signature'),
      rawBody,
    },
    Math.floor(Date.now() / 1000),
  );
  if (!verification.ok) {
    const from = request.headers.get('x-forwarded-for') ?? 'unknown';
    console.warn(`[revalidate] 401 from ${from}: ${verification.reason}.`);
    return new Response('unauthorized', { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    console.error('[revalidate] 400: a correctly signed body is not JSON.');
    return new Response('body is not JSON', { status: 400 });
  }

  const payload = webhookPayloadSchema.safeParse(json);
  if (!payload.success) {
    const [issue] = payload.error.issues;
    const where = issue?.path.join('.') ?? '(body)';
    console.error(`[revalidate] 400: ${where} ${issue?.message ?? 'is invalid'}.`, rawBody);
    return new Response('body does not match the contract', { status: 400 });
  }

  const { event, screenCode, itemPublicId, paths } = payload.data;
  const tags = revalidationTagsFor(paths);
  try {
    for (const path of paths) revalidatePath(path);
    for (const tag of tags) revalidateTag(tag, { expire: 0 });
  } catch (error) {
    console.error(
      `[revalidate] 500: revalidatePath or revalidateTag failed for ${itemPublicId ?? '?'}.`,
      error,
    );
    return new Response('revalidation failed', { status: 500 });
  }

  console.info(
    `[revalidate] ${event ?? '?'} ${screenCode ?? '?'} ${itemPublicId ?? '?'}: ${[...paths, ...tags].join(' ')}`,
  );
  return Response.json({ revalidated: paths });
}
