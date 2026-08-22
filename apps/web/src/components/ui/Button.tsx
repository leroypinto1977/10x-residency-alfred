import { ArrowRight } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler;
  showArrow?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  href,
  type = "button",
  onClick,
  showArrow = false,
}: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${className}`;

  const content = (
    <>
      {children}
      {showArrow && (
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick}>
      {content}
    </button>
  );
}
