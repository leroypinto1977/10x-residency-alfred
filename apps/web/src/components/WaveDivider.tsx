"use client";

import { useId } from "react";

interface WaveDividerProps {
  /** Color of the section above — fills the scallop bumps. */
  top?: string;
  /** Color of the section below — fills between/around the bumps. */
  bottom?: string;
  /** Width of one scallop, in px. */
  width?: number;
  /** How deep each bump dips below the resting line, in px. */
  height?: number;
  /** Applied to the wrapper div — for positioning it against the section
   *  it sits inside (e.g. `position: absolute; top: 0`). */
  className?: string;
}

/**
 * A decorative scalloped divider between a light section and a dark one.
 *
 * Built from a single repeating SVG `<pattern>` tile rather than a
 * stretched raster image, so the scallop stays a fixed pixel size at any
 * viewport width instead of distorting into sharp zigzags on mobile — the
 * failure mode a background-image version of this hit before being
 * rebuilt as this component.
 */
export default function WaveDivider({
  top = "#f3efe8",
  bottom = "#050505",
  width = 80,
  height = 20,
  className,
}: WaveDividerProps) {
  const id = useId();
  const patternId = `wave-divider-${id}`;

  // The peak sits at ~63% across each tile rather than the midpoint — a
  // longer, gentle rise on the left of each bump and a shorter drop on the
  // right, which is what reads as the wave leaning rather than a symmetric,
  // upright scallop. Each cubic control point still shares its nearest
  // anchor's y-value (0 at the peak, `height` at the valleys either side),
  // so the tangent stays horizontal — and matching — at every anchor,
  // keeping the curve smooth both within a tile and across the seam into
  // the next one. The lean reads as gentle rather than a sharp mountain
  // peak because `height` is shallow relative to `width` (about 1:4) —
  // reproducing that at 1:2 was what made an earlier pass look spiky.
  const peakX = width * 0.63;
  const dxA = peakX / 2;
  const dxB = (width - peakX) / 2;
  const domePath = `M0,0 L${width},0 L${width},${height}
    C${width - dxB},${height} ${peakX + dxB},0 ${peakX},0
    C${peakX - dxA},0 ${dxA},${height} 0,${height} Z`;

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ lineHeight: 0, background: bottom }}
    >
      <svg width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <rect width={width} height={height} fill={bottom} />
            <path d={domePath} fill={top} />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
