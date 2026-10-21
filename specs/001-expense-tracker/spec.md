# Feature Specification: Expense Tracker

**Feature Branch**: `001-expense-tracker`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "Initial page setup. Develop a simple, professional, and responsive expense
tracker application that allows users to record their day-to-day expenses and categorize them into
groups such as Food, Entertainment, Rent, Commute, Shopping, and Utilities. Users should be able to
add, view, edit, and delete expenses, assign appropriate categories, and analyse their spending
patterns through a clear and intuitive dashboard. The application should provide monthly expense
summaries, category-wise spending breakdowns, and visual insights to help users understand their
overall spending habits and identify the categories where they spend the most. Prioritize a clean,
modern, user-friendly interface with responsive layouts that work seamlessly across mobile, tablet,
and desktop devices. Keep the design minimal, navigation intuitive, and information easy to
understand at a glance. Focus on essential expense-tracking and analysis features while keeping the
application lightweight, beginner-friendly, and maintainable."

## Clarifications

### Session 2026-10-20

- Q: Should the same expense data be visible from different devices, or does each install keep its
  own data? → A: Each device and browser keeps its own data, saved in that browser so it survives
  restarts; data is not shared between devices. *(Revised during planning; the original answer was
  one shared running instance on the home network.)*
- Q: How should the Expenses page show large numbers of expenses? → A: It opens on the current
  month by default; the month filter lets users view another month or "All months".
- Q: Which charts should the Dashboard include for visual insights? → A: A category donut chart for
  the selected month plus a bar chart of monthly totals for the last 6 months.
- Q: Should the app ask for a password before showing or changing expenses? → A: No login; anyone
  using the same device and browser can see and change its expenses.
- Q: What happens if the same expense is edited in two browser tabs at about the same time? → A:
  Last save wins; saving an edit to an expense deleted elsewhere shows a friendly "no longer exists"
  message.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Page Setup & Navigation (Priority: P1)

A user opens the application for the first time and sees a clean, professional layout: an
application header with the product name, a simple navigation menu (Dashboard, Expenses, Add
Expense), and a main content area. With no data yet, each page shows a friendly empty state that
explains what the page is for and offers a clear "Add your first expense" action. The layout adapts
to the user's screen: on a phone the navigation collapses into a compact menu, while on tablet and
desktop it is always visible.

**Why this priority**: Every other feature lives inside this shell. A consistent, responsive page
structure is the foundation that makes the rest of the app usable and professional.

**Independent Test**: Open the app on a phone-sized, tablet-sized, and desktop-sized screen with no
data; confirm the header, navigation, empty states, and call-to-action appear correctly and every
navigation link reaches its page.

**Acceptance Scenarios**:

1. **Given** the app has no expenses, **When** the user opens it, **Then** the Dashboard is shown as
   the landing page with an empty state message and an "Add your first expense" button.
2. **Given** the user is on any page, **When** they select a navigation item, **Then** the matching
   page opens and the active item is visually highlighted.
3. **Given** a screen 320px–767px wide, **When** the user opens the app, **Then** the navigation is
   available through a compact menu and no content requires horizontal scrolling.
4. **Given** a screen 768px wide or wider, **When** the user opens the app, **Then** the navigation
   is fully visible without opening a menu.

---

### User Story 2 - Add and View Expenses (Priority: P1)

A user records a day-to-day expense by entering an amount, choosing a category, picking a date
(defaulting to today), and optionally adding a short description. After saving, they see a
confirmation and the expense appears in their expense list, newest first, showing date,
category, description, and amount.

**Why this priority**: Recording and seeing expenses is the core value of an expense tracker; with
only this story the app is already a usable MVP.

**Independent Test**: Add several expenses with different categories and dates in the current month,
then open the expense list and confirm each appears with the correct details in newest-first order.

**Acceptance Scenarios**:

1. **Given** the Add Expense form, **When** the user enters amount 250.50, category Food, today's
   date, and description "Lunch" and saves, **Then** a success message appears and the expense is
   listed with those exact values.
2. **Given** the Add Expense form, **When** the user leaves the date untouched, **Then** today's date
   is used.
3. **Given** the user submits with an empty amount, a zero/negative amount, a non-numeric amount,
   more than two decimal places, no category, or an invalid date, **Then** the expense is not saved,
   a plain-language error appears next to each invalid field, and all other entered values remain.
