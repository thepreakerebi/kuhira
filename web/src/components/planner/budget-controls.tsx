"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type Budget = { hectares: string; cost: string; subsidy: "regular" | "solar" };

type Props = {
  budget: Budget;
  errors: Partial<Record<"hectares" | "cost", string>>;
  onChange: (b: Budget) => void;
};

function NumberField(props: {
  id: string;
  label: string;
  help: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="grid gap-1.5">
      <Label htmlFor={props.id}>{props.label}</Label>
      <small id={`${props.id}-help`} className={props.error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {props.error ?? props.help}
      </small>
      <Input
        id={props.id}
        inputMode="numeric"
        aria-invalid={Boolean(props.error)}
        aria-describedby={`${props.id}-help`}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value.replace(/[^\d]/g, ""))}
        className="font-mono tabular-nums"
      />
    </section>
  );
}

export function BudgetControls({ budget, errors, onChange }: Props) {
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-1 font-heading text-lg font-semibold">The budget</legend>
      <NumberField
        id="hectares"
        label="Hectares to place"
        help="PSTA5 target 41,031 ha minus 27,663 ha built."
        value={budget.hectares}
        error={errors.hectares}
        onChange={(hectares) => onChange({ ...budget, hectares })}
      />
      <NumberField
        id="cost"
        label="Kit cost per hectare (RWF)"
        help="RAB 2019: about $1,500/ha. Use today's quote."
        value={budget.cost}
        error={errors.cost}
        onChange={(cost) => onChange({ ...budget, cost })}
      />
      <section className="grid gap-1.5">
        <Label id="subsidy-label">Subsidy</Label>
        <small className="text-xs text-muted-foreground">Share of the kit the government pays.</small>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby="subsidy-label"
          value={budget.subsidy}
          onValueChange={(v) => v && onChange({ ...budget, subsidy: v as Budget["subsidy"] })}
          className="w-full"
        >
          <ToggleGroupItem value="regular" className="flex-1 data-[state=on]:bg-primary">
            Regular 50%
          </ToggleGroupItem>
          <ToggleGroupItem value="solar" className="flex-1 data-[state=on]:bg-primary">
            Solar 75%
          </ToggleGroupItem>
        </ToggleGroup>
      </section>
    </fieldset>
  );
}
