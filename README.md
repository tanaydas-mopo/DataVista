<div align="center">

# 📊 DataVista

**Modern Interactive Data Analytics, Visual Chart Builder & Reporting Portal**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#deployment">Deployment</a>
</p>

</div>

---

## 🌟 Overview

**DataVista** is an enterprise-grade, high-performance data analytics and visualization portal built with Next.js 16 App Router, React 19, and Tailwind CSS v4.

DataVista transforms raw tabular datasets (CSV, Excel, JSON) into interactive visual dashboards and publication-ready analytical reports. Designed with a sleek cyber-data aesthetic, it provides an intuitive visual workflow from ingestion and data wrangling to custom chart composition, dashboard canvas design, and live PDF/PNG/CSV exporting.

---

## ✨ Key Features

### 📂 1. Multi-Format Dataset Ingestion
- **Universal File Parsing**: Instant drag-and-drop parsing for `.csv`, `.xlsx`, `.xls`, and `.json` files powered by SheetJS.
- **Smart Schema Inference**: Automatic detection of column data types, delimiters, date formats, and nullability.
- **Dataset Switcher & Management**: Work with multiple datasets seamlessly, switch active datasets on the fly, or load curated demo datasets (e.g., Premier League 2024 Analytics).

### 🔍 2. Data Schema Explorer
- **Deep Column Profiling**: View detailed statistical summaries (mean, min, max, distinct counts, missing value percentages).
- **Type Casting & Field Renaming**: Coerce and cast columns between string, numeric, boolean, and date formats.
- **Data Quality Indicators**: Visual null/completeness gauges for every column.

### ⚡ 3. Clean & Transform Pipeline
- **Interactive Data Wrangling**:
  - **Imputation**: Handle missing data via mean, median, mode, forward-fill, backward-fill, or drop rows.
  - **Outlier Filtering**: Statistical IQR and standard deviation outlier detection and truncation.
  - **Column Operations**: Rename, drop, filter, and apply custom mathematical transformations.
  - **String Manipulation**: Trim, change casing, extract substrings, and normalize text fields.
- **Step-by-Step History**: Visual transformation step pipeline with full undo and redo capability.

### 📈 4. Visual Chart Builder
- **Dynamic Recharts Engine**:
  - Bar Charts (Vertical, Horizontal, Stacked, Grouped)
  - Line & Multi-Line Trend Charts
  - Area Charts (Gradient-filled, Stacked)
  - Scatter & Correlation Plots
  - Pie, Donut & Radial Charts
  - Radar & Composed Charts
- **Intuitive Mapping**: Drag-and-drop or select X-axis dimensions, Y-axis metrics, aggregation types (`SUM`, `AVG`, `COUNT`, `MIN`, `MAX`), and sorting order.
- **Granular Styling Controls**: Custom color palettes, dark/light theme gradients, gridline toggles, custom tooltips, legends, and reference thresholds.
- **One-Click Pin to Dashboard**: Save any customized visualization directly to the dashboard canvas.

### 📋 5. Dashboard Canvas
- **Draggable & Resizable Grid Layout**: Organize charts, summary metric cards (KPIs), and tabular widgets.
- **Global Synchronized Filtering**: Filter across all widgets simultaneously by date range, category, or threshold.
- **Multi-Dashboard Workspace**: Create and manage separate workspaces for executive overviews, marketing metrics, and sales analytics.

### 📄 6. Live Report Studio & Real Exports
- **Real Multi-Format Exporting**:
  - **PDF Reports**: Generate and download formatted PDF reports with custom metadata and embedded charts.
  - **High-Res PNG Snapshots**: Export pixel-perfect individual chart snapshots for presentations.
  - **Clean CSV Data**: Export filtered, cleaned, or aggregated datasets directly to disk.
- **Report Studio Customizer**: Add titles, executive summaries, analyst notes, and select specific visualizations to include in generated exports.

