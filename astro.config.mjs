// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // GitHub Pages user site. A user site serves from the domain root, so no
  // `base` is needed — a project repo would require base: '/personal-site'.
  site: 'https://nikolastaykov.github.io',
  integrations: [sitemap()],
  build: {
    // Emit /projects/foo/index.html so URLs keep their trailing slash and never move.
    format: 'directory',
  },
});
