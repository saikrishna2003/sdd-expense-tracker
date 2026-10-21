---

description: "Task list for the Expensify expense tracker (001-expense-tracker)"
---

# Tasks: Expense Tracker

**Input**: Design documents from `/specs/001-expense-tracker/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/storage-schema.md](./contracts/storage-schema.md),
[contracts/pages.md](./contracts/pages.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks. The constitution (v2.0.0) states unit tests are not
required; each story ends with a manual verification task using [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6 from spec.md)
- All paths are relative to the repository root (single static frontend project, see plan.md)

## Global coding rules (apply to every task)

- Vanilla JavaScript ES modules only; 2-space indentation, semicolons, `camelCase`
  functions/variables, `UPPER_SNAKE_CASE` constants, `const`/`let` (never `var`); short JSDoc on
  every exported function; functions under ~40 lines.
- Never insert user-entered text with `innerHTML`; use `textContent` / `createElement`.
- Use Basecoat UI classes (`btn`, `card`, `input`, `select`, `label`, `table`, `badge`, `alert`,
  `dialog`, `toast`) plus Tailwind utilities; mobile-first, `md:` (768px) is the main breakpoint.
- Interactive elements must be at least 44×44px on touch screens (e.g., `min-h-11 min-w-11`).
- Only the approved dependencies: `vite`, `tailwindcss`, `@tailwindcss/vite`, `basecoat-css`,
  `date-fns`. No other packages.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**Prerequisite**: Node.js 22 LTS or newer must be installed (not present on the machine at
planning time) — see [quickstart.md](./quickstart.md#prerequisites).

- [X] T001 Create `package.json` at the repository root with `"name": "expensify"`, `"private": true`, `"type": "module"`, scripts `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`, `devDependencies` pinned exactly `"vite": "8.3.4"`, `"tailwindcss": "4.3.3"`, `"@tailwindcss/vite": "4.3.3"`, and `dependencies` pinned exactly `"basecoat-css": "1.0.2"`, `"date-fns": "4.4.0"` (no `^`/`~`) in package.json
- [X] T002 Run `npm install` to install dependencies and generate package-lock.json (keep the lockfile with the project)
- [X] T003 [P] Create `vite.config.js` that registers the Tailwind plugin (`import tailwindcss from '@tailwindcss/vite'`) and declares the three multi-page inputs `index.html`, `expenses.html`, `expense-form.html` (resolved with `fileURLToPath(new URL('./<page>.html', import.meta.url))`) under `build.rolldownOptions.input` (Vite 8; `rollupOptions` is the deprecated alias) in vite.config.js
- [X] T004 [P] Create the single stylesheet with `@import "tailwindcss";` followed by `@import "basecoat-css";` (Basecoat MUST come after Tailwind) plus minimal base rules (body background/text colors); do not hide horizontal overflow on `html`/`body` — fix any overflow at its source instead — in src/styles/main.css
- [X] T005 [P] Create configuration constants in src/config.js: `APP_NAME = 'Expensify'`, `STORAGE_KEY = 'expensify.expenses.v1'`, `STORAGE_VERSION = 1`, `FLASH_KEY = 'expensify.flash'`, `CURRENCY_SYMBOL = '₹'`, `LOCALE = 'en-IN'`, `MAX_AMOUNT_MINOR = 999999999` (= 9,999,999.99), `MAX_DESCRIPTION_LENGTH = 100`, `RECENT_EXPENSES_LIMIT = 5`, `TREND_MONTHS = 6`, and `CATEGORIES` as an ordered, frozen array of `{ name, color }`: Food `#f97316` (orange-500), Entertainment `#a855f7` (purple-500), Rent `#2563eb` (blue-600), Commute `#14b8a6` (teal-500), Shopping `#ec4899` (pink-500), Utilities `#f59e0b` (amber-500), Other `#64748b` (slate-500); export a helper `getCategoryColor(name)`
- [X] T006 [P] Create a simple wallet/receipt icon favicon in public/favicon.svg
- [X] T007 [P] Create .gitignore ignoring `node_modules/` and `dist/` in .gitignore
- [X] T008 [P] Create README.md skeleton with sections: About, Prerequisites (Node.js 22+), Setup (`npm install`), Run (`npm run dev`), Build (`npm run build`, `npm run preview`), Project structure, Data storage — to be completed in T049 — in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared modules every user story depends on (dates, formatting, validation,
storage, layout, toasts, empty states)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 [P] Implement date helpers with date-fns in src/dates.js: `todayISO()` → `yyyy-MM-dd` of the local date; `isValidISODate(str)` (strict `yyyy-MM-dd` pattern + `isValid(parseISO(str))` + round-trip check so `2026-02-30` is invalid); `isMoreThanOneYearAhead(str)` (`isAfter(parseISO(str), addYears(startOfToday(), 1))`); `toMonthKey(dateStr)` → `yyyy-MM`; `currentMonthKey()`; `parseMonthParam(value)` → valid `yyyy-MM` string or `null`; `shiftMonth(monthKey, delta)` using `addMonths`; `lastMonthKeys(endMonthKey, count)` → array oldest → newest; `monthKeyToDate(monthKey)`
- [X] T010 [P] Implement display formatting in src/format.js: `formatMoney(amountMinor)` → `CURRENCY_SYMBOL` + `new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountMinor / 100)` (e.g., `₹2,50,000.00`, reuse one cached formatter); `formatDate(dateStr)` → `d MMM yyyy` (e.g., "20 Oct 2026"); `formatMonthLabel(monthKey)` → `MMMM yyyy` ("October 2026"); `formatMonthShort(monthKey)` → `MMM` ("Oct"); `formatPercent(value)` → one decimal + `%`; `minorToInputString(amountMinor)` → `"250.50"` for pre-filling the edit form
- [X] T011 Implement `validateExpenseInput(raw)` in src/validation.js (depends on T005, T009). Input `raw = { amount, category, date, description }` (strings from the form). Returns `{ valid, errors: { amount?, category?, date?, description? }, value: { amountMinor, category, date, description } }`. Apply rules in this exact order per field, first failure wins, with these exact messages: **Amount** — empty after trim → "Please enter an amount."; after removing spaces and commas, not a plain number (digits with at most one `.`) → "Amount must be a number, like 250 or 250.50."; more than 2 digits after the `.` → "Amount can have at most 2 decimal places."; value ≤ 0 → "Amount must be greater than 0."; value > 9,999,999.99 → "Amount can't be more than ₹99,99,999.99." (limit formatted with `formatMoney`, fix I1) (convert to integer `amountMinor` using string math on whole/fraction parts, not float multiplication). **Category** — empty → "Please choose a category."; not in configured list → "Please choose a category from the list.". **Date** — empty → "Please pick a date."; not a valid `yyyy-MM-dd` date → "Please enter a valid date."; later than today + 1 year → "Date can't be more than one year in the future.". **Description** — trimmed; longer than 100 characters after trim → "Description can be at most 100 characters."; empty string when not provided. Also export `isValidStoredExpense(record)` that checks a stored record matches the Expense shape in data-model.md (`id` non-empty string; `amountMinor` integer 1 ≤ value ≤ 999,999,999; `category` in config; `date` valid `yyyy-MM-dd`; `description` string ≤ 100 chars; `createdAt`/`updatedAt` ISO strings)
- [X] T012 Implement the storage module exactly per contracts/storage-schema.md in src/storage.js (depends on T011): document `{ "version": 1, "expenses": [...] }` under `STORAGE_KEY`; `loadExpenses()` → `{ expenses, error }` where key missing → `[]`/`null`, JSON parse failure or wrong `version`/shape → `[]`/`"unreadable"` (do NOT overwrite the stored value), storage access throws → `[]`/`"unavailable"`, individual records failing `isValidStoredExpense` are skipped with `console.warn`; `getExpenseById(id)`; `addExpense(input)` generates `id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)` and sets `createdAt`/`updatedAt` to `new Date().toISOString()`; `updateExpense(id, input)` refreshes `updatedAt` and keeps `id`/`createdAt`; `deleteExpense(id)`; every write re-reads the document fresh, applies one change, and writes the whole document back (last save wins); returns `{ ok: true, ... }` or `{ ok: false, reason: "not-found" | "save-failed" }` (catch `QuotaExceededError` and other write errors, log to console); `setFlash({ category, title, description? })` / `takeFlash()` use `sessionStorage` key `FLASH_KEY` (read once then remove; invalid/missing → `null`)
- [X] T013 [P] Implement the shared layout in src/ui/layout.js: `renderLayout(activePage)` (activePage = `'dashboard' | 'expenses' | 'add'`) fills `#app-header` with app name "Expensify" (link to `/`) and nav links **Dashboard** (`/`), **Expenses** (`/expenses.html`), **Add Expense** (`/expense-form.html`, primary `btn`); active link gets `aria-current="page"` + visible highlight; below 768px the links are hidden behind a menu button (inline Lucide "menu" SVG, `aria-expanded`, `aria-controls`) that toggles them, at `md:` and up links are always visible; `showPageAlert(message, variant = 'destructive')` renders a Basecoat `alert` into `#page-alert`; `showStorageError(error)` maps `"unreadable"` → "We couldn't read your saved expenses." and `"unavailable"` → "Expenses can't be saved in this browser."; `runPage(initFn)` wraps page start-up in `try/catch`, and on unexpected errors logs to `console.error` and shows "Something went wrong. Please reload the page and try again."
- [X] T014 Implement toast helpers in src/ui/toast.js (depends on T012): import the Basecoat runtime and toast script (`import 'basecoat-css/basecoat';` and `import 'basecoat-css/toast';`); `showToast({ category, title, description })` calls `document.getElementById('toaster').toast({ category, title, description })`; `showPendingFlash()` calls `takeFlash()` and shows it as a toast if present (call after Basecoat has initialized, e.g., on `DOMContentLoaded`/next tick)
- [X] T015 [P] Implement `renderEmptyState({ title, message, actionLabel, actionHref, onAction })` returning a centered Basecoat `card`-style block with an inline Lucide icon, heading, text, and either a link-styled `btn` (href) or a `button` (onAction) in src/ui/empty-state.js

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Initial Page Setup & Navigation (Priority: P1) 🎯 MVP

