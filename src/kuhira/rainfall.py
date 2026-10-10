"""District rainfall from CHIRPS v2.0 monthly grids (about 5 km cells), already clipped to Rwanda."""

import re
from pathlib import Path

import geopandas as gpd
import pandas as pd
from rasterstats import zonal_stats

from kuhira.paths import EXTERNAL

CHIRPS_DIR = EXTERNAL / "chirps" / "rwa"
DISTRICTS = EXTERNAL / "boundaries" / "rwa_ADM2_simplified.geojson"
DRY_MONTHS = (6, 7, 8)  # June-August: the long dry season, when Season C crops depend on irrigation


def load_districts(path: Path = DISTRICTS) -> gpd.GeoDataFrame:
    return gpd.read_file(path).rename(columns={"shapeName": "district"})[["district", "geometry"]]


def monthly(districts: gpd.GeoDataFrame, chirps_dir: Path = CHIRPS_DIR) -> pd.DataFrame:
    """Mean rainfall (mm) per district per month. all_touched keeps small districts (Kigali) from losing cells."""
    rows = []
    for tif in sorted(chirps_dir.glob("chirps_rwa_*.tif")):
        year, month = map(int, re.findall(r"(\d{4})_(\d{2})", tif.name)[0])
        stats = zonal_stats(districts, str(tif), stats="mean", all_touched=True, nodata=-9999)
        rows += [{"district": d, "year": year, "month": month, "mm": s["mean"]}
                 for d, s in zip(districts.district, stats)]
    return pd.DataFrame(rows)


def dry_season_mm(rain: pd.DataFrame, first: int = 1995, last: int = 2025) -> pd.Series:
    """Average June-August rainfall total per district over complete years."""
    r = rain[rain.month.isin(DRY_MONTHS) & rain.year.between(first, last)]
    return r.groupby(["district", "year"]).mm.sum().groupby("district").mean()
