import BookCallButton from "@/components/BookCallButton";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import { EVENT } from "@/lib/event";
import styles from "./Footer.module.css";

// Same structure as the "Become an Authority" footer: the programme name
// set oversized as a sign-off, then a three-column row, then a thin
// bottom bar. Keeps the two residency sites ending the same way.
const LINKS: [string, string][] = [
  ["The Testimonials", "#film"],
  ["What changes", "#transformation"],
  ["The location", "#location"],
  ["Your host", "#mentor"],
  ["What you build", "#outcomes"],
  ["FAQ", "#faq"],
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Reveal>
          <p className={styles.wordmark}>
            Founder{" "}
            <span className={styles.accent}>10X.</span>
          </p>
        </Reveal>

        <Reveal stagger className={styles.row}>
          <RevealItem className={styles.brandCol}>
            <p className={styles.brand}>
              GOAT<span className={styles.accent}>.</span>Media
            </p>
            <p className={styles.blurb}>
              A {EVENT.durationDays}-day founder residency in {EVENT.venue}, hosted by Alfred
              Joshua and {EVENT.host}.
            </p>
          </RevealItem>

          <RevealItem>
            <nav className={styles.nav} aria-label="Page sections">
              {LINKS.map(([label, href]) => (
                <a key={href} href={href} className={styles.navLink}>
                  {label}
                </a>
              ))}
            </nav>
          </RevealItem>

          <RevealItem className={styles.ctaCol}>
            <BookCallButton showArrow>Book a Call</BookCallButton>
            <p className={styles.ctaNote}>
              {EVENT.seatFeeLabel} blocks your seat. We personally contact everyone who applies.
            </p>
          </RevealItem>
        </Reveal>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} {EVENT.host}. All rights reserved.</p>
          <p>
            {EVENT.name} · {EVENT.venue}
          </p>
        </div>
      </div>
    </footer>
  );
}
