"use client";

import { useId } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: boolean;
}

export default function Select({
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  required,
  error,
}: SelectProps) {
  const id = useId();

  return (
    <div className={`${styles.group} ${error ? styles.groupError : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <RadixSelect.Root name={name} value={value} onValueChange={onValueChange} required={required}>
        <RadixSelect.Trigger
          id={id}
          className={`${styles.trigger} ${error ? styles.triggerError : ""}`}
          aria-required={required}
        >
          <RadixSelect.Value placeholder={placeholder ?? ""} />
          <RadixSelect.Icon className={styles.icon}>
            <ChevronDown size={16} aria-hidden="true" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className={styles.content}
            position="popper"
            sideOffset={8}
            collisionPadding={16}
          >
            <RadixSelect.Viewport className={styles.viewport}>
              {options.map((opt) => (
                <RadixSelect.Item key={opt.value} value={opt.value} className={styles.item}>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className={styles.indicator}>
                    <Check size={14} aria-hidden="true" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
