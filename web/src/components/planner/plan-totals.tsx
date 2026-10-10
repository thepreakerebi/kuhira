import { formatNumber, formatRwf } from "@/lib/format";
import type { Plan } from "@/lib/types";

export function PlanTotals({ totals }: { totals: Plan["allocation"]["totals"] }) {
  const items = [
    ["Hectares placed", `${formatNumber(totals.hectares)} ha`, "Across all 30 districts."],
    ["Public cost", formatRwf(totals.public_cost_rwf), "Subsidy share of the kits."],
    ["Farmers' share", formatRwf(totals.farmer_cost_rwf), "What farmers pay themselves."],
    ["Extra harvest a year", formatRwf(totals.extra_value_rwf_per_year), "Yield gain only, Seasons A and B. A floor."],
  ];
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3">
      {items.map(([k, v, note]) => (
        <section key={k} className="grid gap-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <dt className="text-sm text-muted-foreground">{k}</dt>
          <dd className="font-heading text-[clamp(1.4rem,1.1rem+1vw,1.9rem)] font-semibold tabular-nums">{v}</dd>
          <dd className="text-xs text-muted-foreground">{note}</dd>
        </section>
      ))}
    </dl>
  );
}
