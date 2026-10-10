"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { BudgetControls, type Budget, type BudgetErrors } from "@/components/planner/budget-controls";
import { DistrictDetail } from "@/components/planner/district-detail";
import { DistrictMap } from "@/components/planner/district-map";
import { PlanTotals } from "@/components/planner/plan-totals";
import { RankingTable } from "@/components/planner/ranking-table";
import { WeightControls } from "@/components/planner/weight-controls";
import { postJson } from "@/lib/api-url";
import { type Lang, messages } from "@/lib/i18n";
import type { Crop, Defaults, District, DistrictShape, Plan, PlanRequest, WeightKey, Weights } from "@/lib/types";

type Props = { lang: Lang; defaults: Defaults; crops: Crop[]; districts: District[]; shapes: DistrictShape[]; initialPlan: Plan };

function validate(b: Budget) {
  const hectares = Number(b.hectares);
  const cost = Number(b.cost);
  const errors: BudgetErrors = {};
  if (!b.hectares || hectares <= 0 || hectares > 200_000) errors.hectares = true;
  if (!b.cost || cost <= 0 || cost > 50_000_000) errors.cost = true;
  return { hectares, cost, errors };
}

function requestKey(r: PlanRequest) {
  return JSON.stringify(r);
}

export function Planner({ lang, defaults, crops, districts, shapes, initialPlan }: Props) {
  const t = messages[lang].planner;
  const [weights, setWeights] = useState<Weights>(defaults.weights);
  const [budget, setBudget] = useState<Budget>({
    hectares: String(defaults.remaining_ha),
    cost: String(defaults.cost_per_ha_rwf),
    subsidy: "regular",
  });
  const initialKey = requestKey({
    weights: defaults.weights,
    hectares: defaults.remaining_ha,
    cost_per_ha_rwf: defaults.cost_per_ha_rwf,
    subsidy_rate: defaults.subsidy_regular,
  });
  const [result, setResult] = useState({ key: initialKey, plan: initialPlan });
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(initialPlan.ranking[0].district);

  const { hectares, cost, errors } = validate(budget);
  const valid = Object.keys(errors).length === 0;
  const subsidyRate = budget.subsidy === "solar" ? defaults.subsidy_solar : defaults.subsidy_regular;
  const request: PlanRequest = { weights, hectares, cost_per_ha_rwf: cost, subsidy_rate: subsidyRate };
  const key = requestKey(request);

  useEffect(() => {
    if (!valid || key === result.key) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      postJson<Plan>("/plan", JSON.parse(key), ctrl.signal)
        .then((plan) => {
          setResult({ key, plan });
          setFailed(false);
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setFailed(true);
        });
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [key, valid, result.key]);

  const { plan } = result;
  const ranking = useMemo(() => new Map(plan.ranking.map((r) => [r.district, r])), [plan]);
  const districtMap = useMemo(() => new Map(districts.map((d) => [d.district, d])), [districts]);
  const cropMap = useMemo(() => new Map(crops.map((c) => [c.crop, c])), [crops]);
  const stale = key !== result.key;

  const setWeight = (k: WeightKey, v: number) => setWeights((w) => ({ ...w, [k]: v }));

  return (
    <section className="@container grid gap-[clamp(1rem,2.5vw,1.75rem)]" aria-busy={stale && valid}>
      {failed ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{t.updateError}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid items-start gap-[clamp(1rem,2.5vw,1.75rem)] @min-[58rem]:grid-cols-[minmax(17rem,21rem)_minmax(0,1fr)]">
        <Card className="@min-[58rem]:sticky @min-[58rem]:top-4">
          <CardContent className="grid gap-8">
            <WeightControls lang={lang} weights={weights} onChange={setWeight} />
            <BudgetControls lang={lang} budget={budget} errors={errors} onChange={setBudget} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-[clamp(1rem,3vw,2rem)]">
            <DistrictMap lang={lang} shapes={shapes} ranking={ranking} selected={selected} onSelect={setSelected} />
            <DistrictDetail
              lang={lang}
              district={districtMap.get(selected)!}
              ranked={ranking.get(selected)!}
              crops={cropMap}
            />
          </CardContent>
        </Card>
      </section>

      <PlanTotals lang={lang} totals={plan.allocation.totals} />

      <Card>
        <CardContent className="grid gap-3">
          <header className="grid gap-1">
            <h2 className="text-xl font-semibold">{t.rankingTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.rankingBody}</p>
          </header>
          <RankingTable lang={lang} rows={plan.allocation.districts} selected={selected} onSelect={setSelected} />
        </CardContent>
      </Card>
    </section>
  );
}
