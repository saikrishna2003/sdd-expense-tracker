# Contract: Pages, URLs & UI Behavior

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

The app exposes three pages. URLs and query parameters are the user-facing contract (bookmarks,
reloads, and Back button rely on them).

## Shared layout (every page) — FR-001 – FR-005, FR-027

- Header: app name "Expensify" (links to Dashboard) + navigation: **Dashboard** (`/`),
  **Expenses** (`/expenses.html`), **Add Expense** (`/expense-form.html`, styled as primary
  button).
- Current page link has `aria-current="page"` and a visible highlight.
- `< 768px`: nav hidden behind a menu button (`aria-expanded` toggles), but a primary **Add**
  button always stays visible next to it so adding is one tap away (SC-003); `≥ 768px`: nav always
  visible.
- One Basecoat toaster (`#toaster`) for success/error toasts; one page-level alert area for
  storage errors.
- All interactive targets ≥ 44×44px on touch screens; no horizontal page scroll at 320px.

## `/` — Dashboard (`index.html`) — User Stories 1, 4, 5

| Query param | Values           | Default        | Invalid value →        |
|-------------|------------------|----------------|------------------------|
| `month`     | `yyyy-MM`        | current month  | treated as current month |

Content for the selected month:

1. Month switcher: "‹ Previous" / heading "October 2026" / "Next ›" (updates `?month=`).
2. Summary cards: **Total spent**, **Number of expenses**, **Top category**.
3. **Category breakdown**: donut chart + legend rows (color swatch, category, amount, percent),
   highest first.
4. **Last 6 months**: bar chart, one labelled bar per month (month + amount), zero bars shown.
5. **Recent expenses**: up to 5 rows + link "View all" → `/expenses.html?month=<month>`.

Empty month: totals show `₹0.00` / `0` / "—"; the **Recent expenses** card shows the main
message "No expenses in October 2026 yet." + "Add expense" button (and hides "View all"); the
breakdown card shows the short line "Nothing to show for this month yet." (no empty donut);
the 6-month chart is still shown (may be all zeros).
No expenses at all: welcome empty state with "Add your first expense" button.

## `/expenses.html` — Expense list — User Stories 2, 3, 6

| Query param | Values                          | Default        | Invalid value →    |
|-------------|---------------------------------|----------------|--------------------|
| `month`     | `yyyy-MM` or `all`              | current month  | current month      |
| `category`  | a configured category name      | (all)          | all categories     |

- Filters: month select (current month + every month that has expenses, newest first, plus
  "All months"; the month selected via the URL is always included even if it has no expenses)
  and category select; "Clear filters" returns to defaults (FR-024).
- Shows total of listed expenses (FR-025) and count — always for **all** matching expenses.
- List: table on `≥ 768px` (Date, Category badge, Description, Amount, Actions); stacked cards on
  `< 768px`. Sorted newest first. Rows render in batches of 100 (`LIST_BATCH_SIZE`); a
  "Show more (N left)" button adds the next batch, keeping long lists fast (SC-004).
- Row actions: **Edit** → `/expense-form.html?id=<id>`; **Delete** → confirmation dialog
  ("Delete this expense? This can't be undone." — Cancel / Delete). Confirm → delete, re-render,
  success toast. Expense already gone → error toast "This expense no longer exists."
- Empty states: no expenses at all → "No expenses yet" + "Add your first expense"; default view
  (current month, all categories) with nothing this month → "No expenses in October 2026." +
  "Add expense"; any other filter matching nothing → "No expenses match these filters." +
  "Clear filters".

## `/expense-form.html` — Add / Edit — User Stories 2, 3

| Query param | Values        | Behavior                                                          |
|-------------|---------------|-------------------------------------------------------------------|
| *(none)*    | —             | **Add** mode: title "Add expense"; date = today; other fields empty. |
| `id`        | expense id    | **Edit** mode: title "Edit expense"; fields pre-filled.           |

- `id` not found → "This expense no longer exists." message + link "Back to expenses"; no form.
- Fields: Amount (text, `inputmode="decimal"`), Category (select, placeholder "Choose a
  category"), Date (date input), Description (text, max 100, live counter "0/100").
- Buttons: **Save** (primary), **Cancel** (returns to previous page or `/expenses.html`).
- On submit: Save button disabled → validate (see
  [data-model.md validation rules](../data-model.md#validation-rules-fr-013--fr-016)).
  - Invalid → errors under each field (`aria-invalid`, `aria-describedby`), focus first invalid
    field, values kept, Save re-enabled.
  - Valid → save via storage module → set flash "Expense added" / "Expense updated" → redirect to
    `/expenses.html?month=<expense month>`.
  - Edit target deleted meanwhile → error "This expense no longer exists." + link to list.
  - Save failed → error alert, values kept, Save re-enabled.

## Feedback messages (FR-012, FR-016, FR-017)

| Event               | Message (toast unless stated)                                    |
|---------------------|------------------------------------------------------------------|
| Added               | "Expense added"                                                  |
| Updated             | "Expense updated"                                                |
| Deleted             | "Expense deleted"                                                |
| Not found           | "This expense no longer exists."                                 |
| Save failed         | Alert: "Your expense couldn't be saved. Your browser storage may be full." |
| Storage unreadable  | Alert: "We couldn't read your saved expenses."                   |
| Storage unavailable | Alert: "Expenses can't be saved in this browser."                |
| Unexpected error    | Alert: "Something went wrong. Please reload the page and try again." |
