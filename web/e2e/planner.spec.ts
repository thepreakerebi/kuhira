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

test("a row far down the table opens its details in view", async ({ page }) => {
  await page.goto("/en");
  const last = page.getByRole("table").getByRole("button", { name: "Kicukiro" });
  await last.scrollIntoViewIfNeeded();
  await last.click();

  const sheet = page.getByRole("dialog", { name: "Kicukiro" });
  await expect(sheet).toBeInViewport({ ratio: 0.9 });
  await expect(sheet.getByText("30 of 30")).toBeVisible();
  await expect(sheet.getByRole("button", { name: /^Kicukiro: rank 30/ })).toHaveAttribute("aria-pressed", "true");
  // The map card above follows the same selection.
  await expect(page.getByRole("heading", { level: 3, name: "Kicukiro" })).toBeAttached();

  await sheet.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("dialog", { name: /Gasabo/ })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("29 of 30")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  // Focus lands on the row of the district last shown, ready to carry on down the table.
  await expect(page.getByRole("table").getByRole("button", { name: "Gasabo" })).toBeFocused();
});

test("the first district has no previous one to step to", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("table").getByRole("button", { name: "Nyamagabe" }).click();
  const sheet = page.getByRole("dialog", { name: "Nyamagabe" });
  await expect(sheet.getByRole("button", { name: "Previous" })).toBeDisabled();
  await sheet.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("dialog", { name: "Nyaruguru" })).toBeVisible();
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

/** Every distinct text painted in the public-cost total, sampled each animation frame. */
async function paintedPublicCost(page: import("@playwright/test").Page, act: () => Promise<void>) {
  await page.evaluate(() => {
    const el = document.querySelectorAll("dl dd data")[1];
    const w = window as unknown as { __frames: string[] };
    w.__frames = [];
    const tick = () => {
      if (w.__frames.at(-1) !== el.textContent) w.__frames.push(el.textContent ?? "");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await act();
  await expect(page.locator("dl dd data").nth(1)).toHaveText("RWF 13.5 bn");
  await page.waitForTimeout(700);
  return page.evaluate(() => (window as unknown as { __frames: string[] }).__frames);
}

test("totals count up to the new value without flashing it first", async ({ page }) => {
  await page.goto("/en");
  const frames = await paintedPublicCost(page, () => page.getByRole("radio", { name: "Solar 75%" }).click());
  expect(frames.length).toBeGreaterThan(4); // it counted, not jumped
  expect(frames.indexOf("RWF 13.5 bn")).toBe(frames.length - 1); // the final value appears only at the end
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("totals jump straight to the new value", async ({ page }) => {
    await page.goto("/en");
    const frames = await paintedPublicCost(page, () => page.getByRole("radio", { name: "Solar 75%" }).click());
    expect(frames).toEqual(["RWF 9.0 bn", "RWF 13.5 bn"]);
  });
});

test("the dry-season share drives the dry-season harvest total", async ({ page }) => {
  await page.goto("/en");
  const dry = page.locator("dl dd data").nth(4);
  await expect(dry).not.toHaveText("RWF 0");
  const field = page.getByLabel("Kit land farmed in the dry season (%)");
  await expect(field).toHaveValue(/^\d+$/);
  await field.fill("0");
  await expect(dry).toHaveText("RWF 0");
  await field.fill("150");
  await expect(page.getByText("Enter 0 to 100")).toBeVisible();
});

test("each district shows how firmly it holds its rank", async ({ page }) => {
  await page.goto("/en");
  const top = page.getByRole("table").getByRole("row").nth(1);
  await expect(top.getByRole("cell").nth(2)).toHaveText(/^1–\d+$/);
  await expect(page.getByText(/^Ranks \d+–\d+ in 90% of 300 simulations/).first()).toBeVisible();
});
