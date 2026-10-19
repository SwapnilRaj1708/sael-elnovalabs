import iconAgriWaste from '@/assets/images/business/icon-agri-waste.png';
import iconCellManufacturing from '@/assets/images/business/icon-solar-cell.png';
import iconModuleManufacturing from '@/assets/images/business/icon-solar-module.png';
import iconSolarGeneration from '@/assets/images/business/icon-solar-energy.png';
import aboutCutout from '@/assets/images/aboutSael/sardar-kid-cropped.png';
import aboutPhoto from '@/assets/images/aboutSael/burning-crop.png';
import heroImageMobile1 from '@/assets/images/hero/hero-image-mobile-1.jpg';
import heroImageMobile2 from '@/assets/images/hero/hero-image-mobile-2.jpg';
import heroImageMobile3 from '@/assets/images/hero/hero-image-mobile-3.jpg';
import heroImageMobile4 from '@/assets/images/hero/hero-image-mobile-4.jpg';
import heroImage1 from '@/assets/images/hero/hero-copy-2-1.png';
import heroImage2 from '@/assets/images/hero/hero-copy-2-2.png';
import heroImage3 from '@/assets/images/hero/hero-copy-2-3.png';
import heroImage4 from '@/assets/images/hero/hero-copy-2-4.png';
import solBhadra from '@/assets/images/solutions/sol-bhadra.jpg';
import solKishangarh from '@/assets/images/solutions/sol-kishangarh.jpg';
import solMizoram from '@/assets/images/solutions/sol-mizoram.jpg';
import solPatiala from '@/assets/images/solutions/sol-patiala.jpg';
import goalEthos from '@/assets/images/goals/India-orange.jpg';
import goalMission from '@/assets/images/goals/green.jpg';
import goalVision from '@/assets/images/goals/panel-closeup.jpg';
import endeavourGirl from '@/assets/images/endeavour/endeavour-girl.png';
import endeavourPanel from '@/assets/images/endeavour/solar-panel.png';
import dottedMap from '@/assets/images/map.svg';
import markEthos from '@/assets/images/ethos-icon.svg';
import markMission from '@/assets/images/mission-icon.svg';
import markVision from '@/assets/images/vision-icon.svg';
import type { BusinessTile } from '@/components/sections/business-tiles';
import type { EndeavourSplitProps } from '@/components/sections/endeavour-split';
import type { GoalsGridProps } from '@/components/sections/goals-grid';
import type { HeroSlide } from '@/components/sections/hero-carousel';
import type { IntroSplitProps } from '@/components/sections/intro-split';
import type { PresenceSite } from '@/components/sections/presence-map';
import type { SolutionsCarouselProps } from '@/components/sections/solutions-carousel';
import { TODO_CONTENT } from '@/lib/config/site';

/**
 * The homepage's static content.
 *
 * Static, not dynamic: this is marketing copy that changes with a design
 * review and a deploy, so it lives in typed TypeScript rather than behind the
 * content repository. The homepage's one *dynamic* surface — the In the News
 * rail — comes from `getContentRepository()` instead. The capacity figures
 * are here too: the backend never had an endpoint for them
 * (docs/api-contracts.md §9). docs/content-model.md §1.
 *
 * Section components never import this file. The page reads it and passes it
 * down, which is what keeps every section reusable on the pages that follow.
 * /CLAUDE.md §5.
 */

/**
 * The hero's four slides, rebuilt to `SAEL Home v2`.
 *
 * The six placement coordinates each slide used to carry are gone with the
 * design that needed them: v2 has one composition and the content column sits
 * in the same place on every slide. What is per-slide now is the photograph,
 * the mark, the headline, the run of words inside it that takes a gradient,
 * and the ramp its progress segment fills with.
 *
 * The four highlights are the design's own. Each is an exact substring of the
 * headline above it — `<HeroHeadline>` matches on words, and a highlight that
 * does not match renders flat rather than breaking the headline.
 *
 * The marks are the business ledger's own, with the business name typed
 * beneath each one, since 2026-10-01. The client's lettered artwork
 * (`cropped-sael-icon-*.png`) carried the old names baked in.
 *
 * The progress bar no longer takes a ramp per slide: it fills once across the
 * whole cycle from one gradient. See `<HeroProgress>`.
 *
 * Still outstanding, and each renders through `<MediaFrame>`'s pending state
 * until it lands (docs/asset-inventory.md §9):
 *
 *  - the four art-directed **portrait crops** for below `lg`. Until they
 *    arrive the landscape master stands in — see the note in hero-backdrop.tsx.
 *  - `alt` text for every photograph
 */
