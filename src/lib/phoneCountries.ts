import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js/min";

export interface PhoneCountry {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

// Regional-indicator symbols: each uppercase ASCII letter maps to the Unicode
// code point that renders as its "flag alphabet" glyph, so "IN" -> the
// India flag emoji without needing a flag image/font asset.
function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const PHONE_COUNTRIES: PhoneCountry[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames?.of(code) ?? code,
    dialCode: getCountryCallingCode(code),
    flag: isoToFlagEmoji(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_PHONE_COUNTRY: CountryCode = "IN";
