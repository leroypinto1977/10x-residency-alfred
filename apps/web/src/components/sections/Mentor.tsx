import Image, { type StaticImageData } from "next/image";
import { User, PenLine } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import Button from "@/components/ui/Button";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
import styles from "./Mentor.module.css";

interface MentorProps {
  eyebrow?: string;
  name?: string;
  subhead?: string;
  bio?: string[];
  badgeLabel?: string;
  portraitSrc?: string | StaticImageData;
  portraitAlt?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

const DEFAULT_BIO = [
  "Alfred built The GOAT Media on a simple bet: most founders don't fail from lack of effort, they fail from lack of a plan they actually execute. He's known for taking businesses that feel complicated and breaking them down into the three or four moves that actually matter.",
  "Founder 10X runs on the same principle: three days, no borrowed frameworks, a plan built specifically for the business you're already running."
];

export default function Mentor({
  eyebrow = "Meet Your Mentor",
  name = "Alfred Joshua",
  subhead = "CEO,The GOAT Media.",
  bio = DEFAULT_BIO,
  badgeLabel = "Founder & Mentor",
  portraitSrc,
  portraitAlt = name,
  primaryCtaLabel = "Book a Call",
  secondaryCtaLabel = "Watch My Story",
  secondaryCtaHref,
}: MentorProps) {
  return (
    // `onLight` is global (globals.css), not a module class: it re-colours
    // the headings, which the global h1-h6 rule would otherwise keep at the
    // dark-theme near-white.
    <section id="mentor" className={`onLight ${styles.section}`}>
      <div className={styles.grid}>
        <Reveal className={styles.portraitCol}>
          <div className={styles.portraitCard}>
            <div className={styles.frame}>
              <div className={styles.frameGlow} />
              {portraitSrc ? (
                <Image
                  src={portraitSrc}
                  alt={portraitAlt}
                  fill
                  sizes="(max-width: 1023px) 280px, 22vw"
                  className={styles.portraitImg}
                />
              ) : (
                <div className={styles.portraitPlaceholder}>
                  <User size={64} aria-hidden="true" />
                </div>
              )}
              <div className={styles.signatureBadge}>
                <PenLine size={14} aria-hidden="true" />
                {/* <span className={styles.founder}>{badgeLabel}</span> */}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className={styles.contentCol}>
          {/* `eyebrow` was accepted as a prop but never rendered. It now
              carries the same kicker as every other section header, and the
              stray empty <h2> that wrapped the subhead is gone: it emitted a
              headless heading whenever `subhead` was undefined. */}
          <p className="kicker kickerOnLight">{eyebrow}</p>
          <h2 className={`displayLg ${styles.greeting}`}>
            Hosted By <span className={styles.name}>{name}</span>
          </h2>
          {subhead && <p className={styles.subhead}>{subhead}</p>}

          <div className={styles.bio}>
            {bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className={styles.ctas}>
            <BookCallButton variant="primary" showArrow>
              {primaryCtaLabel}
            </BookCallButton>
            {secondaryCtaHref && (
              <Button variant="secondary" href={secondaryCtaHref}>
                {secondaryCtaLabel}
              </Button>
            )}
          </div>

          {/* Light tone: this section runs on the cream surface. */}
          <SeatFeeNote tone="light" align="start" />
        </Reveal>
      </div>
    </section>
  );
}
