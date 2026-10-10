import { expect, test } from "bun:test";
import { copy, cropName, isLang } from "@/lib/i18n";

const MODEL_CROPS = ["Maize", "Beans", "Irish potato", "Sweet potato", "Vegetables", "Sorghum", "Cassava",
  "Paddy rice", "Soybean", "Wheat"];

test("Kinyarwanda has every English string, none blank", () => {
  for (const [key, value] of Object.entries(copy.en)) {
    if (key === "crops") continue;
    expect(copy.rw).toHaveProperty(key);
    expect(JSON.stringify(copy.rw[key as keyof typeof copy.rw]).length).toBeGreaterThan(2);
    expect(typeof copy.rw[key as keyof typeof copy.rw]).toBe(typeof value);
  }
});

test("every modelled crop has a Kinyarwanda name", () => {
  for (const c of MODEL_CROPS) expect(cropName("rw", c)).not.toBe(c);
  expect(cropName("en", "Maize")).toBe("Maize");
});

test("isLang accepts only supported languages", () => {
  expect(isLang("rw")).toBe(true);
  expect(isLang("fr")).toBe(false);
});
