# Data Model: Expense Tracker

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-20

All data lives in the browser (see [contracts/storage-schema.md](./contracts/storage-schema.md)).
Only **Expense** records are stored; everything else is fixed configuration or derived on demand.

## Expense (stored)

| Field         | Type                    | Required | Rules                                                                 |
|---------------|-------------------------|----------|-----------------------------------------------------------------------|
| `id`          | string                  | yes      | Generated on create (research R8); unique; never changes.             |
| `amountMinor` | integer                 | yes      | Amount in minor units (paise). 1 ≤ value ≤ 999,999,999 (= 9,999,999.99). |
| `category`    | string                  | yes      | Exactly one of the configured category names (see Category).         |
| `date`        | string `yyyy-MM-dd`     | yes      | Valid calendar date; not later than today + 1 year. Defaults to today. |
| `description` | string                  | no       | Trimmed; 0–100 characters; empty string when not provided.            |
| `createdAt`   | string (ISO 8601)       | yes      | Set on create; never changes.                                         |
| `updatedAt`   | string (ISO 8601)       | yes      | Set on create; refreshed on every successful edit.                    |

### Validation rules (FR-013 – FR-016)

Validation runs in one module before every save and returns per-field, plain-language messages.
Form input is raw text; the validator normalizes it.

| Field       | Input check (in order)                                         | Message shown next to field                                   |
|-------------|----------------------------------------------------------------|---------------------------------------------------------------|
| Amount      | Empty after trim                                               | "Please enter an amount."                                     |
|             | After removing spaces and commas, not a plain number (digits with at most one `.`) | "Amount must be a number, like 250 or 250.50." |
|             | More than 2 digits after the `.`                               | "Amount can have at most 2 decimal places."                   |
|             | Value ≤ 0                                                      | "Amount must be greater than 0."                              |
|             | Value > 9,999,999.99                                           | "Amount can't be more than ₹99,99,999.99." (limit formatted with the app's money format, so it follows `LOCALE`) |
| Category    | Empty                                                          | "Please choose a category."                                   |
|             | Not in configured list                                         | "Please choose a category from the list."                     |
| Date        | Empty                                                          | "Please pick a date."                                         |
|             | Not a valid `yyyy-MM-dd` date                                  | "Please enter a valid date."                                  |
|             | Later than today + 1 year                                      | "Date can't be more than one year in the future."             |
| Description | Longer than 100 characters after trim                          | "Description can be at most 100 characters."                  |

### Lifecycle

```text
(new) --add + valid--> Saved --edit + valid--> Saved (updatedAt refreshed)
                         |
                         +--delete (confirmed)--> Removed (gone from storage)
```

- Invalid add/edit → no state change; errors shown; form values kept.
- Edit/delete of an `id` no longer in storage → no state change; "This expense no longer exists"
  message with link to the list (last save wins across tabs).

## Category (fixed configuration, not stored)

Defined once in `src/config.js`, in display order:

| Name          | Purpose                          | Color (Tailwind palette reference) |
|---------------|----------------------------------|------------------------------------|
| Food          | Groceries, meals, snacks         | orange-500                         |
| Entertainment | Movies, events, subscriptions    | purple-500                         |
| Rent          | Housing rent                     | blue-600                           |
| Commute       | Fuel, transit, cabs              | teal-500                           |
| Shopping      | Clothes, electronics, household  | pink-500                           |
| Utilities     | Electricity, water, internet     | amber-500                          |
| Other         | Anything not covered above       | slate-500                          |

Colors are always paired with text labels (FR-022). Config order breaks ties (e.g., "top
category" when two categories have the same total).

## Derived views (computed on demand, never stored)

### Monthly Summary (for month `yyyy-MM`)

- `monthKey`, `label` (e.g., "October 2026")
- `totalMinor` — sum of `amountMinor` for expenses whose `date` starts with `monthKey`
- `count` — number of those expenses
- `topCategory` — category with the highest total (tie → config order); `null` when no expenses
- `breakdown[]` — `{ category, totalMinor, percent }` for categories with spending, sorted by
  `totalMinor` descending; percentages rounded to 1 decimal place (sum = 100 ± rounding)
- `recent[]` — up to 5 expenses of the month, newest `date` first, then newest `createdAt`

### Monthly Trend (6 months ending with selected month)

- `months[]` — exactly 6 entries, oldest → newest: `{ monthKey, shortLabel (e.g., "Oct"),
  totalMinor }`; months without expenses have `totalMinor = 0`.

### Expense List View

- Inputs: `month` (`yyyy-MM` or `all`, default current month) and `category` (name or all).
- Output: matching expenses sorted by `date` desc, then `createdAt` desc; plus `totalMinor` of the
  shown expenses (FR-025).

## Display formatting

- Money: currency symbol + `Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2,
  maximumFractionDigits: 2 })` of `amountMinor / 100` (e.g., `₹2,50,000.00` with `en-IN`).
- Dates: `d MMM yyyy` (e.g., "20 Oct 2026"); month headings `MMMM yyyy`.
