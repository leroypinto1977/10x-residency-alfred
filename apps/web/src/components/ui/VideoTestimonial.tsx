"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Play, User } from "lucide-react";
import styles from "./VideoTestimonial.module.css";

interface VideoTestimonialProps {
  name: string;
  role: string;
  videoUrl?: string;
  posterUrl?: string;
}

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

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const youTubeId = getYouTubeId(url);
  if (youTubeId) return `https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0`;

  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;

  return null;
}

export default function VideoTestimonial({ name, role, videoUrl, posterUrl }: VideoTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hasVideo = Boolean(videoUrl);
  const embedUrl = useMemo(() => (videoUrl ? getEmbedUrl(videoUrl) : null), [videoUrl]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.thumb}>
        {isPlaying && hasVideo ? (
          embedUrl ? (
            <iframe
              src={embedUrl}
              className={styles.video}
              title={`${name} video testimonial`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              poster={posterUrl}
              className={styles.video}
              controls
              autoPlay
              playsInline
            />
          )
        ) : (
          <>
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw"
                className={styles.posterImg}
              />
            ) : (
              <div className={styles.avatarFallback}>
                <User size={26} aria-hidden="true" />
              </div>
            )}
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => hasVideo && setIsPlaying(true)}
              aria-label={hasVideo ? `Play video testimonial from ${name}` : "Video testimonial coming soon"}
              aria-disabled={!hasVideo}
            >
              <Play size={20} fill="currentColor" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <div className={styles.caption}>
        <span className={styles.name}>{name}</span>
        <span className={styles.role}>{role}</span>
      </div>
    </div>
  );
}
