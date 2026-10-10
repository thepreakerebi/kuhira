import { expect, test } from "bun:test";
import { scoreColor, scoreTextColor } from "@/lib/color";

test("ramp runs from pale to deep green and clamps", () => {
  expect(scoreColor(0)).toBe("rgb(241, 245, 228)");
  expect(scoreColor(100)).toBe("rgb(59, 84, 24)");
  expect(scoreColor(-20)).toBe(scoreColor(0));
  expect(scoreColor(250)).toBe(scoreColor(100));
});

test("text flips to white on dark fills", () => {
  expect(scoreTextColor(10)).toBe("#1c2b1e");
  expect(scoreTextColor(90)).toBe("#ffffff");
});
