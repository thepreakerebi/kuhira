import { Suspense } from "react";
import { Planner } from "@/components/planner/planner";
import { PlannerHero } from "@/components/planner/planner-hero";
import { PlannerSkeleton } from "@/components/planner/planner-skeleton";
import { shell } from "@/components/site/page-shell";
import { getDefaultPlan, getStaticData } from "@/lib/api";

async function PlannerData() {
  const { defaults, crops, districts, shapes } = await getStaticData();
  const plan = await getDefaultPlan(defaults);
  return (
    <>
      <PlannerHero defaults={defaults} />
      <Planner defaults={defaults} crops={crops} districts={districts} shapes={shapes} initialPlan={plan} />
    </>
  );
}

export default function Home() {
  return (
    <main className={`${shell} grid gap-[clamp(1.5rem,4vw,3rem)] py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <Suspense fallback={<PlannerSkeleton />}>
        <PlannerData />
      </Suspense>
    </main>
  );
}
