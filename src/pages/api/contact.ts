import type { APIRoute } from "astro";
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY } from "astro:env/server";
import { Resend } from "resend";
import { validate, type ContactInput, type ContactResponse } from "@/lib/contact";

export const prerender = false;

const MIN_FILL_MS = 3_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 4;

// Best effort only: each serverless instance keeps its own counts. Pair with
// a Vercel Firewall rate-limit rule on /api/contact in production.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function looksLikeSpam(form: FormData, data: ContactInput): boolean {
  if (String(form.get("website") ?? "") !== "") return true;

  const started = parseInt(String(form.get("t") ?? ""), 36);
  const age = Date.now() - started;
  if (!Number.isFinite(started) || age < MIN_FILL_MS || age > MAX_AGE_MS) return true;

  const links = data.message.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (links > 2 || /\[url=|<a\s+href/i.test(data.message)) return true;

  return false;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = request.headers.get("accept")?.includes("application/json");
  const reply = (status: number, body: ContactResponse) =>
    wantsJson ? Response.json(body, { status }) : redirect(body.ok ? "/thanks" : "/#contact", 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, message: "We couldn't read that form. Please try again." });
  }

  const { data, errors } = validate(Object.fromEntries(form));
  if (Object.keys(errors).length) {
    return reply(422, { ok: false, message: "Please check the highlighted fields.", errors });
  }

  const thanks: ContactResponse = { ok: true, message: `Thanks ${data.name.split(" ")[0]}, your message is on its way. We'll be in touch soon.` };

  // Bots get the same success response so they have nothing to learn from.
  if (looksLikeSpam(form, data)) return reply(200, thanks);

  if (rateLimited(clientAddress ?? "unknown")) {
    return reply(429, { ok: false, message: "You've sent a few messages already. Please call us instead." });
  }

  if (!RESEND_API_KEY) {
    if (import.meta.env.DEV) {
      console.info("[contact] RESEND_API_KEY not set; message not emailed:\n", data);
      return reply(200, { ok: true, message: `${thanks.message} (Dev mode: logged to the terminal, not emailed.)` });
    }
    return reply(503, {
      ok: false,
      message: "Our contact form isn't switched on just yet. Please call or email us instead.",
    });
  }

  const rows: [string, string][] = [
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone || "Not given"],
    ["Topic", data.topic],
  ];

  const { error } = await new Resend(RESEND_API_KEY).emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    replyTo: data.email,
    subject: `Website enquiry: ${data.topic} (${data.name})`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${data.message}`,
    html: `<table>${rows.map(([k, v]) => `<tr><th align="left">${k}</th><td>${escape(v)}</td></tr>`).join("")}</table><p style="white-space:pre-wrap">${escape(data.message)}</p>`,
  });

  if (error) {
    console.error("[contact] Resend error", error);
    return reply(502, { ok: false, message: "Something went wrong sending your message. Please call or email instead." });
  }

  return reply(200, thanks);
};
