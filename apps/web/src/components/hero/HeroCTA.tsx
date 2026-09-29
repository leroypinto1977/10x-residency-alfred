"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useBookCallModal } from "@/components/BookCallModalContext";
import { EVENT } from "@/lib/event";

/** Primary "Book a Call" pill plus the seat-fee note beside it, sharing the modal every other CTA on the page opens. */
export default function HeroCTA() {
  const { openModal } = useBookCallModal();

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-center lg:justify-start">
      <motion.button
        type="button"
        onClick={(e) => openModal(e.currentTarget)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="group inline-flex h-[55px] w-[165px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#B88A3B] font-semibold text-white transition-colors duration-300 hover:bg-[#6E4A17]"
      >
        Book a Call
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </motion.button>

      <p className="flex items-center gap-1.5 text-sm italic text-[#68645C]">
        <ShieldCheck size={16} className="shrink-0 text-[#16A34A]" aria-hidden="true" />
        <span>
          <span className="font-semibold text-[#171717]">{EVENT.seatFeeLabel}</span>{" "}
          blocks your seat
        </span>
      </p>
    </div>
  );
}
