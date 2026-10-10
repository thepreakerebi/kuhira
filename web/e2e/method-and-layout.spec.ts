import { expect, test } from "@playwright/test";

test("method page charts every estimated crop with beans negative", async ({ page }) => {
  await page.goto("/en/method");
  const chart = page.getByRole("figure").filter({ hasText: "Yield change on irrigated" });
  await expect(chart.getByRole("listitem")).toHaveCount(9);
  await expect(chart.getByRole("img", { name: /^Beans: −10%/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Beans lose 10% with water/ })).toBeVisible();
});

for (const width of [320, 768, 1920]) {
  test(`no page scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/en", "/rw/farmer", "/en/method", "/rw"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => {
        const content = document.getElementById("content")!;
        return Math.max(document.documentElement.scrollWidth - window.innerWidth, content.scrollWidth - content.clientWidth);
      });
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}

test("navigation marks the current page", async ({ page }) => {
  await page.goto("/en/method");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Method" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("the top bar stays in place while the content scrolls", async ({ page }) => {
  await page.goto("/en");
  const box = page.getByRole("table");
  await box.scrollIntoViewIfNeeded();
  const state = await page.evaluate(() => ({
    window: window.scrollY,
    content: document.getElementById("content")!.scrollTop,
    header: document.querySelector("header")!.getBoundingClientRect().top,
  }));
  expect(state.content).toBeGreaterThan(0);
  expect(state.window).toBe(0);
  expect(state.header).toBe(0);
});

test("the top-bar language switch keeps the page and translates it", async ({ page }) => {
  await page.goto("/en/method");
  const languages = page.getByRole("navigation", { name: "Language" });
  await expect(languages.getByRole("link", { name: "EN" })).toHaveAttribute("aria-current", "true");
  await languages.getByRole("link", { name: "RW" }).click();
  await expect(page).toHaveURL(/\/rw\/method$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Uko Kuhira ifata icyemezo");
  await page.getByRole("navigation", { name: "Ibikubiyemo" }).getByRole("link", { name: "Igenamigambi" }).click();
  await expect(page).toHaveURL(/\/rw$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Hegitari 13,368/);
});

test("the farmer page has no language switch of its own", async ({ page }) => {
  await page.goto("/en/farmer");
  await expect(page.getByRole("navigation", { name: "Language" })).toHaveCount(1);
});
