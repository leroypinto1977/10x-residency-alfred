import Image from "next/image";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
import Reveal from "@/components/Reveal";
import cohortImg from "../../../public/cohort-group.jpg";
import styles from "./FinalCTA.module.css";

const TRUST_BADGES = ["By Application Only", "100% Confidential", "No Obligation"];

export default function FinalCTA() {
  return (
    <section className={styles.section}>
      {/* The closing ask is the one place a face-of-the-cohort photograph
          earns its keep: the page has spent every section describing a room,
          and this is the room. Pushed well back behind a scrim — it is
          atmosphere for the CTA, not a picture with a button on it. */}
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          src={cohortImg}
          alt=""
          fill
          sizes="100vw"
          className={styles.backdropImg}
          placeholder="blur"
        />
        <div className={styles.backdropScrim} />
      </div>
      <div className={styles.glow} aria-hidden="true" />

      <Reveal className={styles.content}>
        <p className="kicker">The next step</p>
        <h2 className="displayLg">Ready to build a business that runs without you?</h2>
        <p className={styles.lede}>
          Book your strategy call. 60 minutes, no pitch, just clarity on your next move.
        </p>

        <BookCallButton variant="primary" className={styles.cta} showArrow>
          Book a Call
        </BookCallButton>

        {/* The last button on the page is also the last chance to say what
            happens after it. Everything above has already named the fee; this
            repeats it so nobody arrives at the payment page having scrolled
            past the one section that explained it. */}
        <SeatFeeNote />

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
