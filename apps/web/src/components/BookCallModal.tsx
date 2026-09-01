"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SOFT } from "@/lib/motion-variants";
import { ShieldCheck, X } from "lucide-react";
import { useBookCallModal } from "@/components/BookCallModalContext";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import BookCallForm from "@/components/BookCallForm";
import { EVENT } from "@/lib/event";
import styles from "./BookCallModal.module.css";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function BookCallModal() {
  const { isOpen, closeModal, triggerRef } = useBookCallModal();
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open.
  //
  // The padding compensates for the page scrollbar the lock removes:
  // without it every fixed and centred thing on the page — the hero, this
  // dialog — jumps ~10px right at the moment the modal opens, which reads
  // as the overlay landing crookedly.
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const originalOverflow = body.style.overflow;
    const originalPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPadding;
    };
  }, [isOpen]);

  // Escape to close + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeModal();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, closeModal]);

  // Move focus into the modal on open, return it to the trigger on close
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }

    triggerRef.current?.focus?.();
  }, [isOpen, triggerRef]);

  // Entrance and exit are deliberately asymmetric: the dialog arrives on the
  // long-tailed SOFT curve at full length, and leaves in half the time on a
  // plain ease-in fade. A dismissal is the user saying "go away" — making
  // them watch the same luxurious settle in reverse reads as the UI
  // ignoring them.
  const dialogMotionProps = reduceMotion
    ? { initial: false, animate: {}, exit: undefined }
    : isMobile
      ? {
          initial: { y: "100%" },
          animate: { y: 0, transition: { duration: 0.55, ease: SOFT } },
          exit: { y: "100%", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const } },
        }
      : {
          initial: { opacity: 0, scale: 0.97, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: SOFT } },
          exit: {
            opacity: 0,
            scale: 0.98,
            y: 10,
            transition: { duration: 0.25, ease: [0.4, 0, 1, 1] as const },
          },
        };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.root}>
          <motion.div
            className={styles.overlay}
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-call-title"
            className={`${styles.dialog} ${isMobile ? styles.dialogMobile : ""}`}
            {...dialogMotionProps}
          >
            <button type="button" className={styles.closeBtn} onClick={closeModal} aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>

            {/* Header and body are separate panes: the dialog itself no
                longer scrolls, only the form does. Fourteen fields have to
                scroll somewhere, but when the whole dialog was the scroll
                container the close button — absolutely positioned inside it
                — travelled with the content and was gone by the third
                field, and so was the fee strip. */}
            <div className={styles.header}>
              <h2 id="book-call-title">Tell Us About Your Business.</h2>
              <p>A few quick questions so our team can prepare before reaching out.</p>

              {/* This form ends in a redirect to the payment page. Naming the
                  fee here — before the first field rather than after the
                  fourteenth — is what stops the checkout reading as a
                  bait-and-switch to someone who has just spent five minutes
                  answering questions. Pinned, so it is still there at the
                  fourteenth field too. */}
              <p className={styles.feeStrip}>
                <ShieldCheck size={15} aria-hidden="true" />
                <span>
                  After submitting, <strong>{EVENT.seatFeeLabel}</strong>{" "}
                  blocks your seat.
                </span>
              </p>
            </div>

            <div className={styles.body}>
              <BookCallForm />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