export const heroSlides: HeroSlide[] = [
  {
    id: 'solar-modules',
    image: {
      desktop: heroImage1,
      mobile: heroImageMobile1,
      // Describes the scene, not the brand. docs/design-guidelines.md §6.
      alt: TODO_CONTENT,
    },
    symbol: {
      image: iconSolarGeneration,
      pending: 'icons/symbol-solar-generation',
      label: ['Solar Energy', 'Generation'],
    },
    headline: 'Not Block,\nWe Unlock the power of the sun',
    highlight: 'Block,\nWe Unlock',
    highlightClassName: 'bg-(image:--gradient-hero-word-1)',
  },
  {
    id: 'energy-generation',
    image: {
      desktop: heroImage4,
      mobile: heroImageMobile2,
      alt: TODO_CONTENT,
    },
    symbol: {
      image: iconModuleManufacturing,
      pending: 'icons/symbol-module-manufacturing',
      label: ['Solar Module', 'Manufacturing'],
    },
    headline: 'Look towards a future of Unlimited Solar Energy',
    highlight: 'Unlimited Solar Energy',
    highlightClassName: 'bg-(image:--gradient-hero-word-2)',
  },
  {
    id: 'clean-energy-vision',
    image: { desktop: heroImage3, mobile: heroImageMobile3, alt: TODO_CONTENT },
    symbol: {
      image: iconCellManufacturing,
      pending: 'icons/symbol-cell-manufacturing',
      label: ['Solar Cell', 'Manufacturing'],
    },
    headline: 'Energy Independence, courtesy the Sun',
    highlight: 'Energy Independence,',
    highlightClassName: 'bg-(image:--gradient-hero-word-3)',
  },
  {
    id: 'agri-waste',
    image: { desktop: heroImage2, mobile: heroImageMobile4, alt: TODO_CONTENT },
    symbol: {
      image: iconAgriWaste,
      pending: 'icons/symbol-agri-waste',
      label: ['Agri Waste To', 'Energy'],
    },
    headline: 'Not pollution, but a charged Solution',
    highlight: 'Not pollution,',
    highlightClassName: 'bg-(image:--gradient-hero-word-4)',
  },
];

/**
 * "About SAEL" — section 2.
 *
 * Copy transcribed from `SAEL - New Website.pdf`, the client's own design,
 * rather than from the Designer prototype. The two differ for this section and
 * the client asked for the PDF; see the note on `<IntroSplit>`.
 *
 * The body is the PDF's verbatim, with its line-break hyphen in
 * "decar-bonization" closed up and its apostrophes normalised to the typographic
 * form used everywhere else on the site. Nothing else is altered.
 */
export const aboutSael: Omit<IntroSplitProps, 'snap'> = {
  eyebrow: 'About SAEL',
  title: 'Endeavoring to make a sustainable impact',
  body:
    'At SAEL, we strive to provide decarbonization solutions to facilitate ' +
    'India’s adoption of clean and affordable energy projects. Our commitment ' +
    'lies in delivering environmentally conscious energy solutions. As one of ' +
    'India’s leading renewable energy companies, we are dedicated to enhancing ' +
    'the energy landscape nationwide.',
  media: {
    image: aboutPhoto,
    // Two alts where there was one, because there are two images where there
    // was one: the sentence that described the composite — "A young boy in a
    // turban, against a field of burning crop stubble" — split at its comma,
    // each half now describing the layer it belongs to. Nothing new is
    // asserted. Both describe the artwork rather than the section, and both
    // are still copy that wants a review.
    alt: 'A field of burning crop stubble',
    cutout: aboutCutout,
    cutoutAlt: 'A young boy in a turban',
  },
};

