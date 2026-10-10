import { interpolateRgbBasis } from "d3-interpolate";

const ramp = interpolateRgbBasis(["#f1f5e4", "#c3d898", "#7f9f45", "#3b5418"]);

/** Map fill for a 0-100 score. */
export function scoreColor(score: number): string {
  return ramp(Math.min(Math.max(score, 0), 100) / 100);
}

/** Dark text on the light half of the ramp, white on the dark half. */
export function scoreTextColor(score: number): string {
  return score > 62 ? "#ffffff" : "#1c2b1e";
}
