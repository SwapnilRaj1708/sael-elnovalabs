import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { DateBadge } from '@/components/ui/date-badge';
import { DocumentLink } from '@/components/ui/document-link';
import { EmptyState } from '@/components/ui/empty-state';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Pagination } from '@/components/ui/pagination';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';
import { TileShape } from '@/components/ui/tile-shape';
import { DATE_SAMPLES, FILE_SIZE_SAMPLES } from '@/app/dev/design-system/samples';
import { isProduction } from '@/lib/config/env';

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
};

/*
 * The design-system kitchen sink: every token and every primitive, in every
 * variant and state, on one page.
 *
 * This is what the project has instead of Storybook (out of scope for the
 * client), and it earns its keep on token changes — adjust a clamp in
 * theme.css, reload this page, and the effect on all thirteen primitives is
 * visible at once. Drag the window from 360px to 1920px and the fluid scale is
 * either smooth or it is not.
 *
 * Not linked from anywhere, and `notFound()` in production.
 *
 * The route is `/dev/design-system/`, not the `src/app/_dev/…` the feature doc
 * suggested: a leading underscore is Next's *private folder* convention, so
 * that path would produce no route at all.
 */

const SWATCHES = {
  Brand: [
    ['brand-red', 'bg-brand-red'],
    ['brand-red-deep', 'bg-brand-red-deep'],
    ['brand-blue', 'bg-brand-blue'],
    ['brand-purple', 'bg-brand-purple'],
    ['brand-yellow', 'bg-brand-yellow'],
    ['brand-crimson', 'bg-brand-crimson'],
    ['brand-indigo', 'bg-brand-indigo'],
    ['accent-hover', 'bg-accent-hover'],
  ],
  Neutrals: [
    ['ink', 'bg-ink'],
    ['body-base', 'bg-body-base'],
    ['body-soft', 'bg-body-soft'],
    ['body-muted', 'bg-body-muted'],
    ['body-on-dark', 'bg-body-on-dark'],
    ['surface', 'bg-surface'],
    ['surface-alt', 'bg-surface-alt'],
    ['surface-dark', 'bg-surface-dark'],
    ['surface-darker', 'bg-surface-darker'],
    ['surface-deep', 'bg-surface-deep'],
    ['border', 'bg-border'],
    ['rule', 'bg-rule'],
    ['inert', 'bg-inert'],
    ['tile-surface', 'bg-tile-surface'],
    ['footer-bg', 'bg-footer-bg'],
    ['footer-icon', 'bg-footer-icon'],
  ],
  'SDG palette': [
    ['sdg-3', 'bg-sdg-3'],
    ['sdg-5', 'bg-sdg-5'],
    ['sdg-7', 'bg-sdg-7'],
    ['sdg-8', 'bg-sdg-8'],
    ['sdg-9', 'bg-sdg-9'],
    ['sdg-10', 'bg-sdg-10'],
    ['sdg-11', 'bg-sdg-11'],
    ['sdg-12', 'bg-sdg-12'],
    ['sdg-13', 'bg-sdg-13'],
    ['sdg-15', 'bg-sdg-15'],
  ],
} as const;

const GRADIENTS = [
  ['--gradient-eyebrow', 'bg-(image:--gradient-eyebrow)'],
  ['--gradient-cta', 'bg-(image:--gradient-cta)'],
  ['--gradient-stats', 'bg-(image:--gradient-stats)'],
  ['--gradient-caption', 'bg-(image:--gradient-caption)'],
  ['--gradient-wash-strength', 'bg-(image:--gradient-wash-strength)'],
  ['--gradient-wash-strength-stacked', 'bg-(image:--gradient-wash-strength-stacked)'],
  ['--gradient-wash-goals', 'bg-(image:--gradient-wash-goals)'],
  ['--gradient-goal-hover', 'bg-(image:--gradient-goal-hover)'],
  ['--gradient-timeline', 'bg-(image:--gradient-timeline)'],
] as const;

const TYPE_SCALE = [
  ['text-hero', 'text-hero', '28 → 58'],
  ['text-h2', 'text-h2', '24 → 36'],
  ['text-h3', 'text-h3', '16 → 22'],
  ['text-stat', 'text-stat', '28 → 40'],
  ['text-milestone', 'text-milestone', '28 → 36'],
  ['text-sdg-num', 'text-sdg-num', '34 → 56'],
  ['text-goal-title', 'text-goal-title uppercase', '20 → 26'],
  ['text-body', 'text-body', '16 → 20'],
  ['text-body-sm', 'text-body-sm', '15 → 17'],
  ['text-label', 'text-label uppercase', '14 → 16'],
  ['text-nav', 'text-nav', '16 fixed'],
  ['text-eyebrow', 'text-eyebrow uppercase', '13 → 16'],
  ['text-cta', 'text-cta uppercase', '15 → 17'],
  ['text-badge', 'text-badge', '12 → 14'],
] as const;

