# Kuhira

**Where should Rwanda's next small-scale irrigation hectares go?**

NISR Big Data Hackathon 2026 · Track 1: Agricultural Productivity · Team: Elvis Preye Kerebi and Paulette Dushime

| Submission | Link |
|---|---|
| Deployed app (public, no login) | <https://kuhira.vercel.app> · farmer calculator in Kinyarwanda: <https://kuhira.vercel.app/rw/farmer> |
| Demo video (2 min 4 s) | [`demo/Dataduo-video-demo.webm`](demo/Dataduo-video-demo.webm) |
| Data used, and links to it | [`data/README.md`](data/README.md) · CSVs in [`data/processed/`](data/processed/) |
| Code | [`notebooks/`](notebooks/) (analysis) · [`src/kuhira/`](src/kuhira/) (pipeline and API) · [`web/`](web/) (app) |
| Documentation | this README · the app's [Method page](https://kuhira.vercel.app/en/method) · [declaration](docs/DECLARATION.md) · [references](docs/REFERENCES.md) · [AI use](docs/AI_USE.md) |
| API | <https://kuhira-api.onrender.com/docs> |

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

Built for the **NISR Big Data Hackathon 2026, Track 1: Agricultural Productivity**, whose hints list small-scale
irrigation first. NST2 tracks "area under irrigation" under its Economic Transformation pillar: in FY2024/25 it
reached 74,375 ha against a target of 76,686 ha, and bean yields missed their target too (0.7 against 0.8 t/ha)
(MINAGRI Annual Report FY2024/25, Annex 8).

## What it tells you

One message: **put the next irrigation kits where water adds the most to what small farmers already grow, and
where people are dry, poor and not yet irrigating.** Not every district gains equally. Water raises vegetable, maize
and sweet potato harvests, but irrigated beans do worse, so a bean-heavy district gains less from a kit than its
farmland suggests. And most of irrigation's value comes in the June–August dry season, when only watered land can
grow anything.

The app turns NISR's survey into three things a person can act on:

- **For planners:** a ranking of the 30 districts, a map, and how the remaining 13,368 ha, the public cost and the
  extra harvest would split between them, with how firmly each district holds its rank.
- **For farmers:** what irrigating their own plot is worth, what the kit costs after the subsidy, and how many
  seasons until it pays for itself.
- **For anyone checking the work:** the Method page, with every estimate, its error margin and its source.

## How to use it

No account or login is needed. Every page works in English and Kinyarwanda: use the **EN / RW** switch at the top
right.

