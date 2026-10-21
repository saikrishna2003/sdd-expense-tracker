import { icon } from './icons.js';

/**
 * Builds a friendly empty-state block with one clear next action.
 * @param {{ iconName?: string, title: string, message: string, actionLabel?: string, actionHref?: string, onAction?: () => void }} options
 * @returns {HTMLElement}
 */
export function renderEmptyState({ iconName = 'receipt', title, message, actionLabel, actionHref, onAction }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty rounded-xl border border-dashed px-4 py-10';
  wrapper.innerHTML = `
    <header>
      <figure class="mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">${icon(iconName, 'size-6')}</figure>
      <h2 class="text-lg font-semibold"></h2>
      <p class="text-sm text-muted-foreground"></p>
    </header>`;
  wrapper.querySelector('h2').textContent = title;
  wrapper.querySelector('p').textContent = message;

  if (actionLabel) {
    const footer = document.createElement('footer');
    footer.className = 'mt-4';
    const action = document.createElement(actionHref ? 'a' : 'button');
    action.className = 'btn min-h-11';
    action.textContent = actionLabel;
    if (actionHref) {
      action.href = actionHref;
    } else {
      action.type = 'button';
      action.addEventListener('click', onAction);
    }
    footer.append(action);
    wrapper.append(footer);
  }
  return wrapper;
}
