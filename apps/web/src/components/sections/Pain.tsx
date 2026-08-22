import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import styles from "./Pain.module.css";

const PAIN_ITEMS = [
  {
    icon: "◈",
    line: "Every decision still runs through you.",
  },
  {
    icon: "⟁",
    line: "Revenue depends on your energy, not your systems.",
  },
  {
    icon: "◷",
    line: "Your team waits. Your calendar owns you.",
  },
  {
    icon: "▽",
    line: "You haven't taken a real break in years.",
  },
  {
    icon: "⌂",
    line: "Growth has a ceiling — and it's you.",
  },
];

export default function Pain() {
  return (
    <section id="pain" className={styles.section}>
      <Reveal className={styles.header}>
        <span className={styles.tag}>The cost of staying the bottleneck</span>
      </Reveal>

      <Reveal stagger className={styles.grid}>
        {PAIN_ITEMS.map((item) => (
          <RevealItem key={item.line} className={styles.card}>
            <span className={styles.icon}>{item.icon}</span>
            <p className={styles.cardText}>{item.line}</p>
          </RevealItem>
        ))}
      </Reveal>
    </section>
  );
}