"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Play } from "lucide-react";
import Reveal from "@/components/Reveal";
import BookCallButton from "@/components/BookCallButton";
import { getEmbedUrl } from "@/lib/video";
import { EVENT } from "@/lib/event";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import alfredImg from "../../../public/alfred.jpg";
import pavanImg from "../../../public/pavan_img.jpg";
import pushpaImg from "../../../public/Pushpa_img.jpg";
import oviyaImg from "../../../public/oviya.jpg";
import styles from "./Film.module.css";

interface Chapter {
  name: string;
  role: string;
  /** The line that carries the card. Short enough to set in display type. */
  quote: string;
  url: string;
  poster: StaticImageData;
}

/**
 * The programme film.
 *
 * There is no single sit-down VSL for Founder 10X yet, so rather than
 * shipping an empty frame this section is cut from the footage that does
 * exist — the founders GOAT has already worked with, on the record. Set
 * `FILM.host` when a host film is recorded and it becomes the opening
 * chapter automatically; nothing else here needs to change.
 */
type HostFilm = { url: string; quote: string };

const FILM: { host: HostFilm | null } = { host: null };

const CHAPTERS: Chapter[] = [
  {
    name: "Pavan",
    role: "Career Consultant",
    quote: "From consulting one client at a time to a business that fills its own pipeline.",
    url: "https://www.youtube.com/shorts/8WpYPLZ7TzE",
    poster: pavanImg,
  },
  {
    name: "Pushpalatha",
    role: "Makeup Artist & Trainer",
    quote: "A craft turned into a company: pricing, positioning and a training arm that scales.",
    url: "https://www.youtube.com/watch?v=qjVYETJP1HA",
    poster: pushpaImg,
  },
  {
    name: "Ovya Vignesh",
    role: "Founder, Malola Foods",
    quote: "Running the numbers properly, and finally knowing which product actually makes money.",
    url: "https://www.youtube.com/shorts/E9KQ3CQzDhA",
    poster: oviyaImg,
  },
];

const ALL_CHAPTERS: Chapter[] = FILM.host
  ? [
      {
        name: "Alfred Joshua",
        role: `CEO, ${EVENT.host}`,
        quote: FILM.host.quote,
        url: FILM.host.url,
        poster: alfredImg,
      },
      ...CHAPTERS,
    ]
  : CHAPTERS;

