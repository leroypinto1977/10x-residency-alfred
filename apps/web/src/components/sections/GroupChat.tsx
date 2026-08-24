"use client";

/**
 * "The group chat" — screenshots from the cohort's thread, drifting past in
 * two opposed rows whose speed is driven by how fast the page is scrolling.
 *
 * Why the transform is *not* a function of scroll position
 * -------------------------------------------------------
 * A track whose `translateX` is derived from `window.scrollY` has to line up
 * with the page, so on a phone — where the compositor moves the page and the
 * main thread moves the track — the gap between them shows as the track
 * chasing the finger.
 *
 * This reads scroll *velocity* instead, and integrates it into an offset it
 * owns. Nothing here is meant to line up with anything the finger is touching,
 * so a late frame only means the strip drifted a few pixels less than it might
 * have. That is why it runs on touch as well.
 *
 * The arithmetic lives in lib/marquee-motion.ts so it can be exercised without
 * a browser; what follows is only the DOM half — measure, tick, write.
 */

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import { CHROME_SETTLE_MS, createMarqueeEngine, rescale } from "@/lib/marquee-motion";
import { reachedBy } from "@/lib/reached-by";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import styles from "./GroupChat.module.css";

const SHOTS = Array.from(
  { length: 10 },
  (_, i) => `/chatter/chat-${String(i + 1).padStart(2, "0")}.webp`
);

/** Intrinsic pixels of every screenshot — sets the aspect ratio, so the rows
 *  do not reflow as the images decode. */
const SHOT_W = 480;
const SHOT_H = 1040;

/** Which way each row walks. */
const DIRECTIONS: (1 | -1)[] = [1, -1];

function useVelocityMarquee(
  sectionRef: React.RefObject<HTMLElement | null>,
  rowRefs: React.RefObject<(HTMLDivElement | null)[]>,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    if (!section) return;

    const els = rowRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (!els.length) return;

    const engine = createMarqueeEngine(DIRECTIONS.slice(0, els.length));

    // Each row renders its screenshots twice, so the loop point is exactly
    // half the track. Measured rather than assumed: the cards size themselves
    // from CSS and the gap changes with the viewport.
    const measure = () => {
      els.forEach((el, i) => {
        const row = engine.rows[i];
        const half = el.scrollWidth / 2;
        if (half > 0 && half !== row.half) {
          row.offset = rescale(row.offset, row.half, half);
          row.half = half;
        }
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    els.forEach((el) => ro.observe(el));

    /* ---------- browser chrome ----------
     *
     * On a phone the URL bar and the navbar slide away as you scroll, and when
     * they do the browser re-bases the document underneath the page: scrollY
     * reports a step of 60-100px that no finger produced. Read as velocity,
     * an 88px step is ~5000px/s, which lurches the strip about ten times its
     * idle drift while the reader is holding still and then coasts back down
     * over half a second. It reads as a glitch, because nothing the reader did
     * caused it.
     *
     * So a viewport resize opens a window in which scrollY is re-anchored but
     * never reaches the velocity filter. Velocity is frozen rather than
     * zeroed, which is the point: the chrome only slides while the reader is
     * already scrolling, so the reading from just before the collapse is the
     * best estimate of the flick still in progress.
     */
    let chromeUntil = 0;
    const noteViewportChange = () => {
      chromeUntil = performance.now() + CHROME_SETTLE_MS;
    };
    const vv = window.visualViewport;
    vv?.addEventListener("resize", noteViewportChange);
    window.addEventListener("resize", noteViewportChange);

    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      engine.step(now, window.scrollY, now < chromeUntil);
      els.forEach((el, i) => {
        el.style.transform = `translate3d(${-engine.rows[i].offset}px, 0, 0)`;
      });
    };

    /* ---------- when to run ----------
     *
     * Deliberately starts running and lets the observer *pause* it, rather
     * than starting only once the observer says the section is visible. This
     * is the lesson PhotoWall already paid for: an IntersectionObserver that
     * never fires does not degrade a section gated on it, it erases it. Gating
     * the start that way would leave a dead strip of ten frozen screenshots.
     *
     * Inverted like this the worst case is a rAF loop running while the
     * section is off screen — some wasted CPU, nothing the reader can see —
     * and the observer is pure optimisation on top.
     */
    els.forEach((el) => (el.style.willChange = "transform"));
    frame = requestAnimationFrame(tick);
    let running = true;

    const resume = () => {
      if (running) return;
      running = true;
      engine.reset(performance.now(), window.scrollY);
      els.forEach((el) => (el.style.willChange = "transform"));
      frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
      els.forEach((el) => (el.style.willChange = "auto"));
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? resume() : pause()),
      { rootMargin: "200px 0px" }
    );
    io.observe(section);

    return () => {
      io.disconnect();
      ro.disconnect();
      vv?.removeEventListener("resize", noteViewportChange);
      window.removeEventListener("resize", noteViewportChange);
      cancelAnimationFrame(frame);
    };
  }, [sectionRef, rowRefs, enabled]);
}

