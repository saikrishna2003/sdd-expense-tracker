import { FLASH_KEY, STORAGE_KEY, STORAGE_VERSION } from './config.js';
import { isValidStoredExpense } from './validation.js';

/**
 * Reads and checks the stored expenses document.
 * @returns {{ expenses: object[], error: null | 'unreadable' | 'unavailable' }}
 */
export function loadExpenses() {
  let rawText;
  try {
    rawText = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Browser storage is not available.', error);
    return { expenses: [], error: 'unavailable' };
  }

  if (rawText === null) {
    return { expenses: [], error: null };
  }

  let documentData;
  try {
    documentData = JSON.parse(rawText);
  } catch (error) {
    console.error('Saved expenses are not valid JSON.', error);
    return { expenses: [], error: 'unreadable' };
  }

  if (!documentData || documentData.version !== STORAGE_VERSION || !Array.isArray(documentData.expenses)) {
    console.error('Saved expenses have an unexpected format.', documentData);
    return { expenses: [], error: 'unreadable' };
  }

  const expenses = documentData.expenses.filter((record) => {
    const isValid = isValidStoredExpense(record);
    if (!isValid) {
      console.warn('Skipping an invalid saved expense.', record);
    }
    return isValid;
  });
  return { expenses, error: null };
}

/**
 * Writes the full list of expenses back to storage.
 * @param {object[]} expenses
 * @returns {boolean} true when saved
 */
function saveExpenses(expenses) {
  try {
    const documentData = { version: STORAGE_VERSION, expenses };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documentData));
    return true;
  } catch (error) {
    console.error('Could not save expenses.', error);
    return false;
  }
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Finds one expense by id.
 * @param {string} id
 * @returns {object | null}
 */
export function getExpenseById(id) {
  return loadExpenses().expenses.find((expense) => expense.id === id) ?? null;
}

/**
 * Adds a new expense.
 * @param {{ amountMinor: number, category: string, date: string, description: string }} input validated values
 * @returns {{ ok: true, expense: object } | { ok: false, reason: 'save-failed' }}
 */
export function addExpense(input) {
  const now = new Date().toISOString();
  const expense = { id: createId(), ...input, createdAt: now, updatedAt: now };
  // Always re-read before writing so changes made in other tabs are kept.
  const { expenses } = loadExpenses();
  if (!saveExpenses([...expenses, expense])) {
    return { ok: false, reason: 'save-failed' };
  }
  return { ok: true, expense };
}

/**
 * Replaces the editable fields of an existing expense.
 * @param {string} id
 * @param {{ amountMinor: number, category: string, date: string, description: string }} input validated values
 * @returns {{ ok: true, expense: object } | { ok: false, reason: 'not-found' | 'save-failed' }}
 */
export function updateExpense(id, input) {
  const { expenses } = loadExpenses();
  const existing = expenses.find((expense) => expense.id === id);
  if (!existing) {
    return { ok: false, reason: 'not-found' };
  }

  const updated = { ...existing, ...input, id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
  const nextExpenses = expenses.map((expense) => (expense.id === id ? updated : expense));
  if (!saveExpenses(nextExpenses)) {
    return { ok: false, reason: 'save-failed' };
  }
  return { ok: true, expense: updated };
}

/**
 * Removes an expense.
 * @param {string} id
 * @returns {{ ok: true } | { ok: false, reason: 'not-found' | 'save-failed' }}
 */
export function deleteExpense(id) {
  const { expenses } = loadExpenses();
  if (!expenses.some((expense) => expense.id === id)) {
    return { ok: false, reason: 'not-found' };
  }
  if (!saveExpenses(expenses.filter((expense) => expense.id !== id))) {
    return { ok: false, reason: 'save-failed' };
  }
  return { ok: true };
}

/**
 * Stores a one-time message to show after the next page load.
 * @param {{ category: 'success' | 'error', title: string, description?: string }} message
 */
export function setFlash(message) {
  try {
    window.sessionStorage.setItem(FLASH_KEY, JSON.stringify(message));
  } catch (error) {
    console.warn('Could not store the flash message.', error);
  }
}

/**
 * Reads and removes the one-time message, if any.
 * @returns {{ category: string, title: string, description?: string } | null}
 */
export function takeFlash() {
  try {
    const rawText = window.sessionStorage.getItem(FLASH_KEY);
    window.sessionStorage.removeItem(FLASH_KEY);
    const message = rawText ? JSON.parse(rawText) : null;
    return message && typeof message.title === 'string' ? message : null;
  } catch (error) {
    console.warn('Could not read the flash message.', error);
    return null;
  }
}
