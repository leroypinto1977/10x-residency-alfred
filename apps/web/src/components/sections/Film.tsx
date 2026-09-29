"use client";

import { useCallback, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import Reveal from "@/components/Reveal";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
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


export default function Film() {
  const [start, setStart] = useState(0);
  const [playingName, setPlayingName] = useState<string | null>(null);

  const count = ALL_CHAPTERS.length;
  const visible = useMemo(
    () => [ALL_CHAPTERS[start % count], ALL_CHAPTERS[(start + 1) % count]],
    [start, count]
  );

  const goPrev = useCallback(() => {
    setStart((s) => (s - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setStart((s) => (s + 1) % count);
  }, [count]);

  return (
    <section id="film" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.intro}>
          <p className={styles.kicker}>Testimonials</p>
          <h2 className={styles.heading}>
            Not our words.
            <br />
            Theirs.
          </h2>
          <p className={styles.lede}>
            Founders who have already done the work with Alfred — on the record, in their own
            words. {EVENT.durationDays} days in the Kerala rainforest, one company rebuilt in the
            room.
          </p>

          <BookCallButton className={styles.ctaButton} showArrow>
            Apply and Block your Seat
          </BookCallButton>
          <SeatFeeNote tone="light" align="start" className={styles.seatNote} />

          <div className={styles.navRow}>
            <button
              type="button"
              onClick={goPrev}
              className={styles.navBtn}
              aria-label="Show the previous testimonial"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className={`${styles.navBtn} ${styles.navBtnActive}`}
              aria-label="Show the next testimonial"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        <div className={styles.cards}>
          {visible.map((chapter) => {
            const embedUrl = getEmbedUrl(chapter.url);
            const isPlaying = playingName === chapter.name;

            return (
              <div className={styles.card} key={chapter.name}>
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
                      onClick={() => setPlayingName(chapter.name)}
                      className={styles.poster}
                      aria-label={`Play ${chapter.name}'s story`}
                    >
                      <Image
                        src={chapter.poster}
                        alt=""
                        fill
                        sizes="(max-width: 860px) 92vw, 470px"
                        className={styles.posterImg}
                      />
                      <span className={styles.playBtn}>
                        <Play size={20} fill="currentColor" aria-hidden="true" />
                      </span>
                    </button>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <blockquote className={styles.quote}>{chapter.quote}</blockquote>
                  <footer className={styles.attribution}>
                    <span className={styles.cardName}>{chapter.name}</span>
                    <span className={styles.cardRole}>{chapter.role}</span>
                  </footer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
