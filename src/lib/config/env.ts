import { z } from 'zod';

/**
 * The single sanctioned reader of `process.env`.
 *
 * Validation runs at module load, so a missing or malformed variable fails the
 * **build** rather than the first request. ESLint blocks `process.env` access
 * everywhere else — see eslint.config.mjs.
 *
 * Note the explicit property reads below: Next.js only inlines `NEXT_PUBLIC_*`
 * variables into the client bundle when it can see a literal member access, so
 * `process.env` must never be spread or iterated here.
 */

/** Treat an unset variable and an empty `KEY=` in .env as the same thing. */
const optionalUrl = z.preprocess((value) => (value === '' ? undefined : value), z.url().optional());

const envSchema = z
  .object({
    // Set by Next, not by us — but it is still a `process.env` read, and this
    // is the only module allowed to make one. Consumers use `isProduction`.
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    CONTENT_SOURCE: z.enum(['mock', 'api']).default('mock'),
    API_BASE_URL: optionalUrl,
    API_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
    AZURE_BLOB_BASE_URL: optionalUrl,
    // Temporary: the legacy site's origin, while the Offer Documents files are
    // not yet in the container. See .env.example and the mock repository.
    LEGACY_ASSET_BASE_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: z.url(),
    CAREER_REDIRECT_URL: optionalUrl,
    MOCK_LATENCY_MS: z.coerce.number().int().nonnegative().default(0),
    // The HMAC key the backend signs its revalidation webhook with
    // (docs/api-contracts.md §7.2); the backend holds the same value as
    // SAEL_PUBLISH_REVALIDATION_SECRET. Optional here so that a build machine
    // never needs the secret: without it, /api/revalidate/ refuses every call
    // with 503, and the backend's retries end in PUBLISH_FAILED.
    SAEL_REVALIDATE_SECRET: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().optional(),
    ),
  })
  .superRefine((value, ctx) => {
    if (value.CONTENT_SOURCE === 'api' && value.API_BASE_URL === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['API_BASE_URL'],
        message: 'Required when CONTENT_SOURCE is "api".',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  CONTENT_SOURCE: process.env.CONTENT_SOURCE,
  API_BASE_URL: process.env.API_BASE_URL,
  API_TIMEOUT_MS: process.env.API_TIMEOUT_MS,
  AZURE_BLOB_BASE_URL: process.env.AZURE_BLOB_BASE_URL,
  LEGACY_ASSET_BASE_URL: process.env.LEGACY_ASSET_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CAREER_REDIRECT_URL: process.env.CAREER_REDIRECT_URL,
  MOCK_LATENCY_MS: process.env.MOCK_LATENCY_MS,
  SAEL_REVALIDATE_SECRET: process.env.SAEL_REVALIDATE_SECRET,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  throw new Error(
    `Invalid environment configuration.\n${details}\n\nCopy .env.example to .env.local and fill in the missing values.`,
  );
}

export const env: Env = parsed.data;

/**
 * True in a production build. Gates anything that must not ship — currently
 * the design-system kitchen sink at `/dev/design-system/`.
 */
export const isProduction: boolean = env.NODE_ENV === 'production';

/**
 * True while `next build` runs — Next sets `NEXT_PHASE` for it. Read here, not
 * through the schema above, because it is not configuration: nobody sets it,
 * and it is never present on the running server. For the checks that must
 * fail the build rather than a request (`app/investors/_lib/documents.ts`).
 */
export const isBuildPhase: boolean = process.env.NEXT_PHASE === 'phase-production-build';
