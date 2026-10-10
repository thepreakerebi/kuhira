import "server-only";
import { cacheLife } from "next/cache";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { API_URL, postJson } from "@/lib/api-url";
import { districtShapes } from "@/lib/map";
import type { Crop, Defaults, District, Plan } from "@/lib/types";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

/** Everything the pages need that only changes when the analysis is rerun. */
export async function getStaticData() {
  "use cache";
  cacheLife("hours");
  const [defaults, crops, districts, boundaries] = await Promise.all([
    getJson<Defaults>("/defaults"),
    getJson<Crop[]>("/crops"),
    getJson<District[]>("/districts"),
    getJson<FeatureCollection<Polygon | MultiPolygon, { district: string }>>("/boundaries"),
  ]);
  return { defaults, crops, districts, shapes: districtShapes(boundaries) };
}

export async function getDefaultPlan(defaults: Defaults) {
  "use cache";
  cacheLife("hours");
  return postJson<Plan>("/plan", {
    weights: defaults.weights,
    hectares: defaults.remaining_ha,
    cost_per_ha_rwf: defaults.cost_per_ha_rwf,
    subsidy_rate: defaults.subsidy_regular,
  });
}