4. **Given** several saved expenses in the current month, **When** the user opens the Expenses page,
   **Then** the current month's expenses are listed newest date first, and each shows date,
   category, description, and formatted amount.

---

### User Story 3 - Edit and Delete Expenses (Priority: P2)

A user notices a mistake and edits an existing expense's amount, category, date, or description.
They can also delete an expense they no longer want, after confirming the deletion.

**Why this priority**: Correcting mistakes keeps data trustworthy, but the app is still useful
without it for a first release.

**Independent Test**: Edit one expense and delete another; confirm the list and any totals reflect
the changes and that a cancelled delete leaves the expense untouched.

**Acceptance Scenarios**:

1. **Given** an existing expense, **When** the user chooses Edit, **Then** a form opens pre-filled with
   the expense's current values.
2. **Given** the edit form, **When** the user changes the amount to a valid value and saves, **Then**
   a success message appears and the list shows the updated amount.
3. **Given** the edit form, **When** the user enters invalid values, **Then** the same validation
   rules and messages as adding an expense apply and the original expense is unchanged.
4. **Given** an existing expense, **When** the user chooses Delete, **Then** a confirmation prompt
   appears; confirming removes the expense and shows a success message; cancelling keeps it.

---

### User Story 4 - Monthly Summary Dashboard (Priority: P2)

A user opens the Dashboard to understand their spending for a month. By default it shows the
current month: total spent, number of expenses, the top spending category, and a short list of the
most recent expenses. The user can move to the previous or next month to compare.

**Why this priority**: Summaries turn raw records into insight, which is the main reason users keep
tracking expenses.

**Independent Test**: Add expenses across two different months, open the Dashboard, and confirm
the totals, counts, and top category for each month match the entered data.

**Acceptance Scenarios**:

1. **Given** expenses in the current month, **When** the user opens the Dashboard, **Then** it shows
   the current month's name and year, total amount spent, number of expenses, and top category.
2. **Given** the Dashboard, **When** the user selects the previous month, **Then** all summary figures
   update to that month's data.
3. **Given** a month with no expenses, **When** the user views it, **Then** totals show zero and a
   friendly message states there are no expenses for that month.
4. **Given** the Dashboard, **When** the user views the recent expenses area, **Then** up to the 5
   most recent expenses of the selected month are shown with a link to the full list.

---

### User Story 5 - Category Breakdown & Visual Insights (Priority: P3)

A user wants to see where their money goes and how it changes over time. For the selected month,
the Dashboard shows each category's total, its percentage of the month's spending, and a donut
chart so the highest-spending categories are obvious at a glance. Categories are ordered from
highest to lowest spending. A bar chart of total spending for the last 6 months (ending with the
selected month) shows whether spending is rising or falling.

**Why this priority**: Visual insights add significant understanding but depend on stories 2 and 4
already being in place.

**Independent Test**: Add expenses in at least three categories for one month and in at least two
other months; confirm the breakdown totals, percentages, ordering, donut proportions, and the
6-month bar heights match the data.

**Acceptance Scenarios**:

1. **Given** a month with expenses in several categories, **When** the user views the breakdown,
   **Then** each category with spending shows its total and percentage, ordered highest first, and
   percentages add up to 100% (allowing for rounding).
2. **Given** the breakdown, **When** the user looks at the donut chart, **Then** each category is
   distinguishable by color and label, and the largest category is visibly the largest segment.
3. **Given** a month with no expenses, **When** the user views the breakdown, **Then** no empty donut
   chart is drawn; a message explains there is nothing to show yet.
4. **Given** expenses across several months, **When** the user views the 6-month bar chart, **Then**
   it shows one labelled bar per month for the 6 months ending with the selected month, each bar's
   height matches that month's total, and months with no expenses show as zero.
5. **Given** the user switches the selected month, **When** the Dashboard updates, **Then** both the
   donut chart and the 6-month bar chart update to match.

---

### User Story 6 - Filter the Expense List (Priority: P3)

A user wants to find specific expenses, so they filter the expense list by month and/or category
and see the total of the filtered results.

**Why this priority**: Helpful once a user has many entries, but not essential for initial value.

