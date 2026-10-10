import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FarmerCalculator } from "@/components/farmer/farmer-calculator";
import { FarmerSkeleton } from "@/components/farmer/farmer-skeleton";
import { shell } from "@/components/site/page-shell";
import { getStaticData } from "@/lib/api";
import { copy, isLang, LANGS } from "@/lib/i18n";

export const metadata: Metadata = { title: "Farmer calculator" };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

async function FarmerContent({ params }: { params: PageProps<"/farmer/[lang]">["params"] }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = copy[lang];
  const { defaults, crops, districts } = await getStaticData();
  return (
    <article lang={lang} className="grid gap-[clamp(1.25rem,3vw,2.25rem)]">
      <header className="grid gap-3">
        <nav aria-label="Language" className="flex gap-1 text-sm">
          {LANGS.map((l) => (
            <Link
              key={l}
              href={`/farmer/${l}`}
              aria-current={l === lang ? "page" : undefined}
              className="rounded-md px-2.5 py-1 font-medium ring-1 ring-border hover:bg-muted aria-[current=page]:bg-primary aria-[current=page]:ring-primary"
            >
              {copy[l].langName}
            </Link>
          ))}
        </nav>
        <h1 className="text-[clamp(1.8rem,1.2rem+2.6vw,3rem)] leading-tight font-bold">{t.title}</h1>
        <p className="max-w-2xl text-[clamp(1rem,0.95rem+0.3vw,1.15rem)] text-muted-foreground">{t.intro}</p>
      </header>
      <FarmerCalculator lang={lang} defaults={defaults} crops={crops} districts={districts} />
    </article>
  );
}

export default function FarmerPage({ params }: PageProps<"/farmer/[lang]">) {
  return (
    <main className={`${shell} max-w-5xl py-[clamp(1.5rem,4vw,3.5rem)]`}>
      <Suspense fallback={<FarmerSkeleton />}>
        <FarmerContent params={params} />
      </Suspense>
    </main>
  );
}
