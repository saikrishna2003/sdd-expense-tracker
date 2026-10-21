import { CATEGORY_NAMES, LIST_BATCH_SIZE } from '../config.js';
import { currentMonthKey, parseMonthParam } from '../dates.js';
import { formatMoney, formatMonthLabel } from '../format.js';
import { deleteExpense, loadExpenses } from '../storage.js';
import { filterExpenses, getMonthsWithExpenses, sumAmounts } from '../summaries.js';
import { renderEmptyState } from '../ui/empty-state.js';
import { createExpenseItem, createExpenseTableRow } from '../ui/expense-row.js';
import { renderLayout, runPage, showPageAlert, showStorageError } from '../ui/layout.js';
import { showPendingFlash, showToast } from '../ui/toast.js';

const ALL_MONTHS = 'all';
// Matches Tailwind's `md` breakpoint: table at 768px and wider, stacked cards below.
const wideScreen = window.matchMedia('(min-width: 768px)');

const filters = { month: currentMonthKey(), category: null };
let pendingDelete = null;
let currentResults = [];
let shownCount = 0;

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const month = params.get('month');
  const category = params.get('category');
  filters.month = month === ALL_MONTHS ? ALL_MONTHS : parseMonthParam(month) ?? currentMonthKey();
  filters.category = CATEGORY_NAMES.includes(category) ? category : null;
}

function writeFiltersToUrl() {
  const params = new URLSearchParams();
  if (filters.month !== currentMonthKey()) {
    params.set('month', filters.month);
  }
  if (filters.category) {
    params.set('category', filters.category);
  }
  const query = params.toString();
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

function createOption(value, label, selectedValue) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.selected = value === selectedValue;
  return option;
}

function populateFilterOptions(expenses) {
  // Always include the current and the selected month, even when they have no expenses.
  const monthKeys = new Set([currentMonthKey(), ...getMonthsWithExpenses(expenses)]);
  if (filters.month !== ALL_MONTHS) {
    monthKeys.add(filters.month);
  }
  const sortedMonths = [...monthKeys].sort().reverse();
  document.getElementById('filter-month').replaceChildren(
    ...sortedMonths.map((key) => createOption(key, formatMonthLabel(key), filters.month)),
    createOption(ALL_MONTHS, 'All months', filters.month),
  );

  document.getElementById('filter-category').replaceChildren(
    createOption('', 'All categories', filters.category ?? ''),
    ...CATEGORY_NAMES.map((name) => createOption(name, name, filters.category ?? '')),
  );
}

function isDefaultView() {
  return filters.month === currentMonthKey() && !filters.category;
}

function renderNoMatches() {
  const container = document.getElementById('list-empty');
  const emptyState = isDefaultView()
    ? renderEmptyState({
      title: `No expenses in ${formatMonthLabel(filters.month)}.`,
      message: 'Add an expense or choose another month.',
      actionLabel: 'Add expense',
      actionHref: './expense-form.html',
    })
    : renderEmptyState({
      iconName: 'searchX',
      title: 'No expenses match these filters.',
      message: 'Try another month or category.',
      actionLabel: 'Clear filters',
      onAction: clearFilters,
    });
  container.replaceChildren(emptyState);
}

function appendRows(expenses) {
  const rows = document.createDocumentFragment();
  if (wideScreen.matches) {
    expenses.forEach((expense) => rows.append(createExpenseTableRow(expense)));
    document.getElementById('expense-rows').append(rows);
  } else {
    expenses.forEach((expense) => rows.append(createExpenseItem(expense, { withActions: true })));
    document.getElementById('expense-cards').append(rows);
  }
}

function showNextBatch() {
  const nextCount = Math.min(shownCount + LIST_BATCH_SIZE, currentResults.length);
  appendRows(currentResults.slice(shownCount, nextCount));
  shownCount = nextCount;

  const remaining = currentResults.length - shownCount;
  document.getElementById('show-more-wrap').hidden = remaining === 0;
  document.getElementById('show-more').textContent = `Show more (${remaining} left)`;
}

