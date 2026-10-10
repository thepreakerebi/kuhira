import { describe, expect, test } from "bun:test";
import { cropName, isLang, langFromPath, messages, switchLangPath } from "@/lib/i18n";
import districts from "../../../data/processed/districts.json";

/** Every leaf of a catalogue as [path, value]; functions are called with sample arguments. */
function leaves(obj: unknown, path = ""): [string, unknown][] {
  if (typeof obj === "function") return [[path, (obj as (...a: unknown[]) => unknown)(1, 2, 3, 4)]];
  if (obj && typeof obj === "object") return Object.entries(obj).flatMap(([k, v]) => leaves(v, `${path}.${k}`));
  return [[path, obj]];
}

describe("message catalogues", () => {
  const en = new Map(leaves({ ...messages.en, crops: {} }));
  const rw = new Map(leaves({ ...messages.rw, crops: {} }));

  test("Kinyarwanda has exactly the English keys", () => {
    expect([...rw.keys()].sort()).toEqual([...en.keys()].sort());
  });

  test("no string is blank except deliberate empties", () => {
    const blank = [...rw, ...en].filter(([k, v]) => v === "" && k !== ".planner.toGo");
    expect(blank).toEqual([]);
  });

  test("every crop the app can show has a Kinyarwanda name", () => {
    const shown = new Set(districts.flatMap((d) => d.crops.map((c) => c.crop)));
    expect(shown.size).toBeGreaterThan(10);
    for (const c of shown) expect(cropName("rw", c)).not.toBe(c);
    expect(cropName("en", "Maize")).toBe("Maize");
  });
});

describe("language paths", () => {
  test("reads the language from the first segment", () => {
    expect(langFromPath("/rw/farmer")).toBe("rw");
    expect(langFromPath("/en")).toBe("en");
    expect(langFromPath("/")).toBe("en");
    expect(langFromPath("/fr/method")).toBe("en");
  });

  test("switches language and keeps the page", () => {
    expect(switchLangPath("/en/farmer", "rw")).toBe("/rw/farmer");
    expect(switchLangPath("/rw", "en")).toBe("/en");
    expect(switchLangPath("/", "rw")).toBe("/rw");
    expect(switchLangPath("/method", "rw")).toBe("/rw/method");
  });

  test("isLang accepts only supported languages", () => {
    expect(isLang("rw")).toBe(true);
    expect(isLang("fr")).toBe(false);
  });
});
