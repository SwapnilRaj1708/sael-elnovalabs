# Fonts

DIN, the SAEL corporate typeface. Supplied by the client as desktop originals.

| File                | Weight | Source         |
| ------------------- | ------ | -------------- |
| `din-regular.woff2` | 400    | `DIN.ttf`      |
| `din-bold.woff2`    | 700    | `DIN Bold.otf` |

Loaded by [`src/lib/fonts.ts`](../../lib/fonts.ts) through `next/font/local`, which
self-hosts them, emits `@font-face` with `font-display: swap`, and exposes the
family as the `--font-din` custom property.

## Rules

- **WOFF2 only in the repository.** The `.ttf` / `.otf` originals are the licensed
  _desktop_ files and are never committed. They live in the untracked `/assets/`
  handover folder — see `.gitignore`. /CLAUDE.md §8.
- **Never fetch DIN from a CDN**, and never substitute a lookalike.
- Two weights only. Nothing declares `font-weight: 500` or `600` — the browser
  would synthesise it. Round to 400 or 700. `docs/design-guidelines.md` §2.

## Why the bold comes from the OTF

The client supplied both `DIN Bold.otf` and `DIN Bold.ttf`.
`docs/asset-inventory.md` §5 prefers the OTF, and inspecting the two files
shows why — the TTF is a Fontographer 4.1 export from 2000 and the OTF is a
proper cut:

|                           | `DIN Bold.otf`                | `DIN Bold.ttf`                 |
| ------------------------- | ----------------------------- | ------------------------------ |
| Outlines                  | CFF                           | glyf                           |
| `OS/2.usWeightClass`      | **700**                       | 400                            |
| `head.macStyle` bold bit  | **set**                       | unset                          |
| `OS/2.fsType`             | **0** — installable embedding | 8 — editable embedding         |
| Kerning                   | **`GPOS` / `kern`**           | none at all                    |
| `sCapHeight` / `sxHeight` | **712 / 521**                 | absent (old `OS/2` version)    |
| fi / fl ligatures         | **U+FB01, U+FB02**            | private use `U+F001`, `U+F002` |

Kerning is the one that shows. Every heading, eyebrow, CTA label and stat
figure on the site is 700, and the TTF has no kerning pairs whatsoever.

The cost is 3 KB: WOFF2's glyph transform only applies to `glyf` outlines, not
`CFF`, and the retained `GPOS` table adds a little more. 7 KB → 10 KB on one
face, against a 120 KB JavaScript budget, for kerning on most of the visible
type on the page.

**Vertical metrics are identical between the two** (`hhea` 1015 / −206, and
the OTF does not set `USE_TYPO_METRICS`), so the switch changes no line box
anywhere.

## Regenerating

Run once, at migration time, not in CI (`docs/asset-inventory.md` §7).
Requires `pip install "fonttools[woff]"`.

```bash
UNI='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+20B9,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'

python -m fontTools.subset "assets/fonts/DIN.ttf" \
  --output-file=src/assets/fonts/din-regular.woff2 \
  --flavor=woff2 --unicodes="$UNI" \
  --layout-features='kern,liga,clig,calt' \
  --no-hinting --desubroutinize --drop-tables+=DSIG \
  --name-IDs='*' --name-legacy --notdef-outline

python -m fontTools.subset "assets/fonts/DIN Bold.otf" \
  --output-file=src/assets/fonts/din-bold.woff2 \
  --flavor=woff2 --unicodes="$UNI" \
  --layout-features='kern,liga,clig,calt' \
  --no-hinting --desubroutinize --drop-tables+=DSIG \
  --name-IDs='*' --name-legacy --notdef-outline
```

The unicode range is the standard Google Fonts `latin` subset plus `U+20B9` (₹).
`–`, `’`, `·`, `#` and `²` are already inside it. Keep `--layout-features`
including `kern`: dropping it would discard the OTF's `GPOS` table and undo
the reason it was chosen.

Result: 40 KB → 6.9 KB regular, 29 KB → 10 KB bold.

## Known issues with the supplied files

1. **`₹` (U+20B9) is not in any of the three files.** The subset request for it
   is a no-op. Any rupee figure renders in the fallback face and will look
   wrong beside the DIN digits. The client needs to supply a cut of DIN that
   includes the rupee sign, or design must approve writing amounts as `INR`.
2. **The two faces have different vertical metrics** (regular `985/-226`, bold
   `1015/-206` per em of 1000). A line box switching weight mid-paragraph can
   shift by ~4%. Not worth patching; just do not mix weights inside one line of
   running copy.
3. **The bold drops `U+00AD` (soft hyphen) and `U+2010` (hyphen)**, both of
   which the regular has. Inconsequential today: nothing sets `hyphens: auto`,
   and `U+002D` — the hyphen every keyboard produces — is present in both. It
   would start to matter if automatic hyphenation is ever turned on for bold
   text, so check there first if a stray fallback glyph appears.
4. **Embedding bits differ.** The bold OTF is `fsType: 0` (installable
   embedding, the most permissive); `DIN.ttf` is `fsType: 8` (editable
   embedding). Both permit web embedding as far as the files themselves are
   concerned. That is not the same as holding a webfont licence — see
   `docs/asset-inventory.md` §5, still open.
