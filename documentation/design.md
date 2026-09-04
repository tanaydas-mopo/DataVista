# Datavista Design System & UI Specification

---

## Document Control

| Property | Value |
|---|---|
| **Document Version** | 1.0.0 |
| **Status** | Approved / Reverse-Engineered Baseline |
| **Project** | DataVista Data Analytics & Visualization Platform |
| **Repository Path** | `c:\Users\anilc\Documents\DataVista` |
| **Target Audience** | Senior Frontend Engineers, UI/UX Designers, Design System Engineers, QA Engineers, Autonomous AI Agents |
| **Author** | Antigravity Design System Agent |
| **Date of Analysis** | September 2026 |

---

## 1. Document Overview

### 1.1 Purpose
This document provides an exhaustive, forensic reverse-engineering of the visual design system, UI architecture, asset registry, typography hierarchy, component primitives, and screen-by-screen implementations of the **DataVista** platform. It serves as the definitive single source of truth (SSOT) for replicating, maintaining, testing, and expanding the user interface without requiring engineers or designers to rediscover styling rules from source code.

### 1.2 Scope & Methodology
The specification covers all user-facing layers of the Next.js 16 (React 19) codebase, including:
- Global styling tokens declared in `src/app/globals.css` (Tailwind CSS v4 `@theme` engine).
- Legacy styling definitions preserved in `tailwind.config.js` and `src/index.css`.
- Core interactive UI component primitives in `src/components/ui/` and `src/components/app-shell/`.
- Dynamic visualization rendering engines based on Recharts 3.10.0 in `src/views/VisualBuilder.tsx` and `src/components/dashboard/`.
- 11 dedicated application screens and modal dialogues.
- 50 discrete vector and raster assets stored across `public/assets/` and `public/`.

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
The codebase exhibits an architectural duality resulting from migration:
- **Tailwind Engine**: `src/app/globals.css` implements modern Tailwind v4 `@theme` tokens using Royal Blue (`#2563EB`) as primary. Concurrently, `tailwind.config.js` specifies Tailwind v3 configuration pointing to an Indigo/Electric Blue (`#4055E8`) primary and Navy (`#071A2E`) sidebar.
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
| **Theme Palettes** | 4 themes (Light, Midnight Slate, OLED Charcoal, Deep Cobalt Navy) | `src/app/globals.css`, `src/views/Settings.tsx` | `IMPLEMENTED` |
| **Color Tokens** | 28 active CSS variables per theme | `src/app/globals.css` (`@theme` block) | `IMPLEMENTED` |
| **Chart Palettes** | 5 discrete palettes (Default, Corporate, Emerald, Purple, Sunset) | `src/views/VisualBuilder.tsx` | `IMPLEMENTED` |
| **Typography** | 1 font family (`Inter`), 9 size scale steps, 4 weights (500, 600, 700, 800) | `src/app/globals.css`, `src/components/ui/` | `IMPLEMENTED` |
| **Spacing Scale** | Tailwind 4px base scale (key padding: 8px, 12px, 16px, 24px, 32px) | Tailwind utility classes | `IMPLEMENTED` |
| **Border Radii** | 7 radii (`rounded-md`, `rounded-lg`, `rounded-[10px]`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`) | Component inline classes | `INCONSISTENT` |
| **Elevation / Shadows** | 6 shadow tiers (`shadow-2xs`, `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-card`, `shadow-2xl`) | `globals.css`, `tailwind.config.js` | `PARTIALLY_DEFINED` |
| **Iconography** | `lucide-react` 1.25.0 (~45 icons) + 11 custom SVG files | `src/components/`, `public/assets/icons/` | `IMPLEMENTED` |
| **Static Assets** | 50 files (24 SVGs, 7 PNGs, 3 ICOs, 1 README, 15 sub-variants) | `public/assets/`, `public/` | `IMPLEMENTED` |
| **UI Primitives** | 9 shared components (`Button`, `Card`, `Badge`, `Avatar`, `SearchInput`, `SegmentedControl`, `IconButton`, `DataVistaLogo`, `ThreeDBackground`) | `src/components/ui/` | `IMPLEMENTED` |
| **App Shell Primitives** | 4 components (`AppShell`, `Sidebar`, `SidebarItem`, `TopNavigation`) | `src/components/app-shell/` | `IMPLEMENTED` |
| **Dashboard Widgets** | 7 components (`KpiCard`, `MatchesWonChart`, `TopScorersTable`, `DatasetOverview`, `QuickActions`, `RecentFiles`, `DashboardHeader`) | `src/components/dashboard/` | `IMPLEMENTED` |
| **Chart Types** | 23 chart visualization types | `src/views/VisualBuilder.tsx` | `IMPLEMENTED` |
| **Screens** | 11 discrete full-page views | `src/views/`, `src/app/` | `IMPLEMENTED` |

---

## 5. Color System

DataVista supports 4 distinct visual themes toggled via `.dark`, `.extra-dark`, or `.cobalt-dark` root classes on `<html>` and stored in `localStorage.getItem("datavista_theme")`.

### 5.1 Light Theme (Default)
*Evidence: `src/app/globals.css:4-45`*

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
| `--color-purple` | `#8B5CF6` | `rgb(139, 92, 246)` | `hsl(258, 90%, 66%)` | 100% | AI features, Signup form primary |
| `--color-purple-soft` | `#F5F3FF` | `rgb(245, 243, 255)` | `hsl(250, 100%, 98%)` | 100% | AI pill backgrounds |

### 5.2 Dark Theme (Midnight Slate)
*Evidence: `src/app/globals.css:63-93`, applied via `.dark` class*

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
*Evidence: `src/app/globals.css:95-125`, applied via `.extra-dark` class*

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
*Evidence: `src/app/globals.css:127-158`, applied via `.cobalt-dark` class*

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
*Evidence: `src/views/VisualBuilder.tsx:25-31`*

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
- **Primary Family**: `'Inter', sans-serif` declared in `globals.css:42` (`--font-sans: 'Inter', sans-serif`) and `tailwind.config.js:47`.
- **Source**: System font stack / web font import. No local `.woff2` or `.ttf` binary files are bundled in the repository.
- **Rendering**: Enhanced with `@apply antialiased` on `html, body`.

### 6.2 Font Weights
Only four font weights are actively utilized across the application:
1. `Medium` (`font-medium` / 500): Subtitles, helper text, input values, table column data.
2. `SemiBold` (`font-semibold` / 600): Button text, card titles, input labels, badge labels, navigation links.
3. `Bold` (`font-bold` / 700): Metric values, modal titles, section headers, active sidebar items.
4. `ExtraBold` (`font-extrabold` / 800): Landing page headlines (`UploadDataset.tsx`), logo text, 404 header.

### 6.3 Type Scale & Usage Matrix

| Style Token / Name | Font Size | Weight | Line Height | Tracking | Text Transform | Typical Usage | Evidence |
|---|---|---|---|---|---|---|---|
| **Display Hero** | `36px` - `40px` (`text-3xl md:text-4xl`) | 800 | `1.1` | `-0.025em` (`tracking-tight`) | None | Ingestion landing hero headline | `UploadDataset.tsx:179` |
| **Metric KPI Value** | `30px` (`text-3xl`) | 700 | `1.2` | Normal | None | Large dashboard numbers | `KpiCard.tsx:26` |
| **H1 Page Title** | `24px` (`text-2xl`) | 700 | `1.25` | Normal | None | Top view headers (Data Schema, Studio) | `DataSchema.tsx:84` |
| **H2 Section Header**| `20px` (`text-xl`) | 700 | `1.3` | `-0.025em` | None | Modal enlarged titles | `TopNavigation.tsx:201` |
| **Card Title (H3)** | `17px` (`text-[17px]`) | 600 | `1.0` | `-0.025em` | None | Primary card header titles | `Card.tsx:37` |
| **Section Subtitle**| `14px` (`text-sm`) | 500 | `1.5` | Normal | None | Descriptions under view headers | `DataSchema.tsx:85` |
| **Sidebar Nav Label**| `14px` (`text-[14px]`) | 600 / 700 | `1.25` | Normal | None | Navigation links | `SidebarItem.tsx:31` |
| **Body Standard** | `14px` (`text-sm`) | 500 | `1.5` | Normal | None | Table cells, form inputs, dialog copy| `TopScorersTable.tsx:23` |
| **Body Small** | `12px` (`text-xs`) | 500 / 600 | `1.4` | Normal | None | Helper text, secondary action buttons| `TopNavigation.tsx:71` |
| **Table Header** | `12px` (`text-xs`) | 700 | `1.2` | `0.05em` (`tracking-wider`) | `uppercase` | Column headers in data tables | `TopScorersTable.tsx:24` |
| **Badge / Pill** | `12px` (`text-xs`) | 600 | `1.0` | Normal | None | Status badges, category pills | `Badge.tsx:21` |
| **Shortcut / Tag** | `10px` (`text-[10px]`)| 700 | `1.0` | Normal | `uppercase` | "Ctrl K" badge, micro pill captions| `SearchInput.tsx:19` |

### 6.4 Typography Behavioral Rules
- **Truncation**: Navigation labels in collapsed state transition smoothly to `w-0 opacity-0 pointer-events-none overflow-hidden`.
- **Dataset Names**: Truncated via `truncate max-w-[200px] sm:max-w-[280px]` in file cards to prevent overflow.
- **Numbers**: Chart axes and KPI numbers use standard tabular numerals with `.toLocaleString()` formatting.

---

## 7. Spacing System

DataVista adheres to the Tailwind 4px base increment system, with consistent recurring patterns across components:

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

## 8. Layout System

### 8.1 App Shell Architectural Structure
The platform employs a two-pane responsive app shell rendered by `src/components/app-shell/AppShell.tsx`:
- **Viewport Height**: Locked to `100vh` via `h-screen w-full overflow-hidden`.
- **Sidebar Dimensions**:
  - Desktop Expanded: Fixed `w-[220px] lg:w-[220px]`, static position.
  - Desktop Collapsed: Fixed `w-[72px] lg:w-[72px]`, static position.
  - Mobile (<1024px): Off-canvas drawer `fixed inset-y-0 left-0 z-50 w-[220px]`, slides via `-translate-x-full lg:translate-x-0` with backdrop overlay `bg-slate-900/50`.
  - Transition: GPU-accelerated `transition-[width,transform] duration-200 ease-out will-change-[width]`.
- **Top Navigation Bar**:
  - Desktop: Rendered inside `hidden lg:block` container with height `h-16` (64px), horizontal padding `px-6 py-3`, and bottom border divider `border-b border-border`.
  - Mobile: Rendered as a dedicated mobile header `lg:hidden flex items-center justify-between p-4 bg-surface border-b border-border` featuring the logo and a hamburger menu button.
- **Main Content Area**:
  - Container: `flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8`.
  - Max Width Constraint: Content wrapped in `mx-auto max-w-[1600px]`.

```
+-----------------------------------------------------------------------------------+
|  AppShell Container (h-screen w-full overflow-hidden bg-appBackground)             |
| +---------------------+---------------------------------------------------------+ |
| | Sidebar (w-[220px]  | TopNavigation Header (h-16 border-b border-border)      | |
| | or w-[72px])        | [Dashboard Title]  [Search Ctrl+K]  [Date/Filter/Avatar]| |
| |                     +---------------------------------------------------------+ |
| | - Logo Header       | Main Content Area (overflow-y-auto p-4 md:p-6 lg:p-8)   | |
| | - Toggle Arrow      | +-----------------------------------------------------+ | |
| | - Nav Items (7)     | | max-w-[1600px] Centered Grid Content                | | |
| |                     | |                                                     | | |
| |                     | +-----------------------------------------------------+ | |
| +---------------------+---------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 9. Grid System

DataVista relies on responsive CSS Grid layouts for its core data views:

### 9.1 Dashboard Overview Layout (`/dashboard`)
*Evidence: `src/views/DashboardOverview.tsx:26-45`*
- **Row 1 (KPI Metrics)**: `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`
  - Single column on mobile (<640px).
  - 2 columns on tablet (640px - 1023px).
  - 4 columns on desktop ($\ge$1024px).
- **Row 2 (Main Visualizations & Actions)**: `grid grid-cols-1 gap-6 xl:grid-cols-3`
  - Left Primary Column (`xl:col-span-2`): Stacks `MatchesWonChart` (Recharts bar chart) and `TopScorersTable` (tabular records).
  - Right Supporting Column (`xl:col-span-1`): Stacks `DatasetOverview`, `QuickActions`, and `RecentFiles`.

### 9.2 Data Schema Layout (`/data-schema`)
*Evidence: `src/views/DataSchema.tsx:91`*
- Split grid: `grid grid-cols-1 lg:grid-cols-3 gap-6`.
  - Left Column (`lg:col-span-1`): Active Data Source upload card and file metadata.
  - Right Column (`lg:col-span-2`): Inferred Schema table (Column name, Type, Null %, Sample value).

### 9.3 Studio / Visual Builder Layout (`/visual-builder`)
*Evidence: `src/views/VisualBuilder.tsx`*
- Split grid: `grid grid-cols-1 xl:grid-cols-12 gap-6`.
  - Left Sidebar (`xl:col-span-4`): Chart type picker, dimension/measure selectors, aggregation modes, and color palette swatches.
  - Right Canvas (`xl:col-span-8`): Live Recharts preview canvas, export triggers, and save to dashboard button.

---

## 10. Responsive Design

The platform adheres to Tailwind CSS standard breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 10.1 Responsive Behavior Matrix

| Feature / Element | Mobile (<640px) | Tablet (640px - 1023px) | Desktop (1024px - 1279px) | Wide Desktop ($\ge$1280px) |
|---|---|---|---|---|
| **Sidebar** | Off-canvas drawer with backdrop | Off-canvas drawer with backdrop | Static left pane (220px or 72px) | Static left pane (220px or 72px) |
| **Top Nav Header** | Replaced by minimal burger bar | Replaced by minimal burger bar | Full header with search & avatar | Full header with search & avatar |
| **Global Search** | Hidden (`hidden md:block`) | Hidden or truncated | Full Command+K search box | Full Command+K search box |
| **Date Range Filter**| Hidden | Hidden | Visible on wide viewports | Visible (`hidden lg:flex`) |
| **KPI Metrics** | Stacked 1 column | 2 columns (`sm:grid-cols-2`)| 4 columns (`lg:grid-cols-4`) | 4 columns (`lg:grid-cols-4`) |
| **Dashboard Layout**| Stacked single column | Stacked single column | Stacked single column | 2-col visual / 1-col actions (`xl:grid-cols-3`)|
| **Upload Floating Orbs**| Micro pills row under hero | Micro pills row under hero | Hidden or static pills | Prominent floating side widgets (`xl:flex fixed`) |
| **Tables** | Horizontal swipe (`overflow-x-auto`)| Horizontal swipe | Full tabular grid | Full tabular grid |
| **Modal Widths** | 100% width with 16px margins | Centered max-w-lg (512px) | Centered max-w-lg (512px) | Centered max-w-lg (512px) |

---

## 11. Design Tokens

### 11.1 Tailwind v4 `@theme` Formal Tokens
*Location: `src/app/globals.css:3-45`*

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

### 11.2 Observed Hardcoded Recurring Values (Missing Formal Tokens)
1. **Container Border Radii**:
   - `rounded-[10px]` is hardcoded exclusively on `Card.tsx:10`.
   - `rounded-xl` (`12px`) is hardcoded on all buttons, inputs, and chips.
   - `rounded-2xl` (`16px`) is hardcoded on dropzone containers and modals.
   - `rounded-3xl` (`24px`) is hardcoded on login containers and outer upload cards.
2. **Card Shadows**:
   - `shadow-2xs` (arbitrary custom shadow) is referenced in `Settings.tsx:105, 113, 121, 129` and `TopNavigation.tsx:97`.
   - `shadow-card` in `tailwind.config.js` (`0 2px 8px rgba(16,24,40,0.04)`) differs mathematically from `shadow-card` in `globals.css`.

---

## 12. Logo & Branding

### 12.1 Logo Component (`DataVistaLogo.tsx`)
The primary brand emblem is rendered dynamically via `src/components/ui/DataVistaLogo.tsx`. It features an inline SVG with embedded CSS keyframe animations and radial glow filters:

```tsx
<svg width={size} height={size} viewBox="0 0 100 100" fill="none">
  {/* Rising Bar Chart 1 - Cyan (#0EA5E9 -> #38BDF8) */}
  <rect x="49" y="32" width="10" height="20" rx="3" fill="url(#barGrad1)" />
  {/* Rising Bar Chart 2 - Blue (#2563EB -> #60A5FA) */}
  <rect x="63" y="20" width="10" height="32" rx="3" fill="url(#barGrad2)" />
  {/* Rising Bar Chart 3 - Violet (#7C3AED -> #C084FC) */}
  <rect x="77" y="8" width="10" height="44" rx="3" fill="url(#barGrad3)" />
  {/* Interlocking DV Paths with linear gradient (#2563EB -> #38BDF8 -> #8B5CF6) */}
  <path d="M 12 40 ... Z" fill="url(#dvBlueCyanGrad)" />
  <path d="M 52 76 ... Z" fill="url(#dvBlueCyanGrad)" />
</svg>
```

### 12.2 Size Variants
- `sm`: Icon 28px, Font `text-lg` (18px), Gap `gap-2` (8px). Used in collapsed Sidebar.
- `md`: Icon 36px, Font `text-xl` (20px), Gap `gap-2.5` (10px). Used in expanded Sidebar and mobile header.
- `lg`: Icon 48px, Font `text-2xl` (24px), Gap `gap-3` (12px). Used on `/login` and `/signup`.
- `xl`: Icon 64px, Font `text-4xl` (36px), Gap `gap-4` (16px). Used in splash / hero views.

---

## 13. Asset Inventory

Forensic inventory of all 50 static files stored in `public/assets/` and root `public/`:

| Filename | Absolute Path | Type | Format | Dimensions | Purpose | Code Usage Location | Status |
|---|---|---|---|---|---|---|---|
| `favicon.svg` | `/public/favicon.svg` | Icon | SVG | Scalable | Browser vector tab icon | `src/app/layout.tsx` | Production |
| `favicon.ico` | `/public/favicon.ico` | Icon | ICO | Multi-res | Standard browser favicon | `src/app/layout.tsx` | Production |
| `apple-touch-icon.png` | `/public/apple-touch-icon.png` | Icon | PNG | 180x180 | iOS home screen bookmark | `src/app/layout.tsx` | Production |
| `_redirects` | `/public/_redirects` | Config | Text | N/A | Netlify/Cloudflare SPA rewrite | Hosting routing | Production |
| `README.md` | `/public/assets/README.md` | Doc | Markdown | N/A | Static asset catalog documentation | Documentation | Documentation |
| `icon-192.png` | `/public/assets/branding/app-icons/icon-192.png` | Icon | PNG | 192x192 | PWA manifest install icon | Web manifest | Unreferenced |
| `icon-512.png` | `/public/assets/branding/app-icons/icon-512.png` | Icon | PNG | 512x512 | PWA splash screen icon | Web manifest | Unreferenced |
| `apple-touch-icon.png` | `/public/assets/branding/favicons/apple-touch-icon.png` | Icon | PNG | 180x180 | Redundant favicons copy | Static asset | Unreferenced |
| `favicon-256x256.ico` | `/public/assets/branding/favicons/favicon-256x256.ico` | Icon | ICO | 256x256 | High-res Windows tile favicon | Windows tile | Unreferenced |
| `favicon.ico` | `/public/assets/branding/favicons/favicon.ico` | Icon | ICO | Multi-res | Redundant favicon copy | Static asset | Unreferenced |
| `favicon.svg` | `/public/assets/branding/favicons/favicon.svg` | Icon | SVG | Scalable | Redundant vector favicon copy | Static asset | Unreferenced |
| `datavista-banner.png` | `/public/assets/branding/logos/datavista-banner.png` | Brand | PNG | 1200x630 | OpenGraph social preview banner | Social meta tags | Unreferenced |
| `datavista-banner.svg` | `/public/assets/branding/logos/datavista-banner.svg` | Brand | SVG | 1200x630 | Vector OpenGraph banner | Social banner | Unreferenced |
| `datavista-logo-dark.png` | `/public/assets/branding/logos/datavista-logo-dark.png`| Brand | PNG | 800x240 | Raster logo for dark backgrounds | Marketing | Unreferenced |
| `datavista-logo-dark.svg` | `/public/assets/branding/logos/datavista-logo-dark.svg`| Brand | SVG | Scalable | Vector logo for dark backgrounds | Marketing | Unreferenced |
| `datavista-logo-light.png`| `/public/assets/branding/logos/datavista-logo-light.png`| Brand | PNG | 800x240 | Raster logo for light backgrounds | Marketing | Unreferenced |
| `datavista-logo-light.svg`| `/public/assets/branding/logos/datavista-logo-light.svg`| Brand | SVG | Scalable | Vector logo for light backgrounds | Marketing | Unreferenced |
| `logo-dark.svg` | `/public/assets/branding/logos/logo-dark.svg` | Brand | SVG | Scalable | Standalone dark theme logo | Branding registry | Unreferenced |
| `logo-mark.svg` | `/public/assets/branding/logos/logo-mark.svg` | Brand | SVG | Scalable | Standalone DV mark without text | Branding registry | Unreferenced |
| `logo-monochrome.svg` | `/public/assets/branding/logos/logo-monochrome.svg` | Brand | SVG | Scalable | Single-color dark logo (#0F172A) | Print / invoices | Unreferenced |
| `logo-primary.svg` | `/public/assets/branding/logos/logo-primary.svg` | Brand | SVG | Scalable | Standard primary logo mark + text | Branding registry | Unreferenced |
| `logo-white.svg` | `/public/assets/branding/logos/logo-white.svg` | Brand | SVG | Scalable | Pure white monochrome logo mark | Dark splash screens | Unreferenced |
| `icon-github.svg` | `/public/assets/icons/custom/icon-github.svg` | Icon | SVG | 24x24 | GitHub OAuth brand vector mark | Auth buttons (fallback)| Unreferenced |
| `icon-google.svg` | `/public/assets/icons/custom/icon-google.svg` | Icon | SVG | 24x24 | Google 4-color OAuth brand mark | Auth buttons (fallback)| Unreferenced |
| `icon-bluesky.svg` | `/public/assets/icons/social/icon-bluesky.svg` | Icon | SVG | 24x24 | Bluesky social vector mark | Footer social links | Unreferenced |
| `icon-discord.svg` | `/public/assets/icons/social/icon-discord.svg` | Icon | SVG | 24x24 | Discord community vector mark | Community links | Unreferenced |
| `icon-x.svg` | `/public/assets/icons/social/icon-x.svg` | Icon | SVG | 24x24 | X (formerly Twitter) vector mark | Social links | Unreferenced |
| `icons-sprite.svg` | `/public/assets/icons/social/icons-sprite.svg` | Icon | SVG | Multi | Combined social SVG sprite | Optimized iconography | Unreferenced |
| `illustration-empty-chart.svg` | `/public/assets/illustrations/empty-states/illustration-empty-chart.svg` | Illus | SVG | Scalable | Visual Builder unconfigured state | `VisualBuilder.tsx` | Production |
| `illustration-empty-dashboard.svg` | `/public/assets/illustrations/empty-states/illustration-empty-dashboard.svg` | Illus | SVG | Scalable | Dashboard empty charts container | `MatchesWonChart.tsx:91`| Production |
| `illustration-empty-data.svg` | `/public/assets/illustrations/empty-states/illustration-empty-data.svg` | Illus | SVG | Scalable | Table unpopulated empty state | `TopScorersTable.tsx:73`| Production |
| `illustration-error-404.svg` | `/public/assets/illustrations/system/illustration-error-404.svg` | Illus | SVG | Scalable | 404 Route Not Found illustration | `src/app/not-found.tsx:13`| Production |
| `illustration-upload-success.svg` | `/public/assets/illustrations/system/illustration-upload-success.svg` | Illus | SVG | Scalable | Successful dataset ingestion graphic | Completion modal | Unreferenced |
| `avatar-default.svg` | `/public/assets/images/avatars/avatar-default.svg` | Image | SVG | Scalable | Fallback user profile picture | `Avatar.tsx:40` | Production |
| `bg-grid-pattern.svg` | `/public/assets/images/backgrounds/bg-grid-pattern.svg`| Image | SVG | 40x40 | Tech grid pattern for panels | CSS backgrounds | Unreferenced |
| `hero-isometric.png` | `/public/assets/images/backgrounds/hero-isometric.png` | Image | PNG | 1280x720 | 3D isometric platform graphic | Landing pages | Unreferenced |

---

## 14. PNG Inventory

| Filename | Path | Dimensions | Aspect Ratio | Transparency | Visual Content Description |
|---|---|---|---|---|---|
| `apple-touch-icon.png` | `/public/apple-touch-icon.png` | 180x180 | 1:1 | No (white fill) | Squircle DV emblem for iOS bookmarks |
| `icon-192.png` | `/public/assets/branding/app-icons/icon-192.png` | 192x192 | 1:1 | Yes | Standard PWA mobile install icon |
| `icon-512.png` | `/public/assets/branding/app-icons/icon-512.png` | 512x512 | 1:1 | Yes | High-density PWA splash screen icon |
| `datavista-banner.png` | `/public/assets/branding/logos/datavista-banner.png` | 1200x630 | 1.9:1 | No | Social media marketing share preview |
| `datavista-logo-dark.png` | `/public/assets/branding/logos/datavista-logo-dark.png`| 800x240 | 3.33:1 | Yes | White/cyan DataVista wordmark for dark mode |
| `datavista-logo-light.png`| `/public/assets/branding/logos/datavista-logo-light.png`| 800x240 | 3.33:1 | Yes | Dark slate/blue DataVista wordmark |
| `hero-isometric.png` | `/public/assets/images/backgrounds/hero-isometric.png` | 1280x720 | 16:9 | Yes | 3D rendering of floating analytical dashboards |

---

## 15. SVG Inventory

| Filename | Path | ViewBox | Dimensions | Fill / Stroke Behavior | CSS Color Inherit? |
|---|---|---|---|---|---|
| `logo-mark.svg` | `public/assets/branding/logos/logo-mark.svg` | `0 0 100 100` | Scalable | Fixed multi-stop gradients | No (Gradient fixed) |
| `logo-primary.svg` | `public/assets/branding/logos/logo-primary.svg` | `0 0 300 80` | Scalable | Gradient mark + `#0F172A` text | No |
| `logo-dark.svg` | `public/assets/branding/logos/logo-dark.svg` | `0 0 300 80` | Scalable | Gradient mark + `#FAFAFA` text | No |
| `logo-white.svg` | `public/assets/branding/logos/logo-white.svg` | `0 0 300 80` | Scalable | Solid `#FFFFFF` fill | No |
| `logo-monochrome.svg` | `public/assets/branding/logos/logo-monochrome.svg` | `0 0 300 80` | Scalable | Solid `#0F172A` fill | No |
| `icon-google.svg` | `public/assets/icons/custom/icon-google.svg` | `0 0 24 24` | 24x24 | Official 4-color Google fills | No |
| `icon-github.svg` | `public/assets/icons/custom/icon-github.svg` | `0 0 24 24` | 24x24 | `currentColor` stroke/fill | Yes (`currentColor`) |
| `icon-discord.svg` | `public/assets/icons/social/icon-discord.svg` | `0 0 24 24` | 24x24 | Fixed Discord Blurple `#5865F2` | No |
| `icon-x.svg` | `public/assets/icons/social/icon-x.svg` | `0 0 24 24` | 24x24 | `currentColor` | Yes (`currentColor`) |
| `icon-bluesky.svg` | `public/assets/icons/social/icon-bluesky.svg` | `0 0 24 24` | 24x24 | Fixed Bluesky Blue `#1185FE` | No |
| `illustration-empty-dashboard.svg` | `public/assets/illustrations/empty-states/...` | `0 0 400 300` | Scalable | Slate and primary soft layers | No |
| `illustration-empty-data.svg` | `public/assets/illustrations/empty-states/...` | `0 0 400 300` | Scalable | Slate, grid lines, and empty cells | No |
| `illustration-empty-chart.svg`| `public/assets/illustrations/empty-states/...` | `0 0 400 300` | Scalable | Unconfigured axes and ghost bars | No |
| `illustration-error-404.svg` | `public/assets/illustrations/system/...` | `0 0 500 350` | Scalable | 404 numerals, magnifying glass, orb | No |
| `avatar-default.svg` | `public/assets/images/avatars/avatar-default.svg` | `0 0 100 100` | Scalable | Neutral slate user silhouette | No |
| `bg-grid-pattern.svg` | `public/assets/images/backgrounds/bg-grid-pattern.svg`| `0 0 40 40` | 40x40 | Stroke `#E2E8F0`, stroke-width 1 | No |

---

## 16. Image Inventory

### 16.1 User Avatar Rendering Rules
*Evidence: `src/components/ui/Avatar.tsx` and `src/components/app-shell/TopNavigation.tsx`*
- **Resolution**: 3 standard sizes:
  - `sm`: `h-6 w-6 text-xs` (24x24px) in TopNavigation.
  - `md`: `h-8 w-8 text-sm` (32x32px) default.
  - `lg`: `h-10 w-10 text-base` (40x40px).
- **Zoomed Profile Modal**: Rendered at `w-44 h-44` (176x176px) rounded-full with `shadow-2xl border-4 border-surface`.
- **Loading & Fallback Hierarchy**:
  1. Authenticated OAuth avatar URL (`user.user_metadata.avatar_url` or `picture`).
  2. Fallback to `unavatar.io/${email}` service.
  3. Error fallback to gradient initials: `bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold uppercase`.
  4. Root static placeholder fallback: `/assets/images/avatars/avatar-default.svg`.

---

## 17. Iconography

### 17.1 System Icon Library (`lucide-react`)
The platform standardizes on `lucide-react` version 1.25.0:
- **Default Visual Settings**: Stroke width `2px`, outline style, unfilled (`fill="none"`).
- **Dimensions**:
  - Micro icons: `h-3.5 w-3.5` (14px) on trend arrows, date indicators, and button icons.
  - Standard UI icons: `h-4 w-4` (16px) or `h-5 w-5` (20px) inside inputs, buttons, and navigation links.
  - Featured widget icons: `h-8 w-8` to `h-10 w-10` in empty states and upload dropzones.
- **Color Inheritence**: Inherits CSS color via `text-textSecondary`, `text-textMuted`, `text-primary`, `text-success`, `text-danger`, or `text-warning`.

---

## 18. Border Radius System

Forensic inspection reveals 7 distinct border radius tiers across the component hierarchy:

| Radius Token | Exact Pixels | Usage in Components | Inconsistency & Audit Notes |
|---|---|---|---|
| `rounded-md` | `6px` | Date filters, segmented control items, dropdown shortcuts | Used for tight interior controls |
| `rounded-lg` | `8px` | `Button.tsx`, `SearchInput.tsx`, input fields in `Signup.tsx`, KPI icon tiles | Standard for small interactive elements |
| `rounded-[10px]` | `10px` | `Card.tsx` container | Non-standard arbitrary pixel value |
| `rounded-xl` | `12px` | `IconButton.tsx`, input fields in `Login.tsx`, sidebar collapse trigger, filter chips | Modern standard for buttons & inputs |
| `rounded-2xl` | `16px` | Modal dialogs, `Signup.tsx` container, dropzone inner dashed area, side widgets | Standard container radius |
| `rounded-3xl` | `24px` | `Login.tsx` container, outer dropzone card on `/upload-dataset` | Ultra-rounded high-emphasis containers |
| `rounded-full` | `9999px` | `Badge.tsx`, `Avatar.tsx`, `SidebarItem.tsx` active pills, format pills | Fully rounded pills and circular avatars |

---

## 19. Border System

- **Default Dividers**: `1px solid var(--color-border)` (`#E2E8F0` light, `#27272A` dark). Applied on card boundaries, table rows, and shell headers.
- **Form Controls**: `1px solid var(--color-borderStrong)` (`#CBD5E1` light, `#3F3F46` dark). Applied to input fields, select dropdowns, and checkboxes.
- **Empty State & Dropzone Boundaries**: `2px dashed var(--color-border)` (`border-2 border-dashed border-border`). Transitions on drag hover to `border-primary` with `bg-primary-soft/40`.
- **Focus Rings**: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

---

## 20. Shadows & Elevation System

DataVista implements a multi-tier shadow elevation scale:

| Level | Shadow CSS Definition | Usage |
|---|---|---|
| **2XS** | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Theme preview cards, keyboard shortcut tags |
| **XS** | `0 1px 2px 0 rgba(16, 24, 40, 0.05)` | `IconButton` surface variant, filter buttons |
| **Card (Light)**| `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)` | Standard `Card.tsx` containers |
| **Card (Dark)** | `0 4px 6px -1px rgba(0, 0, 0, 0.5)` | Zinc cards in dark themes |
| **Primary Glow**| `0 4px 14px 0 rgba(37, 99, 235, 0.25)` | Primary action buttons (`shadow-blue-500/20`) |
| **2XL** | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | `Login.tsx` card, avatar zoom modal, transformation dialogs |

---

## 21. Backgrounds, Gradients & Effects

### 21.1 Interactive 3D Canvas Background (`ThreeDAbstractBackground.tsx`)
Rendered on landing and auth views via HTML5 Canvas with `0 DOM queries per render frame`:
- **5 Floating 3D Spheres**: Rendered with radial gradients tracking mouse parallax coordinates:
  - Sphere 1 (Blue): $r=110\text{px}$, depth $1.1$, gradient stops `#60A5FA` $\to$ `#2563EB` $\to$ transparent.
  - Sphere 2 (Cyan): $r=140\text{px}$, depth $0.7$, gradient stops `#38BDF8` $\to$ `#0EA5E9` $\to$ transparent.
  - Sphere 3 (Purple): $r=95\text{px}$, depth $1.3$, gradient stops `#A78BFA` $\to$ `#7C3AED` $\to$ transparent.
  - Sphere 4 (Blue): $r=120\text{px}$, depth $0.9$, gradient stops `#60A5FA` $\to$ `#2563EB` $\to$ transparent.
  - Sphere 5 (White): $r=75\text{px}$, depth $1.4$, gradient stops `#FFFFFF` $\to$ `#E2E8F0` $\to$ transparent.
- **30 Drifting Data Particles**: Particles drift upward ($v_y = 0.25\text{px} - 0.75\text{px}/\text{frame}$) with sinuous horizontal drift ($drift_x$) and pulsing alpha opacity ($0.2 - 0.7$).
- **Performance Optimization**: Execution throttles and pauses via `if (document.hidden) return;` when tab visibility changes.

### 21.2 Ambient Glow Orbs
*Evidence: `src/views/UploadDataset.tsx:91-96`*
- Top-Left Orb: `w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-3xl animate-glow-pulse`.
- Bottom-Right Orb: `w-[650px] h-[650px] rounded-full bg-purple-500/20 blur-3xl animate-glow-pulse`.
- Center Orb: `w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-3xl animate-pulse`.

---

## 22. Component Library

### 22.1 Button (`src/components/ui/Button.tsx`)
- **Props**: `variant?: "primary" | "secondary" | "outline" | "ghost"`, `size?: "sm" | "md" | "lg"`.
- **Base Styles**: `inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none`.
- **Sizes**:
  - `sm`: `h-8 px-3 text-xs` (32px height).
  - `md`: `h-10 px-4 py-2.5 text-sm gap-2` (40px height).
  - `lg`: `h-12 px-6 text-base gap-2` (48px height).

### 22.2 Card (`src/components/ui/Card.tsx`)
- **Card**: `rounded-[10px] border border-border bg-surface shadow-card`.
- **CardHeader**: `flex flex-col space-y-1.5 p-6`.
- **CardTitle**: `text-[17px] font-semibold leading-none tracking-tight text-textPrimary`.
- **CardContent**: `p-6 pt-0`.

### 22.3 Badge (`src/components/ui/Badge.tsx`)
- **Variants**: `success` (`bg-success-soft text-success`), `warning` (`bg-warning-soft text-warning`), `danger` (`bg-danger-soft text-danger`), `info` (`bg-cyan-soft text-cyan`), `purple` (`bg-purple-soft text-purple`), `neutral` (`bg-gray-100 text-gray-700`).
- **Styles**: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold`.

### 22.4 Avatar (`src/components/ui/Avatar.tsx`)
- **Props**: `src?: string`, `fallback?: string`, `size?: "sm" | "md" | "lg"`.
- **Styles**: `relative flex shrink-0 overflow-hidden rounded-full bg-blue-600 text-white font-bold`.

### 22.5 SearchInput (`src/components/ui/SearchInput.tsx`)
- **Styles**: `h-10 w-full rounded-lg border border-border bg-slate-50 pl-10 pr-12 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-colors`.
- **Adornments**: Lucide `Search` icon on left; `Ctrl K` rounded keyboard badge on right.

### 22.6 SegmentedControl (`src/components/ui/SegmentedControl.tsx`)
- **Styles**: Outer container `inline-flex items-center rounded-lg bg-slate-100 p-1`.
- **Active Tab**: `rounded-md px-3 py-1.5 text-xs font-medium bg-white text-textPrimary shadow-sm`.
- **Inactive Tab**: `text-textSecondary hover:text-textPrimary hover:bg-slate-200/50`.

### 22.7 IconButton (`src/components/ui/IconButton.tsx`)
- **Variants**: `ghost`, `outline`, `surface`.
- **Sizes**: `sm` (`h-8 w-8`), `md` (`h-9 w-9`).
- **Styles**: `inline-flex items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95`.

---

## 23. Component Variants

```
Button Variants:
├── primary:   bg-primary text-white shadow-sm hover:bg-primary-hover
├── secondary: bg-surface text-textPrimary shadow-sm ring-1 ring-borderStrong hover:bg-appBackground
├── outline:   border border-primary text-primary hover:bg-primary-soft
└── ghost:     text-textSecondary hover:text-textPrimary hover:bg-appBackground

IconButton Variants:
├── ghost:   text-textSecondary hover:text-textPrimary hover:bg-primary-soft/30
├── outline: border border-border text-textSecondary hover:bg-primary-soft/20
└── surface: bg-surface text-textSecondary hover:bg-primary-soft/20 shadow-xs border border-border

Badge Variants:
├── success: bg-success-soft text-success
├── warning: bg-warning-soft text-warning
├── danger:  bg-danger-soft text-danger
├── info:    bg-cyan-soft text-cyan
├── purple:  bg-purple-soft text-purple
└── neutral: bg-gray-100 text-gray-700
```

---

## 24. Component State Matrix

| Component | Default State | Hover State | Active / Pressed | Focused State | Disabled State |
|---|---|---|---|---|---|
| **Button (Primary)** | `bg-primary text-white shadow-sm` | `bg-primary-hover` | `scale-[0.98]` (where active) | `ring-2 ring-primary ring-offset-2` | `opacity-50 pointer-events-none` |
| **Button (Secondary)**| `bg-surface text-textPrimary ring-1` | `bg-appBackground` | `scale-[0.98]` | `ring-2 ring-primary ring-offset-2` | `opacity-50 pointer-events-none` |
| **IconButton** | `text-textSecondary` | `bg-primary-soft/30 text-textPrimary`| `scale-95` | `ring-2 ring-primary` | `opacity-50 pointer-events-none` |
| **SidebarItem** | `text-textSecondary font-semibold`| `bg-primary-soft/40 text-textPrimary`| N/A | `ring-2 ring-primary ring-offset-1` | N/A |
| **SidebarItem (Active)**| `bg-primary text-white font-bold shadow-sm` | `bg-primary text-white` | N/A | `ring-2 ring-primary` | N/A |
| **Search Input** | `bg-slate-50 border-border` | `border-borderStrong` | N/A | `border-primary bg-white ring-1 ring-primary`| `opacity-50 bg-slate-100` |
| **Filter Chip** | `bg-surface border-border text-textSecondary` | `border-primary/40 text-textPrimary` | `scale-[1.02]` | `ring-2 ring-primary` | `opacity-40` |
| **Filter Chip (Active)**| `bg-primary text-white border-primary shadow-sm` | `bg-primary-hover` | `scale-[1.02]` | `ring-2 ring-primary` | N/A |

---

## 25. Forms

### 25.1 Input Styling Patterns
- **Standard Text/Password Input** (`Login.tsx:90`, `113`):
  `block w-full rounded-xl border border-borderStrong bg-surface p-2.5 pl-9 text-sm text-textPrimary placeholder:text-textMuted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors`
- **Signup Alternate Input** (`Signup.tsx:108`):
  `block w-full rounded-lg border border-borderStrong bg-surface p-2 pl-9 text-sm text-textPrimary focus:border-purple focus:ring-purple` (Inconsistent radius and focus ring).
- **Checkbox Controls**:
  `h-3.5 w-3.5 rounded border-borderStrong text-primary focus:ring-primary cursor-pointer accent-primary`.
- **Validation Error Message**:
  `flex items-center gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger border border-danger/20`.

---

## 26. Buttons

### 26.1 Button Dimensional Rules
- **Height Scale**:
  - `sm`: 32px (`h-8`), padding `px-3`, typography `text-xs`.
  - `md`: 40px (`h-10`), padding `px-4 py-2.5`, typography `text-sm`.
  - `lg`: 48px (`h-12`), padding `px-6`, typography `text-base`.
- **Auth Submit Buttons**:
  - Full-width `w-full justify-center rounded-xl bg-primary p-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 active:scale-95`.
  - Loading State: Replaced with `h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent`.

---

## 27. Navigation

### 27.1 Sidebar Navigation (`Sidebar.tsx`)
- **Items**:
  1. `/dashboard` $\to$ Lucide `LayoutDashboard`, "Dashboard"
  2. `/data-schema` $\to$ Lucide `Database`, "Data & Schema"
  3. `/clean-transform` $\to$ Lucide `Sparkles`, "Clean & Transform"
  4. `/visual-builder` $\to$ Lucide `BarChart`, "Visual Builder"
  5. `/dashboard-canvas` $\to$ Lucide `Layout`, "Dashboard Canvas"
  6. `/export-report` $\to$ Lucide `Download`, "Export & Report"
  7. `/settings` $\to$ Lucide `Settings`, "Settings"
- **Omission**: `/upload-dataset` is the post-login landing destination but is omitted from the sidebar links.

### 27.2 Global Command Search (`TopNavigation.tsx`)
- Global listener intercepts `Cmd+K` or `Ctrl+K`.
- Renders an autocomplete modal dropdown `absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-border bg-surface shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150` with direct routing shortcuts.

---

## 28. Cards & Containers

- **Standard Data Card**: Wrapped in `<Card>` (`rounded-[10px] border border-border bg-surface shadow-card`).
- **Interactive Hover Card**: Enriched with `transition-all hover:border-borderStrong hover:shadow-md`.
- **Empty State Card Container**: Enclosed in `border-2 border-dashed border-border rounded-2xl bg-surface/50 p-6 flex flex-col items-center justify-center text-center`.

---

## 29. Tables

### 29.1 Standard Records Table (`TopScorersTable.tsx`)
- Container: `overflow-x-auto w-full rounded-xl border border-border`.
- Header: `border-b border-border text-xs font-bold text-textPrimary bg-primary-soft/20 uppercase tracking-wider py-3 px-4`.
- Rows: `divide-y divide-border bg-surface`.
- Hover: `hover:bg-primary-soft/10 transition-colors`.
- Primary Column Cell: `font-semibold text-textPrimary whitespace-nowrap pl-4 py-3 px-4`.
- Value Cells: `text-textSecondary text-center py-3 px-4 text-sm`.

---

## 30. Data Visualizations

### 30.1 Recharts Chart Standard Styling
*Evidence: `MatchesWonChart.tsx` and `VisualBuilder.tsx`*
- **Grid Lines**: `CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"` (subtle horizontal dividers only).
- **Axis Styling**: `axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}`.
- **Bar Shape**: `radius={[4, 4, 0, 0]}` (rounded top edge only).
- **Tooltip Container**:
  `rounded-lg border border-border bg-white p-3 shadow-lg` with label in `font-semibold text-textPrimary` and values in `font-bold text-textPrimary`.

---

## 31. Modals / Dialogs / Drawers

### 31.1 Transformation Modal (`CleanTransform.tsx:24-76`)
- **Backdrop**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200`.
- **Card Container**: `w-full max-w-lg bg-surface border border-border/80 rounded-2xl shadow-2xl shadow-primary/5 flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-200`.
- **Header**: Gradient banner `bg-gradient-to-r from-primary-soft/30 via-transparent to-transparent border-b border-border/60 px-6 py-4`.
- **Close Triggers**: Click on backdrop, Esc key listener, or top-right close button.

### 31.2 Avatar Zoom Modal (`TopNavigation.tsx:164-229`)
- Frameless enlarged circular photo `w-44 h-44 rounded-full object-cover shadow-2xl border-4 border-surface`.
- Direct routing to `/settings`.

---

## 32. Feedback Components

- **Dataset Notification Banner** (`DatasetOverview.tsx:51`):
  `p-2.5 rounded-xl bg-primary-soft border border-primary/30 text-primary text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300`.
- **Settings Save Toast** (`Settings.tsx`):
  Bottom-right floating toast notification lasting 3500ms upon saving preferences.
- **Form Error Banner** (`Login.tsx:68`):
  `flex items-center gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger border border-danger/20`.

---

## 33. Loading States

- **Route Transition**: Handled via Next.js App Router streaming.
- **Button Action Spinners**: Inline circular SVG spinner `animate-spin rounded-full border-2 border-white border-t-transparent`.
- **Dropzone Upload Progress**: Status badge switches to `Analyzing Dataset...` with spinning SVG.
- **Canvas Throttling**: GPU rendering pauses immediately on inactive tabs via `document.hidden`.

---

## 34. Empty States

| Context | Graphic Asset | Headline | Primary Call-to-Action |
|---|---|---|---|
| **Dashboard Chart** | `/assets/illustrations/empty-states/illustration-empty-dashboard.svg` | "No Dataset Active" | "Upload a dataset to generate interactive charts..." |
| **Dashboard Records**| `/assets/illustrations/empty-states/illustration-empty-data.svg` | "No Dataset Records Available" | "Upload a dataset to view structured table records..." |
| **Visual Builder** | `/assets/illustrations/empty-states/illustration-empty-chart.svg` | "Chart Builder Unconfigured" | Select dimensions and chart types |
| **Dashboard Canvas** | Lucide `Database` icon in `bg-primary-soft` container | "No Active Dataset Loaded" | "Please load a dataset to configure canvas widgets" |
| **Recent Files List**| Inline text | "No recent dataset files uploaded"| Browse files on `/upload-dataset` |

---

## 35. Error States

### 35.1 404 Route Not Found (`src/app/not-found.tsx`)
- Centered viewport layout with `/assets/illustrations/system/illustration-error-404.svg`.
- Typography: `text-2xl sm:text-3xl font-extrabold tracking-tight text-textPrimary`.
- Primary Action: `<Link href="/dashboard">` button styled in `bg-primary text-white rounded-xl shadow-md shadow-blue-500/20`.
- Secondary Action: `window.history.back()` button styled in `bg-surface border border-border rounded-xl`.

---

## 36. Interaction & Motion

### 36.1 CSS Keyframe Registry
*Evidence: `src/app/globals.css:160-226`*

```css
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}
@keyframes floatDelayed {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(10px) rotate(-1deg); }
}
@keyframes floatPill1 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes floatPill2 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(6px); }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.65; transform: scale(1.08); }
}
```

---

## 37. Accessibility

### 37.1 Implementation Audit
- **Implemented**:
  - Semantic landmark tags used in AppShell (`<aside>`, `<header>`, `<main>`, `<nav>`, `<footer>`).
  - Native form control labels (`<label htmlFor="...">`) on login and signup forms.
  - Visible focus indicators via `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`.
  - Contrast ratios for text: `textPrimary` (`#0F172A`) against `#FFFFFF` yields $16.1:1$ (exceeds WCAG AAA).