**Independent Test**: With expenses across months and categories, apply a month and category filter
and confirm only matching expenses and their correct total are shown.

**Acceptance Scenarios**:

1. **Given** the Expenses page, **When** the user filters by category "Commute", **Then** only Commute
   expenses are listed and the total of those expenses is displayed.
2. **Given** an active filter, **When** the user clears it, **Then** the list returns to the default
   view (current month, all categories).
3. **Given** the month filter, **When** the user selects "All months", **Then** every saved expense is
   listed newest first with the overall total.
4. **Given** a filter that matches nothing, **When** applied, **Then** a message states no expenses
   match and offers to clear the filter.

---

### Edge Cases

- Very large amounts (e.g., 9,999,999.99) display fully without breaking the layout; amounts above
  the maximum allowed value are rejected with a clear message.
- Long descriptions (up to the maximum length) wrap or truncate neatly on small screens; longer
  input is rejected with a message stating the limit.
- Amounts like "1,000" or " 50 " (with spaces) are interpreted sensibly or rejected with a clear
  message; they never cause an unexplained failure.
- Expenses dated in the future are allowed (e.g., pre-recording rent) but dates more than one year
  ahead are rejected as likely mistakes.
- Deleting the last expense of a month returns the Dashboard to its empty state for that month.
- Editing an expense's date into a different month moves it to that month's summary.
- A month with expenses in only one category shows that category at 100%.
- If saved data cannot be read or saved, the user sees a friendly error message (no technical
  details) and previously entered form data is not lost.
- Rapid double-clicking Save creates only one expense.
- Navigating to an expense that no longer exists (e.g., deleted in another tab) shows a "not found"
  message with a link back to the list.
- If the same expense is edited in two browser tabs at about the same time, the last save wins and
  replaces the earlier changes. Saving an edit to an expense that was deleted in another tab shows a
  friendly "This expense no longer exists" message with a link back to the list; nothing is saved
  or re-created.
- If the browser blocks saving (e.g., storage is full or disabled in a private window), the user
  sees a friendly message explaining that expenses cannot be saved in this browser.
- If the user clears their browser data, their expenses are removed; this is expected behavior.

## Requirements *(mandatory)*

### Functional Requirements

**Page setup & navigation**

- **FR-001**: The application MUST present a consistent layout on every page: a header with the
  application name, a navigation menu (Dashboard, Expenses, Add Expense), and a main content area.
- **FR-002**: The Dashboard MUST be the default landing page.
- **FR-003**: The navigation MUST highlight the current page.
- **FR-004**: On screens narrower than 768px the navigation MUST collapse into a compact menu; on
  wider screens it MUST be fully visible.
- **FR-005**: Every page MUST display a helpful empty state with a clear next action when there is no
  data to show.

**Expense management**

- **FR-006**: Users MUST be able to add an expense with amount (required), category (required), date
  (required, defaults to today), and description (optional).
- **FR-007**: The system MUST provide exactly these categories: Food, Entertainment, Rent, Commute,
  Shopping, Utilities, and Other.
- **FR-008**: Users MUST be able to view expenses in a list sorted by date, newest first, showing
  date, category, description, and amount. The list MUST open on the current month by default.
- **FR-009**: Users MUST be able to edit any field of an existing expense.
- **FR-010**: Users MUST be able to delete an expense only after confirming the deletion.
- **FR-011**: The system MUST keep expenses saved on the user's device, in the browser they use,
  across page reloads, browser restarts, and device restarts until the user deletes them (or clears
  their browser data). Data is not shared between devices or browsers.
- **FR-012**: The system MUST show a visible success confirmation after an expense is added, updated,
  or deleted.

**Validation & errors**

- **FR-013**: The system MUST reject amounts that are empty, non-numeric, zero or negative, have more
  than two decimal places, or exceed 9,999,999.99.
- **FR-014**: The system MUST reject a missing or unknown category, an invalid date, or a date more
  than one year in the future.
- **FR-015**: The system MUST reject descriptions longer than 100 characters.
- **FR-016**: Validation errors MUST be shown in plain language next to the relevant field, stating
  what is wrong and how to fix it, and MUST keep the user's other entered values.
- **FR-017**: Unexpected errors MUST show a friendly, non-technical message; technical details MUST
  never be shown to the user.

**Dashboard & insights**

