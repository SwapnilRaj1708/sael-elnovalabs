/**
 * Assembles the deployment archive handed to the client.
 *
 * `output: 'standalone'` produces a self-contained server, but Next deliberately
 * leaves two things out of it: the static build output and `public/`. This
 * script stitches all three together so the archive extracts and runs as one
 * systemd-managed `node server.js` process, with no install step on the VM.
 *
 *   pnpm build && pnpm package  ->  release/sael-web-<version>.tar.gz
 */

import { cp, mkdir, readdir, readFile, readlink, realpath, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const STANDALONE = join(ROOT, '.next', 'standalone');

if (!existsSync(STANDALONE)) {
  console.error('No .next/standalone directory. Run `pnpm build` first.');
  process.exit(1);
}

const { version } = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
const name = `sael-web-${version}`;
const releaseDir = join(ROOT, 'release');
const stageDir = join(releaseDir, name);

await rm(stageDir, { recursive: true, force: true });
// A previous archive goes first, so a run that fails below cannot leave one behind that looks current.
await rm(join(releaseDir, `${name}.tar.gz`), { force: true });
await mkdir(stageDir, { recursive: true });

// Every copy keeps symlinks exactly as written. Without `verbatimSymlinks`, fs.cp rewrites a
// relative link into an absolute path to its target in the source tree, so the archive would
// point back into the build machine. The standalone output has such a link: Turbopack emits
// `.next/node_modules/<package>-<hash> -> ../../node_modules/<package>` for each server-external
// package a bundle requires (today postcss, required by sanitize-html), and the server chunks
// require it by that hashed name. Kept relative, it resolves wherever the archive is extracted.
const copyOptions = { recursive: true, verbatimSymlinks: true };

// 1. The standalone server, its traced node_modules and package.json.
await cp(STANDALONE, stageDir, copyOptions);

// 2. Static output — Next expects it at .next/static relative to server.js.
await cp(join(ROOT, '.next', 'static'), join(stageDir, '.next', 'static'), copyOptions);

// 3. Anything served by literal URL.
if (existsSync(join(ROOT, 'public'))) {
  await cp(join(ROOT, 'public'), join(stageDir, 'public'), copyOptions);
}

// 4. The environment contract, and ecosystem.config.cjs, which now only throws
//    so that `pm2 start` fails with the reason (see that file).
await cp(join(ROOT, 'ecosystem.config.cjs'), join(stageDir, 'ecosystem.config.cjs'));
await cp(join(ROOT, '.env.example'), join(stageDir, '.env.example'));

await writeFile(
  join(stageDir, 'DEPLOY.txt'),
  [
    `SAEL corporate website — ${name}`,
    '',
    'Requires Node.js 24 LTS or newer. No install step: dependencies are already',
    'bundled. Native ones (sharp, for image optimisation) are bundled for',
    'linux-x64 with glibc 2.28 or newer, and for the machine that built it.',
    '',
    'BEFORE THIS ARCHIVE WAS BUILT: it prerenders whatever content the build',
    'machine could see. It must have been built with CONTENT_SOURCE=api, after',
    "the backend's content import, and with NEXT_PUBLIC_SITE_URL set to the host",
    'it will serve. Both are compiled in: changing them in the environment file',
    'changes nothing. A different host, or fixture content, means a rebuild.',
    '',
    '  1. Extract so that server.js lands at /var/www/sael-web/server.js:',
    '       mkdir -p /var/www/sael-web',
    `       tar -xzf ${name}.tar.gz -C /var/www/sael-web --strip-components=1`,
    '     The service account must be able to write /var/www/sael-web/.next:',
    '     the page cache and the image cache are written there.',
    '  2. Put the runtime environment in /etc/sael-web/sael-web.env, mode 600',
    '     (see .env.example). It must set HOSTNAME=127.0.0.1 and PORT=3000:',
    '     without them the server listens on every interface.',
    '  3. Run it under systemd as ONE process, with no flags:',
    '       WorkingDirectory=/var/www/sael-web',
    '       EnvironmentFile=/etc/sael-web/sael-web.env',
    '       ExecStart=/usr/bin/node /var/www/sael-web/server.js',
    '     (/usr/bin/node or wherever the VM has node: systemd needs the full path.)',
    '     Never two processes, and never PM2. Each process keeps its own cache of',
    '     rendered pages, so a second one goes on serving the old page after a',
    '     publish, while the publish reports success.',
    '  4. nginx forwards to 127.0.0.1:3000 and sends Strict-Transport-Security.',
    '     See deploy/nginx.conf.sample in the repository.',
    '',
    'Health check: GET /api/health/ returns {"status":"ok"}.',
    '',
  ].join('\n'),
  'utf8',
);

// 5. Nothing in the archive may point outside it. A link is allowed only if it is relative and
//    resolves to something inside the staged tree; an absolute link, one that climbs out, or one
//    whose target is missing would work on this machine at best and dangle on the VM.
const stageRoot = await realpath(stageDir);
const escaping = [];
for (const entry of await readdir(stageDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isSymbolicLink()) continue;
  const link = join(entry.parentPath, entry.name);
  const target = await readlink(link);
  const resolved = isAbsolute(target) ? null : await realpath(link).catch(() => null);
  if (resolved === null || !resolved.startsWith(stageRoot + sep)) {
    escaping.push(`${link} -> ${target}`);
  }
}
if (escaping.length > 0) {
  console.error(`Refusing to archive: ${escaping.length} link(s) pointing outside it:`);
  for (const line of escaping) console.error(`  ${line}`);
  process.exit(1);
}

// 6. The VM's sharp binaries must be in the tree, where sharp resolves them. Without them sharp
//    fails to load on the VM, and Next serves every image unoptimised without reporting an
//    error: full-size JPEGs in place of AVIF and WebP. pnpm installs them on a Mac only because
//    of `supportedArchitectures` in pnpm-workspace.yaml, so a node_modules installed before that
//    setting, or a change to it, would otherwise produce a broken archive.
//
//    Resolved the way sharp itself does: `require('@img/sharp-linux-x64/sharp.node')` from
//    sharp's own directory, through that package's exports map. That package's .node file then
//    finds libvips through its ELF RUNPATH, `$ORIGIN/../../sharp-libvips-linux-x64/lib`, which
//    is the location checked here.
//
//    release/ is inside the build tree, so Node's resolution would climb out of the staged copy
//    and find the build machine's node_modules. Every path must therefore resolve inside it.
const SHARP_TARGET = 'linux-x64';
const sharpBinaries = [];
try {
  const staged = (path) => {
    if (!path.startsWith(stageRoot + sep)) throw new Error(`${path} is outside the archive`);
    return path;
  };
  const fromSharp = createRequire(join(stageDir, 'node_modules', 'sharp', 'dist', 'sharp.cjs'));
  const shim = staged(fromSharp.resolve(`@img/sharp-${SHARP_TARGET}/sharp.node`));
  const libDir = join(dirname(shim), 'lib');
  const addon = (await readdir(libDir)).find((file) => file.endsWith('.node'));
  if (addon === undefined) throw new Error(`no .node file in ${libDir}`);
  const libvips = staged(createRequire(shim).resolve(`@img/sharp-libvips-${SHARP_TARGET}/binary`));
  const runpath = join(libDir, '..', '..', `sharp-libvips-${SHARP_TARGET}`, 'lib');
  if (dirname(libvips) !== runpath) {
    throw new Error(`libvips resolves to ${libvips}, but the addon loads it from ${runpath}`);
  }
  sharpBinaries.push(join(libDir, addon), libvips);
} catch (error) {
  console.error(
    [
      `Refusing to archive: sharp's ${SHARP_TARGET} binaries are not in the standalone output.`,
      `  ${error instanceof Error ? error.message : error}`,
      `  Both @img/sharp-${SHARP_TARGET} and @img/sharp-libvips-${SHARP_TARGET} are needed for`,
      '  image optimisation on the VM. Check supportedArchitectures in pnpm-workspace.yaml, then',
      '  reinstall from scratch (rm -rf node_modules && pnpm install --frozen-lockfile) and rebuild.',
    ].join('\n'),
  );
  process.exit(1);
}

// 7. Compress. bsdtar ships with Windows 10+ and GNU tar with every Linux host.
//    macOS's bsdtar records extended attributes (com.apple.provenance on every file) as pax
//    headers, and GNU tar on the VM prints a warning for each one it does not recognise:
//    thousands of lines on an extraction that has in fact succeeded.
const archive = `${name}.tar.gz`;
const noXattrs = process.platform === 'darwin' ? ['--no-xattrs'] : [];
const tar = spawnSync('tar', [...noXattrs, '-czf', archive, name], {
  cwd: releaseDir,
  stdio: 'inherit',
});

if (tar.status !== 0) {
  console.error(`\nStaged at release/${name}, but tar failed — archive it manually.`);
  process.exit(1);
}

// 8. The same binaries, as they appear in the archive itself.
const listing = spawnSync('tar', ['-tzf', archive], {
  cwd: releaseDir,
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});
const archived = new Set(listing.stdout?.split('\n'));
const missing = sharpBinaries
  .map((file) => [name, ...relative(stageRoot, file).split(sep)].join('/'))
  .filter((entry) => !archived.has(entry));
if (listing.status !== 0 || missing.length > 0) {
  console.error(`\nRefusing release/${archive}: sharp's ${SHARP_TARGET} binaries are not in it:`);
  for (const entry of missing) console.error(`  ${entry}`);
  await rm(join(releaseDir, archive), { force: true });
  process.exit(1);
}

await rm(stageDir, { recursive: true, force: true });
console.log(`\nrelease/${archive}`);
