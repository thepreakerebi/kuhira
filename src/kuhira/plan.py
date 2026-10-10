"""Score districts for small-scale irrigation, split a hectare target between them, and estimate one farmer's gain.

Pure Python over the processed aggregates, so the API needs no data-science stack.
"""

import json
import math
import random
from functools import cache

from pydantic import BaseModel, Field

from kuhira.paths import PROCESSED

SIGNIFICANCE = 0.05
SSIT_TARGET_HA = 41_031  # PSTA5 small-scale irrigation target for 2028/29
SSIT_ACTUAL_HA = 27_663  # developed by FY2024/25 (MINAGRI annual report)
REMAINING_HA = SSIT_TARGET_HA - SSIT_ACTUAL_HA
COST_PER_HA_RWF = 1_350_000  # RAB, 2019: about $1,500/ha, at that year's ~900 RWF/$
SUBSIDY_REGULAR, SUBSIDY_SOLAR = 0.5, 0.75  # World Bank SAIP II PAD (2023), pp. 19-20
SEASONS_PER_YEAR = 2  # Seasons A and B; Season C gains are not counted


class Crop(BaseModel):
    crop: str
    bonus_pct: float | None
    ci_low_pct: float | None
    ci_high_pct: float | None
    p_value: float | None
    plots: int
    irrigated_plots: int
    price_rwf_per_kg: float | None
    yield_kg_per_ha: float | None = None  # national rain-fed sole-crop median

    @property
    def counted_bonus(self) -> float:
        """Bonus used in planning: only where the survey shows a clear effect, either way."""
        if self.bonus_pct is None or self.p_value is None or self.p_value >= SIGNIFICANCE:
            return 0.0
        return self.bonus_pct / 100


class DistrictCrop(BaseModel):
    crop: str
    share: float
    yield_kg_per_ha: float


class District(BaseModel):
    district: str
    province: str
    cropland_ha: float
    irrigated_share: float
    dry_season_mm: float
    poverty_rate_pct: float
    crops: list[DistrictCrop]


class Weights(BaseModel):
    gain: float = Field(0.4, ge=0, le=1)
    gap: float = Field(0.2, ge=0, le=1)
    dryness: float = Field(0.2, ge=0, le=1)
    poverty: float = Field(0.2, ge=0, le=1)


@cache
def load_crops() -> dict[str, Crop]:
    return {c["crop"]: Crop(**c) for c in json.loads((PROCESSED / "crops.json").read_text())}


class SeasonC(BaseModel):
    """The June-August dry season (see kuhira.season_c)."""

    value_rwf_per_ha: float  # median harvest value of a watered Season C hectare, before input costs
    uptake: float  # watered Season C land as a share of watered A/B land, median over years
    uptake_by_year: dict[str, float]
    crop_mix: dict[str, float]
    plots: int


@cache
def load_season_c() -> SeasonC:
    return SeasonC(**json.loads((PROCESSED / "season_c.json").read_text()))


@cache
def load_districts() -> dict[str, District]:
    return {d["district"]: District(**d) for d in json.loads((PROCESSED / "districts.json").read_text())}


def crop_gain(crop: Crop, yield_kg_per_ha: float) -> tuple[float, float]:
    """Extra kg and RWF per irrigated hectare per season for one crop."""
    kg = yield_kg_per_ha * crop.counted_bonus
    return kg, kg * (crop.price_rwf_per_kg or 0)


def gain_per_ha(district: District, crops: dict[str, Crop]) -> float:
    """Extra RWF per irrigated hectare per season, given what the district grows."""
    return sum(dc.share * crop_gain(crops[dc.crop], dc.yield_kg_per_ha)[1] for dc in district.crops if dc.crop in crops)


def rescale(values: list[float], invert: bool = False) -> list[float]:
    """Min-max to 0-1 across districts; invert when less is more (rain)."""
    lo, hi = min(values), max(values)
    out = [(v - lo) / (hi - lo) if hi > lo else 0.0 for v in values]
    return [1 - v for v in out] if invert else out


def score(districts: dict[str, District], crops: dict[str, Crop], weights: Weights) -> list[dict]:
    """Rank districts. Each factor is rescaled 0-1, then weighted; the result is 0-100."""
    ds = list(districts.values())
    raw = {
        "gain": [gain_per_ha(d, crops) for d in ds],
        "gap": [1 - d.irrigated_share for d in ds],
        "dryness": [d.dry_season_mm for d in ds],
        "poverty": [d.poverty_rate_pct for d in ds],
    }
    factors = {k: rescale(v, invert=k == "dryness") for k, v in raw.items()}
    w = weights.model_dump()
    total = sum(w.values()) or 1
    rows = [
        {
            "district": d.district,
            "province": d.province,
            "score": round(100 * sum(w[k] * factors[k][i] for k in w) / total, 1),
            "gain_rwf_per_ha": round(raw["gain"][i]),
            "irrigated_share": d.irrigated_share,
            "dry_season_mm": d.dry_season_mm,
            "poverty_rate_pct": d.poverty_rate_pct,
            "cropland_ha": d.cropland_ha,
            "factors": {k: round(factors[k][i], 3) for k in w},
        }
        for i, d in enumerate(ds)
    ]
    rows.sort(key=lambda r: r["score"], reverse=True)
    return [r | {"rank": i + 1} for i, r in enumerate(rows)]


UNCERTAINTY_DRAWS = 300
TOP_N = 10


def log_se(crop: Crop) -> float | None:
    """Standard error of the log water bonus, recovered from its 95% interval."""
    if crop.ci_low_pct is None or crop.ci_high_pct is None:
        return None
    return (math.log1p(crop.ci_high_pct / 100) - math.log1p(crop.ci_low_pct / 100)) / (2 * 1.96)


