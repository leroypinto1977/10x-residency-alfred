"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { MapPin, CalendarDays, Clock, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
import { EVENT } from "@/lib/event";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import sessionImg from "../../../public/founders-session.jpg";
import styles from "./Hero.module.css";

const META = [
  { Icon: MapPin, label: EVENT.venue },
  { Icon: CalendarDays, label: EVENT.dateLabel },
  { Icon: Clock, label: EVENT.format },
  { Icon: Users, label: `${EVENT.seats} founders, ${EVENT.admission.toLowerCase()}` },
];

// The headline is set as explicit lines because each one is masked and
// rises independently. Automatic wrapping can't be masked per line — the
// browser gives you no handle on a line box.
const TITLE_LINES = [
  { text: "Blueprint to build your", accent: false },
  { text: "million dollar company", accent: false },
  { text: "in 1 year", accent: true },
];

/**
 * The hero opening.
 *
 * The entrance is CSS, deliberately, and only the parallax is JavaScript.
 * An earlier pass drove the whole cascade from framer, which meant the
 * server shipped markup with the veil at opacity 1 and every headline line
 * translated 125% out of frame — so until hydration landed the hero was a
 * black rectangle with no headline in it. CSS animations run at first
 * paint, need no hydration, and honour prefers-reduced-motion natively.
 * If the JavaScript never arrives the opening still plays; only the
 * parallax is lost, and nothing about the page looks broken without it.
 *
 * Timings live in Hero.module.css next to the keyframes that use them.
 */
export default function Hero() {
  const still = useSafeReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Parallax. The backdrop drifts down as the page scrolls up so it appears
  // to move slower than the copy in front of it — depth out of the only two
  // planes the section has. Written straight to the nodes from one rAF
  // callback rather than through a motion library, so there is a single
  // render loop and the transform is exactly what this code says it is.
  useEffect(() => {
    const backdrop = backdropRef.current;
    const inner = innerRef.current;
    if (still) {
      // Covers the user turning the OS setting on mid-session: without this
      // the last values written before the switch stay stuck on the nodes.
      if (backdrop) backdrop.style.transform = "";
      if (inner) {
        inner.style.transform = "";
        inner.style.opacity = "";
      }
      return;
    }
    let frame = 0;
    // Sampled here rather than read inside update(). window.innerHeight is
    // the one number the collapsing address bar changes, so reading it per
    // frame made the backdrop's travel jump ~8px mid-scroll on a phone —
    // the drift is meant to be a function of scroll position alone. Width
    // is the trigger for resampling because it is what actually changes on
    // rotation or a resize; the bar moving never touches it.
    let drift = Math.min(110, window.innerHeight * 0.12);
    let lastWidth = window.innerWidth;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const height = rect.height || 1;
      const p = Math.min(1, Math.max(0, -rect.top / height));
      // Scaled off viewport height rather than a fixed pixel count, so the
      // drift is proportional on a phone and on a 27" display alike. The
      // backdrop is oversized by 8% either side to cover the travel.
      if (backdrop) {
        backdrop.style.transform = `translate3d(0, ${p * drift}px, 0)`;
      }
      if (inner) {
        inner.style.transform = `translate3d(0, ${p * -70}px, 0)`;
        // Holds full strength through the first third, then leaves. Fading
        // from the very first pixel of scroll reads as the page dimming.
        inner.style.opacity = String(p < 0.35 ? 1 : Math.max(0, 1 - (p - 0.35) / 0.45));
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      // Height-only resizes are the address bar and nothing else; ignoring
      // them is the whole point of caching drift in the first place.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      drift = Math.min(110, window.innerHeight * 0.12);
      onScroll();
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  return (
    <section ref={sectionRef} className={styles.hero}>
      {/* The room carries the hero rather than a gradient: an actual
          session, founders taking notes. Two nested wrappers on purpose —
          the outer one is scroll-driven, the inner one owns the entrance,
          and keeping them apart stops the two transforms fighting. */}
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropInner}>
          <Image
            src={sessionImg}
            alt=""
            fill
            sizes="100vw"
            priority
            className={styles.backdropImg}
          />
        </div>
      </div>

      {/* Outside the parallax wrapper: the scrim is tuned against the
          viewport frame, and travelling with the image would drag its
          dark bed off the copy column. */}
      <div className={styles.scrim} aria-hidden="true" />

      {/* Lifts off the photograph rather than off the whole section, so the
          copy can rise through it instead of waiting behind it. */}
      <div className={styles.veil} aria-hidden="true" />

      {/* Covers the strip the address bar vacates — see .foot. Nothing on a
          desktop, where the two viewports are the same height. */}
      <div className={styles.foot} aria-hidden="true" />

      {/* Three bands: brand, message, detail. */}
      <div ref={innerRef} className={styles.inner}>
        <header className={`${styles.brandBar} ${styles.rise} ${styles.riseBrand}`}>
          <p className={styles.wordmark}>
            Founder <span className={styles.accent}>10X.</span>
          </p>
        </header>

        <div className={styles.content}>
          <h1 className={styles.title}>
            {TITLE_LINES.map((line, i) => (
              <span key={line.text} className={styles.line}>
                <span
                  className={`${styles.lineInner} ${line.accent ? styles.highlight : ""}`}
                  style={{ "--line-index": i } as CSSProperties}
                >
                  {line.text}
                </span>
              </span>
            ))}
          </h1>

          <p className={`${styles.subtitle} ${styles.rise} ${styles.riseSubtitle}`}>
            Most founders work harder than anyone in the room, and still can&apos;t tell if
            they are building the right thing.
          </p>

          <div className={`${styles.actions} ${styles.rise} ${styles.riseActions}`}>
            <BookCallButton showArrow>Book a Call</BookCallButton>
            <Button href="#film" variant="secondary">
              Watch the Testimonials
            </Button>
          </div>

          {/* The button opens an application that ends on a payment page, so
              the fee belongs here, on the first screen, and not four sections
              down in the FAQ. It rides in with the buttons rather than on a
              beat of its own — it is their fine print, not a claim. */}
          <SeatFeeNote
            align="start"
            className={`${styles.seatNote} ${styles.rise} ${styles.riseActions}`}
          />
        </div>

        {/* Spans the full frame so its rule reads as the base of the
            composition rather than a line that stops halfway. */}
        <ul className={`${styles.metaRow} ${styles.rise} ${styles.riseMeta}`}>
          {META.map(({ Icon, label }) => (
            <li className={styles.metaItem} key={label}>
              <Icon size={18} className={styles.metaIcon} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
