"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ReactNode } from "react";
import {
  fadeUp,
  fadeUpMobile,
  staggerContainer,
  staggerContainerMobile,
} from "@/lib/motion-variants";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";

interface RevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
}

export default function Reveal({ children, className = "", stagger = false, delay = 0 }: RevealProps) {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  // Driven by useInView + `animate` rather than `whileInView`. Framer only
  // propagates `initial` and `animate` down to child motion components —
  // `whileInView` stays local to the element it's set on. With `stagger`,
  // that meant every RevealItem inherited "hidden" and then never heard
  // about "show", so whole sections (the hero's trust row, the four
  // Transformation steps, the testimonial grid) rendered at opacity 0.
  const inView = useInView(ref, { once: true, amount: 0.15 });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = stagger
    ? isMobile
      ? staggerContainerMobile
      : staggerContainer
    : isMobile
      ? fadeUpMobile
      : fadeUp;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={variants}
      transition={stagger ? undefined : { delay: isMobile ? delay * 0.6 : delay }}
    >
      {children}
    </motion.div>
  );
}