/**
 * "Business Portfolio" — section 3.
 *
 * Each row: mark, name, copy, destination — and its capacity figure.
 *
 * **The figures and their qualifiers are SAEL's, as reviewed for the new
 * site**, set on 2026-10-01 in `5494e70` and shown on sael-dev.vercel.app.
 * They are static because the backend has no endpoint for them
 * (docs/api-contracts.md §9), so a change is a release, and they are on SAEL's
 * sign-off list (the backend's `docs/client/static-content-sign-off.md`).
 *
 * **https://www.sael.co/ is not their source, and does not agree with them.**
 * That is SAEL's previous website. Its Business Portfolio block reads
 * 8299.5 MWp, 5000 MW+ (proposed), 3625 MW + 5000 MW (proposed) and
 * 164.9 MW, with no qualifiers. On 2026-10-02 these rows were changed to
 * those values on the reasoning that the live site was authoritative; that
 * reverted SAEL's reviewed figures to their old site's, and it was undone on
 * 2026-10-04. "The live site says X" is not grounds for changing a figure
 * here — docs/content-model.md §1.1.
 *
 * A trailing `*` on a value is the marker its qualifier explains; the section
 * sets it as a superscript.
 *
 * `upcoming` is the only per-row adjustment — see the note beside it. There
 * was a second, `iconScale`, which scaled one mark against the other three;
 * the agri-waste nudge it existed for was withdrawn on 2026-08-22 and the
 * prop itself on 2026-08-26, when the mark stopped being drawn in a box.
 *
 * The descriptions are the Designer prototype's, verbatim, as
 * docs/features/04 §4 requires. The client's PDF sets Lorem ipsum in these
 * four slots, so it is not a source for them — and inventing marketing copy
 * for a company that publishes financial results is exactly what /CLAUDE.md §3
 * forbids. Where the two sources disagree on *layout* the PDF wins; where the
 * PDF simply has no content, the prototype does.
 */
export const businessTiles: BusinessTile[] = [
  {
    id: 'solar-generation',
    icon: iconSolarGeneration,
    title: 'Solar Energy Generation',
    description:
      'SAEL develops and operates large-scale solar power plants, generating clean, affordable energy across India and advancing the nation’s renewable transition.',
    value: '8.3 GWp',
    footnote: 'Contracted & Awarded (Solar IPP & BESS)',
    href: '/solar-energy/',
    ctaLabel: 'Know more about solar energy generation',
    figureClassName: 'text-figure-solar-bright',
    ruleClassName: 'bg-figure-solar-bright',
    titleGradientClassName: '[--ledger-title-gradient:var(--gradient-ledger-solar)]',
  },
  {
    id: 'cell-manufacturing',
    icon: iconCellManufacturing,
    title: 'Solar Cell Manufacturing',
    description:
      'Our facilities manufacture high-efficiency solar cells using advanced bifacial TOPCon technology, delivering superior output and reliability.',
    value: '5 GW*',
    footnote: '*Upcoming',
    href: '/solar-cell-manufacturing/',
    ctaLabel: 'Know more about solar cell manufacturing',
    figureClassName: 'text-figure-cell-bright',
    ruleClassName: 'bg-figure-cell-bright',
    titleGradientClassName: '[--ledger-title-gradient:var(--gradient-ledger-cell)]',
    // The one business that is not yet operational, so it takes its own
    // ground in the ledger. The client's call on 2026-08-20.
    upcoming: true,
  },
  {
    id: 'module-manufacturing',
    icon: iconModuleManufacturing,
    title: 'Solar Module Manufacturing',
    description:
      'We produce bifacial solar modules engineered for performance, durability, and long-term reliability across diverse operating environments.',
    value: '3.6 GWp + 5 GW*',
    footnote: 'Operational · *Upcoming',
    href: '/module-manufacturing/',
    ctaLabel: 'Know more about solar module manufacturing',
    figureClassName: 'text-figure-module-bright',
    ruleClassName: 'bg-figure-module-bright',
    titleGradientClassName: '[--ledger-title-gradient:var(--gradient-ledger-module)]',
  },
  {
    id: 'agri-waste',
    icon: iconAgriWaste,
    title: 'Agri Waste-to-Energy',
    description:
      'We convert agricultural residue into clean energy, reducing stubble burning and emissions while creating value for farming communities.',
    value: '164.9 MW',
    footnote: 'Operational',
    href: '/waste-to-energy/',
    ctaLabel: 'Know more about agri waste to energy',
    figureClassName: 'text-figure-agri-bright',
    ruleClassName: 'bg-figure-agri-bright',
    titleGradientClassName: '[--ledger-title-gradient:var(--gradient-ledger-agri)]',
    // The leaves carried a +12% nudge against the other three marks until
    // 2026-08-22. All four are drawn at one width now, each at its own
    // height — see the mark in sections/business-tiles.
  },
];

