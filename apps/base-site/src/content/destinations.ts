import type { ImageSlot } from './home';
import type { CountrySlug } from './routes';
import { ROUTES, SIGN_UP, countryRoute } from './routes';

/**
 * /destinations and /destinations/[country] — docs/04b § 8.
 *
 * The six §3.6 photographs are the canonical destination entries and are
 * reused here deliberately: same country, same meaning (04b § 12).
 *
 * Cost and intake figures are indicative public ranges for orientation, not
 * quotes — every FactGrid on these pages is rendered with `sample`.
 *
 * Alt text describes what each photograph actually shows, which is not always
 * what 04b § 3.6 called it: the UK photo has Tower Bridge and no Big Ben, the
 * US photo is an aerial skyline rather than a street, and the Germany photo is
 * a half-timbered town, not Berlin. Every image here was viewed before its alt
 * was written.
 */

export interface CountryContent {
  slug: CountrySlug;
  name: string;
  /** Short label for cards and breadcrumbs. */
  shortName: string;
  cardImage: ImageSlot;
  heroImage: ImageSlot;
  tagline: string;
  intro: string;
  whyHeading: string;
  why: string;
  whyPoints: readonly string[];
  facts: readonly { label: string; value: string; hint?: string }[];
  universities: readonly string[];
  helpPoints: readonly string[];
}

const image = (id: string, w: number, alt: string, searchTerm: string): ImageSlot => ({
  src: `https://images.unsplash.com/${id}?w=${w}&q=80`,
  alt,
  searchTerm,
});

