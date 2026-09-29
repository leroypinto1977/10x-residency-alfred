"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import styles from "./Room.module.css";

/**
 * Decorative only — split out from Room.tsx (a server component) because
 * framer-motion's `motion.*` requires a client boundary, and the rest of
 * that section has no other reason to be one.
 */
export default function RoomPlayButton() {
  return (
    <motion.span
      aria-hidden="true"
      className={styles.playButton}
      style={{ translateX: "-50%", translateY: "-50%" }}
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <Play size={18} fill="currentColor" aria-hidden="true" />
    </motion.span>
  );
}
