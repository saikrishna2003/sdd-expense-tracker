import {
  addMonths,
  addYears,
  format,
  isAfter,
  isValid,
  parseISO,
  startOfToday,
} from 'date-fns';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Today's local date as `yyyy-MM-dd`.
 * @returns {string}
 */
export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * True when the text is a real calendar date in `yyyy-MM-dd` form (e.g., rejects 2026-02-30).
 * @param {string} text
 * @returns {boolean}
 */
export function isValidISODate(text) {
  if (typeof text !== 'string' || !ISO_DATE_PATTERN.test(text)) {
    return false;
  }
  const date = parseISO(text);
  // Round-trip check catches dates that roll over, like 2026-02-30 → 2026-03-02.
  return isValid(date) && format(date, 'yyyy-MM-dd') === text;
}

/**
 * True when the date is later than one year from today.
 * @param {string} isoDate `yyyy-MM-dd`
 * @returns {boolean}
 */
export function isMoreThanOneYearAhead(isoDate) {
  return isAfter(parseISO(isoDate), addYears(startOfToday(), 1));
}

/**
 * Month key (`yyyy-MM`) of a `yyyy-MM-dd` date.
 * @param {string} isoDate
 * @returns {string}
 */
export function toMonthKey(isoDate) {
  return isoDate.slice(0, 7);
}

/**
 * Month key of the current local month.
 * @returns {string}
 */
export function currentMonthKey() {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Returns the value if it is a valid `yyyy-MM` month key, otherwise `null`.
 * @param {string | null} value
 * @returns {string | null}
 */
export function parseMonthParam(value) {
  return typeof value === 'string' && MONTH_KEY_PATTERN.test(value) ? value : null;
}

/**
 * First day of the month for a month key.
 * @param {string} monthKey `yyyy-MM`
 * @returns {Date}
 */
export function monthKeyToDate(monthKey) {
  return parseISO(`${monthKey}-01`);
}

/**
 * Moves a month key forwards or backwards.
 * @param {string} monthKey `yyyy-MM`
 * @param {number} delta number of months (negative = earlier)
 * @returns {string}
 */
export function shiftMonth(monthKey, delta) {
  return format(addMonths(monthKeyToDate(monthKey), delta), 'yyyy-MM');
}

/**
 * The `count` month keys ending with `endMonthKey`, oldest first.
 * @param {string} endMonthKey
 * @param {number} count
 * @returns {string[]}
 */
export function lastMonthKeys(endMonthKey, count) {
  const keys = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    keys.push(shiftMonth(endMonthKey, -offset));
  }
  return keys;
}
