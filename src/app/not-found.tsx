import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Page not found',
  // A 404 that gets indexed competes with the real pages for crawl budget.
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * Worth building properly rather than leaving as a stub: a URL migration
 * guarantees people will land here from stale links, bookmarks and search
 * results, and this is often a visitor's first impression of the new site.
 * docs/features/03-app-shell-header-footer.md §4.
 */
export default function NotFound() {
  return (
    <Section spacing="default">
      <div className="flex flex-col items-start gap-flow py-section-y">
        <SectionHeading
          as="h1"
          eyebrow="404"
          title="We could not find that page"
          description="The page may have moved, or the link that brought you here may be out of date. The sections below are a good place to pick up from."
        />
        <div className="flex flex-wrap gap-4">
          <Button href="/">Go to the homepage</Button>
          <Button href="/contact-us/" variant="ghost">
            Contact us
          </Button>
        </div>
      </div>
    </Section>
  );
}
