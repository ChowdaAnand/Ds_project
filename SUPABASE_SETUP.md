# Supabase Backend Configuration & Setup Guide

This project supports dual-mode architecture:
1. **Local Mode (Default & Active)**: Zero-dependency Python server with embedded SQLite (`student.db`), fully functional offline and for local demonstrations.
2. **Supabase Cloud Mode**: Hosted PostgreSQL, Supabase Auth, Row Level Security (RLS), and private Storage Buckets.

---

## Required Environment Variables

To link this application to a hosted Supabase project, create a `.env` file in the root of `Ds_project` or configure environment variables:

```bash
# Supabase Project URL (Public)
SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Public API Key (Safe for browser/frontend usage)
SUPABASE_ANON_KEY=eyJhbGciOi...your_anon_key

# DO NOT EXPOSE IN FRONTEND CODE:
# SUPABASE_SERVICE_ROLE_KEY is NEVER needed on the client.
```

---

## Database Migration Steps

1. Navigate to your **Supabase Dashboard** -> **SQL Editor**.
2. Open [supabase_schema.sql](file:///c:/Users/chowd/Desktop/Ds_project/supabase_schema.sql).
3. Paste and run the entire SQL script. This creates:
   - `profiles` table with user identity constraints.
   - `experiments` table pre-seeded with experiments `DS01` through `DS10`.
   - `experiment_runs` table with telemetry and foreign keys.
   - `experiment_outputs` table for uploaded artifacts.
   - RLS security policies restricting data to authenticated owners.

---

## Storage Bucket Configuration

1. In Supabase Dashboard, go to **Storage** -> **New Bucket**.
2. Create bucket: `experiment-outputs` (Private).
3. Create bucket: `avatars` (Public or Authenticated).
4. Apply the Row-Level Security policies documented at the bottom of `supabase_schema.sql`.

---

## Authentication Flow

When using Supabase Cloud:
- Students sign up or log in via `supabase.auth.signInWithPassword()`.
- The user's `auth.uid()` automatically scopes access to their own experiment runs and uploaded outputs.
- In Local Mode, authentication falls back smoothly to student identity `CHOWDA ANAND` (ID 1).
