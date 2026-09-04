-- ==============================================================================
-- DataVista Database Schema Migration
-- Migration: 20260904000001_initial_schema.sql
-- Description: Exact schema from Supabase SQL Editor (Workspaces, Members, Datasets,
--              Dataset Columns, Transformations, Visualizations, Dashboards, Widgets, Reports)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. WORKSPACES
-- Allows users to group datasets and dashboards into workspaces (like Power BI Workspaces)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS
-- Handles roles and access control within a workspace
CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- e.g., 'admin', 'editor', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 4. DATASETS
-- Represents data sources uploaded by users (from DataSchema.tsx)
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'ipl_matches_2024.csv'
    file_path TEXT, -- Path in Supabase Storage
    file_size_bytes BIGINT,
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'ready', 'failed'
    row_count INTEGER,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DATASET COLUMNS (SCHEMA)
-- Represents the parsed schema of a dataset (from DataSchema.tsx)
CREATE TABLE IF NOT EXISTS public.dataset_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL, -- e.g., 'String', 'Integer', 'Date'
    null_percentage DECIMAL(5,2),
    sample_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DATA TRANSFORMATIONS
-- Represents the cleaning and transformation steps applied to a dataset (from CleanTransform.tsx)
CREATE TABLE IF NOT EXISTS public.transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    operation_type VARCHAR(100) NOT NULL, -- e.g., 'drop_nulls', 'rename_column', 'change_type'
    config JSONB NOT NULL, -- The specific settings for the operation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. VISUALIZATIONS
-- Represents charts created from datasets (from VisualBuilder.tsx)
CREATE TABLE IF NOT EXISTS public.visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    chart_type VARCHAR(50) NOT NULL, -- 'bar', 'line', 'pie', 'scatter'
    config JSONB NOT NULL, -- Contains x-axis, y-axis, group-by, aggregation, etc.
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DASHBOARDS
-- Represents a canvas containing multiple widgets/visualizations (from DashboardCanvas.tsx)
CREATE TABLE IF NOT EXISTS public.dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DASHBOARD WIDGETS
-- Represents individual elements on a dashboard canvas (from DashboardCanvas.tsx)
CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL, -- 'chart', 'text', 'image', 'kpi'
    visualization_id UUID REFERENCES public.visualizations(id) ON DELETE SET NULL, -- Null if text/image/kpi
    content JSONB, -- For text/image/kpi widget content
    layout_x INTEGER NOT NULL,
    layout_y INTEGER NOT NULL,
    layout_w INTEGER NOT NULL,
    layout_h INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. REPORTS
-- Represents exports or scheduled reports from dashboards (from ExportReport.tsx)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    export_format VARCHAR(50) NOT NULL, -- 'pdf', 'csv', 'png'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    file_url TEXT, -- Path to the generated report in storage
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Workspaces RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they are members of" ON public.workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = workspaces.id 
            AND public.workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
CREATE POLICY "Users can create workspaces" ON public.workspaces
    FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Workspace admins can update workspaces" ON public.workspaces;
CREATE POLICY "Workspace admins can update workspaces" ON public.workspaces
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = workspaces.id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Workspace admins can delete workspaces" ON public.workspaces;
CREATE POLICY "Workspace admins can delete workspaces" ON public.workspaces
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = workspaces.id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role = 'admin'
        )
    );

-- Workspace Members RLS
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view membership in their workspaces" ON public.workspace_members;
CREATE POLICY "Members can view membership in their workspaces" ON public.workspace_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.workspace_members wm
            WHERE wm.workspace_id = workspace_members.workspace_id
            AND wm.user_id = auth.uid()
        )
    );

