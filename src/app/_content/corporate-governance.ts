import type { DataTableColumn } from '@/components/ui/data-table';
import { TODO_CONTENT } from '@/lib/config/site';
import { investorPage, type InvestorPage, type PageMeta } from './investors';

/**
 * The Corporate Governance area's static content: its index, the two pages
 * that are not tiles, and the frames of their tables.
 *
 * **Transcribed from the legacy https://www.sael.co/investors/corporate-governance/
 * and its sub-pages**, read from their raw HTML on 2026-09-30 with only the
 * source's whitespace collapsed. /CLAUDE.md §2 rule 3.
 *
 * The area's six document pages are tiles and come from the backend
 * (`documents-live?section=CORPORATE_GOVERNANCE`) — their names, order,
 * headings and documents. Board of Directors and Board Committees are not
 * tiles in the backend (its descope note S1), so they stay here, first in the
 * index and the side list as on the legacy page.
 *
 * **So does their content: the board and its committees are static, not
 * repository content.** SAEL descoped both endpoints on 20 Sep 2026 (backend
 * row 5.24, `docs/api-contracts.md` §9). A change to the board is a release
 * by us, not an edit in SAEL's panel — and board composition is a continuing
 * disclosure under SEBI LODR Reg. 46, so that release has to follow the
 * company's resolution within days. SAEL's sign-off list for this content is
 * the backend's `docs/client/static-content-sign-off.md`.
 */

export const GOVERNANCE_PATH = '/investors/corporate-governance/';

export const governanceIndex: { meta: PageMeta; title: string } = {
  meta: { title: 'Corporate Governance - SAEL', description: TODO_CONTENT },
  title: 'Corporate Governance',
};

/** The two pages that are not tiles, keyed for the pages that import them. */
export const governancePages = {
  boardOfDirectors: investorPage(
    GOVERNANCE_PATH,
    'board-of-directors',
    'Board of Directors',
    'Board of Directors - SAEL',
  ),
  boardCommittees: investorPage(
    GOVERNANCE_PATH,
    'board-committees',
    'Board Committees',
    'Board Committees - SAEL',
  ),
} as const satisfies Record<string, InvestorPage>;

/**
 * The pages that are not tiles, in the legacy order. They lead the index and
 * the side list, ahead of the tiles, as they lead the legacy page.
 */
export const governanceStaticPages: readonly InvestorPage[] = [
  governancePages.boardOfDirectors,
  governancePages.boardCommittees,
];

/**
 * The Board of Directors table's frame: its heading (the legacy `<h3>`,
 * which repeats the page title and is kept, as on Offer Documents) and its
 * headers. "About" heads the column of toggles, each opening a director's
 * biography in a full-width row — the legacy "+" arrangement.
 */
export const boardTable: {
  heading: string;
  columns: readonly DataTableColumn[];
  detailColumn: string;
} = {
  heading: 'Board of Directors',
  columns: [{ label: 'Name' }, { label: 'Designation' }],
  detailColumn: 'About',
};

/** Every committee table's headers, verbatim — the same on all six. */
export const committeeColumns: readonly DataTableColumn[] = [
  { label: 'Name of the Member(s)' },
  { label: 'Category' },
  { label: 'Designation' },
];

/**
 * A director, as the Board of Directors page lists them.
 *
 * **Not a `TeamMember`**, though every one of them is on /our-team/ too. This
 * is the governance record — a regulated disclosure of the board. On
 * 2026-10-02 the two pages carry the same names, designations and biography
 * text (this one bolds the name); they are kept apart so that a change to one
 * page cannot silently rewrite the other.
 */
export interface BoardMember {
  id: string;
  /** Verbatim, diacritics included — "Øistein Magnar Andresen". */
  name: string;
  /** "Managing Director and Chairperson". Plain text. */
  designation: string;
  /**
   * The "About" text: HTML, `p` and `strong` in practice, sanitised before
   * it renders. `null` when none.
   */
  bio: string | null;
}