- **FR-018**: The Dashboard MUST show, for a selected month (default: current month), the total
  amount spent, the number of expenses, and the top spending category.
- **FR-019**: Users MUST be able to switch the Dashboard to the previous or next month.
- **FR-020**: The Dashboard MUST show up to the 5 most recent expenses of the selected month.
- **FR-021**: The Dashboard MUST show a category breakdown for the selected month listing each
  category with spending, its total, and its percentage of the month's total, ordered highest first.
- **FR-022**: The Dashboard MUST show a donut chart of the selected month's category breakdown in
  which each category has a distinct color and a text label (information MUST NOT rely on color
  alone).
- **FR-022a**: The Dashboard MUST show a bar chart of total spending for each of the 6 months ending
  with the selected month, with each bar labelled by month and amount; months with no expenses
  MUST appear as zero.
- **FR-023**: When the selected month has no expenses, the Dashboard MUST show zero totals and a
  friendly message instead of an empty donut chart.

**Filtering**

- **FR-024**: Users MUST be able to filter the expense list by month (including an "All months"
  option) and by category, individually or together, and clear the filters to return to the
  default view (current month, all categories).
- **FR-025**: The expense list MUST display the total amount of the currently shown expenses.

**Presentation**

- **FR-026**: All amounts MUST be displayed with a currency symbol, thousands separators, and two
  decimal places; dates MUST be displayed in a consistent, readable format (e.g., 20 Oct 2026).
- **FR-027**: All pages MUST be usable on screens from 320px wide to large desktop without horizontal
  page scrolling, with touch-friendly controls on small screens.

### Key Entities

- **Expense**: A single spending record. Attributes: amount (positive, up to two decimals), category
  (one of the defined categories), date, optional description (max 100 characters), and the time it
  was created/last updated.
- **Category**: A fixed spending group used to classify expenses: Food, Entertainment, Rent,
  Commute, Shopping, Utilities, Other. Each has a display name and a distinct display color.
- **Monthly Summary** (derived, not stored): For a given month — total spent, expense count, top
  category, and per-category totals and percentages; the Dashboard also uses the monthly totals of
  the 6 months ending with the selected month for the trend bar chart.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can add their first expense within 30 seconds of opening the app,
  without instructions.
- **SC-002**: A user can identify their highest-spending category for the current month within 5
  seconds of opening the Dashboard.
- **SC-003**: Add, view, edit, and delete are each reachable within 2 interactions from the
  Dashboard.
- **SC-004**: Pages load and respond to user actions in under 1 second with up to 5,000 saved
  expenses.
- **SC-005**: All pages display correctly with no horizontal scrolling or overlapping content at
  widths of 320px, 768px, and 1280px.
- **SC-006**: 100% of invalid inputs listed in FR-013–FR-015 are rejected with a field-specific,
  plain-language message, and no invalid expense is ever saved.
- **SC-007**: Monthly totals, category percentages, and 6-month bar chart values always exactly
  match the sum of the underlying expenses (percentages total 100% ± 1% for rounding).
- **SC-008**: In manual walkthroughs, at least 9 out of 10 test users complete the add → edit →
  view-summary flow on their first attempt.

## Assumptions

- The application is for a single personal user; user accounts, login, and multi-user sharing are
  out of scope for this version.
- The app runs entirely in the user's web browser on phone, tablet, or desktop; each device and
  browser keeps its own separate set of expenses. Cross-device sharing and sync are out of scope.
- No login or password is required: anyone using the same device and browser can view and change
  its expenses. Access protection is out of scope for this version.
- A single currency is used for all expenses; the currency symbol is a single configurable setting
  (default: ₹). Multi-currency and conversion are out of scope.
- The category list is fixed (the six requested categories plus "Other" for anything that does not
  fit); creating custom categories is out of scope for this version.
- Data is stored in the user's browser on their device and persists until deleted or until the
  user clears their browser data; cloud sync, backups, and data import/export are out of scope.
- Budgets, recurring expenses, income tracking, receipts/attachments, and notifications are out of
  scope.
- "Month" means a calendar month based on the user's local date.
- Per the project constitution, no unit tests are required; acceptance is verified manually in a
  browser at mobile and desktop widths.
- Modern, up-to-date web browsers on mobile, tablet, and desktop are the supported environment.
