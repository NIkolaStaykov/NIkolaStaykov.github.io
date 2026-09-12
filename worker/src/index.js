/**
 * Visitor ping — Cloudflare Worker.
 *
 * The site is static, so it cannot hold an API token. The page beacons here and
 * this Worker forwards a notification to Telegram or WhatsApp, whichever is
 * configured.
 *
 * What the notification contains: the words "Someone dropped by", and nothing
 * else. No IP, no location, no network, no referrer, not even the page path.
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

const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview|monitor|uptime|curl|wget|python-requests|headless|lighthouse|gtmetrix|pingdom|semrush|ahrefs|mj12|dotbot|petal|bytespider|gptbot|claudebot|perplexity|ccbot/i;

/** Salted SHA-256, truncated. Salt rotates daily so hashes are not stable. */
async function dedupKey(ip) {
  const salt = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
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
    const key = new Request(
      `https://ping.invalid/seen/${await dedupKey(request.headers.get('CF-Connecting-IP') || '')}`,
    );
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
    ctx.waitUntil(send('Someone dropped by', env));
    return new Response(null, { status: 204, headers: cors });
  },
};

/**
 * Sender is chosen by whichever secrets are set, in this order.
 *
 * Telegram   — official API, no approval, and no sending window. Best fit for
 *              an unprompted notification bot, which is why it goes first.
 * CallMeBot  — WhatsApp in minutes, but a third-party relay with no SLA.
 * Meta Cloud — official WhatsApp Business API. Free-form messages only deliver
 *              inside a 24h window opened by you messaging the business number,
 *              so after an idle spell this silently stops working unless you
 *              use an approved template.
 */
async function send(text, env) {
  try {
    if (env.TELEGRAM_TOKEN && env.TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text,
          disable_notification: false,
          link_preview_options: { is_disabled: true },
        }),
      });
      return;
    }
    if (env.CALLMEBOT_APIKEY && env.WHATSAPP_TO) {
      await fetch(
        `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.WHATSAPP_TO)}` +
          `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`,
      );
      return;
    }
    if (env.META_TOKEN && env.META_PHONE_ID && env.WHATSAPP_TO) {
      await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.META_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: env.WHATSAPP_TO,
          type: 'text',
          text: { body: text },
        }),
      });
    }
  } catch {
    // A failed notification must never affect the visitor.
  }
}