/**
 * "SAEL Pan India Green Footprint" — section 4.
 *
 * **The figures are the client's updated map of 2026-10-06** ("11 States |
 * 50+ Projects"), which marks each figure with its business's icon, legibly —
 * so each figure's business is read off the map, not derived. Two kinds of
 * row are new there: a figure carrying two icons joined by "+" (Uttar
 * Pradesh's module and cell capacity together) and a solar figure paired with
 * a battery (Maharashtra and Andhra Pradesh). Both are `plus` on the figure,
 * and the callout names both, the battery as "Battery Storage" (the client's
 * wording, 2026-10-07). Within a state the figures keep the map's order.
 *
 * It replaces the figures taken from `SAEL-Numbers and data.pdf` page 2 on
 * 2026-08-27, whose businesses had to be derived from page 1's totals because
 * that file's icons were illegible. The business pages' own maps
 * (`solar-energy.ts` and the rest) carry the same figures since 2026-10-06.
 *
 * Coordinates are points in the artwork's own 311.33 × 337.45 viewBox —
 * `src/assets/images/dotted-map.svg`, supplied by the client on 2026-08-21.
 *
 * **They are fitted, not measured.** The six site pins that preceded these
 * were themselves carried across from a previous 620 × 660 geometry rather
 * than measured (see sections/presence-map/dots.ts). Rather than start a
 * second, unrelated guess, a lon→x / lat→y linear fit was taken *from those
 * six* and the eleven state centroids pushed through it. The artwork turns out
 * to be a plain equirectangular projection and the fit is tight — five of the
 * six residuals are under one viewBox unit, the worst is 2.7, which is 0.9% of
 * the width. So these pins are no worse placed than the ones they replace,
 * which is not the same as saying either is right: **the map still wants an
 * eye before it ships.**
 *
 * `href` is absent throughout, so the design's "Visit Location" link does not
 * render. The destinations have not been supplied.
 */
