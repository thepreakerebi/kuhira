import { expect, test } from "@playwright/test";

async function pick(page: import("@playwright/test").Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("opens in Kinyarwanda and switches to English", async ({ page }) => {
  await page.goto("/farmer");
  await expect(page).toHaveURL(/\/farmer\/rw$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kuhira bizanyungura iki?");
  await page.getByRole("link", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What will irrigation earn me?");
});

test("estimates a maize plot and the payback", async ({ page }) => {
  await page.goto("/farmer/en");
  await expect(page.getByText("Your estimate appears here")).toBeVisible();
  await pick(page, "District", "Kirehe");
  await page.getByLabel("Plot size (m²)").fill("1000");
  await page.getByRole("button", { name: "Calculate" }).click();
  const result = page.getByRole("article").filter({ hasText: "Maize · Kirehe" });
  await expect(result).toContainText("+15%");
  await expect(result).toContainText("RWF 45,000"); // half of the 90,000 treadle pump
  await expect(result).toContainText(/Pays for itself in\s*[\d.]+ seasons/);
});

test("warns that irrigated beans lose yield", async ({ page }) => {
  await page.goto("/farmer/en");
  await pick(page, "Crop", "Beans");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByText(/irrigated bean plots harvest less/)).toBeVisible();
  await expect(page.getByText("Does not pay back")).toBeVisible();
});

test("asks for a price when the farmer has their own quote", async ({ page }) => {
  await page.goto("/farmer/en");
  await page.getByRole("radio", { name: "My own quote" }).click();
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByText("Enter the kit price in RWF")).toBeVisible();
  await expect(page.getByText("Your estimate appears here")).toBeVisible();
});

test("an unknown language shows the not-found page", async ({ page }) => {
  await page.goto("/farmer/fr");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  // Streaming means a 200 status, so search engines are kept off with noindex instead.
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
  await expect(page.locator('meta[name="robots"]:not([content*="noindex"])')).toHaveCount(0);
});
