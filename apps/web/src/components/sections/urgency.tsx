import Reveal from "@/components/Reveal";
import RoomPhoto from "@/components/RoomPhoto";
import styles from "./Urgency.module.css";
import { EVENT } from "@/lib/event";

export default function UrgencySection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* This was the one section on the page with no entrance at all —
            it popped while everything around it settled. Same Reveal
            grammar as every other section: header first, then the
            photograph following it in. */}
        <Reveal>
          <p className={`kicker ${styles.eyebrow}`}>Don&apos;t miss your chance</p>
          <h2 className={`displayLg ${styles.headline}`}>
            This is your opportunity to join India&apos;s most exclusive founder
            residency.
          </h2>
        </Reveal>

        {/* The section makes its case on a seat count, and the photograph is
            the room from where Alfred stands — the only view that makes that
            count concrete, since every face in it took one. Shot from behind
            him deliberately: the subject is the room, not the speaker. */}
        <Reveal delay={0.05}>
          <RoomPhoto
            className={styles.band}
            src="/room/urgency-room.webp"
            alt="A founder standing at the glass wall with the seated room turned towards him"
            width={1600}
            height={800}
            caption={`${EVENT.seats} seats. This is what they look like taken.`}
          />
        </Reveal>
      </div>
    </section>
  );
}