def rank_uncertainty(
    districts: dict[str, District],
    crops: dict[str, Crop],
    weights: Weights,
    draws: int = UNCERTAINTY_DRAWS,
    seed: int = 7,
    include_uncertain: bool = False,
) -> dict[str, dict]:
    """How sure is each district's rank? Re-rank many times, drawing each counted water bonus from its uncertainty.

    Consistent with the ranking it describes: crops the main ranking counts as zero (not clearly different from zero)
    stay at zero, unless `include_uncertain` asks what happens if they counted too. The seed is fixed, so the same
    inputs always give the same answer.
    """
    rng = random.Random(seed)
    ranks: dict[str, list[int]] = {d: [] for d in districts}
    for _ in range(draws):
        drawn = {}
        for name, c in crops.items():
            se = log_se(c)
            if se is None or c.bonus_pct is None or (c.counted_bonus == 0 and not include_uncertain):
                drawn[name] = c
                continue
            b = rng.gauss(math.log1p(c.bonus_pct / 100), se)
            drawn[name] = c.model_copy(update={"bonus_pct": math.expm1(b) * 100, "p_value": 0.0})
        for r in score(districts, drawn, weights):
            ranks[r["district"]].append(r["rank"])
    out = {}
    for d, rs in ranks.items():
        s = sorted(rs)
        out[d] = {
            "rank_low": s[int(0.05 * len(s))],
            "rank_high": s[int(0.95 * len(s)) - 1],
            "top_share": round(sum(r <= TOP_N for r in s) / len(s), 2),
        }
    return out


def allocate(
    scored: list[dict],
    hectares: float,
    cost_per_ha: float,
    subsidy_rate: float,
    season_c_rwf_per_ha: float = 0.0,
    season_c_uptake: float = 0.0,
) -> dict:
    """Split hectares in proportion to score x cropland, so equal scores get equal shares of their farmland.

    The dry-season harvest is the same per hectare everywhere, so it adds to the totals without changing the ranking.
    """
    pull = [r["score"] * r["cropland_ha"] for r in scored]
    total_pull = sum(pull) or 1
    rows = []
    for r, p in zip(scored, pull):
        ha = hectares * p / total_pull
        rows.append(
            {
                "district": r["district"],
                "rank": r["rank"],
                "score": r["score"],
                "hectares": round(ha),
                "public_cost_rwf": round(ha * cost_per_ha * subsidy_rate),
                "farmer_cost_rwf": round(ha * cost_per_ha * (1 - subsidy_rate)),
                "extra_value_rwf_per_year": round(ha * r["gain_rwf_per_ha"] * SEASONS_PER_YEAR),
                "season_c_value_rwf_per_year": round(ha * season_c_uptake * season_c_rwf_per_ha),
            }
        )
    sums = {
        k: sum(r[k] for r in rows)
        for k in [
            "hectares",
            "public_cost_rwf",
            "farmer_cost_rwf",
            "extra_value_rwf_per_year",
            "season_c_value_rwf_per_year",
        ]
    }
    return {"districts": rows, "totals": sums}


def seasons_until_paid(cost: float, gains: list[float], limit: int = 60) -> int | None:
    """Seasons until cumulative gains cover the cost, cycling through one year's seasons; None if never."""
    if cost <= 0:
        return 0
    if sum(gains) <= 0:
        return None
    total = 0.0
    for n in range(1, limit + 1):
        total += gains[(n - 1) % len(gains)]
        if total >= cost:
            return n
    return None


def farmer_estimate(
    district: District,
    crop: Crop,
    area_m2: float,
    kit_cost_rwf: float,
    subsidy_rate: float,
    season_c_rwf_per_ha: float = 0.0,
) -> dict:
    """What irrigating one plot is worth to a farmer, and when the kit pays back.

    Payback is counted twice: from the yield bonus in Seasons A and B alone, and with a dry-season (Season C) crop too,
    walking through the seasons in order from Season A.
    """
    dc = next((c for c in district.crops if c.crop == crop.crop), None)
    # A crop the district barely grows is not in its mix; fall back to the national yield rather than zero.
    yield_kg_per_ha = dc.yield_kg_per_ha if dc else (crop.yield_kg_per_ha or 0.0)
    kg_per_ha, rwf_per_ha = crop_gain(crop, yield_kg_per_ha)
    ha = area_m2 / 10_000
    farmer_pays = kit_cost_rwf * (1 - subsidy_rate)
    extra_rwf = rwf_per_ha * ha
    season_c_rwf = season_c_rwf_per_ha * ha
    return {
        "district": district.district,
        "crop": crop.crop,
        "bonus_pct": round(crop.counted_bonus * 100, 1),
        "rainfed_kg": round(yield_kg_per_ha * ha),
        "extra_kg_per_season": round(kg_per_ha * ha),
        "extra_rwf_per_season": round(extra_rwf),
        "season_c_rwf": round(season_c_rwf),
        "farmer_pays_rwf": round(farmer_pays),
        "seasons_to_repay": round(farmer_pays / extra_rwf, 1) if extra_rwf > 0 else None,
        "seasons_to_repay_with_c": seasons_until_paid(farmer_pays, [extra_rwf, extra_rwf, season_c_rwf]),
    }


# DWFI (2022) p.16, citing the SSIT programme's price list. Petrol = mid-range pump plus mid-range pipes.
KITS = {
    "treadle": {"cost_rwf": 90_000, "subsidy_rate": SUBSIDY_REGULAR},
    "petrol": {"cost_rwf": 193_750 + 116_750, "subsidy_rate": SUBSIDY_REGULAR},
}
