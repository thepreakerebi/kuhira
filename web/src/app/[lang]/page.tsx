import type { Metadata } from "next";
import { Suspense } from "react";
import { Planner } from "@/components/planner/planner";
import { PlannerHero } from "@/components/planner/planner-hero";
import { PlannerSkeleton } from "@/components/planner/planner-skeleton";
import { shell } from "@/components/site/page-shell";
import { getDefaultPlan, getStaticData } from "@/lib/api";
import { isLang, langOrNotFound, messages } from "@/lib/i18n";

type Props = PageProps<"/[lang]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: messages[isLang(lang) ? lang : "en"].planner.metaTitle };
}

async function PlannerData({ params }: { params: Props["params"] }) {
  const lang = langOrNotFound((await params).lang);
  const { defaults, crops, districts, shapes } = await getStaticData();
  const plan = await getDefaultPlan(defaults);
  return (
    <section lang={lang} className="grid gap-[clamp(1.5rem,4vw,3rem)]">
      <PlannerHero lang={lang} defaults={defaults} />
      <Planner lang={lang} defaults={defaults} crops={crops} districts={districts} shapes={shapes} initialPlan={plan} />
    </section>
  );
}

export default function PlannerPage({ params }: Props) {
  return (
    <section className={`${shell} py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <Suspense fallback={<PlannerSkeleton />}>
        <PlannerData params={params} />
      </Suspense>
    </section>
  );
}