export const presenceSites: PresenceSite[] = [
  {
    id: 'punjab',
    name: 'Punjab',
    x: 86.8,
    y: 59.9,
    figures: [
      { metric: 'module-assembly', value: '225 MW' },
      { metric: 'solar-ipp', value: '685.6 MW' },
      { metric: 'agri-waste', value: '60.5 MW' },
    ],
  },
  {
    id: 'haryana',
    name: 'Haryana',
    x: 79.1,
    y: 76,
    figures: [
      { metric: 'solar-ipp', value: '5.3 MW' },
      { metric: 'agri-waste', value: '15 MW' },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    x: 94.6,
    y: 84,
    figures: [{ metric: 'solar-ipp', value: '1 MW' }],
  },
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    x: 125,
    y: 108.4,
    figures: [
      { metric: 'solar-ipp', value: '196.2 MW' },
      { metric: 'module-assembly', plus: 'solar-cell', value: '10000 MW' },
    ],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    x: 48.4,
    y: 116.3,
    figures: [
      { metric: 'module-assembly', value: '3400 MW' },
      { metric: 'solar-ipp', value: '298 MW' },
      { metric: 'agri-waste', value: '89.4 MW' },
    ],
  },
  {
    id: 'assam',
    name: 'Assam',
    x: 270.4,
    y: 116,
    figures: [{ metric: 'solar-ipp', value: '1 MW' }],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    x: 262.8,
    y: 156.4,
    figures: [{ metric: 'solar-ipp', value: '21 MW' }],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    x: 33,
    y: 172.6,
    figures: [{ metric: 'solar-ipp', value: '2620 MW' }],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    x: 64,
    y: 204.6,
    figures: [
      { metric: 'solar-ipp', value: '133.4 MW' },
      { metric: 'solar-ipp', plus: 'storage', value: '275 MW' },
    ],
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    x: 109.8,
    y: 261,
    figures: [
      { metric: 'solar-ipp', value: '1599 MW' },
      { metric: 'solar-ipp', plus: 'storage', value: '1646 MW' },
    ],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    x: 71.4,
    y: 253,
    figures: [{ metric: 'solar-ipp', value: '1356 MW' }],
  },
];

/**
 * The counts beside the map, exactly as the PDF sets them.
 *
 * Static for now, though they are arguably the same kind of value as the
 * capacity figures — a number the business owns that changes without a design
 * review. Worth a `getFootprintSummary()` on the repository when FE-05 builds
 * the contract out; it is not worth a method of its own today.
 */
export const presenceSummary = {
  // Neither of the first two is from the PDF. The heading was added at the
  // client's request on 2026-08-05 so the section has one of its own; the
  // label on 2026-08-26, so it opens the way every other section does — the
  // design's own screen has no label here. The footprint title below is the
  // PDF's.
  eyebrow: 'Portfolio',
  heading: 'Our Current Power Portfolio',
  map: { image: dottedMap },
  title: ['SAEL Pan India', 'Green Footprint'] as [string, string],
  primaryStat: '11 States',
  secondaryStat: '60 Projects Sites',
};

/**
 * "Solutions" — section 5.
 *
 * Copy and card order are the client's PDF verbatim, including the plaque
 * lines: Patiala's is "Solar Plant" with no figure on it, where Mizoram's
 * carries "21 MW". That asymmetry is the design's, not an omission — Patiala's
 * capacity has not been supplied, and adding one would be inventing a number
 * for a company that publishes results. /CLAUDE.md §3.
 *
 * The PDF shows three cards across with a fourth alongside; the fourth is
 * Bhadra, corroborated by both the AI reference and the map's own site list.
 *
 * `alt` describes each photograph rather than repeating the plant's name and
 * capacity — the plaque is already text, and a screen reader reads it. These
 * are written from the images themselves and assert nothing about the business
 * that is not visible in the frame, but they are still copy and want a review.
 */
export const solutions: Omit<SolutionsCarouselProps, 'snap'> = {
  eyebrow: 'Solutions',
  title: 'Embracing Green Energy for a Sustainable World',
  lead:
    'With a plant first approach, we are making a sustainable impact by ' +
    'propelling green energy solutions.',
  slides: [
    {
      id: 'patiala',
      image: solPatiala,
      alt: 'Aerial view of long rows of solar panels raised over a canal, lined with trees',
      place: 'Patiala',
      descriptor: 'Solar Plant',
    },
    {
      id: 'mizoram',
      image: solMizoram,
      alt: 'Aerial view of solar panels stepped across forested hills at sunrise',
      place: 'Mizoram',
      descriptor: '21 MW Solar Plant',
    },
    {
      id: 'kishangarh',
      image: solKishangarh,
      alt: 'Aerial view of a manufacturing plant at dusk beside a highway, hills on the horizon',
      place: 'Kishangarh',
      descriptor: 'Solar Module Manufacturing Plant',
    },
    {
      id: 'bhadra',
      image: solBhadra,
      alt: 'Aerial view of a lit power plant at night, its chimney stack rising over scrubland',
      place: 'Bhadra',
      descriptor: 'Biomass Plant',
    },
  ],
};

