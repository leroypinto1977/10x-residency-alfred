"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Play } from "lucide-react";
import Reveal from "@/components/Reveal";
import BookCallButton from "@/components/BookCallButton";
import { getEmbedUrl } from "@/lib/video";
import { EVENT } from "@/lib/event";
import alfredImg from "../../../public/alfred.jpg";
import pavanImg from "../../../public/pavan_img.jpg";
import pushpaImg from "../../../public/Pushpa_img.jpg";
import oviyaImg from "../../../public/oviya.jpg";
import styles from "./Film.module.css";

interface Chapter {
  /** Label on the selector chip. */
  name: string;
  role: string;
  /** Line shown under the player while this chapter is selected. */
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
  const [activeIdx, setActiveIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const active = ALL_CHAPTERS[activeIdx];
  const embedUrl = getEmbedUrl(active.url);

  // Switching chapter always returns to the poster — otherwise the previous
  // chapter's iframe would keep playing audio behind the new selection.
  const selectChapter = (idx: number) => {
    setActiveIdx(idx);
    setPlaying(false);
  };

  return (
    <section id="film" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className="kicker">The film</p>
          <h2 className="displayLg">
            Inside <span className={styles.accent}>{EVENT.name}</span>.
          </h2>
          <p className={styles.lede}>
            {EVENT.durationDays} days in the Kerala rainforest, one company rebuilt in the room.
            These are founders who have already been through the work with Alfred, in their own
            words, not ours.
          </p>
        </Reveal>

        <Reveal delay={0.15} className={styles.stageWrap}>
          {/* Offset accent frame — the same signature the sibling residency
              site uses, in Founder 10X's gold rather than its amber. */}
          <div className={styles.offsetFrame} aria-hidden="true" />

          <div className={styles.stage}>
            {playing && embedUrl ? (
              <iframe
                key={active.url}
                src={embedUrl}
                title={`${active.name} on ${EVENT.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.player}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className={styles.poster}
                aria-label={`Play ${active.name}'s story`}
              >
                <Image
                  key={active.name}
                  src={active.poster}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 860px"
                  className={styles.posterImg}
                  priority={false}
                />
                <span className={styles.scrim} aria-hidden="true" />
                <span className={styles.playBtn}>
                  <Play size={26} fill="currentColor" aria-hidden="true" />
                </span>
                <span className={styles.posterMeta}>
                  <span className={styles.posterName}>{active.name}</span>
                  <span className={styles.posterRole}>{active.role}</span>
                </span>
              </button>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className={styles.caption}>{active.caption}</p>
        </Reveal>

        {ALL_CHAPTERS.length > 1 && (
          <Reveal delay={0.25} className={styles.rail}>
            {ALL_CHAPTERS.map((chapter, idx) => (
              <button
                key={chapter.name}
                type="button"
                onClick={() => selectChapter(idx)}
                className={`${styles.chip} ${idx === activeIdx ? styles.chipActive : ""}`}
                aria-pressed={idx === activeIdx}
              >
                <span className={styles.chipThumb}>
                  <Image
                    src={chapter.poster}
                    alt=""
                    fill
                    sizes="56px"
                    className={styles.chipImg}
                  />
                </span>
                <span className={styles.chipText}>
                  <span className={styles.chipName}>{chapter.name}</span>
                  <span className={styles.chipRole}>{chapter.role}</span>
                </span>
              </button>
            ))}
          </Reveal>
        )}

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
