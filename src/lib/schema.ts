import { site, sameAs } from '../config';
import { education, experience } from '../data/cv';
import type { CollectionEntry } from 'astro:content';

/**
 * JSON-LD builders. These read the same objects the visible markup reads, so
 * structured data and page text cannot disagree.
 *
 * The email address is deliberately absent from `Person`: the page shows it
 * obfuscated, and emitting the raw `mailto:` here would have handed scrapers
 * exactly what the obfuscation exists to withhold.
 */

export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    url: site.url,
    jobTitle: site.affiliation.role,
    description: site.intro,
    knowsAbout: [...site.researchInterests],
    affiliation: {
      '@type': 'Organization',
      name: site.affiliation.name,
      url: site.affiliation.url,
    },
    worksFor: experience.map((e) => ({
      '@type': 'Organization',
      name: e.org,
      url: e.orgUrl,
    })),
    alumniOf: education.map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.org,
      url: e.orgUrl,
    })),
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.location.city,
      addressCountry: site.location.countryCode,
    },
    sameAs,
  };
}

export function scholarlyArticleSchema(entry: CollectionEntry<'research'>) {
  const d = entry.data;
  const url = d.links.doi ?? d.links.arxiv ?? d.links.pdf;
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: d.title,
    name: d.title,
    author: d.authors.map((name) => ({ '@type': 'Person', name })),
    datePublished: String(d.year),
    publisher: { '@type': 'Organization', name: d.venue },
    isPartOf: { '@type': 'Periodical', name: d.venue },
    abstract: d.summary,
    url,
    sameAs: Object.values(d.links).filter(Boolean),
  };
}

export function softwareSourceCodeSchema(entry: CollectionEntry<'projects'>) {
  const d = entry.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: d.title,
    description: d.summary,
    author: { '@type': 'Person', name: site.name, url: site.url },
    programmingLanguage: [...d.stack],
    codeRepository: d.links.code,
    dateCreated: d.startDate.toISOString().slice(0, 10),
    dateModified: (d.updatedDate ?? d.startDate).toISOString().slice(0, 10),
    url: new URL(`/projects/${entry.id}/`, site.url).href,
  };
}
