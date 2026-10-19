import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { listingMetadata, NewsListingPage } from '@/app/newsroom/_lib/listing-page';

const section = newsroomSections['our-views'];

export const metadata: Metadata = listingMetadata(section);

/**
 * The company's opinion pieces, in its own order — they carry no date — each opening its article here.
 * The page itself is `<NewsListingPage>`, shared by the four listings.
 */
export default function NewsroomOurViewsPage() {
  return <NewsListingPage section={section} />;
}
