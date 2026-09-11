import type { APIRoute } from 'astro';

/**
 * Generated rather than static so the Sitemap URL always matches `site` in
 * astro.config.mjs.
 *
 * Default-allow, with nothing excluded: being findable and citable is the point,
 * and robots.txt can only ever restrict, never help.
 */
export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
