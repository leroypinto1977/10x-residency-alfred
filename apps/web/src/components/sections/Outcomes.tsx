import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import RoomPhoto from "@/components/RoomPhoto";
import styles from "./Outcomes.module.css";

// One artefact per core function, in the same order Transformation names
// them — that section says what changes, this one says what you carry out
// of the room having changed it. Seven rows, so the ledger and the oversized
// numeral in the header agree on the count.
const SYSTEMS = [
  {
    title: "Your content and social engine",
    desc: "The specific plan for your next 90 days of content and audience-building.",
  },
  {
    title: "Your org chart",
    desc: "The roles you need next, and who owns what.",
  },
  {
    title: "Your hiring plan",
    desc: "How to find and structure your next three to five key hires.",
  },
  {
    title: "Your core process map",
    desc: "The three to five processes that unlock the most delegation right now.",
  },
  {
    title: "Your systems stack",
    desc: "The tools and SOPs that replace you as the bottleneck.",
  },
  {
    title: "Your productised offer",
    desc: "Your service or product repackaged into something scalable.",
  },
  {
    title: "Your brand positioning",
    desc: "How you scale beyond your own name and face.",
  },
];

export default function Outcomes() {
  return (
    <section id="outcomes" className={`${styles.section} onLight`}>
      <div className={styles.inner}>
        <Reveal className={styles.header}>
          <p className={`kicker kickerOnLight ${styles.kicker}`}>What you build</p>
          <p className={styles.count}>7</p>
          <h2 className={`displayLg ${styles.headline}`}>
            systems every founder
            <br />
            builds in the room.
          </h2>
          <p className={styles.lede}>
            Not talks to sit through. Frameworks you apply to your own business before you leave.
          </p>
        </Reveal>

        {/* The ledger is seven rows that all look alike by design, and at
            860px it becomes two columns — so a photograph cannot go inside
            it without breaking the flow. It sits here instead, where it
            separates the promise from the list and shows the material the
            list is describing actually in founders' hands. */}
        <Reveal>
          <RoomPhoto
            className={styles.band}
            src="/room/outcomes-cards.webp"
            alt="Founders reading through their printed worksheets, exercise cards in hand"
            width={1600}
            height={800}
            caption="The frameworks, mid-exercise."
          />
        </Reveal>

        <Reveal stagger className={styles.ledger}>
          {SYSTEMS.map((item, idx) => (
            <RevealItem className={styles.row} key={item.title}>
              <span className={styles.num} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className={styles.rowText}>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <p className={styles.rowDesc}>{item.desc}</p>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
