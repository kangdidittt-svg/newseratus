# StudioManager v2.1 --- UI Refactor Master Prompt

## Objective

Refactor ONLY the UI/UX and Design System. Do NOT modify business logic,
API, database, routes, or features.

## Preserve Features

-   Edinburgh Clock (mandatory)
-   Studio Robot
-   Projects
-   Tasks
-   Invoice Generator
-   PDF Export
-   Calendar
-   Insights
-   Notifications
-   Settings
-   All CRUD operations

## Single Design System

Theme: **Seratus Graphite**

### Colors

-   Background: #0D0D0D
-   Surface: #151515
-   Elevated: #1B1B1B
-   Hover: #202020
-   Border: rgba(255,255,255,.06)
-   Primary Text: #F5F5F5
-   Secondary Text: #9CA3AF
-   Muted Text: #6B7280
-   Accent: #8B5CF6
-   Success: #22C55E
-   Warning: #F59E0B
-   Danger: #EF4444
-   Info: #3B82F6

No additional accent colors.

## Typography

Use Geist (fallback Inter).

H1 42 H2 32 H3 24 Body 16 Caption 13

## Rules

-   One button system across entire app.
-   One card system.
-   One modal system.
-   One input system.
-   One badge system.
-   One table style.
-   One spacing system (8/16/24/32/48).
-   Lucide icons only.
-   No glassmorphism.
-   No neon.
-   No glow.
-   No inconsistent border radius.

## Project Cards

Reduce height by \~40%. Only show: - Title - Client - Income -
Deadline - Progress - Actions

Compact and information-dense.

## Dashboard

Prioritize: - Today's Focus - Active Work - Upcoming Deadlines - Pending
Invoice Less statistics, more productivity.

## Edinburgh Clock

Keep permanently visible. Display: - UK Time - Indonesia Time - Working
Status - Next Overlap

Improve styling only.

## Accessibility

Fix every low-contrast text. Every button and badge must be readable.
Remove inconsistent colors.

## Code Cleanup

Audit every page. Merge duplicated components. Use shared design tokens.
Remove duplicate CSS/Tailwind.

## Validation Checklist

-   Same colors everywhere
-   Same typography everywhere
-   Same buttons everywhere
-   Same inputs everywhere
-   Same tables everywhere
-   Same spacing everywhere
-   Same shadows everywhere
-   Same card style everywhere
-   Edinburgh Clock preserved
-   Studio Robot preserved
-   No feature removed
-   No visual regressions
