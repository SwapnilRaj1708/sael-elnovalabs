import type { TeamGridGroup, TeamMember } from '@/components/sections/team-grid';
import type { BreadcrumbTrailItem } from '@/lib/seo/json-ld';
import { tryBlobUrl } from '@/lib/utils/blob-url';

/**
 * The Our Team page's static content: the frame — title, standfirst, trail,
 * tab labels — and the roster itself.
 *
 * **The roster is static, not repository content.** SAEL descoped the team
 * endpoint on 20 Sep 2026 (backend row 5.24, `docs/api-contracts.md` §9), so
 * there is nothing for the API to serve and a change to anyone here is a
 * release by us, not an edit in SAEL's panel.
 *
 * **Every string is transcribed verbatim from `Our Team.dc.html`**, the
 * client's Claude Design project, and is what SAEL review on the new site.
 * It happens to match the old https://www.sael.co/our-team/ exactly — every
 * name, designation, biography, LinkedIn URL, tab and order, compared on
 * 2026-10-02 — but the old site is not its source, and a later difference
 * there is not a reason to change it (/CLAUDE.md §2 rule 8). /CLAUDE.md §2
 * rule 3: nothing is paraphrased and nothing missing has been invented.
 * SAEL's sign-off list
 * for this content is the backend's `docs/client/static-content-sign-off.md`.
 *
 * ## The portraits
 *
 * Seventeen, uploaded by the client to `<container>/web-assets/media/our-team/`
 * and **byte-identical to the files the live page serves** from
 * `/img/team/` (compared by SHA-256 on 2026-10-02). Each is stored here as a
 * path in the container, so no hostname is committed (/CLAUDE.md §7), and
 * composed with `AZURE_BLOB_BASE_URL` when this module loads. With that
 * variable unset `tryBlobUrl` yields `null` and each card falls back to its
 * initials avatar: the roster still renders — every name, designation,
 * biography and LinkedIn link — and the omission is quiet.
 *
 * There is no other artwork. The design opens on the dotted black ground
 * rather than on a banner photograph, so unlike `about-us.ts` this file
 * imports no images.
 */

/** A portrait in the Our Team folder of the blob container. */
const portrait = (file: string): string | null => tryBlobUrl(`web-assets/media/our-team/${file}`);

export const ourTeamMeta = {
  /**
   * The design file's own `<title>`, verbatim — including the hyphen, where
   * `about-us.ts` carries a pipe. The two design files differ and neither is
   * this codebase's invention; **FE-22 should settle which separator the site
   * uses** against the legacy titles, since changing a ranking title is not a
   * decision to make in passing. Flagged in the tracker.
   */
  title: 'Our Team - SAEL',
} as const;

export const ourTeamHero: {
  title: string;
  intro: string;
  breadcrumb: readonly BreadcrumbTrailItem[];
} = {
  title: 'Our Team',
  intro: 'The Minds Steering the Worldwide Energy Evolution',
  breadcrumb: [
    { name: 'Home', href: '/' },
    // No `href`: "Company" groups the pages under it and is not one itself.
    // The same rung About Us hangs from.
    { name: 'Company' },
    { name: 'Our Team', href: '/our-team/' },
  ],
};

/**
 * The two tabs, in the design's order.
 *
 * Labels live here and the ids live in `TeamGroup`, so a rename is a copy
 * change and not a data migration. The order is this array's, not the
 * repository's — `order` sequences people within the roster, not the groups.
 */
export const ourTeamGroups: readonly TeamGridGroup[] = [
  { id: 'leadership', label: 'Leadership' },
  { id: 'management', label: 'Management' },
];

/**
 * Shown in place of the tabs if the roster is empty. Unreachable while
 * `ourTeamMembers` has anyone in it — there is no fetch left to fail — and
 * kept because `<TeamGrid>` draws its empty state from it.
 *
 * Deliberately says nothing about *why*. A visitor cannot act on "the content
 * service timed out", and a page that names its backend in an error message is
 * telling an attacker something it did not need to.
 */
export const ourTeamEmpty = {
  title: 'Team profiles are unavailable',
  description: 'We could not load the team just now. Please try again shortly.',
} as const;

