"use client";

import { usePathname } from "next/navigation";
import { shell } from "@/components/site/page-shell";
import { langFromPath, messages } from "@/lib/i18n";

export function SiteFooter() {
  const t = messages[langFromPath(usePathname())].footer;
  return (
    <footer className="mt-auto border-t bg-card">
      <section className={`${shell} grid gap-2 py-6 text-sm text-muted-foreground`}>
        <p>{t.data}</p>
        <p>{t.built}</p>
      </section>
    </footer>
  );
}
