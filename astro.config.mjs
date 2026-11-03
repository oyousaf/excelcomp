// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const { PUBLIC_INDEXABLE } = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");
const indexable = PUBLIC_INDEXABLE === "true";

export default defineConfig({
  site: "https://excelcomp.legxcysol.dev",
  output: "static",
  adapter: vercel(),
  integrations: indexable ? [sitemap()] : [],
  vite: { plugins: [tailwindcss()] },
  markdown: { syntaxHighlight: false },
  security: {
    checkOrigin: true,
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
      ],
    },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage",
      weights: ["500 800"],
      subsets: ["latin"],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Atkinson Hyperlegible Next",
      cssVariable: "--font-atkinson",
      weights: ["400 700"],
      subsets: ["latin"],
      styles: ["normal"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Martian Mono",
      cssVariable: "--font-martian",
      weights: ["400 600"],
      subsets: ["latin"],
      styles: ["normal"],
      fallbacks: ["monospace"],
    },
  ],
  env: {
    schema: {
      PUBLIC_INDEXABLE: envField.boolean({ context: "client", access: "public", default: false }),
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_TO: envField.string({
        context: "server",
        access: "secret",
        default: "simon@excelcomputersolutions.co.uk",
      }),
      CONTACT_FROM: envField.string({
        context: "server",
        access: "secret",
        default: "Excel Computer Solutions <website@excelcomputersolutions.co.uk>",
      }),
    },
  },
});
