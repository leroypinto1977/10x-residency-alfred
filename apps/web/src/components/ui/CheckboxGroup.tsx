"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import styles from "./CheckboxGroup.module.css";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  label: string;
  name: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: CheckboxOption[];
  error?: boolean;
}

export default function CheckboxGroup({
  label,
  name,
  values,
  onChange,
  options,
  error,
}: CheckboxGroupProps) {
  const groupId = useId();

  const toggle = (value: string) => {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  };

  return (
    <div className={`${styles.group} ${error ? styles.groupError : ""}`}>
      <span id={groupId} className={styles.label}>
        {label}
      </span>
      <div className={styles.options} role="group" aria-labelledby={groupId}>
        {options.map((opt) => {
          const optionId = `${groupId}-${opt.value}`;
          const checked = values.includes(opt.value);
          return (
            <label
              key={opt.value}
              htmlFor={optionId}
              className={`${styles.option} ${checked ? styles.optionChecked : ""}`}
            >
              <input
                type="checkbox"
                id={optionId}
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => toggle(opt.value)}
                className={styles.input}
              />
              <span className={styles.indicator} aria-hidden="true">
                {checked && <Check size={12} strokeWidth={3} />}
              </span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
