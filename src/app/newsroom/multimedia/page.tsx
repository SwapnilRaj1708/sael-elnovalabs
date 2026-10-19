import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { listingMetadata, NewsListingPage } from '@/app/newsroom/_lib/listing-page';

const section = newsroomSections.multimedia;

export const metadata: Metadata = listingMetadata(section);

/**
 * The company's videos, in its own order, each played in a dialog.
 * The page itself is `<NewsListingPage>`, shared by the four listings.
 */
export default function NewsroomMultimediaPage() {
  return <NewsListingPage section={section} />;
}
