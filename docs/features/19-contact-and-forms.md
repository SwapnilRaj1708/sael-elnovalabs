# FE-19 — Contact Us & Investor Contact

**Routes:** `/contact-us/`, `/investors/contact-us/`
**Depends on:** FE-18 · **Reads:** `api-contracts.md`, `accessibility-and-seo.md`

The only write path in the application. Submissions go to Spring Boot via a Next.js route handler; the backend decides what happens next.

---

## Architecture

```
<ContactForm>  ──POST──▶  /api/forms/contact  ──▶  POST /api/v1/enquiries
  'use client'              route handler                Spring Boot
```

**The browser never calls Spring Boot directly.** This keeps `API_BASE_URL` server-side, avoids CORS configuration on the backend, and gives one place to normalise error shapes.

While `CONTENT_SOURCE=mock` the route handler logs the payload and returns success after a short delay — the full success and error UI is buildable today.

## Shared schema — `src/lib/forms/schemas.ts`

**One Zod schema per form, imported by both the client component and the route handler.** Never duplicate validation rules; they will drift.

```ts
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/).optional().or(z.literal('')),
  subject: z.string().min(2).max(150),
  message: z.string().min(10).max(2000),
  consent: z.literal(true, { message: 'Please accept the privacy policy to continue' }),
});
```

Investor Contact may need different fields — confirm with the client. Default to the same shape plus an `enquiryType` select.

## `<ContactForm>` — `components/forms/`

`react-hook-form` + `zodResolver`.

- Labels are **visible `<label>` elements**, always. Placeholder-as-label fails accessibility and disappears on input.
- Errors linked with `aria-describedby`; the field gets `aria-invalid`.
- Submit disabled while pending, with a clear pending label ("Sending…").
- Success: replace the form with a confirmation, announced via `role="status"`. Show `referenceId` if the backend returned one.
- Failure: an `role="alert"` summary at the top of the form, plus per-field errors from `fieldErrors`. Never lose the user's input on a failed submit.
- Server `fieldErrors` keys must map onto form field names — this is a hard requirement on the backend (`api-contracts.md` §5).
- Consent checkbox links to `/privacy-policy/`.
- No client-side rate limiting or CAPTCHA — the client confirmed spam protection is the backend's responsibility. Handle a `429` with a friendly retry message.

## Route handler — `src/app/api/forms/[form]/route.ts`

1. Reject unknown `[form]` values with 404.
2. Parse with the shared schema → 400 `{ ok: false, fieldErrors }` on failure.
3. Forward with `formType`, `meta.sourceUrl`, `meta.submittedAt`.
4. Normalise every outcome to `{ ok: true, referenceId? } | { ok: false, message, fieldErrors? }`.
5. **Never leak the backend's error body to the client.** Log it server-side.
6. `dynamic = 'force-dynamic'`.

## Page content

Both pages also show, from `src/lib/config/site.ts`:

- Registered office address, CIN, telephone, email — as **real, selectable text**, not an image, with `tel:` and `mailto:` links
- Optionally an embedded map. If added, lazy-load it and do not let it block LCP. `{{TODO: confirm with client}}`

Investor Contact additionally shows the investor relations contact and any SEBI-mandated grievance officer details. `{{TODO: content}}`

## Acceptance criteria

- [ ] One schema, imported by both the client form and the route handler
- [ ] Every field has a visible label; errors are programmatically associated
- [ ] Full keyboard operation; errors announced to screen readers
- [ ] Failed submit preserves user input
- [ ] Success state announced via `role="status"`
- [ ] Backend `fieldErrors` attach to the correct inputs
- [ ] `API_BASE_URL` never appears in any client bundle — verify by searching the built output
- [ ] Works end to end in mock mode
- [ ] `pnpm check` passes

## On completion
Move to Done, promote **FE-20**.
