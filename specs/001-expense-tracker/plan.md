# Implementation Plan: Expense Tracker

**Branch**: `001-expense-tracker` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-expense-tracker/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a simple, responsive, browser-only expense tracker: users add, view, edit, and delete
categorized expenses, and a Dashboard shows monthly totals, a category donut chart, and a
6-month trend bar chart. The app is three plain HTML pages (Dashboard, Expenses, Add/Edit form)
styled with Tailwind CSS and Basecoat UI (shadcn/ui look without React), driven by small vanilla
JavaScript ES modules, built with Vite, with dates handled by date-fns and data saved in
`localStorage` on each device. Charts are hand-built with SVG/HTML—no chart library.

Planning decisions confirmed with the user: constitution amended to v2.0.0 for this stack;
`localStorage` instead of Session Storage (spec FR-011 needs data to survive restarts; spec
updated to per-device data); Basecoat UI instead of shadcn/ui (which requires React).

## Technical Context

**Language/Version**: HTML5, CSS (Tailwind CSS 4.3), JavaScript (ES2022 modules, vanilla)

**Primary Dependencies**: Vite 8.3.4 (dev/build), tailwindcss 4.3.3 + @tailwindcss/vite 4.3.3,
basecoat-css 1.0.2 (shadcn/ui-styled components), date-fns 4.4.0 — all pinned exactly

**Storage**: Browser `localStorage` (key `expensify.expenses.v1`, versioned JSON document);
`sessionStorage` only for one-time flash messages across redirects

**Testing**: No unit tests (constitution). Manual browser validation per
[quickstart.md](./quickstart.md) + successful `npm run build`

**Target Platform**: Current evergreen browsers on mobile, tablet, desktop; Node.js 22 LTS+ for
development tooling only

**Project Type**: Static frontend web application (multi-page, no backend)

**Performance Goals**: Every page renders and responds in < 1 s with 5,000 stored expenses (SC-004)

**Constraints**: No horizontal scroll at 320 px; touch targets ≈ 44×44 px; text labels with all
color-coded info; no frontend framework, router, or chart library; works offline once loaded

**Scale/Scope**: 1 user per device/browser; up to ~5,000 expenses; 3 pages; 7 fixed categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Checked against constitution **v2.0.0** (amended during this planning session at the user's
request; previous v1.0.0 mandated Python and would have failed every technology gate).

| Principle | Gate | Pre-research | Post-design |
|-----------|------|--------------|-------------|
| I. Frontend-First UX | UI is the main deliverable; core tasks ≤ 2 interactions; feedback on every action | ✅ Pages contract puts Add in global nav, Edit/Delete one tap from list | ✅ [contracts/pages.md](./contracts/pages.md) defines toasts/alerts for every action |
| II. Responsive Design | 320 px+, mobile-first, 44 px targets, readable lists | ✅ Tailwind mobile-first, `md` breakpoint | ✅ Table → stacked cards < 768 px; compact nav menu |
| III. Clean, Modular JS | Vanilla ES modules, consistent style, small single-purpose files | ✅ No framework | ✅ ~14 small modules, one responsibility each (see structure) |
| IV. Validation & Errors | Dedicated validation module before every save; stored data re-checked; plain messages; no stack traces | ✅ | ✅ Rules + messages in [data-model.md](./data-model.md); storage read rules in [storage-schema.md](./contracts/storage-schema.md) |
| V. Simplicity | Simplest solution; no speculative layers | ✅ MPA, no router/state lib | ✅ No caches, no build config beyond Vite inputs |
| VI. Minimal Dependencies | Only Vite, Tailwind (+plugin), Basecoat, date-fns; pinned + lockfile; no chart lib | ✅ Exactly the approved list | ✅ Charts via SVG/HTML; icons inline SVG; IDs/money via built-ins |
| VII. Beginner-Friendly | `npm install` + `npm run dev`; README; config in one file | ✅ | ✅ [quickstart.md](./quickstart.md); `src/config.js` |
| Workflow gates | No unit-test tasks; manual verification; build passes | ✅ | ✅ 17 manual scenarios in quickstart |

