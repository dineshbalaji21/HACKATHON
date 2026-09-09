-- ==============================================================================
-- Migration: 20260909141102_init-schema.sql
-- GovAction AI — Complete Production Backend Schema
-- ==============================================================================

-- 1. Departments Reference Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code);

-- Seed Standard Departments
INSERT INTO public.departments (name, code, description) VALUES
  ('Municipality', 'MUN', 'Municipal administration and civil infrastructure'),
  ('Sanitation', 'SAN', 'Sanitation and solid waste management'),
  ('Electrical', 'ELE', 'Street lighting and local electrical body'),
  ('Water Supply', 'WTR', 'Water distribution, drainage, and sewerage systems'),
  ('Roads & Highways', 'RDH', 'Pothole repair, pedestrian pavements, and road assets'),
  ('Revenue', 'REV', 'Revenue administration and land survey')
ON CONFLICT (code) DO NOTHING;

-- 2. Extended User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('citizen', 'officer', 'department_head', 'district_collector')),
  display_id VARCHAR(30) NOT NULL UNIQUE,
  employee_id VARCHAR(50) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  district VARCHAR(60) NOT NULL,
  area VARCHAR(100),
  address TEXT,
  designation VARCHAR(100),
  department_id UUID REFERENCES public.departments(id),
  office_location TEXT,
  verification_pin_hash TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON public.profiles(department_id);

-- 3. Master Complaints Table (Master Grievance Container)
CREATE TABLE IF NOT EXISTS public.complaints (
  id VARCHAR(30) PRIMARY KEY,
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  raw_description TEXT NOT NULL,
  voice_transcript TEXT,
  location_address TEXT NOT NULL,
  area VARCHAR(100) NOT NULL,
  street VARCHAR(150) NOT NULL,
  landmark VARCHAR(150),
  district VARCHAR(60) NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_multi_issue BOOLEAN DEFAULT FALSE,
  overall_status VARCHAR(30) DEFAULT 'Pending' CHECK (overall_status IN ('Pending', 'In Progress', 'Resolved', 'Solved', 'Overdue', 'Reopened')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_district ON public.complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(overall_status);

-- 4. Complaint Sub-Cases Table (Individual Action Tickets)
CREATE TABLE IF NOT EXISTS public.complaint_sub_cases (
  id VARCHAR(35) PRIMARY KEY,
  complaint_id VARCHAR(30) NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  issue_title VARCHAR(200) NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Solved', 'Overdue', 'Reopened')),
  sla_deadline TIMESTAMPTZ NOT NULL,
  expected_resolution_text VARCHAR(50),
  risk_score INTEGER DEFAULT 35 CHECK (risk_score BETWEEN 0 AND 100),
  reopen_count INTEGER DEFAULT 0,
  assigned_officer_id UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcases_complaint ON public.complaint_sub_cases(complaint_id);
CREATE INDEX IF NOT EXISTS idx_subcases_dept ON public.complaint_sub_cases(department_id);
CREATE INDEX IF NOT EXISTS idx_subcases_officer ON public.complaint_sub_cases(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_subcases_status ON public.complaint_sub_cases(status);
CREATE INDEX IF NOT EXISTS idx_subcases_deadline ON public.complaint_sub_cases(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_subcases_risk ON public.complaint_sub_cases(risk_score DESC);

-- 5. Threat Vector Risk Factors
CREATE TABLE IF NOT EXISTS public.complaint_risk_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_case_id VARCHAR(35) NOT NULL REFERENCES public.complaint_sub_cases(id) ON DELETE CASCADE,
  factor_name VARCHAR(150) NOT NULL,
  score_impact INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_factors_subcase ON public.complaint_risk_factors(sub_case_id);

-- 6. Attachments & Evidence
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id VARCHAR(30) NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  sub_case_id VARCHAR(35) REFERENCES public.complaint_sub_cases(id) ON DELETE SET NULL,
  storage_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(30) NOT NULL CHECK (file_type IN ('photo', 'video', 'document')),
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON public.complaint_evidence(complaint_id);

-- 7. Real-Time Chat & Communications
CREATE TABLE IF NOT EXISTS public.complaint_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_case_id VARCHAR(35) NOT NULL REFERENCES public.complaint_sub_cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_name VARCHAR(150) NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_subcase ON public.complaint_messages(sub_case_id, created_at ASC);

-- 8. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS public.complaint_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_case_id VARCHAR(35) NOT NULL REFERENCES public.complaint_sub_cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  actor_name VARCHAR(150) NOT NULL,
  action TEXT NOT NULL,
  status_snapshot VARCHAR(30) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_subcase ON public.complaint_audit_trail(sub_case_id, created_at DESC);

-- 9. Government Orders
CREATE TABLE IF NOT EXISTS public.gov_orders (
  id VARCHAR(30) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  district VARCHAR(60) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Archived')),
  target_deadline DATE NOT NULL,
  compliance_rate INTEGER DEFAULT 0 CHECK (compliance_rate BETWEEN 0 AND 100),
  issued_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gov_orders_district ON public.gov_orders(district);
CREATE INDEX IF NOT EXISTS idx_gov_orders_status ON public.gov_orders(status);

-- 10. Government Order Action Tasks
CREATE TABLE IF NOT EXISTS public.gov_order_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gov_order_id VARCHAR(30) NOT NULL REFERENCES public.gov_orders(id) ON DELETE CASCADE,
  sequence_index INTEGER NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
  assigned_officer_id UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_go_tasks_order ON public.gov_order_tasks(gov_order_id, sequence_index ASC);
CREATE INDEX IF NOT EXISTS idx_go_tasks_dept ON public.gov_order_tasks(department_id);

-- Trigger: Automatically Recalculate GO Compliance Rate
CREATE OR REPLACE FUNCTION public.recalculate_gov_order_compliance()
RETURNS TRIGGER AS $$
DECLARE
  v_order_id VARCHAR(30);
  v_total INT;
  v_completed INT;
  v_new_rate INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_order_id := OLD.gov_order_id;
  ELSE
    v_order_id := NEW.gov_order_id;
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'Completed')
  INTO v_total, v_completed
  FROM public.gov_order_tasks
  WHERE gov_order_id = v_order_id;

  IF v_total > 0 THEN
    v_new_rate := ROUND((v_completed::NUMERIC / v_total::NUMERIC) * 100);
  ELSE
    v_new_rate := 0;
  END IF;

  UPDATE public.gov_orders
  SET compliance_rate = v_new_rate,
      status = CASE WHEN v_new_rate = 100 THEN 'Completed' ELSE 'Active' END,
      updated_at = NOW()
  WHERE id = v_order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp;

DROP TRIGGER IF EXISTS trg_recalculate_go_compliance ON public.gov_order_tasks;
CREATE TRIGGER trg_recalculate_go_compliance
  AFTER INSERT OR UPDATE OR DELETE ON public.gov_order_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_gov_order_compliance();

-- 11. Real-Time System Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(150),
  text TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  alert_type VARCHAR(30) DEFAULT 'info' CHECK (alert_type IN ('info', 'warning', 'critical', 'resolution')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_sub_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.departments TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Policies: departments
CREATE POLICY "departments_read_all" ON public.departments
  FOR SELECT TO anon, authenticated USING (true);

-- Policies: profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid()) OR
    role IN ('officer', 'department_head', 'district_collector')
  );

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Policies: complaints
CREATE POLICY "complaints_select" ON public.complaints
  FOR SELECT TO authenticated
  USING (
    citizen_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('officer', 'department_head', 'district_collector')
        AND profiles.district = complaints.district
    )
  );

CREATE POLICY "complaints_insert" ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (citizen_id = (SELECT auth.uid()));

CREATE POLICY "complaints_update" ON public.complaints
  FOR UPDATE TO authenticated
  USING (
    citizen_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('officer', 'department_head', 'district_collector')
        AND profiles.district = complaints.district
    )
  );

-- Policies: complaint_sub_cases
CREATE POLICY "subcases_select" ON public.complaint_sub_cases
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_sub_cases.complaint_id
        AND complaints.citizen_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND (
          profiles.role = 'district_collector' OR
          (profiles.role = 'department_head' AND profiles.department_id = complaint_sub_cases.department_id) OR
          (profiles.role = 'officer' AND (complaint_sub_cases.assigned_officer_id = profiles.id OR complaint_sub_cases.department_id = profiles.department_id))
        )
    )
  );

