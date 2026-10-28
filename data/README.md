# Data

Everything Kuhira uses, where it lives in this repository, and where it comes from.

## In this repository

| File | What it holds | Source |
|---|---|---|
| `processed/districts.csv` | One row per district: province, small-farm cropland (ha), share already irrigated, June–August rain (mm), poverty rate (%) | Built from the survey, CHIRPS and EICV7 below (notebooks 01–06) |
| `processed/district_crops.csv` | Each district's crop mix: share of crop area and rain-fed yield (kg/ha) per crop | Survey, notebook 06 |
| `processed/crops.csv` | Per crop: water bonus (%), 95% interval, p-value, plot counts, farm-gate price (RWF/kg), national rain-fed yield | Survey, notebooks 03 and 06 |
| `processed/districts.json`, `crops.json`, `season_c.json` | The same aggregates, plus the dry-season (Season C) figures, in the form the API serves | Survey, notebooks 05 and 06 |
| `external/eicv7_district_poverty.csv` | District poverty rates, 2023/24 | [NISR EICV7 Main Indicators Report](https://www.statistics.gov.rw/sites/default/files/documents/2025-07/EICV7_Main%20Indicator%20Report.pdf), Table A9.23 |
| `external/chirps/rwa/*.tif` | Monthly rainfall grids for Rwanda, January 1995 to August 2026 (380 files, 4.5 MB) | [CHIRPS v2.0, UCSB Climate Hazards Center](https://www.chc.ucsb.edu/data/chirps); refresh with `scripts/fetch_chirps.py` |
| `external/boundaries/rwa_ADM2_simplified.geojson` | District outlines | [geoBoundaries RWA ADM2](https://www.geoboundaries.org/) (CC BY 4.0) |

The CSV and JSON files hold aggregates only, the level NISR's public-use terms allow us to publish.

## Not in this repository: the survey microdata

The analysis starts from the **NISR Seasonal Agricultural Survey (SAS)** public-use microdata, Seasons A, B and C.
These files are **not included**: NISR's terms do not allow redistributing them, and together they are about 2.9 GB.

| Year | Download page |
|---|---|
| 2020 | <https://microdata.statistics.gov.rw/index.php/catalog/99> |
| 2021 | <https://microdata.statistics.gov.rw/index.php/catalog/102> |
| 2022 | <https://microdata.statistics.gov.rw/index.php/catalog/103> |
| 2023 | <https://microdata.statistics.gov.rw/index.php/catalog/111> |
| 2024 | <https://microdata.statistics.gov.rw/index.php/catalog/113> |
| 2025 | <https://microdata.statistics.gov.rw/index.php/catalog/124> |

2019 ([catalog 93](https://microdata.statistics.gov.rw/index.php/catalog/93)) was downloaded but not used: its files
carry no farmer ID or plot area.

**To rebuild from scratch:** register at the microdata portal, open each page above, click "Get Microdata", submit
the access request (public-use data is granted at once), and unzip each year into `data/raw/sas<year>/`, for example
`data/raw/sas2025/`. Then run the notebooks in `notebooks/` in order (01 to 06). They write `data/interim/` (also
not committed) and regenerate everything in `processed/`.
