# STUDIOMANAGER V3 --- CREATIVE WORKSPACE REDESIGN BIBLE

> THIS IS A FULL REDESIGN. DO NOT "IMPROVE" THE CURRENT UI. KEEP ONLY
> THE FEATURES. DELETE THE ENTIRE VISUAL LANGUAGE.

# PRIMARY OBJECTIVE

Forget the current interface.

Treat the existing project ONLY as the backend.

Rebuild the frontend from zero.

The final result must feel like:

-   Linear
-   Arc Browser
-   Raycast
-   Notion Calendar
-   Vercel

NOT like:

-   AdminLTE
-   ThemeForest Dashboard
-   Bootstrap Admin
-   Generic SaaS Dashboard

------------------------------------------------------------------------

# ABSOLUTE RULES

DO NOT keep the existing layout.

DO NOT keep the existing cards.

DO NOT keep the existing dashboard hierarchy.

DO NOT reuse old spacing.

DO NOT reuse old colors.

DO NOT keep pages visually similar.

Keep ONLY:

-   Business logic
-   Database
-   API
-   Routing
-   CRUD
-   Edinburgh Clock
-   Studio Robot

Everything else is rebuilt.

------------------------------------------------------------------------

# DESIGN PHILOSOPHY

Three words define the product:

CALM

FOCUSED

PREMIUM

Every UI decision must follow these words.

If a component feels flashy, remove it.

If a color screams, remove it.

If something exists only for decoration, remove it.

------------------------------------------------------------------------

# REMOVE THESE THINGS

-   Dashboard look
-   KPI style cards
-   Large colorful statistics
-   Big rounded widgets
-   Neon
-   Glow
-   Glassmorphism
-   Heavy borders
-   Thick shadows
-   Bright badges
-   Multiple accent colors
-   Colorful icons
-   Gradient buttons
-   Admin dashboard layout

------------------------------------------------------------------------

# CREATE THIS INSTEAD

The application is a WORKSPACE.

Not a dashboard.

Home screen should feel like opening your desk in the morning.

------------------------------------------------------------------------

# HOME LAYOUT

Top

Good Morning, {User}

Today is your creative day.

Small Search

Edinburgh Clock

Notification

------------------------------------------------------------------------

TODAY

Finish

Need Attention

Upcoming

------------------------------------------------------------------------

Studio Robot Brief

------------------------------------------------------------------------

Recent Projects

------------------------------------------------------------------------

Nothing else.

NO giant statistic cards.

Statistics belong inside Insights.

------------------------------------------------------------------------

# PROJECT PAGE

DELETE current layout.

No giant project cards.

Use compact rows.

Each project is about 72-84px height.

Columns:

Title

Client

Deadline

Income

Progress

Status

Actions

Maximum 12 projects visible without scrolling.

------------------------------------------------------------------------

# INVOICE PAGE

This page should feel like Stripe.

Very clean.

Minimal.

White space.

Simple table.

Thin separators.

Primary button only.

No colorful status pills.

Status:

• Paid

• Pending

• Overdue

Only tiny dots + text.

------------------------------------------------------------------------

# INSIGHTS

Charts only.

Everything else removed.

Charts use ONE color only.

Accent Purple.

Grid opacity under 8%.

------------------------------------------------------------------------

# CALENDAR

Inspired by Notion Calendar.

Simple.

No decorations.

------------------------------------------------------------------------

# STUDIO ROBOT

Docked right panel.

Looks like chat sidebar.

Never floating.

Never glowing.

Always available.

------------------------------------------------------------------------

# EDINBURGH CLOCK

KEEP THIS FEATURE.

Improve only styling.

No green.

No colorful labels.

Example:

13:40 UK

19:40 WIB

Working Hours

Next overlap 09:00 UK

Everything monochrome.

------------------------------------------------------------------------

# COLOR SYSTEM

Background #0F1115

Surface #14161A

Surface Raised #1A1D22

Border rgba(255,255,255,.05)

Primary Text #FAFAFA

Secondary #A1A1AA

Muted #71717A

Accent #8B5CF6

No additional accent colors.

Status colors only:

Green

Orange

Red

Never use blue, cyan, pink, yellow unless required.

------------------------------------------------------------------------

# BUTTONS

Exactly ONE button style.

Primary

Purple

Secondary

Ghost

Danger

Outline

Nothing else.

Delete every orange button.

Delete every inconsistent button.

------------------------------------------------------------------------

# TABLES

One universal table component.

Invoice

Tasks

Projects

Settings

must all use identical spacing.

------------------------------------------------------------------------

# COMPONENT SYSTEM

Refactor entire codebase.

Create reusable:

Button

Input

Textarea

Dropdown

Card

Table

Modal

Badge

Project Row

Stat Item

Notification

Empty State

Delete duplicates.

------------------------------------------------------------------------

# SPACING

Use ONLY:

8

16

24

32

48

Nothing else.

------------------------------------------------------------------------

# TYPOGRAPHY

Geist

Bold headings.

Small metadata.

Information hierarchy is more important than decoration.

------------------------------------------------------------------------

# FINAL QA

Audit every page.

If any page looks different from the rest, refactor it.

If any component has different radius, refactor it.

If any button has another color, refactor it.

If any page resembles an admin template, redesign it.

The finished application must look like a premium desktop operating
system for creative freelancers---not a traditional admin dashboard.
