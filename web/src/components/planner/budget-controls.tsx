"use client";

import { ChoiceGroup } from "@/components/site/choice-group";
import { Field, NumberField } from "@/components/site/field";
import { type Lang, messages } from "@/lib/i18n";

export type Budget = { hectares: string; cost: string; subsidy: "regular" | "solar"; dry: string };
export type BudgetErrors = Partial<Record<"hectares" | "cost" | "dry", boolean>>;

type Props = {
  lang: Lang;
  budget: Budget;
  errors: BudgetErrors;
  dryRange: { median: number; low: number; high: number };
  onChange: (b: Budget) => void;
};

export function BudgetControls({ lang, budget, errors, dryRange, onChange }: Props) {
  const t = messages[lang].planner;
  return (
    <fieldset className="grid gap-4">
      <legend className="mb-1 font-heading text-lg font-semibold">{t.budgetLegend}</legend>
      <NumberField
        id="hectares"
        label={t.hectares}
        help={t.hectaresHelp}
        value={budget.hectares}
        error={errors.hectares ? t.hectaresError : undefined}
        onChange={(hectares) => onChange({ ...budget, hectares })}
      />
      <NumberField
        id="cost"
        label={t.cost}
        help={t.costHelp}
        value={budget.cost}
        error={errors.cost ? t.costError : undefined}
        onChange={(cost) => onChange({ ...budget, cost })}
      />
      <NumberField
        id="dry"
        label={t.dry}
        help={t.dryHelp(dryRange.median, dryRange.low, dryRange.high)}
        value={budget.dry}
        error={errors.dry ? t.dryError : undefined}
        onChange={(dry) => onChange({ ...budget, dry })}
      />
      <Field id="subsidy" label={t.subsidy} help={t.subsidyHelp}>
        <ChoiceGroup
          id="subsidy"
          value={budget.subsidy}
          options={[
            { value: "regular", label: t.regular },
            { value: "solar", label: t.solar },
          ]}
          onChange={(subsidy) => onChange({ ...budget, subsidy })}
        />
      </Field>
    </fieldset>
  );
}
