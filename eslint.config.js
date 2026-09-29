import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/",
      ".astro/",
      ".superpowers/",
      "playwright-report/",
      "test-results/",
      ".lighthouseci/",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
];
