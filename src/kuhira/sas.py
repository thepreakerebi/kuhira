"""Harmonize the NISR Seasonal Agricultural Survey (SAS) into one plot x crop table.

Variable codes shift between survey years, so every field is found by its label, not its code.
"""

import re
from pathlib import Path

import numpy as np
import pandas as pd
import pyreadstat

from kuhira.paths import RAW

YEARS = {2020: "sas2020", 2021: "sas2021", 2022: "sas2022", 2023: "sas2023", 2024: "sas2024", 2025: "sas2025"}
SEASONS = "AB"

FILE_PATTERNS = {
    "prod": [r"season{s}_Crop production\.dta$", r"Season{s}20\d\d_Production\.dta$"],
    "prac": [r"Season{s}_PartIV_Agricultural practice\.dta$", r"Season{s}20\d\d_Agricultural_practice\.dta$"],
    "fert": [r"Season{s}_PartIII_Fertilizers_Pesticides\.dta$", r"fertilizer_pesticide{s}20\d\d\.dta$"],
}

IRRIGATED_PLOT = r"(Has this plot been irrigated|Have you irrigated your plot)"
IRRIGATED_ANY = r"irrigation in any of your plots"
INORGANIC_FERT = r"inorganic fertilizer in this plot"

# Field name -> (label regex, exclude regex)
FIELDS = {
    "province": (r"\bProvince\b", None),
    "district": (r"District", None),
    "ftype": (r"Farmer.*type|LSF type", None),
    "area": (r"Plot (area|size)", None),
    "ncrop": (r"Number of main crops", None),
    "kg": (r"Total quantity of harvest", r"for this crop"),
    "price": (r"selling price per kilogram|Market price", None),
    "seed": (r"improved seed for this crop", None),
    "irr": (IRRIGATED_PLOT, None),
    "irr_any": (IRRIGATED_ANY, None),
    "fert": (INORGANIC_FERT, None),
}

COLUMNS = ["year", "season", "seg", "farmer", "plot", "province", "district", "small", "crop", "ha", "kg",
           "price", "ncrop", "irrigated", "fert_used", "iseed", "w"]

# \b matters: 2023's segment label "Segment/Large scale farmer Identification" also contains "farmer ID"
KEY_PATTERNS = {"seg": r"^Segment_ID", "farmer": r"Farmer ID\b", "plot": r"Plot N(o|umber)"}

DISTRICT_FIXES = {"Nyarugenege": "Nyarugenge"}


def find_file(year_dir: Path, season: str, kind: str) -> Path | None:
    pats = [p.format(s=season) for p in FILE_PATTERNS[kind]]
    hits = sorted(f for f in year_dir.rglob("*.dta") if any(re.search(p, str(f), re.IGNORECASE) for p in pats))
    return hits[0] if hits else None


def find_var(names, labels, regex: str, exclude: str | None = None) -> str | None:
    """First variable whose 'name label' matches regex and not exclude."""
    for name, label in zip(names, labels):
        text = f"{name} {label or ''}"
        if re.search(regex, text, re.IGNORECASE) and not (exclude and re.search(exclude, text, re.IGNORECASE)):
            return name
    return None


def yes(s: pd.Series) -> pd.Series:
    return s.astype(object).where(s.notna(), "").astype(str).str.strip().str.lower().str.startswith(("yes", "1"))


def normalize_key(s: pd.Series) -> pd.Series:
    """Survey IDs arrive as floats in some years and strings in others; make them comparable."""
    n = pd.to_numeric(s, errors="coerce")
    return n.map(lambda v: str(int(v)) if pd.notna(v) else None).where(n.notna(), s.astype(str).str.strip())


def clean_district(s: pd.Series) -> pd.Series:
    s = s.astype(str).str.replace(r"^\d+\s*[-.]?\s*", "", regex=True).str.strip().str.title()
    return s.replace(DISTRICT_FIXES)


def irrigated_flag(irr: pd.Series, irr_any: pd.Series) -> pd.Series:
    """1 = plot irrigated, 0 = known not irrigated (plot answer, or farmer irrigated no plot), NaN = unknown."""
    no_plot_irrigated = irr_any.astype(str).str.lower().str.startswith("no")
    return pd.Series(np.where(yes(irr), 1, np.where(irr.notna() | no_plot_irrigated, 0, np.nan)), index=irr.index)


