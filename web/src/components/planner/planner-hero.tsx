import { formatNumber } from "@/lib/format";
import type { Defaults } from "@/lib/types";

const PACE_HA_PER_YEAR = 1_462; // SSIT hectares added in FY2024/25 (MINAGRI annual report, p. 19)

export function PlannerHero({ defaults }: { defaults: Defaults }) {
  const years = Math.ceil(defaults.remaining_ha / PACE_HA_PER_YEAR);
  const built = defaults.actual_ha / defaults.target_ha;
  return (
    <header className="grid gap-4">
      <p className="font-mono text-xs font-medium tracking-widest text-primary-strong uppercase">
        Small-scale irrigation planner
      </p>
      <h1 className="max-w-4xl text-[clamp(1.9rem,1.2rem+3vw,3.4rem)] leading-[1.05] font-bold">
        Where should Rwanda&apos;s next {formatNumber(defaults.remaining_ha)} irrigated hectares go?
      </h1>
      <p className="max-w-3xl text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">
        Kuhira ranks the 30 districts by how much a hectare of water would add to what small farmers there actually
        grow, how little is irrigated today, how dry June to August is, and how poor the district is. Move the
        weights to see how the plan changes.
      </p>
      <figure className="grid max-w-3xl gap-2">
        <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-3 w-full" role="img"
          aria-label={`${Math.round(built * 100)}% of the PSTA5 target is built`}>
          <rect width="100" height="6" rx="3" fill="#efeee6" />
          <rect width={built * 100} height="6" rx="3" fill="#c3d898" />
        </svg>
        <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <small>
            <strong className="text-foreground">{formatNumber(defaults.actual_ha)} ha</strong> built of{" "}
            {formatNumber(defaults.target_ha)} ha (PSTA5, 2028/29)
          </small>
          <small>
            At last year&apos;s pace of {formatNumber(PACE_HA_PER_YEAR)} ha, about{" "}
            <strong className="text-foreground">{years} years</strong> to go
          </small>
        </figcaption>
      </figure>
    </header>
  );
}
