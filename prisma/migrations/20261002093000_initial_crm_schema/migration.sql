-- EricCRM PostgreSQL schema
-- Target: PostgreSQL 14+

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_not_blank CHECK (btrim(email) <> ''),
  CONSTRAINT users_name_not_blank CHECK (btrim(full_name) <> '')
);

CREATE UNIQUE INDEX users_email_unique ON users (lower(email));

CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspaces_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT workspaces_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE UNIQUE INDEX workspaces_slug_unique ON workspaces (lower(slug));

CREATE TABLE workspace_members (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT workspace_members_role_valid CHECK (role IN ('owner', 'admin', 'member', 'viewer'))
);

CREATE INDEX workspace_members_user_idx ON workspace_members (user_id);

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  website_url text,
  phone text,
  industry text,
  employee_count integer,
  annual_revenue numeric(18,2),
  address_line_1 text,
  address_line_2 text,
  city text,
  state_region text,
  postal_code text,
  country_code char(2),
  owner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, id),
  FOREIGN KEY (workspace_id, owner_user_id)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  CONSTRAINT companies_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT companies_employee_count_valid CHECK (employee_count IS NULL OR employee_count >= 0),
  CONSTRAINT companies_revenue_valid CHECK (annual_revenue IS NULL OR annual_revenue >= 0),
  CONSTRAINT companies_country_code_valid CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE INDEX companies_workspace_name_idx ON companies (workspace_id, lower(name));
CREATE INDEX companies_owner_idx ON companies (workspace_id, owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX companies_workspace_domain_unique
  ON companies (workspace_id, lower(domain)) WHERE domain IS NOT NULL;

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  company_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  job_title text,
  lifecycle_stage text NOT NULL DEFAULT 'lead',
  owner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, id),
  FOREIGN KEY (workspace_id, company_id)
    REFERENCES companies(workspace_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, owner_user_id)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  CONSTRAINT contacts_first_name_not_blank CHECK (btrim(first_name) <> ''),
  CONSTRAINT contacts_lifecycle_stage_valid
    CHECK (lifecycle_stage IN ('subscriber', 'lead', 'marketing_qualified', 'sales_qualified', 'opportunity', 'customer', 'other'))
);

CREATE INDEX contacts_workspace_name_idx ON contacts (workspace_id, lower(last_name), lower(first_name));
CREATE INDEX contacts_company_idx ON contacts (workspace_id, company_id) WHERE company_id IS NOT NULL;
CREATE INDEX contacts_owner_idx ON contacts (workspace_id, owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX contacts_workspace_email_unique
  ON contacts (workspace_id, lower(email)) WHERE email IS NOT NULL;

CREATE TABLE funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, id),
  FOREIGN KEY (workspace_id, created_by)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  CONSTRAINT funnels_name_not_blank CHECK (btrim(name) <> '')
);

CREATE UNIQUE INDEX funnels_workspace_name_unique ON funnels (workspace_id, lower(name));

CREATE TABLE funnel_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  funnel_id uuid NOT NULL,
  name text NOT NULL,
  position integer NOT NULL,
  probability smallint NOT NULL DEFAULT 0,
  color char(7) NOT NULL DEFAULT '#6F9A8A',
  is_won boolean NOT NULL DEFAULT false,
  is_lost boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, funnel_id, id),
  UNIQUE (funnel_id, position),
  FOREIGN KEY (workspace_id, funnel_id)
    REFERENCES funnels(workspace_id, id) ON DELETE CASCADE,
  CONSTRAINT funnel_stages_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT funnel_stages_position_valid CHECK (position >= 0),
  CONSTRAINT funnel_stages_probability_valid CHECK (probability BETWEEN 0 AND 100),
  CONSTRAINT funnel_stages_color_valid CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT funnel_stages_outcome_valid CHECK (NOT (is_won AND is_lost))
);

CREATE UNIQUE INDEX funnel_stages_name_unique ON funnel_stages (funnel_id, lower(name));

CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  company_id uuid,
  primary_contact_id uuid,
  owner_user_id uuid,
  funnel_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  value numeric(18,2) NOT NULL DEFAULT 0,
  currency char(3) NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'open',
  expected_close_date date,
  closed_at timestamptz,
  lost_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, id),
  FOREIGN KEY (workspace_id, company_id)
    REFERENCES companies(workspace_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, primary_contact_id)
    REFERENCES contacts(workspace_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, owner_user_id)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, funnel_id, stage_id)
    REFERENCES funnel_stages(workspace_id, funnel_id, id) ON DELETE RESTRICT,
  CONSTRAINT deals_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT deals_value_valid CHECK (value >= 0),
  CONSTRAINT deals_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT deals_status_valid CHECK (status IN ('open', 'won', 'lost')),
  CONSTRAINT deals_closed_at_valid CHECK (
    (status = 'open' AND closed_at IS NULL) OR
    (status IN ('won', 'lost') AND closed_at IS NOT NULL)
  ),
  CONSTRAINT deals_lost_reason_valid CHECK (status = 'lost' OR lost_reason IS NULL)
);

CREATE INDEX deals_stage_idx ON deals (workspace_id, funnel_id, stage_id);
CREATE INDEX deals_owner_idx ON deals (workspace_id, owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX deals_company_idx ON deals (workspace_id, company_id) WHERE company_id IS NOT NULL;
CREATE INDEX deals_expected_close_idx ON deals (workspace_id, expected_close_date) WHERE status = 'open';
CREATE INDEX deals_created_at_idx ON deals (workspace_id, created_at DESC);

CREATE TABLE deal_contacts (
  workspace_id uuid NOT NULL,
  deal_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deal_id, contact_id),
  FOREIGN KEY (workspace_id, deal_id)
    REFERENCES deals(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, contact_id)
    REFERENCES contacts(workspace_id, id) ON DELETE CASCADE
);

