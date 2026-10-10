import type { Defaults, PlanRequest } from "@/lib/types";

/** The plan the page opens with; the server renders it and the planner starts from it. */
export function defaultPlanRequest(defaults: Defaults): PlanRequest {
  return {
    weights: defaults.weights,
    hectares: defaults.remaining_ha,
    cost_per_ha_rwf: defaults.cost_per_ha_rwf,
    subsidy_rate: defaults.subsidy_regular,
    season_c_uptake: defaults.season_c.uptake,
  };
}
