# Contract: Browser Storage Schema

**Feature**: [../spec.md](../spec.md) | **Data model**: [../data-model.md](../data-model.md)

This is the only persistent interface of the app. Any change to the shape below MUST bump the
`version` and the key suffix, and include a migration note in the plan.

## localStorage — expenses

- **Key**: `expensify.expenses.v1` (defined once in `src/config.js` as `STORAGE_KEY`)
- **Value**: JSON text of the document below.

```json
{
  "version": 1,
  "expenses": [
    {
      "id": "lzq3k8a1b2c3d4",
      "amountMinor": 25050,
      "category": "Food",
      "date": "2026-10-20",
      "description": "Lunch",
      "createdAt": "2026-10-20T12:31:05.123Z",
      "updatedAt": "2026-10-20T12:31:05.123Z"
    }
  ]
}
```

Field rules: see [data-model.md → Expense](../data-model.md#expense-stored).

### Read behavior

| Situation                                   | Result                                                                  |
|---------------------------------------------|-------------------------------------------------------------------------|
| Key missing                                 | Empty list (first run).                                                 |
| JSON parse fails / wrong `version` / not an object | Empty list for display; friendly page-level alert "We couldn't read your saved expenses."; details logged to console; stored value left untouched (not overwritten until the next successful save). |
| Individual record fails validation          | Record skipped; warning logged to console; others shown normally.       |
| Storage access throws (disabled/private)    | Empty list + friendly alert "Expenses can't be saved in this browser."  |

### Write behavior

- Every write = read fresh document → apply one change (add / replace by `id` / remove by `id`)
  → write whole document back. Last save wins across tabs.
- Replace/remove where `id` is not present → no write; caller shows "This expense no longer
  exists."
- Write throws (e.g., `QuotaExceededError`) → no partial data; caller shows "Your expense couldn't
  be saved. Your browser storage may be full." and keeps form values.

## sessionStorage — flash message

- **Key**: `expensify.flash`
- **Value**: JSON `{ "category": "success" | "error", "title": string, "description"?: string }`
- Written just before a redirect (after add, edit, or delete); read once and removed on the next
  page load, then shown as a Basecoat toast. Missing/invalid value → ignored.

## Module interface (`src/storage.js`)

The rest of the app touches storage only through these functions:

| Function                       | Returns                                                             |
|--------------------------------|---------------------------------------------------------------------|
| `loadExpenses()`               | `{ expenses: Expense[], error: null \| "unreadable" \| "unavailable" }` |
| `getExpenseById(id)`           | `Expense \| null`                                                   |
| `addExpense(input)`            | `{ ok: true, expense } \| { ok: false, reason: "save-failed" }`    |
| `updateExpense(id, input)`     | `{ ok: true, expense } \| { ok: false, reason: "not-found" \| "save-failed" }` |
| `deleteExpense(id)`            | `{ ok: true } \| { ok: false, reason: "not-found" \| "save-failed" }` |
| `setFlash(message)` / `takeFlash()` | write / read-and-remove the flash message                     |

`input` is the already-validated, normalized value from `src/validation.js`
(`{ amountMinor, category, date, description }`).
