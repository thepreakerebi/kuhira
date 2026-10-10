"use client";

import { scoreColor } from "@/lib/color";
import { type Lang, messages } from "@/lib/i18n";
import { MAP_HEIGHT, MAP_WIDTH } from "@/lib/map";
import type { DistrictShape, RankedDistrict } from "@/lib/types";

type Props = {
  lang: Lang;
  shapes: DistrictShape[];
  ranking: Map<string, RankedDistrict>;
  selected: string;
  onSelect: (district: string) => void;
};

export function DistrictMap({ lang, shapes, ranking, selected, onSelect }: Props) {
  const t = messages[lang].planner;
  const chosen = shapes.find((s) => s.district === selected);
  return (
    <figure className="grid content-start gap-3">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="group"
        aria-label={t.mapAria}
        className="h-auto w-full"
      >
        {shapes.map((s) => {
          const r = ranking.get(s.district);
          return (
            <path
              key={s.district}
              d={s.d}
              role="button"
              tabIndex={0}
              aria-label={t.districtAria(s.district, r?.rank ?? 0, r?.score ?? 0)}
              aria-pressed={s.district === selected}
              fill={scoreColor(r?.score ?? 0)}
              stroke="#ffffff"
              strokeWidth={1.2}
              className="cursor-pointer outline-none transition-[fill] duration-300 hover:brightness-95 focus-visible:brightness-90"
              onClick={() => onSelect(s.district)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(s.district);
                }
              }}
            >
              <title>{`${s.district} · #${r?.rank} · ${r?.score}`}</title>
            </path>
          );
        })}
        {chosen ? <path d={chosen.d} fill="none" stroke="#1c2b1e" strokeWidth={2.5} pointerEvents="none" /> : null}
      </svg>
      <figcaption className="grid gap-1.5 text-xs text-muted-foreground">
        <svg viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden className="h-2.5 w-full max-w-xs rounded-full">
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={i * 5} width={5.2} height={4} fill={scoreColor(i * 5 + 2.5)} />
          ))}
        </svg>
        <p className="flex max-w-xs justify-between">
          <small>{t.lower}</small>
          <small>{t.higher}</small>
        </p>
      </figcaption>
    </figure>
  );
}
