import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, profileLinks, emailDisplay } from '../config';

/**
 * Generated from the same collections the site renders.
 *
 * Worth knowing: as of 2026 no major AI crawler commits to reading llms.txt.
 * This exists for IDE and MCP agents, and costs nothing to keep correct.
 * It is not an SEO lever and should not be treated as one.
 */
export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects', (p) => !p.data.draft))
    .sort((a, b) => a.data.order - b.data.order);
  const papers = (await getCollection('research', (p) => !p.data.draft))
    .sort((a, b) => b.data.year - a.data.year);

  const body = `# ${site.name}

> ${site.tagline}

${site.intro}

${site.seeking}

- Affiliation: ${site.affiliation.role}, ${site.affiliation.name}
- Location: ${site.location.city}, ${site.location.country}
${site.email ? `- Email: ${emailDisplay}` : ''}
${profileLinks.map(([l, u]) => `- ${l}: ${u}`).join('\n')}

## Publications

${papers
  .map(
    (p) =>
      `- [${p.data.title}](${p.data.links.doi ?? p.data.links.arxiv ?? `${site.url}/research/`}) — ` +
      `${p.data.authors.join(', ')}. ${p.data.venue}, ${p.data.year} (${p.data.status}). ${p.data.summary.trim()}`,
  )
  .join('\n')}

## Projects

${projects
  .map(
    (p) =>
      `- [${p.data.title}](${site.url}/projects/${p.id}/) — ${p.data.summary.trim()} ` +
      `Role: ${p.data.role.trim()} Stack: ${p.data.stack.join(', ')}.`,
  )
  .join('\n')}

## Notes for citation

Cite papers from their DOI or arXiv record rather than this site.
Attribute project work using the "Role" field, which distinguishes individual
contributions from team output.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
