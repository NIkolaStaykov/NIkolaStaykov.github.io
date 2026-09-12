/**
 * Visitor ping — Cloudflare Worker.
 *
 * The site is static, so it cannot hold an API token. The page beacons here and
 * this Worker forwards a notification to Telegram or WhatsApp, whichever is
 * configured.
 *
 * What the notification contains: the words "Someone dropped by", a running
 * count of distinct visitors so far today, and nothing else. No IP, no
 * location, no network, no referrer, not even the page path.
 *
 * The Worker unavoidably *receives* the visitor's IP — it arrives with the
 * connection, as it does for any server — but it is never transmitted, never
 * logged, and never stored in recoverable form. It is salted and hashed once,
 * used only as a deduplication key, and the salt rotates daily so yesterday's
 * hashes cannot be correlated with today's.
 *
 * Other deliberate behaviour:
 *  - Bots and crawlers are dropped. Without this the phone is unusable: most
 *    traffic to a personal site is automated.
 *  - One ping per visitor per DEDUP_HOURS. Someone reading four pages is one
 *    notification.
 *  - Do-Not-Track is honoured. Flip HONOUR_DNT to false to override.
 *  - Always answers 204, and never reveals whether a ping was sent.
 */

const DEDUP_HOURS = 6;
const HONOUR_DNT = true;

// The day the counter runs on. Europe/Zurich is CET, and shifts to CEST with
// daylight saving, so the reset always lands on local midnight rather than
// drifting an hour in summer. Override with the TIMEZONE var.
const DEFAULT_TIMEZONE = 'Europe/Zurich';

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|uptime|curl|wget|python-requests|headless|lighthouse|gtmetrix|pingdom|semrush|ahrefs|mj12|dotbot|petal|bytespider|gptbot|claudebot|perplexity|ccbot/i;

/**
 * Today's date as YYYY-MM-DD in the configured zone.
 *
 * This is the only definition of "a day" in the Worker: it rotates the hash
 * salt and it is what the visitor counter resets on, so both boundaries move
 * together at local midnight.
 */
function dayStamp(env) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: env.TIMEZONE || DEFAULT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Salted SHA-256, truncated.
 *
 * The day component rotates the value daily. The HASH_SALT secret is what
 * makes it irreversible: IPv4 is only 2^32 addresses, so a hash salted with a
 * publicly-known value alone can be brute-forced in seconds. With a secret
 * salt it cannot be, which is the difference between pseudonymous and
 * effectively anonymous.
 */
async function dedupKey(ip, day, env) {
  const salt = `${env.HASH_SALT || ''}:${day}`;
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Ask the counter how many distinct visitors there have been today, recording
 * this one first.
 *
 * Returns null if the Durable Object is unavailable — a missing count must
 * never cost you the notification itself.
 */
async function countVisitor(hash, day, env) {
  if (!env.VISITOR_COUNTER) return null;
  try {
    const id = env.VISITOR_COUNTER.idFromName('daily');
    const stub = env.VISITOR_COUNTER.get(id);
    const res = await stub.fetch('https://counter.invalid/hit', {
      method: 'POST',
      body: JSON.stringify({ day, hash }),
    });
    const { count } = await res.json();
    return typeof count === 'number' ? count : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env, ctx) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: cors });

    const origin = request.headers.get('Origin') || '';
    if (env.ALLOWED_ORIGIN && origin !== env.ALLOWED_ORIGIN) {
      return new Response(null, { status: 204, headers: cors });
    }

    const ua = request.headers.get('User-Agent') || '';
    if (BOT_RE.test(ua) || (HONOUR_DNT && request.headers.get('DNT') === '1')) {
      return new Response(null, { status: 204, headers: cors });
    }

    // The IP lives only inside this block, only as a hash, and is never sent on.
    const day = dayStamp(env);
    const hash = await dedupKey(request.headers.get('CF-Connecting-IP') || '', day, env);

    const key = new Request(`https://ping.invalid/seen/${hash}`);
    const cache = caches.default;
    if (await cache.match(key)) return new Response(null, { status: 204, headers: cors });
    ctx.waitUntil(
      cache.put(
        key,
        new Response('1', { headers: { 'Cache-Control': `max-age=${DEDUP_HOURS * 3600}` } }),
      ),
    );

    let page = '/';
    try {
      const body = await request.json();
      if (typeof body?.path === 'string') page = body.path.slice(0, 120);
    } catch {
      /* body is optional */
    }

    // Message text. `page` is available here if you ever want it appended —
    // it is a path, not visitor data.
    ctx.waitUntil(
      countVisitor(hash, day, env).then((count) =>
        send(
          count === null
            ? 'Someone dropped by'
            : `Someone dropped by — ${count} ${count === 1 ? 'visitor' : 'visitors'} today`,
          env,
        ),
      ),
    );
    return new Response(null, { status: 204, headers: cors });
  },
};

/**
 * Distinct-visitor counter for the current day.
 *
 * A Durable Object rather than KV or the cache because this has to be one
 * number: the cache is per-colocation, so a visitor in Frankfurt and one in
 * Zurich would be counted against different tallies, and KV has no atomic
 * increment. Every ping goes through the single instance named "daily", which
 * a personal site's traffic will not trouble.
 *
 * Storage holds the day it is counting, the tally, and one key per visitor
 * hash seen. When the day rolls over the whole lot is dropped — so yesterday's
 * hashes are not merely unlinkable, they are gone.
 */
export class VisitorCounter {
  constructor(state) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const { day, hash } = await request.json();

    if ((await this.storage.get('day')) !== day) {
      await this.storage.deleteAll();
      await this.storage.put({ day, count: 0 });
    }

    if (!(await this.storage.get(`v:${hash}`))) {
      const count = ((await this.storage.get('count')) || 0) + 1;
      await this.storage.put({ [`v:${hash}`]: 1, count });
      return Response.json({ count });
    }

    return Response.json({ count: (await this.storage.get('count')) || 0 });
  }
}
