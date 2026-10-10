import { geoArea, geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { DistrictShape } from "@/lib/types";

export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 520;

type DistrictFeature = Feature<Polygon | MultiPolygon, { district: string }>;

/**
 * GeoJSON (RFC 7946) winds outer rings counter-clockwise; d3-geo expects clockwise and otherwise reads a
 * district as "the whole globe except this district". Reverse the rings of any feature bigger than a hemisphere.
 */
export function rewind(f: DistrictFeature): DistrictFeature {
  if (geoArea(f) <= 2 * Math.PI) return f;
  const g = f.geometry;
  const coordinates =
    g.type === "Polygon"
      ? g.coordinates.map((ring) => ring.toReversed())
      : g.coordinates.map((poly) => poly.map((ring) => ring.toReversed()));
  return { ...f, geometry: { ...g, coordinates } as Polygon | MultiPolygon };
}

/** Project district outlines to SVG path strings once, on the server. */
export function districtShapes(geo: FeatureCollection<Polygon | MultiPolygon, { district: string }>): DistrictShape[] {
  const fixed = { ...geo, features: geo.features.map(rewind) };
  const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], fixed);
  const path = geoPath(projection).digits(1);
  return fixed.features.map((f) => ({ district: f.properties.district, d: path(f) ?? "" }));
}
