# Ralypto Textile Design & Motion Pattern

This document establishes the universal design tokens and motion recipe extracted from `DashboardV16.tsx`, `ClosetShowcase.tsx`, and `motion.tsx`. All frontend screens must adhere strictly to these standards.

---

## 1. Design Tokens

### 1.1 Surfaces & Geometry
- **Page Background**: `#f3f4f6` (slate-100 / cool neutral)
- **Cards**: `bg-white`, `rounded-2xl`, `p-5`, very soft shadow `shadow-[0_1px_2px_rgba(16,24,40,0.04)]` (or `shadow-sm`), subtle border `border border-slate-100` or no heavy border.
- **Hero Card**: Gradient `bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20` with a lime decorative pill (`bg-lime-300/80` or `#c6f432`) used at most once per screen.

### 1.2 Brand & Accents
- **Primary Brand**: `#2f5bff` / `blue-600` (interactive accents, primary action buttons, active indicator pills)
- **Dark Pill / Active Fill**: `slate-900` (`#0f172a` / `#111827`) for navigation and segmented thumb selectors
- **Accent Highlight**: Lime `#c6f432` / `lime-300` (used selectively for hero badge or highest-volume channel)

### 1.3 Semantic Status Colors (Fixed System)
- **Green (Done / In Stock / Positive)**: `bg-emerald-100 text-emerald-800 border-emerald-200`, fill: `#22c55e` / `#10b981`
- **Yellow (Waiting / Low Stock / Warning)**: `bg-yellow-100 text-yellow-800 border-yellow-200`, fill: `#f59e0b` / `#eab308`
- **Red (Problem / Out of Stock / Overdue)**: `bg-red-100 text-red-700 border-red-200`, fill: `#ef4444` / `#dc2626`
- **Blue (Info / Primary Indicator)**: `bg-blue-100 text-blue-700 border-blue-200`, fill: `#2f5bff` / `#3b82f6`

### 1.4 Typography & Hierarchy
- **Font Family**: Unified sans-serif (`Inter`, `Plus Jakarta Sans`, system sans)
- **Numbers**: Bold or black (`font-bold`, `font-extrabold`, `font-black`, `tabular-nums`)
- **Labels**: Grey (`text-slate-500`, `text-slate-400`, `text-xs` or `text-sm`)
- **Casing & Language**: Sentence case for sentences and instructions; simple, clear wording. Currency is always shown as **"Rs"**.
- **Role Font Minimums**:
  - Owner / Manager screens: minimum `14px` (`text-sm`).
  - Counter, Storekeeper, Supervisor screens: minimum `16px` (`text-base`), minimum button height `48px` (`min-h-12`).

---

## 2. Motion Recipe

All motion code is centralized in `src/lib/motion.tsx`. No ad-hoc animation definitions.

1. **Screen Enter**: `<PageTransition routeKey={currentTab}>` (quick fade & 8px vertical lift, 180 ms).
2. **Container Stagger**: Main content container uses `variants={stagger}` (stagger children by `0.06s` / `0.07s`) with children using `variants={fadeUp}` on initial load.
3. **Numbers (Count-Up)**: Animated from 0 to target value on load (300 ms on counter/cart total, up to 1200 ms on analytics).
4. **Bars & Progress**: Width grows from 0 to target percentage via `whileInView` or on mount with `easeOut` (0.6s – 0.9s), once.
5. **Charts**: Animate once on mount (`animationDuration={1200}` or `1400}`). Soft horizontal grid lines, no vertical grid lines, dark tooltip (`bg-slate-900 text-white rounded-xl`), smooth gradient area fills.
6. **Tabs & Segmented Filters**: Pill thumb with `layoutId` using spring physics (`stiffness: 420, damping: 34`). Tab panel swaps with `AnimatePresence mode="wait"`.
7. **Lists**: Wrap lists in `<AnimatedList>` and list items in `<AnimatedRow>`. Items slide in on add, collapse on remove. Filtered card grids use `layout` transition.
8. **Interactive Cards**: `whileHover={{ y: -4 }}` applied **only** to tappable/actionable cards.
9. **Buttons**: `<PressButton>` with `whileTap={{ scale: 0.97 }}` and `whileHover={{ y: -1 }}` (min-h-12 / 48px).
10. **Details & Drawers**: Quick side details open in `<Drawer>` with swipe/drag dismissal. Modals use `<Modal>` with escape key listener and backdrop fade.
11. **Status Chips & Success**: Status chips animate with `layout` + `AnimatePresence`. Payment/action success draws an SVG checkmark with `pathLength: 0 -> 1` followed by a toast via `useToastStore`.
12. **Loading & Empty States**: Matching layout `<Skeleton>` with gentle opacity loop. Empty state shows friendly explanation and a prominent action button.
13. **Showcase / Carousel**: `<ClosetShowcase>` carousel with 3D Y-axis flip (`rotateY`), hanger swing, and tag sway physics.

---

## 3. Shared Component System (`src/components/ui-pattern/`)

All screens reuse these core building blocks:
- `StatCard`: Standard or Hero variant with count-up number, semantic change indicator, and icon badge.
- `CardHeader`: Circular icon badge + title + grey subtitle + optional right-side control.
- `SectionCard`: Standard card container (`bg-white rounded-2xl p-5 shadow-sm border border-slate-100`).
- `PillTabs`: LayoutId animated sliding pill switcher.
- `ListRow`: Avatar/badge + title + value + progress bar.
- `ProgressBar`: Animated width progress bar.
- `EmptyState`: Centered icon + title + subtitle + call-to-action button.
- `PageHeader`: Title + icon + subtitle + filter/action toolbar.
