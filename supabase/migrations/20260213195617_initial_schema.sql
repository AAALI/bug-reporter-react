-- QuickBugs — Initial Schema
-- 5 tables: organizations, members, projects, integrations, report_events
-- RLS enabled on all tables, scoped to org membership via auth.uid()

-- ============================================================
-- 1. Organizations
-- ============================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. Members (links Supabase Auth users → orgs)
-- ============================================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Projects
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  project_key TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL DEFAULT 'react',
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_min INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. Integrations (credentials stored in Vault)
-- ============================================================
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  vault_secret_id UUID NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, provider)
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. Report events (analytics + billing + rate limiting)
-- ============================================================
CREATE TABLE public.report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- Report info
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  capture_mode TEXT NOT NULL,
  has_screenshot BOOLEAN NOT NULL DEFAULT false,
  has_video BOOLEAN NOT NULL DEFAULT false,
  has_network_logs BOOLEAN NOT NULL DEFAULT false,
  has_console_logs BOOLEAN NOT NULL DEFAULT false,
  js_error_count INT NOT NULL DEFAULT 0,
  -- External tracker reference
  external_issue_id TEXT,
  external_issue_key TEXT,
  external_issue_url TEXT,
  -- Client environment
  user_agent TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT,
  screen_resolution TEXT,
  viewport TEXT,
  color_scheme TEXT,
  locale TEXT,
  timezone TEXT,
  connection_type TEXT,
  page_url TEXT,
  -- App context
  app_version TEXT,
  environment TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.report_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_members_user ON public.members(user_id);
CREATE INDEX idx_projects_key ON public.projects(project_key);
CREATE INDEX idx_projects_org ON public.projects(org_id);
CREATE INDEX idx_integrations_project ON public.integrations(project_id);
CREATE INDEX idx_events_project_time ON public.report_events(project_id, created_at);
CREATE INDEX idx_events_project_version ON public.report_events(project_id, app_version);
CREATE INDEX idx_events_project_browser ON public.report_events(project_id, browser_name);
CREATE INDEX idx_events_project_status ON public.report_events(project_id, status);

-- ============================================================
-- Helper: check if the current user belongs to an org
-- ============================================================
CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT org_id FROM public.members WHERE user_id = auth.uid();
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Organizations: members can read their own orgs
CREATE POLICY "members can view own orgs"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT public.user_org_ids()));

-- Organizations: any authenticated user can create (to bootstrap onboarding)
CREATE POLICY "authenticated users can create orgs"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organizations: owners can update
CREATE POLICY "owners can update orgs"
  ON public.organizations FOR UPDATE
  USING (id IN (
    SELECT org_id FROM public.members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- Members: members can view members in their orgs
CREATE POLICY "members can view org members"
  ON public.members FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()));

-- Members: any authenticated user can insert (to add themselves as owner during onboarding)
CREATE POLICY "authenticated users can create memberships"
  ON public.members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Members: owners can manage members
CREATE POLICY "owners can delete members"
  ON public.members FOR DELETE
  USING (org_id IN (
    SELECT org_id FROM public.members
    WHERE user_id = auth.uid() AND role = 'owner'
  ));

-- Projects: org members can read
CREATE POLICY "org members can view projects"
  ON public.projects FOR SELECT
  USING (org_id IN (SELECT public.user_org_ids()));

-- Projects: org members can create
CREATE POLICY "org members can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (org_id IN (SELECT public.user_org_ids()));

-- Projects: org members can update
CREATE POLICY "org members can update projects"
  ON public.projects FOR UPDATE
  USING (org_id IN (SELECT public.user_org_ids()));

-- Integrations: org members can read
CREATE POLICY "org members can view integrations"
  ON public.integrations FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE org_id IN (SELECT public.user_org_ids())
  ));

-- Integrations: org members can create
CREATE POLICY "org members can create integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (project_id IN (
    SELECT id FROM public.projects WHERE org_id IN (SELECT public.user_org_ids())
  ));

-- Integrations: org members can update
CREATE POLICY "org members can update integrations"
  ON public.integrations FOR UPDATE
  USING (project_id IN (
    SELECT id FROM public.projects WHERE org_id IN (SELECT public.user_org_ids())
  ));

-- Integrations: org members can delete
CREATE POLICY "org members can delete integrations"
  ON public.integrations FOR DELETE
  USING (project_id IN (
    SELECT id FROM public.projects WHERE org_id IN (SELECT public.user_org_ids())
  ));

-- Report events: org members can read (dashboard analytics)
CREATE POLICY "org members can view report events"
  ON public.report_events FOR SELECT
  USING (project_id IN (
    SELECT id FROM public.projects WHERE org_id IN (SELECT public.user_org_ids())
  ));

-- Report events: insert via service_role only (Edge Function)
-- No INSERT policy for anon/authenticated — the Edge Function uses service_role key