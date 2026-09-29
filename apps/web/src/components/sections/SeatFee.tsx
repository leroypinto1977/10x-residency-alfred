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
    title: "You apply",
    body: "A one-minute application about your goals and challenges. Booking page follows.",
  },
  {
    Icon: Lock,
    title: "You block your seat",
    body: `${EVENT.seatFeeLabel} after the form reserves your place while we review your application.`,
  },
  {
    Icon: PhoneCall,
    title: "We call you",
    body: "Our team reviews your application and calls to discuss details. No extra charge before the call.",
  },
];

/**
 * The money, said out loud, before the form.
 *
 * The page previously went from "Book a Call" straight into a fourteen-field
 * application and then, without warning, to a payment page — so the first
 * mention of money an applicant met was a checkout for a number they had
 * never seen. This section exists to make the payment page a confirmation
 * rather than an ambush.
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
          <p className={styles.eyebrow}>What it costs to start</p>
          <h2 className={styles.headline}>
            It costs <span className={styles.highlight}>{EVENT.seatFeeLabel}</span> to block your
            seat.
          </h2>
          <p className={styles.lede}>
            You fill in a short application, then block your seat with {EVENT.seatFeeLabel} on the
            booking page straight after. That is the only thing you pay up front — nothing further
            is charged until our team has spoken to you.
          </p>
        </Reveal>

        <Reveal stagger className={styles.steps}>
          {STEPS.map(({ Icon, title, body }, i) => (
            <RevealItem key={title} className={styles.step}>
              {/* A larger, faint echo of the same icon bleeding off the
                  corner — purely decorative, so it's hidden from assistive
                  tech alongside the badge it repeats. */}
              <Icon className={styles.stepIconGhost} aria-hidden="true" strokeWidth={1.25} />
              <div className={styles.stepTop}>
                <span className={styles.stepIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={styles.stepNum}>Step {i + 1}</span>
              </div>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepBody}>{body}</p>
            </RevealItem>
          ))}
        </Reveal>

        <Reveal delay={0.12} className={styles.cta}>
          <BookCallButton variant="primary" showArrow className={styles.ctaButton}>
            Apply and Block your Seat
          </BookCallButton>
          <SeatFeeNote tone="light" />
        </Reveal>
      </div>
    </section>
  );
}
