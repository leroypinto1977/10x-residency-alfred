import Image from "next/image";
import { MapPin, CalendarDays, Clock, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import Button from "@/components/ui/Button";
import BookCallButton from "@/components/BookCallButton";
import { EVENT } from "@/lib/event";
import sessionImg from "../../../public/founders-session.jpg";
import styles from "./Hero.module.css";

const META = [
  { Icon: MapPin, label: EVENT.venue },
  { Icon: CalendarDays, label: EVENT.dateLabel },
  { Icon: Clock, label: EVENT.format },
  { Icon: Users, label: `${EVENT.seats} founders, ${EVENT.admission.toLowerCase()}` },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* The room carries the hero rather than a gradient: an actual
          session, founders taking notes. The scrim is left-weighted so the
          copy column has a dark bed while the faces stay readable. */}
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src={sessionImg}
          alt=""
          fill
          sizes="100vw"
          priority
          className={styles.backdropImg}
        />
        <div className={styles.scrim} />
      </div>

      {/* Three bands: brand, message, detail. The whole frame used to be one
          bottom-left block, which left a third of the viewport empty at the
          top and gave the composition nothing to sit against. */}
      <div className={styles.inner}>
        <header className={styles.brandBar}>
          <p className={styles.wordmark}>
            Founder <span className={styles.accent}>10X.</span>
          </p>
          <p className={styles.edition}>{EVENT.edition}</p>
        </header>

        <div className={styles.content}>
          <Reveal delay={0.1}>
            <h1 className={styles.title}>
              Build your million dollar company
              <span className={styles.highlight}>on purpose.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className={styles.subtitle}>
              Most founders work harder than anyone in the room, and still can&apos;t tell if
              they are building the right thing.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className={styles.actions}>
              <BookCallButton showArrow>Join The Wait List</BookCallButton>
              <Button href="#film" variant="secondary">
                Watch the Testimonials
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Spans the full frame so its rule reads as the base of the
            composition rather than a line that stops halfway. */}
        <Reveal delay={0.45}>
          <ul className={styles.metaRow}>
            {META.map(({ Icon, label }) => (
              <li className={styles.metaItem} key={label}>
                <Icon size={18} className={styles.metaIcon} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
