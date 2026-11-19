import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3100",
    viewport: { width: 1600, height: 1000 },
    launchOptions: { args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
    screenshot: "only-on-failure",
  },
  reporter: [["list"]],
});
