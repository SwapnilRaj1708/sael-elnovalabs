import 'server-only';

import { z } from 'zod';
import { isProduction } from '@/lib/config/env';
import { ContentUnavailableError } from '../repository';

/**
 * The typed HTTP client for the backend's public API, `/app/v1`.
 * docs/api-contracts.md.
 *
 * **Server-only, by import.** `server-only` makes a Client Component that
 * reaches this module fail the *build*, so the base URL and the preview
 * credential can never be bundled for the browser. The one
 * browser-side call — the contact form — does not come through here
 * (/CLAUDE.md §6).
 *
 * Three rules hold for every call:
 *
 *  1. **The cache policy is an argument, never a default.** Each call site
 *     says whether its response feeds an ISR page or is fetched on every
 *     request; see {@link CachePolicy}.
 *  2. **Every response is parsed by a Zod schema before anyone sees it.**
 *     The schemas are strict — a renamed field fails loudly rather than
 *     arriving as a blank.
 *  3. **A listing is read to its end.** The envelope's `count` is the size of
 *     *this page*, and no total exists anywhere in the API, so one request
 *     silently shows the first page as if it were everything.
 *     {@link ApiClient.getAll} is the loop.
 */

/**
 * How a response may be cached by Next.
 *
 *  - `isr` — the response may be reused for `revalidateSeconds`, and the page
 *    built from it is regenerated in the background after that, or at once
 *    when the backend's revalidation webhook names its path (§7). For live
 *    content.
 *  - `no-store` — fetched on every request, never cached. For anything that
 *    must not be shared between visitors: preview, and the preview-session
 *    exchange.
 */
export type CachePolicy =
  { readonly mode: 'isr'; readonly revalidateSeconds: number } | { readonly mode: 'no-store' };

export const NO_STORE: CachePolicy = { mode: 'no-store' };

export function isr(revalidateSeconds: number): CachePolicy {
  return { mode: 'isr', revalidateSeconds };
}

/** The served page size the paging loop asks for — the backend's maximum. */
const PAGE_SIZE = 100;

/**
 * A ceiling on the paging loop, so a backend that ignored `page` and served
 * the same full page forever could not hang a build. Fifty pages of a hundred
 * is two orders of magnitude above any listing on this site; reaching it is a
 * failure, never a truncation.
 */
const MAX_PAGES = 50;

/** docs/api-contracts.md §2.2. `items` is validated one by one, below. */
const envelopeSchema = z
  .object({
    items: z.array(z.unknown()),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    count: z.number().int().nonnegative(),
  })
  .refine((envelope) => envelope.count === envelope.items.length, {
    path: ['count'],
    message: 'is not items.length — the paging contract has changed',
  });

/** docs/api-contracts.md §2.4. Read for the log line only; nothing branches on a failed parse. */
const errorBodySchema = z.object({ code: z.string(), correlationId: z.string() });

/** One served page, its items already validated. */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  count: number;
}

/**
 * A response, or one item in it, that does not match the contract.
 *
 * Carries the endpoint and the offending field so the log line says where to
 * look. Mappers throw it too, for a value the schema admits but the site
 * cannot render — a video with no source.
 */
export class InvalidContentError extends Error {
  constructor(
    readonly endpoint: string,
    /** Dotted path of the offending field — `items[3].heroImage.url`. */
    readonly field: string,
    readonly detail: string,
    /** The record's `publicId`, when it had a readable one. */
    readonly publicId?: string,
  ) {
    super(
      `Invalid content from "${endpoint}": ${field} ${detail}${publicId === undefined ? '' : ` (publicId ${publicId})`}.`,
    );
    this.name = 'InvalidContentError';
  }
}

/**
 * What happens to one invalid item in a list: **in development it throws**,
 * so the mismatch is on screen at once; **in production it is logged and
 * the item is omitted**, so one bad record costs one card rather than the
 * listing around it.
 */
export function rejectItem(error: InvalidContentError): void {
  if (!isProduction) throw error;
  console.error(`[content-api] ${error.message} The item is omitted; the rest are shown.`);
}

function fieldPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>(
    (joined, key) =>
      typeof key === 'number'
        ? `${joined}[${String(key)}]`
        : joined === ''
          ? String(key)
          : `${joined}.${String(key)}`,
    '',
  );
}

