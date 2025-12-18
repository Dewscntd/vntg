-- CMS Template Management System Migration
-- Version: 1.0.0
-- Date: 2024-12-18
-- Description: Creates tables for template management with undo/redo and version control

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Template status enum
CREATE TYPE template_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Action types for event sourcing
CREATE TYPE template_action_type AS ENUM (
  'section_add',
  'section_remove',
  'section_update',
  'section_reorder',
  'section_duplicate',
  'section_visibility',
  'metadata_update',
  'template_create',
  'template_update',
  'template_publish',
  'template_unpublish',
  'template_restore'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- CMS Templates - Main template metadata
CREATE TABLE IF NOT EXISTS cms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  category TEXT DEFAULT 'custom',
  status template_status DEFAULT 'draft',
  thumbnail_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_locale CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT valid_category CHECK (category IN ('custom', 'seasonal', 'promotional', 'default', 'system'))
);

-- Template Versions - Snapshots for version history
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES cms_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  change_summary TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_version_per_template UNIQUE (template_id, version_number),
  CONSTRAINT valid_sections CHECK (jsonb_typeof(sections) = 'array')
);

-- Template Actions - Event sourcing for undo/redo
CREATE TABLE IF NOT EXISTS template_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES cms_templates(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  action_type template_action_type NOT NULL,
  action_index INTEGER NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  inverse_payload JSONB DEFAULT '{}',
  is_undone BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index for fast undo/redo queries
  CONSTRAINT valid_action_index CHECK (action_index >= 0)
);

-- Template Schedules - Scheduled publishing/unpublishing
CREATE TABLE IF NOT EXISTS template_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES cms_templates(id) ON DELETE CASCADE,
  version_id UUID REFERENCES template_versions(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('publish', 'unpublish')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  is_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure scheduled time is in the future
  CONSTRAINT future_schedule CHECK (scheduled_for > created_at OR is_executed = true)
);

