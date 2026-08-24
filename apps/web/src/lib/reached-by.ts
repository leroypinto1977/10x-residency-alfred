/**
 * Shared "is this section near the viewport yet" check.
 *
 * Lifted out of PhotoWall so the group-chat marquee can use the same one.
 * Both sections need it for the same reason and would fail the same way
 * without it, and the reasoning below is the kind that should exist once.
 */

/**
 * Calls `flag(true)` once `node` comes within `margin` px of the viewport,
 * and cleans up after itself.
 *
 * This was an IntersectionObserver, which is the obvious tool and was the
 * wrong one here, because both things it gated were load-bearing: the plane
 * is `opacity: 0` until it settles, and the tiles stay `loading="lazy"` until
 * they arm. An observer that never fires therefore did not degrade the wall,
 * it erased it — a section of two dozen photographs rendering as an empty
 * black band with no way to recover. Confirmed reachable: with the stage 71%
 * inside the viewport, neither callback had run and none of the 48 images had
 * loaded.
 *
 * A rect check cannot fail that way. It runs immediately, again on scroll and
 * resize, and once on a timer regardless — so the worst case is the entrance
 * animation being missed, never the wall being invisible.
 */
export function reachedBy(
  node: HTMLElement | null,
  margin: number,
  flag: (v: true) => void
): (() => void) | undefined {
  if (!node) return;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    flag(true);
    cleanup();
  };

  const check = () => {
    if (done) return;
    const r = node.getBoundingClientRect();
    if (r.top - margin < window.innerHeight && r.bottom + margin > 0) finish();
  };

  // Belt to the rect check's braces: a browser that mis-reports rects inside
  // a preserve-3d ancestor, or a restored scroll position that fires no
  // scroll event, still ends with a visible wall.
  const timer = window.setTimeout(finish, 3000);

  function cleanup() {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", check);
    window.removeEventListener("resize", check);
  }

  check();
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  return cleanup;
}