export const COUNTRIES: readonly CountryContent[] = [
  {
    slug: 'uk',
    name: 'the United Kingdom',
    shortName: 'United Kingdom',
    cardImage: image(
      'photo-1513635269975-59663e0ac1ad',
      800,
      'Aerial view of London with Tower Bridge and the River Thames',
      'london uk',
    ),
    heroImage: image(
      'photo-1513635269975-59663e0ac1ad',
      1400,
      'Aerial view of London with Tower Bridge and the River Thames',
      'london uk',
    ),
    tagline: 'One-year masters, and a graduate route that buys you time.',
    intro:
      'The UK packs a masters into twelve months, which means one year of tuition and living costs rather than two. That single fact changes the arithmetic for a lot of students.',
    whyHeading: 'Why students choose the UK',
    why: 'Degrees are short, widely recognised, and taught in English throughout. The Graduate Route lets most masters graduates stay and work for two years after finishing, so the course is not the end of the plan.',
    whyPoints: [
      'Taught masters usually complete in twelve months',
      'Graduate Route: two years of post-study work for most masters graduates',
      'No language barrier outside the classroom either',
      'Dense university network, so you are rarely far from another campus',
    ],
    facts: [
      {
        label: 'Main intake',
        value: 'September',
        hint: 'A smaller January intake exists at many universities.',
      },
      {
        label: 'Typical tuition',
        value: '£14,000 – £30,000',
        hint: 'Per year, international postgraduate. Medicine and MBA run higher.',
      },
      {
        label: 'Living costs',
        value: '£1,000 – £1,500 / month',
        hint: 'London sits at the top of that range; the north sits well below it.',
      },
      {
        label: 'Post-study work',
        value: '2 years',
        hint: 'Graduate Route, for eligible masters graduates.',
      },
      {
        label: 'Apply by',
        value: 'Jan – Jun',
        hint: 'For a September start. Earlier is materially better for competitive courses.',
      },
      {
        label: 'Language proof',
        value: 'IELTS / equivalent',
        hint: 'Some universities waive it if you were taught in English.',
      },
    ],
    universities: ['Northfield University', 'Kingsbridge University', 'Ardenmoor College'],
    helpPoints: [
      'Check your transcripts against UK entry requirements before you apply',
      'Flag the CAS and financial-evidence documents early, because they hold visas up',
      'Track every application against the real UCAS and university deadlines',
    ],
  },
  {
    slug: 'canada',
    name: 'Canada',
    shortName: 'Canada',
    cardImage: image(
      'photo-1517935706615-2717063c2225',
      800,
      'Toronto city skyline',
      'toronto canada',
    ),
    heroImage: image(
      'photo-1517935706615-2717063c2225',
      1400,
      'Toronto city skyline',
      'toronto canada',
    ),
    tagline: 'A study permit that leads somewhere, if you plan it properly.',
    intro:
      'Canada is chosen less for the degree itself than for what follows it. The post-graduation work permit and the residency pathways behind it are the actual draw, and they depend on choices you make before you apply.',
    whyHeading: 'Why students choose Canada',
    why: 'Tuition sits below comparable US institutions, the post-graduation work permit can run up to three years, and there is a well-trodden route from work experience to permanent residency. The catch is that not every programme and not every institution qualifies.',
    whyPoints: [
      'Post-graduation work permit of up to three years',
      'Recognised pathways from work experience toward residency',
      'Lower tuition than comparable institutions in the United States',
      'Designated Learning Institution status matters: check it before you commit',
    ],
    facts: [
      {
        label: 'Main intakes',
        value: 'September, January',
        hint: 'A smaller May intake is common at colleges.',
      },
      {
        label: 'Typical tuition',
        value: 'CAD 20,000 – 40,000',
        hint: 'Per year, international. Colleges sit below universities.',
      },
      {
        label: 'Living costs',
        value: 'CAD 1,200 – 2,000 / month',
        hint: 'Toronto and Vancouver are the expensive end.',
      },
      {
        label: 'Post-study work',
        value: 'Up to 3 years',
        hint: 'PGWP length tracks programme length.',
      },
      {
        label: 'Proof of funds',
        value: 'Required',
        hint: 'Held for the study permit application, separate from tuition.',
      },
      {
        label: 'Apply by',
        value: 'Dec – Mar',
        hint: 'For a September start, allowing time for the permit.',
      },
    ],
    universities: ['Westbrook College', 'Lakeside Institute', 'Fairhaven University'],
    helpPoints: [
      'Confirm the programme carries Designated Learning Institution status',
      'Get proof-of-funds documentation right first time: it is the most common permit delay',
      'Line applications up across both the September and January intakes',
    ],
  },
  {
    slug: 'usa',
    name: 'the United States',
    shortName: 'United States',
    cardImage: image(
      'photo-1485871981521-5b1fd3805eee',
      800,
      'New York City skyline at sunset',
      'new york city',
    ),
    heroImage: image(
      'photo-1485871981521-5b1fd3805eee',
      1400,
      'New York City skyline at sunset',
      'new york city',
    ),
    tagline: 'The widest choice, and the longest lead time.',
    intro:
      'No country offers more variety, in institution, funding model, or location. It also asks the most of you up front: standardised tests, essays, recommendations, and a visa interview.',
    whyHeading: 'Why students choose the United States',
    why: 'Scale. There are thousands of accredited institutions, from community colleges to research universities, and funding for international students genuinely exists at many of them. Optional Practical Training extends significantly for STEM graduates.',
    whyPoints: [
      'The broadest range of institutions and programmes anywhere',
      'Real scholarship and assistantship funding at many universities',
      'OPT gives twelve months of work, extended to three years for STEM',
      'Campus-based study with strong research funding',
    ],
    facts: [
      {
        label: 'Main intake',
        value: 'Fall (August)',
        hint: 'Spring intake exists but has less funding attached.',
      },
      {
        label: 'Typical tuition',
        value: 'USD 25,000 – 60,000',
        hint: 'Public in-state is far lower; private research universities sit at the top.',
      },
      {
        label: 'Living costs',
        value: 'USD 1,200 – 2,500 / month',
        hint: 'Coastal cities are the expensive end.',
      },
      { label: 'Post-study work', value: '1 – 3 years', hint: 'OPT, with a STEM extension.' },
      {
        label: 'Tests',
        value: 'TOEFL / IELTS, sometimes GRE',
        hint: 'Requirements vary widely by programme.',
      },
      {
        label: 'Apply by',
        value: 'Oct – Jan',
        hint: 'For a Fall start. Funding deadlines fall earlier than admission deadlines.',
      },
    ],
    universities: ['Northfield University', 'Fairhaven University', 'Lakeside Institute'],
    helpPoints: [
      'Separate the admission deadline from the funding deadline: they are rarely the same',
      'Keep test scores, recommendations and transcripts in one place across many applications',
      'Prepare the I-20 and financial documentation before the visa interview',
    ],
  },
  {
    slug: 'ireland',
    name: 'Ireland',
    shortName: 'Ireland',
    cardImage: image(
      'photo-1549918864-48ac978761a4',
      800,
      'Dublin street and architecture',
      'dublin ireland',
    ),
    heroImage: image(
      'photo-1549918864-48ac978761a4',
      1400,
      'Dublin street and architecture',
      'dublin ireland',
    ),
    tagline: 'English-speaking, inside the EU, and small enough to navigate.',
    intro:
      'Ireland is the English-speaking country still inside the European Union, which makes it unusual. For students who want EU access without learning a new language, that combination is hard to replicate.',
    whyHeading: 'Why students choose Ireland',
    why: 'Taught masters run twelve months, the Third Level Graduate Programme allows up to two years of post-study stay, and a genuinely large technology and pharmaceutical sector sits within commuting distance of the main campuses.',
    whyPoints: [
      'English-speaking and inside the EU',
      'One-year taught masters at most universities',
      'Up to two years to stay and work after graduating',
      'Concentrated technology and pharmaceutical employers',
    ],
    facts: [
      { label: 'Main intake', value: 'September', hint: 'January intake is limited.' },
      {
        label: 'Typical tuition',
        value: '€12,000 – €25,000',
        hint: 'Per year, international. Business and computing sit higher.',
      },
      {
        label: 'Living costs',
        value: '€1,000 – €1,600 / month',
        hint: 'Dublin accommodation is the binding constraint, not tuition.',
      },
      { label: 'Post-study work', value: 'Up to 2 years', hint: 'Third Level Graduate Programme.' },
      {
        label: 'Apply by',
        value: 'Jan – Jul',
        hint: 'Housing is scarcer than places, so apply early for both.',
      },
      {
        label: 'Language proof',
        value: 'IELTS / equivalent',
        hint: 'Waivers are common for English-medium prior study.',
      },
    ],
    universities: ['Ardenmoor College', 'Kingsbridge University'],
    helpPoints: [
      'Start the accommodation search at the same time as the application, not after the offer',
      'Check whether your prior degree qualifies for an English-language waiver',
      'Plan the visa financial evidence around Dublin costs, not the national average',
    ],
  },
  {
    slug: 'australia',
    name: 'Australia',
    shortName: 'Australia',
    cardImage: image(
      'photo-1523482580672-f109ba8cb9be',
      800,
      'Sydney Opera House and harbour',
      'sydney australia',
    ),
    heroImage: image(
      'photo-1523482580672-f109ba8cb9be',
      1400,
      'Sydney Opera House and harbour',
      'sydney australia',
    ),
    tagline: 'Work rights during study, not just after it.',
    intro:
      'Australia lets student visa holders work substantial hours during term. For students partly funding themselves, that changes what is affordable in a way post-study rights alone do not.',
    whyHeading: 'Why students choose Australia',
    why: 'Generous work rights while studying, a temporary graduate visa afterwards, and a skilled-occupation system that rewards choosing your field deliberately. Universities are concentrated in a handful of large, liveable cities.',
    whyPoints: [
      'Substantial work rights during term time',
      'Temporary graduate visa of two to four years depending on qualification',
      'Skilled occupation lists reward choosing your field with intent',
      'February and July intakes give you two shots a year',
    ],
    facts: [
      {
        label: 'Main intakes',
        value: 'February, July',
        hint: 'Two full intakes, not one plus a remainder.',
      },
      { label: 'Typical tuition', value: 'AUD 25,000 – 45,000', hint: 'Per year, international.' },
      {
        label: 'Living costs',
        value: 'AUD 1,500 – 2,300 / month',
        hint: 'Sydney and Melbourne sit at the top.',
      },
      {
        label: 'Post-study work',
        value: '2 – 4 years',
        hint: 'Temporary Graduate visa, by qualification level.',
      },
      {
        label: 'Health cover',
        value: 'OSHC required',
        hint: 'Overseas Student Health Cover is a visa condition.',
      },
      { label: 'Apply by', value: 'Sep – Nov', hint: 'For a February start.' },
    ],
    universities: ['Lakeside Institute', 'Westbrook College'],
    helpPoints: [
      'Check your intended occupation against the skilled lists before choosing a course',
      'Budget OSHC into the total cost: it is mandatory, not optional',
      'Use both intakes: a July start is not a fallback, it is a real option',
    ],
  },
  {
    slug: 'germany',
    name: 'Germany',
    shortName: 'Germany',
    cardImage: image(
      'photo-1467269204594-9661b134dd2b',
      800,
      'Half-timbered houses on a street in a historic German town',
      'berlin germany',
    ),
    heroImage: image(
      'photo-1467269204594-9661b134dd2b',
      1400,
      'Half-timbered houses on a street in a historic German town',
      'berlin germany',
    ),
    tagline: 'Public universities with little or no tuition fee.',
    intro:
      'Most public German universities charge no tuition fee, including to international students. You pay a semester contribution instead. The cost of studying in Germany is mostly the cost of living there.',
    whyHeading: 'Why students choose Germany',
    why: 'The economics are unusual: no tuition at most public universities, a blocked-account requirement that is a savings threshold rather than a fee, and eighteen months after graduation to find work. Many masters programmes are taught entirely in English.',
    whyPoints: [
      'No tuition fee at most public universities',
      'Eighteen months post-study to find relevant work',
      'A large number of English-taught masters programmes',
      'Strong engineering and applied-science reputation',
    ],
    facts: [
      {
        label: 'Main intakes',
        value: 'October, April',
        hint: 'Winter semester is the larger of the two.',
      },
      {
        label: 'Typical tuition',
        value: '€0 – €500 / semester',
        hint: 'Semester contribution at public universities. Private institutions charge fees.',
      },
      {
        label: 'Living costs',
        value: '€900 – €1,400 / month',
        hint: 'Munich is the expensive end; smaller cities are notably cheaper.',
      },
      {
        label: 'Blocked account',
        value: '~€11,900',
        hint: 'Held as proof of funds for the visa, drawn down monthly.',
      },
      {
        label: 'Post-study work',
        value: '18 months',
        hint: 'To find employment relevant to your qualification.',
      },
      {
        label: 'Apply by',
        value: 'May – Jul',
        hint: 'For an October start. Uni-assist processing adds weeks.',
      },
    ],
    universities: ['Kingsbridge University', 'Ardenmoor College'],
    helpPoints: [
      'Get certified translations of your transcripts early: uni-assist will require them',
      'Open the blocked account well before the visa appointment',
      'Confirm whether your programme is taught in English or German before applying',
    ],
  },
];

