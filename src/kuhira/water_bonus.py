"""The water bonus: how much more an irrigated plot yields than a rain-fed one, per crop.

log(kg/ha) on irrigated, with district x year x season fixed effects (absorbing local weather and prices),
crops-on-plot, fertilizer, improved seed, plot size and crop. Small farmers only; errors clustered by
survey segment-year.
"""

import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf

CROP_GROUPS = {"Bush bean": "Beans", "Climbing bean": "Beans", "Bean": "Beans"}
CROPS = [
    "Maize",
    "Beans",
    "Irish potato",
    "Sweet potato",
    "Vegetables",
    "Sorghum",
    "Cassava",
    "Paddy rice",
    "Soybean",
    "Wheat",
]
MIN_IRRIGATED = 30
FORMULA = "np.log(yld) ~ irrigated + C(dys) + C(ncrop) + fert_used + iseed + np.log(ha) + C(crop)"


def prepare(plots: pd.DataFrame) -> pd.DataFrame:
    """Small-farmer crop-plots with a positive harvest, known irrigation, and the model's helper columns."""
    df = plots[(plots.small == 1) & (plots.ha > 0.001) & (plots.kg > 0) & plots.irrigated.notna()].copy()
    df["yld"] = df.kg / df.ha
    df["group"] = df.crop.replace(CROP_GROUPS)
    df["dys"] = df.district + "_" + df.year.astype(str) + df.season
    df["cluster"] = df.seg + "_" + df.year.astype(str)
    df["ncrop"] = df.ncrop.clip(upper=5).fillna(1)
    return df


def trim(df: pd.DataFrame, lo: float = 0.01, hi: float = 0.99) -> pd.DataFrame:
    """Drop the extreme 1% of yields within each crop (data-entry errors in kg or m²)."""
    q = df.groupby("crop").yld.transform
    return df[(df.yld >= q(lambda x: x.quantile(lo))) & (df.yld <= q(lambda x: x.quantile(hi)))]


def pct(log_effect: float) -> float:
    return round(float(np.exp(log_effect) - 1) * 100, 1)


def estimate(df: pd.DataFrame, group: str) -> dict:
    s = trim(df[df.group == group])
    row = {"crop": group, "plots": len(s), "irrigated_plots": int(s.irrigated.sum())}
    if row["irrigated_plots"] < MIN_IRRIGATED:
        return row | {"bonus_pct": None, "ci_low_pct": None, "ci_high_pct": None, "p_value": None}
    m = smf.ols(FORMULA, data=s).fit(cov_type="cluster", cov_kwds={"groups": s.cluster})
    b, se = m.params["irrigated"], m.bse["irrigated"]
    return row | {
        "bonus_pct": pct(b),
        "ci_low_pct": pct(b - 1.96 * se),
        "ci_high_pct": pct(b + 1.96 * se),
        "p_value": round(float(m.pvalues["irrigated"]), 4),
    }


def estimate_all(plots: pd.DataFrame) -> pd.DataFrame:
    df = prepare(plots)
    return pd.DataFrame([estimate(df, c) for c in CROPS])


def estimate_within(df: pd.DataFrame, group: str) -> dict:
    """Robustness check: the same model fitted by demeaning within district x year x season x crop cells.

    The dummy-variable fit warns about a near-singular design; this version has no dummies to collide.
    """
    s = trim(df[df.group == group])
    cell = s.dys + s.crop
    X = pd.get_dummies(s.ncrop.astype(int), prefix="n", drop_first=True).astype(float)
    X[["irrigated", "fert_used", "iseed"]] = s[["irrigated", "fert_used", "iseed"]].astype(float)
    X["log_ha"] = np.log(s.ha)
    Z = pd.concat([np.log(s.yld).rename("y"), X], axis=1)
    Z = Z - Z.groupby(cell).transform("mean")
    m = sm.OLS(Z.y, Z.drop(columns="y")).fit(cov_type="cluster", cov_kwds={"groups": s.cluster})
    b, se = m.params["irrigated"], m.bse["irrigated"]
    return {"crop": group, "bonus_pct": pct(b), "ci_low_pct": pct(b - 1.96 * se), "ci_high_pct": pct(b + 1.96 * se)}