-- Template Collaborators - Sharing and permissions
CREATE TABLE IF NOT EXISTS template_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES cms_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_collaborator UNIQUE (template_id, user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Templates
CREATE INDEX idx_cms_templates_status ON cms_templates(status);
CREATE INDEX idx_cms_templates_locale ON cms_templates(locale);
CREATE INDEX idx_cms_templates_category ON cms_templates(category);
CREATE INDEX idx_cms_templates_created_by ON cms_templates(created_by);
CREATE INDEX idx_cms_templates_updated_at ON cms_templates(updated_at DESC);
CREATE INDEX idx_cms_templates_pinned ON cms_templates(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_cms_templates_search ON cms_templates USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Versions
CREATE INDEX idx_template_versions_template ON template_versions(template_id);
CREATE INDEX idx_template_versions_published ON template_versions(template_id, is_published) WHERE is_published = true;
CREATE INDEX idx_template_versions_created ON template_versions(template_id, created_at DESC);

-- Actions (for undo/redo performance)
CREATE INDEX idx_template_actions_session ON template_actions(template_id, session_id, action_index DESC);
CREATE INDEX idx_template_actions_undone ON template_actions(template_id, session_id, is_undone);
CREATE INDEX idx_template_actions_recent ON template_actions(template_id, created_at DESC);

-- Schedules
CREATE INDEX idx_template_schedules_pending ON template_schedules(scheduled_for)
  WHERE is_executed = false;
CREATE INDEX idx_template_schedules_template ON template_schedules(template_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cms_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get next version number for a template
CREATE OR REPLACE FUNCTION get_next_template_version(p_template_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO max_version
  FROM template_versions
  WHERE template_id = p_template_id;

  RETURN max_version;
END;
$$ LANGUAGE plpgsql;

-- Create new template version
CREATE OR REPLACE FUNCTION create_template_version(
  p_template_id UUID,
  p_sections JSONB,
  p_change_summary TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_version_id UUID;
  new_version_number INTEGER;
BEGIN
  -- Get next version number
  new_version_number := get_next_template_version(p_template_id);

  -- Insert new version
  INSERT INTO template_versions (
    template_id,
    version_number,
    sections,
    metadata,
    change_summary,
    created_by
  ) VALUES (
    p_template_id,
    new_version_number,
    p_sections,
    p_metadata,
    p_change_summary,
    p_user_id
  )
  RETURNING id INTO new_version_id;

  -- Update template timestamp
  UPDATE cms_templates
  SET updated_at = NOW(), updated_by = p_user_id
  WHERE id = p_template_id;

  RETURN new_version_id;
END;
$$ LANGUAGE plpgsql;

-- Get undo stack for a session
CREATE OR REPLACE FUNCTION get_undo_stack(
  p_template_id UUID,
  p_session_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action_type template_action_type,
  action_index INTEGER,
  payload JSONB,
  inverse_payload JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ta.id,
    ta.action_type,
    ta.action_index,
    ta.payload,
    ta.inverse_payload,
    ta.created_at
  FROM template_actions ta
  WHERE ta.template_id = p_template_id
    AND ta.session_id = p_session_id
    AND ta.is_undone = false
  ORDER BY ta.action_index DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get redo stack for a session
CREATE OR REPLACE FUNCTION get_redo_stack(
  p_template_id UUID,
  p_session_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action_type template_action_type,
  action_index INTEGER,
  payload JSONB,
  inverse_payload JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ta.id,
    ta.action_type,
    ta.action_index,
    ta.payload,
    ta.inverse_payload,
    ta.created_at
  FROM template_actions ta
  WHERE ta.template_id = p_template_id
    AND ta.session_id = p_session_id
    AND ta.is_undone = true
  ORDER BY ta.action_index ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Record action for undo/redo
CREATE OR REPLACE FUNCTION record_template_action(
  p_template_id UUID,
  p_session_id UUID,
  p_action_type template_action_type,
  p_payload JSONB,
  p_inverse_payload JSONB DEFAULT '{}'::JSONB,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_action_id UUID;
  next_index INTEGER;
BEGIN
  -- Get next action index for this session
  SELECT COALESCE(MAX(action_index), -1) + 1
  INTO next_index
  FROM template_actions
  WHERE template_id = p_template_id
    AND session_id = p_session_id;

  -- Clear any redo actions (actions after current position)
  DELETE FROM template_actions
  WHERE template_id = p_template_id
    AND session_id = p_session_id
    AND is_undone = true;

  -- Insert new action
  INSERT INTO template_actions (
    template_id,
    session_id,
    action_type,
    action_index,
    payload,
    inverse_payload,
    created_by
  ) VALUES (
    p_template_id,
    p_session_id,
    p_action_type,
    next_index,
    p_payload,
    p_inverse_payload,
    p_user_id
  )
  RETURNING id INTO new_action_id;

  -- Limit history to 50 actions per session
  DELETE FROM template_actions
  WHERE template_id = p_template_id
    AND session_id = p_session_id
    AND action_index < (next_index - 49);

  RETURN new_action_id;
END;
$$ LANGUAGE plpgsql;

-- Undo last action
CREATE OR REPLACE FUNCTION undo_template_action(
  p_template_id UUID,
  p_session_id UUID
)
RETURNS TABLE (
  action_id UUID,
  action_type template_action_type,
  inverse_payload JSONB
) AS $$
DECLARE
  last_action RECORD;
BEGIN
  -- Find last non-undone action
  SELECT * INTO last_action
  FROM template_actions ta
  WHERE ta.template_id = p_template_id
    AND ta.session_id = p_session_id
    AND ta.is_undone = false
  ORDER BY ta.action_index DESC
  LIMIT 1;

  IF last_action IS NULL THEN
    RETURN;
  END IF;

  -- Mark as undone
  UPDATE template_actions
  SET is_undone = true
  WHERE id = last_action.id;

  -- Return the action details for applying inverse
  RETURN QUERY
  SELECT
    last_action.id,
    last_action.action_type,
    last_action.inverse_payload;
END;
$$ LANGUAGE plpgsql;

-- Redo last undone action
CREATE OR REPLACE FUNCTION redo_template_action(
  p_template_id UUID,
  p_session_id UUID
)
RETURNS TABLE (
  action_id UUID,
  action_type template_action_type,
  payload JSONB
) AS $$
DECLARE
  next_redo RECORD;
BEGIN
  -- Find first undone action
  SELECT * INTO next_redo
  FROM template_actions ta
  WHERE ta.template_id = p_template_id
    AND ta.session_id = p_session_id
    AND ta.is_undone = true
  ORDER BY ta.action_index ASC
  LIMIT 1;

  IF next_redo IS NULL THEN
    RETURN;
  END IF;

  -- Mark as not undone
  UPDATE template_actions
  SET is_undone = false
  WHERE id = next_redo.id;

  -- Return the action details for re-applying
  RETURN QUERY
  SELECT
    next_redo.id,
    next_redo.action_type,
    next_redo.payload;
END;
$$ LANGUAGE plpgsql;

-- Increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE cms_templates
  SET usage_count = usage_count + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update timestamp on template changes
CREATE TRIGGER trigger_update_cms_template_timestamp
  BEFORE UPDATE ON cms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_cms_template_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE cms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_collaborators ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Public can view published system templates"
  ON cms_templates FOR SELECT
  USING (status = 'published' AND is_system = true);

CREATE POLICY "Authenticated users can view their own templates"
  ON cms_templates FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Collaborators can view shared templates"
  ON cms_templates FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT template_id FROM template_collaborators
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create templates"
  ON cms_templates FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Owners can update their templates"
  ON cms_templates FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Collaborator editors can update templates"
  ON cms_templates FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT template_id FROM template_collaborators
      WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
    )
  );

CREATE POLICY "Owners can delete their templates"
  ON cms_templates FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() AND is_system = false);

-- Versions policies
CREATE POLICY "Users can view versions of accessible templates"
  ON template_versions FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid()
         )
    )
  );

CREATE POLICY "Editors can create versions"
  ON template_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
         )
    )
  );

