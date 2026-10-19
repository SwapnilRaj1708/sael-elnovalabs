import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { previewMetadata } from '@/app/_lib/preview';
import { NewsArticlePreview } from '@/app/newsroom/_lib/preview-pages';

const CATEGORY = 'press-release';

/** Never cached — see the listing's preview page. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = previewMetadata(newsroomSections[CATEGORY].name);

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * One Press Release article's preview, reached from a card on the listing's
 * preview. **The same `<NewsArticlePage>` as `/newsroom/press-release/{slug}/`**,
 * with the article in its most recent state.
 */
export default async function PressReleaseArticlePreviewPage({ params }: PageProps) {
  return <NewsArticlePreview category={CATEGORY} slug={(await params).slug} />;
}
