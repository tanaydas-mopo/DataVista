# DataVista — Design System & Asset Specification

This document defines the official visual design system, brand identity, color tokens, typography, iconography, and asset library standards for the **DataVista** platform.

---

## 1. Brand Identity & Logo System

### 1.1 The Brand Mark ("DV" + Rising Peaks)
The DataVista core mark merges the monogram **DV** with a three-bar ascending trendline representing data intelligence, velocity, and metric transformation.
- **Letter D**: Outlined geometric bow with rounded exterior corners and precision vertical stem.
- **Letter V**: Angled chevron integrating with the data flow.
- **Rising Bar Chart Peaks**: Three rounded vertical bars at ascending heights:
  - Peak 1 (Short): Cyan gradient (`#0EA5E9` → `#38BDF8`)
  - Peak 2 (Medium): Royal Blue gradient (`#2563EB` → `#60A5FA`)
  - Peak 3 (Tall): Purple/Violet gradient (`#7C3AED` → `#C084FC`)

### 1.2 Official Logo Variants
| Asset | Path | Context & Usage |
|---|---|---|
| **Primary Logo** | `/assets/branding/logos/logo-primary.svg` | Standard light-background navigation & hero banners. Contains DV mark and "Data" (Dark Slate `#0F172A`) + "Vista" (Primary Blue `#2563EB`). |
| **Dark Theme Logo** | `/assets/branding/logos/logo-dark.svg` | High-contrast variant for Midnight Slate, OLED Charcoal, and Cobalt Navy dark themes. "Data" in `#FAFAFA`, "Vista" in `#3B82F6`. |
| **Pure White Logo** | `/assets/branding/logos/logo-white.svg` | Monochrome white silhouette for high-contrast inverted cards, dark print, and footer accents. |
| **Monochrome Logo** | `/assets/branding/logos/logo-monochrome.svg` | Single-color dark (`#0F172A`) for grayscale print, export headers, and letterheads. |
| **Standalone Mark** | `/assets/branding/logos/logo-mark.svg` | Square mark without typography for collapsed sidebars, avatars, and compact badges. |
| **Favicon SVG** | `/assets/branding/favicons/favicon.svg` (and `/favicon.svg`) | Scalable vector tab icon with squircle container optimized for light and dark browser tabs. |
| **Browser Favicon** | `/assets/branding/favicons/favicon.ico` (and `/favicon.ico`) | Multi-resolution Windows & browser ICO container (256×256, 128×128, 64×64, 48×48, 32×32, 16×16). |
| **Apple Touch Icon** | `/assets/branding/favicons/apple-touch-icon.png` (and `/apple-touch-icon.png`) | 180×180 raster icon for iOS Safari home screen bookmarks. |
| **PWA App Icons** | `/assets/branding/app-icons/icon-192.png`, `icon-512.png` | Standard progressive web app install icons. |

---

## 2. Color Palette & Design Tokens

### 2.1 Core Semantic Colors
```css
/* Light Theme Defaults */
--color-primary: #2563EB;          /* Royal Blue */
--color-primary-hover: #1D4ED8;    /* Darker Blue */
--color-primary-soft: #EFF6FF;     /* Subtle Tint */

--color-secondary: #14B8A6;        /* Teal */
--color-secondary-soft: #F0FDFA;

--color-accent: #F59E0B;           /* Amber / Warning */
--color-accent-soft: #FFFBEB;

--color-success: #10B981;          /* Emerald */
--color-success-soft: #ECFDF5;

--color-danger: #EF4444;           /* Coral Red */
--color-danger-soft: #FEF2F2;

--color-purple: #8B5CF6;           /* Violet */
--color-purple-soft: #F5F3FF;
```

### 2.2 Surface & Canvas System
- **Light Theme**:
  - Background: `#F8FAFC` (`slate-50`)
  - Surface Card: `#FFFFFF` with border `#E2E8F0`
  - Text Primary: `#0F172A` (`slate-900`)
  - Text Secondary: `#475569` (`slate-600`)
- **Midnight Dark**:
  - Background: `#09090B` (`zinc-950`)
  - Surface Card: `#18181B` (`zinc-900`)
  - Text Primary: `#FAFAFA`
- **OLED Charcoal**:
  - Background: `#050505`
  - Surface Card: `#121215`
- **Cobalt Navy**:
  - Background: `#0B132B`
  - Surface Card: `#1C2541`

---

## 3. Typography

- **Primary Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Weights**:
  - `font-medium` (500) — Input placeholders, helper captions
  - `font-semibold` (600) — Field labels, table cells, metric badges
  - `font-bold` (700) — Section headers, card titles, button labels
  - `font-extrabold` (800) — Brand titles, page headings, KPI figures

---

## 4. Iconography Standards

### 4.1 UI Icons
- Built with `lucide-react` (version `^1.25.0`).
- Stroke width: `1.5` to `2.0`.
- All standard actions (navigation, filters, sorting, downloads) consume Lucide components to prevent icon font bloat.

### 4.2 Brand & OAuth Custom Vectors
- Stored under `public/assets/icons/custom/`:
  - `icon-google.svg`: Official 4-color Google authentication emblem.
  - `icon-github.svg`: Vector mark for GitHub OAuth.

### 4.3 Social & Community Vectors
- Stored under `public/assets/icons/social/`:
  - `icon-discord.svg`: Community Discord vector mark.
  - `icon-x.svg`: Official X / Twitter logo mark.
  - `icon-bluesky.svg`: Bluesky social emblem.
  - `icons-sprite.svg`: Combined SVG symbol sprite for multi-icon use.

---

## 5. Illustrations & Visual States

Vector SVG illustrations are preferred over raster graphics for crispness across 4K, Retina, and standard DPI displays.

| Illustration | File Path | Description |
|---|---|---|
| **Empty Dashboard** | `/assets/illustrations/empty-states/illustration-empty-dashboard.svg` | Clean analytics card mockup with ascending bars, trendline curve, and subtle sparkles. |
| **Empty Data Table** | `/assets/illustrations/empty-states/illustration-empty-data.svg` | Stylized data sheet with upload badge for missing dataset schemas. |
| **Empty Chart Builder** | `/assets/illustrations/empty-states/illustration-empty-chart.svg` | Coordinate axes with scatter nodes and selector badge for visual builder. |
| **Upload Success** | `/assets/illustrations/system/illustration-upload-success.svg` | Isometric ingested data cube with verified emerald shield badge. |
| **System 404** | `/assets/illustrations/system/illustration-error-404.svg` | Gradient dimensional 404 typography with radar lens inspecting missing routes. |

---

## 6. Backgrounds & Dynamic Visuals

1. **3D Interactive Background**: Implemented via `<ThreeDAbstractBackground />` (`Canvas` rendering 5 floating spheres with mouse tracking and dynamic dark mode reactivity).
2. **Ambient Glowing Orbs**: CSS blur filters (`blur-3xl`) with brand tints (`blue-500/20`, `purple-500/20`, `cyan-400/15`).
3. **Tech Grid Pattern**: `/assets/images/backgrounds/bg-grid-pattern.svg` (subtle vector grid pattern for auth screens and dropzones).
4. **Isometric Platform**: `/assets/images/backgrounds/hero-isometric.png` (3D platform asset).

---

## 7. Asset Organization

All static assets reside under `public/assets/`:
```text
public/assets/
├── branding/
│   ├── logos/
│   ├── favicons/
│   └── app-icons/
├── icons/
│   └── custom/
├── illustrations/
│   ├── empty-states/
│   └── system/
├── images/
│   ├── avatars/
│   └── backgrounds/
└── README.md
```
