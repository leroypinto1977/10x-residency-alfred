"use client";

import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import styles from "./FloatingField.module.css";

interface FloatingFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  as?: "input" | "textarea";
  rows?: number;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal" | "search" | "none" | "url";
  error?: boolean;
  errorMessage?: string;
}

export default function FloatingField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  as = "input",
  rows,
  min,
  max,
  maxLength,
  inputMode,
  error,
  errorMessage,
}: FloatingFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);

  const sharedProps = {
    id,
    name,
    value,
    onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    className: `${styles.field} ${error ? styles.fieldError : ""}`,
    placeholder,
    required,
    "aria-required": required,
    "aria-invalid": error || undefined,
    "aria-describedby": error && errorMessage ? errorId : undefined,
  };

  return (
    <div className={`${styles.group} ${error ? styles.groupError : ""}`}>
      <label htmlFor={id} className={`${styles.label} ${focused ? styles.labelFocused : ""}`}>
        {label}
      </label>
      {as === "textarea" ? (
        <textarea {...sharedProps} rows={rows ?? 3} />
      ) : (
        <input {...sharedProps} type={type} min={min} max={max} maxLength={maxLength} inputMode={inputMode} />
      )}
      {error && errorMessage && (
        <p id={errorId} className={styles.fieldErrorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}