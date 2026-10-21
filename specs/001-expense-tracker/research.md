# Research: Expense Tracker

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-20

All Technical Context unknowns are resolved below. Each entry records the decision, why it was
chosen, and what else was considered.

## R1. Overall architecture

- **Decision**: Browser-only multi-page app (MPA) with three HTML pages built by Vite:
  `index.html` (Dashboard), `expenses.html` (list), `expense-form.html` (add/edit). Each page loads
  one small page script; shared logic lives in plain ES modules.
- **Rationale**: Separate pages need no client-side router, the browser Back button just works,
  and each page script is small and easy for beginners to follow. Vite supports multi-page builds
  natively.
- **Alternatives considered**: Single-page app with a hash router (adds routing code and state
  handling); modal-based add/edit on one page (harder on small screens, more DOM juggling).

## R2. Storage (localStorage, with sessionStorage only for flash messages)

- **Decision**: Persist expenses in `localStorage` under one versioned key
  (`expensify.expenses.v1`) as a JSON document (see
  [contracts/storage-schema.md](./contracts/storage-schema.md)). Always read fresh from storage at
  page load and immediately before each write (no long-lived in-memory cache). Use
  `sessionStorage` only for one-time "flash" success messages shown after a redirect.
- **Rationale**: User chose localStorage during planning because sessionStorage is cleared when a
  tab closes, which would violate FR-011. Reading fresh before every write gives the
  "last save wins" behavior across tabs for free and lets an edit detect that its expense was
  deleted elsewhere. sessionStorage is the natural fit for a message that should survive exactly
  one redirect.
- **Alternatives considered**: sessionStorage for all data (rejected: data lost on tab close, per
  tab only); IndexedDB (rejected: async API and more code for no benefit at ≤ 5,000 records);
  a backend server (rejected: out of scope after planning decision).
- **Capacity check**: ~150 bytes × 5,000 expenses ≈ 0.75 MB, well under the ~5 MB typical
  localStorage limit. Write failures (quota exceeded, storage disabled) are caught and shown as a
  friendly message.

## R3. UI components: shadcn/ui → Basecoat UI

- **Decision**: Use **Basecoat UI** (`basecoat-css`), which delivers the shadcn/ui design as plain
  HTML + Tailwind classes with a tiny optional JS runtime. Import its CSS after Tailwind
  (`@import "tailwindcss"; @import "basecoat-css";`) and load only the JS it needs for toasts.
- **Rationale**: shadcn/ui is React-only; using it would add React and break the vanilla-JS
  requirement. Basecoat gives the same look (buttons, cards, inputs, selects, tables, badges,
  alerts, dialogs, toasts) with plain markup, as confirmed by the user.
- **Alternatives considered**: Real shadcn/ui + React (rejected: framework, larger bundle,
  violates Principle III); hand-written shadcn-style classes (more code to maintain); daisyUI /
  Flowbite (different visual language from shadcn/ui).
- **Components used**: `btn` (variants), `card`, `input`, `select`, `label`/field layout, `table`,
  `badge`, `alert`, native `<dialog>` styled by Basecoat for delete confirmation, and `toast`
  (needs the Basecoat runtime + toast script). Icons: inline Lucide SVGs copied into markup
  (Basecoat does not bundle icons; no icon package added).

## R4. Styling & responsiveness: Tailwind CSS v4 via Vite plugin

- **Decision**: Tailwind CSS 4 with the official `@tailwindcss/vite` plugin; one stylesheet
  `src/styles/main.css`. Mobile-first utilities; breakpoint `md` (768px) switches compact menu →
  full navigation (FR-004).
- **Rationale**: v4 needs no `tailwind.config.js` or PostCSS config and auto-detects class usage
  in HTML/JS files—least setup for beginners.
- **Alternatives considered**: Tailwind via CDN script (not for production use); Tailwind v3 with
  PostCSS (more config files).

