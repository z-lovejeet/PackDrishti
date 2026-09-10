/**
 * Formatting utilities for Legal Metrology data, timestamps, currency, and dimensions
 */

export function formatCurrencyInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPdpArea(cm2: number): string {
  return `${cm2.toLocaleString("en-IN")} cm²`;
}

export function formatFontMeasurement(measuredMm: number, requiredMm: number): {
  text: string;
  isCompliant: boolean;
  deltaMm: number;
} {
  const delta = Math.round((measuredMm - requiredMm) * 10) / 10;
  return {
    text: `${measuredMm.toFixed(1)} mm (Min: ${requiredMm.toFixed(1)} mm)`,
    isCompliant: measuredMm >= requiredMm,
    deltaMm: delta,
  };
}

export function truncateText(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