function Row({
  shots,
  armed,
  loop,
  innerRef,
}: {
  shots: string[];
  armed: boolean;
  /** False under reduced motion, where one static pass is the whole row. */
  loop: boolean;
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  // Rendered twice: the offset wraps at the halfway point, so the second pass
  // is what fills the gap the first leaves as it walks off the edge.
  const run = loop ? [...shots, ...shots] : shots;
  return (
    <div className={styles.viewport}>
      <div ref={innerRef} className={styles.track}>
        {run.map((src, i) => (
          <figure key={i} className={styles.card}>
            {/* Deliberately not next/image, for the same reason as the photo
                wall — see the note in lib/wall-photos.ts. These are pre-sized
                static WebP, so the optimizer has nothing to decide and there
                is no large srcset variant for a crawler to pull. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              width={SHOT_W}
              height={SHOT_H}
              // A drifting card is a bad fit for `loading="lazy"`: the browser
              // decides from where it sits in the scrollport, so the cards
              // parked outside the row's clip never queue and the strip turns
              // over to reveal blanks. Promoted to eager once the section is
              // within reach; `lazy` stays as the fallback.
              loading={armed ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className={styles.shot}
            />
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function GroupChat() {
  const reduceMotion = useSafeReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [armed, setArmed] = useState(false);

  useEffect(() => reachedBy(sectionRef.current, 600, setArmed), []);
  useVelocityMarquee(sectionRef, rowRefs, !reduceMotion);

  // The second row runs the set backwards, so the two are not the same
  // sequence of screenshots a few hundred pixels apart.
  const rows = [SHOTS, [...SHOTS].reverse()];

  return (
    <section ref={sectionRef} id="group-chat" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className="kicker">After the room</p>
          <h2 className="displayLg">
            Three days end.
            <br />
            <span className={styles.accent}>The group chat doesn&apos;t.</span>
          </h2>
          <p className={styles.lede}>
            Unedited from the cohort thread — the work founders shipped, the numbers they
            hit, and the accountability that kept running long after everyone flew home.
          </p>
        </Reveal>
      </div>

      {/* Full-bleed, and faded at the edges rather than cut, so the loop point
          never announces itself. Marked decorative: at this size the
          screenshots are texture, and the claim they support is in the copy
          above rather than in text nobody can read. */}
      <div
        className={`${styles.strips} ${reduceMotion ? styles.still : ""}`}
        aria-hidden="true"
      >
        {rows.map((shots, i) => (
          <Row
            key={i}
            shots={shots}
            armed={armed}
            loop={!reduceMotion}
            innerRef={(el) => {
              rowRefs.current[i] = el;
            }}
          />
        ))}
        <div className={styles.fadeLeft} />
        <div className={styles.fadeRight} />
      </div>
    </section>
  );
}
