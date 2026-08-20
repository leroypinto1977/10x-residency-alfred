"use client";

import { useId, useMemo, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import * as RadixSelect from "@radix-ui/react-select";
import type { CountryCode } from "libphonenumber-js/min";
import { Check, ChevronDown, Search } from "lucide-react";
import styles from "./PhoneField.module.css";
import { PHONE_COUNTRIES } from "@/lib/phoneCountries";

interface PhoneFieldProps {
  label: string;
  name: string;
  country: CountryCode;
  value: string;
  onCountryChange: (country: CountryCode) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
}

export default function PhoneField({
  label,
  name,
  country,
  value,
  onCountryChange,
  onChange,
  placeholder,
  required,
  error,
  errorMessage,
}: PhoneFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.code === country) ?? PHONE_COUNTRIES[0],
    [country]
  );

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PHONE_COUNTRIES;
    return PHONE_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.dialCode.includes(query)
    );
  }, [search]);

  // The search input lives inside Radix's Select.Content, which otherwise
  // intercepts keydown for its own arrow-key navigation and letter typeahead —
  // stopping propagation here is what lets normal typing/selection work.
  const stopRadixKeyHandling = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Escape") e.stopPropagation();
  };

  const handlePhoneInput = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, "").slice(0, 14));
  };

  return (
    <div className={`${styles.group} ${error ? styles.groupError : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.row} ${error ? styles.rowError : ""}`}>
        <RadixSelect.Root
          value={selected.code}
          onValueChange={(next) => onCountryChange(next as CountryCode)}
          onOpenChange={(open) => !open && setSearch("")}
        >
          <RadixSelect.Trigger className={styles.countryTrigger} aria-label="Country code">
            <span className={styles.flag} aria-hidden="true">
              {selected.flag}
            </span>
            <span>+{selected.dialCode}</span>
            <RadixSelect.Icon className={styles.icon}>
              <ChevronDown size={14} aria-hidden="true" />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          <RadixSelect.Portal>
            <RadixSelect.Content className={styles.content} position="popper" sideOffset={8}>
              <div className={styles.searchWrap}>
                <Search size={14} aria-hidden="true" className={styles.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={stopRadixKeyHandling}
                  placeholder="Search country or code"
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
              <RadixSelect.Viewport className={styles.viewport}>
                {filteredCountries.length === 0 ? (
                  <div className={styles.empty}>No matches</div>
                ) : (
                  filteredCountries.map((c) => (
                    <RadixSelect.Item key={c.code} value={c.code} className={styles.item}>
                      <span className={styles.itemFlag} aria-hidden="true">
                        {c.flag}
                      </span>
                      <span className={styles.itemName}>
                        <RadixSelect.ItemText>{c.name}</RadixSelect.ItemText>
                      </span>
                      <span className={styles.itemDial}>+{c.dialCode}</span>
                      <RadixSelect.ItemIndicator className={styles.indicator}>
                        <Check size={14} aria-hidden="true" />
                      </RadixSelect.ItemIndicator>
                    </RadixSelect.Item>
                  ))
                )}
              </RadixSelect.Viewport>
            </RadixSelect.Content>
          </RadixSelect.Portal>
        </RadixSelect.Root>

        <input
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handlePhoneInput}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          aria-invalid={error || undefined}
          aria-describedby={error && errorMessage ? errorId : undefined}
          className={styles.numberInput}
        />
      </div>
      {error && errorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
