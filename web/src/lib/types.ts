export type Weights = { gain: number; gap: number; dryness: number; poverty: number };
export type WeightKey = keyof Weights;

export type Crop = {
  crop: string;
  bonus_pct: number | null;
  ci_low_pct: number | null;
  ci_high_pct: number | null;
  p_value: number | null;
  plots: number;
  irrigated_plots: number;
  price_rwf_per_kg: number | null;
  yield_kg_per_ha: number | null;
};

export type District = {
  district: string;
  province: string;
  cropland_ha: number;
  irrigated_share: number;
  dry_season_mm: number;
  poverty_rate_pct: number;
  crops: { crop: string; share: number; yield_kg_per_ha: number }[];
};

export type Kit = { cost_rwf: number; subsidy_rate: number };

export type Defaults = {
  target_ha: number;
  actual_ha: number;
  remaining_ha: number;
  cost_per_ha_rwf: number;
  subsidy_regular: number;
  subsidy_solar: number;
  weights: Weights;
  kits: Record<string, Kit>;
};

export type RankedDistrict = {
  rank: number;
  district: string;
  province: string;
  score: number;
  gain_rwf_per_ha: number;
  irrigated_share: number;
  dry_season_mm: number;
  poverty_rate_pct: number;
  cropland_ha: number;
  factors: Weights;
};

export type Allocation = {
  district: string;
  rank: number;
  score: number;
  hectares: number;
  public_cost_rwf: number;
  farmer_cost_rwf: number;
  extra_value_rwf_per_year: number;
};

export type PlanRequest = {
  weights: Weights;
  hectares: number;
  cost_per_ha_rwf: number;
  subsidy_rate: number;
};

export type Plan = {
  ranking: RankedDistrict[];
  allocation: {
    districts: Allocation[];
    totals: Omit<Allocation, "district" | "rank" | "score">;
  };
};

export type FarmerRequest = {
  district: string;
  crop: string;
  area_m2: number;
  kit_cost_rwf: number;
  subsidy_rate: number;
};

export type FarmerEstimate = {
  district: string;
  crop: string;
  bonus_pct: number;
  rainfed_kg: number;
  extra_kg_per_season: number;
  extra_rwf_per_season: number;
  farmer_pays_rwf: number;
  seasons_to_repay: number | null;
};

export type DistrictShape = { district: string; d: string };
