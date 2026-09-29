/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: process.env.WITH_DIST ? [] : ["tests/html/**"],
  },
});
