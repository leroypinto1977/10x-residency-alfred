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
        {/* Eyebrow */}
        <p className={`kicker ${styles.eyebrow}`}>Don&apos;t miss your chance</p>

        {/* Headline */}
        <h2 className={`displayLg ${styles.headline}`}>
          This is your opportunity to join India&apos;s most exclusive founder
          residency.
        </h2>

        {/* Comparison panel */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>What happens if you wait?</h3>

          <div className={styles.comparisonGrid}>
            <div>
              <p className={styles.columnTitle1}>If you don&apos;t act now</p>
              <ul className={styles.list}>
                {ifYouWait.map((item) => (
                  <li key={item} className={styles.listItem}>
                    <span className={styles.dash1}>–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className={styles.columnTitle2}>If you apply today</p>
              <ul className={styles.list}>
                {ifYouApply.map((item) => (
                  <li key={item} className={styles.listItem}>
                    <span className={styles.dash2}>–</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}