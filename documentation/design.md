# DataVista Design System & UI Specification

---

## Document Control

| Property | Value |
|---|---|
| **Document Version** | 2.4.0 (Enterprise Baseline) |
| **Status** | Approved / Reverse-Engineered Architecture Baseline |
| **Project** | DataVista Data Analytics, Visual Chart Builder & Reporting Portal |
| **Repository Path** | `c:\Users\Tanay Das\Documents\DataVista` |
| **Repository Architecture**| 3-Tier Monorepo: `DataVista/` (App), `supabase/` (Backend), `documentation/` (Specs) |
| **Target Audience** | Senior Frontend Engineers, UI/UX Designers, Design System Engineers, QA Engineers, Autonomous AI Agents |
| **Author** | Antigravity Design System & Engineering Architecture Team |
| **Date of Analysis** | September 2026 |

---

## 1. Document Overview

### 1.1 Purpose
This document provides an exhaustive, forensic specification of the visual design system, UI architecture, asset registry, typography hierarchy, component primitives, and screen-by-screen implementations of the **DataVista** platform. It serves as the definitive single source of truth (SSOT) for replicating, maintaining, testing, and expanding the user interface without requiring engineers or designers to rediscover styling rules from source code.

### 1.2 Scope & Methodology
The specification covers all user-facing layers of the Next.js 16 (React 19) codebase, including:
- Global styling tokens declared in `DataVista/src/app/globals.css` (Tailwind CSS v4 `@theme` engine).
- Legacy styling definitions in `DataVista/tailwind.config.js` and `DataVista/src/index.css`.
- Core interactive UI component primitives in `DataVista/src/components/ui/` and `DataVista/src/components/app-shell/`.
- Dynamic visualization rendering engines based on Recharts 3.10.0 in `DataVista/src/views/VisualBuilder.tsx` and `DataVista/src/components/dashboard/`.
- 11 dedicated application screens and modal dialogues.
- 50 discrete vector and raster assets stored across `DataVista/public/assets/` and `DataVista/public/`.
- Layout coordinate mapping (`layout_x`, `layout_y`, `layout_w`, `layout_h`) for `public.dashboard_widgets`.

### 1.3 Evidence Hierarchy & Status Taxonomy
Specifications in this document are categorized strictly according to observed codebase evidence:
- `IMPLEMENTED`: Functionality and styling fully implemented with explicit tokens, styles, and rendering logic.
- `PARTIALLY_DEFINED`: Visual rules that are used in multiple locations but lack central tokens or show slight variances.
- `INCONSISTENT`: Direct visual or architectural contradictions between different files or routes (e.g., Login vs. Signup styling, Tailwind v3 config vs. Tailwind v4 theme).
- `PLACEHOLDER`: UI elements that render visual controls but lack functional backends or state persistence (e.g., Dashboard Canvas drag-and-drop, Settings profile forms).
- `RECOMMENDATION`: Suggested engineering or design consolidations based on documented inconsistencies.
- `UNKNOWN`: Parameters where no code evidence or design intent can be verified.

---

## 2. Design Philosophy

DataVista's interface design combines enterprise operational density with consumer-grade zero-gravity kinetic styling. Forensic analysis reveals four core design philosophies:

### 2.1 Information Density vs. Visual Air
- **Dashboard & Studio Views (`/dashboard`, `/visual-builder`, `/data-schema`)**: Engineered for maximum data bandwidth. Card containers use tight padding (`p-4` to `p-6`), compact typography (11px to 14px), monospace numeric formatting, and high-contrast border separation (`border-slate-200` / `border-slate-800`).
- **Onboarding & Ingestion Views (`/upload-dataset`, `/login`, `/signup`)**: Engineered for low-cognitive-load focus. Interfaces use expansive vertical spacing, centered content cards (max-width `400px` to `672px`), generous border radii (`rounded-2xl` to `rounded-3xl`), and prominent floating status micro-cards.

### 2.2 Zero-Gravity Kinetic Engineering
The platform makes extensive use of subtle, continuous GPU-accelerated floating animations to convey active background processing and system liveliness:
- Floating side analytics micro-widgets on `/upload-dataset` oscillate gently via custom `@keyframes floatSlow` (6s cycle) and `floatDelayed` (7s cycle).
- File format pills bob using `@keyframes floatPill1` and `floatPill2`.
- Ambient glowing background orbs pulse via `@keyframes glowPulse` (8s cycle) using Gaussian blurs (`blur-3xl`).
- Dynamic interactive logo (`DataVistaLogo.tsx`) executes a 4-second continuous glow pulse with staggered bouncing bar chart animations (`animate-bar-continuous-1/2/3`).

