"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
}

export default function CountUp({ to, prefix = "", suffix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useSafeReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 55, damping: 18 });

  useEffect(() => {
    if (isInView) motionValue.set(to);
  }, [isInView, motionValue, to]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduceMotion) {
      node.textContent = `${prefix}${to}${suffix}`;
      return;
    }
    node.textContent = `${prefix}0${suffix}`;
    return spring.on("change", (latest) => {
      node.textContent = `${prefix}${Math.round(latest)}${suffix}`;
    });
  }, [spring, prefix, suffix, to, reduceMotion]);

  return (
    <span ref={ref} aria-hidden="true">
      {prefix}0{suffix}
    </span>
  );
}
