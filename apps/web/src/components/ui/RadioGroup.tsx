"use client";

import { useId } from "react";
import styles from "./RadioGroup.module.css";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  required?: boolean;
  error?: boolean;
}

export default function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  required,
  error,
}: RadioGroupProps) {
  const groupId = useId();

  return (
    <div className={`${styles.group} ${error ? styles.groupError : ""}`}>
      <span id={groupId} className={styles.label}>
        {label}
      </span>
      <div className={styles.options} role="radiogroup" aria-labelledby={groupId} aria-required={required}>
        {options.map((opt) => {
          const optionId = `${groupId}-${opt.value}`;
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={optionId}
              className={`${styles.option} ${checked ? styles.optionChecked : ""}`}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className={styles.input}
              />
              <span className={styles.indicator} aria-hidden="true" />
              <span className={styles.optionLabel}>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
