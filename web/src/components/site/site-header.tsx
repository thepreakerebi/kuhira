"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { shell } from "@/components/site/page-shell";
import { langFromPath, LANGS, messages, switchLangPath } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const link = "relative isolate block rounded-md px-[clamp(0.5rem,1.2vw,0.75rem)] py-1.5 font-medium transition-colors";
const current = "text-secondary-foreground";

/** The active background, shared between links so it glides to the one just chosen. */
function Pill({ id }: { id: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.i
      aria-hidden
      layoutId={id}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
      className="absolute inset-0 -z-10 rounded-md bg-secondary"
    />
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const t = messages[lang].nav;
  const pages = [
    { href: `/${lang}`, label: t.planner, active: pathname === `/${lang}` },
    { href: `/${lang}/farmer`, label: t.farmer, active: pathname.startsWith(`/${lang}/farmer`) },
    { href: `/${lang}/method`, label: t.method, active: pathname.startsWith(`/${lang}/method`) },
  ];
  return (
    <header className="z-10 border-b bg-card">
      <section className={`${shell} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3`}>
        <Link href={`/${lang}`} className="flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
          <svg aria-hidden viewBox="0 0 24 24" className="size-6">
            <path d="M12 2.5c3.6 4.6 6 8.2 6 11.3a6 6 0 1 1-12 0c0-3.1 2.4-6.7 6-11.3Z" fill="#c3d898" stroke="#4a6420" strokeWidth="1.5" />
          </svg>
          Kuhira
        </Link>
        <section className="flex flex-wrap items-center gap-x-[clamp(0.5rem,2vw,1.25rem)] gap-y-2 text-sm">
          <nav aria-label={t.main}>
            <ul className="flex items-center gap-1">
              {pages.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    aria-current={p.active ? "page" : undefined}
                    className={cn(link, p.active ? current : "hover:bg-muted")}
                  >
                    {p.active ? <Pill id="nav-pill" /> : null}
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.language}>
            <ul className="flex items-center rounded-lg p-0.5 ring-1 ring-border">
              {LANGS.map((l) => (
                <li key={l}>
                  <Link
                    href={switchLangPath(pathname, l)}
                    hrefLang={l}
                    lang={l}
                    aria-current={l === lang ? "true" : undefined}
                    title={messages[l].langName}
                    className={cn(
                      "relative isolate block rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                      l === lang ? current : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {l === lang ? <Pill id="lang-pill" /> : null}
                    {messages[l].short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </section>
    </header>
  );
}
