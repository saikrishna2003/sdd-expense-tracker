# Expensify — Spec-Driven Development Prompt Guide

This file records the exact prompts used to build the Expensify expense tracker with
[Spec Kit](https://github.com/github/spec-kit) slash commands in GitHub Copilot (VS Code), in the
order they were run. Follow the same sequence to reproduce the project or to build a similar app.

## Workflow at a glance

| Step | Command | Purpose | Main output |
|------|---------|---------|-------------|
| 1 | `/speckit-constitution` | Set project-wide principles | [.specify/memory/constitution.md](.specify/memory/constitution.md) |
| 2 | `/speckit-specify` | Describe *what* to build (no tech) | [specs/001-expense-tracker/spec.md](specs/001-expense-tracker/spec.md) |
| 3 | `/speckit-clarify` | Resolve open questions in the spec | Clarifications section in `spec.md` |
| 4 | `/speckit-plan` | Choose the tech stack and design | [plan.md](specs/001-expense-tracker/plan.md), [research.md](specs/001-expense-tracker/research.md), [data-model.md](specs/001-expense-tracker/data-model.md), [contracts/](specs/001-expense-tracker/contracts/), [quickstart.md](specs/001-expense-tracker/quickstart.md) |
| 5 | `/speckit-tasks` | Break the plan into ordered tasks | [tasks.md](specs/001-expense-tracker/tasks.md) |
| 6 | `/speckit-analyze` | Check spec, plan, and tasks for consistency (read-only) | Analysis report in chat |
| 7 | `/speckit-implement` | Build the app task by task | Source code + tasks marked `[X]` |

---

## Step 1 — Constitution

**Command:** `/speckit-constitution`

**Prompt:**

```text
Establish principles for a simple Python expense tracker. Decleare principles of clean code, simplify, ux, responsive design and minimal dependencies, Only prioritize front end is mainly required here. Require readable and modular Python code, input validation, clear error messages, no unit test cases needed, and no unnecessary external dependencies. Keep the project beginner-friendly and maintainable.
```

**Result:** Constitution v1.0.0 with seven principles (frontend-first UX, responsive design, clean
modular code, validation and clear errors, simplicity, minimal dependencies, beginner-friendly).
It also says unit tests are not required; features are checked by hand in the browser.

> **Tip:** This prompt names Python, but step 4 later chose a JavaScript stack, so the
> constitution had to be amended to v2.0.0. Decide the language here if you already know it.

---

## Step 2 — Specification

**Command:** `/speckit-specify`

**Prompt:**

```text
- initial page setup

Develop a simple, professional, and responsive expense tracker application that allows users to record their day-to-day expenses and categorize them into groups such as Food, Entertainment, Rent, Commute, Shopping, and Utilities

Users should be able to add, view, edit, and delete expenses, assign appropriate categories, and analyse their spending patterns through a clear and intuitive dashboard.

The application should provide monthly expense summaries, category-wise spending breakdowns, and visual insights to help users understand their overall spending habits and identify the categories where they spend the most.

Prioritize a clean, modern, user-friendly interface with responsive layouts that work seamlessly across mobile, tablet, and desktop devices. Keep the design minimal, navigation intuitive, and information easy to understand at a glance.

Focus on essential expense-tracking and analysis features while keeping the application lightweight, beginner-friendly, and maintainable. Follow the existing project constitution and define clear requirements, user scenarios, edge cases, and measurable acceptance criteria.

Do not generate the implementation or technical plan at this stage. Focus on specifying what the application should do and how it should behave.
```

**Result:** `specs/001-expense-tracker/spec.md` with six prioritized user stories, 27 functional
requirements, edge cases, measurable success criteria, and a spec quality checklist (all items
passing).

---

## Step 3 — Clarify

**Command:** `/speckit-clarify` (no extra text)

The agent asks up to five questions, one at a time. These were the answers given:

| # | Question | Answer chosen |
|---|----------|---------------|
| 1 | Should expense data be shared across devices or kept per install? | **A** — one running app shared on the home network *(later changed in step 4)* |
| 2 | How should the Expenses page show large numbers of expenses? | **A** — open on the current month; month filter (incl. "All months") for the rest |
| 3 | Which charts should the Dashboard include? | **B** — category donut chart + 6-month spending bar chart |
| 4 | Should the app require a password? | **A** — no login |
| 5 | What happens when the same expense is edited in two places at once? | **A** — last save wins; editing a deleted expense shows "no longer exists" |

> **Tip:** Reply with just the option letter, or `yes` to accept the agent's recommendation.

---

## Step 4 — Plan

**Command:** `/speckit-plan`

**Prompt:**

```text
Create a simple, beginner-friendly implementation plan for the Expensify expense tracker using the following technologies:

- **HTML** for page structure.
- **Tailwind CSS** for styling and responsive layouts.
- **Vanilla JavaScript** for application logic and user interactions.
- **Vite** for project setup and local development.
- **Session Storage** for temporarily storing expense records within the browser session.
- **date-fns** for date formatting and date-related operations.
- **shadcn/ui** for reusable UI components, using a setup compatible with the chosen frontend stack.
Keep the implementation simple, modular, and easy to understand. Avoid unnecessary dependencies and complex architecture.
```

The agent found three conflicts and asked how to resolve them:

| Conflict | Answer chosen |
|----------|---------------|
| The constitution required Python; the plan uses JavaScript | **Amend** the constitution to v2.0.0 for the JS/Vite/Tailwind stack |
| Session Storage is cleared when the tab closes, but the spec requires data to persist | Use **localStorage** (data persists per device; spec updated) |
| shadcn/ui only works with React | Use **Basecoat UI** (shadcn/ui look with plain HTML + Tailwind, no React) |

**Result:** `plan.md`, `research.md`, `data-model.md`, `contracts/storage-schema.md`,
`contracts/pages.md`, `quickstart.md` (17 manual test scenarios at this stage; an 18th was added
during step 7), the constitution amended to v2.0.0, and the spec updated for per-device storage.

> **Tip:** Check that your chosen libraries fit together *before* planning. For example,
> shadcn/ui needs React, and Session Storage doesn't persist after the tab closes.

---

## Step 5 — Tasks

**Command:** `/speckit-tasks` (no extra text)

**Result:** `tasks.md` with 50 tasks across 9 phases: setup, foundational work, the six user
stories, and polish. Each user story ends with a manual check using `quickstart.md`.

---

## Step 6 — Analyze

**Command:** `/speckit-analyze` (no extra text)

**Result:** A read-only report with no critical issues, one high, four medium, and six low
findings. Requirement coverage was 100%. The top five fixes were applied during step 7:

- **C1** — share the expense-row code between the list and the Dashboard
- **I1** — build the amount-limit message with the app's money format
- **I2** — use one consistent empty-month message on the Dashboard
- **G1** — keep an "Add" button visible on phones
- **U1** — always include the selected month in the month filter

---

## Step 7 — Implement

**Command:** `/speckit-implement` (no extra text)

The agent asked two questions before starting:

| Question | Answer chosen |
|----------|---------------|
| Node.js isn't installed — how should we proceed? | Install Node.js LTS with **winget** |
| Apply the analysis fixes (C1, I1, I2, G1, U1) while implementing? | **Yes** |

**Result:** The complete app, with all 50 tasks marked `[X]`. Every quickstart scenario was tested
in a browser (scenario 18, an SC-003 reachability check, was added in this step), and the
production build passed.

---

## Running the result

```bash
npm install
npm run dev        # open http://localhost:5173
npm run build      # production build in dist/
```

See [README.md](README.md) for the full setup guide and project structure.

## Lessons learned

1. **Lock the tech stack early.** Naming Python in the constitution and JavaScript in the plan
   forced a major constitution amendment.
2. **Clarify answers can change later.** Cross-device sharing (clarify Q1) was dropped once
   browser-only storage was chosen. The agent updates the spec when this happens.
3. **Run `/speckit-analyze` before implementing.** It found small inconsistencies that were
   cheap to fix before coding.
4. **Windows PowerShell:** if scripts are blocked, use `npm.cmd` instead of `npm`. The Spec Kit
   scripts can be run with `powershell -ExecutionPolicy Bypass -File <script>` for that one command.
5. **Test with realistic data volume.** Loading 5,000 expenses showed that the list needed
   "Show more" batching to meet the under-1-second target.
