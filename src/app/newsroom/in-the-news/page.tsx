import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { listingMetadata, NewsListingPage } from '@/app/newsroom/_lib/listing-page';

const section = newsroomSections['in-the-news'];

export const metadata: Metadata = listingMetadata(section);

/**
 * Coverage of SAEL in other publications, newest first, each opening the publication that ran it in a new tab.
 * The page itself is `<NewsListingPage>`, shared by the four listings.
 */
export default function NewsroomInTheNewsPage() {
  return <NewsListingPage section={section} />;
}
