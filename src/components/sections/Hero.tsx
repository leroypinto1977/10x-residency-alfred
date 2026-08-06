import { MapPin, Clock, Users, CalendarDays } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import Button from "@/components/ui/Button";
import BookCallButton from "@/components/BookCallButton";
import HeroVisual from "./HeroVisual";
import styles from "./Hero.module.css";

const TRUST_INDICATORS = [
  { label: "Geography", sub: "Founders and Creators" },
  { label: "Event Format ", sub: "3-day residential intensive." },
  { label: "Composition", sub: "80% Founders , 20% Creators " }
];

// 3-day residential intensive

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        <div className={styles.content}>

          <Reveal delay={0.1}>
            <h1 className={styles.title}>
              <span className={styles.titleLine}>Build Your Million Dollar Company</span><br className={styles.lineBreak} /> <span className={styles.hightlight}>Before 30</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className={styles.subtitle}>
              Most founders in their 20s are working harder than anyone in the room and still can’t tell if they’re building the right thing. Founder 10x is where that gets answered.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>
                <MapPin size={14} className={styles.metaIcon} aria-hidden="true" />
                Athirapalli, Kerala
              </span>
              <span className={styles.metaItem}>
                <CalendarDays size={14} className={styles.metaIcon} aria-hidden="true" />
                From Oct 2nd to 5th, 2026 
              </span>
              <span className={styles.metaItem}>
                <Users size={14} className={styles.metaIcon} aria-hidden="true" />
                25 founders, by application
              </span>
            </div>
          </Reveal>

          {/* <Reveal delay={0.3}>
            <div className={styles.actions}>
              <BookCallButton  showArrow>
                Register Now
              </BookCallButton>
              <Button href="#transformation" variant="secondary">
                See How It Works
              </Button>
            </div>
          </Reveal> */}

          <Reveal stagger delay={0.4} className={styles.trustRow}>
            {TRUST_INDICATORS.map((item, idx) => (
              <div className={styles.trustGroup} key={item.label}>
                <RevealItem className={styles.trustItem}>
                  <h3>{item.label}</h3>
                  <p>{item.sub}</p>
                </RevealItem>
                {idx < TRUST_INDICATORS.length - 1 && <div className={styles.divider} />}
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.3}>
            <div className={styles.actions}>
              <BookCallButton  showArrow>
                Join The Wait List 
              </BookCallButton>
              <Button href="#transformation" variant="secondary">
                See How It Works
              </Button>
            </div>
          </Reveal>   

          
        </div>

        {/* <HeroVisual /> */}
      </div>

      <Reveal delay={0.2} className={styles.taglineSection}>
        <p className={styles.para}>Build Clarity - Lead the Company - Become the Founder.</p>
      </Reveal>
    </section>
  );
}