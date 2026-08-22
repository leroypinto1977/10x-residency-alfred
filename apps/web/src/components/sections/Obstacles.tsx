import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import Card from "@/components/ui/Card";
import styles from "./Obstacles.module.css";

const BOTTLENECKS = [
  {
    title: "Everything Depends on You",
    problem: "Your team waits for you to make every important decision.",
    fix: "Build systems so your business can run without you every day.",
  },
  {
    title: "Sales Are Not Consistent",
    problem: "Revenue goes up and down because there is no reliable growth system.",
    fix: "Create a predictable system that brings in qualified customers consistently.",
  },
  {
    title: "Always Busy, Never Growing",
    problem: "You're stuck handling daily problems instead of growing the business.",
    fix: "Focus on strategy while your team handles day-to-day operations.",
  },
];

export default function Obstacles() {
  return (
    <section id="bottlenecks" className={styles.section}>
      <Reveal className={styles.sectionHeader}>
        <span className={styles.sectionTag}>WHY GROWTH STOPS</span>
        <h2>What's Really Holding You Back</h2>
        <p>After ₹10 Cr, growth slows because your business needs better systems—not more hard work.</p>
      </Reveal>

      <Reveal stagger className={styles.grid}>
        {BOTTLENECKS.map((item) => (
          <RevealItem key={item.title}>
            <Card className={styles.card}>
              <h3>{item.title}</h3>
              <div className={styles.block}>
                <span className={styles.blockLabel}>The Problem</span>
                <p>{item.problem}</p>
              </div>
              <div className={styles.block}>
                <span className={styles.blockLabelGold}>Our Fix</span>
                <p>{item.fix}</p>
              </div>
            </Card>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}
