"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
import { WALL_PHOTOS, type WallPhoto } from "@/lib/wall-photos";
import { useHasPointer } from "@/lib/useHasPointer";
import styles from "./PhotoWall.module.css";

// A compact curated set rather than the full drifting wall — four frames,
// picked for a mix of day/night and wide shots.
const FEATURED_IDS = ["5880", "4231", "5769", "5907"];
const FEATURED: WallPhoto[] = FEATURED_IDS.map(
  (id) => WALL_PHOTOS.find((p) => p.id === id)!
);

export default function PhotoWall() {
  const hasPointer = useHasPointer();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Tiles only open on a device that actually has a cursor — on a phone a
  // tap already scrolls past the grid, so a lightbox nobody asked for would
  // just be one more thing between the reader and the next section.
  const openable = hasPointer;

  const openAt = useCallback((index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenIndex(index);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + FEATURED.length) % FEATURED.length;
    });
  }, []);

  return (
    <section id="inside" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className={styles.kicker}>Inside the room</p>
          <h2 className={styles.heading}>
            You can read the promise.
            <br />
            <span className={styles.accent}>Or you can see it.</span>
          </h2>
          <p className={styles.lede}>
            Photographs from the last session — the founders who showed up, the work they did,
            and the faces they made while doing it. Move your cursor through the wall. Open any
            frame.
          </p>
          <div className={styles.ctas}>
            <BookCallButton showArrow>Book a Call</BookCallButton>
            <SeatFeeNote align="start" className={styles.seatNote} />
          </div>
        </Reveal>

        <Reveal stagger delay={0.15} className={styles.grid}>
          {FEATURED.map((photo, index) => (
            <RevealItem key={photo.id} className={styles.tileWrap}>
              <Tile photo={photo} index={index} onOpen={openAt} openable={openable} />
            </RevealItem>
          ))}
        </Reveal>
      </div>

      {openable && openIndex !== null && (
        <Lightbox index={openIndex} onClose={close} onStep={step} returnFocusTo={triggerRef} />
      )}
    </section>
  );
}

/* ---------- tile ---------- */

function Tile({
  photo,
  index,
  onOpen,
  openable,
}: {
  photo: WallPhoto;
  index: number;
  onOpen: (index: number, trigger: HTMLButtonElement) => void;
  /** False on a phone, where the grid is something to look at, not to operate. */
  openable: boolean;
}) {
  // Deliberately not next/image. See the note in lib/wall-photos.ts: these
  // are pre-sized static WebP so the optimizer has nothing to decide and
  // there is no large srcset fallback for a crawler to pull.
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/wall/${photo.id}.webp`}
      alt={photo.alt}
      width={photo.w}
      height={photo.h}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={styles.tileImg}
    />
  );

  if (!openable) {
    return <div className={`${styles.tile} ${styles.tileStatic}`}>{img}</div>;
  }

  return (
    <button
      type="button"
      className={styles.tile}
      onClick={(e) => onOpen(index, e.currentTarget)}
    >
      {img}
    </button>
  );
}

/* ---------- lightbox ---------- */

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function Lightbox({
  index,
  onClose,
  onStep,
  returnFocusTo,
}: {
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const photo = FEATURED[index];
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open — same approach as BookCallModal.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Escape closes, arrows walk the set, Tab stays inside the dialog.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onStep(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onStep(-1);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose, onStep]);

  // Focus in on open, back to the tile that opened it on close.
  useEffect(() => {
    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    }, 60);
    const trigger = returnFocusTo.current;
    return () => {
      clearTimeout(timer);
      trigger?.focus?.();
    };
    // Only on mount/unmount: re-running on each arrow press would yank focus
    // back to the close button every time someone steps through the set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${index + 1} of ${FEATURED.length}: ${photo.caption}`}
      onClick={onClose}
    >
      <div ref={dialogRef} className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <X size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.nav} ${styles.navPrev}`}
          onClick={() => onStep(-1)}
          aria-label="Previous photograph"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <figure className={styles.frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={`/wall/${photo.id}-lg.webp`}
            alt={photo.alt}
            className={styles.frameImg}
            decoding="async"
          />
          <figcaption className={styles.frameCaption}>
            <span>{photo.caption}</span>
            <span className={styles.counter}>
              {index + 1} / {FEATURED.length}
            </span>
          </figcaption>
        </figure>

        <button
          type="button"
          className={`${styles.nav} ${styles.navNext}`}
          onClick={() => onStep(1)}
          aria-label="Next photograph"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
