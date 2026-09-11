/**
 * Post-build sanity checks. Cheap, and each one guards a bug that actually
 * happened rather than a hypothetical.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) check(p, readFileSync(p, 'utf8'));
  }
}

function check(file, html) {
  // 1. Astro strips whitespace when <a> starts a source line, gluing a link to
  //    the preceding word. Has happened twice; catch it in the output.
  for (const m of html.matchAll(/(\w{2,})<a\s/g)) {
    // Legitimate cases have punctuation or a tag boundary before the anchor.
    problems.push(`${file}: missing space before link — "${m[1]}<a"`);
  }
  // 2. Links into the site that point at files the build did not emit.
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const t = m[1].replace(/^\//, '');
    const ok = [join(dist, t), join(dist, t, 'index.html')].some(existsSync);
    if (!ok) problems.push(`${file}: dead internal link — ${m[1]}`);
  }
}

walk(dist);

if (problems.length) {
  console.error('\nBuild checks failed:\n' + problems.map((p) => '  ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log('build checks passed');
