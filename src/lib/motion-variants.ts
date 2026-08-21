import type { Variants } from "framer-motion";

// The CSS side of this vocabulary lives in globals.css as --ease-soft /
// --ease-glide / --ease-entrance. Keep the two in step: a section whose
// hover easing disagrees with its entrance easing reads as two different
// designs stacked on top of each other.
//
// SOFT is deliberately gentler than the old [0.16, 1, 0.3, 1]: that curve
// front-loads almost all its movement, which is punchy but lands hard.
// [0.22, 1, 0.36, 1] keeps the long tail and takes the edge off the
// arrival, which is the whole difference between "snappy" and "expensive".
const SOFT = [0.22, 1, 0.36, 1] as const;

// Every variant below explicitly sets x, y, and scale in both "hidden" and
// "show" states (even when a given variant doesn't use one of those axes).
// Components that pick between variants based on isMobile (SSR-safe, so it
// starts false and corrects after hydration) can have the variants object
// itself swap out mid-lifecycle — Framer Motion only interpolates properties
// present in the *new* variant, so if e.g. slideInMobile omitted `x`, a
// stale x offset from an earlier slideInLeft/Right render would never get
// cleared, leaving the element permanently shifted off its resting position.
export const fadeUp: Variants = {
  hidden: { opacity: 0, x: 0, y: 28, scale: 0.985 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: SOFT },
  },
};

// Shorter travel distance and faster settle for mobile — same motion
// language, lighter weight on smaller/lower-powered devices.
export const fadeUpMobile: Variants = {
  hidden: { opacity: 0, x: 0, y: 12, scale: 0.99 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: SOFT },
  },
};

// Directional variants for alternating left/right layouts (e.g. Features'
// image+text rows). Same rise/scale/fade language, entering from the side.
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -36, y: 0, scale: 0.985 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.95, ease: SOFT },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 36, y: 0, scale: 0.985 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.95, ease: SOFT },
  },
};

export const slideInMobile: Variants = {
  hidden: { opacity: 0, x: 0, y: 12, scale: 0.99 },
  show: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: SOFT },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

export const staggerContainerMobile: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};
