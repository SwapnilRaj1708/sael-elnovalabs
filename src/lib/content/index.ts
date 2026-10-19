import { env } from '@/lib/config/env';
import { ApiContentRepository } from './api';
import { MockContentRepository } from './mock';
import type { ContentRepository } from './repository';

export { ContentUnavailableError, NotImplementedError } from './repository';
export type { ContentRepository, NewsItemsQuery } from './repository';
export {
  NEWSROOM_PATH,
  newsArticlePath,
  newsListingPath,
  newsPreviewArticlePath,
  newsPreviewListingPath,
} from './news-links';
export type {
  BlobFile,
  IncompleteField,
  IncompleteRecord,
  InvestorDocument,
  InvestorDocumentGroup,
  InvestorDocumentKind,
  InvestorDocumentSubgroup,
  InvestorGate,
  InvestorSection,
  InvestorTile,
  InvestorTileDisplayMode,
  InvestorTilePage,
  NewsArticle,
  NewsArticleCategory,
  NewsCategory,
  NewsItem,
  NewsVideo,
  PreviewDetail,
  PreviewExchange,
  PreviewListing,
  PreviewRead,
  PreviewScreenCode,
  PreviewSession,
  PreviewState,
  PreviewTilePage,
  Previewed,
} from './types';

let instance: ContentRepository | null = null;

/**
 * The only sanctioned way to reach content. docs/content-model.md §3.
 *
 * Components and pages import **this and nothing else** from the data layer —
 * importing `@/lib/content/mock` or `@/lib/content/api` anywhere outside this
 * folder is blocked by ESLint and asserted by `pnpm verify:guardrails`. That
 * rule is what makes FE-23 a configuration change instead of a refactor: if a
 * component file has to change during the cutover, the boundary was wrong.
 *
 * Memoised, so a request that renders several sections shares one instance
 * rather than constructing an adapter per call.
 */
export function getContentRepository(): ContentRepository {
  instance ??=
    env.CONTENT_SOURCE === 'api'
      ? new ApiContentRepository({
          // Guaranteed present: env.ts refuses to load with CONTENT_SOURCE=api
          // and no API_BASE_URL, so the build fails rather than a request.
          baseUrl: env.API_BASE_URL ?? '',
          timeoutMs: env.API_TIMEOUT_MS,
        })
      : new MockContentRepository();

  return instance;
}
