/**
 * App-wide settings. Change currency, locale, or categories here only.
 */

export const APP_NAME = 'Expensify';

export const STORAGE_KEY = 'expensify.expenses.v1';
export const STORAGE_VERSION = 1;
export const FLASH_KEY = 'expensify.flash';

export const CURRENCY_SYMBOL = '₹';
export const LOCALE = 'en-IN';

/** Largest allowed amount in minor units (paise): 9,999,999.99. */
export const MAX_AMOUNT_MINOR = 999999999;
export const MAX_DESCRIPTION_LENGTH = 100;
export const RECENT_EXPENSES_LIMIT = 5;
export const TREND_MONTHS = 6;
/** How many rows the expense list shows at a time ("Show more" adds the next batch). */
export const LIST_BATCH_SIZE = 100;

/** Fixed categories in display order (order also breaks ties). */
export const CATEGORIES = Object.freeze([
  Object.freeze({ name: 'Food', color: '#f97316' }),
  Object.freeze({ name: 'Entertainment', color: '#a855f7' }),
  Object.freeze({ name: 'Rent', color: '#2563eb' }),
  Object.freeze({ name: 'Commute', color: '#14b8a6' }),
  Object.freeze({ name: 'Shopping', color: '#ec4899' }),
  Object.freeze({ name: 'Utilities', color: '#f59e0b' }),
  Object.freeze({ name: 'Other', color: '#64748b' }),
]);

export const CATEGORY_NAMES = Object.freeze(CATEGORIES.map((category) => category.name));

const FALLBACK_COLOR = '#64748b';

/**
 * Returns the display color for a category name.
 * @param {string} name
 * @returns {string} CSS color
 */
export function getCategoryColor(name) {
  const category = CATEGORIES.find((item) => item.name === name);
  return category ? category.color : FALLBACK_COLOR;
}
