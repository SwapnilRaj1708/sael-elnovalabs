import type { ReactNode } from 'react';
import { BeliefSection, type Belief } from './belief-section';

export type { Belief, BeliefAccent, BeliefCutout } from './belief-section';

export interface BeliefStackProps {
  /** One per belief, top to bottom. Each says which side its cut-out takes. */
  beliefs: readonly Belief[];
  /**
   * An action under the last card — Our Core Beliefs' ESG Report link.
   * Centred from `sm`; the full width below it, where a pill that size is
   * the easier target.
   */
  action?: ReactNode;
  /** Opt every belief into the page's section snapping. */
  snap?: boolean;
}

/**
 * Our Core Beliefs' body (FE-14): the beliefs, each a screen of its own, and
 * an action under the last. Built to `Our Core Beliefs.dc.html`; see
 * `<BeliefSection>` for the card.
 *
 * The action rides in the last belief's section rather than in one of its
 * own: on a snapping page a short section is a stop that shows almost
 * nothing, and the pill belongs under the card it closes.
 *
 * A Server Component; only `<Reveal>` is client.
 */
export function BeliefStack({ beliefs, action, snap = false }: BeliefStackProps) {
  return beliefs.map((belief, index) => (
    <BeliefSection
      key={belief.id}
      {...belief}
      snap={snap}
      action={index === beliefs.length - 1 ? action : undefined}
    />
  ));
}
