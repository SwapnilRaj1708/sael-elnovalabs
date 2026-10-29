# Asset Inventory

The prototype ships ~200MB of assets across two folders with inconsistent naming. This document is the authoritative map from prototype asset to repository asset. **Never reference a prototype filename in code.**

---

## 1. Why this document exists

The prototype references assets from two places:

- **`assets/`** — curated, sensibly named. Mostly usable.
- **`uploads/`** — raw user uploads with generated names. `uploads/pasted-1784663527717-0.png` **is the SAEL logo.** The prototype's own `CLAUDE.md` warns that this folder resyncs and edits do not persist.

Additionally, several assets are enormous unoptimised originals. Shipping them as-is would blow the performance budget on the first page load. Every asset below has a required target size.

---

## 2. Critical findings

| Asset | Size in prototype | Problem |
|---|---|---|
| `news-solar.jpg` | **12.5 MB** | 3 of these load on the homepage. ~34MB of news thumbnails. |
| `news-agri.jpg` | **11.4 MB** | Same. |
| `news-mfg.jpg` | **8.7 MB** | Same. |
| `hero-man.jpg` | **10.7 MB** | Unused in the final homepage — leftover from an earlier hero direction. |
| `hero-boy.jpg` | **9.7 MB** | Unused. |
| `hero-woman.jpg` | **9.4 MB** | Unused. |
| `vision-bg.png` | **8.4 MB** | Photographic content stored as PNG. Must be JPEG/WebP. |
| `solar-plant.png` | **1.7 MB** | Photographic content stored as PNG. Must be JPEG/WebP. |

**Action required from the client before FE-04:** supply the original high-resolution masters for the three news images and confirm which hero photography is final. Do not re-compress an already-compressed 12MB JPEG — request the master.

---

## 3. Naming and placement rules

```
src/assets/
├── fonts/          DIN — client supplied, licensed. WOFF2 only in the repo.
├── images/
│   ├── hero/
│   ├── sections/
│   ├── news/       placeholder only — production news images come from Azure Blob
│   └── decorative/
└── icons/          SVGs imported as React components (direct children only)
    └── <name>/     the supplied icon set, 2026-10-08: animated/ and static/,
                    each in white, coloured no-tile and coloured-tile variants
public/
└── images/         only assets referenced by URL string (OG image, favicon set)
```

Rules:

- **kebab-case, descriptive, no dates, no dimensions in the name.** `hero-solar-modules.jpg`, not `hero-modules-1920.jpg` or `pasted-1784663527717-0.png`.
- Assets imported by `next/image` live in `src/assets/`, are content-hashed at build, and get automatic width/height. **Prefer this.**
- `public/` is only for assets referenced by a literal URL string that Next cannot process: favicons, `og-image.png`, `robots.txt`.
- Icons that need to inherit `currentColor` become inline React components (via SVGR). Icons that are fixed-colour brand artwork stay as files.
- **The supplied icon set (`icons/<name>/animated|static/`) is files, not components.** SVGR's glob in `next.config.ts` matches only direct children of `icons/`, and these are fixed-colour, each declares `id="g"` for its gradient, and the animated ones run SMIL, so inlining two on one page would collide. They go to `next/image`, typed by the `*-animated.svg` declaration in `src/types/svg.d.ts`. Every `*-animated.svg` in use has been edited to loop: the original 1.5s draw, a 2s hold, `repeatCount="indefinite"` (3.5s in all, keyframes rescaled by 3/7). A fresh copy from the client does not loop until it gets the same edit. **The white variant is for the dark ground and the coloured no-tile variant for paper** (2026-10-14): a mark on a paper section takes `ground="paper"` and draws the no-tile file. The 34 no-tile files that change brought in (icons 4–36 and 39) were given the loop edit then, each checked against its white twin: with colours set aside, the two files are identical.
- Photographic content is **never PNG**. PNG is for transparency and flat graphics only.
- Every raster asset is committed at a single sensible master size; `next/image` derives the rest. Do not commit `@2x` variants.

---

## 4. Mapping table

### Logo and identity

| Prototype path | Repository path | Format | Notes |
|---|---|---|---|
| `uploads/pasted-1784663527717-0.png` | `src/assets/images/sael-logo.png` | PNG | **Interim, by decision on 2026-08-04.** See below. |
| *(footer variant)* | `src/assets/images/sael-logo-dark.svg` | SVG | **Supplied 2026-08-27**, and the first vector of the wordmark we have. Drawn for a dark ground: white strapline, the SAEL wordmark on its own red→purple gradient. Consumed by the footer at `--spacing-footer-logo`. **38% of its height is empty** — the ink is 1293 × 329 inside a 1521.67 × 530.77 viewBox — so size the box from the ink, and re-measure if it is re-exported. **The empty strip left of the ink is trimmed** (2026-10-19, viewBox `123.95 0 1397.72 530.77`), so the stacked footer's logo starts on the address's edge; the top, bottom and right margins are as supplied |
| — | `public/images/og-image.png` | PNG | 1200×630. Live site has `sael-thumbnail.png`. |
| — | `public/favicon.ico` + `icon.png` + `apple-icon.png` | — | Generate from the logo mark |

> **The colour logo ships as a raster for now.** The client's handover contains
> `sael-logo.png` but no SVG. The wordmark *is* live vector inside
> `SAEL - New Website.pdf` and could be extracted, and the live site already
> serves `sael-logo.svg`; the call on 2026-08-04 was to use the PNG and swap
> later. The committed file is the supplied 7787×1975 master, alpha-trimmed and
> resampled to **1600×398** (78 KB) — roughly 3× the largest rendered size
> (42px tall at 3× DPR), so it stays crisp without shipping an 8000px asset
> through `next/image` on every build.
>
> The white variant cannot be derived: the wordmark is a purple→red gradient
> over a black strapline, so a white version is a design decision, not a
> recolour. The footer still needs it.

### Hero carousel — **used**

| Prototype | Repository | Target | Notes |
|---|---|---|---|
| `assets/hero-modules.jpg` | `hero/solar-modules.jpg` | ≤ 220KB @ 2400w | Slide 1 — `priority` |
| `assets/hero-generation.jpg` | `hero/energy-generation.jpg` | ≤ 220KB @ 2400w | Slide 2 |
| `assets/hero-vision.jpg` | `hero/clean-energy-vision.jpg` | ≤ 220KB @ 2400w | Slide 3 |
| `assets/hero-agri.jpg` | `hero/agri-waste.jpg` | ≤ 220KB @ 2400w | Slide 4 |

**Each hero slide needs a portrait crop for mobile** (`hero/solar-modules-portrait.jpg` etc., 4:5, ≤ 140KB @ 1080w). Delivered via `<picture>` / `next/image` with a media-conditioned source. Scaling a 2.34:1 landscape into a 4:5 frame crops out the subject — this must be an art-directed crop, not a CSS `object-position` guess. **Client/design to supply the crops.**

### Hero overlay icons — **used**

| Prototype | Repository | Notes |
|---|---|---|
| `assets/icon-1-symbol.svg` | `icons/symbol-solar-generation.svg` | Large watermark symbol, slide 3 |
| `assets/icon-2-symbol.svg` | `icons/symbol-cell-manufacturing.svg` | Slide 1 |
| `assets/icon-3-symbol.svg` | `icons/symbol-module-manufacturing.svg` | Slide 2 |
| `assets/icon-4-symbol.svg` | `icons/symbol-agri-waste.svg` | Slide 4 |

### Business tile icons — **used**

The client supplied these on 2026-08-04 as `Business Icons/Icons-Sael-0N.svg`.
Byte sizes match the prototype's `icon-N.svg` exactly, and the gradient stops
confirm the mapping, so the numbering is the same in both sets.

| Prototype | Client file | Repository | Identifying gradient |
|---|---|---|---|
| `assets/icon-1.svg` | `Icons-Sael-01.svg` | `icons/business-solar-generation.svg` | yellow → red → purple |
| `assets/icon-2.svg` | `Icons-Sael-02.svg` | `icons/business-cell-manufacturing.svg` | indigo → purple → magenta |
| `assets/icon-3.svg` | `Icons-Sael-03.svg` | `icons/business-module-manufacturing.svg` | blue → teal → green |
| `assets/icon-4.svg` | `Icons-Sael-04.svg` | `icons/business-agri-waste.svg` | near-black → green |

Full-colour brand artwork with gradients and `clipPath`s. **Keep as files for
`next/image`; do not run them through SVGR** — each declares its own `.cls-1`
and gradient `id`, so inlining four of them on one page would collide.

> **Open: the labels are baked into the artwork.** Every one of these carries
> its wordmark as outlined letter paths below the icon — `Icons-Sael-03.svg` is
> the mark plus "N-TYPE MODULE MANUFACTURING" in vector outlines (21 of its 22
> shapes are lettering). The supplied PNGs are the same with white text. The
> business tile renders that heading as real HTML as well, so as-is the label
> would be duplicated, and the vector copy is unselectable, untranslatable and
> invisible to screen readers.
>
> Deferred on 2026-08-04 — **resolve before the FE-04 tiles are built.** Either
> the client supplies marks without lettering (they are separate objects
> upstream), or we strip the letter paths and re-crop the viewBox, with design
> confirming the crop.

