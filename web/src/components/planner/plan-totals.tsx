"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { stagger } from "@/components/motion/stagger";
import { formatNumber, formatRwf } from "@/lib/format";
import { type Lang, messages } from "@/lib/i18n";
import type { Plan } from "@/lib/types";

const ha = (n: number) => `${formatNumber(n)} ha`;

export function PlanTotals({ lang, totals }: { lang: Lang; totals: Plan["allocation"]["totals"] }) {
  const t = messages[lang].planner.totals;
  const items = [
    [t.hectares, totals.hectares, ha],
    [t.public, totals.public_cost_rwf, formatRwf],
    [t.farmers, totals.farmer_cost_rwf, formatRwf],
    [t.harvest, totals.extra_value_rwf_per_year, formatRwf],
  ] as const;
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3">
      {items.map(([[label, note], value, format], i) => (
        <section key={label} style={stagger(i)} className="kuhira-rise grid gap-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="font-heading text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] font-semibold tabular-nums">
            <AnimatedNumber value={value} format={format} />
          </dd>
          <dd className="text-xs text-muted-foreground">{note}</dd>
        </section>
      ))}
    </dl>
  );
}
