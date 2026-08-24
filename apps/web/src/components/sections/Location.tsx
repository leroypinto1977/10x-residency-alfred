import Image from "next/image";
import { MapPin, Plane, Compass } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import riverImg from "../../../public/location-river.jpg";
import nightImg from "../../../public/location-night.jpg";
import venueImg from "../../../public/location-venue.jpg";
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

        {/* The claim in the copy is "off the grid" and "by day / by night",
            so the photographs are chosen to evidence exactly that pair: a
            day session on the rock by the river, a night one on the lawn,
            and the building everyone sleeps in. Text alone was asking to be
            taken on trust. */}
        <Reveal delay={0.15} className={styles.gallery}>
          <figure className={`${styles.shot} ${styles.shotLead}`}>
            <Image
              src={riverImg}
              alt="Founders sitting in a circle on the rocks beside the river at Athirapalli"
              sizes="(max-width: 860px) 100vw, 62vw"
              className={styles.shotImg}
              placeholder="blur"
            />
            <figcaption className={styles.shotCaption}>Day sessions, on the rock.</figcaption>
          </figure>

          <figure className={`${styles.shot} ${styles.shotNight}`}>
            <Image
              src={nightImg}
              alt="Founders holding their cards up in a night session at the venue"
              sizes="(max-width: 860px) 100vw, 34vw"
              className={styles.shotImg}
              placeholder="blur"
            />
            <figcaption className={styles.shotCaption}>Conversations, after dark.</figcaption>
          </figure>

          <figure className={`${styles.shot} ${styles.shotVenue}`}>
            <Image
              src={venueImg}
              alt="The villa retreat where the residency is hosted"
              sizes="(max-width: 860px) 100vw, 34vw"
              className={styles.shotImg}
              placeholder="blur"
            />
            <figcaption className={styles.shotCaption}>The retreat itself.</figcaption>
          </figure>
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
