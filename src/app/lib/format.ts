export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function categoryLabel(category: string): string {
  return category
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export const DEFAULT_MASK_CATEGORIES = new Set([
  "EMAIL",
  "PHONE",
  "FINANCE",
  "CREDIT_CARD",
  "BANK_ACCOUNT",
  "DATE_OF_BIRTH",
  "ID_NUMBER",
]);
