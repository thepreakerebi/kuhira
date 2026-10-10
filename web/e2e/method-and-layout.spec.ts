import { expect, test } from "@playwright/test";

test("method page charts every estimated crop with beans negative", async ({ page }) => {
  await page.goto("/method");
  const chart = page.getByRole("figure").filter({ hasText: "Yield change on irrigated" });
  await expect(chart.getByRole("listitem")).toHaveCount(9);
  await expect(chart.getByRole("img", { name: /^Beans: −10%/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Beans lose 10% with water/ })).toBeVisible();
});

for (const width of [320, 768, 1920]) {
  test(`no page scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/farmer/rw", "/method"]) {
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
  await page.goto("/method");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Method" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("the top bar stays in place while the content scrolls", async ({ page }) => {
  await page.goto("/");
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