function publicIdOf(raw: unknown): string | undefined {
  if (typeof raw !== 'object' || raw === null || !('publicId' in raw)) return undefined;
  return typeof raw.publicId === 'string' ? raw.publicId : undefined;
}

/** The first issue as an {@link InvalidContentError} — one field is enough to act on. */
function toInvalid(
  endpoint: string,
  error: z.ZodError,
  prefix: readonly PropertyKey[],
  raw: unknown,
): InvalidContentError {
  const [issue] = error.issues;
  const field = fieldPath([...prefix, ...(issue?.path ?? [])]) || '(response)';
  const detail = issue === undefined ? 'is invalid' : `— ${issue.message}`;
  return new InvalidContentError(endpoint, field, detail, publicIdOf(raw));
}

/**
 * A credential for one call — the preview session, sent as
 * `Authorization: Bearer`. Only ever passed with {@link NO_STORE}: a response
 * fetched with a credential must never be reused for another request.
 */
export interface RequestAuth {
  bearer: string;
}

export interface ApiClientOptions {
  /** `API_BASE_URL` — scheme, host and any path prefix, without `/app/v1`. */
  baseUrl: string;
  timeoutMs: number;
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(private readonly options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
  }

  /**
   * One object, or `null` when the backend answers `404`.
   *
   * A response that fails `schema` throws in every environment. Unlike a
   * list there is nothing to keep once the one record is dropped, and a
   * throw — not a `null` — is what keeps a published article from turning
   * into a false 404: during an ISR regeneration Next then goes on serving
   * the last good page.
   */
  async getObject<T>(
    path: string,
    params: Record<string, string>,
    schema: z.ZodType<T>,
    cache: CachePolicy,
    auth?: RequestAuth,
  ): Promise<T | null> {
    const { endpoint, body } = await this.request(path, params, cache, {
      notFoundAsNull: true,
      auth,
    });
    if (body === null) return null;

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const invalid = toInvalid(endpoint, parsed.error, [], body);
      throw isProduction ? new ContentUnavailableError(endpoint, 200, { cause: invalid }) : invalid;
    }
    return parsed.data;
  }

  /**
   * One page of a listing, each item validated on its own: an item that
   * fails is handled by {@link rejectItem} and the page keeps the rest.
   * `count` and `size` are the server's, so a caller's paging decision is
   * not thrown off by an omitted item.
   *
   * An envelope that fails is not an item to omit — there is no "rest" to
   * keep — so it throws: {@link InvalidContentError} in development,
   * {@link ContentUnavailableError} in production.
   */
  async getPage<T>(
    path: string,
    params: Record<string, string>,
    itemSchema: z.ZodType<T>,
    cache: CachePolicy,
    auth?: RequestAuth,
  ): Promise<Page<T>> {
    const { endpoint, body } = await this.request(path, params, cache, {
      notFoundAsNull: false,
      auth,
    });

    const envelope = envelopeSchema.safeParse(body);
    if (!envelope.success) {
      const invalid = toInvalid(endpoint, envelope.error, [], body);
      if (isProduction) console.error(`[content-api] ${invalid.message}`);
      throw isProduction ? new ContentUnavailableError(endpoint, 200, { cause: invalid }) : invalid;
    }

    const items: T[] = [];
    envelope.data.items.forEach((raw, index) => {
      const item = itemSchema.safeParse(raw);
      if (item.success) items.push(item.data);
      else rejectItem(toInvalid(endpoint, item.error, ['items', index], raw));
    });

    const { page, size, count } = envelope.data;
    return { items, page, size, count };
  }

  /**
   * **Every** item of a listing: pages of {@link PAGE_SIZE} from 0 until a
   * page comes back short. docs/api-contracts.md §2.3.
   *
   * "Short" is against the size the server says it **served**, which can
   * differ from the size asked for. A listing that is an exact multiple of
   * the page size costs one extra request that returns nothing — expected.
   */
  async getAll<T>(
    path: string,
    params: Record<string, string>,
    itemSchema: z.ZodType<T>,
    cache: CachePolicy,
    auth?: RequestAuth,
  ): Promise<T[]> {
    const all: T[] = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const served = await this.getPage(
        path,
        { ...params, page: String(page), size: String(PAGE_SIZE) },
        itemSchema,
        cache,
        auth,
      );
      if (served.page !== page) {
        // A server that ignores `page` would hand back page 0 forever.
        throw new ContentUnavailableError(this.label(path, params), undefined, {
          cause: new Error(`Asked for page ${String(page)}, served page ${String(served.page)}.`),
        });
      }

      all.push(...served.items);
      if (served.count < served.size) return all;
    }

    throw new ContentUnavailableError(this.label(path, params), undefined, {
      cause: new Error(`More than ${String(MAX_PAGES)} pages of ${String(PAGE_SIZE)}.`),
    });
  }

  /**
   * Whether an object exists: `HEAD`, never cached, `true` on 2xx and
   * `false` on `404`. Anything else, a timeout included, throws
   * {@link ContentUnavailableError}. `timeoutMs` is the caller's, because a
   * caller in the request path wants a shorter wait than a render does.
   */
  async exists(path: string, params: Record<string, string>, timeoutMs: number): Promise<boolean> {
    const query = new URLSearchParams(params).toString();
    const target = `${path}${query === '' ? '' : `?${query}`}`;
    const endpoint = `HEAD ${target}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${target}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (cause) {
      throw new ContentUnavailableError(endpoint, undefined, { cause });
    }

    if (response.status === 404) return false;
    if (response.ok) return true;
    throw new ContentUnavailableError(endpoint, response.status, {
      correlationId: response.headers.get('x-correlation-id') ?? undefined,
    });
  }

  /**
   * `POST` a JSON body and parse the answer. Never cached. A non-2xx throws
   * {@link ContentUnavailableError} carrying the status and the backend's
   * `code`, which is how a caller tells a refusal from a failure. **The body
   * is never logged or put in an error**: for the preview exchange it is a
   * credential.
   */
  async postJson<T>(path: string, payload: unknown, schema: z.ZodType<T>): Promise<T> {
    const endpoint = `POST ${path}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (cause) {
      throw new ContentUnavailableError(endpoint, undefined, { cause });
    }

    if (!response.ok) throw await this.failure(endpoint, response);

    const parsed = schema.safeParse(await response.json().catch(() => null));
    if (!parsed.success) {
      throw new ContentUnavailableError(endpoint, response.status, {
        cause: toInvalid(endpoint, parsed.error, [], null),
        correlationId: response.headers.get('x-correlation-id') ?? undefined,
      });
    }
    return parsed.data;
  }

  /** `GET /app/v1/news-live?type=PRESS_RELEASE` — what a log line names. */
  label(path: string, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    return `GET ${path}${query === '' ? '' : `?${query}`}`;
  }

  private async request(
    path: string,
    params: Record<string, string>,
    cache: CachePolicy,
    { notFoundAsNull, auth }: { notFoundAsNull: boolean; auth?: RequestAuth },
  ): Promise<{ endpoint: string; body: unknown }> {
    const endpoint = this.label(path, params);
    const query = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${path}${query === '' ? '' : `?${query}`}`;

    if (auth !== undefined && cache.mode !== 'no-store') {
      // A credentialed response in Next's fetch cache would be served to the
      // next caller without one. Refused here, not left to each call site.
      throw new Error(`${endpoint}: a credentialed request must be no-store.`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(auth === undefined ? {} : { Authorization: `Bearer ${auth.bearer}` }),
        },
        signal: AbortSignal.timeout(this.options.timeoutMs),
        ...(cache.mode === 'no-store'
          ? { cache: 'no-store' }
          : { next: { revalidate: cache.revalidateSeconds } }),
      });
    } catch (cause) {
      throw new ContentUnavailableError(endpoint, undefined, { cause });
    }

    if (response.status === 404 && notFoundAsNull) return { endpoint, body: null };

    if (!response.ok) throw await this.failure(endpoint, response);

    try {
      return { endpoint, body: await response.json() };
    } catch (cause) {
      throw new ContentUnavailableError(endpoint, response.status, {
        cause,
        correlationId: response.headers.get('x-correlation-id') ?? undefined,
      });
    }
  }

  /** A non-2xx as a {@link ContentUnavailableError}, with the backend's `code` and `correlationId`. */
  private async failure(endpoint: string, response: Response): Promise<ContentUnavailableError> {
    const errorBody = errorBodySchema.safeParse(await response.json().catch(() => null));
    return new ContentUnavailableError(endpoint, response.status, {
      code: errorBody.success ? errorBody.data.code : undefined,
      correlationId: errorBody.success
        ? errorBody.data.correlationId
        : (response.headers.get('x-correlation-id') ?? undefined),
    });
  }
}
