"use client";

import { ChoiceGroup } from "@/components/site/choice-group";
import { Field, NumberField } from "@/components/site/field";

export type Budget = { hectares: string; cost: string; subsidy: "regular" | "solar" };

type Props = {
  budget: Budget;
  errors: Partial<Record<"hectares" | "cost", string>>;
  onChange: (b: Budget) => void;
};

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
      <Field id="subsidy" label="Subsidy" help="Share of the kit the government pays.">
        <ChoiceGroup
          id="subsidy"
          value={budget.subsidy}
          options={[
            { value: "regular", label: "Regular 50%" },
            { value: "solar", label: "Solar 75%" },
          ]}
          onChange={(subsidy) => onChange({ ...budget, subsidy })}
        />
      </Field>
    </fieldset>
  );
}
