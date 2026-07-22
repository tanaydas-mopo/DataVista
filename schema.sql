-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WORKSPACES
-- Allows users to group datasets and dashboards into workspaces (like Power BI Workspaces)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS
-- Handles roles and access control within a workspace
CREATE TABLE workspace_members (
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer', -- e.g., 'admin', 'editor', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- 4. DATASETS
-- Represents data sources uploaded by users (from DataSchema.tsx)
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'ipl_matches_2024.csv'
    file_path TEXT, -- Path in Supabase Storage
    file_size_bytes BIGINT,
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded', 'processing', 'ready', 'failed'
    row_count INTEGER,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DATASET COLUMNS (SCHEMA)
-- Represents the parsed schema of a dataset (from DataSchema.tsx)
CREATE TABLE dataset_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(100) NOT NULL, -- e.g., 'String', 'Integer', 'Date'
    null_percentage DECIMAL(5,2),
    sample_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DATA TRANSFORMATIONS
-- Represents the cleaning and transformation steps applied to a dataset (from CleanTransform.tsx)
CREATE TABLE transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    operation_type VARCHAR(100) NOT NULL, -- e.g., 'drop_nulls', 'rename_column', 'change_type'
    config JSONB NOT NULL, -- The specific settings for the operation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. VISUALIZATIONS
-- Represents charts created from datasets (from VisualBuilder.tsx)
CREATE TABLE visualizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    chart_type VARCHAR(50) NOT NULL, -- 'bar', 'line', 'pie', 'scatter'
    config JSONB NOT NULL, -- Contains x-axis, y-axis, group-by, aggregation, etc.
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DASHBOARDS
-- Represents a canvas containing multiple widgets/visualizations (from DashboardCanvas.tsx)
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DASHBOARD WIDGETS
-- Represents individual elements on a dashboard canvas (from DashboardCanvas.tsx)
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL, -- 'chart', 'text', 'image', 'kpi'
    visualization_id UUID REFERENCES visualizations(id) ON DELETE SET NULL, -- Null if text/image/kpi
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
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    export_format VARCHAR(50) NOT NULL, -- 'pdf', 'csv', 'png'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    file_url TEXT, -- Path to the generated report in storage
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) basic policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Example Policy: Users can view workspaces they are members of
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_members 
            WHERE workspace_members.workspace_id = workspaces.id 
            AND workspace_members.user_id = auth.uid()
        )
    );