-- Datasets RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view datasets in their workspaces" ON public.datasets;
CREATE POLICY "Users can view datasets in their workspaces" ON public.datasets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = datasets.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert datasets into their workspaces" ON public.datasets;
CREATE POLICY "Users can insert datasets into their workspaces" ON public.datasets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = datasets.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Users can update datasets in their workspaces" ON public.datasets;
CREATE POLICY "Users can update datasets in their workspaces" ON public.datasets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = datasets.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Users can delete datasets in their workspaces" ON public.datasets;
CREATE POLICY "Users can delete datasets in their workspaces" ON public.datasets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = datasets.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role = 'admin'
        )
    );

-- Dataset Columns RLS
ALTER TABLE public.dataset_columns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view columns of accessible datasets" ON public.dataset_columns;
CREATE POLICY "Users can view columns of accessible datasets" ON public.dataset_columns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.datasets d
            JOIN public.workspace_members wm ON wm.workspace_id = d.workspace_id
            WHERE d.id = dataset_columns.dataset_id
            AND wm.user_id = auth.uid()
        )
    );

-- Transformations RLS
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transformations of accessible datasets" ON public.transformations;
CREATE POLICY "Users can view transformations of accessible datasets" ON public.transformations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.datasets d
            JOIN public.workspace_members wm ON wm.workspace_id = d.workspace_id
            WHERE d.id = transformations.dataset_id
            AND wm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage transformations of accessible datasets" ON public.transformations;
CREATE POLICY "Users can manage transformations of accessible datasets" ON public.transformations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.datasets d
            JOIN public.workspace_members wm ON wm.workspace_id = d.workspace_id
            WHERE d.id = transformations.dataset_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('admin', 'editor')
        )
    );

-- Visualizations RLS
ALTER TABLE public.visualizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view visualizations in accessible workspaces" ON public.visualizations;
CREATE POLICY "Users can view visualizations in accessible workspaces" ON public.visualizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = visualizations.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage visualizations in accessible workspaces" ON public.visualizations;
CREATE POLICY "Users can manage visualizations in accessible workspaces" ON public.visualizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = visualizations.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role IN ('admin', 'editor')
        )
    );

-- Dashboards RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dashboards in accessible workspaces" ON public.dashboards;
CREATE POLICY "Users can view dashboards in accessible workspaces" ON public.dashboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = dashboards.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage dashboards in accessible workspaces" ON public.dashboards;
CREATE POLICY "Users can manage dashboards in accessible workspaces" ON public.dashboards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members 
            WHERE public.workspace_members.workspace_id = dashboards.workspace_id 
            AND public.workspace_members.user_id = auth.uid()
            AND public.workspace_members.role IN ('admin', 'editor')
        )
    );

-- Dashboard Widgets RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view widgets in accessible dashboards" ON public.dashboard_widgets;
CREATE POLICY "Users can view widgets in accessible dashboards" ON public.dashboard_widgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dashboards db
            JOIN public.workspace_members wm ON wm.workspace_id = db.workspace_id
            WHERE db.id = dashboard_widgets.dashboard_id
            AND wm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage widgets in accessible dashboards" ON public.dashboard_widgets;
CREATE POLICY "Users can manage widgets in accessible dashboards" ON public.dashboard_widgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dashboards db
            JOIN public.workspace_members wm ON wm.workspace_id = db.workspace_id
            WHERE db.id = dashboard_widgets.dashboard_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('admin', 'editor')
        )
    );

-- Reports RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reports in accessible dashboards" ON public.reports;
CREATE POLICY "Users can view reports in accessible dashboards" ON public.reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.dashboards db
            JOIN public.workspace_members wm ON wm.workspace_id = db.workspace_id
            WHERE db.id = reports.dashboard_id
            AND wm.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can manage reports in accessible dashboards" ON public.reports;
CREATE POLICY "Users can manage reports in accessible dashboards" ON public.reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.dashboards db
            JOIN public.workspace_members wm ON wm.workspace_id = db.workspace_id
            WHERE db.id = reports.dashboard_id
            AND wm.user_id = auth.uid()
            AND wm.role IN ('admin', 'editor')
        )
    );
