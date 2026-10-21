# Expensify

A simple, responsive expense tracker that runs entirely in your browser.

## About

- Add, view, edit, and delete day-to-day expenses in seven categories: Food, Entertainment,
  Rent, Commute, Shopping, Utilities, and Other.
- The **Dashboard** shows each month's total, number of expenses, top category, a category donut
  chart, a 6-month spending trend, and your most recent expenses.
- The **Expenses** page lists expenses newest first, with month and category filters and a total.
- Works on phones, tablets, and desktops. No account, no server: your data stays in your browser.

Built with HTML, [Tailwind CSS](https://tailwindcss.com), vanilla JavaScript,
[Vite](https://vite.dev), [Basecoat UI](https://basecoatui.com) (shadcn/ui styling without React),
and [date-fns](https://date-fns.org).

## Prerequisites

- [Node.js](https://nodejs.org) 22 or newer (includes npm). Check with `node --version`.

> **Windows PowerShell tip:** if `npm` fails with "running scripts is disabled", use `npm.cmd`
> instead (for example `npm.cmd install`).

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the printed `http://localhost:5173` address.

To try it on your phone (same Wi-Fi), run `npm run dev -- --host` and open the "Network" address
on the phone. Each device and browser keeps its **own** separate data.

## Build

```bash
npm run build     # creates an optimized version in dist/
npm run preview   # serves the built version locally to check it
```

## Project structure

```text
index.html               Dashboard page (landing page)
expenses.html            Expense list page (filters, edit, delete)
expense-form.html        Add / edit expense page (?id=<id> for edit)
vite.config.js           Vite + Tailwind setup and the three page entries
public/favicon.svg       App icon
src/
├── config.js            Settings: currency, locale, categories + colors, limits, storage key
├── storage.js           Load / add / update / delete expenses in localStorage
├── validation.js        Checks form input and stored records; friendly error messages
├── summaries.js         Monthly totals, category breakdown, 6-month trend, list filters
├── format.js            Money, date, and month formatting
├── dates.js             Date helpers (today, month keys, next/previous month)
├── styles/main.css      Tailwind CSS + Basecoat UI
├── ui/                  Reusable UI pieces
│   ├── layout.js        Header, navigation, page alerts, error-safe page start-up
│   ├── toast.js         Success/error pop-up messages
│   ├── charts.js        Donut chart and 6-month bar chart (plain SVG/HTML)
│   ├── expense-row.js   Expense list rows, cards, and category badges
│   ├── empty-state.js   Friendly "nothing here yet" blocks
│   └── icons.js         Small inline icons
└── pages/               One script per page
    ├── dashboard.js
    ├── expenses.js
    └── expense-form.js
```

## Data storage

- Expenses are saved in your browser's **localStorage** under the key `expensify.expenses.v1`.
  They stay after reloads and restarts, until you delete them or clear your browser data.
- Data is **not** shared between devices or browsers, and there is no login: anyone using the same
  browser can see and change the expenses.
- To reset: open DevTools → Application → Local Storage → delete `expensify.expenses.v1`.

## Customizing

Everything configurable lives in [`src/config.js`](src/config.js):

- `CURRENCY_SYMBOL` (default `₹`) and `LOCALE` (default `en-IN`, which controls number grouping)
- `CATEGORIES` (names, order, and chart colors)
- Limits such as the maximum amount, description length, and list batch size
