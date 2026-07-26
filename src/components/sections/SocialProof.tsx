"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Play, Star, User, X, Quote } from "lucide-react";
import pavanImg from "../../../public/pavan_img.jpg";
import pushpaImg from "../../../public/Pushpa_img.jpg";
import oviyaImg from "../../../public/oviya.jpg";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./SocialProof.module.css"

interface Testimonial {
  name: string;
  role: string;
  videoUrl?: string;
  posterUrl?: StaticImageData;
  posterPosition?: string;
  title?: string;
  description?: string;
  rating?: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "PAVAN",
    role: "Career Consultant",
    videoUrl: "https://www.youtube.com/shorts/8WpYPLZ7TzE",
    posterUrl: pavanImg,
  },
  {
    name: "PUSHPALATHA",
    role: "Makeup Artist & Trainer",
    videoUrl: "https://www.youtube.com/watch?v=qjVYETJP1HA",
    posterUrl: pushpaImg,
  },
  {
    name: "OVYA VIGNESH",
    role: "Founder Of Malola Foods ",
    videoUrl: "https://www.youtube.com/shorts/E9KQ3CQzDhA",
    posterUrl: oviyaImg,
  }
];

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function SocialProof() {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  return (
    <section id="testimonials" className={styles.section}>
      <Reveal className={styles.sectionHeader}>
        <span className={styles.sectionTag}>Trusted & Proven</span>
        <h2>Real Success Stories</h2>
        <p>Trusted by ambitious entrepreneurs and backed by proven results.</p>
      </Reveal>

      <Reveal stagger className={styles.grid}>
        {TESTIMONIALS.map((t, idx) => {
          const videoId = t.videoUrl ? getYouTubeId(t.videoUrl) : null;
          const isLocalVideo = Boolean(t.videoUrl) && !videoId;
          const isPlaying = playingIdx === idx && (Boolean(videoId) || isLocalVideo);

          const isVideoCard = Boolean(videoId) || isLocalVideo;
          const initials = t.name
            .replace(/[[\]]/g, "")
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          if (isVideoCard) {
            return (
              <RevealItem className={`${styles.card} ${styles.videoCard}`} key={`${t.name}-${idx}`}>
                <div className={styles.thumb}>
                  {isPlaying ? (
                    <>
                      {videoId ? (
                        <iframe
                          key={videoId}
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                          title={`${t.name} video testimonial`}
                          className={styles.video}
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={t.videoUrl}
                          src={t.videoUrl}
                          className={styles.video}
                          controls
                          autoPlay
                          playsInline
                        />
                      )}
                      <button
                        type="button"
                        className={styles.stopBtn}
                        onClick={() => setPlayingIdx(null)}
                        aria-label="Stop video"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <>
                      {t.posterUrl ? (
                        <Image
                          src={t.posterUrl}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          className={styles.posterImg}
                          style={t.posterPosition ? { objectPosition: t.posterPosition } : undefined}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          <User size={28} aria-hidden="true" />
                        </div>
                      )}

                      <div className={styles.scrim} aria-hidden="true" />

                      <button
                        type="button"
                        className={styles.playBtn}
                        onClick={() => setPlayingIdx(idx)}
                        aria-label={`Play video testimonial from ${t.name}`}
                      >
                        <Play size={13} fill="currentColor" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>

                {/* Kept below the video (rather than overlaid on it) so the
                    name/niche stays visible while playing too. */}
                <div className={styles.videoCaption}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.role}>{t.role}</span>
                </div>
              </RevealItem>
            );
          }

          return (
            <RevealItem className={styles.card} key={`${t.name}-${idx}`}>
              <div className={styles.body}>
                <Quote size={18} className={styles.quoteIcon} aria-hidden="true" />

                <div className={styles.author}>
                  <span className={styles.avatarInitials} aria-hidden="true">
                    {initials}
                  </span>
                  <div>
                    <span className={styles.name}>{t.name}</span>
                    <span className={styles.role}>{t.role}</span>
                  </div>
                </div>

                {t.title && <h3 className={styles.cardTitle}>{t.title}</h3>}
                {t.description && <p className={styles.description}>{t.description}</p>}

                {typeof t.rating === "number" && (
                  <div className={styles.rating} aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < t.rating! ? "currentColor" : "none"} />
                    ))}
                  </div>
                )}
              </div>
            </RevealItem>
          );
        })}
      </Reveal>
    </section>
  );
}
