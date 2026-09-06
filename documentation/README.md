# DataVista Documentation Suite

Welcome to the official technical documentation, architecture specifications, and design system repository for **DataVista**.

---

## Documentation Index

| Document | Description | Format / Version |
|---|---|---|
| [**PRD.md**](./PRD.md) | **Product Requirements Document**: Vision, user personas, hybrid local-first + cloud-synced architecture, 10-table relational schema, 31+ functional requirements (`FR-INGEST-*` to `FR-WORKSPACE-*`), and roadmap. | Markdown (v2.4.0) |
| [**SRS.md**](./SRS.md) | **Software Requirements Specification**: System architecture diagrams, 11 screen specifications, dual-tier data pipelines (client + Deno Edge Functions), data contracts, and non-functional requirements. | Markdown (v2.4.0) |
| [**design.md**](./design.md) | **Design System & UI Specification**: Visual tokens, 4 theme palettes, 12-column canvas coordinates (`layout_x/y/w/h`), typography scale, component specs, asset catalog, and QA checklists. | Markdown (v2.4.0) |

---

## 3-Tier Repository Organization

```text
DataVista/ (Repository Root)
├── DataVista/                        # [Tier 1] Next.js 16 Application Source Code
│   ├── public/                       # Static brand logos, icons, illustrations, favicons
│   │   └── assets/                   # Vector SVGs, PNG banners, and empty-state graphics
│   └── src/                          # App Router views, components, contexts, and lib
│
├── supabase/                         # [Tier 2] Supabase Database & Serverless Functions
│   ├── migrations/                   # 10-table PostgreSQL schema migrations & RLS policies
│   │   └── 20260904000001_initial_schema.sql # Profiles, Workspaces, Datasets, Dashboards, Reports
│   ├── functions/                    # Deno Edge Functions
│   │   ├── clean-dataset/            # Serverless data cleaning (duplicates, nulls, outliers)
│   │   └── generate-insights/        # Automated statistical analysis & chart recommendations
│   └── README.md                     # Supabase setup & CI/CD deployment guide
│
├── documentation/                    # [Tier 3] Technical Specifications & Design System
│   ├── PRD.md                        # Product Requirements Document
│   ├── SRS.md                        # Software Requirements Specification
│   ├── design.md                     # Visual Design System & UI Specification
│   └── README.md                     # This documentation portal index
│
└── .github/                          # Automated CI/CD Pipelines
    └── workflows/
        └── supabase-ci-cd.yml        # Auto-deploy migrations & edge functions on push to main
```

For engineering instructions on local development, see the root [`README.md`](../README.md).  
For database schema migrations and Edge Functions, see [`supabase/README.md`](../supabase/README.md).