export const COUNTRY_BY_SLUG = new Map(COUNTRIES.map((country) => [country.slug, country]));

export const DESTINATIONS_INDEX = {
  eyebrow: 'Study destinations',
  /* Not "six countries" — the grid is built from the catalogue, so the number
     changes whenever a country is published. Naming it here guarantees the
     heading will eventually contradict the page under it. */
  title: 'Every destination we can get you into.',
  subcopy:
    'Cost, course length, work rights and what happens after you graduate vary more than most rankings suggest. Six have a full written guide; the rest open straight into their universities.',
} as const;

export const DESTINATIONS_CTA = {
  heading: 'Not sure which country fits?',
  subline: 'Tell us your budget, your field and where you want to end up. We will narrow it down.',
  cta: { label: 'Get a shortlist', href: SIGN_UP },
  reassurance: 'Free, and no obligation to apply anywhere.',
} as const;

export const DESTINATION_LINKS = COUNTRIES.map((country) => ({
  label: country.shortName,
  href: countryRoute(country.slug),
}));

export const UNIVERSITIES_ROUTE = ROUTES.universities;

export const DESTINATIONS_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = COUNTRIES.map(
  (country) => ({ slot: `/destinations ${country.shortName}`, ...country.cardImage }),
);

export const COUNTRY_HERO_IMAGE_SLOTS: readonly (ImageSlot & { slot: string })[] = COUNTRIES.map(
  (country) => ({
    slot: `/destinations/${country.slug} hero`,
    ...country.heroImage,
  }),
);

