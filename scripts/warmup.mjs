/**
 * Warms the image optimiser's cache after a deploy.
 *
 * sharp converts each image on its first request, at 0.5–1.1 s and up to about 40% of the
 * VM's four cores for a large one. The converted copies live in .next/cache/images, which
 * survives a deploy, but an image that is new or changed in the release starts cold. Left
 * alone, the first visitors pay for those conversions, all at once. This script pays for them
 * instead, one or two at a time, before anyone arrives.
 *
 * It asks for every page the sitemap lists, collects every /_next/image/ URL each page can
 * request (every srcset width is a separate conversion), and requests each one as AVIF and as
 * WebP, the two formats next.config.ts serves.
 *
 *   node scripts/warmup.mjs [--dry-run] [--base http://127.0.0.1:3000] [--concurrency 2]
 *
 * Node 24 built-ins only, and no writes, so it runs the same as root or as the service account.
 * It sends GET requests to the local server only, and never to the admin, backend, form or
 * API routes. It exits 0 when some requests fail: a failed warm-up costs speed, not correctness.
 * It exits 1 only when the server never reports healthy, and 2 on a usage error.
 */

import { parseArgs } from 'node:util';

const DEFAULT_BASE = 'http://127.0.0.1:3000';
const ALLOWED_HOSTS = new Set(['127.0.0.1', 'localhost']);
const HEALTH_PATH = '/api/health/';
const HEALTH_INTERVAL_MS = 2_000;
const HEALTH_DEADLINE_MS = 120_000;
const HEALTH_TIMEOUT_MS = 5_000;
const PAGE_TIMEOUT_MS = 30_000;
const IMAGE_TIMEOUT_MS = 60_000;
const MAX_CONCURRENCY = 4;
const MAX_REDIRECTS = 3;
const PROGRESS_EVERY = 50;
const USER_AGENT = 'SAEL-Warmup';

/** One request per format next.config.ts serves: the first Accept gets AVIF, the second WebP. */
const IMAGE_ACCEPTS = ['image/avif,image/webp,*/*', 'image/webp,*/*'];

/** Used when the sitemap cannot be read. */
const FALLBACK_PAGES = [
  '/',
  '/about-us/',
  '/career/',
  '/newsroom/',
  '/our-team/',
  '/our-core-beliefs/',
  '/story-of-our-influence/',
  '/our-key-esg-metrics/',
  '/solar-energy/',
  '/solar-cell-manufacturing/',
  '/module-manufacturing/',
  '/waste-to-energy/',
  '/contact-us/',
  '/investors/contact-us/',
  '/investors/offer-documents/',
  '/investors/notifications/',
  '/investors/financials-and-reports/',
  '/investors/corporate-governance/',
];

/**
 * Every path is checked here before it is requested, including redirect targets and sitemap
 * entries, so no input can steer the script to the admin panel, the backend or the enquiry form.
 */
function isAllowedPath(path) {
  if (path.includes('contact-enquiry')) return false;
  if (path.startsWith('/admin/') || path.startsWith('/app/v1/')) return false;
  if (path.startsWith('/api/')) return path === HEALTH_PATH;
  return path.startsWith('/');
}

function usage(message) {
  console.error(`warmup: ${message}`);
  console.error('usage: node scripts/warmup.mjs [--dry-run] [--base <url>] [--concurrency <1-4>]');
  process.exit(2);
}

function parseOptions() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        'dry-run': { type: 'boolean', default: false },
        base: { type: 'string', default: DEFAULT_BASE },
        concurrency: { type: 'string', default: '2' },
      },
      strict: true,
      allowPositionals: false,
    });
  } catch (error) {
    usage(error instanceof Error ? error.message : String(error));
  }
  const { values } = parsed;

  if (!URL.canParse(values.base)) usage(`--base is not a URL: ${values.base}`);
  const base = new URL(values.base);
  if (!['http:', 'https:'].includes(base.protocol) || !ALLOWED_HOSTS.has(base.hostname)) {
    usage(`refusing --base ${values.base}: only localhost or 127.0.0.1 may be warmed`);
  }
  if (base.pathname !== '/' || base.search !== '' || base.username !== '') {
    usage(`--base must be an origin with no path, query or credentials: ${values.base}`);
  }

  const concurrency = Number(values.concurrency);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > MAX_CONCURRENCY) {
    usage(`--concurrency must be a whole number from 1 to ${MAX_CONCURRENCY}`);
  }

  return { origin: base.origin, concurrency, dryRun: values['dry-run'] };
}

const options = parseOptions();
const startedAt = Date.now();
const stats = { pages: 0, images: 0, variants: 0, cold: 0, warm: 0, failures: 0 };
let requestCount = 0;

