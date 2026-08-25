"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import { EVENT } from "@/lib/event";
import styles from "./FAQ.module.css";

interface QA {
  q: string;
  a: string;
}

// Every answer here restates something the page already commits to
// elsewhere (format, cohort size, who it's for, what you leave with) so
// the FAQ can't drift out of sync with the rest of the copy. The dates come
// from EVENT so they cannot contradict the hero; the fee is the one thing we
// genuinely can't answer yet, and says so plainly rather than inventing a
// number.
const FAQS: QA[] = [
  {
    q: "Who is this actually for?",
    a: `Founders and creators at any age who are already running something real, not people looking for a business idea. The room is roughly 80% founders and 20% creators, and it is deliberately capped at ${EVENT.seats} so every plan in it gets looked at properly.`,
  },
  {
    q: `What happens across the ${EVENT.durationDays} days?`,
    a: "You work through four things in order: the Founder Operating System (how you think and decide), the Founder Identity (the habits behind founders who compound), the Founder Engine (a business that attracts customers and talent on its own), and Financial Clarity (your real margins, cash flow and the numbers that drive the business).",
  },
  {
    q: "What do I leave with?",
    a: "A 3-5 year vision written down, a 12-month strategic roadmap, and a 90-day execution plan you start on the Monday you get back, each of them reviewed line by line with Alfred and pressure-tested by the room.",
  },
  {
    q: "Where is it held, and is stay included?",
    a: `${EVENT.venue}. It is residential: you stay at a private villa retreat beside the falls, and stay plus curated meals are included. It is about ninety minutes from Kochi International Airport, and everyone accepted gets travel guidance.`,
  },
  {
    q: "How does the application work?",
    a: `${EVENT.admission}. You fill in the application, block your seat with ${EVENT.seatFeeLabel} on the booking page, and places are offered on fit rather than first-come. ${EVENT.seats} seats total.`,
  },
  {
    q: "When are the dates, and what does it cost?",
    a: `${EVENT.dateLabel}, in ${EVENT.venue}. Blocking a seat costs ${EVENT.seatFeeLabel}, paid on the booking page right after you apply. That holds your place while we review the application, and our team walks you through the rest personally.`,
  },
  {
    q: "I'm early. Is it too soon for me?",
    a: "If you are building something and can't yet tell whether it is the right thing, that is precisely the problem the residency exists to answer. If you have no business running yet, wait. You would spend the three days planning rather than rebuilding.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className={`${styles.section} onLight`}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className="kicker kickerOnLight">Before you apply</p>
          <h2 className="displayLg">Questions founders ask us.</h2>
        </Reveal>

        <Reveal stagger className={styles.list}>
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <RevealItem key={item.q} className={styles.item}>
                <h3 className={styles.questionHeading}>
                  <button
                    type="button"
                    className={styles.question}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    id={`faq-question-${idx}`}
                  >
                    <span>{item.q}</span>
                    <Plus
                      size={18}
                      aria-hidden="true"
                      className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
                    />
                  </button>
                </h3>

                {/* Kept mounted and collapsed with a grid-rows transition so
                    the answer stays findable by in-page search and by
                    assistive tech that walks the whole document. */}
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className={`${styles.answerWrap} ${isOpen ? styles.answerOpen : ""}`}
                >
                  <div className={styles.answerInner}>
                    <p className={styles.answer}>{item.a}</p>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
