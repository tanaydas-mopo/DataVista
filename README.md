<div align="center">

<img src="./DataVista/public/assets/branding/logos/datavista-banner.png" alt="DataVista — Modern Data Analytics & Visualization Portal" width="480" />

<br />
<br />

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
  <a href="#documentation">Documentation</a> •
  <a href="#supabase-backend">Supabase Backend</a>
</p>

</div>

---

## 🌟 Overview

**DataVista** is an enterprise-grade, high-performance data analytics and visualization portal built with Next.js 16 App Router, React 19, and Tailwind CSS v4, backed by Supabase Postgres.

DataVista transforms raw tabular datasets (CSV, Excel, JSON) into interactive visual dashboards and publication-ready analytical reports. Designed with a sleek cyber-data aesthetic, it provides an intuitive visual workflow from ingestion and data wrangling to custom chart composition, dashboard canvas design, and live PDF/PNG/CSV exporting.

---

## 📁 Project Structure

The repository is organized into three decoupled, dedicated tiers:

```text
DataVista/ (Repository Root)
├── DataVista/                        # [Tier 1] Next.js 16 Application Source Code
│   ├── public/                       # Static brand logos, icons, illustrations, favicons
│   │   └── assets/                   # Vector SVGs, PNG banners, and empty-state graphics
│   ├── src/                          # Application source code
│   │   ├── app/                      # App Router routes, layouts, and page views
│   │   │   ├── (main)/               # Core authenticated views (dashboard, visual-builder, etc.)
│   │   │   ├── login/                # Authentication login screen
│   │   │   ├── signup/               # Registration screen
│   │   │   ├── upload-dataset/       # Ingestion dropzone screen
│   │   │   └── globals.css           # Tailwind v4 @theme design tokens
│   │   ├── components/               # UI primitives, app-shell navigation, dashboard widgets
│   │   ├── context/                  # React contexts (DatasetContext, AuthContext)
│   │   ├── lib/                      # Supabase client and utility helpers
│   │   └── views/                    # View implementation components
│   ├── package.json                  # Next.js app dependencies and scripts
│   ├── tsconfig.json                 # TypeScript compiler configuration
│   ├── next.config.ts                # Next.js framework configuration
│   └── .env                          # Frontend environment variables
│
├── supabase/                         # [Tier 2] Supabase Database & Serverless Functions
│   ├── migrations/                   # Postgres schema migrations & RLS policies
│   │   └── 20260904000001_initial_schema.sql # Profiles, Workspaces, Datasets, Dashboards, Reports
│   ├── functions/                    # Deno Edge Functions
│   │   ├── clean-dataset/            # Server-side data cleaning (duplicates, nulls, outliers)
│   │   └── generate-insights/        # Automated statistical analysis & chart recommendations
│   └── README.md                     # Supabase setup & CI/CD deployment guide
│
├── documentation/                    # [Tier 3] Technical Specifications & Design System
│   ├── PRD.md                        # Product Requirements Document (31 sections)
│   ├── SRS.md                        # Software Requirements Specification (37 sections)
│   ├── design.md                     # Visual Design System & UI Specification (50 sections)
│   └── README.md                     # Documentation suite portal index
│
├── .github/                          # Automated CI/CD Pipelines
│   └── workflows/
│       └── supabase-ci-cd.yml        # Auto-deploy migrations & edge functions on push to main
├── .gitignore                        # Git exclusion rules
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.18.0 or later (Node.js 20+ recommended)
- **npm** or **pnpm** or **yarn**

### Quickstart

1. **Navigate into the application folder**:
   ```bash
   cd DataVista
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   In `DataVista/.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Application Scripts (Inside `DataVista/`)

From the `DataVista/` folder, you can run:

| Command | Action |
|---|---|
| `npm run dev` | Runs the Next.js development server with Turbopack on port 3000 |
| `npm run build` | Compiles the Next.js production build |
| `npm run start` | Boots the Next.js production server |
| `npm run lint` | Runs TypeScript / ESLint checks across `src/` |

---

## 📖 Documentation

All technical and architectural documentation is maintained in the [`documentation/`](./documentation) directory:

- [**Product Requirements Document (PRD.md)**](./documentation/PRD.md): Vision, user personas, 31 core functional requirements, and roadmap.
- [**Software Requirements Specification (SRS.md)**](./documentation/SRS.md): System architecture diagrams, 11 screen specs, data pipelines, and non-functional requirements.
- [**Design System & UI Specification (design.md)**](./documentation/design.md): 50-section single source of truth for color tokens, 4 themes, typography, and component specifications.

---

## ⚡ Supabase Backend

The backend is fully specified in [`supabase/`](./supabase):
- **Database Schema**: User profiles, dataset metadata, dashboards, charts, transformation history, and storage buckets.
- **Row Level Security (RLS)**: Enforces strict user isolation across all tables and file storage.
- **Edge Functions**: Automated data cleaning (`clean-dataset`) and AI-powered statistical insights (`generate-insights`).

For detailed commands on deploying to Supabase Cloud, refer to [`supabase/README.md`](./supabase/README.md).

---

## 📄 License

This project is licensed under the **MIT License**.
