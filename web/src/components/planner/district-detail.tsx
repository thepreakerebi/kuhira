"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { FACTORS } from "@/components/planner/weight-controls";
import { formatNumber, formatPct, formatRwf, formatSignedPct } from "@/lib/format";
import type { Crop, District, RankedDistrict } from "@/lib/types";

type Props = { district: District; ranked: RankedDistrict; crops: Map<string, Crop> };

function counted(crop?: Crop): number {
  return crop?.bonus_pct != null && crop.p_value != null && crop.p_value < 0.05 ? crop.bonus_pct : 0;
}

export function BonusBadge({ crop }: { crop?: Crop }) {
  const b = counted(crop);
  if (b === 0) return <Badge variant="outline" className="text-muted-foreground">no clear effect</Badge>;
  return (
    <Badge className={b > 0 ? "bg-secondary text-secondary-foreground" : "bg-clay/10 text-clay"}>
      {formatSignedPct(b)} with water
    </Badge>
  );
}

export function DistrictDetail({ district, ranked, crops }: Props) {
  const reduce = useReducedMotion();
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
            {district.province} · rank <strong className="text-foreground">#{ranked.rank}</strong> · score{" "}
            <strong className="text-foreground">{ranked.score}</strong>
          </p>
        </header>

        <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-x-4 gap-y-3 text-sm">
          {[
            ["Gain per irrigated ha", `${formatRwf(ranked.gain_rwf_per_ha)} / season`],
            ["Already irrigated", formatPct(district.irrigated_share, 1)],
            ["June–Aug rain", `${formatNumber(district.dry_season_mm)} mm`],
            ["Poverty rate", `${district.poverty_rate_pct.toFixed(1)}%`],
          ].map(([k, v]) => (
            <section key={k} className="grid gap-0.5">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="font-mono tabular-nums">{v}</dd>
            </section>
          ))}
        </dl>

        <section className="grid gap-2">
          <h4 className="text-sm font-semibold">Score build-up</h4>
          <ul className="grid gap-1.5">
            {FACTORS.map((f) => (
              <li key={f.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-xs">
                <strong className="font-normal text-muted-foreground">{f.label}</strong>
                <meter min={0} max={1} value={ranked.factors[f.key]} className="kuhira-meter h-2 w-full" />
                <data value={ranked.factors[f.key]} className="text-right font-mono tabular-nums">
                  {Math.round(ranked.factors[f.key] * 100)}
                </data>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-2">
          <h4 className="text-sm font-semibold">What small farmers grow here</h4>
          <ul className="grid gap-2">
            {district.crops.slice(0, 6).map((c) => (
              <li key={c.crop} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                <strong className="font-medium">{c.crop}</strong>
                <BonusBadge crop={crops.get(c.crop)} />
                <meter min={0} max={1} value={c.share} className="kuhira-meter col-span-2 h-1.5 w-full" aria-label={`${c.crop} share`} />
                <small className="col-span-2 text-xs text-muted-foreground">
                  {formatPct(c.share)} of crop area · {formatNumber(c.yield_kg_per_ha)} kg/ha rain-fed
                </small>
              </li>
            ))}
          </ul>
        </section>
      </motion.article>
    </AnimatePresence>
  );
}
