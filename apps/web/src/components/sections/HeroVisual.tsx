"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import styles from "./HeroVisual.module.css";

export default function HeroVisual() {
  const reduceMotion = useSafeReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);

  const pulse = reduceMotion
    ? undefined
    : { opacity: [1.7, 1, 0.7], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div className={styles.visual}>
      <motion.div className={styles.glow} animate={pulse} aria-hidden="true" />

      {/* Video card frame — temporarily disabled (removed the bordered/
          shadowed card look per request), kept here to restore tomorrow.
      <div className={styles.videoFrame}>
        {isPlaying ? (
          <video
            src="/video.mp4"
            className={styles.video}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <button
            type="button"
            className={styles.playButton}
            onClick={() => setIsPlaying(true)}
            aria-label="Play video"
          >
            <Play size={26} fill="currentColor" aria-hidden="true" />
          </button>
        )}
      </div>
      */}

      {isPlaying ? (
        <video
          src="/video.mp4"
          className={styles.video}
          controls
          autoPlay
          playsInline
        />
      ) : (
        <button
          type="button"
          className={styles.playButton}
          onClick={() => setIsPlaying(true)}
          aria-label="Play video"
        >
          <Play size={26} fill="currentColor" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
