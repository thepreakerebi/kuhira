"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatPct } from "@/lib/format";
import { type Lang, messages } from "@/lib/i18n";
import type { WeightKey, Weights } from "@/lib/types";

export const FACTOR_KEYS: WeightKey[] = ["gain", "gap", "dryness", "poverty"];

type Props = { lang: Lang; weights: Weights; onChange: (key: WeightKey, value: number) => void };

export function WeightControls({ lang, weights, onChange }: Props) {
  const t = messages[lang].planner;
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  return (
    <fieldset className="grid gap-5">
      <legend className="mb-1 font-heading text-lg font-semibold">{t.weightsLegend}</legend>
      {FACTOR_KEYS.map((k) => (
        <section key={k} className="grid gap-2">
          <header className="flex items-baseline justify-between gap-3">
            <Label htmlFor={`w-${k}`}>{t.factors[k].label}</Label>
            <strong className="font-mono text-sm tabular-nums" aria-hidden>
              {formatPct(weights[k] / total)}
            </strong>
          </header>
          <small className="text-xs text-muted-foreground">{t.factors[k].help}</small>
          <Slider
            id={`w-${k}`}
            thumbLabel={t.factors[k].label}
            min={0}
            max={1}
            step={0.05}
            value={[weights[k]]}
            onValueChange={([v]) => onChange(k, v)}
          />
        </section>
      ))}
    </fieldset>
  );
}