### 🔐 7. Authentication & Theming
- **Supabase Integration**: Secure user authentication (Email/Password & Social OAuth) supporting both local fallback and cloud synchronization.
- **Cyber-Data Themes**: Built-in themes including Light, Dark, Cobalt, and Extra-Dark with smooth 60fps micro-animations.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) | App Router, Turbopack, Fast Refresh, Static Prerendering |
| **Library** | [React 19](https://react.dev/) | React Server Components, Suspense, Hooks |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) | Strict type safety, interface-driven architecture |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS variable design tokens, zero-runtime PostCSS |
| **Data Visualization** | [Recharts 3](https://recharts.org/) | Responsive SVG charting engine |
| **Data Parsing** | [SheetJS (xlsx)](https://docs.sheetjs.com/) | Client-side spreadsheet and tabular parsing |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, lightweight SVG icon system |
| **Auth & Backend** | [Supabase](https://supabase.com/) | User management, session persistence, cloud database |

---

## 📁 Project Structure

```text
DataVista/
├── public/
│   ├── favicon.ico                   # Multi-resolution browser icon (16px to 256px)
│   ├── favicon.svg                   # Scalable vector favicon
│   ├── apple-touch-icon.png          # iOS 180x180 touch icon
│   └── assets/
│       ├── branding/                 # Logos (light, dark, mark, monochrome) & app icons
│       ├── icons/                    # Custom third-party and social SVG icons
│       ├── illustrations/            # Empty states (dashboard, data, chart) and system SVGs
│       └── images/                   # Backgrounds (grid patterns, isometric graphics) & avatars
├── src/
│   ├── app/                          # Next.js App Router routes and layout
│   │   ├── (main)/                   # Core authenticated app views
│   │   │   ├── clean-transform/      # Data wrangling module
│   │   │   ├── dashboard/            # Dashboard overview
│   │   │   ├── dashboard-canvas/     # Freeform grid dashboard
│   │   │   ├── data-schema/          # Schema explorer & profiling
│   │   │   ├── export-report/        # PDF/PNG/CSV report exporter
│   │   │   ├── settings/             # User settings & themes
│   │   │   └── visual-builder/       # Custom chart generator
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   ├── upload-dataset/           # Dataset upload & ingestion
│   │   ├── globals.css               # Design tokens and Tailwind CSS rules
│   │   ├── layout.tsx                # Root layout, metadata & providers
│   │   └── not-found.tsx             # 404 error screen
│   ├── components/                   # Modular React components
│   │   ├── app-shell/                # Navigation, Header, Sidebar
│   │   ├── clean-transform/          # Wrangling operators & history panels
│   │   ├── dashboard/                # Dashboard widgets & charts
│   │   ├── export/                   # Export previewer & download handlers
│   │   ├── providers/                # Theme and App Context providers
│   │   ├── ui/                       # Reusable UI primitives (Buttons, Modals, Badges)
│   │   └── visual-builder/           # Chart config controls & Recharts adapters
│   ├── context/                      # React context providers (Auth, Dataset, Dashboard)
│   ├── types/                        # TypeScript domain definitions
│   └── utils/                        # Data transformation, parsing, formatting utilities
├── design.md                         # Full design system and brand specification
├── package.json
├── next.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18.0 or later (Node.js 20+ recommended)
- **npm** or **pnpm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tanaydas-mopo/DataVista.git
   cd DataVista
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` or `.env` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # or publishable key:
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Your Supabase project URL (e.g. `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous / public key for client-side queries. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Supabase publishable key format (`sb_publishable_...`). |

> *Note: If Supabase credentials are omitted, DataVista automatically operates in offline / local-storage mode with full access to parsing, transforming, charting, and exporting.*

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack on port 3000.
- `npm run build`: Compiles the application and generates optimized static pages for production.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs oxlint code inspection across `src/`.

---

## 🎨 Asset Library & Design System

DataVista features an organized asset repository in `/public/assets` including:
- **Official Brand Logos**: Full vector marks in primary, dark, white, and monochrome editions.
- **Multi-Resolution Favicons**: High-fidelity `.ico` (16px to 256px), `.svg`, and Apple touch icons.
- **Empty States**: Customized SVG illustrations for empty dashboards, charts, and datasets.

For design tokens, typography, and color codes, refer to [`design.md`](./design.md) and [`public/assets/README.md`](./public/assets/README.md).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
