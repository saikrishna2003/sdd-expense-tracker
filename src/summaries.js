import { CATEGORY_NAMES, RECENT_EXPENSES_LIMIT, TREND_MONTHS } from './config.js';
import { lastMonthKeys } from './dates.js';
import { formatMonthLabel, formatMonthShort } from './format.js';

/**
 * Sorts expenses by date (newest first), then by creation time (newest first).
 * @param {object[]} expenses
 * @returns {object[]} a new array
 */
export function sortNewestFirst(expenses) {
  return [...expenses].sort((first, second) => {
    if (first.date !== second.date) {
      return first.date < second.date ? 1 : -1;
    }
    return first.createdAt < second.createdAt ? 1 : -1;
  });
}

/**
 * Keeps expenses in a month (`yyyy-MM`), or all of them when the month is `'all'`.
 * @param {object[]} expenses
 * @param {string} monthKey
 * @returns {object[]}
 */
export function filterByMonth(expenses, monthKey) {
  if (monthKey === 'all') {
    return expenses;
  }
  return expenses.filter((expense) => expense.date.startsWith(monthKey));
}

/**
 * Adds up amounts (integer minor units, so the sum is exact).
 * @param {object[]} expenses
 * @returns {number}
 */
export function sumAmounts(expenses) {
  return expenses.reduce((total, expense) => total + expense.amountMinor, 0);
}

/**
 * Filters by month and category, sorted newest first.
 * @param {object[]} expenses
 * @param {{ month: string, category: string | null }} filters
 * @returns {object[]}
 */
export function filterExpenses(expenses, { month, category }) {
  const inMonth = filterByMonth(expenses, month);
  const inCategory = category ? inMonth.filter((expense) => expense.category === category) : inMonth;
  return sortNewestFirst(inCategory);
}

/**
 * Unique month keys that have at least one expense, newest first.
 * @param {object[]} expenses
 * @returns {string[]}
 */
export function getMonthsWithExpenses(expenses) {
  const months = new Set(expenses.map((expense) => expense.date.slice(0, 7)));
  return [...months].sort().reverse();
}

/**
 * Per-category totals and percentages, highest first (ties keep config order).
 * @param {object[]} monthExpenses
 * @param {number} monthTotal
 * @returns {{ category: string, totalMinor: number, percent: number }[]}
 */
function getCategoryBreakdown(monthExpenses, monthTotal) {
  const totals = CATEGORY_NAMES.map((category) => ({
    category,
    totalMinor: sumAmounts(monthExpenses.filter((expense) => expense.category === category)),
  }));
  return totals
    .filter((entry) => entry.totalMinor > 0)
    .sort((first, second) => second.totalMinor - first.totalMinor)
    .map((entry) => ({
      ...entry,
      percent: Math.round((entry.totalMinor / monthTotal) * 1000) / 10,
    }));
}

/**
 * Everything the Dashboard needs for one month.
 * @param {object[]} expenses
 * @param {string} monthKey `yyyy-MM`
 * @returns {{ monthKey: string, label: string, totalMinor: number, count: number, topCategory: string | null, breakdown: object[], recent: object[] }}
 */
export function getMonthlySummary(expenses, monthKey) {
  const monthExpenses = filterByMonth(expenses, monthKey);
  const totalMinor = sumAmounts(monthExpenses);
  const breakdown = totalMinor > 0 ? getCategoryBreakdown(monthExpenses, totalMinor) : [];
  return {
    monthKey,
    label: formatMonthLabel(monthKey),
    totalMinor,
    count: monthExpenses.length,
    topCategory: breakdown.length > 0 ? breakdown[0].category : null,
    breakdown,
    recent: sortNewestFirst(monthExpenses).slice(0, RECENT_EXPENSES_LIMIT),
  };
}

/**
 * Monthly totals for the months ending with `endMonthKey`, oldest first.
 * @param {object[]} expenses
 * @param {string} endMonthKey
 * @param {number} [count]
 * @returns {{ monthKey: string, shortLabel: string, totalMinor: number }[]}
 */
export function getMonthlyTrend(expenses, endMonthKey, count = TREND_MONTHS) {
  return lastMonthKeys(endMonthKey, count).map((monthKey) => ({
    monthKey,
    shortLabel: formatMonthShort(monthKey),
    totalMinor: sumAmounts(filterByMonth(expenses, monthKey)),
  }));
}
