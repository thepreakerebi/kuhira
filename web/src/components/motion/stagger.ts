import type { CSSProperties } from "react";

/** Delay slot for a `kuhira-rise` entrance; siblings count up from 0. */
export function stagger(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
