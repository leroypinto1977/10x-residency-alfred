"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, fadeUpMobile } from "@/lib/motion-variants";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";

interface RevealItemProps {
  children: ReactNode;
  className?: string;
}

export default function RevealItem({ children, className = "" }: RevealItemProps) {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();

  // Reveal renders a plain <div> under reduced motion, which leaves no
  // variant context for this to inherit — so bail out the same way rather
  // than relying on a parent that isn't there.
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return <motion.div className={className} variants={isMobile ? fadeUpMobile : fadeUp}>{children}</motion.div>;
}