function renderRows(visibleExpenses) {
  // Only the on-screen layout is built, in batches, so long lists stay fast.
  currentResults = visibleExpenses;
  shownCount = 0;
  document.getElementById('expense-rows').replaceChildren();
  document.getElementById('expense-cards').replaceChildren();
  showNextBatch();
}

function renderList(expenses = loadExpenses().expenses) {
  const hasExpenses = expenses.length > 0;
  document.getElementById('no-expenses').hidden = hasExpenses;
  document.getElementById('list-area').hidden = !hasExpenses;
  if (!hasExpenses) {
    return;
  }

  populateFilterOptions(expenses);
  const visibleExpenses = filterExpenses(expenses, filters);
  const monthLabel = filters.month === ALL_MONTHS ? 'All months' : formatMonthLabel(filters.month);
  document.getElementById('list-subtitle').textContent = filters.category ? `${monthLabel} · ${filters.category}` : monthLabel;

  const countLabel = visibleExpenses.length === 1 ? '1 expense' : `${visibleExpenses.length} expenses`;
  document.getElementById('list-summary').textContent = `${countLabel} · Total ${formatMoney(sumAmounts(visibleExpenses))}`;

  const hasResults = visibleExpenses.length > 0;
  document.getElementById('list-results').hidden = !hasResults;
  document.getElementById('list-empty').hidden = hasResults;
  if (hasResults) {
    renderRows(visibleExpenses);
  } else {
    renderNoMatches();
  }
}

function clearFilters() {
  filters.month = currentMonthKey();
  filters.category = null;
  writeFiltersToUrl();
  renderList();
}

function setUpFilters() {
  document.getElementById('filter-month').addEventListener('change', (event) => {
    filters.month = event.target.value;
    writeFiltersToUrl();
    renderList();
  });
  document.getElementById('filter-category').addEventListener('change', (event) => {
    filters.category = event.target.value || null;
    writeFiltersToUrl();
    renderList();
  });
  document.getElementById('clear-filters').addEventListener('click', clearFilters);
  document.getElementById('show-more').addEventListener('click', showNextBatch);
}

function openDeleteDialog(expenseId) {
  pendingDelete = expenseId;
  document.getElementById('delete-dialog').showModal();
}

function confirmDelete() {
  const dialog = document.getElementById('delete-dialog');
  const result = deleteExpense(pendingDelete);
  pendingDelete = null;
  dialog.close();

  if (result.ok) {
    showToast({ category: 'success', title: 'Expense deleted' });
  } else if (result.reason === 'not-found') {
    showToast({ category: 'error', title: 'This expense no longer exists.' });
  } else {
    showPageAlert("Your expense couldn't be saved. Your browser storage may be full.");
  }
  renderList();
  // The deleted row's button is gone, so move focus to a stable place.
  if (document.getElementById('list-area').hidden) {
    document.querySelector('#no-expenses a')?.focus();
  } else {
    document.getElementById('list-summary').focus();
  }
}

function setUpDeleteDialog() {
  const dialog = document.getElementById('delete-dialog');
  // One listener for every Delete button in the list (rows are re-rendered often).
  document.getElementById('list-results').addEventListener('click', (event) => {
    const deleteButton = event.target.closest('[data-delete-id]');
    if (deleteButton) {
      openDeleteDialog(deleteButton.dataset.deleteId);
    }
  });
  document.getElementById('cancel-delete').addEventListener('click', () => dialog.close());
  document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
  dialog.addEventListener('close', () => {
    pendingDelete = null;
  });
}

function renderNoExpensesState() {
  document.getElementById('no-expenses').replaceChildren(renderEmptyState({
    title: 'No expenses yet',
    message: 'Every expense you record will be listed here, newest first.',
    actionLabel: 'Add your first expense',
    actionHref: './expense-form.html',
  }));
}

runPage(() => {
  renderLayout('expenses');
  showPendingFlash();

  const { expenses, error } = loadExpenses();
  showStorageError(error);

  readFiltersFromUrl();
  renderNoExpensesState();
  setUpFilters();
  setUpDeleteDialog();
  wideScreen.addEventListener('change', () => renderList());
  renderList(expenses);
});
