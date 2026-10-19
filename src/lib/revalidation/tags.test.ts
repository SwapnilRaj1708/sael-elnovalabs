import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { investorTilesTag, revalidationTagsFor } from './tags.ts';

/**
 * The `paths` below are the ones the backend sends today, as
 * `DocumentSection.publicBasePath()`, `tilePagePath(slug)` and
 * `NewsWorkflowAdapter.revalidationPaths` build them (docs/api-contracts.md
 * §7.1).
 */
describe('revalidationTagsFor', () => {
  it('a Financials & Reports tile event expires the section tile list, so every sibling page refreshes', () => {
    assert.deepEqual(
      revalidationTagsFor([
        '/investors/financials-and-reports/',
        '/investors/financials-and-reports/annual-report/',
      ]),
      ['investor-tiles:financials-and-reports'],
    );
  });

  for (const [section, paths] of [
    ['offer-documents', ['/investors/offer-documents/', '/investors/offer-documents/drhp/']],
    [
      'corporate-governance',
      ['/investors/corporate-governance/', '/investors/corporate-governance/csr/'],
    ],
    [
      'financials-and-reports',
      [
        '/investors/financials-and-reports/',
        '/investors/financials-and-reports/investor-downloads/',
      ],
    ],
    ['notifications', ['/investors/notifications/']],
    ['notifications', ['/investors/notifications/', '/investors/notifications/notifications/']],
  ] as const) {
    it(`${paths.join(' ')} expires ${section}'s tile list and no other`, () => {
      assert.deepEqual(revalidationTagsFor(paths), [investorTilesTag(section)]);
    });
  }

  it('the section index alone still expires the list — a reorder or a slugless tile sends only that', () => {
    assert.deepEqual(revalidationTagsFor(['/investors/corporate-governance/']), [
      'investor-tiles:corporate-governance',
    ]);
  });

  it('a path sent without its trailing slash is still placed in its section', () => {
    assert.deepEqual(revalidationTagsFor(['/investors/offer-documents']), [
      'investor-tiles:offer-documents',
    ]);
  });

  it('a Live Preview section is not the live section it is named after', () => {
    assert.deepEqual(revalidationTagsFor(['/investors/financials-and-reports-preview/']), []);
  });

  it('news events expire no investor tag', () => {
    assert.deepEqual(revalidationTagsFor(['/newsroom/in-the-news/', '/newsroom/', '/']), []);
    assert.deepEqual(
      revalidationTagsFor([
        '/newsroom/press-release/',
        '/newsroom/press-release/q2-results/',
        '/newsroom/',
      ]),
      [],
    );
    assert.deepEqual(revalidationTagsFor(['/']), []);
  });

  it('investor pages outside the four sections expire no tag', () => {
    assert.deepEqual(revalidationTagsFor(['/investors/', '/investors/contact-us/']), []);
  });

  it('paths in two sections expire both, each once', () => {
    assert.deepEqual(
      revalidationTagsFor([
        '/investors/offer-documents/',
        '/investors/notifications/',
        '/investors/offer-documents/drhp/',
      ]),
      ['investor-tiles:offer-documents', 'investor-tiles:notifications'],
    );
  });
});
