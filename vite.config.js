import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const pagePath = (fileName) => fileURLToPath(new URL(`./${fileName}`, import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    // Multi-page app: each HTML file is its own entry point.
    rolldownOptions: {
      input: {
        dashboard: pagePath('index.html'),
        expenses: pagePath('expenses.html'),
        expenseForm: pagePath('expense-form.html'),
      },
    },
  },
});
