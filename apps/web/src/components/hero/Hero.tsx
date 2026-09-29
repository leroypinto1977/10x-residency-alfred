"use client";

import { MotionConfig } from "framer-motion";
import HeroContent from "./HeroContent";
import ProfileVisual from "./ProfileVisual";

/**
 * Hero opening: the question and the promise on the left, Alfred's portrait
 * and credentials on the right. `MotionConfig reducedMotion="user"` strips
 * every transform-based animation (the floats, the scale-ins) whenever the
 * OS-level reduced-motion setting is on, while still letting content fade in.
 */
export default function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate flex min-h-screen w-full items-center overflow-hidden bg-[#F5F1E8] px-6! py-13! sm:px-10! lg:px-16!">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 16% 12%, rgba(184,138,59,0.16) 0%, rgba(245,241,232,0) 70%), radial-gradient(55% 50% at 88% 88%, rgba(184,138,59,0.14) 0%, rgba(245,241,232,0) 70%)",
          }}
        />

        <div className="mx-auto! grid w-full max-w-[1400px] grid-cols-1 items-center gap-16 lg:grid-cols-[52%_48%] lg:gap-8">
          <HeroContent />
          <ProfileVisual />
        </div>
      </section>
    </MotionConfig>
  );
}
