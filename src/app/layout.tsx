import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/footer/footer';
import { GreenHostingFab } from '@/components/layout/green-hosting-fab/green-hosting-fab';
import { Header } from '@/components/layout/header/header';
import { SocialFab } from '@/components/layout/social-fab/social-fab';
import { isPublicSite, siteConfig } from '@/lib/config/site';
import { SOCIAL_LINKS } from '@/lib/content/static/footer';
import { GREEN_HOSTING_BADGE } from '@/lib/content/static/green-hosting';
import { din } from '@/lib/fonts';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/json-ld';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  openGraph: {
    siteName: 'SAEL.CO',
    locale: 'en_US',
    type: 'website',
  },
  // Carried over from the legacy site's root layout so the Search Console
  // property keeps verifying through the migration.
  // docs/accessibility-and-seo.md §2.
  verification: {
    google: 'MzPpbkl_8_16EX_FeHk9_UCSCnIGJTxj8N8J89pnOQU',
  },
  // Anything that is not the production origin is kept out of the index.
  ...(isPublicSite ? {} : { robots: { index: false, follow: false } }),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = [organizationJsonLd(), webSiteJsonLd()];

  return (
    <html lang="en" className={din.variable}>
      <body>
        {/*
          First focusable element on the page. Visually hidden until focused,
          then pinned to the top-left — a skip link that stays invisible when
          focused is worse than none, because keyboard users cannot tell they
          have reached it. docs/accessibility-and-seo.md §5.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-skip-link) focus:inline-flex focus:min-h-touch focus:items-center focus:bg-surface focus:px-4 focus:text-ink"
        >
          Skip to main content
        </a>

        <Header />

        {/*
          The header is fixed, so it is out of flow and cannot push content
          down. The offset is padding on <main> using the same token as the
          header's height — not a margin on the first section, which would
          break on every page whose first element is not a full-bleed hero.
          docs/features/03-app-shell-header-footer.md §2.
        */}
        <main id="main-content" className="pt-header">
          {children}
        </main>

        <Footer />

        {/* The social profiles, fixed to the corner of every page. */}
        <SocialFab links={SOCIAL_LINKS} newTabNote="opens in a new tab" />

        {/* The green-hosting badge, fixed to the opposite corner. */}
        <GreenHostingFab badge={GREEN_HOSTING_BADGE} />

        <script
          type="application/ld+json"
          // The payload is built from typed config in lib/seo/json-ld.ts, not
          // from user input; JSON.stringify is the sanctioned way to emit it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
