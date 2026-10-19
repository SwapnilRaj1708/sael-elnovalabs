'use client';

import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';

/**
 * Route-level error boundary.
 *
 * Deliberately shows no stack trace, no message and no digest — those belong
 * in the server log. A corporate site putting an exception on screen looks
 * broken to a visitor and leaks implementation detail to everyone else.
 *
 * `reset()` re-renders the segment, which is genuinely worth offering: most
 * failures here will be a transient backend timeout rather than a real bug.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section spacing="default">
      <div className="flex flex-col items-start gap-flow py-section-y">
        <SectionHeading
          as="h1"
          eyebrow="Something went wrong"
          title="We could not load this page"
          description="This is usually temporary. Try again, and if it keeps happening please get in touch."
        />
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => {
              reset();
            }}
          >
            Try again
          </Button>
          <Button href="/" variant="ghost">
            Go to the homepage
          </Button>
        </div>
      </div>
    </Section>
  );
}
