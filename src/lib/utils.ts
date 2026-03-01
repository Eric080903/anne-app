// =============================================================================
// Anne App - Utility / Formatting Helpers
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---------------------------------------------------------------------------
// Tailwind class merger (standard shadcn/ui pattern)
// ---------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Currency symbols
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  HKD: 'HK$',
  AUD: 'A$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  JPY: '\u00A5',
  CNY: '\u00A5',
  BTC: '\u20BF',
};

// ---------------------------------------------------------------------------
// Price formatting
// ---------------------------------------------------------------------------

/**
 * Format a price with currency symbol.
 * @example formatPrice(123.456)        // "$123.46"
 * @example formatPrice(123.456, 'HKD') // "HK$123.46"
 * @example formatPrice(0.00345, 'USD') // "$0.003450"  (crypto-friendly)
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;

  // For very small prices (crypto), show more decimals
  if (Math.abs(price) > 0 && Math.abs(price) < 0.01) {
    return `${symbol}${price.toFixed(6)}`;
  }

  return `${symbol}${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// Change formatting
// ---------------------------------------------------------------------------

/**
 * Format price change with sign and percentage.
 * @example formatChange(1.23, 0.56)   // "+1.23 (+0.56%)"
 * @example formatChange(-2.5, -1.1)   // "-2.50 (-1.10%)"
 */
export function formatChange(change: number, changePct: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`;
}

// ---------------------------------------------------------------------------
// Volume formatting
// ---------------------------------------------------------------------------

/**
 * Format volume into human-readable shorthand.
 * @example formatVolume(1_234_567)  // "1.2M"
 * @example formatVolume(845_000)    // "845K"
 * @example formatVolume(500)        // "500"
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(0)}K`;
  }
  return String(volume);
}

// ---------------------------------------------------------------------------
// Large number formatting
// ---------------------------------------------------------------------------

/**
 * Format a large number into shorthand.
 * @example formatLargeNumber(1_200_000_000) // "1.2B"
 * @example formatLargeNumber(345_000_000)   // "345M"
 * @example formatLargeNumber(12_000)        // "12K"
 */
export function formatLargeNumber(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return `${sign}${(abs / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${abs}`;
}

// ---------------------------------------------------------------------------
// Percent formatting
// ---------------------------------------------------------------------------

/**
 * Format a number as a percentage.
 * @example formatPercent(12.345)  // "12.35%"
 * @example formatPercent(0.5)     // "0.50%"
 */
export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`;
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

/**
 * Convert a date string into a human-readable relative time.
 * @example timeAgo('2026-02-28T10:00:00Z') // "2 hours ago"
 */
export function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
