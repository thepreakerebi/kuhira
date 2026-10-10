"use client";

import { motion, useReducedMotion } from "motion/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flushTable } from "@/components/site/page-shell";
import { scoreColor } from "@/lib/color";
import { formatNumber, formatRwf } from "@/lib/format";
import { type Lang, messages } from "@/lib/i18n";
import type { Allocation, RankedDistrict } from "@/lib/types";

type Props = {
  lang: Lang;
  rows: Allocation[];
  ranking: Map<string, RankedDistrict>;
  selected: string;
  onSelect: (d: string) => void;
};

// Rows glide to their new rank when the weights change.
const MotionRow = motion.create(TableRow);

export function RankingTable({ lang, rows, ranking, selected, onSelect }: Props) {
  const reduce = useReducedMotion();
  const t = messages[lang].planner;
  return (
    <Table className={`min-w-[46rem] ${flushTable}`}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>{t.columns.district}</TableHead>
          <TableHead className="whitespace-nowrap">{t.columns.range}</TableHead>
          <TableHead className="w-[28%]">{t.columns.score}</TableHead>
          <TableHead className="text-right">{t.columns.hectares}</TableHead>
          <TableHead className="text-right">{t.columns.publicCost}</TableHead>
          <TableHead className="text-right">{t.columns.harvest}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <MotionRow
            key={r.district}
            layout={reduce ? false : "position"}
            transition={{ type: "spring", stiffness: 520, damping: 42 }}
            data-state={r.district === selected ? "selected" : undefined}
            className="cursor-pointer data-[state=selected]:bg-accent"
            onClick={() => onSelect(r.district)}
          >
            <TableCell className="font-mono tabular-nums text-muted-foreground">{r.rank}</TableCell>
            <TableCell>
              <button
                type="button"
                data-district-row={r.district}
                className="font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(r.district);
                }}
              >
                {r.district}
              </button>
            </TableCell>
            <TableCell className="font-mono text-muted-foreground tabular-nums">
              {ranking.get(r.district)?.rank_low}–{ranking.get(r.district)?.rank_high}
            </TableCell>
            <TableCell>
              <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 w-full" aria-label={`${t.score} ${r.score}`}>
                <rect width="100" height="8" rx="4" fill="#efeee6" />
                <motion.rect
                  initial={false}
                  animate={{ width: Math.max(r.score, 2), fill: scoreColor(r.score) }}
                  transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
                  height="8"
                  rx="4"
                />
              </svg>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(r.hectares)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatRwf(r.public_cost_rwf)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatRwf(r.extra_value_rwf_per_year)}</TableCell>
          </MotionRow>
        ))}
      </TableBody>
    </Table>
  );
}
