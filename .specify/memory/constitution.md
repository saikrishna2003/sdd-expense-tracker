<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (MAJOR: technology-specific principles redefined)
- Modified principles:
  - III. Clean, Readable & Modular Python → III. Clean, Readable & Modular JavaScript
  - IV. Input Validation & Clear Error Messages (server-side validation → validation module that
    runs before every save, since there is no server)
  - VI. Minimal Dependencies (Python stdlib + requirements.txt → small approved frontend dependency
    list pinned in package.json + lockfile; build tooling limited to Vite)
  - VII. Beginner-Friendly & Maintainable (setup steps now npm-based)
- Unchanged principles: I. Frontend-First User Experience, II. Responsive Design,
  V. Simplicity (KISS & YAGNI)
- Modified sections: Technology & Dependency Constraints (Python/Flask/SQLite → HTML, Tailwind CSS,
  vanilla JavaScript, Vite, Basecoat UI, date-fns, browser localStorage);
  Development Workflow & Quality Gates (PEP 8 → JavaScript style rules)
- Added sections: none
- Removed sections: none
- Reason: Planning for feature 001-expense-tracker selected a browser-only JavaScript stack.
- Templates: none modified (dependent templates read the constitution at runtime)
- Deferred TODOs: none
-->

# Expensify Expense Tracker Constitution

## Core Principles

### I. Frontend-First User Experience

The user-facing interface is the primary deliverable of this project.

- Planning and implementation effort MUST prioritize the frontend: screens, forms, navigation,
  feedback, and visual clarity come before internal sophistication.
- Data and logic modules MUST stay as thin as possible and exist only to serve UI needs
  (storing, retrieving, and summarizing expenses).
- Core tasks (add, view, edit, delete, and summarize expenses) MUST be reachable in no more
  than two interactions from the main screen.
- Every user action MUST produce visible feedback (success confirmation, updated list, or an
  error message).
- Layouts MUST use consistent spacing, readable font sizes, clear labels, and sufficient
  color contrast.

**Rationale**: An expense tracker succeeds only if people find it easy and pleasant to use;
UX quality is the project's main measure of value.

### II. Responsive Design

- The interface MUST be usable on mobile (≥ 320px wide), tablet, and desktop screens without
  horizontal scrolling or overlapping content.
- Layouts MUST use fluid, mobile-first techniques (Tailwind responsive utilities, flexbox/grid,
  relative units) rather than fixed pixel widths.
- Interactive elements (buttons, inputs, links) MUST be comfortably tappable on touch
  screens (target size of roughly 44×44px).
- Tables or lists of expenses MUST remain readable on small screens (e.g., stacked or
  scrollable within their own container).

**Rationale**: Expenses are often recorded on the go; the tracker must work on whatever
device the user has at hand.

### III. Clean, Readable & Modular JavaScript

- Code MUST be modern vanilla JavaScript using ES modules (`import`/`export`); no frontend
  framework (React, Vue, Angular, Svelte, etc.).
- Code MUST follow one consistent style: 2-space indentation, semicolons, `camelCase` for
  variables/functions, `UPPER_SNAKE_CASE` for constants, `const`/`let` (never `var`).
- Names of variables, functions, and files MUST be descriptive; cryptic abbreviations are
  not allowed.
- Code MUST be split into small, single-purpose modules (e.g., storage, validation, formatting,
  summaries, page scripts, shared UI helpers) instead of one large file.
- Functions SHOULD do one thing and stay short (guideline: under ~40 lines); duplicated logic
  MUST be extracted into a shared helper.
- Comments MUST explain *why* for non-obvious code; obvious code needs no comment. Exported
  functions SHOULD have a short JSDoc comment.

**Rationale**: Readable, modular code is easier to understand, change, and debug—especially
for beginners maintaining the project.

### IV. Input Validation & Clear Error Messages

- All user input (amount, date, category, description, etc.) MUST be validated by a dedicated
  validation module before it is stored; HTML form attributes MAY add instant feedback but MUST
  NOT replace this check.
- Data read back from storage MUST be checked before use; malformed records MUST be skipped
  without breaking the page.
- Amounts MUST be positive numbers with at most two decimal places; dates MUST be valid;
  required fields MUST NOT be empty; text fields MUST have a reasonable maximum length.
- Error messages MUST be written in plain language, state what went wrong and how to fix it
  (e.g., "Amount must be a number greater than 0"), and appear next to the relevant field.
