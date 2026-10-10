"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { FACTOR_KEYS } from "@/components/planner/weight-controls";
import { formatNumber, formatPct, formatRwf, formatSignedPct } from "@/lib/format";
import { cropName, type Lang, messages } from "@/lib/i18n";
import type { Crop, District, RankedDistrict } from "@/lib/types";

type Props = { lang: Lang; district: District; ranked: RankedDistrict; crops: Map<string, Crop> };

function counted(crop?: Crop): number {
  return crop?.bonus_pct != null && crop.p_value != null && crop.p_value < 0.05 ? crop.bonus_pct : 0;
}

function BonusBadge({ lang, crop }: { lang: Lang; crop?: Crop }) {
  const t = messages[lang].planner;
  const b = counted(crop);
  if (b === 0) return <Badge variant="outline" className="text-muted-foreground">{t.noEffect}</Badge>;
  return (
    <Badge className={b > 0 ? "bg-secondary text-secondary-foreground" : "bg-clay/10 text-clay"}>
      {formatSignedPct(b)} {t.withWater}
    </Badge>
  );
}

export function DistrictDetail({ lang, district, ranked, crops }: Props) {
  const reduce = useReducedMotion();
  const t = messages[lang].planner;
  const stats = [
    [t.stats.gain, `${formatRwf(ranked.gain_rwf_per_ha)} ${t.perSeason}`],
    [t.stats.irrigated, formatPct(district.irrigated_share, 1)],
    [t.stats.rain, `${formatNumber(district.dry_season_mm)} mm`],
    [t.stats.poverty, `${district.poverty_rate_pct.toFixed(1)}%`],
  ];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={district.district}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="grid gap-5"
        aria-live="polite"
      >
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-2xl font-semibold">{district.district}</h3>
          <p className="text-sm text-muted-foreground">
            {district.province} · {t.rank} <strong className="text-foreground">#{ranked.rank}</strong> · {t.score}{" "}
            <strong className="text-foreground">{ranked.score}</strong>
          </p>
        </header>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-x-4 gap-y-3 text-sm">
          {stats.map(([k, v]) => (
            <section key={k} className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-mono tabular-nums">{v}</dd>
            </section>
          ))}
        </dl>

        <section className="grid gap-2">
          <h4 className="text-sm font-semibold">{t.buildUp}</h4>
          <ul className="grid gap-1.5">
            {FACTOR_KEYS.map((k) => (
              <li key={k} className="grid grid-cols-[minmax(6rem,8rem)_1fr_2.5rem] items-center gap-3 text-xs">
                <strong className="font-normal text-muted-foreground">{t.factors[k].label}</strong>
                <meter min={0} max={1} value={ranked.factors[k]} className="kuhira-meter h-2 w-full" />
                <data value={ranked.factors[k]} className="text-right font-mono tabular-nums">
                  {Math.round(ranked.factors[k] * 100)}
                </data>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-2">
          <h4 className="text-sm font-semibold">{t.grows}</h4>
          <ul className="grid gap-2">
            {district.crops.slice(0, 6).map((c) => (
              <li key={c.crop} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                <strong className="font-medium">{cropName(lang, c.crop)}</strong>
                <BonusBadge lang={lang} crop={crops.get(c.crop)} />
                <meter min={0} max={1} value={c.share} className="kuhira-meter col-span-2 h-1.5 w-full"
                  aria-label={cropName(lang, c.crop)} />
                <small className="col-span-2 text-xs text-muted-foreground">
                  {t.cropShare(formatPct(c.share), formatNumber(c.yield_kg_per_ha))}
                </small>
              </li>
            ))}
          </ul>
        </section>
      </motion.article>
    </AnimatePresence>
  );
}
