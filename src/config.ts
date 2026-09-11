/**
 * Single source of truth for identity.
 *
 * Visible page text AND the JSON-LD structured data are both rendered from this
 * object, so the two can never drift apart. Nothing here should be duplicated
 * as a literal anywhere else in the site.
 */

export const site = {
  /** Set by `site` in astro.config.mjs — do not write the URL out again here. */
  url: import.meta.env.SITE,
  name: 'Nikola Staykov',
  title: 'Nikola Staykov',
  tagline: 'Robotics researcher — dexterous manipulation, reinforcement learning, and simulation.',

  /**
   * Plain-text bio, used for the meta description and JSON-LD only.
   * The visible bio is prose-with-links in src/components/Bio.astro — keep the
   * two saying the same thing.
   */
  intro:
    'Master’s student in Robotics, Systems and Control at ETH Zürich, working on ' +
    'dexterous manipulation, with broader interests in reinforcement learning, ' +
    'imitation learning, and simulation.',

  affiliation: {
    name: 'ETH Zürich',
    url: 'https://ethz.ch',
    role: 'MSc Robotics, Systems and Control',
  },

  location: {
    city: 'Zurich',
    country: 'Switzerland',
    countryCode: 'CH',
  },

  /** Shown as a short availability line. Keep it honest and current. */
  seeking: 'Open to PhD positions and industry research roles.',

  researchInterests: [
    'Dexterous manipulation',
    'Reinforcement learning',
    'Imitation learning',
    'Simulation and sim-to-real',
  ],

  email: 'nstaykov@ethz.ch',

  /**
   * Portrait. Every comparable researcher site has one; until a real photo
   * lands this stays empty and <Avatar> renders an initials placeholder.
   * TODO(nikola): drop a head-and-shoulders shot at public/media/portrait.jpg
   * and set this to '/media/portrait.jpg'.
   */
  photo: '',

  /** One line under the name. Role first, subject second. */
  subtitle: 'MSc Robotics at ETH',

  profiles: {
    github: 'https://github.com/NIkolaStaykov',
    linkedin: 'https://www.linkedin.com/in/nikola-staykov-104b73243/',
    // Session params (hl, oi) stripped — the user id is the canonical part.
    scholar: 'https://scholar.google.com/citations?user=rph6KJQAAAAJ',
    // TODO(nikola): ORCID and arXiv author page, if you have them.
    orcid: '',
    arxiv: '',
  },
} as const;

/**
 * Address written out rather than as a mailto — '@' spelled ' at ', which is
 * the usual light obfuscation against address scrapers.
 * Note: the real address is still in the Person JSON-LD, deliberately, so that
 * legitimate agents can read it. If you want it gone from there too, say so.
 */
export const emailDisplay = site.email.replace('@', ' at ');

/** Non-empty profile links, in display order. */
export const profileLinks = (
  [
    ['GitHub', site.profiles.github],
    ['Google Scholar', site.profiles.scholar],
    ['LinkedIn', site.profiles.linkedin],
    ['ORCID', site.profiles.orcid],
    ['arXiv', site.profiles.arxiv],
  ] as const
).filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

/** `sameAs` for the Person schema — same data, machine-readable. */
export const sameAs = profileLinks.map(([, url]) => url);
