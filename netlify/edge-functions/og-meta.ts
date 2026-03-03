// Netlify Edge Function — intercepts /offer/* for social media bots
// Returns HTML with dynamic og:title/description/image based on offer data

const BOT_USER_AGENTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "LinkedInBot",
  "Slackbot",
  "TelegramBot",
  "Discordbot",
];

const CONVEX_URL = Deno.env.get("CONVEX_URL") || "";

export default async (request: Request) => {
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  if (!isBot || !CONVEX_URL) {
    // Pass through to SPA for real users or if CONVEX_URL not configured
    return;
  }

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/offer\/(.+)$/);
  if (!match) return;

  const offerId = match[1];

  try {
    // Fetch offer data from Convex
    const response = await fetch(`${CONVEX_URL}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "offers:getById",
        args: { id: offerId },
      }),
    });

    if (!response.ok) return;

    const data = await response.json();
    const offer = data.value;
    if (!offer) return;

    const title = `${offer.discountPercent}% OFF at ${offer.storeName} — ${offer.title}`;
    const description =
      offer.description || `Get ${offer.discountPercent}% discount at ${offer.storeName}. ${offer.address}`;
    const image = offer.imageUrls?.[0] || "";
    const pageUrl = `${url.origin}/offer/${offerId}`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description.slice(0, 200))}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}">` : ""}
  <meta property="og:site_name" content="OfferLagbe">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description.slice(0, 200))}">
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}">` : ""}
</head>
<body>
  <p>${escapeHtml(title)}</p>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    // On error, fall through to SPA
    return;
  }
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const config = {
  path: "/offer/*",
};
