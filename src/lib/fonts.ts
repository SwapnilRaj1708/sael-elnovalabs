import localFont from 'next/font/local';

/**
 * DIN, the SAEL corporate typeface.
 *
 * `next/font/local` self-hosts the files, emits the `@font-face` rules, and
 * preloads them — so there is no render-blocking network request to a third
 * party, and nothing to configure in Nginx.
 *
 * Two weights, 400 and 700. There is no 500 or 600 and nothing may ask for
 * one; `font-synthesis-weight: none` in globals.css makes a stray request
 * fail visibly rather than smear the outlines into a fake bold.
 *
 * `adjustFontFallback` is left at its default, which derives a metric-matched
 * fallback face from Arial. Combined with `display: 'swap'` the swap is close
 * to imperceptible instead of reflowing the page.
 *
 * See src/assets/fonts/README.md for how the WOFF2 files are produced, and for
 * the known gaps in the supplied originals (notably: no ₹).
 */
export const din = localFont({
  src: [
    {
      path: '../assets/fonts/din-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      // Cut from the client's DIN Bold.otf rather than DIN Bold.ttf: the OTF
      // is the only one of the two with kerning, and most of the visible type
      // on the site is 700. See ../assets/fonts/README.md.
      path: '../assets/fonts/din-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-din',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: true,
});
