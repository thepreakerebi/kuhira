import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BonusChart } from "@/components/method/bonus-chart";
import { stagger } from "@/components/motion/stagger";
import { flushTable, shell } from "@/components/site/page-shell";
import { getDefaultPlan, getStaticData } from "@/lib/api";
import { formatNumber, formatRwf } from "@/lib/format";
import { isLang, langOrNotFound, messages } from "@/lib/i18n";
import type { WeightKey } from "@/lib/types";

type Props = PageProps<"/[lang]/method">;

const prose = "grid max-w-3xl gap-3 text-[clamp(1rem,0.96rem+0.2vw,1.1rem)] leading-relaxed";
const h2 = "text-[clamp(1.4rem,1.1rem+1.2vw,2rem)] font-semibold";
const FACTOR_KEYS: WeightKey[] = ["gain", "gap", "dryness", "poverty"];

// Names and links stay as published; what each source gives comes from the language catalogue (same order).
const SOURCES = [
  ["NISR Seasonal Agricultural Survey 2020–2025 (public-use microdata)", "https://microdata.statistics.gov.rw/"],
  ["NISR EICV7 Main Indicators Report (2023/24), Table A9.23", "https://www.statistics.gov.rw/"],
  ["CHIRPS v2.0 monthly rainfall, UCSB Climate Hazards Center", "https://www.chc.ucsb.edu/data/chirps"],
  ["geoBoundaries RWA ADM2 (CC BY 4.0)", "https://www.geoboundaries.org/"],
  ["MINAGRI Annual Report FY2024/25; PSTA5", "https://www.minagri.gov.rw/"],
  ["World Bank SAIP II Project Appraisal Document (2023), pp. 19–20", "https://documents.worldbank.org/"],
  ["DWFI (2022), Small-scale irrigation in Rwanda, p. 16; RAB via DWFI (2019)", "https://waterforfood.nebraska.edu/"],
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: messages[isLang(lang) ? lang : "en"].method.metaTitle };
}

async function MethodContent({ params }: { params: Props["params"] }) {
  const lang = langOrNotFound((await params).lang);
  const m = messages[lang];
  const t = m.method;
  const { crops, defaults } = await getStaticData();
  const plan = await getDefaultPlan(defaults);
  const dryYears = Object.values(defaults.season_c.uptake_by_year).map((v) => Math.round(v * 100));
  const beans = crops.find((c) => c.crop === "Beans")!;
  return (
    <section lang={lang} className="grid gap-[clamp(2rem,5vw,3.5rem)]">
      <header className="kuhira-rise grid max-w-3xl gap-3">
        <p className="font-mono text-xs font-medium tracking-widest text-primary-strong uppercase">{t.eyebrow}</p>
        <h1 className="text-[clamp(1.9rem,1.2rem+3vw,3.2rem)] leading-tight font-bold">{t.title}</h1>
        <p className="text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">{t.intro}</p>
      </header>

      <section style={stagger(1)} className="kuhira-rise grid gap-3">
        <h2 className={h2}>{t.why}</h2>
        <p className={prose}>{t.whyBody}</p>
        <small className="text-sm text-muted-foreground">{t.whySource}</small>
      </section>

      <section style={stagger(2)} className="kuhira-rise grid gap-5">
        <h2 className={h2}>{t.s1}</h2>
        <p className={prose}>{t.s1Body}</p>
        <BonusChart lang={lang} crops={crops} />
        <aside className="grid max-w-3xl gap-1 border-l-4 border-clay pl-4">
          <h3 className="text-base font-semibold text-clay">{t.beansTitle(Math.abs(beans.bonus_pct!).toFixed(0))}</h3>
          <p className="text-sm text-muted-foreground">{t.beansBody(beans.ci_low_pct!, beans.ci_high_pct!)}</p>
        </aside>
      </section>

      <section style={stagger(3)} className="kuhira-rise grid gap-3">
        <h2 className={h2}>{t.dry}</h2>
        <p className={prose}>
          {t.dryBody(
            formatRwf(defaults.season_c.value_rwf_per_ha),
            Math.round(defaults.season_c.uptake * 100),
            Math.min(...dryYears),
            Math.max(...dryYears),
          )}
        </p>
      </section>

      <section style={stagger(4)} className="kuhira-rise grid gap-5">
        <h2 className={h2}>{t.s2}</h2>
        <Table className={`${flushTable} [&_td]:align-top [&_td]:whitespace-normal [&_th]:whitespace-normal`}>
          <TableHeader>
            <TableRow>
              <TableHead>{t.tableHead[0]}</TableHead>
              <TableHead>{t.tableHead[1]}</TableHead>
              <TableHead className="text-right">{t.tableHead[2]}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {FACTOR_KEYS.map((k) => (
              <TableRow key={k}>
                <TableCell className="font-medium">{m.planner.factors[k].label}</TableCell>
                <TableCell>{t.measures[k]}</TableCell>
                <TableCell className="text-right font-mono">{Math.round(defaults.weights[k] * 100)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className={prose}>
          {t.s2Body(
            formatNumber(defaults.remaining_ha),
            formatRwf(defaults.cost_per_ha_rwf),
            defaults.subsidy_regular * 100,
            formatRwf(defaults.remaining_ha * defaults.cost_per_ha_rwf * defaults.subsidy_regular),
          )}
        </p>
      </section>

      <section style={stagger(5)} className="kuhira-rise grid gap-4">
        <h2 className={h2}>{t.sure}</h2>
        <p className={prose}>{t.sureBody}</p>
        <Table className={`${flushTable} max-w-3xl`}>
          <TableHeader>
            <TableRow>
              {t.sureHead.map((h, i) => (
                <TableHead key={h} className={i > 1 ? "text-right" : undefined}>
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {plan.ranking.slice(0, 5).map((r) => (
              <TableRow key={r.district}>
                <TableCell className="font-mono">{r.rank}</TableCell>
                <TableCell className="font-medium">{r.district}</TableCell>
                <TableCell className="text-right font-mono">
                  {r.rank_low}–{r.rank_high}
                </TableCell>
                <TableCell className="text-right font-mono">{Math.round(r.top_share * 100)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section style={stagger(6)} className="kuhira-rise grid gap-4">
        <h2 className={h2}>{t.s3}</h2>
        <ul className={`${prose} list-disc pl-5`}>
          {t.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>

      <section style={stagger(7)} className="kuhira-rise grid gap-4">
        <h2 className={h2}>{t.s4}</h2>
        <ul className="grid max-w-3xl gap-3">
          {SOURCES.map(([name, href], i) => (
            <li key={name} className="grid gap-0.5">
              <a href={href} className="font-medium text-water underline underline-offset-4" target="_blank" rel="noreferrer">
                {name}
              </a>
              <small className="text-sm text-muted-foreground">{t.sources[i]}</small>
            </li>
          ))}
        </ul>
        <p className="max-w-3xl text-sm text-muted-foreground">{t.reproduce}</p>
      </section>
    </section>
  );
}

export default function MethodPage({ params }: Props) {
  return (
    <section className={`${shell} py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <Suspense
        fallback={
          <section className="grid gap-4" aria-hidden>
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-72 w-full max-w-3xl rounded-xl" />
          </section>
        }
      >
        <MethodContent params={params} />
      </Suspense>
    </section>
  );
}
