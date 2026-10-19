/**
 * NOT A PROCESS DEFINITION. PM2 is not how this site runs.
 *
 * Production runs the standalone server under systemd, as one `node server.js` process from the
 * extracted archive, with HOSTNAME=127.0.0.1 and PORT set in its environment file. This file
 * remains only because scripts/package-release.mjs copies it into the archive. It throws, so that
 * `pm2 start ecosystem.config.cjs` fails with this reason instead of starting the site a second
 * time, under a process manager nobody is watching, with whatever environment PM2 happens to have.
 *
 * Exactly one process, whatever starts it. Each process holds its own ISR cache, so with more than
 * one, the backend's revalidation webhook clears only the process that received it.
 * revalidatePath returns 2xx, and the others keep serving the stale page with nothing reporting
 * it. More than one requires a shared cache handler (`cacheHandler` in next.config.ts) first.
 * /CLAUDE.md §7.
 */
throw new Error(
  'ecosystem.config.cjs: PM2 is not used. The site runs under systemd as a single ' +
    '`node server.js` process. Start it with systemctl, not pm2. See the comment in this file.',
);
