import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import Card from "@/components/ui/Card";
import styles from "./Framework.module.css";

const FRAMEWORK = [
  {
    num: "01",
    title: "Strategy Call",
    tagline: "A 60-minute diagnostic, not a sales pitch.",
    body: "We map exactly what's capping your growth, your time, and your exit value — and whether we're a fit to fix it.",
  },
  {
    num: "02",
    title: "Systems Roadmap",
    tagline: "A clear plan, not another vague framework.",
    body: "You leave with a 90-day roadmap to remove yourself from the decisions, delivery, and firefighting.",
  },
  {
    num: "03",
    title: "Execution Partnership",
    tagline: "We build it with you, not just tell you.",
    body: "We work alongside your leadership team to install the systems — until the business runs without you.",
  },
];

export default function Framework() {
  return (
    <section id="framework" className={styles.section}>
      <Reveal className={styles.sectionHeader}>
        <span className={styles.sectionTag}>THE PROCESS</span>
        <h2>How This Works</h2>
        <p>Three steps from founder-dependent to independently scalable.</p>
      </Reveal>

      <Reveal stagger className={styles.grid}>
        {FRAMEWORK.map((item) => (
          <RevealItem key={item.num}>
            <Card className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.num}>{item.num}</span>
                <h3>{item.title}</h3>
              </div>
              <p className={styles.tagline}>{item.tagline}</p>
              <p className={styles.body}>{item.body}</p>
            </Card>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
