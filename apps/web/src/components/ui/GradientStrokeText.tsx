"use client";

import { useEffect, useId, useRef, useState } from "react";

interface GradientStop {
  offset: string;
  color: string;
}

interface GradientStrokeTextProps {
  /** Each string renders as one visual line. */
  lines: string[];
  /** Read by screen readers; the SVG's own text nodes are hidden from the accessibility tree so it isn't announced twice. */
  ariaLabel: string;
  /** Classes controlling font-size (e.g. a `text-[clamp(...)]` utility) and letter-spacing, applied to every line. Font, weight and style are fixed below. */
  textClassName: string;
  className?: string;
  lineHeight?: number;
  strokeWidthEm?: number;
  gradientStops?: GradientStop[];
}

const DEFAULT_STOPS: GradientStop[] = [
  { offset: "0%", color: "#C69F64" },
  { offset: "50%", color: "#A4742F" },
  { offset: "100%", color: "#2E281A" },
];

// Rough pre-measurement guess (see the effect below) so the element isn't
// 0×0 for the one server-rendered frame before hydration.
function fallbackBox(lines: string[], lineHeight: number) {
  const longest = Math.max(...lines.map((l) => l.length));
  const assumedFontPx = 70;
  return {
    width: longest * 0.62 * assumedFontPx,
    height: lines.length * assumedFontPx * lineHeight + assumedFontPx * 0.35,
  };
}

/**
 * Hollow, gradient-outlined display text.
 *
 * `-webkit-text-stroke` only ever takes a solid colour, so a left-to-right
 * gradient *outline* (fill staying transparent) has to be real SVG —
 * `fill="transparent"` with `stroke="url(#...)"` — rather than the
 * background-clip trick, which paints the gradient inside the letters
 * instead of just tracing them.
 *
 * Sizing is measured, not guessed: each line lays out at its real CSS
 * font-size (via `textClassName`, typically a `text-[clamp(...)]` utility)
 * and a `getBBox()` read after paint sets the SVG's own pixel width/height
 * and viewBox to exactly wrap the text — 1:1, no viewBox-driven scaling —
 * so nothing clips or stretches. It re-measures on resize and once the
 * variable font finishes loading, since Poppins's italic-800 metrics aren't
 * known until then.
 */
export default function GradientStrokeText({
  lines,
  ariaLabel,
  textClassName,
  className = "",
  lineHeight = 0.95,
  strokeWidthEm = 0.049,
  gradientStops = DEFAULT_STOPS,
}: GradientStrokeTextProps) {
  const gradientId = useId();
  const groupRef = useRef<SVGGElement>(null);
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number }>(() => ({
    x: 0,
    y: 0,
    ...fallbackBox(lines, lineHeight),
  }));

  useEffect(() => {
    const measure = () => {
      const g = groupRef.current;
      if (!g) return;
      // Throws (rather than returning a zero box) in some browsers when a
      // sibling responsive instance of this component is `display:none` —
      // HeroContent renders a mobile and a desktop line-break variant side
      // by side, swapped with Tailwind's `hidden`/breakpoint classes.
      try {
        const bbox = g.getBBox();
        if (bbox.width > 0 && bbox.height > 0) setBox(bbox);
      } catch {
        // not currently rendered — leave the existing box alone
      }
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join("|"), textClassName]);

  const pad = 4;
  const viewBox = `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={viewBox}
      className={className}
      style={{
        width: box.width + pad * 2,
        // Renders at its real, measured size by default (driven by the real
        // CSS font-size in `textClassName`), but this is still a hard
        // safety net against horizontal overflow: if some ancestor ever
        // constrains it narrower than that natural size, it shrinks to fit
        // instead of spilling out. `height: auto` + the viewBox above keep
        // it proportional rather than squashed.
        maxWidth: "100%",
        height: "auto",
        display: "inline-block",
        overflow: "visible",
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      {/* Each line references the gradient independently so it sweeps light-to-dark
          across its own width, rather than one sweep shared across the whole block
          (which would leave a short line like "business?" never reaching the dark end). */}
      <g ref={groupRef} aria-hidden="true">
        {lines.map((line, i) => (
          <text
            key={line}
            x="0"
            y={`${1 + i * lineHeight}em`}
            fontFamily="var(--font-poppins), sans-serif"
            fontWeight={800}
            fontStyle="italic"
            fill="transparent"
            stroke={`url(#${gradientId})`}
            strokeWidth={`${strokeWidthEm}em`}
            strokeLinejoin="round"
            className={textClassName}
          >
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}
