import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fungsi untuk memformat angka dengan pemisah ribuan (koma)
export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === "") return "-";
  
  const num = Number(value);
  
  if (isNaN(num)) return String(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(num);
}