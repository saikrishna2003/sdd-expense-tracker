import { APP_NAME } from '../config.js';
import { icon } from './icons.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', href: './' },
  { id: 'expenses', label: 'Expenses', href: './expenses.html' },
];

const STORAGE_ERROR_MESSAGES = {
  unreadable: "We couldn't read your saved expenses.",
  unavailable: "Expenses can't be saved in this browser.",
};

function navLinkHtml(item, activePage) {
  const isActive = item.id === activePage;
  const activeClasses = isActive ? 'bg-accent text-accent-foreground font-semibold' : 'text-muted-foreground';
  return `<a href="${item.href}" class="btn min-h-11 justify-start md:justify-center ${activeClasses}" data-variant="ghost"${isActive ? ' aria-current="page"' : ''}>${item.label}</a>`;
}

function addLinkHtml(activePage, extraClasses) {
  const isActive = activePage === 'add';
  return `<a href="./expense-form.html" class="btn min-h-11 ${extraClasses}"${isActive ? ' aria-current="page"' : ''}>${icon('plus')}<span>Add Expense</span></a>`;
}

/**
 * Renders the shared header with navigation into `#app-header`.
 * @param {'dashboard' | 'expenses' | 'add'} activePage
 */
export function renderLayout(activePage) {
  const header = document.getElementById('app-header');
  header.className = 'sticky top-0 z-40 border-b bg-background/95 backdrop-blur';
  header.innerHTML = `
    <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-6">
      <a href="./" class="flex min-h-11 items-center gap-2 text-lg font-semibold">
        <span class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">${icon('wallet')}</span>
        ${APP_NAME}
      </a>
      <div class="flex items-center gap-2 md:hidden">
        <a href="./expense-form.html" class="btn min-h-11" data-size="sm" aria-label="Add expense">${icon('plus')}<span>Add</span></a>
        <button type="button" id="menu-button" class="btn size-11" data-variant="outline" data-size="icon"
          aria-expanded="false" aria-controls="main-nav" aria-label="Open menu">${icon('menu')}</button>
      </div>
      <nav id="main-nav" aria-label="Main" class="hidden w-full flex-col gap-1 pb-2 md:flex md:w-auto md:flex-row md:items-center md:pb-0">
        ${NAV_ITEMS.map((item) => navLinkHtml(item, activePage)).join('')}
        ${addLinkHtml(activePage, 'md:ms-2')}
      </nav>
    </div>`;
  setUpMenuToggle();
}

function setUpMenuToggle() {
  const button = document.getElementById('menu-button');
  const nav = document.getElementById('main-nav');
  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    button.innerHTML = icon(isOpen ? 'menu' : 'close');
    nav.classList.toggle('hidden', isOpen);
    nav.classList.toggle('flex', !isOpen);
  });
}

/**
 * Shows a page-level alert message (replaces any previous one).
 * @param {string} message
 * @param {'destructive' | 'default'} [variant]
 */
export function showPageAlert(message, variant = 'destructive') {
  const container = document.getElementById('page-alert');
  container.replaceChildren();
  const alert = document.createElement('div');
  alert.className = 'alert mb-6';
  alert.dataset.variant = variant;
  alert.setAttribute('role', 'alert');
  alert.innerHTML = icon('alert');
  const title = document.createElement('h2');
  title.textContent = message;
  alert.append(title);
  container.append(alert);
}

/**
 * Shows a friendly alert for a storage error returned by `loadExpenses()`.
 * @param {null | 'unreadable' | 'unavailable'} error
 */
export function showStorageError(error) {
  if (error && STORAGE_ERROR_MESSAGES[error]) {
    showPageAlert(STORAGE_ERROR_MESSAGES[error]);
  }
}

/**
 * Runs page start-up code and shows a friendly message if anything unexpected fails.
 * @param {() => void} initPage
 */
export function runPage(initPage) {
  try {
    initPage();
  } catch (error) {
    console.error('Unexpected error while loading the page.', error);
    showPageAlert('Something went wrong. Please reload the page and try again.');
  }
}
