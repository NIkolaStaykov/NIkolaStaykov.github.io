import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schemas are deliberately strict. A project with no date, a dead-looking link
 * field, or a missing role fails `astro build` rather than shipping half-filled.
 */

const links = z
  .object({
    code: z.string().url().optional(),
    paper: z.string().url().optional(),
    video: z.string().url().optional(),
    demo: z.string().url().optional(),
  })
  .default({});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** 1–2 plain-language sentences. What it does, not how clever it is. */
      summary: z.string().min(20),
      /** Your specific contribution. Required — forces honesty on team work. */
      role: z.string(),
      /** Named collaborators. Empty array means solo work. */
      collaborators: z.array(z.string()).default([]),
      stack: z.array(z.string()).default([]),
      links,
      /** Small figure for index rows. Path under /public. */
      thumb: z.string().optional(),
      media: z
        .object({
          poster: image().optional(),
          video: z.string().optional(), // path under /public, e.g. '/media/inhand.mp4'
          alt: z.string(),
        })
        .optional(),
      /**
       * One line with a number in it — what changed and by how much.
       * Required for featured projects (enforced below), optional otherwise:
       * not every honest project has a headline metric, and a build that breaks
       * on that fact would just invite a fabricated number.
       */
      result: z.string().min(10).optional(),
      /** 2-3 sentences: what was non-obvious, what failed, what you'd redo. */
      hardPart: z.string().min(80).optional(),
      startDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(99),
      draft: z.boolean().default(false),
    })
    .superRefine((d, ctx) => {
      // A featured slot is a claim on the reader's attention; it has to carry
      // evidence. Unfeatured projects may legitimately have neither field.
      if (!d.featured) return;
      for (const field of ['result', 'hardPart'] as const) {
        if (!d[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `featured projects must set "${field}" — either write it, or set featured: false`,
          });
        }
      }
    }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    /** Shown separately from authors — credit without faking co-authorship. */
    supervisors: z.array(z.string()).default([]),
    venue: z.string(),
    year: z.number().int(),
    status: z.enum(['published', 'preprint', 'thesis', 'in-review']),
    links: z
      .object({
        pdf: z.string().url().optional(),
        arxiv: z.string().url().optional(),
        doi: z.string().url().optional(),
        code: z.string().url().optional(),
      })
      .default({}),
    /** Small figure for index rows. Path under /public. */
    thumb: z.string().optional(),
    /** Raw BibTeX. Rendered as a copy-paste block — the thing researchers use. */
    bibtex: z.string().optional(),
    summary: z.string().min(20),
    /** Set when the paper also warrants a full project page. */
    projectSlug: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, research };