/** Written guides exist for six countries; every other ISO code has none. */
export const GUIDE_BY_CODE: Record<string, CountrySlug> = {
  GB: 'uk',
  CA: 'canada',
  US: 'usa',
  IE: 'ireland',
  AU: 'australia',
  DE: 'germany',
};

export interface DestinationCardContent {
  country: string;
  href: string;
  src?: string;
  alt?: string;
  description: string;
}

/**
 * The card content for one catalogue destination — a written guide's own
 * photo and tagline where one exists, a plain flag-on-a-name card (via
 * `DestinationCard`'s own fallback) with an institution count otherwise.
 *
 * Shared between /destinations and any other surface that teases
 * destinations — the dashboard home page, most notably — so a guide added
 * for one shows up consistently everywhere a country card renders.
 */
export function destinationCardContent(entry: {
  countryCode: string;
  country: string;
  institutions: number;
}): DestinationCardContent {
  const guide = GUIDE_BY_CODE[entry.countryCode];
  const written = guide ? COUNTRY_BY_SLUG.get(guide) : undefined;

  return {
    country: written?.shortName ?? entry.country,
    href: guide ? countryRoute(guide) : `${ROUTES.universities}?country=${entry.countryCode}`,
    src: written?.cardImage.src,
    alt: written?.cardImage.alt,
    description:
      written?.tagline ??
      `${entry.institutions.toLocaleString('en-GB')} universit${
        entry.institutions === 1 ? 'y' : 'ies'
      } in the catalogue.`,
  };
}
