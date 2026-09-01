import Image from "next/image";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import { EVENT } from "@/lib/event";
import roomImg from "../../../public/room-workshop.jpg";
import styles from "./Room.module.css";

// The qualification criteria used to sit inside the hero as a glass card,
// which pushed the hero past four text elements and buried the CTA. They
// do more work here, directly under the fold, as the first thing a founder
// reads after the promise.
//
// "Age: no limit" used to hold the middle slot, which qualified nobody out
// and answered a question the page was not being asked. Stage replaces it:
// the residency is for a business that has revenue and has stopped growing,
// and saying so is what makes the room feel specific rather than open.
const CRITERIA = [
  {
    k: "Who",
    v: "Already running a business",
    note: "And still doing every part of it yourself",
  },
  {
    k: "Stage",
    v: "Revenue is coming in",
    note: "But it isn't growing, or every sale still comes through you",
  },
  { k: "Room", v: "80% founders, 20% creators", note: `Capped at ${EVENT.seats}` },
];

export default function Room() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className="kicker">Who it&apos;s for</p>
          <h2 className="displayLg">
            Build the team. Build the system.
            <br />
            <span className={styles.accent}>Become the founder who can leave the room.</span>
          </h2>
        </Reveal>

        <Reveal stagger className={styles.list}>
          {CRITERIA.map((item) => (
            <RevealItem className={styles.item} key={item.k}>
              <span className={styles.key}>{item.k}</span>
              <p className={styles.value}>{item.v}</p>
              <p className={styles.note}>{item.note}</p>
            </RevealItem>
          ))}
        </Reveal>

        {/* "Who it's for" is an abstract claim until you can see the room it
            describes — a working table, not an audience. Spans both columns
            so it reads as the floor of the section rather than a sidebar. */}
        <Reveal delay={0.2} className={styles.shotWrap}>
          <div className={styles.offsetFrame} aria-hidden="true" />
          <figure className={styles.shot}>
            <Image
              src={roomImg}
              alt="A founder making his point across the table while the group hears him out"
              sizes="(max-width: 900px) 100vw, 1120px"
              className={styles.shotImg}
              placeholder="blur"
            />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