The PNG variants (`SOLAR Icon.png` and siblings, 1880×2493) have **white**
lettering baked in and are intended for dark backgrounds. Not used on the site.

### Tile shapes — **rebuild, do not import**

| Prototype | Action |
|---|---|
| `assets/rtile-2.svg` … `rtile-5.svg` | **Reimplement in CSS.** |
| `assets/tile-2.svg` … `tile-5.svg` | Unused variants — discard. |

Reason: these are a single path with `preserveAspectRatio="none"` and a hardcoded `fill="#e8e9eb"`. Stretching them to a tall mobile aspect ratio distorts the 18px corner radii into ellipses, and the fill cannot be tokenised. The shape is a rounded rectangle with a chamfered bottom-right corner — express it as:

```css
clip-path: polygon(0 0, 100% 0, 100% calc(100% - 44px), calc(100% - 44px) 100%, 0 100%);
border-radius: var(--radius-card);
background: var(--color-tile-surface); /* #E8E9EB */
```

Note `clip-path` and `border-radius` do not compose on all engines — if the corner rounding is lost, use an inline SVG generated with a viewBox matching the rendered aspect ratio instead of a stretched static file. Confirm the final approach in design review during FE-04.

### Date badge — **rebuild, do not import**

`assets/date-badge.svg` has the same problem: `preserveAspectRatio="none"` with a 16px angled notch that distorts under a variable-width date string. Rebuild in CSS using `--gradient-eyebrow` and a `clip-path` notch. See `design-guidelines.md` §4.

### Section imagery — **used**

| Prototype | Repository | Format change | Target |
|---|---|---|---|
| `uploads/Rectangle 7.png` | `sections/about-workplace.jpg` | PNG → JPEG | ≤ 180KB @ 2000w |
| `uploads/pasted-1784666085151-0.png` | `sections/about-overlay.png` | keep PNG | Transparency required. ≤ 120KB |
| `assets/india-map.png` | `sections/india-presence-map.png` | keep PNG (flat graphic) | 860×721 source. ≤ 90KB. **See §6.** |
| `assets/solar-plant.png` | `sections/mizoram-solar-plant.jpg` | **PNG → JPEG** | 1.7MB → ≤ 200KB @ 2400w |
| `assets/engineer.png` | `sections/field-engineer.png` | keep PNG | Cut-out, transparency required. 968×970. 715KB → ≤ 180KB |
| `assets/vision-bg.png` | `sections/vision-background.jpg` | **PNG → JPEG** | 8.4MB → ≤ 250KB @ 2400w |
| `assets/pixel-strip.png` | `decorative/pixel-strip.png` | keep PNG | 2613×380. 569KB → ≤ 60KB. Decorative, `alt=""` |
| `assets/footer-bg.png` | `sections/footer-background.jpg` | PNG → JPEG | ≤ 100KB |

### News images — **placeholders only**

| Prototype | Repository | Notes |
|---|---|---|
| `assets/news-agri.jpg` | `news/placeholder-agri.jpg` | Mock fixture only |
| `assets/news-solar.jpg` | `news/placeholder-solar.jpg` | Mock fixture only |
| `assets/news-mfg.jpg` | `news/placeholder-manufacturing.jpg` | Mock fixture only |

Production news images come from **Azure Blob** via `NewsItem.image.url`. These three exist so the mock renders realistically; each must be re-encoded to ≤ 120KB at 1200w. Also commit a `news/fallback.jpg` for items where `image` is `null`.

### Unused — **do not migrate**

`assets/hero-man.jpg`, `assets/hero-boy.jpg`, `assets/hero-woman.jpg`, `assets/tile-2..5.svg`, `assets/reference/*`, and the entire `uploads/` folder beyond the three files mapped above. The prototype's `checkpoints/`, `Assets.dc.html`, `Hero FX Lab.dc.html`, `Timeline Experiment.dc.html` and `KnowMoreButton.dc.html` are Designer working files with no repository equivalent.

---

## 5. Fonts

| Client file | Repository | Notes |
|---|---|---|
| `DIN.ttf` | `src/assets/fonts/din-regular.woff2` | Weight 400 |
| `DIN Bold.otf` (preferred) / `DIN Bold.ttf` | `src/assets/fonts/din-bold.woff2` | Weight 700 |