- **Partial**:
  - Custom SVG graphics lack explicit `<title>` and `<desc>` elements for screen readers.
  - Modal dialogues lack focus-trapping routines to cycle focus within open modals.
- **Missing**:
  - No `prefers-reduced-motion` media query overrides for floating animations in `globals.css`.

---

## 38. Screen-by-Screen Specifications

### 38.1 Screen 1: Login (`/login`)
- **Route**: `/login` (Page file: `src/app/login/page.tsx`, View: `src/views/Login.tsx`).
- **Container**: Centered viewport `min-h-screen bg-appBackground p-4`. Card max width `400px`, `rounded-3xl bg-surface shadow-2xl border border-border`.
- **Header**: Animated `DataVistaLogo` size `lg`, subtext "Data Analytics & Visualization Portal".
- **Form Fields**: Email (with Mail icon), Password (with Lock icon & show/hide toggle), Remember Me 30 days checkbox.
- **Buttons**:
  - Sign In: `rounded-xl bg-primary hover:bg-primary-hover shadow-md shadow-blue-500/20 text-white font-bold`.
  - Continue with Google: `rounded-xl border border-border bg-surface` with 4-color Google inline SVG.
  - Continue with GitHub: `rounded-xl border border-border bg-surface` with GitHub SVG.
- **Footer**: Link to `/signup` ("Don't have an account? Sign up").

