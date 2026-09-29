"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import FloatingAwardBadge from "./FloatingAwardBadge";
import FloatingSocialBadge from "./FloatingSocialBadge";
import portrait from "../../../public/alfred1.png";

export default function ProfileVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 0.9 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.2,
      }}
      className="relative mx-auto! flex w-full max-w-[300px] flex-col items-center sm:max-w-[420px] lg:max-w-[520px]"
    >
  
      <div className="relative aspect-square w-full">
        
        <div
          aria-hidden="true"
          className="absolute -z-10 rounded-full blur-3xl"
          style={{
            inset: "-18%",
            background:
              "radial-gradient(circle at 38% 32%, rgba(198,159,100,0.55) 0%, rgba(198,159,100,0.22) 45%, rgba(245,241,232,0) 72%)",
          }}
        />

        {/* Hand-scribbled gold outline, mostly wrapping the left side with a
            short extra mark near the top-right — jittered straight
            segments (not a smooth arc) with two overlapping passes, the
            same "drawn twice by hand" look as a real marker doubling back
            on itself. Sits behind the portrait/badges via DOM order. */}
        <svg
          aria-hidden="true"
          viewBox="-6 -6 112 112"
          className="absolute"
          style={{ inset: "-3%" }}
        >
          <path
            d="M 41.84,3.71 L 27.4,7.09 L 17.52,18.14 L 6.21,28.01 L 4.55,42.89 L 2.08,57.49 L 9.79,70.2 L 15.73,83.61 L 28.8,90.26 L 41.84,96.29"
            fill="none"
            stroke="#B88A3B"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <path
            d="M 42.46,-0.44 L 28.31,6.06 L 13.84,12.63 L 7.24,27.11 L 1.2,40.8 L 2.4,56.17 L 3.39,71.9 L 14.13,83.38 L 25.06,94.49 L 39.93,99.49"
            fill="none"
            stroke="#B88A3B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <path
            d="M 94.17,33.93 L 98.32,45.77 L 95.3,57.99 L 93.5,70.29"
            fill="none"
            stroke="#B88A3B"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </svg>

        <div className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-[#B88A3B] bg-black shadow-[0_20px_60px_-15px_rgba(23,23,23,0.35)]">
          <Image
            src={portrait}
            alt="Alfred Joshua, Business Operation Specialist and Co-Founder at The GOAT Media"
            fill
            sizes="(min-width: 1024px) 520px, (min-width: 640px) 420px, 300px"
            priority
            placeholder="blur"
            className="object-cover object-top"
          />
        </div>

        <FloatingAwardBadge />

        <FloatingSocialBadge />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute bottom-[-32px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#B88A3B] bg-[#F5F1E8] px-7! py-2! text-[1.3rem] font-semibold 
                     text-[#171717]! shadow-[0_8px_25px_-10px_rgba(23,23,23,0.25)]"
        >
          Business Operation Specialist
        </motion.div>
      </div>

      {/* NAME */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.68,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mt-14! text-center text-[1.85rem] font-bold text-[#B88A3B] sm:text-[2rem]"
      >
        Alfred Joshua
      </motion.p>

      {/* ROLE */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.78,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-center text-[1.05rem] text-[#68645C]"
      >
        Co Founder at The GOAT Media.
      </motion.p>
    </motion.div>
  );
}