**Result**: PASS (pre-research and post-design). No violations → Complexity Tracking empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-tracker/
├── plan.md              # This file
├── research.md          # Phase 0: decisions & rationale
├── data-model.md        # Phase 1: Expense, Category, derived views, validation rules
├── quickstart.md        # Phase 1: setup + manual validation scenarios
├── contracts/
│   ├── storage-schema.md  # localStorage/sessionStorage format + storage module interface
│   └── pages.md           # Pages, URL params, UI behavior, messages
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html               # Dashboard page (landing)
expenses.html            # Expense list page (filters, edit/delete)
expense-form.html        # Add / edit expense page (?id= for edit)
vite.config.js           # Tailwind plugin + the three page inputs
package.json             # exact dependency versions + dev/build/preview scripts
package-lock.json
README.md                # setup, run, build, project structure
public/
└── favicon.svg
src/
├── config.js            # STORAGE_KEY, CURRENCY_SYMBOL (₹), LOCALE, CATEGORIES (+colors), limits
├── storage.js           # load/get/add/update/delete expenses; flash messages
├── validation.js        # validateExpenseInput(raw) → { valid, errors, value }
├── summaries.js         # monthly summary, category breakdown, 6-month trend, list filtering
├── format.js            # formatMoney, formatDate, month labels (date-fns)
├── dates.js             # today, month keys, add/subtract months, URL month parsing (date-fns)
├── styles/
│   └── main.css         # @import "tailwindcss"; @import "basecoat-css"; small custom rules
├── ui/
│   ├── layout.js        # header + nav (active link, mobile menu toggle), page alert area
│   ├── toast.js         # show toast via Basecoat toaster; show pending flash on load
│   ├── charts.js        # renderDonutChart (SVG), renderTrendChart (HTML bars) + legends
│   └── empty-state.js   # reusable empty-state block
└── pages/
    ├── dashboard.js     # month switcher, summary cards, breakdown, trend, recent list
    ├── expenses.js      # filters, table/cards, totals, delete dialog
    └── expense-form.js  # add/edit mode, field errors, save + redirect
```

**Structure Decision**: Single static frontend project at the repository root (no
backend/frontend split). HTML pages sit at the root, as Vite's multi-page setup expects. Shared
logic is in flat `src/*.js` modules, reusable UI helpers in `src/ui/`, and one entry script
per page in `src/pages/`. No `tests/` folder (constitution: no unit tests).

### Module responsibilities & data flow

```text
page script (src/pages/*) ──reads URL params──► dates.js
        │                                          │
        ├──► storage.js ──(localStorage JSON)──► validation.js (re-check stored records)
        ├──► summaries.js (pure functions on Expense[])
        ├──► format.js (money/date strings)
        └──► ui/* (layout, toast, charts, empty-state) ──► DOM (textContent only for user data)
```

- Page scripts are the only modules that touch the DOM of their page; `summaries.js`,
  `validation.js`, `format.js`, `dates.js` are pure (no DOM, no storage).
- Basecoat JS runtime + toast script imported once in `ui/toast.js`; all other components are
  CSS-only (delete confirmation uses native `<dialog>`).

### Implementation order (guidance for /speckit-tasks)

1. **Setup**: `package.json` (pinned deps, scripts), `vite.config.js` (3 inputs + Tailwind
   plugin), `main.css`, `config.js`, README skeleton.
2. **Foundation**: `dates.js`, `format.js`, `validation.js`, `storage.js`, `ui/layout.js`,
   `ui/toast.js`, `ui/empty-state.js`; three HTML shells with shared layout (US1).
3. **US2** add + list → **US3** edit/delete → **US4** dashboard summary → **US5** charts →
   **US6** filters (each verified with its [quickstart](./quickstart.md) scenarios).
4. **Polish**: responsive pass at 320/768/1280, accessibility labels, 5,000-record check,
   `npm run build`, README final.

## Complexity Tracking

No constitution violations to justify.
