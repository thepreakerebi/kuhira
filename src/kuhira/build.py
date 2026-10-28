"""Write the aggregate files the API serves: data/processed/crops.json and districts.json."""

import json

import pandas as pd

from kuhira import district_stats as ds
from kuhira.paths import EXTERNAL, PROCESSED

MIN_SHARE = 0.005  # crops under 0.5% of a district's area are dropped from its mix


def nullable(v):
    return None if pd.isna(v) else float(v)


def crops_table(bonus: pd.DataFrame, prices: pd.Series, yields: pd.Series) -> list[dict]:
    out = []
    for r in bonus.to_dict("records"):
        out.append(
            {k: nullable(r[k]) for k in ["bonus_pct", "ci_low_pct", "ci_high_pct", "p_value"]}
            | {
                "crop": r["crop"],
                "plots": int(r["plots"]),
                "irrigated_plots": int(r["irrigated_plots"]),
                "price_rwf_per_kg": nullable(prices.get(r["crop"])),
                "yield_kg_per_ha": nullable(yields.get(r["crop"])),
            }
        )
    return out


def districts_table(recent: pd.DataFrame, dry_mm: pd.Series, poverty: pd.Series) -> list[dict]:
    shares, yields = ds.crop_shares(recent), ds.rainfed_yields(recent)
    cropland, irrigated, province = ds.cropland_ha(recent), ds.irrigated_share(recent), ds.provinces(recent)
    out = []
    for d in sorted(shares.index):
        mix = shares.loc[d][shares.loc[d] >= MIN_SHARE]
        out.append(
            {
                "district": d,
                "province": province[d],
                "cropland_ha": round(float(cropland[d])),
                "irrigated_share": round(float(irrigated[d]), 4),
                "dry_season_mm": round(float(dry_mm[d]), 1),
                "poverty_rate_pct": float(poverty[d]),
                "crops": [
                    {
                        "crop": c,
                        "share": round(float(s / mix.sum()), 4),
                        "yield_kg_per_ha": round(float(yields.loc[d].get(c, 0))),
                    }
                    for c, s in mix.sort_values(ascending=False).items()
                ],
            }
        )
    return out


def load_poverty() -> pd.Series:
    return pd.read_csv(EXTERNAL / "eicv7_district_poverty.csv").set_index("district").poverty_rate_pct


def season_c_summary(values: pd.DataFrame, uptake: pd.Series, mix: pd.Series) -> dict:
    from kuhira.season_c import irrigated_value_per_ha

    return {
        "value_rwf_per_ha": round(irrigated_value_per_ha(values)),
        "uptake": round(float(uptake.median()), 2),
        "uptake_by_year": {str(int(y)): round(float(v), 2) for y, v in uptake.items()},
        "crop_mix": {k: round(float(v), 3) for k, v in mix.items() if v >= 0.005},
        "plots": int((values.irrigated == 1).sum()),
    }


def write(crops: list[dict], districts: list[dict], season_c: dict) -> None:
    """JSON for the API, and the same aggregates as CSV for anyone opening the data in a spreadsheet."""
    PROCESSED.mkdir(parents=True, exist_ok=True)
    (PROCESSED / "season_c.json").write_text(json.dumps(season_c, indent=1))
    (PROCESSED / "crops.json").write_text(json.dumps(crops, indent=1))
    (PROCESSED / "districts.json").write_text(json.dumps(districts, indent=1))
    table = pd.DataFrame(crops).round({"yield_kg_per_ha": 0})
    table.insert(0, "crop", table.pop("crop"))
    table.to_csv(PROCESSED / "crops.csv", index=False)
    pd.DataFrame([{k: v for k, v in d.items() if k != "crops"} for d in districts]).to_csv(
        PROCESSED / "districts.csv", index=False
    )
    pd.DataFrame([{"district": d["district"], **c} for d in districts for c in d["crops"]]).to_csv(
        PROCESSED / "district_crops.csv", index=False
    )
