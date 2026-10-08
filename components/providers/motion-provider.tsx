"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * - `LazyMotion` + `m.*` components keep the animation bundle to the
 *   `domAnimation` feature set instead of the full `motion` component.
 * - `reducedMotion="user"` disables transform/layout animations for users
 *   with `prefers-reduced-motion: reduce` (opacity fades are kept).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
