"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { shell } from "@/components/site/page-shell";
import { langFromPath, messages } from "@/lib/i18n";

export function NotFoundView() {
  const lang = langFromPath(usePathname());
  const t = messages[lang].errors;
  return (
    <section className={`${shell} grid justify-items-center py-[clamp(3rem,10vw,7rem)]`}>
      <EmptyState icon="fluent-emoji:compass" iconLabel={t.notFoundTitle} title={t.notFoundTitle} description={t.notFoundBody} />
      <Button asChild>
        <Link href={`/${lang}`}>{t.notFoundCta}</Link>
      </Button>
    </section>
  );
}
