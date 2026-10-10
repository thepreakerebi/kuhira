import "server-only";
import { cacheLife } from "next/cache";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { API_URL, postJson } from "@/lib/api-url";
import { districtShapes } from "@/lib/map";
import { defaultPlanRequest } from "@/lib/plan-request";
import type { Crop, Defaults, District, Plan } from "@/lib/types";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Bump whenever the API's data or response shape changes (in the same commit). It is part of the cache key, so a
 * server never keeps serving data cached from an older API: that once crashed the planner after Season C was added.
 */
const DATA_VERSION = 2;

/** Everything the pages need that only changes when the analysis is rerun. */
export function getStaticData() {
  return loadStaticData(DATA_VERSION);
}

async function loadStaticData(_version: number) {
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
  return postJson<Plan>("/plan", defaultPlanRequest(defaults));
}