**Goal**: A consistent, professional, responsive shell for all three pages with header,
navigation (compact menu < 768px), active-page highlighting, and friendly empty states.

**Independent Test**: With no data, open `/`, `/expenses.html`, and `/expense-form.html` at
320px, 768px, and 1280px; header, nav, active highlight, empty states, and the "Add your first
expense" action appear correctly with no horizontal scroll ([quickstart](./quickstart.md)
scenarios 1–2).

- [X] T016 [P] [US1] Create the Dashboard HTML shell in index.html: `<html lang="en">`, `<meta charset>`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>Dashboard · Expensify</title>`, favicon link, `<link rel="stylesheet" href="/src/styles/main.css">`, `<header id="app-header">`, `<main id="main" class="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">` containing `<div id="page-alert"></div>` and `<div id="page-content"></div>`, `<div id="toaster" class="toaster"></div>`, and `<script type="module" src="/src/pages/dashboard.js"></script>`
- [X] T017 [P] [US1] Create the Expenses HTML shell in expenses.html with the same structure as index.html, title `Expenses · Expensify`, and `<script type="module" src="/src/pages/expenses.js"></script>`
- [X] T018 [P] [US1] Create the Add/Edit HTML shell in expense-form.html with the same structure as index.html, title `Add expense · Expensify`, and `<script type="module" src="/src/pages/expense-form.js"></script>`
- [X] T019 [P] [US1] Create the Dashboard page script in src/pages/dashboard.js: inside `runPage`, call `renderLayout('dashboard')`, `showPendingFlash()`, `loadExpenses()` (show `showStorageError` when `error` is set); when there are no expenses at all render `renderEmptyState` with title "Welcome to Expensify", message explaining the dashboard summarizes monthly spending, and action "Add your first expense" → `/expense-form.html` into `#page-content`
- [X] T020 [P] [US1] Create the Expenses page script in src/pages/expenses.js: inside `runPage`, call `renderLayout('expenses')`, `showPendingFlash()`, `loadExpenses()` (+ `showStorageError`); when there are no expenses at all render `renderEmptyState` with title "No expenses yet", a short explanation, and action "Add your first expense" → `/expense-form.html` into `#page-content`
- [X] T021 [P] [US1] Create the form page script in src/pages/expense-form.js: inside `runPage`, call `renderLayout('add')` and render the page heading "Add expense" into `#page-content` (form added in US2)
- [X] T022 [US1] Manually verify [quickstart](./quickstart.md) scenarios 1–2 at 320px, 768px, and 1280px (header, nav toggle, `aria-current` highlight, empty states, no horizontal scroll) using specs/001-expense-tracker/quickstart.md

