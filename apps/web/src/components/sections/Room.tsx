import Image from "next/image";
import { Box, Briefcase, TrendingUp } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import { EVENT } from "@/lib/event";
import roomImg from "../../../public/room-workshop.jpg";
import RoomPlayButton from "./RoomPlayButton";
import styles from "./Room.module.css";

const CRITERIA = [
  {
    k: "Who",
    v: "Already running a business",
    note: "And still doing every part of it yourself",
    Icon: Briefcase,
  },
  {
    k: "Stage",
    v: "Revenue is coming in",
    note: "But it isn't growing, or every sale still comes through you",
    Icon: TrendingUp,
  },
  {
    k: "Room",
    v: "80% founders, 20% creators",
    note: `Capped at just ${EVENT.seats} participants`,
    Icon: Box,
  },
];

export default function Room() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <p className={styles.kicker}>Who is it for?</p>
          <h2>
            Build the team. Build the system.
            <br />
            Become the founder who can leave the room.
          </h2>
        </Reveal>

        <Reveal stagger className={styles.list}>
          {CRITERIA.map(({ k, v, note, Icon }) => (
            <RevealItem className={styles.item} key={k}>
              <span className={styles.iconBadge} aria-hidden="true">
                <Icon size={32} strokeWidth={1.75} />
              </span>
              <span className={styles.key}>{k}</span>
              <p className={styles.value}>{v}</p>
              <p className={styles.note}>{note}</p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.2} className={styles.shotWrap}>
          <figure className={styles.shot}>
            <Image
              src={roomImg}
              alt="A founder making his point across the table while the group hears him out"
              sizes="(max-width: 900px) 100vw, 780px"
              className={styles.shotImg}
              placeholder="blur"
            />
            {/* <RoomPlayButton /> */}
          </figure>
          <span className={styles.cornerArcTL} aria-hidden="true" />
          <span className={styles.cornerBarTopTL} aria-hidden="true" />
          <span className={styles.cornerBarLeftTL} aria-hidden="true" />
          <span className={styles.cornerArcBR} aria-hidden="true" />
          <span className={styles.cornerBarBottomBR} aria-hidden="true" />
          <span className={styles.cornerBarRightBR} aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}
