"""Season C, the June-August dry season: what a watered hectare harvests, and how much watered land is farmed then.

Without water most land lies idle in Season C, so a kit can add a whole extra harvest on top of the yield bonus in
Seasons A and B. Values are harvest value at farm-gate prices, before seed, fertilizer and labour.
"""

import pandas as pd

from kuhira.water_bonus import CROP_GROUPS

PLOT_KEYS = ["year", "seg", "farmer", "plot"]
MIN_TO_TRIM = 100


def small_plots(c: pd.DataFrame) -> pd.DataFrame:
    df = c[(c.small == 1) & (c.ha > 0.001) & (c.kg > 0) & c.irrigated.notna()].copy()
    df["group"] = df.crop.replace(CROP_GROUPS)
    return df


def plot_values(c: pd.DataFrame, prices: pd.Series) -> pd.DataFrame:
    """RWF per hectare for each plot: all its crops' harvests at median prices, over the plot's area.

    Keys are compared with dropna=False so a year whose files lack one key still counts.
    """
    df = small_plots(c)
    df["rwf"] = df.kg * df.group.map(prices)
    plots = df.groupby(PLOT_KEYS, dropna=False).agg(
        ha=("ha", "first"), rwf=("rwf", "sum"), irrigated=("irrigated", "max"), district=("district", "first")
    )
    plots = plots[plots.rwf > 0]
    plots["rwf_per_ha"] = plots.rwf / plots.ha
    if (
        len(plots) >= MIN_TO_TRIM
    ):  # drop the extreme 1% each side (unit slips); a handful of plots has no outliers to cut
        lo, hi = plots.rwf_per_ha.quantile([0.01, 0.99])
        plots = plots[plots.rwf_per_ha.between(lo, hi)]
    return plots.reset_index()


def irrigated_value_per_ha(values: pd.DataFrame) -> float:
    """Median harvest value of a watered Season C hectare."""
    return float(values[values.irrigated == 1].rwf_per_ha.median())


def irrigated_crop_mix(c: pd.DataFrame) -> pd.Series:
    """What watered Season C land grows: share of area by crop."""
    df = small_plots(c)
    df = df[df.irrigated == 1]
    area = (df.ha / df.ncrop.clip(lower=1).fillna(1)).groupby(df.group).sum()
    return (area / area.sum()).sort_values(ascending=False)


def irrigated_area(df: pd.DataFrame) -> pd.Series:
    """Survey-weighted irrigated small-farm hectares by year and season."""
    p = df[(df.small == 1) & (df.irrigated == 1) & (df.ha > 0.001)]
    p = p.drop_duplicates(["year", "season", "seg", "farmer", "plot"])
    return (p.w.fillna(0) * p.ha).groupby([p.year, p.season]).sum()


def uptake_by_year(ab: pd.DataFrame, c: pd.DataFrame) -> pd.Series:
    """Watered Season C area as a share of the average watered area in Seasons A and B, per year.

    Farmers cannot be followed from one season's sample to the next, so this compares land, not people.
    """
    main = irrigated_area(ab).unstack()[["A", "B"]].mean(axis=1)
    dry = irrigated_area(c).xs("C", level="season")
    return (dry / main).dropna()
