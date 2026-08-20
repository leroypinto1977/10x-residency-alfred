import BookCallButton from "@/components/BookCallButton";
import Reveal from "@/components/Reveal";
import styles from "./FinalCTA.module.css";

const TRUST_BADGES = ["By Application Only", "100% Confidential", "No Obligation"];

export default function FinalCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.glow} aria-hidden="true" />

      <Reveal className={styles.content}>
        <p className="kicker">The next step</p>
        <h2 className="displayLg">Ready to build a business that runs without you?</h2>
        <p className={styles.lede}>
          Book your strategy call. 60 minutes, no pitch, just clarity on your next move.
        </p>

        <BookCallButton variant="primary" className={styles.cta} showArrow>
          Join The Wait List
        </BookCallButton>

        {/* <div className={styles.badges}>
          {TRUST_BADGES.map((badge) => (
            <span key={badge} className={styles.badge}>
              {badge}
            </span>
          ))}
        </div> */}
      </Reveal>
    </section>
  );
}
