import packageJson from '@/../package.json';

/**
 * Read from package.json rather than `process.env.npm_package_version`, which is
 * only populated when Node is launched through a package script — it is
 * undefined under PM2 running `node server.js`.
 */
export const APP_VERSION: string = packageJson.version;
