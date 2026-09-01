"use client";

import { useCallback, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Play } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import BookCallButton from "@/components/BookCallButton";
import { getEmbedUrl } from "@/lib/video";
import { EVENT } from "@/lib/event";
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

/**
 * The testimonials.
 *
 * This used to be a scroll-pinned horizontal rail: the section stood
 * 100vh + 85vh tall, held its frame still with `position: sticky`, and
 * turned vertical scroll into sideways travel for a track of cards, with a
 * spring chasing the scroll position and a progress meter reading it back.
 * It is a plain vertical list now — three rows, read top to bottom, in
 * normal document flow.
 *
 * What went with the pin: the travel measurement and its ResizeObserver,
 * the two motion values and their springs, the scroll handler, the
 * active-card dimming (nothing is off-centre in a list, so nothing needs to
 * sit back), and the meter and 01/03 counter, which existed only to report
 * a position along the rail. The `Reveal` entrances every other section
 * uses cover the rest.
 */
export default function Film() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // One player at a time: two open iframes means two soundtracks.
  const play = useCallback((idx: number) => setPlayingIdx(idx), []);

  return (
    <section id="film" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.header}>
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
        </Reveal>

        <Reveal stagger className={styles.list}>
          {ALL_CHAPTERS.map((chapter, idx) => {
            const embedUrl = getEmbedUrl(chapter.url);
            const isPlaying = playingIdx === idx;

            return (
              <RevealItem key={chapter.name} className={styles.card}>
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
                        sizes="(max-width: 860px) 92vw, 620px"
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
              </RevealItem>
            );
          })}
        </Reveal>

        <Reveal delay={0.1} className={styles.footer}>
          <BookCallButton showArrow>Book a Call</BookCallButton>
        </Reveal>
      </div>
    </section>
  );
}