**Checkpoint**: User Story 1 is fully functional and testable independently

---

## Phase 4: User Story 2 - Add and View Expenses (Priority: P1)

**Goal**: Users add an expense (amount, category, date defaulting to today, optional
description) with full validation and see it in a newest-first list for the current month.

**Independent Test**: Add several expenses in the current month, see "Expense added", and confirm
each appears in `/expenses.html` with correct date, category, description, and amount, newest
first; invalid inputs show the exact field messages and keep values ([quickstart](./quickstart.md)
scenarios 3–6, 12).

- [X] T023 [P] [US2] Add list helpers to src/summaries.js: `sortNewestFirst(expenses)` (by `date` desc, then `createdAt` desc, returns a new array), `filterByMonth(expenses, monthKey)` (`monthKey === 'all'` returns all; otherwise `expense.date.startsWith(monthKey)`), `sumAmounts(expenses)` → total `amountMinor` (integer sum)
- [X] T024 [US2] Build the expense form UI in src/pages/expense-form.js (depends on T021): render a Basecoat `card` form with fields — **Amount** (`<input type="text" inputmode="decimal" id="amount" autocomplete="off">`, placeholder "0.00", currency symbol shown as prefix), **Category** (`<select id="category" class="select">` with placeholder option "Choose a category" (empty value) followed by every `CATEGORIES` name in config order), **Date** (`<input type="date" id="date">` defaulting to `todayISO()`), **Description** (optional `<input type="text" id="description">` with live counter "0/100", no `maxlength` attribute so the validation message can appear) — each with a `<label for>` and an error `<p id="<field>-error" class="text-destructive text-sm" hidden>`; buttons **Save** (primary `btn`, `type="submit"`) and **Cancel** (outline `btn`; `history.back()` when `document.referrer` is same-origin, otherwise go to `/expenses.html`); on mobile the buttons stack full-width, on `md:` they sit inline
- [X] T025 [US2] Implement add-mode submit handling in src/pages/expense-form.js (depends on T024, T011, T012): on submit `preventDefault`, disable Save immediately (prevents double-save), clear old errors, call `validateExpenseInput`; if invalid show each message in its `<field>-error`, set `aria-invalid="true"` and `aria-describedby`, focus the first invalid field, keep all entered values, re-enable Save; if valid call `addExpense(value)` — on `ok` call `setFlash({ category: 'success', title: 'Expense added' })` and redirect to `/expenses.html?month=<toMonthKey(value.date)>`; on `save-failed` show `showPageAlert("Your expense couldn't be saved. Your browser storage may be full.")`, keep values, re-enable Save
- [X] T026 [US2] Render the expense list in src/pages/expenses.js (depends on T020, T023): read `?month` (`'all'` or `parseMonthParam`, invalid/missing → `currentMonthKey()`), show heading "Expenses", a subheading with the month label (or "All months"), and a summary line "N expenses · Total ₹X" using `sumAmounts` + `formatMoney`; render the month's expenses via `sortNewestFirst(filterByMonth(...))` as a Basecoat `table` on `md:` and up (columns Date, Category, Description, Amount right-aligned) and as stacked cards below 768px (category badge, amount prominent, date and description below); category shown as a `badge` with a color dot from `getCategoryColor` plus the text name; descriptions wrap (`break-words`); empty description shows "—"; when expenses exist but none in the selected month, render `renderEmptyState` "No expenses in October 2026." with action "Add expense"; build rows with a `DocumentFragment` and `textContent` only
- [X] T027 [US2] Manually verify [quickstart](./quickstart.md) scenarios 3, 4, 5, 6, and 12 (add, every validation message, ` 1,000 ` accepted as ₹1,000.00, double-click creates one expense, data persists after reload and browser restart) using specs/001-expense-tracker/quickstart.md