CREATE POLICY "subcases_insert" ON public.complaint_sub_cases
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_sub_cases.complaint_id
        AND complaints.citizen_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('officer', 'department_head', 'district_collector')
    )
  );

CREATE POLICY "subcases_update" ON public.complaint_sub_cases
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE complaints.id = complaint_sub_cases.complaint_id
        AND complaints.citizen_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND (
          profiles.role = 'district_collector' OR
          (profiles.role = 'department_head' AND profiles.department_id = complaint_sub_cases.department_id) OR
          (profiles.role = 'officer' AND complaint_sub_cases.assigned_officer_id = profiles.id)
        )
    )
  );

-- Policies: complaint_risk_factors
CREATE POLICY "risk_factors_select" ON public.complaint_risk_factors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "risk_factors_insert" ON public.complaint_risk_factors
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policies: complaint_evidence
CREATE POLICY "evidence_select" ON public.complaint_evidence
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "evidence_insert" ON public.complaint_evidence
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = (SELECT auth.uid()));

-- Policies: complaint_messages
CREATE POLICY "messages_select" ON public.complaint_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "messages_insert" ON public.complaint_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

-- Policies: complaint_audit_trail
CREATE POLICY "audit_select" ON public.complaint_audit_trail
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "audit_insert" ON public.complaint_audit_trail
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policies: gov_orders & tasks
CREATE POLICY "gov_orders_select" ON public.gov_orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.district = gov_orders.district
    )
  );

CREATE POLICY "gov_orders_insert" ON public.gov_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'district_collector'
    )
  );

CREATE POLICY "gov_orders_update" ON public.gov_orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'district_collector'
    )
  );

CREATE POLICY "gov_order_tasks_select" ON public.gov_order_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "gov_order_tasks_write" ON public.gov_order_tasks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies: notifications
CREATE POLICY "notifications_user_own" ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
