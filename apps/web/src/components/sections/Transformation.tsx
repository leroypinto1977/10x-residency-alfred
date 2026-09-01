"use client";

import { motion } from "framer-motion";
import { SOFT } from "@/lib/motion-variants";
import {
  Megaphone,
  Users,
  Network,
  Workflow,
  Settings2,
  Package,
  TrendingUp,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./Transformation.module.css";

// The seven core functions, in the order the three days work through them.
// This list is the page's spine: Outcomes ships the artefact each one
// produces, and the FAQ's "what happens across the 3 days" answer names
// them in this same order, so all three have to move together.
const STEPS = [
  {
    icon: Megaphone,
    title: "Powerful Social Media",
    line: "Turn your presence into a pipeline — content and brand that pull in customers and talent without you chasing either.",
  },
  {
    icon: Users,
    title: "Your A-Team",
    line: "Stop hiring by accident. Build the roles, the people and the hierarchy that let you delegate for real.",
  },
  {
    icon: Network,
    title: "Org Structure to Scale",
    line: "A structure that holds when you're not in the room — clear ownership, clear reporting, no bottleneck at the top.",
  },
  {
    icon: Workflow,
    title: "Process to Expand",
    line: "Replace tribal knowledge with documented, repeatable process, so growth doesn't break the business that's growing.",
  },
  {
    icon: Settings2,
    title: "Systems to Scale",
    line: "The operational backbone — the tools and workflows that carry load without more of your personal hours.",
  },
  {
    icon: Package,
    title: "Productise Your Business",
    line: "Package what you sell into something repeatable and sellable, instead of a custom favour every time.",
  },
  {
    icon: TrendingUp,
    title: "Scale Your Brand",
    line: "Grow a brand bigger than your personal name, so the business doesn't cap out at your bandwidth.",
  },
];

// The connector line "draws in" after the nodes have revealed — a short
// fixed delay rather than joining the parent stagger, since it needs to
// visually trail behind every node regardless of how many there are.
//
// Desktop lost its horizontal rule when the list went from four steps to
// seven: seven nodes wrap onto two rows, and a single line behind them can
// only ever reach the first. The vertical spine survives on mobile, where
// the steps are still one column and the line still means "in this order",
// and it is hidden in CSS rather than by a breakpoint hook — the element is
// decorative, and gating it on hydration would pop it in a beat late.
const lineVariants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: { scaleY: 1, opacity: 1, transition: { duration: 0.9, delay: 0.5, ease: SOFT } },
};

export default function Transformation() {
  return (
    <section id="transformation" className={`${styles.section} onLight`}>
      {/* Full-bleed wrapper + inner max-width column. The section element
          used to be the max-width box itself, so it had nothing to paint a
          background onto and the fixed particle layer showed through. */}
      <div className={styles.inner}>
        <Reveal className={styles.sectionHeader}>
          <p className="kicker kickerOnLight">The transformation</p>
          <h2 className="displayLg">
            From doing everything yourself, to a business that runs the seven things that
            scale it.
          </h2>
          <p className={styles.lede}>
            Mastering the seven core functions of the business — the ones that decide whether
            it grows past you or stops with you.
          </p>
        </Reveal>

        <Reveal stagger className={styles.timeline}>
          <motion.div
            className={styles.line}
            aria-hidden="true"
            variants={lineVariants}
            style={{ transformOrigin: "top" }}
          />
          {STEPS.map((step, idx) => (
            <RevealItem className={styles.step} key={step.title}>
              <div className={styles.node}>
                <step.icon size={22} aria-hidden="true" />
              </div>
              <div className={styles.stepText}>
                <span className={styles.num}>{String(idx + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.line}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
