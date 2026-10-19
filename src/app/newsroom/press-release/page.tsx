import type { Metadata } from 'next';
import { newsroomSections } from '@/app/_content/newsroom';
import { listingMetadata, NewsListingPage } from '@/app/newsroom/_lib/listing-page';

const section = newsroomSections['press-release'];

export const metadata: Metadata = listingMetadata(section);

/**
 * The company's press releases, newest first, each opening its article here.
 * The page itself is `<NewsListingPage>`, shared by the four listings.
 */
export default function NewsroomPressReleasePage() {
  return <NewsListingPage section={section} />;
}
