import Reveal from "@/components/Reveal";
import BookCallButton from "@/components/BookCallButton";
import styles from "./CTABlock.module.css";

interface CTABlockProps {
  headline: string;
  headlineAccent?: string;
  subtext?: string;
  ctaLabel?: string;
  eyebrow?: string;
  dashed?: boolean;
}

export default function CTABlock({
  headline,
  headlineAccent = "10x Founder",
  subtext = "Turn your business into a scalable, system-driven company.",
  ctaLabel = "Register Now",
  eyebrow = "Limited seats available",
  dashed = false,
}: CTABlockProps) {
  return (
    <section className={styles.section}>
      <Reveal className={`${styles.card} ${dashed ? styles.cardDashed : ""}`}>
        <div className={styles.glow} />
        <div className={styles.streaks} />

        <div className={styles.content}>
          {/* {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>} */}

          <h3 className={styles.headline}>
            {headline}
            {headlineAccent && (
              <span className={styles.highlight}> {headlineAccent}</span>
            )}
          </h3>

          {subtext && <p className={styles.subtext}>{subtext}</p>}

          <BookCallButton variant="primary" className={styles.cta}>
            {ctaLabel}
            <span className={styles.ctaArrow}>→</span>
          </BookCallButton>
        </div>

        <span className={styles.cornerTop} />
        <span className={styles.cornerBottom} />
      </Reveal>
    </section>
  );
}