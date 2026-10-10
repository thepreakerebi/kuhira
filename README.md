# Kuhira

**Where should Rwanda's next small-scale irrigation hectares go?**

**Live app:** [kuhira.vercel.app](https://kuhira.vercel.app) · **API:** [kuhira-api.onrender.com](https://kuhira-api.onrender.com/docs)

*Kuhira* is Kinyarwanda for "to irrigate". Rwanda's PSTA5 plan targets 41,031 ha of small-scale irrigation
technology (SSIT) by 2028/29. By FY2024/25, 27,663 ha were in place. Last year added 1,462 ha, so at that pace the
remaining 13,368 ha take about nine years. The subsidy covers 50% of a kit (75% for solar), and nothing tells a
district which farms gain most from it.

Kuhira measures, from NISR's own survey, how much more an irrigated plot yields than a rain-fed one, crop by
crop. It then ranks the 30 districts and splits the remaining hectares between them. It has two audiences:

- **District and ministry planners.** A map and ranking with adjustable weights (water gain, adoption gap,
  dryness, poverty), plus the hectares, public cost and extra harvest per district.
- **Farmers.** A calculator, Kinyarwanda first, that shows what irrigating a plot of a given crop is worth and
  when the kit pays for itself.

Built for the **NISR Big Data Hackathon 2026, Track 1: Agricultural Productivity** (NST2 pillar: economic
transformation through agricultural productivity and resilience).

## What the data says

Small farmers, NISR Seasonal Agricultural Survey 2020–2025, Seasons A and B. Irrigated and rain-fed plots of the
same crop are compared within the same district and season:

| Crop | Yield change with water | 95% interval |
|---|---|---|
| Vegetables | **+20%** | +13% to +28% |
| Sweet potato | **+15%** | +8% to +23% |
| Maize | **+15%** | +8% to +22% |
| Irish potato | +10% (not significant) | −2% to +23% |
| Paddy rice | +9% (not significant) | −1% to +20% |
| **Beans** | **−10%** | −16% to −4% |
| Sorghum, cassava, soybean | ≈ 0 | — |

Irrigated bean plots harvest *less*. Counting that halves the water gain of bean-heavy Ngoma. A blanket
"irrigation raises yields" rule would overrate such districts.

The full method, robustness checks and limits are in the notebooks and on the app's **Method** page.

## How it is built

```
notebooks/   01 harmonize SAS · 02 EDA · 03 water bonus model · 04 rainfall & poverty · 05 district scores
src/kuhira/  survey harmonizer, model, aggregates, rainfall, scoring/planning, FastAPI app
data/        external/ (CHIRPS, boundaries, EICV7) and processed/ (aggregates the API serves)
web/         Next.js 16 + Tailwind CSS 4 + shadcn/ui on Bun
tests/       pytest: unit + API      web/src/**/*.test.ts: bun unit      web/e2e: Playwright
```

- **Analysis:** Python, pandas, statsmodels (OLS with district × year × season fixed effects, clustered errors),
  rasterstats for CHIRPS district rainfall.
- **API:** FastAPI over the processed aggregates. Pure Python, no data-science stack at runtime.
  Endpoints: `/defaults`, `/crops`, `/districts`, `/boundaries`, `POST /plan`, `POST /farmer`.
- **Web:** server components fetch and cache the static data and project the map with d3-geo on the server.
  Weight changes call the API. Light theme, semantic HTML and fluid layout from 320 px up.

## Run it

Requires [uv](https://docs.astral.sh/uv/) and [Bun](https://bun.sh).

```bash
uv sync                                          # Python 3.12 env
uv run uvicorn kuhira.api:app --port 8000        # API on :8000

cd web && bun install
NEXT_PUBLIC_KUHIRA_API_URL=http://localhost:8000 bun run dev   # web on :3000
```

Tests:

```bash
uv run pytest                 # 40 Python unit + API tests
cd web && bun run test        # unit tests
bun run test:e2e              # Playwright, desktop + phone; starts API and a production build itself
```

## Data and licences

| Source | Use | Licence / access |
|---|---|---|
| NISR Seasonal Agricultural Survey 2020–2025 | plots, harvest, irrigation, inputs, prices | Public-use microdata, free registration at [microdata.statistics.gov.rw](https://microdata.statistics.gov.rw/). **Not redistributed here.** |
| NISR EICV7 (2023/24), Table A9.23 | district poverty | Published report |
| CHIRPS v2.0 monthly | rainfall 1995–2026 | UCSB Climate Hazards Center, public |
| geoBoundaries RWA ADM2 | district outlines | CC BY 4.0 |
| MINAGRI annual report, PSTA5, World Bank SAIP II PAD, DWFI | targets, subsidy rules, kit prices | Published reports |

NISR's terms forbid redistributing the microdata, so `data/raw/` is git-ignored and only aggregates are
committed. To rebuild from scratch, download each year's SAS public-use files into `data/raw/sas<year>/`. Then run
the notebooks in order (`uv run jupyter lab`). `scripts/fetch_chirps.py` refreshes the rainfall.

## Deployment

Live: web on Vercel (root `web/`), API on Render free tier (`render.yaml`, Frankfurt). Both redeploy on push to
`main`. The free API sleeps after 15 idle minutes, so the first change after a pause takes up to a minute.

- API: any Python host. `uvicorn kuhira.api:app --host 0.0.0.0 --port $PORT`, with `KUHIRA_WEB_ORIGINS` set
  to the web URL.
- Web: Vercel or any Node host, root `web/`, with `NEXT_PUBLIC_KUHIRA_API_URL` set to the API URL. The build
  prerenders from the API, so deploy the API first.

## Declarations

- [AI use disclosure](docs/AI_USE.md)
- Intellectual property: under the hackathon rules, all IP in this submission is assigned to NISR.
