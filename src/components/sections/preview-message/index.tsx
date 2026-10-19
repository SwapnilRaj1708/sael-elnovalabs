import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';

export interface PreviewMessageProps {
  /** What happened, as the page's `<h1>`. */
  title: string;
  /** What to do next. */
  body: string;
  /** The live page this preview stands in for — a way out that always works. */
  liveLink: { href: string; label: string };
}

/**
 * What a Live Preview page shows when it has no preview to show: the link was
 * refused, the session ended, it was for another section, or the backend
 * could not be reached. The words come from `app/_content/preview.ts`; this
 * only lays them out.
 *
 * On the investor template's black ground, as the page would have been, with
 * the message as the page's one `<h1>`. A Server Component.
 */
export function PreviewMessage({ title, body, liveLink }: PreviewMessageProps) {
  return (
    <Section background="black-dots" spacing="closing" containerSize="narrow">
      <div className="flex flex-col items-start gap-stack">
        <h1 className="text-h2 text-balance text-white">{title}</h1>
        <p className="text-body text-pretty text-on-dark-soft">{body}</p>
        <Button href={liveLink.href} variant="ghost" size="flush">
          {liveLink.label}
        </Button>
      </div>
    </Section>
  );
}
