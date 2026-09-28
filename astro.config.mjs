import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.dannydominguez.dev",
  output: "static",
  build: { inlineStylesheets: "auto" },
});