**Checkpoint**: User Stories 1 and 2 both work — this is a usable MVP

---

## Phase 5: User Story 3 - Edit and Delete Expenses (Priority: P2)

**Goal**: Users correct an expense via a pre-filled form and delete an expense after
confirmation, with "no longer exists" handling across tabs.

**Independent Test**: Edit one expense and delete another; list (and dashboard totals, once US4
exists) reflect changes; cancelling a delete keeps the expense; deleting in one tab then saving
in another shows "This expense no longer exists." ([quickstart](./quickstart.md) scenarios 7, 8,
13).

- [X] T028 [US3] Add row actions to the list in src/pages/expenses.js (depends on T026): per table row / mobile card add an **Edit** link-styled `btn` (ghost/outline, inline Lucide "pencil" SVG) to `/expense-form.html?id=<id>` and a **Delete** `btn` (destructive outline, Lucide "trash" SVG), each at least 44×44px and with an `aria-label` such as "Edit expense Lunch on 20 Oct 2026" / "Delete expense Lunch on 20 Oct 2026"
- [X] T029 [US3] Add the delete confirmation dialog markup to expenses.html: a native `<dialog id="delete-dialog" class="dialog" aria-labelledby="delete-dialog-title">` styled by Basecoat with title "Delete this expense?", text "This can't be undone.", and buttons **Cancel** (outline) and **Delete** (destructive)
- [X] T030 [US3] Implement the delete flow in src/pages/expenses.js (depends on T028, T029): Delete opens the dialog with `showModal()` remembering the expense id; Cancel/Escape closes without changes; Delete calls `deleteExpense(id)` → `ok`: close dialog, re-render the list, `showToast({ category: 'success', title: 'Expense deleted' })`; `not-found`: close, re-render, `showToast({ category: 'error', title: 'This expense no longer exists.' })`; `save-failed`: close and `showPageAlert("Your expense couldn't be saved. Your browser storage may be full.")`
- [X] T031 [US3] Implement edit mode in src/pages/expense-form.js (depends on T025): when `?id=` is present call `renderLayout('expenses')`, set `document.title = 'Edit expense · Expensify'` and heading "Edit expense"; if `getExpenseById(id)` returns `null` replace the form with the message "This expense no longer exists." and a link "Back to expenses" → `/expenses.html`; otherwise pre-fill amount (`minorToInputString`), category, date, description (and counter); on valid submit call `updateExpense(id, value)` → `ok`: `setFlash({ category: 'success', title: 'Expense updated' })` and redirect to `/expenses.html?month=<toMonthKey(value.date)>`; `not-found`: show "This expense no longer exists." with the "Back to expenses" link and save nothing; `save-failed`: same alert and behavior as add mode
- [X] T032 [US3] Manually verify [quickstart](./quickstart.md) scenarios 7, 8, and 13 (edit pre-fill + update, cancel vs confirm delete, two-tab "no longer exists") using specs/001-expense-tracker/quickstart.md

