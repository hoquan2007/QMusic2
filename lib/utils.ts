import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to "m:ss" or "h:mm:ss"
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = sec % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${
      remainingSecs < 10 ? "0" : ""
    }${remainingSecs}`;
  }
  return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
}

/**
 * Format large numbers to human-readable strings (e.g. 1.4K, 2.5M)
 */
export function formatCount(count: number): string {
  if (isNaN(count) || count <= 0) return "0";
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toLocaleString("vi-VN");
}

/**
 * Relative or localized date string
 */
export function formatDate(isoDate?: string): string {
  if (!isoDate) return "";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

