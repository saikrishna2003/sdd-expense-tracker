import { CATEGORY_NAMES, MAX_AMOUNT_MINOR, MAX_DESCRIPTION_LENGTH } from './config.js';
import { isMoreThanOneYearAhead, isValidISODate } from './dates.js';
import { formatMoney } from './format.js';

const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T/;

/**
 * Checks the amount text and converts it to minor units.
 * @param {string} rawAmount
 * @returns {{ error: string } | { amountMinor: number }}
 */
function parseAmount(rawAmount) {
  const trimmed = String(rawAmount ?? '').trim();
  if (trimmed === '') {
    return { error: 'Please enter an amount.' };
  }

  // Allow friendly input such as " 1,000 " by dropping spaces and thousands separators.
  const cleaned = trimmed.replace(/[\s,]/g, '');
  if (!NUMBER_PATTERN.test(cleaned)) {
    return { error: 'Amount must be a number, like 250 or 250.50.' };
  }

  const isNegative = cleaned.startsWith('-');
  const [wholePart, fractionPart = ''] = cleaned.replace('-', '').split('.');
  if (fractionPart.length > 2) {
    return { error: 'Amount can have at most 2 decimal places.' };
  }

  // String math avoids floating-point rounding (e.g., 0.1 + 0.2).
  const amountMinor = Number(wholePart || '0') * 100 + Number(fractionPart.padEnd(2, '0'));
  if (isNegative || amountMinor <= 0) {
    return { error: 'Amount must be greater than 0.' };
  }
  if (amountMinor > MAX_AMOUNT_MINOR) {
    return { error: `Amount can't be more than ${formatMoney(MAX_AMOUNT_MINOR)}.` };
  }
  return { amountMinor };
}

/**
 * @param {string} rawCategory
 * @returns {string | null} error message or null
 */
function checkCategory(rawCategory) {
  if (!rawCategory) {
    return 'Please choose a category.';
  }
  return CATEGORY_NAMES.includes(rawCategory) ? null : 'Please choose a category from the list.';
}

/**
 * @param {string} rawDate
 * @returns {string | null} error message or null
 */
function checkDate(rawDate) {
  if (!rawDate) {
    return 'Please pick a date.';
  }
  if (!isValidISODate(rawDate)) {
    return 'Please enter a valid date.';
  }
  return isMoreThanOneYearAhead(rawDate) ? "Date can't be more than one year in the future." : null;
}

/**
 * Validates raw form values and returns field errors plus the normalized expense input.
 * @param {{ amount: string, category: string, date: string, description: string }} raw
 * @returns {{ valid: boolean, errors: Record<string, string>, value: { amountMinor: number, category: string, date: string, description: string } }}
 */
export function validateExpenseInput(raw) {
  const errors = {};

  const amountResult = parseAmount(raw.amount);
  if (amountResult.error) {
    errors.amount = amountResult.error;
  }

  const categoryError = checkCategory(raw.category);
  if (categoryError) {
    errors.category = categoryError;
  }

  const date = String(raw.date ?? '').trim();
  const dateError = checkDate(date);
  if (dateError) {
    errors.date = dateError;
  }

  const description = String(raw.description ?? '').trim();
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description can be at most ${MAX_DESCRIPTION_LENGTH} characters.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: {
      amountMinor: amountResult.amountMinor ?? 0,
      category: raw.category,
      date,
      description,
    },
  };
}

/**
 * True when a record read from storage has the expected Expense shape.
 * @param {unknown} record
 * @returns {boolean}
 */
export function isValidStoredExpense(record) {
  if (!record || typeof record !== 'object') {
    return false;
  }
  const { id, amountMinor, category, date, description, createdAt, updatedAt } = record;
  return (
    typeof id === 'string' && id.length > 0
    && Number.isInteger(amountMinor) && amountMinor >= 1 && amountMinor <= MAX_AMOUNT_MINOR
    && CATEGORY_NAMES.includes(category)
    && isValidISODate(date)
    && typeof description === 'string' && description.length <= MAX_DESCRIPTION_LENGTH
    && typeof createdAt === 'string' && ISO_TIMESTAMP_PATTERN.test(createdAt)
    && typeof updatedAt === 'string' && ISO_TIMESTAMP_PATTERN.test(updatedAt)
  );
}
