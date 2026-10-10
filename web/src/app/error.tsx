"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/empty-state";
import { shell } from "@/components/site/page-shell";
import { langFromPath, messages } from "@/lib/i18n";

export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = messages[langFromPath(usePathname())].errors;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={`${shell} grid justify-items-center py-[clamp(3rem,10vw,7rem)]`}>
      <EmptyState icon="fluent-emoji:droplet" iconLabel={t.title} title={t.title} description={t.body} />
      <Button onClick={retry}>{t.retry}</Button>
    </section>
  );
}