CREATE INDEX deal_contacts_contact_idx ON deal_contacts (workspace_id, contact_id);

CREATE TABLE deal_stage_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workspace_id uuid NOT NULL,
  deal_id uuid NOT NULL,
  funnel_id uuid NOT NULL,
  from_stage_id uuid,
  from_stage_name text,
  to_stage_id uuid NOT NULL,
  to_stage_name text NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (workspace_id, deal_id)
    REFERENCES deals(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, changed_by)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT
);

CREATE INDEX deal_stage_history_deal_idx ON deal_stage_history (deal_id, changed_at DESC);
CREATE INDEX deal_stage_history_reporting_idx ON deal_stage_history (workspace_id, funnel_id, changed_at DESC);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  assignee_user_id uuid,
  created_by uuid NOT NULL,
  deal_id uuid,
  contact_id uuid,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (workspace_id, assignee_user_id)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, created_by)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, deal_id)
    REFERENCES deals(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, contact_id)
    REFERENCES contacts(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, company_id)
    REFERENCES companies(workspace_id, id) ON DELETE CASCADE,
  CONSTRAINT tasks_title_not_blank CHECK (btrim(title) <> ''),
  CONSTRAINT tasks_status_valid CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT tasks_priority_valid CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT tasks_completed_at_valid CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status <> 'completed' AND completed_at IS NULL)
  )
);

CREATE INDEX tasks_assignee_due_idx ON tasks (workspace_id, assignee_user_id, due_at)
  WHERE status IN ('open', 'in_progress');
CREATE INDEX tasks_deal_idx ON tasks (workspace_id, deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX tasks_contact_idx ON tasks (workspace_id, contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX tasks_company_idx ON tasks (workspace_id, company_id) WHERE company_id IS NOT NULL;

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_user_id uuid NOT NULL,
  deal_id uuid,
  contact_id uuid,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (workspace_id, author_user_id)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  FOREIGN KEY (workspace_id, deal_id)
    REFERENCES deals(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, contact_id)
    REFERENCES contacts(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, company_id)
    REFERENCES companies(workspace_id, id) ON DELETE CASCADE,
  CONSTRAINT notes_body_not_blank CHECK (btrim(body) <> ''),
  CONSTRAINT notes_parent_required CHECK (num_nonnulls(deal_id, contact_id, company_id) = 1)
);

CREATE INDEX notes_deal_idx ON notes (workspace_id, deal_id, created_at DESC) WHERE deal_id IS NOT NULL;
CREATE INDEX notes_contact_idx ON notes (workspace_id, contact_id, created_at DESC) WHERE contact_id IS NOT NULL;
CREATE INDEX notes_company_idx ON notes (workspace_id, company_id, created_at DESC) WHERE company_id IS NOT NULL;

CREATE TABLE stage_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL,
  funnel_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  name text NOT NULL,
  event text NOT NULL DEFAULT 'deal_entered',
  action_type text NOT NULL,
  delay_minutes integer NOT NULL DEFAULT 0,
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (workspace_id, funnel_id, stage_id)
    REFERENCES funnel_stages(workspace_id, funnel_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, created_by)
    REFERENCES workspace_members(workspace_id, user_id) ON DELETE RESTRICT,
  CONSTRAINT stage_automations_name_not_blank CHECK (btrim(name) <> ''),
  CONSTRAINT stage_automations_event_valid CHECK (event IN ('deal_entered', 'deal_exited')),
  CONSTRAINT stage_automations_action_valid CHECK (action_type IN ('create_task', 'send_email', 'webhook', 'update_deal')),
  CONSTRAINT stage_automations_delay_valid CHECK (delay_minutes >= 0),
  CONSTRAINT stage_automations_config_object CHECK (jsonb_typeof(action_config) = 'object')
);

CREATE INDEX stage_automations_stage_idx
  ON stage_automations (workspace_id, funnel_id, stage_id) WHERE is_enabled;

CREATE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER workspaces_set_updated_at
BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER contacts_set_updated_at
BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER funnels_set_updated_at
BEFORE UPDATE ON funnels FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER funnel_stages_set_updated_at
BEFORE UPDATE ON funnel_stages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER deals_set_updated_at
BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tasks_set_updated_at
BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER notes_set_updated_at
BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER stage_automations_set_updated_at
BEFORE UPDATE ON stage_automations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE FUNCTION record_deal_stage_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  previous_stage_name text;
  next_stage_name text;
BEGIN
  IF TG_OP = 'INSERT' OR NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
    IF TG_OP = 'UPDATE' THEN
      SELECT name INTO previous_stage_name FROM funnel_stages WHERE id = OLD.stage_id;
    END IF;

    SELECT name INTO STRICT next_stage_name FROM funnel_stages WHERE id = NEW.stage_id;

    INSERT INTO deal_stage_history (
      workspace_id,
      deal_id,
      funnel_id,
      from_stage_id,
      from_stage_name,
      to_stage_id,
      to_stage_name,
      changed_by
    ) VALUES (
      NEW.workspace_id,
      NEW.id,
      NEW.funnel_id,
      CASE WHEN TG_OP = 'UPDATE' THEN OLD.stage_id END,
      previous_stage_name,
      NEW.stage_id,
      next_stage_name,
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER deals_record_stage_change
AFTER INSERT OR UPDATE OF stage_id ON deals
FOR EACH ROW EXECUTE FUNCTION record_deal_stage_change();

COMMIT;
