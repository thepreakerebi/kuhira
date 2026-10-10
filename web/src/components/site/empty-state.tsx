"use client";

import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "motion/react";

type Props = { icon: string; iconLabel: string; title: string; description: string };

export function EmptyState({ icon, iconLabel, title, description }: Props) {
  const reduce = useReducedMotion();
  return (
    <section className="grid justify-items-center gap-3 py-8 text-center">
      <motion.figure
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
        animate={
          reduce
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, y: [0, -4, 0], rotate: [0, -6, 6, 0] }
        }
        transition={
          reduce
            ? { duration: 0.2 }
            : {
                type: "spring",
                stiffness: 180,
                damping: 14,
                mass: 0.9,
                y: { repeat: Infinity, repeatDelay: 2.6, duration: 0.9 },
                rotate: { repeat: Infinity, repeatDelay: 2.6, duration: 0.9 },
              }
        }
      >
        <Icon icon={icon} aria-label={iconLabel} role="img" className="size-14" />
      </motion.figure>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
    </section>
  );
}
