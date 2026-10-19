import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsArticlePage } from '@/app/newsroom/_lib/article-page';
import { articleMetadata, loadArticleSlugs, loadNewsArticle } from '@/app/newsroom/_lib/news';

const CATEGORY = 'press-release';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * **`true`, and it must stay `true`.** A slug not built at build time renders
 * on its first request: an article published after the deploy is served at
 * once rather than 404ing until the next build, however successful the
 * publish reported itself. The page is then cached as ISR (/CLAUDE.md §7),
 * refreshed by the backend's webhook. A slug that is not an article still
 * 404s — the repository answers `null` for it.
 */
export const dynamicParams = true;

export function generateStaticParams(): Promise<{ slug: string }[]> {
  return loadArticleSlugs(CATEGORY);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await loadNewsArticle(CATEGORY, (await params).slug);
  return article === null ? {} : articleMetadata(article);
}

/** One press release, at its legacy URL — slug verbatim. */
export default async function PressReleaseArticlePage({ params }: PageProps) {
  const article = await loadNewsArticle(CATEGORY, (await params).slug);
  if (article === null) notFound();

  return <NewsArticlePage article={article} />;
}
