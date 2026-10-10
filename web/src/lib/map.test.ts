import { expect, test } from "bun:test";
import { geoArea } from "d3-geo";
import type { Feature, Polygon } from "geojson";
import { districtShapes, rewind } from "@/lib/map";

// A ~0.1° square near Kigali, wound counter-clockwise as RFC 7946 GeoJSON does.
const ccw: Feature<Polygon, { district: string }> = {
  type: "Feature",
  properties: { district: "Test" },
  geometry: { type: "Polygon", coordinates: [[[30, -2], [30.1, -2], [30.1, -1.9], [30, -1.9], [30, -2]]] },
};

test("rewind turns a globe-sized feature back into the small district", () => {
  expect(geoArea(ccw)).toBeGreaterThan(2 * Math.PI);
  expect(geoArea(rewind(ccw))).toBeLessThan(0.001);
});

test("rewind leaves correctly wound features alone", () => {
  const fixed = rewind(ccw);
  expect(rewind(fixed)).toBe(fixed);
});

test("districtShapes gives each district its own share of the map", () => {
  const east: Feature<Polygon, { district: string }> = {
    ...ccw,
    properties: { district: "East" },
    geometry: { type: "Polygon", coordinates: [[[30.1, -2], [30.2, -2], [30.2, -1.9], [30.1, -1.9], [30.1, -2]]] },
  };
  const shapes = districtShapes({ type: "FeatureCollection", features: [ccw, east] });
  for (const shape of shapes) {
    const xs = [...shape.d.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map((m) => Number(m[1]));
    const width = Math.max(...xs) - Math.min(...xs);
    expect(width).toBeGreaterThan(250); // two side-by-side squares share the 600px box
    expect(width).toBeLessThan(350);
  }
});
