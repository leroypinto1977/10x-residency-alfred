import BookCallButton from "@/components/BookCallButton";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import WaveDivider from "@/components/WaveDivider";
import { EVENT } from "@/lib/event";
import styles from "./Footer.module.css";

// Same structure as the "Become an Authority" footer: the programme name
// set oversized as a sign-off, then a three-column row, then a thin
// bottom bar. Keeps the two residency sites ending the same way.
const LINKS: [string, string][] = [
  ["Testimonials", "#film"],
  ["Your Mentor", "#mentor"],
  ["The Location", "#location"],
  ["What It Costs", "#seat-fee"],
  ["What You Build", "#outcomes"],
  ["Questions", "#faq"],
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <WaveDivider className={styles.wave} top="#f2eee5" bottom="#08080a" />
      <div className={styles.inner}>
        <Reveal className={styles.masthead}>
          <p className={styles.wordmark}>
            Founder <span className={styles.accent}>10X</span>
          </p>
          <p className={styles.tagline}>
            This is your opportunity to join India&apos;s most exclusive founder residency.
          </p>
        </Reveal>

        <Reveal stagger className={styles.row}>
          <RevealItem className={styles.brandCol}>
            <p className={styles.brand}>
              GOAT<span className={styles.accent}>.</span>Mastermind
            </p>
            <p className={styles.blurb}>
              A {EVENT.durationDays}-day founder residency in {EVENT.venue}, hosted by Alfred
              Joshua and Mastermind.
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
            <BookCallButton className={styles.ctaButton} showArrow>
              Apply for Edition I
            </BookCallButton>
            <p className={styles.ctaNote}>
              {EVENT.seatFeeLabel} blocks your seat. We personally contact
              everyone who applies.
            </p>
          </RevealItem>
        </Reveal>

        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} GOAT Mastermind. All rights reserved.</p>
          <p>
            {EVENT.name} · {EVENT.venue}
          </p>
        </div>
      </div>
    </footer>
  );
}