/** A GET to the local server that follows redirects only while they stay on it and allowed. */
async function get(path, { accept, timeoutMs }) {
  let current = path;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isAllowedPath(current)) throw new Error(`refused path ${current}`);
    const response = await fetch(new URL(current, options.origin), {
      method: 'GET',
      redirect: 'manual',
      headers: { Accept: accept, 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const location = response.headers.get('location');
    if (response.status < 300 || response.status >= 400 || location === null) return response;

    await response.body?.cancel();
    const next = new URL(location, new URL(current, options.origin));
    if (next.origin !== options.origin) throw new Error(`redirect off the server to ${next.href}`);
    current = next.pathname + next.search;
  }
  throw new Error(`more than ${MAX_REDIRECTS} redirects`);
}

function countRequest() {
  requestCount += 1;
  if (requestCount % PROGRESS_EVERY === 0) {
    console.log(
      `warmup: progress requests=${requestCount} cold=${stats.cold} warm=${stats.warm} failures=${stats.failures}`,
    );
  }
}

function fail(what, reason) {
  stats.failures += 1;
  console.log(`warmup: FAIL ${what}: ${reason}`);
}

function describe(error) {
  if (error instanceof Error) {
    return error.name === 'TimeoutError' ? 'timed out' : error.message;
  }
  return String(error);
}

async function waitForHealth() {
  const deadline = Date.now() + HEALTH_DEADLINE_MS;
  for (;;) {
    try {
      const response = await get(HEALTH_PATH, {
        accept: 'application/json',
        timeoutMs: HEALTH_TIMEOUT_MS,
      });
      if (response.ok && (await response.json())?.status === 'ok') return true;
    } catch {
      // Not up yet: the next poll decides.
    }
    if (Date.now() + HEALTH_INTERVAL_MS > deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, HEALTH_INTERVAL_MS));
  }
}

/** The sitemap lists public URLs; each one is requested at its path on the local server. */
async function pagesFromSitemap() {
  try {
    const response = await get('/sitemap.xml', {
      accept: 'application/xml',
      timeoutMs: PAGE_TIMEOUT_MS,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    const paths = new Set();
    for (const [, loc] of xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
      const href = loc.replaceAll('&amp;', '&');
      if (!URL.canParse(href)) continue;
      const url = new URL(href);
      const path = url.pathname + url.search;
      if (isAllowedPath(path)) paths.add(path);
    }
    if (paths.size === 0) throw new Error('no <loc> entries');
    return [...paths];
  } catch (error) {
    console.log(`warmup: sitemap unavailable (${describe(error)}), using the fallback page list`);
    return FALLBACK_PAGES;
  }
}

/**
 * Image URLs appear in `src`, `srcset` and preload `imagesrcset` attributes, HTML-escaped
 * (`&amp;`), and in the page's embedded RSC data, JSON-escaped (`&`). Both are decoded
 * before matching. The match stops at anything that cannot occur in a URL the loader wrote:
 * a quote, whitespace, a backslash (the escaped quote that ends a JSON string) or the comma
 * between srcset candidates.
 */
function imagesIn(html) {
  const text = html.replaceAll('\\u0026', '&').replaceAll('&amp;', '&');
  const found = [];
  for (const [match] of text.matchAll(/\/_next\/image\/?\?[^"'\s<>\\,)]+/g)) {
    const params = new URL(match, options.origin).searchParams;
    if (params.has('url') && params.has('w') && params.has('q')) found.push(match);
  }
  return found;
}

async function collectImages(pages) {
  const images = new Map();
  for (const path of pages) {
    countRequest();
    try {
      const response = await get(path, { accept: 'text/html', timeoutMs: PAGE_TIMEOUT_MS });
      if (!response.ok) {
        await response.body?.cancel();
        fail(`page ${path}`, `HTTP ${response.status}`);
        continue;
      }
      const html = await response.text();
      stats.pages += 1;
      for (const image of imagesIn(html)) {
        // Next keys its cache on the decoded url, w and q, so two spellings of one are one image.
        const params = new URL(image, options.origin).searchParams;
        const key = `${params.get('url')}|${params.get('w')}|${params.get('q')}`;
        if (!images.has(key)) images.set(key, image);
      }
    } catch (error) {
      fail(`page ${path}`, describe(error));
    }
  }
  return [...images.values()];
}

async function warmVariant(image, accept) {
  countRequest();
  try {
    const response = await get(image, { accept, timeoutMs: IMAGE_TIMEOUT_MS });
    // Reading the body to the end is what lets the server finish the conversion and store it.
    await response.arrayBuffer();
    if (!response.ok) {
      fail(`image ${image} (${accept})`, `HTTP ${response.status}`);
      return;
    }
    const cache = response.headers.get('x-nextjs-cache')?.toUpperCase();
    if (cache === 'HIT') stats.warm += 1;
    else if (cache === 'MISS' || cache === 'STALE') stats.cold += 1;
  } catch (error) {
    fail(`image ${image} (${accept})`, describe(error));
  }
}

async function warmImages(images) {
  const queue = images.flatMap((image) => IMAGE_ACCEPTS.map((accept) => [image, accept]));
  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const [image, accept] = queue[next];
      next += 1;
      await warmVariant(image, accept);
    }
  };
  await Promise.all(Array.from({ length: options.concurrency }, worker));
}

function summary() {
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  return (
    `warmup: pages=${stats.pages} images=${stats.images} variants=${stats.variants}` +
    ` cold=${stats.cold} warm=${stats.warm} failures=${stats.failures} duration=${seconds}s`
  );
}

if (!(await waitForHealth())) {
  console.error(
    `warmup: ${options.origin}${HEALTH_PATH} did not report ok within ${HEALTH_DEADLINE_MS / 1000}s`,
  );
  process.exit(1);
}

const pages = await pagesFromSitemap();
const images = await collectImages(pages);
stats.images = images.length;
stats.variants = images.length * IMAGE_ACCEPTS.length;

if (options.dryRun) {
  console.log(`warmup: dry run, ${pages.length} page(s), would warm:`);
  for (const image of images) console.log(`  ${image}`);
} else {
  await warmImages(images);
}

console.log(summary());
