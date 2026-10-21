import { getCategoryColor } from '../config.js';
import { currentMonthKey, parseMonthParam, shiftMonth } from '../dates.js';
import { formatMoney } from '../format.js';
import { loadExpenses } from '../storage.js';
import { getMonthlySummary, getMonthlyTrend } from '../summaries.js';
import { renderDonutChart, renderTrendChart } from '../ui/charts.js';
import { renderEmptyState } from '../ui/empty-state.js';
import { createExpenseItem } from '../ui/expense-row.js';
import { renderLayout, runPage, showStorageError } from '../ui/layout.js';
import { showPendingFlash } from '../ui/toast.js';

function showWelcome() {
  const welcome = document.getElementById('welcome');
  welcome.replaceChildren(renderEmptyState({
    iconName: 'wallet',
    title: 'Welcome to Expensify',
    message: 'Record your day-to-day expenses and this dashboard will show where your money goes each month.',
    actionLabel: 'Add your first expense',
    actionHref: './expense-form.html',
  }));
  welcome.hidden = false;
}

function renderMonthSwitcher(summary) {
  document.getElementById('month-title').textContent = summary.label;
  document.title = `${summary.label} · Dashboard · Expensify`;
  document.getElementById('prev-month').href = `./?month=${shiftMonth(summary.monthKey, -1)}`;
  document.getElementById('next-month').href = `./?month=${shiftMonth(summary.monthKey, 1)}`;
  document.getElementById('prev-month').setAttribute('aria-label', 'Previous month');
  document.getElementById('next-month').setAttribute('aria-label', 'Next month');
}

function renderSummaryCards(summary) {
  document.getElementById('total-spent').textContent = formatMoney(summary.totalMinor);
  document.getElementById('expense-count').textContent = String(summary.count);

  const topCategory = document.getElementById('top-category');
  topCategory.replaceChildren();
  if (!summary.topCategory) {
    topCategory.textContent = '—';
    return;
  }
  const dot = document.createElement('span');
  dot.className = 'size-3 shrink-0 rounded-full';
  dot.style.backgroundColor = getCategoryColor(summary.topCategory);
  dot.setAttribute('aria-hidden', 'true');
  const name = document.createElement('span');
  name.className = 'min-w-0 break-words';
  name.textContent = summary.topCategory;
  topCategory.append(dot, name);
}

function renderRecentExpenses(summary) {
  const body = document.getElementById('recent-body');
  const viewAll = document.getElementById('view-all');
  viewAll.href = `./expenses.html?month=${summary.monthKey}`;

  if (summary.count === 0) {
    viewAll.hidden = true;
    body.replaceChildren(renderEmptyState({
      title: `No expenses in ${summary.label} yet.`,
      message: 'Expenses you add for this month will show up here.',
      actionLabel: 'Add expense',
      actionHref: './expense-form.html',
    }));
    return;
  }

  viewAll.hidden = false;
  const list = document.createElement('ul');
  list.className = 'divide-y';
  summary.recent.forEach((expense) => list.append(createExpenseItem(expense)));
  body.replaceChildren(list);
}

function renderInsights(expenses, summary) {
  const breakdownBody = document.getElementById('breakdown-body');
  if (summary.count === 0) {
    const message = document.createElement('p');
    message.className = 'py-8 text-center text-sm text-muted-foreground';
    message.textContent = 'Nothing to show for this month yet.';
    breakdownBody.replaceChildren(message);
  } else {
    renderDonutChart(breakdownBody, summary.breakdown, summary.totalMinor);
  }

  const trend = getMonthlyTrend(expenses, summary.monthKey);
  renderTrendChart(document.getElementById('trend-body'), trend, summary.monthKey);
}

function renderDashboard(expenses, monthKey) {
  const summary = getMonthlySummary(expenses, monthKey);
  renderMonthSwitcher(summary);
  renderSummaryCards(summary);
  renderInsights(expenses, summary);
  renderRecentExpenses(summary);
  document.getElementById('dashboard').hidden = false;
}

runPage(() => {
  renderLayout('dashboard');
  showPendingFlash();

  const { expenses, error } = loadExpenses();
  showStorageError(error);
  if (expenses.length === 0) {
    showWelcome();
    return;
  }

  const requestedMonth = new URLSearchParams(window.location.search).get('month');
  renderDashboard(expenses, parseMonthParam(requestedMonth) ?? currentMonthKey());
});
