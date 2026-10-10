"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DistrictDetail } from "@/components/planner/district-detail";
import { DistrictMap } from "@/components/planner/district-map";
import { formatNumber, formatRwf } from "@/lib/format";
import { type Lang, messages } from "@/lib/i18n";
import type { Allocation, Crop, District, DistrictShape, RankedDistrict } from "@/lib/types";

type Props = {
  lang: Lang;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string;
  onSelect: (district: string) => void;
  order: Allocation[];
  ranking: Map<string, RankedDistrict>;
  districts: Map<string, District>;
  crops: Map<string, Crop>;
  shapes: DistrictShape[];
};

/** District details opened from the ranking table, so the result shows up where the user is looking. */
export function DistrictSheet({ lang, open, onOpenChange, selected, onSelect, order, ranking, districts, crops, shapes }: Props) {
  const t = messages[lang].planner;
  const index = order.findIndex((a) => a.district === selected);
  const row = order[index];
  const ranked = ranking.get(selected);
  const district = districts.get(selected);
  if (!row || !ranked || !district) return null;
  const step = (by: number) => onSelect(order[index + by].district);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        closeLabel={t.sheet.close}
        onCloseAutoFocus={(e) => {
          // Back to the row of the district last shown, which stepping may have changed.
          e.preventDefault();
          document.querySelector<HTMLElement>(`[data-district-row="${selected}"]`)?.focus();
        }}
        className="gap-0 p-0 data-[side=right]:w-[min(100vw,30rem)] data-[side=right]:sm:max-w-none"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="font-heading text-2xl">{district.district}</SheetTitle>
          <SheetDescription>
            {district.province} · {t.rank} <strong className="text-foreground">#{ranked.rank}</strong> · {t.score}{" "}
            <strong className="text-foreground">{ranked.score}</strong>
          </SheetDescription>
        </SheetHeader>

        <section className="grid min-h-0 flex-1 content-start gap-6 overflow-y-auto overscroll-y-contain p-4">
          <section className="mx-auto w-full max-w-64">
            <DistrictMap lang={lang} compact shapes={shapes} ranking={ranking} selected={selected} onSelect={onSelect} />
          </section>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            {[
              [t.columns.hectares, formatNumber(row.hectares)],
              [t.columns.publicCost, formatRwf(row.public_cost_rwf)],
              [t.columns.harvest, formatRwf(row.extra_value_rwf_per_year)],
            ].map(([k, v]) => (
              <section key={k} className="grid content-start gap-0.5">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-mono font-medium tabular-nums">{v}</dd>
              </section>
            ))}
          </dl>
          <DistrictDetail lang={lang} showHeader={false} district={district} ranked={ranked} crops={crops} />
        </section>

        <SheetFooter className="flex-row items-center justify-between border-t">
          <Button variant="outline" onClick={() => step(-1)} disabled={index === 0}>
            <ChevronLeft aria-hidden />
            {t.sheet.previous}
          </Button>
          <small className="font-mono text-xs text-muted-foreground tabular-nums">
            {t.sheet.position(index + 1, order.length)}
          </small>
          <Button variant="outline" onClick={() => step(1)} disabled={index === order.length - 1}>
            {t.sheet.next}
            <ChevronRight aria-hidden />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
