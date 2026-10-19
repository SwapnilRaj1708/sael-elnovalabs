# FE-20 — Career Redirect

**Route:** `/career/`
**Depends on:** FE-19 · **Reads:** `accessibility-and-seo.md`

**No page is built.** Careers is handled entirely by the client's Oracle recruiting system. This item exists so the legacy URL keeps working and the nav item keeps its destination.

## Implementation

`src/app/career/route.ts`:

```ts
import { redirect } from 'next/navigation';
import { env } from '@/lib/config/env';

export function GET() {
  redirect(env.CAREER_REDIRECT_URL);   // 307
}
```

## Decisions

- **`redirect()` (307), not `permanentRedirect()` (308).** A permanent redirect is cached aggressively by browsers; if the client ever changes ATS vendor, users with a cached 308 keep landing on the old system with no way to clear it. A 307 costs one hop and keeps the URL under our control.
- The redirect target is an **env var**, never hardcoded. Vendor URLs change.
- If `CAREER_REDIRECT_URL` is unset, render a minimal branded page saying open roles are listed externally, with a `mailto:` for careers enquiries — rather than crashing. Failing loudly at build is right for a missing API URL; it is wrong for a careers link.
- The nav item points at `/career/` (our route), not the Oracle URL directly, so the redirect stays a single point of change.
- Exclude `/career/` from `sitemap.ts` — a redirect is not indexable content.

## Blocked on

Client to confirm the exact Oracle recruiting URL. Ship the env-var mechanism now with the fallback page; supply the URL later without a code change.

## Acceptance criteria

- [ ] `GET /career/` 307s to `CAREER_REDIRECT_URL`
- [ ] With the variable unset, a branded fallback page renders — the build does not fail and the route does not 500
- [ ] Nav and footer link to `/career/`, not to the external URL
- [ ] `/career/` absent from the sitemap
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-21**.
