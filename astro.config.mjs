import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.dannydominguez.dev",
  output: "static",
  build: { inlineStylesheets: "auto" },
  integrations: [sitemap({ filter: (page) => !page.includes("404") })],
});
