import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.dannydominguez.dev",
  output: "static",
  // Inline all CSS (~20 KB on the home page, mostly font-face rules) so the first paint never waits on a stylesheet request.
  build: { inlineStylesheets: "always" },
  integrations: [sitemap({ filter: (page) => !page.includes("404") })],
});
