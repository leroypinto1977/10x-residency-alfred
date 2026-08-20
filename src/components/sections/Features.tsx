import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./Features.module.css";

// This section used to restate the curriculum: two of its four rows were
// Outcomes items reworded, and a third listed logistics already covered by
// the hero, Location and Mentor. Its headline promises what you *leave
// with*, so it now shows exactly that: the three documents you walk out
// holding. Copy comes from the "What do I leave with?" FAQ answer, so the
// two can't drift apart.
//
// The three artefacts telescope inward, 5 years to 90 days, and the layout
// leans on that: the horizon is the thing set large.
const ARTEFACTS = [
  {
    horizon: "3-5",
    unit: "years",
    title: "The vision, written down",
    desc: "The specific company you are building towards, committed to paper instead of carried around as an idea.",
  },
  {
    horizon: "12",
    unit: "months",
    title: "The strategic roadmap",
    desc: "Milestone by milestone for the year ahead, sequenced so each one makes the next one possible.",
  },
  {
    horizon: "90",
    unit: "days",
    title: "The execution plan",
    desc: "Dated actions for your first quarter. You start on the Monday you get back.",
  },
];

export default function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.header}>
          <p className="kicker">What you leave with</p>
          <h2 className="displayLg">Everything you leave with.</h2>
          <p className={styles.lede}>
            Three documents, written by you, in the room. Not notes to type up on the flight home.
          </p>
        </Reveal>

        <Reveal stagger className={styles.list}>
          {ARTEFACTS.map((item) => (
            <RevealItem className={styles.row} key={item.title}>
              <div className={styles.horizonWrap}>
                <span className={styles.horizon} aria-hidden="true">
                  {item.horizon}
                </span>
                <span className={styles.unit}>{item.unit}</span>
              </div>
              <div className={styles.rowText}>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <p className={styles.rowDesc}>{item.desc}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.2}>
          <p className={styles.footnote}>
            Each one reviewed line by line with Alfred, and pressure-tested by the room before you
            leave.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
