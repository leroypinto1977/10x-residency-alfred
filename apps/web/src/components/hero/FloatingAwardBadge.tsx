"use client";

import { useId } from "react";
import { motion } from "framer-motion";

/**
 * A scalloped seal/rosette with a ribbon tail, drawn from scratch — lucide's
 * "Award" line icon read as too thin and flat next to the reference's solid
 * gold medal, and no lucide icon has that scalloped certification-seal edge.
 * The outer ring's points are a precomputed 12-point star polygon (radius
 * alternating 9.6 / 8.1 around a 24×24 box) rather than a plain circle.
 */
function SealMedalGlyph({ gradientId }: { gradientId: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden="true">
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#F6E4B3" />
          <stop offset="45%" stopColor="#C69F64" />
          <stop offset="100%" stopColor="#8A6A2E" />
        </radialGradient>
      </defs>
      {/* Ribbon tails, behind the seal */}
      <path d="M8.2,16.6 L11.2,18 L9.3,22.8 L6.6,21.2 Z" fill="#8A6A2E" />
      <path d="M15.8,16.6 L12.8,18 L14.7,22.8 L17.4,21.2 Z" fill="#8A6A2E" />
      {/* Scalloped seal */}
      <path
        d="M12,1.4 L14.1,3.18 L16.8,2.69 L17.73,5.27 L20.31,6.2 L19.82,8.9 L21.6,11 L19.82,13.1 L20.31,15.8 L17.73,16.73 L16.8,19.31 L14.1,18.82 L12,20.6 L9.9,18.82 L7.2,19.31 L6.27,16.73 L3.69,15.8 L4.18,13.1 L2.4,11 L4.18,8.9 L3.69,6.2 L6.27,5.27 L7.2,2.69 L9.9,3.18 Z"
        fill={`url(#${gradientId})`}
        stroke="#6E4A17"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="5.4" fill="none" stroke="#F6E4B3" strokeOpacity="0.65" strokeWidth="0.6" />
    </svg>
  );
}

/**
 * Small medal badge overlapping the left edge of the profile circle. Purely
 * decorative — hidden from assistive tech, since it repeats no information
 * the role pill below the portrait doesn't already state as text.
 */
export default function FloatingAwardBadge() {
  const gradientId = useId();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1.4 }}
      transition={{
        opacity: { duration: 0.6, delay: 0.5 },
        scale: { duration: 0.6, delay: 0.5 },
      }}
      className="absolute left-[-4%] top-[36%] flex h-14 w-14 items-center justify-center rounded-full border border-[#B88A3B]/70 shadow-[0_10px_28px_-10px_rgba(23,23,23,0.3)] sm:left-[-6%] sm:h-16 sm:w-16"
      style={{
        background:
          "radial-gradient(circle at 32% 28%, #F6E9C9 0%, #F5F1E8 55%, #ECE0C4 100%)",
      }}
    >
      <SealMedalGlyph gradientId={gradientId} />
    </motion.div>
  );
}
