"use client";

import { motion, type Variants } from "framer-motion";
import GradientStrokeText from "@/components/ui/GradientStrokeText";
import HeroCTA from "./HeroCTA";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroContent() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto! min-w-0 max-w-[640px] text-center lg:mx-15! lg:text-left"
    >
      <motion.div variants={item} className="flex justify-center lg:justify-start">
        <div className="sm:hidden">
          <GradientStrokeText
            lines={["Unable to scale", "your", "business?"]}
            ariaLabel="Unable to scale your business?"
            textClassName="text-[clamp(2.55rem,2.1rem+1.7vw,4.75rem)] tracking-tight"
            lineHeight={0.95}
          />
        </div>
        <div className="hidden sm:block">
          <GradientStrokeText
            lines={["Unable to scale your", "business?"]}
            ariaLabel="Unable to scale your business?"
            textClassName="text-[clamp(2.55rem,2rem+1.7vw,4.75rem)] tracking-tight"
            lineHeight={1.1}
          />
        </div>
      </motion.div>

      <motion.h1
        variants={item}
        className="mt-6! font-[var(--font-display)] text-[clamp(1.85rem,1.45rem+1.8vw,3.375rem)] 2xl:text-[2rem] font-extrabold leading-[1.22] text-pretty text-[#171717]!"
      >
        Build a powerful machine that runs

        <br className="hidden 2xl:block" /> without you, and{" "}
        <span className="relative inline-block whitespace-nowrap text-[#B88A3B]">
          10× your profits
          {/* A filled, hand-drawn ribbon rather than a stroked line: a
              uniform-width stroke reads as a CSS border no matter how wavy
              the path is. Tracing independent top/bottom edges (each with
              its own wobble, slightly out of phase) gives the stroke a
              varying thickness along its length, which is what actually
              sells "brush", not the waviness alone. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 300 24"
            preserveAspectRatio="none"
            className="absolute left-0 top-[calc(100%-6px)] h-[16px] w-full text-[#6E4A17]"
          >
            <path
              d="M4,12
                 C 20,5 42,15 66,9
                 C 96,3 126,17 160,10
                 C 195,4 226,16 260,9
                 C 276,6 289,9 296,11
                 C 288,18 275,13 261,17
                 C 227,21 195,12 160,18
                 C 126,24 96,11 66,17
                 C 42,21 21,14 4,12
                 Z"
              fill="currentColor"
            />
          </svg>
        </span>{" "}
        in
        <br className="hidden 2xl:block" /> 90 days.
      </motion.h1>

      <motion.p
        variants={item}
        className="mx-auto! mt-7! max-w-[560px] text-[clamp(1rem,0.5rem+0.10vw, 0.3125rem)] leading-[1.55] text-[#68645C] lg:mx-0!"
      >
        You are not stuck for lack of effort. You are stuck because there is no team, no
        process and no system holding the business up when you step away.
      </motion.p>

      <motion.div variants={item} className="mt-9! flex justify-center lg:justify-start">
        <HeroCTA />
      </motion.div>
    </motion.div>
  );
}