**Checkpoint**: User Stories 1–3 work independently

---

## Phase 6: User Story 4 - Monthly Summary Dashboard (Priority: P2)

**Goal**: The Dashboard shows, for a selected month (default current), total spent, number of
expenses, top category, up to 5 recent expenses, and Previous/Next month navigation.

**Independent Test**: With expenses in two different months, the Dashboard's totals, counts, top
category, and recent list are correct for each month, and an empty month shows zeros and a
friendly message ([quickstart](./quickstart.md) scenario 9).

- [X] T033 [P] [US4] Add `getMonthlySummary(expenses, monthKey)` to src/summaries.js returning `{ monthKey, label, totalMinor, count, topCategory, breakdown, recent }`: `totalMinor`/`count` over expenses whose `date` starts with `monthKey`; `breakdown` = `{ category, totalMinor, percent }` for categories with spending, sorted by `totalMinor` desc (ties → `CATEGORIES` config order), `percent` rounded to 1 decimal place; `topCategory` = first breakdown entry's category or `null` when no expenses; `recent` = up to `RECENT_EXPENSES_LIMIT` (5) expenses via `sortNewestFirst`
- [X] T034 [US4] Render the Dashboard summary in src/pages/dashboard.js (depends on T019, T033): read `?month` via `parseMonthParam` (invalid/missing → `currentMonthKey()`); month switcher row with "‹ Previous" and "Next ›" link-styled `btn`s (`?month=<shiftMonth(±1)>`, ≥ 44px) around an `<h1>` month label ("October 2026"); three Basecoat `card`s in a responsive grid (1 column mobile, 3 columns `md:`) — **Total spent** (`formatMoney`), **Number of expenses**, **Top category** (name with color dot, or "—" when none); an empty `<section id="breakdown-section">` and `<section id="trend-section">` placeholders for US5; a **Recent expenses** card listing up to 5 rows (date, category badge, description, amount) plus a "View all" link → `/expenses.html?month=<monthKey>`; when the month has no expenses show `₹0.00` / `0` / "—" and, in place of the recent list, the message "No expenses in October 2026 yet." with an "Add expense" button; keep the US1 welcome empty state when there are no expenses at all
- [X] T035 [US4] Manually verify [quickstart](./quickstart.md) scenario 9 (current and previous month figures, Previous/Next navigation, empty month) using specs/001-expense-tracker/quickstart.md

