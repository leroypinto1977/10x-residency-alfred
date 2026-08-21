"use client";

import { motion } from "framer-motion";
import { SOFT } from "@/lib/motion-variants";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import styles from "./Card.module.css";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export default function Card({ children, className = "", hoverable = true }: CardProps) {
  const reduceMotion = useSafeReducedMotion();

  return (
    <motion.div
      className={`${styles.card} ${className}`}
      whileHover={hoverable && !reduceMotion ? { y: -5, scale: 1.005 } : undefined}
      // Same curve as every CSS hover on the page; the 0.2s easeOut this
      // used to carry made cards the one element that snapped.
      transition={{ duration: 0.45, ease: SOFT }}
    >
      {children}
    </motion.div>
  );
}
