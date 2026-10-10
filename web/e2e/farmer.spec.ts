import { expect, test } from "@playwright/test";

async function pick(page: import("@playwright/test").Page, label: string, option: string) {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test("old farmer links open the Kinyarwanda calculator", async ({ page }) => {
  await page.goto("/farmer");
  await expect(page).toHaveURL(/\/rw\/farmer$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kuhira bizanyungura iki?");
});

test("estimates a maize plot and the payback", async ({ page }) => {
  await page.goto("/en/farmer");
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
  await page.goto("/en/farmer");
  await pick(page, "Crop", "Beans");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByText(/irrigated bean plots harvest less/)).toBeVisible();
  await expect(page.getByText("Does not pay back")).toBeVisible();
});

test("asks for a price when the farmer has their own quote", async ({ page }) => {
  await page.goto("/en/farmer");
  await page.getByRole("radio", { name: "My own quote" }).click();
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByText("Enter the kit price in RWF")).toBeVisible();
  await expect(page.getByText("Your estimate appears here")).toBeVisible();
});

test("an unknown language shows the not-found page", async ({ page }) => {
  await page.goto("/fr/farmer");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  // Streaming means a 200 status, so search engines are kept off with noindex instead.
  expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBeGreaterThan(0);
  await expect(page.locator('meta[name="robots"]:not([content*="noindex"])')).toHaveCount(0);
});

test("the district field searches by name and by province", async ({ page }) => {
  await page.goto("/en/farmer");
  await page.getByLabel("District", { exact: true }).click();
  const search = page.getByRole("combobox", { name: "Search districts" });

  await search.fill("rwam");
  await expect(page.getByRole("option")).toHaveText(["Rwamagana"]);

  await search.fill("eastern");
  await expect(page.getByRole("option")).toHaveCount(7);

  await search.fill("zz");
  await expect(page.getByText("No district found. Check the spelling.")).toBeVisible();

  await search.fill("nyanza");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("District", { exact: true })).toHaveText("Nyanza");
});

test("the estimate counts a dry-season crop and its faster payback", async ({ page }) => {
  await page.goto("/en/farmer");
  await page.getByLabel("Plot size (m²)").fill("1000");
  await page.getByRole("button", { name: "Calculate" }).click();
  const dry = page.getByRole("heading", { name: "With a dry-season crop" });
  await expect(dry).toBeVisible();
  await expect(page.getByText(/A typical watered dry-season plot of this size harvests about RWF [\d,.]+/)).toBeVisible();
});