/** One row of a committee's table. Every field verbatim. */
export interface CommitteeMember {
  /** "Mr. Harbhajan Singh" — as the committee page writes it. */
  name: string;
  /** "Non-Executive Independent Director". */
  category: string;
  /** The member's role on the committee — "Chairman", "Member", "Invitee". */
  position: string;
}

/** A board committee and its members, in the order the company lists them. */
export interface BoardCommittee {
  /** The table's anchor, for the page's jump links. */
  id: string;
  /** "Audit Committee". */
  name: string;
  members: readonly CommitteeMember[];
}

/**
 * The board — the ten directors on the live
 * https://www.sael.co/investors/corporate-governance/board-of-directors/,
 * **in its order**, which is the company's and is not re-sorted anywhere.
 *
 * Name, designation and "About" text exactly as that page has them, bios as
 * its own `<p>` and `<strong>` markup with the source whitespace collapsed.
 * Transcribed from its HTML on 2026-09-30 and checked against it again on
 * 2026-10-02: every field identical. The page shows no photograph and no DIN,
 * so neither is here.
 */
export const boardMembers: readonly BoardMember[] = [
  {
    id: 'jasbir-singh',
    name: 'Jasbir Singh',
    designation: 'Managing Director and Chairperson',
    bio: '<p><strong>Jasbir Singh</strong> is the Managing Director and Chairperson of our Company. He has over twenty-Six years of experience in the agri- commodity and power sector. He also serves as a director in entities such as SAEL Solar P15 Private Limited, SAEL Limited, SAEL Solar MFG. Private Limited, SAEL Agri Commodities Limited, AWLA Energy P Twenty Four Private Limited and AWLA Energy P Twenty Five Private Limited.</p>',
  },
  {
    id: 'sukhbir-singh',
    name: 'Sukhbir Singh',
    designation: 'Non-Executive Director',
    bio: '<p><strong>Sukhbir Singh</strong> is a Non- Executive Director of our Company. He has over twenty-Six years of experience in the agri- commodity and power sector. He also serves as a director in other entities such as SAEL Solar P9 Private Limited, SAEL Solar P10 Private Limited, SAEL Agri Commodities Limited, SAEL Solar MHP2 Private Limited, SAEL Solar MHP1 Private Limited, AWLA Energy P Twenty Six Private Limited and AWLA Energy P Twenty Seven Private Limited.</p>',
  },
  {
    id: 'laxit-awla',
    name: 'Laxit Awla',
    designation: 'Executive Director and Chief Executive Officer',
    bio: '<p><strong>Laxit Awla</strong> is an Executive Director and Chief Executive Officer of our Company. He has over nine years of experience in the power sector. He also serves as a director in other entities such as SAEL Solar MHP2 Private Limited, SAEL Solar P7 Private Limited, SAEL Solar P6 Private Limited, Hyper Reality Studio Private Limited, AWLA Energy P Twenty Four Private Limited, AWLA Energy P Twenty Five Private Limited, AWLA Energy P Twenty Six Private Limited and AWLA Energy P Twenty Seven Private Limited.</p>',
  },
  {
    id: 'oistein-magnar-andresen',
    name: 'Øistein Magnar Andresen',
    designation: 'Nominee Director',
    bio: '<p><strong>Øistein Magnar Andresen</strong> is a Non-Executive (Nominee) Director of our Company. He obtained a master’s degree in science (Electrical Engineering) from University of Trondheim, Norwegian Institute of Technology in the year 1984 and a diploma from the Corps of Engineers’ Officer Training School for Graduate Engineers in the year 1985. Previously, he was associated with Eidsiva Energi AS, Statkraft AS; Statkraft Norfund Power Invest AS (SN Power); Norwegian Ski Federation (NSF), Akershus Nett AS,</p>',
  },
  {
    id: 'bjornar-baugerud',
    name: 'Bjørnar Baugerud',
    designation: 'Nominee Director',
    bio: '<p><strong>Bjørnar Baugerud</strong> is a Non-Executive (Nominee) Director of our Company. He obtained a master’s degree in science ‘candidatus mercatorius’ (graduate programme in economics and business administration) in business economics from Norwegian School of Economics and Business Administration in the year 2004. He was also designated as a chartered financial analyst by CFA Institute in the year 2008. He is currently working as senior vice president – renewable energy / head of climate investment fund with Norfund and has over seventeen years of experience in renewable energy investments and financial advisory.</p>',
  },
  {
    id: 'harbhajan-singh',
    name: 'Harbhajan Singh',
    designation: 'Independent Director',
    bio: '<p><strong>Harbhajan Singh</strong> is an Independent Director of our Company. He obtained a bachelor’s degree in arts from Punjabi University, Patiala, Punjab, India in the year 1978 and a master’s degree in arts (history) from Punjabi University, Patiala, Punjab, India in the year 1980. He also has passed the examination for bachelor’s degree of law from Shree Shahu Ji Maharaj University, Kanpur, Uttar Pradesh, India, in the year 1997.He joined the Indian Administrative Service in the year 1983 and has served both in the State of Uttar Pradesh and the Government of India. He served as a District Magistrate in various districts of Uttar Pradesh such as Agra, Basti, Saharanpur and Kanpur Nagar. He was also General Manager of Uttar Pradesh Financial Corporation, Kanpur and Managing Director of UP Small Industries Limited, Kanpur. At the State Government level, he was Special Secretary in Secondary Education Department and Industrial Development Department and Secretary in Industrial Development Department, Uttaranchal Department, Dairy Development Department, Science &amp; Technology Department and Medical Education Department; and Principal Secretary to Medical Education Department and Secretariat Administration Department. He was Vice- Chairman of Lucknow Development Authority, and Food Commissioner, Uttar Pradesh. While on deputation to the Central Government, he was Director in the Ministry of Civil Aviation and Joint Secretary and Financial Adviser in the Ministry of Coal. He was Joint Secretary in the Department of Heavy Industry, under Ministry of Heavy Industries &amp; Public Enterprises. He was Director General of the National Productivity Council under Department of Industrial Policy &amp; Promotion, Ministry of Commerce. He was also on the boards of H.M.T. Limited, H.M.T. Machine Tools Limited, H.M.T. (International) Limited, Heavy Engineering Corporation Private Limited, Hindustan Paper Corporation Limited, Andrew Yule &amp; Co Limited, Engineering Projects (India) Limited, Cement Corporation of India Limited and NTPC-BHEL Power Projects Private Limited. He has over thirty four years of experience in the public service.</p> <p>He is also serving as Independent Director in the following material subsidiaries of Sael industries Limited i.e. Sael Solar MHP1 Private Limited, Sunfree Energy Private Limited, Sael Solar Mfg. Private Limited, Sael Limited, Sunfree Energy RJP1 Private Limited, Sael Solar MHP2 Private Limited, Universal Biomass Energy Private Limited, Sael Solar P9 Private Limited and Sael Solar P6 Private Limited.</p>',
  },
  {
    id: 'ashok-lavasa',
    name: 'Ashok Lavasa',
    designation: 'Independent Director',
    bio: '<p><strong>Ashok Lavasa</strong> is an Independent Director of our Company. He obtained a bachelor’s degree in arts (English) from University of Delhi, New Delhi, India in the year 1976, a master’s degree in arts (English) from University of Delhi, New Delhi, India in the year 1978, a master’s degree in business administration from Southern Cross University, Australia in the year 1997 and a master’s degree in philosophy (Defence and Strategic Studies) from University of Madras, Chennai, India in the year 2012. He was a part of the Indian Administrative Services and has served in key positions as - Election Commissioner of India, Union Finance Secretary; Secretary, Ministry of Environment, Forest and Climate Change, Government of India; Secretary in Union Civil Aviation, Government of India; Special Secretary, Ministry of Power, Government of India; Joint Secretary, Ministry of Power, Government of India; Joint Secretary, Ministry of Home Affairs, Government of India; Joint Secretary, Department of Economic Affairs (Ministry of Finance), Government of India; Principal Secretary and Financial Commissioner, Renewable Energy Sources, Power, Government of Haryana; Managing Director, Haryana State Industrial &amp; Infrastructure Development Corporation and Haryana Tourism Corporation and Vice-President (Market Solutions) at Asian Development Bank, Manila, Philippines. He has over forty years of experience including in public service.</p> <p>He is also serving as Independent Director in the following companies i.e. Subros Limited and Entrada India Advisors Private Limited</p>',
  },
  {
    id: 'hemant-sahai',
    name: 'Hemant Sahai',
    designation: 'Independent Director',
    bio: '<p><strong>Hemant Sahai</strong> is an Independent Director of our Company. He obtained a bachelor’s degree in commerce (honours) from University of Delhi, New Delhi, India in the year 1985, and a bachelor’s degree in law from University of Delhi, New Delhi, India in the year 1988. He has experience in advising clients in sectors such as infrastructure, energy, renewable energy, military and defence. He is currently a founding partner at Hemant Sahai Associates (HSA Advocates) and serves as a director in other entities such as- Acme Solar Holdings Limited; Simon India Limited; Polyplex Corporation Limited; Longshorex Impex Private Limited; MB Power (Madhya Pradesh) Limited; Akzo Nobel India Limited; and Elements Infra Consulting Private Limited. He through HSA Advocates has also advised governments and policy organizations, including the World Bank Group, IFC, Asian Development Bank, National Investment and Infrastructure Fund Limited, Athaang Infrastructure Private Limited, JFD Global and the Planning Commission of India (now NITI Aayog). He was recently engaged by Chemonics International INC in relation to the Sri Lankan Government Energy Program. He has over thirty years of experience in the legal services industry.</p> <p>He is also serving as Director in the following companies i.e. Akzo Nobel India Limited, MB Power (Madhya Pradesh) Limited, Elements Infra Consulting Private Limited, Polyplex Corporation Limited, Sael Solar P5 Private Limited, Sael Solar P4 Private Limited, Acme Solar Holdings Limited, Hindustan Thermal projects Limited, Sael Industries Limited and Simon India Limited.</p>',
  },
  {
    id: 'archana-capoor',
    name: 'Archana Capoor',
    designation: 'Independent Director',
    bio: '<p><strong>Archana Capoor</strong> is an Independent Director of our Company. She obtained a master’s degree in business administration from University of Allahabad, Allahabad, Uttar Pradesh India in the year 1980.Previously, she was associated with Jet Airways, HUDCO, Indian Trust for Rural Heritage and Development, Uttar Pradesh Financial Corporation, ABN AMRO Bank N.V. and Bahrain Stock Exchange. She has over twenty-four years of experience in the finance sector.</p> <p>She is also serving as an independent director in the following companies i.e. RSWM Limited, S Chand and Company Limited, Sandhar Technologies Limited, Uniproducts (India) Limited, Vikas Publishing House Private Limited, Samhi Hotels Limited and Bhilwara Technical Textiles Limited.</p>',
  },
  {
    id: 'kewal-handa',
    name: 'Kewal Handa',
    designation: 'Independent Director',
    bio: '<p><strong>Kewal Handa</strong> is an Independent Director of our Company. He has passed the examination for master’s degree in commerce from University of Bombay, Mumbai, Maharashtra, India in the year 1976. He has been a member of the Institute of Company Secretaries of India and Institute of Cost and Works Accountants of India since 1985 and 1980, respectively. Previously, he was associated with Pfizer Wordwide Biopharmaceutical Business; Union Bank and Poonawalla Fincorp. He has over twenty-eight years of experience in the finance sector.</p> <p>He is also a director in the following companies i.e. ING Vysya Bank Limited, Infiiloom India Private Limited, Omsav Pharma Research Private Limited, Akums Drugs and Pharmaceuticals Limited, Wellness Forever Medicare Limited, Salus Lifecare Private Limited, Ganga Care Hospital Limited, Conexus Social Responsibility Services Private Limited, Sael Solar P10 Private Limited, Sael Industries Limited, Borosil Limited, Poonawalla Fincorp Limited, Borosil Scientific Limited, Quality Care India Limited and United Ciigma Institute Of Medical Sciences Private Limited.</p>',
  },
];

