-- ==============================================================================
-- DATA SCIENCE DIGITAL LIBRARY PORTAL - SUPABASE POSTGRESQL SCHEMA & SECURITY
-- Theme: MIDNIGHT INDIGO | Student: CHOWDA ANAND | Institution: MOHAN BABU UNIVERSITY
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'CHOWDA ANAND',
    college TEXT NOT NULL DEFAULT 'MOHAN BABU UNIVERSITY',
    branch TEXT NOT NULL DEFAULT 'CSE - Data Science',
    academic_year TEXT NOT NULL DEFAULT '3rd Year',
    project_title TEXT NOT NULL DEFAULT 'DATA SCIENCE DIGITAL LIBRARY PORTAL',
    roll_number TEXT DEFAULT '',
    email TEXT DEFAULT '',
    section TEXT DEFAULT '',
    skills TEXT DEFAULT 'Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, SQL',
    github_url TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    avatar_path TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXPERIMENTS TABLE (Prescribed Curriculum Definitions)
CREATE TABLE IF NOT EXISTS public.experiments (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- DS01 through DS10
    title TEXT NOT NULL,
    objective TEXT NOT NULL,
    description TEXT NOT NULL,
    required_libraries TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    instructions TEXT NOT NULL,
    output_expectations TEXT NOT NULL,
    status TEXT DEFAULT 'Not Started',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPERIMENT RUNS (Execution History & Telemetry)
CREATE TABLE IF NOT EXISTS public.experiment_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id INTEGER NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    experiment_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'Running', 'Completed', 'Failed')),
    execution_duration_ms INTEGER DEFAULT 0,
    stdout TEXT DEFAULT '',
    stderr TEXT DEFAULT '',
    exit_code INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPERIMENT OUTPUTS (Uploaded Artifacts, Visualizations, and Logs)
CREATE TABLE IF NOT EXISTS public.experiment_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id INTEGER NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
    experiment_code TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each student accesses only their own private records and files
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_outputs ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read of academic identity, authenticated owner update
CREATE POLICY "Public profiles viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Experiments: Read-only for all authenticated students
CREATE POLICY "Allow authenticated read of experiments"
    ON public.experiments FOR SELECT
    TO authenticated
    USING (true);

-- Experiment Runs: Isolated per student
CREATE POLICY "Students can view own experiment runs"
    ON public.experiment_runs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own experiment runs"
    ON public.experiment_runs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Experiment Outputs: Private file metadata
CREATE POLICY "Students can view own outputs"
    ON public.experiment_outputs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own outputs"
    ON public.experiment_outputs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete own outputs"
    ON public.experiment_outputs FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKETS (Private Output Storage & Avatars)
-- ==============================================================================
-- Run these in Supabase Storage configuration:
-- 1. Create a private bucket named 'experiment-outputs'
-- 2. Create a public or authenticated bucket named 'avatars'

-- Storage RLS for 'experiment-outputs':
-- Allow authenticated user to read files where path starts with their user_id:
-- CREATE POLICY "User files access" ON storage.objects FOR SELECT TO authenticated
-- USING (bucket_id = 'experiment-outputs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- CREATE POLICY "User files upload" ON storage.objects FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'experiment-outputs' AND (storage.foldername(name))[1] = auth.uid()::text);
