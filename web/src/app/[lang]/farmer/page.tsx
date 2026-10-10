import type { Metadata } from "next";
import { Suspense } from "react";
import { FarmerCalculator } from "@/components/farmer/farmer-calculator";
import { FarmerSkeleton } from "@/components/farmer/farmer-skeleton";
import { shell } from "@/components/site/page-shell";
import { getStaticData } from "@/lib/api";
import { isLang, langOrNotFound, messages } from "@/lib/i18n";

type Props = PageProps<"/[lang]/farmer">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: messages[isLang(lang) ? lang : "en"].farmer.metaTitle };
}

async function FarmerContent({ params }: { params: Props["params"] }) {
  const lang = langOrNotFound((await params).lang);
  const t = messages[lang].farmer;
  const { defaults, crops, districts } = await getStaticData();
  return (
    <section lang={lang} className="grid gap-[clamp(1.25rem,3vw,2.25rem)]">
      <header className="kuhira-rise grid gap-3">
        <h1 className="text-[clamp(1.8rem,1.2rem+2.6vw,3rem)] leading-tight font-bold">{t.title}</h1>
        <p className="max-w-2xl text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">{t.intro}</p>
      </header>
      <FarmerCalculator lang={lang} defaults={defaults} crops={crops} districts={districts} />
    </section>
  );
}

export default function FarmerPage({ params }: Props) {
  return (
    <section className={`${shell} max-w-5xl py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <Suspense fallback={<FarmerSkeleton />}>
        <FarmerContent params={params} />
      </Suspense>
    </section>
  );
}
