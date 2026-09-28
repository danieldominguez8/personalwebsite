import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:4321";
const external = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "on-first-retry" },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled" } },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /visual|smoke/ },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /visual|smoke/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /visual|smoke/ },
    { name: "visual", use: { ...devices["Desktop Chrome"] }, testMatch: /visual\.spec\.ts/ },
    { name: "smoke", use: { ...devices["Desktop Chrome"] }, testMatch: /smoke\.spec\.ts/ },
  ],
  webServer: external
    ? undefined
    : {
        command: "npm run preview",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
