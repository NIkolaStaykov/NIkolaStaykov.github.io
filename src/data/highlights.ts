/**
 * Dated one-liners, newest first.
 *
 * The full record lives here; only entries flagged `highlight: true` render on
 * the home page. Keeping the rest means curating the section is a one-word edit
 * rather than deleting content you may want back.
 *
 * Keep each item to a single sentence. `date` is YYYY-MM.
 */

export interface Highlight {
  date: string;
  text: string;
  /** Shown on the home page. Keep this to two or three at a time. */
  highlight?: boolean;
  link?: { label: string; href: string };
}

export const allItems: Highlight[] = [
  {
    date: '2026-03',
    highlight: true,
    text: 'Finished my robotics test engineering internship at Sevensense at ABB.',
  },
  {
    // TODO(nikola): confirm the acceptance month — anchored to the IEEE record.
    date: '2025-03',
    highlight: true,
    text: 'Semantically Safe Robot Manipulation was accepted to IEEE Robotics and Automation Letters.',
    link: { label: 'IEEE', href: 'https://ieeexplore.ieee.org/document/10933541/' },
  },
  {
    date: '2024-09',
    text: 'Started the MSc in Robotics, Systems and Control at ETH.',
  },
  {
    date: '2024-09',
    text: 'Graduated from TUM with a BSc in Engineering Science.',
  },
  {
    // TODO(nikola): confirm year.
    date: '2023-08',
    text: 'Attended the ETH Robotics Summer School.',
    link: { label: 'Summer School', href: 'https://robotx.ethz.ch/education/summer-school.html' },
  },
  {
    date: '2022-10',
    text: 'Awarded the Deutschlandstipendium, renewed in 2023 and 2024.',
  },
  {
    date: '2020-06',
    highlight: true,
    text: 'Selected for the Research Science Institute at MIT.',
    link: { label: 'RSI', href: 'https://www.cee.org/programs/research-science-institute' },
  },
];

/** What the home page renders. */
export const highlights = allItems.filter((i) => i.highlight);