/**
 * The roster, both groups, **in the live page's order** — the board in the
 * order the company lists it, then management. The page renders it as given
 * and never re-sorts it.
 *
 * Not derived from the board: `app/_content/corporate-governance.ts` is the
 * governance record. The ten directors' text is the same on both pages today
 * (the board's bolds the name), but a change to one must not silently change
 * the other, so each page keeps its own copy.
 *
 * Every row has a portrait and a biography, so `photoUrl: null` and
 * `bio: null` are not exercised by this roster; the card and the page handle
 * both.
 */
export const ourTeamMembers: readonly TeamMember[] = [
  {
    id: 'jasbir-singh',
    name: 'Jasbir Singh',
    designation: 'Managing Director and Chairperson',
    group: 'leadership',
    photoUrl: portrait('jasbir-singh.jpg'),
    bio: '<p>Jasbir Singh is the Managing Director and Chairperson of our Company. He has over twenty-Six years of experience in the agri- commodity and power sector. He also serves as a director in entities such as SAEL Solar P15 Private Limited, SAEL Limited, SAEL Solar MFG. Private Limited, SAEL Agri Commodities Limited, AWLA Energy P Twenty Four Private Limited and AWLA Energy P Twenty Five Private Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'sukhbir-singh',
    name: 'Sukhbir Singh',
    designation: 'Non-Executive Director',
    group: 'leadership',
    photoUrl: portrait('sukhbir-singh.jpg'),
    bio: '<p>Sukhbir Singh is a Non- Executive Director of our Company. He has over twenty-Six years of experience in the agri- commodity and power sector. He also serves as a director in other entities such as SAEL Solar P9 Private Limited, SAEL Solar P10 Private Limited, SAEL Agri Commodities Limited, SAEL Solar MHP2 Private Limited, SAEL Solar MHP1 Private Limited, AWLA Energy P Twenty Six Private Limited and AWLA Energy P Twenty Seven Private Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'laxit-awla',
    name: 'Laxit Awla',
    designation: 'Executive Director and Chief Executive Officer',
    group: 'leadership',
    photoUrl: portrait('laxit-awla.jpg'),
    bio: '<p>Laxit Awla is an Executive Director and Chief Executive Officer of our Company. He has over nine years of experience in the power sector. He also serves as a director in other entities such as SAEL Solar MHP2 Private Limited, SAEL Solar P7 Private Limited, SAEL Solar P6 Private Limited, Hyper Reality Studio Private Limited, AWLA Energy P Twenty Four Private Limited, AWLA Energy P Twenty Five Private Limited, AWLA Energy P Twenty Six Private Limited and AWLA Energy P Twenty Seven Private Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'oistein-magnar-andresen',
    name: 'Øistein Magnar Andresen',
    designation: 'Nominee Director',
    group: 'leadership',
    photoUrl: portrait('oistein-magnar-andresen.jpg'),
    bio: '<p>Øistein Magnar Andresen is a Non-Executive (Nominee) Director of our Company. He obtained a master’s degree in science (Electrical Engineering) from University of Trondheim, Norwegian Institute of Technology in the year 1984 and a diploma from the Corps of Engineers’ Officer Training School for Graduate Engineers in the year 1985. Previously, he was associated with Eidsiva Energi AS, Statkraft AS; Statkraft Norfund Power Invest AS (SN Power); Norwegian Ski Federation (NSF), Akershus Nett AS,</p>',
    linkedinUrl: null,
  },
  {
    id: 'bjornar-baugerud',
    name: 'Bjørnar Baugerud',
    designation: 'Nominee Director',
    group: 'leadership',
    photoUrl: portrait('bjornar-baugerud.jpg'),
    bio: '<p>Bjørnar Baugerud is a Non-Executive (Nominee) Director of our Company. He obtained a master’s degree in science ‘candidatus mercatorius’ (graduate programme in economics and business administration) in business economics from Norwegian School of Economics and Business Administration in the year 2004. He was also designated as a chartered financial analyst by CFA Institute in the year 2008. He is currently working as senior vice president – renewable energy / head of climate investment fund with Norfund and has over seventeen years of experience in renewable energy investments and financial advisory.</p>',
    linkedinUrl: null,
  },
  {
    id: 'harbhajan-singh',
    name: 'Harbhajan Singh',
    designation: 'Independent Director',
    group: 'leadership',
    photoUrl: portrait('harbhajan-singh.jpg'),
    bio: '<p>Harbhajan Singh is an Independent Director of our Company. He obtained a bachelor’s degree in arts from Punjabi University, Patiala, Punjab, India in the year 1978 and a master’s degree in arts (history) from Punjabi University, Patiala, Punjab, India in the year 1980. He also has passed the examination for bachelor’s degree of law from Shree Shahu Ji Maharaj University, Kanpur, Uttar Pradesh, India, in the year 1997.He joined the Indian Administrative Service in the year 1983 and has served both in the State of Uttar Pradesh and the Government of India. He served as a District Magistrate in various districts of Uttar Pradesh such as Agra, Basti, Saharanpur and Kanpur Nagar. He was also General Manager of Uttar Pradesh Financial Corporation, Kanpur and Managing Director of UP Small Industries Limited, Kanpur. At the State Government level, he was Special Secretary in Secondary Education Department and Industrial Development Department and Secretary in Industrial Development Department, Uttaranchal Department, Dairy Development Department, Science &amp; Technology Department and Medical Education Department; and Principal Secretary to Medical Education Department and Secretariat Administration Department. He was Vice- Chairman of Lucknow Development Authority, and Food Commissioner, Uttar Pradesh. While on deputation to the Central Government, he was Director in the Ministry of Civil Aviation and Joint Secretary and Financial Adviser in the Ministry of Coal. He was Joint Secretary in the Department of Heavy Industry, under Ministry of Heavy Industries &amp; Public Enterprises. He was Director General of the National Productivity Council under Department of Industrial Policy &amp; Promotion, Ministry of Commerce. He was also on the boards of H.M.T. Limited, H.M.T. Machine Tools Limited, H.M.T. (International) Limited, Heavy Engineering Corporation Private Limited, Hindustan Paper Corporation Limited, Andrew Yule &amp; Co Limited, Engineering Projects (India) Limited, Cement Corporation of India Limited and NTPC-BHEL Power Projects Private Limited. He has over thirty four years of experience in the public service.</p><p>He is also serving as Independent Director in the following material subsidiaries of Sael industries Limited i.e. Sael Solar MHP1 Private Limited, Sunfree Energy Private Limited, Sael Solar Mfg. Private Limited, Sael Limited, Sunfree Energy RJP1 Private Limited, Sael Solar MHP2 Private Limited, Universal Biomass Energy Private Limited, Sael Solar P9 Private Limited and Sael Solar P6 Private Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'ashok-lavasa',
    name: 'Ashok Lavasa',
    designation: 'Independent Director',
    group: 'leadership',
    photoUrl: portrait('ashok-lavasa.jpg'),
    bio: '<p>Ashok Lavasa is an Independent Director of our Company. He obtained a bachelor’s degree in arts (English) from University of Delhi, New Delhi, India in the year 1976, a master’s degree in arts (English) from University of Delhi, New Delhi, India in the year 1978, a master’s degree in business administration from Southern Cross University, Australia in the year 1997 and a master’s degree in philosophy (Defence and Strategic Studies) from University of Madras, Chennai, India in the year 2012. He was a part of the Indian Administrative Services and has served in key positions as - Election Commissioner of India, Union Finance Secretary; Secretary, Ministry of Environment, Forest and Climate Change, Government of India; Secretary in Union Civil Aviation, Government of India; Special Secretary, Ministry of Power, Government of India; Joint Secretary, Ministry of Power, Government of India; Joint Secretary, Ministry of Home Affairs, Government of India; Joint Secretary, Department of Economic Affairs (Ministry of Finance), Government of India; Principal Secretary and Financial Commissioner, Renewable Energy Sources, Power, Government of Haryana; Managing Director, Haryana State Industrial &amp; Infrastructure Development Corporation and Haryana Tourism Corporation and Vice-President (Market Solutions) at Asian Development Bank, Manila, Philippines. He has over forty years of experience including in public service.</p><p>He is also serving as Independent Director in the following companies i.e. Subros Limited and Entrada India Advisors Private Limited</p>',
    linkedinUrl: null,
  },
  {
    id: 'hemant-sahai',
    name: 'Hemant Sahai',
    designation: 'Independent Director',
    group: 'leadership',
    photoUrl: portrait('hemant-sahai.jpg'),
    bio: '<p>Hemant Sahai is an Independent Director of our Company. He obtained a bachelor’s degree in commerce (honours) from University of Delhi, New Delhi, India in the year 1985, and a bachelor’s degree in law from University of Delhi, New Delhi, India in the year 1988. He has experience in advising clients in sectors such as infrastructure, energy, renewable energy, military and defence. He is currently a founding partner at Hemant Sahai Associates (HSA Advocates) and serves as a director in other entities such as- Acme Solar Holdings Limited; Simon India Limited; Polyplex Corporation Limited; Longshorex Impex Private Limited; MB Power (Madhya Pradesh) Limited; Akzo Nobel India Limited; and Elements Infra Consulting Private Limited. He through HSA Advocates has also advised governments and policy organizations, including the World Bank Group, IFC, Asian Development Bank, National Investment and Infrastructure Fund Limited, Athaang Infrastructure Private Limited, JFD Global and the Planning Commission of India (now NITI Aayog). He was recently engaged by Chemonics International INC in relation to the Sri Lankan Government Energy Program. He has over thirty years of experience in the legal services industry.</p><p>He is also serving as Director in the following companies i.e. Akzo Nobel India Limited, MB Power (Madhya Pradesh) Limited, Elements Infra Consulting Private Limited, Polyplex Corporation Limited, Sael Solar P5 Private Limited, Sael Solar P4 Private Limited, Acme Solar Holdings Limited, Hindustan Thermal projects Limited, Sael Industries Limited and Simon India Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'archana-capoor',
    name: 'Archana Capoor',
    designation: 'Independent Director',
    group: 'leadership',
    photoUrl: portrait('archana-capoor.jpg'),
    bio: '<p>Archana Capoor is an Independent Director of our Company. She obtained a master’s degree in business administration from University of Allahabad, Allahabad, Uttar Pradesh India in the year 1980.Previously, she was associated with Jet Airways, HUDCO, Indian Trust for Rural Heritage and Development, Uttar Pradesh Financial Corporation, ABN AMRO Bank N.V. and Bahrain Stock Exchange. She has over twenty-four years of experience in the finance sector.</p><p>She is also serving as an independent director in the following companies i.e. RSWM Limited, S Chand and Company Limited, Sandhar Technologies Limited, Uniproducts (India) Limited, Vikas Publishing House Private Limited, Samhi Hotels Limited and Bhilwara Technical Textiles Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'kewal-handa',
    name: 'Kewal Handa',
    designation: 'Independent Director',
    group: 'leadership',
    photoUrl: portrait('kewal-handa.jpg'),
    bio: '<p>Kewal Handa is an Independent Director of our Company. He has passed the examination for master’s degree in commerce from University of Bombay, Mumbai, Maharashtra, India in the year 1976. He has been a member of the Institute of Company Secretaries of India and Institute of Cost and Works Accountants of India since 1985 and 1980, respectively. Previously, he was associated with Pfizer Wordwide Biopharmaceutical Business; Union Bank and Poonawalla Fincorp. He has over twenty-eight years of experience in the finance sector.</p><p>He is also a director in the following companies i.e. ING Vysya Bank Limited, Infiiloom India Private Limited, Omsav Pharma Research Private Limited, Akums Drugs and Pharmaceuticals Limited, Wellness Forever Medicare Limited, Salus Lifecare Private Limited, Ganga Care Hospital Limited, Conexus Social Responsibility Services Private Limited, Sael Solar P10 Private Limited, Sael Industries Limited, Borosil Limited, Poonawalla Fincorp Limited, Borosil Scientific Limited, Quality Care India Limited and United Ciigma Institute Of Medical Sciences Private Limited.</p>',
    linkedinUrl: null,
  },
  {
    id: 'khalid-nadeem',
    name: 'Khalid Nadeem',
    designation: 'COO, Solar Business',
    group: 'management',
    photoUrl: portrait('khalid-nadeem.jpg'),
    bio: '<p>With over 27 years of experience including in the renewable energy segment. Previously, he was associated with Samtel India Limited, Central Electronics Limited, Tata BP Solar India Limited, Sharp Business Systems (India) Limited, Schueco International KG, Schueco India Solar &amp; Windows Private Limited, Jakson Engineers Limited, Fedders Lloyd Corporation Limited and SAEL Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/khalid-nadeem-020b83124/',
  },
  {
    id: 'dushyant-kumar',
    name: 'Dushyant Kumar',
    designation: 'CFO',
    group: 'management',
    photoUrl: portrait('dushyant-kumar.jpg'),
    bio: '<p>He is a Chartered Accountant and secured All India 25th rank in the final CA examination in June 2009. He has over 16 years of experience in the finance sector. Previously, he was associated with Adani Airport Holdings Limited, Cine Polis India Private Limited, Personiv Contact Centers India Private Limited, Tupperware India, KPMG and SAEL Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/dushyant-chachra-08778143/',
  },
  {
    id: 'supreet-azad-gupta',
    name: 'Supreet Azad Gupta',
    designation: 'CHRO',
    group: 'management',
    photoUrl: portrait('supreet-azad-gupta.jpg'),
    bio: '<p>Supreet, an engineer from DCE and an MBA from IIMK, has more than 20 years of experience in implementing HR strategies that drive organisational success. She was also associated with Tata Infotech Limited, I-flex Solutions Limited, Intrasphere Information Technologies Private Limited, Genzyme India Private Limited, Cisco Systems (India) Private Limited, Cosmic InfoTech Solutions (CITeS) and AES India Private Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/supreet-gupta-2455044/',
  },
  {
    id: 'sylvia-seth',
    name: 'Sylvia Seth',
    designation: 'VP, Finance & Strategy',
    group: 'management',
    photoUrl: portrait('sylvia-seth.jpg'),
    bio: '<p>She has 12 years of experience, Sylvia looks after fundraising, including private equity transactions, domestic and international debt raising, strategic planning, and M&amp;A. She was last associated with Azure Power, PwC, &amp; private equity firms like Actis. She was also previously associated with Clime Finance Private Limited and MB Power (Madhya Pradesh) Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/sylviamediratta/',
  },
  {
    id: 'yogesh-mahajan',
    name: 'Yogesh Mahajan',
    designation: 'Vice President - Procurement',
    group: 'management',
    photoUrl: portrait('yogesh-mahajan.jpg'),
    bio: '<p>He has over 29 years of experience including in the power sector. Previously, he was associated with Kay International Limited, Triveni Engineering &amp; Industries Limited, Jaiprakash Associates Limited, Skoda Power Private Limited, Alston Bharat Forge Power Limited and ISGEC Heavy Engineering Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/yogesh-mahajan-a5a67329/',
  },
  {
    id: 'puneet-upneja',
    name: 'Puneet Upneja',
    designation: 'General Counsel - Legal',
    group: 'management',
    photoUrl: portrait('puneet-upneja.jpg'),
    bio: '<p>He obtained a bachelor’s degree in law, with honours from National Law University, Jodhpur, Rajasthan, India in the year 2009. He has over 15 years of experience in the legal services industry. Previously, he was associated with Singhania &amp; Partners LLP, SRGR Law Offices, Amarchand Mangaldas, Phoenix Legal, Alpha Partners, Seth Dua &amp; Associates, Hindustan Power, Kautilya Finance Investment Advisors LLP, Tata Capital Limited and Varun Beverages Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/puneet-upneja-64a93417/',
  },
  {
    id: 'vishal-garg',
    name: 'Vishal Garg',
    designation: 'Company Secretary',
    group: 'management',
    photoUrl: portrait('vishal-garg.jpg'),
    bio: '<p>He has bachelor’s degrees in science and in law. He is a fellow member of the Institute of Company Secretaries of India and has over 22 years of experience in company secretarial and compliance roles. Previously, he was associated with Nirvan Clothing Company Limited, Chadha Papers Limited, and A B Grain Spirits Private Limited.</p>',
    linkedinUrl: 'https://www.linkedin.com/in/vishal-garg-84120a46/',
  },
];
