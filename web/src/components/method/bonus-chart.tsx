import { formatNumber, formatSignedPct } from "@/lib/format";
import type { Crop } from "@/lib/types";

const LO = -25;
const HI = 35;
const TICKS = [-20, -10, 0, 10, 20, 30];
const x = (pct: number) => ((pct - LO) / (HI - LO)) * 100;

function tone(c: Crop) {
  if (c.ci_low_pct! > 0) return "#2f6e8f";
  if (c.ci_high_pct! < 0) return "#a8462c";
  return "#8a9285";
}

/** Forest plot as list rows, so labels stay readable at any width. */
export function BonusChart({ crops }: { crops: Crop[] }) {
  const rows = crops.filter((c) => c.bonus_pct !== null).toSorted((a, b) => b.bonus_pct! - a.bonus_pct!);
  return (
    <figure className="grid gap-3">
      <ul className="grid gap-2.5">
        {rows.map((c) => (
          <li key={c.crop} className="grid grid-cols-[minmax(5.5rem,8rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm">
            <strong className="font-medium">{c.crop}</strong>
            <svg viewBox="0 0 100 12" preserveAspectRatio="none" className="h-4 w-full" role="img"
              aria-label={`${c.crop}: ${formatSignedPct(c.bonus_pct!)}, 95% interval ${c.ci_low_pct}% to ${c.ci_high_pct}%`}>
              <line x1={x(0)} x2={x(0)} y1={0} y2={12} stroke="#1c2b1e" strokeWidth={0.4} />
              <rect x={x(c.ci_low_pct!)} width={x(c.ci_high_pct!) - x(c.ci_low_pct!)} y={4.5} height={3} rx={1.5}
                fill={tone(c)} opacity={0.45} />
              <rect x={x(c.bonus_pct!) - 0.6} width={1.2} y={1} height={10} fill={tone(c)} />
            </svg>
            <data value={c.bonus_pct!} className="text-right font-mono tabular-nums" style={{ color: tone(c) }}>
              {formatSignedPct(c.bonus_pct!)}
            </data>
          </li>
        ))}
      </ul>
      <figcaption className="grid grid-cols-[minmax(5.5rem,8rem)_minmax(0,1fr)_3.5rem] gap-3 text-xs text-muted-foreground">
        <small />
        <small className="relative h-4 font-mono">
          {TICKS.map((v) => (
            <data key={v} value={v} className="absolute -translate-x-1/2" style={{ left: `${x(v)}%` }}>
              {v > 0 ? `+${v}` : v}
            </data>
          ))}
        </small>
        <small />
        <small className="col-span-3">
          Yield change on irrigated vs rain-fed small-farm plots of the same crop, same district and season
          (bars: 95% interval). Blue: clear gain. Clay: clear loss. Grey: cannot tell from zero.{" "}
          {formatNumber(rows.reduce((a, c) => a + c.irrigated_plots, 0))} irrigated plots,{" "}
          {formatNumber(rows.reduce((a, c) => a + c.plots, 0))} in all.
        </small>
      </figcaption>
    </figure>
  );
}
