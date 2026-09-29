"use client";

import { motion } from "framer-motion";

/**
 * lucide-react ships no brand marks, so the Instagram glyph is drawn here —
 * a plain camera-outline mark, not the trademarked logo artwork.
 */
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" />
      <circle cx="17.15" cy="6.85" r="1.1" fill="white" />
    </svg>
  );
}

/** Floating "500K+ Followers" pill overlapping the top-right of the portrait. */
export default function FloatingSocialBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1.6, y: 0 }}
      transition={{
        opacity: { duration: 0.6, delay: 0.4 },
        scale: { duration: 0.6, delay: 0.4 },
        y: { duration: 0.6, delay: 0.4 },
      }}
      className="absolute right-[-3%] top-[18%] flex items-center gap-3.5 rounded-full border border-[#B88A3B]/70 bg-white/95 py-2! pl-2! pr-4! shadow-[0_12px_32px_-10px_rgba(23,23,23,0.28)] backdrop-blur-sm sm:right-[-4%]"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        }}
      >
        <InstagramGlyph />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-bold text-[#171717]">500K+</span>
        <span className="block text-xs text-[#68645C]">Followers</span>
      </span>
    </motion.div>
  );
}
