// Shared video-URL helpers.
//
// This parsing was duplicated in three places (SocialProof, the unused
// ui/VideoTestimonial, and now the Film section). One copy means a URL
// shape we don't handle yet — a new Shorts/live format, say — gets fixed
// once instead of drifting between sections.

const YOUTUBE_PATTERNS = [
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
];

export function getYouTubeId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Autoplaying embed URL for a video, or `null` if the URL isn't a
 * recognised host (in which case the caller should treat it as a direct
 * file and hand it to a <video> element).
 *
 * YouTube goes through youtube-nocookie so no tracking cookie is set
 * until a visitor actually presses play.
 */
export function getEmbedUrl(url: string): string | null {
  const youTubeId = getYouTubeId(url);
  if (youTubeId) {
    return `https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0`;
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;

  return null;
}
