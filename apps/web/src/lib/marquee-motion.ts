/**
 * The scroll-velocity marquee, as arithmetic.
 *
 * Kept apart from the component so the behaviour can be exercised without a
 * browser: everything here is a pure function of (time, scroll offset), and the
 * component's only job is to feed it `performance.now()` / `window.scrollY`
 * once a frame and write the resulting offsets out as transforms.
 */

/** Idle drift, px/s. Slow enough to read as texture rather than motion. */
export const BASE_SPEED = 26;

/** How much of the page's scroll velocity the strip inherits. */
export const SCROLL_BOOST = 0.32;

/** Ceiling on the inherited speed, px/s — past this the images strobe. */
export const MAX_BOOST = 1700;

/**
 * The same ceiling, expressed as the scroll velocity that reaches it.
 *
 * The clamp is applied to the velocity going *into* the filter rather than to
 * the speed coming out, because the filter has memory. An in-page anchor jump
 * reads as a single frame of several million px/s; clamped on the way out, that
 * number still sits inside `velocity`, and since the filter only sheds
 * `SMOOTHING` of it per frame the strip runs flat out for well over a second
 * after the page has already stopped. Clamped on the way in, the spike is never
 * in there to drain — and the visible result is identical, because everything
 * above this reading was going to be clipped to `MAX_BOOST` anyway.
 */
export const MAX_VELOCITY = MAX_BOOST / SCROLL_BOOST;

/**
 * Per-frame approach factor for the velocity low-pass (0..1).
 *
 * A wheel notch is a spike of several thousand px/s lasting a single frame; fed
 * in raw, the strip would flick rather than surge. Easing toward the reading
 * instead gives the pickup and the coast-down that read as momentum.
 */
export const SMOOTHING = 0.14;

/**
 * Longest delta a single frame may be credited with, in seconds.
 *
 * After a stall — a long task, a tab restored from the background — `now` can
 * jump by seconds. Without the clamp that arrives as one enormous step and the
 * strip teleports.
 */
export const MAX_FRAME = 0.05;

/**
 * How long after a viewport resize the scroll position stays untrustworthy, ms.
 *
 * Long enough to cover the chrome's slide (~200-300ms) from the last resize
 * event it emits, since the browser re-arms this throughout the animation.
 */
export const CHROME_SETTLE_MS = 250;

export type MarqueeRow = {
  /** +1 walks left, -1 walks right. */
  dir: 1 | -1;
  /** Distance walked, always within [0, half). */
  offset: number;
  /** Loop length — half the track, since each row renders its images twice. */
  half: number;
};

export type MarqueeEngine = {
  rows: MarqueeRow[];
  /** Smoothed page scroll velocity, px/s. */
  velocity: number;
  /**
   * Advance every row. `now` is in ms, `scrollY` in px.
   *
   * `ignoreScroll` re-anchors the scroll reading without letting it reach the
   * velocity filter — for frames where `scrollY` moved but the user did not.
   */
  step(now: number, scrollY: number, ignoreScroll?: boolean): void;
  /** Re-anchor time and scroll without moving anything — used when restarting. */
  reset(now: number, scrollY: number): void;
};

export function createMarqueeEngine(dirs: (1 | -1)[]): MarqueeEngine {
  const rows: MarqueeRow[] = dirs.map((dir) => ({ dir, offset: 0, half: 0 }));
  let last = 0;
  let lastY = 0;
  let primed = false;

  return {
    rows,
    velocity: 0,

    reset(now: number, scrollY: number) {
      last = now;
      lastY = scrollY;
      primed = false;
      this.velocity = 0;
    },

    step(now: number, scrollY: number, ignoreScroll = false) {
      // The first frame after a reset has no previous sample to difference
      // against, so it establishes the baseline and moves nothing.
      if (!primed) {
        primed = true;
        last = now;
        lastY = scrollY;
        return;
      }

      const dt = Math.min((now - last) / 1000, MAX_FRAME);
      last = now;

      if (ignoreScroll) {
        // The browser moved the page out from under the reading — re-anchor to
        // where it landed and leave `velocity` alone. Leaving it alone, rather
        // than zeroing it, is the point: the chrome only slides while the user
        // is already scrolling, so the velocity from just before the collapse
        // is the best estimate of the flick still in progress. The strip coasts
        // through the disturbance instead of lurching or going dead.
        lastY = scrollY;
      } else {
        const measured = dt > 0 ? (scrollY - lastY) / dt : 0;
        const raw = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, measured));
        lastY = scrollY;
        this.velocity += (raw - this.velocity) * SMOOTHING;
      }

      const boost = this.velocity * SCROLL_BOOST;

      for (const r of rows) {
        if (!r.half) continue;
        r.offset += r.dir * (BASE_SPEED + boost) * dt;
        // Wrap into [0, half). The double modulo is what keeps it correct when
        // scrolling up drives the offset negative.
        r.offset = ((r.offset % r.half) + r.half) % r.half;
      }
    },
  };
}

/**
 * Rescale an offset when the loop length changes under it (a resize, or the
 * images finishing their decode), so the strip holds its visible position
 * instead of jumping.
 */
export function rescale(offset: number, from: number, to: number) {
  return from > 0 ? (offset / from) * to : offset;
}