## R5. Dates: date-fns

- **Decision**: Store dates as `yyyy-MM-dd` strings (local calendar date, no time zone). Use
  date-fns for `parseISO`, `isValid`, `format` (`d MMM yyyy` for display, `yyyy-MM` for month
  keys, `MMMM yyyy` for headings), `startOfMonth`, `addMonths`/`subMonths`, `addYears`,
  `isAfter`, and `compareDesc`.
- **Rationale**: Date-only strings avoid time-zone shifts; date-fns is tree-shakable, so only the
  used functions are bundled.
- **Alternatives considered**: Native `Date` math only (error-prone month arithmetic);
  Day.js/Luxon (not requested).

## R6. Money handling

- **Decision**: Store amounts as integer **minor units** (paise, `amountMinor`) to avoid
  floating-point rounding errors; convert at the edges. Display with `Intl.NumberFormat`
  (locale from config, default `en-IN`, 2 fraction digits) prefixed with the configured currency
  symbol (default `₹`).
- **Rationale**: Integer sums are exact, satisfying SC-007. `Intl.NumberFormat` is built in.
- **Alternatives considered**: Floats with `toFixed` (rounding drift in totals); a decimal library
  (unnecessary dependency).
- **Input parsing**: trim spaces, strip thousands separators (commas), then require the pattern
  `digits[.d or .dd]`; > 0 and ≤ 9,999,999.99.

## R7. Charts without a chart library

- **Decision**: Donut chart = inline SVG `<circle>` segments using `stroke-dasharray`; 6-month
  trend = HTML bars (flex column with percentage heights). Both are accompanied by a text legend /
  labels showing category or month, amount, and percentage (FR-022 "not color alone").
- **Rationale**: Two simple charts need ~60 lines of code; a chart library would be the largest
  dependency in the project for little benefit (Principle VI forbids it without justification).
  Basecoat's chart helper is a separate add-on and not needed.
- **Alternatives considered**: Chart.js (heavy dependency); CSS `conic-gradient` donut (harder to
  label/hover per segment).

## R8. IDs

- **Decision**: `id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)`.
- **Rationale**: `crypto.randomUUID()` only works in secure contexts (HTTPS or localhost); when
  testing on a phone via the dev server's network URL (plain HTTP), it would be undefined. The
  chosen form is unique enough for one user's local data.
- **Alternatives considered**: `crypto.randomUUID()` (breaks over LAN HTTP); incrementing integer
  (needs a stored counter).

## R9. Page state in the URL

- **Decision**: Dashboard month via `?month=yyyy-MM`; Expenses filters via
  `?month=yyyy-MM|all&category=<Category>`; edit form via `?id=<id>`. See
  [contracts/pages.md](./contracts/pages.md).
- **Rationale**: Reloads and the Back button keep the user's view, with no extra state storage.

## R10. Security & robustness basics

- **Decision**: Render all user-entered text with `textContent` (never `innerHTML` with user
  data) to prevent script injection. Wrap storage access in `try/catch`; validate every record
  read from storage and skip malformed ones (logging details to the console). Disable the Save
  button on submit to prevent double-saves.
- **Rationale**: Covers spec edge cases (corrupt data, double-click, storage failures) with
  minimal code; satisfies constitution Principle IV.

## R11. Tooling versions & prerequisites

- **Decision** (latest stable at planning time, pinned exactly in `package.json`):
  `vite` 8.3.4, `tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3, `basecoat-css` 1.0.2,
  `date-fns` 4.4.0. Requires **Node.js 22 LTS or newer** (Vite 8 needs Node ≥ 20.19 / 22.12).
- **Note**: Node.js is not currently installed on the development machine; installing it is the
  first setup step (see [quickstart.md](./quickstart.md)).
- **Testing**: Per constitution, no unit tests. Validation is manual via
  [quickstart.md](./quickstart.md) plus a successful `npm run build`.
