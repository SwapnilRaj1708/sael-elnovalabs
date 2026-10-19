import { cva, type VariantProps } from 'class-variance-authority';

/**
 * What a news card's action shares, whichever kind it is — `<NewsCardLink>`
 * on the server, `<VideoDialog>` on the client. In a module of its own so
 * the client leaf can take these classes without pulling `<NewsCard>`, and
 * `<Card>` and `next/image` behind it, into the browser bundle.
 */

/**
 * The card's layout. `stack` always stands up; `adaptive` is a row while
 * its grid is one column and stands up from the grid's `@2xl` width.
 * See `<NewsCard>`.
 */
export const newsCardLayout = cva('', {
  variants: {
    layout: {
      stack: 'flex-col',
      adaptive:
        'grid grid-cols-(--news-row-cols) content-start gap-x-inset @2xl:flex @2xl:flex-col',
    },
  },
  defaultVariants: { layout: 'stack' },
});

/**
 * The action's own classes: its hit area stretched over the whole card —
 * the `<Card>` is the positioned ancestor — and the space above it.
 */
export const newsCardAction = cva(
  ['hover:no-underline', "after:absolute after:inset-0 after:content-['']"],
  {
    variants: {
      layout: {
        stack: 'mt-auto pt-card-flow',
        adaptive: 'col-start-2 self-start pt-tight @2xl:mt-auto @2xl:pt-card-flow',
      },
    },
    defaultVariants: { layout: 'stack' },
  },
);

/** The `<Button>` variant an action takes on each ground. */
export const NEWS_CARD_ACTION_VARIANT = { paper: 'quiet', dark: 'quietOnDark' } as const;

export type NewsCardGround = keyof typeof NEWS_CARD_ACTION_VARIANT;
export type NewsCardLayout = NonNullable<VariantProps<typeof newsCardLayout>['layout']>;
