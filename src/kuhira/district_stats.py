"""District aggregates from the survey: what small farmers grow, what they harvest, and how much is irrigated.

Only aggregates leave this module; plot records never do (NISR licence: aggregated reporting only).
"""

import pandas as pd

from kuhira.water_bonus import CROP_GROUPS, trim

RECENT_YEARS = (2023, 2024, 2025)
MIN_PLOTS = 30  # below this a district-crop yield falls back to the national figure
MISSING_CODES = [99, 999, 9999, 99999]  # survey codes for "don't know" / not sold


def recent_small(plots: pd.DataFrame, years=RECENT_YEARS) -> pd.DataFrame:
    df = plots[(plots.small == 1) & plots.year.isin(years) & (plots.ha > 0.001)].copy()
    df["group"] = df.crop.replace(CROP_GROUPS)
    df["crop_ha"] = df.ha / df.ncrop.clip(lower=1).fillna(1)  # an intercropped plot's area is shared
    df["w"] = df.w.fillna(0)
    return df


def unique_plots(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates(["year", "season", "seg", "farmer", "plot"])


def cropland_ha(df: pd.DataFrame) -> pd.Series:
    """Estimated small-farm cultivated hectares per district in an average season (survey-weighted)."""
    p = unique_plots(df)
    seasons = p[["year", "season"]].drop_duplicates().shape[0]
    return (p.w * p.ha).groupby(p.district).sum() / seasons


def crop_shares(df: pd.DataFrame) -> pd.DataFrame:
    """Share of each district's small-farm crop area by crop (rows sum to 1)."""
    area = (df.w * df.crop_ha).groupby([df.district, df.group]).sum().unstack(fill_value=0)
    return area.div(area.sum(axis=1), axis=0)


def irrigated_share(df: pd.DataFrame) -> pd.Series:
    """Share of small-farm plot area irrigated, per district."""
    p = unique_plots(df[df.irrigated.notna()])
    area = p.w * p.ha
    return (area * p.irrigated).groupby(p.district).sum() / area.groupby(p.district).sum()


def rainfed_sole_crop(df: pd.DataFrame) -> pd.DataFrame:
    """Rain-fed sole-crop plots with their kg/ha. Sole crops give the yield of a hectare given over to that crop,
    which is what a farmer plans with."""
    r = df[(df.irrigated == 0) & (df.kg > 0) & (df.ncrop == 1)].copy()
    r["yld"] = r.kg / r.ha
    return trim(r)


def national_rainfed_yields(df: pd.DataFrame) -> pd.Series:
    """Median rain-fed sole-crop kg/ha per crop, nationally."""
    return rainfed_sole_crop(df).groupby("group").yld.median()


def rainfed_yields(df: pd.DataFrame) -> pd.DataFrame:
    """Median rain-fed sole-crop kg/ha per district and crop; national median where a district has too few plots."""
    r = rainfed_sole_crop(df)
    g = r.groupby(["district", "group"]).yld
    local = g.median().where(g.size() >= MIN_PLOTS)
    return local.unstack().fillna(national_rainfed_yields(df)).fillna(0)


def crop_prices(df: pd.DataFrame) -> pd.Series:
    """National median farm-gate price, RWF per kg."""
    p = df[(df.price > 0) & ~df.price.isin(MISSING_CODES)]
    return p.groupby("group").price.median()


def provinces(df: pd.DataFrame) -> pd.Series:
    return df.groupby("district").province.agg(lambda s: s.mode().iat[0])
