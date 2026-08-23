"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { WALL_PHOTOS, dealIntoColumns, type WallPhoto } from "@/lib/wall-photos";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { useHasPointer } from "@/lib/useHasPointer";
import styles from "./PhotoWall.module.css";

/* Per-column drift. Four columns, four different periods so the wall never
   resolves into a repeating pattern the eye can lock onto, and alternating
   directions so it reads as a living surface rather than a scrolling list.
   The periods are deliberately long and mutually prime-ish — at these
   speeds a tile crosses the stage in about a minute, which is slow enough
   to feel like drift instead of motion.

   `z` pushes each column to its own depth. That is what makes the cursor
   parallax do anything: rotating a flat plane just turns a picture, but
   rotating four planes at different depths moves them past each other. */
const COLUMNS = [
  { seconds: 68, up: true, z: -140 },
  { seconds: 82, up: false, z: 0 },
  { seconds: 74, up: true, z: -220 },
  { seconds: 92, up: false, z: -60 },
];

/**
 * Calls `flag(true)` once `node` comes within `margin` px of the viewport,
 * and cleans up after itself.
 *
 * This was an IntersectionObserver, which is the obvious tool and was the
 * wrong one here, because both things it gated were load-bearing: the plane
 * is `opacity: 0` until it settles, and the tiles stay `loading="lazy"` until
 * they arm. An observer that never fires therefore did not degrade the wall,
 * it erased it — a section of two dozen photographs rendering as an empty
 * black band with no way to recover. Confirmed reachable: with the stage 71%
 * inside the viewport, neither callback had run and none of the 48 images had
 * loaded.
 *
 * A rect check cannot fail that way. It runs immediately, again on scroll and
 * resize, and once on a timer regardless — so the worst case is the entrance
 * animation being missed, never the wall being invisible.
 */
function reachedBy(
  node: HTMLElement | null,
  margin: number,
  flag: (v: true) => void
): (() => void) | undefined {
  if (!node) return;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    flag(true);
    cleanup();
  };

  const check = () => {
    if (done) return;
    const r = node.getBoundingClientRect();
    if (r.top - margin < window.innerHeight && r.bottom + margin > 0) finish();
  };

  // Belt to the rect check's braces: a browser that mis-reports rects inside
  // a preserve-3d ancestor, or a restored scroll position that fires no
  // scroll event, still ends with a visible wall.
  const timer = window.setTimeout(finish, 3000);

  function cleanup() {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", check);
    window.removeEventListener("resize", check);
  }

  check();
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  return cleanup;
}

