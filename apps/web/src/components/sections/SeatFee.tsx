import { FileText, Lock, PhoneCall } from "lucide-react";
import Reveal from "@/components/Reveal";
import RevealItem from "@/components/RevealItem";
import BookCallButton from "@/components/BookCallButton";
import SeatFeeNote from "@/components/SeatFeeNote";
import { EVENT } from "@/lib/event";
import styles from "./SeatFee.module.css";

const STEPS = [
  {
    Icon: FileText,
    label: "Free",
    title: "You apply",
    body: "A short application about what you are building and where it is stuck. Costs nothing, commits you to nothing.",
  },
  {
    Icon: Lock,
    label: EVENT.seatFeeLabel,
    title: "You block your seat",
    body: `${EVENT.seatFeeLabel} on the booking page, straight after the form. It holds one of the ${EVENT.seats} places while we read your application, so a seat can't go to someone who applied after you.`,
    accent: true,
  },
  {
    Icon: PhoneCall,
    title: "We call you",
    body: "Someone from our team reads what you wrote and calls you personally to walk you through the dates, the villa, travel and the programme fee. Nothing else is charged before that call.",
  },
];

/**
 * The money, said out loud, before the form.
 *
 * The page previously went from "Book a Call" straight into a fourteen-field
 * application and then, without warning, to a payment page — so the first
 * mention of money an applicant met was a checkout for a number they had
 * never seen. This section exists to make the payment page a confirmation
 * rather than an ambush: what it costs, what the money is actually doing,
 * and what is not charged until later.
 *
 * It sits after Urgency and before the FAQ deliberately. Urgency argues that
 * the seats run out, which is precisely the moment "so what does it cost to
 * hold one?" becomes the live question; answering it here means the FAQ and
 * the closing ask are read by someone who already knows the number.
 */
export default function SeatFee() {
  return (
    <section id="seat-fee" className={styles.section}>
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className={`kicker ${styles.eyebrow}`}>What it costs to start</p>
          <h2 className={`displayLg ${styles.headline}`}>
            Applying is free. <span className={styles.highlight}>{EVENT.seatFeeLabel}</span> blocks
            your seat.
          </h2>
          <p className={styles.lede}>
            There is no payment to apply and no card at the form. The only thing you pay up front is
            a {EVENT.seatFeeLabel} seat deposit — and you can have it back whenever you ask.
          </p>
        </Reveal>

        <Reveal stagger className={styles.steps}>
          {STEPS.map(({ Icon, label, title, body, accent }, i) => (
            <RevealItem
              key={title}
              className={`${styles.step} ${accent ? styles.stepAccent : ""}`}
            >
              <div className={styles.stepTop}>
                <span className={styles.stepIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={styles.stepNum}>Step {i + 1}</span>
                {label && (
                  <span className={`${styles.stepPrice} ${accent ? styles.stepPriceAccent : ""}`}>
                    {label}
                  </span>
                )}
              </div>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepBody}>{body}</p>
            </RevealItem>
          ))}
        </Reveal>

        {/* What the deposit is for gets its own block rather than a clause
            inside a paragraph. It is the sentence that decides whether ₹499
            reads as a charge or as a commitment, and buried in body copy it
            reads as neither. */}
        <Reveal delay={0.08}>
          <div className={styles.deposit}>
            <span className={styles.depositIcon}>
              <Lock size={20} aria-hidden="true" />
            </span>
            <div className={styles.depositCopy}>
              <p className={styles.depositTitle}>
                What the {EVENT.seatFeeLabel} is for.
              </p>
              <p className={styles.depositBody}>
                It holds one of the {EVENT.seats} places while we read your application, so a room
                this small stays filled by people who mean to be in it. Nothing else is charged
                until someone from our team has walked you through the programme personally.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className={styles.cta}>
          <BookCallButton variant="primary" showArrow>
            Apply &amp; block your seat
          </BookCallButton>
          <SeatFeeNote />
        </Reveal>
      </div>
    </section>
  );
}
