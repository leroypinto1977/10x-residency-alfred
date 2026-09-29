import { ClipboardList, Layers, Package, Palette, Search, Users, Workflow } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import WaveDivider from "@/components/WaveDivider";
import styles from "./Outcomes.module.css";

// One artefact per core function, in the same order Transformation names
// them — that section says what changes, this one says what you carry out
// of the room having changed it.
const SYSTEMS = [
  {
    title: "Your Content Engine",
    desc: "The specific plan for your next 90 days of content and audience-building",
    Icon: ClipboardList,
  },
  {
    title: "Your Org Chart",
    desc: "The roles you need next, and who owns each responsibility.",
    Icon: Users,
  },
  {
    title: "Your Hiring Plan",
    desc: "How to find and structure your next three to five key hires.",
    Icon: Search,
  },
  {
    title: "Your Core Process Map",
    desc: "The three to five processes that unlock the most delegation right now.",
    Icon: Workflow,
  },
  {
    title: "Your Systems Stack",
    desc: "The tools and SOPs that replace you as the bottleneck.",
    Icon: Layers,
  },
  {
    title: "Your Productised Offer",
    desc: "Your service or product repackaged into something scalable.",
    Icon: Package,
  },
  {
    title: "Your Brand Positioning",
    desc: "How you scale beyond your own name and face.",
    Icon: Palette,
  },
];

export default function Outcomes() {
  return (
    <section id="outcomes" className={styles.section}>
      <WaveDivider className={styles.waveTop} top="#f2eee5" bottom="#08080a" />
      <div className={styles.inner}>
        <Reveal className={styles.header}>
          <p className={styles.kicker}>What you build</p>
          <h2 className={styles.headline}>
            Systems Every Founder
            <br />
            Builds in the Room.
          </h2>
          <p className={styles.lede}>
            Not talks to sit through. Frameworks you apply to your own business before you leave.
          </p>
        </Reveal>

        <Reveal stagger className={styles.grid}>
          {SYSTEMS.map(({ title, desc, Icon }, idx) => (
            <RevealItem className={styles.item} key={title}>
              <span className={styles.iconBadge} aria-hidden="true">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <span className={styles.num} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.itemTitle}>{title}</h3>
              <p className={styles.itemDesc}>{desc}</p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
      <WaveDivider className={styles.waveBottom} top="#08080a" bottom="#f2eee5" />
    </section>
  );
}
