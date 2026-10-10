const whole = new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 });

export function formatNumber(n: number): string {
  return whole.format(n);
}

/** RWF with a readable unit: RWF 9.0 bn, RWF 340k, RWF 45,000. */
export function formatRwf(n: number): string {
  const sign = n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 1e9) return `${sign}RWF ${(a / 1e9).toFixed(1)} bn`;
  if (a >= 1e6) return `${sign}RWF ${(a / 1e6).toFixed(1)} M`;
  return `${sign}RWF ${whole.format(a)}`;
}

export function formatPct(share: number, digits = 0): string {
  return `${(share * 100).toFixed(digits)}%`;
}

export function formatSignedPct(pct: number): string {
  return `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct).toFixed(0)}%`;
}
