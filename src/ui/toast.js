import 'basecoat-css/basecoat';
import 'basecoat-css/toast';
import { takeFlash } from '../storage.js';

function getToaster() {
  const toaster = document.getElementById('toaster');
  // Module scripts run before DOMContentLoaded, so initialize the toaster on demand.
  if (toaster && typeof toaster.toast !== 'function') {
    window.basecoat.init('toaster');
  }
  return toaster;
}

/**
 * Shows a toast notification. Titles/descriptions must be app-defined text, not user input.
 * @param {{ category?: 'success' | 'error' | 'info', title: string, description?: string }} message
 */
export function showToast({ category = 'success', title, description }) {
  const toaster = getToaster();
  if (toaster && typeof toaster.toast === 'function') {
    toaster.toast({ category, title, description });
  }
}

/** Shows the one-time message saved before a redirect, if there is one. */
export function showPendingFlash() {
  const message = takeFlash();
  if (message) {
    showToast(message);
  }
}
