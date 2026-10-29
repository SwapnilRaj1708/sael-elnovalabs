import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { composeBlobUrl, endsInContainer } from './blob-storage.ts';

const ACCOUNT = 'https://saelstgweb.blob.core.windows.net';

describe('composeBlobUrl', () => {
  it('puts the site container between the account and the path', () => {
    assert.equal(
      composeBlobUrl(ACCOUNT, 'site', 'web-assets/media/our-team/jasbir-singh.jpg'),
      'https://saelstgweb.blob.core.windows.net/sael-website/web-assets/media/our-team/jasbir-singh.jpg',
    );
  });

  it('puts the media container between the account and the path', () => {
    assert.equal(
      composeBlobUrl(ACCOUNT, 'media', 'documents/module-manufacturing/x.pdf'),
      'https://saelstgweb.blob.core.windows.net/sael-media-public/documents/module-manufacturing/x.pdf',
    );
  });

  it('joins with one slash however the account and path are written', () => {
    assert.equal(
      composeBlobUrl(`${ACCOUNT}//`, 'site', '  /web-assets/a.jpg '),
      'https://saelstgweb.blob.core.windows.net/sael-website/web-assets/a.jpg',
    );
  });

  it('keeps an account that has a path of its own (Azurite)', () => {
    assert.equal(
      composeBlobUrl('http://127.0.0.1:10000/devstoreaccount1', 'media', 'a.pdf'),
      'http://127.0.0.1:10000/devstoreaccount1/sael-media-public/a.pdf',
    );
  });
});

describe('endsInContainer', () => {
  it('accepts an account URL', () => {
    assert.equal(endsInContainer(ACCOUNT), false);
    assert.equal(endsInContainer(`${ACCOUNT}/`), false);
    assert.equal(endsInContainer('http://127.0.0.1:10000/devstoreaccount1'), false);
  });

  it('catches a value that still names a container, the format before 2026-10-29', () => {
    assert.equal(endsInContainer(`${ACCOUNT}/sael-website`), true);
    assert.equal(endsInContainer(`${ACCOUNT}/sael-media-public/`), true);
  });
});
