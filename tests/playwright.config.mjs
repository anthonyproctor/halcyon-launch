// Smoke tests for the Halcyon site. Run: npm run test:smoke
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.mjs/,
  outputDir: "test-results",
  timeout: 60_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:4321", // must be localhost: the engine skips sign-in there
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  },
  webServer: {
    command: "node tests/serve.mjs",
    cwd: "..",
    url: "http://localhost:4321/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