/**
 * "Our Endeavour" — section 6.
 *
 * The three paragraphs are the client's PDF verbatim, with its line-break
 * hyphen in "unwaver-ing" closed up and its apostrophes normalised to the
 * typographic form used everywhere else on the site. Nothing else is altered.
 *
 * No title: the design's "OUR ENDEAVOUR" is the eyebrow and there is no
 * heading under it. See the note on `<EndeavourSplit>`.
 */
export const ourEndeavour: Omit<EndeavourSplitProps, 'snap'> = {
  eyebrow: 'Our Endeavour',
  body: [
    'At SAEL, we are continuously endeavouring to facilitate India’s adoption of clean ' +
      'and affordable energy projects. As one of India’s leading renewable energy ' +
      'companies, we are dedicated to enhancing the energy landscape nationwide.',
    'We are committed to environmentally sustainable and economically viable energy ' +
      'solutions. We are involved in developing and implementing renewable energy ' +
      'technologies, energy efficiency solutions, and possibly energy access initiatives ' +
      'for underserved communities.',
    'We acknowledge the pivotal role of energy access in enhancing the well-being and ' +
      'satisfaction of both our customers and the communities we serve. Our unwavering ' +
      'commitment is to improve access to sustainable and clean energy.',
  ],
  media: {
    image: endeavourPanel,
    // Two alts where there was one, the same split the About artwork took on
    // 2026-09-01: the sentence that described the composite — "A young girl in
    // a white top, against solar panels lit in red and purple" — divided
    // between the layers it was describing. The colour is dropped from the
    // panel's half because it is no longer in the photograph; it is
    // --gradient-endeavour-panel, applied over it. Still copy, still wants a
    // review.
    alt: 'A close view of solar panels',
    cutout: endeavourGirl,
    cutoutAlt: 'A young girl in a white top',
  },
};

/**
 * "Our Goals" — section 7.
 *
 * The client's design skips `features/04` §9, the SDG marquee, so this follows
 * "Our Endeavour" directly. Confirmed by the client on 2026-08-05: the SDG
 * section is not to be built for now.
 *
 * Copy is the PDF's verbatim, with its line-break hyphen in "renew-able"
 * closed up. Both the PDF and the Designer prototype carry the same three
 * paragraphs, so there is no source conflict here.
 *
 * **The marks are the client's own now.** They were `lucide-react` stand-ins
 * while the artwork was outstanding; the three SVGs arrived on 2026-08-21 and
 * are here. They are drawn in near-black for use on paper and the card inverts
 * them to white — see the note at the call site in sections/goals-grid.
 */
export const ourGoals: Omit<GoalsGridProps, 'snap'> = {
  title: 'Our Goals',
  goals: [
    {
      id: 'mission',
      title: 'Mission',
      body:
        'SAEL is committed to reshaping the global energy panorama through scalable and ' +
        'sustainable solutions. We harness cutting-edge technologies and industry best ' +
        'practices to provide dependable and eco-friendly energy solutions, fostering the ' +
        'widespread adoption of renewable energy across diverse markets.',
      image: goalMission,
      icon: markMission,
    },
    {
      id: 'vision',
      title: 'Vision',
      body:
        'At SAEL, our vision is to spearhead the shift towards a sustainable energy future, ' +
        'where renewable sources drive economies and enhance lives. We envision a future ' +
        'where sustainable energy solutions seamlessly integrate into global infrastructure.',
      image: goalVision,
      icon: markVision,
    },
    {
      id: 'ethos',
      title: 'Ethos',
      body:
        'SAEL exemplifies an unwavering dedication to sustainable energy solutions, fueled ' +
        'by innovation, integrity, and holistic community empowerment. Our principles embody ' +
        'a culture of excellence, inclusivity, and accountability, fostering resonance with ' +
        'our global communities and partners.',
      image: goalEthos,
      icon: markEthos,
    },
  ],
};