/**
 * The six committees on the live
 * https://www.sael.co/investors/corporate-governance/board-committees/, each
 * with its members, **both in that page's order**. Same reads, same rules:
 * every name, category and role verbatim — including where this page spells
 * a director differently from the board page ("Bjornar", "Oistein", "Kewal
 * Kundanlal Handa") and lists members who are not directors (the CFO, the
 * General Counsel, the ESG Head, the CHRO). Neither page corrects the other.
 */
export const boardCommittees: readonly BoardCommittee[] = [
  {
    id: 'audit-committee',
    name: 'Audit Committee',
    members: [
      {
        name: 'Mr. Harbhajan Singh',
        category: 'Non-Executive Independent Director',
        position: 'Chairman',
      },
      {
        name: 'Mr. Hemant Sahai',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Mr. Ashok Lavasa',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      { name: 'Mr. Bjornar Baugerud', category: 'Non-Executive Director', position: 'Member' },
      { name: 'Mr. Laxit Awla', category: 'Executive Director & CEO', position: 'Invitee' },
    ],
  },
  {
    id: 'nomination-and-remuneration-committee',
    name: 'Nomination and Remuneration Committee',
    members: [
      {
        name: 'Mr. Harbhajan Singh',
        category: 'Non-Executive Independent Director',
        position: 'Chairman',
      },
      {
        name: 'Mr. Hemant Sahai',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Ms. Archana Capoor',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      { name: 'Mr. Sukhbir Singh', category: 'Non-Executive Director', position: 'Member' },
      { name: 'Mr. Bjornar Baugerud', category: 'Non-Executive Director', position: 'Invitee' },
    ],
  },
  {
    id: 'stakeholders-relationship-committee',
    name: 'Stakeholders Relationship Committee',
    members: [
      { name: 'Mr. Sukhbir Singh', category: 'Non-Executive Director', position: 'Chairman' },
      {
        name: 'Mr. Harbhajan Singh',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Mr. Ashok Lavasa',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      { name: 'Mr. Laxit Awla', category: 'Executive Director & CEO', position: 'Member' },
    ],
  },
  {
    id: 'risk-management-committee',
    name: 'Risk Management Committee',
    members: [
      { name: 'Mr. Laxit Awla', category: 'Executive Director & CEO', position: 'Chairman' },
      {
        name: 'Mr. Hemant Sahai',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Mr. Kewal Kundanlal Handa',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      { name: 'Mr. Oistein Magnar Andresen', category: 'Nominee Director', position: 'Member' },
      { name: 'Mr. Dushyant Kumar', category: 'CFO', position: 'Invitee' },
      { name: 'Mr. Puneet Upneja', category: 'General Counsel', position: 'Invitee' },
    ],
  },
  {
    id: 'corporate-social-responsibility-committee',
    name: 'Corporate Social Responsibility Committee',
    members: [
      { name: 'Mr. Jasbir Singh', category: 'Managing Director', position: 'Chairman' },
      {
        name: 'Mr. Harbhajan Singh',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Ms. Archana Capoor',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
      {
        name: 'Mr. Kewal Kundanlal Handa',
        category: 'Non-Executive Independent Director',
        position: 'Member',
      },
    ],
  },
  {
    id: 'environmental-safety-social-and-governance-committee',
    name: 'Environmental, Safety, Social and Governance Committee',
    members: [
      { name: 'Mr. Laxit Awla', category: 'Executive Director & CEO', position: 'Chairman' },
      { name: 'Mr. Bjornar Baugerud', category: 'Nominee Director', position: 'Member' },
      { name: 'Mr. Dushyant Kumar', category: 'Chief Financial Officer', position: 'Member' },
      { name: 'Mr. Mukesh Arora', category: 'ESG Head', position: 'Member' },
      { name: 'Ms. Supreet Gupta', category: 'Chief Human Resource Officer', position: 'Member' },
      { name: 'Mr. Puneet Upneja', category: 'Head of Legal', position: 'Member' },
    ],
  },
];
