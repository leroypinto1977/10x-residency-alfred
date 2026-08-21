"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useMotionValue } from "framer-motion";
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
  /** Line shown under this chapter's poster. */
  caption: string;
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
type HostFilm = { url: string; caption: string };

const FILM: { host: HostFilm | null } = { host: null };

const CHAPTERS: Chapter[] = [
  {
    name: "Pavan",
    role: "Career Consultant",
    caption: "From consulting one client at a time to a business that fills its own pipeline.",
    url: "https://www.youtube.com/shorts/8WpYPLZ7TzE",
    poster: pavanImg,
  },
  {
    name: "Pushpalatha",
    role: "Makeup Artist & Trainer",
    caption: "A craft turned into a company: pricing, positioning and a training arm that scales.",
    url: "https://www.youtube.com/watch?v=qjVYETJP1HA",
    poster: pushpaImg,
  },
  {
    name: "Ovya Vignesh",
    role: "Founder, Malola Foods",
    caption: "Running the numbers properly, and finally knowing which product actually makes money.",
    url: "https://www.youtube.com/shorts/E9KQ3CQzDhA",
    poster: oviyaImg,
  },
];

const ALL_CHAPTERS: Chapter[] = FILM.host
  ? [
      {
        name: "Alfred Joshua",
        role: `CEO, ${EVENT.host}`,
        caption: FILM.host.caption,
        url: FILM.host.url,
        poster: alfredImg,
      },
      ...CHAPTERS,
    ]
  : CHAPTERS;

export default function Film() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const isDesktop = useIsDesktop();
  const reduceMotion = useSafeReducedMotion();
  // Pinning is an enhancement, never the only way to reach a card. It stays
  // off for SSR, for reduced motion, and on anything narrower than a laptop,
  // where hijacking vertical scroll to move a rail sideways fights the
  // gesture people already use. Those cases get a plain swipeable rail.
  const pinned = isDesktop && !reduceMotion;

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
      if (!track) return;
      setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    // Both are needed and neither is enough alone: the track's own width
    // settles late (fonts, image layout), and the viewport width it is
    // measured against changes independently. Observing documentElement
    // rather than listening for `resize` also catches viewport changes that
    // never fire a resize event.
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [pinned]);

  // Driven from a scroll listener rather than framer's useScroll. useScroll
  // measures its target once and on window resize, and this wrapper only
  // gets its height after `travel` resolves — so it latched onto a
  // zero-height target and the rail never moved. Reading the rect per frame
  // is always current, whatever reflows underneath it.
  const x = useMotionValue(0);

  useEffect(() => {
    if (!pinned || travel <= 0) {
      x.set(0);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) return;
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      x.set(-travel * progress);
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
  }, [pinned, travel, x]);

  // One player at a time: two open iframes means two soundtracks.
  const play = useCallback((idx: number) => setPlayingIdx(idx), []);

  const cards = ALL_CHAPTERS.map((chapter, idx) => {
    const embedUrl = getEmbedUrl(chapter.url);
    const isPlaying = playingIdx === idx;

    return (
      <article key={chapter.name} className={styles.card}>
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
                sizes="(max-width: 1024px) 82vw, 620px"
                className={styles.posterImg}
              />
              <span className={styles.scrim} aria-hidden="true" />
              <span className={styles.playBtn}>
                <Play size={26} fill="currentColor" aria-hidden="true" />
              </span>
              <span className={styles.posterMeta}>
                <span className={styles.posterName}>{chapter.name}</span>
                <span className={styles.posterRole}>{chapter.role}</span>
              </span>
            </button>
          )}
        </div>
        <p className={styles.caption}>{chapter.caption}</p>
      </article>
    );
  });

  return (
    <section id="film" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className="kicker">The Testimonials</p>
          <h2 className="displayLg">
            Inside <span className={styles.accent}>{EVENT.name}</span>.
          </h2>
          <p className={styles.lede}>
            {EVENT.durationDays} days in the Kerala rainforest, one company rebuilt in the room.
            These are founders who have already been through the work with Alfred, in their own
            words, not ours.
          </p>
        </Reveal>
      </div>

      {pinned ? (
        <div
          ref={wrapRef}
          className={styles.pinWrap}
          // Tall enough that the vertical scroll it consumes equals the
          // horizontal distance the track covers — so the rail moves at the
          // same rate as the wheel and the pin releases the moment the last
          // card lands, with no dead scrolling at either end.
          style={{ height: `calc(100vh + ${travel}px)` }}
        >
          <div className={styles.pinViewport}>
            <motion.div ref={trackRef} className={styles.track} style={{ x }}>
              {cards}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className={styles.swipeRail}>
          <div ref={trackRef} className={styles.track}>
            {cards}
          </div>
        </div>
      )}

      <div className={styles.container}>
        <Reveal delay={0.3} className={styles.cta}>
          <BookCallButton showArrow>Join The Wait List</BookCallButton>
          <p className={styles.ctaNote}>
            {EVENT.seats} seats, {EVENT.admission.toLowerCase()}. {EVENT.venue}.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
