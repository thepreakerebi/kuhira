"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatPct } from "@/lib/format";
import type { WeightKey, Weights } from "@/lib/types";

export const FACTORS: { key: WeightKey; label: string; help: string }[] = [
  { key: "gain", label: "Water gain", help: "Extra harvest value per irrigated hectare, given what the district grows." },
  { key: "gap", label: "Adoption gap", help: "Share of small-farm land not yet irrigated." },
  { key: "dryness", label: "Dryness", help: "Less June–August rain scores higher." },
  { key: "poverty", label: "Poverty", help: "EICV7 poverty rate." },
];

type Props = { weights: Weights; onChange: (key: WeightKey, value: number) => void };

export function WeightControls({ weights, onChange }: Props) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  return (
    <fieldset className="grid gap-5">
      <legend className="mb-1 font-heading text-lg font-semibold">What matters most?</legend>
      {FACTORS.map((f) => (
        <section key={f.key} className="grid gap-2">
          <header className="flex items-baseline justify-between gap-3">
            <Label htmlFor={`w-${f.key}`}>{f.label}</Label>
            <strong className="font-mono text-sm tabular-nums" aria-hidden>
              {formatPct(weights[f.key] / total)}
            </strong>
          </header>
          <small className="text-xs text-muted-foreground">{f.help}</small>
          <Slider
            id={`w-${f.key}`}
            thumbLabel={f.label}
            min={0}
            max={1}
            step={0.05}
            value={[weights[f.key]]}
            onValueChange={([v]) => onChange(f.key, v)}
          />
        </section>
      ))}
    </fieldset>
  );
}
