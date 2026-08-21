import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./Urgency.module.css";
import { EVENT } from "@/lib/event";

export default function UrgencySection() {
  const ifYouWait = [
    "Keep building without an outside read on your plan",
    "Stay stuck making every decision alone",
    "Watch founders at your stage move faster",
    "Miss this cohort's dates",
  ];

  const ifYouApply = [
    "Leave with a 12-month roadmap and 90-day plan",
    `Join a room of ${EVENT.seats} founders at your stage`,
    "Get your plan reviewed directly by Alfred",
    "Start executing the Monday you're back",
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* This was the one section on the page with no entrance at all —
            it popped while everything around it settled. Same Reveal
            grammar as every other section: header first, then the two
            columns of the panel walking in as a stagger. */}
        <Reveal>
          <p className={`kicker ${styles.eyebrow}`}>Don&apos;t miss your chance</p>
          <h2 className={`displayLg ${styles.headline}`}>
            This is your opportunity to join India&apos;s most exclusive founder
            residency.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>What happens if you wait?</h3>

            <Reveal stagger className={styles.comparisonGrid}>
              <RevealItem>
                <p className={styles.columnTitle1}>If you don&apos;t act now</p>
                <ul className={styles.list}>
                  {ifYouWait.map((item) => (
                    <li key={item} className={styles.listItem}>
                      <span className={styles.dash1}>–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>

              <RevealItem>
                <p className={styles.columnTitle2}>If you apply today</p>
                <ul className={styles.list}>
                  {ifYouApply.map((item) => (
                    <li key={item} className={styles.listItem}>
                      <span className={styles.dash2}>–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </RevealItem>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}