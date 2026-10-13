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
  projects: [
    { name: "chromium", testIgnore: /narbar_ios\.spec\.mjs/, use: { launchOptions: { args: ["--mute-audio"] } } },
    // the player bar on an iPhone: WebKit with the iPhone 15 profile (touch, mobile viewport), only for that spec
    // the off-site audio fallback on the iPhone's engine too (WebKit orders media errors and play() rejections its own way); the spec mutes every element
    { name: "webkit-audio", testMatch: /audio_hosting\.spec\.mjs/, use: { ...devices["iPhone 15"], serviceWorkers: "block" } },
    { name: "webkit-iphone", testMatch: /narbar_ios\.spec\.mjs/, use: { ...devices["iPhone 15"], serviceWorkers: "block" } }, // WebKit can't be muted by a switch: the spec mutes every media element itself
  ],
  webServer: {
    command: "node tests/serve.mjs",
    cwd: "..",
    url: "http://localhost:4321/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
