export type AgeCategory =
  | "Under 18"
  | "18-25"
  | "26-35"
  | "36-45"
  | "46-60"
  | "60+"
  | "Unknown";

export const AGE_CATEGORIES: AgeCategory[] = [
  "Under 18",
  "18-25",
  "26-35",
  "36-45",
  "46-60",
  "60+",
  "Unknown",
];

export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export function getAgeCategory(dob: string | null | undefined): AgeCategory {
  const age = calculateAge(dob);
  if (age === null) return "Unknown";
  if (age < 18) return "Under 18";
  if (age <= 25) return "18-25";
  if (age <= 35) return "26-35";
  if (age <= 45) return "36-45";
  if (age <= 60) return "46-60";
  return "60+";
}