- Convert to **WOFF2** and subset to `latin` (+ `₹`, `–`, `’`, `·`, `#`, `²`). Expect ~70% size reduction.
- Load via `next/font/local` with `display: 'swap'` and `fallback: ['system-ui', 'sans-serif']`.
- Commit **WOFF2 only**. Do not commit the TTF/OTF originals — they are the licensed desktop files.
- **Licensing is unresolved** (`architecture.md` Open Decision #2). DIN is commercial; a webfont licence is a different tier from a desktop licence. Confirm before launch.

---

## 6. India presence map

`india-map.png` is a flat 860×721 raster with baked-in state labels. At mobile widths those labels render below 6px and are illegible. Regardless of which option is chosen, **a text list of the states of operation is required** as the accessible representation.

| Option | Effort | Result |
|---|---|---|
| **A — image + list** (default) | Low | Ships now. Map is decorative below `lg`, list carries the information. |
| **B — inline SVG** | Medium | Client supplies vector. States become paths; tooltips and highlighting become possible; scales cleanly. |
| **C — interactive map** | High | Per-state hover cards with capacity figures. Needs data the backend does not yet expose. |

Option A is implemented in FE-04. B/C are `architecture.md` Open Decision #6.

---

## 7. Optimisation pipeline

Run once, at migration time — not in CI. Committed assets are already optimised.

```bash
# Photographic PNG → JPEG
sharp -i vision-bg.png -o vision-background.jpg --format jpeg --quality 82 resize 2400

# JPEG re-encode
sharp -i hero-modules.jpg -o solar-modules.jpg --format jpeg --quality 80 resize 2400

# PNG with transparency
pngquant --quality=65-85 --strip engineer.png -o field-engineer.png

# SVG
svgo -f src/assets/icons --multipass
```

That `svgo` line covers only the top level of `icons/`, and it should stay that way: do not point it at the supplied icon set's subfolders. Its default preset rewrites path data and drops ids, and the animated files depend on both, through `<animate attributeName="d">` keyframes and the `url(#g)` gradient.

`next.config.ts` sets `formats: ['image/avif', 'image/webp']`, so AVIF/WebP derivatives are generated at request time. Commit the JPEG/PNG masters only.

**Budget check before any PR that adds an asset:** no committed raster exceeds **250KB**. If it must, note why in the PR description.

---

## 8. Azure Blob conventions

Backend-supplied assets (news images, investor PDFs, team photos) live in Blob Storage and arrive as absolute URLs.

- Compose with `blobUrl(path)` from `@/lib/utils/blob-url` — never string-concatenate at a call site.
- **One variable, two containers** (2026-10-29). `AZURE_BLOB_BASE_URL` is the storage account alone (`https://<account>.blob.core.windows.net`). The container is added in code, from `src/lib/config/blob-storage.ts`, because its name is the same in every environment: `blobUrl()` and `tryBlobUrl()` compose into **`sael-website`**, the site's own files under `web-assets/`, and `tryMediaUrl()` into **`sael-media-public`**, the backend's public media, where Module Manufacturing's three datasheets sit at `documents/module-manufacturing/`. Until then the variable named the `sael-website` container itself; a value that still does fails the build, since every URL composed on it would name the container twice. Unset, both return `null`: the datasheets are left out, and the roster falls back to initials.
- **Store the path, not the URL.** A fixture or a DTO carries `web-assets/media/our-team/jasbir-singh.jpg`; the account comes from `AZURE_BLOB_BASE_URL` and the container from code at render time. That is what keeps hostnames out of the repository (/CLAUDE.md §7) and lets one fixture work against any environment's account. `blobUrl()` passes an already-absolute value through, so a backend that returns full URLs needs no special case.
- Add the account host to `next.config.ts` `images.remotePatterns`.
- **PDFs are linked, not proxied.** `<a href={doc.file.url} target="_blank" rel="noopener noreferrer">` with the file type and size in the accessible label: *"Annual Return FY 2024-25, PDF, 2.4 MB, opens in a new tab"*.
- Never commit a PDF to the repository.
- **Page furniture can come from the container too, and `cdnImage()` is how.** §8 was
  written for backend-supplied assets that arrive as data. The About Us artwork is not
  data — it is fourteen fixed files a section renders unconditionally — and it moved to
  the container on 2026-09-17 all the same. `cdnImage(path, width, height)` from
  `@/lib/assets/cdn` describes one: it composes the URL with `blobUrl()` and carries the
  intrinsic dimensions a bundled import would otherwise have supplied, returning
  something shaped like `StaticImageData` so no consuming component changes. The
  dimensions must be read from the blob itself. Vectors must be rendered `unoptimized`.
- **The Careers page's six images** live at `web-assets/media/career/` and are described in `src/app/_content/career.ts` with dimensions read from the blobs themselves: `career-hero.webp` 1600 × 739 (the hero, a photograph since 2026-10-12), `career-image-1.webp` 1600 × 1069 (the intro photograph, replaced under the same name on 2026-10-12), and `career-image-2.webp`, `-3.webp` and `-4.webp` 1200 × 800 and `career-image-5.jpg` 1024 × 683 (the "Life at SAEL" gallery, in that order). The four gallery images were uploaded by the client on 2026-09-22 and are byte-identical to the live sael.co files, so their slot mapping is the live page's own; the hero and intro photographs were supplied by the client on 2026-10-12 and are not on the live page. Until then the hero was the live page's looping `career-video.mp4` with gallery 1 as its poster; nothing references that video now.
- **Contact Us's hero video is not uploaded yet.** The legacy page's banner plays `/video/green-growth-video.mp4` — 566,892 bytes, 1920 × 1080, 8 s, H.264 with an audio track, played muted there as here — and it has been the hero of `/contact-us/` since 2026-10-01 (`src/app/_content/contact-us.ts`). While `LEGACY_ASSET_BASE_URL` is set it plays from the legacy site; upload it to `web-assets/media/contact-us/green-growth-video.mp4`, where the page looks once that variable is unset. **No poster exists** (`contact-us/hero-poster`, pending): the legacy page has none, so a reduced-motion visitor sees the title over the dark ground until one is supplied.
- **The Offer Documents files (17) are not uploaded yet** — inventoried 2026-09-29 from the legacy pages, each legacy URL checked (all 200) and its size recorded. They are served from the container, never from the legacy site, which goes away at cutover. The rule is mechanical so the upload can be one pass: **a PDF's blob path is its legacy path with `web-assets` in front**, file name unchanged (including the legacy `corrigendum-to-drh.pdf`); the two videos and their posters go under `web-assets/media/offer-documents/`, file names unchanged. Until the upload, every Offer Documents link 404s. The same paths are in `src/lib/content/mock/data/investor-documents.json` and `investor-videos.json`, each row with its `legacyPath`.

  | Title (as the link reads) | Legacy path on www.sael.co | Blob path | Bytes |
  |---|---|---|---|
  | Draft Red Herring Prospectus — **gated** | `/documents/investors/offer-documents/drhp/SAEL_DRHP.pdf` | `web-assets/documents/investors/offer-documents/drhp/SAEL_DRHP.pdf` | 13,489,413 |
  | Corrigendum to DRHP | `/documents/investors/offer-documents/corrigendum-to-drhp/corrigendum-to-drh.pdf` | `web-assets/documents/investors/offer-documents/corrigendum-to-drhp/corrigendum-to-drh.pdf` | 550,149 |
  | Addendum to DRHP | `/documents/investors/offer-documents/addendum-to-drhp/Addendum-to-DRHP.pdf` | `web-assets/documents/investors/offer-documents/addendum-to-drhp/Addendum-to-DRHP.pdf` | 627,753 |
  | Final Report India RE Market Assessment SAEL 03112025 | `/documents/investors/offer-documents/industry-reports/Final-Report-India-RE-Market-Assessment-SAEL-03112025.pdf` | `web-assets/documents/investors/offer-documents/industry-reports/Final-Report-India-RE-Market-Assessment-SAEL-03112025.pdf` | 2,839,816 |
  | Dr. HS Awla Foundation (FY 2025) | `/documents/investors/offer-documents/information-with-respect-to-group-companies/FY-2025/Dr-HS-Awla-Foundation.pdf` | `web-assets` + legacy path | 8,026,910 |
  | Sapphire Agri Warehousing Private Limited (FY 2025) | `…/information-with-respect-to-group-companies/FY-2025/Sapphire-Agri-Warehousing-Private-Limited.pdf` | `web-assets` + legacy path | 2,995,880 |
  | Sun Layer Energy Private Limited (FY 2025) | `…/information-with-respect-to-group-companies/FY-2025/Sun-Layer-Energy-Private-Limited.pdf` | `web-assets` + legacy path | 12,194,000 |
  | Dr. HS Awla Foundation (FY 2024) | `…/FY-2024/Dr-HS-Awla-Foundation.pdf` | `web-assets` + legacy path | 6,933,934 |
  | Sapphire Agri Warehousing Private Limited (FY 2024) | `…/FY-2024/Sapphire-Agri-Warehousing-Private-Limited.pdf` | `web-assets` + legacy path | 1,513,884 |
  | Sun Layer Energy Private Limited (FY 2024) | `…/FY-2024/Sun-Layer-Energy-Private-Limited.pdf` | `web-assets` + legacy path | 7,208,449 |
  | Dr. HS Awla Foundation (FY 2023) | `…/FY-2023/Dr-HS-Awla-Foundation.pdf` | `web-assets` + legacy path | 2,231,861 |
  | Sapphire Agri Warehousing Private Limited (FY 2023) | `…/FY-2023/Sapphire-Agri-Warehousing-Private-Limited.pdf` | `web-assets` + legacy path | 11,268,615 |
  | Sun Layer Energy Private Limited (FY 2023) | `…/FY-2023/Sun-Layer-Energy-Private-Limited.pdf` | `web-assets` + legacy path | 1,641,679 |
  | DRHP - Audio Visual (English) — **gated** | `/video/SAEL-DRHP-English.mp4` | `web-assets/media/offer-documents/SAEL-DRHP-English.mp4` | 111,001,343 |
  | …its poster (1600 × 900) | `/img/site/drhp-english.png` | `web-assets/media/offer-documents/drhp-english.png` | 134,733 |
  | DRHP - Audio Visual (Hindi) — **gated** | `/video/SAEL-DRHP-Hindi.mp4` | `web-assets/media/offer-documents/SAEL-DRHP-Hindi.mp4` | 106,541,645 |
  | …its poster (1600 × 900) | `/img/site/drhp-hindi.png` | `web-assets/media/offer-documents/drhp-hindi.png` | 173,529 |

  The index page's eight tile icons (`/img/site/4603456.png` and siblings) are **not** migrated: they are stock Flaticon artwork of unknown licence, and the tiles draw lucide icons instead.
- **The rest of the investor area's files (146) are not uploaded yet either** — inventoried 2026-09-30 from the twelve legacy Corporate Governance, Financials & Reports and Notifications pages that list files. Same mechanical rule as Offer Documents: **the blob path is the legacy path with `web-assets` in front**, file name unchanged (including `Terms-&-condition-of-Independent-Directors.pdf`, whose `&` is part of the name). Until the upload, and while `LEGACY_ASSET_BASE_URL` is set, the mock serves each from the legacy site; the same rows, with their `legacyPath`, are in `src/lib/content/mock/data/investor-documents.json`. 145 of the 146 legacy URLs returned 200 on 2026-09-30; **one is broken on the legacy site itself** — `MGT 7 Mar'26` (Annual Return, FY 2026), marked below.

  | Title (as the link reads) | Legacy path under `/documents/investors/` | Category / section | Group | Bytes |
  |---|---|---|---|---|
  | MGT 7 Mar'26 | `financials-and-reports/annual-return/FY-2026/MGT-7-Mar-26.pdf` | annual-return | FY 2026 | **404 on legacy** |
  | MGT 7 Mar'25 | `financials-and-reports/annual-return/FY-2025/MGT-7-Mar-25.pdf` | annual-return | FY 2025 | 2,446,335 |
  | MGT 7 Mar'24 | `financials-and-reports/annual-return/FY-2024/MGT-7-March-24.pdf` | annual-return | FY 2024 | 4,812,984 |
  | MGT 7 Mar'23 | `financials-and-reports/annual-return/FY-2023/MGT-7-March-23.pdf` | annual-return | FY 2023 | 2,485,821 |
  | SAEL Industries Limited Consolidated Financial Statements | `financials-and-reports/consolidated-financials-of-the-company/FY-2025/SAEL-Industries-Limited-Consolidated-Financial-Statements.pdf` | consolidated-financials | FY 2025 | 7,846,659 |
  | SAEL Industries Limited Consolidated Financial Statements | `financials-and-reports/consolidated-financials-of-the-company/FY-2024/SAEL-Industries-Limited-Consolidated-Financial-Statements.pdf` | consolidated-financials | FY 2024 | 7,785,375 |
  | SAEL Industries Limited Consolidated Financial Statements | `financials-and-reports/consolidated-financials-of-the-company/FY-2023/SAEL-Industries-Limited-Consolidated-Financial-Statements.pdf` | consolidated-financials | FY 2023 | 5,576,415 |
  | SAEL Industries Limited | `financials-and-reports/standalone-financials-of-the-company/FY-2025/SAEL-Industries-Limited.pdf` | standalone-financials | FY 2025 | 4,998,361 |
  | SAEL Industries Ltd. | `financials-and-reports/standalone-financials-of-the-company/FY-2024/SAEL-Industries-Ltd.pdf` | standalone-financials | FY 2024 | 4,040,351 |
  | SAEL Industries Ltd. | `financials-and-reports/standalone-financials-of-the-company/FY-2023/SAEL-Industries-Ltd.pdf` | standalone-financials | FY 2023 | 3,522,628 |
  | Canal Solar Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Canal-Solar-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,273,616 |
  | Chattargarh Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Chattargarh-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,231,587 |
  | Jasrasar Green Power Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Jasrasar-Green-Power-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,424,431 |
  | Kaithal Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Kaithal-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,434,660 |
  | SAEL Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Limited.pdf` | subsidiary-financials | FY 2025 | 6,191,737 |
  | SAEL RE Power Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-RE-Power-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,702,024 |
  | SAEL Solar MGF Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-MGF-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 4,550,156 |
  | SAEL Solar MHP1 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-MHP1-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,743,107 |
  | SAEL Solar MHP2 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-MHP2-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,850,984 |
  | SAEL Solar P10 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-P10-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,641,327 |
  | SAEL Solar P4 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-P4-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,847,530 |
  | SAEL Solar P5 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-P5-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,883,894 |
  | SAEL Solar P6 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-P6-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 29,301,710 |
  | SAEL Solar P9 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-P9-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,625,002 |
  | SAEL Solar Solutions Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/SAEL-Solar-Solutions-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 30,757,560 |
  | Sardarshahar Agri Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Sardarshahar-Agri-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,984,423 |
  | KTA Powers Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/KTA-Powers-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,905,213 |
  | Sunfree Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Sunfree-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,041,387 |
  | Sunfree Energy RJP1 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Sunfree-Energy-RJP1-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 8,770,431 |
  | Sunfree North East Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Sunfree-North-East-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,118,125 |
  | Sunfree Paschim Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Sunfree-Paschim-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,627,557 |
  | TNA Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/TNA-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,806,516 |
  | Universal Biomass Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/Universal-Biomass-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 3,938,627 |
  | VCA Power Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2025/VCA-Power-Private-Limited.pdf` | subsidiary-financials | FY 2025 | 2,803,965 |
  | TNA Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/TNA-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,530,227 |
  | Sardarshahar Agri Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Sardarshahar-Agri-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 1,869,183 |
  | Jasrasar Green Power Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Jasrasar-Green-Power-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,055,578 |
  | SAEL Solar MHP2 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-MHP2-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 1,576,106 |
  | KTA Powers Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/KTA-Powers-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,196,794 |
  | VCA Power Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/VCA-Power-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,209,670 |
  | SAEL Solar MHP1 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-MHP1-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 1,852,541 |
  | Chattargarh Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Chattargarh-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,289,516 |
  | SAEL RE Power Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-RE-Power-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 8,365,751 |
  | Sunfree Energy RJP1 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Sunfree-Energy-RJP1-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 1,920,348 |
  | SAEL Solar MGF Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-MGF-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 4,053,485 |
  | SAEL Solar Solution Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-Solution-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 2,385,883 |
  | SAEL Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Limited.pdf` | subsidiary-financials | FY 2024 | 30,239,905 |
  | Sunfree Paschim Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Sunfree-Paschim-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 17,061,850 |
  | Canal Solar Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Canal-Solar-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 16,950,419 |
  | SAEL Kaithal Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Kaithal-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 21,214,269 |
  | SAEL Solar P6 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-P6-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 3,292,093 |
  | SAEL Solar P4 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-P4-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 47,858,260 |
  | SAEL Solar P5 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-P5-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 17,835,228 |
  | SAEL Solar P9 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-P9-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 3,299,814 |
  | SAEL Solar P10 Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/SAEL-Solar-P10-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 3,320,371 |
  | Sunfree Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Sunfree-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 10,173,524 |
  | Sunfree North East Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Sunfree-North-East-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 3,405,202 |
  | Universal Biomass Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2024/Universal-Biomass-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2024 | 18,862,143 |
  | Canal Solar Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Canal-Solar-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 3,054,365 |
  | Chattargarh Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Chattargarh-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,328,779 |
  | Jasrasar Green Power Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Jasrasar-Green-Power-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 15,361,158 |
  | SAEL Kaithal Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/SAEL-Kaithal-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 17,336,576 |
  | KTA Powers Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/KTA-Powers-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,301,472 |
  | SAEL Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/SAEL-Limited.pdf` | subsidiary-financials | FY 2023 | 69,843,282 |
  | SAEL RE Power Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/SAEL-RE-Power-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 1,721,706 |
  | SAEL Solar MFG Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/SAEL-Solar-MFG-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,633,696 |
  | SAEL Solar Solutions Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/SAEL-Solar-Solutions-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 6,820,762 |
  | Sardarshahar Agri Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Sardarshahar-Agri-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 1,657,664 |
  | TNA Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/TNA-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,513,704 |
  | VCA Power Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/VCA-Power-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,198,751 |
  | Sunfree North East Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Sunfree-North-East-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 2,956,413 |
  | Sunfree Paschim Renewable Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Sunfree-Paschim-Renewable-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 3,136,601 |
  | Universal Biomass Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Universal-Biomass-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 3,402,970 |
  | Sunfree Energy Private Limited | `financials-and-reports/standalone-financials-of-material-subsidiary-companies/FY-2023/Sunfree-Energy-Private-Limited.pdf` | subsidiary-financials | FY 2023 | 12,402,209 |
  | SAEL RG Financials 3M FY 2027 | `financials-and-reports/investor-downloads/FY-2027/SAEL-RG-Financials-3M-FY-2027.pdf` | investor-downloads | FY 2027 | 918,857 |
  | SAEL Restricted Group Financials March 2026 | `financials-and-reports/investor-downloads/FY-2026/SAEL-Restricted-Group-Financials-March-2026.pdf` | investor-downloads | FY 2026 | 5,423,060 |
  | SAEL Restricted Group Auditor's Report March 2026 | `financials-and-reports/investor-downloads/FY-2026/SAEL-Restricted-Group-Auditors-Report-March-2026.pdf` | investor-downloads | FY 2026 | 840,675 |
  | SAEL RG Financials 9M FY 2026 | `financials-and-reports/investor-downloads/FY-2026/SAEL-RG-Financials-9M-FY-2026.pdf` | investor-downloads | FY 2026 | 1,295,470 |
  | SAEL RG Financials 6M FY 2026 | `financials-and-reports/investor-downloads/FY-2025/SAEL-RG-Financials-6M-FY-2026.pdf` | investor-downloads | FY 2026 | 10,704,971 |
  | Unaudited RG June 2025 | `financials-and-reports/investor-downloads/FY-2025/Unaudited-RG-June-2025.pdf` | investor-downloads | FY 2025 | 1,839,575 |
  | SAEL Restricted Group_Financials and Report_March | `financials-and-reports/investor-downloads/FY-2025/SAEL-Restricted-Group-Financials-and-Report-March-2025.pdf` | investor-downloads | FY 2025 | 4,129,897 |
  | Compliance Certificate 2025 | `financials-and-reports/investor-downloads/FY-2025/Compliance-Certificate-2025.pdf` | investor-downloads | FY 2025 | 494,196 |
  | H1 FY25 Earnings Presentation | `financials-and-reports/investor-downloads/FY-2025/H1-FY2025-presentation-updated.pdf` | investor-downloads | FY 2025 | 1,960,821 |
  | Financial Report 2024 | `financials-and-reports/investor-downloads/FY-2024/Financial-Results-Dec-24.pdf` | investor-downloads | FY 2024 | 603,774 |
  | Financial Performance 2024 | `financials-and-reports/investor-downloads/FY-2024/Financial-Performance-December-2024.pdf` | investor-downloads | FY 2024 | 1,812,679 |
  | RG Financials September 2024 | `financials-and-reports/investor-downloads/FY-2024/RG-Financials-September-24_V1-updated-21nov24.pdf` | investor-downloads | FY 2024 | 604,751 |
  | Resignation letter of Ms. Kainaat Awla dt. 12.09.2025 | `notifications/FY-2026/Resignation-letter-of-Ms-Kainaat-Awla-dated-12-09-2025.pdf` | notifications | FY 2026 | 50,770 |
  | Resignation Letter of Mr. Inge Karsten Stoelen dt. 08.08.2024 | `notifications/FY-2025/Resignation-Letter-of-Mr-Inge-Karsten-Stoelen-dt-08-08-2024.pdf` | notifications | FY 2025 | 56,969 |
  | Whistleblower Policy | `corporate-governance/codes-and-policies/whistleblower-policy-feb-2026.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 348,516 |
  | Risk Management Policy | `corporate-governance/codes-and-policies/risk-management-policy-new.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 383,260 |
  | Code of practices and procedures for fair disclosure of unpublished price sensitive information | `corporate-governance/codes-and-policies/code-of-practices-and-procedures-for-fair-disclosure-of-unpublished-price-sensitive-information.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 650,298 |
  | Policy and procedure for enquiry in case of leak suspected leak of unpublished price sensitive information | `corporate-governance/codes-and-policies/policy-and-procedure-for-enquiry-in-case-of-leak-suspected-leak-of-unpublished-price-sensitive-information.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 325,395 |
  | Code of conduct to regulate, monitor, and report trading by designated persons | `corporate-governance/codes-and-policies/code-of-conduct-to-regulate-monitor-and-report-trading-by-designated-persons.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 696,100 |
  | Code of conduct for Board of members key managerial personnel & the senior management | `corporate-governance/codes-and-policies/code-of-conduct-for-board-of-members-key-managerial-personnel-and-the-senior-management.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 251,160 |
  | Policy on diversity of Board of Directors | `corporate-governance/codes-and-policies/policy-on-diversity-of-board-of-directors.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 506,417 |
  | Policy on materiality of related party transactions and on dealing with related party transactions | `corporate-governance/codes-and-policies/policy-on-materiality-of-related-party-transactions-and-on-dealing-with-related-party-transactions.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 304,516 |
  | Policy on determining material subsidiaries | `corporate-governance/codes-and-policies/policy-on-determining-material-subsidiaries.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 484,802 |
  | Corporate social responsibility policy | `corporate-governance/codes-and-policies/corporate-social-responsibility-policy.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 358,567 |
  | Nomination and Remuneration Policy | `corporate-governance/codes-and-policies/nomination-and-remuneration-policy.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 527,291 |
  | Policy on succession planning for the Board senior management | `corporate-governance/codes-and-policies/policy-on-succession-planning-for-the-board-senior-management.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 613,260 |
  | Policy on Familiarization programmes for independent directors | `corporate-governance/codes-and-policies/policy-on-familiarization-programmes-for-independent-directors.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 465,743 |
  | Archival Policy | `corporate-governance/codes-and-policies/archival-policy.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 514,663 |
  | Policy on Determination of Material Events and Information for Disclosures | `corporate-governance/codes-and-policies/policy-on-determination-of-material-events-and-information-for-disclosures.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 391,008 |
  | Dividend Distribution Policy | `corporate-governance/codes-and-policies/dividend-distribution-policy.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 673,816 |
  | Terms of Reference for the Committees | `corporate-governance/codes-and-policies/terms-of-reference-for-the-committees.pdf` | corporate-governance / codes-and-policies | Statutory Policies | 232,356 |
  | Environment and Social (E&S) Policy | `corporate-governance/codes-and-policies/environment-and-social-policy.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 2,420,500 |
  | Environment & Social Management System | `corporate-governance/codes-and-policies/esms-new.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 1,436,294 |
  | Applicable Appendix’s to Environment & Social Management System | `corporate-governance/codes-and-policies/Appendixs_SAEL_ESMS.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 3,863,382 |
  | Stakeholder Engagement and Communication Policy | `corporate-governance/codes-and-policies/stakeholder-engagement-and-communication-policy.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 2,257,271 |
  | Anti-Bribery and Corruption Policy | `corporate-governance/codes-and-policies/anti-bribery-and-corruption-policy.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 942,439 |
  | Policy On Prevention of Sexual Harassment of Employees | `corporate-governance/codes-and-policies/policy-on-prevention-of-sexual-harrasment-of-employees.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 1,185,521 |
  | Terms & Conditions of Independent Directors | `corporate-governance/codes-and-policies/Terms-&-condition-of-Independent-Directors.pdf` | corporate-governance / codes-and-policies | Corporate Policies | 493,735 |
  | ESG Report CY24 | `corporate-governance/sustainability-reports/7th-version_SAEL-ESG-Report-23-24.pdf` | corporate-governance / sustainability-reports | ESG and GHG Reports | 11,859,549 |
  | ESG Report CY23 | `corporate-governance/sustainability-reports/sael-esg-report-cy-2023.pdf` | corporate-governance / sustainability-reports | ESG and GHG Reports | 8,143,097 |
  | Environmental and Social Impact Assessment (ESIA) | `corporate-governance/sustainability-reports/environmental-and-social-impact-assessment-esia-300mw-solar-power-plant-ysr-kadapa-anantapur-districts-andhra-pradesh.pdf` | corporate-governance / sustainability-reports | SAEL Solar 300MW MHP1 Project’s Environment & Social Reports | 16,530,982 |
  | Critical Habitat Assessment for a Proposed Solar Power Project in YSR (Kadapa) and Anantapur Districts | `corporate-governance/sustainability-reports/Critical-Habitat-Assesment-CHA-or-300MW-Solar-Power-Plant.pdf` | corporate-governance / sustainability-reports | SAEL Solar 300MW MHP1 Project’s Environment & Social Reports | 2,973,766 |
  | Climate Risk and Adaption Assessment (CRA) for 300MW Solar Power Plant | `corporate-governance/sustainability-reports/climate-risk-and-adaption-assessment-cra-for-300mw-solar-power-plant.pdf` | corporate-governance / sustainability-reports | SAEL Solar 300MW MHP1 Project’s Environment & Social Reports | 7,164,209 |
  | SIL_CSR Altered Annual Action Plan for FY 2025-26 | `corporate-governance/csr/sil-csr-altered-annual-action-plan-for-fy-2025-26.pdf` | corporate-governance / csr | FY2026 | 127,280 |
  | SIL_CSR Annual Action Plan for FY 2025-26 | `corporate-governance/csr/SIL-CSR-Annual-Action-Plan-for-FY-2025-26.pdf` | corporate-governance / csr | FY2026 | 108,730 |
  | SIL_CSR Annual Action Plan for FY 2026-27 | `corporate-governance/csr/sil-csr-annual-action-plan-for-fy-2026-27.pdf` | corporate-governance / csr | FY2027 | 125,998 |
  | Notice of 4th AGM held in 2026 | `corporate-governance/general-meeting/gm-notice-of-4th-agm-held-in-2026.pdf` | corporate-governance / general-meeting | Annual General | 301,354 |
  | Notice of 3rd AGM held in 2025 | `corporate-governance/general-meeting/gm-notice-of-3rd-agm-held-in-2025.pdf` | corporate-governance / general-meeting | Annual General | 559,859 |
  | Notice of 2nd AGM held in 2024 | `corporate-governance/general-meeting/gm-notice-of-2nd-agm-held-in-2024.pdf` | corporate-governance / general-meeting | Annual General | 467,853 |
  | Notice of 1st AGM held in 2023 | `corporate-governance/general-meeting/gm-notice-of-1st-agm-held-in-2023.pdf` | corporate-governance / general-meeting | Annual General | 436,430 |
  | Notice of 4th EGM for FY 2025-26 dt. 31.10.2025 | `corporate-governance/general-meeting/FY-2026/Notice-of-4th-EGM-for-FY-2025-26-dt-31-10-2025.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2026 | 629,361 |
  | Notice of 3rd EGM for FY 2025-26 dt. 04.10.2025 | `corporate-governance/general-meeting/FY-2026/Notice-of-3rd-EGM-for-FY-2025-26-dt-04-10-2025.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2026 | 547,000 |
  | Notice of 2nd EGM for FY 2025-26 dt. 22.09.2025 | `corporate-governance/general-meeting/FY-2026/Notice-of-2nd-EGM-for-FY-2025-26-dt-22-09-2025.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2026 | 520,581 |
  | Notice of 1st EGM for FY 2025-26 dt. 25.08.2025 | `corporate-governance/general-meeting/FY-2026/Notice-of-1st-EGM-for-FY-2025-26-dt-25-08-2025.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2026 | 292,013 |
  | Notice of 2nd EGM for FY 2024-25 dt. 23.01.2025.pdf | `corporate-governance/general-meeting/FY-2025/Notice-of-2nd-EGM-for-FY-2024-25-dt-23-01-2025.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2025 | 1,424,880 |
  | Notice of 1st EGM for FY 2024-25 dt. 30.12.2024.pdf | `corporate-governance/general-meeting/FY-2025/Notice-of-1st-EGM-for-FY-2024-25-dt-30-12-2024.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2025 | 979,415 |
  | Notice of 4th EGM for FY 2023-24 dt. 16.02.2024.pdf | `corporate-governance/general-meeting/FY-2024/Notice-of-4th-EGM-for-FY-2023-24-dt-16-02-2024.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2024 | 1,096,966 |
  | Notice of 3rd EGM for FY 2023-24 dt. 20.01.2024.pdf | `corporate-governance/general-meeting/FY-2024/Notice-of-3rd-EGM-for-FY-2023-24-dt-20-01-2024.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2024 | 1,437,931 |
  | Notice of 2nd EGM for FY 2023-24 dt. 06.12.2023.pdf | `corporate-governance/general-meeting/FY-2024/Notice-of-2nd-EGM-for-FY-2023-24-dt-06-12-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2024 | 1,088,629 |
  | Notice of 1st EGM for FY 2023-24 dt. 19.04.2023.pdf | `corporate-governance/general-meeting/FY-2024/Notice-of-1st-EGM-for-FY-2023-24-dt-19-04-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2024 | 690,926 |
  | Notice of 7th EGM for FY 2022-23 dt. 21.03.2023.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-7th-EGM-for-FY-2022-23-dt-21-03-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 1,004,846 |
  | Notice of 6th EGM for FY 2022-23 dt. 17.02.2023.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-6th-EGM-for-FY-2022-23-dt-17-02-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 1,010,650 |
  | Notice of 5th EGM for FY 2022-23 dt. 24.01.2023.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-5th-EGM-for-FY-2022-23-dt-24-01-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 1,159,887 |
  | Notice of 4th EGM for FY 2022-23 dt. 24.01.2023.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-4th-EGM-for-FY-2022-23-dt-24-01-2023.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 979,643 |
  | Notice of 3rd EGM for FY 2022-23 dt. 02.06.2022.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-3rd-EGM-for-FY-2022-23-dt-02-06-2022.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 994,180 |
  | Notice of 2nd EGM for FY 2022-23 dt. 02.06.2022.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-2nd-EGM-for-FY-2022-23-dt-02-06-2022.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 930,402 |
  | Notice of 1st EGM for FY 2022-23 dt. 30.04.2022.pdf | `corporate-governance/general-meeting/FY-2023/Notice-of-1st-EGM-for-FY-2022-23-dt-30-04-2022.pdf` | corporate-governance / general-meeting | Extra-Ordinary General Meeting › FY 2023 | 949,328 |
  | Familiarization Programme_FY-2025-26 | `corporate-governance/familiarization-programme/FY-2026/familiarization-programme-fy-2025-26.pdf` | corporate-governance / familiarization-programme | FY 2026 | 88,446 |
  | Memorandum of Association and Articles of Association | `corporate-governance/other-documents/MOA-AOA-SAEL-Industries-Limited.pdf` | corporate-governance / other-documents | Other Documents | 6,883,941 |
  | Composite Scheme of Arrangement | `corporate-governance/other-documents/composite-scheme-of-arrangement.pdf` | corporate-governance / other-documents | Composite Scheme of Arrangement | 5,988,382 |
  | Jagbani Advertisement | `corporate-governance/other-documents/jagbani-advertisement.pdf` | corporate-governance / other-documents | Composite Scheme of Arrangement | 661,143 |
  | Tribune Advertisement | `corporate-governance/other-documents/tribune-advertisement.pdf` | corporate-governance / other-documents | Composite Scheme of Arrangement | 601,031 |

- Never commit a backend-supplied image either. The seventeen `/our-team/` portraits were briefly mirrored into `public/team/` while the client's URLs were outstanding; **the client supplied them on 2026-09-10** and the copies were deleted. They live at `web-assets/media/our-team/<slug>.<ext>` — thirteen `.jpg`, three `.webp`, one `.png` — and are named in `ourTeamMembers`, `src/app/_content/our-team.ts`. **Checked 2026-10-02: all seventeen are byte-identical (SHA-256) to the files the live `/our-team/` serves from `/img/team/`.** They are in the agency's container today; at cutover `web-assets/` is copied to SAEL's account and the site rebuilt (backend `docs/tenant-cutover-checklist.md` §1.12). The board pages carry no photographs.

---

- **The Newsroom's images (60) are not uploaded yet** — inventoried 2026-10-01 from the legacy listing and article pages, every URL checked (all 200), with the pixel size and byte count read from the files the same day. Same mechanical rule as the investor files: **the blob path is the legacy path with `web-assets` in front** — `/img/media/<file>` → `web-assets/img/media/<file>`, file name unchanged. 59 are card images, each also its article's lead image and `og:image` where it has an article; one is inside an article body. While `LEGACY_ASSET_BASE_URL` is set the mock serves each from the legacy site, and `next.config.ts` derives a `remotePatterns` entry for that origin's `/img/` from the same variable, so no hostname is committed. The paths are in `src/lib/content/mock/data/newsroom-items.json` (`image.legacyPath` / `image.path`; the body image as a root-relative `src` in its `body`).

  The legacy CMS wrote the body image's `src` on a development host (`dev1024.sael.co`); the same path serves the same file on www.sael.co, and only the path is kept. It had no `alt` either; the one it has now is a neutral description pending the client's caption.

  Multimedia thumbnails are not files of ours: they are YouTube's (`i.ytimg.com`), built from each video's id, and that host is in `remotePatterns` so `next/image` optimises them. The legacy site's play-button image (`/img/site/play-icon.png`) is not migrated; the cards draw their own.

  | Section | Item id | File under `/img/media/` (legacy) and `web-assets/img/media/` (blob) | Pixels | Bytes |
  |---|---|---|---|---|
  | Press Release | `renewable-energy-company-sael-secures-supply-orders-for-1-gwp-of-solar-pv-modules-ntpc-rels-chitrakoot-project-accounts-for-5858-mwp` | `renewable-energy-company-sael-secures-supply-orders-for-1-gwp-of-solar-pv-modules-ntpc-rels-chitrakoot-project-accounts-for-5858-mwp-1788339326.webp` | 700 × 394 | 52,214 |
  | Press Release | `sael-commissions-its-11th-agri-waste-to-energy-plant-in-india` | `sael-commissions-its-11th-agri-waste-to-energy-plant-in-india-1781155767.webp` | 700 × 394 | 42,392 |
  | Press Release | `sael-commissions-600-mw-solar-power-projects-in-kurnool-andhra-pradesh` | `sael-commissions-600-mw-solar-power-projects-in-kurnool-andhra-pradesh-1777194516.webp` | 700 × 391 | 57,994 |
  | Press Release | `sael-commissions-1-gwp-solar-project-at-worlds-largest-re-park-groups-total-operational-capacity-crosses-2-gwp` | `sael-commissions-1-gwp-solar-project-at-worlds-largest-re-park-groups-total-operational-capacity-crosses-2-gwp-1769688561.webp` | 700 × 431 | 24,854 |
  | Press Release | `sael-to-procure-20-lakh-tonnes-of-paddy-stubble-this-season-via-aggregator-aims-to-convert-waste-into-clean-energy-and-curb-pollution-from-stubble-burning` | `sael-to-procure-20-lakh-tonnes-of-paddy-stubble-this-season-via-aggregator-aims-to-convert-waste-into-clean-energy-and-curb-pollution-from-stubble-burning-1761379345.webp` | 700 × 394 | 38,188 |
  | Press Release | `sael-industries-ltd-commissions-298-mw-dc-solar-project-in-jalore-rajasthan` | `sael-industries-ltd-commissions-298-mw-dc-solar-project-in-jalore-rajasthan-1756645833.webp` | 700 × 394 | 77,466 |
  | Press Release | `sael-signs-ppas-for-880-mw-solar-projects-in-gujarat-and-punjab` | `sael-signs-ppas-for-880-mw-solar-projects-in-gujarat-and-punjab-1756649533.webp` | 700 × 392 | 78,930 |
  | Press Release | `sael-conducts-awareness-drive-on-climate-smart-agricultural-practices-for-farmers-in-punjab-haryana-and-rajasthan` | `sael-conducts-awareness-drive-on-climate-smart-agricultural-practices-for-farmers-in-punjab-haryana-and-rajasthan-1753862988.webp` | 700 × 394 | 24,784 |
  | Press Release | `sael-commissions-50-mw-solar-power-plant-in-beed-maharashtra` | `sael-commissions-50-mw-solar-power-plant-in-beed-maharashtra-1761716452.webp` | 700 × 394 | 120,514 |
  | Press Release | `sael-to-set-up-rs8200-crore-integrated-solar-facility-in-uttar-pradesh` | `sael-to-set-up-rs8200-crore-integrated-solar-facility-in-uttar-pradesh-1753361161.webp` | 700 × 394 | 22,952 |
  | Press Release | `sael-secures-480-mw-solar-power-agreement-with-guvnl-in-gujarat` | `sael-secures-480-mw-solar-power-agreement-with-guvnl-in-gujarat-1753360901.webp` | 700 × 394 | 56,342 |
  | Press Release | `sael-signs-400-mw-solar-power-purchase-agreement-with-pspcl-in-punjab` | `sael-signs-400-mw-solar-power-purchase-agreement-with-pspcl-in-punjab-1753361318.webp` | 700 × 394 | 44,328 |
  | Press Release | `sael-secures-us132-million-investment-from-ndb-aiib-societe-generale-for-solar-project-in-andhra-pradesh` | `sael-secures-us132-million-investment-from-ndb-aiib-societe-generale-for-solar-project-in-andhra-pradesh-1753361416.webp` | 700 × 394 | 28,262 |
  | Our Views | `bridging-the-talent-divide-empowering-rural-talent-to-power-india39s-green-future` | `bridging-the-talent-divide-empowering-rural-talent-to-power-india39s-green-future-1756649255.webp` | 700 × 467 | 47,938 |
  | Our Views | `indias-solar-manufacturing-growth-moving-towards-energy-independence` | `indias-solar-supply-chain-evolution-from-dependency-to-domestic-strength-1744197119.webp` | 700 × 394 | 16,490 |
  | Our Views | `transforming-renewable-energy-bridging-gaps-in-the-digital-journey` | `transforming-renewable-energy-bridging-gaps-in-the-digital-journey-1744279942.webp` | 700 × 394 | 20,792 |
  | Our Views | `beyond-the-rs-20000-crore-boost-the-path-to-faster-green-energy-progress` | `the-path-to-faster-green-energy-progress.jpg` | 800 × 450 | 42,023 |
  | In The News | `sael-secures-1-gwp-solar-module-orders-in-six-months-ntpc-project-accounts-for-5858-mwp` | `sael-secures-1-gwp-solar-module-orders-in-six-months-ntpc-project-accounts-for-5858-mwp-1788798411.webp` | 700 × 381 | 41,050 |
  | In The News | `sael-unveils-integrated-5gw-solar-cell-module-manufacturing-facility-at-jewar` | `sael-unveils-integrated-5gw-solar-cell-module-manufacturing-facility-at-jewar-1783420907.webp` | 700 × 480 | 26,612 |
  | In The News | `sael-industries-commissions-149-mw-agri-waste-to-energy-plant-in-rajasthans-bhadra` | `sael-industries-commissions-149-mw-agri-waste-to-energy-plant-in-rajasthans-bhadra-1781155849.webp` | 700 × 394 | 42,392 |
  | In The News | `nara-lokesh-inaugurates-600-mw-sael-solar-projects-in-andhra-pradesh` | `nara-lokesh-inaugurates-600-mw-sael-solar-projects-in-andhra-pradesh-1781159381.webp` | 700 × 412 | 17,050 |
  | In The News | `sael-commissions-rs-3000-crore-solar-projects-in-kadapa-kurnool` | `sael-commissions-rs-3000-crore-solar-projects-in-kadapa-kurnool-1781159715.webp` | 700 × 396 | 32,190 |
  | In The News | `crisil-ratings-assigns-a-stable-long-term-and-a2-short-term-ratings-to-sael-industries` | `crisil-ratings-assigns-a-stable-long-term-and-a2-short-term-ratings-to-sael-industries-1781159151.webp` | 700 × 532 | 19,076 |
  | In The News | `iran-war-has-fuelled-15-20-spike-in-solar-module-prices-sael-ceo` | `iran-war-has-fuelled-15-20-spike-in-solar-module-prices-sael-ceo-1781157743.webp` | 700 × 394 | 25,138 |
  | In The News | `india-emerges-as-third-largest-renewable-energy-market-in-2025-irena` | `india-emerges-as-third-largest-renewable-energy-market-in-2025-irena-1781161307.webp` | 700 × 427 | 14,672 |
  | In The News | `ipo-bound-sael-industries-begins-1-gigawatt-solar-plant-at-khavda-renewable-energy-park` | `ipo-bound-sael-industries-begins-1-gigawatt-solar-plant-at-khavda-renewable-energy-park-1769690287.webp` | 700 × 394 | 20,788 |
  | In The News | `pb-har-saw-marked-decline-in-stubble-burning-cases-this-year` | `pb-har-saw-marked-decline-in-stubble-burning-cases-this-year-1765731011.webp` | 700 × 394 | 42,614 |
  | In The News | `yeida-allots-200-acres-land-to-build-rs8200-crore-solar-hub` | `yeida-allots-200-acres-land-to-build-rs8200-crore-solar-hub-1765730414.webp` | 700 × 394 | 36,296 |
  | In The News | `sael-industries-to-invest-rs22000-crore-in-ap` | `sael-industries-to-invest-rs22000-crore-in-ap-1765730191.webp` | 700 × 394 | 62,452 |
  | In The News | `clean-energy-firm-to-procure-2-million-tonnes-of-paddy-stubble` | `clean-energy-firm-to-procure-2-million-tonnes-of-paddy-stubble-1765729093.webp` | 700 × 394 | 28,448 |
  | In The News | `et-energy-leadership-summit-2025-maps-indias-clean-energy-transition` | `et-energy-leadership-summit-2025-maps-indias-clean-energy-transition-1765728748.webp` | 700 × 394 | 12,874 |
  | In The News | `agri-waste-power-can-generate-28-gw-needs-solar-like-policy-push-sael-ceo` | `agri-waste-power-can-generate-28-gw-needs-solar-like-policy-push-sael-ceo-1765728181.webp` | 700 × 394 | 20,614 |
  | In The News | `sael-industries-commissions-first-300-mw-solar-power-project-in-rajasthan` | `sael-industries-commissions-first-300-mw-solar-power-project-in-rajasthan-1761716516.webp` | 700 × 394 | 48,642 |
  | In The News | `sael-signs-ppas-with-guvnl-pspcl-for-880-mw-solar-projects` | `sael-signs-ppas-with-guvnl-pspcl-for-880-mw-solar-projects-1761716532.webp` | 700 × 394 | 55,614 |
  | In The News | `can-straw-fired-power-plants-help-end-stubble-burning` | `can-straw-fired-power-plants-help-end-stubble-burning-1755669502.webp` | 700 × 394 | 52,762 |
  | In The News | `100-gw-of-solar-again-and-amendments-to-almm` | `100-gw-of-solar-again-and-amendments-to-almm-1755669343.webp` | 700 × 394 | 49,894 |
  | In The News | `laxit-awla-on-saels-role-in-accelerating-indias-clean-energy-future` | `laxit-awla-on-saels-role-in-accelerating-indias-clean-energy-future-1755669231.webp` | 700 × 394 | 6,004 |
  | In The News | `sael-lights-beed-with-new-50-mw-solar-plant-installation` | `sael-lights-beed-with-new-50-mw-solar-plant-installation-1755668875.webp` | 700 × 394 | 57,830 |
  | In The News | `interview-sael-ceo-laxit-awla-on-closing-indias-solar-storage-gaps-and-navigating-us-tariffs` | `interview-sael-ceo-laxit-awla-on-closing-indias-solar-storage-gaps-and-navigating-us-tariffs-1755669084.webp` | 700 × 394 | 14,866 |
  | In The News | `sael-conducts-climate-smart-farming-awareness-drive-for-over-200-farmers-in-north-india` | `sael-conducts-climate-smart-farming-awareness-drive-for-over-200-farmers-in-north-india-1755668732.webp` | 700 × 394 | 24,526 |
  | In The News | `sael-industries-to-invest-rs8200-crore-in-greater-noida-solar-unit` | `sael-industries-to-invest-rs8200-crore-in-greater-noida-solar-unit-1755668648.webp` | 700 × 394 | 48,344 |
  | In The News | `indian-clean-energy-firm-sael-to-invest-954-mln-in-solar-manufacturing-plant` | `indian-clean-energy-firm-sael-to-invest-954-mln-in-solar-manufacturing-plant-1755668493.webp` | 700 × 394 | 16,820 |
  | In The News | `chandigarh-sael-signs-400-mw-solar-ppa-with-pspcl` | `chandigarh-sael-signs-400-mw-solar-ppa-with-pspcl-1755668316.webp` | 700 × 394 | 41,716 |
  | In The News | `green-fuels-clean-tech-and-climate-finance-on-agenda-as-india-gathers-for-et-india-net-zero-forum-2025` | `green-fuels-clean-tech-and-climate-finance-on-agenda-as-india-gathers-for-et-india-net-zero-forum-2025-1755668225.webp` | 700 × 394 | 13,710 |
  | In The News | `sael-to-commission-25-gw-solar-capacity-by-fy26-eyes-ipo-amid-limited-waste-to-energy-pipeline` | `sael-to-commission-25-gw-solar-capacity-by-fy26-eyes-ipo-amid-limited-waste-to-energy-pipeline-1755667987.webp` | 700 × 394 | 51,334 |
  | In The News | `ipo-bound-sael-to-venture-into-solar-cells-with-a-rs5000-crore-plant-in-up` | `ipo-bound-sael-to-venture-into-solar-cells-with-a-rs5000-crore-plant-in-up-1755667786.webp` | 700 × 394 | 73,732 |
  | In The News | `reliance-sael-jindal-sembcorp-jbm-and-fastnote-win-big-in-sjvns-1200-mw-solar-integrated-with-600-mw-2400-mwh-ess-auction` | `reliance-sael-jindal-sembcorp-jbm-and-fastnote-win-big-in-sjvns-1200-mw-solar-integrated-with-600-mw-2400-mwh-ess-auction-1753357195.webp` | 700 × 394 | 37,044 |
  | In The News | `from-intermittency-to-reliability-the-role-of-energy-storage-in-scaling-indian-solar-pv` | `from-intermittency-to-reliability-the-role-of-energy-storage-in-scaling-indian-solar-pv-1753357150.webp` | 700 × 394 | 26,218 |
  | In The News | `bridging-the-digital-divide-the-reality-of-transformation-in-renewable-energy` | `bridging-the-digital-divide-the-reality-of-transformation-in-renewable-energy-1753356848.webp` | 700 × 468 | 22,054 |
  | In The News | `solar-manufacturing-in-india-paving-the-way-for-a-self-reliant-renewable-future` | `solar-manufacturing-in-india-paving-the-way-for-a-self-reliant-renewable-future-1753356814.webp` | 700 × 394 | 18,444 |
  | In The News | `delegates-of-norfund-societe-generale-ndb-bank-and-sael-ltd-meet-andhra-pradesh-cm-naidu` | `delegates-of-norfund-societe-generale-ndb-bank-and-sael-ltd-meet-andhra-pradesh-cm-naidu-1753356782.webp` | 700 × 395 | 29,426 |
  | In The News | `sael-ntpc-blupine-win-secis-12-gw-solar-auction` | `sael-ntpc-blupine-win-secis-12-gw-solar-auction-1753356720.webp` | 700 × 394 | 53,020 |
  | In The News | `sael-raises-305-m-via-green-bond-issue-overseas` | `sael-raises-305-m-via-green-bond-issue-overseas-1753356645.webp` | 700 × 394 | 57,696 |
  | In The News | `sael-invests-rs35000-crore-in-renewable-expansion` | `sael-invests-rs35000-crore-in-renewable-expansion-1753356924.webp` | 700 × 394 | 36,322 |
  | In The News | `sael-to-invest-rs-350-billion-in-renewable-expansion` | `sael-to-invest-rs-350-billion-in-renewable-expansion-1753356465.webp` | 700 × 394 | 22,204 |
  | In The News | `sael-to-redefine-the-energy-landscape-by-delivering-sustainable-solutions` | `sael-to-redefine-the-energy-landscape-by-delivering-sustainable-solutions-1753356584.webp` | 700 × 394 | 56,116 |
  | In The News | `sael-to-invest-rs35000-crore-in-renewable-expansion-eyes-10-gw-capacity` | `sael-to-invest-rs35000-crore-in-renewable-expansion-eyes-10-gw-capacity-1753356323.webp` | 700 × 394 | 48,642 |
  | In The News | `100-bustards-and-the-challenge-to-indias-solar-flight-path` | `100-bustards-and-the-challenge-to-indias-solar-flight-path-1753356267.webp` | 700 × 394 | 120,514 |
  | In The News | `sael-set-to-close-1-billion-fundraise-from-foreign-domestic-investors` | `sael-set-to-close-1-billion-fundraise-from-foreign-domestic-investors-1753357070.webp` | 700 × 465 | 41,692 |
  | Press Release body image | `sael-to-set-up-rs8200-crore-integrated-solar-facility-in-uttar-pradesh` | `image-1png_1753361154.webp` | 700 × 676 | 34,682 |

## 9. Handover checklist

Items the client must supply before the relevant tracker item can complete:

- [x] ~~DIN font files~~ — supplied. WOFF2 in `src/assets/fonts/`, bold cut from
      the OTF. See that folder's README.
- [x] ~~Business tile icon SVGs~~ — supplied, mapped above. Lettering still to
      resolve.
- [ ] SAEL logo as **SVG**, colour variant — deferred, PNG in use meanwhile in the
      masthead. `sael-logo-dark.svg` is a vector of the same wordmark and may be
      the answer here too; it has not been checked against a light ground
- [x] ~~SAEL logo, **white** variant~~ — supplied 2026-08-27 as
      `sael-logo-dark.svg`, which unblocked the footer
- [ ] Business tile icons **without baked-in lettering** — *blocks FE-04 tiles*
- [ ] DIN webfont licence confirmation — *blocks launch*
- [ ] A cut of DIN containing `₹` (U+20B9) — absent from every supplied file
- [ ] High-resolution masters for the three news images — *blocks FE-04*
- [ ] Art-directed **portrait crops** of the four hero photographs — *blocks FE-04*
- [ ] Confirmation that hero photography is final (three unused hero images in the prototype) — *blocks FE-04*
- [ ] India map as vector, if Option B or C is chosen — *blocks Open Decision #6*
- [x] ~~**About Us: the page assets**~~ — supplied 2026-09-10 (eleven) and completed
      2026-09-17 (the three cut-out panels), under
      `<container>/web-assets/media/about-us/`: the boardroom banner, the solar-field
      photograph, the Our Ambition portrait, both cut-out panels, the cut-out sitter, and
      `principle-icon-1` … `-8`. They were committed at `src/assets/images/about-us/` and
      imported until the container was populated; **the local copies were deleted on
      2026-09-17** and all fourteen are now described by `cdnImage()` — see
      `src/lib/assets/cdn.ts` and the folder note in `src/app/_content/about-us.ts`.
      Since 2026-10-08 the eight principle icons are no longer used (the supplied
      animated icons replaced them); the blobs remain in the container
- [ ] **Rename `about-us-hero.JPG` on the CDN to `about-us-hero.jpg`.** Azure Blob names
      are case-sensitive and this is the only file in the folder that is not lowercase,
      so the call site has to spell the extension in upper case. It blocked the CDN swap
      while Turbopack was being asked to bundle the file — it refuses an uppercase
      extension outright (*Unknown module type*) — but nothing bundles it now.
      *tidiness only; blocks nothing*
- [ ] **The Our Ambition sitter's name and role.** The asset is
      `our-ambition-person-image.webp` and the design labelled it only "Portrait
      photograph", so the `alt` describes what is visible — "A person in a business
      suit standing in an office" — and asserts no identity. It should name them

- [ ] **Upload the seventeen Offer Documents files** to the blob paths in §8 —
      *blocks launch of `/investors/offer-documents/`*; every link on those pages
      404s until then
- [ ] **Upload the investor area's other 146 files** to the blob paths in §8 —
      Corporate Governance, Financials & Reports and Notifications; *blocks
      launch of those pages once `LEGACY_ASSET_BASE_URL` is unset*
- [ ] **Supply `MGT 7 Mar'26`** (Annual Return, FY 2026) — the legacy page
      links `annual-return/FY-2026/MGT-7-Mar-26.pdf`, which is 404 on the
      legacy site itself, so there is no file to migrate
- [ ] **Caption files for both DRHP audio-visual videos** (WebVTT — `.vtt`),
      English and Hindi. None exist: the legacy `<video>` carries no `<track>`,
      and these are spoken presentations. The site ships without them because
      there is nothing to ship, not because they are optional. **The backend
      has no caption field** (`api-contracts.md` §9) — the player can show
      tracks, but nothing can deliver them until one is added there. Proposed paths: `web-assets/media/offer-documents/
      SAEL-DRHP-English.en.vtt` and `SAEL-DRHP-Hindi.hi.vtt`
- [ ] **A CORS rule on the blob container** allowing `GET` from the site's
      origins — needed before the first caption file goes up, since a
      cross-origin `<track>` does not load without it
- [ ] **Consider re-muxing both DRHP videos with `-movflags +faststart`**
      (lossless — no re-encode). Both files put their `moov` atom after 106–111 MB
      of media, so a browser has to fetch the file's tail before it can start.
      It still plays, via a range request; it starts slower. Legal may prefer
      the files byte-identical to what was filed, which is a reason to leave them
- [ ] Favicon / app icon source
- [ ] OG share image, 1200×630

---

## 10. The client handover dump

On 2026-08-04 the client delivered a raw asset dump. It lives at `/assets/`,
which is **untracked and gitignored** — it holds licensed font originals, and
it has already been replaced once. **Nothing is referenced from there at
runtime.** Anything the site needs is processed into `src/assets/` and
committed. Treat `/assets/` as read-only source material that may vanish.

There is no naming convention in it, folders are nested and duplicated, and
several files appear two or three times under different names.

### What is worth knowing about

| Path (under `assets/Web Assets & Refrences/`) | What it is |
|---|---|
| `SAEL - New Website.pdf` | **The client's own homepage design.** A single-page Illustrator export, and the most useful reference in the dump. |
| `drive-download-…/Business Icons/` | The four business icon SVGs and their white-text PNG variants. Mapped in §4. |
| `drive-download-…/Fonts/` | DIN regular/bold. Already processed — see `src/assets/fonts/README.md`. |
| `drive-download-…/Images/` | 15 photographic masters: solar farms, module and cell manufacturing, the waste-to-energy plant, biomass conveyor, farmers and engineers. |
| `drive-download-…/Website Reference Images/` | The four hero portraits from the design, as high-resolution masters. |
| `shapes/1..14.svg` | 14 chamfered gradient shapes used in the design as image masks and decoration. |
| `Shape reference/linkedin1..4.png` | Screenshots showing those shapes in use on the client's LinkedIn creatives. |
| `SAEL - New Website_Folder/` | Photography plus screenshots of the design. Its `Fonts/` also holds Gotham and Myriad Pro — **ignore both; the project is DIN only.** |
| `…/Social Media Architecture final.ai` | Saved without PDF content, so unreadable outside Illustrator. Its `.txt` sibling is only a package report. |

### How the client's design differs from the prototype

> **Reversed 2026-08-04, later the same day: the PDF is the design, and the
> prototype is reference only.** The client's instruction was explicit — the
> PDF "is the actual thing we have to make", and the Designer prototype "was
> also created by AI, so it's just a reference".
>
> So where the two disagree on **layout or composition**, the PDF wins and the
> feature docs in `docs/features/` are the stale ones. Where the PDF simply has
> no content — it sets Lorem ipsum in the business tile descriptions — the
> prototype supplies it. Neither source may be used to invent a figure.
>
> The earlier decision recorded here said the opposite. It is kept, struck
> through, because the homepage sections built before the reversal were built
> to it, and a reader who finds a prototype-shaped component needs to know why.

The points where the two disagree, and what was built:

1. The four business tiles carry the capacity figures (8299 MWp, 5 GW,
   3625 MW + 5 GW, 144.9 MW). Our docs specify a separate 4-column stats band.
   **Built to the PDF:** `sections/business-tiles/` is both, and
   `features/04` §2's stats band does not exist as a section.
2. The India map is a **dotted pixel-art map** captioned "11 STATES /
   60 PROJECT SITES", not the flat `india-map.png`. **Built to the PDF**, which
   settles Open Decision #6 in favour of a vector map — the geometry arrived
   with the handover as `Mock 3 Approved/mapDots.js` and is transcribed into
   `sections/presence-map/dots.ts`.
3. Solutions is a **carousel of four plants** — Patiala, Mizoram, Kishangarh,
   Bhadra — each a landscape photograph with a gradient plaque naming it.
   `features/04` §6 specifies a single full-bleed `<FeatureBanner>` of the
   Mizoram plant, reusable as a page hero elsewhere. **Built to the PDF** as
   `sections/solutions-carousel/`. The plaque survives the change; the reusable
   one-image banner does not exist yet, and when a business page needs one it
   is a separate primitive rather than a branch in the carousel.
4. Neither the vision timeline nor the "Our Strength" section appears.
   **Not yet decided** — both are specified in `features/04` §7 and §8 and
   neither has been built. Ask before building either.
5. The footer is an undesigned grey block — which is why no social icon
   artwork exists anywhere in the handover.

The pixel-strip divider is live vector in that PDF, and is a better source
than the prototype's 569 KB PNG.

### The 14 shapes use a gradient we do not have a token for

`#2b1b54 → #8a1e42 → #e01f2b`, which is not `--gradient-cta`
(`#F9E800 → #E40F14 → #45258D`) or any other token in `theme.css`. If these
shapes are adopted, that gradient needs to become a token first — do not
inline the stops.