**Planner** (<https://kuhira.vercel.app/en>)

1. **"What matters most?"** Four sliders set how much each reason counts: water gain, adoption gap, dryness and
   poverty. The map, ranking and totals update as you move them. Try dryness only: the dry east (Kirehe) goes to the
   top.
2. **The budget.** Change the hectares to place, the kit cost per hectare, the share of kit land farmed in the dry
   season, and the subsidy (50% regular or 75% solar).
3. **The map.** Darker green is higher priority. Click a district to see why it scored that way: its gain per
   hectare, irrigation, rain, poverty, score build-up, crop mix, and how firm its rank is.
4. **The totals.** Hectares placed, public cost, farmers' share, the yield gain a year and the dry-season harvest a
   year.
5. **Ranking and hectares.** All 30 districts with their likely rank range, hectares and costs. Click any row to
   open the district's details in a side panel; Previous and Next step through the list.

**Farmer calculator** (<https://kuhira.vercel.app/rw/farmer>, opens in Kinyarwanda)

1. Choose your district (type to search), your crop and your plot size in square metres.
2. Choose your kit (treadle pump, petrol pump, or your own quote) and the subsidy, then press **Calculate**.
3. Read the extra harvest and money per season, what you pay, and when the kit pays for itself, with and without a
   dry-season crop. Beans get a warning that water lowers their harvest.

**Method** (<https://kuhira.vercel.app/en/method>): why it matters (the NST2 irrigation target), the water bonus per
crop with its error bars, the dry season, how the score is built, how sure the ranking is, the limits, and the data
sources.

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

**The dry season is where the money is.** In the survey's Season C (June–August) data, a watered hectare harvests a
median **RWF 1.57 M** (mostly vegetables and Irish potato), against RWF 30–50 thousand per hectare per season from
the A/B yield bonus. Watered Season C land equals about 43% of watered A/B land, so the default plan's 13,368 ha add
about **RWF 9 bn a year** of dry-season harvest (before seed, fertilizer and labour) on top of RWF 0.8 bn of yield gain.

**How sure is the ranking?** Re-ranking 300 times with each water bonus drawn from its uncertainty, Nyamagabe ranks
1–2 and Nyaruguru 2–4 in 90% of runs, and the top five stay in the top ten 99% of the time. The app shows every
district's range.

The full method, robustness checks and limits are in the notebooks and on the app's **Method** page.

## How it is built

```
README.md         this file
requirements.txt  Python packages (pip); pyproject.toml + uv.lock pin the same for uv
notebooks/        01 harmonize SAS · 02 EDA · 03 water bonus · 04 rainfall & poverty · 05 dry season · 06 district scores
src/kuhira/       survey harmonizer, model, aggregates, rainfall, dry season, scoring/planning, FastAPI app (api.py)
data/             README.md (sources and links) · processed/ (CSV + JSON the app uses) · external/ (CHIRPS, boundaries, EICV7)
demo/             Dataduo-video-demo.webm, the screen-recorded walkthrough
web/              the app: Next.js 16 + Tailwind CSS 4 + shadcn/ui on Bun
scripts/          fetch_chirps.py (downloads the rainfall)
tests/            pytest: unit + API      web/src/**/*.test.ts: bun unit      web/e2e: Playwright
docs/             declaration, references, AI use
```

- **Analysis:** Python, pandas, statsmodels (OLS with district × year × season fixed effects, clustered errors),
  rasterstats for CHIRPS district rainfall.
- **API:** FastAPI over the processed aggregates. Pure Python, no data-science stack at runtime.
  Endpoints: `/defaults`, `/crops`, `/districts`, `/boundaries`, `POST /plan`, `POST /farmer`.
- **Web:** server components fetch and cache the static data and project the map with d3-geo on the server.
  Weight changes call the API. Light theme, semantic HTML and fluid layout from 320 px up.

## Run it

Works on macOS, Linux and Windows. Needs Python 3.12 and [Bun](https://bun.sh); [uv](https://docs.astral.sh/uv/) is
optional.

```bash
uv sync                  # Python 3.12 env with every package
cd web && bun install
bun run dev              # starts the API on :8000 and the web app on :3000 together
```

Without uv, use pip:

```bash
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt && pip install -e .
uvicorn kuhira.api:app --port 8000                       # API on :8000
cd web && bun install && bun x next dev                  # app on :3000, in a second terminal
```

The app runs on the committed aggregates in `data/processed/`, so it needs no survey download. Rerunning the
notebooks needs the survey microdata; see [`data/README.md`](data/README.md).

Tests:

```bash
uv run pytest                 # 57 Python unit and API tests
cd web && bun run test        # 15 web unit tests
bun run test:e2e              # 56 Playwright tests, desktop + phone; starts the API and a production build itself
```

## Data and licences

The full list of files, with links to every source, is in [`data/README.md`](data/README.md).

| Source | Use | Licence / access |
|---|---|---|
| NISR Seasonal Agricultural Survey 2020–2025 | plots, harvest, irrigation, inputs, prices | Public-use microdata, free registration at [microdata.statistics.gov.rw](https://microdata.statistics.gov.rw/). **Not redistributed here.** |
| NISR EICV7 (2023/24), Table A9.23 | district poverty | Published report |
| CHIRPS v2.0 monthly | rainfall 1995–2026 | UCSB Climate Hazards Center, public |
| geoBoundaries RWA ADM2 | district outlines | CC BY 4.0 |
| MINAGRI annual report, PSTA5, World Bank SAIP II PAD, DWFI | targets, subsidy rules, kit prices | Published reports |

NISR's terms forbid redistributing the microdata (and it is about 2.9 GB), so `data/raw/` is git-ignored and only
aggregates are committed. The download page for each survey year, and how to rebuild everything, are in
[`data/README.md`](data/README.md).

## Deployment

Live: web on Vercel (root `web/`), API on Render free tier (`render.yaml`, Frankfurt). Both redeploy on push to
`main`. The free API sleeps after 15 idle minutes, so the first change after a pause takes up to a minute.

- API: any Python host. `uvicorn kuhira.api:app --host 0.0.0.0 --port $PORT`, with `KUHIRA_WEB_ORIGINS` set
  to the web URL.
- Web: Vercel or any Node host, root `web/`, with `NEXT_PUBLIC_KUHIRA_API_URL` set to the API URL. The build
  prerenders from the API, so deploy the API first.

## Submission documents

- [Declaration of originality](docs/DECLARATION.md)
- [References](docs/REFERENCES.md): every data source and policy figure, cited in full
- [AI use disclosure](docs/AI_USE.md)
- Intellectual property: under the competition rules, all IP in this submission is assigned to NISR.