**Checkpoint**: User Stories 1–4 work independently

---

## Phase 7: User Story 5 - Category Breakdown & Visual Insights (Priority: P3)

**Goal**: The Dashboard shows a category donut chart with a legend (total + percentage, highest
first) and a bar chart of total spending for the 6 months ending with the selected month.

**Independent Test**: With expenses in ≥ 3 categories in one month and in ≥ 2 other months,
breakdown totals, percentages (sum ≈ 100%), ordering, donut proportions, and the 6 labelled bars
match the data; empty month shows a message instead of an empty donut ([quickstart](./quickstart.md)
scenario 10).

- [X] T036 [P] [US5] Add `getMonthlyTrend(expenses, endMonthKey, count = TREND_MONTHS)` to src/summaries.js returning exactly `count` entries oldest → newest `{ monthKey, shortLabel, totalMinor }` using `lastMonthKeys`; months without expenses have `totalMinor = 0`
- [X] T037 [P] [US5] Implement charts without any chart library in src/ui/charts.js: `renderDonutChart(container, breakdown)` builds an inline SVG (`viewBox="0 0 42 42"`, background ring + one `<circle r="15.9155" cx="21" cy="21" fill="none" stroke-width="6">` per category using `stroke-dasharray="<percent> <100-percent>"` and cumulative `stroke-dashoffset`, starting at 12 o'clock, colors from `getCategoryColor`), with `role="img"` and an `aria-label` summarizing the top categories, the month total in the centre, and a legend list (color swatch, category name, `formatMoney`, `formatPercent`) — information MUST NOT rely on color alone; `renderTrendChart(container, months, selectedMonthKey)` builds 6 flex columns with bar heights as a percentage of the largest month (all zero → flat baseline bars), each labelled with `shortLabel` and `formatMoney` (compact enough to fit at 320px, e.g., amount on its own line in small text), the selected month's bar highlighted; both functions use `createElementNS`/`createElement` and `textContent` only
- [X] T038 [US5] Render insights in src/pages/dashboard.js (depends on T034, T036, T037): in `#breakdown-section` show a Basecoat `card` "Spending by category" with the donut + legend when the month has expenses, otherwise the message "Nothing to show for October 2026 yet." (no empty donut drawn); in `#trend-section` show a `card` "Last 6 months" with `renderTrendChart` for the selected month (always shown, zeros allowed); layout: stacked on mobile, side by side at `md:` and up; both charts update with the month switcher
- [X] T039 [US5] Manually verify [quickstart](./quickstart.md) scenario 10 (ordering, percentages ≈ 100%, largest donut segment = top category, 6 labelled bars match monthly totals, zero months visible) using specs/001-expense-tracker/quickstart.md

**Checkpoint**: User Stories 1–5 work independently

---

## Phase 8: User Story 6 - Filter the Expense List (Priority: P3)

**Goal**: Users filter the expense list by month (including "All months") and/or category, see
the filtered total, and clear filters back to the default view.

**Independent Test**: With expenses across months and categories, apply month and category
filters, "All months", Clear filters, and a no-match filter; only matching expenses and the
correct total show ([quickstart](./quickstart.md) scenario 11).

- [X] T040 [P] [US6] Add to src/summaries.js: `filterExpenses(expenses, { month, category })` (`month` = `'all'` or `yyyy-MM`; `category` = configured name or `null` for all; returns a new sorted-newest-first array) and `getMonthsWithExpenses(expenses)` → unique `yyyy-MM` keys, newest first
- [X] T041 [US6] Add the filter bar to src/pages/expenses.js (depends on T026): a Basecoat `card` with **Month** `<select class="select" id="filter-month">` (current month first, then every other month that has expenses newest first, then "All months" with value `all`; labels via `formatMonthLabel`) and **Category** `<select class="select" id="filter-category">` ("All categories" + `CATEGORIES` in config order), each with a `<label>`, plus a **Clear filters** outline `btn`; fields stack on mobile and sit in one row at `md:`
- [X] T042 [US6] Wire filtering in src/pages/expenses.js (depends on T040, T041): read `?month` (`all` | valid `yyyy-MM`, invalid → current month) and `?category` (configured name, invalid → all) into the selects; on change update the URL with `history.replaceState` (`?month=…&category=…`, omit defaults) and re-render the list with `filterExpenses`; show "N expenses · Total ₹X" for the shown expenses (FR-025); **Clear filters** resets to current month + all categories; when filters match nothing render `renderEmptyState` "No expenses match these filters." with a "Clear filters" button (`onAction`); keep the US2 "no expenses yet" state when there are no expenses at all
- [X] T043 [US6] Manually verify [quickstart](./quickstart.md) scenario 11 (category filter, month filter, "All months", Clear filters, no-match message) using specs/001-expense-tracker/quickstart.md

**Checkpoint**: All user stories are independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T044 [P] Accessibility pass across index.html, expenses.html, expense-form.html and src/ui/*.js: every input has a visible `<label>`, visible focus styles on all interactive elements, toasts announced (Basecoat `role="status"`), dialog focus returns to the triggering Delete button, color contrast ≥ 4.5:1 for text, every colored element also has a text label
- [X] T045 Responsive pass at 320px, 768px, and 1280px across index.html, expenses.html, expense-form.html, src/pages/*.js: no horizontal page scroll, touch targets ≥ 44×44px, long descriptions wrap, and ₹9,999,999.99 with a 100-character description fits ([quickstart](./quickstart.md) scenario 15)
- [X] T046 Verify storage error handling in src/storage.js and src/ui/layout.js: set `expensify.expenses.v1` to `not json` and reload each page (friendly "We couldn't read your saved expenses." alert, no technical text, page usable, stored value not overwritten until the next save); test a private/blocked-storage window ([quickstart](./quickstart.md) scenario 14)
- [X] T047 Performance check with 5,000 seeded expenses on `/` and `/expenses.html?month=all` (each page renders and responds in under 1 second); if slow, batch DOM writes with `DocumentFragment` and avoid repeated `loadExpenses()` calls per render in src/pages/expenses.js and src/pages/dashboard.js ([quickstart](./quickstart.md) scenario 16)
- [X] T048 [P] Code style review against constitution Principle III across src/**/*.js: 2-space indentation, semicolons, `const`/`let` only, descriptive names, JSDoc on exported functions, functions under ~40 lines, duplicated logic extracted, no `innerHTML` with user data, no unused imports
- [X] T049 [P] Complete README.md: prerequisites (Node.js 22+), `npm install`, `npm run dev`, `npm run dev -- --host` for phone testing (each device keeps its own data), `npm run build` / `npm run preview`, project structure tree (from plan.md), where data is stored (`localStorage` key `expensify.expenses.v1`) and how to reset it, and where to change currency/categories (src/config.js)
- [X] T050 Run `npm run build` (must complete with no errors and output to dist/) and `npm run preview`, then walk through all 18 scenarios in specs/001-expense-tracker/quickstart.md on the built app

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (requires Node.js 22+ installed)
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–8)**: Depend on Foundational
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (creates the three page shells)
- **US2 (P1)**: After US1 (uses the form and list page shells/scripts)
- **US3 (P2)**: After US2 (adds actions to the list and edit mode to the form)
- **US4 (P2)**: After US1 (Dashboard shell); needs data from US2 to demo meaningfully
- **US5 (P3)**: After US4 (fills the Dashboard's breakdown/trend sections)
- **US6 (P3)**: After US2 (extends the list page); independent of US3–US5

```text
Setup → Foundational → US1 ─┬─► US2 ─┬─► US3
                            │        └─► US6
                            └─► US4 ───► US5
                                   (all) ─► Polish
```

### Within Each User Story

- `src/summaries.js` helpers before the page script that uses them
- HTML markup before the page logic that wires it
- Implementation before the story's manual verification task

### Parallel Opportunities

- Setup: T003–T008 in parallel after T001 (T002 needs T001)
- Foundational: T009, T010, T013, T015 in parallel; then T011 → T012 → T014
- US1: T016–T021 all in parallel (six different files)
- After US2: US3, US6, and (after US1) US4 can proceed in parallel — they touch different files
  except `src/pages/expenses.js` (shared by US3 and US6: do those sequentially)
- `src/summaries.js` tasks (T023, T033, T036, T040) edit the same file — run them sequentially
  even though each is [P] relative to the other files in its own phase
- Polish: T044, T048, T049 in parallel

---

## Parallel Example: User Story 1

```text
Task: "T016 Create the Dashboard HTML shell in index.html"
Task: "T017 Create the Expenses HTML shell in expenses.html"
Task: "T018 Create the Add/Edit HTML shell in expense-form.html"
Task: "T019 Create the Dashboard page script in src/pages/dashboard.js"
Task: "T020 Create the Expenses page script in src/pages/expenses.js"
Task: "T021 Create the form page script in src/pages/expense-form.js"
```

## Parallel Example: User Story 5

```text
Task: "T036 Add getMonthlyTrend to src/summaries.js"
Task: "T037 Implement donut and trend charts in src/ui/charts.js"
# then
Task: "T038 Render insights in src/pages/dashboard.js"
```

## Parallel Example: Foundational

```text
Task: "T009 Implement date helpers in src/dates.js"
Task: "T010 Implement display formatting in src/format.js"
Task: "T013 Implement shared layout in src/ui/layout.js"
Task: "T015 Implement renderEmptyState in src/ui/empty-state.js"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (page shell & navigation)
4. Complete Phase 4: US2 (add & view expenses)
5. **STOP and VALIDATE**: quickstart scenarios 1–6 and 12 → usable expense tracker

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → responsive shell demo
3. US2 → MVP: record and list expenses
4. US3 → corrections (edit/delete)
5. US4 → monthly summary dashboard
6. US5 → donut + 6-month trend insights
7. US6 → list filters
8. Polish → accessibility, responsiveness, performance, README, build

Each story is verified with its quickstart scenarios before moving on, without breaking earlier
stories.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to a user story for traceability
- No automated tests (constitution); every story ends with a manual quickstart verification task
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, editing the same file in parallel, new dependencies beyond the approved list

---

## Implementation Notes (2026-10-20)

- **Analysis fixes applied** (from `/speckit-analyze`):
  - **C1**: shared row/card/badge rendering lives in `src/ui/expense-row.js` (used by the list and
    the Dashboard's recent list).
  - **I1**: the max-amount message is built from `formatMoney(MAX_AMOUNT_MINOR)` →
    "Amount can't be more than ₹99,99,999.99." with the default `en-IN` locale.
  - **I2**: empty month on the Dashboard — main message "No expenses in <Month> yet." + "Add expense"
    in the Recent card; breakdown card shows "Nothing to show for this month yet.".
  - **G1**: a primary **Add** button stays visible in the phone header next to the menu button;
    quickstart scenario 18 checks SC-003.
  - **U1**: the month filter always contains the month requested in the URL.
- **Verified decisions**: Vite 8 `build.rolldownOptions.input` (T003); Basecoat dialogs are CSS-only, so
  the delete confirmation uses a native `<dialog class="alert-dialog">` (T029); Basecoat toasts are
  initialized on demand via `window.basecoat.init('toaster')` because module scripts run before
  `DOMContentLoaded` (T014).
- **Structure**: static page structure (form fields, dashboard cards, filter bar, dialog) lives in the
  HTML files; page scripts fill in data and behavior. `src/ui/icons.js` holds the inline Lucide icons.
- **Performance (T047)**: 5,000 expenses initially took ~2.5 s on "All months". Fixed by rendering only
  the on-screen layout (table or cards), cloning cached icons, delegating Delete clicks, and rendering
  rows in batches of `LIST_BATCH_SIZE` (100) with a "Show more" button. Measured afterwards: list
  ≤ 0.2 s, Dashboard ≈ 0.1 s, filter change ≈ 0.04 s.
- **Responsive/a11y polish (T044–T045)**: compact summary cards and two-column filters on phones,
  44 px minimum for icon-only month buttons, full-width form buttons on phones, no duplicate accessible
  names on trend bars. No horizontal scroll at 320/768/1280 px with maximum amounts and 100-character
  descriptions.