- Users MUST NOT see raw stack traces or technical exception text; unexpected errors MUST show
  a friendly generic message while details are logged to the browser console for the developer.
- Invalid input MUST NOT clear the rest of the user's entered form data.

**Rationale**: Validation protects data integrity, and clear messages let users recover from
mistakes without frustration.

### V. Simplicity (KISS & YAGNI)

- The simplest solution that meets the requirement MUST be chosen.
- Features, abstractions, configuration options, or layers MUST NOT be added for speculative
  future needs.
- Any added complexity (new layer, pattern, or library) MUST be justified in the plan's
  complexity tracking with the simpler alternative that was rejected.

**Rationale**: A small, simple codebase is faster to build, easier to learn, and cheaper to
maintain.

### VI. Minimal Dependencies

- Built-in browser features MUST be preferred whenever they can reasonably do the job
  (e.g., `localStorage`, `Intl.NumberFormat`, `crypto.randomUUID`, SVG/CSS for simple charts).
- The approved dependencies are: Vite (dev server and build), Tailwind CSS with its Vite plugin
  (styling), Basecoat UI (shadcn/ui-styled components without React), and date-fns (date
  handling). Any other dependency MUST be justified by a clear need these and the browser cannot
  meet simply, and recorded in the plan's complexity tracking.
- Frontend frameworks, state-management libraries, CSS-in-JS, and charting libraries MUST NOT be
  introduced unless justified under the rule above.
- All dependencies MUST be declared in `package.json` with exact versions, and the lockfile
  MUST be kept with the project.

**Rationale**: Fewer dependencies mean easier setup for beginners, fewer security and
upgrade risks, and a project that keeps working over time.

### VII. Beginner-Friendly & Maintainable

- The project MUST run locally with a short, documented set of steps (install Node.js,
  `npm install`, `npm run dev`).
- A `README.md` MUST explain setup, how to run and build the app, and the project structure.
- The folder structure MUST be flat and predictable; magic, metaprogramming, and clever
  one-liners that hurt readability MUST be avoided.
- Configuration values (e.g., storage key, currency symbol, categories) MUST live in one obvious
  place.

**Rationale**: The project should be approachable by newcomers and easy to extend or fix
without deep prior knowledge.

## Technology & Dependency Constraints

- **Structure**: semantic HTML5 pages.
- **Styling**: Tailwind CSS (mobile-first, responsive utilities) with Basecoat UI component
  classes for a consistent shadcn/ui look.
- **Logic**: vanilla JavaScript (ES modules) only; date handling via date-fns.
- **Tooling**: Vite for local development and production builds; no other build tooling.
- **Storage**: browser `localStorage` only; no backend server or external database.
- **Excluded**: SPA frameworks (React, Angular, Vue, Svelte), routers, state-management
  libraries, charting libraries, CSS-in-JS, and any package that duplicates browser or approved
  dependency functionality—unless justified under Principle VI.

## Development Workflow & Quality Gates

- **Testing policy**: Unit test cases are NOT required for this project. Specs, plans, and
  task lists MUST NOT generate unit-test tasks unless a future amendment changes this policy.
- **Manual verification**: Each feature MUST be verified manually in a browser before it is
  considered done, covering: the main user flow, invalid-input handling with clear error
  messages, and layout on a narrow (mobile) and a wide (desktop) viewport.
- **Review checklist**: Every change MUST be checked against the Core Principles—frontend UX
  impact, responsiveness, readability/modularity, input validation, simplicity, and no
  unnecessary new dependencies.
- **Definition of done**: Feature works as specified, passes manual verification, follows the
  JavaScript style rules in Principle III, `npm run build` succeeds without errors, and the
  README is updated if setup or usage changed.

## Governance

- This constitution supersedes other project practices; where guidance conflicts, the
  constitution wins.
- **Amendments**: Proposed changes MUST be documented (what changes and why), reflected in
  this file with an updated Sync Impact Report, and dependent artifacts reviewed for
  consistency.
- **Versioning policy**: Semantic versioning applies—MAJOR for removing or redefining a
  principle in a backward-incompatible way; MINOR for adding a principle/section or materially
  expanding guidance; PATCH for clarifications and wording fixes.
- **Compliance review**: Every spec, plan, and implementation review MUST verify compliance
  with the Core Principles; deviations MUST be justified in the plan's complexity tracking or
  resolved before completion.

**Version**: 2.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20
