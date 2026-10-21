# Quickstart & Validation Guide: Expense Tracker

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Run the app and walk through these checks to prove the feature works end to end. Per the
constitution there are no unit tests; this manual guide plus a clean production build is the
definition of done.

## Prerequisites

1. **Node.js 22 LTS or newer** (includes npm). Not installed on this machine yet — download from
   <https://nodejs.org> and verify with `node --version` and `npm --version`.
2. A modern browser (Chrome, Edge, Firefox, or Safari) with developer tools.

## Setup & run

```powershell
npm install          # installs exact versions from package.json / package-lock.json
npm run dev          # starts Vite dev server, open the printed http://localhost:5173 URL
```

Optional — check on a real phone on the same Wi-Fi:

```powershell
npm run dev -- --host   # open the printed "Network" URL on the phone
```

(The phone has its own separate data, as specified.)

Production build check:

```powershell
npm run build        # must finish with no errors; output in dist/
npm run preview      # serve the built app to spot-check it
```

## Reset data between runs

Browser DevTools → Application → Local Storage → delete key `expensify.expenses.v1`
(see [contracts/storage-schema.md](./contracts/storage-schema.md)).

## Validation scenarios

Check each at **320px**, **768px**, and **1280px** widths (DevTools device toolbar) unless noted.

| #  | Scenario (spec reference)                     | Steps                                                                                     | Expected outcome |
|----|-----------------------------------------------|-------------------------------------------------------------------------------------------|------------------|
| 1  | First run & layout (US1, FR-001–005)          | Clear data, open `/`.                                                                     | Dashboard with header, nav, welcome empty state and "Add your first expense". No horizontal scroll. |
| 2  | Responsive nav (US1, FR-004)                  | At 320px open the menu button; at 1280px look at header.                                  | Compact menu < 768px; full nav ≥ 768px; current page highlighted. |
| 3  | Add expense (US2)                             | Add ₹250.50, Food, today, "Lunch".                                                        | Redirect to list, "Expense added" toast, row shows today's date (e.g., 20 Oct 2026) · Food · Lunch · ₹250.50. |
| 4  | Validation (US2, FR-013–016)                  | Submit with: empty amount; `abc`; `0`; `-5`; `10.555`; `10000000`; no category; date 2 years ahead; 101-char description. | Not saved; plain-language message next to each field (see [data-model.md](./data-model.md#validation-rules-fr-013--fr-016)); other values kept. |
| 5  | Lenient amount input (Edge cases)             | Enter ` 1,000 `.                                                                          | Saved as ₹1,000.00. |
| 6  | Double-click save (Edge cases)                | Double-click Save quickly.                                                                | Exactly one new expense. |
| 7  | Edit (US3)                                    | Edit the Lunch expense amount to 300.                                                     | Form pre-filled; "Expense updated"; list and dashboard show ₹300.00. |
| 8  | Delete (US3)                                  | Delete → Cancel; then Delete → Delete.                                                    | Cancel keeps it; confirm removes it with "Expense deleted". |
| 9  | Monthly summary (US4)                         | Add 3+ expenses this month and 2 last month; open `/`; press Previous/Next.               | Total, count, top category, recent 5 correct for each month; empty month shows zeros + message. |
| 10 | Breakdown & charts (US5, FR-021–023)          | Use data from #9.                                                                         | Categories ordered highest first; % sum ≈ 100; donut largest segment = top category; 6 labelled bars match monthly totals; zero months visible. |
| 11 | Filters (US6, FR-024–025)                     | Filter category Commute; month = last month; "All months"; Clear filters; a filter with no matches. | Only matching rows; total matches; Clear returns to current month/all categories; no-match message. |
| 12 | Persistence (FR-011)                          | Reload the page; close and reopen the browser.                                            | All expenses still there. |
| 13 | Two tabs (Edge cases)                         | Open the same expense's edit form in two tabs; delete it in tab A; save in tab B.         | Tab B shows "This expense no longer exists."; nothing re-created. |
| 14 | Corrupt storage (Edge cases, FR-017)          | In DevTools set `expensify.expenses.v1` to `not json`; reload.                            | Friendly alert, no technical text, page still usable. |
| 15 | Large values & long text (Edge cases)         | Add ₹9,999,999.99 (shown as ₹99,99,999.99 with `en-IN`) with a 100-char description; view at 320px. | Amount and text fit/wrap without breaking layout. |
| 16 | Performance (SC-004)                          | Seed 5,000 expenses with the snippet below, reload `/` and `/expenses.html?month=all`; click "Show more"; change a filter. | Pages render and respond in under 1 second; list shows 100 rows + "Show more (4900 left)"; total covers all 5,000. |
| 17 | Build (Definition of done)                    | `npm run build`.                                                                          | Completes with no errors. |
| 18 | Reachability (SC-003)                         | From `/` at 320px and 1280px: reach Add, the list, Edit, and Delete.                       | Add: 1 tap (header **Add** button). View: 1 tap (Expenses / "View all"). Edit or Delete: 2 taps ("View all" → row action). |

All 18 scenarios passing = feature accepted.

### Seeding 5,000 expenses (scenario 16)

Paste into the browser DevTools console on the app's page, then reload:

```js
const cats = ['Food', 'Entertainment', 'Rent', 'Commute', 'Shopping', 'Utilities', 'Other'];
const expenses = Array.from({ length: 5000 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (i % 365));
  const date = d.toISOString().slice(0, 10);
  return { id: `seed${i}`, amountMinor: 100 + ((i * 37) % 500000), category: cats[i % 7], date,
    description: `Seed expense ${i}`, createdAt: `${date}T10:00:00.000Z`, updatedAt: `${date}T10:00:00.000Z` };
});
localStorage.setItem('expensify.expenses.v1', JSON.stringify({ version: 1, expenses }));
```