export default function PhotoWall() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const hasPointer = useHasPointer();
  const stageRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const [armed, setArmed] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Two columns on a phone, four from tablet up. Every photo appears in
  // both arrangements — the count changes, the curation doesn't.
  const columnCount = isMobile ? 2 : 4;

  // Tapping a tile opened a full-screen viewer on a phone, which is not what
  // the section is for there: the wall is the proof, and the lightbox exists
  // so a cursor can inspect one frame. On a touch screen it interrupted a
  // scroll with a modal nobody asked for, and every tile was a tap target
  // sitting in the path of the gesture used to get past it. Off without a
  // pointer, which also means the tiles stop being buttons entirely.
  //
  // Keyed on the pointer and not on width, so it always agrees with the lede
  // beside it — that sentence swaps on the same `(hover: hover)` in CSS, and
  // keying this off `isMobile` left a narrow desktop window offering to open
  // a frame that could not be opened.
  const openable = hasPointer;
  const columns = useMemo(
    () => dealIntoColumns(WALL_PHOTOS, columnCount),
    [columnCount]
  );

  // Tiles drift, and a drifting element is a bad fit for `loading="lazy"`:
  // the browser decides based on where a tile sits relative to the
  // scrollport, so the ones parked outside the column's clip never queue,
  // and the wall turns over to reveal empty slots. So the whole set is
  // promoted to eager once the section is within a screen's reach — 24
  // tiles at ~16 KB, and the two copies share URLs, so it is one small
  // burst rather than a trickle of pop-in. `lazy` stays on as the fallback
  // for anything that never sees the check succeed.
  useEffect(() => reachedBy(stageRef.current, 600, setArmed), []);

  // The wall arrives from depth the first time it comes into view. Done with
  // an observer and a class rather than framer-motion because the plane's
  // transform is already owned by the pointer parallax below — two systems
  // writing the same property would fight.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    // Under reduced motion there is no entrance to observe — `.still` paints
    // the plane at full opacity on its own, so nothing needs settling.
    if (reduceMotion) return;
    return reachedBy(node, 0, setSettled);
  }, [reduceMotion]);

  // Pointer parallax. Writes CSS custom properties straight to the node
  // inside a rAF instead of going through React state — this fires on every
  // mousemove, and a setState per event would re-render 48 tiles for a
  // fractional degree of rotation.
  useEffect(() => {
    const stage = stageRef.current;
    const plane = planeRef.current;
    if (!stage || !plane || reduceMotion || isMobile) return;

    let frame = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      frame = 0;
      plane.style.setProperty("--px", px.toFixed(4));
      plane.style.setProperty("--py", py.toFixed(4));
    };

    const handleMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      // -1 .. 1 from the centre of the stage.
      px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      py = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const handleLeave = () => {
      px = 0;
      py = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    stage.addEventListener("pointermove", handleMove);
    stage.addEventListener("pointerleave", handleLeave);
    return () => {
      stage.removeEventListener("pointermove", handleMove);
      stage.removeEventListener("pointerleave", handleLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduceMotion, isMobile]);

  const openAt = useCallback((photo: WallPhoto, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenIndex(WALL_PHOTOS.findIndex((p) => p.id === photo.id));
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + WALL_PHOTOS.length) % WALL_PHOTOS.length;
    });
  }, []);

  return (
    <section id="inside" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className="kicker">Inside the room</p>
          <h2 className="displayLg">
            You can read the promise.
            <br />
            <span className={styles.accent}>Or you can see it.</span>
          </h2>
          {/* The instruction swaps on `(hover: hover)` rather than on a
              width guess, because it is describing the interaction and that
              is the exact feature deciding whether the interaction exists.
              Done in CSS rather than from useIsMobile so the right sentence
              is in the server-rendered HTML either way — a hook would ship
              the desktop copy first and correct it after hydration. */}
          <p className={styles.lede}>
            Photographs from the last session — the founders who showed up, the work they
            did, and the faces they made while doing it.{" "}
            {/* "Open any frame" belongs to the pointer copy now: tiles are not
                openable on a touch screen, so on a phone that sentence was
                instructing the reader to do something the wall no longer
                does. */}
            <span className={styles.pointerCue}>
              Move your cursor through the wall. Open any frame.
            </span>
            <span className={styles.touchCue}>Scroll, and the wall drifts past you.</span>
          </p>
        </Reveal>
      </div>

      <div
        ref={stageRef}
        className={`${styles.stage} ${settled ? styles.settled : ""} ${
          reduceMotion ? styles.still : ""
        }`}
      >
        <div ref={planeRef} className={styles.plane}>
          {columns.map((column, columnIndex) => {
            const config = COLUMNS[columnIndex % COLUMNS.length];
            return (
              <div
                key={columnIndex}
                className={styles.column}
                style={{ "--col-z": `${config.z}px` } as CSSProperties}
              >
                <div
                  className={`${styles.track} ${config.up ? styles.up : styles.down}`}
                  style={{ "--drift": `${config.seconds}s` } as CSSProperties}
                >
                  {column.map((photo) => (
                    <Tile
                      key={photo.id}
                      photo={photo}
                      onOpen={openAt}
                      armed={armed}
                      openable={openable}
                    />
                  ))}
                  {/* The loop needs a second pass of the same tiles to hand
                      off to as the first scrolls away. Same src, so it costs
                      no extra network — and it's hidden from assistive tech
                      so the wall isn't announced twice. */}
                  {!reduceMotion &&
                    column.map((photo) => (
                      <Tile
                        key={`${photo.id}-loop`}
                        photo={photo}
                        onOpen={openAt}
                        armed={armed}
                        openable={openable}
                        duplicate
                      />
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.fadeTop} aria-hidden="true" />
        <div className={styles.fadeBottom} aria-hidden="true" />
      </div>

      {openable && openIndex !== null && (
        <Lightbox
          index={openIndex}
          onClose={close}
          onStep={step}
          returnFocusTo={triggerRef}
        />
      )}
    </section>
  );
}

/* ---------- tile ---------- */

function Tile({
  photo,
  onOpen,
  armed,
  openable,
  duplicate = false,
}: {
  photo: WallPhoto;
  onOpen: (photo: WallPhoto, trigger: HTMLButtonElement) => void;
  armed: boolean;
  /** False on a phone, where the wall is something to watch, not to operate. */
  openable: boolean;
  duplicate?: boolean;
}) {
  const common = {
    className: `${styles.tile} ${openable ? "" : styles.tileStatic}`,
    style: { aspectRatio: `${photo.w} / ${photo.h}` } as CSSProperties,
    "aria-hidden": duplicate || undefined,
  };

  // A plain element rather than a disabled button: a button that does nothing
  // is still a tab stop, still announced as a control, and on a phone the
  // whole wall would be two dozen of them between the reader and the next
  // section.
  const inner = (
    <>
      {/* Deliberately not next/image. See the note in lib/wall-photos.ts:
          these are pre-sized static WebP so the optimizer has nothing to
          decide and there is no large srcset fallback for a crawler to
          pull — the exact shape of this project's past transfer blowout. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/wall/${photo.id}.webp`}
        alt={duplicate ? "" : photo.alt}
        width={photo.w}
        height={photo.h}
        loading={armed ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={styles.tileImg}
      />
      <span className={styles.tileGlow} aria-hidden="true" />
    </>
  );

  if (!openable) {
    return <div {...common}>{inner}</div>;
  }

  return (
    <button
      type="button"
      {...common}
      onClick={(e) => onOpen(photo, e.currentTarget)}
      tabIndex={duplicate ? -1 : undefined}
    >
      {inner}
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
  const photo = WALL_PHOTOS[index];
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

  // Warm the neighbours so arrowing through doesn't blank between frames.
  useEffect(() => {
    [-1, 1].forEach((delta) => {
      const neighbour =
        WALL_PHOTOS[(index + delta + WALL_PHOTOS.length) % WALL_PHOTOS.length];
      const img = new Image();
      img.src = `/wall/${neighbour.id}-lg.webp`;
    });
  }, [index]);

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${index + 1} of ${WALL_PHOTOS.length}: ${photo.caption}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={styles.lightboxInner}
        onClick={(e) => e.stopPropagation()}
      >
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
          {/* Keyed on id so React swaps the element rather than mutating src
              in place — without it the browser paints the old frame at the
              new one's aspect ratio for a beat while it decodes. */}
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
              {index + 1} / {WALL_PHOTOS.length}
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
