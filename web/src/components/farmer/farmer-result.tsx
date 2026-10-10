"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/site/empty-state";
import { formatNumber, formatRwf, formatSignedPct } from "@/lib/format";
import { cropName, type Lang, messages } from "@/lib/i18n";
import type { FarmerEstimate } from "@/lib/types";

export function FarmerResult({ lang, estimate }: { lang: Lang; estimate: FarmerEstimate | null }) {
  const t = messages[lang].farmer;
  const reduce = useReducedMotion();
  const key = estimate ? JSON.stringify(estimate) : "empty";
  return (
    <Card>
      <CardContent>
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {estimate ? <Estimate lang={lang} e={estimate} /> : (
              <EmptyState icon="fluent-emoji:seedling" iconLabel={t.emptyTitle} title={t.emptyTitle} description={t.emptyBody} />
            )}
          </motion.article>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function Estimate({ lang, e }: { lang: Lang; e: FarmerEstimate }) {
  const t = messages[lang].farmer;
  const loses = e.extra_kg_per_season < 0;
  const flat = e.bonus_pct === 0;
  const stats: [string, string, string?][] = [
    [t.extraHarvest, `${e.extra_kg_per_season > 0 ? "+" : ""}${formatNumber(e.extra_kg_per_season)} kg`, loses ? "text-clay" : undefined],
    [t.extraMoney, formatRwf(e.extra_rwf_per_season), loses ? "text-clay" : undefined],
    [t.youPay, formatRwf(e.farmer_pays_rwf)],
    [t.repay, e.seasons_to_repay === null ? t.never : `${e.seasons_to_repay} ${t.seasons}`],
  ];
  return (
    <section className="grid gap-5">
      <header className="grid gap-1">
        <h2 className="text-xl font-semibold">
          {cropName(lang, e.crop)} · {e.district}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t.waterBonus}: <strong className={loses ? "text-clay" : "text-primary-strong"}>{formatSignedPct(e.bonus_pct)}</strong>
          {" · "}
          {t.rainfed}: <strong className="text-foreground">{formatNumber(e.rainfed_kg)} kg</strong>
        </p>
      </header>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4">
        {stats.map(([k, v, tone]) => (
          <section key={k} className="grid gap-1">
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className={`font-heading text-[clamp(1.35rem,1.1rem+0.9vw,1.8rem)] font-semibold tabular-nums ${tone ?? ""}`}>{v}</dd>
          </section>
        ))}
      </dl>
      {loses || flat ? (
        <p className={`rounded-lg p-3 text-sm ${loses ? "bg-clay/10 text-clay" : "bg-muted text-muted-foreground"}`}>
          {loses ? t.lossNote : t.zeroNote}
        </p>
      ) : null}
      {e.season_c_rwf > 0 ? (
        <section className="grid gap-3 border-t pt-4">
          <h3 className="text-base font-semibold">{t.dryTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {t.dryBody} <strong className="text-foreground">{formatRwf(e.season_c_rwf)}</strong>.
          </p>
          <dl className="grid gap-1">
            <dt className="text-sm text-muted-foreground">{t.repay}</dt>
            <dd className="font-heading text-[clamp(1.35rem,1.1rem+0.9vw,1.8rem)] font-semibold tabular-nums">
              {e.seasons_to_repay_with_c === null ? t.never : `${e.seasons_to_repay_with_c} ${t.seasons}`}
            </dd>
          </dl>
          <small className="text-xs text-muted-foreground">{t.dryNote}</small>
        </section>
      ) : null}
      <small className="text-xs text-muted-foreground">{t.basis}</small>
    </section>
  );
}
