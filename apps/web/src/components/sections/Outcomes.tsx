import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import RoomPhoto from "@/components/RoomPhoto";
import { EVENT } from "@/lib/event";
import styles from "./Outcomes.module.css";

// Ten items is too many for a card grid — ten identical boxes read as a
// wall and nothing inside them gets weight. Set as a numbered ledger
// instead: the numeral carries the rhythm, the title carries the scan,
// and the line underneath is there for whoever slows down.
const OUTCOMES = [
  {
    title: "The business diagnostic",
    desc: "Map exactly where your business stands today: revenue, margin, and the bottlenecks only you can see.",
  },
  {
    title: "The 3-5 year vision lock",
    desc: "Define the specific company you are building towards, written down, not an aspiration.",
  },
  {
    title: "Decision frameworks for pricing and hiring",
    desc: "The specific models that stop decisions from taking days.",
  },
  {
    title: "Predictable growth systems",
    desc: "A sales and marketing engine that does not depend on your personal hustle.",
  },
  {
    title: "An AI framework for founders",
    desc: "The tools and workflows that compress work founders usually take years to learn.",
  },
  {
    title: "The 12-month strategic roadmap",
    desc: "Milestone by milestone, reviewed by Alfred and the room before you leave.",
  },
  {
    title: "The 90-day execution plan",
    desc: "The roadmap converted into specific, dated actions for your first quarter.",
  },
  {
    title: "Team and leadership systems",
    desc: "What to hire for, when, and how to lead people who are not you.",
  },
  {
    title: "Founder habits and operating rhythm",
    desc: "The daily principles that compound, built around your business rather than generic advice.",
  },
  {
    title: "The commitment round",
    desc: `Say your 90-day plan out loud to the room. ${EVENT.seats} founders now know what you said you would do.`,
  },
];

export default function Outcomes() {
  return (
    <section id="outcomes" className={`${styles.section} onLight`}>
      <div className={styles.inner}>
        <Reveal className={styles.header}>
          <p className={`kicker kickerOnLight ${styles.kicker}`}>What you build</p>
          <p className={styles.count}>10</p>
          <h2 className={`displayLg ${styles.headline}`}>
            things every founder
            <br />
            builds in the room.
          </h2>
          <p className={styles.lede}>
            Not talks to sit through. Frameworks you apply to your own business before you leave.
          </p>
        </Reveal>

        {/* The ledger is ten rows that all look alike by design, and at
            860px it becomes two columns of five — so a photograph cannot go
            inside it without breaking the flow. It sits here instead, where
            it separates the promise from the list and shows the material
            the list is describing actually in founders' hands. */}
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
          {OUTCOMES.map((item, idx) => (
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
