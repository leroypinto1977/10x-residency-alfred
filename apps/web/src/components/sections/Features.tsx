import { Flag, Route, Target } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import RoomPhoto from "@/components/RoomPhoto";
import styles from "./Features.module.css";


const ARTEFACTS = [
  {
    horizon: "3-5",
    unit: "years",
    title: "The vision, written down",
    desc: "The specific company you are building towards, committed to paper instead of carried around as an idea.",
    Icon: Target,
  },
  {
    horizon: "12",
    unit: "months",
    title: "The strategic roadmap",
    desc: "Milestone by milestone for the year ahead, sequenced so each one makes the next one possible.",
    Icon: Route,
  },
  {
    horizon: "90",
    unit: "days",
    title: "The execution plan",
    desc: "Dated actions for your first quarter. You start on the Monday you get back.",
    Icon: Flag,
  },
];

export default function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.header}>
          <p className={styles.kicker}>What you leave with</p>
          <h2 className={styles.heading}>Everything you leave with.</h2>
          <p className={styles.lede}>
            Three documents, written by you, in the room. Not notes to type up on the flight home.
          </p>
        </Reveal>

        {/* Each card's fan position (rotation + horizontal offset) lives on
            .cardSlot, a plain, un-animated wrapper — RevealItem's own
            entrance animation sets an inline `transform` for its fade/rise,
            which would otherwise silently overwrite a rotation set on the
            same element. */}
        <Reveal stagger className={styles.deck}>
          {ARTEFACTS.map((item, i) => (
            <div className={styles.cardSlot} key={item.title} data-index={i}>
              <RevealItem className={styles.card}>
                <item.Icon className={styles.cardIcon} aria-hidden="true" size={22} strokeWidth={1.5} />
                <div className={styles.horizonWrap}>
                  <span className={styles.horizon} aria-hidden="true">
                    {item.horizon}
                  </span>
                  <span className={styles.unit}>{item.unit}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.desc}</p>
              </RevealItem>
            </div>
          ))}
        </Reveal>

        {/* The footnote promises the documents are reviewed line by line
            with Alfred. This is that, photographed — so the sentence and
            the picture are one block rather than a claim with decoration
            somewhere near it. */}
        {/* <Reveal delay={0.2} className={styles.closing}>
          <RoomPhoto
            className={styles.closingPhoto}
            src="/room/features-review.webp"
            alt="Alfred in a maroon blazer listening while a founder makes his case to the room"
            width={600}
            height={400}
          />
          <p className={styles.footnote}>
            Each one reviewed line by line with Alfred, and pressure-tested by the room before you
            leave.
          </p>
        </Reveal> */}
      </div>
    </section>
  );
}
