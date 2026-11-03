import type { APIRoute } from "astro";
import { PUBLIC_INDEXABLE } from "astro:env/client";

// While unlisted, crawling stays allowed so search engines can see the
// noindex directives; blocking here would hide them.
export const GET: APIRoute = ({ site }) =>
  new Response(
    PUBLIC_INDEXABLE
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site)}\n`
      : `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: CCBot\nUser-agent: Google-Extended\nDisallow: /\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