def load(path: Path):
    df, meta = pyreadstat.read_dta(str(path), apply_value_formats=True)
    for c in df.columns:
        if isinstance(df[c].dtype, pd.CategoricalDtype):
            df[c] = df[c].astype(object)
    return df, meta


def key_vars(meta) -> dict:
    return {k: find_var(meta.column_names, meta.column_labels, rx) for k, rx in KEY_PATTERNS.items()}


def keyed(df: pd.DataFrame, meta, var_regex: str, keys: list[str]) -> pd.DataFrame | None:
    """Pick one variable plus normalized join keys from a survey file, one row per key."""
    k = key_vars(meta)
    var = find_var(meta.column_names, meta.column_labels, var_regex)
    if not var:
        return None
    out = pd.DataFrame({kk: normalize_key(df[k[kk]]) for kk in keys} | {"value": df[var]})
    return out.drop_duplicates(keys)


def fill_from(d: pd.DataFrame, field: str, other: pd.DataFrame | None, keys: list[str]) -> pd.DataFrame:
    if other is None:
        return d
    d = d.drop(columns=field).merge(other.rename(columns={"value": field}), on=keys, how="left")
    return d


def harmonize_season(year: int, season: str, raw: Path = RAW) -> pd.DataFrame:
    year_dir = raw / YEARS[year]
    prod, meta = load(find_file(year_dir, season, "prod"))
    names, labels = meta.column_names, meta.column_labels
    found = {f: find_var(names, labels, rx, ex) for f, (rx, ex) in FIELDS.items()}
    found["crop"] = "CropCategory" if "CropCategory" in prod else find_var(names, labels, r"Crop name")
    found["w"] = find_var(names, labels, r"plot.?weight") or find_var(names, labels, r"weight")
    found |= key_vars(meta)

    d = pd.DataFrame({f: prod[v] if v else np.nan for f, v in found.items()})
    for k in ["seg", "farmer", "plot"]:
        d[k] = normalize_key(d[k])

    plot_keys, farmer_keys = ["seg", "farmer", "plot"], ["seg", "farmer"]
    if d.irr.isna().all() or d.irr_any.isna().all():
        prac, pm = load(find_file(year_dir, season, "prac"))
        if d.irr.isna().all():  # plot-level irrigation lives only in the practice file
            d = fill_from(d, "irr", keyed(prac, pm, IRRIGATED_PLOT, plot_keys), plot_keys)
        if d.irr_any.isna().all():  # lets us code farmers who irrigated nothing as 0
            d = fill_from(d, "irr_any", keyed(prac, pm, IRRIGATED_ANY, farmer_keys), farmer_keys)
    if d.fert.isna().all():
        fert, fm = load(find_file(year_dir, season, "fert"))
        d = fill_from(d, "fert", keyed(fert, fm, INORGANIC_FERT, plot_keys), plot_keys)

    return pd.DataFrame({
        "year": year,
        "season": season,
        "seg": d["seg"], "farmer": d["farmer"], "plot": d["plot"].astype(str),
        "province": d.province.astype(str).str.replace(r"^\d+\s*[-.]?\s*", "", regex=True).str.strip().str.title(),
        "district": clean_district(d.district),
        "small": d.ftype.astype(str).str.lower().str.contains("small").astype(int),
        "crop": d.crop.astype(str).str.strip(),
        "ha": pd.to_numeric(d.area, errors="coerce") / 1e4,  # survey records m²
        "kg": pd.to_numeric(d.kg, errors="coerce"),
        "price": pd.to_numeric(d.price, errors="coerce"),
        "ncrop": pd.to_numeric(d.ncrop, errors="coerce"),
        "irrigated": irrigated_flag(d.irr, d.irr_any),
        "fert_used": yes(d.fert).astype(int),
        "iseed": yes(d.seed).astype(int),
        "w": pd.to_numeric(d.w, errors="coerce"),
    })[COLUMNS]


def harmonize_all(raw: Path = RAW) -> pd.DataFrame:
    return pd.concat([harmonize_season(y, s, raw) for y in YEARS for s in SEASONS], ignore_index=True)