const SPACING = [
  ['gutter', 'w-gutter', '20 → 156'],
  ['section-y', 'w-section-y', '48 → 96'],
  ['section-y-tight', 'w-section-y-tight', '40 → 65'],
  ['block', 'w-flow', '24 → 50'],
  ['stack', 'w-stack', '12 → 24'],
  ['gap-grid', 'w-gap-grid', '16 → 31'],
  ['touch', 'w-touch', '44 fixed'],
] as const;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 lg:flex-row lg:items-baseline lg:gap-8">
      <code className="shrink-0 text-body-sm text-body-soft lg:w-64">{label}</code>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  if (isProduction) notFound();

  return (
    <>
      <Section spacing="tight">
        <SectionHeading
          as="h1"
          eyebrow="FE-02"
          title="Design system"
          description="Every token and primitive, in every variant. Not linked from anywhere; 404 in production. Drag the viewport from 360px to 1920px — the fluid scale should move continuously, with no jump at a breakpoint."
        />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading eyebrow="Tokens" title="Colour" />
        <div className="mt-flow flex flex-col gap-flow">
          {Object.entries(SWATCHES).map(([group, swatches]) => (
            <div key={group}>
              <h3 className="mb-stack text-h3">{group}</h3>
              <ul className="grid list-none grid-cols-2 gap-gap-grid sm:grid-cols-3 lg:grid-cols-4">
                {swatches.map(([name, className]) => (
                  <li key={name} className="flex flex-col gap-1">
                    <span
                      className={`h-16 w-full rounded-card border border-border ${className}`}
                    />
                    <code className="text-body-sm">{name}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Tokens" title="Gradients" />
        <ul className="mt-flow grid list-none grid-cols-1 gap-gap-grid md:grid-cols-2 lg:grid-cols-3">
          {GRADIENTS.map(([name, className]) => (
            <li key={name} className="flex flex-col gap-1">
              <span className={`h-20 w-full rounded-card border border-border ${className}`} />
              <code className="text-body-sm">{name}</code>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading
          eyebrow="Tokens"
          title="Type scale"
          description="Sizes are min → max in px, from a 360px viewport to 1920px."
        />
        <div className="mt-flow">
          {TYPE_SCALE.map(([name, className, range]) => (
            <Row key={name} label={`${name} · ${range}`}>
              <p className={className}>Generating clean energy for a sustainable tomorrow</p>
            </Row>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Tokens" title="Spacing" />
        <div className="mt-flow">
          {SPACING.map(([name, className, range]) => (
            <Row key={name} label={`${name} · ${range}`}>
              <span className={`block h-4 bg-brand-red ${className}`} />
            </Row>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading eyebrow="Tokens" title="Radius and elevation" />
        <div className="mt-flow grid grid-cols-2 gap-gap-grid lg:grid-cols-4">
          {(
            [
              ['rounded-card', 'rounded-card'],
              ['rounded-sdg', 'rounded-sdg'],
              ['rounded-pill', 'rounded-pill'],
              ['rounded-none', 'rounded-none'],
            ] as const
          ).map(([name, className]) => (
            <div key={name} className="flex flex-col gap-1">
              <span className={`h-20 border border-border bg-surface ${className}`} />
              <code className="text-body-sm">{name}</code>
            </div>
          ))}
        </div>
        <div className="mt-flow grid grid-cols-1 gap-flow bg-surface p-flow sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['shadow-card-hover', 'shadow-card-hover'],
              ['drop-shadow-tile', 'drop-shadow-tile'],
              ['drop-shadow-tile-hover', 'drop-shadow-tile-hover'],
            ] as const
          ).map(([name, className]) => (
            <div key={name} className="flex flex-col gap-2">
              <span className={`h-20 rounded-card bg-surface ${className}`} />
              <code className="text-body-sm">{name}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Primitives" title="Button" />
        <div className="mt-flow flex flex-col gap-flow">
          <Row label="variant=primary size=md/sm">
            <div className="flex flex-wrap items-center gap-4">
              <Button href="/">Know more</Button>
              <Button size="sm" href="/">
                Know more
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Row>
          <Row label="variant=ghost">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="ghost" href="/">
                Read the report
              </Button>
              <Button variant="ghost" size="sm">
                As a button
              </Button>
            </div>
          </Row>
          <Row label="variant=onDark">
            <div className="flex flex-wrap items-center gap-4 bg-surface-dark p-6">
              <Button variant="onDark" href="/">
                Know more
              </Button>
              <Button variant="onDark" size="sm" href="https://example.com" target="_blank">
                External link
              </Button>
            </div>
          </Row>
          <Row label="fullWidth">
            <Button fullWidth>Full width</Button>
          </Row>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading eyebrow="Primitives" title="Eyebrow, SectionHeading" />
        <div className="mt-flow flex flex-col gap-flow">
          <Row label="Eyebrow">
            <Eyebrow>Our businesses</Eyebrow>
          </Row>
          <Row label="SectionHeading, full">
            <SectionHeading
              as="h3"
              eyebrow="Our strength"
              title="Engineering at the scale the transition needs"
              description="A section description sits at --text-body and is capped at the 68ch measure so it does not run to 1600px on an ultrawide display."
            />
          </Row>
          <Row label="SectionHeading, title only, centred">
            <SectionHeading as="h3" align="center" title="In the news" />
          </Row>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Primitives" title="Card, TileShape, DateBadge" />
        <div className="mt-flow grid grid-cols-1 gap-gap-grid md:grid-cols-2 lg:grid-cols-3">
          <Card as="article" accentClassName="bg-brand-red" className="flex-col">
            <div className="mt-3.5 aspect-news-thumb bg-surface-alt" />
            <div className="flex flex-col gap-stack pt-card-flow">
              <DateBadge date="2026-06-10T20:30:00Z" />
              <h3 className="text-card-title">
                A news card headline that runs long enough to wrap onto several lines
              </h3>
            </div>
          </Card>

          <Card
            as="article"
            ground="dark"
            inset="block"
            accentClassName="bg-brand-red"
            className="flex-col bg-surface-black px-inset"
          >
            <div className="flex flex-col gap-stack">
              <h3 className="text-card-title text-white">Solar power generation</h3>
              <p className="text-body-sm text-on-dark-soft">
                The same card on the dark ground — `ground=&quot;dark&quot;` swaps the hairline,
                `inset=&quot;block&quot;` closes the bottom edge. Hover either to fill the accent.
              </p>
            </div>
          </Card>

          <TileShape className="aspect-plate p-6">
            <p className="text-body-sm text-body-soft">
              TileShape, the pre-v2 chamfered surface.{' '}
              <strong>No call site on the site itself</strong> — v2 replaced the business tiles with
              ledger rows, and &lt;Card&gt; no longer wraps it. Kept for a ruling, not in use.
            </p>
          </TileShape>
        </div>

        <div className="mt-flow flex flex-wrap items-center gap-4">
          <DateBadge date="2026-06-10T20:30:00Z" />
          <DateBadge date="2026-12-31T00:00:00Z" />
          <DateBadge date="2026-01-01T00:00:00Z" />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading eyebrow="Primitives" title="DocumentLink" />
        <div className="mt-flow max-w-3xl">
          <DocumentLink
            href="https://example.blob.core.windows.net/public/annual-return-fy-2024-25.pdf"
            title="Annual Return FY 2024-25"
            fileSize={2_411_724}
          />
          <DocumentLink
            href="https://example.blob.core.windows.net/public/policy.pdf"
            title="Whistle Blower Policy"
            fileSize={148_221}
          />
          <DocumentLink
            href="https://example.blob.core.windows.net/public/unknown.pdf"
            title="A document whose size the backend did not report"
          />
        </div>
      </Section>
      <Section background="black-dots">
        <SectionHeading eyebrow="Primitives" title='DocumentLink, ground="dark"' />
        <p className="mt-stack text-body">
          The same link on the black dot ground — what the business pages&apos; Product Downloads
          section (<code>sections/product-downloads</code>) is a list of.
        </p>
        <ul className="mt-flow max-w-3xl">
          <li>
            <DocumentLink
              ground="dark"
              href="https://example.blob.core.windows.net/public/datasheet-g12r.pdf"
              title="SAEL Solar TOPCon Bifacial G12R 615 635 Wp"
            />
          </li>
          <li>
            <DocumentLink
              ground="dark"
              href="https://example.blob.core.windows.net/public/datasheet-m10r.pdf"
              title="SAEL Solar TOPCon Bifacial M10R 580 600 Wp"
              fileSize={1_204_000}
            />
          </li>
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading
          eyebrow="Primitives"
          title="Accordion"
          description="The one client component in the set. Keyboard: Tab to a trigger, Enter or Space to toggle."
        />
        <div className="mt-flow max-w-3xl">
          <Accordion defaultOpen={['company']}>
            <AccordionItem value="company" title="Company">
              <p className="text-body">
                Panel content. The panel is unmounted when closed rather than hidden, so nothing
                inside it can hold focus while invisible.
              </p>
            </AccordionItem>
            <AccordionItem value="businesses" title="Businesses">
              <p className="text-body">Second panel.</p>
            </AccordionItem>
            <AccordionItem value="investors" title="Investors">
              <p className="text-body">Third panel.</p>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading eyebrow="Primitives" title="Pagination" />
        <div className="mt-flow flex flex-col gap-flow">
          <Row label="page 1 of 8">
            <Pagination currentPage={1} totalPages={8} basePath="/dev/design-system/" />
          </Row>
          <Row label="page 5 of 20">
            <Pagination currentPage={5} totalPages={20} basePath="/dev/design-system/" />
          </Row>
          <Row label="page 8 of 8">
            <Pagination currentPage={8} totalPages={8} basePath="/dev/design-system/" />
          </Row>
          <Row label="1 page — renders nothing">
            <Pagination currentPage={1} totalPages={1} basePath="/dev/design-system/" />
          </Row>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Primitives" title="EmptyState, Skeleton" />
        <div className="mt-flow grid grid-cols-1 gap-flow lg:grid-cols-2">
          <EmptyState
            title="No news items yet"
            description="Check back shortly, or browse the investor notifications."
            action={
              <Button href="/" size="sm">
                Back to home
              </Button>
            }
          />
          <div className="flex flex-col gap-stack">
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section background="dark">
        <SectionHeading eyebrow="Backgrounds" title="Section variants" />
        <p className="mt-stack text-body">
          This section is <code>background=&quot;dark&quot;</code>. The five others follow.
        </p>
      </Section>
      <Section background="gradient-stats" spacing="tight">
        <p className="text-stat">background=&quot;gradient-stats&quot;</p>
      </Section>
      <Section background="wash-strength" spacing="tight">
        <p className="text-body">
          background=&quot;wash-strength&quot; — the wash rotates to 180° below lg so the tint reads
          top-to-bottom once the section stacks.
        </p>
      </Section>
      <Section background="wash-goals" spacing="tight">
        <p className="text-body">background=&quot;wash-goals&quot;</p>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section spacing="tight">
        <SectionHeading eyebrow="Primitives" title="Container" />
        <p className="mt-stack text-body">
          The bars below show each Container size against the section gutter.
        </p>
      </Section>
      <Container>
        <div className="bg-brand-red/20 py-4 text-center">size=&quot;default&quot;</div>
      </Container>
      <Container size="narrow">
        <div className="mt-2 bg-brand-blue/20 py-4 text-center">size=&quot;narrow&quot;</div>
      </Container>
      <Container size="full">
        <div className="mt-2 bg-brand-purple/20 py-4 text-center">size=&quot;full&quot;</div>
      </Container>

      {/* ---------------------------------------------------------------- */}
      <Section background="alt">
        <SectionHeading
          eyebrow="Motion"
          title="Animation utilities"
          description="Enable prefers-reduced-motion and reload: every one of these should be inert and legible, never mid-animation or invisible."
        />
        <div className="mt-flow flex flex-col gap-flow">
          <Row label=".anim-word-in (stagger via --anim-index)">
            <p className="flex flex-wrap gap-2 text-h2">
              {'Generating clean energy'.split(' ').map((word, index) => (
                <span
                  key={word}
                  className="anim-word-in"
                  // The sanctioned use of an inline style: a runtime value
                  // carried into CSS, not a styling decision.
                  style={{ '--anim-index': index } as React.CSSProperties}
                >
                  {word}
                </span>
              ))}
            </p>
          </Row>
          <Row label=".anim-ken-burns">
            <div className="h-32 w-full overflow-hidden">
              <div className="anim-ken-burns h-full w-full bg-(image:--gradient-stats)" />
            </div>
          </Row>
          <Row label=".anim-dot-fill (--slide-duration)">
            <span className="block h-1.5 w-[34px] overflow-hidden rounded-pill bg-inert">
              <span
                className="anim-dot-fill block h-full bg-brand-red"
                style={{ '--slide-duration': '6s' } as React.CSSProperties}
              />
            </span>
          </Row>
          <Row label=".anim-dot-pulse">
            <span className="anim-dot-pulse block size-3 rounded-pill bg-brand-red" />
          </Row>
          <Row label=".anim-spark-flick">
            <span className="anim-spark-flick block size-3 rounded-pill bg-brand-red" />
          </Row>
          <Row label=".anim-marquee">
            <div className="overflow-hidden">
              <div className="anim-marquee flex w-max gap-4">
                {Array.from({ length: 12 }, (_, index) => (
                  <span key={index} className="rounded-sdg bg-sdg-7 px-6 py-3">
                    Goal
                  </span>
                ))}
              </div>
            </div>
          </Row>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section>
        <SectionHeading eyebrow="Utilities" title="formatDate, formatFileSize" />
        <div className="mt-flow">
          {DATE_SAMPLES.map(([input, output]) => (
            <Row key={input} label={input}>
              <code className="text-body-sm">{output}</code>
            </Row>
          ))}
          {FILE_SIZE_SAMPLES.map(([input, output]) => (
            <Row key={input} label={input}>
              <code className="text-body-sm">{output}</code>
            </Row>
          ))}
        </div>
      </Section>
    </>
  );
}
