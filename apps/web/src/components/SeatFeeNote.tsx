import { ShieldCheck } from "lucide-react";
import { EVENT } from "@/lib/event";
import styles from "./SeatFeeNote.module.css";

interface SeatFeeNoteProps {
  className?: string;
  /** `light` for the two sections that sit on the cream surface. */
  tone?: "dark" | "light";
  /**
   * `center` under a centred CTA, `start` under a left-aligned one. The note
   * has to sit on the same axis as the button it belongs to or it reads as
   * loose page furniture rather than that button's fine print.
   */
  align?: "center" | "start";
}

/**
 * The fee, stated under the button that leads to it.
 *
 * Every primary CTA on this page opens an application form that ends in a
 * redirect to the payment page. Naming the number here — rather than leaving
 * it to the FAQ — is the difference between the payment page confirming
 * something the visitor already agreed to and the payment page being the
 * first they hear of it.
 */
export default function SeatFeeNote({
  className = "",
  tone = "dark",
  align = "center",
}: SeatFeeNoteProps) {
  return (
    <p
      className={`${styles.note} ${tone === "light" ? styles.light : ""} ${
        align === "start" ? styles.start : ""
      } ${className}`}
    >
      {/* Inline rather than a flex sibling: as a sibling the icon is laid
          out against the full width of the wrapped text block, which parks it
          at the far left of a centred two-line note on a phone. In the text
          flow it stays next to the first word at every width. */}
      <ShieldCheck size={15} className={styles.icon} aria-hidden="true" />
      <strong className={styles.fee}>{EVENT.seatFeeLabel}</strong>{" "}
      blocks your seat
    </p>
  );
}
