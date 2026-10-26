import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isProductionOrigin, PRODUCTION_URL } from '../config/production-origin.ts';
import { PREVIEW_PAGES } from '../preview/pages.ts';
import { DISALLOWED_PATHS, robotsFor } from './robots.ts';

/**
 * Each build is reached as the site reaches it: `NEXT_PUBLIC_SITE_URL` through
 * `isProductionOrigin`, which is what `isPublicSite` is (src/lib/config/site.ts).
 */
function robotsForBuild(siteUrl: string) {
  return robotsFor(isProductionOrigin(siteUrl));
}

describe('robotsFor', () => {
  it('a production build allows crawling, keeps crawlers out of the admin, API and previews, and names the sitemap', () => {
    assert.deepEqual(robotsForBuild('https://www.sael.co'), {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/app/v1/',
          '/api/',
          '/newsroom/press-release-preview/',
          '/newsroom/in-the-news-preview/',
          '/newsroom/our-views-preview/',
          '/newsroom/multimedia-preview/',
          '/investors/offer-documents-preview/',
          '/investors/corporate-governance-preview/',
          '/investors/financials-and-reports-preview/',
          '/investors/notifications-preview/',
        ],
      },
      sitemap: 'https://www.sael.co/sitemap.xml',
    });
  });

  for (const siteUrl of [
    'https://prod2-preview.sael.co',
    'https://sael.co',
    'http://www.sael.co',
    'http://localhost:3000',
  ]) {
    it(`a build for ${siteUrl} disallows everything and names no sitemap`, () => {
      assert.deepEqual(robotsForBuild(siteUrl), { rules: { userAgent: '*', disallow: '/' } });
    });
  }

  it('the sitemap is on the production origin', () => {
    assert.equal(robotsFor(true).sitemap, `${PRODUCTION_URL}/sitemap.xml`);
  });

  it('every preview page the site registers is disallowed', () => {
    for (const page of PREVIEW_PAGES) {
      assert.ok(DISALLOWED_PATHS.includes(page.root), page.root);
    }
  });

  it('no disallowed path is a prefix of a live page, so no public page is blocked', () => {
    const livePages = PREVIEW_PAGES.map((page) => page.root.replace(/-preview\/$/, '/'));
    for (const live of ['/', '/newsroom/', '/investors/', ...livePages]) {
      for (const path of DISALLOWED_PATHS) {
        assert.ok(!live.startsWith(path), `${path} would block ${live}`);
      }
    }
  });
});