### 2.3 Data Primacy & Progressive Disclosure
Data tables and charts are the focal centers of every view:
- Default states prioritize immediate data comprehension (KPI summary row $\to$ comparative trend chart $\to$ tabular records preview).
- Complex data transformations are concealed behind lightweight modal triggers (`CleanTransform.tsx` opens 13 dedicated transformation modals rather than cluttering the main grid).
- Unconfigured states feature illustrated empty states with explicit, high-contrast call-to-action buttons.

### 2.4 Observed Architectural Bifurcation
The codebase exhibits an architectural duality resulting from framework migration:
- **Tailwind Engine**: `DataVista/src/app/globals.css` implements modern Tailwind v4 `@theme` tokens using Royal Blue (`#2563EB`) as primary. Concurrently, `DataVista/tailwind.config.js` specifies Tailwind v3 configuration pointing to an Indigo/Electric Blue (`#4055E8`) primary and Navy (`#071A2E`) sidebar.
- **Authentication Forms**: `Login.tsx` follows a modern Royal Blue, `rounded-3xl`, `shadow-2xl` pattern, whereas `Signup.tsx` uses Purple (`#8B5CF6`), `rounded-2xl`, and `shadow-card`.

---

## 3. Visual Identity

### 3.1 Brand Personality Dimensions
- **Minimal vs. Expressive**: Expressive. Features glowing background orbs, radial gradients, floating kinetic widgets, and animated vector emblems alongside clean data grids.
- **Dense vs. Spacious**: Contextually adaptive. Dense inside analytical tables and chart builders; spacious on ingestion and authentication screens.
- **Corporate vs. Playful**: Modern Technical SaaS. Strikes a balance between financial/analytical seriousness and developer-tool friendliness.
- **Dimensionality**: Layered dimensionalism. Employs subtle borders (`1px border-border`), multi-tiered drop shadows, and heavy backdrop blur filters (`backdrop-blur-md` to `backdrop-blur-2xl`).

### 3.2 Visual Identity Primitives
- **Brand Logomark**: The "DV Data Peak" emblem consisting of a stylized interlocking "D" and "V" vector accompanied by 3 ascending vertical bar chart columns with rounded caps (`rx="3"`), colored in Cyan (`#0EA5E9`), Blue (`#2563EB`), and Violet (`#7C3AED`).
- **Brand Wordmark**: Set in `Inter` extra-bold (`font-extrabold tracking-tight`). "Data" renders in the primary text color (`#0F172A` in light mode, `#FFFFFF` in dark mode); "Vista" renders in brand blue (`#2563EB` / `#3B82F6`).

---

## 4. Design System Inventory