### 38.2 Screen 2: Signup (`/signup`)
- **Route**: `/signup` (Page file: `src/app/signup/page.tsx`, View: `src/views/Signup.tsx`).
- **Container**: Centered viewport `min-h-screen bg-appBackground p-4`. Card max width `400px`, `rounded-2xl bg-surface shadow-card border border-border` *(Divergence: rounded-2xl and shadow-card vs Login's rounded-3xl and shadow-2xl)*.
- **Form Fields**: Full Name (User icon), Email (Mail icon), Password, Repeat Password, Keep signed in checkbox, Terms agreement checkbox.
- **Button**: `rounded-lg bg-purple hover:bg-opacity-90 text-white font-bold` *(Divergence: Purple #8B5CF6 instead of primary blue)*.
- **Footer**: Link to `/login` ("Already have an account? Sign in").

### 38.3 Screen 3: Upload Dataset (`/upload-dataset`)
- **Route**: `/upload-dataset` (Page file: `src/app/upload-dataset/page.tsx`, View: `src/views/UploadDataset.tsx`).
- **Container**: Centered full viewport `min-h-screen bg-appBackground p-4 sm:p-6`.
- **Background**: Ambient glowing orbs (Blue, Purple, Cyan) + SVG 40x40 grid lines.
- **Floating Side Widgets**: Desktop `xl:flex fixed` side cards for Auto Chart Engine, AI Data Cleaner, Binary Inspection, Realtime Cloud Sync.
- **Dropzone**: Outer card `rounded-3xl border border-border shadow-xl p-6 sm:p-8 bg-surface/95`. Inner dropzone `rounded-2xl border-2 border-dashed p-8 sm:p-10`. Format pills for CSV, XLSX, TSV, JSON. Max size notice 100 MB.
- **Recent Files Card**: Bottom card `rounded-2xl border border-border p-5 shadow-sm` showing active dataset details and clear button.

### 38.4 Screen 4: Dashboard Overview (`/dashboard`)
- **Route**: `/dashboard` (Page file: `src/app/(main)/dashboard/page.tsx`, View: `src/views/DashboardOverview.tsx`).
- **Header**: TopNavigation with search, date range (`Jan 01, 2024 - Dec 31, 2024`), filters button, notification bell, user avatar.
- **Grid Layout**:
  - Top Row: 4 KPI Cards (`Total Metric`, `Primary Aggregation`, `Secondary Metric`, `Data Quality`).
  - Main Left (2 cols): `MatchesWonChart` (Recharts BarChart `h-[280px]`) and `TopScorersTable` (tabular records).
  - Main Right (1 col): `DatasetOverview` (row/column stats & upload trigger), `QuickActions` (5 shortcuts), `RecentFiles` (static list).

### 38.5 Screen 5: Data & Schema (`/data-schema`)
- **Route**: `/data-schema` (Page file: `src/app/(main)/data-schema/page.tsx`, View: `src/views/DataSchema.tsx`).
- **Header**: H1 "Data & Schema", subtitle "Connect your data sources and manage dataset schemas".
- **Grid Layout**: 1 col Data Source card (upload button, clear dataset, row/column counts), 2 col Inferred Schema Table (Column Name, Inferred Type, Null %, Sample Value).

### 38.6 Screen 6: Clean & Transform (`/clean-transform`)
- **Route**: `/clean-transform` (Page file: `src/app/(main)/clean-transform/page.tsx`, View: `src/views/CleanTransform.tsx`).
- **Header**: Title with AI sparkles, active dataset status badge, undo step button.
- **Action Grid**: 13 interactive transformation cards (Filter, Duplicates, Find & Replace, Change Type, Rename, Auto Clean, Fill Missing, Split, Merge, Sort, Remove Columns, Outliers, Remove Nulls).
- **Preview Table**: Live mutated records preview with interactive applied transformation breadcrumbs.

### 38.7 Screen 7: Visual Builder (`/visual-builder`)
- **Route**: `/visual-builder` (Page file: `src/app/(main)/visual-builder/page.tsx`, View: `src/views/VisualBuilder.tsx`).
- **Sidebar**: 23 chart type selectors categorized into 8 functional groups, dimension/measure dropdowns, 5 color palette pickers, display toggles (legend, grid, tooltips).
- **Canvas Area**: Live Recharts responsive preview, title input, "Save to Dashboard" action button.

### 38.8 Screen 8: Dashboard Canvas (`/dashboard-canvas`)
- **Route**: `/dashboard-canvas` (Page file: `src/app/(main)/dashboard-canvas/page.tsx`, View: `src/views/DashboardCanvas.tsx`).
- **Sidebar**: Widget picker (Chart Widget, Text Box, Image, KPI Grid) with `draggable` attribute.
- **Canvas**: Dashed dropzone border. Shows "No Active Dataset Loaded" placeholder when unpopulated.

### 38.9 Screen 9: Export & Report (`/export-report`)
- **Route**: `/export-report` (Page file: `src/app/(main)/export-report/page.tsx`, View: `src/views/ExportReport.tsx`).
- **Format Selector**: 3 cards for PDF Document (window.print), PNG Image Snapshot (1200x800 HTML5 canvas draw), CSV Data Export (Blob download).
- **Configuration**: Page size selector (A4, Letter), Orientation selector (Portrait, Landscape).
- **Report Preview**: Formatted executive report card with summary banner, KPI tiles, and data table.

### 38.10 Screen 10: Settings (`/settings`)
- **Route**: `/settings` (Page file: `src/app/(main)/settings/page.tsx`, View: `src/views/Settings.tsx`).
- **Tabs**: Appearance & Theme, Account & Profile, Workspace & Data Defaults, Notifications & Alerts, Security & API Keys, Integrations & Sync.
- **Theme Picker**: 4 interactive theme preview cards (Light Mode, Dark Mode, Extra Dark Charcoal, Deep Cobalt Navy).
- **Landing Page Selector**: Dropdown to select default landing page (`/dashboard`, `/upload-dataset`, etc.).

### 38.11 Screen 11: 404 Route Not Found (`not-found.tsx`)
- **Route**: Catch-all unmatched routes (Page file: `src/app/not-found.tsx`).
- **Visuals**: Illustrated error SVG graphic, "Page Not Found" title, "Return to Dashboard" primary button, "Go Back" secondary button.

---

## 39. Page / Layout Map

```text
DataVista Web Platform
├── Public & Unauthenticated
│   ├── /login                     (Auth Portal: Royal Blue, rounded-3xl, shadow-2xl)
│   └── /signup                    (Auth Portal: Purple, rounded-2xl, shadow-card)
│
├── Onboarding & Ingestion (Standalone Full Viewport)
│   └── /upload-dataset            (Landing Upload: Kinetic side widgets, dropzone, ambient orbs)
│
├── Authenticated Application Shell (Sidebar + TopNavigation + Max-Width Content)
│   ├── /dashboard                 (Executive Overview: 4 KPIs, Recharts bar chart, table, recents)
│   ├── /data-schema               (Schema Inspector: Data source upload, inferred types)
│   ├── /clean-transform           (Transformation Studio: 13 cleaning modals, audit trail)
│   ├── /visual-builder            (Chart Studio: 23 chart types, 5 palettes, live Recharts)
│   ├── /dashboard-canvas          (Canvas Layout: Draggable widget sidebar, grid area)
│   ├── /export-report             (Reporting Center: PDF print, PNG canvas snapshot, CSV)
│   └── /settings                  (Preferences: 4 theme switchers, mock account forms)
│
└── System Fallback
    └── /not-found                 (Error 404: System illustration, back-to-dashboard CTA)
```

---

## 40. Asset Usage Matrix

| Asset Filename | Rendered Screen(s) | Rendering Component / File | Render Method | Production or Mock? | Verified Referenced? |
|---|---|---|---|---|---|
| `favicon.svg` | Global (Browser tab) | `src/app/layout.tsx` | Next.js Metadata | Production | Yes |
| `favicon.ico` | Global (Browser tab) | `src/app/layout.tsx` | Next.js Metadata | Production | Yes |
| `apple-touch-icon.png` | Global (iOS bookmark) | `src/app/layout.tsx` | Next.js Metadata | Production | Yes |
| `avatar-default.svg` | Global (TopNavigation) | `Avatar.tsx:40` | `<img>` fallback | Production | Yes |
| `illustration-empty-dashboard.svg`| `/dashboard` | `MatchesWonChart.tsx:91` | `<img>` tag | Production | Yes |
| `illustration-empty-data.svg` | `/dashboard` | `TopScorersTable.tsx:73`| `<img>` tag | Production | Yes |
| `illustration-empty-chart.svg` | `/visual-builder` | `VisualBuilder.tsx` | `<img>` tag | Production | Yes |
| `illustration-error-404.svg` | 404 Fallback | `src/app/not-found.tsx:13`| `<img>` tag | Production | Yes |
| `bg-grid-pattern.svg` | Inline SVG in `/upload-dataset` | `UploadDataset.tsx:98` | Inline `<pattern>` | Production | Re-implemented inline |
| `icon-google.svg` | `/login`, `/signup` | `Login.tsx`, `Signup.tsx`| Re-implemented inline | Production | Re-implemented inline |
| `icon-github.svg` | `/login`, `/signup` | `Login.tsx`, `Signup.tsx`| Re-implemented inline | Production | Re-implemented inline |
| `hero-isometric.png` | None (Public asset) | N/A | Static file | Mock / Marketing | Orphaned |
| `datavista-banner.png` | None (Public asset) | N/A | Static file | Marketing | Orphaned |
| `datavista-logo-dark.png`| None (Public asset) | N/A | Static file | Marketing | Orphaned |
| `datavista-logo-light.png`| None (Public asset) | N/A | Static file | Marketing | Orphaned |

---

## 41. Design Implementation Architecture

The styling implementation operates through a 5-layer pipeline:

```
[ Layer 1: Tailwind CSS v4 Engine ]
  └── @import "tailwindcss" in src/app/globals.css
  
[ Layer 2: Theme Tokens (@theme block) ]
  └── 28 CSS custom properties (--color-appBackground, --color-surface, --color-primary, etc.)
  
[ Layer 3: Theme Overrides (.dark, .extra-dark, .cobalt-dark) ]
  └── Activated dynamically via document.documentElement.classList in AppProviders & Settings
  
[ Layer 4: Shared UI Primitives ]
  └── Button.tsx, Card.tsx, Badge.tsx, Avatar.tsx, SearchInput.tsx, IconButton.tsx
  └── Composed via cn() helper (clsx + tailwind-merge)
  
[ Layer 5: Screen Views & App Shell ]
  └── AppShell.tsx wraps (main) routes with responsive Sidebar + TopNavigation
```

---

## 42. Design-to-Code Mapping

| Visual Design Element | Component / File | Primary Styling Source | Active Token / Class | Usage Context |
|---|---|---|---|---|
| **Primary Action Button**| `src/components/ui/Button.tsx` | Tailwind `@theme` | `bg-primary hover:bg-primary-hover text-white` | Form submits, primary actions |
| **Card Container** | `src/components/ui/Card.tsx` | Tailwind `@theme` + inline | `rounded-[10px] border border-border bg-surface shadow-card` | All data panels |
| **Status Pill Badge** | `src/components/ui/Badge.tsx` | Tailwind `@theme` | `rounded-full px-2.5 py-0.5 text-xs font-semibold` | Active status, schema types |
| **Global Search Bar** | `src/components/ui/SearchInput.tsx`| Utility classes | `rounded-lg border border-border bg-slate-50 pl-10 pr-12` | Shell navigation |
| **Brand Logo** | `src/components/ui/DataVistaLogo.tsx`| Inline SVG + keyframes | Linear gradients `#2563EB` $\to$ `#38BDF8` $\to$ `#8B5CF6` | Sidebar, headers, auth |
| **Sidebar Navigation Link**| `src/components/app-shell/SidebarItem.tsx`| Utility classes | `rounded-full px-3.5 py-2.5 text-[14px] font-semibold` | Left navigation links |
| **Data Table Row** | `src/components/dashboard/TopScorersTable.tsx`| Utility classes | `divide-y divide-border bg-surface hover:bg-primary-soft/10` | Records preview |
| **Recharts Bar Chart** | `src/components/dashboard/MatchesWonChart.tsx`| Recharts + custom classes| `CartesianGrid stroke="#E2E8F0" Bar radius={[4, 4, 0, 0]}` | Analytics charts |

---

## 43. Design Inconsistency Audit

Forensic inspection identified 10 concrete visual and structural inconsistencies across the codebase:

| Inconsistency Issue | Locations Involved | Current Conflicting Values | Likely Intended Pattern | Impact | Status |
|---|---|---|---|---|---|
| **Tailwind Engine Config Divergence** | `tailwind.config.js` vs `src/app/globals.css` | `tailwind.config.js` specifies `#4055E8` primary & `#071A2E` sidebar; `globals.css` specifies `#2563EB` primary & `#FFFFFF` sidebar | Tailwind v4 `@theme` in `globals.css` | Developer confusion, unused config file | `INCONSISTENT` |
| **Duplicate Global Stylesheet** | `src/index.css` vs `src/app/globals.css` | `src/index.css` is an identical 235-line duplicate of `src/app/globals.css` | Single stylesheet in `src/app/globals.css` | Redundant maintenance burden | `INCONSISTENT` |
| **Auth Screen Visual Divergence** | `src/views/Login.tsx` vs `src/views/Signup.tsx` | Login: `rounded-3xl`, `shadow-2xl`, primary blue button. Signup: `rounded-2xl`, `shadow-card`, purple `#8B5CF6` button | Standardized brand blue container | Inconsistent user onboarding | `INCONSISTENT` |
| **Card Radius vs Button Radius** | `src/components/ui/Card.tsx` vs `Button.tsx` | Card uses `rounded-[10px]`; Button uses `rounded-lg` (`8px`); Modal uses `rounded-2xl` (`16px`) | Standardized radius tokens | Visual dissonance in nested cards | `INCONSISTENT` |
| **Missing Navigation Route** | `src/components/app-shell/Sidebar.tsx` | Sidebar lists 7 routes but omits `/upload-dataset` (the post-login landing destination) | Include Upload Dataset in sidebar | Users cannot return to upload without manual URL entry | `INCONSISTENT` |
| **Tailwind v3 Class Suffixes** | `src/components/dashboard/QuickActions.tsx:24-30` | Uses `text-warning-DEFAULT`, `text-cyan-DEFAULT`, `text-purple-DEFAULT` | Standard utility classes (`text-warning`, `text-purple`) | Broken styles if Tailwind v4 strict mode enforces syntax | `INCONSISTENT` |
| **Inline SVGs vs Asset Files** | `Login.tsx`, `UploadDataset.tsx` vs `public/assets/` | SVGs for Google, GitHub, and grid patterns are hardcoded inline rather than consuming static files in `public/assets/` | Import from `public/assets/` | Code bloating, asset library abandonment | `INCONSISTENT` |
| **Quick Actions Route Mismatch**| `QuickActions.tsx:52` | "Upload" action redirects to `/data-schema` instead of `/upload-dataset` | Redirect to `/upload-dataset` | User disorientation | `INCONSISTENT` |
| **Arbitrary Shadow Classes** | `src/views/Settings.tsx`, `TopNavigation.tsx` | Uses arbitrary `shadow-2xs` class not defined in standard Tailwind or `@theme` | Standardized elevation scale | Browser ignores class or falls back | `INCONSISTENT` |
| **Recent Files Data Inconsistency**| `RecentFiles.tsx` vs `DatasetContext.tsx` | `RecentFiles.tsx` loads static IPL cricket mock files (`ipl_matches.csv`) instead of active dataset state | Dynamic dataset context connection | Misleading mock data displayed | `INCONSISTENT` |

---

## 44. Design Debt

1. **Token Fragmentation**: Color tokens exist in `globals.css`, but many components still use raw Tailwind classes (e.g., `text-emerald-500`, `bg-blue-500/20`, `text-purple-DEFAULT`) rather than theme tokens (`text-success`, `bg-primary-soft`).
2. **Component Duplication**: Similar button styles are rewritten inline across `Login.tsx`, `Signup.tsx`, `UploadDataset.tsx`, and `TopScorersTable.tsx` rather than importing `<Button variant="..." size="...">`.
3. **Mock Settings Controls**: The Settings page implements complete visual cards for 2FA, session management, storage quotas, and profile inputs, but none are wired to a backend.
4. **Dashboard Canvas Incompletion**: Widgets in `DashboardCanvas.tsx` have `draggable` attributes, but no drag-over or drop handlers are implemented.

---

## 45. Unused / Orphaned Assets

| Asset Path | Classification | Rationale |
|---|---|---|
| `public/assets/images/backgrounds/hero-isometric.png` | Confirmed Unused | 1280x720 raster graphic; no matching imports or `<img>` references in `src/`. |
| `public/assets/branding/logos/datavista-banner.png` | Possibly Unused | High-res marketing banner; suitable for OpenGraph meta tags but unreferenced in code. |
| `public/assets/branding/logos/datavista-logo-dark.png` | Confirmed Unused | Raster logo; UI uses dynamic `DataVistaLogo.tsx` SVG component exclusively. |
| `public/assets/branding/logos/datavista-logo-light.png`| Confirmed Unused | Raster logo; UI uses dynamic `DataVistaLogo.tsx` SVG component exclusively. |
| `public/assets/icons/social/icons-sprite.svg` | Possibly Unused | SVG sprite for social platforms; no `<use href="...">` references found. |
| `public/assets/illustrations/system/illustration-upload-success.svg` | Confirmed Unused | Success graphic present in asset folder but omitted from upload success dialog. |

---

## 46. Design QA Checklist

Use this checklist during code reviews and UI validation:

### Typography
- [ ] Primary font resolves to `'Inter', sans-serif`.
- [ ] Font weights strictly adhere to Medium (500), SemiBold (600), Bold (700), or ExtraBold (800).
- [ ] Numbers in tables and metric cards use monospace tabular alignment.
- [ ] Card titles render at exactly `17px` font size with SemiBold weight.

### Spacing & Layout
- [ ] Main viewport height is locked to `100vh` without double vertical scrollbars.
- [ ] Sidebar collapses smoothly between `220px` and `72px` within `200ms`.
- [ ] Main content area respects `max-w-[1600px]` centered constraint.
- [ ] Card interior padding is consistently `p-6` (`p-4` on mobile).

### Colors & Themes
- [ ] Primary buttons render in `#2563EB` (Light) or `#3B82F6` (Dark).
- [ ] Dark mode toggling via `Settings.tsx` applies appropriate class (`dark`, `extra-dark`, `cobalt-dark`) to `<html>`.
- [ ] All borders use `--color-border` (`#E2E8F0` / `#27272A`) rather than arbitrary grays.

### Components & States
- [ ] Buttons display an active state (`active:scale-95` or `scale-[0.98]`).
- [ ] Form inputs display primary focus rings on selection.
- [ ] Empty state illustrations render when datasets are not active.
- [ ] 3D Canvas pauses rendering immediately when the browser tab is hidden.

---

## 47. Current Design Completion Status

| Design Area | Implementation Status | Summary Assessment |
|---|---|---|
| **Theme System** | `COMPLETE` | 4 distinct themes with dynamic localStorage persistence and CSS variables. |
| **Typography System** | `COMPLETE` | Consistent scale based on `Inter` with documented sizes and weights. |
| **Component Primitives** | `PARTIALLY_DEFINED` | Shared components exist in `src/components/ui/`, but several views use inline button rewrites. |
| **Responsive Architecture**| `COMPLETE` | Robust AppShell drawer on mobile, multi-breakpoint grids on desktop. |
| **Asset Library** | `PARTIALLY_DEFINED` | High-quality 50-asset directory exists, but many assets remain unreferenced or duplicated inline. |
| **Motion & Animation** | `COMPLETE` | Custom GPU-accelerated keyframe floating animations implemented in CSS. |
| **Visual Inconsistency** | `INCONSISTENT` | Major divergence between Login (Blue) and Signup (Purple), and Tailwind v3 vs v4. |
| **Accessibility** | `PARTIALLY_DEFINED` | High text contrast and semantic HTML, but lacks reduced-motion overrides and focus trapping. |

---

## 48. Recommendations

1. **Harmonize Authentication Screens**: Update `src/views/Signup.tsx` to match `Login.tsx` by replacing Purple (`#8B5CF6`) with Royal Blue (`#2563EB`), unifying border radii at `rounded-2xl` or `rounded-3xl`, and standardizing card shadows.
2. **Consolidate Tailwind Configuration**: Remove unused `tailwind.config.js` and duplicate `src/index.css` to prevent developer confusion and eliminate conflicting color definitions.
3. **Include Upload Route in Sidebar**: Add a dedicated navigation link for `/upload-dataset` in `src/components/app-shell/Sidebar.tsx`.
4. **Standardize Border Radii**: Replace arbitrary `rounded-[10px]` on `Card.tsx` with a standard token (`rounded-xl` / 12px) aligned with buttons and form fields.
5. **Connect Asset Files**: Refactor `Login.tsx` and `Signup.tsx` to consume external SVG files from `/assets/icons/custom/` rather than hardcoding large inline SVG blocks.
6. **Implement `prefers-reduced-motion`**: Add CSS media queries in `globals.css` to disable continuous floating animations (`floatSlow`, `floatDelayed`, `glowPulse`) for accessibility compliance.

---

## 49. Open Questions / Unknowns

1. **Target Brand Color for Signup**: Was the purple styling in `Signup.tsx` intentional to differentiate the registration workflow, or is it an unmigrated legacy prototype? *(Recommendation: Unify to `#2563EB`)*.
2. **Canvas Drag-and-Drop Implementation**: What is the intended data format and layout engine for widgets dropped onto `DashboardCanvas.tsx`? *(Status: Currently placeholder UI)*.
3. **Sidebar Default Preference**: Should the collapsed sidebar state (`72px`) persist per user account in Supabase or remain in client `localStorage`?

---

## 50. Final Design Snapshot

### Brand & Character
DataVista is an enterprise analytics platform characterized by high-density data visualizations balanced by clean zero-gravity floating animations. Its signature visual anchor is the dynamic "DV Data Peak" logo featuring rising bar charts in Cyan, Blue, and Violet.

### Core Visual Constants
- **Primary Color**: Royal Blue (`#2563EB` light / `#3B82F6` dark).
- **Surface & Canvas**: `#FFFFFF` / `#F8FAFC` (Light), `#18181B` / `#09090B` (Dark).
- **Typography**: `Inter`, sans-serif. Key weights: 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
- **Primary Radius**: 12px (`rounded-xl`) on controls, 16px (`rounded-2xl`) on containers.
- **Elevation**: Subtle borders (`border-border`) paired with soft drop shadows (`shadow-card`, `shadow-2xl`).

### Highest-Priority Design Work
1. Resolve the visual discrepancy between Login and Signup.
2. Remove redundant `tailwind.config.js` and `src/index.css` files.
3. Add the `/upload-dataset` route to the AppShell sidebar navigation.
4. Replace hardcoded cricket mock data in dashboard recent files with live dataset context.
