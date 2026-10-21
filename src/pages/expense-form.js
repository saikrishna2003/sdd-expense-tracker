import { CATEGORY_NAMES, CURRENCY_SYMBOL, MAX_DESCRIPTION_LENGTH } from '../config.js';
import { toMonthKey, todayISO } from '../dates.js';
import { minorToInputString } from '../format.js';
import { addExpense, getExpenseById, loadExpenses, setFlash, updateExpense } from '../storage.js';
import { validateExpenseInput } from '../validation.js';
import { renderEmptyState } from '../ui/empty-state.js';
import { renderLayout, runPage, showPageAlert, showStorageError } from '../ui/layout.js';

const FIELDS = ['amount', 'category', 'date', 'description'];
const SAVE_FAILED_MESSAGE = "Your expense couldn't be saved. Your browser storage may be full.";

const form = document.getElementById('expense-form');
const saveButton = document.getElementById('save-button');

function populateCategoryOptions() {
  const select = document.getElementById('category');
  CATEGORY_NAMES.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.append(option);
  });
}

function updateDescriptionCount() {
  const length = document.getElementById('description').value.trim().length;
  const counter = document.getElementById('description-count');
  counter.textContent = `${length}/${MAX_DESCRIPTION_LENGTH}`;
  counter.classList.toggle('text-destructive', length > MAX_DESCRIPTION_LENGTH);
}

function setUpCancelButton() {
  document.getElementById('cancel-button').addEventListener('click', () => {
    const cameFromThisApp = document.referrer.startsWith(window.location.origin);
    if (cameFromThisApp && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('./expenses.html');
    }
  });
}

function readFormValues() {
  return Object.fromEntries(FIELDS.map((field) => [field, document.getElementById(field).value]));
}

function clearErrors() {
  FIELDS.forEach((field) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}-error`);
    input.removeAttribute('aria-invalid');
    if (field === 'description') {
      input.setAttribute('aria-describedby', 'description-count');
    } else {
      input.removeAttribute('aria-describedby');
    }
    document.getElementById(`${field}-field`).removeAttribute('data-invalid');
    error.textContent = '';
    error.hidden = true;
  });
}

function showErrors(errors) {
  const invalidFields = FIELDS.filter((field) => errors[field]);
  invalidFields.forEach((field) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}-error`);
    error.textContent = errors[field];
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', field === 'description' ? 'description-error description-count' : `${field}-error`);
    document.getElementById(`${field}-field`).dataset.invalid = 'true';
  });
  document.getElementById(invalidFields[0]).focus();
}

function showNotFound() {
  form.hidden = true;
  const container = document.getElementById('not-found');
  container.replaceChildren(renderEmptyState({
    iconName: 'searchX',
    title: 'This expense no longer exists.',
    message: 'It may have been deleted in another tab.',
    actionLabel: 'Back to expenses',
    actionHref: './expenses.html',
  }));
  container.hidden = false;
}

function fillForm(expense) {
  document.getElementById('amount').value = minorToInputString(expense.amountMinor);
  document.getElementById('category').value = expense.category;
  document.getElementById('date').value = expense.date;
  document.getElementById('description').value = expense.description;
  updateDescriptionCount();
}

function saveExpense(expenseId, value) {
  const result = expenseId ? updateExpense(expenseId, value) : addExpense(value);
  if (result.ok) {
    setFlash({ category: 'success', title: expenseId ? 'Expense updated' : 'Expense added' });
    // Keep Save disabled while the next page loads, so a double-click can't save twice.
    window.location.assign(`./expenses.html?month=${toMonthKey(value.date)}`);
    return;
  }

  if (result.reason === 'not-found') {
    showNotFound();
  } else {
    showPageAlert(SAVE_FAILED_MESSAGE);
    saveButton.disabled = false;
  }
}

function handleSubmit(event, expenseId) {
  event.preventDefault();
  if (saveButton.disabled) {
    return;
  }
  saveButton.disabled = true;
  clearErrors();

  const { valid, errors, value } = validateExpenseInput(readFormValues());
  if (!valid) {
    showErrors(errors);
    saveButton.disabled = false;
    return;
  }
  saveExpense(expenseId, value);
}

function setUpEditMode(expense) {
  document.title = 'Edit expense · Expensify';
  document.getElementById('form-title').textContent = 'Edit expense';
  fillForm(expense);
}

runPage(() => {
  const expenseId = new URLSearchParams(window.location.search).get('id');
  renderLayout(expenseId ? 'expenses' : 'add');

  const { error } = loadExpenses();
  showStorageError(error);

  document.getElementById('currency-prefix').textContent = CURRENCY_SYMBOL;
  populateCategoryOptions();
  setUpCancelButton();
  document.getElementById('description').addEventListener('input', updateDescriptionCount);

  if (expenseId) {
    const expense = getExpenseById(expenseId);
    if (!expense) {
      showNotFound();
      return;
    }
    setUpEditMode(expense);
  } else {
    document.getElementById('date').value = todayISO();
  }

  form.addEventListener('submit', (event) => handleSubmit(event, expenseId));
});
