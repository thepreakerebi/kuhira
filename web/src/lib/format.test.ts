import { describe, expect, test } from "bun:test";
import { formatNumber, formatPct, formatRwf, formatSignedPct } from "@/lib/format";

describe("formatRwf", () => {
  test("uses billions, millions, then whole francs", () => {
    expect(formatRwf(9_023_399_999)).toBe("RWF 9.0 bn");
    expect(formatRwf(763_951_698)).toBe("RWF 764.0 M");
    expect(formatRwf(45_000)).toBe("RWF 45,000");
  });

  test("shows losses with a minus sign", () => {
    expect(formatRwf(-3_414)).toBe("−RWF 3,414");
  });
});

test("formatPct and formatSignedPct", () => {
  expect(formatPct(0.0121, 1)).toBe("1.2%");
  expect(formatSignedPct(14.6)).toBe("+15%");
  expect(formatSignedPct(-10.3)).toBe("−10%");
  expect(formatSignedPct(0)).toBe("0%");
});

test("formatNumber groups thousands", () => {
  expect(formatNumber(13368)).toBe("13,368");
});
