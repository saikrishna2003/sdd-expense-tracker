import { format, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL, LOCALE } from './config.js';
import { monthKeyToDate } from './dates.js';

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactMoneyFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/**
 * Formats minor units as money, e.g. 25050 → "₹250.50".
 * @param {number} amountMinor
 * @returns {string}
 */
export function formatMoney(amountMinor) {
  return `${CURRENCY_SYMBOL}${moneyFormatter.format(amountMinor / 100)}`;
}

/**
 * Short money label for small chart labels, e.g. 12345600 → "₹1.2L".
 * @param {number} amountMinor
 * @returns {string}
 */
export function formatMoneyCompact(amountMinor) {
  return `${CURRENCY_SYMBOL}${compactMoneyFormatter.format(amountMinor / 100)}`;
}

/**
 * Formats a `yyyy-MM-dd` date for display, e.g. "20 Oct 2026".
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  return format(parseISO(isoDate), 'd MMM yyyy');
}

/**
 * Formats a month key as a heading, e.g. "October 2026".
 * @param {string} monthKey
 * @returns {string}
 */
export function formatMonthLabel(monthKey) {
  return format(monthKeyToDate(monthKey), 'MMMM yyyy');
}

/**
 * Formats a month key as a short label, e.g. "Oct".
 * @param {string} monthKey
 * @returns {string}
 */
export function formatMonthShort(monthKey) {
  return format(monthKeyToDate(monthKey), 'MMM');
}

/**
 * Formats a percentage with one decimal place, e.g. 42.5 → "42.5%".
 * @param {number} value
 * @returns {string}
 */
export function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

/**
 * Converts minor units to an editable amount string, e.g. 25050 → "250.50".
 * @param {number} amountMinor
 * @returns {string}
 */
export function minorToInputString(amountMinor) {
  return (amountMinor / 100).toFixed(2);
}