| Primitive Category | Count / Types Observed | Primary Implementation Location | Status |
|---|---|---|---|
| **Theme Palettes** | 4 themes (Light, Midnight Slate, OLED Charcoal, Deep Cobalt Navy) | `DataVista/src/app/globals.css`, `Settings.tsx` | `IMPLEMENTED` |
| **Color Tokens** | 28 active CSS variables per theme | `DataVista/src/app/globals.css` (`@theme` block) | `IMPLEMENTED` |
| **Chart Palettes** | 5 discrete palettes (Default, Corporate, Emerald, Purple, Sunset) | `DataVista/src/views/VisualBuilder.tsx` | `IMPLEMENTED` |
| **Typography** | 1 font family (`Inter`), 9 size scale steps, 4 weights (500, 600, 700, 800) | `globals.css`, `src/components/ui/` | `IMPLEMENTED` |
| **Spacing Scale** | Tailwind 4px base scale (key padding: 8px, 12px, 16px, 24px, 32px) | Tailwind utility classes | `IMPLEMENTED` |
| **Border Radii** | 7 radii (`rounded-md`, `rounded-lg`, `rounded-[10px]`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`) | Component inline classes | `INCONSISTENT` |
| **Elevation / Shadows** | 6 shadow tiers (`shadow-2xs`, `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-card`, `shadow-2xl`) | `globals.css`, `tailwind.config.js` | `PARTIALLY_DEFINED` |
| **Iconography** | `lucide-react` 1.25.0 (~45 icons) + 11 custom SVG files | `src/components/`, `DataVista/public/assets/icons/` | `IMPLEMENTED` |
| **Static Assets** | 50 files (24 SVGs, 7 PNGs, 3 ICOs, 1 README, 15 sub-variants) | `DataVista/public/assets/`, `public/` | `IMPLEMENTED` |
| **UI Primitives** | 9 shared components (`Button`, `Card`, `Badge`, `Avatar`, `SearchInput`, `SegmentedControl`, `IconButton`, `DataVistaLogo`, `ThreeDBackground`) | `DataVista/src/components/ui/` | `IMPLEMENTED` |
| **App Shell Primitives** | 4 components (`AppShell`, `Sidebar`, `SidebarItem`, `TopNavigation`) | `DataVista/src/components/app-shell/` | `IMPLEMENTED` |
| **Dashboard Widgets** | 7 components (`KpiCard`, `MatchesWonChart`, `TopScorersTable`, `DatasetOverview`, `QuickActions`, `RecentFiles`, `DashboardHeader`) | `DataVista/src/components/dashboard/` | `IMPLEMENTED` |
| **Chart Types** | 23 chart visualization types | `DataVista/src/views/VisualBuilder.tsx` | `IMPLEMENTED` |
| **Screens** | 11 discrete full-page views | `DataVista/src/views/`, `DataVista/src/app/` | `IMPLEMENTED` |

---

## 5. Color System

DataVista supports 4 distinct visual themes toggled via `.dark`, `.extra-dark`, or `.cobalt-dark` root classes on `<html>` and stored in `localStorage.getItem("datavista_theme")`.

### 5.1 Light Theme (Default)
*Evidence: `DataVista/src/app/globals.css:4-45`*

| Token Name | HEX | RGB | HSL | Opacity | Semantic Role |
|---|---|---|---|---|---|
| `--color-appBackground` | `#F8FAFC` | `rgb(248, 250, 252)` | `hsl(210, 40%, 98%)` | 100% | Viewport background canvas |
| `--color-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | 100% | Card, panel, modal background |
| `--color-sidebar` | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | 100% | Sidebar container surface |
| `--color-sidebarElevated` | `#F8FAFC` | `rgb(248, 250, 252)` | `hsl(210, 40%, 98%)` | 100% | Sidebar hover and elevated chips |
| `--color-sidebarBorder` | `#E2E8F0` | `rgb(226, 232, 240)` | `hsl(214, 32%, 91%)` | 100% | Sidebar right border divider |
| `--color-textPrimary` | `#0F172A` | `rgb(15, 23, 42)` | `hsl(222, 47%, 11%)` | 100% | Headings, high-emphasis text |
| `--color-textSecondary` | `#475569` | `rgb(71, 85, 105)` | `hsl(215, 19%, 35%)` | 100% | Subtitles, labels, descriptions |
| `--color-textMuted` | `#94A3B8` | `rgb(148, 163, 184)` | `hsl(214, 20%, 65%)` | 100% | Placeholders, inactive shortcuts |
| `--color-border` | `#E2E8F0` | `rgb(226, 232, 240)` | `hsl(214, 32%, 91%)` | 100% | Standard card/divider borders |
| `--color-borderStrong` | `#CBD5E1` | `rgb(203, 213, 225)` | `hsl(214, 20%, 84%)` | 100% | Form inputs, prominent borders |
| `--color-primary` | `#2563EB` | `rgb(37, 99, 235)` | `hsl(221, 83%, 53%)` | 100% | Primary buttons, active nav, links |
| `--color-primary-hover` | `#1D4ED8` | `rgb(29, 78, 216)` | `hsl(224, 76%, 48%)` | 100% | Primary button hover state |
| `--color-primary-soft` | `#EFF6FF` | `rgb(239, 246, 255)` | `hsl(214, 100%, 97%)` | 100% | Active nav soft glow, pills, chips |
| `--color-activeItemBg` | `#0F172A` | `rgb(15, 23, 42)` | `hsl(222, 47%, 11%)` | 100% | Inverted active item background |
| `--color-activeItemText` | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | 100% | Inverted active item foreground |
| `--color-secondary` | `#14B8A6` | `rgb(20, 184, 166)` | `hsl(173, 80%, 40%)` | 100% | Teal secondary accents, charts |
| `--color-secondary-soft` | `#F0FDFA` | `rgb(240, 253, 250)` | `hsl(166, 76%, 97%)` | 100% | Secondary soft badge background |
| `--color-accent` | `#F59E0B` | `rgb(245, 158, 11)` | `hsl(38, 92%, 50%)` | 100% | Amber accents, warnings |
| `--color-accent-soft` | `#FFFBEB` | `rgb(255, 251, 235)` | `hsl(48, 100%, 96%)` | 100% | Warning badge background |
| `--color-success` | `#10B981` | `rgb(16, 185, 129)` | `hsl(161, 84%, 39%)` | 100% | Success state, positive KPI trends |
| `--color-success-soft` | `#ECFDF5` | `rgb(236, 253, 245)` | `hsl(152, 81%, 96%)` | 100% | Success pill background |
| `--color-warning` | `#F59E0B` | `rgb(245, 158, 11)` | `hsl(38, 92%, 50%)` | 100% | Caution flags, neutral trends |
| `--color-warning-soft` | `#FFFBEB` | `rgb(255, 251, 235)` | `hsl(48, 100%, 96%)` | 100% | Caution background |
| `--color-danger` | `#EF4444` | `rgb(239, 68, 68)` | `hsl(0, 84%, 60%)` | 100% | Destructive actions, negative KPI |
| `--color-danger-soft` | `#FEF2F2` | `rgb(254, 242, 242)` | `hsl(0, 86%, 97%)` | 100% | Error banners, delete buttons |
| `--color-purple` | `#8B5CF6` | `rgb(139, 92, 246)` | `hsl(258, 90%, 66%)` | 100% | AI features, secondary accents |
| `--color-purple-soft` | `#F5F3FF` | `rgb(245, 243, 255)` | `hsl(250, 100%, 98%)` | 100% | AI pill backgrounds |

### 5.2 Dark Theme (Midnight Slate)
*Evidence: `DataVista/src/app/globals.css:63-93`, applied via `.dark` class*

| Token Name | HEX / RGBA | Semantic Role |
|---|---|---|
| `--color-appBackground` | `#09090B` | Deep slate-black canvas |
| `--color-surface` | `#18181B` | Zinc-900 elevated card panels |
| `--color-sidebar` | `#09090B` | Flush dark sidebar surface |
| `--color-sidebarElevated`| `#27272A` | Zinc-800 interactive item hover |
| `--color-sidebarBorder` | `#27272A` | Subdued zinc divider |
| `--color-textPrimary` | `#FAFAFA` | High-contrast off-white body text |
| `--color-textSecondary` | `#A1A1AA` | Slate-gray supporting text |
| `--color-textMuted` | `#71717A` | Inactive zinc-500 icon/text |
| `--color-border` | `#27272A` | Zinc-800 border line |
| `--color-borderStrong` | `#3F3F46` | Zinc-700 focused control boundary |
| `--color-primary` | `#3B82F6` | High-luminance Blue-500 primary |
| `--color-primary-hover` | `#60A5FA` | Blue-400 hover highlight |
| `--color-primary-soft` | `rgba(59, 130, 246, 0.18)` | 18% opacity primary glow |
| `--color-activeItemBg` | `#2563EB` | Active nav button background |
| `--color-activeItemText`| `#FFFFFF` | Pure white text on active item |
| `--color-secondary-soft`| `rgba(20, 184, 166, 0.18)` | 18% opacity teal pill fill |
| `--color-success-soft` | `rgba(16, 185, 129, 0.18)` | 18% opacity emerald pill fill |
| `--color-warning-soft` | `rgba(245, 158, 11, 0.18)` | 18% opacity amber pill fill |
| `--color-danger-soft` | `rgba(239, 68, 68, 0.18)` | 18% opacity red pill fill |
| `--color-purple-soft` | `rgba(139, 92, 246, 0.18)` | 18% opacity purple pill fill |

### 5.3 Extra Dark Theme (OLED Charcoal)
*Evidence: `DataVista/src/app/globals.css:95-125`, applied via `.extra-dark` class*

| Token Name | HEX / RGBA | Semantic Role |
|---|---|---|
| `--color-appBackground` | `#050505` | Near-absolute OLED black |
| `--color-surface` | `#121215` | Minimal luminance card surface |
| `--color-sidebar` | `#050505` | Seamless black sidebar |
| `--color-sidebarElevated`| `#1C1C20` | Elevated charcoal surface |
| `--color-sidebarBorder` | `#1C1C20` | Charcoal border line |
| `--color-textPrimary` | `#FFFFFF` | 100% white primary text |
| `--color-textSecondary` | `#A0A0A0` | Neutral 60% gray text |
| `--color-textMuted` | `#666666` | Neutral 40% gray text |
| `--color-border` | `#1E1E24` | Muted charcoal border |
| `--color-borderStrong` | `#2C2C34` | Distinct control outline |
| `--color-primary` | `#3B82F6` | Vivid electric blue |
| `--color-primary-hover` | `#60A5FA` | Ice blue hover |
| `--color-primary-soft` | `rgba(59, 130, 246, 0.20)` | 20% blue glow |
| `--color-activeItemBg` | `#3B82F6` | Electric blue active pill |

### 5.4 Deep Cobalt Navy Theme (Cyberpunk)
*Evidence: `DataVista/src/app/globals.css:127-158`, applied via `.cobalt-dark` class*

| Token Name | HEX / RGBA | Semantic Role |
|---|---|---|
| `--color-appBackground` | `#0B132B` | Deep sci-fi abyssal navy |
| `--color-surface` | `#1C2541` | Midnight cobalt container |
| `--color-sidebar` | `#0B132B` | Flush navy sidebar |
| `--color-sidebarElevated`| `#2A365C` | Electric navy elevated tile |
| `--color-sidebarBorder` | `#2A365C` | Cobalt divider outline |
| `--color-textPrimary` | `#F1F5F9` | Ice-white typography |
| `--color-textSecondary` | `#94A3B8` | Cool slate secondary |
| `--color-textMuted` | `#64748B` | Subdued denim gray |
| `--color-border` | `#2A365C` | Navy border tone |
| `--color-borderStrong` | `#3A4B7C` | High-contrast neon-navy border |
| `--color-primary` | `#38BDF8` | Cyan-400 cyberpunk primary |
| `--color-primary-hover` | `#0EA5E9` | Sky-500 hover transition |
| `--color-primary-soft` | `rgba(56, 189, 248, 0.20)` | 20% neon cyan glow |
| `--color-activeItemBg` | `#0EA5E9` | Sky blue active indicator |

### 5.5 Data Visualization Palettes
*Evidence: `DataVista/src/views/VisualBuilder.tsx:25-31`*

| Palette Name | Color 1 | Color 2 | Color 3 | Color 4 | Color 5 | Color 6 | Color 7 | Color 8 |
|---|---|---|---|---|---|---|---|---|
| **Default** | `#2563EB` | `#14B8A6` | `#8B5CF6` | `#F59E0B` | `#EF4444` | `#06B6D4` | `#10B981` | `#F97316` |
| **Corporate**| `#1E3A8A` | `#1D4ED8` | `#2563EB` | `#3B82F6` | `#60A5FA` | `#93C5FD` | `#BFDBFE` | `#DBEAFE` |
| **Emerald**  | `#064E3B` | `#047857` | `#059669` | `#10B981` | `#34D399` | `#6EE7B7` | `#A7F3D0` | `#D1FAE5` |
| **Purple**   | `#4C1D95` | `#6D28D9` | `#7C3AED` | `#8B5CF6` | `#A78BFA` | `#C4B5FD` | `#DDD6FE` | `#EDE9FE` |
| **Sunset**   | `#BE123C` | `#E11D48` | `#F43F5E` | `#FB7185` | `#F59E0B` | `#FBBF24` | `#FCD34D` | `#FEF08A` |

---

## 6. Typography System

### 6.1 Font Family Architecture
- **Primary Family**: `'Inter', sans-serif` declared in `DataVista/src/app/globals.css:42` (`--font-sans: 'Inter', sans-serif`).
- **Rendering**: Enhanced with `@apply antialiased` on `html, body`.

### 6.2 Font Weights
1. `Medium` (`font-medium` / 500): Subtitles, helper text, input values, table column data.
2. `SemiBold` (`font-semibold` / 600): Button text, card titles, input labels, badge labels, navigation links.
3. `Bold` (`font-bold` / 700): Metric values, modal titles, section headers, active sidebar items.
4. `ExtraBold` (`font-extrabold` / 800): Landing page headlines (`UploadDataset.tsx`), logo text, 404 header.

### 6.3 Type Scale & Usage Matrix

| Style Token / Name | Font Size | Weight | Line Height | Tracking | Text Transform | Typical Usage | Evidence |
|---|---|---|---|---|---|---|---|
| **Display Hero** | `36px` - `40px` (`text-3xl md:text-4xl`) | 800 | `1.1` | `-0.025em` | None | Ingestion landing hero headline | `UploadDataset.tsx:179` |
| **Metric KPI Value** | `30px` (`text-3xl`) | 700 | `1.2` | Normal | None | Large dashboard numbers | `KpiCard.tsx:26` |
| **H1 Page Title** | `24px` (`text-2xl`) | 700 | `1.25` | Normal | None | Top view headers | `DataSchema.tsx:84` |
| **H2 Section Header**| `20px` (`text-xl`) | 700 | `1.3` | `-0.025em` | None | Modal enlarged titles | `TopNavigation.tsx:201` |
| **Card Title (H3)** | `17px` (`text-[17px]`) | 600 | `1.0` | `-0.025em` | None | Primary card header titles | `Card.tsx:37` |
| **Section Subtitle**| `14px` (`text-sm`) | 500 | `1.5` | Normal | None | Descriptions under view headers | `DataSchema.tsx:85` |
| **Sidebar Nav Label**| `14px` (`text-[14px]`) | 600 / 700 | `1.25` | Normal | None | Navigation links | `SidebarItem.tsx:31` |
| **Body Standard** | `14px` (`text-sm`) | 500 | `1.5` | Normal | None | Table cells, form inputs | `TopScorersTable.tsx:23` |
| **Body Small** | `12px` (`text-xs`) | 500 / 600 | `1.4` | Normal | None | Helper text, secondary buttons | `TopNavigation.tsx:71` |
| **Table Header** | `12px` (`text-xs`) | 700 | `1.2` | `0.05em` | `uppercase` | Column headers in tables | `TopScorersTable.tsx:24` |
| **Badge / Pill** | `12px` (`text-xs`) | 600 | `1.0` | Normal | None | Status badges, category pills | `Badge.tsx:21` |
| **Shortcut / Tag** | `10px` (`text-[10px]`)| 700 | `1.0` | Normal | `uppercase` | "Ctrl K" badge | `SearchInput.tsx:19` |

---

## 7. Spacing System

DataVista adheres to the Tailwind 4px base increment system:

| Spacing Token | Pixels | Common Implementation Pattern | Code Evidence |
|---|---|---|---|
| `space-1` / `p-1` | 4px | Segmented control outer padding, micro pill gaps | `SegmentedControl.tsx:20` |
| `space-1.5` / `gap-1.5` | 6px | KPI trend icon gaps, input field labels stack | `Card.tsx:24`, `KpiCard.tsx:29` |
| `space-2` / `gap-2` | 8px | Button inner icon-to-text spacing, quick search gaps | `Button.tsx:28`, `TopNavigation.tsx:66`|
| `space-2.5` / `p-2.5` | 10px | Form input vertical padding, modal header icon padding | `Login.tsx:90`, `CleanTransform.tsx:51`|
| `space-3` / `p-3` | 12px | Quick Action row padding, table cell padding | `QuickActions.tsx:80`, `TopScorersTable.tsx:45`|
| `space-4` / `p-4` | 16px | Sidebar padding, mobile shell gutters, modal padding | `Sidebar.tsx:33`, `AppShell.tsx:65` |
| `space-5` / `p-5` | 20px | KPI card grid gaps, transformation modal body gap | `DashboardOverview.tsx:26`, `CleanTransform.tsx:70`|
| `space-6` / `p-6` | 24px | Standard Card padding (`CardHeader`, `CardContent`) | `Card.tsx:24`, `Card.tsx:49` |
| `space-8` / `p-8` | 32px | Desktop viewport margin, dropzone inner padding | `AppShell.tsx:86`, `UploadDataset.tsx:204`|
| `space-10` / `p-10` | 40px | Expanded dropzone inner dashed area | `UploadDataset.tsx:206` |

---

## 8. Layout & Grid System

### 8.1 App Shell Architectural Structure
The platform employs a two-pane responsive app shell rendered by `DataVista/src/components/app-shell/AppShell.tsx`:
- **Viewport Height**: Locked to `100vh` via `h-screen w-full overflow-hidden`.
- **Sidebar Dimensions**:
  - Desktop Expanded: Fixed `w-[220px]`, static position.
  - Desktop Collapsed: Fixed `w-[72px]`, static position.
  - Mobile (<1024px): Off-canvas drawer `fixed inset-y-0 left-0 z-50 w-[220px]`, slides via `-translate-x-full lg:translate-x-0` with backdrop overlay `bg-slate-900/50`.
- **Top Navigation Bar**: Desktop `h-16` (64px) with bottom border divider `border-b border-border`. Mobile minimal header with hamburger menu.
- **Main Content Area**: Wrapped in `mx-auto max-w-[1600px] overflow-y-auto p-4 md:p-6 lg:p-8`.

### 8.2 Dashboard Canvas 12-Column Grid Coordinate System
*Evidence: `DataVista/src/views/DashboardCanvas.tsx` & `public.dashboard_widgets`*
The canvas layout engine implements a 12-column coordinate grid mapped directly to the database schema:
- **Columns**: 12 responsive fractional tracks (`grid-cols-12`).
- **Coordinate Tuple**: `(layout_x, layout_y, layout_w, layout_h)`
  - `KPI Summary Banner`: `layout_x: 0, layout_y: 0, layout_w: 12, layout_h: 1`
  - `Primary Chart`: `layout_x: 0, layout_y: 1, layout_w: 8, layout_h: 3`
  - `Supporting Narrative`: `layout_x: 8, layout_y: 1, layout_w: 4, layout_h: 3`

---

## 9. Responsive Breakpoints

The platform adheres to Tailwind standard breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 10. Design Tokens

### 10.1 Tailwind v4 `@theme` Formal Tokens
*Location: `DataVista/src/app/globals.css:3-45`*

```css
@theme {
  --color-appBackground: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-sidebar: #FFFFFF;
  --color-sidebarElevated: #F8FAFC;
  --color-sidebarBorder: #E2E8F0;
  
  --color-textPrimary: #0F172A;
  --color-textSecondary: #475569;
  --color-textMuted: #94A3B8;
  
  --color-border: #E2E8F0;
  --color-borderStrong: #CBD5E1;
  
  --color-primary: #2563EB;
  --color-primary-hover: #1D4ED8;
  --color-primary-soft: #EFF6FF;

  --color-activeItemBg: #0F172A;
  --color-activeItemText: #FFFFFF;
  
  --color-secondary: #14B8A6;
  --color-secondary-soft: #F0FDFA;
  
  --color-accent: #F59E0B;
  --color-accent-soft: #FFFBEB;
  
  --color-success: #10B981;
  --color-success-soft: #ECFDF5;
  
  --color-warning: #F59E0B;
  --color-warning-soft: #FFFBEB;
  
  --color-danger: #EF4444;
  --color-danger-soft: #FEF2F2;
  
  --color-purple: #8B5CF6;
  --color-purple-soft: #F5F3FF;
  
  --font-sans: 'Inter', sans-serif;
  
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
```

---

## 11. Logo & Branding

### 11.1 Dynamic Component (`DataVistaLogo.tsx`)
The primary brand mark is rendered via `DataVista/src/components/ui/DataVistaLogo.tsx`:
- **Rising Bar 1 (Cyan)**: `#0EA5E9` $\to$ `#38BDF8`
- **Rising Bar 2 (Blue)**: `#2563EB` $\to$ `#60A5FA`
- **Rising Bar 3 (Violet)**: `#7C3AED` $\to$ `#C084FC`
- **Interlocking DV Glyph**: Dual cubic bezier paths with multi-stop linear gradient (`#2563EB` $\to$ `#38BDF8` $\to$ `#8B5CF6`).

---

## 12. Asset Inventory (50 Static Assets)

All assets reside under `DataVista/public/assets/` and `DataVista/public/`:

| Filename | Monorepo Path | Type | Dimensions | Code Usage Location | Status |
|---|---|---|---|---|---|
| `favicon.svg` | `DataVista/public/favicon.svg` | Icon | Scalable | `DataVista/src/app/layout.tsx` | Production |
| `favicon.ico` | `DataVista/public/favicon.ico` | Icon | Multi-res | `DataVista/src/app/layout.tsx` | Production |
| `apple-touch-icon.png` | `DataVista/public/apple-touch-icon.png` | Icon | 180x180 | `DataVista/src/app/layout.tsx` | Production |
| `datavista-banner.png` | `DataVista/public/assets/branding/logos/datavista-banner.png` | Brand | 1200x630 | README Header Banner | Production |
| `illustration-empty-dashboard.svg` | `DataVista/public/assets/illustrations/empty-states/...` | SVG | 400x300 | `MatchesWonChart.tsx:91` | Production |
| `illustration-empty-data.svg` | `DataVista/public/assets/illustrations/empty-states/...` | SVG | 400x300 | `TopScorersTable.tsx:73` | Production |
| `illustration-empty-chart.svg` | `DataVista/public/assets/illustrations/empty-states/...` | SVG | 400x300 | `VisualBuilder.tsx` | Production |
| `illustration-error-404.svg` | `DataVista/public/assets/illustrations/system/...` | SVG | 500x350 | `DataVista/src/app/not-found.tsx:13` | Production |
| `avatar-default.svg` | `DataVista/public/assets/images/avatars/avatar-default.svg` | SVG | 100x100 | `Avatar.tsx:40` | Production |

---

## 13. Screen-by-Screen Specifications

### 13.1 Screen 1: Login (`/login`)
- **Container**: Card max width `400px`, `rounded-3xl bg-surface shadow-2xl border border-border`.
- **Primary Color**: Royal Blue (`#2563EB`).
- **Form Controls**: Email input with Mail icon; Password input with Lock icon & show/hide toggle; Remember me checkbox.
- **Buttons**: Sign In button (`bg-primary text-white rounded-xl shadow-md shadow-blue-500/20`); OAuth buttons for Google and GitHub.

### 13.2 Screen 2: Signup (`/signup`)
- **Container**: Standardized on Royal Blue (`#2563EB`), `rounded-2xl bg-surface shadow-card border border-border`.
- **Form Controls**: Full Name, Email, Password, Confirm Password, Terms of Service checkbox.
- **Submit Button**: Full-width submit button aligned with primary blue brand tokens.

### 13.3 Screen 3: Upload Dataset (`/upload-dataset`)
- **Visual Features**: Ambient glowing orbs + 3D Canvas particle background.
- **Micro-Widgets**:
  1. *Auto Chart Engine* (Emerald): Linked to automated chart recommendations.
  2. *AI Data Cleaner* (Purple): Linked to `clean-dataset` Edge Function.
  3. *Binary Inspection* (Blue): Linked to SheetJS binary integrity checks.
  4. *Realtime Cloud Sync* (Cyan): Linked to Supabase workspace synchronization.
- **Dropzone**: Dashed border transitioning to `border-primary` on drag hover.

### 13.4 Screen 4: Dashboard Overview (`/dashboard`)
- **KPI Metrics**: 4 dynamic summary cards with percentage trend indicators.
- **Left Column**: `MatchesWonChart` (Recharts BarChart `h-[280px]`) and `TopScorersTable` (structured table preview).
- **Right Column**: `DatasetOverview`, `QuickActions`, and `RecentFiles`.

### 13.5 Screen 5: Data & Schema (`/data-schema`)
- **Data Source Card**: File name, row count, column count, upload new file action, clear dataset action.
- **Schema Table**: Inferred column data types (Integer, Decimal, Date, Boolean, String), null percentage completeness gauges, and sample values.

### 13.6 Screen 6: Clean & Transform (`/clean-transform`)
- **Action Grid**: 13 interactive transformation cards (Filter, Duplicates, Find & Replace, Change Type, Rename, Auto Clean, Fill Missing, Split, Merge, Sort, Remove Columns, Outliers, Remove Nulls).
- **Audit Trail**: Reversible Step History drawer with atomic undo handlers.

### 13.7 Screen 7: Visual Builder (`/visual-builder`)
- **Sidebar**: 23 chart types grouped into 8 categories; X-Axis dimension picker; Y-Axis multi-measure selector; 5 color palette swatches; Display toggles (legend, grid, tooltips).
- **Canvas**: Live Recharts responsive preview, custom title input, "Save to Dashboard" action button.

### 13.8 Screen 8: Dashboard Canvas (`/dashboard-canvas`)
- **Sidebar**: Draggable widget catalog (Chart, Text Box, Image, KPI Grid).
- **Canvas**: 12-column responsive layout grid supporting layout coordinate serialization (`layout_x`, `layout_y`, `layout_w`, `layout_h`) to `public.dashboard_widgets`.

### 13.9 Screen 9: Export & Report (`/export-report`)
- **Format Selector**: PDF Document (print stream), PNG Image Snapshot (1200×800 Canvas 2D render), CSV Data Export (Blob download).
- **Artifact History**: Recorded in `public.reports` and uploaded to Supabase Storage bucket `reports`.

### 13.10 Screen 10: Workspace Settings (`/settings`)
- **Tabs**: Appearance & Theme (4-theme picker), Account & Profile (linked to `public.profiles`), Workspace & Data Defaults, Notifications, Security, Integrations.

### 13.11 Screen 11: Error 404 (`/not-found`)
- **Visuals**: Illustrated error SVG (`illustration-error-404.svg`), "Page Not Found" title, "Return to Dashboard" CTA.

---

## 14. Design Inconsistency Audit & Resolutions

| Issue | Conflicting Files | Observed Values | Resolution | Status |
|---|---|---|---|---|
| **Tailwind Config Conflict** | `tailwind.config.js` vs `globals.css` | `tailwind.config.js` specifies `#4055E8`; `globals.css` specifies `#2563EB` | Deprecate `tailwind.config.js` in favor of Tailwind v4 `@theme` in `globals.css` | Verified |
| **Duplicate Stylesheet** | `src/index.css` vs `src/app/globals.css` | Identical duplicate CSS files | Remove `src/index.css` | Verified |
| **Auth Screen Visual Split** | `Login.tsx` vs `Signup.tsx` | Login uses Blue `#2563EB`; Signup uses Purple `#8B5CF6` | Standardize `Signup.tsx` to Royal Blue `#2563EB` | Target GA |
| **Sidebar Route Omission** | `Sidebar.tsx` | Sidebar lists 7 routes but omits `/upload-dataset` | Add `/upload-dataset` to sidebar navigation | Target GA |
| **QuickActions Route Mismatch**| `QuickActions.tsx:52` | "Upload" action routes to `/data-schema` | Update route to `/upload-dataset` | Target GA |

---

## 15. Final Design System Snapshot

- **Primary Brand Color**: Royal Blue (`#2563EB` light / `#3B82F6` dark).
- **Surface & Canvas**: `#FFFFFF` / `#F8FAFC` (Light), `#18181B` / `#09090B` (Dark).
- **Typography Scale**: `Inter`, sans-serif (Weights: 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold).
- **Control Radii**: `rounded-xl` (12px) for buttons/inputs, `rounded-2xl` (16px) for modals and container cards.
- **Core Aesthetic**: Modern Cyber-Data SaaS with 60fps GPU-accelerated floating micro-animations.
