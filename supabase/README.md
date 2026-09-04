# DataVista Supabase Backend Infrastructure

This directory contains the database schema, Postgres migrations, Row Level Security (RLS) policies, and Deno Edge Functions for **DataVista**.

---

## Directory Layout

```text
supabase/
├── migrations/           # Versioned, reproducible SQL migrations
│   └── 20260904000001_initial_schema.sql  # Exact schema from Supabase SQL Editor
├── functions/            # Serverless Edge Functions (Deno + TypeScript)
│   ├── clean-dataset/    # Server-side data cleaning (duplicates, nulls, outliers)
│   └── generate-insights/# Statistical profiling & visualization recommendations
└── README.md             # This guide
```

---

## Database Architecture Overview

The database implements a multi-tenant workspace model:

| Table | Source Screen / Module | Purpose |
|---|---|---|
| `public.profiles` | Authentication (`Login.tsx`, `Signup.tsx`) | User accounts extending `auth.users` with full name and avatar. |
| `public.workspaces` | Workspace Switcher / Management | Groups datasets, dashboards, and charts into collaborative workspaces. |
| `public.workspace_members` | Workspace Settings | Role-based access control (`admin`, `editor`, `viewer`). |
| `public.datasets` | Data Ingestion (`UploadDataset.tsx`) | Uploaded data source files, storage paths, status, and row counts. |
| `public.dataset_columns` | Data Schema (`DataSchema.tsx`) | Parsed column names, inferred data types, null %, and sample data. |
| `public.transformations` | Clean & Transform (`CleanTransform.tsx`) | Ordered cleaning steps, operation types, and JSON configuration. |
| `public.visualizations` | Visual Builder (`VisualBuilder.tsx`) | Chart definitions, chart types, X/Y axes, and aggregation configs. |
| `public.dashboards` | Dashboard Overview & Canvas | Canvas dashboards belonging to workspaces. |
| `public.dashboard_widgets` | Dashboard Canvas (`DashboardCanvas.tsx`) | Grid widgets on canvas with layout coordinates (`layout_x/y/w/h`). |
| `public.reports` | Export & Report (`ExportReport.tsx`) | Generated PDF, CSV, or PNG report exports and storage URLs. |

---

## Automated CI/CD Pipeline (GitHub Actions)

A fully automated CI/CD workflow is located in [`.github/workflows/supabase-ci-cd.yml`](../.github/workflows/supabase-ci-cd.yml).

### How it Works:
1. **On Pull Requests** modifying `supabase/**`:
   - Validates SQL migration filenames and validates that all Edge Functions contain an `index.ts` entrypoint.
2. **On Push to `main`**:
   - Links your remote Supabase project.
   - Pushes all new SQL migrations via `supabase db push`.
   - Iterates through all subdirectories in `supabase/functions/` and deploys each Edge Function (`clean-dataset`, `generate-insights`, etc.) via `supabase functions deploy`.

### Setting Up Required GitHub Secrets:
In your GitHub repository, navigate to **Settings** $\to$ **Secrets and variables** $\to$ **Actions** and add:

| Secret Name | Where to Find It | Purpose |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | [Supabase Account Tokens](https://supabase.com/dashboard/account/tokens) | Authenticates CLI to deploy migrations and functions |
| `SUPABASE_PROJECT_ID` | Project Settings $\to$ General $\to$ Reference ID | Target Supabase cloud project ID (e.g. `abcdefghijklm`) |
| `SUPABASE_DB_PASSWORD` | Project Settings $\to$ Database $\to$ Password | Database password for applying migrations |

---

## Local Development Commands

### 1. Start Local Supabase
From the repository root:
```bash
supabase start
```
Boot local Postgres database, Auth server, and Supabase Studio at `http://localhost:54323`.

### 2. Reset and Apply Migrations
```bash
supabase db reset
```

### 3. Test Edge Functions Locally
```bash
supabase functions serve
```

### 4. Manual Deployment
```bash
supabase link --project-ref <your-project-id>
supabase db push
supabase functions deploy clean-dataset
supabase functions deploy generate-insights
```