export default function Film() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const isDesktop = useIsDesktop();
  const reduceMotion = useSafeReducedMotion();
  // Pinning is an enhancement, never the only way to reach a card. It stays
  // off for SSR, for reduced motion, and on anything narrower than a laptop,
  // where hijacking vertical scroll to move a rail sideways fights the
  // gesture people already use. Those cases get a plain swipeable rail.
  const pinned = isDesktop && !reduceMotion;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  // Horizontal distance the track has to travel for its right edge to reach
  // the right edge of the viewport. The pin height is derived from it in CSS
  // as calc(100vh + travel), so viewport height never has to be mirrored
  // into state where it could go stale.
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    if (!pinned) {
      setTravel(0);
      return;
    }
    const measure = () => {
      const track = trackRef.current;
      const frame = track?.parentElement;
      if (!track || !frame) return;
      // Against the frame, not the track's own clientWidth: the track is
      // `width: max-content`, so it is never its own scroll container and
      // scrollWidth - clientWidth is always 0.
      setTravel(Math.max(0, track.scrollWidth - frame.clientWidth));
    };
    measure();
    // Both are needed and neither is enough alone: the track's own width
    // settles late (fonts, image layout), and the viewport it is measured
    // against changes independently. Observing documentElement rather than
    // listening for `resize` also catches viewport changes that never fire
    // a resize event.
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [pinned]);

  // Two values, deliberately. `xRaw` is the exact scroll-derived position;
  // `x` is a spring that chases it. Binding the rail straight to scroll is
  // technically correct and feels like dragging furniture — the spring adds
  // the fractional lag and settle that reads as weight. Overdamped on
  // purpose (damping > 2*sqrt(stiffness*mass)) so it never overshoots past
  // the last card and reveals the empty end of the track.
  const xRaw = useMotionValue(0);
  const x = useSpring(xRaw, { stiffness: 110, damping: 34, mass: 1, restDelta: 0.05 });
  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, { stiffness: 110, damping: 34, mass: 1 });

  useEffect(() => {
    if (!pinned || travel <= 0) {
      xRaw.set(0);
      progress.set(0);
      setActiveIdx(0);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // The pinned frame's own height, not window.innerHeight. The section
      // is `calc(100svh + travel)` and the frame is `100svh`, so measuring
      // the frame makes this difference exactly `travel` by construction
      // and keeps the CSS and this calculation from ever disagreeing.
      // window.innerHeight is the address bar's number: on an iPad it grows
      // as the bar retracts, which shortened `distance` mid-scroll and
      // snapped the rail sideways.
      const distance = rect.height - (pinRef.current?.offsetHeight ?? 0);
      if (distance <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / distance));
      xRaw.set(-travel * p);
      progress.set(p);
      setActiveIdx(Math.round(p * (ALL_CHAPTERS.length - 1)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pinned, travel, xRaw, progress]);

  // One player at a time: two open iframes means two soundtracks.
  const play = useCallback((idx: number) => setPlayingIdx(idx), []);

  const cards = ALL_CHAPTERS.map((chapter, idx) => {
    const embedUrl = getEmbedUrl(chapter.url);
    const isPlaying = playingIdx === idx;
    // Only the card at the centre of the rail is fully lit. The rest sit
    // back a step so the eye is told where to look — the single cheapest
    // thing that separates a gallery from a carousel.
    const isActive = !pinned || idx === activeIdx;

    return (
      <article
        key={chapter.name}
        className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      >
        <div className={styles.stage}>
          {isPlaying && embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${chapter.name} on ${EVENT.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.player}
            />
          ) : (
            <button
              type="button"
              onClick={() => play(idx)}
              className={styles.poster}
              aria-label={`Play ${chapter.name}'s story`}
            >
              <Image
                src={chapter.poster}
                alt=""
                fill
                sizes="(max-width: 1024px) 82vw, 460px"
                className={styles.posterImg}
              />
              <span className={styles.posterScrim} aria-hidden="true" />
              <span className={styles.playBtn}>
                <Play size={18} fill="currentColor" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>

        <div className={styles.cardBody}>
          <span className={styles.cardIndex} aria-hidden="true">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <blockquote className={styles.quote}>{chapter.quote}</blockquote>
          <footer className={styles.attribution}>
            <span className={styles.cardName}>{chapter.name}</span>
            <span className={styles.cardRole}>{chapter.role}</span>
          </footer>
        </div>
      </article>
    );
  });

  const header = (
    <div className={styles.header}>
      <div className={styles.headText}>
        <p className="kicker">The Testimonials</p>
        <h2 className={`displayLg ${styles.heading}`}>
          Not our words.
          <br />
          <span className={styles.accent}>Theirs.</span>
        </h2>
      </div>
      <p className={styles.lede}>
        Founders who have already done the work with Alfred — on the record, in
        their own words. {EVENT.durationDays} days in the Kerala rainforest, one
        company rebuilt in the room.
      </p>
    </div>
  );

  const rail = (
    <div className={styles.railFrame}>
      {pinned ? (
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {cards}
        </motion.div>
      ) : (
        <div ref={trackRef} className={`${styles.track} ${styles.trackSwipe}`}>
          {cards}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className={styles.footer}>
      <div className={styles.meter} aria-hidden="true">
        <motion.span
          className={styles.meterFill}
          style={pinned ? { scaleX: progressSpring } : undefined}
        />
      </div>
      <p className={styles.counter} aria-hidden="true">
        <span className={styles.counterNow}>
          {String(activeIdx + 1).padStart(2, "0")}
        </span>
        <span className={styles.counterOf}>
          / {String(ALL_CHAPTERS.length).padStart(2, "0")}
        </span>
      </p>
      <BookCallButton showArrow>Join The Wait List</BookCallButton>
    </div>
  );

  // The whole section pins, not just the rail: the heading, the meter and
  // the CTA hold their place while only the cards move. Pinning the rail
  // alone left the heading scrolling away above it, which broke the frame
  // the cards were supposed to be travelling inside.
  return (
    <section
      ref={sectionRef}
      id="film"
      className={styles.section}
      style={pinned ? { height: `calc(100svh + ${travel}px)` } : undefined}
    >
      <div ref={pinRef} className={pinned ? styles.pinned : styles.static}>
        {pinned ? (
          <>
            {header}
            {rail}
            {footer}
          </>
        ) : (
          <>
            <Reveal>{header}</Reveal>
            {rail}
            <Reveal delay={0.1}>{footer}</Reveal>
          </>
        )}
      </div>
    </section>
  );
}
