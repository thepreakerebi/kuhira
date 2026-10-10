"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flushTable } from "@/components/site/page-shell";
import { scoreColor } from "@/lib/color";
import { formatNumber, formatRwf } from "@/lib/format";
import type { Allocation } from "@/lib/types";

type Props = { rows: Allocation[]; selected: string; onSelect: (d: string) => void };

export function RankingTable({ rows, selected, onSelect }: Props) {
  return (
    <Table className={`min-w-[40rem] ${flushTable}`}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>District</TableHead>
          <TableHead className="w-[28%]">Score</TableHead>
          <TableHead className="text-right">Hectares</TableHead>
          <TableHead className="text-right">Public cost</TableHead>
          <TableHead className="text-right">Extra harvest / yr</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.district}
            data-state={r.district === selected ? "selected" : undefined}
            className="cursor-pointer data-[state=selected]:bg-accent"
            onClick={() => onSelect(r.district)}
          >
            <TableCell className="font-mono tabular-nums text-muted-foreground">{r.rank}</TableCell>
            <TableCell>
              <button
                type="button"
                className="font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(r.district);
                }}
              >
                {r.district}
              </button>
            </TableCell>
            <TableCell>
              <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 w-full" aria-label={`score ${r.score}`}>
                <rect width="100" height="8" rx="4" fill="#efeee6" />
                <rect width={Math.max(r.score, 2)} height="8" rx="4" fill={scoreColor(r.score)} />
              </svg>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(r.hectares)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatRwf(r.public_cost_rwf)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatRwf(r.extra_value_rwf_per_year)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