-- Actions policies (same as versions)
CREATE POLICY "Users can view actions of accessible templates"
  ON template_actions FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid()
         )
    )
  );

CREATE POLICY "Editors can create actions"
  ON template_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
         )
    )
  );

CREATE POLICY "Editors can update actions (undo/redo)"
  ON template_actions FOR UPDATE
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
         )
    )
  );

CREATE POLICY "Editors can delete old actions"
  ON template_actions FOR DELETE
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
         )
    )
  );

-- Schedules policies
CREATE POLICY "Users can view schedules of accessible templates"
  ON template_schedules FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid()
         )
    )
  );

CREATE POLICY "Admins can manage schedules"
  ON template_schedules FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
         OR id IN (
           SELECT template_id FROM template_collaborators
           WHERE user_id = auth.uid() AND role = 'admin'
         )
    )
  );

-- Collaborators policies
CREATE POLICY "Users can view collaborators of accessible templates"
  ON template_collaborators FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Owners can manage collaborators"
  ON template_collaborators FOR ALL
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM cms_templates
      WHERE created_by = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default system templates (optional - run separately if needed)
-- INSERT INTO cms_templates (name, description, category, status, is_system, locale)
-- VALUES
--   ('Blank Template', 'Start from scratch with an empty template', 'default', 'published', true, 'en'),
--   ('Hero + Products', 'Classic layout with hero banner and product carousel', 'default', 'published', true, 'en'),
--   ('Editorial Style', 'Magazine-style layout for storytelling', 'default', 'published', true, 'en');

-- ============================================================================
-- GRANTS (for service role access)
-- ============================================================================

GRANT ALL ON cms_templates TO service_role;
GRANT ALL ON template_versions TO service_role;
GRANT ALL ON template_actions TO service_role;
GRANT ALL ON template_schedules TO service_role;
GRANT ALL ON template_collaborators TO service_role;

GRANT EXECUTE ON FUNCTION get_next_template_version TO service_role;
GRANT EXECUTE ON FUNCTION create_template_version TO service_role;
GRANT EXECUTE ON FUNCTION get_undo_stack TO service_role;
GRANT EXECUTE ON FUNCTION get_redo_stack TO service_role;
GRANT EXECUTE ON FUNCTION record_template_action TO service_role;
GRANT EXECUTE ON FUNCTION undo_template_action TO service_role;
GRANT EXECUTE ON FUNCTION redo_template_action TO service_role;
GRANT EXECUTE ON FUNCTION increment_template_usage TO service_role;
