import { defineConfig, devices } from "@playwright/test";

const API = "http://127.0.0.1:8100";
const WEB = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: WEB, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "cd .. && uv run uvicorn kuhira.api:app --port 8100",
      url: `${API}/health`,
      env: { KUHIRA_WEB_ORIGINS: WEB },
      reuseExistingServer: !process.env.CI,
    },
    {
      // The build prerenders pages from the API, so it waits for it first.
      command: `until curl -sf ${API}/health; do sleep 1; done && bun run build && bun run start -p 3100`,
      url: WEB,
      env: { NEXT_PUBLIC_KUHIRA_API_URL: API },
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
