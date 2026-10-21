import { getCategoryColor } from '../config.js';
import { formatMoney, formatMoneyCompact, formatMonthLabel, formatPercent } from '../format.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// A circle with this radius has a circumference of 100, so dash lengths equal percentages.
const DONUT_RADIUS = 15.9155;
const DONUT_STROKE = 6;

function createSvgCircle(color, dashArray, dashOffset) {
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '21');
  circle.setAttribute('cy', '21');
  circle.setAttribute('r', String(DONUT_RADIUS));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', color);
  circle.setAttribute('stroke-width', String(DONUT_STROKE));
  if (dashArray) {
    circle.setAttribute('stroke-dasharray', dashArray);
    circle.setAttribute('stroke-dashoffset', String(dashOffset));
  }
  return circle;
}

function createDonutSvg(breakdown, monthTotal) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 42 42');
  svg.setAttribute('class', 'size-full');
  svg.setAttribute('aria-hidden', 'true');
  svg.append(createSvgCircle('var(--muted)'));

  // Start at 12 o'clock (offset 25) and go clockwise.
  let drawnShare = 0;
  breakdown.forEach((entry) => {
    const share = (entry.totalMinor / monthTotal) * 100;
    const circle = createSvgCircle(getCategoryColor(entry.category), `${share} ${100 - share}`, 25 - drawnShare);
    svg.append(circle);
    drawnShare += share;
  });
  return svg;
}

function createLegend(breakdown) {
  const legend = document.createElement('ul');
  legend.className = 'w-full space-y-2';
  breakdown.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'flex items-center gap-2 text-sm';
    const swatch = document.createElement('span');
    swatch.className = 'size-3 shrink-0 rounded-sm';
    swatch.style.backgroundColor = getCategoryColor(entry.category);
    swatch.setAttribute('aria-hidden', 'true');
    const name = document.createElement('span');
    name.className = 'flex-1 truncate';
    name.textContent = entry.category;
    const amount = document.createElement('span');
    amount.className = 'font-medium tabular-nums';
    amount.textContent = formatMoney(entry.totalMinor);
    const percent = document.createElement('span');
    percent.className = 'w-14 text-right text-muted-foreground tabular-nums';
    percent.textContent = formatPercent(entry.percent);
    item.append(swatch, name, amount, percent);
    legend.append(item);
  });
  return legend;
}

/**
 * Draws the category donut chart with a text legend.
 * @param {HTMLElement} container
 * @param {{ category: string, totalMinor: number, percent: number }[]} breakdown highest first
 * @param {number} monthTotal minor units
 */
export function renderDonutChart(container, breakdown, monthTotal) {
  const [top] = breakdown;
  const chart = document.createElement('div');
  chart.className = 'relative mx-auto size-40 shrink-0';
  chart.setAttribute('role', 'img');
  chart.setAttribute('aria-label', `Spending by category: ${breakdown
    .map((entry) => `${entry.category} ${formatPercent(entry.percent)}`)
    .join(', ')}`);
  chart.append(createDonutSvg(breakdown, monthTotal));

  const centre = document.createElement('div');
  centre.className = 'absolute inset-0 flex flex-col items-center justify-center text-center';
  centre.setAttribute('aria-hidden', 'true');
  const centreName = document.createElement('span');
  centreName.className = 'max-w-20 truncate text-xs text-muted-foreground';
  centreName.textContent = top.category;
  const centrePercent = document.createElement('span');
  centrePercent.className = 'text-lg font-bold tabular-nums';
  centrePercent.textContent = formatPercent(top.percent);
  centre.append(centreName, centrePercent);
  chart.append(centre);

  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col items-center gap-6 sm:flex-row sm:items-center';
  wrapper.append(chart, createLegend(breakdown));
  container.replaceChildren(wrapper);
}

function createTrendColumn(month, maxTotal, isSelected) {
  const column = document.createElement('li');
  column.className = 'flex min-w-0 flex-1 flex-col items-center gap-1';

  const amount = document.createElement('span');
  amount.className = `text-[11px] leading-tight tabular-nums ${isSelected ? 'font-semibold' : 'text-muted-foreground'}`;
  amount.textContent = formatMoneyCompact(month.totalMinor);
  amount.setAttribute('aria-hidden', 'true');

  const barArea = document.createElement('div');
  barArea.className = 'flex h-32 w-full items-end justify-center border-b';
  const bar = document.createElement('div');
  const heightPercent = maxTotal > 0 ? (month.totalMinor / maxTotal) * 100 : 0;
  bar.className = `w-full max-w-10 rounded-t-md ${isSelected ? 'bg-primary' : 'bg-primary/35'}`;
  bar.style.height = month.totalMinor > 0 ? `max(${heightPercent}%, 2px)` : '0';
  barArea.append(bar);

  const label = document.createElement('span');
  label.className = `text-xs ${isSelected ? 'font-semibold' : 'text-muted-foreground'}`;
  label.textContent = month.shortLabel;
  label.setAttribute('aria-hidden', 'true');

  const accessibleText = document.createElement('span');
  accessibleText.className = 'sr-only';
  accessibleText.textContent = `${formatMonthLabel(month.monthKey)}: ${formatMoney(month.totalMinor)}`;

  column.append(amount, barArea, label, accessibleText);
  return column;
}

/**
 * Draws one labelled bar per month (zero months included).
 * @param {HTMLElement} container
 * @param {{ monthKey: string, shortLabel: string, totalMinor: number }[]} months oldest first
 * @param {string} selectedMonthKey
 */
export function renderTrendChart(container, months, selectedMonthKey) {
  const maxTotal = Math.max(...months.map((month) => month.totalMinor));
  const list = document.createElement('ul');
  list.className = 'flex items-end gap-2';
  list.setAttribute('aria-label', 'Total spending for the last 6 months');
  months.forEach((month) => {
    list.append(createTrendColumn(month, maxTotal, month.monthKey === selectedMonthKey));
  });
  container.replaceChildren(list);
}
