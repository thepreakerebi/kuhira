import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BonusChart } from "@/components/method/bonus-chart";
import { flushTable, shell } from "@/components/site/page-shell";
import { getStaticData } from "@/lib/api";
import { formatNumber, formatRwf } from "@/lib/format";

export const metadata: Metadata = { title: "Method" };

const prose = "grid max-w-3xl gap-3 text-[clamp(1rem,0.96rem+0.2vw,1.1rem)] leading-relaxed";
const h2 = "text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] font-semibold";

const SOURCES = [
  ["NISR Seasonal Agricultural Survey 2020–2025 (public-use microdata)", "https://microdata.statistics.gov.rw/", "Plot-level crops, harvest, area, irrigation, fertilizer, seed, prices. Seasons A and B, 12 seasons, ~450,000 crop-plot records."],
  ["NISR EICV7 Main Indicators Report (2023/24), Table A9.23", "https://www.statistics.gov.rw/", "District poverty rates."],
  ["CHIRPS v2.0 monthly rainfall, UCSB Climate Hazards Center", "https://www.chc.ucsb.edu/data/chirps", "About 5 km grid, January 1995 to August 2026."],
  ["geoBoundaries RWA ADM2 (CC BY 4.0)", "https://www.geoboundaries.org/", "District outlines."],
  ["MINAGRI Annual Report FY2024/25; PSTA5", "https://www.minagri.gov.rw/", "SSIT target (41,031 ha by 2028/29), hectares built (27,663) and last year's pace (1,462 ha)."],
  ["World Bank SAIP II Project Appraisal Document (2023), pp. 19–20", "https://documents.worldbank.org/", "Subsidy: 50% regular, up to 75% for solar kits."],
  ["DWFI (2022), Small-scale irrigation in Rwanda, p. 16; RAB via DWFI (2019)", "https://waterforfood.nebraska.edu/", "Kit prices and the ~$1,500 per hectare cost."],
];

const LIMITS = [
  "The water bonus compares farmers who irrigate with those who do not. Fixed effects and input controls remove the obvious differences, but irrigating farmers may still differ in skill, soil or water access. Read it as the gain an irrigating smallholder typically sees, not a controlled experiment.",
  "The survey's finest geography is the district, so the bonus is estimated per crop and carried to districts through what they grow. Districts do not get their own bonus: some have only about ten irrigated plots.",
  "The bean penalty is negative on average but flat in 2022–23, so treat its size with care.",
  "Gains count Seasons A and B on today's crops only. Season C harvests that irrigation makes possible, and switching to vegetables, are left out, so money gains are a floor.",
  "Kit cost per hectare is a 2019 figure until the district officers' current quote replaces it. Prices are national medians from the survey.",
];

async function MethodData() {
  const { crops, defaults } = await getStaticData();
  const beans = crops.find((c) => c.crop === "Beans")!;
  return (
    <>
      <section className="grid gap-5">
        <h2 className={h2}>1 · The water bonus, measured</h2>
        <section className={prose}>
          <p>
            For each crop we compare irrigated and rain-fed plots <strong>of the same crop, in the same district and the
            same season</strong>, so local rain, prices and pests cancel out. The model also holds fertilizer, improved
            seed, plot size and the number of crops on the plot fixed. Small farmers only; errors clustered by survey
            segment.
          </p>
        </section>
        <BonusChart crops={crops} />
        <aside className="grid max-w-3xl gap-1 border-l-4 border-clay pl-4">
          <h3 className="text-base font-semibold text-clay">Beans lose {Math.abs(beans.bonus_pct!).toFixed(0)}% with water</h3>
          <p className="text-sm text-muted-foreground">
            Irrigated bean plots harvest less than rain-fed ones (95% interval {beans.ci_low_pct}% to{" "}
            {beans.ci_high_pct}%). A likely reason: irrigated plots sit in valley bottoms, where beans suffer from waterlogging and disease.
            Counting this halves the water gain of bean-heavy Ngoma, so Kuhira does not reward districts just for
            having farmland.
          </p>
        </aside>
      </section>

      <section className="grid gap-5">
        <h2 className={h2}>2 · From crops to a district score</h2>
        <Table className={`${flushTable} [&_td]:align-top [&_td]:whitespace-normal [&_th]:whitespace-normal`}>
          <TableHeader>
            <TableRow>
              <TableHead>Factor</TableHead>
              <TableHead>Measure</TableHead>
              <TableHead className="text-right">Default weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["Water gain", "Σ crop share × rain-fed yield × water bonus × farm-gate price, per irrigated ha", defaults.weights.gain],
              ["Adoption gap", "1 − share of small-farm land already irrigated (SAS 2023–25)", defaults.weights.gap],
              ["Dryness", "Average June–August rain, 1995–2025 (less rain scores higher)", defaults.weights.dryness],
              ["Poverty", "EICV7 district poverty rate", defaults.weights.poverty],
            ].map(([f, m, w]) => (
              <TableRow key={f as string}>
                <TableCell className="font-medium">{f}</TableCell>
                <TableCell className="whitespace-normal">{m}</TableCell>
                <TableCell className="text-right font-mono">{Math.round((w as number) * 100)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <section className={prose}>
          <p>
            Each factor is rescaled 0–1 across the 30 districts and weighted into a 0–100 score. Only bonuses that are
            clearly different from zero (p &lt; 0.05) count; the rest count as zero. Hectares are then split in
            proportion to score × small-farm cropland. With the default {formatNumber(defaults.remaining_ha)} ha at{" "}
            {formatRwf(defaults.cost_per_ha_rwf)} per hectare and a {defaults.subsidy_regular * 100}% subsidy, the
            public share is about {formatRwf(defaults.remaining_ha * defaults.cost_per_ha_rwf * defaults.subsidy_regular)}.
          </p>
        </section>
      </section>

      <section className="grid gap-4">
        <h2 className={h2}>3 · What this cannot tell you</h2>
        <ul className={`${prose} list-disc pl-5`}>
          {LIMITS.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4">
        <h2 className={h2}>4 · Data</h2>
        <ul className="grid max-w-3xl gap-3">
          {SOURCES.map(([name, href, what]) => (
            <li key={name} className="grid gap-0.5">
              <a href={href} className="font-medium text-water underline underline-offset-4" target="_blank" rel="noreferrer">
                {name}
              </a>
              <small className="text-sm text-muted-foreground">{what}</small>
            </li>
          ))}
        </ul>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The survey microdata cannot be redistributed, so the repository holds only the aggregates the app serves.
          Every number here is reproducible from the five notebooks in <code>notebooks/</code> once the public-use files
          are downloaded from NISR.
        </p>
      </section>
    </>
  );
}

export default function MethodPage() {
  return (
    <article className={`${shell} grid gap-[clamp(2rem,5vw,3.5rem)] py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <header className="grid max-w-3xl gap-3">
        <p className="font-mono text-xs font-medium tracking-widest text-primary-strong uppercase">Method</p>
        <h1 className="text-[clamp(1.9rem,1.2rem+3vw,3.2rem)] leading-tight font-bold">How Kuhira decides</h1>
        <p className="text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">
          One question drives everything: on the crops small farmers already grow, how much more does a plot yield
          when it gets water?
        </p>
      </header>
      <Suspense
        fallback={
          <section className="grid gap-4" aria-hidden>
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-72 w-full max-w-3xl rounded-xl" />
          </section>
        }
      >
        <MethodData />
      </Suspense>
    </article>
  );
}
