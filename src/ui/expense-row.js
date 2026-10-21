import { getCategoryColor } from '../config.js';
import { formatDate, formatMoney } from '../format.js';
import { createIcon } from './icons.js';

/**
 * Category badge with a color dot and the category name (never color alone).
 * @param {string} category
 * @returns {HTMLElement}
 */
export function createCategoryBadge(category) {
  const badge = document.createElement('span');
  badge.className = 'badge gap-1.5';
  badge.dataset.variant = 'outline';
  const dot = document.createElement('span');
  dot.className = 'size-2 rounded-full';
  dot.style.backgroundColor = getCategoryColor(category);
  dot.setAttribute('aria-hidden', 'true');
  badge.append(dot, document.createTextNode(category));
  return badge;
}

function textElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

/**
 * Edit link + Delete button for one expense. The Delete button carries
 * `data-delete-id`, so the page can handle all clicks with one listener.
 * @param {object} expense
 * @param {string} displayDate already formatted date
 * @returns {HTMLElement}
 */
function createExpenseActions(expense, displayDate) {
  const label = `${expense.description || expense.category} on ${displayDate}`;
  const actions = document.createElement('div');
  actions.className = 'flex shrink-0 items-center gap-1';

  const editLink = document.createElement('a');
  editLink.className = 'btn size-11';
  editLink.dataset.variant = 'ghost';
  editLink.dataset.size = 'icon';
  editLink.href = `./expense-form.html?id=${encodeURIComponent(expense.id)}`;
  editLink.setAttribute('aria-label', `Edit expense ${label}`);
  editLink.append(createIcon('pencil'));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'btn size-11 text-destructive';
  deleteButton.dataset.variant = 'ghost';
  deleteButton.dataset.size = 'icon';
  deleteButton.dataset.deleteId = expense.id;
  deleteButton.setAttribute('aria-label', `Delete expense ${label}`);
  deleteButton.append(createIcon('trash'));

  actions.append(editLink, deleteButton);
  return actions;
}

/**
 * Compact stacked item used on small screens and in the Dashboard's recent list.
 * @param {object} expense
 * @param {{ withActions?: boolean }} [options]
 * @returns {HTMLLIElement}
 */
export function createExpenseItem(expense, { withActions = false } = {}) {
  const displayDate = formatDate(expense.date);
  const item = document.createElement('li');
  item.className = 'flex items-start justify-between gap-3 py-3';

  const details = document.createElement('div');
  details.className = 'min-w-0 flex-1 space-y-1';
  const topLine = document.createElement('div');
  topLine.className = 'flex flex-wrap items-center justify-between gap-2';
  topLine.append(
    createCategoryBadge(expense.category),
    textElement('span', 'font-semibold tabular-nums', formatMoney(expense.amountMinor)),
  );
  details.append(
    topLine,
    textElement('p', 'break-words text-sm', expense.description || '—'),
    textElement('p', 'text-xs text-muted-foreground', displayDate),
  );
  item.append(details);

  if (withActions) {
    item.append(createExpenseActions(expense, displayDate));
  }
  return item;
}

/**
 * Table row (with actions) used on medium screens and up.
 * @param {object} expense
 * @returns {HTMLTableRowElement}
 */
export function createExpenseTableRow(expense) {
  const displayDate = formatDate(expense.date);
  const row = document.createElement('tr');

  const categoryCell = document.createElement('td');
  categoryCell.append(createCategoryBadge(expense.category));

  const actionsCell = document.createElement('td');
  actionsCell.className = 'w-0';
  actionsCell.append(createExpenseActions(expense, displayDate));

  row.append(
    textElement('td', 'py-2', displayDate),
    categoryCell,
    textElement('td', 'max-w-xs whitespace-normal break-words', expense.description || '—'),
    textElement('td', 'text-right font-medium tabular-nums', formatMoney(expense.amountMinor)),
    actionsCell,
  );
  return row;
}
