import { MapPin, Plane, Compass } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./Location.module.css";

// The hero already shows Athirapalli, so repeating the waterfall here
// would just be the same photograph twice. This section does the other
// half of the job: the practical detail of staying there.
const DETAILS = [
  {
    Icon: MapPin,
    label: "The venue",
    body: "A private villa retreat beside the falls. Stay and curated meals included.",
  },
  {
    Icon: Plane,
    label: "Getting there",
    body: "About ninety minutes from Kochi International Airport.",
  },
  {
    Icon: Compass,
    label: "Logistics",
    body: "Travel guidance for every founder who is accepted.",
  },
];

export default function Location() {
  return (
    <section id="location" className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className="kicker">Where it happens</p>
          <h2 className="displayLg">
            Three days off the grid.
            <br />
            <span className={styles.accent}>Nowhere to half-attend from.</span>
          </h2>
          <p className={styles.lede}>
            You stay in, eat in and build in. Strategy sessions by day, founder conversations by
            night. No commute, no calendar, no dipping back into the inbox between sessions.
          </p>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {DETAILS.map(({ Icon, label, body }) => (
            <RevealItem className={styles.item} key={label}>
              <Icon size={20} className={styles.icon} aria-hidden="true" />
              <p className={styles.label}>{label}</p>
              <p className={styles.body}>{body}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
