import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Indian Rupee formatting (e.g. ₹1,23,456 or ₹12.5 Cr)
export function formatINR(val: number | null | undefined, options?: { isCr?: boolean; decimals?: number }): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  
  const decimals = options?.decimals ?? 2;
  
  if (options?.isCr) {
    return `₹${val.toFixed(decimals)} Cr`;
  }

  // Standard Indian number format with ₹
  const parts = val.toFixed(decimals).split(".");
  let x = parts[0];
  const lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== "") {
    x = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  return `₹${x}${decimals > 0 && parts[1] ? "." + parts[1] : ""}`;
}

export function formatPct(val: number | null | undefined, showPlus = true): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  const sign = val > 0 && showPlus ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

