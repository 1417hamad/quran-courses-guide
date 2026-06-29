-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- PROGRAMS TABLE
-- =========================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  program_type TEXT NOT NULL DEFAULT 'دورة قرآنية',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('حضوري', 'عن بُعد', 'هجين')),
  gender TEXT NOT NULL CHECK (gender IN ('رجال', 'نساء', 'رجال ونساء')),
  age_groups JSONB NOT NULL DEFAULT '[]',
  branches JSONB NOT NULL DEFAULT '[]',
  custom_branch TEXT,
  instructor_name TEXT,
  phone TEXT,
  show_phone BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  registration_url TEXT NOT NULL,
  maps_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE NOT NULL,
  schedule_days JSONB,
  start_time TIME,
  end_time TIME,
  fee_type TEXT NOT NULL CHECK (fee_type IN ('مجانية', 'مدفوعة')),
  fee_amount NUMERIC(10, 2),
  views_count BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'registration_open', 'registration_closed', 'ended', 'hidden', 'soft_deleted')
  ),
  is_active BOOLEAN NOT NULL DEFAULT true,
  hidden_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for programs
CREATE INDEX idx_programs_region ON programs (region) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_city ON programs (city) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_status ON programs (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_gender ON programs (gender) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_delivery_mode ON programs (delivery_mode) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_program_type ON programs (program_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_created_at ON programs (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_registration_deadline ON programs (registration_deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_views_count ON programs (views_count DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_slug ON programs (slug);
CREATE INDEX idx_programs_is_active ON programs (is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_deleted_at ON programs (deleted_at) WHERE deleted_at IS NOT NULL;

-- Full-text search index (Arabic)
CREATE INDEX idx_programs_fts ON programs USING GIN (
  to_tsvector('arabic', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(organization_name, ''))
) WHERE deleted_at IS NULL;

-- =========================================
-- PROGRAM REPORTS TABLE
-- =========================================
CREATE TABLE program_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'جديد' CHECK (
    status IN ('جديد', 'قيد المراجعة', 'مغلق', 'مرفوض')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT
);

CREATE INDEX idx_reports_program_id ON program_reports (program_id);
CREATE INDEX idx_reports_status ON program_reports (status);
CREATE INDEX idx_reports_created_at ON program_reports (created_at DESC);

-- =========================================
-- PROGRAM VIEWS TABLE (for deduplication)
-- =========================================
CREATE TABLE program_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, ip_hash)
);

CREATE INDEX idx_views_program_id ON program_views (program_id);
CREATE INDEX idx_views_created_at ON program_views (created_at);

-- Auto-cleanup old view records (older than 24h) via index
CREATE INDEX idx_views_cleanup ON program_views (created_at) WHERE created_at < NOW() - INTERVAL '24 hours';

-- =========================================
-- ADMIN AUDIT LOGS TABLE
-- =========================================
CREATE TABLE admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  action TEXT NOT NULL,
  program_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_admin_id ON admin_audit_logs (admin_id);
CREATE INDEX idx_audit_program_id ON admin_audit_logs (program_id);
CREATE INDEX idx_audit_created_at ON admin_audit_logs (created_at DESC);

-- =========================================
-- PLATFORM SETTINGS TABLE
-- =========================================
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('instant_publish', 'true', 'نشر الإعلانات مباشرة دون موافقة مسبقة'),
  ('max_image_size_mb', '5', 'الحد الأقصى لحجم الصورة بالميغابايت'),
  ('show_phone_publicly', 'true', 'إظهار أرقام التواصل للعموم بعد موافقة المعلن'),
  ('active_program_types', '["دورة قرآنية"]', 'أنواع البرامج المفعلة في الواجهة'),
  ('rate_limit_programs_per_hour', '3', 'الحد الأقصى لإضافة إعلانات في الساعة'),
  ('rate_limit_reports_per_hour', '5', 'الحد الأقصى لإرسال البلاغات في الساعة');

-- =========================================
-- UPDATED_AT TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- ATOMIC VIEW INCREMENT FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION increment_program_views(
  p_program_id UUID,
  p_ip_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  already_viewed BOOLEAN;
BEGIN
  -- Check if already viewed in last 24 hours
  SELECT EXISTS(
    SELECT 1 FROM program_views
    WHERE program_id = p_program_id
      AND ip_hash = p_ip_hash
      AND created_at > NOW() - INTERVAL '24 hours'
  ) INTO already_viewed;

  IF already_viewed THEN
    RETURN FALSE;
  END IF;

  -- Insert view record (on conflict do nothing for safety)
  INSERT INTO program_views (program_id, ip_hash)
  VALUES (p_program_id, p_ip_hash)
  ON CONFLICT (program_id, ip_hash) DO UPDATE
    SET created_at = NOW()
    WHERE program_views.created_at < NOW() - INTERVAL '24 hours';

  -- Atomic increment
  UPDATE programs
  SET views_count = views_count + 1
  WHERE id = p_program_id AND deleted_at IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Programs: anyone can read active non-deleted programs
CREATE POLICY "Public can read active programs" ON programs
  FOR SELECT USING (
    deleted_at IS NULL
    AND status NOT IN ('hidden', 'soft_deleted')
  );

-- Programs: anyone can insert (controlled by app-level validation)
CREATE POLICY "Anyone can insert programs" ON programs
  FOR INSERT WITH CHECK (true);

-- Programs: only service role can update/delete
CREATE POLICY "Service role can manage programs" ON programs
  FOR ALL USING (auth.role() = 'service_role');

-- Reports: anyone can insert
CREATE POLICY "Anyone can insert reports" ON program_reports
  FOR INSERT WITH CHECK (true);

-- Reports: only service role can read/update
CREATE POLICY "Service role can manage reports" ON program_reports
  FOR ALL USING (auth.role() = 'service_role');

-- Views: insert only via function (uses service role)
CREATE POLICY "Service role manages views" ON program_views
  FOR ALL USING (auth.role() = 'service_role');

-- Audit logs: service role only
CREATE POLICY "Service role manages audit logs" ON admin_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Platform settings: service role only
CREATE POLICY "Service role manages settings" ON platform_settings
  FOR ALL USING (auth.role() = 'service_role');
