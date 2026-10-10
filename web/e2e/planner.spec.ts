import { expect, test } from "@playwright/test";

const API = "http://127.0.0.1:8100";
const rows = (page: import("@playwright/test").Page) => page.getByRole("table").getByRole("row");

test("shows the ranking, map and plan totals for the PSTA5 gap", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/next 13,368 irrigated hectares/);
  await expect(rows(page)).toHaveCount(31); // header + 30 districts
  await expect(page.getByRole("group", { name: /Map of Rwanda/ }).getByRole("button")).toHaveCount(30);
  await expect(page.getByText("13,368 ha", { exact: true })).toBeVisible();
});

test("moving the weights re-ranks the districts to match the API", async ({ page, request }) => {
  const expected = await request.post(`${API}/plan`, {
    data: { weights: { gain: 0, gap: 0, dryness: 1, poverty: 0 } },
  });
  const driest = (await expected.json()).ranking[0].district;

  await page.goto("/en");
  const firstRow = rows(page).nth(1);
  await expect(firstRow).not.toContainText(driest);

  // Real keyboard input on the sliders: everything to zero, dryness to the top.
  for (const name of ["Water gain", "Adoption gap", "Poverty"]) {
    await page.getByRole("slider", { name }).focus();
    await page.keyboard.press("Home");
  }
  await page.getByRole("slider", { name: "Dryness" }).focus();
  await page.keyboard.press("End");

  await expect(firstRow).toContainText(driest);
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
});

test("choosing a district on the map opens its detail", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /^Kirehe: rank/ }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Kirehe" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Kirehe: rank/ })).toHaveAttribute("aria-pressed", "true");
});

test("choosing a district in the table opens its detail", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("table").getByRole("button", { name: "Ngoma" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Ngoma" })).toBeVisible();
});

test("an empty hectare field explains itself and sends nothing", async ({ page }) => {
  await page.goto("/en");
  let calls = 0;
  page.on("request", (r) => r.url().endsWith("/plan") && calls++);
  await page.getByLabel("Hectares to place").fill("");
  await expect(page.getByText("Enter 1 to 200,000 ha")).toBeVisible();
  await page.waitForTimeout(600);
  expect(calls).toBe(0);
});

test("solar subsidy raises the public share", async ({ page }) => {
  await page.goto("/en");
  const publicCost = page.getByText("Public cost").locator("..").locator("dd").first();
  await expect(publicCost).toHaveText("RWF 9.0 bn");
  await page.getByRole("radio", { name: "Solar 75%" }).click();
  await expect(publicCost).toHaveText("RWF 13.5 bn");
});

test("a failed update says what to do", async ({ page }) => {
  await page.route("**/plan", (route) => route.abort());
  await page.goto("/en");
  await page.getByRole("radio", { name: "Solar 75%" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Couldn't" })).toHaveText(
    "Couldn't update the plan. Check your connection.",
  );
});
