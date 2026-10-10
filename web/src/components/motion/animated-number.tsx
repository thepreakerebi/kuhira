"use client";

import { animate, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef } from "react";

type Props = { value: number; format: (n: number) => string; className?: string };

/** Counts from the previous value to the new one. Server render and first paint show the final value.
 * A layout effect, so the count starts before the browser paints the new value.
 * Pass a stable `format` (module-level), or every render restarts the count. */
export function AnimatedNumber({ value, format, className }: Props) {
  const ref = useRef<HTMLDataElement>(null);
  const previous = useRef(value);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = value;
    const el = ref.current;
    if (!el || reduce || from === value) return;
    const controls = animate(from, value, {
      duration: 0.45,
      ease: "easeOut",
      onUpdate: (v) => (el.textContent = format(v)),
      onComplete: () => (el.textContent = format(value)),
    });
    return () => controls.stop();
  }, [value, reduce, format]);

  return (
    <data ref={ref} value={value} className={className}>
      {format(value)}
    </data>
  );
}
