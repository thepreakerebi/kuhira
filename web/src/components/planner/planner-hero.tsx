import { formatNumber } from "@/lib/format";
import { type Lang, messages } from "@/lib/i18n";
import type { Defaults } from "@/lib/types";

const PACE_HA_PER_YEAR = 1_462; // SSIT hectares added in FY2024/25 (MINAGRI annual report, p. 19)

export function PlannerHero({ lang, defaults }: { lang: Lang; defaults: Defaults }) {
  const t = messages[lang].planner;
  const years = Math.ceil(defaults.remaining_ha / PACE_HA_PER_YEAR);
  const built = defaults.actual_ha / defaults.target_ha;
  return (
    <header className="grid gap-4">
      <p className="font-mono text-xs font-medium tracking-widest text-primary-strong uppercase">{t.eyebrow}</p>
      <h1 className="max-w-4xl text-[clamp(1.9rem,1.2rem+3vw,3.4rem)] leading-[1.05] font-bold">
        {t.title(defaults.remaining_ha)}
      </h1>
      <p className="max-w-3xl text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">{t.intro}</p>
      <figure className="grid max-w-3xl gap-2">
        <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-3 w-full" role="img"
          aria-label={t.builtAria(Math.round(built * 100))}>
          <rect width="100" height="6" rx="3" fill="#efeee6" />
          <rect width={built * 100} height="6" rx="3" fill="#c3d898" className="kuhira-grow" />
        </svg>
        <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <small>
            <strong className="text-foreground">{formatNumber(defaults.actual_ha)} ha</strong> {t.builtOf(defaults.target_ha)}
          </small>
          <small>
            {t.pace(PACE_HA_PER_YEAR)} <strong className="text-foreground">{t.years(years)}</strong> {t.toGo}
          </small>
        </figcaption>
      </figure>
    </header>
  );
}
